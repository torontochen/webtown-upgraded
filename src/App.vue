<template>
  <v-app class="mt-2">
    <!-- d-flex flex-column justify-space-between align-center -->
    <!-- Side Navbar -->
    <v-navigation-drawer app temporary fixed v-model="drawer">
      <v-toolbar color="white" dark flat>
        <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
        <router-link to="/" tag="a" style="cursor: pointer">
          <!-- <h1 class="title pl-3">Cybertown</h1> -->
          <v-img
            src="./assets/images/Screen_Shot_2022-10-14_at_11.56.26_AM-removebg-preview.png"
            max-height="30"
            max-width="30"
            z-index="10"
            class="d-block ml-2 mb-2"
          ></v-img>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Side Navbar Links -->
      <v-list nav dense>
        <v-list-item-group>
          <v-list-item v-for="(item, i) in items" :key="i">
            <v-list-item-icon>
              <v-icon color="primary">{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="primary-text">{{
                item.title
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-container>
      <v-app-bar
        fixed
        color="white"
        elevate-on-scroll
        app
        id="navbar"
        style="z-index: 100"
      >
        <!-- navIcon -->
        <v-app-bar-nav-icon
          @click.stop="drawer = !drawer"
          class="d-flex d-sm-none"
          color="primary"
        ></v-app-bar-nav-icon>

        <!-- boundary logo -->
        <!-- <v-toolbar-title class="hidden-xs-only ml-10"> -->
        <v-container class="ml-6 mb-1">
          <router-link to="/" tag="a" style="cursor: pointer">
            <v-img
              src="./assets/images/Screen_Shot_2022-10-14_at_11.56.26_AM-removebg-preview.png"
              max-height="150"
              max-width="200"
              class="d-block mt-7"
            ></v-img>
          </router-link>
        </v-container>

        <!-- </v-toolbar-title> -->

        <v-spacer></v-spacer>

        <!-- Search Input -->

        <!-- <v-autocomplete
          v-if="!vendorParlour && !vendor"
          class="d-flex-inline px-1 pt-4 justify-center"
          v-model="demandSearch"
          prepend-inner-icon="mdi-magnify"
          placeholder="any wish, any demand, anythings..."
          color="primary"
          single-line
          hide-details
        ></v-autocomplete> -->
        <!-- Geo Search -->
        <!-- <v-autocomplete
          v-if="!vendorParlour && !vendor"
          class="d-flex-inline px-1 pt-4 justify-center"
          v-model="geoSearch"
          prepend-inner-icon="place"
          placeholder="any wish, any demand, anythings..."
          color="primary"
          single-line
          hide-details
        ></v-autocomplete> -->

        <!-- vendor navbar items -->
        <v-row
          v-if="vendorParlour || vendor"
          class="d-flex mt-1 justify-start align-center"
          justify="end"
          style="right: 40px"
        >
          <!-- justify="end" -->
          <v-avatar class="rounded-lg mr-3" tile height="80" width="100">
            <v-img
              src="../public/static/vendor1.png"
              icon
              max-height="50"
              max-width="50"
              z-index="10"
            >
            </v-img>
            <h5 class="primary--text text--lighten-3 d-block ml-n2">
              Vendor Parlour
            </h5>
          </v-avatar>
        </v-row>

        <!-- Resident Nav Bar -->
        <v-container
          class="d-flex flex-row justify-space around align-center mt-5"
          v-if="!vendor && !vendorParlour"
        >
          <v-btn-toggle v-model="btn" tile color="" group>
            <!-- metro -->
            <v-btn
              text
              plain
              icon
              class="mr-16 ml-n3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon left dark class="ml-1"> mdi-map-marker-radius </v-icon>
              {{ cityHall.metro }}
            </v-btn>

            <!-- treasure -->
            <v-btn
              text
              plain
              icon
              class="mx-16"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon left dark class="ml-3"> mdi-treasure-chest </v-icon>
              {{ cityHall.treasure | format-int-amount }}
            </v-btn>

            <!-- Population -->
            <v-btn
              text
              plain
              icon
              class="mr-6 ml-8"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon left dark class="ml-3"> mdi-account-group </v-icon>
              {{ cityHall.population | format-int-amount }}
            </v-btn>

            <!-- Strength -->
            <v-btn
              text
              plain
              icon
              class="mx-16"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon left dark class="ml-3"> mdi-arm-flex </v-icon>
              {{ cityHall.might | format-int-amount }}
            </v-btn>
            <v-spacer></v-spacer>

            <!-- Polyfill -->
            <v-btn
              text
              plain
              icon
              class="mx-2"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;
            </v-btn>
            <v-spacer></v-spacer>

            <!-- Governor -->
            <v-btn
              text
              plain
              icon
              class="ml-16"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon left dark class="ml-3"> mdi-crown </v-icon>
              {{ cityHall.governor }}
            </v-btn>
          </v-btn-toggle>
          <!-- </v-row> -->
        </v-container>

        <v-spacer></v-spacer>

        <!-- signin and signup -->
        <v-container
          dense
          v-if="!resident && !vendorParlour && !vendor"
          class="mt-4 ml-10 pl-10 d-flex justify-center align-center"
        >
          <v-btn
            text
            plain
            color="primary"
            :disabled="signUp"
            @click="signIn = true"
            medium
          >
            Login
          </v-btn>

          <v-btn
            color="secondary"
            text
            plain
            outlined
            @click="signUp = true"
            medium
          >
            Sign up
          </v-btn>
        </v-container>

        <!-- <v-spacer></v-spacer> -->

        <!-- resident navbar -->
        <v-container
          v-if="resident && !vendorParlour && !vendor"
          dense
          class="d-flex justify-center align-center"
        >
          <!-- shopping cart icon -->
          <v-spacer></v-spacer>
          <v-badge
            color="accent"
            :content="shoppingCart ? shoppingCart.length : null"
            bordered
            overlap
            offset-x="50"
            offset-y="30"
            :value="shoppingCart.length > 0"
          >
            <v-btn icon x-large @click="toShoppingCart" class="mt-3">
              <v-icon color="primary lighten-1">mdi-cart-outline</v-icon>
            </v-btn>
          </v-badge>

          <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-card
                flat
                class="pa-1"
                max-width="200"
                :height="navbarHeight"
                v-on="on"
                v-bind="attrs"
              >
                <v-menu
                  right
                  offset-y
                  nudge-bottom="2"
                  open-on-hover
                  close-delay="100"
                  transition="slide-x-reverse-transition"
                  :disabled="displayValid"
                >
                  <template v-slot:activator="{ on }">
                    <v-container class="mt-3">
                      <v-avatar v-on="on" size="64" color="white" right>
                        <v-img :src="resident.avatarPic" height="30" width="30">
                        </v-img>
                        <v-icon left small class="ml-n2 mt-n2" color="primary">
                          arrow_drop_down
                        </v-icon>
                      </v-avatar>
                    </v-container>
                  </template>

                  <v-list dense>
                    <v-list-item
                      v-for="(dropdownItem, index) in accountDropdown"
                      :key="index"
                      @click="handlers(index)"
                      :disabled="
                        dropdownItem.title == 'Sign Out' ? displayValid : false
                      "
                      :style="{
                        'background-color':
                          dropdownItem.title == 'Sign Out'
                            ? '#E3F2FD'
                            : 'white',
                      }"
                    >
                      <v-icon
                        class="mr-2"
                        dense
                        :color="
                          dropdownItem.title == 'Sign Out'
                            ? displayColor
                            : 'primary'
                        "
                        >{{ dropdownItem.icon }}</v-icon
                      >
                      <v-list-item-title
                        :class="
                          !displayValid ? 'primary--text' : 'fontColor--text'
                        "
                        >{{ dropdownItem.title }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
                <!-- </v-row> -->
              </v-card>
            </template>
            <span class="white--text">
              {{
                resident.firstName || resident.lastName
                  ? resident.firstName + "  " + resident.lastName
                  : resident.residentName
              }}
            </span>
          </v-tooltip>
        </v-container>

        <!-- Search and Sort Button -->
        <template v-slot:extension v-if="!vendor && !vendorParlour">
          <v-toolbar flat dense>
            <v-spacer></v-spacer>
            <v-btn
              text
              plain
              color="primary"
              @click="openEventSortDia"
              :disabled="isSearchBtnDisabled"
              >Event</v-btn
            >
            <v-btn
              text
              plain
              color="primary"
              @click="openSearchProductDia"
              :disabled="isSearchBtnDisabled"
              >Search By Product</v-btn
            >
            <v-btn
              text
              plain
              color="primary"
              @click="openSearchServiceDia"
              :disabled="isSearchBtnDisabled"
              >Search By Service</v-btn
            >
            <v-btn
              text
              plain
              color="primary"
              @click="openSearchRestDia"
              :disabled="isSearchBtnDisabled"
              >Restaurant & Bar</v-btn
            >

            <v-spacer></v-spacer>
          </v-toolbar>
        </template>
      </v-app-bar>
    </v-container>

    <!-- main content -->
    <v-row class="mb-10">
      <Signup
        :signUp="signUp"
        @closeSignUp="signUp = false"
        @handleSignIn="handleSignIn"
        v-if="signUp"
      />
      <v-main v-else>
        <!-- <keep-alive> -->
        <!-- <router-view
          name='vendor-home'
          v-if="vendor"
        ></router-view> -->
        <router-view></router-view>
        <!-- </keep-alive> -->

        <!-- Auth Sign In Snackbar -->
        <v-snackbar
          v-model="authSnackbar"
          color="secondary"
          :timeout="3000"
          bottom
        >
          <h3 class="text-center mr-2">
            You are now Signed in!<v-icon>check_circle</v-icon>
          </h3>
          <!-- <v-btn dark text  @click="authSnackbar = false"> Close </v-btn> -->
        </v-snackbar>

        <!-- News Snackbar -->

        <v-snackbar
          color="accent"
          :timeout="-1"
          bottom
          :value="true"
          outlined
          multi-line
          :width="viewPortDimension.width"
          height="20"
          v-if="newsLine"
        >
          <span @click="isNewsDialogOpen = true" style="cursor: pointer">
            <!-- <v-slide-y-transition hide-on-leave v-if="changeNews"> -->
            <h4>{{ newsLine.newsTitle }}</h4>
            :&nbsp;&nbsp;{{ newsLine.headLine }}&nbsp;&nbsp;at&nbsp;{{
              newsLine.date | convert-customer-rating-time
            }}
            <!-- </v-slide-y-transition> -->
          </span>
        </v-snackbar>

        <!-- Send Wish Snackbar-->
        <v-snackbar
          v-model="wishSnackbar"
          color="primary"
          :timeout="3000"
          centered
        >
          <v-icon>check_circle</v-icon>
          <h3>You send the wish out</h3>
          <v-btn dark text @click="wishSnackbar = false"> Close </v-btn>
        </v-snackbar>

        <!-- Auth Error Snackbar -->
        <v-snackbar
          v-if="authError"
          v-model="authErrorSnackbar"
          color="warning"
          :timeout="6000"
          bottom
        >
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{ authError.message }}</h3>
          <v-btn dark text @click="signIn = true"> Sign in </v-btn>
        </v-snackbar>

        <!-- House Floating Button -->
        <v-tooltip top v-if="resident">
          <template v-slot:activator="{ on }">
            <v-btn
              fab
              color="primary"
              bottom
              right
              fixed
              large
              dark
              to="/openhouse"
              v-on="on"
            >
              <v-icon size="50">home </v-icon>
            </v-btn>
          </template>
          <span>My Home</span>
        </v-tooltip>

        <!-- Guild Chat Window -->
        <VueDraggableResizable
          class="draggable-window"
          :w="300"
          :h="300"
          v-if="resident && resident.guild !== null"
        >
          <beautiful-chat
            class="chat-window"
            :participants="participants"
            :isOpen="isChatOpen"
            :open="openChat"
            :onMessageWasSent="onMessageWasSent"
            :close="closeChat"
            :messageList="messageList"
            :messageStyling="true"
            :alwaysScrollToBottom="alwaysScrollToBottom"
            :showEmoji="true"
            :showEdition="true"
            :showDeletion="true"
            :showHeader="true"
            :colors="colors"
          >
            <template v-slot:header>
              <v-avatar
                ><v-img :src="`/guildLogos/${resident.guild.guildLogo}`"
              /></v-avatar>
              <v-btn text dark class="mt-1">{{
                resident.guild.guildFullName
              }}</v-btn>
            </template>

            <template v-slot:text-message-body="scopedProps">
              <p
                class="sc-message--text-content"
                v-html="scopedProps.messageText"
              ></p>
            </template>

            <template v-slot:user-avatar="{ message, user }">
              <div
                class="d-flex justify-start align-end ml-n2"
                v-if="user && user.name"
              >
                <v-col>
                  <v-row class="mb-1" no-gutters dense>
                    <v-avatar size="40" class="ml-2">
                      <v-img :src="user.imageUrl" />
                    </v-avatar>
                  </v-row>
                  <small
                    class="ml-1 in-line-block"
                    style="font-size: 10px; text-align: left"
                    >{{ message.nickName }}</small
                  ><br />
                  <small
                    style="color: red; font-size: 10px"
                    v-if="message.data.meta"
                  >
                    {{ message.data.meta }}
                  </small>
                </v-col>
              </div>
            </template>
          </beautiful-chat>
        </VueDraggableResizable>
      </v-main>
    </v-row>

    <!-- Footer -->
    <v-row class="mt-16">
      <v-footer app absolute id="footer">
        <v-container class="ma-auto px-8" style="box-sizing: boder-box">
          <v-row class="d-flex justify-space-around align-stretch" no-gutters>
            <v-col
              lg="3"
              xl="1"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-left d-block fontColor--text text--darken-3"
                >about boundary</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >our story</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >management</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >work with us</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="1"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-left d-block fontColor--text text--darken-3"
                >resident</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >virtual life</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >make money</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >benefits</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="1"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-left d-block fontColor--text text--darken-3"
                >game</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >meta world</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >real life in game</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >upgrade</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="2"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-center d-block fontColor--text text--darken-3"
                >vendor parlour</span
              >

              <span class="d-block text-center my-1">
                <router-link
                  to="/signupvendor"
                  style="cursor: pointer; text-decoration: none"
                  class="text-body-2 fontColor--text"
                  :class="{ disabled: !vendorActive || vendor || resident }"
                  @click.native="vendorParlour = true"
                  >become a vendor</router-link
                >
                <router-link
                  class="accent--text text--lighten-1 text-subtitle-2"
                  to="/signinvendor"
                  :class="{ disabled: !vendorActive || vendor || resident }"
                >
                  or Signin
                </router-link>
              </span>

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >business</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >how it works</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 fontColor--text d-block my-1"
                >improve business</router-link
              >
            </v-col>
          </v-row>
          <v-row justify="end" class="d-flex">
            <v-col cols="7">
              <v-img
                src="./assets/images/Screen_Shot_2022-10-14_at_11.56.26_AM-removebg-preview.png"
                max-height="100"
                max-width="150"
                class="ml-2 d-block"
                dense
              ></v-img>

              <!-- </v-avatar> -->
              <h5 class="font-weight-regular primary--text d-block ml-n2 mt-2">
                Live Real Life In A Virtual World
              </h5>

              <!-- </v-container> -->
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </v-row>

    <Signin
      :signIn="signIn"
      @closeSignIn="signIn = false"
      @handleSignUp="handleSignUp"
    />

    <!-- Wish Dialog -->
    <v-dialog v-model="isWishDialogOpen" max-width="700" max-height="550">
      <v-card width="700" height="550">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>You Wish</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-col cols="9" class="ma-auto">
            <v-select
              v-model="wishKeywords"
              :items="wishKeywordOptions"
              small-chips
              label="Select Several Keywords "
              clearable
              multiple
              deletable-chips
              class="my-4"
            ></v-select>
            <v-textarea
              placeholder="your wish"
              v-model="wishText"
              required
              outlined
            ></v-textarea>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            :disabled="wishKeywords.length == 0 || wishText == null"
            @click="sendWish"
            >Send</v-btn
          >
          <v-btn outlined color="primary" @click="cancelWish">Cancel</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Event Sort Dialog -->
    <v-dialog v-model="isSortEventOpen" max-width="600" max-height="300">
      <v-card width="600" height="400">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>Sort Promotion Events</v-toolbar-title>
        </v-toolbar>
        <v-col cols="9" class="ma-auto">
          <v-select
            v-model="productEventSelections"
            :items="productCategory"
            small-chips
            label="Products ( non-restaurant items) "
            clearable
            multiple
            deletable-chips
            class="my-4"
            :disabled="
              serviceEventSelections.length > 0 ||
              restEventSelections.length > 0
            "
          ></v-select>

          <v-select
            v-model="serviceEventSelections"
            :disabled="
              productEventSelections.length > 0 ||
              restEventSelections.length > 0
            "
            dense
            :items="serviceCategory"
            small-chips
            label="Service "
            clearable
            deletable-chips
            multiple
            class="my-4"
          ></v-select>

          <v-select
            v-model="restEventSelections"
            :disabled="
              productEventSelections.length > 0 ||
              serviceEventSelections.length > 0
            "
            :items="restaurantCategory"
            small-chips
            label="Restaurant "
            clearable
            deletable-chips
            multiple
            class="my-4"
          ></v-select>
        </v-col>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed @click="sortEvent"
            >Sort Events</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- :disabled="productEventSelections.length==0&&serviceEventSelections.length==0&&restEventSelections.length==0" -->

    <!-- Product Search Dialog -->
    <v-dialog v-model="isProductDialogOpen" max-width="600" max-height="300">
      <v-card width="600" height="400">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>Search By Product</v-toolbar-title>
        </v-toolbar>
        <v-col cols="9" class="ma-auto">
          <v-select
            v-model="productSelections"
            :items="productCategory"
            small-chips
            label="Products ( non-restaurant items) "
            clearable
            multiple
            deletable-chips
            @change="handleProductSubCategory"
            class="my-4"
          ></v-select>
          <v-select
            :disabled="productSelections.length == 0"
            v-model="productDetailedSelections"
            :items="productSubCategory"
            small-chips
            label="Detailed Items"
            multiple
            clearable
            deletable-chips
            class="my-6"
          ></v-select>
        </v-col>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            :disabled="productDetailedSelections.length == 0"
            @click="search('product')"
            >Search</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Service Search Dialog -->
    <v-dialog v-model="isServiceDialogOpen" max-width="600" max-height="300">
      <v-card width="600" height="400">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>Search By Service</v-toolbar-title>
        </v-toolbar>
        <v-col cols="9" class="ma-auto">
          <v-select
            v-model="serviceSelections"
            :items="serviceCategory"
            small-chips
            label="Service ( non-restaurant items) "
            clearable
            deletable-chips
            multiple
            @change="handleServiceSubCategory"
            class="my-4"
          ></v-select>
          <v-select
            :disabled="serviceSelections.length == 0"
            v-model="serviceDetailedSelections"
            :items="serviceSubCategory"
            small-chips
            label="Detailed Items"
            multiple
            clearable
            deletable-chips
            class="my-6"
          ></v-select>
        </v-col>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            :disabled="serviceDetailedSelections.length == 0"
            @click="search('service')"
            >Search</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Restaurant Search Dialog -->
    <v-dialog v-model="isRestDialogOpen" max-width="600" max-height="300">
      <v-card width="600" height="300">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>Search Restaurant</v-toolbar-title>
        </v-toolbar>
        <v-col cols="9" class="ma-auto">
          <v-select
            v-model="restSelections"
            :items="restaurantCategory"
            small-chips
            label="Restaurant "
            clearable
            deletable-chips
            multiple
            class="my-4"
          ></v-select>
        </v-col>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            :disabled="restSelections.length == 0"
            @click="search('rest')"
            >Search</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- News Dialog -->
    <v-dialog v-model="isNewsDialogOpen" max-width="700" max-height="600">
      <v-card width="700" height="600">
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>News</v-toolbar-title>
        </v-toolbar>
        <!-- <v-card-text> -->
        <v-virtual-scroll :items="news" :item-height="60" :height="500">
          <template v-slot:default="{ item, index }">
            <v-list-item :key="index" two-line class="mt-4">
              <v-list-item-icon>
                <v-icon color="primary" size="30">
                  mdi-newspaper-variant-outline
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content class="mt-2 accent--text">
                <v-list-item-title v-text="item.newsTitle"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.headLine"
                  class="d-inLine-block text-truncate"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text
                  >{{ item.date | convert-customer-rating-time }}&nbsp;
                  <v-btn
                    text
                    v-if="isVendorNews(item.newsTitle)"
                    @click="gotoVendor(item.newsTitle)"
                    ><v-icon color="primary"
                      >mdi-feature-search-outline</v-icon
                    ></v-btn
                  >
                  <v-btn text v-else @click="openGuildNewsDetails(item)"
                    ><v-icon color="primary"
                      >mdi-feature-search-outline</v-icon
                    ></v-btn
                  >
                </v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
            <v-divider v-if="index < news.length - 1" inset></v-divider>
          </template>
        </v-virtual-scroll>
        <!-- </v-card-text> -->
      </v-card>
    </v-dialog>

    <!-- Guild News Detail Dialog -->
    <v-dialog
      v-model="isGuildNewsOpen"
      max-width="500"
      max-height="400"
      v-if="guildNewsDetails"
    >
      <v-card>
        <v-toolbar dark dense color="primary" flat>
          <v-toolbar-title>{{ guildNewsDetails.newsTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card-subtitle class="mt-2"
          >Posted at:&nbsp;{{
            guildNewsDetails.date | convert-customer-rating-time
          }}</v-card-subtitle
        >
        <v-divider class="mb-1"></v-divider>
        <v-card-text>{{ guildNewsDetails.headLine }}</v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
// import ChatWindow from 'vue-advanced-chat'
// import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/dist/VueDraggableResizable.css";

import {
  eventBus_vendorParlour,
  eventBus_profile,
  eventBus_searchVendor,
  eventBus_sortPromotionEvents,
  eventBus_closeSignUp,
} from "./eventBus";
import {
  FLYER_ADDED,
  RESIDENT_ORDER_ADDED,
  GUILD_CHAT_MSG_ADDED,
  RESIDENT_SILVER_UPDATED,
  CITYHALL_UPDATED,
  NEWS_ADDED,
  MESSAGE_RECEIVED,
  ORDER_STATUS_CHANGED,
} from "./queries/queries_subscription";
import { SAVE_GUILD_CHAT, SEND_WISH } from "./queries/queries_mutation";
import { GET_VENDOR_SEARCH_RESULT } from "./queries/queries_query";
import _ from "lodash";

import Signin from "./components/Signin.vue";
import Signup from "./components/Signup.vue";

export default {
  name: "App",
  components: {
    Signin,
    Signup,
    // ChatWindow,
    VueDraggableResizable,
    // Chat
  },
  data() {
    return {
      // rooms: [],
      // messages: [],
      // currentUserId: 1234,
      btn: "",
      changeNews: false,
      colors: {
        header: {
          bg: "#5C6BC0",
          text: "#ffffff",
        },
        launcher: {
          bg: "#5C6BC0",
        },
        messageList: {
          bg: "#ffffff",
        },
        sentMessage: {
          bg: "#E8EAF6",
          text: "#ffffff",
        },
        receivedMessage: {
          bg: "#eaeaea",
          text: "#222222",
        },
        userInput: {
          bg: "#f4f7f9",
          text: "#565867",
        },
      },
      participants: [],
      guildNewsDetails: null,
      isChatOpen: false,
      isGuildNewsOpen: false,
      alwaysScrollToBottom: true,
      messageList: [],
      showTypingIndicator: "",
      guild: null,
      appBarItems: ["event", "Restaurant", "Home Service", "Auto", "More"],
      now: Date.now(),
      newsLine: null,
      newsWidth: 0,
      vendorActive: true,
      vendorParlour: false,
      promotionEventSortCons: [],
      profile: false,
      productSubCategory: [],
      productSelections: [],
      productEventSelections: [],
      productDetailedSelections: [],
      signIn: false,
      signUp: false,
      drawer: false,
      navbarHeight: 0,
      isFormValid: false,
      isSortEventOpen: false,
      isProductDialogOpen: false,
      isServiceDialogOpen: false,
      isRestDialogOpen: false,
      isWishDialogOpen: false,
      isNewsDialogOpen: false,
      residentName: "",
      restSelections: [],
      restEventSelections: [],
      serviceSelections: [],
      serviceEventSelections: [],
      serviceDetailedSelections: [],
      serviceSubCategory: [],
      wishSnackbar: false,
      password: "",
      authSnackbar: false,
      authErrorSnackbar: false,
      passwordRules: [
        (password) => !!password || "Password is required",
        (password) =>
          password.length >= 4 || "Password must be at least 4 characters",
        (confirmation) =>
          confirmation === this.password || "Password must match",
      ],
      items: [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In" },
        { icon: "create", title: "Sign Up", link: "/signup" },
      ],
      accountDropdown: [
        {
          icon: "description",
          title: "Profile",
          foo: "handleProfile",
          display: "false",
        },

        {
          icon: "mdi-hand-heart",
          title: "My Wish",
          foo: "handleMyWish",
          display: "displayValid",
        },
        {
          icon: "exit_to_app",
          title: "Sign Out",
          foo: "handleSignoutResident",
          display: "displayValid",
        },
      ],
      tab: null,
      wishKeywords: [],
      wishText: null,
    };
  },

  created() {
    eventBus_profile.$on("profile", (eventData) => {
      // console.log(eventData);
      this.profile = eventData;
    });

    eventBus_vendorParlour.$on("vendorParlour", (eventData) => {
      // console.log(eventData);
      this.vendorParlour = eventData;
    });
    this.$store.commit("setViewPortDimension", {
      width: window.innerWidth,
      height: window.innerWidth,
    });

    eventBus_closeSignUp.$on("closeSU", (eventData) => {
      this.signUp = false;
    });
  },

  apollo: {
    $subscribe: {
      cityhallUpdated: {
        query: CITYHALL_UPDATED,
        result({ data }) {
          const { treasure, might, population, metro, governor } =
            data.cityhallUpdated;
          console.log(treasure);
          if (this.cityHall.metro == metro) {
            this.cityHall.treasure += treasure;
            this.$store.commit("setCityHall", this.cityHall);
          }
        },
      },
      flyerAdded: {
        query: FLYER_ADDED,
        result({ data }) {
          // console.log(data.flyerAdded);
          const {
            businessTitle,
            businessCategory,
            flyerId,
            flyerTitle,
            flyerType,
            dateFrom,
            dateTo,
            promoInfo,
            crossBoundary,
            targetDistribute,
          } = data.flyerAdded;
          if (this.activeFlyerList) {
            const listOkIndex = _.findIndex(this.activeFlyerList, (item) => {
              return item.businessTitle == businessTitle;
            });
            if (listOkIndex > -1) {
              this.activeFlyerList[listOkIndex].vendorActiveFlyer.push({
                flyerId,
                flyerTitle,
                flyerType,
                dateFrom,
                dateTo,
                promoInfo,
                crossBoundary,
                targetDistribute,
              });
              this.$store.commit("setActiveFlyerList", this.activeFlyerList);
            } else {
              this.$store.dispatch("getActiveFlyer");
            }
          }
        },
      },
      messageReceived: {
        query: MESSAGE_RECEIVED,
        result({ data }) {
          console.log(data.messageReceived);
          const { messageReceived } = data;
          if (this.resident) {
            if (
              messageReceived.receiverType == "resident" &&
              messageReceived.receiver == this.resident.residentName &&
              !messageReceived.guild
            ) {
              let newResident = this.resident;
              newResident.messages.push(messageReceived);
              this.$store.commit("setResident", newResident);
            }
            if (
              messageReceived.receiverType == "resident" &&
              messageReceived.receiver == this.resident.residentName &&
              messageReceived.guild
            ) {
              let newResident = this.resident;
              newResident.guildMessages.push(messageReceived);
              this.$store.commit("setResident", newResident);
            }
          }
        },
      },
      newsAdded: {
        query: NEWS_ADDED,
        result({ data }) {
          const { newsAdded } = data;
          console.log(newsAdded);
          const news = [...this.news];
          news.push(newsAdded);
          this.$store.commit("setNews", news);
        },
      },
      orderStatusChanged: {
        query: ORDER_STATUS_CHANGED,
        result({ data }) {
          // console.log(data)
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
          if (this.resident && this.resident.residentName == resident) {
            const index = this.residentOrders.findIndex(
              (item) => item.orderNo == orderNo
            );
            if (index >= 0) {
              const orders = [...this.residentOrders];
              orders[index].isCanceled = isCanceled;
              orders[index].isUnderDispute = isUnderDispute;
              orders[index].isConfirmed = isConfirmed;
              orders[index].disputeInfo = content;
              // console.log(orders)
              this.$store.commit("setResidentOrders", orders);
            }
          }
        },
      },
      residentOrderAdded: {
        query: RESIDENT_ORDER_ADDED,
        result({ data }) {
          const { residentOrderAdded } = data;
          // console.log(residentOrderAdded);
          if (
            this.resident &&
            this.resident.residentName == residentOrderAdded.resident
          ) {
            const orders = [...this.residentOrders];
            orders.push(residentOrderAdded);
            this.$store.commit("setResidentOrders", orders);
          }
        },
      },
      residentSilverAdded: {
        query: RESIDENT_SILVER_UPDATED,
        result({ data }) {
          const { residentSilverUpdated } = data;
          if (residentSilverUpdated.resident == this.resident.residentName) {
            this.resident.silverCoins = residentSilverUpdated.silver;
            this.$store.commit("setResident", this.resident);
          }
        },
      },
      guildChatMsgAdded: {
        query: GUILD_CHAT_MSG_ADDED,
        result({ data }) {
          const {
            guildChatMsgAdded: { guildFullName, message },
          } = data;
          // console.log(message)
          if (this.resident && guildFullName == this.guild.guildFullName) {
            if (message.type == "text") {
              message.data = {
                text: message.data,
                meta: moment(new Date(message.date)).format("MM-DD HH:mm"),
              };
            }
            if (message.type == "emoji") {
              message.data = {
                emoji: message.data,
                meta: moment(new Date(message.date)).format("MM-DD HH:mm"),
              };
            }
            if (message.author !== this.resident.residentName) {
              this.messageList = [...this.messageList, message];
            }
          }
        },
      },
    },
  },

  mounted() {
    const navHeight = document.getElementById("navbar").offsetHeight;

    // console.log(this.news)

    // if(this.news.length > 0) {
    let i = 0;
    setInterval(() => {
      this.newsLine = this.news[i];
      this.changeNews = !this.changeNews;
      // console.log(this.newsLine)
      if (i == this.news.length - 1) {
        i = 0;
        this.changeNews = !this.changeNews;
      } else {
        i++;
        this.changeNews = !this.changeNews;
      }
    }, 4000);
    // }

    this.$store.commit("setNavbarHeight", navHeight);
    this.$store.commit("setViewPortDimension", {
      width: window.innerWidth,
      height: window.innerWidth,
    });
    this.$store.commit(
      "setFooterHeight",
      document.getElementById("footer").offsetHeight
    );
    this.navbarHeight = navHeight;

    // console.log(this.vendor);
    // console.log(this.vendorParlour);
  },

  watch: {
    authError(value) {
      if (value !== null) {
        this.authErrorSnackbar = true;
      }
    },

    guildChatMessages(val) {
      // console.log(val)
      if (val.length > 0) {
        this.messageList = val.map((item) => {
          if (item.message.type == "text") {
            item.message.data = {
              text: item.message.data,
              meta: moment(new Date(item.message.date)).format("MM-DD HH:mm"),
            };
          }
          if (item.message.type == "emoji") {
            item.message.data = {
              emoji: item.message.data,
              meta: moment(new Date(item.message.date)).format("MM-DD HH:mm"),
            };
          }
          this.isChatOpen = true;
          if (item.residentName == this.resident.residentName) {
            item.message.author = "me";
            return item.message;
          } else {
            return item.message;
          }
        });
        // console.log(this.messageList)
      }
    },

    now(newVal) {
      const nowTime = moment(newVal).format("H:mm:ss");
      if (nowTime === "0:00:00") {
        this.$store.dispatch("getActiveFlyer");
      }
    },

    resident(newValue, oldValue) {
      // console.log(newValue)
      if (newValue !== null) {
        this.vendorActive = false;
        if (oldValue == null) {
          this.authSnackbar = true;
          this.$store.dispatch("getShoppingCart", {
            resident: newValue.residentName,
          });
          this.$store.dispatch("getResidentOrders", {
            resident: newValue.residentName,
          });
        }
        // &&this.guild==null&&this.guildChatMessages.length==0
        if (newValue.guild) {
          // console.log('guild in resident',newValue.guild)
          this.guild = newValue.guild;
          const members = newValue.guild.guildMembers.map((member) => {
            return {
              id: member.name,
              name: member.nickName,
              imageUrl: member.avatar,
            };
          });
          //  if( this.resident && this.resident.guild!=null) {
          this.$store.dispatch("getGuildDealsStatus", {
            guildFullName: newValue.guild.guildFullName,
          });
          // }
          this.participants = [...members];
          this.titleImageUrl = newValue.guild.guildLogo;
          this.$store.dispatch("getGuildChatMessages", {
            guildFullName: newValue.guild.guildFullName,
          });
          // NOTE: an `else if (newValue.guild && oldValue.guild && names differ)`
          // branch used to sit here. Its first condition duplicated the `if`
          // above, so it could never execute — and its body dispatched
          // getGuildChatMessages with the same guildFullName the reachable
          // branch already dispatches. Removed as redundant, not behaviour-changing.
        }
      } else {
        this.vendorActive = true;
      }
    },

    shoppingCarrtQty() {
      if (this.shoppingCart) {
        return this.shoppingCart.length;
      }
    },

    vendor(value) {
      console.log(value);
      if (!value) {
        this.vendorParlour = false;
      }
    },
  },

  computed: {
    ...mapGetters([
      "demandSearch",
      "vendor",
      "loading",
      "error",
      "cityHall",
      "authError",
      "resident",
      "activeFlyerList",
      "viewPortDimension",
      "shoppingCart",
      "residentOrders",
      "guildChatMessages",
      "promotionEvents",
      "productsCategories",
      "servicesCategories",
      "restaurantCategories",
      "isSearchBtnDisabled",
      "news",
    ]),

    displayValid() {
      if (this.profile) {
        return true;
      } else {
        return false;
      }
    },

    displayColor() {
      if (this.profile) {
        return "#c6c6c6";
      } else {
        return "primary";
      }
    },

    productCategory() {
      return this.productsCategories
        .map((item) => {
          return item.category;
        })
        .sort();
    },

    restaurantCategory() {
      return this.restaurantCategories.map((item) => item).sort();
    },

    serviceCategory() {
      return this.servicesCategories
        .map((item) => {
          return item.category;
        })
        .sort();
    },

    wishKeywordOptions() {
      let options = [];
      this.productsCategories.map((item) => options.push(item.category));
      this.servicesCategories.map((item) => options.push(item.category));
      return options.sort();
    },
  },

  methods: {
    // exitVendorParlour() {
    //   this.vendorParlour = false;
    //   this.$router.push("/");
    // },

    onMessageWasSent(message) {
      // called when the user sends a message
      // console.log(message)
      this.messageList = [...this.messageList, message];
      // message.author = this.resident.residentName
      // const data = message.type == 'text' ? { text: message.data.text} : { emoji: message.data.emoji }
      const index = this.resident.guild.guildMembers.findIndex(
        (member) => member.name === this.resident.residentName
      );
      const nickName = this.resident.guild.guildMembers[index].nickName;
      const guildMsgInput = {
        author: this.resident.residentName,
        data: message.type == "text" ? message.data.text : message.data.emoji,
        type: message.type,
        date: new Date().toString(),
        nickName,
      };
      const variables = {
        residentId: this.resident._id,
        guildFullName: this.guild.guildFullName,
        input: guildMsgInput,
      };
      // console.log(variables)
      this.$apollo
        .mutate({
          mutation: SAVE_GUILD_CHAT,
          variables,
        })
        .then(({ data }) => {
          const { saveGuildChat } = data;
          // console.log(saveGuildChat)
        })
        .catch((err) => console.error(err));
    },

    openChat() {
      // called when the user clicks on the fab button to open the chat
      this.isChatOpen = true;
      // this.newMessagesCount = 0
    },

    cancelWish() {
      this.isWishDialogOpen = false;
      this.wishKeywords = [];
      this.wishText = null;
    },

    closeChat() {
      this.isChatOpen = false;
    },

    formatDescription(desc) {
      return desc.length > 30 ? `${desc.slice(0, 30)}...` : desc;
    },

    gotoVendor(title) {
      const pos1 = title.indexOf("(");
      const pos2 = title.indexOf(")");
      const vendor = title.slice(pos1 + 1, pos2);
      this.$router.push({ name: "vendorInterface", params: { vendor } });
      this.isNewsDialogOpen = false;
    },

    handleMyWish() {
      this.isWishDialogOpen = true;
    },

    handleSigninResident() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("signinResident", {
          residentName: this.residentName,
          password: this.password,
        });
      }
    },

    handleProductSubCategory() {
      this.productSubCategory = [];
      if (this.productSelections.length > 0) {
        this.productSelections.map((selection) => {
          this.productsCategories.map((category) => {
            if (selection === category.category) {
              category.items.map((item) => {
                this.productSubCategory.push(item);
              });
            }
          });
        });
      }
      this.productSubCategory.sort();
    },

    handleServiceSubCategory() {
      this.serviceSubCategory = [];
      // console.log(this.serviceSelections)
      if (this.serviceSelections.length > 0) {
        this.serviceSelections.map((selection) => {
          // console.log(selection)
          this.servicesCategories.map((category) => {
            // console.log(category)
            if (selection === category.category) {
              category.items.map((item) => {
                // console.log(item)
                this.serviceSubCategory.push(item);
              });
            }
          });
        });
      }
      // console.log(this.serviceSubCategory)
      this.serviceSubCategory.sort();
    },
    handleSignoutResident() {
      // console.log("Signed out");
      // console.log(this.profile);
      this.profile = false;
      this.$router.push("/");
      this.$store.dispatch("signoutResident");
    },
    handleSignoutVendor() {
      // this.$router.push("/");
      eventBus_vendorParlour.$emit("vendorParlour", false);
      this.$store.dispatch("signoutVendor");
    },
    handleProfile() {
      this.$router.push("/profile");
    },
    handleSignUp() {
      this.signIn = !this.signIn;
      this.signUp = true;
    },
    handleSignIn() {
      this.signUp = !this.signUp;
      this.signIn = true;
    },
    handleTyping(text) {
      // console.log(text)
      this.showTypingIndicator =
        text.length > 0 ? this.resident.residentName : "";
    },
    handlers(index) {
      // console.log(index);
      switch (index) {
        case 0:
          this.handleProfile();
          //

          break;
        case 1:
          this.handleMyWish();
          break;
        case 2:
          this.handleSignoutResident();

          break;
      }
    },

    isVendorNews(title) {
      return title.includes("(") ? true : false;
    },

    openGuildNewsDetails(news) {
      this.isGuildNewsOpen = true;
      this.guildNewsDetails = news;
    },

    openSearchProductDia() {
      this.isProductDialogOpen = true;
      this.productSelections = [];
      this.productDetailedSelections = [];
    },
    openSearchServiceDia() {
      this.isServiceDialogOpen = true;
      this.serviceSelections = [];
      this.serviceDetailedSelections = [];
    },
    openSearchRestDia() {
      this.isRestDialogOpen = true;
      this.restSelections = [];
    },

    openEventSortDia() {
      this.isSortEventOpen = true;
      this.promotionEventSortCons = [];
      this.productEventSelections =
        this.serviceEventSelections =
        this.restEventSelections =
          [];
    },

    search(type) {
      let searchItems;
      switch (type) {
        case "product":
          searchItems = this.productDetailedSelections;
          break;
        case "service":
          searchItems = this.serviceDetailedSelections;
          break;
        case "rest":
          searchItems = this.restSelections;
          break;
      }
      this.$apollo
        .query({
          query: GET_VENDOR_SEARCH_RESULT,
          variables: { searchItems },
        })
        .then(({ data }) => {
          const { getVendorSearchResult } = data;
          // console.log(getVendorSearchResult)
          if (getVendorSearchResult.length > 0) {
            eventBus_searchVendor.$emit("searchVendor", {
              result: getVendorSearchResult,
              isPromotionEventShowed: false,
            });
          }
        })
        .catch((err) => console.error(err));
      this.isProductDialogOpen = false;
      this.isServiceDialogOpen = false;
      this.isRestDialogOpen = false;
    },

    sendWish() {
      this.$apollo
        .mutate({
          mutation: SEND_WISH,
          variables: {
            sender: this.resident.residentName,
            wishKeywords: this.wishKeywords,
            text: this.wishText,
            fullName: this.resident.firstName + " " + this.resident.lastName,
          },
        })
        .then(({ data }) => {
          // console.log(data)
        })
        .catch((err) => console.error(err));
      this.isWishDialogOpen = false;
      this.wishKeywords = [];
      this.wishText = null;
      this.wishSnackbar = true;
    },

    sortEvent() {
      if (this.restEventSelections)
        this.promotionEventSortCons = [
          ...this.promotionEventSortCons,
          ...this.restEventSelections,
        ];
      if (this.productEventSelections)
        this.promotionEventSortCons = [
          ...this.promotionEventSortCons,
          ...this.productEventSelections,
        ];
      if (this.serviceEventSelections)
        this.promotionEventSortCons = [
          ...this.promotionEventSortCons,
          ...this.serviceEventSelections,
        ];
      // console.log(this.promotionEventSortCons)
      this.isSortEventOpen = false;
      // eventBus_searchVendor.$emit('searchVendor',{result: this.promotionEvents, isPromotionEventShowed: true})
      eventBus_sortPromotionEvents.$emit("sortEvent", {
        cons: this.promotionEventSortCons,
      });
    },

    toShoppingCart() {
      if (this.shoppingCart) {
        this.$router.push("/shoppingCart");
        //  this.$router.push('shoppingCart')
      }
    },
  },

  beforeRouteLeave(to, from, next) {
    this.signUp = false;
    next();
  },
};
</script>

<style lang="scss">
.draggable-window {
  position: fixed;
  bottom: 80px;
  left: 200px;
  padding: 2px;
  border-style: none;
  z-index: 100;
}
.chat-window {
  height: 100%;
  width: 100%;
}
div.v-avatar:hover {
  cursor: pointer;
}
.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
  color: grey;
}
v-main {
  background-color: white;
}

.sc-message--text-content {
  color: #000001 !important;
  font-weight: 350;
  word-break: break-all;
}

.fade-down-enter,
.fade-down-enter-active {
  transition: all 0.5s ease;
}
.fade-down-leave-active {
  transition: all 4s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
