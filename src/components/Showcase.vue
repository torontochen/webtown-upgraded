<template>
    <v-card flat color="shade" class="mb-3">
        <slot>
        <!-- Store -->
        <v-card-text>
            <v-row density="compact" class="d-flex flex-row flex-wrap">
                <v-col cols="3" v-for="(item, i) in itemList" :key="i" >
                <v-card class="pa-2 rounded-lg"  @click="toSingleCatalogItem(item)"  v-if="item.active" style="box-shadow: 0 12px 50px 2px #13507c24;">
                        <v-img
                            :src="item.photo"
                            class="text-white ma-auto"
                            height="250"
                            width="250"
                        >
                        <v-img v-if="item.promoRate>0" src="../assets/images/sales_images__1_-removebg-preview.png" width="100" height="80" contain style="position: absolute; top: 5px; right: -10px"></v-img>
                        </v-img>
                        <v-card-text class="text-silver">
                            <v-row>
                                <v-icon color="silver darken-2">mdi-coin</v-icon><span class="mx-1">{{item.rewardSilver > 0 ? item.rewardSilver: 0}}</span>
                            </v-row>
                            <v-row>
                                <v-card-title v-text="item.description" class="text-fontColor text-subtitle-1 text--darken-1 text-truncate d-inline-block"></v-card-title>

                            </v-row>
                            
                        </v-card-text>
                        <v-card-actions v-if="item.promoRate>0">
                        <v-spacer></v-spacer>
                            <span   class="text-h6 text-red font-weight-bold mr-1" >{{ $filters.formatCurrencyAmount(item.promoRate) }}</span>
                            <span  class="text-subtitle-2 text--lighten-1  text-fontColor" ><del>{{ $filters.formatCurrencyAmount(item.rate) }}</del></span>
                        </v-card-actions>
                        <v-card-actions v-else>
                        <v-spacer></v-spacer>
                            <span  class="text-h6 font-weight-bold  text-fontColor" >{{ $filters.formatCurrencyAmount(item.rate) }}</span>
                        </v-card-actions>
                </v-card>
            </v-col>
            </v-row>
        </v-card-text>
    </slot>
    </v-card>
</template>

<script>

export default {
    name: "Showcase",
    props: ['itemList', 'vendor'],
    data() {
        return {

        }
    },
   
    methods: {
        
       toSingleCatalogItem(item) {
           
           this.$router.push({name: "singleCatalogItem", params: {itemCode: item.itemCode}, query: {vendor: this.vendor}})
           
       }
    }
}
</script>

<style lang="scss" scoped>

.basil {
background-color: #FFFBE6 !important;
}

.basil--text {
color: #356859 !important;
}
</style>

    