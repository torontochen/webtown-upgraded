import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";

/**
 * Vite replaces vue-cli 4 / webpack 4 (Phase 4a-ii).
 *
 * Two workarounds added in Phase 3a are gone as a result: `graphql` no longer
 * needs to sit in `transpileDependencies`, and the `graphql$` alias forcing its
 * CommonJS build is unnecessary — Vite handles graphql 16's ESM and class
 * fields natively, which webpack 4's parser could not.
 */
export default defineConfig({
  plugins: [vue()],

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
    // Matches what webpack was emitting; the app ships one large vendor chunk.
    chunkSizeWarningLimit: 3000,
  },

  // Vuetify 2 and its .sass sources are pre-bundled so dev startup does not
  // re-resolve hundreds of component modules on every cold start.
  optimizeDeps: {
    include: ["vue", "vuetify", "apollo-client", "graphql", "quill"],
  },
});
