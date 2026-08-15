const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGO_URI_PREFIX = "mongodb+srv://u:p@cluster.mongodb.net/";
process.env.MONGO_URI_SUFFIX = "?retryWrites=true&w=majority";

const { tenantUri } = require("../resolvers/tenantUri");

test("builds a URI for an ordinary name", () => {
  assert.equal(
    tenantUri("HonestBakery"),
    "mongodb+srv://u:p@cluster.mongodb.net/HonestBakery?retryWrites=true&w=majority"
  );
});

test("preserves the historical space and dot stripping", () => {
  // Existing databases were created from names normalised this way, so the
  // behaviour has to be kept or live data becomes unreachable.
  assert.equal(tenantUri("Honest Bakery"), tenantUri("HonestBakery"));
  assert.equal(tenantUri("Honest.Bakery"), tenantUri("HonestBakery"));
});

test("rejects a name that would redirect the connection", () => {
  // The suffix starts with "?", so an embedded "?" or "&" lets the caller
  // append or override connection options such as authSource.
  for (const bad of [
    "x?authSource=admin&",
    "x&w=0",
    "x/otherDatabase",
    "x@evil.example.com/",
    "admin?ssl=false",
  ]) {
    assert.throws(() => tenantUri(bad), /not allowed/i, `should reject: ${bad}`);
  }
});

test("rejects empty and non-string input", () => {
  assert.throws(() => tenantUri(""), /required/i);
  assert.throws(() => tenantUri(null), /required/i);
  assert.throws(() => tenantUri(undefined), /required/i);
  assert.throws(() => tenantUri({}), /required/i);
});

test("rejects a name that normalises to nothing", () => {
  assert.throws(() => tenantUri("   "), /not allowed/i);
  assert.throws(() => tenantUri("..."), /not allowed/i);
});

test("rejects an over-long name", () => {
  assert.throws(() => tenantUri("a".repeat(64)), /not allowed/i);
  assert.equal(typeof tenantUri("a".repeat(63)), "string");
});
