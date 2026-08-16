<template>
    <v-card flat color="shade">

        <!-- Do Rating -->
        <v-dialog v-model="ratingWindow">
            <v-card class="pa-4">
                <v-card-text>
                    <v-rating
                        v-model="rating"
                        background-color="orange lighten-3"
                        color="orange"
                        large
                        half-increments
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half"
                    ></v-rating>
                    <v-textarea variant="outlined"  
                        v-model="comments" 
                        label="Customer Comments" 
                        placeholder="thank you for your commentary!"
                        class="py-3"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="outlined"  color="primary" @click="ratingWindow=false">Cancel</v-btn>
                    <v-btn theme="dark" color="primary" @click="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

       <v-toolbar flat color="shade">
           <v-spacer></v-spacer>
           <v-btn variant="text"   color="primary" @click="startRating">comment</v-btn>
       </v-toolbar>
        <v-card-title v-if="vendorCustomerRatings.length==0" class="text-center justify-center">No Customer Comments</v-card-title>
        <v-card-text v-else>
            <v-timeline
                align-top
                :dense="$vuetify.display.smAndDown"
            >
                <v-timeline-item
                v-for="(item, i) in vendorCustomerRatings"
                :key="i"
                :color="ratingColor(item.rating)"
                :icon="ratingFace(item.rating)"
                fill-dot
                >
                <v-card
                    :color="ratingColor(item.rating)"
                    theme="dark"
                    hover
                >
                    <v-card-title class="text-h6">
                        <v-avatar class="mr-2">
                            <v-img :src="item.customerAvatar"></v-img>
                        </v-avatar>
                        {{item.customerName}}
                    <v-rating
                        :value="item.rating"
                        background-color="orange lighten-3"
                        color="orange"
                        medium
                        class="ml-2"
                        half-increments
                        empty-icon="mdi-star-outline"
                        full-icon="mdi-star"
                        half-icon="mdi-star-half"
                        readonly
                    ></v-rating>
                    </v-card-title>
                    <v-card-text class="white text--primary">
                    <p class="text-fontColor">{{item.comments}}</p>
                    
                    </v-card-text>
                    <v-card-actions>
                        {{ $filters.convertCustomerRatingTime(item.time) }}
                        <v-spacer></v-spacer>
                        <!-- <v-btn variant="outlined"
                        :color="item.color"
                        class="mx-0" 
                    >
                        Reply
                    </v-btn> -->
                    </v-card-actions>
                </v-card>
                </v-timeline-item>
            </v-timeline>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapState } from "pinia";
import { useMainStore } from "../store/store";

export default {
    name: "Customer",
    props: ['vendorCustomerRatings', 'vendor', 'resident'],
    data() {
        return {
            comments: '',
            ratingWindow: false,
            rating: 0
        }
    },
    computed: {
        ...mapState(useMainStore, ["customerRatings"]),
    },
    watch: {
        customerRatings(val) {
            this.vendorCustomerRatings = val
        }
    },
    methods: {
        startRating() {
            this.comments=''
            this.rating=0
          this.ratingWindow=true
        },

        ratingColor(rating) {
            if (rating >= 4) {
                return 'green lighten-2'
            }
            if (rating < 4 && rating >= 3) {
                return 'yellow darken-1'
            }
            if( rating <= 2) {
                return 'red lighten-2'
            }
        },

        ratingFace(rating) {
            if (rating >= 4) {
                return 'mdi-emoticon-excited'
            }
            if (rating < 4 && rating >= 3) {
                return 'mdi-emoticon-neutral'
            }
            if( rating <= 2) {
                return 'mdi-emoticon-sad'
            }
        },
        save() {
            this.$store.saveCustomerRating({
                vendor: this.vendor,
                residentId: this.resident._id,
                rating: this.rating,
                comments: this.comments,
                time: Date.now().toString()
            })
            this.ratingWindow = false
        }
    },
}
</script>

    