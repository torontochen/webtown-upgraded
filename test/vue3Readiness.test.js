const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Vue 3 is not incrementally adoptable: the framework swap in 4b-4 either works
// or the app renders nothing. So each blocker is removed ahead of the flip in a
// commit that still runs on Vue 2, and locked here so it cannot creep back in
// between now and then.
//
// Filters are covered separately in filters.test.js.

const SRC = path.join(__dirname, "..", "src");

const vueFiles = (function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".vue")) out.push(p);
  }
  return out;
})(SRC);

const read = (f) => fs.readFileSync(f, "utf8");
const rel = (f) => path.relative(path.join(__dirname, ".."), f);

// Comments discuss these APIs by name — including the ones in this repo
// explaining why a `.native` is still load-bearing — so they are stripped
// before scanning. Only real code counts.
const stripComments = (src) =>
  src
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

test("no .sync modifier remains (Vue 3 removed it)", () => {
  // Rewritten in 4b-2 as an explicit `:prop` + `@update:prop` pair, which is
  // what .sync compiled to anyway and is valid in both Vue 2 and Vue 3.
  const offenders = vueFiles.filter((f) => /\.sync=/.test(read(f))).map(rel);
  assert.deepEqual(offenders, []);
});

test("every :prop/@update:prop pair targets the kebab-case event Vuetify emits", () => {
  // Vuetify 2 emits `update:items-per-page`, not `update:itemsPerPage`. Getting
  // this wrong is silent — the prop still renders, it just never writes back.
  for (const f of vueFiles) {
    for (const m of read(f).matchAll(/@update:([a-zA-Z0-9-]+)=/g)) {
      assert.ok(
        !/[A-Z]/.test(m[1]),
        `${rel(f)} listens for @update:${m[1]}; Vuetify emits the kebab-case name`
      );
    }
  }
});

test(".native is gone entirely", () => {
  // 4b-2 removed every .native it could on Vue 2 and left four that were
  // load-bearing: one router-link, three vue-draggable-resizable. Vue 3 removes
  // the modifier outright and both of those now forward listeners, so 4b-4
  // took the last four.
  const offenders = vueFiles
    .map((f) => [rel(f), (stripComments(read(f)).match(/\.native=/g) || []).length])
    .filter(([, n]) => n > 0);
  assert.deepEqual(offenders, []);
});


test("no Vue 2 API that Vue 3 removed outright is in use", () => {
  // `new Vue(` is deliberately not on this list: the root instance in main.js
  // is legitimate under Vue 2 and becomes createApp() at the flip. The event
  // bus instances Phase 4a-i removed are locked by eventBus.test.js instead.
  const banned = [
    [/\bfilters\s*:\s*\{/, "the `filters` component option"],
    [/\$scopedSlots\b/, "$scopedSlots"],
    [/\$listeners\b/, "$listeners"],
    [/\$children\b/, "$children"],
    [/\bslot-scope=/, "slot-scope"],
    [/\.keyCode\b/, "keyCode event modifiers"],
  ];
  const jsFiles = (function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (e.name.endsWith(".js")) out.push(p);
    }
    return out;
  })(SRC);

  const offenders = [];
  for (const f of [...vueFiles, ...jsFiles]) {
    const src = stripComments(read(f));
    for (const [re, label] of banned) {
      if (re.test(src)) offenders.push(`${rel(f)}: ${label}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("portal-vue is gone from both the entry point and package.json", () => {
  const main = read(path.join(SRC, "main.js"));
  assert.ok(!/portal-vue|PortalVue/.test(main));
  const pkg = require(path.join(__dirname, "..", "package.json"));
  assert.ok(
    !("portal-vue" in pkg.dependencies),
    "portal-vue had no <portal> tag anywhere and was removed in 4b-2"
  );
});
