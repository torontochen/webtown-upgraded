<template>
  <v-container fluid>
    <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="itemCatalogLoading" persistent fullscreen>
        <v-container fill-height>
          <v-row justify="center" align-content="center">
            <v-progress-circular
              indeterminate
              :size="60"
              :width="4"
              color="primary"
            ></v-progress-circular>
          </v-row>
        </v-container>
      </v-dialog>
    </v-row>

    <!-- Main Part -->
    <v-card flat outlined class="pa-1 mx-auto" width='1400' >
      <v-card-title class="text-primary"
        >Promotion Events</v-card-title
      >
      <!-- Event Selector -->
      <v-container fluid>
        <v-row>
          <!-- Promotion Category -->
          <v-col cols="6">
            <v-select variant="outlined"
              v-model="eventTypeSelected"
              :items="promotionEventList"
              label="Event Category " density="compact"
              append-outer-icon="mdi-exit-to-app"
              @click:append-outer="handleExit"
              :disabled="!flyerSelected=='' || itemsOnSaleSelected.length > 0"
            ></v-select>

          </v-col>
        </v-row>
      </v-container>
      <v-spacer></v-spacer>

        <!-- Monster Chest  -->
          <v-card flat v-if="eventTypeSelected=='Monster_Chest'">
              <v-card-title class="text-primary"
                                >Items In Chest</v-card-title
                              >
                <!-- Promotion item -->
                  <v-card flat>
                    <v-card-text>
                      <v-row class="d-flex justify-center align-center">
                        <v-select variant="outlined"
                            label="Promotion Item"
                            v-model="flyerSelected"
                            :items="flyerListToSelect" density="compact"
                            ></v-select>
                      </v-row> 
                    </v-card-text>
                  </v-card>
            <v-spacer></v-spacer>
            <!-- Reward items -->
              <v-card outlined>
                  <v-card-title class="text-primary text-subtitle-1"
                                  >{{ flyerSelected }}</v-card-title
                                >
                    <v-card-text>
                      <v-row >
                        <v-toolbar flat>
                            <v-toolbar-title
                            class="font-weight-bold text-primary text-subtitle-2"
                            >Reward Items</v-toolbar-title
                          >
                          <v-spacer></v-spacer>
                                <v-dialog v-model="dialog" max-width="400px" persistent>
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      color="primary"
                                      theme="dark"
                                      class="mb-2" v-bind="props" icon size="small"
                                      right
                                      floating
                                      :disabled="!flyerSelected"
                                    >
                                      <v-icon theme="dark"> mdi-plus </v-icon>
                                    </v-btn>
                                  </template>
                                  <v-form lazy-validation ref="form">
                                    <v-card>
                                      <!-- <v-card-title class="ml-4 mt-4">
                                        <span class="headline">Reward Item</span>
                                      </v-card-title> -->

                                      <v-card-text>
                                        <v-container fluid>
                                          <v-row class="d-flex justify-space-around align-end">
                                            <v-col cols="8" >
                                              <v-select variant="outlined"
                                                label="Reward Item"
                                                v-model="rewardItemSelected"
                                                :items="rewardItemsToSelect" density="compact"
                                                class="mt-2"
                                                >
                                                
                                                 <template v-slot:item="{item}">
                                                            <div>
                                                              <v-row class="my-1 d-flex-inline justify-start align-center">
                                                                <v-img src="/static/animated-money-image-0013.gif" height="40" width="40" />
                                                              {{item.itemName}}
                                                              </v-row>
                                                            </div>
                                                  </template>
                                                </v-select>
                                            </v-col>

                                            <v-col cols="4">
                                              <v-text-field
                                                label="Quantity"
                                                :rules="unitRule"
                                                v-model.number="quantity"
                                              ></v-text-field>
                                            </v-col>
                                          </v-row>

                                        </v-container>
                                      </v-card-text>

                                      <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn variant="text" color="accent" @click="close">
                                          Cancel
                                        </v-btn>
                                        <v-btn variant="text" color="primary"  @click="saveRewardItems"> OK </v-btn>
                                        <v-spacer></v-spacer>
                                      </v-card-actions>
                                    </v-card>
                                  </v-form>
                                </v-dialog>
      
                          </v-toolbar>
                      </v-row> 
                      <v-card flat>
                        <v-list density="compact" expand>
                          <v-list-item v-for="(item, index) in rewardItemsInChest" :key="index">
                            <template #prepend>
                              <v-icon v-text="item.icon" color="
                              primary"></v-icon>
                              </template>
                                <v-list-item-title v-text="item.itemName"  class="text-subtitle-1 text-primary"
                                ></v-list-item-title>
                                <v-list-item-title v-text="item.quantity.toString()" class="text-subtitle-1 text-primary"></v-list-item-title>
                              <template #append>
                              <v-icon  color="
                              primary" @click="deleteItem(index)">mdi-delete</v-icon>
                              </template>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-card-text>
              </v-card>
        
            <v-row justify="center" class="my-10">
              <v-btn color="primary" class="d-block mr-2" @click="saveMonsterChest" :disabled="!canSave">
                Save
              </v-btn>

              <v-btn variant="text" color="accent" @click="exitDialog = true"
                >Cancel</v-btn
              >
            </v-row>
          </v-card>

        <!-- On Sale -->
        <v-card flat v-if="eventTypeSelected=='On_Sale'" class="pa-2">
            <v-card-title class="text-primary">Choose Items On Sale</v-card-title>
            <!-- Pick Items On Sale -->
                  <v-card flat>
                    <v-card-text>
                      <v-row class="d-flex justify-center align-center">
                        <v-select variant="outlined"
                            label="On Sale Items"
                            v-model="itemsOnSaleSelected"
                            :items="onSaleItemsList" density="compact"
                            chips
                            small-chips
                            multiple
                            v-if="onSaleItemsList.length>0"
                            ></v-select>
                            <span class="text-subtitle-1 text-primary" v-else>No Items with Promotion Rate Set Up &nbsp;&nbsp;<v-btn variant="text"  color="accent" class="ml-2" @click="handleExit">exit</v-btn></span>
                            
                      </v-row> 
                    </v-card-text>
                  </v-card>
            <v-spacer></v-spacer>

            <v-card flat v-if="itemsOnSaleSelected.length>0" >
              <v-card-title>
                <v-toolbar flat color="primary" shaped short>
                  <v-toolbar-title class="text-subtitle-1 text-white font-weight-medium">Set Up Event </v-toolbar-title>
                </v-toolbar>
              </v-card-title>

              <v-card-text>
                <v-form v-model="isFormOk" lazy-validation ref="onSaleForm" >
                  <v-row>
                    <v-col cols="8">
                      <v-text-field
                        label="Event Title"
                        v-model="eventTitle"
                        type="text"
                        clearable>
                      </v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-file-input
                              label="Load business photos ( jpeg, png, jpg, gif ) only, Not more than 1MB"
                              color="primary"
                              class="mt-4"
                              show-size
                              chips density="compact"
                              @change="onFilePicked"
                              :error-messages="errMsgPic"
                              v-model="photoFile"
                            ></v-file-input>
                            <v-img width="150" height="150" :src="eventPhoto" v-if="eventPhoto"></v-img>
                    </v-col>
                  </v-row>
                  <!-- Date -->
                   <v-row>
                  <!-- from date -->
                  <v-col cols="4">
                      <v-menu
                      v-model="fromPicker"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      >
                      <template v-slot:activator="{ props }">
                          <v-text-field
                          v-model="dateFrom"
                          label="From"
                          prepend-inner-icon="event"
                          readonly
                          v-bind="props"
                          :rules="fromDateRules"
                          ></v-text-field>
                      </template>
                      <!-- v-model targets the dateModel computed: Vuetify 3's
                           picker emits a Date, the app stores YYYY-MM-DD. @change
                           is gone in Vuetify 3 — only update:modelValue is emitted. -->
                      <v-date-picker
                          v-model="dateFromModel"
                          @update:model-value="fromPicker = false"
                          :min="currentDate"
                          :max="dateTo"
                      ></v-date-picker>
                      </v-menu>
                  </v-col>

                  <!-- to date -->
                  <v-col cols="4">
                      <v-menu
                      v-model="toPicker"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      >
                      <template v-slot:activator="{ props }">
                          <v-text-field
                          v-model="dateTo"
                          label="To"
                          prepend-inner-icon="event"
                          readonly
                          :rules="toDateRules"
                          v-bind="props"
                          ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="dateToModel"
                          @update:model-value="toPicker = false"
                          :min="dateFrom"
                      ></v-date-picker>
                      </v-menu>

                    </v-col>
                    <v-col cols="4">
                      <v-switch v-model="isOnPortal" :label="`Post On Kanban ? ${isOnPortal?'Yes':'No'}`"></v-switch>
                    </v-col>
                  </v-row>

                  <v-row class="d-flex justify-center">
                    <v-col cols="12">
                      <v-textarea
                      v-model="eventInstruction"
                      placeholder="Event Instructions"
                      auto-grow
                      clearable
                      background-color="#EFEBE9" density="compact">

                    </v-textarea>
                    </v-col>
                  
                  </v-row>

                <!-- <v-divider></v-divider> -->
              
              <!-- Display Selected Items -->
                <v-row class="d-flex flex-row justify-start align-center flex-wrap my-1" v-if="itemsOnSaleSelected.length>0">
                  <v-card v-for="(item, i) in onSaleItemsListSelected" :key="i" width="250" class="ma-2 pa-1">
                    <v-img
                        :src="item.photo"
                        class="text-white  ma-auto"
                        height="220"
                        width="220"
                      >
                        <v-img src="../../assets/images/sales_images__1_-removebg-preview.png" width="100" height="80" style="position: absolute; top: 10px; right: 0px"></v-img>
                      </v-img>
                      <v-card-text class="text-body-2">{{item.description}}</v-card-text>
                    <v-card-actions>
                            <!-- <v-card-title v-text=""></v-card-title> -->
                      <v-spacer></v-spacer>
                        <span   class="text-subtitle-1 text-red mx-1" >${{item.promoRate}}</span>
                        <span  class="text-subtitle-2 text--lighten-2 font-weight-light" ><del>${{item.rate}}</del></span>
                    </v-card-actions>
                </v-card>
                </v-row>


                <v-divider></v-divider>
                  <v-row justify="center" class="my-10">
                      <v-btn variant="flat" color="primary" class="d-block mr-2" @click="saveOnSale"  :disabled="!canSave">
                        Save
                      </v-btn>

                      <v-btn variant="text" color="primary" @click="exitDialog = true"
                        >Cancel</v-btn
                      >
                  </v-row>
              </v-form>
              </v-card-text>
            </v-card>
        </v-card>

        <!-- Game Shop -->
        <v-card flat v-if="eventTypeSelected=='Game_Store'" class="pa-2">
            <v-card flat >
              <v-card-title>
                <v-toolbar flat color="primary" shaped short>
                  <v-toolbar-title class="text-subtitle-1 text-white font-weight-medium">Set Up Event </v-toolbar-title>
                </v-toolbar>
              </v-card-title>
               <v-card-subtitle v-if="currentShopItemName!=null" class="my-4"><v-icon color="primary">mdi-store</v-icon> Items In Game Store:&nbsp;&nbsp;
         <span class="text-accent font-weight-bold">{{currentSubstituteItemName}}</span> &nbsp;&nbsp; for  &nbsp;&nbsp;
         <span class="text-accent font-weight-bold">{{currentShopItemName}}</span>
         </v-card-subtitle>
         <v-divider class="mb-2"></v-divider>
              <v-card-text>
                <v-form v-model="isFormOk" lazy-validation ref="onSaleForm" >
                  <v-row class="d-flex justify-space-around align-stretch">
                    <!-- substitute item -->
                    <v-col cols="6" >
                      <v-select
                            label="Vendor Item"
                            v-model="substituteVendorItemSelected"
                            :items="vendorItemList" density="compact"
                            small-chips
                            ></v-select>
                    </v-col>
                    <!-- price -->
                    <v-col cols="6">
                      <v-text-field
                          :value="substituteItemPrice"
                          label="Price"
                          readonly density="compact"
                          prefix="$"
                          ></v-text-field>
                    </v-col>
                    <!-- Bind Coupon -->
                    <!-- <v-col cols="5" >
                      <v-select
                            label="Bind Coupon"
                            v-model="couponBond"
                            :items="vendorCouponList" density="compact"
                            small-chips
                            ></v-select>
                    </v-col> -->
                  </v-row>

                   <v-row class="d-flex justify-space-around align-stretch">
                  <!-- item to substitute in shop -->
                  <v-col cols="6">
                      <v-select
                            label="Item to Substitute In Game"
                            v-model="itemToSubstituteSelected"
                            :items="gameProps" density="compact"
                            small-chips
                            >
                            <template v-slot:selection="{ item }">
                              {{ item.itemName }}
                            </template>
                                                  
                            <template v-slot:item="{item}">
                              <div>
                                <v-row class="my-1">
                                  <v-img :src="'data:image/png;base64,'+item.picture" height="30" width="30" />
                                 &nbsp;&nbsp;&nbsp;&nbsp;{{item.itemName}}
                                </v-row>
                              </div>
                            </template>
                        </v-select>
                  </v-col>

                  <!-- substitute item in game shop -->
                  <v-col cols="6">
                     <v-select
                            label="Matching for Vendor Item"
                            v-model="substituteItemSelected"
                            :items="gameSubstitute" density="compact"
                            small-chips
                            >
                            <template v-slot:selection="{ item }">
                              {{ item.itemName }}
                            </template>
                                                  
                            <template v-slot:item="{item}">
                              <div>
                                <v-row class="my-1 d-flex-inline justify-start align-center">
                                  <v-img :src="'data:image/png;base64,'+item.picture" height="30" width="30" />
                                 &nbsp;&nbsp;&nbsp;&nbsp;{{item.itemName}}
                                </v-row>
                              </div>
                            </template>
                        </v-select>
                    </v-col>
                  </v-row>

                  <v-row class="d-flex justify-center">
                    <v-col cols="12">
                      <v-textarea
                      v-model="eventInstruction"
                      placeholder="Event Instructions"
                      auto-grow
                      clearable
                      background-color="#EFEBE9" density="compact">

                    </v-textarea>
                    </v-col>
                  
                  </v-row>

             <!-- Date -->
                   <v-row class="d-flex justify-space-around align-stretch">
                  <!-- from date -->
                  <v-col cols="4">
                      <v-menu
                      v-model="fromPicker"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      >
                      <template v-slot:activator="{ props }">
                          <v-text-field
                          v-model="dateFrom"
                          label="From"
                          prepend-inner-icon="event"
                          readonly
                          v-bind="props"
                          :rules="fromDateRules"
                          ></v-text-field>
                      </template>
                      <!-- v-model targets the dateModel computed: Vuetify 3's
                           picker emits a Date, the app stores YYYY-MM-DD. @change
                           is gone in Vuetify 3 — only update:modelValue is emitted. -->
                      <v-date-picker
                          v-model="dateFromModel"
                          @update:model-value="fromPicker = false"
                          :min="currentDate"
                          :max="dateTo"
                      ></v-date-picker>
                      </v-menu>
                  </v-col>

                  <!-- to date -->
                  <v-col cols="4">
                      <v-menu
                      v-model="toPicker"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                      >
                      <template v-slot:activator="{ props }">
                          <v-text-field
                          v-model="dateTo"
                          label="To"
                          prepend-inner-icon="event"
                          readonly
                          :rules="toDateRules"
                          v-bind="props"
                          ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="dateToModel"
                          @update:model-value="toPicker = false"
                          :min="dateFrom"
                      ></v-date-picker>
                      </v-menu>

                    </v-col>
                    <!-- <v-col cols="4">
                      <v-switch v-model="isOnPortal" :label="`Post On Portal ? ${isOnPortal?'Yes':'No'}`"></v-switch>
                    </v-col> -->
                  </v-row>


                <!-- <v-divider></v-divider> -->
              <!-- class="d-flex flex-row justify-end align-center  my-1" -->
              <!-- Display Selected Substitute Item -->
                <v-row  v-if="substituteItemSelected && substituteVendorItemSelected && itemToSubstituteSelected" >
                  <v-card-title >Substitute Buy Item:&nbsp;<v-img :src="'data:image/png;base64,'+substituteItemSelected.picture" height="30" width="30" class="d-flex-inline"/>
                      &nbsp;{{substituteItemSelected.itemName}}&nbsp;for  Game Shop Item:&nbsp;
                      <v-img :src="'data:image/png;base64,'+itemToSubstituteSelected.picture" height="30" width="30" class="d-flex-inline"/>
                      {{itemToSubstituteSelected.itemName}}
                      </v-card-title>
                </v-row>
                <v-divider></v-divider>
                  <v-row justify="center" class="my-10">
                      <v-btn variant="flat" color="primary" class="d-block mr-2" @click="saveOnSale"  :disabled="!canSave">
                        Save
                      </v-btn>

                      <v-btn variant="text" color="accent" @click="exitDialog = true"
                        >Cancel</v-btn
                      >
                  </v-row>
              </v-form>
              </v-card-text>
            </v-card>
        </v-card>
    </v-card>
 <!-- Cancel Dialog -->
    <v-dialog v-model="exitDialog" width="400" persistent transition="fade">
      <v-card style="border-top: 15px solid #B75420">
        <v-card-title class="text-h6 text-accent" 
          >Leaving Promotion Events</v-card-title
        >

        <v-card-text  class="text-body-1 text-accent">
          Are you Sure ? All unsaved change will be lost!
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary"  @click="handleCancel"> Yes </v-btn>

          <v-btn variant="text" color="accent"  @click="exitDialog = false"> No </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";
import { GET_REWARD_ITEMS, GET_GAME_SHOP_SUBSTITUTE } from "../../queries/queries_query.js";
import _ from "lodash";
import moment from "moment"
import { dateModel } from "../../utils/dateModel"

export default {
  name: "vendorPromotions",
  data() {
    return {
      active: true,
      category: ["product", "service"],
      couponBond: null,
      currentShopItemName: null,
      currentSubstituteItemName: null,
      descriptionRule: [
        (description) => !!description || "Description is required",
      ],
      dialog: false,
      dialogDelete: false,
      dateFrom: null,
      dateTo: null,
      editedIndex: -1,
      errMsgPic: "",
      errMsg: "",
      errMsgDup: "",
      errMsgDes: "",
      eventInstruction: '',
      eventPhoto: "",
      eventTitle: "",
      eventTitleRules: [
        title => !!title || "Event Title is Required!"
      ],
      eventTypeSelected: "",
      exitDialog: false,
      flyerSelected: "",
      fromPicker: false,
      fromDateRules: [
          (dateFrom) => !!dateFrom || "From Date is required!",
      ],
      inEdit: false,
      isFormOk: false,
      isOnPortal: false,
      itemsOnSaleSelected: [],
      // itemCatalogList: [],
      itemCodeRule: [(itemCode) => !!itemCode || "Item Code is required"],
      lastItemWarning: false,
      itemCodeListSelected: [],
      photoFile: null,
      promotionEventList: [],
      quantity: 0,
      rewardItemSelected: "",
      rewardItemsInChest: [],
      substituteItemSelected: null,
      substituteVendorItemSelected: null,
      substituteItemPrice: 0,
      itemToSubstituteSelected: null,
      toPicker: false,
      toDateRules: [
          (dateTo) => !!dateTo || "To Date is required!",
      ],
      unitRule: [(unit) => !!unit || "quantity is required"],
    };
  },
  mounted() {
    window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      event.returnValue = "ok";
    });
    this.eventCategory.map((item) => {
      // console.log(item.eventName);
    
        this.promotionEventList.push(item.eventName);
        // console.log(this.promotionEventList)
    });
     this.$apollo
          .query({query: GET_REWARD_ITEMS})
          .then(({data}) => {
            this.$store.setRewardItems(data.getRewardItems)
          })

     this.$apollo
          .query({query: GET_GAME_SHOP_SUBSTITUTE})
          .then(({data}) => {
            console.log(data)
            const { getGameShopSubstitute: { vendor, shopItemName, substituteItemName} } = data
            if (vendor == this.vendor.businessTitle ){
              this.currentShopItemName = shopItemName
              this.currentSubstituteItemName = substituteItemName
            }
          })

       
  },
  watch: {
    dialog(val) {
      val || this.close();
    },

    // eventTypeSelected(val) {
    //   console.log(val)
    // },
    // dialogDelete(val) {
    //   val || this.closeDelete();
    // },
    // itemCatalogSaved(val) {
    //   // console.log(val);
    //   if (val) {
    //     this.itemCatalogList = this.itemCatalogSaved.itemDetailed;
    //   }
    // },
    flyerSelected(val) {
      this.rewardItemSelected = "";
      this.rewardItemsInChest = [];
    },
    itemsOnSaleSelected(val) {
      console.log(val)
    },

    substituteVendorItemSelected(val) {
      if(val!=null){
        console.log(val)
       const index =  this.allItemsCatalog.findIndex(item => {
          return val == item.description
        })
        console.log(this.allItemsCatalog[index])
        this.substituteItemPrice = this.allItemsCatalog[index].promoRate > 0 ? this.allItemsCatalog[index].promoRate : this.allItemsCatalog[index].rate
      } 
    },
  },
  computed: {
    // Vuetify 3's picker emits a Date; the app stores YYYY-MM-DD. See
    // src/utils/dateModel.js for why the string model was kept.
    dateFromModel: dateModel("dateFrom"),
    dateToModel: dateModel("dateTo"),
    ...mapState(useMainStore, 
      ["vendor", 
      "eventCategory", 
      "itemCatalogLoading", 
      "savedFlyerList", 
      "rewardItems", 
      "allItemsCatalog", 
      "gamePropList", 
      "gameSubstituteList"]),
   
    canSave() {
      if(this.rewardItemsInChest.length > 0 
      || this.itemCodeListSelected.length > 0 
      || (this.substituteItemSelected && this.substituteVendorItemSelected && this.itemToSubstituteSelected)) {
        return true
      } else {
        return false
      }
    },

    currentDate() {
        return moment(Date.now()).format("YYYY-MM-DD");
    },

  flyerListToSelect() {
    return this.savedFlyerList.map((item) => {
      // console.log(item.flyerTitle + "_" + item.flyerId + "_" + item.type)
      return item.flyerTitle + "_" + item.flyerId + "_" + item.type
    })
  },

   gameProps(){
     return this.gamePropList.map(item => {
       return {
         itemCode: item.itemCode,
         itemName: item.itemName,
         picture: item.picture
       }
     })
   },

   gameSubstitute(){
     return this.gameSubstituteList.map(item => {
       return {
         itemCode: item.itemCode,
         itemName: item.itemName,
         picture: item.picture
       }
     })
   },

   onSaleItemsList() {
     const itemsList = []
     for(let item of this.allItemsCatalog) {
       if(item.promoRate > 0) {
         itemsList.push(`(${item.itemCode})${item.description}`)
       }
     }
     return itemsList
   },

   onSaleItemsListSelected() {
    //  console.log(this.itemsOnSaleSelected)
     if(this.itemsOnSaleSelected.length > 0) {
       const list = []
       for ( let item of this.itemsOnSaleSelected) {
         const pos = item.indexOf(')')
         const index = _.findIndex(this.allItemsCatalog, catalog => {
          //  console.log(item)
          //  console.log(item.substr(1, pos))
           return catalog.itemCode == item.substr(1, pos -1)
         })
         if(index >= 0) {
           list.push(this.allItemsCatalog[index])
           this.itemCodeListSelected.push(this.allItemsCatalog[index].itemCode)
         }
       }
      //  console.log(list)
       return list
     }
   },

     rewardItemsToSelect() {
      if(this.rewardItems){
         return this.rewardItems.map(item => {
       return item.itemName + "_" + item.icon
     })
      }
    },

   

    vendorItemList() {
     const itemList = []
     console.log(this.allItemsCatalog)
     for(let item of this.allItemsCatalog) {
         itemList.push(item.description)
     }
     return itemList
   },

  //  vendorCouponList(){
  //    const couponList = []
  //    for(let item of this.savedFlyerList){
  //      couponList.push(item.flyerTitle)
  //    }
  //    return couponList
  //  }

  },

  
  methods: {

     close() {
      this.dialog = false;
      this.quantity = 0;
      this.rewardItemSelected = null;
     
    },

    deleteItem(index) {
    this.rewardItemsInChest.splice(index, 1)
    },

    editItem(item) {
      // console.log(item);
      this.editedIndex = this.itemCatalogList.indexOf(item);
      // console.log(this.editedIndex);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

  
    handleExit() {
      // this.itemCatalogList = [];
      this.promotionEventList = [],
      this.rewardItemSelected = "",
      this.rewardItemsInChest = [],
      this.exitDialog = false;
      this.itemsOnSaleSelected = []
     
      this.$store.setInDesign(false);
      this.$router.push("/");
    },

    handleCancel() {
      // this.itemCatalogList = [];
      this.rewardItemSelected = "",
      this.rewardItemsInChest = [],
      this.exitDialog = false;
      this.itemsOnSaleSelected = []
      this.eventTypeSelected = null
      this.flyerSelected = ''
      const list = [...this.promotionEventList]
      const shopItemName= this.currentShopItemName 
      const substituteItemName  = this.currentSubstituteItemName 
      Object.assign(this.$data, this.$options.data())
      this.promotionEventList = [...list]
      this.currentShopItemName = shopItemName
      this.currentSubstituteItemName = substituteItemName
    },
    
   onFilePicked(File) {
      if (File) {
        this.errMsgPic = "";
        // console.log(File);
        let filename = File.name;
        if (filename.lastIndexOf(".") <= 0) {
          this.errMsg = "Please add a valid file";
        }
        if (
          File.type === "image/jpeg" ||
          File.type === "image/png" ||
          File.type === "image/jpg" ||
          File.type === "image/gif"
        ) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(File);
          fileReader.addEventListener("load", () => {
            // console.log(fileReader.result);
            this.eventPhoto = fileReader.result;
          });
        } else {
          this.errMsgPic = "Not an image( jpeg, png, jpg, gif ) ";
        }
      } else {
        this.errMsgPic = "No new photos loaded yet ! ";
      }
    },

    saveRewardItems() {
      if (this.$refs.form.validate()) {
       if(this.rewardItemSelected != null && this.quantity > 0) {
         const itemSelected = _.split(this.rewardItemSelected, '_')
        //  console.log(itemSelected);
         this.rewardItemsInChest.push({
           itemName: itemSelected[0],
           quantity: this.quantity,
           icon: itemSelected[1],
         })
       }
        this.close();
      }
    },

    saveMonsterChest() {
      const firstPos = this.flyerSelected.indexOf("_")
      const lastPos = this.flyerSelected.lastIndexOf("_")
      const type = this.flyerSelected.substr(lastPos + 1)
      const title = this.flyerSelected.substr(0, firstPos)
      const id = this.flyerSelected.substr(firstPos + 1, lastPos - firstPos -1)
      console.log(id)
      const itemsToLoad = this.rewardItemsInChest.map(item => {
        return {itemName: item.itemName,
        quantity: item.quantity }
      })
      this.$store.updateMonsterChest({
        vendor: this.vendor.businessTitle,
        promotionItemTitle: title,
        promotionItemId: id,
        promotionType: type,
        rewardItems:  itemsToLoad
      })
      this.$store.setInDesign(false);
      this.$router.push("/");
    },

    saveOnSale() {
      if(this.$refs.onSaleForm.validate()) {

        if( this.eventTypeSelected == 'Game_Shop') {
         
        // const shopItemIndex = this.gamePropList.findIndex(item => item.itemName == this.itemToSubstituteSelected)
        // const substituteItemCodeIndex = this.gameSubstituteList.findIndex(item => item.itemName == this.substituteItemSelected)
        const vendorItemCodeIndex = this.allItemsCatalog.findIndex(item => item.description == this.substituteVendorItemSelected)
        // const bondCouponIdIndex = this.savedFlyerList.findIndex(item => item.flyerTitle == this.couponBond)
        // console.log(shopItemIndex)
        // console.log(substituteItemCodeIndex)
        // console.log(vendorItemCodeIndex)
        const substituteInput = {
            shopItemCode: this.itemToSubstituteSelected.itemCode,
            shopItemName: this.itemToSubstituteSelected.itemName,
            substituteItemCode: this.substituteItemSelected.itemCode,
            substituteItemName: this.substituteItemSelected.itemName,
            vendorItemCode: this.allItemsCatalog[vendorItemCodeIndex].itemCode,
            vendorItemPrice: this.allItemsCatalog[vendorItemCodeIndex].promoRate > 0 ? 
            this.allItemsCatalog[vendorItemCodeIndex].promoRate : this.allItemsCatalog[vendorItemCodeIndex].rate,
            // bondCouponId: this.savedFlyerList[bondCouponIdIndex].flyerId
        }
        this.$store.saveSubstituteItems({
          vendor: this.vendor.businessTitle, 
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
          input: substituteInput})
          this.$store.setInDesign(false);
        this.$router.go()

        } else {
           const input = {vendor: this.vendor._id,
                        vendorName: this.vendor.businessTitle,
                        eventType: this.eventTypeSelected,
                        eventPhoto: this.eventPhoto,
                        eventTitle: _.startCase(this.eventTitle),
                        eventInstruction: this.eventInstruction,
                        promotionItems: this.itemCodeListSelected,
                        dateFrom: this.dateFrom,
                        dateTo: this.dateTo,
                        postOnPortal: this.isOnPortal}

        console.log(input)
        this.$store.createPromotionEvent({input})
         this.$store.setInDesign(false);
        this.$router.go()
        }

       
      }
    }
  },
};
</script>
