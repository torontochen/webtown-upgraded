const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { applyPolicy } = require("../resolvers/auth/applyPolicy");
const { QUERY_POLICY } = require("../resolvers/auth/queryPolicy");
const { PUBLIC } = require("../resolvers/auth/guards");

const resident = {
  tokenSign: "resident",
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  residentName: "Attacker",
  email: "a@x.com",
};
const vendor = {
  tokenSign: "vendor",
  id: "cccccccccccccccccccccccc",
  businessTitle: "Honest Bakery",
  email: "b@x.com",
};

async function argsSeenBy(name, args, auth, extra = {}) {
  let seen;
  const guarded = applyPolicy(
    { [name]: async (_p, a) => { seen = a; return true; } },
    { [name]: QUERY_POLICY[name] },
    "Query"
  );
  await guarded[name](null, args, { currentUser: auth, ...extra }, {});
  return seen;
}

function rejectsAnonymously(name, args = {}) {
  const guarded = applyPolicy(
    { [name]: async () => true },
    { [name]: QUERY_POLICY[name] },
    "Query"
  );
  return assert.rejects(
    () => guarded[name](null, args, { currentUser: null }, {}),
    /must be signed in/i
  );
}

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

test("every query resolver has an explicit policy entry", () => {
  const Query = require("../resolvers/Query");
  const missing = Object.keys(Query).filter((n) => !(n in QUERY_POLICY));
  assert.deepEqual(missing, [], `unguarded queries: ${missing.join(", ")}`);
});

test("no query policy entry refers to a resolver that no longer exists", () => {
  const Query = require("../resolvers/Query");
  const orphans = Object.keys(QUERY_POLICY).filter((n) => !(n in Query));
  assert.deepEqual(orphans, [], `stale entries: ${orphans.join(", ")}`);
});

// ---------------------------------------------------------------------------
// The boot constraint — guarding these breaks the app for anonymous visitors
// ---------------------------------------------------------------------------

test("every query dispatched at app boot is still public", () => {
  // src/main.js fires these just before app.mount(), before sign-in. If one of
  // them ever becomes guarded, an anonymous page load errors out.
  //
  // Phase 4c changed the call form: Vuex's store.dispatch("getPets") is now a
  // plain Pinia method call, store.getPets(). Only the names matter here.
  const mainJs = fs.readFileSync(
    path.join(__dirname, "..", "src", "main.js"),
    "utf8"
  );
  const dispatched = [
    ...mainJs.replace(/^\s*\/\/.*$/gm, "").matchAll(/^store\.(\w+)\(/gm),
  ].map((m) => m[1]);

  // Map the store action names that differ from the query name.
  const actionToQuery = {
    checkSavedFingerPrint: "checkSavedFingerPrint",
    getCurrentResident: "getCurrentResident",
    getCurrentVendor: "getCurrentVendor",
  };

  const bootQueries = dispatched
    .map((a) => actionToQuery[a] || a)
    .filter((n) => n in QUERY_POLICY);

  assert.ok(bootQueries.length >= 15, "expected the boot query set to be found");

  for (const name of bootQueries) {
    assert.equal(
      QUERY_POLICY[name],
      PUBLIC,
      `${name} runs at app boot before sign-in and must stay PUBLIC`
    );
  }
});

test("session probes stay public so anonymous page loads work", () => {
  // These return null when there is no currentUser; that is how the client
  // decides whether to render a signed-in UI.
  assert.equal(QUERY_POLICY.getCurrentResident, PUBLIC);
  assert.equal(QUERY_POLICY.getCurrentVendor, PUBLIC);
});

// ---------------------------------------------------------------------------
// The disclosures this phase closed
// ---------------------------------------------------------------------------

test("getResidentList is gone entirely", () => {
  // Phase 1c locked it to vendors and flagged it for deletion: it returned
  // residentName + firstName + lastName for every resident, and had no caller
  // anywhere in src/. Phase 5 deleted the resolver, the policy entry, the
  // schema field and the ResidentListItem type. Deleting an endpoint beats
  // guarding one.
  assert.ok(!("getResidentList" in QUERY_POLICY), "policy entry still present");
  const schema = fs.readFileSync(
    path.join(__dirname, "..", "typeDefs.gql"),
    "utf8"
  );
  assert.ok(!/getResidentList/.test(schema), "schema field still present");
  assert.ok(!/ResidentListItem/.test(schema), "ResidentListItem type still present");
});

test("getAIResponse is no longer anonymously callable", async () => {
  // Billed the project's OpenAI key from a client-supplied prompt.
  await rejectsAnonymously("getAIResponse", { prompt: [] });
});

test("resident order history is scoped to the caller", async () => {
  await rejectsAnonymously("getResidentOrders", { resident: "Victim" });
  const seen = await argsSeenBy("getResidentOrders", { resident: "Victim" }, resident);
  assert.equal(seen.resident, "Attacker");
});

test("shopping carts are scoped to the caller", async () => {
  const seen = await argsSeenBy("getShoppingCart", { resident: "Victim" }, resident);
  assert.equal(seen.resident, "Attacker");
});

test("vendor sales and settlement data are scoped to the calling vendor", async () => {
  for (const q of ["getVendorSalesInfo", "getVendorSettlementRecords", "getVendorOrders"]) {
    const seen = await argsSeenBy(q, { vendor: "Rival Bakery" }, vendor);
    assert.equal(seen.vendor, "Honest Bakery", `${q} must pin the vendor`);
  }
});

test("a resident cannot read vendor-owned data", async () => {
  const guarded = applyPolicy(
    { getVendorSalesInfo: async () => true },
    { getVendorSalesInfo: QUERY_POLICY.getVendorSalesInfo },
    "Query"
  );
  await assert.rejects(
    () => guarded.getVendorSalesInfo(null, { vendor: "X" }, { currentUser: resident }, {}),
    /only available to vendors/i
  );
});

test("guild chat requires membership of that guild", async () => {
  const Guild = {
    findOne: async () => ({
      guildFullName: "Iron Wolves",
      guildLeader: "TheLeader",
      guildMembers: [{ name: "Member" }],
    }),
  };
  await assert.rejects(
    () => argsSeenBy("getGuildChatMessages", { guildFullName: "Iron Wolves" }, resident, { Guild }),
    /not a member of that guild/i
  );

  const member = { ...resident, residentName: "Member" };
  const seen = await argsSeenBy(
    "getGuildChatMessages",
    { guildFullName: "Iron Wolves" },
    member,
    { Guild }
  );
  assert.equal(seen.guildFullName, "Iron Wolves");
});

test("vendor design assets are scoped to the owning vendor", async () => {
  for (const q of ["getSketchList", "getFlyerList", "getTemplateList", "getAllItemsCatalog"]) {
    const seen = await argsSeenBy(q, { businessTitle: "Rival Bakery" }, vendor);
    assert.equal(seen.businessTitle, "Honest Bakery", `${q} must pin businessTitle`);
  }
});

// ---------------------------------------------------------------------------
// Regression guard
// ---------------------------------------------------------------------------

test("queries returning personal or billable data are never public", () => {
  const mustNotBePublic = [
    "getResidentOrders", "getShoppingCart", "getGeoLocation",
    "getAIResponse", "getVendorOrders", "getVendorSalesInfo",
    "getVendorSettlementRecords", "getVendorCheckoutInfos",
    "getTargetDistributeResident", "getGuildChatMessages",
  ];
  for (const name of mustNotBePublic) {
    const entry = QUERY_POLICY[name];
    const policy = typeof entry === "string" ? entry : entry.policy;
    assert.notEqual(policy, PUBLIC, `${name} must not be public`);
  }
});
