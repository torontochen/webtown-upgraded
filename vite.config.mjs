import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

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
  plugins: [vue(), vuetify({ autoImport: true })],

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

  optimizeDeps: {
    include: ["vue", "vuetify", "@apollo/client/core", "graphql", "quill"],
  },
});
