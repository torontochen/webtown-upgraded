const { GUARDS, PUBLIC } = require("./guards");

/**
 * Wraps a resolver map so every field runs its policy guard first.
 *
 * Fails closed in both directions, at boot rather than at request time:
 *   - a resolver with no policy entry  -> startup error
 *   - a policy entry with no resolver  -> startup error (catches typos and
 *     entries left behind after a rename)
 *
 * The guard's return value (the authenticated principal) is injected into the
 * context as `auth`, so resolvers can derive identity from the token instead of
 * from client-supplied arguments. Phase 1b converts resolvers over to it.
 */
function applyPolicy(resolverMap, policy, label) {
  const resolverNames = Object.keys(resolverMap);
  const policyNames = Object.keys(policy);

  const unguarded = resolverNames.filter((n) => !(n in policy));
  if (unguarded.length) {
    throw new Error(
      `[auth] ${label}: no access policy for ${unguarded.length} resolver(s): ` +
        `${unguarded.join(", ")}. Add an entry to mutationPolicy.js — the ` +
        `default is deny, so this must be explicit.`
    );
  }

  const orphaned = policyNames.filter((n) => !(n in resolverMap));
  if (orphaned.length) {
    throw new Error(
      `[auth] ${label}: policy names ${orphaned.length} resolver(s) that do ` +
        `not exist: ${orphaned.join(", ")}. Remove the stale entries.`
    );
  }

  const guarded = {};
  for (const name of resolverNames) {
    const policyName = policy[name];
    const guard = GUARDS[policyName];

    if (!guard) {
      throw new Error(
        `[auth] ${label}.${name}: unknown policy "${policyName}".`
      );
    }

    if (policyName === PUBLIC) {
      guarded[name] = resolverMap[name];
      continue;
    }

    const original = resolverMap[name];
    guarded[name] = (parent, args, context, info) => {
      const principal = guard(context);
      return original(parent, args, { ...context, auth: principal }, info);
    };
  }

  return guarded;
}

module.exports = { applyPolicy };
