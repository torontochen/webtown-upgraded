const { UserInputError } = require("./errors");

/**
 * Builds the per-tenant MongoDB connection string.
 *
 * The app uses a database-per-entity layout: each vendor, resident, and guild
 * gets its own database, and the name was previously interpolated straight into
 * the connection URI at ~56 call sites:
 *
 *     process.env.MONGO_URI_PREFIX + newVendor + process.env.MONGO_URI_SUFFIX
 *
 * Callers stripped whitespace and dots first, but nothing else — so `/`, `?`,
 * `@`, and `&` all survived. A name like `x?authSource=admin&` or `x/otherDb`
 * would alter which database and which auth source the connection used, since
 * the suffix begins with `?retryWrites=...`. Names originate from user-supplied
 * signup fields, so this was reachable input.
 *
 * Phase 1b pins most of these values to the caller's token, which greatly
 * narrows the exposure, but the value is still user-chosen at signup. This
 * validates rather than sanitises: a name that does not match the whitelist is
 * rejected outright instead of being silently rewritten into a different
 * database than the caller intended.
 */

const SAFE_DB_NAME = /^[A-Za-z0-9_-]{1,63}$/;

function tenantUri(name) {
  if (typeof name !== "string" || !name) {
    throw new UserInputError("A database name is required.");
  }

  // Preserve the historical normalisation: callers stripped spaces and dots
  // before building the URI, and existing databases are named accordingly.
  const normalized = name.replace(/\s/g, "").replace(/\./g, "");

  if (!SAFE_DB_NAME.test(normalized)) {
    throw new UserInputError(
      "That name contains characters that are not allowed."
    );
  }

  return process.env.MONGO_URI_PREFIX + normalized + process.env.MONGO_URI_SUFFIX;
}

module.exports = { tenantUri, SAFE_DB_NAME };
