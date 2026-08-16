<template>
  <v-container fluid class="my-16 py-10" v-if="signUp">
    <!-- Signup Title -->
    <!-- <v-row>
      <v-col
        cols="12"
        sm="6"
        offset-sm="3"
      >
        <h1 class="text-secondary">Get Started Here</h1>
      </v-col>
    </v-row> -->

    <!-- Error Alert -->
    <v-row v-if="error">
      <v-col cols="12" sm="6" offset-sm="3">
        <form-alert :message="error.message"></form-alert>
      </v-col>
    </v-row>

    <!-- Signup Form -->
    <!-- <v-row>
      <v-col cols="12" sm="6" offset-sm="3"> -->
    <v-card
      :max-width="viewPortDimension.width * 0.8"
      outlined
      rounded="5"
      class="ma-auto"
    >
      <v-btn absolute top right size="small" icon theme="dark" @click="$emit('closeSignUp')">
        <v-icon theme="dark">mdi-close</v-icon>
      </v-btn>
      <v-card-subtitle class="primary text-h6 text-white">
        get started here!
      </v-card-subtitle>
      <v-container>
        <v-form ref="form" class="px-4">
          <v-row>
            <v-col cols="4">
              <v-text-field
                required
                :rules="emailRules"
                label="Email"
                placeholder=""
                v-model="email"
                prepend-icon="email"
                type="email"
                @blur="emailCheck"
                :error-messages="errorMessage"
                clearable
                @focus="formReset"
              >
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                required
                :rules="nameRules"
                label="First Name"
                prepend-icon="mdi-clipboard-text"
                v-model="firstName"
                :error-messages="errorMessage"
                clearable
              >
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                required
                :rules="nameRules"
                label="Last Name"
                v-model="lastName"
                prepend-icon="mdi-clipboard-text"
                :error-messages="errorMessage"
                clearable
              >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row> </v-row>

          <v-row class="d-flex flex-row justify-space-between align-stretch">
            <v-col cols="6">
              <v-text-field
                :rules="passwordRules"
                label="Confirm Password"
                placeholder=""
                v-model="passwordConfirmation"
                prepend-icon="gavel"
                type="password"
                required
                counter="8"
                clearable
              >
              </v-text-field>
              <v-text-field
                :rules="passwordRules"
                label="Password"
                placeholder=""
                prepend-icon="extension"
                type="password"
                v-model="password"
                required
                clearable
                counter="8"
              >
              </v-text-field>
              <v-text-field
                :rules="postalCodeRules"
                label="Postal Code (type valid postal code , map will show up)"
                id="postalCode"
                prepend-icon="place"
                required
                hint="Postal Code Of Any Favorite Places in GTA such as Residence, Work Place..."
                type="text"
                v-model="postalCode"
                clearable
                class="mb-n3"
              >
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <div id="map" class="ma-auto"></div>
            </v-col>
          </v-row>

          <v-row class="mt-5">
            <v-col cols="12">
              <v-row justify="center" class="text-center">
                <v-bottom-sheet v-model="emailSent" persistent>
                  <v-sheet class="text-center" height="200">
                    <v-container>
                      <v-alert
                        type="info"
                        transition="scale-transition"
                        density="compact"
                        color="accent"
                        class="title"
                      >
                        A confirmation email has been sent to
                        {{ email }},please verify</v-alert
                      >
                    </v-container>
                  </v-sheet>
                </v-bottom-sheet>
              </v-row>
              <v-row class="mt-8" justify="center">
                <v-btn variant="flat"
                  :loading="loading"
                  :disabled="!isFormValid || !emailOk"
                  color="primary"
                  @click="handleSignupResident" size="large" 
                >
                  <template #loader><span class="custom-loader">
                    <v-icon>cached</v-icon>
                  </span></template>
                  Sign Up
                </v-btn>
              </v-row>

              <v-row class="mt-5" justify="center">
                <div class="text-primary">
                  <!-- <img src="../assets/images/609803.png"> -->
                  <span
                    >already have an account?

                    <v-btn variant="text" 
                      color="accent"
                      @click="$emit('handleSignIn')"
                      >Signin</v-btn
                    >
                  </span>
                </div>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card>
    <!-- </v-col>
    </v-row> -->
  </v-container>
</template>
<script>
import { mapState } from "pinia";
import { useMainStore } from "../store/store";
import { EMAIL_CHECK } from "../queries/queries_query.js";
import gmapsInit from "../utils/gmaps";
// import { CONNREFUSED } from "dns";
// import locatePostalCode from "../utils/locatePostalCode";

export default {
  name: "signup",
  props: ["signUp"],
  // directives: {
  //   mask
  // },
  data() {
    return {
      emailSent: false,
      emailOk: false,
      errorMessage: null,
      firstName: null,
      lastName: null,
      initialLat: 0,
      initialLng: 0,
      id: "map",
      postalCode: null,
      email: null,
      password: null,
      passwordConfirmation: null,
      postalCodeRules: [
        (postalCode) => !!postalCode || "Postal Code is required",
        // residentName =>
        //   residentName.length < 10 ||
        //   "Resident Name cannot be more than 10 characters"
        (postalCode) =>
          /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(
            postalCode
          ) || "Not a valid Canadian Postal Code",
      ],
      emailRules: [
        (email) => !!email || "Email is required",
        (email) => /.@+./.test(email) || "Email must be valid",
      ],
      passwordRules: [
        (password) => !!password || "Password is required",
        (password) =>
          !password ||
          password.length >= 8 ||
          "Password must be at least 8 characters",
        (passwordConfirmation) =>
          passwordConfirmation === this.password || "Password must match",
      ],
      nameRules: [(name) => !!name || "First Name/Last Name is required"],
    };
  },

  async created() {
    try {
      // this.$$refs.form.reset();
      let autocomplete;
      let markers = [];
      const google = await gmapsInit();
      const map = new google.maps.Map(document.getElementById("map"), {
        // center: { lat: -78.944499, lng: 43.92496 },
        zoom: 8,
        disableDoubleClickZoom: false,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        // fullscreenControl: false
      });
      // console.log(map);
      var geocoder = new google.maps.Geocoder();
      // console.log(google);
      // [[-81.401806, 43.217693], [-77.679691, 44.319047]]
      // 43.036370, -82.056545 sw
      // 44.519412, -78.032275 ne
      const southWest = new google.maps.LatLng(43.03637, -82.056545);
      const northEast = new google.maps.LatLng(44.519412, -78.032275);
      const bounds = new google.maps.LatLngBounds(southWest, northEast);
      // console.log(bounds);
      autocomplete = new google.maps.places.Autocomplete(
        // autocomplete = new google.maps.places.PlaceAutocompleteElement(
        // /** @type {!HTMLInputElement} */
        document.getElementById("postalCode"),
        {
          types: ["geocode"],
          bounds: bounds,
          strictBounds: true,
        }
      );
      autocomplete.setBounds(bounds);
      // console.log(autocomplete.getBounds());
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          // console.log(position);
          // console.log(center);
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(center);
          // const circle = new google.maps.Circle({
          //   center,
          //   radius: position.coords.accuracy
          // });
          // autocomplete.setBounds(circle.getBounds());
          // console.log(center);
          // map.setCenter(center);

          // console.log(place.address_components);
        });
      } else {
        console.log("not ok");
      }

      // console.log(this.postalCode);
      // console.log(autocomplete.getPlace());
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        // console.log(place)
        // console.log(place.geometry.viewport.Ua.h);
        this.initialLat = place.geometry.location.lat();
        this.initialLng = place.geometry.location.lng();
        // this.initialLat = (place.geometry.viewport.zb.h + place.geometry.viewport.zb.j) / 2 ;
        // this.initialLng = (place.geometry.viewport.Ua.h + place.geometry.viewport.Ua.j) / 2;
        const location = place.address_components[0].short_name;
        this.postalCode = location;
        // console.log(this.postalCode);
        geocoder.geocode(
          {
            address: location,
          },
          function (results, status) {
            markers.map((marker) => {
              marker.setMap(null);
            });
            if (status === "OK") {
              // console.log(results);
              // console.log(location);
              map.setCenter(results[0].geometry.location);
              const image = {
                url:
                  // "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                  "/static/609803.png",
                // "/assets/images/609803.png",
                // This marker is 20 pixels wide by 32 pixels high.
                scaledSize: new google.maps.Size(40, 40),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(20, 20),
              };
              // Shapes define the clickable region of the icon. The type defines an HTML
              // <area> element 'poly' which traces out a polygon as a series of X,Y points.
              // The final coordinate closes the poly by connecting to the first coordinate.
              // const shape = {
              //   coords: [1, 1, 1, 20, 18, 20, 18, 1],
              //   type: "poly"
              // };
              const marker = new google.maps.Marker({
                position: results[0].geometry.location,
                icon: image,
                // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
                title: "home",
                map: map,
                // shape: shape,
                visible: true,
              });
              markers.push(marker);
              // console.log(markers);
            } else {
              alert(
                "Geocode was not successful for the following reason: " + status
              );
            }
          }
        );
      });

      function locatePostalCode(geocoder, resultsMap, autocomplete) {
        // var postalCode = document.getElementById('address').value;
        // console.log("sparked");
        const place = autocomplete.getPlace();
        // console.log(place);
        geocoder.geocode(
          {
            location: place.address_components[0].short_name,
          },
          function (results, status) {
            if (status === "OK") {
              // console.log(results);
              // console.log(location);
              resultsMap.setCenter(results[0].geometry.location);
              console.log(results[0].geometry.location);
              map.clearOverlays();
              const marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location,
              });
            } else {
              alert(
                "Geocode was not successful for the following reason: " + status
              );
            }
          }
        );
      }
      // function fillInAddress() {
      // Get the place details from the autocomplete object.

      // for (var component in componentForm) {
      //   document.getElementById(component).value = '';
      //   document.getElementById(component).disabled = false;
      // }

      // Get each component of the address from the place details
      // and fill the corresponding field on the form.

      // for (var i = 0; i < place.address_components.length; i++) {
      //   var addressType = place.address_components[i].types[0];
      //   //console.log(addressType);
      //   if (componentForm[addressType]) {
      //     //console.log(componentForm[addressType]);
      //     var val = place.address_components[i][componentForm[addressType]];
      //     //console.log(val);
      //     document.getElementById(addressType).value = val;
      //   }
      // }
      // }

      // const geocoder = new google.maps.Geocoder();
      // console.log(map);

      // google.maps.event.addListener(map, "click", function(event) {

      //   locations.push({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      //   let coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      //   addMarkers(coords, map, geocoder, markers, markerClusterer);
      // });
    } catch (error) {
      console.error(error);
    }
  },
  // beforeUpdate() {
  //   this.$$refs.form.reset();
  // },

  computed: {
    ...mapState(useMainStore, ["loading", "error", "resident", "viewPortDimension"]),
    isFormValid() {
      if (this.email && this.password && this.postalCode) {
        return true;
      } else {
        return false;
      }
    },
  },
  watch: {
    resident(newVal, oldVal) {
      if (newVal != null && oldVal == null) {
        this.$router.push("/");
      }
    },
  },
  methods: {
    // signupClose() {
    //   this.$router.push("/");
    // },

    formReset() {
      // console.log("reset");
      this.$refs.form.reset();
    },
    handleSignupResident() {
      // console.log(this.email, this.password, this.postalCode);
      // if (this.$refs.form.validate()) {
      // console.log(this.email);
      this.$store.signupResident({
        postalCode: this.postalCode,
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        initialLat: this.initialLat,
        initialLng: this.initialLng,
      });
      this.emailSent = true;
      // }
    },
    emailCheck() {
      // console.log("sparked");
      this.errorMessage = "";
      if (this.email) {
        this.$store.clearError();
        this.$apollo
          .query({
            query: EMAIL_CHECK,
            variables: { email: this.email },
          })
          .then(({ data }) => {
            // console.log(data);
            if (data.checkEmail.emailVal) {
              // this.$store.commit(
              //   "setError",
              //   "The email has been registered, please change another or Signin"
              // );
              this.errorMessage =
                "The email has been registered, please change another or Signin";
              this.$refs.form.resetValidation();
            } else {
              this.emailOk = true;
            }
          });
      }
    },
  },
};
</script>

<style>
#map {
  width: 500px;
  height: 200px;
}
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
</style>
