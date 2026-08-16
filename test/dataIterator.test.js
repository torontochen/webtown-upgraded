const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Vuetify 3's v-data-iterator does not hand the default slot the raw items.
// Each entry is a wrapper — { type, value, selectable, raw } — with the
// original object under `raw`. Verified by mounting the real component:
// props.items[0].orderNo is `undefined`, while props.items[0].raw.orderNo is
// the value.
//
// That makes it a *silent* breakage. Vuetify 2's slot handed over the items
// themselves, so the Vuetify 2 spelling `v-for="(item, i) in props.items"`
// followed by `item.orderNo` throws nothing under Vuetify 3 — it just renders
// empty cards. Nothing in lint or the build catches it, which is why it is
// asserted here.

const ROOT = path.join(__dirname, "..");

const vueFiles = (function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".vue")) out.push(p);
  }
  return out;
})(path.join(ROOT, "src"));

const rel = (f) => path.relative(ROOT, f);
const read = (f) => fs.readFileSync(f, "utf8");

test("every v-for over a data-iterator slot destructures raw", () => {
  const offenders = [];
  for (const f of vueFiles) {
    for (const m of read(f).matchAll(/v-for="([^"]*?)\s+in\s+props\.items"/g)) {
      const binding = m[1].trim();
      if (!/\braw\s*:/.test(binding)) {
        offenders.push(`${rel(f)}: v-for="${binding} in props.items" reads the wrapper, not the item`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test("all five iterators are still wired to the slot", () => {
  // Guards the other direction: if someone rewrites a v-for away from
  // props.items the check above would pass vacuously.
  const iterators = vueFiles.reduce(
    (n, f) => n + (read(f).match(/<v-data-iterator/g) || []).length,
    0
  );
  const destructured = vueFiles.reduce(
    (n, f) => n + (read(f).match(/\{ raw: \w+ \}[^"]*in props\.items/g) || []).length,
    0
  );
  assert.equal(iterators, 5, "expected five v-data-iterator usages");
  assert.equal(destructured, 5, "expected each to destructure raw in its default slot");
});

test("hide-default-footer is gone from the iterators", () => {
  // Vuetify 3's data-iterator renders no footer unless a `footer` slot is
  // supplied, so the prop has nothing to hide — and being unknown it would
  // fall through onto the root element as a stray DOM attribute.
  const offenders = vueFiles
    .filter((f) => /hide-default-footer/.test(read(f)))
    .map(rel);
  assert.deepEqual(offenders, []);
});
