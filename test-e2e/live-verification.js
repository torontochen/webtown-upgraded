/**
 * Phase 2.5 end-to-end verification against the live Atlas database.
 *
 * Creates two throwaway residents (prefixed __ugtest_), exercises the Phase
 * 1a-1c guards through the real HTTP + Apollo path with real signed-in tokens,
 * asserts on real database state, then deletes them. Existing records are only
 * ever read.
 */
const path = require("path");
const ROOT = path.join(__dirname, "..");
const NM = path.join(ROOT, "node_modules");
const dep = (n) => require(path.join(NM, n));
dep("dotenv").config({ path: path.join(ROOT, "variables.env") });
const mongoose = dep("mongoose");

const Resident = require(path.join(ROOT, "models/Resident"));
const Vendor = require(path.join(ROOT, "models/Vendor"));
const Guild = require(path.join(ROOT, "models/Guild"));

const API = "http://localhost:4000/graphql";
const A = "__ugtest_alpha";
const B = "__ugtest_bravo";
const PASS = "TestPass!2345";

let pass = 0, fail = 0;
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${detail}`); }
}

async function gql(query, token) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:8080",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

const errName = (r) => r.errors && r.errors[0] && r.errors[0].name;
const errMsg = (r) => (r.errors && r.errors[0] && r.errors[0].message) || "";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // --- seed ---------------------------------------------------------------
  await Resident.deleteMany({ residentName: { $in: [A, B] } });
  for (const name of [A, B]) {
    await new Resident({
      residentName: name,
      email: `${name}@example.invalid`,
      password: PASS,
      firstName: "Test",
      lastName: "User",
      postalCode: "M5V3L9",
      emailVerified: true,
      silverCoins: 100,
      location: { type: "Point", coordinates: [-79.3832, 43.6532] },
    }).save();
  }
  const a0 = await Resident.findOne({ residentName: A });
  const b0 = await Resident.findOne({ residentName: B });
  console.log(`seeded: ${A} (${a0._id})  ${B} (${b0._id})\n`);

  try {
    // --- sign in through the real path ------------------------------------
    console.log("SIGN-IN");
    const si = await gql(
      `mutation{ signinResident(email:"${A}@example.invalid", password:"${PASS}"){ token } }`
    );
    const token = si.data && si.data.signinResident && si.data.signinResident.token;
    check("resident can sign in and receive a token", !!token, JSON.stringify(si.errors || ""));
    if (!token) throw new Error("cannot continue without a token");

    const jwt = dep("jsonwebtoken");
    const claims = jwt.decode(token);
    check("token carries the account id claim (Phase 1b)", !!claims.id, JSON.stringify(claims));
    check("token has an expiry (Phase 1a)", !!claims.exp);

    // --- 1a: anonymous is rejected ----------------------------------------
    console.log("\nPHASE 1a — anonymous access");
    const anon = await gql(
      `mutation{ updateProfile(residentId:"${b0._id}", password:"pwned", pet:"Dog_Jason"){ residentName } }`
    );
    check("anonymous updateProfile rejected", errName(anon) === "AuthenticationError", errMsg(anon));

    const bAfterAnon = await Resident.findOne({ residentName: B });
    check("victim password hash unchanged after anonymous attempt",
      bAfterAnon.password === b0.password);

    // --- 1b: ownership ------------------------------------------------------
    console.log("\nPHASE 1b — ownership (signed in as alpha, targeting bravo)");
    const spoof = await gql(
      `mutation{ updateProfile(residentId:"${b0._id}", password:"pwned", residentName:"${B}", pet:"Dog_Jason", initialLat:43.6532, initialLng:-79.3832, birthday:"1990-01-01", nickName:"alpha", firstName:"Test", lastName:"User", postalCode:"M5V3L9", gender:"other"){ residentName } }`,
      token
    );
    const aAfter = await Resident.findOne({ residentName: A });
    const bAfter = await Resident.findOne({ residentName: B });

    check("bravo's password hash is UNCHANGED (account takeover closed)",
      bAfter.password === b0.password,
      bAfter.password === b0.password ? "" : "*** VICTIM PASSWORD WAS MODIFIED ***");
    check("alpha's own password hash DID change (substitution targeted the caller)",
      aAfter.password !== a0.password,
      JSON.stringify(spoof.errors || ""));
    check("alpha was NOT renamed (residentName pinned; governor claim closed)",
      aAfter.residentName === A, `residentName is now ${aAfter.residentName}`);

    // The escalation this closes: CityHall.governor names a resident that does
    // not exist, so before the fix any signed-in resident could claim it.
    const CityHall = require(path.join(ROOT, "models/CityHall"));
    const hall = await CityHall.findOne({});
    const claim = await gql(
      `mutation{ updateProfile(residentId:"${a0._id}", residentName:"${hall.governor}", pet:"Dog_Jason", initialLat:43.6532, initialLng:-79.3832, birthday:"1990-01-01", nickName:"a", firstName:"T", lastName:"U", postalCode:"M5V3L9", gender:"other"){ residentName } }`,
      token
    );
    const claimed = await Resident.findOne({ residentName: hall.governor });
    check("cannot claim the governor's residentName", !claimed,
      claimed ? "*** GOVERNOR NAME WAS CLAIMED ***" : "");

    // silver minting
    const b1 = await Resident.findOne({ residentName: B });
    await gql(`mutation{ crackEgg(resident:"${B}", silver:999999){ silver } }`, token);
    const b2 = await Resident.findOne({ residentName: B });
    const a2 = await Resident.findOne({ residentName: A });
    check("crackEgg did not credit bravo", b2.silverCoins === b1.silverCoins,
      `${b1.silverCoins} -> ${b2.silverCoins}`);
    check("crackEgg credited alpha instead", a2.silverCoins > 100, `alpha=${a2.silverCoins}`);

    const b3 = await Resident.findOne({ residentName: B });
    await gql(`mutation{ updateResidentSliver(resident:"${B}", silver:500000){ updated } }`, token);
    const b4 = await Resident.findOne({ residentName: B });
    check("updateResidentSliver did not credit bravo", b4.silverCoins === b3.silverCoins,
      `${b3.silverCoins} -> ${b4.silverCoins}`);

    // --- 1b: roles against real guild/cityhall -----------------------------
    console.log("\nPHASE 1b — roles (real guild + city hall data)");
    const guild = await Guild.findOne({ guildMembers: { $exists: true, $ne: [] } });
    if (guild) {
      const kick = await gql(
        `mutation{ kickGuildMember(guild:"${guild.guildFullName}", resident:"${guild.guildMembers[0].name}"){ name } }`,
        token
      );
      check(`non-leader cannot kick from real guild "${guild.guildFullName}"`,
        errName(kick) === "ForbiddenError", errMsg(kick));
      const stillThere = await Guild.findOne({ guildFullName: guild.guildFullName });
      check("guild membership unchanged",
        (stillThere.guildMembers || []).length === (guild.guildMembers || []).length);
    }

    const welfare = await gql(
      `mutation{ distributeWelfare(welfare:1, total:1, metro:"Great Toronto"){ distributed } }`,
      token
    );
    check("non-governor cannot distribute welfare",
      errName(welfare) === "ForbiddenError", errMsg(welfare));

    // --- 1b: cross-principal ------------------------------------------------
    const vend = await Vendor.findOne({});
    const asVendor = await gql(
      `mutation{ fulfill(vendor:"${vend.businessTitle}", orderNo:"x", fulfillNote:"n"){ note } }`,
      token
    );
    check("resident token rejected on a vendor-only mutation",
      errName(asVendor) === "ForbiddenError", errMsg(asVendor));

    // --- 1c: queries --------------------------------------------------------
    console.log("\nPHASE 1c — queries");
    // Phase 1c locked getResidentList to vendors and flagged it for deletion —
    // it dumped residentName + firstName + lastName for every resident and had
    // no caller anywhere in src/. Phase 5 removed it outright, so the check is
    // now that the field does not exist rather than that it rejects.
    const rl = await gql(`{ getResidentList { residentName firstName lastName } }`);
    check("getResidentList no longer exists in the schema at all",
      /Cannot query field "getResidentList"/.test(errMsg(rl)), errMsg(rl));

    const ai = await gql(`{ getAIResponse(prompt:[{role:"user",content:"hi"}]) { message } }`);
    check("anonymous getAIResponse rejected (was billable)",
      errName(ai) === "AuthenticationError", errMsg(ai));

    const boot = await gql(`{ getCurrentResident { residentName } }`);
    check("anonymous getCurrentResident still returns null (boot path intact)",
      !boot.errors && boot.data && boot.data.getCurrentResident === null,
      JSON.stringify(boot.errors || boot.data));

    const pets = await gql(`{ getPets { petName } }`);
    check("anonymous getPets still serves data (boot path intact)",
      !pets.errors && Array.isArray(pets.data.getPets), JSON.stringify(pets.errors || ""));

    const vsi = await gql(`{ getVendorSalesInfo(vendor:"${vend.businessTitle}"){ dailySales { __typename } } }`, token);
    check("resident cannot read vendor sales data",
      errName(vsi) === "ForbiddenError", errMsg(vsi));

    // --- tenantUri validation ------------------------------------------------
    console.log("\nPHASE 1b — connection-string validation");
    const inj = await gql(
      `{ getShoppingCart(resident:"x?authSource=admin&") { itemCode } }`, token
    );
    check("shopping cart pins resident, so the injected name never reaches the URI",
      !errMsg(inj).includes("authSource"), errMsg(inj));

  } finally {
    await Resident.deleteMany({ residentName: { $in: [A, B] } });
    const left = await Resident.countDocuments({ residentName: { $in: [A, B] } });
    console.log(`\ncleanup: test residents remaining = ${left}`);
    await mongoose.disconnect();
  }

  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR:", e.message); process.exit(1); });
