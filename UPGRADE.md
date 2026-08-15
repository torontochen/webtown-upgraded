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
