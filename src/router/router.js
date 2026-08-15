import Vue from 'vue'
import VueRouter from 'vue-router'
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

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
}

Vue.use(VueRouter)

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

const router = new VueRouter({
  mode: 'history',
  // vue-cli injected process.env.BASE_URL; Vite has no `process` in the browser
  // and exposes the equivalent as import.meta.env.BASE_URL (default "/").
  base: import.meta.env.BASE_URL,
  routes
})

export default router