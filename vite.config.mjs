import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

/**
 * Vite + Vue 3 + Vuetify 3 (Phase 4b-4).
 *
 * `vite-plugin-vuetify` is the Vite-native replacement for the webpack-only
 * `vuetify-loader`. It auto-imports each Vuetify component and its styles
 * where a template uses one, which is the tree-shaking Phase 4a-ii had to give
 * up when it fell back to Vuetify 2's full build — the reason the bundle grew
 * from 2.18 MB to 2.88 MB then.
 */
export default defineConfig({
  plugins: [
    // `transformAssetUrls` teaches the SFC compiler that Vuetify components
    // take asset paths too. Out of the box @vitejs/plugin-vue only rewrites
    // `src` on real HTML tags — `<img>`, `<source>`, `<video>` — so a
    // `<v-img src="./assets/logo.png">` was passed through as a literal string
    // and resolved against the page URL at runtime, i.e. 404.
    //
    // That is why the header logo and several in-app images have been missing
    // since the Vite migration in 4a-ii; webpack's loader had handled them.
    vue({ template: { transformAssetUrls } }),
    vuetify({ autoImport: true }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    port: 8080,
  },

  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 3000,
  },

  // Phase 5: keep console.log out of production bundles.
  //
  // Phase 3b gave the server a leveled logger and converted its 27 call sites.
  // The client still has ~200, and they are useful while developing — so they
  // are dropped at build time rather than deleted from the source. Marking them
  // `pure` lets esbuild tree-shake the calls once their result is unused.
  //
  // console.error and console.warn are deliberately kept: a production console
  // should still say something when a GraphQL call fails.
  esbuild: {
    pure: ["console.log", "console.debug", "console.dir"],
  },

  optimizeDeps: {
    include: ["vue", "vuetify", "@apollo/client/core", "graphql", "quill"],
  },
});
