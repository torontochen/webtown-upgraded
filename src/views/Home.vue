<template>
  <!-- vendor page-->
  <v-container fluid style="{'background-color': 'shade5'}" v-if="vendor">
    <v-toolbar flat color="shade5" fixed id="toolbar">
      <v-toolbar-title class="text-h6 primary--text ml-12 pl-10"
        >Welcome ! {{ vendor.businessTitle }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <span class="text-subtitle-1 primary--text"
        >Vendor Page Visited:
        {{ $filters.formatIntAmount(vendor.homePageVisit) }}</span
      >
      <v-spacer></v-spacer>
      <v-row
        v-if="vendor"
        class="d-flex flex-row justify-end align-center mr-14 pr-10"
      >
        <!-- Flyers Menu -->
        <v-menu
          open-on-hover
          right
          offset-y
          nudge-bottom="12"
          transition="slide-x-reverse-transition"
          :disabled="inDesign"
          close-delay="100"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text class="mr-3 text-capitalize">flyers</v-btn>
          </template>
          <v-card class="mx-auto" width="250">
            <v-list dense expand>
              <!-- Design Flyer -->
              <v-list-group no-action>
                <template v-slot:activator>
                  <v-list-item-icon>
                    <v-icon
                      class="mr-2"
                      dense
                      color="
                     primary
                    "
                      >mdi-pencil</v-icon
                    >
                  </v-list-item-icon>
                  <v-list-item-title
                    :class="inDesign ? '#C9C9C9--text' : 'primary--text'"
                    class="font-weight-bold"
                    >Design Flyer</v-list-item-title
                  >
                </template>

                <!-- New Flyer -->
                <v-list-item @click="designFlyerHandler">
                  <v-list-item-title
                    :class="inDesign ? '#C9C9C9--text' : 'primary--text'"
                    class="font-weight-regular text-capitalize"
                  >
                    <span v-html="'&nbsp;&nbsp;&nbsp;'"></span>new
                    flyer</v-list-item-title
                  >
                </v-list-item>

                <!-- From Template -->
                <v-list-item
                  @click="showTemplateList = true"
                  :disabled="templateList.length == 0"
                >
                  <v-list-item-title
                    :class="
                      templateList.length == 0
                        ? '#C9C9C9--text'
                        : 'primary--text'
                    "
                    class="font-weight-regular text-capitalize"
                  >
                    <span v-html="'&nbsp;&nbsp;&nbsp;'"></span>from
                    template</v-list-item-title
                  >
                </v-list-item>
              </v-list-group>

              <!-- Edit Saved Draft -->
              <v-list-item
                @click="showSketchList = true"
                :disabled="sketchList.length == 0"
              >
                <v-list-item-icon>
                  <v-icon
                    class="mr-2"
                    dense
                    :color="sketchList.length == 0 ? '#c6c6c6' : '#6F5FC6'"
                    >mdi-pencil-box</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title
                  :class="
                    sketchList.length == 0 ? '#C9C9C9--text' : 'primary--text'
                  "
                  class="font-weight-bold"
                  >Edit Draft Saved</v-list-item-title
                >
              </v-list-item>

              <!-- Manage Flyers -->
              <v-list-group no-action>
                <template v-slot:activator>
                  <v-list-item-icon>
                    <v-icon
                      class="mr-2"
                      dense
                      :color="inDesign ? '#c6c6c6' : '#6F5FC6'"
                      >sort</v-icon
                    >
                  </v-list-item-icon>

                  <v-list-item-title
                    :class="inDesign ? '#C9C9C9--text' : 'primary--text'"
                    class="font-weight-bold"
                    >Manage Flyers</v-list-item-title
                  >
                </template>

                <!-- Saved Flyers -->
                <v-list-item
                  @click="showFlyerList = true"
                  :disabled="savedFlyerList.length == 0"
                >
                  <v-list-item-title
                    :class="
                      savedFlyerList.length == 0
                        ? '#C9C9C9--text'
                        : 'primary--text'
                    "
                    class="font-weight-regular text-capitalize"
                  >
                    <span v-html="'&nbsp;&nbsp;&nbsp;'"></span>saved
                    Flyers</v-list-item-title
                  >
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-card>
        </v-menu>

        <!-- Business Menu-->
        <v-menu
          open-on-hover
          right
          offset-y
          nudge-bottom="12"
          transition="slide-x-reverse-transition"
          :close-on-content-click="clickClose"
          :disabled="inDesign"
          close-delay="100"
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text class="mr-3 text-capitalize">business</v-btn>
          </template>
          <v-card>
            <v-list dense expand>
              <!-- product & service  -->
              <v-list-item @click="vendorProductServiceHandler">
                <v-list-item-icon>
                  <v-icon class="mr-2" dense color="primary"
                    >mdi-factory</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Product and Service</v-list-item-title
                >
              </v-list-item>
              <!-- Promotions  -->
              <v-list-item @click="promotionsHandler">
                <v-list-item-icon>
                  <v-icon class="mr-2" dense color="primary"
                    >mdi-calendar-clock</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Promotion Events</v-list-item-title
                >
              </v-list-item>
              <!-- Gallery  -->
              <!-- :disabled="vendor.photoList.length == 0" -->
              <v-list-item @click="vendorGalleryHandler">
                <v-list-item-icon>
                  <v-icon
                    class="mr-2"
                    dense
                    color="
                     primary
                    "
                    >mdi-panorama</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Gallery</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <!-- Guild -->
        <v-menu
          open-on-hover
          right
          offset-y
          nudge-bottom="12"
          transition="slide-x-reverse-transition"
          :close-on-content-click="clickClose"
          :disabled="inDesign"
          close-delay="100"
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text class="mr-3 text-capitalize"
              >guild deal</v-btn
            >
          </template>
          <v-card>
            <v-list dense expand>
              <!-- guild deal  -->
              <v-list-item @click="guildDealsHandler">
                <v-list-item-icon>
                  <v-icon class="mr-2" dense color="primary"
                    >mdi-newspaper-variant-multiple</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >New Guild Deals</v-list-item-title
                >
              </v-list-item>
              <!-- deals commited  -->
              <v-list-item @click="dealsCommittedHandler">
                <v-list-item-icon>
                  <v-icon class="mr-2" dense color="primary">mdi-group</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Deal Status</v-list-item-title
                >
              </v-list-item>
              <!-- Manage Guild Deals  -->
              <!-- <v-list-item @click="manageGuildDealsHandler">
                <v-list-item-icon>
                  <v-icon
                    class="mr-2"
                    dense
                    color="
                     primary
                    "
                    >mdi-counter</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Manage Guild Deals</v-list-item-title
                >
              </v-list-item> -->
            </v-list>
          </v-card>
        </v-menu>

        <!-- Accounting Menu -->

        <v-menu
          open-on-hover
          right
          offset-y
          nudge-bottom="12"
          transition="slide-x-reverse-transition"
          :disabled="inDesign"
          close-delay="100"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on" class="mr-8 text-capitalize subtitle"
              >accounting</v-btn
            >
          </template>
          <v-card>
            <v-list dense expand>
              <!-- Statistics  -->
              <v-list-item
                @click="vendorStatisticHandler"
                :disabled="!vendorSalesInfo"
              >
                <v-list-item-icon>
                  <v-icon class="mr-0" dense color="primary"
                    >mdi-chart-areaspline</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text ml-n3"
                  >Statistics</v-list-item-title
                >
              </v-list-item>
              <!-- Promotions  -->
              <!-- <v-list-item @click="promotionsHandler">
                <v-list-item-icon>
                  <v-icon class="mr-2" dense color="primary"
                    >mdi-chart-gantt</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text"
                  >Promotion Performance</v-list-item-title
                >
              </v-list-item> -->
              <!-- Treasure -->
              <v-list-item @click="vendorSettlementHandler">
                <v-list-item-icon>
                  <v-icon
                    class="mr-0"
                    dense
                    color="
                     primary
                    "
                    >mdi-treasure-chest</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text ml-n3"
                  >Treasure</v-list-item-title
                >
              </v-list-item>
              <!-- Membership -->
              <v-list-item @click="vendorMembershipHandler">
                <v-list-item-icon>
                  <v-icon
                    class="mr-0"
                    dense
                    color="
                     primary
                    "
                    >mdi-credit-card-outline</v-icon
                  >
                </v-list-item-icon>
                <v-list-item-title class="primary--text ml-n3"
                  >Membership</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <!-- Avatar menu -->
        <v-card tile flat v-if="vendor" class="mx-1">
          <v-row class="text-center">
            <v-menu
              right
              offset-y
              open-on-hover
              nudge-bottom="12"
              transition="slide-x-reverse-transition"
              :disabled="inDesign"
              :close-on-content-click="clickClose"
              close-delay="100"
            >
              <template v-slot:activator="{ on }">
                <!-- <v-container class=" de-flex align-center justify-center ">
                  <v-avatar
                    v-on="on"
                    max-height="100"
                    max-width="100"
                    size="60"
                    tile
                    class="rounded-lg"
                  > -->

                <v-card v-on="on" flat class="rounded" width="75">
                  <!-- <v-img contain  :src="event.vendorLogo"  >
                                          </v-img> -->

                  <v-img contain :src="vendor.logo"> </v-img>
                </v-card>

                <!-- <v-icon left small> arrow_drop_down </v-icon> -->
                <!-- </v-avatar> -->
                <!-- <h4 class="primary--text d-block justify-left">{{ vendor.businessTitle }}</h4> -->
                <!-- </v-container> -->

                <!-- </v-btn> -->
              </template>

              <v-card>
                <v-list dense expand>
                  <v-list-item
                    v-for="(dropdownItem, index) in vendorAccountDropdown"
                    :key="index"
                    @click="vendorHandlers(index)"
                    :disabled="
                      dropdownItem.title == 'Sign Out' ? inDesign : false
                    "
                    :color="
                      dropdownItem.title == 'Sign Out' && inDesign
                        ? '#c6c6c6'
                        : 'primary'
                    "
                  >
                    <v-icon
                      class="mr-2"
                      dense
                      :color="
                        dropdownItem.title == 'Sign Out' && inDesign
                          ? '#c6c6c6'
                          : 'primary'
                      "
                      >{{ dropdownItem.icon }}</v-icon
                    >
                    <v-list-item-title
                      :class="inDesign ? '#C9C9C9--text' : 'primary--text'"
                      class="font-weight-medium"
                      >{{ dropdownItem.title }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </v-row>
        </v-card>
      </v-row>
      <!-- <v-spacer></v-spacer> -->
    </v-toolbar>

    <v-main class="pt-7">
      <VendorHomePage>
        <router-view />
      </VendorHomePage>
    </v-main>

    <!-- Loading Spinner -->
    <!-- <v-row>
      <v-dialog v-model="vendorHomeLoading" persistent fullscreen>
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
    </v-row> -->

    <!-- Saved Flyers List Dialog -->
    <v-dialog v-model="showFlyerList" max-width="750" max-height="600">
      <v-card flat style="border-top: 15px solid #7986cb">
        <v-card-title> Flyera and Coupons Saved </v-card-title>
        <v-data-table
          :headers="flyerHeaders"
          :items="savedFlyerList"
          :sort-by="['flyerId']"
          :sort-desc="[false, true]"
          :items-per-page="6"
          class="elevation-1"
          @click:row="handleFlyerSelected"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="setUpFlyer(item)"
              :disabled="item.setUp"
              :color="item.setUp ? '#c6c6c6' : '#6F5FC6'"
            >
              mdi-contact-mail
            </v-icon>
            <v-icon
              small
              @click="goToDistributeFlyer(item)"
              :disabled="item.distributed && !item.setup"
              :color="item.distributed ? '#c6c6c6' : '#6F5FC6'"
            >
              mdi-telegram
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>

    <!-- Saved Sketches List Dialog -->
    <v-dialog v-model="showSketchList" max-width="750" max-height="600">
      <v-card flat style="border-top: 15px solid #7986cb">
        <v-card-title> Drafts Saved </v-card-title>
        <v-data-table
          :headers="headers"
          :items="sketchList"
          :sort-by="['flyerId']"
          :sort-desc="[false, true]"
          :items-per-page="6"
          class="elevation-1"
          @click:row="handleSketchSelected"
        >
        </v-data-table>
      </v-card>
    </v-dialog>

    <!-- Saved Template List Dialog -->
    <v-dialog v-model="showTemplateList" max-width="750" max-height="600">
      <v-card flat style="border-top: 15px solid #7986cb">
        <v-card-title> Templates Saved </v-card-title>
        <v-data-table
          :headers="templateHeaders"
          :items="templateList"
          :sort-by="['templateId']"
          :sort-desc="[false, true]"
          :items-per-page="6"
          class="elevation-1"
          @click:row="handleTemplateSelected"
        ></v-data-table>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- v-else no vendor signed in, resident page -->
  <v-container fluid style="background-color: #fafafa" class="mt-n6" v-else>
    <v-row id="viewPort">
      <v-col
        cols="1"
        class="mt-2 pl-xl-16 pl-lg-8"
        :style="{
          position: 'fixed',
          // top: '130px',
          // left: '10px',
          'z-index': '10',
        }"
      >
        <!-- <v-btn fab  color="primary" left absolute top @click="redraw">
                    <v-icon  large>mdi-redo-variant</v-icon>
                  </v-btn> -->

        <br /><span class="text-subtitle-1 primary--text font-weight-medium"
          >sort by:</span
        >

        <v-radio-group
          v-model="sortBy"
          @change="processPromotionEvents"
          :disabled="!canProcessEvents"
        >
          <v-radio label="date" value="byDate" v-if="isPromotionEventShowed">
          </v-radio>
          <v-radio label="vendor title" value="byTitle"></v-radio>
        </v-radio-group>

        <v-btn-toggle
          mandatory
          v-model="sortDesc"
          @change="processPromotionEvents"
        >
          <v-btn
            small
            depressed
            color="primary lighten-1"
            :value="false"
            :disabled="!canProcessEvents"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
          <v-btn
            small
            depressed
            color="primary lighten-1"
            :value="true"
            :disabled="!canProcessEvents"
          >
            <v-icon>mdi-arrow-down</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>

      <!-- vue-masonry Promotion Events-->
      <v-col cols="8" id="left" class="ml-lg-16 ml-xl-8">
        <v-container class="ml-5">
          <div
            v-masonry
            id="masonry"
            transition-duration="3s"
            item-selector=".item"
            gutter="4"
            column-width="11"
            origin-left="false"
            horizontal-order="true"
            origin-top="true"
            v-if="isPromotionEventShowed"
          >
            <div
              v-masonry-tile
              class="item"
              v-for="(event, index) in promotionEventsProcessed"
              :key="index"
            >
              <v-hover>
                <template v-slot:default="{ hover }">
                  <Observer
                    @on-change="onChange"
                    :id="index"
                    :threshold="threshold"
                  >
                    <v-card
                      @mouseenter.stop="pickVendor(index)"
                      @mouseleave.stop="leaveVendor(index)"
                      class="pa-1 mb-1"
                      style="box-shadow: 0 12px 50px 3px #d4d6e2"
                      width="220"
                    >
                      <v-img
                        :src="event.eventPhoto"
                        contain
                        height="220"
                        class="my-1"
                      >
                        <img
                          v-event-type-photo="event.eventType"
                          contain
                          width="80"
                          style="position: absolute; top: 10px; right: 0px"
                        />
                      </v-img>
                      <v-divider color="accent"></v-divider>
                      <!-- <v-card-text> -->
                      <v-row class="my-1">
                        <v-col
                          cols="12"
                          class="d-flex flex-column justify-start align-center"
                        >
                          <v-card flat class="rounded mb-1" width="70">
                            <v-img contain :src="event.vendorLogo"> </v-img>
                          </v-card>
                          <span
                            class="text-subtitle-2 text-center primary--text d-inline"
                          >
                            {{ event.vendor }}</span
                          >
                          <v-card-subtitle
                            class="text-subtitle-2 accent--text"
                            >{{ event.eventTitle }}</v-card-subtitle
                          >
                        </v-col>
                      </v-row>

                      <!-- </v-card-text> -->
                      <v-divider color="accent"></v-divider>
                      <v-row>
                        <!-- <v-card-subtitle class="text-caption">{{ $filters.convertDate(event.dateFrom) }}</v-card-subtitle> -->
                        <!-- <v-card-subtitle class="text-caption"> </v-card-subtitle> -->
                        <v-spacer /><v-card-subtitle
                          class="text-caption text-center"
                          >up to
                          {{ $filters.convertDate(event.dateTo) }}</v-card-subtitle
                        ><v-spacer />
                      </v-row>
                      <v-fade-transition>
                        <v-overlay
                          v-if="hover"
                          absolute
                          color="#036358"
                          class="d-flex justify-center align-center"
                        >
                          <!-- <v-row class="text-h3 white--text my-6">{{event.vendor}}</v-row> -->
                          <v-row>
                            <v-icon
                              color="white"
                              class="mx-3"
                              size="60"
                              @click="goToVendorInterface(event.vendor)"
                              >mdi-selection-search</v-icon
                            >
                          </v-row>
                        </v-overlay>
                      </v-fade-transition>
                    </v-card>
                  </Observer>
                </template>
              </v-hover>
            </div>
          </div>

          <!-- vue-masonry Vendor Search Result-->

          <div
            v-masonry
            id="masonry"
            transition-duration="3s"
            item-selector=".item"
            gutter="2"
            column-width="8"
            origin-left="false"
            v-if="!isPromotionEventShowed"
          >
            <div
              v-masonry-tile
              class="item"
              v-for="(event, index) in promotionEventsProcessed"
              :key="index"
            >
              <v-hover>
                <template v-slot:default="{ hover }">
                  <Observer
                    @on-change="onChange"
                    :id="index"
                    :threshold="threshold"
                  >
                    <v-card
                      @mouseenter.stop="pickVendor(index)"
                      @mouseleave.stop="leaveVendor(index)"
                      class="pa-1 mb-1"
                      style="box-shadow: 0 12px 50px 3px #d4d6e2"
                      width="223"
                    >
                      <v-card-text>
                        <v-row class="my-1">
                          <v-col
                            cols="12"
                            class="d-flex flex-column justify-start align-center"
                          >
                            <v-card flat class="rounded mb-1" width="70">
                              <v-img contain :src="event.vendorLogo"> </v-img>
                            </v-card>
                            <span
                              class="text-subtitle-2 text-center primary--text d-inline"
                            >
                              {{ event.vendor }}</span
                            >
                            <v-rating
                              :value="event.vendorRating"
                              background-color="accent lighten-3"
                              color="accent"
                              x-small
                              half-increments
                              empty-icon="mdi-star-outline"
                              full-icon="mdi-star"
                              half-icon="mdi-star-half"
                              readonly
                              dense
                            ></v-rating>
                            <span
                              class="primary--text d-block-inline text-caption my-1"
                              ><v-icon small color="primary" class="mb-1"
                                >mdi-phone-classic</v-icon
                              >&nbsp;{{ event.vendorPhone[0] }}</span
                            >
                            <span
                              class="primary--text d-block-inline text-caption my-1 text-center"
                            >
                              <!-- <v-icon small color="primary">mdi-email-box</v-icon> -->
                              &nbsp;{{ address(event) }}</span
                            >
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-row> </v-row>
                      <v-fade-transition>
                        <v-overlay
                          v-if="hover"
                          absolute
                          color="#036358"
                          class="d-flex justify-center align-center"
                        >
                          <v-row>
                            <v-icon
                              color="white"
                              class="mx-3"
                              size="60"
                              @click="goToVendorInterface(event.vendor)"
                              >mdi-selection-search</v-icon
                            >
                          </v-row>
                        </v-overlay>
                      </v-fade-transition>
                    </v-card>
                  </Observer>
                </template>
              </v-hover>
            </div>
          </div>
        </v-container>
      </v-col>

      <!-- Map and Business Card -->
      <v-col
        cols="3"
        class="d-flex flex-column justify-start align-center mr-10"
        id="mapContainer"
        :style="{
          position: toggleMap ? 'absolute' : 'fixed',
          right: '20px',
          top: toggleMap
            ? scrollYW + navbarHeight - 170 + 'px'
            : navbarHeight + 'px',
        }"
      >
        <!-- Search Single Vendor -->
        <v-row class="mb-2 mt-4">
          <v-autocomplete
            v-model="vendorSelected"
            :loading="vendorSearchLoading"
            :items="vendorListFiltered"
            :search-input.sync="vendorSearch"
            cache-items
            full-width
            flat
            solo-inverted
            hide-no-data
            hide-details
            placeholder="Search A Vendor..."
            append-icon="mdi-magnify"
            class="ml-3"
            dense
            color="primary"
            :style="{ width: `${(viewportWidth * 2.3) / 10}` + 'px' }"
          ></v-autocomplete>
        </v-row>
        <!-- Map -->
        <v-card
          :width="
            mapEnlarge ? (viewportWidth * 3) / 10 : (viewportWidth * 2.5) / 10
          "
          :height="
            mapEnlarge
              ? ((viewportHeight - navbarHeight) * 8.5) / 10
              : ((viewportHeight - navbarHeight) * 6.5) / 10
          "
          class="mt-1"
          flat
        >
          <GoogleMap
            :style="
              mapEnlarge
                ? {
                    height:
                      `${((viewportHeight - navbarHeight) * 8.5) / 10}` + 'px',
                    width: `${(viewportWidth * 3) / 10}` + 'px',
                  }
                : {
                    height:
                      `${((viewportHeight - navbarHeight) * 6.2) / 10}` + 'px',
                    width: `${(viewportWidth * 2.5) / 10}` + 'px',
                  }
            "
            id="map"
            class="rounded"
            style="border: 5px inset #c5cae9"
            :markerList="markerList"
            :freshMap="freshMap"
            :newData="reshData"
            v-if="markerList.length == promotionEventsProcessed.length"
          >
          </GoogleMap>
        </v-card>
        <!-- Business Card -->
        <v-card
          class="ml-4 pa-4 mt-n3"
          v-if="pickedVendor && isPromotionEventShowed"
          :width="(viewportWidth * 2.8) / 10"
        >
          <v-row
            class="d-flex flex-row justify-start align-center my-3 px-4 ml-4"
          >
            <v-card flat class="rounded mb-1 mr-3" width="80">
              <v-img
                contain
                :src="pickedVendor.logo"
                class="ma-auto"
                max-height="60"
                max-width="60"
              />
              <v-rating
                :value="pickedVendor.vendorRating"
                background-color="accent lighten-3"
                color="accent"
                x-small
                v-if="pickedVendor.vendorRating"
                half-increments
                empty-icon="mdi-star-outline"
                full-icon="mdi-star"
                half-icon="mdi-star-half"
                readonly
                dense
              ></v-rating>
            </v-card>
            <span
              class="text-subtitle-1 text-center primary--text d-inine-block my-1"
              >{{ pickedVendor.vendor }}
            </span>
          </v-row>
          <!-- <v-card-text> -->
          <v-row class="mb-2 px-4">
            <span
              v-for="(item, i) in showCategoryOnCard"
              :key="i"
              class="text-suntitle-1"
              >{{ item }}</span
            >
          </v-row>

          <!-- </v-card-text> -->
          <v-card-actions>
            <v-row no-gutters>
              <span class="primary--text d-block-inline text-caption my-1"
                ><v-icon small color="primary">mdi-phone-classic</v-icon
                >&nbsp;{{ pickedVendor.vendorPhone }}</span
              ><br />
              <span class="primary--text d-block-inline text-caption my-1"
                ><v-icon small color="primary">mdi-email-box</v-icon>&nbsp;{{
                  pickedVendor.vendorEmail
                }}</span
              >
            </v-row>
            <v-spacer></v-spacer>
            <v-row no-gutters>
              <span class="text-caption text-center primary--text">{{
                pickedVendor.address
              }}</span>
            </v-row>
          </v-card-actions>
          <!-- </v-col> -->
        </v-card>
      </v-col>

      <!-- Finish Profile Dialog -->
      <v-dialog v-model="isFinishProfileOpen" max-width="500" max-height="330">
        <v-card width="500" height="330" style="border-top: 20px solid #7986cb">
          <v-card-text class="mt-8">
            <span class="text-subtitle-1 primary--text"
              >Finish your profile now to earn 10,000 Boundary Silver</span
            ><br />
            <v-img
              src="https://www.animatedimages.org/data/media/100/animated-money-image-0048.gif"
              height="150"
              width="180"
              class="d-block ma-auto"
            ></v-img>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              depressed
              @click="isFinishProfileOpen = false"
              >Later</v-btn
            >
            <v-btn color="primary" text plain @click="goFinishProfile"
              >Go Finish</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
// import MainMapbox from "@/components/MainMapbox.vue";
import GoogleMap from "@/components/GoogleMap.vue";
// import ChatWindow from 'vue-advanced-chat'
import "vue-advanced-chat/dist/vue-advanced-chat.css";
import MapSlot from "./MapSlot.vue";
import VendorHomePage from "../components/vendor/VendorHomePage.vue";
import {
  VENDOR_ORDER_ADDED,
  VENDOR_SETTLEMENT_RECORD_ADDED,
  MESSAGE_RECEIVED,
  CUSTOMER_RATING_ADDED,
  ORDER_STATUS_CHANGED,
} from "../queries/queries_subscription";
import {
  eventBus_vendorParlour,
  eventBus_toggleMapPosition,
  eventBus_pickVendor,
  eventBus_searchVendor,
  eventBus_sortPromotionEvents,
  eventBus_closeSignUp,
} from "../eventBus";
import { mapGetters } from "vuex";
import router from "../router/router";
import Observer from "vue-intersection-observer";
import _ from "lodash";

export default {
  name: "home",
  components: {
    // MainMapbox
    GoogleMap,
    MapSlot,
    VendorHomePage,
    Observer,
  },
  // directives: {
  //   'event-type-photo': {
  //       bind(el, binding, vnode) {
  //         console.log(binding.value)
  //         switch (binding.value) {
  //           case "On_Sale":
  //             el.src = "/static/sales_images__1_-removebg-preview.png";
  //         }
  //     }
  //   }
  // },
  data: () => ({
    attrs: {
      class: "mb-6",
      boilerplate: true,
      elevation: 2,
    },
    freshMap: false,
    order: null,
    pickedVendor: null,
    clickClose: true,
    canProcessEvents: true,
    direction: "down",
    isActive: false,
    isFinishProfileOpen: false,
    viewportHeight: 0,
    viewportWidth: 0,
    reshData: false,
    mapEnlarge: false,
    markerList: [],
    markerListLength: 0,
    headers: [
      { text: "ID", align: "start", sortable: false, value: "flyerId" },
      { text: "Type", value: "type" },
      { text: "Title", value: "flyerTitle" },
    ],
    flyerHeaders: [
      { text: "ID", align: "start", sortable: false, value: "flyerId" },
      { text: "Type", value: "type" },
      { text: "Title", value: "flyerTitle" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    scrollYW: 0,
    showSketchList: false,
    showTemplateList: false,
    showFlyerList: false,
    sortBy: "byDate",
    sortDesc: false,
    templateHeaders: [
      {
        text: "Template ID",
        align: "start",
        sortable: false,
        value: "templateId",
      },
      { text: "Type", value: "templateType" },
      { text: "Tag Name", value: "templateTagName" },
    ],
    toggleMap: false,
    threshold: [0.5],
    profile: null,
    promotionEventsProcessed: [],
    promotionEventList: [],
    vendorListFiltered: [],
    vendorSearch: null,
    vendorSearchLoading: false,
    vendorSelected: null,
    vendorAccountDropdown: [
      {
        icon: "description",
        title: "Profile",
        foo: "handleProfile",
      },
      {
        icon: "exit_to_app",
        title: "Sign Out",
        foo: "handleSignoutVendor",
      },
    ],
    vendorSearchResult: [],
    yAdjust: 0,
    signin: true,
    drawer: false,
    isPromotionEventShowed: true,
    isFormValid: false,
    isNewData: false,
  }),

  apollo: {
    $subscribe: {
      customerRatingAdded: {
        query: CUSTOMER_RATING_ADDED,
        result({ data }) {
          const { customerRatingAdded } = data;
          if (
            this.vendor &&
            this.vendor.businessTitle == customerRatingAdded.vendor
          ) {
            this.customerRatings.push(customerRatingAdded);
            this.$store.commit("setCustomerRatings", this.customerRatings);
          }
        },
      },
      orderStatusChanged: {
        query: ORDER_STATUS_CHANGED,
        result({ data }) {
          console.log(data);
          const {
            orderStatusChanged: {
              vendor,
              resident,
              orderNo,
              content,
              isUnderDispute,
              isConfirmed,
              isCanceled,
            },
          } = data;
          if (this.vendor && this.vendor.businessTitle == vendor) {
            const index = this.vendorOrders.findIndex(
              (item) => item.orderNo == orderNo
            );
            if (index >= 0) {
              const orders = [...this.vendorOrders];
              orders[index].isCanceled = isCanceled;
              orders[index].isUnderDispute = isUnderDispute;
              orders[index].isConfirmed = isConfirmed;
              orders[index].disputeInfo = content;

              this.$store.commit("setVendorOrders", orders);
            }
          }
        },
      },
      vendorOrderAdded: {
        query: VENDOR_ORDER_ADDED,
        result({ data }) {
          const { vendorOrderAdded } = data;
          console.log(vendorOrderAdded);
          if (
            this.vendor &&
            this.vendor.businessTitle == vendorOrderAdded.vendor
          ) {
            this.vendorOrders.push(vendorOrderAdded);
            this.$store.commit("setVendorOrders", this.vendorOrders);
          }
        },
      },
      vendorSettlementRecordAdded: {
        query: VENDOR_SETTLEMENT_RECORD_ADDED,
        result({ data }) {
          const { vendorSettlementRecordAdded } = data;
          console.log(vendorSettlementRecordAdded);
          if (
            this.vendor &&
            this.vendor.businessTitle == vendorSettlementRecordAdded.vendor
          ) {
            this.vendorSettlementRecords.push(vendorSettlementRecordAdded);
            this.$store.commit(
              "setVendorSettlementRecords",
              this.vendorSettlementRecords
            );
          }
        },
      },
      messageReceived: {
        query: MESSAGE_RECEIVED,
        result({ data }) {
          console.log(data.messageReceived);
          const { messageReceived } = data;

          if (
            this.vendor &&
            messageReceived.receiverType == "vendor" &&
            messageReceived.receiver == this.vendor.businessTitle
          ) {
            let newVendor = this.vendor;
            newVendor.messages.push(messageReceived);
            this.$store.commit("setVendor", newVendor);
          }
        },
      },
    },
  },
  created() {
    eventBus_toggleMapPosition.$on("toggleMap", (value) => {
      const { scrollY, mapContainerHeight, masonryHeight, footerHeight } =
        value;

      if (masonryHeight - scrollY <= mapContainerHeight && !this.toggleMap) {
        this.toggleMap = !this.toggleMap;
        this.scrollYW = scrollY;
        //  this.yAdjust = (this.navbarHeight + mapContainerHeight) - (this.scrollYW + this.navbarHeight + mapContainerHeight)
        //  console.log(this.toggleMap)
        console.log(this.yAdjust);
      }
      if (masonryHeight - scrollY >= mapContainerHeight && this.toggleMap) {
        this.toggleMap = !this.toggleMap;
        this.scrollYW = scrollY;
      }
    });

    eventBus_sortPromotionEvents.$on("sortEvent", (value) => {
      //  console.log(this.promotionEventsProcessed)

      const { cons } = value;
      if (cons.length == 0) {
        this.promotionEventsProcessed = [...this.promotionEvents];
        this.$router.go();
        //  this.isPromotionEventShowed = true
        //  return
      } else {
        const list = [];
        this.promotionEvents.map((item) => {
          cons.forEach((element) => {
            if (
              _.words(item.vendorCategory).includes(element) ||
              item.vendorCategory.includes(element)
            ) {
              //  console.log(item)
              list.push(item);
              //  console.log(list)
            }
          });
        });
        // console.log(list)
        this.promotionEventsProcessed = [...list];
      }

      console.log(this.promotionEventsProcessed);

      this.isPromotionEventShowed = true;
    });

    eventBus_searchVendor.$on("searchVendor", (value) => {
      const { result, isPromotionEventShowed } = value;
      //  console.log(isPromotionEventShowed)
      //  console.log(result)
      //  if(isPromotionEventShowed && isPromotionEventShowed == this.isPromotionEventShowed) return
      if (!isPromotionEventShowed) {
        //
        this.vendorSearchResult = [...result];
        // this.processPromotionEvents()
        this.isPromotionEventShowed = isPromotionEventShowed;
        this.isNewData = true;
      } else {
        //
        this.promotionEventList = [...result];
        //  this.processPromotionEvents()
        this.isNewData = true;
        this.isPromotionEventShowed = isPromotionEventShowed;
      }
      // this.promotionEventsProcessed = []
    });

    this.promotionEventList = [...this.promotionEvents];
  },
  mounted() {
    //  this.processPromotionEvents()
    // console.log(this.promotionEvents)
    if (this.resident) {
      this.isFinishProfileOpen = !this.resident.profileFilled;
    }

    // if( this.resident && this.resident.guild!=null) {
    //     this.$store.dispatch("getGuildDealsStatus", {
    //     guildFullName: this.resident.guild.guildFullName,
    //   });
    // }

    if (this.vendor) {
      this.$store.dispatch("getSketchList", {
        businessTitle: this.vendor.businessTitle,
      });
      this.$store.dispatch("getTemplateList", {
        businessTitle: this.vendor.businessTitle,
      });
      this.$store.dispatch("getFlyerList", {
        businessTitle: this.vendor.businessTitle,
      });
    }

    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    // const navHeight = document.getElementById("navbar").offsetHeight;

    // this.masonryHeight = document.getElementById("masonry").offsetHeight
    // console.log(navHeight);
    // this.$store.commit("setNavbarHeight", navHeight);

    const footer = this.footerHeight;
    const navHeight = this.navbarHeight;

    window.addEventListener("scroll", function () {
      const masonry = document.getElementById("masonry");

      if (masonry) {
        let masonryStyle = getComputedStyle(masonry);
        const masonryHeight =
          masonry.offsetHeight +
          parseInt(masonryStyle.marginTop) +
          parseInt(masonryStyle.marginBottom);

        const mapContainer = document.getElementById("mapContainer");
        let mapContainerStyle = getComputedStyle(mapContainer);
        const mapContainerHeight =
          mapContainer.offsetHeight +
          parseInt(mapContainerStyle.marginTop) +
          parseInt(mapContainerStyle.marginBottom);

        const footer = window.document.getElementById("footer");
        let footerStyle = getComputedStyle(footer);
        const footerHeight =
          footer.offsetHeight +
          parseInt(footerStyle.marginTop) +
          parseInt(footerStyle.marginBottom);

        const navbar = window.document.getElementById("navbar");
        let navbarStyle = getComputedStyle(navbar);
        const navbarHeight =
          navbar.offsetHeight +
          parseInt(navbarStyle.marginTop) +
          parseInt(navbarStyle.marginBottom);

        eventBus_toggleMapPosition.$emit("toggleMap", {
          scrollY: this.scrollY,
          mapContainerHeight,
          masonryHeight,
          footerHeight,
        });

        // console.log('masonry',masonryHeight)
        // console.log('mapContainer',mapContainerHeight)
        // console.log('footerHeight', footerHeight)
        // console.log('navrHeight', navbarHeight)

        // console.log('scrollY',this.scrollY)
      }
    });

    // console.log(this.viewportHeight);
    // console.log(this.viewportWidth);
  },
  watch: {
    isPromotionEventShowed(val) {
      console.log(val);
      this.promotionEventsProcessed = [];
      // this.isNewData = true
    },

    resident(val) {
      if (val) {
        this.isFinishProfileOpen = !val.profileFilled;
        // if( this.resident && this.resident.guild!=null) {
        //   this.$store.dispatch("getGuildDealsStatus",
        //   {guildFullName: this.resident.guild.guildFullName});
        // }
      }
    },

    vendor(value) {
      if (value) {
        this.$store.dispatch("getSketchList", {
          businessTitle: this.vendor.businessTitle,
        });
        this.$store.dispatch("getTemplateList", {
          businessTitle: this.vendor.businessTitle,
        });
        this.$store.dispatch("getFlyerList", {
          businessTitle: this.vendor.businessTitle,
        });
        // this.$router.push("/");
      }
    },

    vendorSearch(val) {
      //  console.log(val)
      val && val !== this.vendorSelected && this.querySelections(val);
    },

    vendorSelected(val) {
      // console.log(val)
      this.$router.push({ name: "vendorInterface", params: { vendor: val } });
      // goToVendorInterface(val)
    },

    vendorSearchResult(val) {
      if (val.length > 0) {
        //  this.promotionEventsProcessed = []
        this.processPromotionEvents();
        // this.isNewData = true
      }
    },

    promotionEventList(val) {
      if (val.length > 0) {
        this.processPromotionEvents();
      }
      // console.log(val)
    },

    promotionEvents(val) {
      // if(val.length > 0) {

      this.promotionEventList = [...val];
      // }
      // console.log(val)
    },

    promotionEventsProcessed(val) {
      // console.log(val)
      if (val.length > 0) {
        this.markerListLength = val.length;
        const list = val.map((item) => {
          //  const address = item.vendorStreetNo + ' '
          //                         + item.vendorStreetName
          //                         + ' ' + item.vendorCity
          //                         + ' ' + item.vendorState
          //                         + ' ' + item.vendorCountry
          //   return { vendor: item.vendor, address, show: 'true' }

          const coords = { lat: item.lat, lng: item.lng };
          return { vendor: item.vendor, coords, show: "true" };
        });
        this.freshMap = true;
        this.markerList = [...list];
        this.reshData = this.isNewData;
        this.$redrawVueMasonry("masonry");
        console.log(this.markerList);

        const {
          vendorStreetNo,
          vendorStreetName,
          vendorCity,
          vendorState,
          vendorCountry,
          vendorPhone,
          vendorEmail,
          vendorRating,
          vendor,
          vendorLogo,
          vendorCategory,
        } = val[0];
        const address =
          vendorStreetNo +
          " " +
          vendorStreetName +
          " " +
          vendorCity +
          " " +
          vendorState +
          " " +
          vendorCountry;
        this.pickedVendor = {
          vendor,
          logo: vendorLogo,
          address,
          category: vendorCategory,
          vendorPhone,
          vendorEmail,
          vendorRating,
        };
        this.$redrawVueMasonry("masonry");
      }
    },
  },

  computed: {
    ...mapGetters([
      "vendorList",
      "navbarHeight",
      "footerHeight",
      "vendor",
      "resident",
      "loading",
      "vendorHomeLoading",
      "error",
      "navbarHeight",
      "sketchList",
      "templateList",
      "savedFlyerList",
      "inDesign",
      "promotionEvents",
      "vendorSalesInfo",
      "vendorSettlementRecords",
      "vendorOrders",
      "customerRatings",
    ]),

    showCategoryOnCard() {
      let category = [];
      if (this.pickedVendor) {
        for (let item of this.pickedVendor.category) {
          const lastLocService = item.lastIndexOf("-");
          category.push(item.slice(lastLocService + 1));
        }
      }
      return category;
    },
  },

  methods: {
    address(item) {
      return (
        item.vendorStreetNo +
        " " +
        item.vendorStreetName +
        " " +
        item.vendorCity +
        " " +
        item.vendorState +
        " " +
        item.vendorCountry
      );
    },

    goFinishProfile() {
      this.isFinishProfileOpen = false;
      this.$router.push("profile");
    },

    goToDistributeFlyer(item) {
      // console.log(item);
      this.showFlyerList = false;
      this.$store.dispatch("setUpFlyer", {
        flyerId: item.flyerId,
        businessTitle: this.vendor.businessTitle,
        time: Date.now().toString(),
      });
      this.$store.commit("setInDesign", true);
    },

    designFlyerHandler() {
      this.$store.commit("setInDesign", true);
      this.$router.push("vendorflyers");
    },

    dealsCommittedHandler() {
      // console.log("deal")
      router.push("guildDealsFulfillment");
    },

    eventTypePic(type) {
      switch (type) {
        case "On_Sale":
          return "../assets/images/sales_images__1_-removebg-preview.png";
      }
    },

    guildDealsHandler() {
      this.$store.commit("setInDesign", true);
      router.push("guildDeal");
    },

    goToVendorInterface(vendor) {
      this.$router.push({ name: "vendorInterface", params: { vendor } });
    },

    handleFlyerSelected() {},

    handleSketchSelected(e) {
      // console.log(e);
      // console.log(e.flyerId);
      this.showSketchList = false;
      this.$store.dispatch("getSelectedSketch", {
        flyerId: e.flyerId,
        businessTitle: this.vendor.businessTitle,
        time: Date.now().toString(),
      });
      this.$store.commit("setInDesign", true);
    },
    handleTemplateSelected(e) {
      // console.log(e);
      // console.log(e.templateId);
      this.showTemplateList = false;
      this.$store.dispatch("getSelectedTemplate", {
        templateId: e.templateId,
        businessTitle: this.vendor.businessTitle,
        time: Date.now().toString(),
      });
      this.$store.commit("setInDesign", true);
    },

    handleSignoutVendor() {
      // this.$router.push("/");
      eventBus_vendorParlour.$emit("vendorParlour", false);
      this.$store.dispatch("signoutVendor");
    },

    onChange(entry, obv) {
      // this.visible = entry.isIntersecting
      // console.log(entry)
      const index = entry.target.id;
      let list = [];
      list = [...this.markerList];
      // console.log(list)

      list[index].show = entry.isIntersecting ? "true" : "false";
      this.freshMap = false;
      this.markerList.splice(0, this.markerList.length);
      this.markerList = [...list];

      // console.log(this.markerList)
    },

    pickVendor(index) {
      // console.log(index)
      const {
        vendorStreetNo,
        vendorStreetName,
        vendorCity,
        vendorState,
        vendorCountry,
        vendorPhone,
        vendorEmail,
        vendorRating,
        vendor,
        vendorLogo,
        vendorCategory,
      } = this.promotionEventsProcessed[index];
      const address =
        vendorStreetNo +
        " " +
        vendorStreetName +
        " " +
        vendorCity +
        " " +
        vendorState +
        " " +
        vendorCountry;
      this.pickedVendor = {
        vendor,
        logo: vendorLogo,
        address,
        category: vendorCategory,
        vendorPhone,
        vendorEmail,
        vendorRating,
      };
      eventBus_pickVendor.$emit("pickVendor", { index });
    },

    querySelections(v) {
      // console.log(v)
      const vendorListNew = this.vendorList.map((item) => {
        return item.vendor;
      });
      this.vendorSearchLoading = true;
      // Simulated ajax query
      setTimeout(() => {
        this.vendorListFiltered = vendorListNew.filter((e) => {
          return (e || "").toLowerCase().indexOf((v || "").toLowerCase()) > -1;
        });
        // console.log(this.vendorListFiltered)
        this.vendorSearchLoading = false;
      }, 500);
    },

    leaveVendor(index) {
      // console.log(index)
      eventBus_pickVendor.$emit("leaveVendor", { index });
    },

    setUpFlyer(item) {
      // console.log(item);
      this.showFlyerList = false;
      this.$store.dispatch("setUpFlyer", {
        flyerId: item.flyerId,
        businessTitle: this.vendor.businessTitle,
        time: Date.now().toString(),
      });
      this.$store.commit("setInDesign", true);
    },

    manageGuildDealsHandler() {
      this.$router.push("manageGuildDeals");
    },

    // redraw(){
    //   console.log('redraw')
    //   this.$redrawVueMasonry('masonry')
    // },

    vendorHandlers(index) {
      // console.log(index);
      switch (index) {
        case 0:
          this.$store.commit("setInDesign", true);
          this.$router.push("vendorProfile");

          break;

        case 1:
          // this.showSavedSketchList = true;
          this.handleSignoutVendor();

          break;
      }
    },

    vendorProductServiceHandler() {
      this.$store.commit("setInDesign", true);
      this.$router.push("vendorProductService");
    },

    vendorStatisticHandler() {
      this.$router.push("vendorSalesStatistic");
    },

    vendorSettlementHandler() {
      this.$router.push("vendorSettlementRecords");
    },

    vendorMembershipHandler() {
      this.$router.push("vendorMembership");
    },

    vendorGalleryHandler() {
      // this.$store.commit("setInDesign", true);
      this.$router.push("vendorGallery");
    },

    promotionsHandler() {
      this.$store.commit("setInDesign", true);
      this.$router.push("vendorPromotions");
    },

    processPromotionEvents() {
      // console.log(list)

      if (this.isNewData) this.promotionEventsProcessed = [];
      let eventList = [];
      this.canProcessEvents = false;
      if (this.promotionEventsProcessed.length > 0) {
        eventList = [...this.promotionEventsProcessed];
      } else {
        eventList = this.isPromotionEventShowed
          ? [...this.promotionEventList]
          : [...this.vendorSearchResult];
      }
      // console.log(eventList)
      switch (this.sortBy) {
        case "byDate":
          if (this.isPromotionEventShowed) {
            if (this.sortDesc) {
              // console.log(eventList)
              eventList.sort((a, b) => {
                return -1 * (new Number(a.dateTo) - new Number(b.dateTo));
              });
            } else {
              eventList.sort((a, b) => {
                return new Number(a.dateTo) - new Number(b.dateTo);
              });
            }
          }

          break;
        case "byTitle":
          if (this.sortDesc) {
            eventList.sort((a, b) => {
              const aSplit = a.vendor.slice(0, 1).toLowerCase();
              const bSplit = b.vendor.slice(0, 1).toLowerCase();
              // console.log(aSplit)
              // console.log(bSplit)
              // return  aSplit.toLowerCase().localeCompare(bSplit.toLowerCase())
              if (aSplit > bSplit)
                //sort string ascending
                return -1;
              if (aSplit < bSplit) return 1;
              return 0; //defa
            });
            // eventList = _.orderBy(eventList, 'vendor', 'desc')
            // console.log(eventList)
          } else {
            // eventList = _.orderBy(eventList, 'vendor', 'asc')

            eventList.sort((a, b) => {
              const aSplit = a.vendor.slice(0, 1).toLowerCase();
              const bSplit = b.vendor.slice(0, 1).toLowerCase();
              // return  aSplit.toLowerCase().localeCompare(bSplit.toLowerCase())
              if (aSplit < bSplit)
                //sort string ascending
                return -1;
              if (aSplit > bSplit) return 1;
              return 0; //defa
            });
          }
      }
      // console.log(eventList)
      // this.freshMap = true
      this.promotionEventsProcessed.splice(
        0,
        this.promotionEventsProcessed.length
      );
      this.promotionEventsProcessed = [...eventList];

      // console.log(this.promotionEventsProcessed)
      // this.$redrawVueMasonry('masonry')
      setTimeout(() => {
        this.canProcessEvents = true;
      }, 0);
    },
  },
  beforeRouteEnter(to, from, next) {
    // this.$store.commit('setIsSearchBtnDisabled', true)
    next((vm) => {
      // put your logic here
      vm.markerList = vm.$store.getters.markerList;
      vm.promotionEventsProcessed = vm.$store.getters.promotionEventsProcessed;
      vm.freshMap = true;
      vm.isPromotionEventShowed = vm.$store.getters.isPromotionEventShowed;
      vm.$store.commit("setIsSearchBtnDisabled", false);
      // console.log(vm.markerList)
    });
  },
  beforeRouteLeave(to, from, next) {
    this.$store.commit("setMarkerList", this.markerList);
    this.$store.commit(
      "setPromotionEventsProcessed",
      this.promotionEventsProcessed
    );
    this.$store.commit(
      "setIsPromotionEventShowed",
      this.isPromotionEventShowed
    );
    this.$store.commit("setIsSearchBtnDisabled", true);
    eventBus_closeSignUp.$emit("closeSU", { close: false });
    // this.markerList = []
    // this.promotionEvents = []
    next();
  },
};
</script>

<style lang="scss" scoped>
// * {
//   margin: 0;
//   padding: 0;
// }

.mapPanelFixed {
  position: fixed;
  top: 130px;
  right: 20px;
}

.mapPanelAbsolute {
  position: absolute;
  top: 130px;
  right: 20px;
}

.item {
  border: 1px double rgb(246, 246, 247);
}

h1 {
  display: inline-block;
}
#left::-webkit-scrollbar-track {
  // border: 1px solid black;
  background-color: #ffffff;
}

#left::-webkit-scrollbar {
  width: 5px;
  background-color: #ffffff;
}

#left::-webkit-scrollbar-thumb {
  background-color: #c3bce6;

  background-image: -webkit-linear-gradient(
    90deg,
    rgb(99, 79, 199) 0%,
    rgba(99, 79, 199, 1) 25%,
    transparent 100%,
    rgba rgba(99, 76, 199, 1) 75%,
    transparent
  );
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
.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.5s;
}

.fade-enter-active {
  transition-delay: 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.9s ease;
}
.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
