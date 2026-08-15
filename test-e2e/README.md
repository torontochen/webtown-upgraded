# Live verification harness

Exercises the Phase 1a–1c authorization guards through the real HTTP + Apollo
path, against a live MongoDB, asserting on real database state.

Unlike `npm test` (which uses fakes and needs nothing running), this needs:

1. A reachable `MONGO_URI` in `variables.env`
2. The API running: `npm run server`

Then:

```bash
npm run test:e2e
```

It creates two throwaway residents prefixed `__ugtest_`, runs the checks, and
deletes them in a `finally` block. Existing records are only ever read.

This is what caught the privilege-escalation path that unit tests with fakes
could not — see the Phase 2.5 section of PROJECT_NOTES.md.
