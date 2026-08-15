# Upgrade log

Working copy of `webtown-master`. Each phase is a separate commit on `master`
so any phase can be reviewed or reverted independently.

---

## Phase 0 — Working copy, hygiene, and a restored build ✅

**Goal:** get to a clean, buildable baseline so every later phase is verifiable.

The build fix was pulled forward from Phase 2 of the original plan: the project
did not compile at all under Node 20, which made it impossible to verify any
Phase 1 change.

### Build restored

| Problem | Fix |
|---|---|
| `node-sass@4.14.1` had a Node 16 (`darwin-x64-93`) native binding; threw `Node Sass does not yet support your current environment` on Node 20 | Removed `node-sass`. `sass` (Dart Sass) was already a devDependency but unused — pinned to `~1.32.13`, the last line that pairs cleanly with `sass-loader@8` and Vuetify 2's `.sass` sources |
| `bcrypt@4.0.1` has no Node 20 prebuild | Bumped to `^5.1.1` — API-identical, prebuilt for Node 20 |

Verified: `npm run build` completes, and `node server.js` boots and listens on :4000.

### Secrets moved out of source

- `variables.env` is now gitignored; `variables.env.example` documents every key.
- The Gmail account and app password hardcoded in `server.js:59-61` now come
  from `MAIL_USER` / `MAIL_PASS` / `MAIL_SERVICE`.
- Added (unused until later phases, but documented now): `CLIENT_ORIGIN`,
  `CORS_WHITELIST`, `TOKEN_EXPIRES_IN`, `MAX_UPLOAD_BYTES`.

### Bug fixed

`vue.config.js` assigned `module.exports` twice, so the second assignment
silently discarded `transpileDependencies: ["vuetify"]`. Merged into one export.

### Removed

Dead duplicates, none of which had any inbound reference (verified by grep):

- `src/components/GoogleMap copy.vue`
- `src/views/Home copy.vue`
- `src/views/passVerification copy.handlebars`, `passVerification copy.html`
- `views/bizcat_products copy.json`, `views/bizcat_services copy.json`
- `public/static/sales_images__1_-removebg-preview copy.png`
- `output.txt` (empty)
- All `.DS_Store` files

Unused dependencies (zero references in `src/`, `resolvers/`, `models/`, `server.js`):

- `mapbox-gl` (~4 MB — Google Maps is what's actually used)
- `lzw-async`, `vue-native-cli`, `raw-loader`

`dist/` is no longer tracked — it was 100 committed files (~13 MB incl. source maps)
despite already being in `.gitignore`.

### Result

- Vulnerabilities: **204 → 142** (23 critical), purely from dropping unused deps
  and the bcrypt bump. The rest are structural and come down in Phases 3–5.
- Repo size excluding `node_modules`: ~19 MB → 6.3 MB.

### Known, deliberately deferred

- Apollo Server 2 warns that `graphql-upload` is CSRF-vulnerable. Fixed in Phase 3
  with the Apollo 4 migration.
- Mongoose 5 emits a Node URL deprecation warning. Fixed in Phase 3.
- Upload limits are still 10 GB / 50 MB, CORS still allows `undefined` origin.
  Both are Phase 1 (security), not Phase 0.

---

## Phase 1a — Authentication guards ✅

**Goal:** no mutation runs for an unauthenticated caller.

Before this phase, `currentUser` appeared in exactly 7 places in the resolvers,
all of them in `Query.js`. **None of the 59 mutations checked it.** Identity came
entirely from client-supplied arguments, so any anonymous caller could:

- rewrite any account's password via `updateProfile(residentId, password)`
- drain the city treasury and credit every resident via `distributeWelfare`
- mint silver at will via `crackEgg`, `gainLoseSilver`, `updateResidentSliver`
- place, confirm, or cancel orders as anybody

(The count is 59, not the 37 quoted in the original audit — that figure came
from too narrow a regex over `Mutation.js`.)

### Approach: a policy table, not 59 inline edits

`resolvers/auth/` holds three small files:

| File | Role |
|---|---|
| `guards.js` | `requireResident` / `requireVendor` / `requireAuth` / `allowPublic` |
| `mutationPolicy.js` | The complete name → policy table. The whole authorization surface, readable in one screen |
| `applyPolicy.js` | Wraps the resolver map; injects the principal as `context.auth` |

Guards are applied in `resolvers/resolvers.js` at assembly time. This was chosen
over inline `requireResident(ctx)` calls in each resolver because it **fails
closed at boot**:

- a resolver with no policy entry → startup error
- a policy entry naming a resolver that no longer exists → startup error
- an unknown policy name → startup error

So a newly added mutation cannot ship unguarded by accident, and a rename cannot
silently orphan its guard. Both directions are covered by tests.

### Policy assigned

| Policy | Count | Notes |
|---|---|---|
| `PUBLIC` | 4 | `signupResident`, `signupVendor`, `signinResident`, `signinVendor` — nothing else |
| `RESIDENT` | 31 | Resident + guild actions |
| `VENDOR` | 17 | Vendor catalog, flyer, promotion, fulfillment |
| `AUTHENTICATED` | 7 | Order state changes and messaging, where either side legitimately calls |

Mutations that additionally need an ownership or role check in Phase 1b are
marked `OWNERSHIP:` / `ROLE:` inline in `mutationPolicy.js`.

### Token expiry

`createTokenWithFP` and `createVendorTokenWithFP` — the remembered-device path —
called `jwt.sign` with no `expiresIn`, so those tokens never expired. Both now
use `TOKEN_EXPIRES_IN_REMEMBERED` (30d). The standard path keeps its existing
480h via `TOKEN_EXPIRES_IN`, so current sign-in behaviour is unchanged.

### Context building made permissive

`getUser` in `server.js` used to **throw** on an invalid token. Because it runs
during context creation, that failed *every* operation — including
`signinResident`. With tokens now actually expiring, any user holding a stale
token would have been unable to sign back in. It returns `null` instead;
the guards do the rejecting.

### formatError mapping

Apollo wraps resolver errors, so `error.name` is always `GraphQLError` by the
time it reaches `formatError`. The client (`src/main.js`) keys its automatic
sign-out off `err.name === "AuthenticationError"`, so guard rejections were
arriving as generic errors and the client never signed the user out. `formatError`
now maps `extensions.code` back to `AuthenticationError` / `ForbiddenError`.

### Also in this phase

- **CORS**: the whitelist now comes from `CORS_WHITELIST`. The old rule passed
  when `origin === undefined` — i.e. every non-browser client — which made the
  whitelist decorative. Requests with no `Origin` are now rejected when
  `NODE_ENV=production` and allowed only in development, where Playground needs them.
- **Upload limits**: `maxFieldSize` 10 GB → `MAX_UPLOAD_BYTES` (10 MB default);
  body parsers 50/100 MB → the same value; `parameterLimit` 100000 → 1000.
- **Hardcoded redirects**: the two email-verification redirects had localhost
  live and the Heroku URL commented beside them. Both now use `CLIENT_ORIGIN`.

### Verification

`npm test` — 16 tests, no dependencies added (Node's built-in runner).
Covers the guards, policy completeness, fail-closed boot behaviour, and
`applyPolicy` wiring.

End-to-end against a running server:

| Request | Result |
|---|---|
| Anonymous `crackEgg` | `AuthenticationError` / `UNAUTHENTICATED` |
| Anonymous `updateProfile` | `AuthenticationError` |
| Anonymous `distributeWelfare` | `AuthenticationError` |
| Vendor token → resident-only mutation | `ForbiddenError` / `FORBIDDEN` |
| Expired resident token | `AuthenticationError` |
| `signinResident` **with an expired token present** | Reaches the resolver — lockout bug fixed |
| `Origin: evil.example.com` | No `access-control-allow-origin` returned |

### Still open — Phase 1b

Authentication is enforced; **authorization by ownership is not**. A signed-in
resident can still pass another resident's `residentId` to `updateProfile`. The
guard proves *a* resident is calling, not *which* one. Phase 1b:

1. Derive identity from `context.auth` instead of arguments in the ~30 mutations
   marked `OWNERSHIP:`.
2. Add a role concept to `Resident` for the 8 `ROLE:` guild mutations and
   `distributeWelfare`.
3. `savePrepaidVendorItem` builds a MongoDB connection string by interpolating
   the client-supplied `resident` value — needs validation regardless of role.
4. Queries are still unguarded and several return PII.
