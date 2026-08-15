<template>
    <v-card outlined flat>
          <v-sheet
          color="primary"
          dark
          rounded
          class="d-flex flex-row justify-space-around align-center flex-wrap pa-5"
        >
         <span class="ma-1 d-inline-block text-h6 font-weight-bold">Customer Paid: &nbsp;{{settlement.customerPaid | format-currency-amount}}</span>
         <span class="ma-1 d-inline-block text-h6 font-weight-bold">Boundary Charge: &nbsp;{{settlement.boundaryCharge| format-currency-amount}}</span>
         <span class="ma-1 d-inline-block text-h6 font-weight-bold">Funds held by Boundary: &nbsp;{{settlement.funds | format-currency-amount}}</span>
         <span class="ma-1 d-inline-block text-h6 font-weight-bold"><v-icon color="yellow" size="24" >mdi-coin</v-icon>
             &nbsp;Boundary Gold: &nbsp;{{vendor.goldCoins| format-int-amount}}&nbsp;
             <v-btn icon @click="redeemGold">
                 <v-icon color="white" size="24" >mdi-swap-horizontal-circle</v-icon>
             </v-btn>
             </span>
         <span class="ma-1 d-inline-block text-h6 font-weight-bold"><v-icon color="white" size="24" >mdi-coin</v-icon>&nbsp;Boundary Silver: &nbsp;{{vendor.silverCoins| format-int-amount}}&nbsp;
             <v-icon color="white" size="24" @click="purchaseSilver">mdi-cash-multiple</v-icon>
         </span>
        </v-sheet>
        <v-card-text>
            <v-simple-table
                fixed-header
                :height="viewPortDimension.height * 0.38"
            >
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">
                        Order
                    </th>
                    <th class="text-left">
                        Date
                    </th>
                    <th class="text-left">
                        Customer Paid($)
                    </th>
                    <th class="text-left">
                        Boundary Charge($)
                    </th>
                    <th class="text-left">
                        Reward To Customer( silver )
                    </th>
                    <th class="text-left">
                        Funds Held($)
                    </th>
                    <th class="text-left">
                        Gold Collect
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                    v-for="item in vendorSettlementOrdersSorted"
                    :key="item.salesOrderNo"
                    >
                    <td>{{ item.salesOrderNo }}</td>
                    <td>{{ item.date | convert-date }}</td>
                    <td>{{ item.amountPaidByCustomer |  format-amount}}</td>
                    <td>{{ item.amountPaidToBoundary |  format-amount}}</td>
                    <td>{{Math.round((item.boundaryPayable - item.amountPaidToBoundary) * 1000) |  format-int-amount}}</td>
                    <td>{{ (item.amountPaidByCustomer - item.boundaryPayable )|  format-amount}}</td>
                    <td>{{ item.boundaryGold |  format-int-amount}}</td>
                    </tr>
                </tbody>
                </template>
            </v-simple-table>
        </v-card-text>

    <!-- Redeem Gold -->
        <v-dialog v-model="isRedeemGoldOpen" v-if="vendor.goldCoins>0" max-width="500">
            <v-card width="500">
                <v-toolbar dark color="primary" flat>
                    <v-toolbar-title>Exchange Gold</v-toolbar-title>
                </v-toolbar>
                <v-card-text >
                     <v-row class="justify-center align-center flex-row d-flex" no-gutters>
                                <v-spacer/>
                                    <span class="accent--text">(1 gold = 1 $)</span>
                                   
                                    <span class="mx-1"><v-icon class="mr-1" color="yellow">mdi-coin</v-icon>{{(vendor.goldCoins - goldToRedeem) | format-int-amount}}</span>
                                    <v-slider
                                        :max="vendor.goldCoins"
                                        v-model="goldToRedeem"
                                        class="mt-5 d-inline-block"
                                        step="50"
                                        width="300"
                                    ></v-slider>
                                    <span><v-icon class="mr-1" >mdi-cash-multiple</v-icon>{{goldToRedeem | format-currency-amount}}</span>
                                   
                                    <v-spacer/>
                            </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn depressed  color="primary" @click="confirmRedeem" :disabled="goldToRedeem==0">Confirm</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

    <!-- Purchase Silver -->
        <v-dialog v-model="isPurchaseSilverOpen"  max-width="800">
            <v-card width="800">
                 <v-toolbar dark color="primary" flat>
                    <v-toolbar-title>Purchase Silver&nbsp;($1 = 1000 Silver)</v-toolbar-title>
                </v-toolbar>
                <v-card-text class="mt-8">
                    <v-row >
                        <v-col cols="8">
                            <v-select
                                label="Silver Amount"
                                v-model="purchaseAmount"
                                outlined
                                :items="silverPurchaseList">
                                <template v-slot:selection="{ item }">
                                    <span>{{ item | format-int-amount}}</span>
                                </template>
                            </v-select> 
                        </v-col>

                        <v-col cols="4">
                            <span v-if="purchaseAmount" class="text-h6 font-weight-bold accent--text">Price:&nbsp;{{silverPrice | format-currency-amount}}</span> 
                        </v-col>
                    </v-row>
                
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text>
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
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn depressed  color="primary" @click="confirmPurchase" :disabled="!purchaseAmount">Confirm</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>

       <v-snackbar
        v-model="snackbar"
        centered
        dark
        color="primary"
        class="pa-3"
        timeout="3000"
        >
        <span class="text-h6 font-weigth-bold text-center d-block">{{snackbarInfo}}</span>
     </v-snackbar>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
    name: 'VendorSettlementRecords',
    data(){
        return {
            goldToRedeem: 0,
            isRedeemGoldOpen: false,
            isPurchaseSilverOpen: false,
            purchaseAmount: null,
            silverToPurchase: 0,
            snackbar: false,
            snackbarInfo: '',
            silverPurchaseList:[5000, 10000, 20000, 5000, 100000, 200000, 500000, 1000000, 10000000],
            payBy: 'creditcard'
        }
    },
    computed: {
        ...mapGetters(["vendorSettlementRecords", "vendor", "viewPortDimension"]),

        silverPrice(){
           
            return this.purchaseAmount / 1000
        },

        settlement(){
            let funds = 0
            let customerPaid = 0
            let boundaryCharge = 0
            for(let record of this.vendorSettlementRecords){
                funds += (record.amountPaidByCustomer - record.boundaryPayable)
                customerPaid += record.amountPaidByCustomer 
                boundaryCharge += record.amountPaidToBoundary
            }
            return {funds, customerPaid, boundaryCharge }
        },

        vendorSettlementOrdersSorted(){
            console.log(this.vendorSettlementRecords)
      return _.orderBy(this.vendorSettlementRecords, ['date'], ['desc'])
    }

    },

    methods: {
        confirmRedeem(){
            this.isRedeemGoldOpen = false
            this.vendor.goldCoins -= this.goldToRedeem
            this.snackbarInfo = new Intl.NumberFormat('en-US', 
            { style: 'currency', 
            currency: 'USD', 
            maximumFractionDigits: 2, 
            minimumFractionDigits: 2,
            //   roundingIncrement: 5  
            }).format(this.goldToRedeem).toString() + ' will be deposited to your bank account in 10 business days'
            this.snackbar = true
            this.$store.commit('setVendor', this.vendor) 
        },

        confirmPurchase(){
            this.isPurchaseSilverOpen = false
            this.vendor.silverCoins += this.purchaseAmount
            this.snackbarInfo = 'You purchased ' + new Intl.NumberFormat('en-US', {  maximumFractionDigits: 0, minimumFractionDigits: 0,
                                roundingIncrement: 5  }).format(this.purchaseAmount).toString() + ' boundary silver'
            this.snackbar = true
            this.$store.commit('setVendor', this.vendor) 
        },

        redeemGold(){
            this.goldToRedeem = 0
            this.isRedeemGoldOpen = true
        },
        purchaseSilver(){
            this.purchaseAmount = 0
            this.isPurchaseSilverOpen = true
        },
    }
}
</script>
