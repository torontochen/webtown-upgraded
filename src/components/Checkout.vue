<template>
    <v-container class="mb-5">
               
        <!-- delivery way -->
        <v-card class="rounded-lg mt-2 mx-auto" outlined v-if="!isPrepay" width="1200">
            <v-toolbar color="shade" flat>
                <v-toolbar-title class="text-fontColor">Deliver</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon color="primary" @click="isNoteWindowOpen=true">
                    <v-icon >mdi-pencil-box-multiple-outline</v-icon>
                </v-btn>
                
            </v-toolbar>
            <!-- Loading Spinner -->
            <v-row>
            <v-dialog v-model="placeOrderLoading" persistent fullscreen>
                <v-container fill-height>
                <!-- <v-row justify="center" align-content="center">
                    <v-progress-circular
                    indeterminate
                    :size="60"
                    :width="4"
                    color="primary lighten-5"
                    ></v-progress-circular>

                    
                </v-row> -->

                <!-- <v-card >
                    <v-card-text> -->
                         <v-img 
                      src="/static/animated-office-worker-image-0058.gif"
                      height="250" width="250" class="text-center"  />

                    <!-- </v-card-text>
                    <v-card-text> -->
                         <transition-group name="fade-down" v-if="totalRewardSilver>0">
                          <span
                            style="right: 100px; bottom: 100px; position: absolute"
                            class="text-h5 text-accent font-weight-bold text-center"
                            key="2"
                            v-if="placeOrderLoading"
                            >
                            <v-img src="/static/animated-money-image-0013.gif" 
                            height="60" width="60" class="ml-5 mt-10" />
                             <v-img 
                            src="/static/animated-treasure-image-0041.gif" 
                            height="80" width="80" class="ma-auto" v-if="placeOrderLoading"></v-img> 
                            +{{ $filters.formatIntAmount(totalRewardSilver + Math.floor((totalBeforeTax - totalDiscount) * 0.035 * 0.15 * 1000)) }}</span
                          >
                        </transition-group>
                    <!-- </v-card-text> -->
                <!-- </v-card> -->
                </v-container>
            </v-dialog>
            </v-row>
            <v-card-text class="ml-2">
                <v-radio-group v-model="deliveryType">
                    <v-radio
                        label="Pick Up / Dine In"
                        value="pickup"
                        class="my-1"
                    ></v-radio>
                    <v-row v-if="deliveryType=='pickup'" class="my-1">
                        <v-list-item two-line v-for="item in pickupAddressList" :key="item.itemCode">
                            <v-list-item-title class="font-weight-bold">{{item.vendor}}</v-list-item-title>
                            <v-list-item-subtitle>{{item.address}}</v-list-item-subtitle>
                        </v-list-item>
                    </v-row>
                        <v-radio
                        :label="'Ship to'"
                        value="ship"
                        class="my-1"
                        :disabled="maxDeliveryDistance==0"
                    ></v-radio>
                    <v-row v-show="deliveryType=='ship'" class="my-1 px-2 d-flex flex-row justify-start align-end ">
                        <v-col cols="6" v-show="deliveryType=='ship'&&!isChangeDeliveryAddress">
                              
                            <span class="text-subtitle-1 font-weight-black ">{{resident.firstName + ' ' + resident.lastName}}</span><br>
                            <span>{{deliveryAddress}}
                                <v-btn icon size="small" color="primary" @click="isChangeDeliveryAddress=true" v-if="!isChangeDeliveryAddress">
                                    <v-icon small>mdi-pencil</v-icon>
                                </v-btn>
                                <!-- <v-btn icon size="small" color="primary" @click="rollbackDeliveryAddress" v-else>
                                    <v-icon small>mdi-backup-restore</v-icon>
                                </v-btn> -->
                            </span>
                        </v-col>
                        <v-col cols="6" v-show="isChangeDeliveryAddress && deliveryType=='ship'">
                            <span class="text-subtitle-1 font-weight-black ">{{resident.firstName + ' ' + resident.lastName}}</span><br>

                            <v-text-field
                                id="delivery_address"
                                label="Address in GTA (ex: 247 Sheppard Ave. East)" density="compact"
                                color="primary"
                                required
                                type="text"
                                v-model="deliveryAddress"
                                clearable
                                class="align-self-stretch mt-4"
                                :append-outer-icon="'mdi-backup-restore'"
                                @click:append-outer="rollbackDeliveryAddress"
                            />
                        </v-col>
                    </v-row>
                </v-radio-group>
                <v-row class="text-warning text-center" v-if="errorMessage!=''">
                    {{errorMessage}}
                </v-row>
            </v-card-text>
            <v-card-actions v-if="note!=''">
                <v-spacer></v-spacer>
                Note:&nbsp;{{note}}
                <v-spacer></v-spacer>

            </v-card-actions>
        </v-card>

        <!-- Order and payment  -->
        <v-card class="rounded-lg mt-2 mx-auto" outlined width='1200'>
            <v-toolbar color="shade" flat>
                <v-toolbar-title class="text-fontColor">Order&nbsp;{{impendingOrder!=null?impendingOrder.orderNo:''}}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-col>
                    <span class="text-subtitle-1 text-fontColor font-weight-bold ml-2">Order Summary</span>
                
                    <v-table>
                        <template v-slot:default>
                        <thead>
                            <tr>
                            <th class="text-left">
                                Description
                            </th>
                            <th class="text-left">
                                Sold By
                            </th>
                            <th class="text-left">
                                Qty
                            </th>
                            <th class="text-left">
                                Price
                            </th>
                            <th class="text-left">
                                Amount
                            </th>
                            <th class="text-left text-red">
                                Discount
                            </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- impendingOrder==null ? shoppingCartList : -->
                            <tr
                            v-for="(item) in ( shoppingCart)"
                            :key="item.itemCode"
                            >
                            <td class="text-truncate" style="max-width: 300px;">{{ item.description }}</td>
                            <td>{{ item.vendor }}</td>
                            <td>{{ item.quantity }}</td>
                            <td v-if="item.dealPrice>0">
                                <span class="text-decoration-line-through ">{{ $filters.formatCurrencyAmount(item.price.toFixed(2)) }}&nbsp;&nbsp;&nbsp;</span>
                                <span class="text-red ml-1">{{ $filters.formatCurrencyAmount(item.dealPrice.toFixed(2)) }}</span>
                            </td>
                            <td v-else>{{ $filters.formatCurrencyAmount(item.price.toFixed(2)) }}</td>
                            <td v-if="item.dealPrice>0">
                                <span class="text-decoration-line-through ">{{ $filters.formatCurrencyAmount((item.quantity * item.price).toFixed(2)) }}&nbsp;&nbsp;&nbsp;</span>
                                <span class="text-red ml-1">{{ $filters.formatCurrencyAmount((item.quantity * item.price - item.discount).toFixed(2)) }}</span>
                            </td>
                            <td v-else>{{ $filters.formatCurrencyAmount((item.quantity * item.price).toFixed(2)) }}</td>
                            <td v-if="item.discount>0" class="text-red">-{{ $filters.formatCurrencyAmount(item.discount.toFixed(2)) }}</td>
                            <td v-else></td>
                            </tr>
                        </tbody>
                        </template>
                    </v-table>
                   
                    <v-divider class="mt-1"></v-divider>
                     <v-row v-if="totalRewardSilver>0" class="text-right text-subtitle-2 text-primary ma-3">
                       Total Reward Silver (Including 15% Bonues From Boundary ):&nbsp;{{ $filters.formatIntAmount(totalRewardSilver + Math.floor((totalBeforeTax - totalDiscount) * 0.035 * 0.15 * 1000)) }}
                    </v-row>
                    <!-- Search Deal Button -->
                    <v-row v-if="noAvailableDeals" class="my-3">
                        <v-spacer></v-spacer><span class="text-red text-subtitle-2 text-left mr-14">{{noAvailableDeals}}</span>
                    </v-row>
                    <v-row class="my-2 pr-4" v-if="impendingOrder==null">
                        <v-spacer/>
                        <v-btn variant="text"
                        class="mr-16"
                        :loading="searchCouponLoading"
                        :disabled="searchCouponLoading"
                        color="shade darken-2"
                        rounded
                        style="background-color: #F5F5F5"
                        @click="searchCoupon" size="small" 
                        >
                        Search Deals
                        <template v-slot:loader>
                            <span>Search...</span>
                        </template>
                        </v-btn>
                    </v-row>
                    <v-row v-if="soughtDeals && impendingOrder==null">

                    </v-row>
                    <v-row class="my-1  justify-end d-flex" no-gutters>
                        <v-spacer />
                        <v-col cols="4" v-if="totalDiscount>0">
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-red" v-for="(item, i) in dealsSoughtTitle" :key="i">Deal:&nbsp;{{item.title}}</span><br>
                        </v-col>
                        <v-col cols="2">
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-red" v-if="totalDiscount>0">You Save</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block" >{{comboTotalAmount>0?'Combo Total Before Tax':'Total Before Tax'}}</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">Shipping</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">HST(13%)</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">Total Amount</span><br>
                        </v-col>
                        <v-col cols="2">
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-red" v-if="totalDiscount>0">{{ $filters.formatCurrencyAmount(totalDiscount.toFixed(2)) }}</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">{{ $filters.formatCurrencyAmount(comboTotalAmount > 0 ? comboTotalAmount.toFixed(2):(totalBeforeTax-totalDiscount).toFixed(2)) }}</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">{{ $filters.formatCurrencyAmount(shipping.toFixed(2)) }}</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">{{ $filters.formatCurrencyAmount((totalBeforeTax-totalDiscount+shipping)*0.13.toFixed(2)) }}</span><br>
                            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block">{{ $filters.formatCurrencyAmount((totalBeforeTax-totalDiscount+shipping)*1.13.toFixed(2)) }}</span><br>
                        </v-col>
                    </v-row>
                    <v-divider class="my-1" v-if="impendingOrder==null"></v-divider>
                    <v-row class="justify-end d-flex  my-2" v-if="impendingOrder==null">
                        <v-spacer/>
                            <span class="mx-1">Pay by Silver to Gold</span>
                            <span>(Silver 1000 -> Gold 1)</span>
                            <v-col cols="6">
                                <v-row><span class="mx-1"><v-icon class="mr-1">mdi-coin</v-icon>{{ $filters.formatAmount(resident.silverCoins-silverToConvert) }}</span>
                            <v-slider
                                :max="resident.silverCoins"
                                v-model="silverToConvert"
                                step="100"
                            ></v-slider>
                            <span><v-icon class="mr-1" color="yellow">mdi-coin</v-icon>{{ $filters.formatIntAmount(convertedGold) }}</span></v-row>
                            </v-col>
                            <v-spacer/>
                    </v-row>
                    <v-row class="d-flex justify-end">
                        <v-col cols="4">
                            <span class="ml-24 text-h6 text-secondary font-weight-bold" v-if="impendingOrder == null ">Balance:
                             {{ $filters.formatCurrencyAmount(((totalBeforeTax-totalDiscount+shipping)*1.13-convertedGold).toFixed(2)) }}</span>
                            <span class="ml-24 text-subtitle-1 text-secondary font-weight-bold text-start" v-else>Balance:
                             {{ 'Paid Off! Extra Shipping Will Be Paid By' + ' ' + impendingOrder.paymentMethod + ' ' + 'In File' }}</span>
                        </v-col>
                    </v-row>
                    <v-divider class="my-1" v-if="impendingOrder==null"></v-divider>

                    <v-radio-group
                        v-model="payBy"
                        row
                        class="d-flex justify-center"
                        v-if="impendingOrder==null"
                        >

                        <v-radio
                            value="creditcard"
                        >
                        <template v-slot:label>
                            <div><v-img src="/static/credit_card-removebg-preview.png" max-height="60" max-width="80"></v-img></div>
                        </template>
                        </v-radio>
                        <v-radio
                            value="paypal"
                        >
                        <template v-slot:label>
                            <div><v-img src="/static/paypal-logo-no-background-png-removebg-preview.png" max-height="60" max-width="80"></v-img></div>
                        </template>
                        </v-radio>
                        </v-radio-group>
            </v-col>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <span v-if="!isPrepay">
                    <v-btn variant="flat" 
                color="primary"
                class="pa-2" size="large" 
                :disabled="errorMessage!=''"
                @click="placeOrder"
                
                >
                    {{impendingOrder==null ? 'Place  Order' : 'Finalize Order'}}
                </v-btn><v-btn variant="text"  color="primary" @click="isPrepay=!isPrepay" v-if="impendingOrder==null&&!isPrepay">Just Prepay?</v-btn>
                </span>

                <span v-if="impendingOrder==null&&isPrepay">
                    <v-btn variant="flat" 
                    color="primary"
                    class="pa-2" size="large" 
                    :disabled="errorMessage!=''"
                    @click="prepay"
                    >
                        Prepay
                    </v-btn><v-btn variant="text"  color="accent" @click="isPrepay=!isPrepay"  v-if="impendingOrder==null&&isPrepay">Back To Place Order</v-btn>
                </span>
                
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>

        <!-- Note window -->
        <v-dialog v-model="isNoteWindowOpen" width="500" height="500">
           <v-card>
               <v-card-text>
                <v-textarea
                  placeholder="Leave a note for vendor"
                  v-model="note"
                ></v-textarea>
               </v-card-text>
               <v-card-actions>
                   <v-spacer></v-spacer>
              <v-btn variant="flat" 
              color="primary"  
              @click="isNoteWindowOpen=false"
              >OK</v-btn>
              <v-btn variant="outlined"  color="primary"  @click="cancelNote">Cancel</v-btn>
            <v-spacer></v-spacer>
               </v-card-actions>
           </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import {mapGetters} from "vuex"
import moment from "moment"
import _ from "lodash"
import gmapsInit from "../utils/gmaps";
import { GET_PICKUP_ADDRESS } from "../queries/queries_query"
import { PREPAY } from "../queries/queries_mutation"

export default {
    name: "Checkout",
    props: ["shoppingCartList", "impendingOrder"],
    data(){
        return {
            payBy: 'creditcard',
            isPrepay: false,
            pickupAddressList: [],
            deliveryType: 'pickup',
            silverToConvert: 0,
            shipping: 0,
            totalDiscount: 0,
            dealsSoughtTitle: [],
            dealsSoughtType: [],
            deliveryAddress: '',
            errorMessage: '',
            isNoteWindowOpen: false,
            comboTotalAmount: 0,
            shoppingCart: null,
            valueDiscountList: [],
            note: '',
            deliveryLat: null,
            deliveryLng: null,
            vendorLat: null,
            vendorLng: null,
            isChangeDeliveryAddress: false,
            deliveryFees: 0,
            maxDeliveryDistance: 0,
            noAvailableDeals: null,
            google: null
        }
    },
     created() {
        console.log(this.shoppingCartList)
        console.log(this.impendingOrder)
        if(this.impendingOrder != null) {
            this.shoppingCart = this.impendingOrder.orderItems.map(item => {
                return {
                        vendor: this.impendingOrder.vendor,
                        lat: this.impendingOrder.lat,
                        lng: this.impendingOrder.lng,
                        deliveryFees: this.impendingOrder.deliveryFees,
                        maxDeliveryDistance: this.impendingOrder.maxDeliveryDistance,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.unitPrice,
                        dealPrice: 0,
                        taxRate: item.taxRate,
                        itemCode: item.itemCode,
                        discount: 0
                }
            })
            this.vendorLat = this.impendingOrder.lat
            this.vendorLng = this.impendingOrder.lng
            this.deliveryFees = this.impendingOrder.deliveryFees
            this.maxDeliveryDistance = this.impendingOrder.maxDeliveryDistance
            this.dealsSoughtTitle = this.impendingOrder.dealsTitle
            this.totalDiscount = this.impendingOrder.totalDiscount
        } else 
        {
            this.shoppingCart = this.shoppingCartList
            this.vendorLat = this.shoppingCartList[0].lat
            this.vendorLng = this.shoppingCartList[0].lng
            this.deliveryFees = this.shoppingCartList[0].deliveryFees
            this.maxDeliveryDistance = this.shoppingCartList[0].maxDeliveryDistance
        }
        
       
     },

  async mounted() {
        // console.log(this.shoppingCartList)
    
        // const vendorList = this.shoppingCart.map(item => {
        //     return item.vendor
        // })
        try {
      // this.$$refs.form.reset();
      // console.log("mounted");
      // console.log(this.resident);
    //   let autocomplete;
      const google = await gmapsInit();
      this.google = google
    //   const map = new google.maps.Map(document.getElementById("map"), {
    //     // center: { lat: -78.944499, lng: 43.92496 },
    //     zoom: 8,
    //     disableDoubleClickZoom: false,
    //     zoomControl: false,
    //     streetViewControl: false,
    //     mapTypeControl: false,
    //     // fullscreenControl: false
    //   });
      // console.log(map);

     
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

      // const resident = JSON.parse(localStorage.getItem("resident"));
      // Set Up Center
    //    if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //       // console.log(position);
    //       // console.log(center);
    //       const center = {
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude,
    //       };
    //     });
    //   } else {
    //     console.log("not ok");
    //   }

    
    
      

      //autocomplate for delivery address
     const autocomplete_delivery = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById("delivery_address")),
        {
          types: ["geocode"],
          bounds: bounds,
          strictBounds: true,
        }
      );
      autocomplete_delivery.setBounds(bounds);
      
       autocomplete_delivery.addListener("place_changed", () => {
        this.errorMessage = '';
        // this.place = null;
        const place = autocomplete_delivery.getPlace();
        this.deliveryLat = place.geometry.location.lat();
        this.deliveryLng = place.geometry.location.lng()
        // console.log(place);
        // this.lat = place.geometry.location.lat()
        // this.lng = place.geometry.location.lng()
        // console.log(place.address_components[0].types[0]);
        
        if (place.address_components[0].types[0] !== "street_number") {
          this.errorMessage =
            place.formatted_address + "  is not a valid google map address";
          return;
        } else {
          // this.place = place;
        //   const location = place.formatted_address;
          // this.mailStrAddress = place.formatted_address;
          // this.vendorAddressStreetNo = place.address_components[0].short_name;
          // this.vendorAddressStreetName = place.address_components[1].short_name;
          this.deliveryAddress = place.address_components[0].short_name + ' ' 
          + place.address_components[1].short_name 
           const city =
            place.address_components[2].short_name == "Mississauga" ||
            place.address_components[2].short_name == "Brampton"
              ? place.address_components[2].short_name
              : place.address_components[3].short_name;
          const addressPC =
            place.address_components.length > 7
              ? place.address_components[7].short_name
              : place.address_components[6].short_name;
            this.deliveryAddress = this.deliveryAddress + ' ' + city + ' ' + addressPC
        }
        const vendorPosition = new google.maps.LatLng(this.vendorLat, this.vendorLng);
        const deliveryPosition  = new google.maps.LatLng(this.deliveryLat, this.deliveryLng);
        // console.log(vendorPosition)
        // console.log(deliveryPosition)
        const distance = this.calculateDistance (this.vendorLat, this.vendorLng, this.deliveryLat, this.deliveryLng)
        // console.log(distance)
        // console.log(this.google.maps.geometry.spherical.computeDistanceBetween(vendorPosition, deliveryPosition) / 1000)
        if(distance > this.maxDeliveryDistance) {
            this.errorMessage = 'This Location Is Over The Delivery Distance!'
        } else {
            this.shipping = this.deliveryFees
        }

        // console.log(this.postalCode);
      });
      
      
      if (this.resident) {
        // console.log(resident.mailPostalCode);
        this.postalCode = this.resident.postalCode;
        this.residentName = this.resident.residentName;
        this.firstName = this.resident.firstName;
        this.lastName = this.resident.lastName;
        this.nickName = this.resident.nickName
        this.gender = this.resident.gender;
        this.deliveryLat = this.resident.initialLat
        this.deliveryLng = this.resident.initialLng
        

        // console.log(this.resident.birthday)
        // const newDate = new Date(+this.resident.birthday)
        // console.log(newDate)
        this.birthday = this.resident.birthday
          ? moment(new Date(+this.resident.birthday)).format("YYYY-MM-DD")
          : "";

        // console.log(Date.parse(this.resident.birthday))
        // console.log(moment(new Date(this.resident.birthday)).format("ll"))
        this.mailStrAddress = this.resident.mailStrAddress;
        this.mailCity = this.resident.mailCity;
        this.mailPostalCode = this.resident.mailPostalCode
          ? this.resident.mailPostalCode
          : this.resident.postalCode;
        this.deliveryAddress = this.mailStrAddress + ' ' + this.mailCity + ' ' + this.mailPostalCode
        this.petChoice = this.resident.pet.petName;
        this.myFavoriteFood = [...this.resident.favoriteFood];
        this.myHobbies = [...this.resident.hobbies];
        this.myBelief = this.resident.belief;
      }
    } catch (error) {
      console.error(error);
    }

   

        this.$apollo
            .query({
                query: GET_PICKUP_ADDRESS,
                variables: { vendorName: this.shoppingCart[0].vendor}
            })
            .then(({data}) => {
                const {getPickupAddress} = data
                // console.log(getPickupAddress)
                this.pickupAddressList.push(getPickupAddress)
            })
            .catch(err => console.error(err))
    },


    computed:{
        ...mapGetters(["resident","soughtDeals", "searchCouponLoading", "placeOrderLoading", "vendorInterface"]),

        convertedGold() {
            return Math.round(this.silverToConvert / 1000)
        },

        // tax() {
        //     // console.log(this.shoppingCart)
        //     let tax = 0
        //     // for (let item of this.shoppingCart) {
        //     //     tax = tax + (item.quantity * item.dealPrice > 0 ? item.dealPrice * item.quantity : (item.price - item.discount) * item.quantity)  * item.taxRate
        //     // }

        //     console.log(tax + this.shipping * 0.13)
            
        //     return tax + this.shipping * 0.13
        // },

        totalRewardSilver(){
            if(this.impendingOrder!=null){
                return this.impendingOrder.totalRewardSilver
            } else {
                let total = 0
                this.shoppingCart.map(item => {
                total = total + item.rewardSilver * item.quantity
                })
                // console.log(total )
                return total 
            }
        },


        totalBeforeTax() {
            let total = 0
             this.shoppingCart.map(item => {
            total = total + item.price * item.quantity
         })
        //  console.log(total )
         return total 
        }
        
    },

    watch: {
        deliveryType(val){
            this.errorMessage = ''
            if(val == 'ship'){
            // console.log(this.vendorLat)  
            // console.log(this.vendorLng)  
            // console.log(this.deliveryLat)  
            // console.log(this.deliveryLng)  

                
            const vendorPosition = new this.google.maps.LatLng(this.vendorLat, this.vendorLng);
            const deliveryPosition  = new this.google.maps.LatLng(this.deliveryLat, this.deliveryLng);

            // console.log(vendorPosition)
            // console.log(deliveryPosition)
            // console.log(this.google.maps.geometry.spherical.computeDistanceBetween(vendorPosition, deliveryPosition) / 1000)
            const distance = this.calculateDistance (this.vendorLat, this.vendorLng, this.deliveryLat, this.deliveryLng)
            // console.log(distance)
                if(distance > this.maxDeliveryDistance) {
                    this.errorMessage = 'This Location Is Beyond The Delivery Distance!'
                } else {
                    this.shipping = this.deliveryFees
                }
                //dividing by 1000 to get Kilometers
            } else {
                this.shipping = 0
            }
        },

        isPrepay(val){
            if(val) this.shipping = 0
        },
        soughtDeals(val) {
            // console.log(val)
            if(val.length == 0) {
                this.noAvailableDeals = 'No Available Deals'
            } else {
                this.totalDiscount = 0
                for (let item of val) {
                    const index = this.shoppingCart.findIndex(listItem => listItem.itemCode == item.itemCode )
                    // console.log(index)
                    switch(item.valueType) {
                        case 'CASH_VALUE':
                            const listItem1 = this.shoppingCart[index]
                            // console.log(listItem1)
                            listItem1.dealPrice = item.amount
                            listItem1.discount = listItem1.discount + (this.shoppingCart[index].price - listItem1.dealPrice) 
                            * (this.shoppingCart[index].quantity - (item.isForExceedance ? item.minimalQty : 0))
                            // console.log('value discount', listItem1.discount)
                            this.$set(this.shoppingCart, index, listItem1)
                            this.dealsSoughtTitle.push({title: item.flyerTitle, flyerId: item.flyerId, couponId: item.couponId, oneTimeUsage: item.oneTimeUsage})
                            this.totalDiscount = this.totalDiscount + listItem1.discount
                            this.valueDiscountList.push({itemCode: item.itemCode, dealPrice: item.amount})
                            break;
                        case 'CASH_DISCOUNT':
                            // this.$nextTick(()=> {
                            const listItem = this.shoppingCart[index]
                            // console.log(listItem)
                            listItem.discount =listItem.discount + 
                            (this.shoppingCart[index].quantity - (item.isForExceedance ? item.minimalQty : 0)) * item.amount
                            // this.shoppingCartList.splice(index, 1, listItem)
                            this.$set(this.shoppingCart, index, listItem)

                            this.totalDiscount = this.totalDiscount + 
                            (this.shoppingCart[index].quantity - (item.isForExceedance ? item.minimalQty : 0)) * item.amount
                            // this.shoppingCartList[index].discount = this.shoppingCartList[index].quantity * item.amount
                            this.dealsSoughtTitle.push({title: item.flyerTitle, flyerId: item.flyerId, couponId: item.couponId, oneTimeUsage: item.oneTimeUsage})
                            // })
                           
                            break;
                        case 'PERCENTAGE_DISCOUNT':
                            if(item.isForAllItems) {
                                this.totalDiscount = (this.totalBeforeTax - (item.isForExceedance ? item.minimalAmount : 0)) * item.amount 
                            } else {
                                const listItem2 = this.shoppingCart[index]
                                listItem2.discount = listItem2.discount + 
                                (this.shoppingCart[index].quantity * this.shoppingCart[index].price - (item.isForExceedance ? item.minimalAmount : 0)) * item.amount
                                this.totalDiscount = this.totalDiscount + listItem2.discount
                                this.$set(this.shoppingCart, index, listItem2)
                            }
                            
                            this.dealsSoughtTitle.push({title: item.flyerTitle, flyerId: item.flyerId, couponId: item.couponId, oneTimeUsage: item.oneTimeUsage})
                            break;
                        case 'COMBO_CASH_VALUE':
                            this.comboTotalAmount = item.amount
                            this.totalDiscount = item.amount - this.totalBeforeTax
                            this.dealsSoughtTitle.push({title: item.flyerTitle, flyerId: item.flyerId, couponId: item.couponId, oneTimeUsage: item.oneTimeUsage})
                            break;
                    }
                }
            }
            // console.log(this.totalDiscount)
            // console.log(this.dealsSoughtTitle)
            // console.log(this.shoppingCartList)
        }
    },

    methods: {

     calculateDistance  (lattitude1, longittude1,lattitude2,longittude2)
    {
    
        const toRadian = n => (n * Math.PI) / 180

            let lat2 = lattitude2
            let lon2 = longittude2
            let lat1 = lattitude1
            let lon1 = longittude1

            // console.log(lat1, lon1+"==="+lat2, lon2)
            let R = 6371  // km
            let x1 = lat2 - lat1
            let dLat = toRadian(x1)
            let x2 = lon2 - lon1
            let dLon = toRadian(x2)
            let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            let d = R * c
            // console.log("distance==?",d)
            return d 
      },

        cancelNote(){
            this.note = ''
            this.isNoteWindowOpen = false
        },

        // confirmDistance(){
        //     var p1 = new google.maps.LatLng(20, 9.4);
        //     var p2 = new google.maps.LatLng(60.23, 9.7);

        //     function distanceTwoPoints(p3, p4){
        //     return (google.maps.geometry.spherical.computeDistanceBetween(p3, p4) / 1000); //dividing by 1000 to get Kilometers
        //     }
        // },


        placeOrder() {
           const payload = {
               resident: this.resident.residentName, 
               vendor: this.impendingOrder != null ? this.shoppingCart[0].vendor : this.shoppingCartList[0].vendor, 
               deliveryType: this.deliveryType, 
               customerName: this.resident.firstName + ' ' + this.resident.lastName,
               deliveryAddress: this.deliveryAddress,
               pickupAddress: this.pickupAddressList[0].address, 
               tax: (this.totalBeforeTax - this.totalDiscount + this.shipping) * 0.13,
               totalDiscount: this.totalDiscount,
               totalAmount:  this.totalBeforeTax ,
               silverSpand: this.convertedGold * 1000,
               paymentMethod: this.impendingOrder != null ? this.impendingOrder.paymentMethod : this.payBy,
               impendingOrderNo: this.impendingOrder != null ? this.impendingOrder.orderNo : '',
               dealsTitle: this.impendingOrder != null  ?  this.impendingOrder.dealsTitle.map(item => {
                   return {flyerId: item.flyerId, title: item.title, couponId: item.couponId, oneTimeUsage: item.oneTimeUsage}
               }) : this.dealsSoughtTitle,
               salesOrderItems: [],
               valueDiscountList: this.valueDiscountList,
               note: this.note,
               shipping: this.shipping
           } 

        // console.log(payload)
           this.$store.dispatch("placeOrder", payload)
           this.$store.commit("setShoppingCart", [])
        //    this.$router.go()
        },


        prepay() {
           const payload = {
               resident: this.resident.residentName, 
               vendor: this.shoppingCartList[0].vendor, 
               customerName: this.resident.firstName + ' ' + this.resident.lastName,
               tax: (this.totalBeforeTax - this.totalDiscount + this.shipping) * 0.13,
               totalDiscount: this.totalDiscount,
               totalAmount: this.totalBeforeTax ,
               silverSpand: this.convertedGold * 1000,
               paymentMethod: this.impendingOrder != null ? this.impendingOrder.paymentMethod : this.payBy,
               dealsTitle: this.dealsSoughtTitle,
               valueDiscountList: this.valueDiscountList,
           } 
            this.$store.commit("setPlaceOrderLoading", true)
             this.$apollo
            .mutate({
                mutation: PREPAY,
                variables: payload
            })
            .then(({data}) => {
                const {prepay} = data
                // console.log(prepay)
                 this.$store.commit("setShoppingCart", [])
                 this.$store.commit("setPlaceOrderLoading", false)
                    this.$router.go()
            })
            .catch(err => console.error(err))

        // console.log(payload)
          
        },

        rollbackDeliveryAddress(){
            this.errorMessage = ''
            this.isChangeDeliveryAddress = false
            this.deliveryAddress = this.mailStrAddress + ' ' + this.mailCity + ' ' + this.mailPostalCode
        },

        searchCoupon() {
            this.noAvailableDeals = null
            const orderItems = this.shoppingCartList.map(item => {
                return {
                    itemCode: item.itemCode,
                    quantity: item.quantity,
                    itemTotal: item.price * item.quantity
                }
            })
            const input = {
                orderItems,
                resident: this.resident.residentName,
                vendor: this.shoppingCartList[0].vendor,
                time: Date.now().toString()
            }
            this.$store.dispatch('searchAvailableDeals', {input})
        }
    },

    beforeRouteEnter(to, from , next) {
        // console.log(to)
        // console.log(from)
        if(to.query.shoppingCartList && from.name != null) {
            next()
        } else {
            next({path: '/shoppingCart'})
        }
        
    }
}
</script>

<style lang="scss" scoped>
.fade-down-enter,
.fade-down-enter-active {
  transition: all 0.5s ease;
}
.fade-down-leave-active {
  transition: all 4s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>
