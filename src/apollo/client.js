/**
 * The Apollo Client 3 setup, extracted from main.js in Phase 4c.
 *
 * It lived in main.js, and store/actions.js imported `defaultClient` from
 * there — a cycle: main -> store -> actions -> main. Vuex tolerated it because
 * nothing touched the store module during its own evaluation. Pinia does not:
 * components import `useMainStore` directly, so a component evaluating first
 * would start store.js -> actions.js -> main.js, and main.js calls
 * useMainStore() at module scope, which is still in its temporal dead zone.
 * The symptom was "Cannot access 'useMainStore' before initialization".
 *
 * Breaking the cycle properly means this module importing nothing from the
 * store. The error links still need it to sign a user out, so the store is
 * handed in with attachStore() once it exists — the handlers only run at
 * request time, long after boot.
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
  split,
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Set by main.js as soon as the Pinia store exists.
let store = null;
export const attachStore = (s) => {
  store = s;
};
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
          store?.setAuthError(err);
          // Sign user out
          if (localStorage.token) {
            store?.signoutResident();
          }
          if (localStorage.vendortoken) {
            store?.signoutVendor();
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
  // The official Apollo Client 3 link, wrapping the same graphql-ws client the
  // hand-written adapter used to wrap.
  new GraphQLWsLink(
    createClient({
    url: GRAPHQL_WS_URI,
    connectionParams: () => {
      const token = localStorage.token
        ? localStorage.getItem("token")
        : localStorage.getItem("vendortoken");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    })
  ),
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
          store?.setAuthError(err);
          // Sign user out
          if (localStorage.token) {
            store?.signoutResident();
          }
          if (localStorage.vendortoken) {
            store?.signoutVendor();
          }
          store?.getEventCategory();
          store?.getPromotionEvents();
        }
        if (err.name === "GraphQLError") {
          console.log(err.name);
          store?.setError(err);
          // set auth error in state
          // store.setAuthError(err)
          // Sign user out
          // store.signoutUser()
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

// Link to direct ws and http traffic to the correct place. ApolloLink.split is
// exported as a standalone `split` in Apollo Client 3.
const link = split(
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
