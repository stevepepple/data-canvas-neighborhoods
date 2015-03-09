var current_place = null;
var current_sensor = null;
var current_city = null;

function visualizeData(data) {

  console.log("in visualize data")
  var current_value = $("#place").find('.overlay').find('.value');

  // Do something with the data
  // dust, humidity, light, light_summary, noise, pollution, pollution_summary, temperature

  // LUX is lumens per square meter
  var max = 10000;
  var scale = 2;

  var percentage = Math.round((data.light / max) * 10) / 10;
  var value = percentage * scale;
  // Only make the panel
  if (value < 0.4) { value = 0.4; }
  // Create a css 3 filter representing the brightness
  var filter = "brightness(" + value + ") contrast(" + (1.2) + ")";


  current_value.html(Math.round(data.light) + ' <span class="unit">LUX</span>');

  // Use the CSS3 Brightness fitler
  $("#map").css('filter', filter )
  $("#legend").find(".items").html("");

  // Create a legend that shows the different levels of light
  for (var i = 0; i < 10; i++) {
    var filter = "brightness(" + 2 * (1 / (i + 1)) + ")";
    var div = $("<div class='item'></div>");
    div.css("background-image", "url('../images/legend/" + city_id + ".png')");
    div.css('filter', filter )
    $("#legend").find(".items").prepend(div)
  }

}

function getPlace(place) {

  // Reverse Geocode the current place
  var coord = L.latLng(place.Y, place.X);
  getAddress(coord, showAddress)

  function showAddress(result) {
    $("#place").find(".overlay").html('<h2 class="value"></h2><h1>' + result.address_components[0].short_name + '</h1><h2 class="address"></h2>');

    current_place = result;

    if (place.id == undefined) {
      current_place.sensor = getNearestSensor(map);
    } else {
      current_place.sensor = place;
    }

    sensor = current_place.sensor;

    if (sensor !== null) {

      // Fetch the latest data at an interval
      getSensorData(current_place.sensor, 10, visualizeData);

      // Create a marker and store it with the place
      clearMap(map, current_layer);
      console.log(coord)
      showSensorMarker(coord, map);
    }
  }
}

$(document).ready(function() {

  map = L.mapbox.map('map')
    .setView([37.77072000222513, -122.4359575], 12);

  // Initialize the map and geocoder
  //map = L.mapbox.map('map', side_map, map_options).setView([37.77072000222513, -122.4359575], 11);
  _.each(cities, function(city){
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");
  });

  $("#cities").unbind().on("change", function(){
    selectCity();
  });

  $("#select_sensor").unbind().on("change", function(){

    var id = $(this).val();
    var selected = _.findWhere(sensors, { id : id });

    if (selected !== null) {
      clearMap(map)
      selectSensor(selected, getPlace)
    }
  });

  L.mapbox.tileLayer(side_map)
    .addTo(map) // add your tiles to the map
    .on('load', function(){
      console.log("Mapbox is loaded")
  });

  new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  setTimeout(function(){
    selectCity();
  }, 400)


  function selectCity() {

    city_name = $("#cities").val();
    var id = city_name.toLowerCase().split(" ").join("-");

    city_id = id;

    $("#place").find(".overlay").html('<h2 class="value"></h2><h1>' + city_name + '</h1>');

    $("#leaflet-control-geosearch-qry").val("");

    // Fetch Neighborhoods or Districts for current city
    $.getJSON('data/' + id + ".json", function(data){
      hoods = data;
      showCityLayer(data, map, showCity, getPlace);
    });

    function showCity(){
      var center = map.getCenter();
      var coord = L.latLng(center.lat, center.lng);

      getTimezone(coord, function(result){
        var timezone = result.timeZoneId;
        var now = moment.tz(now, timezone);

        $("#place").find(".overlay").append("<h2>" + now.format("LT") + "</h2>")

        fetchCityData(city_name, timezone, visualizeData);
      });

    }

    sensors = _.findWhere(cities, { name : city_name });
    sensors = sensors.sensors;

    sensor_layer = L.featureGroup();

    $("#select_sensor").html('<option value="none">Select a Sensor</option>');
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");
      showSensor(sensor, map, getPlace)
    });
    sensor_layer.addTo(map);
    map.fitBounds(sensor_layer.getBounds());
  }
});
