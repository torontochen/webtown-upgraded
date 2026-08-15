/**
 * Query resolvers.
 *
 * Was a single 1711-line file. Phase 3b split it into
 * resolvers/queries/ by domain; this re-assembles the map so the schema and the
 * access-policy layer see exactly what they saw before.
 *
 * resolvers/auth/applyPolicy.js fails at boot if this map and the policy table
 * ever disagree, so a resolver lost or duplicated by a future move cannot ship.
 */
const availability = require("./queries/availability");
const session = require("./queries/session");
const reference = require("./queries/reference");
const guild = require("./queries/guild");
const storefront = require("./queries/storefront");
const resident = require("./queries/resident");
const vendorops = require("./queries/vendorops");
const flyer = require("./queries/flyer");
const ai = require("./queries/ai");

module.exports = {
  ...availability,
  ...session,
  ...reference,
  ...guild,
  ...storefront,
  ...resident,
  ...vendorops,
  ...flyer,
  ...ai,
};
