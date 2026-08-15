const test = require("node:test");
const assert = require("node:assert/strict");
const { GraphQLError } = require("graphql");

const {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} = require("../resolvers/errors");

// Apollo Server 4 removed the error classes apollo-server-express exported.
// These replacements must keep the same extensions.code strings, because
// server.js's formatError maps them back to error names and src/main.js keys
// its automatic sign-out off `err.name === "AuthenticationError"`. Changing a
// code silently breaks sign-out on token expiry.

test("each error carries the Apollo 2 compatible code", () => {
  assert.equal(new AuthenticationError("x").extensions.code, "UNAUTHENTICATED");
  assert.equal(new ForbiddenError("x").extensions.code, "FORBIDDEN");
  assert.equal(new UserInputError("x").extensions.code, "BAD_USER_INPUT");
});

test("each error keeps its class name for logging", () => {
  assert.equal(new AuthenticationError("x").name, "AuthenticationError");
  assert.equal(new ForbiddenError("x").name, "ForbiddenError");
  assert.equal(new UserInputError("x").name, "UserInputError");
});

test("each is a real GraphQLError so Apollo serialises it correctly", () => {
  for (const E of [AuthenticationError, ForbiddenError, UserInputError]) {
    const e = new E("boom");
    assert.ok(e instanceof GraphQLError, `${E.name} must extend GraphQLError`);
    assert.equal(e.message, "boom");
  }
});
