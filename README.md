# boundary (webtown) — upgraded

Vue 2 + Apollo GraphQL + MongoDB local-commerce / gamification platform.

This is the upgrade working copy of `webtown-master`. The original is left untouched.

## Requirements

- Node 20 (see `.nvmrc`)
- A MongoDB connection string

## Setup

```bash
nvm use
npm install --legacy-peer-deps
cp variables.env.example variables.env   # then fill in real values
```

`variables.env` is gitignored. Never commit it.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs API + client together (concurrently) |
| `npm run server` | API only, on `PORT` (default 4000), with nodemon |
| `npm run client` | Vue dev server on :8080 |
| `npm run build` | Production build into `dist/` |
| `npm test` | Auth/policy tests (Node's built-in runner, no extra deps) |

- GraphQL endpoint: `http://localhost:4000/graphql`
- Subscriptions: `ws://localhost:4000/graphql`

## Upgrade progress

- [x] **Phase 0** — Separate working copy, repo hygiene, secrets to env, **build restored**
- [x] **Phase 1a** — Authentication guards on all 59 mutations, token expiry, CORS, upload limits
- [ ] **Phase 1b** — Server-derived identity (ownership) + roles for privileged mutations
- [ ] **Phase 2** — Config, tooling, lint, CI
- [ ] **Phase 3** — Server modernization (Apollo 4, Mongoose 8, resolver split)
- [ ] **Phase 4** — Client modernization (Vite, event-bus removal, Vue 3)
- [ ] **Phase 5** — Dependency cleanup

See `UPGRADE.md` for the detail of what changed in each phase.
