<template>
    <v-card flat outlined density="compact">
        <!-- Daily  -->
        <v-card-text>
            <v-card class="rounded-lg" elevation="5">
                <v-card-title class="text-center text-h3 font-weight-bold text-accent">{{today}}</v-card-title>
                <v-card-text>
                    <v-row class="d-flex flex-row justify-space-around align-center">
                        <v-card-title>Sales:&nbsp;{{ $filters.formatCurrencyAmount(vendorSalesInfo.dailySales.sales) }}</v-card-title>
                        <v-card-title>Orders:&nbsp;{{vendorSalesInfo.dailySales.orders}}</v-card-title>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-card-text>

        <!-- Month To Date  -->
        <v-card-text>
        <v-card class="rounded-lg" elevation="5">
            <v-card-title>Month To Date</v-card-title>

            <!-- monthToDate Sales -->
            <v-card-text>
                <v-col cols="12">
                    <span class="d-block text-h5 text-accent font-weight-bold text-center">Sales &nbsp;(&nbsp;{{ $filters.formatCurrencyAmount(salesMTD) }}&nbsp;)</span>
                    <v-row class="d-flex flex-row justify-space-around align-center my-2" no-gutters>
                        <v-col cols="1" v-for="(item, i) in vendorSalesInfo.monthToDateSales" :key="i" class="d-flex flex-column justify-start align-center ">
                            <span class="text-body-2 my-1 font-weight-bold text-accent" >{{i+1}}</span>
                            <span class="text-body-2 my-1">{{ $filters.formatCurrencyAmount(item.sales) }}</span>
                        </v-col>
                    </v-row>

                     
                    <v-sheet color="primary" class="pa-2" rounded>
                        <v-sparkline
                        :value="monthToDateSalesSparkLine"
                        :labels="dateOfMonth"
                        color="primary lighten-4"
                        
                        >
                        </v-sparkline>
                        <v-row class="my-2">
                            <v-spacer></v-spacer>
                            <span class="text-h6 font-weight-bold text-primary">Sales</span>
                            <v-spacer></v-spacer>
                        </v-row>
                    </v-sheet>
                </v-col>
                </v-card-text>
               <v-card-text>
                   <v-divider></v-divider>

                <!-- monToDate Orders -->
                <v-col cols="12">
                    <span class="d-block text-h5 text-accent font-weight-bold text-center">Orders&nbsp;(&nbsp;{{ $filters.formatIntAmount(ordersMTD) }}&nbsp;)</span>

                    <v-row class="d-flex flex-row justify-space-around align-center my-2">
                         <v-col cols="1" v-for="(item, i) in vendorSalesInfo.monthToDateSales" :key="i" class="d-flex flex-column justify-start align-center ">
                            <span class="text-body-2 my-1  font-weight-bold text-accent">{{i+1}}</span>
                            <span class="text-body-2 my-1">{{ $filters.formatIntAmount(item.orders) }}</span>
                        </v-col>
                      </v-row>  

                    <v-sheet color="primary" class="pa-2" rounded>
                        <v-sparkline
                        :value="monthToDateOrdersSparkLine"
                        :labels="dateOfMonth"
                        color="primary lighten-4"
                        >
                        </v-sparkline>
                         <v-row class="my-2">
                            <v-spacer></v-spacer>
                            <span class="text-h6 font-weight-bold text-primary">Orders</span>
                            <v-spacer></v-spacer>
                        </v-row>
                    </v-sheet>
                </v-col>
            </v-card-text>
        </v-card> 
        </v-card-text>


        <!-- Year To Date  -->
        <v-card-text>
        <v-card class="rounded-lg" elevation="5">
            <v-card-title>Year To Date</v-card-title>

            <!-- YearToDate Sales -->
            <v-card-text>
                <v-col cols="12">
                    <span class="d-block text-h5 text-accent font-weight-bold text-center">Sales&nbsp;(&nbsp;{{ $filters.formatCurrencyAmount(salesYTD) }}&nbsp;)</span>

                    <v-row class="d-flex flex-row justify-space-around align-center my-2">
                        <v-col cols="1" v-for="(item, i) in vendorSalesInfo.yearToDateSales" :key="i" class="d-flex flex-column justify-start align-center ">
                            <span class="text-body-2 font-weight-bold my-1 text-accent">{{i+1}}</span>
                            <span class="text-body-2 my-1">{{ $filters.formatCurrencyAmount(item.sales) }}</span>
                        </v-col>
                    </v-row>

                     
                    <v-sheet color="primary" class="pa-2" rounded>
                        <v-sparkline
                        :value="yearToDateSalesSparkLine"
                        :labels="month"
                        color="primary lighten-4"
                        >
                        </v-sparkline>
                         <v-row class="my-2">
                            <v-spacer></v-spacer>
                            <span class="text-h6 font-weight-bold text-primary">Sales</span>
                            <v-spacer></v-spacer>
                        </v-row>
                    </v-sheet>
                </v-col>
                </v-card-text>

                <!-- YearToDate Orders -->
               <v-card-text>
                
                <v-col cols="12">
                    <span class="d-block text-h5 text-accent font-weight-bold text-center">Orders&nbsp;(&nbsp;{{ $filters.formatIntAmount(ordersYTD) }}&nbsp;)</span>

                    <v-row class="d-flex flex-row justify-space-around align-center my-2">
                         <v-col cols="1" v-for="(item, i) in vendorSalesInfo.yearToDateSales" :key="i" class="d-flex flex-column justify-start align-center ">
                            <span class="text-body-2 font-weight-bold my-1 text-accent">{{i+1}}</span>
                            <span class="text-body-2 my-1">{{ $filters.formatIntAmount(item.orders) }}</span>
                        </v-col>
                      </v-row>  

                    <v-sheet color="primary" class="pa-2" rounded>
                        <v-sparkline
                        :value="yearToDateOrdersSparkLine"
                        :labels="month"
                        color="primary lighten-4"
                        >
                        </v-sparkline>
                         <v-row class="my-2">
                            <v-spacer></v-spacer>
                            <span class="text-h6 font-weight-bold text-primary">Orders</span>
                            <v-spacer></v-spacer>
                        </v-row>
                    </v-sheet>
                </v-col>
            </v-card-text>
        </v-card> 
        </v-card-text>
    </v-card>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";
import moment from 'moment'


export default {
   name: "vendorSalesStatistic",

   data(){
       return {
           month:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
           
       }
   },
   computed:{
       ...mapState(useMainStore, ["vendorSalesInfo"]),

       dateOfMonth(){
           return this.vendorSalesInfo.monthToDateSales.map((item, i)=>{
               return (i+1).toString()
           })
       },

       monthToDateSalesSparkLine(){
           return this.vendorSalesInfo.monthToDateSales.map(item => {
               return item.sales
           })
       },
       monthToDateOrdersSparkLine(){
           return this.vendorSalesInfo.monthToDateSales.map(item => {
               return item.orders
           })
       },
       salesMTD(){
           let salesMTD = 0
           this.vendorSalesInfo.monthToDateSales.map(item => {
               salesMTD += item.sales
           })
           return salesMTD 
       },
       ordersMTD(){
           let ordersMTD = 0
           this.vendorSalesInfo.monthToDateSales.map(item => {
               ordersMTD += item.orders
           })
           return ordersMTD 
       },
       salesYTD(){
           let salesYTD = 0
           this.vendorSalesInfo.yearToDateSales.map(item => {
               salesYTD += item.sales
           })
           return salesYTD 
       },
       ordersYTD(){
           let ordersYTD = 0
           this.vendorSalesInfo.yearToDateSales.map(item => {
               ordersYTD += item.orders
           })
           return ordersYTD 
       },
       yearToDateSalesSparkLine(){
           return this.vendorSalesInfo.yearToDateSales.map(item => {
               return item.sales
           })
       },
       yearToDateOrdersSparkLine(){
           return this.vendorSalesInfo.yearToDateSales.map(item => {
               return item.orders
           })
       },

       today(){
           return moment(Date.now()).format("YYYY-MM-DD")
       }
   }
}
</script>
