<template>
    <v-card flat>
        <v-card-text>
            <v-card outlined flat>
                <v-card-subtitle class=" font-weight-bold text-fontColor text-subtitle-2">About Us</v-card-subtitle>
                <v-card-text><p class="text-fontColor">{{aboutUs}}</p></v-card-text>
            </v-card>
            <v-card outlined flat >
                <v-card-subtitle>Location and Hours</v-card-subtitle>
                <v-card-text>
                    <v-row>
                        <v-col cols="6">
                        <div
                            id="map"
                            justify-center
                            class="pa-1"
                        ></div>
                        <!-- <div> -->
                        <v-textarea variant="outlined"  
                        v-model="comments" 
                        label="Customer Comments" 
                        placeholder="thank you for your commentary!"
                        v-if="resident"
                        class="py-1"></v-textarea>
                        <v-btn variant="flat"  
                        class="d-inline-block mt-n8" 
                        color='primary' size="small" 
                        right 
                        :disabled="!comments"
                        v-if="resident" 
                        @click="sendMessage"> Send </v-btn>
                        <!-- </div> -->
                    </v-col>
                    <v-col cols="6" class="flex-column justify-space-around align-center">
                        <v-row class="my-2 ml-2 text-fontColor">Address: {{businessStreetNo + ' ' 
                                + businessStreetName 
                                + ', ' + businessCity 
                                + ' ' + businessState 
                                + ', ' + businessPostalCode}}</v-row>
                        <v-divider></v-divider>
                        <v-row class="my-2 ml-2 text-fontColor">Phone: &nbsp;<span v-for="(phone, i) in businessPhone" :key="i"> {{ phone}} </span></v-row>
                        <v-row class="my-2 ml-2 text-fontColor">Fax:&nbsp; {{businessFax?businessFax:''}}</v-row>
                        <v-row class="my-2 ml-2 text-fontColor">{{`Email:&nbsp; ${businessEmail}`}}</v-row>
                        <v-row class="my-2 ml-2 text-fontColor">Website:&nbsp; <a :href="website">{{website?website:''}}</a></v-row>
                        <v-divider></v-divider>
                        <v-row v-for="(hour, i) in businessHours" :key="i" class="my-2 ml-2 text-fontColor">{{`${hour.weekDay}: ${hour.time}`}}</v-row>
                    </v-col>
                    </v-row>
                    
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script>

import { mapGetters } from "vuex";
import gmapsInit from "../utils/gmaps";

export default {
    name: "OtherInfo",
    props: [
            "businessStreetNo",
            "businessStreetName",
            "businessCity",
            "businessState",
            "businessCountry",
            "businessPostalCode",
            "businessPhone",
            "businessHours",
            "businessFax",
            "businessEmail",
            "aboutUs",
            "website",
            "businessTitle"
            ],
    data() {
        return {
            comments: ''
        }
    },

     async mounted() {
        window.scrollTo(0, 0);
        try {
        // console.log("mounted");
            let markers = [];
            const google = await gmapsInit();
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 8,
                disableDoubleClickZoom: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true
            });
            // console.log(map);

            const geocoder = new google.maps.Geocoder();
            const southWest = new google.maps.LatLng(43.03637, -82.056545);
            const northEast = new google.maps.LatLng(44.519412, -78.032275);
            const bounds = new google.maps.LatLngBounds(southWest, northEast);

            const businessAddress = this.businessStreetNo + ' ' 
                                    + this.businessStreetName 
                                    + ' ' + this.businessCity 
                                    + ' ' + this.businessState 
                                    + ' ' + this.businessPostalCode
                
            geocoder.geocode(
                {
                address: businessAddress
                },
                function (results, status) {
                markers.map((marker) => {
                    marker.setMap(null);
                });
                if (status === "OK") {
                    map.setCenter(results[0].geometry.location);
                    const image = {
                    url: "/static/buz_logo2.png",
                    scaledSize: new google.maps.Size(40, 40),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(20, 20),
                    };

                    const marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    icon: image,
                    title: "My Business",
                    map: map,
                    animation: google.maps.Animation.BOUNCE,
                    visible: true,
                    });
                    markers.push(marker);
                    // console.log(markers);
                } else {
                    alert(
                    "Geocode was not successful for the following reason: " + status
                    );
                }
                }
            );
        
        //   autocomplete.addListener("place_changed", () => {
        //     this.errMsg = null;
        //     // this.place = null;
        //     const place = autocomplete.getPlace();

        //     // console.log(place);
        //     // console.log(place.address_components[0].types[0]);
        //     if (place.address_components[0].types[0] !== "street_number") {
        //       this.errMsg =
        //         place.formatted_address + "  is not a valid google map address";
        //       return;
        //     } else {
        //       this.place = place;
        //       const location = place.formatted_address;
        //       this.inputPlace = place.formatted_address;
        //       this.vendorAddressStreetNo = place.address_components[0].short_name;
        //       this.vendorAddressStreetName = place.address_components[1].short_name;
        //       this.vendorAddressCity =
        //         place.address_components[2].short_name == "Mississauga" ||
        //         place.address_components[2].short_name == "Brampton"
        //           ? place.address_components[2].short_name
        //           : place.address_components[3].short_name;
        //       this.vendorPostalCode =
        //         place.address_components.length > 7
        //           ? place.address_components[7].short_name
        //           : place.address_components[6].short_name;

        //       geocoder.geocode(
        //         {
        //           address: location,
        //         },
        //         function (results, status) {
        //           markers.map((marker) => {
        //             marker.setMap(null);
        //           });
        //           if (status === "OK") {
        //             // console.log(results);
        //             // console.log(location);
        //             map.setCenter(results[0].geometry.location);
        //             const image = {
        //               url:
        //                 // "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
        //                 "/static/buz_logo2.png",
        //               // "/static/buz_logo3.png",
        //               scaledSize: new google.maps.Size(40, 40),
        //               origin: new google.maps.Point(0, 0),
        //               anchor: new google.maps.Point(20, 20),
        //             };

        //             const marker = new google.maps.Marker({
        //               position: results[0].geometry.location,
        //               icon: image,
        //               // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
        //               title: 
        //               // this.businessTitle
        //               //   ? this.businessTitle
        //               //   : 
        //                 "My Business",
        //               map: map,
        //               animation: google.maps.Animation.BOUNCE,
        //               // shape: shape,
        //               visible: true,
        //             });
        //             // marker.addListener("click", () => {
        //             //   console.log("clicked");
        //             //   this.spark = true;
        //             // });
        //             markers.push(marker);
        //             // console.log(markers);
        //           } else {
        //             // alert(
        //             //   "Geocode was not successful for the following reason: " + status
        //             // );
        //             this.errMsgPic =
        //               "Not a valid google map address " + `(${status})`;
        //           }
        //         }
        //       );
        //     }

        //     // console.log(this.postalCode);
        //   });
        } catch (error) {
        console.error(error);
        }
    },
    computed: {
        ...mapGetters(["resident"])
    },
    methods: {
        sendMessage() {
            this.$store.dispatch('sendMessage', {
                sender: this.resident.residentName,
                receiver: this.businessTitle,
                receiverType: 'vendor',
                text: this.comments,
                time: Date.now().toString(),
                fullName: `${this.resident.firstName} ${this.resident.lastName}`,
                title: 'customer message',
                guild: null 
            })
            this.comments = ''
        }
        
    }
}
</script>

    