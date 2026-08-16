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
export default {
  props: ["value", "component"],

  data() {
    return {};
  },

  watch: {},

  computed: {
    dialogSpark() {
      // console.log(this.value);
      return this.value;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
