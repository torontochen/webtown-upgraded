<template>
  <!-- <div class="my-map">
    My Map -->
  <div :id="id"></div>
  <!-- </div> -->
</template>

<script>
import _ from "lodash";
import gmapsInit from "../utils/gmaps";
// import addMarkers from "../utils/addMarkers";
import markerClusterer from "@google/markerclusterer";
import { eventBus_pickVendor } from "../eventBus"
// import addMarker from "../utils/addMarker";
export default {
  name: "gooogleMap",
  props: {
    id: String,
    markerList : [],
    freshMap: Boolean,
    newData: Boolean
  },
  data () {
    return {
      map: null,
      google: null,
      markers: [],
      infowindows: []
    }
  },
  // computed: {
  // },

  created() {
    eventBus_pickVendor.$on("pickVendor", value => {
      // console.log(this.markers)
      // console.log(this.infowindows)
      const { index } = value
      // console.log('index',index)
      const infowindowIndex = this.infowindows.findIndex(window => {
               return window.order == index 
              })
      const markerIndex = this.markers.findIndex(marker => {
        // console.log(marker.order)
      return marker.order == index
      })
      // console.log(infowindowIndex)
      // console.log(this.infowindows)
      // console.log(this.infowindows[infowindowIndex])
      // console.log(this.markers[markerIndex].markerBody)
      // if (this.markerList[markerIndex].show == 'true')
      // if(infowindowIndex >= 0 && markerIndex >= 0)
      this.infowindows[infowindowIndex].window.open(this.map, this.markers[markerIndex].markerBody)
    })

  eventBus_pickVendor.$on('leaveVendor', value => {
      const { index } = value
      // console.log(this.infowindows)
      const infowindowIndex = this.infowindows.findIndex(window => {
               return window.order == index
              })
      // if(infowindowIndex >= 0) 
      this.infowindows[infowindowIndex].window.close();
      
  }) 
    
  },
  async mounted() {
    try {
      let locations = [
        // {
        //   position: {
        //     lat: 48.16091,
        //     lng: 16.38333
        //   }
        // },
        // {
        //   position: {
        //     lat: 48.17427,
        //     lng: 16.32962
        //   }
        // }
      ];
      // let formattedAddress = [];
      // // let center;
      // let markers = [];
      // var center
      const google = await gmapsInit();
      this.google = google
      const southWest = new google.maps.LatLng(43.03637, -82.056545);
      const northEast = new google.maps.LatLng(44.519412, -78.032275);
      const bounds = new google.maps.LatLngBounds(southWest, northEast);
      // // console.log(this.id);
      // // const restriction = new google.maps.MapRestriction({
      // //   latLngBounds: bounds,
      // //   strictBounds: true
      // // });
      const map = new google.maps.Map(document.getElementById(this.id), {
        // center: { lat: -34.397, lng: 150.644 },
        zoom: 12,
        disableDoubleClickZoom: false,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });
      this.map = map
      // console.log('running new google and map')
      // google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
      //     if (this.getZoom() < 15) {
      //       this.setZoom(15);
      //     }
      //   });
      const geocoder = new google.maps.Geocoder();
      this.geocoder = geocoder
      // console.log(map);
      // console.log(navigator.geolocation)
      // if (navigator.geolocation) {
      //   // let center;
      //   // console.log("ok");
      //   navigator.geolocation.getCurrentPosition((position) => {
      //     // let center;
      //     // console.log(position);
      //     // console.log(center);
      //      center = {
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude,
      //     };
      //     // console.log(center);
      //     // const image = {
      //     //     url:
      //     //       // "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
      //     //       "/static/609803.png",
      //     //     scaledSize: new google.maps.Size(40, 40),
      //     //     origin: new google.maps.Point(0, 0),
      //     //     anchor: new google.maps.Point(20, 20)
      //     //   };
      //     //   const marker = new google.maps.Marker({
      //     //       position: center,
      //     //       icon:
      //     //       image,
      //     //       // "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png",
      //     //       title: "home",
      //     //       map: map,
      //     //       // shape: shape,
      //     //       visible: true
      //     //     });
      //     map.setCenter(center);
      //     this.map = map
      //   });
      //   // console.log(center);
      // } else {
      //   // console.log("not ok");
      //   // map = new google.maps.Map(document.getElementById("map"), {
      //   //   center: {
      //   //     lat: -31.674359571672735,
      //   //     lng: 148.68969512187505
      //   //   },
      //   //   zoom: 8
      //   // });
      // }
      
      // google.maps.event.addListener(map, "click", function(event) {
      //   console.log(event.latLng.lat())
      //   let coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };

      // // addMarkers(
      // //   coords
      // // , map, geocoder);
      // // console.log(e.latLng.lat());
      // // event.preventDefault();
      // // event.cancelBubble = true;
      // // console.log(event);
      // // locations.push({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      // // 
      // // console.log(coords);
      //  markers.push(
      //   new google.maps.Marker({
      //     position: { lat: event.latLng.lat(), lng: event.latLng.lng() },
      //     map
      //   })
      // );
      // // addMarkers(center, map, geocoder, markers, markerClusterer);
      // // event.stopPropagation();
      // // markers = locations.map(x => new google.maps.Marker({ ...x, map }))
      // // .map(location => {
      // //   const marker = new google.maps.Marker({ ...location, map });
      // //   marker.addListener("click", () => markerClickHandler(marker));

      // //   return marker;
      // // });

     
      // });

      
      
      // google.maps.event.addListener(map, "click", function(event) {
      //   addMarker(
      //     {
      //       coords: event.latLng
      //     },
      //     map,
      //     geocoder
      //   );
      // });
    
      // markers = locations
      //   .map(x => new google.maps.Marker({ ...x, map }))
      //   .map(location => {
      //     const marker = new google.maps.Marker({ ...location, map });
      //     marker.addListener("click", () => markerClickHandler(marker));

      //     return marker;
      //   });
      // const markerClickHandler = marker => {
      //   map.setZoom(13);
      //   map.setCenter(marker.getPosition());
      // };

      // markers = locations
      //   .map(x => new google.maps.Marker({ ...x, map }))
      //   .map(location => {
      //     const marker = new google.maps.Marker({ ...location, map });
      //     marker.addListener("click", () => markerClickHandler(marker));

      //     return marker;
      //   });

      // MarkerClusterer(map, markers, {
      //   imagePath:
      //     "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
      // });
      }
    catch (error) {
      console.error(error);
    }
  },

  watch: {
   
    markerList(val) {
          // console.log(val)
          // console.log(this.markerListLength)
          if(val.length > 0  && this.google && this.map) {
            this.addMarkers(val)
          // try {
        //   let markers = [];
        //   var center, position
        //   // const google = await gmapsInit();

        //  const google = this.google 
        //  const map = this.map
          // const southWest = new google.maps.LatLng(43.03637, -82.056545);
          // const northEast = new google.maps.LatLng(44.519412, -78.032275);
          // const bounds = new google.maps.LatLngBounds(southWest, northEast);
        
          // const map = new google.maps.Map(document.getElementById(this.id), {
          //   // center: { lat: -34.397, lng: 150.644 },
          //   // zoom: 18,
          //   disableDoubleClickZoom: false,
          //   zoomControl: false,
          //   streetViewControl: false,
          //   mapTypeControl: false,
          //   fullscreenControl: true,
          //   // restriction: {
          //   //   latLngBounds: bounds,
          //   //   strictBounds: true,
          //   // },
          // });

          // console.log(map.getZoom())
          // const geocoder = new google.maps.Geocoder();
          // // console.log(map);
          // // console.log(navigator.geolocation)
          // if (navigator.geolocation) {
          //   // let center;
          //   // console.log("ok");
          //   navigator.geolocation.getCurrentPosition((position) => {
          //     // let center;
          //     // console.log(position);
          //     // console.log(center);
          //     //  center = {
          //     //   lat: position.coords.latitude,
          //     //   lng: position.coords.longitude,
          //     // };
            
          //     map.setCenter(center);
          //     // this.map = map
          //   });
          //   // console.log(center);
          //   var markerBounds = new google.maps.LatLngBounds();
          //   val.map((item, index) => {
          //     geocoder.geocode({ address: item.address}, (results, status) => {

          //        if (status === "OK") {
                  
          //          position =   results[0].geometry.location         
          //         // console.log(map.getBounds())
          //           const marker = {
          //                   markerBody: new google.maps.Marker({
          //                                               position ,
          //                                               label: index.toString(),
          //                                               map
          //                                             }),
          //                   infowindowContent: item.vendor
          //                 }
          //         let infowindow = new google.maps.InfoWindow({
          //           content: "<div><a href='#' class='font-weight-bold'>" +
          //             item.vendor +
          //             "</a></div>",
          //           pixelOffset: new google.maps.Size(0, 0)
          //         });
          //         //console.log(markers[markers.length]);
          //         marker.markerBody.addListener("mouseover", function () {
          //           infowindow.open(map, marker.markerBody);
          //           //console.log(infowindow.getPosition());
          //         });
          //         marker.markerBody.addListener("mouseout", function () {
          //           // infowindow.open(resultsMap, item.markerBody);
          //           //console.log(infowindow.getPosition());
          //           setTimeout(function () {
          //             infowindow.close();
          //           }, 800);
          //         });
          //         markers.push(marker)
                    
          //         markerBounds.extend(position)
          //         center = position
          //        map.setCenter(position);
          //        }
          //     })
          //     // map.fitBounds(markerBounds)
          //   })
            
          //   //  google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
          //   // // console.log(map.getZoom())
          //   // // console.log(center)
          //   //     this.setZoom(12);
          //   //     // this.setCenter(position)
          //   // // console.log(map.getZoom())
          //   //   // }
          //   // });
          //   // map.fitBounds(markerBounds);
          //   // map.setCenter(position)
          //   //  map.setCenter(markerBounds.getCenter());
          // } else {
          //   console.log("not ok");
          // }
        
        //   }
        // catch (error) {
        //   console.error(error);
        // }
            
          
          }
        },
    
  
  },

  methods: {
   addMarkers(markerList) {
      // console.log(markerList)
      if(this.newData) {
        for(let marker of this.markers) {
        marker.markerBody.setMap(null)
      }
        for(let window of this.infowindows) {
        window.window.setMap(null)
      }
      this.markers = []
      this.infowindows = []
      }
      const google = this.google 
     const map = this.map
      var center, position
      // console.log("markers",this.markers)
      // console.log("markerList",this.markerList)
      // console.log(this.infowindows)

      if(this.markers.length > 0 && markerList.length > 0 && !this.freshMap) {
        //  for (let i = 0; i < this.markers.length; i++) {
           
        //       this.markers[i].setMap(null);
        //     }
        // console.log('update markers')
        markerList.map((item, i) => {
          if(item.show == 'true') {
            this.markers.findIndex((marker, j) => {
              if(marker.order == i) {
                this.markers[j].markerBody.setMap(map)
              }
            })
            
          } else if(item.show == 'false') {

             this.markers.findIndex((marker, j) => {
              if(marker.order == i) {
                this.markers[j].markerBody.setMap(null)
              }
            })
          }
        })

        return
      } 
      else if(this.markers.length > 0 && markerList.length > 0 && this.freshMap){
        // console.log('update markers orders')
         markerList.forEach((item,index) => {
           const i = _.findIndex(this.markers, marker => {
             if(marker.orderUpdated == 'false') return marker.infowindowContent == item.vendor
           })
           if(i >= 0) {
             this.markers[i].order = index 
             this.markers[i].orderUpdated = 'true' 
             
             this.infowindows[i].order = index
           }
         });
         for(let marker of this.markers) {
           marker.orderUpdated = 'false'
         }
         return
      }
 
      //  for(let marker of this.markers) {
      //   marker.markerBody.setMap(null)
      // }

      //  for(let window of this.infowindows) {
      //   window.window.setMap(null)
      // }

      this.markers = []
      this.infowindows = []

      // const  sleep = (milliSeconds) => {
      //     var startTime = new Date().getTime();
      //     while (new Date().getTime() < startTime + milliSeconds);
      //   }
    
      const geocoder = this.geocoder;
      
        // console.log('markerlist',markerList)
        // console.log(this.markers)

        var markerBounds = new google.maps.LatLngBounds();
        // console.log('running new markers')
        // console.log('running new infowindows')

        markerList.map((item, index) => {
          // if(item.show == 'true') {
            // sleep(2200)

              //  position = results[0].geometry.location 
              const position = {lat: item.coords.lat, lng: item.coords.lng}
                  const i = _.findIndex(this.markers, item => {
                    return item.order == index
                    // item.position.lat == position.lat() && item.position.lng == position.lng() && 
                  })
                  if( i < 0) {
                     

                    const marker = {
                            markerBody: new google.maps.Marker({
                                                        position ,
                                                        label: index.toString(),
                                                        map
                                                      }),
                            infowindowContent: item.vendor,
                            order: index,
                            // position: {lat: position.lat(), lng: position.lng()},
                            position,
                            orderUpdated: 'false'
                          }
                  
                  // console.log('marker', marker)
                this.markers.push(marker)

                  
                  let infowindow = {window:new google.maps.InfoWindow({
                                                  content: "<div><span class='font-weight-bold accent--text text-subtitle-2'>" +
                                                    item.vendor +
                                                    "</span></div>",
                                                  pixelOffset: new google.maps.Size(0, 0)
                                                }),
                                    order: index
                                    };
                  // infowindows.push(infowindow)
                  this.infowindows.push(infowindow)
                  //console.log(markers[markers.length]);
                  marker.markerBody.addListener("mouseover", function () {
                    infowindow.window.open(map, marker.markerBody);
                    //console.log(infowindow.getPosition());
                  });
                  marker.markerBody.addListener("mouseout", function () {
                    // infowindow.open(resultsMap, item.markerBody);
                    //console.log(infowindow.getPosition());
                    setTimeout(function () {
                      infowindow.window.close();
                    }, 800);
                  });
                  // markers.push(marker)
                    //  console.log(markers)
                  // markerBounds.extend(position)
                  center = position
                map.setCenter(position);
                  } 
          //  geocoder.geocode({ address: item.address}, (results, status) => {
          //       // console.log(status)
          //         console.log(results)
          //       if (status === "OK") {
                  
          //         // console.log(index)
               
          //       }
          //   })
          // }
          // sleep(200)
         
        })
        
     
        // console.log('markers',this.markers)
        // console.log('infowindows',this.infowindows)
      // }
    }
  },
  
  unmounted() {
    eventBus_pickVendor.$off("pickVendor")
    eventBus_pickVendor.$off("leaveVendor")
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}


</style>
