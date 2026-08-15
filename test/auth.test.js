const test = require("node:test");
const assert = require("node:assert/strict");

const {
  requireAuth,
  requireResident,
  requireVendor,
  RESIDENT,
  VENDOR,
  AUTHENTICATED,
  PUBLIC,
} = require("../resolvers/auth/guards");
const { applyPolicy } = require("../resolvers/auth/applyPolicy");
const { MUTATION_POLICY } = require("../resolvers/auth/mutationPolicy");

const residentCtx = { currentUser: { tokenSign: "resident", email: "r@x.com" } };
const vendorCtx = { currentUser: { tokenSign: "vendor", email: "v@x.com" } };
const anonCtx = { currentUser: null };

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

test("requireAuth rejects an anonymous caller", () => {
  assert.throws(() => requireAuth(anonCtx), /must be signed in/i);
});

test("requireAuth accepts either principal and returns it", () => {
  assert.equal(requireAuth(residentCtx).tokenSign, "resident");
  assert.equal(requireAuth(vendorCtx).tokenSign, "vendor");
});

test("requireResident rejects anonymous and vendor callers", () => {
  assert.throws(() => requireResident(anonCtx), /must be signed in/i);
  assert.throws(() => requireResident(vendorCtx), /only available to residents/i);
  assert.equal(requireResident(residentCtx).tokenSign, "resident");
});

test("requireVendor rejects anonymous and resident callers", () => {
  assert.throws(() => requireVendor(anonCtx), /must be signed in/i);
  assert.throws(() => requireVendor(residentCtx), /only available to vendors/i);
  assert.equal(requireVendor(vendorCtx).tokenSign, "vendor");
});

test("an expired token, which yields currentUser=null, is treated as anonymous", () => {
  // server.js getUser() returns null rather than throwing on an expired token,
  // so that a stale token cannot block signinResident/signinVendor.
  assert.throws(() => requireResident({ currentUser: null }), /must be signed in/i);
});

// ---------------------------------------------------------------------------
// Policy completeness — the regression guard that matters most
// ---------------------------------------------------------------------------

test("every mutation resolver has an explicit policy entry", () => {
  const Mutation = require("../resolvers/Mutation");
  const missing = Object.keys(Mutation).filter((n) => !(n in MUTATION_POLICY));
  assert.deepEqual(missing, [], `unguarded mutations: ${missing.join(", ")}`);
});

test("no policy entry refers to a resolver that no longer exists", () => {
  const Mutation = require("../resolvers/Mutation");
  const orphans = Object.keys(MUTATION_POLICY).filter((n) => !(n in Mutation));
  assert.deepEqual(orphans, [], `stale policy entries: ${orphans.join(", ")}`);
});

test("only signup/signin are public", () => {
  const publicOnes = Object.entries(MUTATION_POLICY)
    .filter(([, p]) => p === PUBLIC)
    .map(([n]) => n)
    .sort();
  assert.deepEqual(publicOnes, [
    "signinResident",
    "signinVendor",
    "signupResident",
    "signupVendor",
  ]);
});

test("the account-takeover mutations are no longer reachable anonymously", () => {
  // updateProfile rewrote any account's password hash from a client-supplied
  // residentId; distributeWelfare debited the treasury and credited every
  // resident. Both were callable with no token at all.
  for (const name of ["updateProfile", "updateVendorProfile", "distributeWelfare"]) {
    assert.notEqual(MUTATION_POLICY[name], PUBLIC, `${name} must not be public`);
  }
});

// ---------------------------------------------------------------------------
// applyPolicy wiring
// ---------------------------------------------------------------------------

// Guarded resolvers are wrapped in an async function (ownership and role checks
// hit the database), so guard failures arrive as rejections rather than sync
// throws. GraphQL surfaces both identically.
test("applyPolicy blocks a guarded resolver from running when anonymous", async () => {
  let ran = false;
  const guarded = applyPolicy(
    { doThing: () => { ran = true; } },
    { doThing: RESIDENT },
    "Mutation"
  );
  await assert.rejects(
    () => guarded.doThing(null, {}, anonCtx, {}),
    /must be signed in/i
  );
  assert.equal(ran, false, "resolver body must not execute");
});

test("applyPolicy lets a public resolver run with no token", () => {
  const guarded = applyPolicy(
    { signin: () => "token" },
    { signin: PUBLIC },
    "Mutation"
  );
  assert.equal(guarded.signin(null, {}, anonCtx, {}), "token");
});

test("applyPolicy injects the principal as context.auth", async () => {
  let seen;
  const guarded = applyPolicy(
    { doThing: (_p, _a, ctx) => { seen = ctx.auth; } },
    { doThing: RESIDENT },
    "Mutation"
  );
  await guarded.doThing(null, {}, residentCtx, {});
  assert.equal(seen.email, "r@x.com");
});

test("applyPolicy preserves resolver return values and arguments", async () => {
  const guarded = applyPolicy(
    { doThing: async (_p, args) => args.n * 2 },
    { doThing: AUTHENTICATED },
    "Mutation"
  );
  assert.equal(await guarded.doThing(null, { n: 21 }, vendorCtx, {}), 42);
});

test("applyPolicy throws at boot for a resolver with no policy", () => {
  assert.throws(
    () => applyPolicy({ a: () => {}, b: () => {} }, { a: RESIDENT }, "Mutation"),
    /no access policy for 1 resolver\(s\): b/
  );
});

test("applyPolicy throws at boot for a policy entry with no resolver", () => {
  assert.throws(
    () => applyPolicy({ a: () => {} }, { a: RESIDENT, ghost: VENDOR }, "Mutation"),
    /do not exist: ghost/
  );
});

test("applyPolicy throws at boot for an unknown policy name", () => {
  assert.throws(
    () => applyPolicy({ a: () => {} }, { a: "superuser" }, "Mutation"),
    /unknown policy "superuser"/
  );
});
