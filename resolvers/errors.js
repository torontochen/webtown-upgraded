const { GraphQLError } = require("graphql");

/**
 * Error classes for the resolvers.
 *
 * Apollo Server 4 removed the `AuthenticationError` / `ForbiddenError` /
 * `UserInputError` classes that `apollo-server-express` exported. The
 * replacement is a plain `GraphQLError` carrying an `extensions.code`.
 *
 * These thin subclasses keep the call sites in the auth layer unchanged and
 * keep the codes in one place. The codes are the same strings Apollo 2
 * produced (`UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`), so `formatError`
 * in server.js and the client's automatic sign-out — which keys off the mapped
 * error name — keep working across the migration.
 */

class AuthenticationError extends GraphQLError {
  constructor(message) {
    super(message, { extensions: { code: "UNAUTHENTICATED" } });
    this.name = "AuthenticationError";
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message) {
    super(message, { extensions: { code: "FORBIDDEN" } });
    this.name = "ForbiddenError";
  }
}

class UserInputError extends GraphQLError {
  constructor(message) {
    super(message, { extensions: { code: "BAD_USER_INPUT" } });
    this.name = "UserInputError";
  }
}

module.exports = { AuthenticationError, ForbiddenError, UserInputError };
