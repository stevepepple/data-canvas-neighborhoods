/* Do some uniteresting initialiation */
var main_map = 'osaez.kp2ddba3';
var side_map = 'stevepepple.lbj8m1n3'
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 18,
  minZoom: 5
}

var circle_outer = {
  color:'#ACB63C',
  opacity: 0,
  weight: 1,
  fillColor:'#ACB63C',
  fillOpacity: .6
}

var circle_inner = {
  color:'#8D9700',
  opacity: 0,
  weight: 1,
  fillColor:'#8D9700',
  fillOpacity: .6
}

// Setup the Leaflet Geocoder
var geo_search;
var city_name;
var city_bounds;
var timer;
//initGeoCoder(showNeighborhood);

function initGeoCoder(callback) {

  select_place = L.mapbox.map('add_place_map', side_map, map_options).setView([37.77072000222513, -122.4359575], 12);
  // Disable drag and zoom handlers.
  select_place.dragging.disable();
  select_place.touchZoom.disable();
  select_place.doubleClickZoom.disable();
  select_place.scrollWheelZoom.disable();

	// Initialize the Leaflet Geocoder
   city_name = $('#cities option').not(function(){ return !this.selected }).text();

   geo_search = new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google(),
      showMarker: false,
      params : { city : city_name },
      callback : setResult
   }).addTo(select_place);

   // Style the search area
   $("#leaflet-control-geosearch-qry").addClass("topcoat-search-input--large")


   // See if there are new results
   var expire;
   function setResult(result) {
       console.log("Geocode result: ", result)
      // Use a timer to reduce the number of map operations
      clearMap();
      //clearTimeout(expire);
      clearInterval(timer);
      //vehicles_query = {}

      expire = setTimeout(function(){
         callback(result);
         setNeighborhood(result, select_place)
         //showTransit(result)
      }, 1000);
   }
}

function showNeighborhood(place) {

   var point = new turf.point([place.X, place.Y])
	 var selected = null;
   var selected_routes = [];

   _.each(hoods.features, function(feature){
		var isInside = turf.inside(point, feature);
      // Only find the best hood
      // TODO: Handle overlapping hoods?
		if(isInside) { selected = feature; }
   });

}

function showCityLayer(data, map) {
   hoods = data;
   // Show all hoods
   current_layer = L.geoJson(data, {
      style: {
         cursor: "pointer", fillColor: '#00BAF4', fillOpacity: 0.1, weight: 2, opacity: 0.6, color: '#00BAF4'
      },
      onEachFeature: onEachFeature
   });

   current_layer.addTo(map);
   city_bounds = current_layer.getBounds();
   map.fitBounds(current_layer.getBounds());

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
             setNeighborhood(place, map)
          }
     });
   }
 }

 function setNeighborhood(place, map) {

   var point = new turf.point([place.X, place.Y])
	 var selected = null;
   var selected_routes = [];

   _.each(hoods.features, function(feature){
     var isInside = turf.inside(point, feature);
     // Only find the best hood
     // TODO: Handle overlapping hoods?
     if(isInside) { selected = feature; }
   });

   // Clear the geojson layer
   if (current_layer !== null) { map.removeLayer(current_layer) }

   if(selected !== null) {
     current_layer = L.geoJson(selected, {  fillColor: '#BC2285', fillOpacity: 0.5, weight: 4, opacity: 0.6, color: '#9E005D' })
	   current_layer.addTo(map);

     // Setup the UI in cityUI
     initAdd(place);

     //TODO: Should we zoom to it or just mark it as selected?
     //map.fitBounds(current_layer.getBounds());
     //map.setZoom(map.getZoom() - 2)
   }
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

// Util function to clear all features/markers
function clearMap() {
  select_place.removeLayer(current_layer)

  for (i = 0; i < markers.length; i++) {
    map.removeLayer(markers[i])
  }

}
