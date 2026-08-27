<template>
  <v-container class="mb-5">
    <v-data-iterator
      :items="residentOrders"
      :items-per-page="itemsPerPage"
      @update:items-per-page="itemsPerPage = $event"
      :page="page"
      @update:page="page = $event"
      :sort-by="sortByV3"
      :search="searchStatus"
      v-if="residentOrders.length>0"
    >
      <template v-slot:header>
        <v-toolbar theme="dark" flat density="compact" rounded color="primary" class="mb-1">
          <v-toolbar-title class="text-h6">Orders</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field variant="solo"
            v-model="searchStatus"
            clearable
            flat density="compact" -inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.display.mdAndUp">
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="sortDesc" mandatory>
              <v-btn variant="flat" size="small"  color="primary" :value="false">
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn variant="flat" size="small"  color="primary" :value="true">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="({ raw: item }, i) in props.items"
            :key="i"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <!-- iterated items -->
            <v-card class="pa-0" @click="showOrderDetails(item)">
              <v-card-title>
                <!-- orderItems comes back null for older orders. Vue 2
                     swallowed the resulting render error and carried on; Vue 3
                     propagates it, so this one expression blanked the whole
                     Orders page. -->
                <v-img
                  v-if="item.orderItems && item.orderItems.length > 0"
                  :src="item.orderItems[0].photo"
                ></v-img>
              </v-card-title>
              <v-card-text>
                <v-col>
                  <span class="d-block text-fontColor  font-weight-bold text-caption  " 
                    >Order: &nbsp;{{ item.orderNo }}</span
                  ><br />
                  <span class="d-block text-fontColor text-body-2">Sold by: &nbsp;{{ item.vendor }}</span
                  ><br />
                  <span class="d-block text-fontColor text-body-2" v-if="item.deliveryType == 'pickup'"
                    >Pick Up at: &nbsp;{{ item.pickupAddress }}</span
                  >
                  <span class="d-block text-fontColor text-body-2" v-else
                    >Ship to: &nbsp;{{ item.deliveryAddress }}</span
                  ><br />
                  <span class="text-fontColor text-body-2"
                    >{{
                      totalItemCount(item.orderItems)
                    }}&nbsp;item{{totalItemCount(item.orderItems)>1?'s':' '}}</span><br/>
                  <span class="text-accent text-body-2 text-center" v-if="item.impending&&!item.isCanceled">
                    Impending Order&nbsp;&nbsp;<v-btn icon color="accent" @click.stop="finalizeOrder(item)"><v-icon>mdi-pencil-box</v-icon></v-btn></span><br/>
                <v-btn variant="text" x-small  color="primary" v-if="item.isGameSubstitueBuy" >game purchase</v-btn>
                </v-col>
              </v-card-text>
              <v-card-actions>
                <!-- <v-spacer></v-spacer> -->
                <span class="text-fontColor text-caption ml-3"
                  >{{ $filters.convertCustomerRatingTime(item.date) }}&nbsp;
                <v-btn variant="text" x-small  color="primary" v-if="canCancel(item)&&!item.isGameSubstitueBuy" @click.stop="cancel(item)">Cancel</v-btn>
                <v-btn variant="text" x-small  color="primary" v-if="!canCancel(item)&&!item.impending&&!item.isGameSubstitueBuy&&!item.isUnderDispute&&!item.isCanceled" @click.stop="dispute(item)">Dispute</v-btn>
                <v-btn variant="text" x-small  color="primary" v-if="!canCancel(item)&&!item.impending&&!item.isGameSubstitueBuy&&item.isUnderDispute&&!item.isCanceled" @click.stop="cancelDispute(item)">Cancel Dispute</v-btn>
                <v-btn variant="text" x-small  color="secondary" v-if="item.isConfirmed" >Confirmed</v-btn>
                <v-btn variant="text" x-small  color="secondary" v-if="item.isConfirmed&&item.isFood" >Filled</v-btn>
                <v-btn variant="text" x-small  color="accent" v-if="item.isCanceled" >Canceled</v-btn></span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="mt-2" align="center" justify="center">
          <v-spacer></v-spacer>

          <span class="mr-4 text-grey">
            Page {{ page }} of {{ numberOfPages }}
          </span>
          <v-btn variant="flat" icon
            theme="dark" 
            color="primary"
            class="mr-1"
            @click="formerPage" size="small"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn variant="flat" size="small" icon 
            theme="dark"
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
          color="primary"
          theme="dark"
        >
          <v-toolbar-title>Dispute Order</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="sendDispute" :disabled="disputeContent == ''">
            <v-icon size="30">mdi-send-outline</v-icon>
          </v-btn>
        </v-toolbar>
       
        <v-card-subtitle class="text-accent text-subtitle-1 mt-3" >From:&nbsp;{{disputeOrder.vendor}}</v-card-subtitle>
       <v-card-text>
          <v-text-field
          label="Title" density="compact"
          type="text"
          v-model="disputeTitle"
          clearable
        >
        </v-text-field>
       </v-card-text>
        <v-card  flat >
          <v-card-text>
              <v-textarea variant="filled"
                shaped
                auto-grow
                v-model="disputeContent" 
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
          color="primary"
          theme="dark"
          density="compact"
          flat
        >
          <v-toolbar-title class="text-subtitle-2">Cancel Order&nbsp;{{orderToCancel.orderNo}} </v-toolbar-title>
        </v-toolbar>
       
     <v-card-text>
        <v-col class="ma-auto">
         
         
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >subtotal:&nbsp;{{ $filters.formatCurrencyAmount(orderToCancel.totalAmount -  orderToCancel.totalDiscount) }}</span>
         
         
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >shipping:&nbsp;{{ $filters.formatCurrencyAmount(orderToCancel.shipping) }}</span>
         
          <span class="ma-1 d-block text-right text-fontColor text-subtitle-2 font-weight-bold"
            >tax:&nbsp;{{ $filters.formatCurrencyAmount(orderToCancel.tax + orderToCancel.shipping * 0.13) }}</span>
         
          <span class="ma-1 d-block text-right text-accent text-subtitle-2 font-weight-bold"
            >total:&nbsp;{{ $filters.formatCurrencyAmount(orderToCancel.totalAmount-orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13) }}</span>
         
          <!-- <v-spacer></v-spacer><span>Paid By:&nbsp;${{orderDetails.totalAmount.toFixed(2)}}</span> -->
          <v-toolbar theme="dark" density="compact" flat height="30" rounded color="primary"
            >
            <v-spacer></v-spacer>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center" 
              >Refund
              </v-toolbar-title>
            <v-spacer></v-spacer>
              </v-toolbar>
          <span class=" d-block ma-1 text-right text-secondary text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Converted From Payment:&nbsp;{{ $filters.formatIntAmount(Math.round((orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13)* 1000 - orderToCancel.silverSpand)) }}</span>
          <span class=" d-block ma-1 text-right text-secondary text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Spand:&nbsp;{{ $filters.formatIntAmount(orderToCancel.silverSpand) }}</span>
          <span class=" d-block ma-1 text-right text-warning text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Rewarded After Deduction:&nbsp;-&nbsp;{{ $filters.formatIntAmount(Math.round(orderToCancel.totalRewardSilver * 1.1)) }}</span>
          <span class="ma-1 d-block text-right text-warning text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Cancellation Fees&nbsp;-&nbsp;{{ $filters.formatIntAmount(Math.round(cancelFees) * 1000) }}</span>
          <span class="ma-1 d-block text-right text-secondary text-caption" v-if="orderToCancel.silverSpand>0||orderToCancel.totalRewardSilver>0"
            >Boundary Silver Refund&nbsp;{{ $filters.formatIntAmount(Math.round((orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13)* 1000 - orderToCancel.totalRewardSilver * 1.1 - cancelFees * 1000)) }}</span>
          <span class="ma-1 d-block text-right text-warning text-caption" v-if="!orderToCancel.silverSpand>0&&!orderToCancel.totalRewardSilver>0"
            >Cancellation Fees&nbsp;-&nbsp;{{ $filters.formatCurrencyAmount(cancelFees) }}</span>
          <span class="ma-1 d-block text-right text-secondary text-caption" v-if="!orderToCancel.silverSpand>0&&!orderToCancel.totalRewardSilver>0"
            >Refund&nbsp;{{ $filters.formatCurrencyAmount(orderToCancel.totalAmount -orderToCancel.totalDiscount + orderToCancel.tax + orderToCancel.shipping * 1.13 - cancelFees) }}&nbsp;To&nbsp;{{ orderToCancel.paymentMethod }}</span>
          
          
          <v-divider class="mb-3"></v-divider>
          <v-row  class="text-capiton pa-3">
            <p>Money Refund will take up to 15 business days to appear in your account.All Boundary Silver Reward from  will be deducted
            </p>
          </v-row>

        </v-col>
      </v-card-text>
      <v-card-actions >
        <v-spacer></v-spacer>
        <v-btn variant="flat" size="small"   color="primary" @click="confirmCancel" class="mb-3">confirm</v-btn>
        <v-btn variant="text" size="small"   color="primary" @click="cancelCancel" class="mb-3">abort</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
        

      </v-card>
    </v-dialog>

  <!-- No Order Image -->
     <v-card flat  class="pa-2 mt-4" style="height: 100%; width: 100%;" v-if="residentOrders.length==0">
            <v-card-text>
                <!-- <v-img src="/images(2).jpeg" max-height="200" max-width="200"></v-img> -->
                <!-- <v-img src="/images.jpeg" max-height="200" max-width="200"></v-img> -->
              <v-img src="https://www.animatedimages.org/data/media/1802/animated-office-worker-image-0071.gif" height="200" width="200" class="ma-auto"></v-img>
              <v-row class="mt-5">
                  <span class="text-h3 text-shade4 font-weight-bold mx-auto">Ordering ...</span>
              </v-row>
            </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import _ from "lodash";
import moment from 'moment';
import { mapState } from "pinia";
import { useMainStore } from "../store/store";
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
      //         this.$store.setResidentOrders(orders)
      //       }
      //     }
      //     }
      //   }
      }
    },

  computed: {
    /**
     * Vuetify 3 takes a single `sort-by` array of { key, order }; the separate
     * boolean `sort-desc` prop is gone. The component still keeps sortBy and
     * sortDesc as its own state (the UI toggles them), so they are combined
     * here rather than reshaping the data and every place that writes to it.
     */
    sortByV3() {
      return this.sortBy
        ? [{ key: this.sortBy, order: this.sortDesc ? "desc" : "asc" }]
        : [];
    },
    ...mapState(useMainStore, ["residentOrders", "viewPortDimension", "resident"]),

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
      // Elements of an Apollo result stay frozen even after the array is
      // spread, so writing orders[index].x threw. Replace the element.
      const orders = [...this.residentOrders]
      orders[index] = { ...orders[index], isCanceled: true }
      this.$store.setResidentOrders(orders)
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
      orders[index] = { ...orders[index], isUnderDispute: false }
      this.$store.setResidentOrders(orders)
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
      orders[index] = { ...orders[index], isUnderDispute: true }
      this.$store.setResidentOrders(orders)
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
      // orderItems is null on older orders — see the v-img guard above.
      if (!items) return 0;
      let count = 0;
      items.map((item) => {
        count = count + item.quantity;
      });
      return count;
    },
  }
}
</script>