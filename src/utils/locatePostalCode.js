export default function locatePostalCode(geocoder, resultsMap, place) {
  // var postalCode = document.getElementById('address').value;
  // const place = autoComplete.getPlace()
  // console.log(place)
  geocoder.geocode({
    location: place.address_components[0].short_name
  }, function (results, status) {
    if (status === 'OK') {
      // console.log(results);
      // console.log(location);
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}