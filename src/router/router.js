import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SigninVendor from '../components/vendor/SigninVendor.vue'
import Profile from '../components/Profile.vue'
import OpenHouse from '../components/OpenHouse.vue'
import UnderConstruction from '../components/UnderConstruction.vue'
import Checkout from '../components/Checkout.vue'
import ResidentOrders from '../components/ResidentOrders.vue'
import SignupVendor from '../components/vendor/SignupVendor.vue'
import VendorInterface from '../components/VendorInterface.vue'
import SingleCatalogItem from '../components/SingleCatalogItem.vue'
import ShoppingCart from '../components/ShoppingCart.vue'
import VendorFlyers from '../components/vendor/VendorFlyers.vue'
import VendorProductService from '../components/vendor/VendorProductService.vue'
import VendorGallery from '../components/vendor/VendorGallery.vue'
import VendorPromotions from '../components/vendor/VendorPromotions.vue'
import VendorSalesStatistic from '../components/vendor/VendorSalesStatistic.vue'
import VendorSettlementRecords from '../components/vendor/VendorSettlementRecords.vue'
import VendorMembership from '../components/vendor/VendorMembership.vue'
import GuildDealsFulfillment from '../components/vendor/GuildDealsFulfillment.vue'
import VendorProfile from '../components/vendor/VendorProfile.vue'
import GuildDeal from '../components/vendor/GuildDeal.vue'
import ManageGuildDeals from '../components/vendor/ManageGuildDeals.vue'
import AuthGuard from "../AuthGuard";

// vue-router 4 rejects navigation-duplicated/aborted pushes with an Error.
// vue-router 3 did too, which is why the prototype was patched here to swallow
// them; the prototype is gone in v4, so the same guard is applied per call in
// the router instance below.

const routes = [

 

  {
    path: '/',
    name: 'home',
    component:  Home,

    // 'vendor-home': VendorHome

    children: [
      {
        path: 'vendorflyers',
        name: 'vendorflyers',
        component: VendorFlyers,
        beforeEnter: AuthGuard,
        children: [{
          path: ':stepper',
          name: 'vendorflyersStepper',
          component: VendorFlyers,

        }, ]
      },
      {
        path: 'vendorProductService',
        name: 'vendorProductService',
        component: VendorProductService,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorGallery',
        name: 'vendorGallery',
        component: VendorGallery,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorPromotions',
        name: 'vendorPromotions',
        component: VendorPromotions,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorSalesStatistic',
        name: 'vendorSalesStatistic',
        component: VendorSalesStatistic,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorSettlementRecords',
        name: 'vendorSettlementRecords',
        component: VendorSettlementRecords,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorMembership',
        name: 'vendorMembership',
        component: VendorMembership,
        beforeEnter: AuthGuard
      },
      {
        path: 'guildDealsFulfillment',
        name: 'guildDealsFulfillment',
        component: GuildDealsFulfillment,
        beforeEnter: AuthGuard
      },
      {
        path: 'vendorProfile',
        name: 'vendorProfile',
        component: VendorProfile,
        beforeEnter: AuthGuard
      },
      {
        path: 'guildDeal',
        name: 'guildDeal',
        component: GuildDeal,
        beforeEnter: AuthGuard
      },
      {
        path: 'manageGuildDeals',
        name: 'manageGuildDeals',
        component: ManageGuildDeals,
        beforeEnter: AuthGuard
      },
      // {
      //   path: "vendorInterface",
      //   name: "vendorInterface",
      //   component: VendorInterface,
      //   props: true
      // },


    ]
  },

  {
    path: '/checkout',
    name: 'checkout',
    component: Checkout,
    props: route => ({ ...route.query, ...route.params }),
    
  },

  // {
  //   path: '/signin',
  //   name: 'signin',
  //   component: Signin,
  // },
  // {
  //   path: '/signup',
  //   name: 'signup',
  //   component: Signup,
  // },

  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    beforeEnter: AuthGuard
  },

  {
    path: '/shoppingCart',
    name: 'shoppingCart',
    component: ShoppingCart,
  },

  {
    path: '/openhouse',
    name: 'openhouse',
    component: OpenHouse,
    beforeEnter: AuthGuard
  },

  {
    path: '/residentOrders',
    name: 'residentOrders',
    component: ResidentOrders
  },

  {
    path: '/signupvendor',
    name: 'signupvendor',
    component: SignupVendor
  },
  {
    path: '/underConstruction',
    name: 'underConstruction',
    component: UnderConstruction
  },
  {
    path: '/signinvendor',
    name: 'signinvendor',
    component: SigninVendor
  },
  {
    path: "/vendorInterface/:vendor",
    name: "vendorInterface",
    component: VendorInterface,
    props: true,
    children: [{
      path: 'singleCatalogItem/:itemCode',
      name: 'singleCatalogItem',
      component: SingleCatalogItem,
      props: route => ({ ...route.query, ...route.params })
    }, ]
  },

]

// vue-router 4: `mode: 'history'` plus `base` become a history implementation,
// and the constructor is a factory. import.meta.env.BASE_URL is Vite's
// equivalent of the process.env.BASE_URL vue-cli used to inject.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Restores what the `VueRouter.prototype.push` patch at the top of this file
// used to do. Pushing the route you are already on rejects with a
// NavigationDuplicated error in both v3 and v4; this app pushes the same route
// in several places and never handled the rejection, so without this v4 would
// surface it as an unhandled promise rejection.
const originalPush = router.push.bind(router)
router.push = (location) => originalPush(location).catch((err) => err)

export default router