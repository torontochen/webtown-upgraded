const webpack = require("webpack");

// NOTE: this file previously assigned `module.exports` twice, which silently
// discarded `transpileDependencies: ["vuetify"]`. Both settings are merged here.
module.exports = {
  // `graphql` is here because Phase 3a upgraded it to 16 for Apollo Server 4,
  // and graphql 16 ships class fields (`line = 1;`) in *both* its ESM and CJS
  // builds. Webpack 4 (vue-cli 4) cannot parse those, so it has to go through
  // babel-loader. Dropped in Phase 4 when Vite replaces webpack 4.
  transpileDependencies: ["vuetify", "graphql"],
  configureWebpack: {
    resolve: {
      alias: {
        // Phase 3a upgraded graphql to 16 for Apollo Server 4. Webpack 4
        // (vue-cli 4) resolves `.mjs` ahead of `.js`, and graphql 16's ESM
        // build uses class fields, which webpack 4 cannot parse:
        //
        //   Module parse failed: Unexpected token
        //   ./node_modules/graphql/language/schemaCoordinateLexer.mjs
        //
        // Pinning the bare `graphql` specifier to the CommonJS entry keeps the
        // whole graphql dependency chain on `.js`, since index.js requires its
        // submodules with CJS paths. The `$` makes this an exact match, so
        // deep imports such as `graphql/language/printer` are untouched.
        //
        // This alias goes away in Phase 4 with Vite, which handles ESM natively.
        graphql$: require.resolve("graphql/index.js"),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        "window.Quill": "quill/dist/quill.js",
        Quill: "quill/dist/quill.js",
      }),
    ],
  },
};
