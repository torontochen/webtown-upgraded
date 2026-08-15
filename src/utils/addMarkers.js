export default function addMarkers(
  coords,
  map,
  geocoder,
  markers,
  MarkerClusterer
) {
  geocoder.geocode({
      location: coords
    },
    function (results, status) {
      if (status === "OK") {
        // console.log(coords);
        map.setCenter(results[0].geometry.location);
        markers[markers.length] = {
          markerBody: new google.maps.Marker({
            position: results[0].geometry.location,
            label: (markers.length + 1).toString()
          }),
          infowindowContent: results[0].formatted_address
        };
        var markerCluster = new MarkerClusterer(
          map,
          markers.map(item => {
            let infowindow = new google.maps.InfoWindow({
              content: "<div class='info'><a href='#'>" +
                item.infowindowContent +
                "</a></div>",
              pixelOffset: new google.maps.Size(0, 0)
            });
            //console.log(markers[markers.length]);
            item.markerBody.addListener("mouseover", function () {
              infowindow.open(map, item.markerBody);
              //console.log(infowindow.getPosition());
            });
            item.markerBody.addListener("mouseout", function () {
              // infowindow.open(resultsMap, item.markerBody);
              //console.log(infowindow.getPosition());
              setTimeout(function () {
                infowindow.close();
              }, 2000);
            });
            // infowindow.addListener("domready", function() {
            //   document
            //     .getElementsByClassName("info")
            //     .css("background-color", "yellow");
            // });
            return item.markerBody;
          }), {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
          }
        );
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
      if (markerCluster) {
        var markerClusterArray = markerCluster.getMarkers();
        // console.log(markerCluster);
        if (markerClusterArray.length > 0) {
          // console.log(markerClusterArray[markerClusterArray.length-1]);
          let infowindow1 = new google.maps.InfoWindow({
            content: "This is markerCluster",
            pixelOffset: new google.maps.Size(0, 50)
          });
          markerCluster.addListener("mouseover", function (e) {
            infowindow1.open(resultsMap, e.latLng);
            console.log("spark");
            //console.log(infowindow.getPosition());
          });
        }
        google.maps.event.addListener(map, "zoom_changed", function (event) {
          //console.log('spark');
          // markerCluster.redraw();
          // });
        });
      }
    }
  );
}
