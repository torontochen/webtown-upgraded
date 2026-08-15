const test = require("node:test");
const assert = require("node:assert/strict");

const { applyPolicy } = require("../resolvers/auth/applyPolicy");
const { MUTATION_POLICY } = require("../resolvers/auth/mutationPolicy");
const { applyOwnership } = require("../resolvers/auth/ownership");
const { RESIDENT, VENDOR, AUTHENTICATED } = require("../resolvers/auth/guards");

// --- fakes -----------------------------------------------------------------

const ATTACKER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const VICTIM_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

const attacker = {
  tokenSign: "resident",
  id: ATTACKER_ID,
  residentName: "Attacker",
  email: "attacker@x.com",
};
const vendorAuth = {
  tokenSign: "vendor",
  id: "cccccccccccccccccccccccc",
  businessTitle: "Honest Bakery",
  email: "bakery@x.com",
};

function ctxWith(auth, extra = {}) {
  return { currentUser: auth, ...extra };
}

/** Runs one real policy entry against a spy resolver and returns the args it saw. */
async function argsSeenBy(name, args, auth, extra = {}) {
  let seen;
  const guarded = applyPolicy(
    { [name]: async (_p, a) => { seen = a; return true; } },
    { [name]: MUTATION_POLICY[name] },
    "Mutation"
  );
  await guarded[name](null, args, ctxWith(auth, extra), {});
  return seen;
}

// --- the original exploits -------------------------------------------------

test("updateProfile cannot target another resident's account", async () => {
  // The original hole: any caller passed a residentId and the resolver rewrote
  // that account's bcrypt hash. Now the id is replaced with the caller's own.
  const seen = await argsSeenBy(
    "updateProfile",
    { residentId: VICTIM_ID, password: "hacked" },
    attacker
  );
  assert.equal(seen.residentId, ATTACKER_ID, "residentId must be pinned to the caller");
  assert.notEqual(seen.residentId, VICTIM_ID);
});

test("updateProfile cannot rename the caller (privilege-escalation path)", async () => {
  // residentName is the per-tenant database name, the guild foreign key, and
  // the value CityHall.governor is compared against. Pinning only residentId
  // still allowed a rename to any unused name — and CityHall.governor pointed
  // at a name no Resident held, so it was claimable, yielding the governor role
  // and distributeWelfare. Found by the Phase 2.5 run against live data.
  const seen = await argsSeenBy(
    "updateProfile",
    { residentId: VICTIM_ID, residentName: "[Toronto Glory]Weir", password: "x" },
    attacker
  );
  assert.equal(seen.residentId, ATTACKER_ID);
  assert.equal(seen.residentName, "Attacker", "residentName must be pinned too");
});

test("updateVendorProfile cannot rename the calling vendor", async () => {
  const seen = await argsSeenBy(
    "updateVendorProfile",
    { email: "victim@x.com", businessTitle: "Rival Bakery" },
    vendorAuth
  );
  assert.equal(seen.email, "bakery@x.com");
  assert.equal(seen.businessTitle, "Honest Bakery");
});

test("every mutation that writes an identity key pins that key", () => {
  // The dangerous shape is filtering on one identity field while writing
  // another. These five were found by scanning $set blocks in Mutation.js.
  const writesIdentity = {
    updateProfile: "residentName",
    updateVendorProfile: "businessTitle",
    feedPet: "residentName",
    distributeFlyer: "input.businessTitle",
    targetDistribute: "input.businessTitle",
  };
  for (const [name, key] of Object.entries(writesIdentity)) {
    const entry = MUTATION_POLICY[name];
    assert.ok(entry.own && key in entry.own, `${name} must pin ${key}`);
  }
});

test("crackEgg cannot mint silver into someone else's balance", async () => {
  const seen = await argsSeenBy(
    "crackEgg",
    { resident: "Victim", silver: 999999 },
    attacker
  );
  assert.equal(seen.resident, "Attacker");
});

test("updateResidentSliver cannot credit another account", async () => {
  const seen = await argsSeenBy(
    "updateResidentSliver",
    { resident: "Victim", silver: 500000 },
    attacker
  );
  assert.equal(seen.resident, "Attacker");
});

test("placeOrder cannot be placed in another resident's name", async () => {
  const seen = await argsSeenBy(
    "placeOrder",
    { resident: "Victim", vendor: "Honest Bakery", totalAmount: 1 },
    attacker
  );
  assert.equal(seen.resident, "Attacker");
});

test("sendMessage cannot spoof the sender", async () => {
  const asResident = await argsSeenBy(
    "sendMessage",
    { sender: "SomeoneElse", receiver: "Bob", text: "hi" },
    attacker
  );
  assert.equal(asResident.sender, "Attacker");

  const asVendor = await argsSeenBy(
    "sendMessage",
    { sender: "SomeoneElse", receiver: "Bob", text: "hi" },
    vendorAuth
  );
  assert.equal(asVendor.sender, "Honest Bakery", "principalName follows the token kind");
});

// --- vendor identity inside input objects ----------------------------------

test("vendor identity nested in an input object is pinned", async () => {
  const seen = await argsSeenBy(
    "saveFlyer",
    { input: { businessTitle: "Rival Bakery", title: "Sale" } },
    vendorAuth
  );
  assert.equal(seen.input.businessTitle, "Honest Bakery");
  assert.equal(seen.input.title, "Sale", "other input fields are untouched");
});

test("substitution does not mutate the caller's original args object", async () => {
  const original = { input: { businessTitle: "Rival Bakery" } };
  await argsSeenBy("saveFlyer", original, vendorAuth);
  assert.equal(
    original.input.businessTitle,
    "Rival Bakery",
    "the caller's parsed variables must not be mutated in place"
  );
});

test("fulfill cannot fulfil another vendor's order", async () => {
  const seen = await argsSeenBy(
    "fulfill",
    { vendor: "Rival Bakery", orderNo: "SO-1" },
    vendorAuth
  );
  assert.equal(seen.vendor, "Honest Bakery");
});

// --- order-party pinning ---------------------------------------------------

test("order mutations pin the acting side to the caller's token", async () => {
  const asResident = await argsSeenBy(
    "cancel",
    { vendor: "Honest Bakery", resident: "Victim", orderNo: "SO-1" },
    attacker
  );
  assert.equal(asResident.resident, "Attacker", "resident side pinned");
  assert.equal(asResident.vendor, "Honest Bakery", "counterparty left alone");

  const asVendor = await argsSeenBy(
    "cancel",
    { vendor: "Rival Bakery", resident: "Someone", orderNo: "SO-1" },
    vendorAuth
  );
  assert.equal(asVendor.vendor, "Honest Bakery", "vendor side pinned");
  assert.equal(asVendor.resident, "Someone", "counterparty left alone");
});

// --- role checks -----------------------------------------------------------

test("distributeWelfare requires the city governor", async () => {
  const CityHall = { findOne: async () => ({ governor: "TheMayor", metro: "GTA" }) };

  await assert.rejects(
    () => argsSeenBy("distributeWelfare", { welfare: 1, total: 1, metro: "GTA" }, attacker, { CityHall }),
    /only the city governor/i
  );

  const mayor = { ...attacker, residentName: "TheMayor" };
  const seen = await argsSeenBy(
    "distributeWelfare",
    { welfare: 1, total: 1, metro: "GTA" },
    mayor,
    { CityHall }
  );
  assert.equal(seen.welfare, 1, "the governor is allowed through");
});

test("guild management requires the guild leader", async () => {
  const Guild = {
    findOne: async () => ({
      guildFullName: "Iron Wolves",
      guildLeader: "TheLeader",
      guildMembers: [{ name: "Attacker", rank: 1 }],
    }),
  };

  // A rank-1 member of the guild is still not the leader.
  await assert.rejects(
    () => argsSeenBy("kickGuildMember", { guild: "Iron Wolves", resident: "Someone" }, attacker, { Guild }),
    /only the guild leader/i
  );

  const leader = { ...attacker, residentName: "TheLeader" };
  const seen = await argsSeenBy(
    "kickGuildMember",
    { guild: "Iron Wolves", resident: "Someone" },
    leader,
    { Guild }
  );
  assert.equal(seen.resident, "Someone");
});

test("commitGuildDeals requires membership of the named guild", async () => {
  const Guild = {
    findOne: async () => ({
      guildFullName: "Iron Wolves",
      guildLeader: "TheLeader",
      guildMembers: [{ name: "Member", rank: 1 }],
    }),
  };

  await assert.rejects(
    () => argsSeenBy("commitGuildDeals", { input: { guildFullName: "Iron Wolves", guildDealIds: [] } }, attacker, { Guild }),
    /not a member of that guild/i
  );

  const member = { ...attacker, residentName: "Member" };
  const seen = await argsSeenBy(
    "commitGuildDeals",
    { input: { guildFullName: "Iron Wolves", guildDealIds: [] } },
    member,
    { Guild }
  );
  assert.equal(seen.input.guildFullName, "Iron Wolves");
});

// --- resource ownership ----------------------------------------------------

test("toggleGuildDealActive rejects a deal belonging to another vendor", async () => {
  const GuildDeal = { findOne: async () => ({ _id: "d1", vendor: "Rival Bakery" }) };
  await assert.rejects(
    () => argsSeenBy("toggleGuildDealActive", { dealId: "d1", isActive: false }, vendorAuth, { GuildDeal }),
    /does not belong to you/i
  );
});

test("toggleGuildDealActive allows the owning vendor", async () => {
  const GuildDeal = { findOne: async () => ({ _id: "d1", vendor: "Honest Bakery" }) };
  const seen = await argsSeenBy(
    "toggleGuildDealActive",
    { dealId: "d1", isActive: false },
    vendorAuth,
    { GuildDeal }
  );
  assert.equal(seen.dealId, "d1");
});

test("a missing record is rejected rather than passed through", async () => {
  const GuildDeal = { findOne: async () => null };
  await assert.rejects(
    () => argsSeenBy("toggleGuildDealActive", { dealId: "nope", isActive: true }, vendorAuth, { GuildDeal }),
    /does not exist/i
  );
});

// --- claim resolution ------------------------------------------------------

test("residentId falls back to a lookup when the token predates the id claim", async () => {
  // Tokens issued before Phase 1b carry no `id`. They must still resolve, or
  // every in-flight session would break on upgrade.
  const legacy = { tokenSign: "resident", residentName: "Old", email: "old@x.com" };
  const Resident = { findOne: async () => ({ _id: VICTIM_ID }) };
  const seen = await argsSeenBy(
    "updateProfile",
    { residentId: "whatever", password: "x" },
    legacy,
    { Resident }
  );
  assert.equal(seen.residentId, VICTIM_ID);
});

test("a deleted account is rejected during claim resolution", async () => {
  const legacy = { tokenSign: "resident", residentName: "Gone", email: "gone@x.com" };
  const Resident = { findOne: async () => null };
  await assert.rejects(
    () => argsSeenBy("updateProfile", { residentId: "x" }, legacy, { Resident }),
    /no longer exists/i
  );
});

// --- policy hygiene --------------------------------------------------------

test("applyPolicy rejects an unknown policy key at boot", () => {
  assert.throws(
    () => applyPolicy({ a: () => {} }, { a: { policy: RESIDENT, ownr: {} } }, "Mutation"),
    /unknown policy key "ownr"/
  );
});

test("every privileged mutation carries ownership, a role, or a resource check", () => {
  // Guards alone are not enough for anything that names a principal in its
  // arguments. This is the list that must not silently regress.
  const mustBeConstrained = [
    "updateProfile", "updateVendorProfile", "crackEgg", "updateResidentSliver",
    "placeOrder", "prepay", "distributeWelfare", "kickGuildMember",
    "promoteGuildMember", "rewardGuildMember", "transferGuildLeadership",
    "toggleGuildDealActive", "fulfill", "sendMessage",
  ];
  for (const name of mustBeConstrained) {
    const e = MUTATION_POLICY[name];
    const hasConstraint =
      typeof e === "object" && (e.own || e.role || e.resource || e.orderParty);
    assert.ok(hasConstraint, `${name} has only a coarse guard`);
  }
});

test("dotted-path substitution leaves unrelated roots alone", async () => {
  const ctx = { auth: vendorAuth };
  const out = await applyOwnership(
    { "input.businessTitle": "businessTitle" },
    { input: { businessTitle: "X", keep: 1 }, other: { businessTitle: "Y" } },
    ctx
  );
  assert.equal(out.input.businessTitle, "Honest Bakery");
  assert.equal(out.input.keep, 1);
  assert.equal(out.other.businessTitle, "Y", "only the declared path is rewritten");
});
