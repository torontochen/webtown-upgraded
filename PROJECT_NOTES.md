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
| 4a-i — Event buses removed; first browser verification | ✅ Done | this commit |
| 4a-ii — Vite migration | Not started | |
| 4 — Client modernization (Vite, Vue 3) | Not started | |
| 5 — Dependency cleanup | Not started | |

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

## Open items and judgement calls

### KNOWN REGRESSION — v-img fade-in never completes under Vite

Card images do not appear. The data is present and correct: 10
`.v-image__image` elements carry their base64 `background-image` (~42 kB each)
at full size, but every one stays at `opacity: 0` indefinitely — re-checked
after a 4s delay, 0 of 10 had faded in. Vuetify's `v-img` starts an image
transparent and transitions it to `opacity: 1` on load; that step is not firing.

This was twice mistaken for screenshot paint-timing before being measured. It
is a real regression against the webpack build, where the same images rendered.

Everything else renders: toolbar, nav, flyer cards and their text, Google Maps
with marker clustering, vendor sidebar, footer. No console errors.

First place to look: whether Vuetify's transition components are registered
under the full `vuetify` build the way `vuetify/lib` + vuetify-loader
registered them, and whether `v-img`'s load handler runs at all (instrument
`.v-image__image` for a class/style change after load).



Things a future session (or reviewer) should know.

### Deliberate decisions

1. **Guild management is leader-only** — gated on `Guild.guildLeader`, not the
   numeric `rank` field. **Confirmed by the project owner on 2026-08-15:** only
   the leader may manage members. (`guildRank` is `[1,2,3,4]` with joiners at
   `1` and no label mapping anywhere, so rank ordering was ambiguous regardless.)

2. **`gainLoseSilver` is only half-constrained.** `winner` is pinned to the
   caller so it can only credit yourself; `loser` cannot be derived from a token
   and remains a client value. Properly fixing this needs a server-side game
   result, not an ownership check — it is a design change, out of scope here.

3. **`callGroupPurchase` has no owner field** — it publishes a News item to all
   clients and carries no vendor reference. Authenticated-vendor-only, but any
   vendor can publish. Worth a product look.

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
