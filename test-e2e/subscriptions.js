/**
 * Phase 3a: verify subscriptions work over graphql-ws end to end.
 *
 * Apollo Server 2's installSubscriptionHandlers spoke the legacy
 * subscriptions-transport-ws protocol. Phase 3a replaced it with graphql-ws on
 * both server and client, so this asserts the whole path: handshake, subscribe,
 * publish from a mutation over HTTP, delivery on the socket.
 *
 * Needs the server running (`npm run server`) and a reachable MONGO_URI.
 */
const path = require("path");
const ROOT = path.join(__dirname, "..");
const NM = path.join(ROOT, "node_modules");
const dep = (n) => require(path.join(NM, n));
dep("dotenv").config({ path: path.join(ROOT, "variables.env") });

const mongoose = dep("mongoose");
const { createClient } = dep("graphql-ws");
const WebSocket = dep("ws");
const Resident = require(path.join(ROOT, "models/Resident"));

const NAME = "__ugtest_ws";
const PASS = "TestPass!2345";
const API = "http://localhost:4000/graphql";

let pass = 0, fail = 0;
const check = (n, ok, d = "") => {
  if (ok) { pass++; console.log(`  PASS  ${n}`); }
  else { fail++; console.log(`  FAIL  ${n} ${d}`); }
};

async function gql(query, token) {
  const r = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:8080",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });
  return r.json();
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Resident.deleteMany({ residentName: NAME });
  await new Resident({
    residentName: NAME, email: `${NAME}@example.invalid`, password: PASS,
    firstName: "Ws", lastName: "Test", postalCode: "M5V3L9",
    emailVerified: true, silverCoins: 5000,
    location: { type: "Point", coordinates: [-79.3832, 43.6532] },
  }).save();

  try {
    const si = await gql(
      `mutation{ signinResident(email:"${NAME}@example.invalid", password:"${PASS}"){ token } }`
    );
    const token = si.data.signinResident.token;
    check("signed in over Apollo 4 HTTP", !!token);

    const client = createClient({
      url: "ws://localhost:4000/graphql",
      webSocketImpl: WebSocket,
      // graphql-ws connects lazily by default — it opens the socket on the
      // first subscribe. Disabled here so the handshake can be asserted on its
      // own, separately from message delivery.
      lazy: false,
      connectionParams: () => ({ Authorization: `Bearer ${token}` }),
    });

    // 1. the socket connects and completes the graphql-ws handshake
    const connected = await new Promise((res) => {
      const t = setTimeout(() => res(false), 8000);
      const un = client.on("connected", () => { clearTimeout(t); un(); res(true); });
    });
    check("graphql-ws handshake completed", connected);

    // 2. subscribe, then trigger the publish and wait for delivery
    const received = new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("timed out waiting for event")), 12000);
      client.subscribe(
        { query: `subscription{ residentSilverUpdated{ resident silver } }` },
        {
          next: (d) => { clearTimeout(t); res(d); },
          error: (e) => { clearTimeout(t); rej(e); },
          complete: () => {},
        }
      );
    });

    await new Promise((r) => setTimeout(r, 1500)); // let the subscription register
    await gql(`mutation{ updateResidentSliver(resident:"${NAME}", silver:7){ resident silver } }`, token);

    let evt = null;
    try { evt = await received; } catch (e) { evt = { error: e.message }; }

    check("subscription event delivered over graphql-ws",
      !!(evt && evt.data && evt.data.residentSilverUpdated),
      JSON.stringify(evt));
    if (evt && evt.data && evt.data.residentSilverUpdated) {
      check("event payload carries the pinned resident",
        evt.data.residentSilverUpdated.resident === NAME,
        JSON.stringify(evt.data.residentSilverUpdated));
    }

    await client.dispose();
  } finally {
    await Resident.deleteMany({ residentName: NAME });
    await mongoose.disconnect();
  }

  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR:", e.message); process.exit(1); });
