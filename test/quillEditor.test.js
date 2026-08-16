const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Phase 4b-3b replaced vue2-editor's <vue-editor> with src/components/
// QuillEditor.vue. The component's runtime behaviour was verified by mounting
// it in the live app (see PROJECT_NOTES); what is locked here is the source
// contract that a future edit could break silently.

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const EDITOR = read("src/components/QuillEditor.vue");
const CALLER = read("src/components/vendor/VendorFlyers.vue");

test("vue2-editor is gone from the source and from package.json", () => {
  const pkg = require(path.join(ROOT, "package.json"));
  assert.ok(!("vue2-editor" in pkg.dependencies));
  assert.ok(!/vue2-editor/.test(CALLER), "VendorFlyers.vue still imports it");
});

test("the editor drives the same Quill singleton as quill-setup", () => {
  // vue2-editor did `import Quill from "quill"` rather than bundling it, so
  // the custom font and size attributors VendorFlyers registers land on the
  // instance the editor uses. Two copies would silently lose those.
  assert.match(EDITOR, /^import Quill from "quill";$/m);
  assert.match(CALLER, /^import Quill from "\.\.\/\.\.\/quill-setup";$/m);
  assert.match(read("src/quill-setup.js"), /^import Quill from "quill";$/m);
});

test("Quill's stylesheet is imported, since vue2-editor no longer injects it", () => {
  assert.match(EDITOR, /import "quill\/dist\/quill\.snow\.css";/);
});

test("every prop the call site passes is declared", () => {
  const passed = [...CALLER.matchAll(/:([a-zA-Z]+)="[^"]*"/g)]
    .map((m) => m[1])
    .filter((p) =>
      ["editorOptions", "customModules", "editorToolbar", "disabled", "placeholder"].includes(p)
    );
  assert.ok(passed.length >= 5, `expected the editor props, saw ${passed}`);
  for (const prop of new Set(passed)) {
    assert.match(
      EDITOR,
      new RegExp(`^\\s*${prop}: \\{`, "m"),
      `QuillEditor.vue does not declare the ${prop} prop`
    );
  }
});

test("an empty document still emits \"\" rather than Quill's <p><br></p>", () => {
  // The flyer element must not be saved with a stray empty paragraph. This is
  // the one normalisation vue2-editor did that is easy to drop by accident.
  assert.match(EDITOR, /"<p><br><\/p>" \? "" : html/);
});

test("the component declares both Vue 2 and Vue 3 unmount hooks", () => {
  assert.match(EDITOR, /^\s*beforeDestroy\(\) \{/m);
  assert.match(EDITOR, /^\s*beforeUnmount\(\) \{/m);
});

test("the local Observer and editor are the only quill/observer entry points", () => {
  // Guards against a future edit reintroducing either package.
  const vueFiles = (function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (e.name.endsWith(".vue") || e.name.endsWith(".js")) out.push(p);
    }
    return out;
  })(path.join(ROOT, "src"));

  const banned = ["vue2-editor", "vue-intersection-observer", "vue-the-mask", "portal-vue"];
  const offenders = [];
  for (const f of vueFiles) {
    const src = fs
      .readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/<!--[\s\S]*?-->/g, "");
    for (const b of banned) {
      if (new RegExp(`from ["'][^"']*${b}`).test(src)) {
        offenders.push(`${path.relative(ROOT, f)}: ${b}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});
