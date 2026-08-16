<template>
<v-container fluid>
    <v-card v-if="dealCate.length==0">
        <v-card-title>Deals for Guild</v-card-title>
        <v-card-text class="text-accent  text-subtitle-1">All types of guild deal are publised !</v-card-text>
        <v-row v-if="postedDeal.length>0" no-gutters>
            <v-col cols="6" v-for="(item, index) in postedDeal" :key="index">
                <v-tooltip top color="#424242" >
                      <template v-slot:activator="{ props }">
                           <v-card-subtitle v-bind="props" class="my-1"><v-icon color="primary">mdi-file-document</v-icon>&nbsp;Posted Deal:&nbsp;&nbsp;
                                <span class="text-primary font-weight-bold"><i class="text-accent font-weight-bold">{{item.dealNo}}</i>&nbsp;&nbsp;&nbsp;{{item.guildDealType}}
                                &nbsp;<i v-if='item.specificItemList.length>0'>({{specificItem(item.specificItemList)}})</i></span> 
                                &nbsp;&nbsp;{{ $filters.convertDate(item.dateFrom) }}&nbsp;&nbsp;to&nbsp;&nbsp;{{ $filters.convertDate(item.dateTo) }}
                            </v-card-subtitle>
                       
                      </template>
                      <!-- tooltip content -->
                      <v-row>
                        <v-col cols="1">
                          <v-row class="my-1">Levels</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i + 1 }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1 ml-3">Condition</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i == 0 ? l.guildDealCondition : "" }}</v-row
                          >
                        </v-col>
                        <v-col cols="2">
                          <v-row class="my-1">Amount/ Mo.</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatCurrencyAmount(l.guildDealAmount) }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">RewardItems</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                          >
                            <v-icon>{{
                              rewardItemIcon(l.rewardItemsSelected[0])
                            }}</v-icon
                            >{{ rewardItemName(l.rewardItemsSelected[0]) }}
                          </v-row>
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">Rwd.Amt./ Mo.</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatIntAmount(l.rewardAmount) }}</v-row
                          >
                        </v-col>
                        <!-- Transaction -->
                      </v-row>
        </v-tooltip>
            </v-col>
        </v-row>
    </v-card>
    <v-card outlined max-width="2000px" class="pa-5" v-else>
        <v-btn
            color="primary" icon
            theme="dark" 
            top
            right
            absolute
            style="top: 10px"
            @click="isDealInputOpen=true"
            :disabled="!isOkToAdd"
            >
            <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-card-title>Deals for Guild</v-card-title>
        <v-row v-if="postedDeal.length>0" no-gutters>
            <v-col cols="6" v-for="(item, index) in postedDeal" :key="index">
                <v-tooltip top color="#424242" >
                      <template v-slot:activator="{ props }">
                           <v-card-subtitle v-bind="props" class="my-1"><v-icon color="primary">mdi-file-document</v-icon>&nbsp;Posted Deal:&nbsp;&nbsp;
                                <span class="text-primary font-weight-bold"><i class="text-accent font-weight-bold">{{item.dealNo}}</i>&nbsp;&nbsp;&nbsp;{{item.guildDealType}}
                                &nbsp;<i v-if='item.specificItemList.length>0'>{{specificItem(item.specificItemList)}}</i></span> 
                                &nbsp;&nbsp;{{ $filters.convertDate(item.dateFrom) }}&nbsp;&nbsp;to&nbsp;&nbsp;{{ $filters.convertDate(item.dateTo) }}
                            </v-card-subtitle>
                       
                      </template>
                      <!-- tooltip content -->
                      <v-row>
                        <v-col cols="1">
                          <v-row class="my-1">Levels</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i + 1 }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1 ml-3">Condition</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i == 0 ? l.guildDealCondition : "" }}</v-row
                          >
                        </v-col>
                        <v-col cols="2">
                          <v-row class="my-1">Amount/ Mo.</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatCurrencyAmount(l.guildDealAmount) }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">RewardItems</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                          >
                            <v-icon>{{
                              rewardItemIcon(l.rewardItemsSelected[0])
                            }}</v-icon
                            >{{ rewardItemName(l.rewardItemsSelected[0]) }}
                          </v-row>
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">Rwd.Amt./ Mo.</v-row>
                          <v-row
                            v-for="(l, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatIntAmount(l.rewardAmount) }}</v-row
                          >
                        </v-col>
                        <!-- Transaction -->
                      </v-row>
        </v-tooltip>
            </v-col>
        </v-row>
       
         <v-divider class="mb-2"></v-divider>
         
            <v-row class="d-flex justify-start">
                <v-col :cols="figureCols">
                    <v-select
                     required
                    label="Deal Type"
                    :items="dealCate"
                    v-model="dealType"
                    :disabled="guildDealLevels.length>0">
                    </v-select>
                </v-col>
                 <v-col cols="3" v-if="dealType=='Specific Item Purchase'">
                    <v-select
                    class="mt-5"
                    label="Specific Items"
                    :items="itemsCatalog"
                    v-model="specificItemList"
                    :rules="rewardItemsSelectedRules"
                    :disabled="guildDealLevels.length>0"
                     required
                    density="compact"
                    multiple>
                    </v-select>
                </v-col>
                <v-col cols="1">
                    <v-select
                    label="Redeem Term"
                     required
                    :items="dealTerms"
                    :rules="dealRule"
                    v-model="dealTerm"
                    :disabled="guildDealLevels.length>0">
                    </v-select>
                </v-col>
                <!-- from date -->
                <v-col cols="2">
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
                        :disabled="guildDealLevels.length>0"
                        ></v-text-field>
                    </template>
                    <!-- v-model targets the dateModel computed: Vuetify 3's
                         picker emits a Date, the app stores YYYY-MM-DD. The
                         @change that used to close the menu is gone in
                         Vuetify 3 — the picker only emits update:modelValue. -->
                    <v-date-picker
                        v-model="dateFromModel"
                        @update:model-value="fromPicker = false"
                        :min="currentDate"
                        :max="dateTo"
                    ></v-date-picker>
                    </v-menu>
                </v-col>

                <!-- to date -->
                <v-col cols="2">
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
                        :disabled="guildDealLevels.length>0"
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="dateToModel"
                        @update:model-value="toPicker = false"
                        :min="dateFrom"
                    ></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
        <v-card-text>
            <!-- Deal list -->
            <v-table v-if="guildDealLevels.length>0">
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left" >
                        Type
                    </th>
                    <th class="text-left" v-if="dealType=='Specific Item Purchase'">
                        Specific Items
                    </th>
                    <th class="text-left" >
                        Deal Level
                    </th>
                    <th class="text-left" >
                        Condition
                    </th>
                    <th class="text-left" >
                        Amount($)
                    </th>
                    <th class="text-left">
                        Reward Items
                    </th>
                    <th class="text-left">
                        Reward Amount
                    </th>
                    <th class="text-left">
                        Redeem Term
                    </th>
                    <th class="text-left">
                        Effective From
                    </th>
                    <th class="text-left">
                        To
                    </th>
                    <th class="text-left">
                        Action
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>{{dealType}}</td>
                    <!-- <td>{{ item.guildDealType == 'Specific Item Purchase' ? " " : item.guildDealCondition }}</td>
                    <td>{{ item.guildDealType == 'Specific Item Purchase' ? " " : item.guildDealAmount }}</td> -->
                    <td v-if="dealType=='Specific Item Purchase'">
                        <v-row v-for="(specItem, i) in specificItemList" :key="i" class="my-2">
                            {{specItem}}
                        </v-row>
                    </td>
                    <td>
                        <v-row v-for="(level, i) in guildDealLevels" :key="i" class="my-2 ml-1">{{i+1}}</v-row>
                    </td>
                    <td>
                        <v-row v-for="(level, i) in guildDealLevels" :key="i" class="my-2">{{level.guildDealCondition}}</v-row>
                    </td>
                    <td>                        
                        <v-row v-for="(level, i) in guildDealLevels" :key="i" class="my-2 ml-1">{{ $filters.formatCurrencyAmount(level.guildDealAmount) }}</v-row>
                    </td>
                    <td>
                        <v-row v-for="(level, i) in guildDealLevels" :key="i" class="my-2">
                            <v-icon>{{rewardItemIcon(level.rewardItemsSelected[0])}}</v-icon>{{ rewardItemName(level.rewardItemsSelected[0]) }}
                        </v-row>
                        </td>
                    <td>
                        <v-row v-for="(level, i) in guildDealLevels" :key="i" class="my-2 ml-1">{{ $filters.formatAmount(level.rewardAmount) }}</v-row>
                    </td>
                    <td>{{ dealTerm }}</td>
                    <!-- <td v-convert-date="{toOrFrom: 'From: ', date: item.dateFrom}"></td>
                    <td v-convert-date="{toOrFrom: 'To: ', date: item.dateTo}"></td> -->
                    <td >{{dateFrom  }}</td>
                    <td >{{dateTo }}</td>
                    <td>
                        <v-icon size="24" @click="deleteItem(i)"> mdi-delete </v-icon>
                    </td>
                    </tr>
                </tbody>
                </template>
            </v-table>

 
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" @click="exitDialogue=true">
                Exit
            </v-btn>
            <v-btn variant="text" color="primary"  @click="post" :disabled="!guildDealLevels.length>0"> Post </v-btn>
        </v-card-actions>
    </v-card>
    
            <!-- deals input dialogue -->
            <v-dialog v-model="isDealInputOpen" persistent max-width="1000px">
                <v-card outlined width="1000px" max-height="900px" class="pa-6" style="border-top: 15px solid #B75420">
                    <v-card-title>Guild Deal</v-card-title>
                    <v-form v-model="isDealOk" lazy-validation ref="form" @submit.prevent="save">
                        <!-- total purchase -->
                        <v-row class="d-flex justify-center align-center" >
                            <v-col cols="2">
                                {{"Level " + (guildDealLevels.length + 1)}}
                            </v-col>

                            <v-col cols="6">
                                <v-select
                                label="Condition"
                                :items="dealCondition"
                                v-model="dealCon">
                                </v-select>
                            </v-col>

                            <v-col cols="4">
                                <v-text-field
                                    label="Amount"
                                    v-model.number="dealAmount"
                                    :rules="dealAmountRules"
                                     required
                                    prefix="$">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-row class="d-flex justify-start align-center">
                            <v-col cols="6">
                                 <v-select variant="outlined"
                                      label="Reward Items"
                                      v-model="rewardItemsSelected"
                                      :items="rewardItemsToSelect"
                                      :rules="rewardItemsSelectedRules" density="compact"
                                      multiple
                                      required
                                      >
                                      <!-- <template v-slot:selection="{ item }">
                                        {{ item.itemName }}
                                        </template> -->
                                        <template v-slot:item="{item}">
                                            <div>
                                                <v-row class="my-1 d-flex-inline justify-start align-center">
                                                <v-img src="/static/animated-money-image-0013.gif" height="40" width="40" />
                                                &nbsp;&nbsp;&nbsp;&nbsp;{{item.itemName}}
                                                </v-row>
                                            </div>
                                        </template>
                                      </v-select>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field
                                    label="Amount for reward item"
                                    v-model.number="rewardAmount"
                                    :rules="dealAmountRules"
                                     required
                                    >
                                </v-text-field>
                            </v-col>
                             
                        </v-row>

                      <v-row>
                              <v-spacer></v-spacer>
                              <v-btn variant="text" color="warning"  v-if="dealError!=' '">{{dealError}}</v-btn>
                              <v-spacer></v-spacer>
                          </v-row>
                     <v-row class="d-flex justify-end">
                        <v-spacer></v-spacer>

                        <v-btn variant="text" color="accent" :disabled="!isDealOk" type="submit"> Save </v-btn>

                        <v-btn variant="text" color="accent"  @click="handleCancel"> Cancel </v-btn>

                    </v-row>
                    </v-form>
                </v-card>
            </v-dialog>

            <!-- Exit dialogue -->
            <v-dialog v-model="exitDialogue" max-width="500px" >
                <v-card class="pa-5" style="border-top: 15px solid #B75420">
                    <v-card-text class="text-h6 text-accent"
                    >Exit, Are you sure ?</v-card-text
                    >
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    
                    <v-btn variant="text" color="primary" @click="close"
                        >OK</v-btn
                    >
                    <v-btn variant="text" color="accent"  @click="exitDialogue=false"
                        >Cancel</v-btn
                    >
                    <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </v-dialog>

  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";
import { GET_REWARD_ITEMS } from "../../queries/queries_query"
import moment from 'moment'
import _ from "lodash"
import { dateModel } from "../../utils/dateModel"

export default {
    name: "guildDeal",
    data() {
        return {
            isDealInputOpen: false,
            isDealOk: false,
            postedDeal: [],
            postedDealLevels: null,
            postedDealNo: null,
            dateFrom: null,
            dealCate: [],
            dealCondition: ["More Than (less than next level)"],
            dealAmount: 0,
            dealAmountRules:[
                (amount) => amount > 0 || "Deal Amout must be greater than 0"],
            dealCon: '>= (< next level)',
            dealError: ' ',
            dealType: null,
            dealTerms: ["By Month", "By Quarter", "By Year"],
            dealTerm: 'By Month',
            dealRule:[
                (item) => !!item || "Must Select One"
            ],
            exitDialogue: false,
            fromPicker: false,
            fromDateRules: [
                (dateFrom) => !!dateFrom || "From Date is required!",
            ],
            guildDealLevels: [],
            rewardItemsSelected: [],
            rewardItemsSelectedRules:[
                (items) => items.length > 0 || "One reward item is required!"
            ],
            rewardAmount: 0,
            specificItemList: [],
            toPicker: false,
            dateTo: null,
            toDateRules: [
                (dateTo) => !!dateTo || "To Date is required!",
            ]
        }

    },

   

    mounted() {
    

    window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      event.returnValue = "ok";
    });

    console.log(this.guildDeals)

    if(this.guildDeals.length > 0) {
        for (let deal of this.guildDeals) {
        if (deal.vendor == this.vendor.businessTitle) {
            let levels = deal.guildDealLevels.map( item => item)
            console.log(levels)
            this.postedDeal.push({
            guildDealType: deal.guildDealType,
            dateFrom: deal.dateFrom,
            dateTo: deal.dateTo,
            guildDealLevels: levels,
            dealNo: deal.dealNo,
            specificItemList: deal.specificItemList
            })
            
        }
        }

        console.log(this.postedDeal)
       
    }
   
    this.$apollo
          .query({query: GET_REWARD_ITEMS})
          .then(({data}) => {
            this.$store.setRewardItems(data.getRewardItems)
          })

        if(this.guildDeals.length == 1) {
                switch (this.guildDeals[0].guildDealType) {
                    case "Total Purchase":
                        this.dealCate = ["Specific Item Purchase"];
                        this.dealType = "Specific Item Purchase"
                        break;
                    case "Specific Item Purchase":
                        this.dealCate = ["Total Purchase"]
                        this.dealType ="Total Purchase"
                        break
                }
        } else if(this.guildDeals.length >= 2) {
            this.dealCate = []
        } else {
            this.dealCate = ["Total Purchase", "Specific Item Purchase"]
            this.dealType ="Total Purchase"
        }
        if(this.dealCate.length == 0 ) {
            this.$store.setInDesign(false);
        }
    },

    computed: {
        // Vuetify 3's picker emits a Date; the app stores YYYY-MM-DD. See
        // src/utils/dateModel.js for why the string model was kept.
        dateFromModel: dateModel("dateFrom"),
        // Vuetify 3's picker emits a Date; the app stores YYYY-MM-DD. See
        // src/utils/dateModel.js for why the string model was kept.
        dateToModel: dateModel("dateTo"),
    ...mapState(useMainStore, ["vendor", "rewardItems", "allItemsCatalog", "guildDeals"]),

    currentDate() {
        return moment(Date.now()).format("YYYY-MM-DD");
    },

    figureCols() {
        return this.dealType == "Specific Item Purchase" ? 3 : 6
    },

    isOkToAdd() {
        if(this.dealType == "Total Purchase") {
                return this.dealType && this.dealTerm && this.dateFrom && this.dateTo ? true : false
        }
        if(this.dealType == "Specific Item Purchase") {
            return this.dealType && this.specificItemList.length > 0 && this.dealTerm && this.dateFrom && this.dateTo ? true : false
        }
    },

   

    itemsCatalog() {
        if(this.allItemsCatalog) {
            return this.allItemsCatalog.map(item => {
                return item.description
            })
        }
    },

    rewardItemsToSelect() {
      if(this.rewardItems){
         return this.rewardItems.map(item => {
             return item.itemName + "_" + item.icon
        })
      }
    },

    

    },

    methods: {

        close() {
            this.guildDealLevels = []
            this.$store.setInDesign(false);
            this.$router.push("/")
        },

        deleteItem(index) {
           this.guildDeals.splice(index, 1)
        },

        handleCancel() {
            this.$refs.form.reset()
            this.isDealInputOpen = false
        },

       

        post() {
            // console.log(this.guildDeals)
            // let vendorCate
            // if(this.vendor.businessCategory[0].indexOf('-') > -1) {
            //      vendorCate = _.split(this.vendor.businessCategory[0], '-')
            // } else {
            //     vendorCate = this.vendor.businessCategory[0]
            // }

            
            const guildDealsToSave = {
                    vendor: this.vendor.businessTitle,
                    vendorLogo: this.vendor.logo,
                    vendorCategory: this.vendor.businessCategory,
                    guildDealType: this.dealType,
                    dealRedeemTerm: this.dealTerm,
                    guildDealLevels: this.guildDealLevels,
                    specificItemList: this.specificItemList.length > 0 ? this.specificItemList : [],
                    dateFrom: this.dateFrom.toString(),
                    dateTo: this.dateTo.toString()
            }
            // console.log(guildDealsToSave)

            this.$store.saveGuildDeals({input:  guildDealsToSave})
            this.$store.setInDesign(false);
            // this.$router.push("/")
            
        },

        rewardItemIcon(item){
            const itemArray = _.split(item, '_', 2)
            // console.log(itemArray)
            return itemArray[1]
        },
        rewardItemName(item){
            const itemArray = _.split(item, '_', 2)
            // console.log(itemArray)
            return itemArray[0]
        },

        specificItem(list){
            let items = ''
            for(let item of list){
                items = items  + item + ','
            }
            return items
        },

        save() {
            this.dealError = ' '
            if(this.rewardAmount > this.dealAmount * 1000){
                this.dealError = 'The Reward Is Over The Deal Amount!!!'
            }
            if(this.$refs.form.validate()) {
                this.guildDealLevels.push({
                    guildDealCondition: this.dealCon,
                    guildDealAmount: this.dealAmount,
                    rewardItemsSelected: this.rewardItemsSelected,
                    rewardAmount: this.rewardAmount,
                })
                // console.log(this.guildDealLevels)

                this.$refs.form.reset()
                this.isDealInputOpen = false
            }
        }
    }
}

</script>

    