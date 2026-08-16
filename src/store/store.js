/**
 * Pinia (Phase 4c), replacing Vuex 4.
 *
 * One store, matching the single-module Vuex store it replaces. The state
 * shape is unchanged, and so are every action and mutation name — which is
 * what let the ~320 call sites across 35 components be rewritten mechanically
 * rather than by hand.
 *
 * Three structural changes fall out of Pinia's model:
 *
 * 1. **No mutations.** Pinia actions mutate state directly, so the 83 former
 *    mutations are actions now, alongside the 76 Apollo ones. They keep their
 *    own file because the distinction still means something — synchronous
 *    state writes versus the Apollo layer.
 *
 * 2. **No pass-through getters.** All 74 Vuex getters were `x: state => state.x`
 *    with the getter named exactly like the state key. Pinia exposes state on
 *    the store directly, so these are not just redundant, they would *collide*:
 *    a getter cannot share a name with a state property. `getters.js` is
 *    deleted and `mapState(useMainStore, [...])` reads the state itself.
 *
 *    That removed one long-standing dead getter: `fingerPrintIsSave` read
 *    `state.fingerPrintIsSave`, while the state key is `fingerPrintIsSaved`.
 *    It has always returned undefined, and nothing referenced it.
 *
 * 3. **`state` must be a factory**, so the imported object is spread into one.
 */
import { defineStore } from "pinia";
import state from "./state";
import mutations from "./mutations";
import actions from "./actions";

export const useMainStore = defineStore("main", {
  state: () => ({ ...state }),
  actions: {
    ...mutations,
    ...actions,
  },
});

export default useMainStore;
