// Order matters: quill-setup assigns window.Quill, which the resize module
// below reads at evaluation time. ES module imports run in declaration order.
import "./quill-setup";
import "quill-image-resize-module/image-resize.min.js";
import "./scss/vuetify.scss";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.js";
import { createPinia } from "pinia";
import { markRaw } from "vue";
import { useMainStore } from "./store/store.js";
import vuetify from "./plugins/vuetify";
import filters from "./filters";
import { VueMasonryPlugin } from "vue-masonry";
import "vue2-animate/dist/vue2-animate.min.css";

// Apollo Client 3 (Phase 4b-4). vue-apollo 3 is Vue 2 only, and its Vue 3
// successor @vue/apollo-option requires Apollo Client 3 — which is why this
// upgrade had to come forward out of Phase 4c.
//
// src/apollo/graphqlWsLink.js is deleted with this change: it existed only
// because Apollo Client 2 had no graphql-ws link, and the official one now
// ships in the client.
import { defaultClient, attachStore } from "./apollo/client";
import { createApolloProvider } from "@vue/apollo-option";
import Alert from "./components/Alert.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
// import CKEditor from '@ckeditor/ckeditor5-vue'
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import gql from "graphql-tag";

// Pinia is created here rather than at app.use() time because main.js uses the
// store at module scope — the Apollo error links and the boot queries below.
// Passing the instance to useMainStore() is the documented way to reach a
// store outside a component.
const pinia = createPinia();

const store = useMainStore(pinia);

// store/actions.js used to `import router from "../router/router"`, which
// closed a second import cycle: store -> actions -> router -> every component
// -> store. The router is handed to the store instead, so actions call
// this.router.push(). markRaw keeps Vue from making the router reactive.
//
// Assigned directly rather than through pinia.use(): a plugin registered
// before app.use(pinia) is only queued, and this store is created at module
// scope — before the app exists — so the plugin would never reach it.
store.router = markRaw(router);

// The Apollo error links sign a user out on AuthenticationError; they reach
// the store through this rather than importing it, which is what keeps
// apollo/client.js out of the store import cycle.
attachStore(store);

// FingerPrint to do the initial check
(async () => {
  // We recommend to call `load` at application startup.
  const fp = await FingerprintJS.load();

  // The FingerprintJS agent is ready.
  // Get a visitor identifier when you'd like to.
  const result = await fp.get();

  // This is the visitor identifier:
  const visitorId = result.visitorId;
  // console.log(visitorId);
  store.setFingerPrint(visitorId);

  store.checkSavedFingerPrint({
    fingerPrint: visitorId,
  });
  // const fingerPrint = store.getters.fingerPrint;
  // console.log(fingerPrint);
})();


const apolloProvider = createApolloProvider({
  defaultClient,
});

// Vue 3: one app instance, plugins installed on it rather than globally, and
// no productionTip.
//
// The root `created()` hook that used to hold the boot dispatches is gone —
// App.vue has a `created()` of its own, and spreading the component options to
// add one here would silently replace it. The dispatches run against the store
// directly instead, just before mount. They were always fire-and-forget async
// queries, so ordering relative to the first render is unchanged.
const app = createApp(App);

// Pinia goes in before the router. vue-router 4 performs its initial
// navigation during install, so a guarded URL opened directly (/profile, any
// vendor screen) runs AuthGuard at that moment — and the guard calls
// useMainStore(), which needs an active Pinia. Installed the other way round it
// throws "no active Pinia" on a hard page load.
app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(apolloProvider);
app.use(VueMasonryPlugin);

app.component("form-alert", Alert);
app.component("qrcode", VueQrcode);

// Vue 3 renamed every directive hook. `bind` is `beforeMount`.
app.directive("event-type-photo", {
  beforeMount(el, binding) {
    switch (binding.value) {
      case "On_Sale":
        el.src = "/static/sales_images__1_-removebg-preview.png";
    }
  },
});

// Phase 4b-1 put the filters here as Vue.prototype.$filters; this is the same
// thing under Vue 3, and none of the 176 template call sites changed.
app.config.globalProperties.$filters = filters;

// The Pinia store is exposed as $store so the ~320 dispatch/commit call sites
// across 35 components became plain method calls without each component
// growing an import. This is the real store instance, not a Vuex shim: a
// component calls this.$store.getPets() and this.$store.setLoading(true).
app.config.globalProperties.$store = store;

// The 15 boot queries. test/queryPolicy.test.js reads these names out of this
// file and asserts every one is still PUBLIC — guarding any of them would
// break the app on load for anonymous visitors.
store.getCurrentResident();
store.getCurrentVendor();
store.getPets();
store.getActiveFlyer();
store.getEventCategory();
store.getPromotionEvents();
store.getAllGuilds();
store.getAllGuildDeals();
store.getMetroSpec();
store.getCityHall();
store.getProductCategory();
store.getServiceCategory();
store.getRestaurantCategory();
store.getVendorList();
store.getNews();

app.mount("#app");
