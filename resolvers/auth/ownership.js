const { ForbiddenError } = require("apollo-server-express");

/**
 * Ownership and role enforcement (Phase 1b).
 *
 * Phase 1a proved *a* resident or vendor was calling. It did not prove *which*
 * one — every mutation still took identity from its arguments, so a signed-in
 * resident could pass someone else's residentId to updateProfile and reset
 * their password.
 *
 * Three mechanisms here, all declared in mutationPolicy.js rather than written
 * into resolver bodies:
 *
 *   own      — overwrite an identity argument with the value from the token.
 *              Substitution, not comparison: the client's value is discarded
 *              rather than checked, so there is nothing to get wrong and no
 *              error path to leak whether another account exists.
 *
 *   resource — for mutations that only take a record id (toggleGuildDealActive
 *              takes just dealId), load the record and compare an owner field
 *              against the caller.
 *
 *   role     — city governor / guild leader / guild member checks, derived from
 *              CityHall.governor and Guild.guildLeader, which the schema
 *              already has. No new role enum was introduced.
 */

// --- claim resolution ------------------------------------------------------

/**
 * Resolves a claim kind to the caller's real value. `residentId` / `vendorId`
 * need a lookup because the JWT carries name+email, not the ObjectId; the
 * result is memoised on the context for the life of the request.
 */
async function resolveClaim(kind, ctx) {
  const auth = ctx.auth;

  switch (kind) {
    case "residentName":
      return auth.residentName;
    case "email":
      return auth.email;
    case "businessTitle":
      return auth.businessTitle;
    case "principalName":
      return auth.tokenSign === "vendor" ? auth.businessTitle : auth.residentName;

    case "residentId": {
      if (auth.id) return auth.id;
      if (ctx._residentId) return ctx._residentId;
      const doc = await ctx.Resident.findOne({ email: auth.email }, { _id: 1 });
      if (!doc) throw new ForbiddenError("Your account no longer exists.");
      ctx._residentId = String(doc._id);
      return ctx._residentId;
    }

    case "vendorId": {
      if (auth.id) return auth.id;
      if (ctx._vendorId) return ctx._vendorId;
      const doc = await ctx.Vendor.findOne({ email: auth.email }, { _id: 1 });
      if (!doc) throw new ForbiddenError("Your account no longer exists.");
      ctx._vendorId = String(doc._id);
      return ctx._vendorId;
    }

    default:
      throw new Error(`[auth] unknown claim kind "${kind}"`);
  }
}

// --- dotted-path helpers ---------------------------------------------------
// Vendor identity often sits inside an input object (`input.businessTitle`),
// so paths must be able to reach one level in.

function getPath(obj, path) {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  let target = obj;
  for (const k of keys) {
    if (target[k] == null || typeof target[k] !== "object") return false;
    target = target[k];
  }
  target[last] = value;
  return true;
}

/**
 * Overwrites each declared identity argument with the caller's own value.
 * Returns a shallow-cloned args object; inputs are cloned one level deep so a
 * nested write does not mutate the caller's parsed variables.
 */
async function applyOwnership(ownSpec, args, ctx) {
  const next = { ...args };
  for (const path of Object.keys(ownSpec)) {
    const keys = path.split(".");
    if (keys.length > 1) {
      const root = keys[0];
      if (next[root] == null || typeof next[root] !== "object") continue;
      next[root] = { ...next[root] };
    }
    const value = await resolveClaim(ownSpec[path], ctx);
    if (getPath(next, path) !== undefined || keys.length === 1) {
      setPath(next, path, value);
    }
  }
  return next;
}

// --- resource ownership ----------------------------------------------------

async function assertResourceOwnership(spec, args, ctx) {
  const { model, idArg, field, claim } = spec;
  const Model = ctx[model];
  if (!Model) throw new Error(`[auth] model "${model}" is not on the context`);

  const id = getPath(args, idArg);
  if (!id) throw new ForbiddenError("Missing record identifier.");

  const doc = await Model.findOne({ _id: id });
  if (!doc) throw new ForbiddenError("That record does not exist.");

  const expected = await resolveClaim(claim, ctx);
  if (String(doc[field]) !== String(expected)) {
    throw new ForbiddenError("That record does not belong to you.");
  }
}

// --- role checks -----------------------------------------------------------

async function assertRole(spec, args, ctx) {
  const auth = ctx.auth;

  if (spec.kind === "governor") {
    // CityHall.governor is the game's existing city-administrator concept.
    const hall = await ctx.CityHall.findOne(
      spec.metroArg ? { metro: getPath(args, spec.metroArg) } : {}
    );
    if (!hall) throw new ForbiddenError("No city hall found.");
    if (hall.governor !== auth.residentName) {
      throw new ForbiddenError("Only the city governor may do that.");
    }
    return;
  }

  const key = getPath(args, spec.arg);
  if (!key) throw new ForbiddenError("Missing guild identifier.");
  const guild = await ctx.Guild.findOne(
    spec.by === "guildId" ? { _id: key } : { guildFullName: key }
  );
  if (!guild) throw new ForbiddenError("That guild does not exist.");

  if (spec.kind === "guildLeader") {
    if (guild.guildLeader !== auth.residentName) {
      throw new ForbiddenError("Only the guild leader may do that.");
    }
    return;
  }

  if (spec.kind === "guildMember") {
    const members = guild.guildMembers || [];
    const isMember =
      guild.guildLeader === auth.residentName ||
      members.some((m) => m && m.name === auth.residentName);
    if (!isMember) throw new ForbiddenError("You are not a member of that guild.");
    return;
  }

  throw new Error(`[auth] unknown role kind "${spec.kind}"`);
}

module.exports = {
  resolveClaim,
  applyOwnership,
  assertResourceOwnership,
  assertRole,
  getPath,
  setPath,
};
