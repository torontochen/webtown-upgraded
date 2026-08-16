<template>
    
    <v-container fluid>
        <v-card outlined >
            <v-card-title>Guild Deals Published</v-card-title>
            <v-card-text>
            <!-- Deal list -->
            <v-table v-if="guildDeals">
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left" >
                        Type
                    </th>
                    <th class="text-left" >
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
                        Term
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
                <tbody >
                    <tr v-for="(deal, dealIndex) in guildDeals" :key="dealIndex">
                    <td>{{deal.guildDealType}}</td>
                   
                    <td v-if="deal.guildDealType=='Specific Item Purchase'">
                        <v-row v-for="(specItem, index) in deal.specificItemList" :key="index" class="my-2">
                            {{ specItem }}
                        </v-row>
                    </td>
                    <td v-else></td>
                    <td>
                        <v-row v-for="(level, i) in deal.guildDealLevels" :key="i" class="my-2">{{i+1}}</v-row>
                    </td>
                    <td>
                        <v-row v-for="(level, i) in deal.guildDealLevels" :key="i" class="my-2">{{level.guildDealCondition}}</v-row>
                    </td>
                    <td>                        
                        <v-row v-for="(level, i) in deal.guildDealLevels" :key="i" class="my-2">{{ $filters.formatCurrencyAmount(level.guildDealAmount) }}</v-row>
                    </td>
                    <td>
                        <v-row v-for="(level, i) in deal.guildDealLevels" :key="i" class="my-2">
                            <v-icon>{{rewardItemIcon(level.rewardItemsSelected[0])}}</v-icon>{{ rewardItemName(level.rewardItemsSelected[0]) }}
                        </v-row>
                        </td>
                    <td>
                        <v-row v-for="(level, i) in deal.guildDealLevels" :key="i" class="my-2">{{level.rewardAmount}}</v-row>
                    </td>
                    <td>{{ deal.dealRedeemTerm }}</td>

                    <!-- <td v-convert-date="{toOrFrom: 'From: ', date: deal.dateFrom}"></td>
                    <td v-convert-date="{toOrFrom: 'To: ', date: deal.dateTo}"></td> -->
                    <td >From: {{ $filters.convertDate(item.dateFrom) }}</td>
                    <td >To: {{ $filters.convertDate(item.dateTo) }}</td>
                    <td>
                        <v-tooltip right color="#757575">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                :outlined="!deal.active"
                                :depressed="!deal.active"
                                color="#039BE5"
                                :dark="deal.active"
                                @click="toggleDealActive(deal.active, dealIndex)" v-bind="props">{{deal.active ? "Active" : "Deactivated"}}</v-btn>
                            </template>
                            <span>{{deal.active ? "Deactivate" : "Activate"}}</span>
                            </v-tooltip>
                    </td>
                    </tr>
                </tbody>
                </template>
            </v-table>
            </v-card-text>
        </v-card>
    </v-container>
    
</template>


<script>

import _ from "lodash";
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";
import moment from 'moment'


 export default {
     name: "manageGuildDeals",
    data() {
        return {
                DealActive: null
        }
    },
    mounted() {
        console.log(this.guildDeals)
        
     },
    computed: {
        ...mapState(useMainStore, ["vendor", "guildDeals"]),
        isDealActive() {

        }
       
   },
   watch: {
       guildDeals(val) {
           console.log(val)
       }
   },
    methods: {
        
        rewardItemIcon(item){
            const itemArray = _.split(item, '_', 2)
            return itemArray[1]
        },
        rewardItemName(item){
            const itemArray = _.split(item, '_', 2)
            return itemArray[0]
        },
        toggleDealActive(isDealActive, index){
            this.guildDeals[index].active = !isDealActive
            this.$store.toggleGuildDealActive({ dealId: this.guildDeals[index]._id, isActive: !isDealActive})
        }
    }
} 
</script>

<style lang="scss" scoped>

</style>