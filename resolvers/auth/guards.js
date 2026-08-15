const { AuthenticationError, ForbiddenError } = require("../errors");

/**
 * Guards for GraphQL resolvers.
 *
 * Context building (see `getUser` in server.js) is deliberately permissive: an
 * absent, malformed, or expired token yields `currentUser === null` rather than
 * throwing. Enforcement happens here instead. That split matters — when the
 * context builder threw, an expired token in localStorage made *every*
 * operation fail, including `signinResident`, so a user with a stale token
 * could not sign back in.
 *
 * Each guard returns the authenticated principal so callers can use it as the
 * source of identity instead of trusting client-supplied arguments.
 */

const PUBLIC = "public";
const RESIDENT = "resident";
const VENDOR = "vendor";
const AUTHENTICATED = "authenticated";

/** No token required. Reserved for signup/signin. */
const allowPublic = () => null;

/** Any signed-in principal — resident or vendor. */
const requireAuth = (ctx) => {
  const user = ctx && ctx.currentUser;
  if (!user) {
    throw new AuthenticationError("You must be signed in to do that.");
  }
  return user;
};

/** A signed-in resident specifically. */
const requireResident = (ctx) => {
  const user = requireAuth(ctx);
  if (user.tokenSign !== RESIDENT) {
    throw new ForbiddenError("This action is only available to residents.");
  }
  return user;
};

/** A signed-in vendor specifically. */
const requireVendor = (ctx) => {
  const user = requireAuth(ctx);
  if (user.tokenSign !== VENDOR) {
    throw new ForbiddenError("This action is only available to vendors.");
  }
  return user;
};

const GUARDS = {
  [PUBLIC]: allowPublic,
  [RESIDENT]: requireResident,
  [VENDOR]: requireVendor,
  [AUTHENTICATED]: requireAuth,
};

module.exports = {
  PUBLIC,
  RESIDENT,
  VENDOR,
  AUTHENTICATED,
  GUARDS,
  allowPublic,
  requireAuth,
  requireResident,
  requireVendor,
};
