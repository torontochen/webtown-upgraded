<template>
  <v-container tag="div"  :width="viewPortDimension.width * 0.9">

     <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="vendorHomeLoading" persistent fullscreen>
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

    <!-- <v-container> -->
      <transition name="slide-fade">
      <slot>
        <v-expansion-panels popout :disabled="vendorHomeLoading" v-model="item" mandatory :width="viewPortDimension.width * 0.8">
          
          <!-- Active Orders -->
          <v-expansion-panel :disabled="vendorOrders.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Active Orders
              <template v-slot:actions>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-data-iterator
                  :items="vendorOrders"
                  :items-per-page.sync="itemsPerPage"
                  :page.sync="page"
                  :search="searchStatus"
                  :sort-desc="sortDesc"
                  :sort-by="sortBy"
                  hide-default-footer
                >
                  <template v-slot:header>
                    <v-toolbar
                      dark
                      dense
                      flat
                      color="primary"
                      class="mb-1"
                    >
                      <v-toolbar-title>Orders</v-toolbar-title>
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
                        <v-btn-toggle
                          v-model="sortDesc"
                          mandatory
                        >
                          <v-btn
                            small
                            depressed
                            color="primary lighten-1"
                            :value="false"
                          >
                            <v-icon>mdi-arrow-up</v-icon>
                          </v-btn>
                          <v-btn
                            small
                            depressed
                            color="primary lighten-1"
                            :value="true"
                          >
                            <v-icon>mdi-arrow-down</v-icon>
                          </v-btn>
                        </v-btn-toggle>
                      </template>
                    </v-toolbar>
                  </template>

                  <template v-slot:default="props">
                    <v-row>
                      <v-col
                        v-for="(item,i) in props.items"
                        :key="i"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
                        <!-- iterated items -->
                        <v-card class="pa-1" @click.prevent="showOrderDetails(item)" >
                            <v-card-title class="text-subtitle-1 accent--text font-weight-bold">
                              Order: {{item.orderNo}}
                            </v-card-title>
                          <v-card-text>
                            <v-col>
                               <!-- <span class="d-block"></span><br> -->
                              <span class="d-block">Customer: &nbsp;{{item.customerName}}</span><br>
                              <span class="d-block" v-if="item.deliveryType=='pickup'">Pick Up at: &nbsp;{{item.pickupAddress}}</span>
                              <span class="d-block" v-else>Ship to: &nbsp;{{item.deliveryAddress}}</span><br>
                              <v-card-subtitle>{{totalItemCount(item.orderItems)}}&nbsp;items</v-card-subtitle>
                              <v-row dense>
                                 <v-checkbox 
                                v-model="item.isConfirmed"
                                :color="item.isConfirmed?'success':'primary'"
                                @click.stop="confirm(item)"
                                :disabled='item.isConfirmed||item.isCanceled'
                                dense
                                class="mr-3"
                              >
                                <template v-slot:label>
                                  <div v-if="item.isConfirmed">
                                   <span class="success--text">confirmed</span>
                                  </div>
                                  <div v-else>
                                   <span class="primary--text">confirm order</span>
                                  </div>
                                </template>
                              </v-checkbox>

                                 <v-checkbox 
                                v-model="item.isFulfilled"
                                :color="item.isFulfilled?'success':'primary'"
                                :label="item.isFulfilled?'filled':'fill'"
                                @click.stop="fulfill(item)"
                                :disabled='item.isFulfilled ||item.isCanceled'
                                dense
                                v-if="item.isConfirmed"
                              >
                                 <template v-slot:label>
                                  <div v-if="item.isFulfilled">
                                   <span class="success--text">filled</span>
                                  </div>
                                  <div v-else>
                                   <span class="primary--text">fill</span>
                                  </div>
                                </template>
                              </v-checkbox>

                              </v-row>
                             
                            </v-col>
                             
                          </v-card-text>
                          <v-card-actions>
                            <!-- <v-spacer></v-spacer> -->
                            <span class="text-caption">{{item.date | convert-customer-rating-time}}&nbsp;
                            <v-btn icon  @click.stop="messageCustomer(item)" :disabled="item.isFulfilled"><v-icon  color="primary" >mdi-message-text</v-icon></v-btn>
                            <v-btn text plain x-small color="accent" class="mx-2" v-if="item.isUnderDispute">Disputed</v-btn>
                            <v-btn text plain x-small  class="mx-2" color="accent" v-if="item.isCanceled">Canceled</v-btn>

                            </span>
                            
                          </v-card-actions>
                        </v-card>

                      </v-col>
                    </v-row>
                  </template>

                  <template v-slot:footer>
                    <v-row
                      class="mt-2"
                      align="center"
                      justify="center"
                    >
                      
                      <v-spacer></v-spacer>

                      <span
                        class="mr-4
                        grey--text"
                      >
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
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- On Sale -->
          <v-expansion-panel :disabled="allItemsOnSale.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              On Sale
              <template v-slot:actions>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row v-if="allItemsCatalog" class="d-flex justify-start">
                <v-col
                  v-for="(catalog, i) in allItemsOnSale"
                  :key="i"
                  cols="2"
                >
                  <v-card class="pa-1">
                    <v-img
                      :src="catalog.photo"
                      class="white--text align-end"
                      contain
                      aspect-ratio='1'
                    >
                      <!-- gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" -->
                    </v-img>
                      <v-card-subtitle class=" d-block text-subtitle-1 fontColor--text text--darken-3 text-truncate">{{catalog.description}}</v-card-subtitle>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                        <span   class="text-h6 red--text mx-1" >{{catalog.promoRate | format-currency-amount}}</span>
                        <span  class="text-subtitle-2 text--lighten-2 font-weight-light" ><del>{{catalog.rate | format-currency-amount}}</del></span>
                        <!-- <span class="text-h6 mx-2" v-if="!catalog.promoRate > 0">${{catalog.rate}}</span> -->
                      

                      <!-- <v-btn icon x-small>
                        <v-icon x-small>mdi-heart</v-icon>
                      </v-btn>

                      <v-btn icon x-small>
                        <v-icon x-small>mdi-bookmark</v-icon>
                      </v-btn>

                      <v-btn icon x-small>
                        <v-icon x-small>mdi-share-variant</v-icon>
                      </v-btn> -->
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Customer Message -->
          <v-expansion-panel :disabled="vendor.messages.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Customer Messsages
               
              <template v-slot:actions>
                 <v-badge
                          overlap
                          color="accent"
                          inline
                          :content="newMessages.toString()"
                          v-if="newMessages>0"
                        >
                        </v-badge>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-virtual-scroll
                  :items="vendor.messages"
                  :item-height="80"
                  :height="viewPortDimension.height * 0.38">
                  <template v-slot:default="{ item, index }" class="my-1">
                      <!-- <v-list two-line>
                      <v-list-item-group
                        active-class="pink--text"
                        multiple
                      >
                        <template v-for="(message, index) in resident.messages"> -->
                          <v-list-item :key="index" @click="showSingleMessage(item, 'resident')" three-line class="mt-4">
                            <!-- <template v-slot:default="{ active }"> -->
                              <v-list-item-icon >
                              <v-icon
                                color="primary"
                                v-if="!item.isRead"
                                size="30"
                              >
                                mdi-email-outline
                              </v-icon>
                              <v-icon
                                color="primary"
                                size="30"
                                v-else
                              >
                                mdi-email-open-outline
                              </v-icon>
                            </v-list-item-icon>

                              <v-list-item-content class="mt-2">
                                <v-list-item-title v-text="item.fullName" ></v-list-item-title>
                                <v-list-item-subtitle v-text="item.title" class="d-inLine-block text-truncate accent--text"></v-list-item-subtitle>
                                <v-list-item-subtitle v-text="item.text" class="d-inLine-block text-truncate"></v-list-item-subtitle>
                              </v-list-item-content>

                              <v-list-item-action>
                                <v-list-item-action-text >{{item.time | convert-customer-rating-time}}</v-list-item-action-text>
                              </v-list-item-action>
                            <!-- </template> -->

                          </v-list-item>

                          <v-divider
                              v-if="vendor.messages.length > 0 && index < vendor.messages.length - 1"
                              inset
                            ></v-divider>
                  <!-- </template>
                      </v-list-item-group>
                    </v-list> -->
                  </template>
                </v-virtual-scroll>
            </v-expansion-panel-content>
          </v-expansion-panel>



          <!-- Customer Ratings -->
          <v-expansion-panel :disabled="customerRatings.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Customer Ratings
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-virtual-scroll
                  :items="customerRatings"
                  :item-height="80"
                  :height="viewPortDimension.height * 0.38"
                >
                  <template v-slot:default="{ item, index }" >
   
                   <v-list-item :key="item.time" two-line class="mt-10">
            <!-- <template v-slot:default="{ active }"> -->
                        <v-list-item-avatar>
                          <v-img :src="item.customerAvatar"></v-img>
                        </v-list-item-avatar>

                        <v-list-item-content>
                          <v-list-item-title v-text="item.customerName"></v-list-item-title>

                          <!-- <v-list-item-subtitle
                            class="text--primary"
                            v-text="item.headline"
                          ></v-list-item-subtitle> -->

                          <v-list-item-subtitle v-text="item.comments"></v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-list-item-action-text>
                          <v-rating
                              :value="item.rating"
                              background-color="orange lighten-3"
                              color="orange"
                              medium
                              half-increments
                              empty-icon="mdi-star-outline"
                              full-icon="mdi-star"
                              half-icon="mdi-star-half"
                              readonly
                          ></v-rating>
                          </v-list-item-action-text>
                           
                          {{item.time | convert-customer-rating-time}}
                          <!-- <v-icon
                            v-if="!active"
                            color="grey lighten-1"
                          >
                            mdi-star-outline
                          </v-icon>

                          <v-icon
                            v-else
                            color="yellow darken-3"
                          >
                            mdi-star
                          </v-icon> -->
                        </v-list-item-action>
                      <!-- </template> -->
                    </v-list-item>
                  <v-divider
                      v-if="customerRatings.length > 0 && index < customerRatings.length - 1 "
                      inset
                    ></v-divider>
       
                  </template>
                </v-virtual-scroll>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Events Ongoing -->
          <v-expansion-panel :disabled="vendorPromotionEvents.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Events Ongoing
              <template v-slot:actions>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content> 
                        <Events :events="vendorPromotionEvents"/>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Flyer Performance -->
          <v-expansion-panel :disabled="vendorFlyers.length==0">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Campaign Performance
              <template v-slot:actions>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content> 
                <v-simple-table
                  fixed-header
                  :height="viewPortDimension.height * 0.38"
                >
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">
                       Title
                    </th>
                    <th class="text-left">
                        Type
                    </th>
                    <th class="text-left">
                        From
                    </th>
                    <th class="text-left">
                        To
                    </th>
                    <th class="text-left">
                        Qty Distributed
                    </th>
                    <th class="text-left">
                        Qty Read
                    </th>
                    <th class="text-left">
                        Qty Redeemed
                    </th>
                    <th class="text-left">
                        Sales Generated($)
                    </th>
                   
                    </tr>
                </thead>
                <tbody>
                    <tr
                    v-for="item in vendorFlyersSorted"
                    :key="item.flyerId"
                    >
                    <td>{{ item.flyerTitle }}</td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.dateFrom | convert-date }}</td>
                    <td>{{ item.dateTo | convert-date }}</td>
                    <td>{{ item.quantityDistributed |  format-int-amount}}</td>
                    <td>{{ item.quantityRead |  format-int-amount}}</td>
                    <td>{{ item.quantityRedeemed |  format-int-amount}}</td>
                    <td>{{ item.salesGenerated |  format-amount}}</td>
                    </tr>
                </tbody>
                </template>
                </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>

           <!-- Existing Customer -->
          <v-expansion-panel :disabled="vendor.existingCustomerList==null">
            <v-expansion-panel-header class="accent--text font-weight-bold">
              Current Customer
              <template v-slot:actions>
                <v-badge
                          overlap
                          color="accent"
                          inline
                          :content="vendor.existingCustomerList.length.toString()"
                          v-if="vendor.existingCustomerList.length>0"
                        >
                        </v-badge>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content> 
                <v-simple-table
                  fixed-header
                  :height="viewPortDimension.height * 0.38"
                >
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">
                        Name
                    </th>
                    <th class="text-left">
                        Location
                    </th>
                    <th class="text-left">
                        Orders
                    </th>
                    <th class="text-left">
                        Total Purchase Amount
                    </th>
                    <th class="text-left">
                        Average Amount / Order
                    </th>
                    <th class="text-left">
                        Date Of Last Time Purchase
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                    v-for="(item, index) in vendor.existingCustomerList"
                    :key="index"
                    >
                    <td>{{ item.customer }}</td>
                    <td>{{ item.location }}</td>
                    <td>{{ item.purchaseTimes | format-int-amount }}</td>
                    <td class="text-left">{{ item.totalPurchaseAmount | format-currency-amount }}</td>
                    <td>{{ item.totalPurchaseAmount / item.purchaseTimes | format-currency-amount }}</td>
                    <td>{{ item.dateLastTimePurchase | convert-date}}</td>
                    </tr>
                </tbody>
                </template>
                </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Daily Report -->
          <!-- <v-expansion-panel>
            <v-expansion-panel-header>
              Daily Report
              <template v-slot:actions>
                <v-icon color="primary"> $expand </v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content> </v-expansion-panel-content>
          </v-expansion-panel> -->
        </v-expansion-panels>
      </slot>
    </transition>
    <!-- </v-container> -->

    
    
     <!-- order item details -->
    <OrderItemDetails 
        v-model="showDetails"
        @close="showDetails=false"
        :orderDetails="orderDetails"
        :vendorSettlement="vendorSettlement"
        type='vendor'
        />

    <!-- Single Message Dialog -->
    <v-dialog v-model="isShowSingleMessageOpen" max-width="750" v-if="singleMessageToShow ">
      <v-card
        max-width="750"
        class="mx-auto"
      >
        <v-toolbar
          color="primary lighten-1"
          dark
          dense
          flat
        >
          <v-toolbar-title>{{singleMessageToShow.type=='guild'?'Guild':'Vendor'}}&nbsp; Message</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="openReplyWindow">
            <v-icon>mdi-replay</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-subtitle class="accent--text text-subtitle-1 mt-3" >From:&nbsp;{{singleMessageToShow.message.fullName + '('  + singleMessageToShow.message.sender + ')'}}</v-card-subtitle>
       
        <v-card-subtitle class="accent--text text-subtitle-1" >Title:&nbsp;{{singleMessageToShow.message.title}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-card outlined flat>
          <v-card-text class="pa-3">
            <p>{{singleMessageToShow.message.text}}</p>
          </v-card-text>
        </v-card>
        <v-card outlined flat v-if="isReplyMsgOpen">
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="replyMessage"
                placeholder="Reply Message"
                required
                filled
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon :disabled='!replyMessage' @click="reply" class="ma-2"><v-icon size="36" color="primary" >mdi-send-outline</v-icon></v-btn>
          </v-card-actions>
        </v-card>

      </v-card>
    </v-dialog>

     <!-- Message Customer -->
    <v-dialog v-model="isMessageCustomerOpen" max-width="700" v-if="customerToMessage!= null">
       <v-card
        max-width="700"
        class="mx-auto"

      >
        <v-toolbar
          color="primary lighten-1"
          dark
          flat
          dense
        >
          <v-toolbar-title>Message To&nbsp;{{customerToMessage.customerName}}</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="sendCustomerMessage" :disabled="messageToCustomer == ''">
            <v-icon size="30">mdi-send-outline</v-icon>
          </v-btn>
        </v-toolbar>
       
        <v-card-subtitle class="accent--text text-subtitle-1 mt-3" >From:&nbsp;{{customerToMessage.vendor}}</v-card-subtitle>
       <v-card-text>
          <v-text-field
          label="Title"
          dense
          type="text"
          v-model="messageToCustomerTitle"
          clearable
        >
        </v-text-field>
       </v-card-text>
        <v-card  flat >
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="messageToCustomer"
                filled
                placeholder="Text"
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
        </v-card>

      </v-card>
    </v-dialog>


     <!-- Fulfill Order -->
    <v-dialog v-model="isFulfillOpen" max-width="700" v-if="orderToFulfill!= null">
       <v-card
        max-width="700"
        class="mx-auto"

      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>Order&nbsp;{{orderToFulfill.orderNo}}</v-toolbar-title>

          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card  flat >
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="fulfillNote"
                filled
                placeholder="Text"
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
        </v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn depressed color="primary" :disabled="fulfillNote==''" @click="confirmFulfill">confirm</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snack Bar -->
     <v-snackbar
        v-model="snackbar"
        centered
        dark
        color="primary lighten-2"
        class="pa-3"
        timeout="3000"
        >
        <span class="text-h6 font-weigth-bold text-center d-block">{{snackbarInfo}}</span>
     </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { VENDOR_ORDER_ADDED, 
          VENDOR_SETTLEMENT_RECORD_ADDED, 
          MESSAGE_RECEIVED, 
          CUSTOMER_RATING_ADDED,
          ORDER_STATUS_CHANGED } from "../../queries/queries_subscription";
import OrderItemDetails from '../OrderItemDetails.vue'

import Events from '../Events.vue'
import { GET_CURRENT_VENDOR, GET_VENDOR_ORDERS } from '../../queries/queries_query';
// CHANGE_ORDER_STATUS was removed: its definition in queries_mutation.js, its
// use below, and the schema field are all commented out. Rollup errors on an
// import of a non-existent export where webpack silently gave undefined.
import { READ_MESSAGE, CONFIRM, FULFILL} from '../../queries/queries_mutation';
import _ from 'lodash'


export default {
  name: 'VendorHomePage',
  components: {
        OrderItemDetails,
        Events
    },
  data() {
    return {
        customerToMessage: null,
        fulfillNote: '',
        itemsPerPage: 6,
        orderDetails: null,
        orderToFulfill: null,
        messageToCustomer: '',
        messageToCustomerTitle: '',
        page: 1,
        replyMessage: null,
        search: '',
        searchStatus: '',
        showDetails: false,
        sortDesc: true,
        sortBy: 'date',
        snackbar: false,
        snackbarInfo: null,
        vendorSettlement: null,
        item: [0],
        // isOrderFilled: [],
        isReplyMsgOpen: false,
        isFulfillOpen: false,
        isShowSingleMessageOpen: false,
        isMessageCustomerOpen: false,
        singleMessageToShow: null
    }
  },
  // apollo: {
  //   $subscribe: {
  //     customerRatingAdded: {
  //       query: CUSTOMER_RATING_ADDED,
  //       result({data}) {
  //         const { customerRatingAdded } = data
  //          if(this.vendor && this.vendor.businessTitle == customerRatingAdded.vendor) {
  //            this.customerRatings.push(customerRatingAdded)
  //            this.$store.commit("setCustomerRatings", this.customerRatings)
  //        }
  //       }
  //     },
  //      orderStatusChanged:{
  //       query: ORDER_STATUS_CHANGED,
  //       result({data}) {
  //         console.log(data)
  //         const { orderStatusChanged: {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled} } = data
  //         if(this.vendor.businessTitle == vendor) {
  //           const index = this.vendorOrders.findIndex(item => item.orderNo == orderNo )
  //           if(index >= 0) {
  //             const orders = [...this.vendorOrders]
  //             orders[index].isCanceled = isCanceled
  //             orders[index].isUnderDispute = isUnderDispute
  //             orders[index].isConfirmed = isConfirmed
  //             orders[index].disputeInfo = content
              
  //             this.$store.commit('setVendorOrders', orders)
  //           }
  //         }
  //       }
  //     },
  //     vendorOrderAdded: {
  //       query: VENDOR_ORDER_ADDED,
  //       result({ data }) {
  //         const { vendorOrderAdded } = data
  //         console.log(vendorOrderAdded);
  //         if(this.vendor && this.vendor.businessTitle == vendorOrderAdded.vendor) {
  //            this.vendorOrders.push(vendorOrderAdded)
  //            this.$store.commit("setVendorOrders", this.vendorOrders)
  //        }
  //       }
  //     },
  //     vendorSettlementRecordAdded: {
  //       query: VENDOR_SETTLEMENT_RECORD_ADDED,
  //       result({ data }) {
  //         const { vendorSettlementRecordAdded } = data
  //         console.log(vendorSettlementRecordAdded);
  //         if(this.vendor && this.vendor.businessTitle == vendorSettlementRecordAdded.vendor) {
  //            this.vendorSettlementRecords.push(vendorSettlementRecordAdded)
  //            this.$store.commit("setVendorSettlementRecords", this.vendorSettlementRecords)
  //        }
  //       }
  //     },
  //     messageReceived: {
  //       query: MESSAGE_RECEIVED,
  //       result({ data }) {
  //         console.log(data.messageReceived);
  //         const { messageReceived } = data
          
  //         if( messageReceived.receiverType == 'vendor' && messageReceived.receiver == this.vendor.businessTitle) {
  //            let newVendor = this.vendor
  //            newVendor.messages.push(messageReceived)
  //            this.$store.commit("setVendor", newVendor)
  //        }
        
  //       }
  //     },
  //   }
  // },
  created() {
    this.$store.dispatch("getVendorGuildDeals", {vendor: this.vendor.businessTitle})
    
    this.$store.dispatch("getAllItemsCatalog", {
      businessTitle: this.vendor.businessTitle,
      time: Date.now().toString(),
    });
    this.$store.dispatch("getVendorPromotionEvents", { vendor: this.vendor.businessTitle })
    this.$store.dispatch("getVendorOrders", {vendor: this.vendor.businessTitle})
    this.$store.dispatch("getVendorSettlementRecords", {vendor: this.vendor.businessTitle})
    this.$store.dispatch("getVendorSalesInfo", {vendor: this.vendor.businessTitle})
    this.$store.dispatch("getVendorFlyers", {vendor: this.vendor.businessTitle})
    this.$store.dispatch("getCustomerRatings", {vendor: this.vendor.businessTitle})
    this.$store.dispatch("getAllGuilds");
    this.$store.dispatch("getGamePropList")
    this.$store.dispatch("getGameSubstituteList")
  },

  computed: {
    ...mapGetters(["vendor", 
                    "allItemsCatalog", 
                    "customerRatings",
                    "viewPortDimension",
                    "vendorHomeLoading", 
                    "vendorOrders", 
                    "vendorSettlementRecords", 
                    "vendorFlyers", 
                    "viewPortDimension",
                    "vendorPromotionEvents"]),

    allItemsOnSale() {
      if (this.allItemsCatalog) {
      // const itemsOnSale =  this.allItemsCatalog.map(item => {
      //   if(item.promoRate > 0) {
      //     console.log(item)
      //     return item
      //   }
      // })
      let itemsOnSale = []
      for ( let item of this.allItemsCatalog ) {
        if(item.promoRate > 0) {
          itemsOnSale.push(item)
        }
      }
      // console.log(itemsOnSale)
      return itemsOnSale
      }
    },

    ready() {
      return this.vendorHomeLoading && !this.vendorOrders
    },

     newMessages(){
      let count = 0
      this.vendor.messages.forEach(item => {
        if(!item.isRead) count++
      });
      return count
    },

    numberOfPages() {

      return Math.ceil(this.vendorOrders.length / this.itemsPerPage)
    }, 

    vendorFlyersSorted(){
      return _.orderBy(this.vendorFlyers, ['dateFrom'], ['desc'])
    }
  },

  watch:{
    vendorOrders(val){
      console.log(val)
      // this.isOrderFilled = []
      // val.map(item => {
      //   this.isOrderFilled.push(item.orderItems[0].isFulfuilled)
      // })
    },

    customerRatings(val){
      console.log(val)
    }
  },

  methods: {
    // changeOrderStatus(orderNo, index){
    //   this.$apollo
    //     .mutate({
    //       mutation: CHANGE_ORDER_STATUS,
    //       variables:{
    //         vendor: this.vendor.businessTitle,
    //         orderNo,
    //         status: this.isOrderFilled[index]
    //       },
    //       update:(cache, {data: {}}) => {
    //         const data = cache.readQuery({ query: GET_VENDOR_ORDERS, variables: {vendor: this.vendor.businessTitle}})
    //         const index = data.getVendorOrders.findIndex(order => order.orderNo == orderNo)
    //         data.getVendorOrders[index].orderItems.map((item, i, array) => {
    //           // console.log(array)
    //           array[i].isFulfilled = this.isOrderFilled[index]
    //         })
    //         this.$store.commit('setVendorOrders', data.getVendorOrders)
    //       }
    //     })
    //     .then(({data})=> {
    //       // console.log(data)
    //     })
    //     .catch(err => console.error(err))
    // },
     confirm(order){
        const payload = {
        vendor: order.vendor,
        resident: order.resident,
        orderNo: order.orderNo,
        content: '',
        isUnderDispute: order.isUnderDispute,
        isConfirmed: true,
        isCanceled: order.isCanceled
      }
      const index = this.vendorOrders.findIndex(item => item.orderNo == order.orderNo)
      const orders = [...this.vendorOrders]
      orders[index].isConfirmed = false
      this.$store.commit('setVendorOrders', orders)
      this.$apollo
        .mutate({
          mutation: CONFIRM,
          variables: payload
        })
        .then(({data})=>{
          const { confirm } = data
          console.log(confirm)
        })
        .catch(err => console.error(err))
     },

     confirmFulfill() {
       const index = this.vendorOrders.findIndex(item => item.orderNo == this.orderToFulfill.orderNo)
       const orders = [...this.vendorOrders]
       orders[index].isFulfilled = true
       orders[index].fulfillNote = this.fulfillNote
       this.$store.commit('setVendorOrders', orders)
       this.$apollo
        .mutate({
          mutation: FULFILL,
          variables:{
            vendor: this.orderToFulfill.vendor,
            orderNo: this.orderToFulfill.orderNo,
            fulfillNote: this.fulfillNote
          }
        })
        .then(({data})=>{
          const { fulfill } = data
          console.log(fulfill)
        })
        .catch(err => console.error(err))
        this.isFulfillOpen = false

     },

     formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },

    fulfill(order) {
      this.orderToFulfill = order
      this.isFulfillOpen = true
    },

    messageCustomer(order){
      this.messageToCustomer = ''
      this.customerToMessage = order
      this.messageToCustomerTitle = order.orderNo
      this.isMessageCustomerOpen = true
    },

     nextPage () {
        if (this.page + 1 <= this.numberOfPages) this.page += 1
      },

    openReplyWindow(){
      this.isReplyMsgOpen=true
      this.replyMessage = null
    },

    reply(){

      // switch(this.singleMessageToShow.type){
      //   case 'vendor':
          this.$store.dispatch('sendMessage', {
                sender: this.vendor.businessTitle,
                receiver: this.singleMessageToShow.message.sender,
                receiverType: 'resident',
                text: this.replyMessage,
                time: Date.now().toString(),
                fullName: this.singleMessageToShow.message.fullName,
                title: this.singleMessageToShow.message.title,
                guild: null 
            })
      //       break;
      //     case 'guild':
      //       this.$store.dispatch('sendMessage', {
      //           sender: this.resident.residentName,
      //           receiver: this.singleMessageToShow.sender,
      //           receiverType: 'resident',
      //           text: this.replyMessage,
      //           time: Date.now().toString(),
      //           fullName: `${this.resident.firstName} ${this.resident.lastName}`,
      //           title: this.singleMessageToShow.title,
      //           guild: this.singleMessageToShow.guild
      //       })
            
      // }

      this.isShowSingleMessageOpen = false
      this.snackbarInfo = `Reply ${this.singleMessageToShow.message.fullName}`
      this.snackbar = true
    },

    sendCustomerMessage(){
       this.$store.dispatch('sendMessage', {
                sender: this.customerToMessage.vendor,
                receiver: this.customerToMessage.resident,
                receiverType: 'resident',
                text: this.messageToCustomer,
                time: Date.now().toString(),
                fullName: this.customerToMessage.customerName,
                title: this.messageToCustomerTitle,
                guild: null 
            })

      this.isMessageCustomerOpen = false
      this.snackbarInfo = `Messaged ${this.customerToMessage.customerName}`
      this.snackbar = true
    },

      showOrderDetails(item) {
          this.orderDetails = item
          console.log(this.orderDetails)
          const index = _.findIndex(this.vendorSettlementRecords, record => {
            return item.orderNo == record.salesOrderNo
          })
          this.vendorSettlement = this.vendorSettlementRecords[index]
          this.showDetails = true
      }, 

       showSingleMessage(message, type){
            // console.log(message)
            this.isReplyMsgOpen = false
            this.isShowSingleMessageOpen = true
            this.singleMessageToShow = { message, type}
            console.log(type)
            this.$apollo
              .mutate({
                mutation: READ_MESSAGE,
                variables: {
                  sender: message.sender, 
                  receiver: message.receiver, 
                  guild: message.guild, 
                  time: message.time, 
                  type
                },
                update:(cache, {data: {readMessage}}) => {
                  const  data = cache.readQuery({ query: GET_CURRENT_VENDOR })
                  // switch(type){
                  //   case 'vendor':
                  // console.log(readMessage)
                      const index = _.findIndex(data.getCurrentVendor.messages, item => {
                          return item.sender == message.sender && item.time == message.time
                        })
                      if(index >= 0){
                        data.getCurrentVendor.messages[index].isRead = true
                        // this.vendor.messages[index].isRead = true
                        cache.writeQuery({ query: GET_CURRENT_VENDOR, data})
                      }
                  //     break;
                  //   case 'guild':
                  //     const indexGuild = _.findIndex(data.getCurrentVendor.guildMessages, item => {
                  //         return item.guild == message.guild && item.time == message.time
                  //       })
                  //     if(indexGuild >= 0){
                  //       data.getCurrentVendor.guildMessages[indexGuild].isRead = true
                  //       console.log(data)
                  //       cache.writeQuery({ query: GET_CURRENT_RESIDENT, data})
                  //     }
                  // }
                  this.$store.commit('setVendor', data.getCurrentVendor)
          },
          // refetchQueries:[{ query: GET_CURRENT_VENDOR}],
          // awaitRefetchQueries: true
        })
        .then(({data})=>{
          console.log(data)
        })
        .catch(err=>console.error(err))
    },
      
      totalItemCount(items) {
          let count = 0
          items.map(item => {
              count = count + item.quantity
          })
          return count
      }
  }
};
</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 1.2s ease;
}
.slide-fade-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
