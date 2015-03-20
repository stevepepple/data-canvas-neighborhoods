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

    var factor = $(this).attr("id");

    if ($(this).prop("checked") == true) {

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

    $("#sensor_info").find(".message").html(selected.name + '<br/>' + selected.hood)

    if (selected !== null) {
      selectSensor(selected, select_place)
    }
  });
}

// UI for adding a new city
function initAdd(place) {

  var button = $("#add_it");

  button.removeAttr("disabled");
  button.removeClass("disabled");

  if (typeof place.id != "undefined") {
    $("#select_sensor").val(place.id)
  }

  button.unbind().bind('click', function(){

    var coord = L.latLng(place.Y, place.X);

    // TODO: Get rid of chaining callbacks with Promises
    showCurrentPlace(coord, function(place){

      if (place == false) {
        return false;
      }

      var sensor = getNearestSensor(select_place);

      // TODO: Move to separate function
      var map = places[current_place.id].map;
      var id = place.id;

      // Create a marker and store it with the place
      var marker = L.latLng(sensor.location[1], sensor.location[0]);
      places[id].marker = marker;
      places[id].coord = coord;

      var location = L.latLng(current_place.lat, current_place.lng);
      //var circle = L.circle(marker, map.getZoom() * 8, circle_outer).addTo(map);
      //var circle = L.circle(marker, map.getZoom(), circle_inner).addTo(map);

      setTimeout(function(){
        //map.setView(marker, map.getZoom() - 1);
        //centerPlaces();
      }, 400);
      if (sensor !== null) {
        getSensorData(sensor, 10, function(data){
          showExperiments(data, id);
          // Reset the select map
          clearSensors();
          select_place.fitBounds(sensor_layer.getBounds());
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
  clearSensors();

  // Setup the UI
  $("#cities").unbind().on("change", function(){
    $("#add_it").addClass("disabled")
    setCity();
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

      if(typeof places[current_place.id] !== "undefined") {

          $("#sensor_info").find(".message").html("You're already added this place.")
          callback(false);
          return false;
      }

      /* TODO: Set the city dropdown to the current city */
      var ui = $('<div id="' + id + '" class="place"></div>');
      $("#compare #places").css("display", "flex");
      $("#compare #places").attr('style', 'display: -webkit-flex; display: flex');
      $("#places").append(ui);

      zoom = 16;
      if (city_name == "Shanghai" || city_name == "Bangalore" || city_name == "Singapore") { zoom = 15; }

      place.map = L.mapbox.map(id, side_map, map_options).setView([lat,lon], zoom);
      place.map.scrollWheelZoom.disable();
      place.map.dragging.disable();

      // Add the selected object here too

      // TODO: use mustaces template */
      var play = $('<div class="play"><svg id="pause" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M14,19.14H18V5.14H14M6,19.14H10V5.14H6V19.14Z" /></svg></div>');
      var info = $('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/></svg>');
      var pause = $('<svg id="play" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>');

      /* TODO: move mp3 to data folder */
      var beat = $('<div class="audioViz"><canvas width="800" height="0"></canvas></div><audio class="track" src="http://www.soundjay.com/human/heartbeat-05.mp3" autoplay loop><p>Your browser does not support the audio element</p></audio>')

      var media = '<div class="media"><div class="playhead"><div class="info"></div><div class="audio"></div></div><div class="photos small"><h2>INSTAGRAM</h2><ul class="bxslider"></ul></div><div class="tweets small"><h2>TWITTER</h2><ul class="bxslider"></ul></div></div>';
      $(ui).prepend('<div class="overlay"><div class="experiments"></div><h1 class="city">' + city_name + '</h1><h1 class="address">' + place.address_components[0].short_name + '</h1><h2 class="time"></h2>' + media + '<div>');
      $(ui).prepend('<div class="loading"><div class="grid"></div><div class="wave f1"></div><div class="wave f2"></div><div class="wave f3"></div><div class="wave f4"></div><div class="wave f5"></div><div class="wave f6"></div><div class="wave f7"></div><div class="wave f8"></div><div class="wave f9"></div><div class="wave f10"></div><div class="target"></div></div>');

      $(ui).find('.audio').html('').append(play).append(beat);

      $(ui).find('.info').html(info).unbind().on("click", function(){
        $(ui).find('.experiments').toggle();
        $(ui).find('.media').toggleClass("dark");
      });

      // Get the current time/timezone for the selected place
      getTimezone(coord, function(result){
        var timezone = result.timeZoneId;
        var now = moment.tz(now, timezone);

        $(ui).find(".time").html( now.format("LT"));
      });

      places[id] = place;

      // TODO: Is there a less hacky way to do this?
      select_place._size.x = $('#add_place_map').width();

      // Update the right side map
      select_place.fitBounds(city_bounds);
      //$("#add_it").text("Compare Place");
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

  if ($('#dust').prop("checked")) {
    showDust(latest.dust, id);
  }

  if ($('#noise').prop("checked")) {
    showNoise(latest.noise, id);
  }

  showTweets(places[id].coord, id);
  showPhotos(places[id].coord, id);

}
