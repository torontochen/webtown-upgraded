<template>
  <v-container class="text-center">
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
    <!-- Vendor Sgin Up Stepper -->

    <v-row>
      <v-col cols="12">
        <v-container>
          <v-card flat>
            <v-card-title class="headline primary  white--text">
              Do Businsess The Simple Way
            </v-card-title>
            <v-container>
              <!-- <v-container> -->
              <v-stepper v-model="stepper">
                <v-stepper-header>
                  <v-stepper-step step="1" editable :rules="[() => isEmail]"
                    >Email & Password</v-stepper-step
                  >

                  <v-divider></v-divider>

                  <v-stepper-step step="2" :editable="email!=null && password === passwordConfirmation" :rules="[() => isCategory]"
                    >Business Profile</v-stepper-step
                  >

                  <v-divider></v-divider>

                  <v-stepper-step
                    step="3"
                    :editable="email!=null && password === passwordConfirmation"
                    :rules="[() => isLandingPage]"
                    >Landing Page</v-stepper-step
                  >
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-container>
                      <v-form lazy-validation v-model="isEmail" ref="email">
                        <v-container>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                :rules="emailRules"
                                label="Registration Email"
                                v-model.trim="email"
                                prepend-icon="email"
                                type="email"
                                :error-messages="errorMessage"
                                clearable
                                required
                                @blur="venderEmailCheck"
                              >
                              </v-text-field>
                            </v-col>
                          </v-row>

                          <v-row>
                            <v-col cols="6">
                              <v-text-field
                                :rules="passwordRules"
                                label="Password"
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
                        </v-container>
                        <v-btn depressed color="primary" @click="stepper = 2" :disabled="!email || password !== passwordConfirmation">
                          Continue
                        </v-btn>

                        <v-btn text plain color="primary" @click="handleCancel">Cancel</v-btn>
                      </v-form>
                    </v-container>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-container>
                      <v-card flat>
                        <v-form
                          lazy-validation
                          v-model="isCategory"
                          ref="category"
                        >
                          <v-container>
                            <v-row>
                              <v-col cols="6">
                                <v-text-field
                                  :rules="businessTitleRules"
                                  label="Business Title"
                                  required
                                  persistent-hint
                                  hint="business title has to be 4 characters at least, can not change after save"
                                  type="text"
                                  v-model.trim="businessTitle"
                                  clearable
                                  :error-messages="errorMessage"
                                  @blur="handleBusinessTitleCheck"
                                >
                                  <!-- @blur="handleResidentNameCheck" -->
                                </v-text-field>
                              </v-col>
                              <v-col cols="6" class="d-flex flex-column justify-space-around align-center">
                                <v-row justify="center">
                                  <v-btn
                                    text
                                    block
                                    @click="addLogo = true"
                                    class="primary--text title"
                                    >Add Logo</v-btn
                                  >
                                </v-row>
                                <v-row justify="center" v-if="logo">
                                  <v-card size="150" flat class="rounded-lg" >
                                    <v-img
                                      max-width="150"
                                      max-height="150"
                                      contain
                                      
                                      :src="this.logo"
                                    ></v-img>
                                  </v-card>
                                </v-row>
                                <v-row>
                                  <v-icon
                                  @click.native="deleteLogo()"
                                  color="primary lighten-1"
                                  class="d-block mb-2"
                                  v-if="logo"
                                >
                                  mdi-close
                                </v-icon>
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
                                          v-if="productSubCategory.length > 0"
                                          v-model="productDetailedSelections"
                                          :rules="
                                            productDetailedSelectionsRules
                                          "
                                          :items="productSubCategory"
                                          small-chips
                                          label="Subcategories"
                                          multiple
                                          clearable
                                          deletable-chips
                                        ></v-select>
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
                                          :rules="
                                            serviceDetailedSelectionsRules
                                          "
                                          :items="serviceSubCategory"
                                          small-chips
                                          label="Subcategories"
                                          multiple
                                          clearable
                                          deletable-chips
                                        ></v-select>
                                      </v-col>
                                      <!-- Service Category -->
                                      <v-col cols="4">
                                        <v-select
                                          v-model="restSelections"
                                          :items="restaurantCategories"
                                          small-chips
                                          label="Restaurant"
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
                                    At least one of categories has to be
                                    selected
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
                                  <!-- class="d-flex flex-column justify-center align-stretch" -->
                                  <v-container class="mt-n4">
                                    <v-row>
                                      <v-col cols="6" class="d-flex flex-column justify-center align-stretch">
                                        <!-- <v-container> -->
                                          <!-- Business  Map -->
                                          <!-- <v-col justify="center"> -->
                                            <h2 style="color: #6f5fc6" class="align-self-center">
                                              My Business
                                            </h2>
                                            <div
                                              id="map"
                                              class=" mt-3 align-self-center"
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
                                              full-width
                                            >
                                            </v-text-field>
                                          <!-- </v-col> -->
                                        <!-- </v-container> -->
                                      </v-col>
                                      <v-col cols="6">
                                        <!-- <v-container> -->
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
                                                  v-model="
                                                    vendorAddressStreetNo
                                                  "
                                                  readonly
                                                ></v-text-field>
                                                <v-text-field
                                                  label="Street Name"
                                                  v-model="
                                                    vendorAddressStreetName
                                                  "
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
                                        <!-- </v-container> -->
                                      </v-col>
                                    </v-row>
                                  </v-container>
                                </v-card>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-form>
                      </v-card>
                    </v-container>

                    <v-btn color="primary" @click="handleCategoryCheck">
                      Continue
                    </v-btn>

                    <v-btn text plain color="primay" @click="handleCancel">Cancel</v-btn>
                  </v-stepper-content>

                  <v-stepper-content step="3">
                    <v-card flat>
                      <v-form
                        v-model="isLandingPage"
                        lazy-validation
                        ref="landingpage"
                      >
                        <v-container>
                          <!-- tagline -->
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                label="Tagline(Not more than 40 letters)"
                                counter="40"
                                v-model.trim="tagline"
                                :rules="taglineRule"
                                type="text"
                                required
                              >
                              </v-text-field>
                            </v-col>
                          </v-row>
                          <!-- About Us -->
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
                          <!-- business Photos input-->
                          <v-row>
                            <v-col cols="12">
                              <v-file-input
                                label="Load business photos ( jpeg, png, jpg, gif ) only, Not more than 6 photos"
                                color="primary"
                                show-size
                                chips
                                small-chips
                                multiple
                                counter
                                dense
                                @change="onFilePicked"
                                :error-messages="errMsg"
                                v-model="photoFiles"
                                :rules="businessPhotosToShowRules"
                              ></v-file-input>
                            </v-col>
                          </v-row>
                          <!-- business photos display -->
                          <v-row>
                            <v-col cols="12">
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
                          <!-- Contact -->
                          <v-row>
                            <v-col cols="12">
                              <v-card hover flat>
                                <v-container>
                                  <v-card-title class="primary--text"
                                    >Contact</v-card-title
                                  >
                                  <v-row>
                                    <!-- phone number -->
                                    <v-col cols="3">
                                      <v-text-field
                                        text
                                        v-model.trim="businessPhone"
                                        label="Telephone"
                                        v-phoneMask="phoneMask"
                                        required
                                        append-outer-icon="mdi-plus"
                                        @click:append-outer="addPhoneNo"
                                        :value="businessPhone"
                                        :rules="businessPhoneRules"
                                        hint="Click + to add phone No."
                                      >
                                        <!-- @blur.once="inputPhoneNo" -->
                                      </v-text-field>
                                      <v-container>
                                        <v-chip-group column>
                                          <v-chip
                                             v-for="(
                                              phone, index
                                            ) in businessPhones"
                                            :key="index"
                                            small
                                            close
                                            @click:close="
                                              businessPhones.splice(index, 1)
                                            "
                                          >
                                            {{ formatPhone(phone) }}
                                          </v-chip>
                                        </v-chip-group>
                                      </v-container>
                                    </v-col>
                                    <!-- fax -->
                                    <v-col cols="2">
                                      <v-text-field
                                        text
                                        v-model.trim="businessFax"
                                        label="Fax"
                                        v-phoneMask="phoneMask"
                                      >
                                      </v-text-field>
                                    </v-col>
                                    <!-- business email -->
                                    <v-col cols="4">
                                      <v-text-field
                                        text
                                        v-model.trim="businessEmail"
                                        label="Business Email"
                                        required
                                        :rules="businessEmailRules"
                                        :disabled="sameEmail"
                                      >
                                      </v-text-field>
                                      <v-checkbox
                                        v-model="sameEmail"
                                        label="Same as Registration Email"
                                      ></v-checkbox>
                                    </v-col>
                                    <!-- Cross Boundary online mail -->
                                    <v-col cols="3">
                                      <v-switch
                                        v-model="crossBoundaryBusiness"
                                        dense
                                        :label="crossBoundaryBusiness ? 'Cross Boundary' : 'No Cross Boundary'"
                                      ></v-switch>
                                    </v-col>
                                  </v-row>

                                  <v-row>
                                    <!-- website -->
                                    <v-col cols="6">
                                      <v-text-field
                                        text
                                        dense
                                        v-model.trim="website"
                                        label="Offical Website"
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
                                        suffix="$"
                                        v-model.number="deliveryFees"
                                        label="Delivery Fees"
                                        :disabled="maxDeliveryDistance<=0"
                                      >
                                      </v-text-field>
                                    </v-col>

                                  </v-row>
                                  <!-- hours -->
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
                                    <v-col cols="1" class="my-n1"><v-icon color="primary" @click="deleteHour(i)" small>mdi-delete</v-icon></v-col>
                                  </v-row>
                                </v-container>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-form>
                    </v-card>
                    <v-btn
                      color="primary lighten-1"
                      type="submit"
                      class="d-inline-block mr-2"
                      @click.native="handleSignupVendor"
                      depressed
                    >
                      <!-- :disabled="businessHours.length < 7" -->

                      <span slot="loader" class="custom-loader">
                        <v-icon>cached</v-icon>
                      </span>
                      Save
                    </v-btn>
                    <v-btn text plain  color="primay" @click="handleCancel">Cancel</v-btn>
                    <v-alert
                      dense
                      outlined
                      type="error"
                      v-if="formAlert"
                      class="d-block mt-3"
                    >
                      There are errors with some items
                    </v-alert>

                    <v-bottom-sheet v-model="emailSent" persistent class="mt-4">
                      <v-sheet class="text-center" height="200">
                        <v-container>
                          <v-alert
                            type="info"
                            transition="scale-transition"
                            dense
                            color="accent lighten-1"
                            class="title"
                          >
                            A confirmation email has been sent to
                            {{ email }},please verify</v-alert
                          >
                        </v-container>
                      </v-sheet>
                    </v-bottom-sheet>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
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
      component="Sign Up Vendor"
    />

    <LogoCropper
      v-model="addLogo"
      @update-logo="updateLogo($event)"
      @abort-logo="abortLogo"
    />
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import { mask } from "vue-the-mask";
import { CHECK_BUSINESSTITLE } from "../../queries/queries_query.js";
import { VENDOREMAIL_CHECK } from "../../queries/queries_query.js";
import gmapsInit from "../../utils/gmaps";
import CustomDialog from "../CustomDialog";
import LogoCropper from "./LogoCropper";
import { eventBus_vendorParlour } from "../../main.js";
import { LOGO_VENDOR } from "../../assets/constDataServer";

import _ from "lodash";

export default {
  name: "signupVendor",
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
      businessPhoneRules: [(phone) => !!phone || "Business Phone is required"],
      businessFax: null,
      businessEmail: null,
      businessEmailRules: [
        (businessEmail) => !!businessEmail || "Business Email is required",
      ],
      businessHours: [],
      businessPhotosToShow: [],
      businessPhotosToShowRules: [
        (businessPhotosToShow) =>
          !!businessPhotosToShow.length > 0 || "Must Load at least one photo",
      ],
      businessAddress: "",
      businessAddressRules: [
        (businessAddress) =>
          !!businessAddress || "Business address is required",
      ],
      businessHours: [],
      businessTitle: "",
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
      errorMessage: "",
      formAlert: false,
      isCategory: true,
      isEmail: true,
      isLandingPage: true,
      inputPlace: null,
      logo: "",
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
      photoFiles: [],
      photosUpload: [],
      phoneMask: "(###)###-####",
      place: null,
      productSelections: [],
      productDetailedSelections: [],
      productDetailedSelectionsRules: [
        (selections) =>
          selections.length > 0 || "Subcategories must be selected",
      ],
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
      taglineRule: [(tagline) => !!tagline || "Tagline is required !"],
      to: null,
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

  beforeMount() {
    // console.log("signup vendor");
    this.$store.dispatch("getProductCategory");
    this.$store.dispatch("getServiceCategory");
    this.$store.dispatch("getRestaurantCategory");
    eventBus_vendorParlour.$emit("vendorParlour", true);
  },
  async mounted() {
    // console.log("mounted");

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
      const businessTitle = this.businessTitle

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
         this.lat = place.geometry.location.lat()
        this.lng = place.geometry.location.lng()

        // console.log(place);
        // console.log(place.address_components[0].types[0]);
        if (place.address_components[0].types[0] !== "street_number") {
          this.errMsg =
            place.formatted_address + "  is not a valid google map address";
          return;
        } else {
          console.log(this.place);
          this.place = place;
          const location = place.formatted_address;
          this.inputPlace = place.formatted_address;
          this.vendorAddressStreetNo = place.address_components[0].short_name;
          this.vendorAddressStreetName = place.address_components[1].short_name;
          this.vendorAddressCity =
            place.address_components[2].short_name == "Mississauga"
              ? place.address_components[2].short_name
              : place.address_components[3].short_name;
          this.vendorPostalCode =
            place.address_components.length > 7
              ? place.address_components[7].short_name
              : place.address_components[6].short_name;

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
                // this.lat = results[0].geometry.location.lat()
                // this.lng = results[0].geometry.location.lng()
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
                  title: businessTitle
                    ? businessTitle
                    : "My Business",
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
                this.errMsg = "Not a valid google map address " + `(${status})`;
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

  computed: {
    ...mapGetters([
      "loading",
      "productsCategories",
      "servicesCategories",
      "restaurantCategories",
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
      // console.log(this.restaurantCategories);
      return this.productsCategories
        .map((item) => {
          return item.category;
        })
        .sort();
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
    photoFiles(newVal, oldVal) {
      // console.log(oldVal);
      // console.log(newVal);
      if (newVal.length === 0) {
        this.photosUpload.splice(0, this.photosUpload.length);
        // this.businessPhotos.splice(0, this.businessPhotos.length);
        // console.log(this.businessPhotos);
      }
    },
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

    sameEmail(newVal) {
      if (newVal) {
        this.businessEmail = this.email;
      }
    },
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
        // this.businessPhone = null;
      }
    },
    deleteHour(i){
      this.businessHours.splice(i, 1)
    },
    deleteLogo() {
      this.logo = null;
    },
    deleteBuzPhoto(index) {
      // this.businessPhotos.splice(index, 1);
      // this.photoFiles.splice(index, 1);
      // this.businessPhotosToShow.splice(index, 1);
      this.photosUpload.splice(index, 1);
    },
    formatPhone(phone) {
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
      this.$router.push("/");
    },
    handleProductSubCategory() {
      this.productSubCategory = [];
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
      this.serviceSubCategory = [];
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
            // console.log(data);
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
    handleSignupVendor() {
      // console.log(this.businessPhone, this.businessPhones);
      this.formAlert = false;
      if (
        this.$refs.email.validate() &&
        this.$refs.category.validate() &&
        this.$refs.landingpage.validate() &&
        (this.restSelections.length > 0 ||
          this.productDetailedSelections.length > 0 ||
          this.serviceDetailedSelections.length > 0)
      ) {
        // console.log(this.businessPhone, this.inputPhoneNo);
          const businessHoursToSave = this.businessHours.map(hour => {
            return { weekDay: hour[0], time: hour[1]}
        })
        this.$store.dispatch("signupVendor", {
          tagline: this.tagline,
          businessTitle: _.capitalize(this.businessTitle),
          email: this.email,
          password: this.password,
          businessUnitNo: this.unitNo ? this.unitNo : "",
          businessStreetNo: this.vendorAddressStreetNo,
          businessStreetName: this.vendorAddressStreetName,
          businessCity: this.vendorAddressCity,
          businessPostalCode: this.vendorPostalCode,
          businessPhone: this.businessPhones,
          businessFax: this.businessFax,
          businessEmail: this.sameEmail ? this.email : this.businessEmail,
          // logo: this.logo,
          // businessPhotos: this.businessPhotos,
          logo: this.logo.length > 0 ? this.logo : LOGO_VENDOR,
          photoList: this.photosUpload,
          businessHours: businessHoursToSave,
          businessCategory:
            this.restSelections.length > 0
              ? "restaurant-" + this.restSelections
              : this.productDetailedSelections.concat(
                  this.serviceDetailedSelections
                ),
          aboutUs: this.aboutUs,
          website: this.website,
          deliveryFees: this.deliveryFees,
          maxDeliveryDistance: this.maxDeliveryDistance,
          crossBoundaryBusiness: this.crossBoundaryBusiness,
          lat: this.lat,
          lng: this.lng
        });
        this.emailSent = true;
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
      if (this.businessPhotosToShow.length + File.length > 30) {
        this.errMsg = "Not more than 6 photos Please ! ";
      } else {
        this.errMsg = "";
        if (File) {
          // console.log(File);
          File.map((file, index) => {
            let filename = file.name;
            if (filename.lastIndexOf(".") <= 0) {
              this.errMsg = "Please add a valid file";
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
                this.photosUpload.push(fileReader.result);
                // this.businessPhotos.push(fileReader.result);
              });
            } else {
              // console.log("done");
              this.errMsg = "Not an image( jpeg, png, jpg, gif ) ";
            }
          });
        } else {
          this.errMsg = "No new photos loaded yet ! ";
        }
      }

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
     const index = _.findIndex(this.weekDays, weekDay => {
       return weekDay == this.weekDaySelected
     })
     
     this.businessHours.push(hour) 

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

      eventBus_vendorParlour.$emit("vendorParlour", false);

      // this.$router.go();
      this.$router.replace(this.to);
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
    if (this.to) {
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
//  {"_id":{"$oid":"5e645ff7e7179a17e2146e1e"},"category":"Entertainment","items":["Lounges","Strip Club","KALAOK","Dance Clubs","Casinos","Internet Cafes","Dive Bars","Night Club & Pub","Arcades","Music Venues","Tiki Bars","Head Shops","Tapas/Small Plates","Sports Clubs","Venues & Event Spaces","Comedy Clubs","Performing Arts","Social Clubs","Gay Bars","Wine Bars","Musicians, DJs, Jazz & Blues","Hookah Bars","Pool Halls","Other"]}

</script>

<style lang="scss" scoped></style>

