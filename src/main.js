// Order matters: quill-setup assigns window.Quill, which the resize module
// below reads at evaluation time. ES module imports run in declaration order.
import "./quill-setup";
import "quill-image-resize-module/image-resize.min.js";
import "./scss/vuetify.scss";

import Vue from "vue";
import App from "./App.vue";
import router from "./router/router.js";
import store from "./store/store.js";
import vuetify from "./plugins/vuetify";
import filters from "./filters";
import { VueMasonryPlugin } from "vue-masonry";
import "vue2-animate/dist/vue2-animate.min.css";
import Chat from "vue-beautiful-chat";
Vue.use(Chat);

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { GraphQLWsLink } from "./apollo/graphqlWsLink";
import { getMainDefinition } from "apollo-utilities";
import VueApollo from "vue-apollo";
import Alert from "./components/Alert.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
// import CKEditor from '@ckeditor/ckeditor5-vue'
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import gql from "graphql-tag";

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
  store.commit("setFingerPrint", visitorId);

  store.dispatch("checkSavedFingerPrint", {
    fingerPrint: visitorId,
  });
  // const fingerPrint = store.getters.fingerPrint;
  // console.log(fingerPrint);
})();

// GraphQL endpoints.
//
// These were hardcoded localhost URLs with the production ones commented out
// beside them, swapped by hand at deploy time — which is what the last two
// commits in the original repo were doing.
//
// Development sets both explicitly in .env.development, because the client runs
// on :8080 and the API on :4000. Production leaves them unset and falls back to
// the origin serving the page, which matches the co-hosted deployment. Override
// either one in .env.production if the API moves to its own host.
const GRAPHQL_HTTP_URI =
  import.meta.env.VITE_GRAPHQL_HTTP || `${window.location.origin}/graphql`;

const GRAPHQL_WS_URI =
  import.meta.env.VITE_GRAPHQL_WS ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }/graphql`;


// Register Global Component
Vue.use(VueApollo);
Vue.use(VueMasonryPlugin);
// Vue.use(CKEditor)

//component
Vue.component("form-alert", Alert);
Vue.component(VueQrcode.name, VueQrcode);

//Directives
Vue.directive("event-type-photo", {
  bind(el, binding, vnode) {
    switch (binding.value) {
      case "On_Sale":
        el.src = "/static/sales_images__1_-removebg-preview.png";
    }
  },
});

// Filters (Phase 4b-1)
//
// Vue 3 removes `Vue.filter` and the `|` template syntax. The seven filters now
// live in src/filters.js as plain functions, reached from templates as
// `{{ $filters.formatIntAmount(x) }}`. `Vue.prototype` is the Vue 2 spelling of
// what becomes `app.config.globalProperties` in Vue 3 — the templates do not
// change again at the flip.
Vue.prototype.$filters = filters;
// console.log("mainjs is running");

// Set up request
const request = (operation) => {
  // if no token with key in the localStorage, add it
  if (!localStorage.token) {
    // console.log("resident");
    localStorage.setItem("token", "");
  }

  if (!localStorage.vendortoken) {
    // console.log("vendor");
    localStorage.setItem("vendortoken", "");
  }

  // operation adds the token to an authorization header that is to be sent to server
  let token = localStorage.token
    ? localStorage.getItem("token")
    : localStorage.getItem("vendortoken");
  // console.log(token);
  // let decodedToken = jwt_decode(token);
  // console.log(token);
  // console.log("Decoded Token", decodedToken);
  // let currentDate = new Date();

  // JWT exp is in seconds
  // if (decodedToken.exp * 1000 < currentDate.getTime()) {
  //   operation.setContext({
  //     headers: {
  //       authorization: token,
  //     },
  //   });
  //   store.commit(
  //     "setAuthError",
  //     "Your Token has Expired, Please sign in again"
  //   );
  //   router.replace("/");
  // } else {
  //   console.log("Valid token");
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  // }
};

// set up the request handlers for the http clients
const requestLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let handle;
    Promise.resolve(operation)
      .then((oper) => {
        request(oper);
      })
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(observer.error.bind(observer));
    return () => {
      if (handle) handle.unsubscribe();
    };
  });
});

// Set up websocket link for subscriptions
const wsLink = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.log(
          `[GraphQL error]: Message: ${err.message},Location: ${err.locations}, Path: ${err.path}`
        );
        if (err.name === "AuthenticationError") {
          console.log(err);
          // set auth error in state
          store.commit("setAuthError", err);
          // Sign user out
          if (localStorage.token) {
            store.dispatch("signoutResident");
          }
          if (localStorage.vendortoken) {
            store.dispatch("signoutVendor");
          }
        }
      }
    }
    if (networkError) {
      console.log("[networkError]", networkError);
    }
  }),

  requestLink,

  // graphql-ws replaces subscriptions-transport-ws (Phase 3a). It reconnects by
  // default, so the old `reconnect: true` has no equivalent, and
  // connectionParams is a top-level callback rather than nested under `options`.
  // It is re-evaluated on every (re)connect, so a token refreshed after sign-in
  // is picked up without recreating the link.
  new GraphQLWsLink({
    url: GRAPHQL_WS_URI,
    connectionParams: () => {
      const token = localStorage.token
        ? localStorage.getItem("token")
        : localStorage.getItem("vendortoken");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  }),
]);

// HTTP link for queries and mutations
const httpLink = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
        if (err.name === "AuthenticationError") {
          console.log(err.name);
          // set auth error in state
          store.commit("setAuthError", err);
          // Sign user out
          if (localStorage.token) {
            store.dispatch("signoutResident");
          }
          if (localStorage.vendortoken) {
            store.dispatch("signoutVendor");
          }
          store.dispatch("getEventCategory");
          store.dispatch("getPromotionEvents");
        }
        if (err.name === "GraphQLError") {
          console.log(err.name);
          store.commit("setError", err);
          // set auth error in state
          // store.commit("setAuthError", err)
          // Sign user out
          // store.dispatch("signoutUser")
        }
      }
    }
    if (networkError) {
      console.log("[networkError", networkError);
    }
  }),

  requestLink,

  // Plain HTTP link. This was apollo-upload-client's createUploadLink, but the
  // schema has no Upload scalar — no operation ever sent a file — so the
  // multipart transport was unused. Dropping it also removed the
  // graphql-upload CSRF advisory Apollo Server warned about on every boot.
  new HttpLink({
    uri: GRAPHQL_HTTP_URI,
    credentials: "include",
  }),
]);

// Link to direct ws and http traffic to the correct place
const link = ApolloLink.split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

// Set up apolloClient and apolloProvider
export const defaultClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
const apolloProvider = new VueApollo({
  defaultClient,
});

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  vuetify,
  render: (h) => h(App),
  created() {
    // console.log("vue starting")
    this.$store.dispatch("getCurrentResident");
    this.$store.dispatch("getCurrentVendor");
    this.$store.dispatch("getPets");
    this.$store.dispatch("getActiveFlyer");
    this.$store.dispatch("getEventCategory");
    this.$store.dispatch("getPromotionEvents");
    this.$store.dispatch("getAllGuilds");
    this.$store.dispatch("getAllGuildDeals");
    this.$store.dispatch("getMetroSpec");
    this.$store.dispatch("getCityHall");
    this.$store.dispatch("getProductCategory");
    this.$store.dispatch("getServiceCategory");
    this.$store.dispatch("getRestaurantCategory");
    this.$store.dispatch("getVendorList");
    this.$store.dispatch("getNews");
  },
}).$mount("#app");
