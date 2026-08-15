const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { MUTATION_POLICY } = require("../resolvers/auth/mutationPolicy");
const { QUERY_POLICY } = require("../resolvers/auth/queryPolicy");

// Phase 3b split the two monolithic resolver files into domain modules that a
// barrel re-assembles. These tests guard the properties that split must keep.

function domainModules(dir) {
  const abs = path.join(__dirname, "..", "resolvers", dir);
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".js") && f !== "_shared.js")
    .map((f) => ({ name: f, mod: require(path.join(abs, f)) }));
}

test("every mutation appears in exactly one domain module", () => {
  const seen = new Map();
  for (const { name, mod } of domainModules("mutations")) {
    for (const key of Object.keys(mod)) {
      assert.ok(
        !seen.has(key),
        `${key} is in both ${seen.get(key)} and ${name} — the barrel spread would silently pick one`
      );
      seen.set(key, name);
    }
  }
  assert.equal(seen.size, Object.keys(MUTATION_POLICY).length);
});

test("every query appears in exactly one domain module", () => {
  const seen = new Map();
  for (const { name, mod } of domainModules("queries")) {
    for (const key of Object.keys(mod)) {
      assert.ok(!seen.has(key), `${key} is in both ${seen.get(key)} and ${name}`);
      seen.set(key, name);
    }
  }
  assert.equal(seen.size, Object.keys(QUERY_POLICY).length);
});

test("the barrels expose exactly what the policy tables cover", () => {
  // applyPolicy already enforces this at boot; asserting it here means a bad
  // split fails the test suite rather than only failing to start.
  const Mutation = require("../resolvers/Mutation");
  const Query = require("../resolvers/Query");
  assert.deepEqual(
    Object.keys(Mutation).sort(),
    Object.keys(MUTATION_POLICY).sort()
  );
  assert.deepEqual(Object.keys(Query).sort(), Object.keys(QUERY_POLICY).sort());
});

test("every resolver is a function", () => {
  const Mutation = require("../resolvers/Mutation");
  const Query = require("../resolvers/Query");
  for (const [name, fn] of Object.entries({ ...Mutation, ...Query })) {
    assert.equal(typeof fn, "function", `${name} is not a function`);
  }
});

test("no domain module still requires the old monolith", () => {
  for (const dir of ["mutations", "queries"]) {
    const abs = path.join(__dirname, "..", "resolvers", dir);
    for (const f of fs.readdirSync(abs)) {
      const src = fs
        .readFileSync(path.join(abs, f), "utf8")
        // Strip line comments — _shared.js carries a commented-out
        // `require("../Query")` inherited from the original file.
        .replace(/^\s*\/\/.*$/gm, "");
      assert.ok(
        !/require\(["']\.\.\/(Mutation|Query)["']\)/.test(src),
        `${dir}/${f} requires the barrel — that is a cycle`
      );
    }
  }
});
