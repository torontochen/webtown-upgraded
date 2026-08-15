const Query = require("./Query");
const Mutation = require("./Mutation");
const Subscription = require("./Subscription");

const { applyPolicy } = require("./auth/applyPolicy");
const { MUTATION_POLICY } = require("./auth/mutationPolicy");
const { QUERY_POLICY } = require("./auth/queryPolicy");

// Queries and mutations are wrapped with their access guards here rather than
// inline in the resolver files. Keeping the policy in two tables makes the whole
// authorization surface reviewable at a glance, and applyPolicy throws at
// startup if any resolver is missing an entry — so the default is deny.
//
// Subscriptions are not yet covered; see PROJECT_NOTES.md.
module.exports = {
  Query: applyPolicy(Query, QUERY_POLICY, "Query"),

  Mutation: applyPolicy(Mutation, MUTATION_POLICY, "Mutation"),

  Subscription,
};
