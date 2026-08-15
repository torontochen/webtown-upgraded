/**
 * Application event buses.
 *
 * These were 19 `new Vue()` instances declared in and exported from main.js.
 * Two problems with that:
 *
 *  1. **Vue 3 removes `$on` / `$off` / `$emit` from component instances**, so
 *     every one of them is a hard blocker for the Vue 3 migration.
 *  2. Components imported them from `../main`, and main.js imports App.vue,
 *     which imports main.js — a circular import that happened to work because
 *     the bus objects are created before the app mounts.
 *
 * This replaces the Vue instances with a small framework-agnostic emitter that
 * implements the same `$emit` / `$on` / `$off` surface, so the ~110 call sites
 * across 13 components are unchanged — only the import path moves here.
 *
 * ## Why not route these through Vuex?
 *
 * The original upgrade plan said to fold the buses into Vuex actions. With the
 * code in front of us that is the wrong trade: there are 79 `$emit` sites and
 * 31 listeners driving imperative UI behaviour (open this dialog, append this
 * hook, re-render that flyer page), not shared state. Reshaping them into
 * mutations would be a redesign with real regression risk in flows that cannot
 * be exercised without a browser, and it is not what unblocks Vue 3.
 *
 * Removing the dependency on Vue instances is what unblocks Vue 3. This does
 * exactly that and nothing else. Migrating individual buses to real state is a
 * separate, incremental job that can now happen one bus at a time.
 *
 * ## Semantics
 *
 * Deliberately matches Vue 2's event API, including the sharp edge that a bare
 * `$off()` removes every listener on the bus for every event — the codebase
 * relies on that in 22 places.
 */

class EventBus {
  constructor(name) {
    this.name = name;
    this._handlers = new Map();
  }

  $on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, []);
    this._handlers.get(event).push(handler);
    return this;
  }

  $off(event, handler) {
    // Bare $off() clears everything — same as Vue 2, and relied upon here.
    if (event === undefined) {
      this._handlers.clear();
      return this;
    }
    if (handler === undefined) {
      this._handlers.delete(event);
      return this;
    }
    const list = this._handlers.get(event);
    if (!list) return this;
    const next = list.filter((h) => h !== handler);
    if (next.length) this._handlers.set(event, next);
    else this._handlers.delete(event);
    return this;
  }

  $emit(event, ...args) {
    const list = this._handlers.get(event);
    if (!list) return this;
    // Copy first: a handler may $off during dispatch, which Vue 2 tolerates.
    for (const handler of list.slice()) {
      try {
        handler(...args);
      } catch (err) {
        // Vue 2 surfaced listener errors through its own error handler rather
        // than letting one bad listener stop the rest of the chain.
        // eslint-disable-next-line no-console
        console.error(`[eventBus:${this.name}] "${event}" listener failed`, err);
      }
    }
    return this;
  }
}

const bus = (name) => new EventBus(name);

export const eventBus_profile = bus("profile");
export const eventBus_vendorParlour = bus("vendorParlour");
export const eventBus_editElement = bus("editElement");
export const eventBus_addPage = bus("addPage");
export const eventBus_preview = bus("preview");
export const eventBus_saveSketch = bus("saveSketch");
export const eventBus_appendHook = bus("appendHook");
export const eventBus_saveTemplate = bus("saveTemplate");
export const eventBus_saveFlyer = bus("saveFlyer");
export const eventBus_stashFlyer = bus("stashFlyer");
export const eventBus_feedPet = bus("feedPet");
export const eventBus_actionPanel = bus("actionPanel");
export const eventBus_toggleMapPosition = bus("toggleMapPosition");
export const eventBus_pickVendor = bus("pickVendor");
export const eventBus_searchVendor = bus("searchVendor");
export const eventBus_sortPromotionEvents = bus("sortPromotionEvents");
export const eventBus_crackEgg = bus("crackEgg");
export const eventBus_closeSignUp = bus("closeSignUp");

// NOTE: `eventBus_signout` was declared in main.js but had zero emits and zero
// listeners anywhere in src/. Dropped rather than carried forward.

export { EventBus };
