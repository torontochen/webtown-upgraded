<template>
  <v-container fluid>
   
      <v-card flat class="pa-3">
        <v-toolbar theme="dark" density="compact" color="primary" flat>
          <v-toolbar-title>Membership</v-toolbar-title>
        </v-toolbar>

      <v-table fixed-header>
        <template v-slot:default>
          <thead>
            <tr>

              <th >
                <span class="text-h4 text-weight-bold text--silverMembership ">&nbsp;&nbsp;&nbsp; 
                </span>
              </th>
              <th >
                <span class="text-h5 text-weight-bold text--silverMembership ">Silver
                  <v-icon large color="silverMembership">mdi-credit-card-outline</v-icon>
                </span>
              </th>
              <th >
                <span class="text-h5 text-weight-bold text--goldMembership ">Gold
                  <v-icon large color="goldMembership">mdi-credit-card-outline</v-icon>
                </span>
              </th>
              <th >
                <span class="text-h5 text-weight-bold text--platinumMembership ">Platinum
                  <v-icon large color="platinumMembership">mdi-credit-card-outline</v-icon>
                </span>
              </th>
              
            </tr>
          </thead>
          <tbody>
            <tr class="my-3">
              <td class="text--primary text-weight-bold">Free Web pages</td>
              <td class="text--primary">Yes</td>
              <td class="text--primary">Yes</td>
              <td class="text--primary">Yes</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold">Free Online Flyer Design</td>
              <td class="text--primary">Yes</td>
              <td class="text--primary">Yes</td>
              <td class="text--primary">Yes</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold">Free Campaign Kanban</td>
              <td class="text--primary">No</td>
              <td class="text--primary">Yes</td>
              <td class="text--primary">Yes</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold">Free Flyer Distr. Quota / Mo. </td>
              <td class="text--primary">5000</td>
              <td class="text--primary">20,000</td>
              <td class="text--primary">50,000</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold">Target Distr. Surcharge Per Metric </td>
              <td class="text--primary">$0.05</td>
              <td class="text--primary">$0.03</td>
              <td class="text--primary">$0.02</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold text-subtitle-1">Fees / Mo. </td>
              <td class="text--primary text-weight-bold text-subtitle-1">$199</td>
              <td class="text--primary text-weight-bold text-subtitle-1">$599</td>
              <td class="text--primary text-weight-bold text-subtitle-1">$1,599</td>
            </tr>
            <tr class="my-3">
              <td class="text--primary text-weight-bold text-subtitle-1">&nbsp;&nbsp;&nbsp;</td>
              <td class="text--primary text-weight-bold text-subtitle-1">
                <v-checkbox  @change="memberShip='Silver'" v-if="memberShip!='Silver'">
                                   
                </v-checkbox>
                <v-icon large color="primary" v-if="memberShip=='Silver'">mdi-thumb-up</v-icon>
              </td>
              <td class="text--primary text-weight-bold text-subtitle-1">
                <v-checkbox @change="memberShip='Gold'" v-if="memberShip!='Gold'">
                  
                </v-checkbox>
                <v-icon large color="primary" v-if="memberShip=='Gold'">mdi-thumb-up</v-icon>
              </td>
              <td class="text--primary text-weight-bold text-subtitle-1">
                <v-checkbox  @change="memberShip='Platinum'" v-if="memberShip!='Platinum'">
                </v-checkbox>
                 <v-icon large color="primary" v-if="memberShip=='Platinum'">mdi-thumb-up</v-icon>
              </td>
             
            </tr>
          </tbody>
        </template>
      </v-table>
      <v-divider class="my-2"></v-divider>
        <v-col  class="text-right text-subtitle-2 text-primary ma-3 pa-3">
            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-right">Membership Amount:&nbsp;{{ $filters.formatCurrencyAmount(memberShipFees) }}</span><br>
            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-right">HST(13%):&nbsp;{{ $filters.formatCurrencyAmount(memberShipFees * 0.13) }}&nbsp;</span><br>
            <span class="text-subtitle-2 font-weight-bold my-1 ml-5 d-inline-block text-right">Total Amount:&nbsp;{{ $filters.formatCurrencyAmount(memberShipFees * 1.13) }}</span><br>
        </v-col>
      <v-divider class="my-2"></v-divider>
      <v-card-actions>
        <v-row class="ml-4">
           <v-radio-group
                        v-model="payBy"
                        row
                        class="d-flex justify-center"
                        >

                        <v-radio
                            value="creditcard"
                        >
                        <template v-slot:label>
                            <div><v-img src="/static/credit_card-removebg-preview.png" max-height="60" max-width="80"></v-img></div>
                        </template>
                        </v-radio>
                        <v-radio
                            value="paypal"
                        >
                        <template v-slot:label>
                            <div><v-img src="/static/paypal-logo-no-background-png-removebg-preview.png" max-height="60" max-width="80"></v-img></div>
                        </template>
                        </v-radio>
                        </v-radio-group>
        </v-row>
       <v-spacer></v-spacer>
        <v-btn variant="flat" 
                color="primary"
                class="pa-2" size="large" 
                :disabled="memberShip==''"
                >
                    Pay
                </v-btn>
       <v-spacer></v-spacer>
      </v-card-actions>

      </v-card>
  </v-container>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../../store/store";

export default {
  name: "Membership",
  data() {
    return {
      memberShip: '',
      payBy: 'creditcard'
    };
  },
  mounted() {
     
  },
  watch: {
   
  },
  computed: {
    ...mapState(useMainStore, ["vendor"]),

    memberShipFees(){
      switch (this.memberShip){
        case 'Silver':
          return 199
        case 'Gold':
          return 599
        case 'Platinum':
          return 1599
        default:
          return 0
      }
    }
   
  },
  methods: {
   
  },
};
</script>
