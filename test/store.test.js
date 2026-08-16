const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Phase 4c replaced Vuex 4 with Pinia. The store is plain JS, so its shape can
// be checked statically — and the checks below are the ones that matter,
// because Vuex failed soft where Pinia fails hard.
//
// Under Vuex, `commit("setTypo", v)` on a name that did not exist logged
// "unknown mutation type" and carried on. The same call is now `store.setTypo(v)`
// — a TypeError. So a name that does not resolve is no longer a quiet no-op,
// and the resolution check here is what stops one shipping.

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const rel = (f) => path.relative(ROOT, f);

const srcFiles = (function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".vue") || e.name.endsWith(".js")) out.push(p);
  }
  return out;
})(path.join(ROOT, "src"));

const stripComments = (s) =>
  s.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const STATE = [...read("src/store/state.js").matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
const MUTATIONS = [...read("src/store/mutations.js").matchAll(/^ {2}([A-Za-z]\w*)\(/gm)].map((m) => m[1]);
const ACTIONS = [...read("src/store/actions.js").matchAll(/^\s{1,3}(?:async )?([A-Za-z]\w*)\(/gm)].map((m) => m[1]);

test("Vuex is gone from the source and from package.json", () => {
  const pkg = require(path.join(ROOT, "package.json"));
  assert.ok(!("vuex" in pkg.dependencies), "vuex is still a dependency");
  assert.ok("pinia" in pkg.dependencies, "pinia should be a dependency");

  const offenders = srcFiles
    .filter((f) => /from ["']vuex["']/.test(read(rel(f))))
    .map(rel);
  assert.deepEqual(offenders, []);
});

test("no dispatch/commit/getters call form survives", () => {
  const offenders = [];
  for (const f of srcFiles) {
    const src = stripComments(read(rel(f)));
    for (const pattern of [/\$store\.dispatch\(/, /\$store\.commit\(/, /\$store\.getters\b/]) {
      if (pattern.test(src)) offenders.push(`${rel(f)}: ${pattern}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("every $store member resolves to a state key or an action", () => {
  // The check that replaces Vuex's "unknown mutation type" warning.
  const known = new Set([...STATE, ...MUTATIONS, ...ACTIONS, "router", "$patch", "$state", "$reset"]);
  const offenders = [];
  for (const f of srcFiles) {
    if (rel(f).startsWith("src/store")) continue;
    for (const m of stripComments(read(rel(f))).matchAll(/\$store\.(\w+)/g)) {
      if (!known.has(m[1])) offenders.push(`${rel(f)}: $store.${m[1]}`);
    }
  }
  assert.deepEqual([...new Set(offenders)], []);
});

test("every mapState name is a real state key", () => {
  // mapState reads state directly now that the pass-through getters are gone,
  // so a name that used to resolve through a getter must exist in state.
  const offenders = [];
  for (const f of srcFiles) {
    // Comments are stripped first — store.js documents this call form by name.
    for (const m of stripComments(read(rel(f))).matchAll(/mapState\(useMainStore,\s*\[([\s\S]*?)\]/g)) {
      for (const raw of m[1].split(",")) {
        const name = raw.trim().replace(/^["']|["']$/g, "");
        if (name && !STATE.includes(name)) offenders.push(`${rel(f)}: ${name}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("the pass-through getters are gone", () => {
  // All 74 were `x: state => state.x`, named exactly like the state key. Pinia
  // exposes state on the store, so they were redundant — and would collide,
  // since a getter cannot share a name with a state property.
  assert.ok(
    !fs.existsSync(path.join(ROOT, "src/store/getters.js")),
    "src/store/getters.js should have been deleted"
  );
});

test("no mutation or action name collides with a state key", () => {
  // Pinia puts state, getters and actions in one namespace on the store.
  const clashes = [...MUTATIONS, ...ACTIONS].filter((n) => STATE.includes(n));
  assert.deepEqual(clashes, []);
  const both = MUTATIONS.filter((n) => ACTIONS.includes(n));
  assert.deepEqual(both, [], "a name defined as both a mutation and an action");
});

test("the store no longer imports main.js or the router", () => {
  // Two import cycles broke the app during this migration, both surfacing as
  // "Cannot access 'useMainStore' before initialization":
  //   store -> actions -> main -> store
  //   store -> actions -> router -> every component -> store
  // The Apollo client moved to its own module and the router is handed to the
  // store instead, so neither edge may come back.
  const actions = read("src/store/actions.js");
  assert.ok(!/from ["'][^"']*main\.js["']/.test(actions), "actions.js imports main.js again");
  assert.ok(!/^import router from/m.test(actions), "actions.js imports the router again");
  assert.match(actions, /from "\.\.\/apollo\/client"/);

  const client = read("src/apollo/client.js");
  assert.ok(
    !/from ["'][^"']*store["']/.test(client),
    "apollo/client.js must not import the store — that would close the cycle"
  );
  assert.match(client, /export const attachStore/);
});

test("actions reach the router through the store", () => {
  const actions = read("src/store/actions.js");
  const bare = [...stripComments(actions).matchAll(/(?<![.\w])router\.(push|go|replace)\(/g)];
  assert.deepEqual(bare.map((m) => m[0]), [], "actions must use this.router, not a module import");
  assert.match(actions, /this\.router\.(push|go|replace)\(/);
});
