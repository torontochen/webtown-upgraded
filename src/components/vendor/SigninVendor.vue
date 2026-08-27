<template>
  <v-dialog
    v-model="signin"
    class="mt-0"
    :width="(viewportWidth * 4) / 10"
    persistent
    transition="fade"
  >
    <!-- Loading Spinner -->
    <!-- <v-row>
      <v-dialog
        v-model="loading"
        persistent
        fullscreen
      >
        <v-container fill-height>
          <v-row
            justify="center"
            align-content="center"
          >
            <v-progress-circular
              indeterminate
              :size="120"
              :width="7"
              color="primary"
            ></v-progress-circular>
          </v-row>
        </v-container>
      </v-dialog>
    </v-row> -->

    <v-card :max-height="(viewportHeight * 10) / 10">

    <!-- <v-btn absolute top right size="small" icon  theme="dark"  @click="$emit('closeSignIn')" >
          <v-icon theme="dark">mdi-close</v-icon>
        </v-btn> -->
      <!-- `absolute top right` are Vuetify 2 props with no v3 equivalent, so
           this fell into normal flow at the card's top-left. Moved into the
           title bar. -->
      <v-card-title class="text-h5 bg-primary text-white d-flex align-center">
        <span>Welcome Back! Partner</span>
        <v-spacer></v-spacer>
        <v-btn
          size="small"
          icon
          variant="text"
          theme="dark"
          @click="handleCancel"
          to="/"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Error Alert -->
      <v-card-text>
        <v-container>
          <v-row v-if="error">
            <v-col cols="12">
              <form-alert :message="error.message"></form-alert>
            </v-col>
          </v-row>

          <!-- Signin Form -->
          <v-row>
            <v-col cols="12">
              <!-- <v-card
              
            > -->
              <!-- <v-container> -->
              <v-form
                v-model="isFormValid"
                lazy-validation
                ref="form"
                @submit.prevent="handleSigninVendor"
              >
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      :rules="emailRules"
                      label="Email"
                      v-model="email"
                      prepend-icon="mdi-email"
                      required
                      placeholder=""
                    >
                    </v-text-field>
                  </v-col>
                </v-row>

                <v-row row>
                  <v-col cols="12">
                    <v-text-field
                      label="Password"
                      prepend-icon="mdi-puzzle"
                      type="password"
                      v-model="password"
                      placeholder=""
                      :rules="passwordRules"
                      required
                    >
                    </v-text-field>

                  </v-col>
                </v-row>

                <v-row row justify="center">
                  <v-col cols="12">
                    <v-checkbox
                      v-model="sameDevice"
                      label="This is the safe computer I always use"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row justify="center">
                  <!-- <v-col cols="12"> -->
                  <v-btn variant="flat"
                    :loading="loading"
                    :disabled="!isFormValid || loading"
                    color="primary"
                    type="submit"
                    right 
                  >
                    <template #loader><span class="custom-loader">
                      <v-icon>mdi-cached</v-icon>
                    </span></template>
                    Signin
                  </v-btn>

                  <!-- </v-col> -->
                </v-row>
                <v-row justify="center">
                  <!-- <v-col cols="12"> -->

                  <div
                    color="primary"
                    @click="handleSignupVendor"
                    class="text-center text-primary mt-3"
                  >
                    Don't have an account?
                    <span
                      style="
                        text-decoration: underline;
                        cursor: pointer;
                      "
                      class="text-secondary text-subtitle-1"
                    >
                      Signup
                    </span>
                  </div>

                  <!-- </v-col> -->
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";
export default {
  name: "signinvendor",
  // props: ["signin"],
  data() {
    return {
      sameDevice: false,
      signin: true,
      drawer: false,
      viewportHeight: 0,
      viewportWidth: 0,
      isFormValid: false,
      email: "",
      password: "",
      emailRules: [
        (email) => !!email || "Email is required",
        (email) => /.@+./.test(email) || "Email must be valid",
      ],

      passwordRules: [(password) => !!password || "Password is required"],
    };
  },
  computed: {
    ...mapState(useMainStore, ["loading", "error", "vendor", "fingerPrint"]),
  },
  watch: {
    vendor(value) {
      if (value) {
        this.$router.push("/");
      }
    },
  },
  mounted() {
    const navHeight = document.getElementById("navbar").offsetHeight;
    this.$store.setNavbarHeight(navHeight);
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    this.$refs.form.reset();
    // eventBus_vendorParlour.$emit("vendorParlour", true);
  },
  methods: {
    handleCancel() {

      this.$store.signoutVendor();

      // this.signin=false
    },
    handleSigninVendor() {
      if (this.$refs.form.validate()) {
        this.$store.signinVendor({
          email: this.email,
          password: this.password,
          fingerPrint: this.sameDevice ? this.fingerPrint : "",
        });
      }
    },
    handleSignupVendor() {
      this.signin = !this.signin;
      this.$router.push("/signupvendor");
    },
    // closeSignin() {
    //   // eventBus_vendorParlour.$emit("vendorParlour", false);
    //   this.signin = false;
    // },
  },
};
</script>

<style lang="scss" scoped>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
