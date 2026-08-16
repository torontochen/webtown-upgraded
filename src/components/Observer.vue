<template>
  <div><slot /></div>
</template>

<script>
/**
 * Replaces `vue-intersection-observer` (Phase 4b-3).
 *
 * That package has no Vue 3 build, and what it shipped was a webpack UMD
 * bundle of exactly this: a `<div>` wrapping a slot, an IntersectionObserver
 * on the root element, and one event. It also declared `vue` *and*
 * `vue-router` as runtime dependencies, which is not something a component
 * this size should be dragging along.
 *
 * The public contract is unchanged, so Home.vue's usage did not move:
 *   - props `root`, `rootMargin`, `threshold`
 *   - emits `on-change` with (firstEntry, unobserve)
 *   - `id` and other attributes fall through to the root div, which is how
 *     `onChange` recovers the index from `entry.target.id`
 *
 * Only the first entry is passed on, as before: the observer watches a single
 * element, so `entries` never holds more than one.
 */
export default {
  name: "Observer",

  props: {
    // The viewport when null. Typed loosely because the original declared
    // `window` as a prop type, which Vue cannot validate against.
    root: {
      default: null,
    },
    rootMargin: {
      type: [String, Number],
      default: "0px",
    },
    threshold: {
      type: [Array, Number],
      default: 0,
    },
  },

  data() {
    return { observer: null };
  },

  mounted() {
    if (typeof IntersectionObserver === "undefined") return;

    this.observer = new IntersectionObserver(
      (entries) => this.$emit("on-change", entries[0], this.unobserve),
      {
        root: this.root,
        rootMargin: this.rootMargin,
        threshold: this.threshold,
      }
    );
    this.observer.observe(this.$el);
  },

  // Written during the Vue 2 / Vue 3 straddle with both hook names; 4b-4
  // collapsed it to the Vue 3 one.
  beforeUnmount() {
    this.disconnect();
  },

  methods: {
    unobserve() {
      if (this.observer) this.observer.unobserve(this.$el);
    },
    disconnect() {
      if (!this.observer) return;
      this.observer.disconnect();
      this.observer = null;
    },
  },
};
</script>
