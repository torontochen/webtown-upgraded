const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Phase 4b-1 replaced the seven `Vue.filter` registrations with plain functions
// called as `$filters.name(x)`. Two things are locked here:
//
//   1. Behaviour — the functions must format exactly as the filters did, since
//      176 template sites were rewritten mechanically and nothing else checks
//      what they render.
//   2. The migration invariant — no `|` filter syntax may come back. This
//      matters more than usual: Phase 4a-i found eight filter expressions that
//      a formatter had silently mangled into subtraction, which rendered raw
//      values for months. Vue 3 drops filter support entirely, so a
//      reintroduced `|` would fail silently again.

const SRC = path.join(__dirname, "..", "src");

const vueFiles = (function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".vue")) out.push(p);
  }
  return out;
})(SRC);

// src/filters.js is an ES module for the browser bundle; the test runner is
// CommonJS. The bodies have no imports beyond moment, so it is rewritten to a
// CommonJS module and evaluated rather than adding a transpile step.
const filters = (() => {
  const src = fs
    .readFileSync(path.join(SRC, "filters.js"), "utf8")
    .replace(/^import moment from "moment";$/m, 'const moment = require("moment");')
    .replace(/^export const /gm, "exports.")
    .replace(/^export default [\s\S]*$/m, "");
  const module = { exports: {} };
  new Function("exports", "require", "module", src)(
    module.exports,
    require,
    module
  );
  return module.exports;
})();

test("every filter used by a template is exported", () => {
  const used = new Set();
  for (const file of vueFiles) {
    for (const m of fs.readFileSync(file, "utf8").matchAll(/\$filters\.([A-Za-z]+)\(/g)) {
      used.add(m[1]);
    }
  }
  assert.ok(used.size > 0, "expected templates to call $filters");
  for (const name of used) {
    assert.equal(
      typeof filters[name],
      "function",
      `templates call $filters.${name}() but src/filters.js does not export it`
    );
  }
});

test("no Vue 2 filter syntax remains in any template", () => {
  const names = [
    "convert-date",
    "convert-customer-rating-time",
    "ellipsis-order-no",
    "ellipsis-description",
    "format-currency-amount",
    "format-amount",
    "format-int-amount",
  ];
  const pattern = new RegExp(`\\|\\s*(${names.join("|")})`);
  const offenders = vueFiles.filter((f) =>
    pattern.test(fs.readFileSync(f, "utf8"))
  );
  assert.deepEqual(offenders, []);
});

test("Vue.filter is no longer called anywhere", () => {
  const main = fs.readFileSync(path.join(SRC, "main.js"), "utf8");
  assert.ok(!/Vue\.filter\(/.test(main), "src/main.js still registers a filter");
  assert.ok(
    /\$filters\s*=\s*filters/.test(main),
    "src/main.js must expose the filters globally as $filters"
  );
});

test("formatCurrencyAmount matches the old format-currency-amount output", () => {
  assert.equal(filters.formatCurrencyAmount(0), "$0.00");
  assert.equal(filters.formatCurrencyAmount(1234.5), "$1,234.50");
  assert.equal(filters.formatCurrencyAmount(1234.567), "$1,234.57");
});

test("formatAmount keeps exactly two fraction digits and no currency", () => {
  assert.equal(filters.formatAmount(0), "0.00");
  assert.equal(filters.formatAmount(1234.5), "1,234.50");
});

test("formatIntAmount groups thousands", () => {
  // The treasury figure Phase 4a-i found rendering raw as "2320618".
  assert.equal(filters.formatIntAmount(2320618), "2,320,618");
  assert.equal(filters.formatIntAmount(0), "0");
});

test("the date filters format in UTC from a millisecond string", () => {
  // The news item Phase 4a-i found rendering raw as "at 1671047474940".
  assert.equal(filters.convertDate("1671047474940"), "2022-12-14");
  assert.equal(
    filters.convertCustomerRatingTime("1671047474940"),
    "December 14th 2022, 7:51:14 pm"
  );
});

test("ellipsisDescription only truncates past 20 characters", () => {
  assert.equal(filters.ellipsisDescription("short"), "short");
  assert.equal(
    filters.ellipsisDescription("a description that is definitely long"),
    "a description t...long"
  );
});
