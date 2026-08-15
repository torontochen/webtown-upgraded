import Vue from "vue";
// Full build, not "vuetify/lib".
//
// `vuetify/lib` exports the plugin but registers no components — vuetify-loader
// was responsible for auto-importing each one it found in a template, and that
// loader is webpack-only with no Vuetify 2 equivalent for Vite. Without it every
// <v-row>, <v-icon>, <v-btn> resolves to "Unknown custom element" and the page
// renders as unstyled HTML.
//
// The full build registers all components up front. The cost is smaller than it
// looks: the webpack build was already emitting ~648 kB of Vuetify CSS, so
// a-la-carte was buying very little here. Component styling comes from
// src/scss/vuetify.scss, which compiles Vuetify's sass with this project's
// variable overrides.
import Vuetify from "vuetify";
// import 'font-awesome/css/font-awesome.min.css'
// import "@fortawesome/fontawesome-free/css/all.css";
// import "@mdi/font/css/materialdesignicons.css";
// import "material-design-icons-iconfont/dist/material-design-icons.css";
// import "vuetify/dist/vuetify.min.css";

// const Vuetify = new Vuetify({
//   theme: {
//     themes: {
//       dark: {
//         primary: "#673AB",
//         secondary: "#7E57C",
//         info: "#3F51B",
//         error: "#F4433",
//         warning: "#FF980",
//         accent: "#C5116",
//         success: "#00C85"
//       },
//     },
//   },
// })

Vue.use(
  Vuetify
  //   , {
  //   theme: {
  //     primary: "#673AB",
  //     secondary: "#7E57C",
  //     info: "#3F51B",
  //     error: "#F4433",
  //     warning: "#FF980",
  //     accent: "#C5116",
  //     success: "#00C85"
  //   }
  // }
);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#5C6BC0",
        // primary: "#445F9B",
        secondary: "#008861",
        accent: "#B75420",
        error: "#BA002D",
        warning: "#BA002D",
        info: "#009688",
        success: "#4caf50",
        silver: "#7B8A8F",
        fontColor: "#424242",
        shade: "#FAFAFA",
        shade2: '#EFF3F6',
        shade3: '#F4F6F9',
        shade4: '#E8E8E8',
        shade5: '#F6F6F6',
        money: '#F08C18',
        medal: '#2920F7',
        silverMembership: '#EEEEEE',
        goldMembership: '#FFCA28',
        platinumMembership: '#E0E0E0'
      },
      dark: {
        primary: "#616161",
        secondary: "#BDBDBD",
        info: "#A1887F",
        error: "#EF5350",
        warning: "#FF7043",
        accent: "#6D4C41",
        success: "#388E3C",
      },
      // icons: {
      //   iconfont: "mdiSvg", // default - only for display purposes
      // },
    },
  },
  // theme: {
  //   themes: {
  //     light: {
  //       primary: '#3f51b5',
  //       secondary: '#b0bec5',
  //       anchor: '#8c9eff',
  //     },
  //   },
  // },
});