<template>
  <v-container class="mt-0" fluid>
    <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="loading" persistent fullscreen>
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
    <v-container >
      <!-- <v-col cols="10"> -->
      <v-card flat :width="viewPortDimension.width * 0.8 " class="ma-auto">
        <v-stepper v-model="processStepper">
          <v-stepper-header>
            <v-stepper-step step="1" :rules="[() => isFormat]"
              >Select Format</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step step="2" :rules="[() => isDesign]"
              >Design</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step step="3" :rules="[() => isPreview]"
              >Preview and Save Design</v-stepper-step
            >

            <v-divider></v-divider>
            <v-stepper-step step="4" :rules="[() => isSetup]"
              >Complete Setup</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step step="5" :rules="[() => isDistribute]"
              >Check out and Distribute</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items>
            <!--  Step 1 choose type -->
            <v-stepper-content step="1">
              <v-container>
                <v-card flat>
                  <v-form lazy-validation v-model="isFormat" ref="email">
                    <v-row justify="space-around">
                      <v-radio-group mandatory row v-model="flyerFormat">
                        <v-radio value="FLYER" label="Simple Flyer">
                          <template v-slot:label>
                            <div
                              v-if="flyerFormat == 'FLYER'"
                              class="indigo--text font-weight-medium"
                            >
                              Simple Flyer
                            </div>
                          </template></v-radio
                        >
                        <v-radio label="Simple Coupon" value="COUPON">
                          <template v-slot:label>
                            <div
                              v-if="flyerFormat == 'COUPON'"
                              class="indigo--text font-weight-medium"
                            >
                              Simple Coupon
                            </div>
                          </template>
                        </v-radio>
                        <v-radio label="Multiply Coupons" value="MULTICOUPON">
                          <template v-slot:label>
                            <div
                              v-if="flyerFormat == 'MULTICOUPON'"
                              class="indigo--text font-weight-medium"
                            >
                              Multiply Coupons
                            </div>
                          </template></v-radio
                        >
                        <v-radio
                          label="Flyer with Multiply Coupons"
                          value="FLYERCOUPON"
                        >
                          <template v-slot:label>
                            <div
                              v-if="flyerFormat == 'FLYERCOUPON'"
                              class="indigo--text font-weight-medium"
                            >
                              Flyer with Multiply Coupons
                            </div>
                          </template></v-radio
                        >
                      </v-radio-group>
                    </v-row>
                    <v-row class="mt-1">
                      <v-container v-if="flyerFormat == 'FLYER'">
                        <v-row justify="center" class="ma-10">
                          <v-col cols="4" align-self="start" >
                            <v-img
                              src="../../assets/images/simpleflyer.png"
                              max-width="300"
                              max-height="250"
                              contain
                            >
                            </v-img>
                          </v-col>
                          <v-col cols="5" align-self="start">
                            <p
                              class="indigo--text subtitle font-weight-regular"
                              style="text-align: justify"
                            >
                              Simple Flyer only contain photos and
                              words.Predeisgned flyers in PNG, JPEG, JPG can be
                              uploaded up.But Webtown online flyers are strongly
                              recommanded as they are traceable and can be
                              linked with vendor's website or online store.
                            </p>
                          </v-col>
                        </v-row>
                      </v-container>

                      <v-container v-if="flyerFormat == 'COUPON'">
                        <v-row justify="center" class="ma-10">
                          <v-col cols="4" align-self="start" >
                            <v-img
                              src="../../assets/images/simplecoupon.png"
                              max-width="300"
                              max-height="250"
                              contain
                            >
                            </v-img>
                          </v-col>
                          <v-col cols="5">
                            <p
                              class="indigo--text subtitle font-weight-regular"
                              style="text-align: justify"
                            >
                              Simple Coupon is for redeeming free merchandise or
                              discounting or onsale price containing photos ,
                              words, amount, QR code or barcode.Predeisgned
                              coupon in PNG, JPEG, JPG might be able to be
                              uploaded.But Webtown online flyers are strongly
                              recommanded as they are traceable and can be
                              redeemed online and through mobile devices.
                            </p>
                          </v-col>
                        </v-row>
                      </v-container>

                      <v-container v-if="flyerFormat == 'MULTICOUPON'">
                        <v-row justify="center" class="ma-10">
                          <v-col cols="4" align-self="start">
                            <v-img
                              src="../../assets/images/multicoupon.png"
                              max-width="300"
                              max-height="250"
                              contain
                            >
                            </v-img>
                          </v-col>
                          <v-col cols="5">
                            <p
                              class="indigo--text subtitle font-weight-regular"
                              style="text-align: justify"
                            >
                              Multipy Coupons can be a combination of free
                              merchandise coupons , discount coupons in solide
                              amount or percentage and on sale coupons
                              containing photos , words, amount, QR code or
                              barcode. Uploading predeisgned coupons is not
                              allowed because online redeeming does not work on
                              that.
                            </p>
                          </v-col>
                        </v-row>
                      </v-container>

                      <v-container v-if="flyerFormat == 'FLYERCOUPON'">
                        <v-row justify="center" class="ma-10">
                          <v-col cols="4" align-self="start" >
                            <v-img
                              src="../../assets/images/flyercoupon.png"
                              max-width="300"
                              max-height="250"
                              contain
                            >
                            </v-img>
                          </v-col>
                          <v-col cols="5">
                            <p
                              class="indigo--text subtitle font-weight-regular"
                              style="text-align: justify"
                            >
                              Flyers with multipy Coupons is a combination of
                              flyers mainly for description and free merchandise
                              coupons , discount coupons in solide amount or
                              percentage and on sale coupons containing photos ,
                              words, amount, QR code or barcode. Uploading
                              predeisgned coupons is not allowed because online
                              redeeming does not work on that.
                            </p>
                          </v-col>
                        </v-row>
                      </v-container>
                      <v-row justify="center" class="my-12">
                        <v-btn
                          color="primary"
                          @click="stepper = 2"
                          class="d-block mr-2"
                          depressed
                        >
                          Continue
                        </v-btn>

                        <v-btn
                          text
                          outlined
                          color="primary"
                          @click="handleCancel"
                          >Cancel</v-btn
                        >
                      </v-row>
                    </v-row>
                  </v-form>
                </v-card>
              </v-container>
            </v-stepper-content>

            <!-- Step 2 Design -->
            <v-stepper-content step="2">
              <v-card flat>
                <v-form lazy-validation v-model="isDesign" ref="category">
                  <v-container class="pa-0 ma-0">
                    <v-row>
                      <v-col cols="3">
                        <v-card>
                          <vue-editor
                            v-if="!killHtmlConverter"
                            v-model="vueEditor"
                            :editorOptions="editorSettings"
                            :customModules="customModulesForEditor"
                            :editorToolbar="customToolbar"
                            :disabled="!startEdit"
                            :placeholder="placeHolder"
                          ></vue-editor>
                        </v-card>
                      </v-col>
                      <v-col cols="9" align-self="center">
                        <flyer-coupon
                          v-if="
                            flyerFormat == 'FLYERCOUPON' ||
                            selectedSketch_C ||
                            selectedTemplate_C
                          "
                          :htmlInner="vueEditor"
                          @addElement="addElement($event)"
                          @addElement_C="addElement_C($event)"
                        ></flyer-coupon>

                        <html-converter
                          v-else
                          :htmlInner="vueEditor"
                          :type="flyerFormat"
                          @addElement="addElement($event)"
                        ></html-converter>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card>
              <v-row v-if="error">
                <v-col cols="12">
                  <form-alert :message="error"></form-alert>
                </v-col>
              </v-row>
              <v-row justify="center" class="my-12">
                <v-btn
                  :disabled="btnDisable"
                  color="primary"
                  @click.native="saveSketch"
                  class="d-block mr-2"
                  depressed
                >
                  Save Sketch
                </v-btn>

                <v-btn
                  :disabled="btnDisable"
                  color="primary"
                  @click="toPreview"
                  class="d-block mr-2"
                  depressed
                >
                  Continue
                </v-btn>

                <v-btn color="primary" outlined text @click="handleCancel"
                  >Cancel</v-btn
                >
              </v-row>
            </v-stepper-content>

            <!-- Step 3  Preview -->
            <v-stepper-content step="3">
              <v-container fluid>
                <v-row
                  justify="center"
                  v-if="
                    flyerFormat !== 'FLYERCOUPON' &&
                    flyerFormatType !== 'FLYERCOUPON'
                  "
                >
                  <v-card flat :width="(viewportWidth * 9) / 10" outlined>
                    <v-tabs v-model="tab" background-color="primary" dark>
                      <v-tab v-for="(item, i) in pagePreview" :key="i">
                        Page {{ i + 1 }}
                      </v-tab>
                    </v-tabs>
                    <v-row justify="center" class="pb-4">
                      <v-tabs-items v-model="tab" class="mt-5 ma-0 pa-0">
                        <v-tab-item
                          v-for="(item, i) in pagePreview"
                          :key="i"
                          class="ml-0"
                        >
                          <v-card v-html="item.previewString" flat tile>
                          </v-card>
                        </v-tab-item>
                      </v-tabs-items>
                    </v-row>
                  </v-card>
                </v-row>
                <v-row justify="center" v-else>
                  <v-col cols="12" class="mt-n6">
                    <v-row justify="center" class="mb-7">
                      <v-btn-toggle
                        v-model="flyerCoupon"
                        rounded
                        dense
                        mandatory
                        class="mt-6"
                        dark
                      >
                        <v-btn small  depressed value="flyer" color="primary darken-5">
                          flyer
                        </v-btn>
                        <v-btn small  depressed value="coupon" color="primary darken-5">
                          coupon
                        </v-btn>
                      </v-btn-toggle>
                    </v-row>

                    <v-card
                      flat
                      :width="(viewportWidth * 9) / 10"
                      outlined
                      v-if="flyerCoupon == 'flyer'"
                    >
                      <v-tabs v-model="tab" background-color="primary" dark>
                        <v-tab v-for="(item, i) in pagePreview" :key="i">
                          Page {{ i + 1 }}
                        </v-tab>
                      </v-tabs>
                      <v-row justify="center">
                        <v-tabs-items v-model="tab" class="mt-5 ma-0 pa-0">
                          <v-tab-item
                            v-for="(item, i) in pagePreview"
                            :key="i"
                            class="ml-0"
                          >
                            <v-card v-html="item.previewString" flat tile>
                            </v-card>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-row>
                    </v-card>
                    <v-card
                      flat
                      :width="(viewportWidth * 9) / 10"
                      outlined
                      v-else
                    >
                      <v-tabs v-model="tab" background-color="primary" dark>
                        <v-tab v-for="(item, i) in pagePreview_C" :key="i">
                          Page {{ i + 1 }}
                        </v-tab>
                      </v-tabs>
                      <v-row justify="center">
                        <v-tabs-items v-model="tab" class="mt-5 ma-0 pa-0">
                          <v-tab-item
                            v-for="(item, i) in pagePreview_C"
                            :key="i"
                            class="ml-0"
                          >
                            <v-card v-html="item.previewString" flat tile>
                            </v-card>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row v-if="error">
                  <v-col cols="12">
                    <form-alert :message="error"></form-alert>
                  </v-col>
                </v-row>
                <v-row class="d-flex justify-center my-10">
                  <v-btn
                    :disabled="
                      !isDesign || !isFormat || !isPreview || templateSaved
                    "
                    color="primary"
                    type="submit"
                    class="d-inline-block mr-2"
                    @click="toDesign"
                    small
                    dark
                    depressed
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                    Back To Design
                  </v-btn>

                  <v-btn
                    :disabled="!isDesign || !isFormat || !isPreview"
                    color="primary"
                    type="submit"
                    class="d-inline-block mr-2"
                    small
                    depressed
                    dark
                    @click.native="saveTemplateDialog = true"
                    v-if="!templateIsSaved"
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                    Save as template
                  </v-btn>

                  <v-btn
                    :disabled="templateIsSaved"
                    color="info lighten-1"
                    type="submit"
                    class="d-inline-block mr-2"
                    small
                    depressed
                    outlined
                    v-if="templateIsSaved"
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                    template is saved
                  </v-btn>

                  <v-btn
                    :disabled="!isDesign || !isFormat || !isPreview"
                    color="primary "
                    type="submit"
                    class="d-inline-block mr-2"
                    small
                    dark
                    depressed
                    @click="saveAndDistribute"
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                    Save Design and Continue
                  </v-btn>

                  <v-btn
                    text
                    small
                    outlined
                    color="primary"
                    @click="handleCancel"
                    >Cancel</v-btn
                  >
                </v-row>
              </v-container>
            </v-stepper-content>

            <!-- Step 4  Complete Setup -->
            <v-stepper-content step="4">
              <v-row>
                <v-card
                  outlined
                  v-if="stepper == 4"
                  :width="(viewportWidth * 9) / 10"
                >
                  <v-container>
                    <v-row>
                      <v-col cols="4">
                        <h5
                          class="primary--text text--lighten-1 d-block ml-6 mb-2"
                        >
                          Title: {{ currentFlyerTitle }}
                        </h5>
                      </v-col>
                      <v-col cols="8">
                        <h5
                          class="primary--text text--lighten-1 d-block ml-6 mb-2"
                        >
                          Flyer Id: {{ savedFlyer ? savedFlyer.flyerId : "" }}
                        </h5>
                      </v-col>
                    </v-row>

                    <v-card flat :width="(viewportWidth * 9) / 10" outlined>
                      <v-tabs
                        v-model="tabStep4"
                        background-color="primary"
                        dark
                      >
                        <v-tab v-for="(item, i) in tabSource" :key="i">
                          Page {{ i + 1 }}
                        </v-tab>
                      </v-tabs>
                      <v-row  class="pb-4 justify-center">
                        <v-tabs-items v-model="tabStep4" class="mt-5 ma-0 pa-0">
                          <v-tab-item
                            v-for="(item, i) in tabSource"
                            :key="i"
                            class="ml-0"
                          >
                            <v-card v-html="item.previewString" flat tile>
                            </v-card>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-row>
                    </v-card>
                  </v-container>
                </v-card>
              </v-row>
              <!-- <v-divider dark></v-divider> -->
              <v-row class="justify-center">
                <v-card flat v-if="stepper == 4" class="mt-6" :width="(viewportWidth * 6) / 10">
                  <v-form v-model="isDistribute" lazy-validation ref="checkOut">
                    <v-row class="d-flex flex-row justify-center align-center">
                      <!-- <v-container fluid> -->
                        <!-- <tr>
                          <td> -->
                            <h5 class="d-block mr-4 primary--text">Valid:</h5>
                          <!-- </td> -->
                          <!-- <td class="mr-3 d-block"> -->
                            <v-menu
                              v-model="fromPicker"
                              transition="scale-transition"
                              offset-y
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on }">
                                <v-text-field
                                  v-model="dateFrom"
                                  label="From"
                                  prepend-inner-icon="event"
                                  readonly
                                  v-on="on"
                                  :rules="fromDateRules"
                                  class="mx-2"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="dateFrom"
                                :show-current="currentDate"
                                @change="fromPicker = false"
                                :min="currentDate"
                                :max="dateTo"
                              ></v-date-picker>
                            </v-menu>
                          <!-- </td> -->
                          <!-- <td> -->
                            <v-menu
                              v-model="toPicker"
                              transition="scale-transition"
                              offset-y
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on }">
                                <v-text-field
                                  v-model="dateTo"
                                  label="To"
                                  prepend-inner-icon="event"
                                  readonly
                                  :rules="toDateRules"
                                  v-on="on"
                                  class="mx-2"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="dateTo"
                                :show-current="currentDate"
                                @change="toPicker = false"
                                :min="dateFrom"
                              ></v-date-picker>
                            </v-menu>
                          <!-- </td>
                        </tr> -->
                      <!-- </v-container> -->
                    </v-row>

                    <!-- <v-divider dark></v-divider> -->

                    <v-row
                      class="justify-center"
                      v-if="savedFlyer && savedFlyer.type != 'FLYER'"
                    >
                      <v-card  :width="viewportWidth " class="pa-12">
                        <!-- <v-card-text> -->
                          <v-card flat>
                            <v-card-text>
                               <v-col cols="12" >
                              <!-- <v-row> -->
                                <h4
                                  class="primary--text text--lighten-1 d-block ml-6 mb-4"
                                >
                                  Coupon ID:
                                  {{ couponIdConfirm }}
                                </h4>
                              <!-- </v-row> -->
                            </v-col>
                            </v-card-text>
                          </v-card>

                          <v-card flat>
                           <v-row>
                              <v-col cols="8" align-self="start">
                              <v-text-field
                                label="Coupon Title"
                                v-model.trim="couponTitle[tabStep4]"
                              >
                              </v-text-field>
                            </v-col>
                             <v-col cols="4">
                               <v-switch
                                  v-model="oneTimeUsage[tabStep4]"
                                  class="d-block"
                                  dense
                                  :label="oneTimeUsage[tabStep4] ? 'One Time' : 'Unlimited Times'"
                                ></v-switch>
                            </v-col>
                            </v-row>
                          </v-card>
                           
                           
                          <v-card flat>
                            <v-row class="d-flex flex-row justify-space-around align-center">
                              <v-col cols="5">
                              <!-- <v-container> -->
                                <v-row class="d-flex justify-left">
                                  <v-col cols="6" align-self="end">
                                    <v-select
                                      v-model="redeemType[tabStep4]"
                                      :items="redeemList"
                                      label="Redeem Type"
                                      :error-messages="errMsg"
                                      :disabled='showBoundItems'
                                    ></v-select>
                                  </v-col>
                                  <v-col cols="3" align-self="center" v-if="redeemType[tabStep4] == 'PERCENTAGE_DISCOUNT'">
                                     <v-switch
                                      
                                      v-model="isForAllItems[tabStep4]"
                                      class="d-block"
                                      dense
                                      :label="isForAllItems[tabStep4] ? 'For All Items' : 'For Items Bound'"
                                    ></v-switch>
                                    </v-col>
                                    <v-col cols="3" align-self="center">
                                    <v-tooltip top >
                                      <template v-slot:activator="{ on, attrs }"> 
                                        <!-- <v-btn
                                          
                                          small
                                          text
                                        > -->
                                          <v-icon 
                                          @click="bindItemHandler" 
                                          size="24"
                                          :disabled="isForAllItems[tabStep4]"
                                          v-bind="attrs"
                                          v-on="on"
                                          style="background-color: #FAFAFA;"
                                          class="ma-2 d-block"
                                          color="primary">
                                            mdi-format-list-bulleted
                                          </v-icon>
                                        <!-- </v-btn> -->
                                      </template>
                                      <span>Bind Items</span>
                                    </v-tooltip>
                                  </v-col>
                                </v-row>
                              <!-- </v-container> -->
                            </v-col>
                            <v-col cols="2" align-self="center">
                              <v-text-field
                                v-if="
                                  redeemType[tabStep4] == 'PERCENTAGE_DISCOUNT'
                                "
                                label="Amount"
                                type="number"
                                v-model.number="amount[tabStep4]"
                                :disabled="!redeemType[tabStep4]"
                                suffix="%"
                              ></v-text-field>
                              <v-text-field
                                v-else
                                label="Amount"
                                type="number"
                                v-model.number="amount[tabStep4]"
                                :disabled="!redeemType[tabStep4]"
                                prefix="$"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="5" align-self="center">
                              <v-row>
                                <v-col cols="6">
                                   <v-text-field
                                v-if="
                                  redeemType[tabStep4] == 'PERCENTAGE_DISCOUNT'
                                "
                                label="Minimal Order Amount"
                                type="number"
                                v-model.number="minimalAmount[tabStep4]"
                                suffix="$"
                              ></v-text-field>
                               <v-text-field
                                v-if="
                                  redeemType[tabStep4] == 'CASH_DISCOUNT' || redeemType[tabStep4] == 'CASH_VALUE'
                                "
                                label="Minimal Order Quantity"
                                type="number"
                                v-model.number="minimalQty[tabStep4]"
                              ></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                  <v-switch
                                      
                                      v-model="isForExceedance[tabStep4]"
                                      class="d-block mt-2"
                                      v-if="minimalAmount[tabStep4]>0||minimalQty[tabStep4]>0"
                                      dense
                                      :label="isForExceedance[tabStep4] ? 'For Exceedance Only' : 'For All'"
                                    ></v-switch>
                                </v-col>
                              </v-row>
                              
                             

                            </v-col>
                            </v-row>
                          </v-card>

                          <v-row class="justify-center">
                            <v-col cols="10">
                              <InputTable
                                v-if="showBoundItems"
                                :allItemsCatalog="allItemsCatalog"
                                :inputItemsBound="itemsBound[tabStep4]"
                                :redeemType='redeemType[tabStep4]'
                                @saveItemsBound="saveItemsBound($event)"
                              />
                            </v-col>
                            <v-col cols="2" align-self="end">
                              <h5
                                class="d-block ml-10 primary--text text--lighten-1"
                              >
                                QR Code
                              </h5>
                              <qrcode
                                :value="qrCode"
                                :options="{ width: 120, height: 120 }"
                                class="ml-3"
                                v-if="redeemType[tabStep4] && amount[tabStep4]"
                              ></qrcode>
                              <v-card v-else outlined width="130" height="130">
                              </v-card>
                            </v-col>
                          </v-row>
                        <!-- </v-card-text> -->
                      </v-card>
                    </v-row>

                    <v-row  class="my-10 justify-center">
                      <!-- !isDesign || !isFormat || !isPreview || !isDistribute || -->
                      <v-btn
                        :disabled="!couponReady"
                        color="primary lighten-1"
                        type="submit"
                        class="d-inline-block mr-2"
                        @click="handleUpdateSave"
                        depressed
                      >
                        <span slot="loader" class="custom-loader">
                          <v-icon>cached</v-icon>
                        </span>
                        Save
                      </v-btn>
                      <v-btn text @click.stop="handleCancel">Cancel</v-btn>
                    </v-row>
                  </v-form>
                </v-card>
              </v-row>
            </v-stepper-content>

             <!--  Step 5  Check Out && Distribute -->
            <v-stepper-content step="5">
               <v-card class="pa-3">
                 <v-card-subtitle class="accent--text font-weight-bold" v-if="savedFlyer">{{savedFlyer.flyerId}}&nbsp;|&nbsp;{{ currentFlyerTitle }}</v-card-subtitle>
                 <v-divider class="my-1"></v-divider>
                 <v-row no-gutters align="center">
                   <v-col cols="6">
                     <v-radio-group v-model="distributeType">
                   <v-radio label="regular distribution (distribute to all resident in metro)" value="regular" class="my-1"></v-radio>
                   <v-radio label="target distribution (distribute to resident qualified) " value="target" class="my-1"></v-radio>
                 </v-radio-group>
                   </v-col>
                  <!-- target map -->
                   <v-col cols="6">
                      <div id="map" justify-center class="ma-1" v-show="residentTargeted&&distributeType=='target'"></div>
                   </v-col>
                 </v-row>
                  <!-- regular distribute -->
                  <v-card outlined class="pa-3" v-if="distributeType=='regular'">
                    <span class="primary--text text-subtitle-1 text-center">regualr distribute to all resident in GTA metro area</span>
                    <v-card-text>
                      <v-row class="d-flex flex-row justify-start align-center">
                        <v-checkbox 
                        v-model="insideBoundaryChecked"
                        :value='metroSpec.insideBoundary' 
                        :label="`Resident inside GTA boundary: ${insideBoundary}`" class="mx-2"/>
                      <span class="text-subtitle-2 mx-2 ">rate:&nbsp; ${{distributeBasicRate}}&nbsp;/&nbsp;Address</span>
                      <span class="text-subtitle-2 mx-2 accent--text font-weight-bold">Item Total: {{ $filters.formatCurrencyAmount(insideBoundary * distributeBasicRate) }}</span>
                      </v-row>
                      <v-row class="d-flex flex-row justify-start align-center" v-if="vendor.crossBoundaryBusiness">
                        <v-checkbox 
                        v-model="outsideBoundaryChecked" 
                        :value="metroSpec.outsideBoundary" 
                        :label="`Resident outside GTA boundary: ${outsideBoundary}`" class="mx-2"/>
                         <span class="text-subtitle-2 mx-2 ">rate: ${{distributeBasicRate}}/send</span>
                      <span class="text-subtitle-2 mx-2 accent--text font-weight-bold">Item Total: {{ $filters.formatCurrencyAmount(outsideBoundary * distributeBasicRate) }}</span>
                      </v-row>
                    </v-card-text>
                  </v-card>

                <!-- target distribute -->
                  <v-card outlined v-if="distributeType=='target'" class="pa-3">
                    <v-card-title>
                      <span class="primary--text text-subtitle-1 text-center">
                      target distribute to specific resident qualified ( surcharge: $0.05 / metric ): {{ $filters.formatIntAmount(residentTargeted ? targetDistributeNumber : 0) }} 
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rate:&nbsp;${{(distributeBasicRate + distributeAdditionRate * distributeAddition).toFixed(2)}}&nbsp;/&nbsp;Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <span class="accent--text text-subtitle-1">subtotal: {{ $filters.formatCurrencyAmount(distributeSubTotal) }}</span></span>
                      <v-spacer></v-spacer>
                       <v-switch
                                  v-model="crossBoundary"
                                  dense
                                  :label="crossBoundary ? 'Cross Boundary' : 'No Cross Boundary'"
                                  v-if="vendor.crossBoundaryBusiness"
                                ></v-switch>
                    </v-card-title>
                   
                    <v-card-text>
                      <!-- age, gender, religion -->
                      <v-row class="d-flex flex-row justify-start align-center" align="start">
                       <!-- age -->
                        <v-col cols="5" >
                          <v-row align="center" class="mr-1" no-gutters>
                            <v-col cols="7">
                              <v-row no-gutters>
                                <v-checkbox 
                                v-model="ageChecked" 
                                dense
                                />
                                <v-select :disabled="!ageChecked" v-model="ageFrom" :items="ageList"   :error-messages="ageErrMsg" label=" Age From" dense class="mr-3" ></v-select>
                              </v-row>
                            </v-col>
                            <v-col cols="5">
                              <v-row no-gutters>
                                <v-select :disabled="!ageChecked" v-model="ageTo"   :error-messages="ageErrMsg" :items="ageList" label=" Age To" dense ></v-select>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                       <!-- religion -->
                        <v-col cols="3" >
                          <v-row align="center" class="mr-1">
                            <v-checkbox 
                              v-model="religionChecked" 
                              dense
                              />
                            <v-select :disabled="!religionChecked" :items="religionList" label="religion" v-model="religionSelected"  dense></v-select>
                          </v-row>
                        </v-col>
                        <!-- gender -->
                        <v-col cols="3" >
                          <v-row align="center" class="mr-1">
                          <v-checkbox 
                            v-model="genderChecked" 
                            dense
                            />
                          <v-select :disabled="!genderChecked" :items="genders" label="gender" v-model="genderSelected"  dense></v-select>
                          </v-row>
                        </v-col>
                        <!-- to existing customer -->
                        <v-col cols="1" >
                          <v-row align="center" class="mr-1">
                          <v-checkbox 
                            v-model="existingCustomerChecked" 
                            dense
                            label="Current Customer"
                            disabled
                            />
                          </v-row>
                        </v-col>
                      </v-row>
                      <!-- hobbies, favorite food -->
                      <v-row class="d-flex flex-row justify-start align-center">
                         
                        <v-col cols="6" >
                          <v-row align="start" class="mr-1" no-gutters> 
                            <v-checkbox 
                              v-model="hobbyChecked" 
                              dense
                              />
                            <v-select 
                              :disabled="!hobbyChecked" 
                              :items="hobbyList" 
                              label="hobbies"  
                              multiple
                              small-chips
                              clearable
                              deletable-chips  
                              v-model="hobbySelected" 
                              dense></v-select>
                          </v-row>
                        </v-col>

                        <v-col cols="6" >
                          <v-row align="center" class="mr-1">
                            <v-checkbox 
                                v-model="favoriteFoodChecked" 
                                dense
                                />
                              <v-select 
                                :disabled="!favoriteFoodChecked" 
                                :items="favoriteFoodList" 
                                label="favorite Food"  
                                multiple
                                small-chips
                                clearable
                                deletable-chips  
                                v-model="favoriteFoodSelected" 
                                dense></v-select>
                          </v-row>
                        </v-col>
                      </v-row>
                      <!-- region, distance -->
                      <v-row class="d-flex flex-row justify-start align-center">
                        <v-col cols="6" >
                          <v-row align="center" class="mr-1" no-gutters>
                             <v-checkbox 
                          v-model="regionChecked" 
                          dense
                          />
                        <v-select 
                          :disabled="!regionChecked" 
                          :items="regions" 
                          label="region"  
                          multiple
                          small-chips
                          clearable
                          deletable-chips  
                          v-model="regionsSelected" 
                          dense></v-select>
                          </v-row>
                        </v-col>

                        <v-col cols="4" >
                          <v-row align="center" class="mr-1">
                              <v-checkbox 
                              v-model="distanceChecked" 
                              dense
                              />
                            <v-select 
                              :disabled="!distanceChecked" 
                              :items="distance" 
                              label="distance"  
                              clearable
                              v-model="distanceSelected" 
                              dense></v-select>
                          </v-row>
                        </v-col>

                        <v-col cols="2" >
                          <v-row align="center" class="mr-1">
                            <v-checkbox 
                          v-model="wishChecked" 
                          label="wish List"
                          dense
                          />
                          </v-row>
                           
                        </v-col>

                      </v-row>
                    </v-card-text>
                 
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text color="accent" outlined :disabled="canTarget" @click="handleTarget">target</v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>

                  <v-card class="px-4">
                     <v-card-text>
                      <v-row  no-gutters>
                                <v-spacer/>
                                <v-col cols="5" class="mr-5">
                                  <v-row no-gutters align="stretch">
                                         <span >Pay by Boundary Gold</span> 
                                          <span class="mx-1"><v-icon class="mr-1" color="yellow">mdi-coin</v-icon>{{ $filters.formatIntAmount(vendor.goldCoins) }}</span>
                                          <v-slider
                                              :max="vendor.goldCoins"
                                              v-model="goldSpand"
                                              step="1"
                                          ></v-slider>
                                          <span><v-icon class="mr-1" color="yellow">mdi-coin</v-icon>{{ $filters.formatIntAmount(goldSpand) }}</span>
                                    </v-row>
                                </v-col>
                        </v-row>

                        <v-row align="stretch" class="my-2 mr-5 text-subtitle-2  accent--text">
                         <v-spacer></v-spacer>
                          <v-col cols="2">

                          
                         <v-spacer></v-spacer> <span class='text-right my-2'>Subtotal:&nbsp;{{ $filters.formatCurrencyAmount(distributeSubTotal) }}</span><br>
                         <v-spacer></v-spacer> <span class='text-right my-2'>Tax:&nbsp;{{ $filters.formatCurrencyAmount(distributeSubTotal * 0.13) }}</span><br>
                         <v-spacer></v-spacer> <span class='text-right my-2'>Total:&nbsp;{{ $filters.formatCurrencyAmount(distributeSubTotal * 1.13) }}</span><br>
                         <v-spacer></v-spacer> <span class='text-right my-2'>Balance:&nbsp;{{ $filters.formatCurrencyAmount(distributeSubTotal * 1.13 - goldSpand) }}</span>
                        </v-col>
                        </v-row>
                        <v-divider></v-divider>
                       
                           <v-row align="center" class="my-2" >
                          <v-radio-group
                          v-model="payBy"
                          row
                          class="d-flex justify-center"
                          >

                          <v-radio
                              value="creditcard"
                          >
                          <template v-slot:label>
                              <div><v-img src="/static/credit_card-removebg-preview.png" contain max-height="60" max-width="80"></v-img></div>
                          </template>
                          </v-radio>
                          <v-radio
                              value="paypal"
                          >
                          <template v-slot:label>
                              <div><v-img src="/static/paypal-logo-no-background-png-removebg-preview.png" max-height="60" max-width="80" contain></v-img></div>
                          </template>
                          </v-radio>
                        </v-radio-group>
                        </v-row>
                        </v-card-text>
                       
                        
                  </v-card>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    :disabled="canDistribute"
                    color="primary "
                    type="submit"
                    class="d-inline-block mr-2"
                    depressed
                    small
                    @click="handleDistribute"
                  >
                    <span slot="loader" class="custom-loader">
                      <v-icon>cached</v-icon>
                    </span>
                   Pay & Distribute
                  </v-btn>

                  <v-btn text small outlined color="primary" @click="handleCancel"
                    >Cancel</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
               </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-container>

    <!-- Save Template Dialog -->
    <v-dialog v-model="saveTemplateDialog" max-width="450">
      <v-card>
        <!-- <v-card-text> -->
        <v-container>
          <v-radio-group
            v-model="templateChoice"
            column
            :mandatory="true"
            class="indigo--text subtitle font-weight-regular"
          >
            <v-radio
              label="Save as a new template"
              value="1"
              class="indigo--text subtitle font-weight-regular"
            ></v-radio>
            <v-text-field
              label="Template Tag Name"
              v-model="tagname"
            ></v-text-field>
            <v-radio
              :label="'Overwrite Current Template:' + getTemplateId"
              value="2"
              v-if="selectedTemplate_C || selectedTemplate"
              class="indigo--text subtitle font-weight-regular"
            ></v-radio>
          </v-radio-group>
        </v-container>

        <!-- </v-card-text> -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary lighten-2"
            text
            @click="saveTemplate"
            :disabled="disableTempChoice"
            >Save</v-btn
          >
          <v-btn
            color="primary lighten-2"
            text
            @click="saveTemplateDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <CustomDialog
      v-model="showDialog"
      @yes-leave="yesLeave"
      @abort-leave="abortLeave"
      ref="dia"
      component="Flyer Design"
    />
  </v-container>
</template>


<script>

import _ from "lodash";
import { mapGetters } from "vuex";
import ImageResize from "quill-image-resize-module";
import moment from "moment";
//Set up font and font-size for Quill
import { VueEditor, Quill } from "vue2-editor";
import gmapsInit from "../../utils/gmaps";
// import addMarkers from "../utils/addMarkers";
import markerClusterer from "@google/markerclusterer";

import QRCode from "qrcode";


import HtmlConverter from "./HtmlConverter.vue";
import FlyerCoupon from "./FlyerCoupon.vue";
import InputTable from "./InputTable.vue";
import { hobbies, religions, favoriteFood } from "../../assets/constData"
import CustomDialog from "../CustomDialog.vue";
import {
  eventBus_editElement,
  eventBus_addPage,
  eventBus_preview,
  eventBus_saveSketch,
  eventBus_appendHook,
  eventBus_saveTemplate,
  eventBus_saveFlyer,
} from "../../eventBus";
import {GET_TARGET_DISTRIBUTE_RESIDENT} from '../../queries/queries_query'




const fonts = ["arial", "garamond", "tahoma", "verdana"];
let Fonts = Quill.import("attributors/style/font");
Fonts.whitelist = fonts;
Quill.register(Fonts, true);

const Size = Quill.import("attributors/style/size");
Size.whitelist = ["1em", "0.75em", "1.5em", "2.5em"];
Quill.register(Size, true);

export default {
  components: {
    "vue-editor": VueEditor,
    "html-converter": HtmlConverter,
    "flyer-coupon": FlyerCoupon,
    CustomDialog,
    InputTable,
  },
  data() {
    return {
      ageList: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      ageFrom: null,
      ageTo: null,
      // ageErr: false,
      ageErrMsg: null,
      ageChecked: false,
      amount: [], // coupon denomination
      cancelTrue: false, // to indicate if cancel is clicked
      couponTitle: [],
      crossBoundary: false,
      customToolbar: [
        [
          {
            font: ["arial", "garamond", "tahoma", "verdana"],
          },
          { header: [1, 2, 3, 4, 5, 6, false] },
          { size: [false, "0.75em", "1.5em", "2.5em"] },
          { color: [] },
          { background: [] },
          "bold",
          "italic",
          "underline",
          "strike",
          "link",
          { script: "sub" },
          { script: "super" },
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
          { align: [] },
          "image",
        ], // toggled buttons
        // ["blockquote"],
        // [{ header: 1 }, { header: 2 }],

        // superscript/subscript
        // outdent/indent
        // [{ direction: "rtl" }], // text direction

        // ["clean"]  dropdown with defaults from theme
        // remove formatting button
      ],
      customModulesForEditor: [
        // { alias: "imageDrop", module: ImageDrop },
        { alias: "imageResize", module: ImageResize },
      ],
      dateFrom: null,
      dateTo: null,
      distanceChecked: false,
      distanceList: [5, 10, 15, 25, 50, 100],
      distanceSelected: null,
      distributeType: 'regular',
      distributeBasicRate: 0.05,
      distributeAddition: 0,// to record distrbute addition times
      distributeAdditionRate: 0.05,
      editMode: false, // to indicate if it is under edit mode
      editorSettings: {
        modules: {
          // imageDrop: true,
          imageResize: {},
        },
      },
      errMsg: "",
      existingCustomerChecked: false,
      favoriteFoodList: favoriteFood.sort(),
      favoriteFoodChecked: false,
      favoriteFoodSelected: null,
      flyerCoupon: true,
      flyerFormat: null, // bond with flyer format choice
      formAlert: null, // to control the showup of alert message
      fromPicker: false,
      fromDateRules: [
        (dateFrom) => !!dateFrom || "From Date is required!",
        // dateFrom =>
        //   Date.parse(dateFrom) < Date.parse(this.dateTo) ||
        //   "Must be before To Date "
      ],
      genders: ["Mr", "Ms", "They"],
      genderChecked: false,
      genderSelected: null,
      goldSpand: 0,
      google: null,
      hobbyList: hobbies.sort(),
      hobbyChecked: false,
      hobbySelected: null,
      insideBoundary: 0,
      insideBoundaryChecked: true,
      itemsBound: [],
      isDistribute: true,
      isFormat: true,
      isForAllItems: [],
      isForExceedance: [],
      isPreview: true,
      isDesign: true,
      isSetup: true,
      killHtmlConverter: false, // to control component htmlConverter.vue
      map: null,
      markers: [],
      markerCluster: null,
      minimalAmount: [],
      minimalQty: [],
      noElement: true,
      noElement_C: true,
      oneTimeUsage: [],
      outsideBoundary: 0,
      outsideBoundaryChecked: false,
      pageSavePreview: [], // to control how many pages updated are really workable
      pageSavePreview_C: [], // to control how many pages updated are really workable
      payBy: 'creditcard',
      quantityDistributed: 0, // quantity of coupon distributed
      redeemList: [
        "CASH_VALUE",
        "CASH_DISCOUNT",
        "COMBO_CASH_VALUE",
        "PERCENTAGE_DISCOUNT",
      ],
      redeemType: [], // coupon redeem type
      religionList: religions.sort(),
      religionChecked: false,
      religionSelected: null,
      regions: ['Oshawa', 'Whitby', 'Etobicoke','Ajax', 'Pickering', 'North York', 'York', 'East York', 'Scarborough', 'Toronto', 'Markham', 'Richmond Hill', 'Newmarket', 'Thronehill', 'Mississauga', 'Brampton', 'Aurora', 'Vaughan'].sort(),
      regionChecked: false,
      regionsSelected: null,
      residentTargeted: null,
      tab: 0, // to control No of tab in preview
      tabStep4: 0, // to control No of tab in preview of Step 4
      tagname: null, // for new template tag name
      targetDistributeNumber : 0,
      templateChoice: null, // to container the template dialog choice no
      templateSaved: false, // to control the back to design btn
      to: null, // to store the destination route when leaving route
      toPicker: false,
      toDateRules: [
        (dateTo) => !!dateTo || "To Date is required!",
        // dateTo =>
        //   Date.parse(dateTo) > Date.parse(this.dateFrom) ||
        //   " Must be after From Date"
      ],
      toSave: false, //to control if router is heading to saveSketch
      saveTemplateDialog: false, // to control save template dialog
      showDialog: false, // to control the dialog
      showBoundItems: false,
      startEdit: false, // to control the disabled statue of vue editor
      stepperSpark: true, // to control stepper when render step 2
      stepper: 1,
      subTotalReset: 1,
      viewportWidth: null,
      viewportHeight: 0,
      vueEditor: null, // bond with vue editor
      wishChecked: false
    };
  },

  created() {
    console.log("vendorflyers created");
  },

  beforeDestroy() {
    this.$store.commit("clearSelectedSketch");
    this.$store.commit("clearSelectedTemplate");
    this.$store.commit("clearSelectedSketch_C");
    this.$store.commit("clearSelectedTemplate_C");
    console.log("vendorflyer destroy");
    // eventBus_editElement.$off();
    // eventBus_addPage.$off();
    // eventBus_preview.$off();
    // eventBus_saveSketch.$off();
    // eventBus_appendHook.$off();
    // eventBus_saveTemplate.$off();
    // eventBus_saveFlyer.$off();
  },

 async mounted() {
   try {
      const google = await gmapsInit();
      this.google = google
      const southWest = new google.maps.LatLng(43.03637, -82.056545);
      const northEast = new google.maps.LatLng(44.519412, -78.032275);
      const bounds = new google.maps.LatLngBounds(southWest, northEast);
     
      const map = new google.maps.Map(document.getElementById("map"), {
        // center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        disableDoubleClickZoom: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });
      this.map = map
       if (navigator.geolocation) {
       
        navigator.geolocation.getCurrentPosition((position) => {
          
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          map.setCenter(center);
        });
       }
   } catch(error) {
      console.error(error);

   }
     


    window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      event.returnValue = "ok";
    });
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    console.log(this.metroSpec)
    this.insideBoundary = this.metroSpec.residentInsideBoundary
    this.outsideBoundary = this.metroSpec.residentOutsideBoundary
    console.log('insideBoundary', this.insideBoundary)
    console.log('outsideBoundary', this.outsideBoundary)



    eventBus_editElement.$on("editElement", (editValue) => {
      if (editValue) {
        this.vueEditor = editValue;
      }
      this.startEdit = true;
      this.editMode = true;
    });

    eventBus_editElement.$on("quitEdit", (eventValue) => {
      this.vueEditor = null;
      this.startEdit = false;
      this.editMode = false;
      this.pageSavePreview = eventValue;
    });

    eventBus_editElement.$on("quitEdit_C", (eventValue) => {
      this.vueEditor = null;
      this.startEdit = false;
      this.editMode = false;
      this.pageSavePreview_C = eventValue;
    });

    eventBus_editElement.$on("deleteElement", (eventValue) => {
      this.vueEditor = null;
      this.startEdit = false;
      this.noElement = eventValue;

      // console.log(this.vueEditor);
    });

    eventBus_editElement.$on("deleteElement_C", (eventValue) => {
      this.vueEditor = null;
      this.startEdit = false;
      this.noElement_C = eventValue;

      // console.log(this.vueEditor);
    });

    eventBus_addPage.$on("addPage", (eventValue) => {
      this.pageSavePreview = eventValue;
      this.vueEditor = null;
      this.startEdit = true;
      // console.log(this.pageSavePreview);
    });

    eventBus_addPage.$on("addPage_C", (eventValue) => {
      this.pageSavePreview_C = eventValue;
      this.vueEditor = null;
      this.startEdit = true;
      // console.log(this.pageSavePreview_C);
    });

    eventBus_appendHook.$on("appendHook", (eventValue) => {
      // console.log("start");
      this.pageSavePreview = eventValue;
      // console.log(this.pagePreview);
    });

    eventBus_appendHook.$on("appendHook_C", (eventValue) => {
      // console.log("start C");
      this.pageSavePreview_C = eventValue;
      // console.log(this.pagePreview_C);
    });

    eventBus_appendHook.$on("elementMounted", (eventValue) => {
      this.noElement = this.noElement_C = !eventValue;
    });

    this.$store.dispatch("getAllItemsCatalog", {
      businessTitle: this.vendor.businessTitle,
      time: Date.now().toString(),
    });
  },
  watch: {
    tabStep4(newVal) {
      // console.log(newVal);
      this.showBoundItems = false;
      // console.log(this.itemsBound[this.tabStep4]);
    },
    ageChecked(val) {
      if(!val) {
        this.ageFrom = null
        this.ageTo = null
        this.distributeAddition -= 1
        this.subTotalReset = 0
      } else {
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    },
    ageFrom(val){
      // console.log(val)

      // this.ageErr = false
          this.ageErrMsg = null

      if(val&&this.ageTo){
        if(val > this.ageTo) {
          // this.ageErr = true
          this.ageErrMsg = 'To must be greater than From'
        }
      }
    },
    ageTo(val){
      // console.log(val)
      // this.ageErr = false
          this.ageErrMsg = null

      if(val&&this.ageFrom){
        if(val < this.ageFrom) {
          // this.ageErr = true
          this.ageErrMsg = 'To must be greater than From'

        }
      }
    },

    dateFrom(val){
      console.log(val)
    },
    genderChecked(val){
      if(!val){
        this.genderSelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    },
    religionChecked(val){
      if(!val){
        this.religionSelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    },
    hobbyChecked(val){
      if(!val){
        this.hobbySelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.distributeAddition +=1
        this.subTotalReset = 0

      }
    },
    favoriteFoodChecked(val){
      if(!val){
        this.favoriteFoodSelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    },
    regionChecked(val){
      if(!val){
        this.regionsSelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.distanceChecked = false
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    },
    residentTargeted(val){
       // TODO  reset markers
          if(this.markers.length > 0) {
            this.markers.forEach(marker => marker.setMap(null))
            this.markerCluster.clearMarkers()
            this.markers = []
            // this.markerCluster = null
          }
      if(val.number > 0 && this.map && this.google){
         

          //TODO run markers of all targets
        this.markers = val.locations.map((location, i) => {
         return  new this.google.maps.Marker({position: location, label: ' ', map: this.map})
         })
        //  console.log(this.markers)
         //TODO create markerCluster
         this.markerCluster = new markerClusterer(
          this.map, this.markers, 
          {imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"}
        );
        this.google.maps.event.addListener(this.map, "zoom_changed", function (event) {
          // console.log(event);
          this.markerCluster.redraw();
          // });
        });

        //TODO zoom change listerner
      //    if (this.markerCluster) {
      //   // var markerClusterArray = markerCluster.getMarkers();
      //   // // console.log(markerCluster);
      //   // if (markerClusterArray.length > 0) {
      //   //   // console.log(markerClusterArray[markerClusterArray.length-1]);
      //   //   let infowindow1 = new google.maps.InfoWindow({
      //   //     content: "This is markerCluster",
      //   //     pixelOffset: new google.maps.Size(0, 50)
      //   //   });
      //   //   markerCluster.addListener("mouseover", function (e) {
      //   //     infowindow1.open(resultsMap, e.latLng);
      //   //     console.log("spark");
      //   //     //console.log(infowindow.getPosition());
      //   //   });
      //   // }
      //   this.google.maps.event.addListener(this.map, "zoom_changed", function (event) {
      //     //console.log('spark');
      //     this.markerCluster.redraw();
      //     // });
      //   });
      // }
      }
    },
    distanceChecked(val){
      if(!val){
        this.distanceSelected = null
        this.distributeAddition -= 1
        this.subTotalReset = 0

      } else {
        this.regionChecked = false
        this.distributeAddition += 1
        this.subTotalReset = 0

      }
    }
  },
  computed: {
    ...mapGetters([
      "allItemsCatalog",
      "pagePreview",
      "pagePreview_C",
      "vendor",
      "selectedSketch",
      "selectedTemplate",
      "selectedSketch_C",
      "selectedTemplate_C",
      "loading",
      "templateIsSaved",
      "savedFlyer",
      "flyerFormatType",
      "error",
      "metroSpec",
      'viewPortDimension'
    ]),

    age() {
       const list = this.ageList.map((item, i) => {
        //  console.log(item[0])
        //  console.log(item[1])
        return i < 5 ? item[0].toString() + ' - ' + item[1].toString() : item.toString() + ' ' + 'above'
      })
      // console.log(list)
      return list
    },

    btnDisable() {
      if (this.selectedSketch || this.selectedTemplate) {
        return this.editMode || this.noElement ? true : false;
      }

      if (this.selectedSketch_C || this.selectedTemplate_C) {
        // console.log(this.editMode || this.noElement || this.noElement_C);
        return this.editMode || this.noElement || this.noElement_C
          ? true
          : false;
      }

      if (this.flyerFormat == "FLYERCOUPON") {
        return this.pageSavePreview.length == 0 ||
          this.pageSavePreview_C.length == 0 ||
          this.editMode ||
          this.noElement ||
          this.noElement_C
          ? true
          : false;
      } else {
        return this.pageSavePreview.length == 0 ||
          this.editMode ||
          this.noElement
          ? true
          : false;
      }
    },

    canDistribute(){
      if(this.distributeType == 'regular') {
        return !this.isDesign || !this.isFormat || !this.isPreview || !(this.insideBoundary + this.outsideBoundary) > 0
      } else {
        return  !this.isDesign || !this.isFormat || !this.isPreview || !this.targetDistributeNumber > 0
      }
      
    },

    canTarget() {
      // console.log(!this.ageSelected && !this.genderSelected && !this.religionSelected && !this.favoriteFoodSelected 
      // && !this.hobbySelected && !this.regionsSelected && !this.distanceSelected && !this.wishChecked)
      // console.log(!this.ageTo || !this.ageFrom)
      return  !this.genderSelected && !this.religionSelected && !this.favoriteFoodSelected 
      && !this.hobbySelected && !this.regionsSelected && !this.distanceSelected && !this.wishChecked && (!this.ageTo || !this.ageFrom)
    },

    couponIdConfirm() {
      if (this.savedFlyer) {
        return this.savedFlyer.type == "FLYERCOUPON"
          ? this.savedFlyer.sketchPages_C[this.tabStep4].nodeId
          : this.savedFlyer.sketchPages[this.tabStep4].nodeId;
      }
    },

    couponReady() {
      if (this.savedFlyer) {
        if (this.savedFlyer.type === "FLYER" && this.dateTo && this.dateFrom) {
          return true
          } 
        

        const counter =
          this.savedFlyer.type == "FLYERCOUPON"
            ? this.savedFlyer.sketchPages_C.length - 1
            : this.savedFlyer.sketchPages.length - 1;
        let filled;
        if (
          this.redeemType.length == counter + 1 &&
          this.amount.length == counter + 1 &&
          this.couponTitle.length == counter + 1
          && this.dateTo && this.dateFrom
        ) {
          for (let i = 0; i <= counter; i++) {
            // console.log(this.redeemType);
            // console.log(this.amount);
            // console.log(this.couponTitle);
            // console.log(this.redeemType[i]);
            // console.log(this.amount[i]);
            // console.log(this.couponTitle[i]);
            if (
              !this.redeemType[i] ||
              !this.amount[i] ||
              !this.couponTitle[i] ||  this.dateFrom == null ||
          this.dateTo == null
            ) {
              filled = false;
              return filled;
            }
            return true;
          }
        }
     
      }
    },

    currentDate() {
      console.log(moment(Date.now()).format("YYYY-MM-DD"));
      return moment(Date.now()).format("YYYY-MM-DD");
    },

    currentFlyerTitle() {
      if (this.savedFlyer) {
        return this.savedFlyer.flyerTitle;
      }
      // if (this.savedFlyer_C) {
      //   return this.savedFlyer_C.flyerTitle;
      // }
    },

    // to control the save btn of template choice dialog
    disableTempChoice() {
      if (this.templateChoice == 1) {
        return this.tagname ? false : true;
      } else {
        return false;
      }
    },

    distance() {
      return this.distanceList.map(item => {
        return item + " kms"
      })
    },

    distributeSubTotal(){
      if(this.distributeType == 'regular'){
          return  ( this.insideBoundary + (this.outsideBoundaryChecked ? this.outsideBoundary: 0) ) * this.distributeBasicRate 
      }
      if(this.distributeType == 'target' ){
        return this.subTotalReset * (this.residentTargeted ? this.targetDistributeNumber * ( this.distributeBasicRate + this.distributeAdditionRate * this.distributeAddition ) : 0)
      }
    },

    getTemplateId() {
      if (this.selectedTemplate) return this.selectedTemplate.flyerId;
      if (this.selectedTemplate_C) return this.selectedTemplate_C.flyerId;
    },

    placeHolder() {
      return this.startEdit
        ? "         "
        : "Click Add Element to Start , Input Text or Upload Image";
    },

    processStepper() {
      if (this.$route.params.stepper > 1 && this.stepperSpark) {
        this.stepper = this.$route.params.stepper;
        this.noElement = this.noElement_C = false;
        return this.$route.params.stepper;
      } else {
        return this.stepper;
      }
    },

    qrCode() {
      // console.log(this.redeemType[this.tabStep4]);
      // console.log(this.amount[this.tabStep4]);
      if (
        this.savedFlyer &&
        this.redeemType[this.tabStep4] &&
        this.amount[this.tab]
      ) {
        const qrObject = {
          valueType: this.redeemType[this.tabStep4],
          couponId:
            this.savedFlyer.type == "FLYERCOUPON"
              ? this.savedFlyer.sketchPages_C[this.tabStep4].nodeId
              : this.savedFlyer.sketchPages[this.tabStep4].nodeId,
          amount:
            this.redeemType[this.tabStep4] == "PERCENTAGE_DISCOUNT"
              ? this.amount[this.tabStep4] / 100
              : this.amount[this.tabStep4],
          itemsBound:
            this.itemsBound.length > 0 ? this.itemsBound[this.tabStep4] : "",
        };
        // QRCode.toDataURL(JSON.stringify(qrObject), function(err, url) {
        //   // this.qrString[this.tab] = url;
        //   console.log(url);
        // });

        return JSON.stringify(qrObject);
      }
    },

    tabSource() {
      if (this.savedFlyer) {
        // console.log(this.pagePreview)
        // console.log(this.pagePreview_C)
        if (this.pagePreview_C.length > 0 || this.pagePreview.length > 0) {
          return this.savedFlyer.type == "FLYERCOUPON"
            ? this.pagePreview_C
            : this.pagePreview;
        }
      }
    },
  },

  methods: {
    abortLeave() {
      // console.log(this.to);
      this.to = null;
      // console.log(this.to);
      this.showDialog = false;
    },

    addElement(pages) {
      this.vueEditor = null;
      this.startEdit = true;
      this.noElement = false;
      // this.pages = pages;
    },

    addElement_C(pages) {
      this.vueEditor = null;
      this.startEdit = true;
      this.noElement_C = false;
      // this.pages = pages;
    },
    bindItemHandler() {
      // console.log(this.allItemsCatalog);
      if (this.allItemsCatalog.length > 0) {
        this.showBoundItems = !this.showBoundItems;
      } else {
        this.errMsg = "Please set up items in Bussiness Menu";
      }
    },

    handleCancel() {
      this.cancelTrue = true;
      // this.showDialog = true;
      this.$router.push("/");
    },

    handleTarget() {
      this.subTotalReset = 1
      if(this.ageChecked) {
        if (!(this.ageFrom && this.ageTo && this.ageTo >= this.ageFrom)) return
      }
      

      let wishList = ' '
      if(this.wishChecked) {
        this.vendor.businessCategory.map(item => {
           wishList =  wishList + ' ' + _.replace(item, '-', ' ')
       }) 
      }
      const variables = {
        age: this.ageChecked ? [this.ageFrom, this.ageTo] : null,
        gender: this.genderSelected,
        religion: this.religionSelected,
        hobbies: this.hobbySelected,
        favoriteFood: this.favoriteFoodSelected,
        regions: this.regionsSelected,
        distance: parseInt(this.distanceSelected),
        wishList,
        wishChecked: this.wishChecked,
        vendorLat: this.vendor.lat,
        vendorLng: this.vendor.lng
      }
      this.$apollo
        .query({
          query: GET_TARGET_DISTRIBUTE_RESIDENT,
          variables
        })
        .then(({data}) => {
          
          const {getTargetDistributeResident} = data
          // console.log(getTargetDistributeResident)
          this.residentTargeted = getTargetDistributeResident
          this.targetDistributeNumber = getTargetDistributeResident.number

        })
        .catch(err => console.error(err))
    },

    handleUpdateSave() {
      if (this.$refs.checkOut.validate()) {
        const couponValue = [];
        if (this.savedFlyer.type == "FLYERCOUPON") {
          for (let i = 0; i <= this.savedFlyer.sketchPages_C.length - 1; i++) {
             
            couponValue.push({
              valueType: this.redeemType[i],
              amount:
                this.redeemType[i] == "PERCENTAGE_DISCOUNT"
                  ? this.amount[i] / 100
                  : this.amount[i],
              couponId: this.savedFlyer.sketchPages_C[i].nodeId,
              couponTitle: this.couponTitle[i],
              itemsBound: this.itemsBound[i],
              oneTimeUsage: this.oneTimeUsage[i] ? this.oneTimeUsage[i] : false,
              minimalAmount: this.redeemType[i] == 'PERCENTAGE_DISCOUNT' ? this.minimalAmount[i] : 0,
              minimalQty: this.redeemType[i] == 'CASH_DISCOUNT' || this.redeemType[i] == 'CASH_VALUE' ? this.minimalQty[i] : 0,
              isForAllItems:  this.redeemType[i] == "PERCENTAGE_DISCOUNT" && this.isForAllItems[i]
                  ? this.isForAllItems[i]
                  : false,
              isForExceedance: this.redeemType[i] == 'CASH_DISCOUNT' || this.redeemType[i] == 'CASH_VALUE' || this.redeemType[i] == "PERCENTAGE_DISCOUNT" 
                  ? this.isForExceedance[i]
                  : false
            });
          }
        } else {
          for (let i = 0; i <= this.savedFlyer.sketchPages.length - 1; i++) {
            couponValue.push({
              valueType: this.redeemType[i],
              amount:
                this.redeemType[i] == "PERCENTAGE_DISCOUNT"
                  ? this.amount[i] / 100
                  : this.amount[i],
              couponId: this.savedFlyer.sketchPages[i].nodeId,
              couponTitle: this.couponTitle[i],
              itemsBound: this.itemsBound[i],
              oneTimeUsage: this.oneTimeUsage[i] ? this.oneTimeUsage[i] : false,
              minimalAmount: this.redeemType[i] == 'PERCENTAGE_DISCOUNT' ? this.minimalAmount[i] : 0,
              minimalQty: this.redeemType[i] == 'CASH_DISCOUNT' || this.redeemType[i] == 'CASH_VALUE' ? this.minimalQty[i] : 0,
              isForAllItems:  this.redeemType[i] == "PERCENTAGE_DISCOUNT" && this.isForAllItems[i]
                  ? this.isForAllItems[i]
                  : false,
              isForExceedance: this.redeemType[i] == 'CASH_DISCOUNT' || this.redeemType[i] == 'CASH_VALUE' || this.redeemType[i] == "PERCENTAGE_DISCOUNT" 
                  ? this.isForExceedance[i]
                  : false
            });
          }
        }
        console.log(typeof this.dateFrom);
        console.log(typeof this.dateTo);
        console.log( this.dateFrom);
        console.log( this.dateTo);
        console.log('couponValue',couponValue)

        this.$store.dispatch("updateSavedFlyer", {
          input: {
            flyerId: this.savedFlyer.flyerId,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            // quantityDistributed: this.quantityDistributed,
            couponValue,
            totalPages: this.savedFlyer.sketchPages.length,
            businessTitle: this.vendor.businessTitle,
            setUp: true,
          },
        });
        this.stepperSpark = false;
        this.stepper = 5;
      }
    },

    handleDistribute() {
      const cate = this.vendor.businessCategory[0];
      const pos_ = cate.indexOf("-");
      const revisedCate = pos_ > 0 ? cate.slice(pos_+1) : this.vendor.businessCategory[0];
      this.toSave = true;
      // console.log(revisedCate);
      console.log(this.savedFlyer)
      console.log(moment.utc(Number(this.savedFlyer.dateFrom)).format(
              "YYYY-MM-DD 12:00:00"
            ))

      if(this.distributeType == 'regular'){
         this.$store.dispatch("distributeFlyer", {
          input: {
            businessTitle: this.vendor.businessTitle,
            logo: this.vendor.logo,
            businessCategory: revisedCate,
            flyerTitle: this.savedFlyer.flyerTitle,
            flyerType: this.savedFlyer.type,
            flyerId: this.savedFlyer.flyerId,
            dateFrom: moment.utc(Number(this.savedFlyer.dateFrom)).format(
              "YYYY-MM-DD"
            ),
            dateTo: moment.utc(Number(this.savedFlyer.dateTo)).format(
              "YYYY-MM-DD"
            ),
            crossBoundary: this.outsideBoundaryChecked,
            quantityDistributed: this.insideBoundary + this.outsideBoundary
          },
        });
      } else {
        this.$store.dispatch("targetDistribute", {
        input: {
          residentList: [...this.residentTargeted.residentList],
          businessTitle: this.vendor.businessTitle,
          logo: this.vendor.logo,
          businessCategory: revisedCate,
          flyerTitle: this.savedFlyer.flyerTitle,
          flyerType: this.savedFlyer.type,
          flyerId: this.savedFlyer.flyerId,
          dateFrom: moment.utc(Number(this.savedFlyer.dateFrom)).format(
            "YYYY-MM-DD"
          ),
          dateTo: moment.utc(Number(+this.savedFlyer.dateTo)).format(
            "YYYY-MM-DD"
          ),
          crossBoundary: this.crossBoundary,
          quantityDistributed: this.targetDistributeNumber
        },
      });
      }

     
      
      this.$store.commit("setInDesign", false);
      // this.$router.push("/");
    },

    saveItemsBound(items) {
      // console.log(items);
      this.itemsBound[this.tabStep4] = items;
      // console.log(this.itemsBound);
    },

    saveAndDistribute() {
      if (
        this.flyerFormat == "FLYERCOUPON" ||
        this.flyerFormatType == "FLYERCOUPON"
      ) {
        eventBus_saveFlyer.$emit("saveFlyer_C");
      } else {
        eventBus_saveFlyer.$emit("saveFlyer");
      }

      this.stepper = 4;
    },

    saveSketch() {
      this.toSave = true;
      console.log("save sketch start");
      if (
        this.flyerFormat == "FLYERCOUPON" ||
        this.flyerFormatType == "FLYERCOUPON"
      ) {
        eventBus_saveSketch.$emit("saveSketch_C");
      } else {
        eventBus_saveSketch.$emit("saveSketch");
      }
    },

    saveTemplate() {
      // this.toSave = true;
      console.log("save template start");
      this.saveTemplateDialog = false;
      if (
        this.flyerFormat == "FLYERCOUPON" ||
        this.flyerFormatType == "FLYERCOUPON"
      ) {
        eventBus_saveTemplate.$emit("saveTemplate_C", {
          templateChoice: this.templateChoice,
          templateId:
            this.templateChoice == 1 ? "" : this.selectedTemplate_C.flyerId,
          templateTagName:
            this.templateChoice == 1
              ? this.tagname
              : this.selectedTemplate_C.flyerTitle,
        });
      } else {
        eventBus_saveTemplate.$emit("saveTemplate", {
          templateChoice: this.templateChoice,
          templateId:
            this.templateChoice == 1 ? "" : this.selectedTemplate.flyerId,
          templateTagName:
            this.templateChoice == 1
              ? this.tagname
              : this.selectedTemplate.flyerTitle,
        });
      }
      this.templateSaved = true;
    },

    toDesign() {
      this.stepper = 2;
      this.$store.commit("setTemplateIsSaved", false);
    },
    toPreview() {
      eventBus_preview.$emit("doPreview");
      this.stepper = 3;
      this.stepperSpark = false;
    },

    yesLeave() {
      // console.log(this.to);
      this.showDialog = false;
      this.pageSavePreview = [];
      if (this.cancelTrue) {
        this.$store.commit("setInDesign", false);
        this.$store.commit("clearSelectedSketch");
        this.$store.commit("clearSelectedTemplate");
        this.$store.commit("clearSelectedSketch_C");
        this.$store.commit("clearSelectedTemplate_C");
        this.$store.commit("setTemplateIsSaved", false);

        this.killHtmlConverter = true;
        this.$router.push(this.to);
        // console.log(this.selectedSketch);
        return;
      }
      this.killHtmlConverter = true;
      this.$store.commit("setInDesign", false);
      this.$router.push(this.to);
      this.to = null;
    },
  },

  beforeRouteLeave(to, from, next) {
    // console.log(to);
    if (to.name == "home" && this.toSave) {
      this.killHtmlConverter = true;
      next();
    } else {
      if (this.to) {
        // console.log(this.to);
        this.to = null;
        next();
      } else {
        // console.log(this.showDialog);
        if (!this.toSave) {
          this.showDialog = true;
        }

        // console.log(to);
        // console.log(this.showDialog);
        this.to = to;
      }
    }
  },
};
</script>
<style scoped>
.radioColor {
  color: indigo;
}

.ql-font-arial {
  font-family: "Arial";
}

.ql-font-garamond {
  font-family: "Garamond";
}

.ql-font-tahoma {
  font-family: "Tahoma";
}

.ql-font-verdana {
  font-family: "Verdana";
}
</style>
