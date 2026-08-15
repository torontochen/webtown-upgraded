<template>
  
  <div :id="id"></div>
</template>

<script>
import gmapsInit from "../utils/gmaps";
import addMarkers from "../utils/addMarkers";
import markerClusterer from "@google/markerclusterer";
// import addMarker from "../utils/addMarker";
export default {
  name: "gooogleMap",
  props: {
    id: String,
    markerList : []
  },
  // data () {
  //   return {
  //   }
  // },
  // computed: {
  // },
  async mounted() {
    try {
      const google = await gmapsInit();
      // this.google = google
      const southWest = new google.maps.LatLng(43.03637, -82.056545);
      const northEast = new google.maps.LatLng(44.519412, -78.032275);
      const bounds = new google.maps.LatLngBounds(southWest, northEast);
     
      const map = new google.maps.Map(document.getElementById("map"), {
        // center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        disableDoubleClickZoom: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });
      // this.map = map
       if (navigator.geolocation) {
       
        navigator.geolocation.getCurrentPosition((position) => {
          
          const center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          map.setCenter(center);
        });
       }

      //  console.log(this.markerList)
        if(this.markerList.length==0) return
        let markers = []
        let infoWindows = []

        //TODO do markers
        this.markerList.map((item, index) => {

                let marker = {markerBody: new google.maps.Marker({position: {lat:item.lat, lng: item.lng} ,
                                                                  label: index.toString(),
                                                                  map}),
                              infowindowContent: item.name}
                markers.push(marker) 

                  let infoWindow = {window: new google.maps.InfoWindow({
                                                  content: "<div><span class='font-weight-bold accent--text text-subtitle-2'>" +
                                                    item.name +
                                                    "</span></div>",
                                                  pixelOffset: new google.maps.Size(0, 0)
                                                }),
                                    order: index};
                  infoWindows.push(infoWindow)
                  marker.markerBody.addListener("mouseover", function () {
                    infoWindow.window.open(map, marker.markerBody);
                    //console.log(infowindow.getPosition());
                  });
                  marker.markerBody.addListener("mouseout", function () {
                    // infowindow.open(resultsMap, item.markerBody);
                    //console.log(infowindow.getPosition());
                    setTimeout(function () {
                      infoWindow.window.close();
                    }, 800);
                  });



         })
         
                 
   } catch(error) {
      console.error(error);

   }
  },
  methods: {
    
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
