<template>

  <v-dialog
    v-model="dialogSpark"
    width="400"
    persistent
    transition="fade"
  >
    <v-card style="border-top: 15px solid #B75420">
      <v-card-title
        class="text-h6 text-accent"
      >leaving {{component}} ?</v-card-title>

      <v-card-text
        class="text-subtitle-1 text-accent"
      >
       all unsaved change will be lost!
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text"
          color="primary" size="small"
          @click="$emit('yes-leave')"
        >
          Yes
        </v-btn>

        <v-btn variant="text"
          color="accent" size="small"
          @click="$emit('abort-leave')"
        >
          No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * All four call sites bind this with `v-model`. Under Vue 2 that meant the
 * `value` prop, which is what this component declared. Vue 3's `v-model` means
 * `modelValue`, so `value` was never set and `dialogSpark` was always
 * undefined — the dialog only ever opened because the undeclared `modelValue`
 * fell through as an attribute onto the root `v-dialog`, which happens to have
 * a prop of that name. It worked by accident, and `emits` was undeclared so
 * the two events fell through the same way.
 *
 * Declaring both makes the binding real rather than incidental.
 */
export default {
  props: {
    modelValue: { type: Boolean, default: false },
    component: { type: String, default: "" },
  },

  emits: ["yes-leave", "abort-leave"],

  computed: {
    dialogSpark() {
      return this.modelValue;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
