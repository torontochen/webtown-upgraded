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
    // Vue 3 ruleset (Phase 4b-4). vue3-essential is the same "correctness
    // only, no style" tier as the Vue 2 `essential` it replaces — but it knows
    // Vue 3 semantics, so e.g. a key on <template v-for> is now correct rather
    // than an error.
    "plugin:vue/vue3-essential",
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

    // All six original violations were resolved in Phase 2.5, so this is back
    // to an error and will block any new one.
    "no-constant-condition": ["error", { checkLoops: false }],
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

    // Promoted to error in Phase 4a. The eight existing violations were not
    // "edge cases" at all — a formatter had rewritten hyphenated filter names
    // as subtraction, e.g. `{{ x | format-int-amount }}` became
    // `{{ x | (format - int - amount) }}`, so those filters silently never ran
    // and raw values rendered in the UI. All eight are fixed; as an error this
    // now blocks the build if a formatter reintroduces it.
    "vue/no-parsing-error": "error",

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
      files: ["test/**/*.js", "test-e2e/**/*.js"],
      env: { node: true },
    },
    {
      // vite.config.mjs is ESM in a CommonJS package.
      files: ["*.mjs"],
      parserOptions: { sourceType: "module" },
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
