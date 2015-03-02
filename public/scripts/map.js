/* Do some uniteresting initialiation */
var main_map = 'osaez.kp2ddba3';
var side_map = 'osaez.lbh2oe11'
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
var map_options = {
    attributionControl: false,
    zoomControl: false,
    maxZoom: 18,
    minZoom: 5
}

// Setup the Leaflet Geocoder
var geo_search;
var city_name;
//initGeoCoder(showNeighborhood);

function initGeoCoder(callback) {

  select_place = L.mapbox.map('add_place_map', side_map, map_options).setView([37.77072000222513, -122.4359575], 12);
  // Disable drag and zoom handlers.
  select_place.dragging.disable();
  select_place.touchZoom.disable();
  select_place.doubleClickZoom.disable();
  select_place.scrollWheelZoom.disable();

	// Initialize the Leaflet Geocoder
   city_name = $('option').not(function(){ return !this.selected }).text();
   geo_search = new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.Google(),
      params : { city : city_name },
      callback : setResult
   }).addTo(select_place);

   // See if there are new results
   var expire;
   function setResult(result) {
      // Use a timer to reduce the number of map operations
      clearMap();
      clearTimeout(expire);
      clearInterval(timer);
      vehicles_query = {}

      expire = setTimeout(function(){
         callback(result);
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
         cursor: "pointer", fillColor: '#00BAF4', fillOpacity: 0.05, weight: 1, opacity: 0.6, color: '#00BAF4'
      },
      onEachFeature: onEachFeature
   });
   current_layer.addTo(map);
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

     current_layer = L.geoJson(selected, {  fillColor: '#00BAF4', fillOpacity: 0.05, weight: 4, opacity: 0.4, color: '#00BAF4' })
	   current_layer.addTo(map);
     //TODO: Should we zoom to it or just mark it as selected?
     //map.fitBounds(current_layer.getBounds());
   }
}
