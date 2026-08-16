const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Phase 4b-3 replaced vue-the-mask (Vue 2 only, unmaintained) with a local
// port of its string-mask core. These expectations were captured from the real
// library before the dependency was removed — a differential run over 6 masks
// × 12 inputs matched on all 72 combinations, and the interesting rows are
// pinned below so the behaviour cannot drift.
//
// The phone mask "(###)###-####" is the only one either call site uses; the
// other tokens are covered because the port carries them.

// src/directives/mask.js is an ES module for the browser bundle and touches
// `document` at call time, not at import time, so the pure function is
// extracted and evaluated rather than adding a transpile step.
const maskit = (() => {
  const src = fs
    .readFileSync(path.join(__dirname, "..", "src", "directives", "mask.js"), "utf8")
    .replace(/^export function maskit/m, "function maskit")
    .replace(/^export default function[\s\S]*$/m, "");
  const module = { exports: {} };
  new Function("module", src + "\nmodule.exports = maskit;")(module);
  return module.exports;
})();

test("the phone mask formats progressively as digits are typed", () => {
  const cases = [
    ["(###)###-####", "", ""],
    ["(###)###-####", "4", "(4"],
    ["(###)###-####", "416", "(416"],
    ["(###)###-####", "4165", "(416)5"],
    ["(###)###-####", "4165551234", "(416)555-1234"],
  ];
  for (const [mask, value, expected] of cases) {
    assert.equal(maskit(value, mask), expected, `mask ${mask} of "${value}"`);
  }
});

test("an already-formatted value is left alone", () => {
  // The vendor profile form seeds the field from the stored number, and the
  // directive re-masks it on bind. It must be a fixed point or the field would
  // rewrite itself on every render.
  const formatted = "(416)555-1234";
  assert.equal(maskit(formatted, "(###)###-####"), formatted);
});

test("input beyond the mask is discarded, and non-matching characters skipped", () => {
  assert.equal(maskit("416555123456789", "(###)###-####"), "(416)555-1234");
  assert.equal(maskit("abc416", "(###)###-####"), "(416");
});

test("a trailing literal only appears once the token before it is filled", () => {
  // This is why a bare "(" does not show up in an empty phone field.
  assert.equal(maskit("", "(#)"), "");
  assert.equal(maskit("1", "(#)"), "(1)");
});

test("the non-digit tokens carried over from vue-the-mask still work", () => {
  assert.equal(maskit("1abcd", "!#AA-aa"), "#AB-cd"); // ! escapes, A upper, a lower
  assert.equal(maskit("a1b2cde", "XXX-SSS"), "a1b-cde"); // X alphanumeric, S letter
});

test("the directive is a plain function, which is valid in Vue 2 and Vue 3", () => {
  // Vue 2 reads a function directive as { bind, update }; Vue 3 reads it as
  // { mounted, updated }. That is what lets this file survive the 4b-4 flip
  // untouched, so it is worth asserting rather than assuming.
  const src = fs.readFileSync(
    path.join(__dirname, "..", "src", "directives", "mask.js"),
    "utf8"
  );
  assert.match(src, /^export default function mask\(el, binding\)/m);
  assert.ok(
    !/\b(bind|inserted|componentUpdated|unbind)\s*\(/.test(
      src.replace(/\/\*[\s\S]*?\*\//g, "")
    ),
    "no Vue 2 directive hook names should appear"
  );
});

test("both mask call sites import the local directive", () => {
  const callers = [
    "src/components/vendor/SignupVendor.vue",
    "src/components/vendor/VendorProfile.vue",
  ];
  for (const f of callers) {
    const src = fs.readFileSync(path.join(__dirname, "..", f), "utf8");
    assert.match(src, /import mask from "\.\.\/\.\.\/directives\/mask"/, f);
    assert.ok(!/vue-the-mask/.test(src), `${f} still imports vue-the-mask`);
  }
});
