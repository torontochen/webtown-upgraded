<template>
  <v-container class="text-center my-2">
    <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="loading" persistent fullscreen>
        <v-container fill-height>
          
          
          <v-row justify="center" align-content="center">
            <v-progress-circular
              indeterminate
              :size="60"
              :width="4"
              color="primary lighten-3"
            ></v-progress-circular>
          </v-row>
        </v-container>
      </v-dialog>
    </v-row>
    <v-row>
      <!-- <v-col cols="12"> -->
        <v-container>
          <v-card>
            <v-card-title class="headline primary  white--text">
              Who am I
            </v-card-title>
            <v-container>
              <v-container>
                <v-form ref="form" lazy-validation v-model="isFormValid">
                  <v-row>
                    <!-- -->
                    <v-col cols="5" class="d-flex flex-column justify-center align-center" >
                      <!-- <v-container> -->
                        <!-- Postal Code Map -->
                        <!-- <v-col justify="center" class="mx-4"> -->
                          <h3 style="color: #5C6BC0">I am here</h3>
                          <div id="map" justify-center ></div>
                          <v-text-field
                            id="postcode"
                            :rules="postalCodeRules"
                            label="Postal Code"
                            placeholder=""
                            required
                            dense
                            hint="Postal Code Of Any Favorite Places in GTA such as Residence, Work Place..."
                            type="text"
                            v-model="postalCode"
                            clearable
                            full-width
                            class="align-self-stretch"
                          >
                          </v-text-field>
                        <!-- </v-col> -->
                      <!-- </v-container> -->
                    </v-col>

                    <v-col cols="6">
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-row class="primary--text text-subtitle-1 font-weight-bold my-3">
                               <!-- <v-text-field
                              :rules="residentNameRules"
                              label="Resident Name"
                              placeholder=""
                              required
                              dense
                              hint="Resident Name Has To Be 4 Characters At Least"
                              type="text"
                              v-model="residentName"
                              clearable
                              :error-messages="errorMessage"
                              @blur="handleResidentNameCheck('residentName')"
                              :value="residentName"
                            >
                            </v-text-field> -->
                           Resident Name: <span class="text-subtitle-1 font-weight-bold fontColor--text mx-2">{{residentName}}</span>
                            </v-row>
                            <v-row>
                               <v-text-field
                                  :rules="nickNameRules"
                                  label="Resident Nick Name"
                                  required
                                  dense
                                  hint="Nick Name has to be different from Resident Name"
                                  type="text"
                                  v-model="nickName"
                                  clearable
                                  :error-messages="errorMessageNickName"
                                  @blur="handleResidentNameCheck"
                                >
                              </v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>
                        <!-- Change Password -->
                        <v-row v-if="!passwordEdit">
                          <v-container>
                            <v-col cols="12">
                              <v-row justify="start">
                                <span
                                  class="text-subtitle-1 font-weight-medium primary--text"
                                >
                                  Change Password ?
                                  <v-icon
                                    @click="passwordEdit = true"
                                    color="primary"
                                    >mdi-pencil</v-icon
                                  >
                                </span>
                              </v-row>
                            </v-col>
                          </v-container>
                        </v-row>

                        <v-row v-if="!passwordEdit">
                          <v-container>
                            <v-col cols="12">
                              <v-row justify="start">
                                <span
                                  class="text-subtitle-1 font-weight-medium primary--text"
                                >
                                  Change Avatar ?
                                  <v-icon
                                    @click="changeAvatar = true"
                                    color="primary"
                                    >mdi-pencil</v-icon
                                  >
                                </span>
                              </v-row>
                            </v-col>
                          </v-container>
                        </v-row>

                        <v-card v-if="passwordEdit" hover outlined>
                         
                          <!-- <v-container> -->
                             <v-btn
                              icon
                              right
                              absolute
                              top
                              x-small
                              class="d-block mt-n3 mr-n3"
                              @click="passwordEdit = false"
                            >
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                            <v-card-text>
                              <v-col cols="12">
                                <v-text-field
                                  :rules="passwordRules"
                                  label="New Password"
                                  placeholder=""
                                  type="password"
                                  v-model.trim="password"
                                  required
                                  dense
                                  counter="8"
                                  class="my-1"
                                >
                                </v-text-field>
                                <v-text-field
                                  :rules="passwordRules"
                                  label="Confirm Password"
                                  placeholder=""
                                  v-model.trim="passwordConfirmation"
                                  type="password"
                                  required
                                  counter="8"
                                  class="my-1"
                                  dense
                                >
                                </v-text-field>
                              </v-col>
                            </v-card-text>
                          

                           
                          <!-- </v-container> -->
                        </v-card>
                      </v-container>
                    </v-col>
                  </v-row>

                  <v-row justify="center">
                    <v-col cols="12">
                      <!-- Personal Info -->
                      <!-- <v-tooltip top> -->
                        <!-- <template v-slot:activator="{ on }"> -->
                          <v-card outlined >
                            <v-card-title class="primary--text"
                              >Personal Info</v-card-title
                            >
                            <v-container>
                              <v-row>
                                <v-col cols="3">
                                  <v-text-field
                                    label="First Name"
                                    placeholder=""
                                    required
                                    dense
                                    type="text"
                                    v-model="firstName"
                                    clearable
                                  >
                                  </v-text-field>
                                </v-col>
                                <v-col cols="3">
                                  <v-text-field
                                    label="Last Name"
                                    placeholder=""
                                    required
                                    type="text"
                                    v-model="lastName"
                                    clearable
                                    dense
                                  >
                                  </v-text-field>
                                </v-col>
                                <v-col cols="3">
                                  <v-select
                                    :items="genderItems"
                                    label="Gender"
                                    outlined
                                    dense
                                    v-model="gender"
                                  ></v-select>
                                </v-col>
                                <v-col cols="3">
                                  <v-menu
                                    ref="menu"
                                    v-model="menu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290"
                                  >
                                    <template v-slot:activator="{ on }">
                                      <v-text-field
                                        v-model="birthday"
                                        label="Birthday date"
                                        prepend-icon="event"
                                        v-on="on"
                                        dense
                                      ></v-text-field>
                                    </template>
                                    <v-date-picker
                                      ref="picker"
                                      v-model="birthday"
                                      :max="
                                        new Date().toISOString().substr(0, 10)
                                      "
                                      min="1940-01-01"
                                      @change="save"
                                    ></v-date-picker>
                                  </v-menu>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="4">
                                  <v-select
                                    v-model="myHobbies"
                                    :items="hobbies"
                                    label="Hobbies"
                                    multiple
                                    small-chips
                                    clearable
                                    dense
                                    deletable-chips
                                    hint="detailed hobbies info will bring you more benefits"
                                    persistent-hint
                                  ></v-select>
                                </v-col>
                                <v-col cols="4">
                                  <v-select
                                    v-model="myFavoriteFood"
                                    :items="favoriteFood"
                                    small-chips
                                    label="Favorite Food"
                                    multiple
                                    dense
                                    deletable-chips
                                     hint="detailed favorite food info will bring you more benefits"
                                    persistent-hint
                                    clearable
                                  ></v-select>
                                </v-col>
                                <v-col cols="4">
                                  <v-select
                                    v-model="myBelief"
                                    :items="religions"
                                    small-chips
                                    label="Religion"
                                    clearable
                                    dense
                                  ></v-select>
                                </v-col>
                              </v-row>
                              <v-alert
                                dense
                                outlined
                                type="warning"
                                :value="personalInfo"
                              >
                                Personal Info has to be completed once started
                              </v-alert>
                            </v-container>
                          </v-card>
                        <!-- </template> -->
                        <!-- <span
                          >Correct persoanl information helps To obtain more
                          benefit</span
                        > -->
                      <!-- </v-tooltip> -->
                    </v-col>
                  </v-row>
                  <!-- Mailing Address -->
                  <v-row justify="center">
                    <v-col cols="12">
                      <!-- <v-tooltip top>
                        <template v-slot:activator="{ on }"> -->
                          <v-card  outlined>
                            <v-card-title class="primary--text"
                              >Mailing Address</v-card-title
                            >
                            <v-container>
                              <v-row>
                                <v-col cols="5">
                                  <!-- <v-text-field
                                    label="Street Address"
                                    required
                                    type="text"
                                    v-model="mailStrAddress"
                                    clearable
                                    dense
                                  ></v-text-field> -->
                                   <v-text-field
                                      id="mail_address"
                                      label="Address in GTA (ex: 247 Sheppard Ave. East)"
                                      required
                                      dense
                                      :rules="mailAddressRules"
                                      type="text"
                                      v-model="mailStrAddress"
                                      :error-messages="errorMessage"
                                      clearable
                                      class="align-self-stretch"
                                    />
                                </v-col>
                                <v-col cols="3">
                                  <!-- <v-text-field
                                    label="City"
                                    type="text"
                                    v-model="mailCity"
                                    clearable
                                    dense
                                  ></v-text-field> -->
                                  <v-select 
                                  :items="regions" 
                                  label="City"  
                                  readonly
                                  v-model="mailCity" 
                                  dense></v-select>
                                </v-col>

                                <v-col cols="2">
                                  <v-text-field
                                    label="State / Country"
                                    type="text"
                                    placeholder="Ontario, Canada"
                                    readonly
                                    value="Ontario, Canada"
                                    dense
                                  ></v-text-field>
                                </v-col>

                                <v-col cols="2">
                                  <v-text-field
                                    :rules="mailingPostalCodeRules"
                                    label="Postal Code"
                                    required
                                    hint="Canadian Postal Code"
                                    type="text"
                                    v-model="mailPostalCode"
                                    readonly
                                    counter="7"
                                    dense
                                  >
                                  </v-text-field>
                                </v-col>
                              </v-row>
                              <v-alert
                                dense
                                outlined
                                type="warning"
                                :value="mailingInfo"
                              >
                                Mailing Info has to be completed once started
                              </v-alert>
                            </v-container>
                          </v-card>
                        <!-- </template>
                        <span
                          >Correct mailing address helps us to mail you gift
                          cards</span
                        >
                      </v-tooltip> -->
                    </v-col>
                  </v-row>
                  <!-- Pet -->
                  <v-row justify="start">
                    <v-col cols="6">
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-card outlined hover v-on="on">
                            <v-card-title class="primary--text"
                              >Adopt a Pet</v-card-title
                            >
                            <!-- <v-container> -->
                            <!-- <v-col> -->
                            <!-- <v-sheet
                              class="mx-auto"
                              elevation="0"
                              max-width="400"
                            > -->
                            <v-slide-group
                              show-arrows
                              v-model="petChoice"
                              mandatory
                              center-active
                            >
                              <v-slide-item
                                v-for="pet in pets"
                                :key="pet.petName"
                                v-slot:default="{ active, toggle }"
                                :value="pet.petName"
                              >
                                <v-tooltip bottom color="primary lighten-1">
                                  <template v-slot:activator="{ on }">
                                    <v-card
                                      :color="
                                        active ? 'primary' : 'primary lighten-4'
                                      "
                                      class="ma-4"
                                      height="200"
                                      width="100"
                                      @click="toggle"
                                      v-on="on"
                                    >
                                      <!-- @hover="introShow = true" -->
                                      <v-row
                                        class="fill-height"
                                        align="center"
                                        justify="center"
                                      >
                                        <v-img :src="pet.petImgUrl"></v-img>
                                        <v-scale-transition>
                                          <v-icon
                                            v-if="active"
                                            color="white"
                                            size="48"
                                            v-text="'mdi-close-circle-outline'"
                                          ></v-icon>
                                        </v-scale-transition>
                                      </v-row>
                                    </v-card>
                                  </template>
                                  <p>
                                    {{ petSpecie(pet.petName) }}
                                    {{ petRealName(pet.petName) + ' ' + pet.petPerformance }}
                                  </p>
                                </v-tooltip>
                              </v-slide-item>
                            </v-slide-group>
                            <!-- </v-sheet> -->
                            <!-- </v-row> -->
                            <!-- </v-container> -->
                          </v-card>
                        </template>
                        <span>Adopt a pet to bring fortune and wealth</span>
                      </v-tooltip>
                    </v-col>
                    <v-col cols="6" >
                      <!-- <v-switch
                        :label="`Receive Flyer: Yes`"
                        readonly
                      ></v-switch> -->
                      <!-- <v-row class="mb-12"> -->
                      <!-- <v-img 
                      src="https://www.animatedimages.org/data/media/349/animated-treasure-image-0041.gif" 
                      height="80" width="80" class="ma-auto" v-if="tranStart"></v-img> -->
                    <!-- </v-row> -->

                    <!-- Reward Silver -->
                       <transition-group name="fade-down" v-if="!resident.profileFilled">
                          <span
                            style="right: 40px; bottom: 200px; position: absolute"
                            class="text-h5 silver--text font-weight-bold"
                            key="2"
                            v-if="tranStart"
                            >
                            <v-img src="/static/animated-money-image-0013.gif" 
                            height="60" width="60" contain class="ml-5" />
                             <v-img 
                            src="/static/animated-treasure-image-0041.gif" 
                            height="80" width="80" class="ma-auto" v-if="tranStart"></v-img> 
                            +{{ $filters.formatIntAmount(10000) }}</span
                          >
                        </transition-group>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-row justify="end">
                        <v-btn
                          :disabled="
                            loading ||
                            personalInfo ||
                            mailingInfo ||
                            !isFormValid
                          "
                          medium
                          depressed
                          color="primary lighten-1"
                          type="submit"
                          class="d-inline-block mr-2"
                          @click="handleUpdateProfile"
                        >
                          <span slot="loader" class="custom-loader">
                            <v-icon>cached</v-icon>
                          </span>
                          Save
                        </v-btn>
                        <v-btn
                          color="primary lighten-1"
                          outlined
                          @click="handleCancel"
                          class="d-inline-block mr-6 ml-1"
                          depressed
                          text
                          plain
                          medium
                        >
                          Cancel
                        </v-btn>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-container>
          </v-card>
        </v-container>
      <!-- </v-col> -->
    </v-row>
    <CustomDialog
      v-model="showDialog"
      @yes-leave="yesLeave"
      @abort-leave="abortLeave"
      ref="dia"
      component="profile"
    />

    <AvatarCropper
      v-model="changeAvatar"
      :resident="resident"
      @update-avatar="updateAvatar"
      @abort-avatar="abortAvatar"
    />
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import _ from "lodash"

import { CHECK_RESIDENTNAME } from "../queries/queries_query.js";
import gmapsInit from "../utils/gmaps";
import CustomDialog from "./CustomDialog.vue";
import AvatarCropper from "./AvatarCropper.vue";
import { eventBus_profile } from "../eventBus";
import { hobbies, religions, favoriteFood } from "../assets/constData";

// import { eventBus_signout } from "../eventBus";

export default {
  name: "Profile",
  components: { CustomDialog, AvatarCropper },
  data() {
    return {

      birthday: null,
      contentChanged: false,
      cancelTrue: false,
      changeAvatar: false,
      date: null,
      errorMessage: "",
      errorMessageNickName: "",
      gender: "",
      genderItems: ["Mr", "Ms", "They"],
      favoriteFood: favoriteFood.sort(),
      firstName: "",
      hobbies: hobbies.sort(),
      isFormValid: false,
      initialLat: null,
      initialLng: null,
      lastName: "",
      menu: false,
      mailingInfoAlert: false,
      myHobbies: [],
      myFavoriteFood: [],
      myBelief: "",
      mailAddressRules: [
        (mailAddress) =>
          !!mailAddress || "Mailing address is required",
      ],
      mailStrAddress: "",
      mailCity: "",
      mailPostalCode: "",
      mailingPostalCodeRules: [
        (postalCode) =>
          /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(
            postalCode.trim()
          ) || "Not a valid Canadian Postal Code",
      ],
      nickName: '',
      password: "",
      passwordConfirmation: "",
      passwordRules: [
        (password) => !!password || "Password is required",
        (password) =>
          password.length >= 8 || "Password must be at least 8 characters",
        (passwordConfirmation) =>
          passwordConfirmation === this.password || "Password must match",
      ],
      passwordEdit: false,
      petChoice: "",
      personalInfoAlert: false,
      postalCode: "",
      postalCodeRules: [
        (postalCode) => !!postalCode || "Postal Code is required !",
        (postalCode) =>
          /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(
            postalCode
          ) || "Not a valid Canadian Postal Code",
      ],
      profile: true,
      regions: ['Oshawa', 'Whitby', 'Etobicoke','Ajax', 'Pickering', 'North York', 'York', 'East York', 'Scarborough', 'Toronto', 'Markham', 'Richmond Hill', 'Newmarket', 'Thronehill', 'Mississauga', 'Brampton', 'Aurora', 'Vaughan'].sort(),
      residentName: "",
      residentNameEdit: false,
      residentNameRules: [
        (residentName) => !!residentName || "Resident Name is required !",
        (residentName) =>
          residentName.length >= 4 ||
          "Resident Name must be at least 4 characters",
      ],
      nickNameRules: [
        (nickName) => !!nickName || "Nickname is required !",
        (nickName) =>
          nickName.length >= 4 ||
          "Nickname must be at least 4 characters",
      ],
      residentNameOk: false,
      receiveOnlineFlyer: null,
      religions: religions.sort(),
      showDialog: false,
      signOut: false,
      spark: false,
      to: null,
      tranStart: false,
      updateProfile: false,
    };
  },
  beforeCreate() {
    // console.log(this.resident);
    // console.log("beforecreate");
  },
  created() {
    // console.log(this.resident);
    // console.log("created");
  },
  beforeMount() {
    // console.log(this.resident);
    // console.log("beforemount");
  },

  async mounted() {
    eventBus_profile.$emit("profile", this.profile);
    // console.log("mounted");
    try {
      // this.$$refs.form.reset();
      // console.log("mounted");
      // console.log(this.resident);
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

      window.addEventListener("beforeunload", function (event) {
        // console.log(event);
        // if (this.contentChanged) {
        // window.stop();
        event.returnValue = "ok";
        // }
      });
      var geocoder = new google.maps.Geocoder();
      // console.log(google);
      // [[-81.401806, 43.217693], [-77.679691, 44.319047]]
      // 43.036370, -82.056545 sw
      // 44.519412, -78.032275 ne
      const southWest = new google.maps.LatLng(43.03637, -82.056545);
      const northEast = new google.maps.LatLng(44.519412, -78.032275);
      const bounds = new google.maps.LatLngBounds(southWest, northEast);
      // console.log(bounds);
      // const resident = this.$store.getters.resident;
      // console.log(resident);

      // const resident = JSON.parse(localStorage.getItem("resident"));
      // Set Up Center
       if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          // console.log(position);
          // console.log(center);
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        });
      } else {
        console.log("not ok");
      }

      geocoder.geocode(
        {
          address: this.resident.postalCode,
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
              scaledSize: new google.maps.Size(40, 40),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(20, 20),
            };

            const marker = new google.maps.Marker({
              position: results[0].geometry.location,
              icon: image,
              // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
              title: "home",
              map: map,
              animation: google.maps.Animation.BOUNCE,
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

      // Define autocomplate
      autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById("postcode")),
        {
          types: ["geocode"],
          bounds: bounds,
          strictBounds: true,
        }
      );

      // set bound for autoComplete
      autocomplete.setBounds(bounds);
      // console.log(autocomplete.getBounds());
     

      // console.log(this.postalCode);
      // console.log(autocomplete.getPlace());

      
      //add listener change place by autocomplete and display marker
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        // console.log(place);
        // this.place = place;
        // console.log(this.place);
        // this.initialLat = (place.geometry.viewport.Ab.h + place.geometry.viewport.Ab.j) / 2 ;
        // this.initialLng = (place.geometry.viewport.Ua.h + place.geometry.viewport.Ua.j) / 2;
        this.initialLat = place.geometry.location.lat();
        this.initialLng = place.geometry.location.lng()
        // console.log(this.initialLat)
        // console.log(this.initialLng)
        const location = place.address_components[0].short_name;
        // const location = place.formatted_address;
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
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 20),
              };

              const marker = new google.maps.Marker({
                position: results[0].geometry.location,
                icon: image,
                // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
                title: "home",
                map: map,
                animation: google.maps.Animation.BOUNCE,
                // shape: shape,
                visible: true,
              });
              // marker.addListener("click", () => {
              //   console.log("clicked");
              //   this.spark = true;
              // });
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
      

      //autocomplate for mailing address
     const autocomplete_mail = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById("mail_address")),
        {
          types: ["geocode"],
          bounds: bounds,
          strictBounds: true,
        }
      );
      autocomplete_mail.setBounds(bounds);
      
       autocomplete_mail.addListener("place_changed", () => {
        this.errorMessage = null;
        // this.place = null;
        const place = autocomplete_mail.getPlace();

        console.log(place);
        // this.lat = place.geometry.location.lat()
        // this.lng = place.geometry.location.lng()
        // console.log(place.address_components[0].types[0]);
        if (place.address_components[0].types[0] !== "street_number") {
          this.errorMessage =
            place.formatted_address + "  is not a valid google map address";
          return;
        } else {
          // this.place = place;
          const location = place.formatted_address;
          // this.mailStrAddress = place.formatted_address;
          // this.vendorAddressStreetNo = place.address_components[0].short_name;
          // this.vendorAddressStreetName = place.address_components[1].short_name;
          this.mailStrAddress = place.address_components[0].short_name + ' ' + place.address_components[1].short_name

          this.mailCity =
            place.address_components[2].short_name == "Mississauga" ||
            place.address_components[2].short_name == "Brampton"
              ? place.address_components[2].short_name
              : place.address_components[3].short_name;
          const addressPC =
            place.address_components.length > 7
              ? place.address_components[7].short_name
              : place.address_components[6].short_name;
              console.log(addressPC)
              if(addressPC != this.postalCode) {
                this.errorMessage = "This address must match existing Postal Code!"
              }
        }

        // console.log(this.postalCode);
      });
      
      
      if (this.resident) {
        // console.log(resident.mailPostalCode);
        this.postalCode = this.resident.postalCode;
        this.residentName = this.resident.residentName;
        this.firstName = this.resident.firstName;
        this.lastName = this.resident.lastName;
        this.nickName = this.resident.nickName
        this.gender = this.resident.gender;

        // console.log(this.resident.birthday)
        // const newDate = new Date(+this.resident.birthday)
        // console.log(newDate)
        this.birthday = this.resident.birthday
          ? moment(new Date(+this.resident.birthday)).format("YYYY-MM-DD")
          : "";

        // console.log(Date.parse(this.resident.birthday))
        // console.log(moment(new Date(this.resident.birthday)).format("ll"))
        this.mailStrAddress = this.resident.mailStrAddress;
        this.mailCity = this.resident.mailCity;
        this.mailPostalCode = this.resident.mailPostalCode
          ? this.resident.mailPostalCode
          : this.resident.postalCode;
        this.petChoice = this.resident.pet.petName;
        this.myFavoriteFood = [...this.resident.favoriteFood];
        this.myHobbies = [...this.resident.hobbies];
        this.myBelief = this.resident.belief;
        this.initialLat = this.resident.initialLat
        this.initialLng = this.resident.initialLng
      }
    } catch (error) {
      console.error(error);
    }
  },

  computed: {
    ...mapGetters(["resident", "loading", "pets"]),

    mailingInfo() {
      if (this.mailPostalCode || this.mailStrAddress || this.mailCity) {
        if (!this.mailPostalCode || !this.mailStrAddress || !this.mailCity) {
          this.mailingInfoAlert = true;
          return true;
        } else {
          this.mailingInfoAlert = false;
          return false;
        }
      } else {
        return false;
      }
    },

    personalInfo() {
      // console.log(this.birthday);
      if (
        this.lastName ||
        this.firstName ||
        this.gender ||
        this.birthday ||
        this.myHobbies.length > 0 ||
        this.myFavoriteFood.length > 0 ||
        this.myBelief
      ) {
        if (
          !this.lastName ||
          !this.firstName ||
          !this.gender ||
          !this.birthday ||
          this.myHobbies.length == 0 ||
          this.myFavoriteFood.length == 0 ||
          !this.myBelief
        ) {
          this.personalInfoAlert = true;
          return true;
        } else {
          this.personalInfoAlert = false;
          return false;
        }
      } else {
        return false;
      }
    },
    //  birthday() {
    //   return this.date ? moment(this.date).format("dddd, MMMM Do YYYY") : "";
    // }
  },

  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = "YEAR"));
    },
    // cancelTrue(oldVal, newVal) {
    //   if (newVal == false) {
    //     this.spark = true;
    //   }
    // }
    postalCode(val){
      this.mailPostalCode = val
    }
  },
  methods: {
    abortAvatar() {
      this.changeAvatar = false;
    },

    abortLeave() {
      // console.log(this.to);
      // console.log(this.$refs.dia.hi);
      // console.log(this.$el);
      // this.$router.push(this.to);
      // if (this.signOut) {
      //   eventBus_profile.$emit("abortSignout", true);
      // }
      this.to = null;
      // console.log(this.to);
      this.signOut = false;
      this.showDialog = false;
    },

    handleCancel() {
      this.cancelTrue = true;
      // this.showDialog = true;
      this.$router.push("/");
    },

    handleResidentNameCheck() {
      // console.log("sparked");
      this.errorMessage = this.errorMessageNickName = "";
      if (this.residentName && this.nickName) {
        this.$store.commit("clearError");
        this.$apollo
          .query({
            query: CHECK_RESIDENTNAME,
            variables: { residentName: this.residentName ,nickName: this.nickName,
                        },
          })
          .then(({ data }) => {
            // console.log(data);
            if (data.checkResidentName.residentNameVal) {
              // if(nameType == 'residentName') {
              //   this.errorMessage =
              //   "The Resident Name has been registered, please change another or Signin";
              // } else {
                this.errorMessageNickName = 'this nick name has been taken '
              // }
              
            } else {
              this.residentNameOk = true;
            }
          });
      }
    },

    handleUpdateProfile() {
      this.tranStart = true;
      // setTimeout(() => {
      //   this.tranStart = false;
      // }, 2000);
      const resident = this.$store.getters.resident;
      // console.log(this.password);
      // console.log(new Date(this.birthday));
      const payload = {
        residentId: resident._id,
        residentName: this.residentName ? this.residentName : "",
        lastName: this.lastName ? _.capitalize(this.lastName)  : "",
        firstName: this.firstName ? _.capitalize(this.firstName)  : "",
        nickName:  this.nickName ? this.nickName : '',
        mailPostalCode: this.mailPostalCode
          ? this.postalCodeFormat(this.mailPostalCode)
          : null,
        mailStrAddress: this.mailStrAddress ? this.mailStrAddress : "",
        mailCity: this.mailCity ? this.mailCity : "",
        gender: this.gender ? this.gender : "",
        birthday: this.birthday ? new Date(this.birthday) : "",
        pet: this.petChoice ? this.petChoice : "",
        postalCode: this.postalCode ? this.postalCode : "",
        hobbies: this.myHobbies.length > 0 ? this.myHobbies : [],
        password: this.password ? this.password : "",
        favoriteFood: this.myFavoriteFood.length > 0 ? this.myFavoriteFood : [],
        belief: this.myBelief ? this.myBelief : "",
        initialLat: this.initialLat,
        initialLng: this.initialLng
      };
      // if (this.$refs.form.validate()) {
      // console.log(payload)
      this.updateProfile = true;
      this.$store.dispatch("updateProfile", payload);
      // this.$router.push("/");
      // }
    },

    postalCodeFormat(postalCode) {
      if (postalCode.length == 6) {
        const postalCodeFormatted = postalCode
          .slice(0, 3)
          .concat(" ", postalCode.slice(3));
        return postalCodeFormatted.toUpperCase();
      } else {
        return postalCode;
      }
    },
    petRealName(petName) {
      const index = petName.indexOf("_");
      return petName.slice(index + 1);
    },
    petSpecie(petName) {
      const index = petName.indexOf("_");
      return petName.slice(0, index);
    },

    save(birthday) {
      // console.log(birthday);
      this.$refs.menu.save(birthday);
    },

    yesLeave() {
      // console.log(this.to);
      this.profile = false;
      // eventBus_profile.$emit("profile", this.profile);
      this.showDialog = false;
      // if (this.signOut) {
      //   this.$router.push(this.to);
      //   // this.to = null;
      //   this.$store.dispatch("signoutResident");
      //   return;
      // }

      if (this.cancelTrue) {
        this.$router.push(this.to);
        this.signOut = false;
        eventBus_profile.$emit("profile", false);
        // this.to = null;
        return;
      }
      this.$router.push(this.to);
      this.signOut = false;
      this.to = null;
    },

    updateAvatar(image) {
      // this.updatedAvatar = image;
      this.changeAvatar = false;
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.to) {
      // console.log(this.to);
      // console.log(this.signOut);
      // if (this.signOut) {
      //   this.$store.dispatch("signoutResident");
      // }
      // this.$store.dispatch("signoutResident");
      this.to = null;
      eventBus_profile.$emit("profile", false);

      next();
    } else {
      if (this.updateProfile) {
        eventBus_profile.$emit("profile", false);
        next();
      }
      // if (this.signOut) {
      //   // this.showDialog = true;
      //   // this.to = to;
      //   // return;
      //   next();
      // }
      // console.log(this.showDialog);
      this.showDialog = true;
      // console.log(to);
      // console.log(this.showDialog);

      this.to = to;
      // if (to.name !== "home") {
      // }
    }
  },
};
</script>

<style lang="scss" scoped>
.fade-down-enter,
.fade-down-enter-active {
  transition: all 0.5s ease;
}
.fade-down-leave-active {
  transition: all 4s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>
