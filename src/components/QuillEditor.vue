<template>
  <div class="quillWrapper">
    <div ref="quillContainer"></div>
  </div>
</template>

<script>
/**
 * Replaces `vue2-editor`'s <vue-editor> (Phase 4b-3b).
 *
 * vue2-editor is a Vue 2 SFC with no Vue 3 release. It does not bundle Quill —
 * it does `import Quill from "quill"` — so the editor here drives the very same
 * Quill singleton that `src/quill-setup.js` puts on `window` and that
 * VendorFlyers.vue registers its custom font and size attributors against.
 * Swapping the wrapper does not change which Quill is in play.
 *
 * Only the surface the one call site uses is reproduced: `v-model`,
 * `editorToolbar`, `editorOptions`, `customModules`, `disabled`, `placeholder`.
 * Deliberately dropped, all unused here: `useCustomImageHandler`,
 * `useMarkdownShortcuts`, the `toolbar` slot, the `id` prop, and the
 * `ready`/`focus`/`blur`/`text-change`/`selection-change`/`editor-change`
 * events — VendorFlyers.vue binds no listeners at all.
 *
 * Styling comes from Quill's own stylesheet, imported below. vue2-editor's
 * injected CSS was Quill 1.3.6's core+snow and nothing else — it defines no
 * rules of its own for `.quillWrapper`. The picker labels for this project's
 * custom fonts and sizes are already in index.html.
 */
import Quill from "quill";
import "quill/dist/quill.snow.css";

/** vue2-editor's mergeDeep, reproduced so editorOptions merges identically. */
function mergeDeep(target, source) {
  const isObject = (o) => o && typeof o === "object";
  if (!isObject(target) || !isObject(source)) return source;

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
}

export default {
  name: "QuillEditor",

  props: {
    value: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    editorToolbar: {
      type: Array,
      default: () => [],
    },
    editorOptions: {
      type: Object,
      default: () => ({}),
    },
    customModules: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return { quill: null };
  },

  watch: {
    value(val) {
      // Guarding on focus is what stops the caret jumping to the end while the
      // user is mid-word: the parent echoes back the value we just emitted.
      if (this.quill && val !== this.html() && !this.quill.hasFocus()) {
        this.quill.root.innerHTML = val;
      }
    },
    disabled(status) {
      if (this.quill) this.quill.enable(!status);
    },
  },

  mounted() {
    this.customModules.forEach(({ alias, module }) => {
      Quill.register(`modules/${alias}`, module);
    });

    const config = {
      debug: false,
      modules: {
        // vue2-editor substituted its own default list here. The single call
        // site always passes a toolbar, so this falls back to Quill's default
        // rather than carrying a copy of theirs.
        toolbar: this.editorToolbar.length ? this.editorToolbar : true,
      },
      theme: "snow",
      placeholder: this.placeholder || "",
      readOnly: this.disabled,
    };

    if (
      Object.keys(this.editorOptions).length > 0 &&
      this.editorOptions.constructor === Object
    ) {
      // A toolbar supplied through editorOptions replaces rather than merges.
      if (this.editorOptions.modules?.toolbar !== undefined) {
        delete config.modules.toolbar;
      }
      mergeDeep(config, this.editorOptions);
    }

    this.quill = new Quill(this.$refs.quillContainer, config);

    if (this.value) this.quill.root.innerHTML = this.value;

    this.quill.on("text-change", this.handleTextChange);
  },

  // Vue 2 calls beforeDestroy, Vue 3 calls beforeUnmount, and each ignores the
  // other as an unrecognised option — so this file needs no edit at the flip.
  beforeDestroy() {
    this.teardown();
  },
  beforeUnmount() {
    this.teardown();
  },

  methods: {
    /**
     * vue2-editor patched Quill.prototype.getHTML to do this. Reading the
     * element directly avoids mutating a shared global for one call site.
     */
    html() {
      const editor = this.quill.container.querySelector(".ql-editor");
      return editor ? editor.innerHTML : "";
    },

    handleTextChange() {
      // Quill's "empty" document is <p><br></p>. vue2-editor normalised that
      // to "" and the flyer code relies on it — an empty editor must not save
      // a stray paragraph into the flyer element.
      const html = this.html();
      this.$emit("input", html === "<p><br></p>" ? "" : html);
    },

    teardown() {
      if (this.quill) this.quill.off("text-change", this.handleTextChange);
      this.quill = null;
    },
  },
};
</script>
