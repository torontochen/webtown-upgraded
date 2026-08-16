<template>
      <v-card class="pa-4" flat rounded="3" >
        <v-card-text>
          <v-container fluid v-if="dealFulfillment.length>0">
            <v-data-iterator
              :items="dealFulfillment"
              :items-per-page="itemsPerPage"
              @update:items-per-page="itemsPerPage = $event"
              :page="page"
              @update:page="page = $event"
              :search="searchStatus"
              :sort-desc="sortDesc"
              hide-default-footer
            >
              <template v-slot:header>
                <v-toolbar dark dense flat color="primary" class="mb-1">
                
          <v-toolbar-title class="text-h6"> Deals  Fulfillment Status</v-toolbar-title>

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
                    <!-- <v-select
                          v-model="sortBy"
                          flat
                          solo-inverted
                          hide-details
                          :items="keys"
                          prepend-inner-icon="mdi-magnify"
                          label="Sort by"
                        ></v-select>
                        <v-spacer></v-spacer> -->
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
                    lg="3"
                  >
                    <v-tooltip top color="#424242">
                      <template v-slot:activator="{ on, attrs }">
                        <v-card class="pa-2" v-bind="attrs" v-on="on" max-width="500">
                          <v-card-subtitle>
                            <v-row class="d-flex align-center">
                              <v-col cols="4">
                                <v-avatar tile size="48"
                                  ><v-img :src="`/guildLogos/${item.logo}`"
                                /></v-avatar>
                              </v-col>
                              <v-col
                                cols="8"
                                class="text-subtitle-1 font-weight-bold accent--text"
                              >
                                {{ item.guild }}
                              </v-col>
                              <!-- <v-col cols="4">
                                <v-checkbox v-model="dealsCommited" :value="item._id"></v-checkbox>
                              </v-col> -->
                            </v-row>
                          </v-card-subtitle>

                          <v-divider></v-divider>

                          <v-card-text>
                               <v-row no-gutters class="my-2">
                                <v-col cols="12" class="text-body-2 accent--text">
                                     No:&nbsp;{{item.dealNo}}
                                </v-col>
                                
                            </v-row>
                            <v-row no-gutters class="my-2">
                              <v-col cols="7" class="text-caption secondary--text"
                                >Type: {{ item.type }}&nbsp;
                                <v-col
                                    cols="12"
                                    v-if="
                                    item.type ==
                                    'Specific Item Purchase'
                                    "
                                >
                                    <v-row
                                    v-for="(listItem, i) in item.specificItemList"
                                    :key="i" class="my-1"
                                    >{{ listItem }}</v-row
                                    >
                                </v-col>
                              </v-col>
                              <v-col cols="5" class="pl-3 fontColor--text text--darken-2 text-caption"
                                >Redeem: {{ item.term }}</v-col>
                            </v-row>

                            <v-row no-gutters class="my-2">
                                <v-col cols="9" class="text-caption">
                                     Amount:&nbsp;{{ $filters.formatCurrencyAmount(item.purchaseAmount) }}
                                </v-col>
                                <v-col cols="3" class="text-caption accent--text">
                                    {{item.active?'Active':'Expired'}}
                                </v-col>
                            </v-row>

                            <v-row no-gutters class="my-2">
                              <!-- <v-col cols="6" v-convert-date="{toOrFrom: 'From: ', date: item.dateFrom}"></v-col>
                              <v-col cols="6" v-convert-date="{toOrFrom: 'To: ', date: item.dateTo}"></v-col> -->
                              <v-col cols="6" class="text-caption"
                                >
                                {{ $filters.convertDate(item.dateFrom) }}</v-col
                              >
                              <v-col cols="6" class="text-caption"
                                >To: &nbsp;&nbsp;&nbsp;{{ $filters.convertDate(item.dateTo) }}</v-col
                              >
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </template>
                      <!-- tooltip content -->
                      <v-row>
                        <v-col cols="1">
                          <v-row class="my-1">Levels</v-row>
                          <v-row
                            v-for="(level, i) in item.dealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i + 1 }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1 ml-3">Condition</v-row>
                          <v-row
                            v-for="(level, i) in item.dealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i == 0 ? level.guildDealCondition : "" }}</v-row
                          >
                        </v-col>
                        <v-col cols="2">
                          <v-row class="my-1">Amount/ Mo.</v-row>
                          <v-row
                            v-for="(level, i) in item.dealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatCurrencyAmount(level.guildDealAmount) }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">RewardItems</v-row>
                          <v-row
                            v-for="(level, i) in item.dealLevels"
                            :key="i"
                            class="ma-1"
                          >
                            <v-icon>{{
                              rewardItemIcon(level.rewardItemsSelected[0])
                            }}</v-icon
                            >{{ rewardItemName(level.rewardItemsSelected[0]) }}
                          </v-row>
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">Rwd.Amt./ Mo.</v-row>
                          <v-row
                            v-for="(level, i) in item.dealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatIntAmount(level.rewardAmount) }}</v-row
                          >
                        </v-col>
                        <!-- Transaction -->
                      </v-row>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </template>

              <template v-slot:footer>
                <v-row class="mt-2" align="center" justify="center">
                  <!-- <span class="grey--text">Items per page</span>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            dark
                            text
                            color="primary"
                            class="ml-2"
                            v-bind="attrs"
                            v-on="on"
                          >
                            {{ itemsPerPage }}
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(number, index) in itemsPerPageArray"
                            :key="index"
                            @click="updateItemsPerPage(number)"
                          >
                            <v-list-item-title>{{ number }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu> -->

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
                    dark
                    depressed
                    color="primary"
                    class="ml-1"
                    @click="nextPage"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-data-iterator>
          </v-container>

          <v-container v-else class="mt-10">
              <v-img src="https://www.animatedimages.org/data/media/1802/animated-office-worker-image-0077.gif" height="200" width="200" class="ma-auto" contain></v-img>
              <v-row class="mt-3">
                <span class="text-h3 shade4--text font-weight-bold mx-auto">No Records ...</span>
              </v-row>
          </v-container>
        </v-card-text>
       
      </v-card>
</template>

<script>
import _ from "lodash";
import { mapGetters } from 'vuex'

export default {
    name: "GuildDealsFulfillment",
    data(){
        return {
            itemsPerPage: 12,
            page: 1,
            searchStatus: "",
            sortDesc: false,
        }
    },
    computed:{
        ...mapGetters(["vendor", "guildDeals", "guilds"]),

        dealFulfillment(){
            let fulfillmentResult = []
            console.log(this.guildDeals)
             this.guildDeals.map(deal => {
                if(deal.dealFulfillmentRecords.length > 0) {
                  for (let guild of this.guilds){
                    const index = deal.dealFulfillmentRecords.findIndex(record => guild.guildFullName == record.guild)
                    if (index < 0 ) continue
                    let amount = 0
                    for(let record of deal.dealFulfillmentRecords){
                        
                        if (guild.guildFullName == record.guild) {
                          amount += record.purchaseAmount
                        }
                        
                    }

                    const result = { purchaseAmount: amount, 
                                         guild: guild.guildFullName, 
                                         logo: guild.guildLogo,
                                         dealLevels: deal.guildDealLevels,
                                         dateFrom: deal.dateFrom,
                                         dateTo: deal.dateTo,
                                         dealNo: deal.dealNo,
                                         type: deal.guildDealType,
                                         term: deal.dealRedeemTerm,
                                         active: deal.active,
                                         specificItemList: deal.specificItemList
                                        }
                        fulfillmentResult.push(result)
                  }
                    
                }
            })
            console.log(fulfillmentResult)
            return fulfillmentResult
        },

        numberOfPages() {
        return Math.ceil(this.dealFulfillment.length / this.itemsPerPage);
        },
    },

    methods: {
        formerPage() {
        if (this.page - 1 >= 1) this.page -= 1;
        },

        nextPage() {
        if (this.page + 1 <= this.numberOfPages) this.page += 1;
        },

        rewardItemIcon(item) {
        const itemArray = _.split(item, "_", 2);
        return itemArray[1];
        },

        rewardItemName(item) {
        const itemArray = _.split(item, "_", 2);
        return itemArray[0];
        },
    }
    
}
</script>
