<template>
    <v-container fluid class="justify-center">

        <!-- Do Rating Dialog-->
        <v-dialog v-model="ratingWindow" :max-width="viewPortDimension.width*0.5" persistent>
            <v-card class="pa-4">
                    <v-card-text>
                        <v-rating
                            v-model="rating"
                            background-color="orange lighten-3"
                            color="orange"
                            large
                            half-increments
                            empty-icon="mdi-star-outline"
                            full-icon="mdi-star"
                            half-icon="mdi-star-half"
                        ></v-rating>
                        <v-textarea  
                            outlined 
                            v-model="comments" 
                            label="Customer Comments" 
                            placeholder="thank you for your commentary!"
                            class="py-3"></v-textarea>
                    </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text plain color="primary" @click="saveRating">Save</v-btn>
                    <v-btn outlined text plain  color="primary" @click="ratingWindow=false">Cancel</v-btn>
                    
                </v-card-actions>
            </v-card>
        </v-dialog>

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

        <!-- item info -->
        <v-card flat class="pa-12 shade">
            <v-row dense>
                <v-col cols="4">
                    <v-img :src="getSingleItem.photo" max-height="500" max-width="300" contain class="ml-6"></v-img>
                </v-col>
                <v-col cols="8" class="pa-1">
                    <v-card-title class="text-subtitle-1 fontColor--text text--darken-2 ">
                    {{getSingleItem.description}}
                    </v-card-title>
                    <v-rating
                        :value="singleItemRating.averageRating"
                        background-color="accent lighten-3"
                        color="accent"
                        medium
                        class="ml-2"
                        v-if="singleItemRating"
                        half-increments
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half"
                        readonly
                    ></v-rating>
                    <!-- <v-divider></v-divider> -->
                    
                    <v-row v-if="getSingleItem.promoRate > 0" class="ma-1">
                        <span class="text-subtitle-1  fontColor--text text--darken-3 mx-2">Price:</span>
                        <span class="red--text text-subtitle-1 font-weight-bold mx-2" >on sale {{
                            getSingleItem.promoRate | format-currency-amount
                            }}</span>
                        <span class="text-decoration-line-through text-body-1 fontColor--text font-weight-light mx-3">was {{getSingleItem.rate | format-currency-amount}}</span>
                        <span class="mx-1 silver--text text--darken-1 font-weight-bold" v-if="getSingleItem.rewardSilver"><v-icon color="silver darken-1">mdi-coin</v-icon>{{getSingleItem.rewardSilver | format-int-amount}}</span>
                    </v-row>
                    <v-row v-else class="ma-1" >
                        <span class="text-subtitle-1 fontColor--text text--darken-2 font-weight-bold mx-2">Price:</span>
                        <span class="text-subtitle-1 fontColor--text text--darken-2 font-weight-bold mx-2">{{getSingleItem.rate | format-currency-amount}}</span>
                        <span class="mx-1 silver--text text--darken-1 font-weight-black" v-if="getSingleItem.rewardSilver"><v-icon color="silver darken-1" >mdi-coin</v-icon>{{getSingleItem.rewardSilver | format-int-amount}}</span>
                    </v-row>
                    <v-divider></v-divider>
                    <v-subheader light class="text-subtitle-1 fontColor--text text--darken-2 ">About This Item:</v-subheader>
                    <p class="px-3 fontColor--text text--darken-2">{{getSingleItem.specification}}</p>
                    
                </v-col>
            </v-row>
            <!-- <v-divider class="my-2"></v-divider> -->
            <!-- Single Item Rating -->
            <v-row >
                <v-col cols="12" class="pa-2">
                    <v-toolbar flat dense rounded color="#FAFAFA" >
                                        <v-toolbar-title class="primary--text  font-weight-light text-h6">Customer Rating</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <v-btn  color="primary" text plain outlined @click="openRating">Comment</v-btn>
                    </v-toolbar>
                    <v-timeline
                        align-top
                        :dense="$vuetify.breakpoint.smAndDown"
                        v-if="singleItemRating"
                    >
                        <v-timeline-item
                        v-for="(item, i) in singleItemRating.customerRatings"
                        :key="i"
                        :color="ratingColor(item.rating)"
                        :icon="ratingFace(item.rating)"
                        fill-dot
                        dark
                        >
                        <v-card
                            :color="ratingColor(item.rating)"
                            dark
                            hover
                        >
                            <v-card-title class="text-h6">
                                <v-avatar class="mr-2">
                                    <v-img :src="item.customerAvatar"></v-img>
                                </v-avatar>
                                {{item.customerName}}
                            <v-rating
                                :value="item.rating"
                                background-color="accent lighten-3"
                                color="accent"
                                medium
                                class="ml-2"
                                half-increments
                                empty-icon="mdi-star-outline"
                                full-icon="mdi-star"
                                half-icon="mdi-star-half"
                                readonly
                            ></v-rating>
                            </v-card-title>
                            <v-card-text class="white text--primary">
                            <p class="fontColor--text text--darken-2">{{item.comments}}</p>
                            
                            </v-card-text>
                            <v-card-actions>
                                {{ item.time | convert-customer-rating-time }}
                                <v-spacer></v-spacer>
                                <!-- <v-btn
                                :color="item.color"
                                class="mx-0"
                                outlined
                            >
                                Reply
                            </v-btn> -->
                            </v-card-actions>
                        </v-card>
                        </v-timeline-item>
                    </v-timeline>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script>
import {mapGetters} from "vuex"
import { eventBus_actionPanel } from "../eventBus";
import _ from "lodash"

export default {
   name: "SingleCatalogItem",
   props: {
        itemCode: String,
        vendor: String
   },
   data() {
       return {
           comments: null,
           rating: 0,
           ratingWindow: false,
           snackbar: false
       }
   },

    mounted() {
        eventBus_actionPanel.$emit("openActionPanel", {item : this.getSingleItem})
        // console.log(this.vendor)
        // console.log(this.itemCode)
        this.$store.dispatch("getSingleItemRating", {vendor: this.vendor, itemCode: this.itemCode})
    },

   computed: {
       ...mapGetters(["vendorInterface", "resident", "singleItemRating", "viewPortDimension"]),

        getSingleItem() {
            if(this.vendorInterface) {
                    const index = _.findIndex(this.vendorInterface.itemCatalog, item => {
                    return this.itemCode == item.itemCode
                })
                // console.log(this.vendorInterface.itemCatalog[index])
                return this.vendorInterface.itemCatalog[index]
            }
        }
   },

   methods: {

       openRating() {
           if (!this.resident) {
               this.snackbar = true
               return
           }
         this.ratingWindow = true
       },
        ratingColor(rating) {
            if (rating >= 4) {
                return 'green lighten-2'
            }
            if (rating < 4 && rating >= 3) {
                return 'yellow darken-2'
            }
            if( rating <= 2) {
                return 'red lighten-2'
            }
        },

        ratingFace(rating) {
            if (rating >= 4) {
                return 'mdi-emoticon-excited'
            }
            if (rating < 4 && rating >= 3) {
                return 'mdi-emoticon-neutral'
            }
            if( rating <= 2) {
                return 'mdi-emoticon-sad'
            }
        },

       saveRating() {
           this.$store.dispatch("saveSingleItemRating", {
               itemCode: this.itemCode,
               vendor: this.vendor,
               rating: this.rating,
               residentId: this.resident._id,
               comments: this.comments,
               time: Date.now().toString()
           })
           this.rating = 0
           this.comments = ''
           this.ratingWindow = false
       }
   },

   beforeRouteLeave(to, from ,next) {
       eventBus_actionPanel.$emit("leaveSingleItem")
       next()
   }
}
</script>


