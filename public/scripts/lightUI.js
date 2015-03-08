var current_place = null;
var current_sensor = null;
var current_city = null;

function visualizeData(data) {

  // Do something with the data
  // dust, humidity, light, light_summary, noise, pollution, pollution_summary, temperature

  // LUX is lumens per square meter
  var max = 10000;
  var scale = 2;

  var percentage = Math.round((data.light / max) * 10) / 10;
  console.log("current light ", data.light);

  $("#place").find('.overlay').find('.value').html(Math.round(data.light) + ' <span class="unit">LUX</span>');

  var value = percentage * scale;
  if (value < 0.4) { value = 0.4; }

  var filter = "brightness(" + value + ") contrast(" + (0.8 + value) + ")";
  console.log(filter)

  // Use the CSS3 Brightness fitler
  $("#map").css('filter', filter )
  $("#legend").find(".items").html("");
  for (var i = 0; i < 10; i++) {

    var filter = "brightness(" + 2 * (1 / (i + 1)) + ")";
    var div = $("<div class='item'></div>");
    div.css("background-image", "url('../images/legend/" + city_id + ".png')");
    div.css('filter', filter )
    $("#legend").find(".items").prepend(div)
  }

}

function getPlace(place) {

  var coord = L.latLng(place.Y, place.X);

  function showAddress(result) {
    $("#place").find(".overlay").remove();
    $("#place").find(".overlay").html('<div class="overlay"><div class="experiments"></div><h1>' + result.address_components[0].short_name + '</h1><div>');

    current_place = result;

    if (place.id == undefined) {
      current_place.sensor = getNearestSensor(map);
    } else {
      current_place.sensor = place;
    }

    sensor = current_place.sensor;

    if (sensor !== null) {

      getSensorData(current_place.sensor, 10, visualizeData);

      // Create a marker and store it with the place
      clearMap(map);
      map.removeLayer(current_layer)

      var marker = L.latLng(coord);
      //places[id].marker = marker;

      var location = L.latLng(coord);
      var circle = L.circle(marker, 100, circle_outer).addTo(map);
      markers.push(circle);
      var circle = L.circle(marker, 20, circle_inner).addTo(map);
      markers.push(circle);

      var zoom = 16;
      // Some cities cannot be zoomed to 16
      if (city_id == "shanghai" || city_id == "bangalore" || city_id == "singapore") { zoom = 14; }
      map.setView(marker, 14)
    }
  }

}

$( document ).ready(function() {

  // Initialize the map and geocoder
  map = L.mapbox.map('map', side_map, map_options).setView([37.77072000222513, -122.4359575], 12);
  new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

  _.each(cities, function(city){
    $("#cities").append("<option value='" + city.name + "'>" + city.name + "</option>");
  });

  selectCity();
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


  function selectCity() {

    var city = $("#cities").val();
    var id = city.toLowerCase().split(" ").join("-");
    //city_name = $('option').not(function(){ return !this.selected }).text();
    city_name = $("#cities").val();
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

    // TODO: Why does the geocoder lock and slow the page load?
    //geo_search = initGeoCoder(map, showNeighborhood);

    sensors = _.findWhere(cities, { name : city });

    console.log(city, sensors)
    sensors = sensors.sensors;

    sensor_layer = L.featureGroup();
    $("#select_sensor").html('<option value="none">Select a Sensor</option>');
    _.each(sensors, function(sensor){
      $("#select_sensor").append("<option value='" + sensor.id + "'>" + sensor.hood + " - " + sensor.name + "</option>");

      showSensor(sensor, map, getPlace)
    });
    sensor_layer.addTo(map)
    map.fitBounds(sensor_layer.getBounds());
  }


});
