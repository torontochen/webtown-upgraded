<template>
  <v-dialog
    v-model="signIn"
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
              color="primary lighten-3"
            ></v-progress-circular>
          </v-row>
        </v-container>
      </v-dialog>
    </v-row> -->

    <v-card :max-height="(viewportHeight * 10) / 10" rounded="5">
     <v-btn absolute top right small icon  dark  @click="$emit('closeSignIn')" >
          <v-icon dark>mdi-close</v-icon>
        </v-btn>
      <v-card-title class="text-h6 primary white--text" >
        welcome back!
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
                @submit.prevent="handleSigninResident"
              >
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      :rules="emailRules"
                      label="Email"
                      v-model="email"
                      prepend-icon="email"
                      required
                      placeholder=""
                    >
                    </v-text-field>
                  </v-col>
                </v-row>

                <v-row row>
                  <v-col cols="12">
                    <v-text-field
                      :rules="passwordRules"
                      label="Password"
                      prepend-icon="extension"
                      type="password"
                      v-model="password"
                      required
                      placeholder=""
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
                  <v-btn
                    :loading="loading"
                    :disabled="!isFormValid || loading"
                    color="primary lighten-1"
                    type="submit"
                    right
                    depressed
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                    Sign In
                  </v-btn>

                  <!-- </v-col> -->
                </v-row>
                <v-row justify="center">
                  <!-- <v-col cols="12"> -->

                  <div
                    color="primary"
                    @click="$emit('handleSignUp')"
                    class="text-center primary--text mt-3"
                  >
                    don't have an account?
                    <span
                      style="
                        text-decoration: underline;
                        cursor: pointer;
                        font-size: 1.25em;
                        font-weight: bold;
                      "
                      class="accent--text text--lighten-1 text-subtitle-2"
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
import { mapGetters } from "vuex";
export default {
  name: "signin",
  props: ["signIn"],
  data() {
    return {
      sameDevice: false,
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
    ...mapGetters(["loading", "error", "resident", "fingerPrint"]),
  },
  watch: {
    resident(newVal, oldVal) {
      if (newVal!=null&&oldVal==null) {
        this.$router.push("/");
      }
    },
  },
  mounted() {
    const navHeight = document.getElementById("navbar").offsetHeight;
    this.$store.commit("setNavbarHeight", navHeight);
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    if(this.signIn) {
      this.$refs.form.reset();
    }
    
  },
  methods: {
    handleSigninResident() {
      if (this.$refs.form.validate()) {
        console.log(this.fingerPrint);
        this.$store.dispatch("signinResident", {
          email: this.email,
          password: this.password,
          fingerPrint: this.sameDevice ? this.fingerPrint : "",
        });
      }
    },
    // handleSignup() {
    //   this.signin = !this.signin;
    //   this.$router.push("/signup");
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
