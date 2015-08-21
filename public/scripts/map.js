/* Do some uniteresting initialiation */
var main_map = 'osaez.kp2ddba3';
var side_map = 'stevepepple.lbj8m1n3';
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';

var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 22,
  minZoom: 1
}

var circle_outer = {
  color:'#00a99d',
  opacity: 0,
  weight: 1,
  fillColor:'#00a99d',
  fillOpacity: 0.9
}

var circle_inner = {
  color:'#ffffff',
  opacity: 0,
  weight: 1,
  fillColor:'#ffffff',
  fillOpacity: 0.9
}

var LeafIcon = L.Icon.extend({})
var marker_icon =  new LeafIcon({iconUrl:  'marker.png'});
var selected_icon = new LeafIcon({iconUrl: 'marker-selected.png'})

// Setup the Leaflet Geocoder
var geo_search;
var features;
var city_name;
var city_bounds;
var current_layer;
var sensor_layer;
var hood_layer;
var timer;
//initGeoCoder(showNeighborhood);

function initGeoCoder(map, callback) {

  // Disable drag and zoom handlers.
  //map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();

  // Initialize the Leaflet Geocoder
  city_name = $('#cities option').not(function(){ return !this.selected }).text();

  geo_search = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    showMarker: false,
    params : { city : city_name },
    callback : setResult
  }).addTo(map);

  // Style the search area
  $("#leaflet-control-geosearch-qry").addClass("topcoat-search-input--large")

  // See if there are new results
  var expire;
  function setResult(result) {
    console.log("Geocode result: ", result)
    // Use a timer to reduce the number of map operations
    clearMap(map);
    //clearTimeout(expire);
    clearInterval(timer);
    //vehicles_query = {}

    expire = setTimeout(function(){
       callback(result, map);
       setNeighborhood(result, map)
       //showTransit(result)
    }, 1000);
  }
}

// User the Google Geocoder to find neigborhood and address
function getAddress(coord, callback) {
  var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coord.lat + "," + coord.lng + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54&result_type=neighborhood|locality|sublocality|";
  fetchData(query, function(results){
    // Simply take the best result, if there is more than one.
    var result = results.results[0];

    callback(result);
  });
}

// User the Google Timezone Service
function getTimezone(coord, callback) {

  var now = new Date();
  var timestamp = Math.floor(Date.now() / 1000)

  var query = "https://maps.googleapis.com/maps/api/timezone/json?location=" + coord.lat + "," + coord.lng + "&timestamp=" + timestamp + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54";
  fetchData(query, function(result){
    callback(result);
  });
}

function showNeighborhood(place, map) {

   var point = new turf.point([place.X, place.Y]);

   var selected = null;
   var selected_routes = [];

   _.each(hoods.features, function(feature){
		var isInside = turf.inside(point, feature);
      // Only find the best hood
      // TODO: Handle overlapping hoods?
		if(isInside) {
      selected = feature;
    }
   });

   if(selected !== null) {
     current_layer = L.geoJson(selected, {  fillColor: '#BC2285', fillOpacity: 0.3, weight: 4, opacity: 0.6, color: '#9E005D'})
     current_layer.addTo(map);
   }
}

function showSensorMarker(coord, map) {

  //var marker = L.latLng(coord);
  var marker = L.marker(coord);
  var location = L.latLng(coord);

  var zoom = 18;
  // Some cities cannot be zoomed to 16
  if (city_name == "Shanghai" || city_name == "Bangalore" || city_name == "Singapore") { zoom = 14; }
  //map.setView(marker, zoom)
}

function showCityLayer(data, map, callback, onclick) {
   hoods = data;
   // Show all hoods
   hood_layer = L.geoJson(data, {
      style: {
         cursor: "pointer", fillColor: '#D3D3D3', fillOpacity: 0.1, weight: 2, opacity: 0.6, color: '#FFFFFF'
      },
      onEachFeature: onEachFeature
   });

   hood_layer.addTo(map);
   city_bounds = hood_layer.getBounds();
   //map.fitBounds(hood_layer.getBounds());

   //callback();

   function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
     if (feature.properties && feature.properties.popupContent) {
          //layer.bindPopup(feature.properties.popupContent);
     }
     layer.on({
        click: function(e) {
           var place = {}
           place.X = e.latlng.lng;
           place.Y = e.latlng.lat;
           setNeighborhood(place, map, onclick)
        }
     });
   }
 }

 function setNeighborhood(place, map, callback) {

   var point = new turf.point([place.X, place.Y])
	 var selected = null;
   var selected_routes = [];
   var number_inside = 0;

   _.each(hoods.features, function(feature){
     var isInside = turf.inside(point, feature);
     // Only find the best hood
     // TODO: Handle overlapping hoods?
     if(isInside) {

       selected = feature;

       _.each(sensors, function(sensor){
         var sensor_point = new turf.point([sensor.location[0], sensor.location[1]]);
         if (turf.inside(sensor_point, selected)) {
           number_inside++;
         }
       });
     }
   });

   // Clear the geojson layer
   if (current_layer !== undefined) { map.removeLayer(current_layer) }

   if(selected !== null && number_inside == 1) {
     current_layer = L.geoJson(selected, {  fillColor: '#BC2285', fillOpacity: 0.3, weight: 4, opacity: 0.6, color: '#9E005D'})
	   current_layer.addTo(map);

     // Get the center of the neigborhood and select the nearest sensor
     var center_point = turf.center(selected);
     current_place = center_point;
     current_place.geometry.location = {}
     current_place.geometry.location.lat = current_place.geometry.coordinates[1];
     current_place.geometry.location.lng = current_place.geometry.coordinates[0];
     center_point = pointToLatLng(center_point);

     // Mark the sensor as selected
     var sensor = getNearestSensor(select_place);
     selectSensor(sensor, select_place);

     // Setup the UI in cityUI
     //callback(place);

     //TODO: Should we zoom to it or just mark it as selected?
     map.fitBounds(current_layer.getBounds());
     //map.setZoom(map.getZoom() - 2)
   } else {
     current_layer = L.geoJson(selected, {  fillColor: '#BC2285', fillOpacity: 0.3, weight: 4, opacity: 0.6, color: '#9E005D'});
	   current_layer.addTo(map);
     select_place.fitBounds(current_layer.getBounds());

     $("#sensor_info").find(".message").html("Select a sensor in this neigborhood.");
   }
}

// Add sensor to the map
function showSensor(place, map, callback) {

  var coord = L.latLng(place.location[1], place.location[0]);
  var marker = L.marker(coord);
  //marker.setIcon(marker_icon);
  marker.id = place.id;
  markers.push(marker);
  marker.addTo(sensor_layer);
  //marker.setIcon(marker_icon);
  marker.on('click', function(e) {
    //console.log(e);
    clearLayer(map, current_layer)
    clearSensors();
    e.target.setIcon(selected_icon);
    //map.setView(e.target.getLatLng(), 14);
    //showNeighborhood(place, map);
    var place = e.target.getLatLng();
    place.X = place.lng;
    place.Y = place.lat;
    place.id = e.target.id;

    callback(place);
  });

}

function selectSensor(place, map) {

  clearSensors();

  // Find the clicked marker in the list cached markers
  console.log(place)
  var marker = _.findWhere(markers, { id : place.id });

  // Click the marker to perform the ops in showSensor
  marker.fire("click");
}

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


function clearSensors() {
  _.each(markers, function(marker) {
    marker.setIcon(marker_icon);
  });

  return true;
}

function centerPlaces() {
  // Do some magic to make the maps fit
  _.each(places, function(place){
    var width = $("#" + place.place_id).width();
    place.map._size.x = width;
    //place.map.setView(place.marker)
    place.map.panTo(place.marker)
  });
}

function createPoint(lat, lng, properties) {
  var point = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [lng, lat]
    }
  }
  return point;
}

function pointToLatLng(point) {
  var lat = point.geometry.coordinates[1];
  var lng = point.geometry.coordinates[0];
  var latLng = L.latLng( lat, lng);

  return latLng;
}

function extendBounds(map) {

  var getPxBounds = map.getPixelBounds;

  map.getPixelBounds = function () {
    var bounds = getPxBounds.call(this);
    // ... extend the bounds
    bounds.min.x=bounds.min.x-1000;
    bounds.min.y=bounds.min.y-1000;
    bounds.max.x=bounds.max.x+1000;
    bounds.max.y=bounds.max.y+1000;
    return bounds;
  };
}

// Util function to clear all features/markers
function clearMap(map, layer) {

  if (layer) {
    map.removeLayer(layer)
  }


  for (i = 0; i < markers.length; i++) {
      map.removeLayer(markers[i])
  }
}

function clearLayer(map, layer) {
  if (layer) {
    map.removeLayer(layer)
  }
}
