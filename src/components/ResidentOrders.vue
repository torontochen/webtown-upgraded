<template>
  <v-container class="mb-5">
    <v-data-iterator
      :items="residentOrders"
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
      :sort-by="sortBy"
      :search="searchStatus"
      :sort-desc="sortDesc"
      hide-default-footer
      v-if="residentOrders.length>0"
    >
      <template v-slot:header>
        <v-toolbar dark flat dense rounded color="primary" class="mb-1">
          <v-toolbar-title class="text-h6">Orders</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="searchStatus"
            clearable
            flat
            dense
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="sortDesc" mandatory>
              <v-btn small depressed color="primary lighten-1" :value="false">
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn small depressed color="primary lighten-1" :value="true">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="(item, i) in props.items"
            :key="i"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <!-- iterated items -->
            <v-card class="pa-0" @click="showOrderDetails(item)">
              <v-card-title>
                <v-img :src="item.orderItems[0].photo" contain v-if='item.orderItems.length>0'></v-img>
              </v-card-title>
              <v-card-text>
                <v-col>
                  <span class="d-block fontColor--text  font-weight-bold text-caption  " 
                    >Order: &nbsp;{{ item.orderNo }}</span
                  ><br />
                  <span class="d-block fontColor--text text-body-2">Sold by: &nbsp;{{ item.vendor }}</span
                  ><br />
                  <span class="d-block fontColor--text text-body-2" v-if="item.deliveryType == 'pickup'"
                    >Pick Up at: &nbsp;{{ item.pickupAddress }}</span
                  >
                  <span class="d-block fontColor--text text-body-2" v-else
                    >Ship to: &nbsp;{{ item.deliveryAddress }}</span
                  ><br />
                  <span class="fontColor--text text-body-2"
                    >{{
                      totalItemCount(item.orderItems)
                    }}&nbsp;item{{totalItemCount(item.orderItems)>1?'s':' '}}</span><br/>
                  <span class="accent--text text-body-2 text-center" v-if="item.impending&&!item.isCanceled">
                    Impending Order&nbsp;&nbsp;<v-btn icon color="accent" @click.stop="finalizeOrder(item)"><v-icon>mdi-pencil-box</v-icon></v-btn></span><br/>
                <v-btn x-small text plain color="primary" v-if="item.isGameSubstitueBuy" >game purchase</v-btn>
                </v-col>
              </v-card-text>
              <v-card-actions>
                <!-- <v-spacer></v-spacer> -->
                <span class="fontColor--text text--darken-2 text-caption ml-3"
                  >{{
                    item.date|convert-customer-rating-time
                  }}&nbsp;
                <v-btn x-small text plain color="primary" v-if="canCancel(item)&&!item.isGameSubstitueBuy" @click.stop="cancel(item)">Cancel</v-btn>
                <v-btn x-small text plain color="primary" v-if="!canCancel(item)&&!item.impending&&!item.isGameSubstitueBuy&&!item.isUnderDispute&&!item.isCanceled" @click.stop="dispute(item)">Dispute</v-btn>
                <v-btn x-small text plain color="primary" v-if="!canCancel(item)&&!item.impending&&!item.isGameSubstitueBuy&&item.isUnderDispute&&!item.isCanceled" @click.stop="cancelDispute(item)">Cancel Dispute</v-btn>
                <v-btn x-small text plain color="secondary" v-if="item.isConfirmed" >Confirmed</v-btn>
                <v-btn x-small text plain color="secondary" v-if="item.isConfirmed&&item.isFood" >Filled</v-btn>
                <v-btn x-small text plain color="accent" v-if="item.isCanceled" >Canceled</v-btn></span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="mt-2" align="center" justify="center">
          <v-spacer></v-spacer>

          <span class="mr-4 grey--text">
            Page {{ page }} of {{ numberOfPages }}
          </span>
          <v-btn
            fab
            dark
            depressed
            color="primary"
            class="mr-1"
            @click="formerPage"
            small
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            small
            fab
            depressed
            dark
            color="primary"
            class="ml-1"
            @click="nextPage"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>

    <!-- order item details -->
    <OrderItemDetails
      v-model="showDetails"
      @close="showDetails = false"
      :orderDetails="orderDetails"
      :silverRecord="silverRecord"
      type="resident"
    />

     <!-- Dispute -->
    <v-dialog v-model="isDisputeOpen" max-width="700" v-if="disputeOrder!=null">
       <v-card
        max-width="700"
        class="mx-auto"

      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>Dispute Order</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="sendDispute" :disabled="disputeContent == ''">
            <v-icon size="30">mdi-send-outline</v-icon>
          </v-btn>
        </v-toolbar>
       
        <v-card-subtitle class="accent--text text-subtitle-1 mt-3" >From:&nbsp;{{disputeOrder.vendor}}</v-card-subtitle>
       <v-card-text>
          <v-text-field
          label="Title"
          dense
          type="text"
          v-model="disputeTitle"
          clearable
        >
        </v-text-field>
       </v-card-text>
        <v-card  flat >
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="disputeContent"
                filled
                placeholder="Text"
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
        </v-card>

      </v-card>
    </v-dialog>


     <!-- Cancel -->
    <v-dialog v-model="isCancelOpen" max-width="700" v-if="orderToCancel!=null">
       <v-card
        max-width="700"
        class="mx-auto"

      >
        <v-toolbar
          color="primary lighten-1"
          dark
          dense
          flat
        >
          <v-toolbar-title class="text-subtitle-2">Cancel Order&nbsp;{{orderToCancel.orderNo}} </v-toolbar-title>
        </v-toolbar>
       
     <v-card-text>
        <v-col class="ma-auto">
         
         
          <span class="ma-1 d-block text-right fontColor--text text--darken-1 text-subtitle-2 font-weight-bold"
            >subtotal:&nbsp;{{
              
                      (orderToCancel.totalAmount -  orderToCancel.totalDiscount ) | format-currency-amount

            }}</span>
         
         
          <span class="ma-1 d-block text-right fontColor--text text--darken-1 text-subtitle-2 font-weight-bold"
            >shipping:&nbsp;{{ 
             
                      (orderToCancel.shipping) | format-currency-amount
              }}</span>
         
          <span class="ma-1 d-block text-right fontColor--text text--darken-1 text-subtitle-2 font-weight-bold"
            >tax:&nbsp;{{ 
             
                      (orderToCancel.tax + orderToCancel.shipping * 0.13) | format-currency-amount
              }}</span>
         
          <span class="ma-1 d-block text-right accent--text text--darken-1 text-subtitle-2 font-weight-bold"
            >total:&nbsp;{{ 
                      (orderToCancel.totalAmount-orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13) | format-currency-amount
              }}</span>
         
          <!-- <v-spacer></v-spacer><span>Paid By:&nbsp;${{orderDetails.totalAmount.toFixed(2)}}</span> -->
          <v-toolbar dark dense flat height="30" rounded color="primary lighten-2"
            >
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center" 
              >Refund
              </v-toolbar-title>
            <v-spacer></v-spacer>
              </v-toolbar>
          <span class=" d-block ma-1 text-right secondary--text text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Converted From Payment:&nbsp;{{
                     Math.round((orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13)* 1000 - orderToCancel.silverSpand) | format-int-amount
            }}</span>
          <span class=" d-block ma-1 text-right secondary--text text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Spand:&nbsp;{{
                      (orderToCancel.silverSpand) | format-int-amount
            }}</span>
          <span class=" d-block ma-1 text-right warning--text text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Rewarded After Deduction:&nbsp;-&nbsp;{{
                    Math.round(orderToCancel.totalRewardSilver * 1.1) | format-int-amount
            }}</span>
          <span class="ma-1 d-block text-right warning--text text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Cancellation Fees&nbsp;-&nbsp;{{
                      Math.round(cancelFees) * 1000 | format-int-amount
            }}</span>
          <span class="ma-1 d-block text-right secondary--text text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Refund&nbsp;{{
                      Math.round((orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13)* 1000 - orderToCancel.totalRewardSilver * 1.1 - cancelFees * 1000) | format-int-amount
            }}</span>
          <span class="ma-1 d-block text-right warning--text text-caption" v-if="!orderToCancel.silverSpand>0&&!orderToCancel.totalRewardSilver>0"
            >Cancellation Fees&nbsp;-&nbsp;{{
                      (cancelFees) | format-currency-amount
            }}</span>
          <span class="ma-1 d-block text-right secondary--text text-caption" v-if="!orderToCancel.silverSpand>0&&!orderToCancel.totalRewardSilver>0"
            >Refund&nbsp;{{
                      (orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13 - cancelFees) | format-currency-amount
            }}&nbsp;To&nbsp;{{ orderToCancel.paymentMethod }}</span>
          
          
          <v-divider class="mb-3"></v-divider>
          <v-row  class="text-capiton pa-3">
            <p>Money Refund will take up to 15 business days to appear in your account.All Boundary Silver Reward from  will be deducted
            </p>
          </v-row>

        </v-col>
      </v-card-text>
      <v-card-actions >
        <v-spacer></v-spacer>
        <v-btn small depressed  color="primary" @click="confirmCancel" class="mb-3">confirm</v-btn>
        <v-btn  small text  plain  color="primary" @click="cancelCancel" class="mb-3">abort</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
        

      </v-card>
    </v-dialog>

  <!-- No Order Image -->
     <v-card flat  class="pa-2 mt-4" style="height: 100%; width: 100%;" v-if="residentOrders.length==0">
            <v-card-text>
                <!-- <v-img src="/images(2).jpeg" max-height="200" max-width="200"></v-img> -->
                <!-- <v-img src="/images.jpeg" max-height="200" max-width="200"></v-img> -->
              <v-img src="https://www.animatedimages.org/data/media/1802/animated-office-worker-image-0071.gif" height="200" contain width="200" class="ma-auto"></v-img>
              <v-row class="mt-5">
                  <span class="text-h3 shade4--text font-weight-bold mx-auto">Ordering ...</span>
              </v-row>
            </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from "vuex";
import OrderItemDetails from "./OrderItemDetails.vue";
import {GET_VENDOR_CHECKOUT_INFOS} from "../queries/queries_query"
import {DISPUTE, CANCEL} from "../queries/queries_mutation"
import { ORDER_STATUS_CHANGED } from "../queries/queries_subscription"

export default {
  name: "ResidentOrders",
  components: {
    OrderItemDetails,
  },
  data() {
    return {
      disputeContent: '',
      disputeTitle: '',
      disputeOrder: null,
      isDisputeOpen: false,
      itemsPerPage: 12,
      isCancelOpen: false,
      orderDetails: null,
      orderToCancel: null,
      page: 1,
      search: "",
      searchStatus: "",
      showDetails: false,
      silverRecord: null,
      sortDesc: true,
      sortBy: "date",
    }
  },

  apollo: {
    $subscribe: {
      // orderStatusChanged:{
      //   query: ORDER_STATUS_CHANGED,
      //   result({data}) {
      //     console.log(data)
      //     const { orderStatusChanged: {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled} } = data
      //     if(this.resident.residentName == resident) {
      //       const index = this.residentOrders.findIndex(item => item.orderNo == orderNo )
      //       if(index >= 0) {
      //         const orders = [...this.residentOrders]
      //         orders[index].isCanceled = isCanceled
      //         orders[index].isUnderDispute = isUnderDispute
      //         orders[index].isConfirmed = isConfirmed
      //         orders[index].disputeInfo = content
      //         console.log(orders)
      //         this.$store.commit('setResidentOrders', orders)
      //       }
      //     }
      //     }
      //   }
      }
    },

  computed: {
    ...mapGetters(["residentOrders", "viewPortDimension", "resident"]),

    numberOfPages() {
      return Math.ceil(this.residentOrders.length / this.itemsPerPage);
    },
    cancelFees(){

      if(this.orderToCancel != null){
        const { totalAmount, isConfirmed, isFood, deliveryType, totalDiscount } = this.orderToCancel
         if ( isConfirmed && isFood && deliveryType == 'ship') {
        return (totalAmount - totalDiscount) * 0.5 
      } else if (isConfirmed && isFood && deliveryType == 'pickup'){
        return (totalAmount - totalDiscount) * 0.2
        // - this.orderToCancel.tax) * 0.035 * 0.1
      } else {
        return  0
      }
      }
      
     
      
    } 
  },
  methods: {
    canCancel(item){
      const startTime = moment(new Number(item.date))
      const endTime = moment(Date.now())
      console.log(endTime.diff(startTime, 'hours'))
      return endTime.diff(startTime, 'hours') < 8 && !item.isCanceled
      // && item.isFood
    },

    cancel(item){
      this.orderToCancel = item
      this.isCancelOpen = true
    },

    cancelCancel(){
      this.orderToCancel = null
      this.isCancelOpen = false
    },

    confirmCancel(){
      const payload = {
        vendor: this.orderToCancel.vendor,
        resident: this.orderToCancel.resident,
        orderNo: this.orderToCancel.orderNo,
        content: this.orderToCancel.disputeInfo,
        isUnderDispute: this.orderToCancel.isUnderDispute,
        isConfirmed: this.orderToCancel.isConfirmed,
        isCanceled: true
      }
      const index = this.residentOrders.findIndex(item => item.orderNo == this.orderToCancel.orderNo)
      const orders = [...this.residentOrders]
      orders[index].isCanceled = true
      this.$store.commit('setResidentOrders', orders)
      this.isCancelOpen = false
      this.$apollo
        .mutate({
          mutation: CANCEL,
          variables: payload
        })
        .then(({data})=>{
          const { cancel } = data
          console.log(cancel)
        })
        .catch(err => console.error(err))
    },

    dispute(order) {
      this.disputeContent = ''
      this.disputeOrder = order
      this.disputeTitle = 'Dispute' + ' ' + order.orderNo
      this.isDisputeOpen = true
    },

    finalizeOrder(order){
       this.$apollo
            .query({
                query: GET_VENDOR_CHECKOUT_INFOS,
                variables: { vendor: order.vendor}
            })
            .then(({data}) => {
                const {getVendorCheckoutInfos: {lat, lng, deliveryFees, maxDeliveryDistance}} = data

                const impendingOrder = {...order, lat, lng, deliveryFees, maxDeliveryDistance}

             this.$router.push({name:'checkout', query: {shoppingCartList: [], impendingOrder}})

                
            })
            .catch(err => console.error(err))

            
    },

    formerPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    },

    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },

    cancelDispute(order){
      const payload = {
        vendor: order.vendor,
        resident: order.resident,
        orderNo: order.orderNo,
        content: '',
        isUnderDispute: false,
        isConfirmed: order.isConfirmed,
        isCanceled: order.isCanceled
      }
      const index = this.residentOrders.findIndex(item => item.orderNo == order.orderNo)
      const orders = [...this.residentOrders]
      orders[index].isUnderDispute = false
      this.$store.commit('setResidentOrders', orders)
      this.$apollo
        .mutate({
          mutation: DISPUTE,
          variables: payload
        })
        .then(({data})=>{
          const { dispute } = data
          console.log(dispute)
        })
        .catch(err => console.error(err))
    },

    sendDispute(){
      const payload = {
        vendor: this.disputeOrder.vendor,
        resident: this.disputeOrder.resident,
        orderNo: this.disputeOrder.orderNo,
        content: this.disputeContent,
        isUnderDispute: true,
        isConfirmed: this.disputeOrder.isConfirmed,
        isCanceled: this.disputeOrder.isCanceled
      }
      this.isDisputeOpen = false
       const index = this.residentOrders.findIndex(item => item.orderNo == this.disputeOrder.orderNo)
      const orders = [...this.residentOrders]
      orders[index].isUnderDispute = true
      this.$store.commit('setResidentOrders', orders)
      this.$apollo
        .mutate({
          mutation: DISPUTE,
          variables: payload
        })
        .then(({data})=>{
          const { dispute } = data
          console.log(dispute)
        })
        .catch(err => console.error(err))
    },

    showOrderDetails(item) {
      if(item.impending) return
      this.orderDetails = item;
      const index = _.findIndex(this.resident.silverRecords, (record) => {
        return record.orderNo == item.orderNo;
      });
      if (index > 0) {
        this.silverRecord = this.resident.silverRecords[index];
      }

      console.log(this.orderDetails);
      this.showDetails = true;
    },

    totalItemCount(items) {
      let count = 0;
      items.map((item) => {
        count = count + item.quantity;
      });
      return count;
    },
  }
}
</script>