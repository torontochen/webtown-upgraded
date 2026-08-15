const Query = require("./Query");
const Mutation = require("./Mutation");
const Subscription = require("./Subscription");

const { applyPolicy } = require("./auth/applyPolicy");
const { MUTATION_POLICY } = require("./auth/mutationPolicy");

// Every mutation is wrapped with its access guard here rather than inline in
// Mutation.js. Keeping the policy in one table makes the whole authorization
// surface reviewable at a glance, and applyPolicy throws at startup if any
// mutation is missing an entry — so the default is deny, not allow.
module.exports = {
  Query,

  Mutation: applyPolicy(Mutation, MUTATION_POLICY, "Mutation"),

  Subscription,
};
