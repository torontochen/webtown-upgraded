# Project notes — webtown upgrade

Running record of the staged upgrade, phase by phase.

- **Source project:** `../webtown-master` — untouched, never modified.
- **This copy:** independent git repository, **no remote, no shared history**
  with the original. Each phase is one commit so any phase can be reviewed or
  reverted on its own.
- **Started:** 2026-08-15

| Phase | Status | Commit |
|---|---|---|
| 0 — Working copy, hygiene, restored build | ✅ Done | `ae40ab7` |
| 1a — Authentication guards on all mutations | ✅ Done | `5c0bf65` |
| 1b — Ownership, roles, connection-string hardening | ✅ Done | `95b0bd8` |
| 1c — Query guards (PII and billable endpoints) | ✅ Done | `e9a5def` |
| 2 — Config, tooling, lint, CI | ✅ Done | `000c998` |
| 2.5 — Live verification + deferred bug fixes | ✅ Done | `d4c92e6` |
| 3a — Apollo Server 4, graphql-ws, error migration | ✅ Done | `334e63e` |
| 3b — Mongoose 8, resolver split, logging | ✅ Done | `0213d4c` |
| 4a-i — Event buses removed; first browser verification | ✅ Done | `97f3c3a` |
| 4a-ii — Vite replaces vue-cli/webpack | ✅ Merged | `dba0cc1` |
| 4b-1 — Template filters removed | ✅ Done | `3e2fe6d`+ |
| 4b-2 — `.native`, `.sync`, dead plugins | ✅ Done | `8f15d16`+ |
| 4b-3a — Observer, mask, masonry | ✅ Done | `07a0438`+ |
| 4b-3b — vue2-editor, vue-advanced-chat | ✅ Done | `f6b1cdf`+ |
| 4b-3c — vue-beautiful-chat | ✅ Done | `8597a15`+ |
| 4b-4 — The flip: Vue 3 + Vuetify 3 | Not started | |
| 4c — Pinia + Apollo Client 3 | Not started | |
| 5 — Dependency cleanup | Not started | |

✅ No known regressions are open. The "flyer card photos blank" report was
investigated on 2026-08-16 and **closed as not a bug** — see
"CLOSED — flyer card photos" below. It reproduces identically on the webpack
build; it is an artefact of inspecting a page that is not being painted.

Run `npm run verify` after any change — lint, 77 tests, and a production build.
Tests use Node's built-in runner; no test framework dependency.

`npm run test:e2e` additionally verifies the guards (22 checks) and
subscriptions over graphql-ws (4 checks) against a live database. It needs
`npm run server` running and a reachable `MONGO_URI`.

---

## Baseline: what the audit found

A ~50k-line Vue 2 + Apollo GraphQL + MongoDB monolith, 63 commits from Aug 2021
to Mar 2024. No CI, no tests, no linter, single branch.

The three findings that drove the plan:

1. **The project did not build.** `node-sass@4.14.1` shipped a Node 16 native
   binding and hard-errored on Node 20.
2. **No mutation checked authentication.** `currentUser` appeared 7 times in the
   resolvers, all in `Query.js`. All 59 mutations took identity from client
   arguments. Anonymous callers could reset any password, drain the treasury,
   and mint currency.
3. **204 npm vulnerabilities**, 30 critical; every major dependency past EOL.

---

## Phase 0 — Working copy, hygiene, restored build ✅

**Goal:** a clean, buildable baseline so every later phase is verifiable.

The build fix was pulled forward from Phase 2 of the original plan, because
nothing could be verified while the project failed to compile.

### Build restored

| Problem | Fix |
|---|---|
| `node-sass@4.14.1` had a Node 16 (`darwin-x64-93`) binding | Removed. Dart `sass` was already a devDependency but unused — pinned `~1.32.13`, the last line pairing cleanly with `sass-loader@8` and Vuetify 2's `.sass` sources |
| `bcrypt@4.0.1` has no Node 20 prebuild | → `^5.1.1`, API-identical |

### Secrets moved out of source

`variables.env` gitignored; `variables.env.example` documents every key. The
Gmail account and app password hardcoded at `server.js:59-61` moved to
`MAIL_USER` / `MAIL_PASS` / `MAIL_SERVICE`.

> Note: the original repo has these values in its history. The user confirmed
> this is a demo project and rotation is not needed.

### Bug fixed

`vue.config.js` assigned `module.exports` twice, silently discarding
`transpileDependencies: ["vuetify"]`. Merged into one export.

### Removed

Dead duplicates (`GoogleMap copy.vue`, `Home copy.vue`, two `passVerification
copy` files, two `bizcat_* copy.json`, a duplicated PNG, empty `output.txt`),
all `.DS_Store`, the committed `dist/` tree (100 files, ~13 MB), and four
dependencies with zero references: `mapbox-gl`, `lzw-async`, `vue-native-cli`,
`raw-loader`.

### Result

Vulnerabilities **204 → 142**. Repo ex-`node_modules` ~19 MB → 6.3 MB.
`npm run build` completes; server boots and listens on :4000.

---

## Phase 1a — Authentication guards ✅

**Goal:** no mutation runs for an unauthenticated caller.

The audit said 37 mutations; the real number is **59** — the original count came
from too narrow a regex.

### Approach: a policy table, not 59 inline edits

`resolvers/auth/` holds the whole authorization surface:

| File | Role |
|---|---|
| `guards.js` | `requireResident` / `requireVendor` / `requireAuth` / `allowPublic` |
| `mutationPolicy.js` | The complete name → policy table |
| `applyPolicy.js` | Wraps the resolver map at assembly time |

Chosen over inline `requireResident(ctx)` calls because it **fails closed at
boot**: a resolver with no policy entry, a policy entry naming a resolver that
no longer exists, or an unknown policy name each throw at startup. A new
mutation cannot ship unguarded by accident, and a rename cannot orphan a guard.

Policy: **4 public** (signup/signin only), 31 resident, 17 vendor, 7 either.

### Token expiry

`createTokenWithFP` / `createVendorTokenWithFP` — the remembered-device path —
called `jwt.sign` with no `expiresIn`, so those tokens never expired. Both now
use `TOKEN_EXPIRES_IN_REMEMBERED` (30d); the standard path keeps 480h via
`TOKEN_EXPIRES_IN`, so sign-in behaviour is unchanged.

### Two bugs found while doing the work

Neither was in the original audit; both would have surfaced in production.

1. **`getUser` threw on an invalid token during context creation**, which fails
   *every* operation including `signinResident`. Harmless while tokens never
   expired — but the moment expiry was added, any user holding a stale token
   would have been locked out of signing back in. Now returns `null`; guards do
   the rejecting.

2. **`formatError` collapsed every error to `GraphQLError`.** Apollo wraps
   resolver errors, so the original class survives only in `extensions.code`.
   The client (`src/main.js`) triggers automatic sign-out on
   `err.name === "AuthenticationError"` — so guard rejections would never have
   signed anyone out. Now mapped back from `extensions.code`.

### Also in this phase

- **CORS** from `CORS_WHITELIST`. The old rule passed when `origin === undefined`
  — every non-browser client — which made the whitelist decorative. Now rejected
  in production, allowed in development where Playground needs it.
- **Upload limits**: `maxFieldSize` 10 GB → `MAX_UPLOAD_BYTES` (10 MB default);
  body parsers 50/100 MB → same; `parameterLimit` 100000 → 1000.
- **Hardcoded redirects** → `CLIENT_ORIGIN`.

---

## Phase 1b — Ownership, roles, connection-string hardening ✅

**Goal:** prove not just that *a* resident is calling, but *which* one.

After 1a a signed-in resident could still pass another resident's `residentId`
to `updateProfile` and reset their password. The guard proved the caller was
some resident, nothing more.

### Three mechanisms, all declarative

Added to the same policy table rather than written into resolver bodies — so
business logic was not touched, and the security posture stays readable in one
file.

| Mechanism | What it does |
|---|---|
| `own` | **Overwrites** an identity argument with the value from the token. Dotted paths (`input.businessTitle`) reach into input objects |
| `resource` | For mutations carrying only a record id — loads the record and compares an owner field. Used by `toggleGuildDealActive`, which takes just `dealId` |
| `role` | `governor` / `guildLeader` / `guildMember` checks |

**Substitution, not comparison.** The client's value is discarded rather than
checked against the token. There is no comparison to get wrong, and no error
path that would reveal whether another account exists.

### Roles use the schema's existing concepts

No `role` enum was added. The schema already had the right fields:

- `CityHall.governor` → gates `distributeWelfare`
- `Guild.guildLeader` → gates the 8 guild-management mutations
- `Guild.guildMembers[].name` → gates `commitGuildDeals`

### Account id added to the token

`residentId` / `vendorId` claims need an ObjectId, which the JWT did not carry.
All four token creators now include `id`. Tokens issued before this change have
no `id`, so claim resolution **falls back to a lookup by email** — otherwise
every in-flight session would have broken on deploy. Covered by a test.

### Two reclassifications from Phase 1a

- `commitGuildDeals` was marked VENDOR. Its input carries a **guild**, not a
  vendor — it is a resident action, now gated on guild membership.
- `toggleGuildDealActive` takes only a `dealId`, so no argument substitution can
  secure it. Moved to a resource-ownership check.

### Connection-string injection closed

The app uses a database-per-entity layout, building the URI at **56 live call
sites** as:

```js
process.env.MONGO_URI_PREFIX + newVendor + process.env.MONGO_URI_SUFFIX
```

Callers stripped whitespace and dots, but nothing else — `/`, `?`, `@`, and `&`
all survived. Since the suffix begins with `?retryWrites=...`, a name like
`x?authSource=admin&` or `x/otherDb` could change which database and which auth
source the connection used. Names come from user-supplied signup fields, so this
was reachable.

All 56 sites now go through `resolvers/tenantUri.js`, which **validates against
a whitelist and rejects** rather than silently rewriting — a sanitised name
would connect to a different database than the caller intended. The historical
space/dot stripping is preserved so existing databases stay reachable.

The 56 sites were replaced mechanically after confirming all of them matched one
uniform pattern; only commented-out remnants were left behind.

### Verification

42 tests. Live against a running server:

| Request | Result |
|---|---|
| Anonymous `updateProfile` | `AuthenticationError` |
| **Valid** resident token targeting another account | Proceeds with the caller's own id |
| Resident token → vendor-only mutation | `ForbiddenError` |
| Vendor token → `distributeWelfare` | `ForbiddenError` |

> **Caveat:** the MongoDB cluster in `variables.env` is not reachable from this
> machine, so live checks confirm *routing and enforcement*, not data effects.
> Ownership substitution values are covered by unit tests with fakes. A run
> against a live database is worth doing before relying on this.

---

## Phase 1c — Query guards ✅

**Goal:** the same policy treatment for the 61 queries, which Phase 1 had left
entirely open.

### Two real disclosures closed

1. **`getResidentList`** returned `residentName`, `firstName` and `lastName` for
   **every resident** to any anonymous caller — a full dump of the user base's
   real names. It has **no caller anywhere in `src/`**, so it is dead code.
   Locked to vendors and flagged for deletion in Phase 5.

2. **`getAIResponse`** passed a client-supplied message array straight to
   OpenAI, unauthenticated. Anyone who found the endpoint could bill the
   project's API key without limit. Now requires a signed-in principal.

Also scoped to their owner: resident order history and shopping carts, vendor
orders / sales / settlement / checkout data, vendor design assets (sketches,
flyers, templates, catalog), and guild chat (membership-checked).

### The binding constraint: app boot

`src/main.js` dispatches **15 queries from the root `created()` hook, before
anyone signs in**. Guarding any of them would break the app on load for
anonymous visitors. `getCurrentResident` / `getCurrentVendor` are the same case
— they already return `null` when there is no `currentUser`, which is how the
client decides whether to render a signed-in UI.

There is a test that reads `src/main.js`, extracts the dispatched action names,
and asserts every one is still `PUBLIC`. If a future change guards one, the
suite fails rather than the app breaking at runtime.

Final split across 61 queries: **40 public, 2 authenticated, 5 resident,
14 vendor**.

### The fail-closed check earned its keep

Wiring the query table surfaced `getAllItemsCatalog`, which my inventory grep
had missed. The server refused to boot until it was classified, rather than
shipping it unguarded. It turned out to be vendor-only (three vendor components
call it) and is now owner-scoped.

### Verification

55 tests. Live against a running server:

| Request | Result |
|---|---|
| Anonymous `getResidentList` | `AuthenticationError` |
| Anonymous `getAIResponse` | `AuthenticationError` |
| Anonymous `getCurrentResident` | `{"data":{"getCurrentResident":null}}` — boot path intact |
| Anonymous `getPets` | Reaches the database, not the guard |
| Resident token → `getVendorSalesInfo` | `ForbiddenError` |

---

## Phase 2 — Config, tooling, lint, CI ✅

**Goal:** a meaningful automated gate, and no more editing source to deploy.

### Deploy-by-comment removed

`src/main.js` had the GraphQL HTTP and WebSocket URLs hardcoded to localhost
with the production URLs commented out beside them — the last two commits in the
original repo (`ready to deploy on heroku` → `back to development status`) were
doing exactly that swap by hand.

Both now come from `VUE_APP_*`:

- `.env.development` sets them explicitly, because the client runs on :8080 and
  the API on :4000.
- `.env.production` leaves them **unset on purpose**. `main.js` falls back to
  the origin serving the page, which matches the co-hosted deployment this app
  used. An initial version pointed at a placeholder host, which would have
  shipped a silently broken production build.

Verified: the production bundle contains no `localhost` reference.

### ESLint — tuned to find bugs, not style

A conventional "recommended" config produced 281 findings on a 50k-line codebase
written without a linter. A gate that noisy gets ignored, which is worse than no
gate. The config keeps genuine-defect rules as **errors** and demotes style and
pervasive legacy patterns to warnings.

**Result: 0 errors, 162 warnings.** CI fails on errors only.

### Real bugs the linter found and fixed

| Bug | Impact |
|---|---|
| `resolvers/Query.js` — `catalogItem` assigned without `const` inside a `.map()` | Implicit **global**. Under concurrent requests two users could read each other's `photo` and `taxRate` |
| `src/store/actions.js` — `.then(({date}) => ... data.getRewardItems)` | Typo: destructured `date`, referenced `data`. **`getRewardItems` threw every time** |
| `src/utils/addMarkers.js` — `infowindow1.open(resultsMap, …)` | `resultsMap` does not exist; the parameter is `map`. ReferenceError on marker-cluster hover |
| 5 components used `_` (lodash) with no import, and it is not global | ReferenceError on those paths |
| 3 duplicate object keys with identical values | Dead code |
| 5 `break` statements after `return` | Dead code |

### Real bugs found and deliberately NOT fixed

These change runtime behaviour and **cannot be validated without a live
database**. Each is marked in-code with an explanation, and the rules are
warnings so the build stays green:

1. **`src/components/Profile.vue`** — `created()` is declared twice: a real hook
   at line 681 and an empty stub at 1022. Last key wins, so **the real
   `created()` has never run**. Deleting the stub is almost certainly correct,
   but it activates code dead since the file was written.
2. **`src/components/vendor/FlyerCoupon.vue:2168` and `:2200`** — `if ((this.pageNo = 1))`
   is an assignment, not a comparison. Always truthy, and it mutates `pageNo`.
3. **`src/components/vendor/HtmlConverter.vue:1255`** — same pattern.
4. **`resolvers/Mutation.js:1514`, `:1729`, `resolvers/Query.js:704`** —
   `{$first: '$orderItems'} ? {$first: '$orderItems'} : {$push: …}` in Mongo
   aggregation pipelines. The condition is an object literal, so always truthy
   and the `$push` branch is unreachable.
5. **`src/App.vue:1491`** — an `else if` whose condition is already covered by an
   earlier branch, so it can never execute.

**These are the highest-value items to work through once Atlas is available.**

### Prettier

Configured with `.prettierrc.json` and wired to `npm run format`, but
**deliberately not applied across the codebase**. Reformatting ~50k lines would
produce a diff that buries every real change made in Phases 0–2 and makes
`git blame` useless. Format files as they are touched.

### CI

`.github/workflows/ci.yml` — Node 20, `npm ci --legacy-peer-deps`, then lint →
test → build, plus a report-only audit. No secrets required: the build reads
only `VUE_APP_*`, which are public by definition.

### New scripts

| Script | Purpose |
|---|---|
| `npm run verify` | lint + test + build — the same gate CI runs |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |

### Dependency note

`npm audit fix` (non-breaking) applied. The count moved 142 → **155**, because
adding ESLint and Prettier brought their own transitive advisories. **Critical
stayed at 23** — the remaining advisories are structural (Apollo 2, Vue 2,
puppeteer 10) and come down in Phases 3–5, not from tooling changes.


---

## Phase 2.5 — Live verification, and the bug it found ✅

**Goal:** verify Phases 1a–1c against real data, and resolve the five bugs
deferred from Phase 2.

`test-e2e/live-verification.js` drives the real HTTP + Apollo path with real
signed-in tokens and asserts on real database state. It creates two throwaway
residents prefixed `__ugtest_`, runs 22 checks, and deletes them in a `finally`
block. Existing records are only ever read. **22/22 pass.**

The database holds 75 residents, 41 vendors, 12 guilds.

### It found a privilege-escalation path that unit tests could not

`updateProfile` takes **two** identity arguments. Phase 1b pinned `residentId`
but not `residentName` — and the resolver does `$set: { residentName }`.

`residentName` is not a display name. It is:

- the **per-tenant MongoDB database name** (`tenantUri(newResident)`)
- the foreign key in `Guild.guildMembers[].name`
- the value **`CityHall.governor` is compared against**

The live data made the impact concrete: `CityHall.governor` is
`"[Toronto Glory]Weir"`, and **no Resident holds that name**. So the unique
index would not have blocked claiming it. Any signed-in resident could have
renamed themselves to it, passed the `governor` role check, and called
`distributeWelfare` against a treasury of 2,320,618.

Fixed by pinning `residentName` on `updateProfile` and `businessTitle` on
`updateVendorProfile` — the same class of issue, since `businessTitle` is the
vendor's per-tenant database name.

A scan of every `$set` block found five mutations that write an identity key.
The other three (`feedPet`, `distributeFlyer`, `targetDistribute`) already
pinned theirs. A regression test now asserts all five stay pinned.

**Why unit tests missed it:** the fakes had no unique index and no CityHall
row, so the spoofed rename simply succeeded silently. The live run failed on a
duplicate-key error, which is what exposed the second unpinned argument.

### The five deferred bugs — all resolved

| Bug | Resolution |
|---|---|
| 3× Mongo aggregation `X ? X : Y` where `X` is an object literal | Collapsed to `X`. A JS ternary is evaluated when the pipeline is built, not by MongoDB; the condition was always truthy and the `$push` branch unreachable. **Provably behaviour-preserving** |
| `FlyerCoupon.vue` ×2, `HtmlConverter.vue` ×1 — `if ((this.pageNo = 1))` | Changed to `===`. Verified safe first: a `pageNo` watcher handles page display on change, which is why the true branch sets `display` directly and the else branch does not. Effect: deleting a page now returns you to the previous page rather than always to page 1 |
| `App.vue` unreachable `else if` | Removed. Its body dispatched `getGuildChatMessages` with the same argument the reachable branch already dispatches — redundant, not just dead |
| `Profile.vue` duplicate `created()` | Removed one. **See correction below** |

### Correction to the Phase 2 notes

Phase 2 recorded that `Profile.vue`'s duplicate `created()` meant "the real hook
at line 681 has never run" and that fixing it would "activate ~40 lines of dead
code". **That was wrong.** I inferred a body without reading it. Both hooks are
empty — line 681 contains only commented-out `console.log`s — and the
component's real initialisation is in `mounted()`, which was never shadowed.
Removing the duplicate is a no-op. No behaviour was ever affected.

### Lint

`no-constant-condition` is back to **error** now that all six original
violations are resolved. Still 0 errors.


---

## Phase 3a — Apollo Server 4, graphql-ws, error migration ✅

**Goal:** off the end-of-life Apollo 2 stack, without breaking the auth layer
built on top of it.

### Why this was the risky phase

Apollo Server 2 → 4 is not a version bump. `apollo-server-express` applied
itself to Express and installed its own subscription handlers; v4 splits those
into separate concerns that the app wires itself. More importantly it **removed
the error classes the entire Phase 1 auth layer was built on**.

| Concern | Apollo 2 | Now |
|---|---|---|
| HTTP | `server.applyMiddleware({ app })` | `expressMiddleware(server)` mounted by us |
| Subscriptions | `installSubscriptionHandlers` (subscriptions-transport-ws) | `graphql-ws` + `ws`, wired by us |
| PubSub | `apollo-server-express` | `graphql-subscriptions` |
| Errors | `AuthenticationError` etc. | `GraphQLError` + `extensions.code` |
| Uploads | built in | **removed — see below** |

### Errors

`resolvers/errors.js` provides `AuthenticationError` / `ForbiddenError` /
`UserInputError` as thin `GraphQLError` subclasses carrying the **same
`extensions.code` strings Apollo 2 produced**. That matters beyond tidiness:
`formatError` maps those codes back to error names, and `src/main.js` triggers
its automatic sign-out on `err.name === "AuthenticationError"`. A changed code
would silently break sign-out on token expiry. A test locks the codes.

The auth layer's call sites were unchanged — only the import moved.

### File uploads removed entirely

The schema has **no `Upload` scalar**. No operation ever sent a file; images are
stored as base64 strings. So `graphql-upload` and `apollo-upload-client` were
carrying a multipart transport nothing used — and were the source of the CSRF
advisory Apollo printed on every boot:

> This package is vulnerable to Cross-Site Request Forgery (CSRF) attacks.

Both removed; the client uses a plain `HttpLink`. **That warning is now gone.**

### Subscriptions

`subscriptions-transport-ws` is unmaintained and its protocol is not supported
by graphql-ws. Both ends moved to `graphql-ws`.

Apollo Client 2 has no graphql-ws link (`@apollo/client/link/subscriptions`
needs Apollo Client 3, which is Phase 4), so `src/apollo/graphqlWsLink.js` is a
~25-line `ApolloLink` adapter around the graphql-ws client. **It is deleted in
Phase 4** and replaced with the official link.

`connectionParams` is now re-evaluated on every reconnect, so a token refreshed
after sign-in is picked up without recreating the link — the old nested
`options.connectionParams` shape captured it once.

### Two real bugs surfaced by stricter tooling

1. **`typeDefs.gql` declared `vendor` twice** on `updatePetExpSilver`.
   graphql 15 tolerated it; graphql 16 refuses to build the schema. Fixed.
2. **graphql 16 ships class fields in *both* its ESM and CJS builds**, which
   webpack 4 cannot parse — the client build failed outright. `graphql` is now
   in `transpileDependencies`, with a `graphql$` alias pinning the bare
   specifier to the CJS entry. Both go away in Phase 4 with Vite.

### Verification

- `npm run verify` — 0 lint errors, **61 unit tests**, production build succeeds.
- `npm run test:e2e` against live Atlas — **22/22 guard checks** (unchanged from
  Phase 2.5, so the auth layer survived the migration intact) plus **4/4
  subscription checks**: graphql-ws handshake, subscribe, publish from an HTTP
  mutation, delivery on the socket with the correct payload.
- Apollo boots clean; the graphql-upload CSRF warning is gone.
- Vulnerabilities 155 → **151**; high 48 → 44.

### Still on the old stack (Phase 3b / 4)

Mongoose 5, the 3,800-line resolver files, 1,617 `console.log` calls, and the
Apollo **Client** 2 stack (`apollo-client`, `apollo-cache-inmemory`,
`apollo-link`, `vue-apollo` 3).


---

## Phase 3b — Mongoose 8, resolver split, logging ✅

### Mongoose 5 → 8

Surveying first showed the migration was far smaller than feared: **no
callback-style model calls**, none of the removed methods (`.update()`,
`.count()`, `.remove()`), and `mongoose-beautiful-unique-validation` turned out
to be referenced only in a comment — an unused dependency, now removed.

The actual work was the four connection options removed in Mongoose 6/7
(`useNewUrlParser`, `useCreateIndex`, `useUnifiedTopology`, `useFindAndModify`),
which Mongoose 8 rejects rather than ignores. Stripped from **59 sites**.

The per-tenant `createConnection` path — 56 call sites, the riskiest part —
was verified separately against a real tenant database: a vendor catalog query
returns its 7 real items. The Node URL deprecation warning is also gone.

### Correction: "1,617 console.log calls"

The Phase 0 audit reported 1,617 `console.log` calls. **That number counted
commented-out code, which is the overwhelming majority.** The live server-side
total was **27** — 17 of them in `Subscription.js`, logging a line every time
any client opened any subscription.

At that size, pulling in pino and its dependency tree costs more than it
returns, so `resolvers/logger.js` is a ~30-line leveled logger providing what
was actually missing: levels, a threshold, and timestamps. `LOG_LEVEL` defaults
to `info`; the subscription chatter is now `debug`, so it is silent in
production without losing errors. Swapping in pino later is a one-file change.

All 27 call sites converted.

### Resolver split

`Mutation.js` (3,800 lines, 59 resolvers) and `Query.js` (1,900 lines, 61
resolvers) are now domain modules re-assembled by a barrel:

| | Modules | Largest |
|---|---|---|
| `resolvers/mutations/` | auth, resident, guild, order, flyer, vendor, messaging, city | order.js (1,265) |
| `resolvers/queries/` | availability, session, reference, guild, storefront, resident, vendorops, flyer, ai | storefront.js (512) |

The shared header (imports plus `createToken`, `formatAmount`, and friends)
moved to a `_shared.js` per side, and each module imports only the helpers it
actually uses.

**What made this safe to do mechanically:** `applyPolicy` already fails at boot
if the resolver map and the policy table disagree, so a resolver lost or
duplicated by the split could not start the server. That caught the one real
problem — `getAllItemsCatalog` is indented with three spaces rather than two, so
the partitioner did not treat it as a boundary and it was absorbed into the
preceding block. It stayed syntactically valid and present, but landed in the
wrong module; moved to `vendorops`.

`test/structure.test.js` now locks the invariants: no resolver in two modules
(the barrel spread would silently pick one), the barrels match the policy tables
exactly, every resolver is a function, and no module requires the barrel back.

### Verification

- `npm run verify` — 0 lint errors, **66 unit tests**, production build.
- Live Atlas: **22/22 guard checks + 4/4 subscription checks**, unchanged
  through both the Mongoose upgrade and the split.
- Per-tenant `createConnection` confirmed returning real data.
- Vulnerabilities 151 → **150**; critical 23 → 22.


---

## Phase 4a-i — Event buses removed, and the first browser run ✅

### Event buses

19 `new Vue()` instances declared in and exported from `main.js`, with 79
`$emit` sites, 31 listeners and 24 `$off` calls across 13 components. Two
problems: **Vue 3 removes `$on`/`$off`/`$emit` from instances**, and components
imported them from `../main`, which imports `App.vue`, which imports `main.js`
— a circular import.

`src/eventBus.js` replaces them with a framework-agnostic emitter exposing the
same API, so **all ~110 call sites are unchanged** — only the import path moved.
`eventBus_signout` was dropped: declared, never emitted, never listened to.

**Why not Vuex, as the original plan said.** With the code in front of us that
was the wrong trade. These 79 emits drive imperative UI behaviour — open this
dialog, append this hook, re-render that flyer page — not shared state.
Reshaping them into mutations is a redesign with real regression risk in flows
that cannot be exercised without a browser, and it is not what unblocks Vue 3.
Removing the dependency on Vue *instances* is. This does exactly that and
nothing else; migrating individual buses to real state is now an incremental
job that can happen one bus at a time.

The emitter deliberately reproduces Vue 2's semantics, including the sharp edge
that a bare `$off()` clears every listener for every event — relied on in 22
places. Eleven tests lock that behaviour, plus two migration invariants (no Vue
-instance buses remain; nothing imports a bus from `main.js`).

### The first time the app was actually run in a browser

Across Phases 0–3 the client was only ever *built*, never loaded. Running it
against the live API immediately exposed a real, user-visible bug.

**Eight filter expressions had been mangled by a formatter.** At some point
`{{ x | format-int-amount }}` had been rewritten as
`{{ x | (format - int - amount) }}` — the hyphenated filter name read as
subtraction. Vue then resolved an empty filter name and evaluated `format`,
`int` and `amount` as undefined properties, so **the filter never ran and the
raw value rendered**. The city treasury displayed as `2320618`, and a news item
read `at 1671047474940`.

Confirmed pre-existing: the same eight lines are byte-identical in
`../webtown-master`. All eight repaired — the header now reads `2,320,618` and
the news item `at December 14th 2022, 8:19:50 pm`.

**`vue/no-parsing-error` is now an error, not a warning.** It had been flagging
exactly these eight sites since Phase 2, dismissed in the notes as "Vue 2 filter
syntax edge cases. The build compiles these fine." That was wrong — they were
silent rendering bugs. As an error it blocks the build if a formatter
reintroduces the pattern, which is a live risk because `npm run format` would
do precisely that.

### Browser verification

With `npm run dev` against live Atlas: app renders, all 15 boot queries return
200 from Apollo 4, images and vendor data load, no Vue warnings remain.

One unexplained console error persists — `Uncaught SyntaxError: Unexpected
token '<'` with no corresponding failed network request. It does not affect
rendering or data loading and is present regardless of these changes; not
diagnosed.

### Not done in this phase

**The Vite migration.** 4a was scoped as "Vite + event buses"; only the event
buses are done. See the open items below for what Vite will involve — it is
tracked as 4a-ii.


---

## Phase 4b — Vue 3 + Vuetify 3

### Why this is split into four commits

Vue 3 is not incrementally adoptable here. The moment `vue@2` becomes `vue@3`,
nothing renders until *every* blocker is resolved at once — there is no state
where half the app is migrated and the other half still works. So "commit
working increments" cannot mean "migrate components one at a time".

What it can mean, and what this phase does: **land each blocker removal as a
change that works on Vue 2 today**, so the app stays green and shippable after
every commit, and shrink the final flip down to the framework swap plus the
Vuetify template rewrites that genuinely cannot be done early.

| | Scope | Blocker removed | Runs on Vue 2 |
|---|---|---|---|
| 4b-1 | Template filters → `$filters.fn()` | Vue 3 deletes filters | ✅ |
| 4b-2 | `.native` (15), `.sync` (17), dead plugin registrations | Both modifiers removed in Vue 3 | ✅ |
| 4b-3 | Vue-2-only third-party libraries | No Vue 3 build exists | ✅ |
| 4b-4 | vue 3 + vue-router 4 + vuex 4 + vue-apollo 4 + Vuetify 3 | — | ❌ the flip |

### The survey

43 components, 36,070 lines, ~3,500 Vuetify tags.

**Vue 3 core breakages present:**

| Pattern | Sites | Notes |
|---|---|---|
| Template filters `\|` | 176 | Removed in Vue 3 — **done in 4b-1** |
| `v-on="on"` activator slots | 75 | Vuetify 2 `{ on, attrs }` → Vuetify 3 `{ props }` |
| `$refs` | 45 | Mostly fine; `v-form.validate()` returns a Promise in Vuetify 3 |
| `.sync` | 17 | → `v-model:prop` |
| `.native` | 15 | Modifier removed outright |
| `transition-group` | 6 | Now needs an explicit root or none |
| `beforeDestroy` | 3 | → `beforeUnmount` |

Clean already, and worth recording because it removes the usual worst offenders:
**no `filters:` component option, no `$listeners`, no `$children`, no
`$scopedSlots`, no `slot-scope`, no functional components, no `Vue.prototype`
beyond the one added in 4b-1, no `$set`/`$delete`, no `keyCode` modifiers.**
Phase 4a-i's event-bus work already removed every `new Vue()` instance.

**Vuetify 2 → 3 component work**, by census. The renames are mechanical; the
restructures are not:

| Removed outright in Vuetify 3 | Sites |
|---|---|
| `v-list-item-content` / `-icon` / `-action` / `-action-text` / `-avatar` | 47 |
| `v-simple-table` → `v-table` | 12 |
| `v-tabs-items` / `v-tab-item` → `v-window` / `v-window-item` | 14 |
| `v-expansion-panel-header` / `-content` → `-title` / `-text` | 16 |
| `v-subheader` → `v-list-subheader` | 1 |

| Rewritten API (not a rename) | Sites |
|---|---|
| `v-data-table` — headers shape, `.sync` props, slot names | 9 |
| `v-date-picker` — entirely new API | 9 |
| `v-stepper` — header/content restructured | 20 |
| `v-data-iterator` | 5 |
| `v-time-picker` — **not in Vuetify 3 core, only `vuetify/labs`** | 4 |
| `v-overlay` | 4 |
| `v-color-picker`, `v-sparkline`, `v-virtual-scroll` | 10 |

Plus the pervasive prop changes across ~800 `v-btn` / `v-text-field` /
`v-select` sites: `text`/`outlined`/`depressed` → `variant`, `dense` →
`density`, `item-text` → `item-title`, and `v-img`'s `contain` becoming the
default (`:cover` is the opt-in).

### The finding that changes the plan: 4b cannot ship without part of 4c

`vue-apollo@3` is Vue 2 only. Vue 3 needs `@vue/apollo-option@4`, which requires
**Apollo Client 3** — which is Phase 4c's headline item. Likewise `vue-router`
3 → 4 and `vuex` 3 → 4 are hard requirements of Vue 3, not optional.

So 4b-4 necessarily carries the Apollo Client 3 upgrade, and 4c reduces to
Vuex 4 → Pinia. The phase boundary in the original plan was wrong; this is
recorded rather than silently reshuffled. A bonus when it happens:
`src/apollo/graphqlWsLink.js`, the ~25-line adapter written in Phase 3a
precisely because Apollo Client 2 has no graphql-ws link, gets deleted and
replaced with the official `@apollo/client/link/subscriptions`.

### Vue-2-only libraries — and why half of them cannot move before the flip

The obvious plan is "upgrade every library first, then swap the framework".
Checking the published peer ranges shows that does not work:

```
vue-advanced-cropper@2.8.9      peerDependencies { vue: ^3.0.0 }
vue-draggable-resizable@3.0.0   peerDependencies { vue: ^3.2.25 }
@chenfengyuan/vue-qrcode@2.0.0  peerDependencies { vue: ^3.0.0 }
```

These are not "supports Vue 3 as well" bumps — the Vue 3 majors **drop Vue 2**.
Installing them early would break the app on the spot, which is the one thing
this phase's structure is designed to avoid. So they move into 4b-4 and get
installed in the same commit as `vue@3`.

**4b-3 — replaceable while still on Vue 2:**

| Library | Sites | Plan |
|---|---|---|
| ~~`vue-intersection-observer`~~ | 1 (Home.vue) | ✅ 4b-3a — local component |
| ~~`vue-the-mask`~~ | 2 (+1 dead import) | ✅ 4b-3a — local directive |
| ~~`vue-masonry` 0.13~~ | Home.vue | ✅ 4b-3a — bumped to 0.16, which spans both majors |
| ~~`portal-vue`~~ | 0 | ✅ Deleted in 4b-2 |
| ~~`vue2-editor`~~ | 1 (VendorFlyers.vue) | ✅ 4b-3b — local Quill wrapper |
| ~~`vue-advanced-chat`~~ | 0 | ✅ 4b-3b — dead, deleted |
| ~~`vue-beautiful-chat`~~ | 1 (`<beautiful-chat>` in App.vue) | ✅ 4b-3c — rebuilt in Vuetify |

**4b-4 — must be installed alongside `vue@3`:**

| Library | Bump |
|---|---|
| `vue-advanced-cropper` | 0.16 → 2.x |
| `vue-draggable-resizable` | 2.x → 3.x (also releases the 3 remaining `.native` sites) |
| `@chenfengyuan/vue-qrcode` | 1.x → 2.x |
| ~~`vue-advanced-chat`~~ | Not needed — it was dead, and is deleted (4b-3b) |
| `vue-router` / `vuex` / `vue-apollo` | 3 → 4 / 3 → 4 / 3 → `@vue/apollo-option` 4 |

`vue2-animate` is CSS only and does not gate anything.

`vuetify-loader`'s replacement, `vite-plugin-vuetify`, restores the
tree-shaking that 4a-ii gave up when it moved to the full Vuetify build. That
should bring the bundle back down from **2.88 MB** toward the 2.18 MB webpack
figure — the one clear win in this phase.

---

## Phase 4b-1 — Template filters removed ✅

Vue 3 deletes `Vue.filter` and the `|` template syntax outright. The seven
filters are now plain functions in `src/filters.js`, exposed on every component
as `$filters` and called as `{{ $filters.formatIntAmount(x) }}`.

That call form is identical under Vue 2 and Vue 3 — `Vue.prototype.$filters`
becomes `app.config.globalProperties.$filters` at the flip and **not one of the
176 template sites changes again**. This is the whole reason it lands early.

### The rewrite

176 sites across 21 components, applied by a one-shot codemod rather than by
hand. What made that safe to do mechanically was checking the shapes first:
every single usage is a trailing pipe inside a mustache. **No chained filters,
no filter arguments, no filters in attribute bindings** — so the transform is
`{{ EXPR | f }}` → `{{ $filters.f(EXPR) }}` with the expression wrapped whole,
which preserves precedence even in the awkward cases like
`{{ (a - b + c) *1.13 | format-currency-amount }}`.

The codemod only touches the SFC `<template>` block. `{{ }}` also appears inside
JS template literals in the flyer components, where Vue never compiles it.

`ellipsis-order-no` was **not** carried over: it had no call site anywhere in
`src/`, only its definition.

### Why this one is worth locking down with tests

Phase 4a-i found eight filter expressions that a formatter had silently
rewritten into subtraction — `{{ x | format-int-amount }}` became
`{{ x | (format - int - amount) }}` — so the filter never ran and the raw value
rendered for months. Nothing caught it because a broken filter fails silently.

`test/filters.test.js` (8 tests) locks both halves: the formatting output of
every function, using the two values that regression actually corrupted
(`2320618` → `2,320,618`, `1671047474940` → `December 14th 2022, 7:51:14 pm`),
and the migration invariant that no `|` filter syntax and no `Vue.filter` call
comes back. The call form has a further advantage over the old syntax: a typo in
`$filters.formatIntAmuont` is a runtime error, not a silently blank render.

### Verification

- `npm run verify` — 0 lint errors, **85 tests** (was 77), production build.
- In the browser against live Atlas: the city treasury renders `2,320,618`,
  flyer dates render `2023-12-31`, and a vendor storefront renders `$12.98` /
  `$9.99` with struck-through original prices. No `$filters.` text leaked into
  the page, no raw epoch numbers, no new console errors.

---

## Phase 4b-2 — `.sync`, `.native`, and a dead plugin ✅

Three more blockers removed, all still running on Vue 2.

### `.sync` — 17 sites

Vue 3 removed the modifier. Each site is now the pair it always compiled to:

```html
<!-- before -->                    <!-- after -->
:items-per-page.sync="itemsPerPage"  :items-per-page="itemsPerPage"
                                     @update:items-per-page="itemsPerPage = $event"
```

This form is valid in **both** Vue 2 and Vue 3, so these sites do not change
again at the flip (Vue 3's `v-model:items-per-page` would be tidier, but it is
another edit and buys nothing).

The one detail worth getting right: **Vuetify 2 emits the kebab-case event
name** — `update:items-per-page`, not `update:itemsPerPage`. Vue 2's `.sync`
registered *both* spellings, so it papered over the difference. Writing the
listener out by hand does not, and getting it wrong fails silently: the prop
still renders, it just never writes back. A test asserts no
`@update:` listener in the codebase contains a capital letter.

All 17 were simple identifiers on data properties (`itemsPerPage`, `page`,
`expanded`, `openTime`, `closeTime`, `vendorSearch`), so the rewrite was
mechanical.

### `.native` — 11 of 15 removed

`.native` is gone in Vue 3. Removing it early is only safe where the child
component actually forwards the listener, so each site was checked against the
Vuetify source rather than assumed:

- **`v-btn`** (6 sites) — the `Routable` mixin binds `{...$listeners, click}` on
  the root element and `VBtn.click()` re-emits, so `@click` is equivalent. None
  of the six carries a `to` prop, which is the case where Routable would switch
  to `nativeOn`.
- **`v-icon`** (5 sites) — `VIcon` renders with `on: this.listeners$`.

The clinching evidence that this is right: the codebase already has **186 plain
`@click` on `v-btn` and 32 on `v-icon`**. The 11 `.native`s were the anomaly and
were redundant all along.

**Four sites stay, each annotated in place with why:**

| Site | Why it cannot move yet |
|---|---|
| `src/App.vue` — `router-link` | vue-router 3's router-link does not emit `click`. Comes off in 4b-4, where vue-router 4 lets listeners fall through to the rendered `<a>` |
| `FlyerCoupon.vue` ×2, `HtmlConverter.vue` ×1 — `vue-draggable-resizable` | The library neither emits `click` nor forwards `$listeners`, so the modifier is load-bearing. Goes with the library in 4b-3 |

### `portal-vue` deleted

Imported and `Vue.use`d in `main.js`, and **not one `<portal>` or
`<portal-target>` tag exists anywhere in `src/`**. Removed from the entry point
and from `package.json`; the lockfile diff is exactly the one package. Bundle
2,884 kB → 2,876 kB.

Vue 3 has `<Teleport>` built in, so nothing replaces it.

### Verification

`test/vue3Readiness.test.js` (5 tests) locks the invariants, including the
exact list of the four surviving `.native` sites so a fifth cannot appear
unnoticed. It also scans for the Vue 2 APIs this codebase happens to be free of
already (`$listeners`, `$children`, `$scopedSlots`, `slot-scope`, `keyCode`
modifiers, the `filters` option), stripping comments first so the notes in the
source explaining a `.native` do not trip it.

- `npm run verify` — 0 lint errors, **90 tests** (was 85), production build.
- In the browser against live Atlas: typing into the home page vendor
  autocomplete filters to `KINKA IZAKAYA ORIGINAL` / `Pizza King` with match
  highlighting, which exercises the rewritten `search-input` binding
  end-to-end — the list only narrows if `@update:search-input` is writing
  `vendorSearch` back. Every `v-btn` on the vendor signup page reports a
  `click` handler in `$listeners`.

---

## Phase 4b-3a — three libraries off the critical path ✅

Two Vue-2-only packages replaced with local code, one bumped to a version that
spans both majors. Still on Vue 2, still green.

### `vue-intersection-observer` → `src/components/Observer.vue`

The published package has no Vue 3 build, and what it actually ships is a
webpack UMD bundle of a 35-line SFC: `<div><slot/></div>`, an
`IntersectionObserver` on the root element, one event. It also declares **`vue`
and `vue-router` as runtime dependencies**, which is how `core-js` ended up in
the tree.

The local replacement keeps the contract exactly — props `root` / `rootMargin`
/ `threshold`, emits `on-change` with `(firstEntry, unobserve)`, attributes
falling through to the root `<div>` so `Home.vue`'s `onChange` can still read
the tile index off `entry.target.id`. The single usage did not change.

**It declares both `beforeDestroy` and `beforeUnmount`.** Vue 2 calls the
first and treats the second as an unrecognised option; Vue 3 does the reverse.
That is what lets a component written today survive 4b-4 without an edit, which
is the entire reason for writing it now instead of after the flip. Verified in
the browser: no Vue 2 warning about the unknown option.

### `vue-the-mask` → `src/directives/mask.js`

Vue 2 only and unmaintained. MIT, and the masking core is small, so the
string-mask path was **ported rather than swapped for a different library** —
this drives the phone and fax fields on vendor signup and vendor profile, and a
subtle change in how a half-typed number formats is the kind of thing nobody
notices until a user complains.

Before deleting the dependency, the port was checked against the real library
over **6 masks × 12 inputs — 72 combinations, 0 mismatches**. The interesting
rows are pinned as fixtures in `test/mask.test.js`.

A **plain function** is directive shorthand in both Vue 2 (`bind` + `update`)
and Vue 3 (`mounted` + `updated`) — and is how vue-the-mask registered itself —
so this file also needs no change at the flip.

Dropped: the dynamic-mask path, where the mask is an array of candidates. Both
call sites pass the single string `"(###)###-####"`, and an array now throws
rather than silently formatting wrongly. `Signup.vue` imported `mask` with its
`directives` block commented out — a dead import, removed.

### `vue-masonry` 0.13 → 0.16

Not actually a Vue-2-only library, which the earlier note got wrong. 0.16
declares `vue: ^2.0.0 || >=3.0.0` and marks `@vue/composition-api` **optional**,
so the bump costs nothing on Vue 2 — it pulls in `vue-demi` (the Vue 2/3 shim
that makes the range work) and `mitt`, both tiny. No API change: `v-masonry`,
`v-masonry-tile` and `$redrawVueMasonry` are unchanged.

### Verification

- `npm run verify` — 0 lint errors, **97 tests** (was 90), production build.
- Bundle 2,876 kB → **2,852 kB**; `vue-the-mask`, `vue-intersection-observer`
  and `core-js` removed from the lockfile.
- **Mask, in the browser against the live app:** the directive binds to exactly
  the two fields carrying `v-phoneMask` (Telephone, Fax) and no others. Driving
  its real handler a digit at a time produces
  `(4 → (41 → (416 → (416)5 → … → (416)555-1234`, extra digits are discarded,
  and — the part that matters — the Vuetify field's `lazyValue` ends up
  `(416)555-1234`, so the dispatched `input` event is reaching `v-model`.
- **Observer, in the browser:** 21 instances mounted, every one holding a live
  `IntersectionObserver`, root element a `<div>`, `id` falling through as
  `0,1,2,3…`. After scrolling to y=2200 the component emitted 10 `on-change`
  events and `markerList` flipped from `true×4, false…` to `false×10, true×6` —
  the correct answer for that viewport.
- **Masonry, in the browser:** all 21 tiles absolutely positioned into two
  columns at x=65 and x=290, container height computed to 4246px,
  `$redrawVueMasonry` registered on the instance.

> A note on that Observer measurement, because it looks alarming at first:
> scrolling produced **zero** `on-change` events until a screenshot forced the
> page to paint. A raw `IntersectionObserver` created alongside as a control
> behaved identically. Intersection callbacks are delivered during the same
> "update the rendering" step that `requestAnimationFrame` belongs to, so a
> non-painting page skips both — the same mechanism as the flyer-photo
> non-regression above. Always take the screenshot first.

---

## Phase 4b-3b — the rich-text editor, and a chat nobody was using ✅

### `vue2-editor` → `src/components/QuillEditor.vue`

`<vue-editor>` drives the flyer designer's rich-text pane. vue2-editor is a
Vue 2 SFC with no Vue 3 release, and the off-the-shelf successor
(`@vueup/vue-quill`) has `peerDependencies { vue: ^3.2.41 }` — so taking it
would push this into 4b-4. A local wrapper keeps it here, and Quill is already
a direct dependency initialised in `src/quill-setup.js`.

Four things were checked before writing a line, because a faithful replacement
matters more than a tidy one here:

1. **vue2-editor does not bundle Quill** — it does `import Quill from "quill"`.
   So it was always driving the same singleton that VendorFlyers.vue registers
   its custom font and size attributors against. The swap cannot silently split
   that into two copies.
2. **Its injected CSS was Quill 1.3.6's core + snow and nothing else** — it
   defines no rules of its own for `.quillWrapper`. Importing
   `quill/dist/quill.snow.css` (from the installed 1.3.7) covers it.
3. **The picker labels for this project's custom fonts and sizes are already in
   `index.html`**, so the toolbar's appearance never depended on the package.
4. **The call site binds no event listeners at all** — only six props. So
   `ready` / `focus` / `blur` / `text-change` / `selection-change` /
   `editor-change` did not need reproducing, nor did
   `useCustomImageHandler`, `useMarkdownShortcuts`, the `toolbar` slot or the
   `id` prop.

What *is* reproduced exactly: the `mergeDeep` used to fold `editorOptions` into
the config (including deleting the default toolbar when the options supply
one), the focus guard on the `value` watcher that stops the caret jumping
mid-word, and — the easy one to lose — **normalising Quill's empty document
`<p><br></p>` to `""`**, so an emptied editor does not save a stray paragraph
into the flyer element.

Deviation, deliberate: vue2-editor substituted its own default toolbar when
none was passed. The single call site always passes one, so this falls back to
Quill's default rather than carrying a copy of theirs.

### `vue-advanced-chat` deleted — it was already dead

Found while looking for what could replace beautiful-chat. In **both** App.vue
and Home.vue the component import and its registration were commented out; only
`import "vue-advanced-chat/dist/vue-advanced-chat.css"` was still live, pulling
in **46 kB of CSS for a component that is never rendered**. All 218 of its
selectors are `vac-` prefixed, so nothing else could have depended on them.

Removed, along with 6 packages. It also drops off the 4b-4 bump list.

### Verification

- `npm run verify` — 0 lint errors, **104 tests** (was 97), production build.
- Bundle: JS 2,852 → **2,817 kB**, CSS 719 → **695 kB**. The CSS moves the other
  way first (Quill's sheet is now a real stylesheet rather than JS-injected
  strings) and then comes down further when vue-advanced-chat goes.
- Home page renders unchanged after the App.vue / Home.vue edits, with **no Vue
  warnings and no unresolved components** on a clean load.
- **The editor was mounted in the live app runtime** — dynamically imported and
  instantiated against a detached root — and checked end to end:

| Check | Result |
|---|---|
| Toolbar renders with the project's own whitelists | font `arial, garamond, tahoma, verdana`; size `null, 0.75em, 1.5em, 2.5em`; image button present |
| Snow theme styles applied | `.ql-toolbar` border-bottom 1px, labels read "Arial"/"Normal" |
| `customModules` | registered **and instantiated** — so `imageResize` will attach |
| `editorOptions` deep-merged | proven by the probe module being constructed |
| Seeded `value` | rendered, and not echoed back over the model |
| Typing / formatting | `<p>hello world</p>`, `<p><strong>hello</strong> world</p>` |
| Emptying | Quill holds `<p><br></p>`, component emits `""` |
| Parent-driven change while unfocused | applied |
| `disabled` | `quill.isEnabled()` false, `ql-disabled` class on, reversible |
| Destroy | listener detached, `quill` nulled |

> **Not verified:** the editor inside VendorFlyers.vue's flyer designer, which
> is behind vendor authentication. The component contract is exercised above
> and by `test/quillEditor.test.js`, but the surrounding flyer flow — saving a
> sketch, the `imageResize` handles on a real image — has not been run.
> **Worth a manual pass with a vendor account before 4b-4.**

---

## Phase 4b-3c — guild chat rebuilt in Vuetify ✅

The last Vue-2-only library, and the one worth the most. `vue-beautiful-chat`
has no Vue 3 release at any major, ships a **381 kB minified dist with no
source**, and pulls eight dependencies including `imagemin` — a build tool —
and `v-tooltip`, which is itself Vue 2 only. Forking it would have meant
porting someone else's Vue 2 component tree from GitHub.

The project owner chose to rebuild it. `src/components/GuildChat.vue` is ~200
lines of Vuetify: launcher fab, toolbar with the existing `header` slot,
scrolling message list, and a textarea that sends on Enter.

### The data contract did not move

App.vue's message and participant plumbing is untouched — the subscription
handler, `messageList` shape, `participants` mapping and `onMessageWasSent`
mutation are all exactly as they were:

- `messageList` items are `{ author, type: "text"|"emoji", data: { text|emoji,
  meta }, nickName }`, with `author === "me"` marking the resident's own
  messages
- `participants` are `{ id: residentName, name: nickName, imageUrl }`
- sending emits the library's `{ type, data: { text } }` shape, which is what
  `onMessageWasSent` already destructures

What did change in App.vue: `open` / `close` / `onMessageWasSent` were *props
holding functions* and are now ordinary events, and the `text-message-body` and
`user-avatar` slots moved inside the component — they were doing what a chat
component should do itself. The `header` slot stayed. The template shrank from
58 lines to 12.

### A security fix came out of it

The old `text-message-body` slot did **`v-html="scopedProps.messageText"`** on
guild chat content. That was safe only because the library escaped and
sanitised the text first. Reproducing the slot literally would have turned it
into **stored XSS in guild chat** — any member could have scripted every other
member's session.

Message text is now interpolated as text. Verified live: a message whose body
is `<img src=x onerror="window.__XSS=1">` renders as visible text, injects zero
`<img>` elements, and does not execute. What is lost is auto-linked URLs and
the library's light markdown; what goes with it is the `v-html` sink.
`test/guildChat.test.js` fails if `v-html` reappears in either the component or
App.vue's chat block.

### Dropped deliberately

**Edit and delete controls.** The library rendered them because `showEdition`
and `showDeletion` were true — but **App.vue binds no `@edit` or `@remove`
listener**, so both buttons emitted into nothing. They have never worked.

**The emoji picker UI.** Emoji messages still render (`type: "emoji"` is
handled) and typing an emoji works; only the picker widget is gone.

### Verification

- `npm run verify` — 0 lint errors, **112 tests** (was 104), production build.
- **142 packages removed.** Bundle JS 2,817 → **2,456 kB**, a 361 kB drop.
- **Vulnerabilities 150 → 50** across all of 4b-3; critical 22 → **14**, high
  44 → **23**. Most of that is the `imagemin` tree this package was carrying.
- **Mounted in the live app runtime** and driven end to end: header slot
  renders, four bubbles with avatars only on other people's messages, emoji
  message renders, sent messages right-aligned and received left-aligned in the
  configured colours, typing binds the draft, Enter emits
  `{type:"text",data:{text:"hello guild"}}` and clears it, blank Enter is
  ignored, close swaps to the launcher and clicking it reopens, and a new
  message scrolls the list to the bottom.

> **Not verified:** the chat inside a real signed-in guild session, which needs
> a resident account belonging to a guild. The component contract is exercised
> above and the App.vue wiring is locked by tests, but the live subscription
> round-trip has not been run. **Worth a manual pass before 4b-4**, alongside
> the flyer designer.

---

## Open items and judgement calls

### CLOSED — "flyer card photos do not render under Vite" was not a regression

**Status: resolved 2026-08-16. There is no bug in the application. The blank
photos were an artefact of how the page was being measured.**

#### How the photos are bound

`src/views/Home.vue:607` — a Vuetify `v-img`, not a plain `<img>` and not a CSS
background:

```html
<v-img :src="event.eventPhoto" contain height="220" class="my-1">
  <img v-event-type-photo="event.eventType" ... />   <!-- the SALE badge -->
</v-img>
```

`event.eventPhoto` is a base64 `data:image/jpeg` string from GraphQL (~42 kB
each). The SALE badge is a real `<img>` **inside** the `v-img`'s default slot,
which is why the badge always rendered while the photo did not — and why "real
`<img>` tags all load fine" was true and irrelevant.

#### Root cause

`VImg` renders its image as a `<div class="v-image__image">` wrapped in a Vue
`<transition name="fade-transition" mode="in-out">`. Vue 2's transition module
drives the fade with `nextFrame()`, which is a **double
`requestAnimationFrame`**. The `fade-transition-enter` class — `opacity: 0` —
is only removed inside that callback.

The browser pane the app was being inspected in reports
`document.visibilityState === "hidden"`, and a hidden page gets **zero**
`requestAnimationFrame` callbacks. Measured live: `rafTicks: 0` over a full
second. So every `v-img` loaded its image, wrote the correct
`background-image`, and then sat at `opacity: 0` forever.

Confirmed on the running app — the component state and the DOM disagree, which
is the whole story:

| Probe | Value |
|---|---|
| `vm.isLoading` | `false` — the image finished loading |
| `vm.currentSrc` | `data:image/jpeg;base64,/9j/4AAQ…` |
| `vm.hasError` | `false` |
| rendered element `class` | `v-image__image v-image__image--contain fade-transition-enter fade-transition-enter-active` |
| rendered element `style` | `background-image: url("data:image/jpeg;base64,/9j/…")` |
| computed `opacity` | `0` |

**Taking a screenshot forces the page to paint**, which lets the queued
`requestAnimationFrame` callbacks run and the fade complete. That single fact
explains every contradiction in the old notes:

- **Run 1 vs run 2 disagreeing.** Neither was wrong. `.v-image__image` elements
  *accumulate* while rAF is stalled: each fade leaves a stuck `-enter` element
  behind, and the `mode: "in-out"` leave — which also waits on `nextFrame` —
  leaves a stuck `-leave-active` element behind. The count is just how many
  images had loaded by the moment of the snapshot, doubled. At 1280×720 after a
  screenshot: 89 elements, 43 with a background, 43 opaque. Before any
  screenshot at 768×1024: 46 elements, 0 with a background.
- **"opacity stuck at 0" was the correct observation**, and the notes were wrong
  to retract it. It was dismissed because run 2 showed no `background-image` at
  all — but that only meant fewer images had loaded yet, not that the
  explanation was false.

#### The webpack build does exactly the same thing

Built and ran `97f3c3a` in a git worktree with its own `node_modules`
(vue-cli 4 / webpack 4 / `vuetify/lib` + `vuetify-loader`) and probed it in the
same hidden pane, same 768×1024 viewport:

| Build | `.v-image__image` | with `background-image` | opaque | rAF ticks/s |
|---|---|---|---|---|
| Vite (`master`) | 46 | 0 | 0 | 0 |
| webpack (`97f3c3a`) | 46 | 0 | 0 | 0 |

Identical, to the element. The first screenshot of the webpack build shows the
same blank cards; the second shows the food photography. The claim that
"under the webpack build the same cards showed food photography" came from a
session that happened to screenshot before measuring — it was comparing a
painted page against an unpainted one.

Nothing was changed in the application to close this.

#### Methodology note for future browser verification

`v-img` is used in ~40 places across this app, so this affects any visual check.
Anything gated on `requestAnimationFrame` — every Vuetify transition, every
`v-fade-transition`/`v-expand-transition`, `v-menu` and `v-dialog` open
animations — will appear frozen mid-transition when the page is inspected
without being painted.

**Take a screenshot first, then measure**, and take a second screenshot when
checking a transition's end state. Treat "element exists with correct inline
style but computed opacity 0 and a `*-enter` class still attached" as the
signature of an unpainted page, not an application bug.

### Phase 4a-ii — what the Vite migration still needs

Surveyed but not attempted. The known work:

- **Vuetify 2 a-la-carte.** `vuetify-loader` is webpack-only and there is no
  Vuetify 2 equivalent for Vite. Either import Vuetify in full (larger bundle)
  or find a community plugin. **This is the main unknown.**
- **PWA**: `vue-cli-plugin-pwa` → `vite-plugin-pwa`.
- **Quill**: the `webpack.ProvidePlugin` shim for `window.Quill` needs an
  explicit assignment in `main.js` instead.
- **Env vars**: `process.env.VUE_APP_*` → `import.meta.env.VITE_*`, touching
  `.env.development`, `.env.production` and `main.js`.
- **index.html** moves to the project root and references the entry directly.
- **Bonus**: the two graphql 16 workarounds added in Phase 3a
  (`transpileDependencies` and the `graphql$` CJS alias) both disappear — Vite
  handles that ESM natively.

### Known gaps

- **Subscriptions are deliberately left unguarded.** `resolvers/Subscription.js`
  publishes guild chat and message events to any connected socket. Phase 3a
  confirmed the transport carries auth (`connectionParams` reaches the context),
  so the policy layer could be applied the same way. **The project owner decided
  on 2026-08-15 not to, on the grounds that this is a demo.** Recorded here so
  the gap is not mistaken for an oversight — it must be closed before any real
  deployment.
- **Identity keys are writable through profile updates by design elsewhere.**
  Renaming is now blocked on both profile mutations, but if a rename feature is
  ever wanted it must also migrate the per-tenant database and every stored
  foreign key. Treat `residentName` / `businessTitle` as immutable.
- **`getSelectedFlyerClientView` is authenticated but not owner-pinned.** It
  records a flyer read against `resident`, and vendors preview their own flyers
  through the same query, so pinning to the caller would break preview. Closing
  anonymous access removed the abuse path that mattered.
- **Signup availability checks are user-enumeration oracles** (`checkEmail`,
  `checkResidentName`, …). That is inherent to a "is this taken?" check and the
  signup form needs them. Rate limiting is the right control, not auth.
- **150 npm vulnerabilities** remain, 22 critical; now concentrated in the
  Vue 2 / webpack 4 / puppeteer 10 client stack → Phases 4–5.
- **Client-side `console.log` calls remain** in `src/`. Server-side is done
  (Phase 3b); the browser ones are dev noise and are Phase 4's concern.
- **One unexplained browser console error**: `Uncaught SyntaxError: Unexpected
  token '<'`, no failed network request, no functional impact. Not diagnosed.
- **Bundle is 3.59 MiB** (2.2 MiB vendor chunk), no code splitting → Phase 4.

### Conventions established

- Security policy lives in `resolvers/auth/`, never inline in resolvers.
- Anything added to `Mutation.js` needs a `mutationPolicy.js` entry or the
  server will not boot.
- Tests use Node's built-in runner. No test framework dependency.
- One commit per phase.
