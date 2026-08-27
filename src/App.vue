<template>
  <v-app class="mt-2">
    <!-- d-flex flex-column justify-space-between align-center -->
    <!-- Side Navbar -->
    <v-navigation-drawer app temporary fixed v-model="drawer">
      <v-toolbar color="white" theme="dark" flat>
        <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
        <router-link to="/" class="d-inline-block" style="cursor: pointer">
          <!-- <h1 class="title pl-3">Cybertown</h1> -->
          <v-img
            src="./assets/images/Screen_Shot_2022-10-14_at_11.56.26_AM-removebg-preview.png"
            width="30"
            max-height="30"
            class="d-block ml-2 mb-2"
          ></v-img>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Side Navbar Links -->
      <v-list nav density="compact">
          <v-list-item v-for="(item, i) in items" :key="i">
            <template #prepend>
              <v-icon color="primary">{{ item.icon }}</v-icon>
            </template>
              <v-list-item-title class="primary-text">{{
                item.title
              }}</v-list-item-title>
          </v-list-item>
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
          <router-link to="/" class="d-inline-block" style="cursor: pointer">
            <v-img
              src="./assets/images/Screen_Shot_2022-10-14_at_11.56.26_AM-removebg-preview.png"
              width="200"
              max-height="150"
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
          prepend-inner-icon="mdi-map-marker"
          placeholder="any wish, any demand, anythings..."
          color="primary"
          single-line
          hide-details
        ></v-autocomplete> -->

        <!-- vendor navbar items -->
        <!-- Three problems here, all Vuetify-2-era:
             - `src="../public/static/…"`: files in public/ are served from the
               root, so Vite could not resolve this and the image 404'd.
             - the label lived *inside* a fixed 80x100 <v-avatar>, which is
               overflow:hidden — so "Vendor Parlour" was clipped to "Ven Parl".
             - that avatar is taller than Vuetify 3's 64px toolbar row.
             Now a plain flex row sized to fit the bar. -->
        <v-row
          v-if="vendorParlour || vendor"
          class="d-flex justify-end align-center flex-grow-0 mr-4"
          no-gutters
        >
          <v-img
            src="/static/vendor1.png"
            max-height="40"
            max-width="40"
            class="mr-2"
          ></v-img>
          <h5 class="text-primary text-no-wrap">Vendor Parlour</h5>
        </v-row>

        <!-- Resident Nav Bar -->
        <v-container
          class="d-flex flex-row justify-space around align-center mt-5"
          v-if="!vendor && !vendorParlour"
        >
          <v-btn-toggle v-model="btn" tile color="" group>
            <!-- metro -->
            <v-btn variant="text" 
              class="mr-3 ml-n3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon start theme="dark" class="ml-1"> mdi-map-marker-radius </v-icon>
              {{ cityHall.metro }}
            </v-btn>

            <!-- treasure -->
            <v-btn variant="text" 
              class="mx-3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon start theme="dark" class="ml-3"> mdi-treasure-chest </v-icon>
              {{ $filters.formatIntAmount(cityHall.treasure) }}
            </v-btn>

            <!-- Population -->
            <v-btn variant="text" 
              class="mx-3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon start theme="dark" class="ml-3"> mdi-account-group </v-icon>
              {{ $filters.formatIntAmount(cityHall.population) }}
            </v-btn>

            <!-- Strength -->
            <v-btn variant="text" 
              class="mx-3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon start theme="dark" class="ml-3"> mdi-arm-flex </v-icon>
              {{ $filters.formatIntAmount(cityHall.might) }}
            </v-btn>
            <v-spacer></v-spacer>

            <!-- Polyfill -->
            <v-btn variant="text" 
              icon
              class="mx-2"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;
            </v-btn>
            <v-spacer></v-spacer>

            <!-- Governor -->
            <v-btn variant="text" 
              class="ml-3"
              color="primary"
              v-if="cityHall && !vendor && !vendorParlour"
            >
              <v-icon start theme="dark" class="ml-3"> mdi-crown </v-icon>
              {{ cityHall.governor }}
            </v-btn>
          </v-btn-toggle>
          <!-- </v-row> -->
        </v-container>

        <v-spacer></v-spacer>

        <!-- signin and signup -->
        <v-container
          density="compact"
          v-if="!resident && !vendorParlour && !vendor"
          class="mt-4 ml-10 pl-10 d-flex justify-center align-center"
        >
          <v-btn variant="text" 
            color="primary"
            :disabled="signUp"
            @click="signIn = true" 
          >
            Login
          </v-btn>

          <v-btn variant="text"
            color="secondary" 
            @click="signUp = true" 
          >
            Sign up
          </v-btn>
        </v-container>

        <!-- <v-spacer></v-spacer> -->

        <!-- resident navbar -->
        <v-container
          v-if="resident && !vendorParlour && !vendor"
          density="compact"
          class="d-flex justify-end align-center pa-0"
        >
          <!-- shopping cart icon -->
          <v-spacer></v-spacer>
          <v-badge
            color="accent"
            :content="shoppingCart ? shoppingCart.length : null"
            bordered
            :model-value="shoppingCart.length > 0"
          >
            <!-- `mt-3` was tuned to Vuetify 2's taller bar. With v3 geometry
                 it pushed the button past the 64px app bar, which put the
                 badge bubble above the bar's top edge and clipped it. -->
            <v-btn icon size="large" @click="toShoppingCart">
              <v-icon color="primary">mdi-cart-outline</v-icon>
            </v-btn>
          </v-badge>

          <v-tooltip right>
            <template v-slot:activator="{ props }">
              <!-- `:height="navbarHeight"` made this hover target fill the
                   Vuetify 2 bar. navbarHeight is the whole app bar (112px:
                   64px row + 48px extension), and Vuetify 3 puts this inside
                   the 64px .v-toolbar__content, which is overflow:hidden — so
                   the stack ran 40px past the top of the bar and the cart
                   badge and avatar were clipped. Sizes to content now. -->
              <v-card
                flat
                class="pa-1 d-flex align-center"
                max-width="200"
                v-bind="props"
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
                  <template v-slot:activator="{ props }">
                    <v-container class="pa-0">
                      <div v-bind="props" class="d-flex align-center">
                        <v-avatar size="48" color="white">
                          <v-img :src="resident.avatarPic" cover></v-img>
                        </v-avatar>
                        <v-icon size="small" color="primary">
                          mdi-menu-down
                        </v-icon>
                      </div>
                    </v-container>
                  </template>

                  <v-list density="compact">
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
                      <!-- Vuetify 3 puts default-slot content inside
                           .v-list-item__content, which is a block — so the icon
                           stacked *above* the label instead of sitting beside
                           it, making every row double height. #prepend is the
                           v3 slot for a leading icon. -->
                      <template #prepend>
                        <v-icon
                          class="mr-2"
                          density="compact"
                          :color="
                            dropdownItem.title == 'Sign Out'
                              ? displayColor
                              : 'primary'
                          "
                          >{{ dropdownItem.icon }}</v-icon
                        >
                      </template>
                      <v-list-item-title
                        :class="
                          !displayValid ? 'text-primary' : 'text-fontColor'
                        "
                        >{{ dropdownItem.title }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
                <!-- </v-row> -->
              </v-card>
            </template>
            <span class="text-white">
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
          <v-toolbar flat density="compact">
            <v-spacer></v-spacer>
            <v-btn variant="text" 
              color="primary"
              @click="openEventSortDia"
              :disabled="isSearchBtnDisabled"
              >Event</v-btn
            >
            <v-btn variant="text" 
              color="primary"
              @click="openSearchProductDia"
              :disabled="isSearchBtnDisabled"
              >Search By Product</v-btn
            >
            <v-btn variant="text" 
              color="primary"
              @click="openSearchServiceDia"
              :disabled="isSearchBtnDisabled"
              >Search By Service</v-btn
            >
            <v-btn variant="text" 
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
          location="bottom"
        >
          <h3 class="text-center mr-2">
            You are now Signed in!<v-icon>mdi-check-circle</v-icon>
          </h3>
          <!-- <v-btn variant="text" theme="dark"   @click="authSnackbar = false"> Close </v-btn> -->
        </v-snackbar>

        <!-- News Snackbar -->

        <!-- `outlined`, `bottom` and `multi-line` are Vuetify 2 props. Without
             a variant the news ticker rendered as a solid accent block with
             white text; it was an outlined bar with accent text on white. -->
        <v-snackbar
          color="accent"
          :timeout="-1"
          location="bottom"
          :model-value="true"
          variant="outlined"
          multi-line
          :width="viewPortDimension.width"
          v-if="newsLine"
        >
          <span @click="isNewsDialogOpen = true" style="cursor: pointer">
            <!-- <v-slide-y-transition hide-on-leave v-if="changeNews"> -->
            <h4>{{ newsLine.newsTitle }}</h4>
            :&nbsp;&nbsp;{{ newsLine.headLine }}&nbsp;&nbsp;at&nbsp;{{ $filters.convertCustomerRatingTime(newsLine.date) }}
            <!-- </v-slide-y-transition> -->
          </span>
        </v-snackbar>

        <!-- Send Wish Snackbar-->
        <v-snackbar
          v-model="wishSnackbar"
          color="primary"
          :timeout="3000"
          location="center"
        >
          <v-icon>mdi-check-circle</v-icon>
          <h3>You send the wish out</h3>
          <v-btn variant="text" theme="dark"  @click="wishSnackbar = false"> Close </v-btn>
        </v-snackbar>

        <!-- Auth Error Snackbar -->
        <v-snackbar
          v-if="authError"
          v-model="authErrorSnackbar"
          color="warning"
          :timeout="6000"
          location="bottom"
        >
          <v-icon class="mr-3">mdi-cancel</v-icon>
          <h3>{{ authError.message }}</h3>
          <v-btn variant="text" theme="dark"  @click="signIn = true"> Sign in </v-btn>
        </v-snackbar>

        <!-- House Floating Button -->
        <v-tooltip top v-if="resident">
          <template v-slot:activator="{ props }">
            <!-- `bottom right fixed` were Vuetify 2 positional props; none of
                 them exist in Vuetify 3, so this fab was rendering inline at
                 the top-left of v-main instead of floating bottom-right. -->
            <v-btn
              icon
              color="primary"
              size="large"
              theme="dark"
              to="/openhouse"
              class="position-fixed"
              style="bottom: 24px; right: 24px; z-index: 5"
              v-bind="props"
            >
              <v-icon size="36">mdi-home</v-icon>
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
          <!-- 4b-3c: vue-beautiful-chat replaced by src/components/GuildChat.vue.
               The `open` / `close` / `onMessageWasSent` callback props are now
               ordinary events; the message and participant shapes, the colors
               object and the header slot are unchanged. The message-body and
               user-avatar slots were doing what the component should do itself,
               so they moved inside it. -->
          <guild-chat
            class="chat-window"
            :participants="participants"
            :is-open="isChatOpen"
            :message-list="messageList"
            :nick-name="myGuildNickName"
            :colors="colors"
            @open="openChat"
            @close="closeChat"
            @send="onMessageWasSent"
          >
            <template v-slot:header>
              <v-avatar
                ><v-img :src="`/guildLogos/${resident.guild.guildLogo}`"
              /></v-avatar>
              <v-btn variant="text"  theme="dark" class="mt-1">{{
                resident.guild.guildFullName
              }}</v-btn>
            </template>
          </guild-chat>
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
                class="text-subtitle-1 text-left d-block text-fontColor"
                >about boundary</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >our story</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >management</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >work with us</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="1"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-left d-block text-fontColor"
                >resident</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >virtual life</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >make money</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >benefits</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="1"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-left d-block text-fontColor"
                >game</span
              >
              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >meta world</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >real life in game</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >upgrade</router-link
              >
            </v-col>

            <v-col
              lg="3"
              xl="2"
              class="d-flex flex-column justify-start align-start"
            >
              <span
                class="text-subtitle-1 text-center d-block text-fontColor"
                >vendor parlour</span
              >

              <span class="d-block text-center my-1">
                <!-- Phase 4b-2 removed `.native` everywhere it was safe to do
                     on Vue 2; this one stays. vue-router 3's router-link does
                     not emit `click`, so dropping the modifier would break the
                     handler today. It comes off in 4b-4 with vue-router 4,
                     where listeners fall through to the rendered <a>. -->
                <router-link
                  to="/signupvendor"
                  style="cursor: pointer; text-decoration: none"
                  class="text-body-2 text-fontColor"
                  :class="{ disabled: !vendorActive || vendor || resident }"
                  @click="vendorParlour = true"
                  >become a vendor</router-link
                >
                <router-link
                  class="text-accent text-subtitle-2"
                  to="/signinvendor"
                  :class="{ disabled: !vendorActive || vendor || resident }"
                >
                  or Signin
                </router-link>
              </span>

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >business</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
                >how it works</router-link
              >

              <router-link
                to="/underConstruction"
                style="cursor: pointer; text-decoration: none"
                class="text-body-2 text-fontColor d-block my-1"
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
                density="compact"
              ></v-img>

              <!-- </v-avatar> -->
              <h5 class="font-weight-regular text-primary d-block ml-n2 mt-2">
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
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
            <v-textarea variant="outlined"
              placeholder="your wish"
              v-model="wishText"
              required 
            ></v-textarea>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat"
            color="primary" 
            :disabled="wishKeywords.length == 0 || wishText == null"
            @click="sendWish"
            >Send</v-btn
          >
          <v-btn variant="outlined"  color="primary" @click="cancelWish">Cancel</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Event Sort Dialog -->
    <v-dialog v-model="isSortEventOpen" max-width="600" max-height="300">
      <v-card width="600" height="400">
        <v-toolbar theme="dark" density="compact" color="primary" flat>
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
            density="compact"
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
          <v-btn variant="flat" color="primary"  @click="sortEvent"
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
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
          <v-btn variant="flat"
            color="primary" 
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
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
          <v-btn variant="flat"
            color="primary" 
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
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
          <v-btn variant="flat"
            color="primary" 
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
          <v-toolbar-title>News</v-toolbar-title>
        </v-toolbar>
        <!-- <v-card-text> -->
        <v-virtual-scroll :items="news" :item-height="60" :height="500">
          <template v-slot:default="{ item, index }">
            <v-list-item :key="index" two-line class="mt-4">
              <template #prepend>
                <v-icon color="primary" size="30">
                  mdi-newspaper-variant-outline
                </v-icon>
              </template>

                <v-list-item-title v-text="item.newsTitle"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.headLine"
                  class="d-inLine-block text-truncate"
                ></v-list-item-subtitle>

              <template #append>
                <span class="text-caption"
                  >{{ $filters.convertCustomerRatingTime(item.date) }}&nbsp;
                  <v-btn variant="text" 
                    v-if="isVendorNews(item.newsTitle)"
                    @click="gotoVendor(item.newsTitle)"
                    ><v-icon color="primary"
                      >mdi-feature-search-outline</v-icon
                    ></v-btn
                  >
                  <v-btn variant="text"  v-else @click="openGuildNewsDetails(item)"
                    ><v-icon color="primary"
                      >mdi-feature-search-outline</v-icon
                    ></v-btn
                  >
                </span>
              </template>
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
        <v-toolbar theme="dark" density="compact" color="primary" flat>
          <v-toolbar-title>{{ guildNewsDetails.newsTitle }}</v-toolbar-title>
        </v-toolbar>
        <v-card-subtitle class="mt-2"
          >Posted at:&nbsp;{{ $filters.convertCustomerRatingTime(guildNewsDetails.date) }}</v-card-subtitle
        >
        <v-divider class="mb-1"></v-divider>
        <v-card-text>{{ guildNewsDetails.headLine }}</v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import moment from "moment";
import { mapState } from "pinia";
import { useMainStore } from "./store/store";
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/style.css";

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
import GuildChat from "./components/GuildChat.vue";

export default {
  name: "App",
  components: {
    Signin,
    Signup,
    VueDraggableResizable,
    GuildChat,
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
        { icon: "mdi-chat", title: "Posts", link: "/posts" },
        { icon: "mdi-lock-open", title: "Sign In" },
        { icon: "mdi-pencil", title: "Sign Up", link: "/signup" },
      ],
      accountDropdown: [
        {
          icon: "mdi-file-document-outline",
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
          icon: "mdi-exit-to-app",
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
    this.$store.setViewPortDimension({
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
            this.$store.setCityHall(this.cityHall);
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
              this.$store.setActiveFlyerList(this.activeFlyerList);
            } else {
              this.$store.getActiveFlyer();
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
              // Apollo Client 3 freezes query results, and `this.resident` is
              // one. `let newResident = this.resident` is a reference, not a
              // copy, so pushing threw "Cannot add property N, object is not
              // extensible" and the message was dropped. Rebuilt as new
              // objects — the same fix Phase 4b-4 applied to the three cache
              // updates it could reach without signing in.
              this.$store.setResident({
                ...this.resident,
                messages: [...this.resident.messages, messageReceived],
              });
            }
            if (
              messageReceived.receiverType == "resident" &&
              messageReceived.receiver == this.resident.residentName &&
              messageReceived.guild
            ) {
              this.$store.setResident({
                ...this.resident,
                guildMessages: [
                  ...this.resident.guildMessages,
                  messageReceived,
                ],
              });
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
          this.$store.setNews(news);
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
              // Spreading gives a new array, but the *elements* are still the
              // frozen Apollo objects — so writing orders[index].x threw and
              // the status update never landed. Replace the element instead.
              const orders = [...this.residentOrders];
              orders[index] = {
                ...orders[index],
                isCanceled,
                isUnderDispute,
                isConfirmed,
                disputeInfo: content,
              };
              this.$store.setResidentOrders(orders);
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
            this.$store.setResidentOrders(orders);
          }
        },
      },
      residentSilverAdded: {
        query: RESIDENT_SILVER_UPDATED,
        result({ data }) {
          const { residentSilverUpdated } = data;
          // `this.resident` was dereferenced with no null check. Subscriptions
          // are broadcast to every socket, so any resident's silver update
          // threw for a signed-out visitor.
          if (
            this.resident &&
            residentSilverUpdated.resident == this.resident.residentName
          ) {
            // Frozen Apollo result — assigning silverCoins in place threw
            // "Cannot assign to read only property".
            this.$store.setResident({
              ...this.resident,
              silverCoins: residentSilverUpdated.silver,
            });
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

    this.$store.setNavbarHeight(navHeight);
    this.$store.setViewPortDimension({
      width: window.innerWidth,
      height: window.innerWidth,
    });
    this.$store.setFooterHeight(document.getElementById("footer").offsetHeight
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
        this.$store.getActiveFlyer();
      }
    },

    resident(newValue, oldValue) {
      // console.log(newValue)
      if (newValue !== null) {
        this.vendorActive = false;
        if (oldValue == null) {
          this.authSnackbar = true;
          this.$store.getShoppingCart({
            resident: newValue.residentName,
          });
          this.$store.getResidentOrders({
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
          this.$store.getGuildDealsStatus({
            guildFullName: newValue.guild.guildFullName,
          });
          // }
          this.participants = [...members];
          this.titleImageUrl = newValue.guild.guildLogo;
          this.$store.getGuildChatMessages({
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
    /**
     * The signed-in resident's nickname within their guild. GuildChat stamps it
     * on outgoing messages so they carry the same nickname as the ones that
     * come back from the server.
     */
    myGuildNickName() {
      const members = this.resident?.guild?.guildMembers;
      if (!members) return "";
      const me = members.find((m) => m.name === this.resident.residentName);
      return me ? me.nickName : "";
    },

    ...mapState(useMainStore, [
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
        this.$store.signinResident({
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
      this.$store.signoutResident();
    },
    handleSignoutVendor() {
      // this.$router.push("/");
      eventBus_vendorParlour.$emit("vendorParlour", false);
      this.$store.signoutVendor();
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
