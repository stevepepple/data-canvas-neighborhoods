var current_place = null;
var current_sensor = null;
getLocation();

$(document).ready(function() {
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
  select_place.scrollWheelZoom.disable();

  setTimeout(function(){
  //  geo_search = initGeoCoder(select_place, showNeighborhood);
  }, 200)

  _.each(cities, function(city){
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");
  });

  setCity();

  $("#controls").find("input").unbind().on("change", function(){
    console.log($(this).attr("id"), $(this).prop("checked"))
    var factor = $(this).attr("id");

    if ($(this).prop("checked") == true) {


        if(factor == "light") {

        }

        // Simply hide or show the area of the place
        $("." + factor).show();
    } else {

        $("." + factor).hide();

        if(factor == "light") {
          hideLight();
        }

    }



  });

  $("#select_sensor").unbind().on("change", function(){

    var id = $(this).val();
    var selected = _.findWhere(sensors, { id : id });

    if (selected !== null) {
      selectSensor(selected, select_place)
    }
  });
}

// UI for adding a new city
function initAdd(place) {

  var button = $("#add_it");

  button.removeAttr("disabled");

  if (typeof place.id != "undefined") {
    $("#select_sensor").val(place.id)
  }

  button.unbind().bind('click', function(){

    var coord = L.latLng(place.Y, place.X);

    // TODO: Get rid of chaining callbacks with Promises
    showCurrentPlace(coord, function(place){

      var sensor = getNearestSensor(select_place);

      // TODO: Move to separate function
      var map = places[current_place.id].map;
      var id = place.id;

      // Create a marker and store it with the place
      var marker = L.latLng(sensor.location[1], sensor.location[0]);
      places[id].marker = marker;
      places[id].coord = coord;

      var location = L.latLng(current_place.lat, current_place.lng);
      var circle = L.circle(marker, map.getZoom() * 8, circle_outer).addTo(map);
      var circle = L.circle(marker, map.getZoom(), circle_inner).addTo(map);

      setTimeout(function(){
        map.setView(marker, map.getZoom() - 1);
        centerPlaces();
      }, 400);
      if (sensor !== null) {
        getSensorData(sensor, 10, function(data){
          showExperiments(data, id);
          //setCity();
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
  city_name = $('#cities option').not(function(){ return !this.selected }).val();
  city_id = id;

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
    sensor_layer = L.featureGroup();
    $("#select_sensor").html('<option value="none">Select a Sensor</option>');
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");

      showSensor(sensor, select_place, initAdd)
	  });
    sensor_layer.addTo(select_place)
    select_place.fitBounds(sensor_layer.getBounds());
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
      $("#compare #places").css("display", "flex");
      $("#compare #places").attr('style', 'display: -webkit-flex; display: flex');
      $("#places").append(ui);

      zoom = 16;
      if (city_name == "Shanghai" || city_name == "Bangalore" || city_name == "Singapore") { zoom = 15; }

      place.map = L.mapbox.map(id, side_map, map_options).setView([lat,lon], zoom);

      place.map.scrollWheelZoom.disable();

      // Add the selected object here too

      // TODO: use mustaces template */
      var play = $('<svg id="play" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>');
      var info = $('<svg id="info" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>');

      var media = '<div class="media"><div class="photos"><ul class="bxslider"></ul></div><div class="tweets"><ul class="bxslider"></ul></div><div class="playhead"><div class="info"></div><div class="audio"></div></div></div>'
      $(ui).prepend('<div class="overlay"><div class="experiments"></div><h1 class="city">' + city_name + '</h1><h1 class="address">' + place.address_components[0].short_name + '</h1><h2 class="time"></h2>' + media + '<div>');

      $(ui).find('.info').html(info).unbind().on("click", function(){

        $(ui).find('.experiments').toggle();
        $(ui).find('.media').toggleClass("dark");

      });

      // Get the current time/timezone for the selected place
      getTimezone(coord, function(result){
        var timezone = result.timeZoneId;
        var now = moment.tz(now, timezone);
        console.log(now.format("LT"))
        $(ui).find(".time").html( now.format("LT"));
      });

      places[id] = place;

      // TODO: Is there a less hacky way to do this?
      select_place._size.x = $('#add_place_map').width();

      // Update the right side map
      select_place.fitBounds(city_bounds);
      $("#add_it").text("Compare Place");
      if(typeof select_place !== "undefined") {
        clearLayer(select_place, current_layer);
      }

      callback(place);
  });
}

function showExperiments(latest, id) {

  var experiments = $("#" + id).find(".experiments");
  experiments.html("")
  _.each(current_fields, function(key) {

    var field = _.findWhere(fields, { name : key });
    experiments.append('<div>' + field.label + ': ' + latest[key] + ' ' + field.unit + '</div>');

  });

  if ($('#light').prop("checked")) {
    showLight(latest.light, id);
  }

  if ($('#pollution').prop("checked")) {
    showPollution(latest.pollution, id);
  }

  showTweets(places[id].coord, id);
  showPhotos(places[id].coord, id);

}
