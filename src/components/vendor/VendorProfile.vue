<template>
  <v-container class="text-center mt-n12">
    <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="vendorProfileLoading" persistent fullscreen>
        <v-container fill-height>
          <v-row justify="center" align-content="center">
            <v-progress-circular
              indeterminate
              :size="60"
              :width="4"
              color="primary lighten-5"
            ></v-progress-circular>
          </v-row>
        </v-container>
      </v-dialog>
    </v-row>

    <!-- Vendor Profile Update -->

    <v-row>
      <v-col cols="12">
        <v-container>
          <v-card flat>
            <v-card-title class="headline primary  white--text">
              Vendor Profile
            </v-card-title>
            <!-- <v-container> -->
            <v-container>
              <v-form v-model="isProfile" lazy-validation ref="profile">
                <v-card flat outlined>
                  <v-container>
                    <v-row>
                      <!-- Change Password -->
                      <v-col cols="7">
                        <v-row>
                          <v-container>
                            <v-col cols="12">
                              <v-row justify="start" class="ml-3">
                                <span
                                  class="text-subtitle-1 font-weight-bold primary--text"
                                >
                                  Change Password ?
                                  <v-icon
                                    @click="passwordEdit = true"
                                    color="primary"
                                    small
                                    >mdi-grease-pencil</v-icon
                                  >
                                </span>
                              </v-row>
                            </v-col>
                          </v-container>
                        </v-row>
                        <v-row v-if="passwordEdit">
                          <v-col cols="6">
                            <v-text-field
                              :rules="passwordRules"
                              label="New Password"
                              placeholder=""
                              prepend-icon="extension"
                              type="password"
                              v-model.trim="password"
                              required
                              clearable
                              counter="8"
                              :error-messages="passwordErrMsg"
                            >
                            </v-text-field>
                          </v-col>

                          <v-col cols="6">
                            <v-text-field
                              :rules="passwordConfirmRules"
                              label="Confirm Password"
                              v-model.trim="passwordConfirmation"
                              prepend-icon="gavel"
                              type="password"
                              required
                              counter="8"
                              clearable
                              :error-messages="passwordConfirm"
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                      </v-col>
                      <!-- Change Business Title -->
                      <v-col cols="5" class="mt-3">
                        <v-row>
                          <!-- <v-container> -->
                          <v-col cols="12">
                            <v-row justify="start" class="ml-1">
                              <span
                                class="text-subtitle-1 font-weight-bold primary--text"
                              >
                                Business Title:<span class="text-subtitle-2 mx-2 font-weight-bold fontColor--text">{{ vendor.businessTitle }} </span> 
                                <!-- <v-icon
                                  @click="titleEdit = true"
                                  color="primary"
                                  small
                                  >mdi-grease-pencil</v-icon
                                > -->
                              </span>
                            </v-row>
                          </v-col>
                          <!-- </v-container> -->
                        </v-row>
                        <!-- <v-row v-if="titleEdit" class="mt-3">
                          <v-col cols="12">
                            <v-text-field
                              :rules="businessTitleRules"
                              label="Business Title"
                              required
                              hint="Business Name Has To Be 4 Characters At Least"
                              type="text"
                              v-model.trim="vendor.businessTitle"
                              clearable
                              :error-messages="errorMessage"
                              @blur="handleBusinessTitleCheck"
                            >
                            </v-text-field>
                          </v-col>
                        </v-row> -->
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>

                <v-card flat outlined>
                  <v-container>
                    <v-row>
                      <!-- Tagline -->
                      <v-col cols="6">
                        <v-container>
                          <v-row class="ml-1">
                            <span
                              class="text-subtitle-1 font-weight-bold primary--text"
                            >
                              Tagline: <span class="text-subtitle-2 mr-2 fontColor--text"> {{ vendor.tagline }}</span> 
                              <v-icon
                                @click="taglineEdit = true"
                                color="primary"
                                small
                                >mdi-grease-pencil</v-icon
                              >
                            </span>
                          </v-row>

                          <v-row v-if="taglineEdit">
                            <v-col cols="12">
                              <v-text-field
                                label="Tagline(Not more than 50 letters)"
                                counter="50"
                                v-model.trim="vendor.tagline"
                                :rules="taglineRule"
                                type="text"
                                required
                                clearable
                              >
                              </v-text-field>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-col>
                      <!-- Logo -->
                      <v-col cols="6">
                        <v-row justify="center">
                          <v-avatar size="150" tile class="rounded-lg">
                            <v-img
                              :src="logo"
                              alt="Logo"
                              height="100" 
                              width="120"
                              contain
                            ></v-img>
                            <v-icon
                              @click.native="addLogo = true"
                              color="primary lighten-1"
                              class="d-block mt-8 pl-2"
                              left
                              small
                            >
                              mdi-grease-pencil
                            </v-icon>
                          </v-avatar>
                        </v-row>
                      </v-col>
                    </v-row>
                    <!-- Business Categories -->
                    <v-row>
                      <v-col cols="12">
                        <v-card hover flat>
                          <v-card-title class="primary--text"
                            >Business Categories</v-card-title
                          >
                          <v-container>
                            <v-row>
                              <!-- Products Category -->
                              <v-col cols="4">
                                <v-select
                                  v-model="productSelections"
                                  :items="productsCategoriesItems"
                                  small-chips
                                  label="Products ( non-restaurant items) "
                                  multiple
                                  clearable
                                  deletable-chips
                                  :disabled="restSelections.length > 0"
                                  @change="handleProductSubCategory"
                                ></v-select>
                                <v-select
                                  v-model="productDetailedSelections"
                                  :items="productSubCategory"
                                  small-chips
                                  label="Subcategories"
                                  :disabled="productSelections.length==0"
                                  multiple
                                  clearable
                                  deletable-chips
                                ></v-select>
                                <!-- v-if="productSubCategory.length > 0" -->
                              </v-col>
                              <!-- Service Category -->
                              <v-col cols="4">
                                <v-select
                                  v-model="serviceSelections"
                                  :items="servicesCategoriesItems"
                                  small-chips
                                  label="Service ( non-restaurant items) "
                                  multiple
                                  clearable
                                  deletable-chips
                                  @change="handleServiceSubCategory"
                                  :disabled="restSelections.length > 0"
                                ></v-select>
                                <v-select
                                  v-if="serviceSubCategory.length > 0"
                                  v-model="serviceDetailedSelections"
                                  :rules="serviceDetailedSelectionsRules"
                                  :items="serviceSubCategory"
                                  small-chips
                                  label="Subcategories"
                                  multiple
                                  clearable
                                  deletable-chips
                                ></v-select>
                              </v-col>
                              <!-- Restaurant Category -->
                              <v-col cols="4">
                                <v-select
                                  v-model="restSelections"
                                  :items="restaurantCategories"
                                  small-chips
                                  label="Restaurant & Bars"
                                  multiple
                                  clearable
                                  deletable-chips
                                  :disabled="
                                    productSelections.length > 0 ||
                                    serviceSelections.length > 0
                                  "
                                ></v-select>
                              </v-col>
                            </v-row>
                          </v-container>
                          <v-alert
                            dense
                            outlined
                            type="error"
                            v-if="categoryCheck"
                            class="d-block mt-3"
                          >
                            At least one of categories has to be selected
                          </v-alert>
                        </v-card>
                      </v-col>
                    </v-row>
                    <!-- Business Address -->
                    <v-row>
                      <v-col cols="12">
                        <v-card hover flat>
                          <v-card-title class="primary--text"
                            >Premises Address</v-card-title
                          >
                          <v-container class="mt-n4">
                            <v-row>
                              <v-col cols="6" class="d-flex flex-column justify-center align-center">
                                <!-- <v-container> -->
                                  <!-- Business  Map -->
                                  <!-- <v-row justify="center"> -->
                                    <h2 style="color: #6f5fc6">My Business</h2>
                                    <div
                                      id="map"
                                      justify-center
                                      class="mb-0 py-0 mt-3"
                                    ></div>
                                    <v-text-field
                                      id="business_address"
                                      label="Address in GTA (ex: 247 Sheppard Ave. East)"
                                      required
                                      type="text"
                                      :rules="businessAddressRules"
                                      v-model="inputPlace"
                                      :error-messages="errMsg"
                                      clearable
                                      class="align-self-stretch"
                                    >
                                    </v-text-field>
                                  <!-- </v-row>
                                </v-container> -->
                              </v-col>
                              <v-col cols="6">
                                <v-container>
                                  <v-container>
                                    <v-row>
                                      <v-col cols="12" v-if="place">
                                        <v-text-field
                                          label="Unit No."
                                          type="text"
                                          v-model.number="unitNo"
                                          clearable
                                        ></v-text-field>
                                        <v-text-field
                                          label="Street No."
                                          required
                                          type="text"
                                          v-model="vendorAddressStreetNo"
                                          readonly
                                        ></v-text-field>
                                        <v-text-field
                                          label="Street Name"
                                          v-model="vendorAddressStreetName"
                                          type="text"
                                          readonly
                                        ></v-text-field>

                                        <v-text-field
                                          label="City"
                                          v-model="vendorAddressCity"
                                          type="text"
                                          readonly
                                        ></v-text-field>

                                        <v-text-field
                                          label="State / Country"
                                          type="text"
                                          value="Ontario, Canada"
                                          readonly
                                        ></v-text-field>

                                        <v-text-field
                                          label="Postal Code"
                                          v-model="vendorPostalCode"
                                          type="text"
                                          readonly
                                        >
                                        </v-text-field>
                                      </v-col>
                                    </v-row>
                                  </v-container>
                                </v-container>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>

                <v-card flat outlined>
                  <v-card flat>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-card flat>
                            <v-card-title class="primary--text"
                              >About Us</v-card-title
                            >
                            <v-textarea
                              shaped
                              auto-grow
                              counter
                              v-model="aboutUs"
                              required
                              :rules="aboutUsRules"
                              filled
                              clearable
                            ></v-textarea>
                          </v-card>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-file-input
                            label="Load business photos ( jpeg, png, jpg, gif ) only, Not more than 10MB"
                            color="primary"
                            show-size
                            small-chips
                            multiple
                            counter
                            dense
                            @change="onFilePicked"
                            :error-messages="errMsgPic"
                            v-model="photoFiles"
                          ></v-file-input>
                        </v-col>
                      </v-row>
                      <v-row>
                        <!-- <v-row justify="center">
                          <h4 class="ml-30">
                            Total Size:
                            {{ Math.round(picBase64Size / 1048576) }}MB
                          </h4></v-row
                        > -->

                        <v-col cols="12">
                           <v-alert
                              dense
                              outlined
                              type="error"
                              v-if="photosUpload.length == 0"
                              class="d-block mt-3"
                            >
                              At least one business photo is needed
                            </v-alert>
                          <v-slide-group show-arrows>
                            <v-slide-item
                              v-for="(photo, index) in photosUpload"
                              :key="index"
                              v-slot:default="{ toggle }"
                            >
                              <v-card
                                class="ma-4"
                                @click="toggle"
                                height="150"
                                width="150"
                                flat
                              >
                                <v-row
                                  class="fill-height"
                                  align="center"
                                  justify="center"
                                >
                                  <v-col cols="12">
                                    <v-icon
                                      @click.native="deleteBuzPhoto(index)"
                                      color="primary lighten-1"
                                      class="d-block mb-2"
                                    >
                                      <!-- mdi-close -->
                                      mdi-close-circle-outline
                                    </v-icon>
                                    <v-img
                                      :src="photo"
                                      height="150"
                                      width="150"
                                    >
                                    </v-img>
                                  </v-col>

                                  <!-- <v-scale-transition>

                                      </v-scale-transition> -->
                                </v-row>
                              </v-card>
                            </v-slide-item>
                          </v-slide-group>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-card hover flat>
                            <v-container>
                              <v-card-title class="primary--text"
                                >Contact</v-card-title
                              >
                              <v-row>
                                <v-col cols="3">
                                  <v-text-field
                                    text
                                    clearable
                                    v-model.number="businessPhone"
                                    label="Telephone"
                                    v-phoneMask="phoneMask"
                                    required
                                    append-outer-icon="mdi-plus"
                                    @click:append-outer="addPhoneNo"
                                    :value="businessPhone"
                                    hint="Click + to add phone No."
                                  >
                                    <!-- @blur.once="inputPhoneNo" -->
                                  </v-text-field>
                                  <v-container class="mt-n5">
                                    <v-chip-group column>
                                      <v-chip
                                        v-for="(
                                          phone, index
                                        ) in processBusinessPhones"
                                        :key="index"
                                        small
                                        close
                                        @click:close="
                                          businessPhones.splice(index, 1)
                                        "
                                      >
                                        {{ phone }}
                                      </v-chip>
                                    </v-chip-group>
                                  </v-container>
                                </v-col>
                                <v-col cols="2">
                                  <v-text-field
                                    text
                                    v-model.trim="businessFax"
                                    label="Fax"
                                    v-phoneMask="phoneMask"
                                    clearable
                                  >
                                  </v-text-field>
                                </v-col>
                                <v-col cols="4">
                                  <v-text-field
                                    text
                                    v-model.trim="businessEmail"
                                    label="Business Email"
                                    required
                                    :rules="businessEmailRules"
                                    clearable
                                  >
                                  </v-text-field>
                                  
                                </v-col>
                                <v-col cols="3">
                                <v-switch
                                  v-model="crossBoundaryBusiness"
                                  dense
                                  :label="crossBoundaryBusiness ? 'Cross Boundary' : 'No Cross Boundary'"
                                ></v-switch>
                                </v-col>
                              </v-row>
                              <!-- website -->
                              <v-row>
                                <v-col cols="6">
                                  <v-text-field
                                    text
                                    dense
                                    v-model.trim="website"
                                    label="Offical Website"
                                    clearable
                                  >
                                  </v-text-field>
                                </v-col>
                                  <!-- max delivery distance -->
                                    <v-col cols="3">
                                      <v-text-field
                                        text
                                        dense
                                        suffix="Km"
                                        v-model.number="maxDeliveryDistance"
                                        label="Max Delivery Distance"
                                        hint="No Delivery? Leave it 0"
                                      >
                                      </v-text-field>
                                    </v-col>
                                    <!-- delivery fees -->
                                    <v-col cols="3">
                                      <v-text-field
                                        text
                                        dense
                                        prefix="$"
                                        v-model.number="deliveryFees"
                                        label="Delivery Fees"
                                        :disabled="maxDeliveryDistance<=0"
                                      >
                                      </v-text-field>
                                    </v-col>
                               </v-row>
                              <v-row class="d-flex justify-start align-center"> 
                                <v-col cols="3">
                                    <v-select
                                      label="Week Day"
                                      v-model="weekDaySelected"
                                      outlined
                                      :items="weekDaysSelection">
                                    </v-select>
                                  </v-col>
                                  <!-- Open Time -->
                                  <v-col cols="3">
                                      <v-menu
                                      ref="open"
                                      v-model="menu1"
                                      :close-on-content-click="false"
                                      :nudge-right="40"
                                      :return-value.sync="openTime"
                                      transition="scale-transition"
                                      offset-y
                                      max-width="290px"
                                      min-width="290px"
                                    >
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                          v-model="openTime"
                                          label="Open Time"
                                          prepend-icon="mdi-clock-time-four-outline"
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"
                                          :disabled="!weekDaySelected || close != null "
                                        ></v-text-field>
                                      </template>
                                      <v-time-picker
                                        v-if="menu1"
                                        v-model="openTime"
                                        full-width
                                        @click:minute="$refs.open.save(openTime)"
                                      ></v-time-picker>
                                    </v-menu>
                                  </v-col>
                                  <!-- Close Time -->
                                  <v-col cols="3">
                                      <v-menu
                                        ref="close"
                                        v-model="menu2"
                                        :close-on-content-click="false"
                                        :nudge-right="40"
                                        :return-value.sync="closeTime"
                                        transition="scale-transition"
                                        offset-y
                                        max-width="290px"
                                        min-width="290px"
                                      >
                                        <template v-slot:activator="{ on, attrs }">
                                          <v-text-field
                                            v-model="closeTime"
                                            label="Close Time"
                                            prepend-icon="mdi-clock-time-four-outline"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                            :disabled="!weekDaySelected || close != null "
                                          ></v-text-field>
                                        </template>
                                        <v-time-picker
                                          v-if="menu2"
                                          v-model="closeTime"
                                          full-width
                                          @click:minute="$refs.close.save(closeTime)"
                                        ></v-time-picker>
                                      </v-menu>
                                  </v-col>
                                  <v-col cols="1">
                                    <v-checkbox
                                        label="Close"
                                        value="Close"
                                        class="mt-1"
                                        v-model="close"
                                        :disabled="!weekDaySelected"
                                      ></v-checkbox>
                                  </v-col>
                                  <v-col cols="1" class="mb-2">
                                    <v-btn small plain color="primary" :disabled="okToSave" @click="saveBusinessHours"><v-icon>mdi-check</v-icon></v-btn>
                                  </v-col>
                              </v-row>
                              <v-row v-for="(hour, i) in businessHours" :key="i" class="ml-3">
                                <v-col cols="1" class="my-n1">{{hour[0]}}:</v-col>
                                <v-col cols="2" class="my-n1">{{hour[1]}}</v-col>
                                <v-col cols="1" class="my-n1"><v-icon color="primary" @click="businessHours.splice(i, 1)" small>mdi-delete</v-icon></v-col>
                              </v-row>
                            </v-container>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card>
                  <v-row justify="center" class="mb-6">
                    <v-btn
                      color="primary"
                      class="d-inline-block mr-2"
                      @click.native="handleUpdateVendor"
                      :disabled="businessHours.length < 7"
                      depressed
                    >
                      <span slot="loader" class="custom-loader">
                        <v-icon>cached</v-icon>
                      </span>
                      Save
                    </v-btn>
                    <v-btn text outlined @click="handleCancel" color="primary">Cancel</v-btn>
                  </v-row>

                  <v-alert
                    dense
                    outlined
                    type="error"
                    v-if="formAlert"
                    class="d-block mt-3"
                  >
                    There are errors with some items
                  </v-alert>
                </v-card>
              </v-form>
            </v-container>
          </v-card>
        </v-container>
      </v-col>
    </v-row>
    <CustomDialog
      v-model="showDialog"
      @yes-leave="yesLeave"
      @abort-leave="abortLeave"
      ref="dia"
      component="Update Vendor Profile"
    />

    <LogoCropper
      v-model="addLogo"
      :preLogo='logo'
      @update-logo="updateLogo($event)"
      @abort-logo="abortLogo"
    />
  </v-container>
</template>

<script>
// import moment from "moment";
import { mapGetters } from "vuex";
import { mask } from "vue-the-mask";
import { CHECK_BUSINESSTITLE } from "../../queries/queries_query.js";
import { VENDOREMAIL_CHECK } from "../../queries/queries_query.js";
import gmapsInit from "../../utils/gmaps";
import CustomDialog from "../CustomDialog.vue";
import LogoCropper from "./LogoCropper.vue";
import { eventBus_vendorParlour } from "../../eventBus";
import _ from "lodash";

export default {
  name: "VendorProfile",
  directives: {
    phoneMask: mask,
  },
  components: { CustomDialog, LogoCropper },
  data() {
    return {
      aboutUs: null,
      aboutUsRules: [(aboutUs) => !!aboutUs || "About Us is required"],
      addLogo: false,
      businessPhones: [],
      businessPhone: null,
      businessFax: null,
      businessEmail: null,
      businessEmailRules: [
        (businessEmail) => !!businessEmail || "Business Email is required",
      ],
      businessHours: [],
      // businessPhotosToShow: [],
      businessAddress: null,
      businessAddressRules: [
        (businessAddress) =>
          !!businessAddress || "Business address is required",
      ],
      businessTitle: null,
      businessTitleEdit: false,
      businessTitleRules: [
        (businessTitle) => !!businessTitle || "Business Title is required !",
        (businessTitle) =>
          businessTitle.length >= 4 ||
          "Business Title must be at least 4 characters",
      ],
      businessTitleOk: false,
      cancelTrue: false,
      categoryCheck: false,
      categoryItemsProtected: [],
      closeTime: null,
      close: null,
      crossBoundaryBusiness: false,
      deliveryFees: 0,
      email: null,
      emailRules: [
        (email) => !!email || "Email is required",
        (email) => /.@+./.test(email) || "Email must be valid",
      ],
      emailSent: false,
      errMsg: "",
      errMsgPic: "",
      errorMessage: "",
      formAlert: false,
      isProfile: true,
      
      inputPlace: null,
      logo: null,
      lat: 0,
      lng: 0,
      mailingPostalCodeRules: [
        (postalCode) => !!postalCode || "Postal Code is required !",
        (postalCode) =>
          /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(
            postalCode
          ) || "Not a valid Canadian Postal Code",
      ],
      maxDeliveryDistance: 0,
      menu: false,
      menu2: false,
      menu1: false,
      openTime: null,
      picBase64Size: 0,
      photoFiles: [],
      photosUpload: [],
      // photoList: [],
      phoneMask: "(###)###-####",
      place: null,
      productSelections: [],
      productDetailedSelections: [],
      productDetailedSelectionsErr: null,
      productSubCategory: [],
      password: null,
      passwordConfirmation: null,
      passwordConfirmRules: [
        (password) => password === this.password || "Password must match!",
      ],
      passwordRules: [(password) => !!password || "Password is required"],
      passwordEdit: false,
      postalCode: "",
      restSelections: [],
      restSelectionsRules: [
        (selections) => selections.length || "At least one must be selected",
      ],
      sameEmail: false,
      servicesSubCategory: [],
      serviceSelections: [],
      serviceDetailedSelections: [],
      serviceDetailedSelectionsRules: [
        (selections) =>
          selections.length > 0 || "Subcategories must be selected",
      ],
      serviceDetailedSelectionsErr: null,
      serviceSubCategory: [],
      spark: false,
      showDialog: false,
      stepper: 1,
      tagline: "",
      taglineEdit: false,
      taglineRule: [(tagline) => !!tagline || "Tagline is required !"],
      titleEdit: false,
      to: null,
      toSave: false,
      unitNo: null,
      vendorAddressStreetNo: null,
      vendorAddressStreetName: null,
      vendorAddressCity: null,
      vendorPostalCode: null,
      website: null,
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekDaySelected: null
      // birthdayPicker: new Date().toISOString().substr(0, 10),
    };
  },

  // created() {
  //   // this.$store.dispatch("getProductCategory");
  //   // console.log(this.productsCategories);
  //   window.addEventListener("beforeunload", function (event) {
  //     // console.log(event);
  //     // if (this.contentChanged) {
  //     // window.stop();
  //     event.returnValue = "ok";
  //     // }
  //   });
  // },

  created() {
    // console.log("signup vendor");
     window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      // if (this.contentChanged) {
      // window.stop();
      event.returnValue = "ok";
      // }
    });

    eventBus_vendorParlour.$emit("vendorParlour", true);
    // console.log(this.productsCategories);
    // console.log(this.servicesCategories);
    // console.log(this.restaurantCategories);
    if (this.vendor) {
      const { businessCategory } = this.vendor;
      this.logo = this.vendor.logo;
      businessCategory.map((item) => {
        // console.log(item);
        if (_.startsWith(item, "product")) {
          const firstLoc = item.indexOf("-");
          const lastLoc = item.lastIndexOf("-");
          const cate = item.slice(firstLoc + 1, lastLoc);
          const index = _.findIndex(this.productSelections, (select) => {
            return select === cate;
          });
          if (index == -1) {
            this.productSelections.push(cate);
          }
          if (this.productSelections.length > 0) {
            this.productSelections.map((selection) => {
              this.productsCategories.map((category) => {
                if (selection === category.category) {
                  category.items.map((item) => {
                     const index = this.allItemsCatalog.findIndex(each => each.subcategory == item)
                    if(index >= 0) {
                      this.categoryItemsProtected.push("product-" + category.category + "-" + item)
                    } else {
                       this.productSubCategory.push("product-" + category.category + "-" + item);
                    }
                   
                   
                  });
                }
              });
            });
          }
          this.productSubCategory.sort();
          this.productDetailedSelections.push(item);
          // console.log(this.productDetailedSelections)
        }

        if (_.startsWith(item, "service")) {
          const firstLocService = item.indexOf("-");
          const lastLocService = item.lastIndexOf("-");
          const cateService = item.slice(firstLocService + 1, lastLocService)
           const index = _.findIndex(this.serviceSelections, (select) => {
            return select === cateService;
          });
          if (index == -1) {
            this.serviceSelections.push(cateService);
             this.servicesCategories.map((category) => {
                if (cateService === category.category) {
                  category.items.map((item) => {
                    const index = this.allItemsCatalog.findIndex(each => each.subcategory == item)
                    if(index >= 0) {
                      this.categoryItemsProtected.push("service-" + category.category + "-" + item)
                    } else {
                       this.serviceSubCategory.push(
                      "service-" + category.category + "-" + item
                    );
                    }
                   
                  });
                }
              });
          }
          // console.log(this.serviceSelections)
          // console.log(this.servicesCategories)
         
          this.servicesSubCategory.sort()
          this.serviceDetailedSelections.push(item);

          // console.log(this.serviceSubCategory)
          // console.log(this.serviceDetailedSelections)
        }

        if (!_.startsWith(item, "product") && !_.startsWith(item, "service")) {

           const index = this.allItemsCatalog.findIndex(each => each.subcategory == item)
                    if(index >= 0) {
                      this.categoryItemsProtected.push(item)
                    } else {
                       this.restSelections.push(item);
                    }
        }
      });
    }
    // console.log(this.productDetailedSelections);
    // this.vendorAddressUnitNo = this.vendor.businessUnitNo;
    // this.vendorAddressStreetNo = this.vendor.businessStreetNo;
    // this.vendorAddressStreetName = this.vendor.businessStreetName;
    // this.vendorAddressCity = this.vendor.businessCity;
    // this.vendorAddressPostalCode = this.vendor.businessPostalCode;
    this.inputPlace =
      this.vendor.businessStreetNo +
      " " +
      this.vendor.businessStreetName +
      " " +
      this.vendor.businessCity +
      " " +
      this.vendor.businessPostalCode;
    this.businessPhones = this.vendor.businessPhones
      ? this.vendor.businessPhones
      : [];
    this.businessFax = this.vendor.businessFax ? this.vendor.businessFax : "";
    this.businessEmail = this.vendor.businessEmail;
    this.aboutUs = this.vendor.aboutUs;
     // this.businessPhotos = this.vendor.businessPhotos;
    this.photosUpload = [...this.vendor.photoList];
    this.crossBoundaryBusiness = this.vendor.crossBoundaryBusiness
    // console.log(this.photosUpload);
    // this.businessPhotosToShow = this.photosUpload
    // .map((item) => {
    //   return `./${this.vendor.businessTitle}/${item}`;
    // });
    // this.businessPhotos = this.vendor.businessPhotos;
    // this.businessPhotos.map((pic) => {
    //   this.picBase64Size =
    //     this.picBase64Size +
    //     pic.length * (3 / 4) -
    //     (_.endsWith(pic, "==") ? 2 : 1);
    // });
    this.lat = this.vendor.lat
    this.lng = this.vendor.lng
    this.website = this.vendor.website;
    this.maxDeliveryDistance = this.vendor.maxDeliveryDistance
    this.deliveryFees = this.vendor.deliveryFees
    this.businessHours = this.vendor.businessHours.map(hour => {
      return [hour.weekDay, hour.time]
    })
  },

  async mounted() {
    // console.log("mounted");
    // console.log(this.productsCategories);
    window.scrollTo(0, 0);
    try {
      // this.$$refs.form.reset();
      console.log("mounted");
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
      geocoder.geocode(
        {
          address: this.vendor.businessPostalCode,
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
                "/static/buz_logo2.png",
              // "/static/buz_logo3.png",
              scaledSize: new google.maps.Size(40, 40),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(20, 20),
            };

            const marker = new google.maps.Marker({
              position: results[0].geometry.location,
              icon: image,
              // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
              title: 
              // this.businessTitle ? 
              // this.businessTitle : 
              "My Business",
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
            // alert(
            //   "Geocode was not successful for the following reason: " + status
            // );
            this.errMsgPic = "Not a valid google map address " + `(${status})`;
          }
        }
      );

      autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById("business_address")),
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
        });
      } else {
        console.log("not ok");
      }

      // console.log(this.postalCode);
      // console.log(autocomplete.getPlace());
      autocomplete.addListener("place_changed", () => {
        this.errMsg = null;
        // this.place = null;
        const place = autocomplete.getPlace();

        // console.log(place);
        this.lat = place.geometry.location.lat()
        this.lng = place.geometry.location.lng()
        // console.log(place.address_components[0].types[0]);
        if (place.address_components[0].types[0] !== "street_number") {
          this.errMsg =
            place.formatted_address + "  is not a valid google map address";
          return;
        } else {
          this.place = place;
          const location = place.formatted_address;
          this.inputPlace = place.formatted_address;
          this.vendorAddressStreetNo = place.address_components[0].short_name;
          this.vendorAddressStreetName = place.address_components[1].short_name;
          this.vendorAddressCity =
            place.address_components[2].short_name == "Mississauga" ||
            place.address_components[2].short_name == "Brampton"
              ? place.address_components[2].short_name
              : place.address_components[3].short_name;
          this.vendorPostalCode =
            place.address_components.length > 8
              ? place.address_components[8].short_name
              : place.address_components[7].short_name;
              console.log(place.address_components)

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
                    "/static/buz_logo2.png",
                  // "/static/buz_logo3.png",
                  scaledSize: new google.maps.Size(40, 40),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(20, 20),
                };

                const marker = new google.maps.Marker({
                  position: results[0].geometry.location,
                  icon: image,
                  // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
                  title: 
                  // this.businessTitle
                  //   ? this.businessTitle
                  //   : 
                    "My Business",
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
                // alert(
                //   "Geocode was not successful for the following reason: " + status
                // );
                this.errMsgPic =
                  "Not a valid google map address " + `(${status})`;
              }
            }
          );
        }

        // console.log(this.postalCode);
      });
    } catch (error) {
      console.error(error);
    }
  },

  beforeUpdate() {
    //   console.log(this.productsCategories);
  },

  // updated() {
  //   console.log(this.productsCategories);
  // },

  computed: {
    ...mapGetters([
      "allItemsCatalog",
      "vendorProfileLoading",
      "productsCategories",
      "servicesCategories",
      "restaurantCategories",
      "vendor",
      "inDesign",
    ]),

    okToSave() {
      if((this.openTime && this.closeTime) || this.close) {
        return false
      } else {
        return true
      }
    },

    passwordErrMsg() {
      if (this.password) {
        return this.password.length < 8
          ? "Password must be at least 8 characters"
          : null;
      }
    },

    passwordConfirm() {
      if (this.passwordConfirmation)
        return this.passwordConfirmation === this.password
          ? null
          : "Password must match";
    },

    productsCategoriesItems() {
      // console.log(this.productsCategories);
      return this.productsCategories
        .map((item) => {
          return item.category;
        })
        .sort();
    },

    processBusinessPhones() {
      if (this.businessPhones.length > 0) {
        return this.businessPhones;
      } else {
        // console.log(this.vendor.businessPhone);
        this.businessPhones = this.vendor.businessPhone;
        return this.vendor.businessPhone;
      }
    },
    servicesCategoriesItems() {
      return this.servicesCategories
        .map((item) => {
          return item.category;
        })
        .sort();
    },

     weekDaysSelection() {
      let list = []
      if(this.businessHours.length > 0) {
          for (let weekDay of this.weekDays) {
          let isIncluded = false
          this.businessHours.map(item => {
            if (item.includes(weekDay)) {
              isIncluded = true
            }
          })
          if(!isIncluded) {
            list.push(weekDay)
          }
        }
      } else {
        list = this.weekDays
      }
      
      
      return list
    }

    //  birthday() {
    //   return this.date ? moment(this.date).format("dddd, MMMM Do YYYY") : "";
    // }
  },

  watch: {
    isCategory(newVal) {
      // console.log(newVal);
    },
    isEmail(newVal) {
      // console.log(newVal);
    },
    isLandingPage(newVal) {
      // console.log(newVal);
    },
    // photoFiles(newVal, oldVal) {
    // console.log(oldVal);
    // console.log(newVal);
    // if (newVal.length === 0) {
    //   this.businessPhotos.splice(0, this.businessPhotos.length);
    // console.log(this.businessPhotos);
    //   }
    // },

    // place(newVal, oldVal) {
    //   console.log(newVal);
    //   console.log(oldVal);
    //   // if (newVal == "") {
    //   //   this.place = [];
    //   // }
    //   this.place = newVal;
    // },

    productSelections(newVal) {
      if (newVal.length == 0) {
        this.productSubCategory = [];
        this.productDetailedSelections = [];
      } else {
        _.remove(this.productDetailedSelections, function (selection) {
          let matchSelection = true;
          newVal.map((val) => {
            if (_.startsWith(selection, val)) {
              matchSelection = false;
            }
          });
          return matchSelection;
        });
        // console.log(this.productDetailedSelections);
        this.handleProductSubCategory;
      }
    },

    openTime(val) {
      console.log(val)
    },
    serviceSelections(newVal) {
      if (newVal.length == 0) {
        this.serviceSubCategory = [];
        this.serviceDetailedSelections = [];
      } else {
        _.remove(this.serviceDetailedSelections, function (selection) {
          let matchSelection = true;
          newVal.map((val) => {
            if (_.startsWith(selection, val)) {
              matchSelection = false;
            }
          });
          return matchSelection;
        });
        // console.log(this.serviceDetailedSelections);

        this.handleServiceSubCategory;
      }
    },

    // productDetailedSelections(newval, old) {
    //   console.log(newval);
    //   console.log(old);
    // },
  },

  methods: {
    abortLeave() {
      this.showDialog = false;
      this.to = null;
    },
    abortLogo() {
      this.addLogo = false;
    },
    addPhoneNo() {
      if (this.businessPhone) {
        this.businessPhones.push(this.businessPhone);
        // console.log(this.businessPhones);
        // this.businessPhone = null;
      }
    },
    deleteLogo() {
      this.logo = null;
    },
    deleteBuzPhoto(index) {
      this.errMsgPic = "";
      this.photosUpload.splice(index, 1)
            // this.picBase64Size =
      //   this.picBase64Size -
      //   this.businessPhotos[index].length * (3 / 4) -
      //   (_.endsWith(this.businessPhotos[index], "==") ? 2 : 1);
      // this.businessPhotosToShow.splice(index, 1);
      // console.log(this.businessPhotosToShow);
      // const indexOfUpload = _.findIndex(this.photosUpload, (item) => {
      //   return item.name == this.photoList[index];
      // });
      // console.log(indexOfUpload);
      // if (indexOfUpload > -1) {
      //   this.photosUpload.splice(indexOfUpload, 1);
      //   console.log(this.photosUpload);
      // }

      // this.photoList.splice(index, 1);
      // console.log(this.photoList);
      // console.log(this.businessPhotos);
      // if (picBase64Size / 1048576 > 10) {
      //   this.errMsgPic = "Total photos size can not be more than 10MB ";
      // }
      // this.picBase64Size =
      //   this.picBase64Size -
      //   this.businessPhotos[index].length * (3 / 4) -
      //   (_.endsWith(this.businessPhotos[index], "==") ? 2 : 1);
      // this.businessPhotos.splice(index, 1);
      // console.log(this.businessPhotos);
      // if (picBase64Size / 1048576 > 10) {
      //   this.errMsgPic = "Total photos size can not be more than 10MB ";
      // }
      // this.photoFiles.splice(index, 1);
    },
  
    formatPhone(phone) {
      console.log(phone);
      //Filter only numbers from the input
      let cleaned = ("" + phone).replace(/\D/g, "");

      //Check if the input is of correct length
      let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

      if (match) {
        return "(" + match[1] + ") " + match[2] + "-" + match[3];
      }

      return null;
    },
    handleCancel() {
      // console.log("cancel");
      this.showDialog = true;

      // this.$router.push("/");
       this.$router.replace("/");
    },
    handleProductSubCategory() {
      // this.productSubCategory = [];
      if (this.productSelections.length > 0) {
        this.productSelections.map((selection) => {
          this.productsCategories.map((category) => {
            if (selection === category.category) {
              category.items.map((item) => {
                this.productSubCategory.push(
                  "product-" + category.category + "-" + item
                );
              });
            }
          });
        });
      }
      return this.productSubCategory.sort();
    },
    handleServiceSubCategory() {
      // this.serviceSubCategory = [];
      if (this.serviceSelections.length > 0) {
        this.serviceSelections.map((selection) => {
          this.servicesCategories.map((category) => {
            if (selection === category.category) {
              category.items.map((item) => {
                this.serviceSubCategory.push(
                  "service-" + category.category + "-" + item
                );
              });
            }
          });
        });
      }
      return this.serviceSubCategory.sort();
    },
    handleCategoryCheck() {
      this.categoryCheck = false;
      if (
        this.restSelections.length > 0 ||
        this.productDetailedSelections.length > 0 ||
        this.serviceDetailedSelections.length > 0
      ) {
        this.stepper = 3;
      } else {
        this.categoryCheck = true;
      }
    },
    handleBusinessTitleCheck() {
      // console.log("sparked");
      this.isCategory = true;
      this.errorMessage = "";
      if (this.businessTitle) {
        this.$store.commit("clearError");
        this.$apollo
          .query({
            query: CHECK_BUSINESSTITLE,
            variables: { businessTitle: this.businessTitle },
          })
          .then(({ data }) => {
            console.log(data);
            if (data.checkBusinessTitle.businessTitleVal) {
              // this.$store.commit(
              //   "setError",
              //   "The email has been registered, please change another or Signin"
              // );
              this.errorMessage =
                "The Title has been registered, please change another";
              this.isCategory = false;
              // this.$refs.form.resetValidation();
            } else {
              this.isCategory = true;
            }
          });
      }
    },
    handleUpdateVendor() {
      // console.log(this.businessPhones);
      // console.log(this.$refs.profile.validate());
      // console.log(this.productDetailedSelections);
      // console.log(this.serviceDetailedSelections);
      this.formAlert = false;
      if (this.$refs.profile.validate()) {
        // console.log(this.businessPhones);
        let combinedBusinessCate =
          this.restSelections.length > 0
            ? this.restSelections
            : this.productDetailedSelections.concat(
                this.serviceDetailedSelections
              );
        // console.log(combinedBusinessCate);
        combinedBusinessCate = 
        // this.categoryItemsProtected.length > 0 ? 
        [...combinedBusinessCate, ...this.categoryItemsProtected] 
        // : [...combinedBusinessCate]
        const businessHoursToSave = this.businessHours.map(hour => {
            return { weekDay: hour[0], time: hour[1]}
        })
        // console.log(businessHoursToSave)

        this.$store.dispatch("updateVendorProfile", {
          tagline: this.tagline ? this.tagline : this.vendor.tagline,
          businessTitle: this.businessTitle
            ? this.businessTitle
            : this.vendor.businessTitle,
          email: this.vendor.email,
          password: this.password ? this.password : "",
          businessUnitNo: this.unitNo ? this.unitNo : this.vendor.unitNo,
          businessStreetNo: this.vendorAddressStreetNo
            ? this.vendorAddressStreetNo
            : this.vendor.businessStreetNo,
          businessStreetName: this.vendorAddressStreetName
            ? this.vendorAddressStreetName
            : this.vendor.businessStreetName,
          businessCity: this.vendorAddressCity
            ? this.vendorAddressCity
            : this.vendor.businessCity,
          businessPostalCode: this.vendorPostalCode
            ? this.vendorPostalCode
            : this.vendor.businessPostalCode,
          businessPhone:
            this.businessPhones.length > 0
              ? this.businessPhones
              : this.vendor.businessPhones,
          businessFax: this.businessFax
            ? this.businessFax
            : this.vendor.businessFax,
          businessEmail: this.businessEmail
            ? this.businessEmail
            : this.vendor.businessEmail,
          logo: this.logo ? this.logo : this.vendor.logo,
          // businessPhotos: this.photosUpload,
          // businessPhotos:
          //   this.businessPhotos.length > 0
          //     ? this.businessPhotos
          //     : this.vendor.businessPhotos,
          businessHours: businessHoursToSave,
          businessCategory:
            combinedBusinessCate.length > 0
              ? combinedBusinessCate
              : this.vendor.businessCategory,
          aboutUs: this.aboutUs ? this.aboutUs : this.vendor.aboutUs,
          photoList: this.photosUpload,
          website: this.website ? this.website : this.vendor.website,
          deliveryFees: this.deliveryFees,
          maxDeliveryDistance: this.maxDeliveryDistance,
          crossBoundaryBusiness: this.crossBoundaryBusiness,
          lat: this.lat,
          lng: this.lng
        });
        this.toSave = true;
        this.$store.commit("setInDesign", false);
      } else {
        this.formAlert = true;
      }
    },

    inputPhoneNo() {
      if (this.businessPhone) {
        this.businessPhones.push(this.businessPhone);
        // this.businessPhone = null;
      }
    },
    onFilePicked(File) {
      // console.log(event.name);
      this.errMsgPic = "";
      // if (this.businessPhotos.length + File.length > 6) {
      //   this.errMsgPic = "Not more than 6 photos Please ! ";
      //   return;
      // } else {
      if (File) {
        // console.log(File);
        File.map((file, index) => {
          let filename = file.name;
          if (filename.lastIndexOf(".") <= 0) {
            this.errMsgPic = "Please add a valid file";
          }
          // console.log(file.type === "image/jpeg");

          if (
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/jpg" ||
            file.type === "image/gif"
          ) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", () => {
              // console.log(fileReader.result);
                // this.businessPhotosToShow.push(fileReader.result);
              // console.log(this.businessPhotosToShow);
              this.photosUpload.push(fileReader.result);
              console.log(this.photosUpload)
              // console.log(this.photosUpload[0].name);
              // console.log(this.photosUpload);
              // this.photoList.push(filename);
              // console.log(this.photoList);
              // console.log(this.businessPhotos);
              // this.businessPhotos.push(fileReader.result);
              // this.picBase64Size =
              //   this.picBase64Size +
              //   fileReader.result.length * (3 / 4) -
              //   (_.endsWith(fileReader.result, "==") ? 2 : 1);
              // console.log(this.picBase64Size / 1048576);
              // if (this.picBase64Size / 1048576 > 10) {
              //   this.errMsgPic = "Total photos size can not be more than 10MB ";
              // }
            });
          } else {
            // console.log("done");
            this.errMsgPic = "Not an image( jpeg, png, jpg, gif ) ";
          }
        });
      } else {
        this.errMsgPic = "No new photos loaded yet ! ";
      }
      // }

      // const files = event.target.files;
    },

    saveBusinessHours() {
     let hour = []
     if(this.close != null) {
       hour.push(this.weekDaySelected)
       hour.push(this.close)
     } else {
       hour.push(this.weekDaySelected)
       hour.push(`${this.openTime} - ${this.closeTime}`)
     }
     
     
     this.businessHours.push(hour) 

let hours = []
     this.businessHours.map((hour) => {
       
       const index = _.findIndex(this.weekDays, weekDay => {
       return hour[0] == weekDay
     })
      if(index>=0) {hours[index]=hour}

     })
     this.businessHours = []
     this.businessHours = [...hours]
     console.log(this.businessHours)

     this.weekDaySelected = this.openTime = this.closeTime = this.close = null
    },

    venderEmailCheck() {
      // console.log("sparked");
      this.errorMessage = "";
      if (this.email) {
        // this.$store.commit("clearError");
        this.isEmail = true;
        this.$apollo
          .query({
            query: VENDOREMAIL_CHECK,
            variables: { vendorEmail: this.email },
          })
          .then(({ data }) => {
            // console.log(data);
            if (data.checkVendorEmail.vendorEmailVal) {
              // this.$store.commit(
              //   "setError",
              //   "The email has been registered, please change another or Signin"
              // );
              this.errorMessage =
                "The email has been registered, please change another or Signin";
              this.isEmail = false;
              // this.$refs.form.resetValidation();
            } else {
              this.isEmail = true;
            }
          });
      }
    },
    yesLeave() {
      // console.log(this.to);
      this.showDialog = false;
      this.$store.commit("setInDesign", false);
      // eventBus_vendorParlour.$emit("vendorParlour", false);
      this.$router.push(this.to);
      this.to = null;
    },
    updateLogo(logo) {
      // console.log(logo);
      this.logo = logo;
      this.addLogo = false;
    },
  },
  beforeRouteLeave(to, from, next) {
    // console.log(to);
    if (to.name == "home" && this.toSave) {
      next();
    } else if (this.to) {
      // console.log(this.to);
      this.to = null;
      next();
    } else {
      // console.log(this.showDialog);
      this.showDialog = true;
      // console.log(to);
      // console.log(this.showDialog);

      this.to = to;
    }
  },
};
</script>

<style lang="scss" scoped></style>
