/**
 * Vuetify 3 (Phase 4b-4).
 *
 * `new Vuetify({...})` + `Vue.use` becomes `createVuetify({...})`, and the
 * plugin is passed to `app.use()` in main.js rather than installed globally.
 *
 * Components are no longer registered here. `vite-plugin-vuetify` auto-imports
 * each component (and its styles) where a template uses it — the Vite-native
 * replacement for the webpack-only `vuetify-loader` that Phase 4a-ii had to
 * give up, which is why that phase fell back to the full build and the bundle
 * grew. This restores the tree-shaking.
 *
 * Theme changes in Vuetify 3:
 *   - themes live under `theme.themes.<name>.colors`, not directly on the theme
 *   - `defaultTheme` replaces the implicit "light"
 *   - custom colours still generate `text-<name>` / `bg-<name>` utilities, but
 *     the Vuetify 2 `<name>--text` spelling is gone (handled in the templates)
 */
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

export default createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#5C6BC0",
          secondary: "#008861",
          accent: "#B75420",
          error: "#BA002D",
          warning: "#BA002D",
          info: "#009688",
          success: "#4caf50",
          silver: "#7B8A8F",
          fontColor: "#424242",
          shade: "#FAFAFA",
          shade2: "#EFF3F6",
          shade3: "#F4F6F9",
          shade4: "#E8E8E8",
          shade5: "#F6F6F6",
          money: "#F08C18",
          medal: "#2920F7",
          silverMembership: "#EEEEEE",
          goldMembership: "#FFCA28",
          platinumMembership: "#E0E0E0",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#616161",
          secondary: "#BDBDBD",
          info: "#A1887F",
          error: "#EF5350",
          warning: "#FF7043",
          accent: "#6D4C41",
          success: "#388E3C",
        },
      },
    },
  },
});
