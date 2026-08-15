const webpack = require("webpack");

// NOTE: this file previously assigned `module.exports` twice, which silently
// discarded `transpileDependencies: ["vuetify"]`. Both settings are merged here.
module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        "window.Quill": "quill/dist/quill.js",
        Quill: "quill/dist/quill.js",
      }),
    ],
  },
};
