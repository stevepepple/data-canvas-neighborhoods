var tiles = 'stevepepple.n81nmd73';
var d3_canvas;
var svg;
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
city_name = "San Francisco";

var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 22,
  minZoom: 1
}

var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");
var tweets_db = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/all");
var things_db = new Firebase("https://data-canvas.firebaseio.com/mission/things");

$(document).ready(function() {

  //showTraffic(map);
  $.getJSON("data/san-francisco.json", function(hoods){
    hoods = hoods;
    var hood = turf.filter(hoods, "name", "Mission");

    map = L.mapbox.map("map", tiles, map_options).setView([37.758643, -122.419054], 17);

    /* Make D3 and Leaflet work together */
    //svg = d3.select(map.getPanes().overlayPane).append("svg")
    svg = d3.select(map.getPanes().popupPane).append("svg").attr("class", "d3_canvas");
    d3_canvas = svg.append("g");

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    extendBounds(map);

    features = new L.FeatureGroup().addTo(map);

    // Add some color to the basemap
    $(".leaflet-tile-pane").prepend("<div class='mask'>");

    //showBuildings(map, hood.features[0]);
    createStops();

    showTrains(map, hood.features[0]);
    showBuses(map, hood.features[0]);

    getRecentMedia(tweets_db);
    getRecentMedia(photos_db);
    //getPhotos(map, L.latLng(37.760268, -122.419191));
    //getTweets(map, L.latLng(37.760268, -122.419191));

  });
});

function createStops(){

  _.each(stops.features, function(stop){

    var label = L.marker([stop.geometry.coordinates[1], stop.geometry.coordinates[0]], {
      icon: L.divIcon({
        className: 'label',
          html: "<div id='stop_" + stop.properties.STOPID + "'></div>"
        })
      });
      label.addTo(map)

  })


};

function getRecentMedia(ref) {
  ref
    .limitToLast(100)
    .on("child_added", function(childSnapshot, prevChildKey) {
      var media = childSnapshot.val();
      addMedia(media);
    //var tweet = snapshot.val();
  });

  ref
    .limitToLast(100)
    .on("child_changed", function(childSnapshot, prevChildKey) {
      var media = childSnapshot.val();
      addMedia(media);
    //var tweet = snapshot.val();
  });
}

function addMedia(media) {
  //console.log("New media item: ", moment.unix(media.time).toString())

  if (media.location) {

    var point = { "type": "Feature", "properties": { "marker-color": "#0f0" }, "geometry": { "type": "Point", "coordinates": [media.location.longitude, media.location.latitude] } };
    var stop = turf.nearest(point, stops)
    var stop_id = $("#stop_" + stop.properties.STOPID);

  } else {
    return false;
  }

  // Show things
  if (media.things) {
    var best = getBest(media.things, things);
    if (best !== null) {
      stop_id.append("<div class='thing word'>" + best.word + "</div>");
    }
  }

  // TODO: Show the tweet!
  //console.log("New tweet: ", tweet);
}
