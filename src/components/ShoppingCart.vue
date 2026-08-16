<template>
    <v-container >
        <v-toolbar flat dark dense rounded color="primary" class="mb-3">
            <v-toolbar-title class="text-h6 font-weight-bold">
                Shopping Cart
                <v-btn 
                text 
                color="primary" 
                @click="clearShoppingCart()">
                Clear All</v-btn>
                </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn  text dark plain @click="toCheckout" :disabled="shoppingCart.length==0">Check Out</v-btn>
        </v-toolbar>
        <v-card outlined class=" ma-auto rounded-lg" v-for=" (item, index) in shoppingCart" :key="index" :max-width="viewPortDimension.width * 0.8">
            <v-card-text>
                <v-row>
                    <v-col cols="4">
                        <v-img :src="item.photo" contain max-height="200" max-width="200"></v-img>
                    </v-col>
                    <v-col cols="8">
                        <v-card-title class="text-subtitle-1 text--darken-3 fontColor--text">{{item.description}}</v-card-title>
                         <v-row v-if="item.promoRate > 0" class="my-1 ml-3">
                            <span class="text-subtitle-1  fontColor--text mx-3 font-weight-bold">Price:</span>
                            <span class="red--text text-subtitle-1 font-weight-bold mx-3" >On Sale {{ $filters.formatCurrencyAmount(item.promoRate) }}</span>
                            <span class="text-decoration-line-through text-body-1 font-weight-light fontColor--text mx-3">Was {{ $filters.formatCurrencyAmount(item.rate) }}</span>
                            <span class="mx-1 silver--text text--darken-1" v-if="item.rewardSilver"><v-icon color="silver darken-1">mdi-coin</v-icon>{{ $filters.formatIntAmount(item.rewardSilver) }}</span>
                        </v-row>
                        <v-row v-else class="my-1 ml-3" >
                            <span class="text-subtitle-1  fontColor--text font-weight-bold mx-3">Price:</span>
                            <span class="text-subtitle-1 font-weight-medium fontColor--text mx-3">{{ $filters.formatCurrencyAmount(item.rate) }}</span>
                            <span class="mx-1 silver--text text--darken-1" v-if="item.rewardSilver"><v-icon color="silver darken-1">mdi-coin</v-icon>{{ $filters.formatIntAmount(item.rewardSilver) }}</span>
                        </v-row>
                        <v-row class="my-3 ml-3">
                            <span class="primary--text font-weight-li text-body-2 mx-3">Sold by: {{item.vendorName}}</span>
                            <v-avatar tile size="30" class="rounded-lg mb-2"><v-img max-width="30" max-height="30" :src="item.vendorLogo" contain></v-img></v-avatar>
                        </v-row>
                        <v-row class="my-y ml-3">
                            <v-col cols="3">
                            <v-select 
                                v-model.number="item.quantity" 
                                label="Quantity"
                                :items="maxQty" 
                                outlined 
                                rounded 
                                filled 
                                height="20"
                                @blur="updateShoppingCartQty(item.itemCode, item.quantity)"
                                dense></v-select>
                            </v-col>
                           <v-btn text color="primary" class="mt-4" @click="removeShoppingCartItem(item.itemCode)">Remove</v-btn>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
            <!-- <v-divider class="my-1"></v-divider> -->
            <!--  -->
            <v-card-actions style="background-color: #445F9B;" >
                <v-spacer></v-spacer>
                <span class="mx-2 white--text font-weight-bold">Subtotal: {{ $filters.formatCurrencyAmount(item.promoRate>0?item.quantity*item.promoRate:item.quantity*item.rate) }}</span>
                <span class="mx-2 white--text font-weight-bold">Reward Silver: {{ $filters.formatIntAmount(item.rewardSilver*item.quantity) }}</span>
            </v-card-actions>
        </v-card>

         <v-card flat  class="pa-2" style="height: 100%; width: 100%;" v-if="shoppingCart.length==0">
            <v-card-text>
                <!-- <v-img src="/images(2).jpeg" max-height="200" max-width="200"></v-img> -->
                <!-- <v-img src="/images.jpeg" max-height="200" max-width="200"></v-img> -->
                <v-img src="https://www.animatedimages.org/data/media/1633/animated-shopping-cart-image-0016.gif" height="300" width="300" class="ma-auto"></v-img>
            <v-row class="mt-3">
                <span class="text-h2 shade4--text font-weight-bold mx-auto">Go Shopping ...</span>
            </v-row>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
 import {mapGetters} from "vuex"
 import _ from "lodash"
 
 export default {
     name: "ShoppingCart",
     data() {
         return {

         }
     },

     computed: {
        ...mapGetters(["shoppingCart", "viewPortDimension", "resident"]),
          
        maxQty() {
            let qty = []
            for (let i=1; i <= 20; i++){
                qty.push(i)
            }
            // console.log(qty)
            return qty
        }
     },

     methods: {
         clearShoppingCart() {
              this.$store.dispatch("updateShoppingCart", {
                resident: this.resident.residentName,
                itemCode: null,
                quantity: 0 
            })
         },

         removeShoppingCartItem(itemCode) {
            this.$store.dispatch("updateShoppingCart", {
                resident: this.resident.residentName,
                itemCode,
                quantity: 0 
            })
         },

         toCheckout() {
             console.log(this.shoppingCart)
             const shoppingCartList = this.shoppingCart.map(item => {
                 return {
                     vendor: item.vendorName,
                     lat: item.vendorLat,
                     lng: item.vendorLng,
                     deliveryFees: item.deliveryFees,
                     maxDeliveryDistance: item.maxDeliveryDistance,
                     description: item.description,
                     quantity: item.quantity,
                     price: item.promoRate > 0 ? item.promoRate : item.rate,
                     dealPrice: 0,
                     taxRate: item.taxRate,
                     itemCode: item.itemCode,
                     rewardSilver: item.rewardSilver,
                     discount: 0
                 }
             })
            //  console.log(vendorList)
             this.$router.push({name:'checkout', query: {shoppingCartList, impendingOrder: null}})
         },

         updateShoppingCartQty(itemCode, quantity) {
            this.$store.dispatch("updateShoppingCart", {
                resident: this.resident.residentName,
                itemCode,
                quantity
            })
         }
     }
 }
</script>
