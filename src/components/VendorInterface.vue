<template>
    <v-container class="mt-4">
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

    <!--shopping cart  Loading Spinner -->
    <v-row>
      <v-dialog v-model="saveShoppingCartLoading" persistent fullscreen>
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

    <!-- Alert -->
    <v-alert
      dense
      outlined
      type="error"
      dismissible
      v-model="differentVendor"
    >Shopping Cart Item Must Be From Same Vendor</v-alert>

    <!-- actions floating window -->
    <v-card
        max-height="500" 
        :max-width="$vuetify.breakpoint.lgAndUp?255:50"
        class="actionPanel px-1"
        color="#FAFAFA"
        hover
        flat
        v-if="actionsPanelShow&&singleItem">
        
        <v-card-title class="fontColor--text text--darken-1 text-caption"><v-img :src="singleItem.photo" contain></v-img>{{singleItem.description}}</v-card-title>
        <v-card-text>
                <v-select v-model.number="orderQty" outlined label="Quantity" :items="maxQty" dense></v-select>
                 <v-btn
                    class="mr-3 ml-6"
                    color="primary"
                    depressed
                   fab
                   small
                   @click="loadShoppingCart"
                   :disabled="orderQty==0"
                    >
                    <v-icon >mdi-cart-outline</v-icon>
                    </v-btn>
                 <v-btn
                    class="ma-3"
                    fab
                    depressed
                   color="primary"
                    small
                   :disabled="orderQty==0"
                    >
                    <v-icon >mdi-currency-usd</v-icon>
                    </v-btn>
                 <v-btn
                    class="ma-3"
                    fab
                    depressed
                    color="primary"
                    small
                    :disabled="!resident"
                    >
                    <v-icon >mdi-heart-outline</v-icon>
                    </v-btn>
        </v-card-text>
    </v-card>

    <!-- Showcase -->
       <v-card v-if="vendorInterface" color="#FAFAFA" :max-width="viewPortDimension.width * 0.6" class="ma-auto" flat style="border-top: 15px solid #5C6BC0">
           <v-card-title class=" justify-start pa-6 ml-12">
               <v-card width="150" flat>
                   <v-img :src="vendorInterface.logo" class="rounded-lg"  contain></v-img>
               </v-card>
               <span class="text-subtitle-2 primary--text text-uppercase ml-3 d-inline-block mt-8">
                    {{vendor}}
                </span>
                <v-spacer></v-spacer>
                <span class=" font-weight-light primary--text text-center  text-subtitle-1 text-uppercase font-weight-medium">{{vendorInterface.tagline}}</span>
                <v-spacer></v-spacer>
           </v-card-title>
          <v-tabs
            v-model="tab"
            background-color="transparent"
            color="primary lighten-1"
            grow
            >
                <v-tab
                    v-for="item in interfaceItems"
                    :key="item"
                    class="primary--text"
                    color="primary"

                >
                    {{ item }}
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
                <!-- Store -->
                <v-tab-item>
                    <!-- <v-card
                    color="shade3"
                    flat
                    > -->
                    <!-- <v-card-text> -->
                        <Showcase 
                         :itemList="vendorInterface.itemCatalog"
                         :vendor="vendor">
                         <router-view />
                         </Showcase>
                    <!-- </v-card-text>
                    </v-card> -->
                </v-tab-item>

                <!-- Events -->
                <v-tab-item>
                    <!-- <v-card
                    color="fontColor lighten-4"
                    flat
                    >
                    <v-card-text> -->
                        <Events :events="vendorInterface.vendorPromotionEvents"/>
                        <!-- </v-card-text>
                    </v-card> -->
                </v-tab-item>

                <!-- Customer -->
                <v-tab-item>
                    <!-- <v-card
                    color="fontColor lighten-4"
                    flat
                    > -->
                    <!-- <v-card-text> -->
                        <Customer 
                        :vendorCustomerRatings="customerRatings" 
                        :vendor="vendor"
                        :resident="resident"/>
                    <!-- </v-card-text>
                    </v-card> -->
                </v-tab-item>

                <!-- Gallery -->
                <v-tab-item>
                    <!-- <v-card
                    color="fontColor lighten-4"
                    flat
                    >
                    <v-card-text> -->
                        <Gallery :photoList="vendorInterface.photoList" :vendor="vendor"/>
                    <!-- </v-card-text>
                    </v-card> -->
                </v-tab-item>

                <!-- Other Info -->
                <v-tab-item>
                    <!-- <v-card
                    color="fontColor lighten-4"
                    flat
                    >
                        <v-card-text> -->
                            <OtherInfo 
                                        :businessStreetNo="vendorInterface.businessStreetNo"
                                        :businessStreetName="vendorInterface.businessStreetName"
                                        :businessCity="vendorInterface.businessCity"
                                        :businessState="vendorInterface.businessState"
                                        :businessCountry="vendorInterface.businessCountry"
                                        :businessPostalCode="vendorInterface.businessPostalCode"
                                        :businessPhone="vendorInterface.businessPhone"
                                        :businessHours="vendorInterface.businessHours"
                                        :businessFax="vendorInterface.businessFax"
                                        :businessEmail="vendorInterface.businessEmail"
                                        :aboutUs="vendorInterface.aboutUs"
                                        :website="vendorInterface.website" 
                                        :businessTitle="vendorInterface.businessTitle"/>
                        <!-- </v-card-text>
                    </v-card> -->
                </v-tab-item>
            </v-tabs-items>
       </v-card>

       <v-snackbar
        v-model="snackbar"
        centered
        dark
        color="primary"
        
        >
      <span class="text-subtitle-1">Please Log In</span>

      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar=false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    </v-container>
</template>

<script>
import {mapGetters} from "vuex"
import Showcase from "./Showcase.vue"
import Events from "./Events.vue"
import Customer from "./Customer.vue"
import Gallery from "./Gallery.vue"
import OtherInfo from "./OtherInfo.vue"
import { eventBus_actionPanel } from "../eventBus";

export default {
    components: {
        Showcase, Events, Customer, Gallery, OtherInfo
    },

    props: { 
            vendor: String
        },

    data() {
        return {
            actionsPanelShow: false,
            interfaceItems: ["Showcase", "Events", "Customer", "Gallery","Other Info"],
            orderQty: 0,
            snackbar: false,
            singleItem: null,
            tab: null,
            differentVendor: false
        }
    },
   

    mounted() {
        
        console.log(this.vendor);
        if(this.vendor) this.$store.dispatch("getVendorInterface", {vendor: this.vendor})
        
        eventBus_actionPanel.$on("openActionPanel", value => {
            // console.log(value.item)
            this.singleItem = value.item
            console.log(this.singleItem)
            this.actionsPanelShow = true
        })
        eventBus_actionPanel.$on("leaveSingleItem", value => {
            this.actionsPanelShow = false
        })
    },

    // watch: {
    //     snackbar(val) {
    //         // console.log(val)
    //     }
    // },

    computed: {
        ...mapGetters(["vendorInterface", "loading", "customerRatings", "resident", "viewPortDimension", "shoppingCart", "saveShoppingCartLoading"]),

        maxQty() {
            let qty = []
            for (let i=1; i <= 20; i++){
                qty.push(i)
            }
            // console.log(qty)
            return qty
        }
       
    },

    watch: {
        vendor(val) {
            console.log(val)
            // this.vendor = to.params.vendor
            this.$store.dispatch("getVendorInterface", {vendor: this.vendor})
        },
        tab(val) {
            // console.log(val)
        },
        vendorInterface(val) {
            // console.log(val)
        }
    },

    methods: {
        
        loadShoppingCart() {

            if(this.resident == null) {
                this.snackbar = true
                return
            }
                

            if(this.shoppingCart && this.shoppingCart.length > 0) {
               
                if (this.vendorInterface.businessTitle !== this.shoppingCart[0].vendorName) {
                    this.differentVendor = true
                    return
                }
            }
            console.log(this.singleItem)
            
            this.$store.dispatch("saveShoppingCart", {
                resident: this.resident.residentName,
                itemCode: this.singleItem.itemCode,
                vendor: this.vendorInterface._id,
                description: this.singleItem.description,
                quantity: this.orderQty,
                rewardSilver: this.singleItem.rewardSilver,
                rate: this.singleItem.rate,
                promoRate: this.singleItem.promoRate,
                taxRate: this.singleItem.taxRate
            })
                            
        }
    },

    beforeRouteEnter(to, from , next) {
        
        next(vm => {
            vm.$store.commit("setLoading", true)
        })
    }
}
</script>

<style lang="scss" scoped>

.basil {
background-color: #FFFBE6 !important;
}

.basil--text {
color: #356859 !important;
}
.actionPanel {
    position: fixed;
    top: 130px;
    right: 30px
}
</style>
