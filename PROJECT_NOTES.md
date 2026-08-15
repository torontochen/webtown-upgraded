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
| 2 — Config, tooling, lint, CI | ✅ Done | this commit |
| 3 — Server modernization (Apollo 4, Mongoose 8) | Not started | |
| 4 — Client modernization (Vite, Vue 3) | Not started | |
| 5 — Dependency cleanup | Not started | |

Run `npm run verify` after any change — lint, 55 tests, and a production build.
Tests use Node's built-in runner; no test framework dependency.

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

## Open items and judgement calls

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

### Known gaps

- **Subscriptions are still unguarded.** Phases 1a–1c covered queries and
  mutations. `resolvers/Subscription.js` is small (3.4 KB) but publishes guild
  chat and message events; it should get the same treatment.
- **`getSelectedFlyerClientView` is authenticated but not owner-pinned.** It
  records a flyer read against `resident`, and vendors preview their own flyers
  through the same query, so pinning to the caller would break preview. Closing
  anonymous access removed the abuse path that mattered.
- **Signup availability checks are user-enumeration oracles** (`checkEmail`,
  `checkResidentName`, …). That is inherent to a "is this taken?" check and the
  signup form needs them. Rate limiting is the right control, not auth.
- **142 npm vulnerabilities** remain; structural, addressed in Phases 3–5.
- **Apollo Server 2** warns that `graphql-upload` is CSRF-vulnerable → Phase 3.
- **Mongoose 5** emits a Node URL deprecation warning → Phase 3.
- **1,617 `console.log` calls** across `src/` and `resolvers/` → Phase 3.
- **19 event buses** in `main.js` — hard blocker for Vue 3 → Phase 4.
- **Bundle is 3.59 MiB** (2.2 MiB vendor chunk), no code splitting → Phase 4.

### Conventions established

- Security policy lives in `resolvers/auth/`, never inline in resolvers.
- Anything added to `Mutation.js` needs a `mutationPolicy.js` entry or the
  server will not boot.
- Tests use Node's built-in runner. No test framework dependency.
- One commit per phase.
