<template>
  <v-dialog
    v-model="orderItemDialog"
    :max-width="viewPortDimension.width * 0.55"
    persistent
    v-if="orderDetails"
  >
    <v-card class="pa-3">
      <v-card-title class="text-accent text-subtitle-2 font-weight-bold  mx-3" >Order:&nbsp;{{ orderDetails.orderNo }}</v-card-title>
      
      <v-card-text>
        <v-col class="ma-auto">
          <v-divider class="mb-2"/>
          <!-- order details -->
          <v-row v-for="(item, i) in orderDetails.orderItems" :key="i">
            <v-col cols="2">
              <v-img
                :src="item.photo"
                width="60"
                height="60"
                v-if="type == 'resident'"
              ></v-img>
              <v-card-subtitle
                class="text-fontColor text-body-2"
                v-else
                >{{ item.itemCode }}</v-card-subtitle
              >
            </v-col>
            <v-col cols="5" 
              >
              <v-card-subtitle
                class="text-fontColor text-left text--darken-2 text-body-2 font-weight-medium text-truncate"
                >
                {{ item.description }}
                </v-card-subtitle
              ></v-col
            >
            <v-col cols="2"
              ><v-card-subtitle
                class="text-fontColor text-body-2 font-weight-medium"
                >${{ item.unitPrice.toFixed(2) }}</v-card-subtitle
              ></v-col
            >
            <v-col cols="1"
              ><v-card-subtitle
                class="text-fontColor text-body-2 font-weight-medium"
                >{{ item.quantity }}</v-card-subtitle
              ></v-col
            >
            <v-col cols="2"
              ><v-card-subtitle
                class="text-fontColor text-body-2 font-weight-bold"
                >{{ $filters.formatCurrencyAmount(item.quantity * item.unitPrice) }}</v-card-subtitle
              ></v-col
            >

          </v-row>
          <v-divider class="my-1"></v-divider>
            <span class="ma-1 text-red d-block text-center  text-subtitle-2" v-if="orderDetails.dealsTitle&&orderDetails.dealsTitle.length>0">{{orderDetails.dealsTitle[0].title}}</span>
           <span class="ma-1 text-red d-block text-right  text-subtitle-2" v-if="orderDetails.totalDiscount>0"
            >{{type=='vendor'?'discount':'you save'}}:&nbsp;-{{ $filters.formatCurrencyAmount(orderDetails.totalDiscount) }}</span
          >
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >subtotal:&nbsp;{{ $filters.formatCurrencyAmount(orderDetails.totalAmount -  orderDetails.totalDiscount) }}</span
          >
         
        
         
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >shipping:&nbsp;{{ $filters.formatCurrencyAmount(orderDetails.shipping) }}</span
          >
         
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >tax:&nbsp;{{ $filters.formatCurrencyAmount(orderDetails.tax) }}</span
          >
         
          <span class="ma-1 d-block text-right text-accent text-subtitle-2 font-weight-bold"
            >total:&nbsp;{{ $filters.formatCurrencyAmount((orderDetails.totalAmount -  orderDetails.totalDiscount  + orderDetails.shipping ) *1.13) }}</span
          >
         
          <!-- <v-spacer></v-spacer><span>Paid By:&nbsp;${{orderDetails.totalAmount.toFixed(2)}}</span> -->
          <v-toolbar theme="dark" density="compact" flat height="30" rounded color="primary"
            >
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center" 
              >Payment
              </v-toolbar-title>
            <v-spacer></v-spacer>
              </v-toolbar>
          <span class=" d-block ma-1 text-right text-fontColor" v-if="type == 'vendor'"
            >Boundary Gold:&nbsp;{{ $filters.formatIntAmount(vendorSettlement.boundaryGold) }}</span
          >
          <span class=" d-block ma-1 text-right text-fontColor" v-else
            >Boundary Silver:&nbsp;{{ $filters.formatIntAmount(silverRecord ? silverRecord.amountSpand : 0) }}</span
          >
          <span class="ma-1 d-block text-right text-fontColor" v-if="type == 'vendor'"
            >Customer&nbsp;Paid&nbsp;{{ $filters.formatCurrencyAmount(vendorSettlement.amountPaidByCustomer) }}&nbsp;by&nbsp;<i class="text-accent">{{ orderDetails.paymentMethod }}</i></span
          >
          <span class="ma-1 d-block text-right text-fontColor" v-else
            >Paid&nbsp;{{ $filters.formatCurrencyAmount(silverRecord ? orderDetails.totalAmount -  orderDetails.totalDiscount +  orderDetails.tax + orderDetails.shipping  - silverRecord.amountSpand / 1000
                : orderDetails.totalAmount -  orderDetails.totalDiscount +  orderDetails.tax  + orderDetails.shipping) }}&nbsp;by&nbsp;<i class="text-accent">{{ orderDetails.paymentMethod }}</i></span
          >
          <span class="my-1 d-block text-right text-fontColor" v-if="type == 'vendor'"
            >Boundary Payable:&nbsp;{{ $filters.formatCurrencyAmount(vendorSettlement.boundaryPayable) }}</span
          >
          <span class="my-1 d-block text-right text-fontColor" v-else
            >Boundary Silver Earned:&nbsp;{{ $filters.formatIntAmount(orderDetails.totalRewardSilver) }}</span
          >

       
          <v-row v-if="orderDetails.note!=''" class="text-body-1 my-3">
            Note: &nbsp;{{orderDetails.note}}
          </v-row>
          <v-divider class="mb-3" v-if="orderDetails.isUnderDispute"></v-divider>
          <v-row v-if="orderDetails.isUnderDispute" class="text-capiton pa-3 text-warning my-2">
            <p>Dispute:&nbsp;{{orderDetails.disputeInfo}}
            </p>
          </v-row>
          <v-row v-if="orderDetails.isFulfilled && type == 'vendor'" class="text-capiton pa-3 my-2">
            <v-card outlined style="width: 100%;">
              <v-card-text>
                Fulfilled:&nbsp;{{orderDetails.fulfillNote}}
              </v-card-text>
              
            </v-card>
          </v-row>
          <v-divider class="mb-3"></v-divider>
          <v-row v-if="type != 'vendor'" class="text-capiton pa-3">
            <p>You have 8 hours to cancel order ( game purchase does not apply, food & restaurant order may generate Fees) and 10 days to dispute order .Any Boundary Silver involved 
              transcation is only eligible for refund of equivalent Boundary Silver conversion in case of final return. 
            </p>
          </v-row>


        </v-col>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text"   color="primary" @click="$emit('close')">close</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../store/store";

export default {
  name: "OrderItemDetails",
  props: ["value", "orderDetails", "vendorSettlement", "type", "silverRecord"],

  data() {
    return {};
  },

  computed: {
    ...mapState(useMainStore, ["viewPortDimension"]),

    orderItemDialog() {
      return this.value;
    },
  },
};
</script>