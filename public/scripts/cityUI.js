var places = {};

getLocation();

$( document ).ready(function() {
  makeUI();
});


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showCurrentPlace);
    } else {
        console.log("Geolocation is not supported by this browser. Show different UI.");
    }
}


function showCurrentPlace(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54&result_type=neighborhood";
  fetchData(query, function(place){

      // Simply take the best result, if there is more than one.
  		var place = place.results[0];
      var id = place.place_id;

      /* TODO: Set the city dropdown to the current city */

      var ui = $("<div id='"+ id + "' class='place'></div>");
      $("#places").append(ui);


      place.map = L.mapbox.map(id, main_map, map_options).setView([lat,lon], 17);
      new L.Control.Zoom({ position: 'bottomright' }).addTo(place.map);

      // TODO: use mustaces template */
      $(ui).prepend("<div class='overlay'><h1>" + place.address_components[0].short_name + "</h1><div>");

      places[id] = place;
  });

}

function makeUI() {
  _.each(cities, function(city){
    console.log(city.name)
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");

    setCity();

  });

  initGeoCoder();
}

// Get the current city and sensors for that city
function setCity() {
  var city = $("#cities").val();
  var id = city.toLowerCase().replace(" ", "-");

  city_name = $('option').not(function(){ return !this.selected }).text();
$("#leaflet-control-geosearch-qry").val("")

  $.getJSON('https://s3-us-west-2.amazonaws.com/s.cdpn.io/230399/' + id + ".json", function(data){
    hoods = data;
    showCityLayer(data, select_place);
  });

  sensors = _.findWhere(cities, { name : city });
  sensors = sensors.sensors
  setSensors();

  // Update sensors for current city
	function setSensors() {
    $("#select_sensor").html("");
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");
	  });

    //fetchSummary();
  }
}
