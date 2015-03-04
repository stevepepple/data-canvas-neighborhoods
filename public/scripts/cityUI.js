var places = {};

var current_place = null;
var current_sensor = null;
getLocation();

$( document ).ready(function() {
  makeUI();
});


function getLocation() {
    if (navigator.geolocation) {
        //TODO: Add back the geolocation
        navigator.geolocation.getCurrentPosition(function(position){
          var coord = L.latLng(position.coords.latitude, position.coords.longitude);
          console.log(coord)
          // showCurrentPlace(coord)
        });

    } else {
        console.log("Geolocation is not supported by this browser. Show different UI.");
    }
}

function makeUI() {
  _.each(cities, function(city){
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");

    setCity();

  });

  geo_search = initGeoCoder(showNeighborhood);
}

// UI for adding a new city
function initAdd(place) {

  var button = $("#add_it");

  button.removeAttr("disabled");

  button.unbind().bind('click', function(){

    var coord = L.latLng(place.Y, place.X);

    // TODO: Get rid of chaining callbacks with Promises
    showCurrentPlace(coord, function(){
      getNearestSensor(getSensorData)

      centerPlaces();

    });

  })
}


// Get the current city and sensors for that city
function setCity() {
  var city = $("#cities").val();
  var id = city.toLowerCase().replace(" ", "-");
  $("#add_it").attr("disabled");

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
    $("#select_sensor").html('<option value="none">Select a Sensor</option>');
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");
	  });

    //fetchSummary();
  }
}

function showLoader(element, hide) {

  var loader = $('<div class="loader"><div class="circ-animate-con">' +
      '<div class="circ-animate step-1"></div>' +
      '<div class="circ-animate step-2"></div>' +
      '<div class="circ-animate step-3"></div>' +
    '</div></div>');

  if (hide == true) {
    loader.hide();
  }

  if ($(".loader").length > 0) {
    loader.show();
  } else {
    $(element).prepend(loader);
    setTimeout(function() {
         $(".circ-animate.step-1").addClass("animate_circ");
    }, 100);
    setTimeout(function() {
        $(".circ-animate.step-2").addClass("animate_circ");
    }, 1000);
  }

  return true;

}

function showCurrentPlace(coord, callback) {

  console.log("inside showCurrentPlace")
  var lat = coord.lat;
  var lon = coord.lng;

  var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54&result_type=neighborhood";
  fetchData(query, function(place){

      // Simply take the best result, if there is more than one.
  		var place = place.results[0];
      var id = place.place_id;
      current_place = place;

      /* TODO: Set the city dropdown to the current city */
      var ui = $('<div id="' + id + '" class="place"></div>');
      $("#places").css("display", "flex");
      $("#places").append(ui);

      place.map = L.mapbox.map(id, main_map, map_options).setView([lat,lon], 17);
      new L.Control.Zoom({ position: 'bottomright' }).addTo(place.map);

      // Add the selected object here too

      // TODO: use mustaces template */
      $(ui).prepend('<div class="overlay"><div class="experiments"></div><h1>' + place.address_components[0].short_name + '</h1><div>');

      places[id] = place;

      // TODO: Is there a less hacky way to do this?
      select_place._size.x = $('#add_place_map').width();

      // Update the right side map
      select_place.fitBounds(city_bounds);
      clearMap();
      callback();
  });
}

function showExperiments(latest) {
  var experiments = $("#" + current_place.place_id).find(".experiments");
  experiments.html("")
  _.each(current_fields, function(key) {

    var field = _.findWhere(fields, { name : key });
    experiments.append('<div>' + field.label + ': ' + latest[key] + ' ' + field.unit + '</div>');
  });
}

function getNearestSensor(callback){
  // Get the nearest sensor
  // TODO: Move to modular function
  var nearest = null;
  var location = turf.point([current_place.geometry.location.lng, current_place.geometry.location.lat]);
  _.each(sensors, function(sensor){
    var sensor_location = turf.point(sensor.location);

    var units = "miles";
    var distance = turf.distance(sensor_location, location, units);

    if (nearest == null || distance < nearest.distance) {
      // TODO: Are there is the user really in the same neighborhood
      nearest = sensor;
      nearest.distance = distance;
    }

  });

  if (nearest !== null) {
    current_sensor = nearest;
    // TODO: Move to separate function
    var map = places[current_place.place_id].map;

    // Create a marker and store it with the place
    var marker = L.latLng(nearest.location[1], nearest.location[0]);
    places[current_place.place_id].marker = marker;

    var location = L.latLng(current_place.lat, current_place.lng);
    var circle = L.circle(marker, 48, circle_outer).addTo(map);
    var circle = L.circle(marker, 8, circle_inner).addTo(map);

    setTimeout(function(){
      map.setView(marker, map.getZoom() - 1)
    }, 100)


    callback(current_sensor);
    return true;

  } else {
    return false;
    // TODO: Handle no sensors
  }

}
