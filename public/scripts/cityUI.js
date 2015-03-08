var current_place = null;
var current_sensor = null;
getLocation();

$( document ).ready(function() {
  makeUI();
});


function getLocation() {
    if (navigator.geolocation) {
        //TODO: Add back the geolocation
        /*
        navigator.geolocation.getCurrentPosition(function(position){
          var coord = L.latLng(position.coords.latitude, position.coords.longitude);
          console.log(coord)
           showCurrentPlace(coord)
        });
        */

    } else {
        console.log("Geolocation is not supported by this browser. Show different UI.");
    }
}

function makeUI() {

  select_place = L.mapbox.map('add_place_map', side_map, map_options).setView([37.77072000222513, -122.4359575], 12);

  geo_search = initGeoCoder(select_place, showNeighborhood);

  _.each(cities, function(city){
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");
  });

  setCity();

  $("#select_sensor").unbind().on("change", function(){

    var id = $(this).val();
    var selected = _.findWhere(sensors, { id : id });

    if (selected !== null) {
      //clearMap(select_place)
      selectSensor(selected, select_place)
    }
  });
}

// UI for adding a new city
function initAdd(place) {

  var button = $("#add_it");

  button.removeAttr("disabled");

  button.unbind().bind('click', function(){
    console.log("new place: ", place)

    var coord = L.latLng(place.Y, place.X);

    // TODO: Get rid of chaining callbacks with Promises
    showCurrentPlace(coord, function(){
      //centerPlaces();

      var sensor = getNearestSensor(select_place);

      // TODO: Move to separate function
      var map = places[current_place.id].map;

      // Create a marker and store it with the place
      var marker = L.latLng(sensor.location[1], sensor.location[0]);
      places[current_place.id].marker = marker;

      var location = L.latLng(current_place.lat, current_place.lng);
      var circle = L.circle(marker, 48, circle_outer).addTo(map);
      var circle = L.circle(marker, 8, circle_inner).addTo(map);

      setTimeout(function(){
        map.setView(marker, map.getZoom() - 1)
      }, 200);
      if (sensor !== null) {
        console.log(sensor)
        getSensorData(sensor, 10, function(data){
          showExperiments(data)
        });
      }

    });

  })
}


// Get the current city and sensors for that city
function setCity() {
  $("#leaflet-control-geosearch-qry").val("");

  var city = $("#cities").val();
  var id = city.toLowerCase().split(" ").join("-");
  city_name = $('option').not(function(){ return !this.selected }).text();

  sensors = _.findWhere(cities, { name : city });
  sensors = sensors.sensors
  setSensors();

  // Setup the UI
  $("#cities").unbind().on("change", function(){
    setCity()
  });

  $("#add_it").attr("disabled");

  // Fetch Neighborhoods or Districts for current city
  $.getJSON('data/' + id + ".json", function(data){
    hoods = data;
    showCityLayer(data, select_place, showCity, initAdd);
  });

  function showCity() {
    // Do nothing
  }

  // Update sensors for current city
	function setSensors() {
    $("#select_sensor").html('<option value="none">Select a Sensor</option>');
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");

      showSensor(sensor, select_place, initAdd)
	  });

  }
}

function showCurrentPlace(coord, callback) {

  var lat = coord.lat;
  var lon = coord.lng;

  var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54&result_type=neighborhood|locality|sublocality|";
  fetchData(query, function(result){

      // Simply take the best result, if there is more than one.
  		var place = result.results[0];
      var id = place.place_id;
      current_place = place;
      current_place.id = id;


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
      $("#add_it").text("Compare Place");
      clearMap(select_place);
      callback();
  });
}

function showExperiments(latest) {
  var experiments = $("#" + current_place.id).find(".experiments");
  experiments.html("")
  _.each(current_fields, function(key) {

    var field = _.findWhere(fields, { name : key });
    experiments.append('<div>' + field.label + ': ' + latest[key] + ' ' + field.unit + '</div>');
  });
}
