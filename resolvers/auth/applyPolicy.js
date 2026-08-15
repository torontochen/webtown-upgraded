const { GUARDS, PUBLIC } = require("./guards");
const {
  applyOwnership,
  assertResourceOwnership,
  assertRole,
} = require("./ownership");

const VALID_KEYS = new Set([
  "policy",
  "own",
  "resource",
  "role",
  "orderParty",
]);

function normalize(entry) {
  return typeof entry === "string" ? { policy: entry } : entry;
}

/**
 * For the order-state mutations (cancel / confirm / dispute) and
 * savePrepaidVendorItem, both a `vendor` and a `resident` argument are present
 * and either principal may legitimately call. Pin whichever side corresponds to
 * the caller's token and leave the counterparty as supplied.
 */
async function applyOrderParty(args, ctx) {
  const auth = ctx.auth;
  const next = { ...args };
  if (auth.tokenSign === "vendor") {
    next.vendor = auth.businessTitle;
  } else {
    next.resident = auth.residentName;
  }
  return next;
}

/**
 * Wraps a resolver map so every field runs its policy guard, identity
 * substitution, and role/resource checks before the resolver body executes.
 *
 * Fails closed at boot rather than at request time:
 *   - a resolver with no policy entry  -> startup error
 *   - a policy entry with no resolver  -> startup error (catches renames)
 *   - an unknown policy or unknown key -> startup error
 */
function applyPolicy(resolverMap, policy, label) {
  const resolverNames = Object.keys(resolverMap);
  const policyNames = Object.keys(policy);

  const policyFile = `${label.toLowerCase()}Policy.js`;

  const unguarded = resolverNames.filter((n) => !(n in policy));
  if (unguarded.length) {
    throw new Error(
      `[auth] ${label}: no access policy for ${unguarded.length} resolver(s): ` +
        `${unguarded.join(", ")}. Add an entry to ${policyFile} — the ` +
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
    const entry = normalize(policy[name]);

    for (const key of Object.keys(entry)) {
      if (!VALID_KEYS.has(key)) {
        throw new Error(
          `[auth] ${label}.${name}: unknown policy key "${key}". ` +
            `Valid keys: ${[...VALID_KEYS].join(", ")}.`
        );
      }
    }

    const guard = GUARDS[entry.policy];
    if (!guard) {
      throw new Error(
        `[auth] ${label}.${name}: unknown policy "${entry.policy}".`
      );
    }

    const original = resolverMap[name];

    if (entry.policy === PUBLIC) {
      guarded[name] = original;
      continue;
    }

    guarded[name] = async (parent, args, context, info) => {
      const principal = guard(context);
      const ctx = { ...context, auth: principal };

      let nextArgs = args;
      if (entry.own) nextArgs = await applyOwnership(entry.own, nextArgs, ctx);
      if (entry.orderParty) nextArgs = await applyOrderParty(nextArgs, ctx);
      if (entry.resource) await assertResourceOwnership(entry.resource, nextArgs, ctx);
      if (entry.role) await assertRole(entry.role, nextArgs, ctx);

      return original(parent, nextArgs, ctx, info);
    };
  }

  return guarded;
}

module.exports = { applyPolicy };
