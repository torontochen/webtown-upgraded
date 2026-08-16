const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// src/utils/dateModel.js adapts Vuetify 3's v-date-picker to the YYYY-MM-DD
// string model the app stores and sends. It is an ES module for the browser
// bundle and has no imports, so it is evaluated here rather than transpiled.
const { toDateString, dateModel } = (() => {
  const src = fs
    .readFileSync(path.join(__dirname, "..", "src", "utils", "dateModel.js"), "utf8")
    .replace(/^export function /gm, "function ")
    .replace(/^export default [\s\S]*$/m, "");
  const module = { exports: {} };
  new Function("module", src + "\nmodule.exports = { toDateString, dateModel };")(module);
  return module.exports;
})();

test("a picked Date becomes the YYYY-MM-DD string the app stores", () => {
  assert.equal(toDateString(new Date(2025, 1, 28)), "2025-02-28");
  assert.equal(toDateString(new Date(2025, 11, 1)), "2025-12-01");
});

test("months and days are zero-padded", () => {
  // "2025-1-5" would sort wrongly and would not match the picker's own
  // min/max bounds, which are YYYY-MM-DD strings.
  assert.equal(toDateString(new Date(2025, 0, 5)), "2025-01-05");
});

test("null and invalid dates round-trip to null, not to a bogus string", () => {
  assert.equal(toDateString(null), null);
  assert.equal(toDateString(undefined), null);
  assert.equal(toDateString(""), null);
  assert.equal(toDateString(new Date("nonsense")), null);
});

test("the local components are read, not the UTC ones", () => {
  // This is the whole reason the model stayed a string. Vuetify's adapter
  // parses YYYY-MM-DD with parseLocalDate, so the Date it emits is *local*
  // midnight. Formatting it with toISOString() would move it back a day for
  // anyone east of UTC — a vendor in Sydney picking the 28th would store the
  // 27th. Reading the local components recovers the day that was clicked.
  const localMidnight = new Date(2025, 1, 28, 0, 0, 0);
  assert.equal(toDateString(localMidnight), "2025-02-28");

  // Same instant, expressed so that its UTC date differs from its local one
  // whenever the machine is not on UTC.
  const lateEvening = new Date(2025, 1, 28, 23, 30, 0);
  assert.equal(
    toDateString(lateEvening),
    "2025-02-28",
    "a late-evening pick must not roll over to the next day"
  );

  const earlyMorning = new Date(2025, 1, 28, 0, 30, 0);
  assert.equal(
    toDateString(earlyMorning),
    "2025-02-28",
    "an early-morning pick must not roll back to the previous day"
  );

  // The assertions above hold in every timezone, which is the point — but on a
  // UTC machine they would also pass with a toISOString() implementation, so
  // they would not be evidence. Where the offsets actually differ, show that
  // the naive implementation gets a different answer. Run the suite with
  // TZ=Australia/Sydney or TZ=America/Toronto to exercise this branch.
  // getTimezoneOffset() is minutes *behind* UTC, so it is negative east of it:
  // Sydney is -660, Toronto +300. East of UTC an early-morning local time falls
  // on the previous UTC day; west of it a late-evening one falls on the next.
  const offsetMinutes = localMidnight.getTimezoneOffset();
  if (offsetMinutes !== 0) {
    const naive = offsetMinutes < 0 ? earlyMorning : lateEvening;
    assert.notEqual(
      naive.toISOString().slice(0, 10),
      toDateString(naive),
      "expected toISOString() to disagree here — that disagreement is the bug this avoids"
    );
  }
});

test("the getter passes the stored string straight through", () => {
  // Vuetify's adapter accepts YYYY-MM-DD on the way in, so only the write
  // direction needs converting.
  const vm = { dateFrom: "2025-02-28" };
  const model = dateModel("dateFrom");
  assert.equal(model.get.call(vm), "2025-02-28");
});

test("the setter writes the string back onto the component property", () => {
  const vm = { dateFrom: null };
  const model = dateModel("dateFrom");
  model.set.call(vm, new Date(2025, 1, 28));
  assert.equal(vm.dateFrom, "2025-02-28");
  model.set.call(vm, null);
  assert.equal(vm.dateFrom, null);
});

test("every v-date-picker binds a dateModel computed, not a raw string", () => {
  // Binding the raw property would let Vuetify write a Date object into it,
  // which then goes over the wire where the schema says String.
  const vueFiles = (function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (e.name.endsWith(".vue")) out.push(p);
    }
    return out;
  })(path.join(__dirname, "..", "src"));

  const offenders = [];
  for (const f of vueFiles) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/<v-date-picker[\s\S]{0,400}?<\/v-date-picker>/g)) {
      const bind = m[0].match(/v-model="(\w+)"/);
      if (bind && !/Model$/.test(bind[1])) {
        offenders.push(`${path.relative(path.join(__dirname, ".."), f)}: v-model="${bind[1]}"`);
      }
      // Vuetify 3's picker declares only update:modelValue — @change is dead.
      if (/@change=/.test(m[0])) {
        offenders.push(`${path.relative(path.join(__dirname, ".."), f)}: @change on a v-date-picker never fires`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});
