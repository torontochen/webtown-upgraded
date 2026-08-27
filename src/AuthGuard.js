/**
 * Route guard for the authenticated screens.
 *
 * Phase 4c deleted `store/getters.js` — all 74 Vuex getters were pass-throughs
 * (`x: state => state.x`) and Pinia exposes state on the store directly. This
 * file was missed: it still read `store.getters.resident`, and `store/store.js`
 * default-exports `useMainStore`, a *function*. So `store.getters` was
 * `undefined` and the guard threw
 *
 *     TypeError: Cannot read properties of undefined (reading 'resident')
 *
 * on every navigation. vue-router 4 turns a guard that throws into a rejected
 * navigation, so all 13 guarded routes — /profile, /openhouse and the 11 vendor
 * screens — silently refused to open. Nothing surfaced it because the call
 * sites are `this.$router.push(...)` with no `await` and no `.catch()`, so the
 * failure was swallowed: the click simply did nothing.
 *
 * That is why every phase from 4b onward recorded the authenticated screens as
 * "not verified, behind auth" — after 4c they were unreachable.
 *
 * `useMainStore()` is called inside the guard, not at module scope: an active
 * Pinia only exists once `app.use(pinia)` has run.
 */
import { useMainStore } from "./store/store";

export default (to, from, next) => {
  const store = useMainStore();

  if (!store.resident && !store.vendor) {
    next({
      path: "/",
    });
  } else {
    next();
  }
};
