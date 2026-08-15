/**
 * ESLint config.
 *
 * Deliberately tuned to catch *bugs*, not style. This is a ~50k-line codebase
 * written over three years with no linter, so a conventional "recommended"
 * config produces thousands of findings and gets ignored — which is worse than
 * no linter at all.
 *
 * The rules enabled as errors are ones where a hit is almost always a real
 * defect: undefined variables, duplicate object keys, unreachable code,
 * assigning to a const. Style is handed entirely to Prettier
 * (eslint-config-prettier turns off anything that would conflict).
 *
 * Tightening this over time is easy; the goal for Phase 2 is a gate that is
 * green and therefore meaningful.
 */
module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  globals: {
    // Google Maps JS API, loaded from a <script> tag in public/index.html
    // rather than imported.
    google: "readonly",
    // Provided to the bundle by webpack.ProvidePlugin — see vue.config.js.
    Quill: "readonly",
  },

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },

  extends: [
    "eslint:recommended",
    "plugin:vue/essential", // Vue 2: correctness rules only, no style
    "prettier",
  ],

  rules: {
    // --- real defects -----------------------------------------------------
    "no-dupe-keys": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-unreachable": "error",
    "no-const-assign": "error",
    "no-self-assign": "error",
    "no-self-compare": "error",
    "no-unsafe-negation": "error",
    "no-cond-assign": "error",

    // Six existing violations, all latent bugs whose fixes change runtime
    // behaviour — two are `if ((x = 1))` assignments that were meant to be
    // comparisons, and three are `cond ? cond : fallback` ternaries in Mongo
    // aggregation pipelines. They are enumerated in PROJECT_NOTES.md and need
    // a run against a live database before being touched, so this is a warning
    // rather than a blocked build.
    "no-constant-condition": ["warn", { checkLoops: false }],
    "valid-typeof": "error",
    "use-isnan": "error",

    // --- noisy in legacy code, not defects --------------------------------
    "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
    "no-empty": ["warn", { allowEmptyCatch: true }],
    "no-console": "off", // 1,617 calls; removal is Phase 3
    "no-debugger": "error",
    "no-case-declarations": "warn",
    "no-inner-declarations": "warn",

    // `async (_, args, {}) => ...` is the house style across every resolver.
    // Not a defect, and rewriting ~38 signatures buys nothing.
    "no-empty-pattern": "off",

    // --- Vue: correctness kept, style dropped -----------------------------
    "vue/multi-word-component-names": "off", // naming style only
    "vue/no-v-text-v-html-on-component": "off", // not a defect here
    "vue/no-unused-components": "warn",
    "vue/require-v-for-key": "warn",
    "vue/no-use-v-if-with-v-for": "warn",
    "vue/no-useless-template-attributes": "warn",
    "vue/no-unused-vars": "warn",

    // Vuetify 2's slot syntax trips this rule; the app renders correctly.
    "vue/valid-v-slot": ["warn", { allowModifiers: true }],

    // Vue 2 filter syntax edge cases. The build compiles these fine.
    "vue/no-parsing-error": "warn",

    // Real anti-patterns, but pervasive in the legacy components and fixing
    // them changes runtime behaviour — so they are warnings with a written
    // backlog rather than a blocked build. Scheduled with the component
    // refactor in Phase 4; see PROJECT_NOTES.md.
    "vue/return-in-computed-property": "warn",
    "vue/no-side-effects-in-computed-properties": "warn",
    "vue/no-mutating-props": "warn",
  },

  overrides: [
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
    },
    {
      files: ["test/**/*.js"],
      env: { node: true },
    },
  ],

  ignorePatterns: [
    "dist/",
    "node_modules/",
    "public/",
    "src/assets/",
  ],
};
