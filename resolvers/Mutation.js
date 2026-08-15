/**
 * Mutation resolvers.
 *
 * Was a single 3620-line file. Phase 3b split it into
 * resolvers/mutations/ by domain; this re-assembles the map so the schema and the
 * access-policy layer see exactly what they saw before.
 *
 * resolvers/auth/applyPolicy.js fails at boot if this map and the policy table
 * ever disagree, so a resolver lost or duplicated by a future move cannot ship.
 */
const auth = require("./mutations/auth");
const resident = require("./mutations/resident");
const guild = require("./mutations/guild");
const order = require("./mutations/order");
const flyer = require("./mutations/flyer");
const vendor = require("./mutations/vendor");
const messaging = require("./mutations/messaging");
const city = require("./mutations/city");

module.exports = {
  ...auth,
  ...resident,
  ...guild,
  ...order,
  ...flyer,
  ...vendor,
  ...messaging,
  ...city,
};
