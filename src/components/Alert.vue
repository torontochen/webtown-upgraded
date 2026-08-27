<template>
  <v-alert
    type="error"
    :model-value="true"
    transition="scale-transition"
    dismissible
    outlined
  >
    <h3>{{message}}</h3>
  </v-alert>
</template>

<script>
export default {
  props: ["message"]
};
</script>