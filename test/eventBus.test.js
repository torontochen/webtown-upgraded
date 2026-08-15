const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// src/eventBus.js is an ES module for the browser bundle. Rather than adding a
// transpile step to the test runner for one file, the class is evaluated
// directly — it has no imports, which is the point of the migration.
const SRC = fs.readFileSync(
  path.join(__dirname, "..", "src", "eventBus.js"),
  "utf8"
);
const classSrc = SRC.slice(SRC.indexOf("class EventBus"), SRC.indexOf("const bus ="));
const EventBus = eval(`(${classSrc.replace(/^class EventBus/, "class EventBus")})`);

test("emits to a listener with all arguments", () => {
  const b = new EventBus("t");
  const seen = [];
  b.$on("go", (a, c) => seen.push([a, c]));
  b.$emit("go", 1, 2);
  assert.deepEqual(seen, [[1, 2]]);
});

test("emitting an event with no listeners is a no-op", () => {
  const b = new EventBus("t");
  assert.doesNotThrow(() => b.$emit("nobody-listening", 1));
});

test("multiple listeners all fire, in registration order", () => {
  const b = new EventBus("t");
  const order = [];
  b.$on("go", () => order.push("first"));
  b.$on("go", () => order.push("second"));
  b.$emit("go");
  assert.deepEqual(order, ["first", "second"]);
});

test("$off(event, handler) removes just that handler", () => {
  const b = new EventBus("t");
  const kept = [];
  const drop = () => kept.push("dropped");
  const keep = () => kept.push("kept");
  b.$on("go", drop);
  b.$on("go", keep);
  b.$off("go", drop);
  b.$emit("go");
  assert.deepEqual(kept, ["kept"]);
});

test("$off(event) removes every listener for that event only", () => {
  const b = new EventBus("t");
  const seen = [];
  b.$on("a", () => seen.push("a"));
  b.$on("b", () => seen.push("b"));
  b.$off("a");
  b.$emit("a");
  b.$emit("b");
  assert.deepEqual(seen, ["b"]);
});

test("bare $off() clears every listener for every event", () => {
  // Vue 2 semantics, and the codebase relies on this in 22 places. If this
  // ever changes, components that call $off() in beforeDestroy would start
  // leaking listeners across route changes.
  const b = new EventBus("t");
  const seen = [];
  b.$on("a", () => seen.push("a"));
  b.$on("b", () => seen.push("b"));
  b.$off();
  b.$emit("a");
  b.$emit("b");
  assert.deepEqual(seen, []);
});

test("a listener that calls $off during dispatch does not break the chain", () => {
  const b = new EventBus("t");
  const seen = [];
  b.$on("go", () => { seen.push("first"); b.$off(); });
  b.$on("go", () => seen.push("second"));
  b.$emit("go");
  assert.deepEqual(seen, ["first", "second"], "dispatch iterates a copy");
});

test("one throwing listener does not stop the others", () => {
  const b = new EventBus("t");
  const seen = [];
  const originalError = console.error;
  console.error = () => {};
  try {
    b.$on("go", () => { throw new Error("boom"); });
    b.$on("go", () => seen.push("survived"));
    b.$emit("go");
  } finally {
    console.error = originalError;
  }
  assert.deepEqual(seen, ["survived"]);
});

test("the chainable API matches Vue 2 (returns the bus)", () => {
  const b = new EventBus("t");
  assert.equal(b.$on("x", () => {}), b);
  assert.equal(b.$emit("x"), b);
  assert.equal(b.$off("x"), b);
  assert.equal(b.$off(), b);
});

// --- migration invariants ---------------------------------------------------

test("no Vue-instance event buses remain in src/", () => {
  // `new Vue()` used as an event bus is the Vue 3 blocker this phase removes.
  const main = fs.readFileSync(
    path.join(__dirname, "..", "src", "main.js"),
    "utf8"
  );
  assert.ok(
    !/export const eventBus_\w+ = new Vue\(\)/.test(main),
    "main.js still declares a Vue-instance event bus"
  );
});

test("no component imports an event bus from main.js", () => {
  // That import was also circular: main.js -> App.vue -> main.js.
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    });

  const srcDir = path.join(__dirname, "..", "src");
  const offenders = walk(srcDir)
    .filter((p) => /\.(vue|js)$/.test(p) && !p.endsWith("main.js"))
    .filter((p) => {
      const s = fs.readFileSync(p, "utf8");
      return /import \{[^}]*eventBus_[^}]*\} from "[^"]*main(\.js)?"/.test(s);
    });

  assert.deepEqual(offenders, [], "these still import buses from main.js");
});
