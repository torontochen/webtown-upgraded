// Vuex 4 (Phase 4b-4): `new Vuex.Store()` + `Vue.use(Vuex)` becomes
// `createStore()`, installed with `app.use(store)` in main.js.
//
// The state, mutations, actions and getters modules are unchanged — Vuex 4 is
// the same API on a Vue 3 reactivity core. Pinia is Phase 4c.
import { createStore } from "vuex";
import state from "./state";
import mutations from "./mutations";
import actions from "./actions";
import getters from "./getters";

export default createStore({
  state,
  mutations,
  actions,
  getters,
});
