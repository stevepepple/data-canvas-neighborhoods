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

var cycle_time = 15 * 60 * 1000;
var ignore = ["mission", "missiondistrict"];
var used = [];
var labels = [];

// Scale recent activity to a 15 minute timline
var scale = d3.scale.linear();
scale.domain([0, 60]);
scale.range([0.1, 15]);

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

    var label = L.marker([37.754338, -122.418655], {
      icon: L.divIcon({
        className: 'you-are-here',
          html: "<div></div>"
        })
    });
    labels.push(label)
    label.addTo(map);

    createStops();

    showBuses(map, hood.features[0]);
    showTrains(map, hood.features[0]);
    cleanUpBuses();

    setInterval(function(){
      startCycle();
    }, cycle_time);

    setTimeout(function(){
      startCycle();
    }, 2 * 1000);

    function startCycle() {
      showTimer();

      getRecentMedia(tweets_db);
      getRecentMedia(photos_db);

      var num_vehicles = _.size(vehicles_query);
      console.log("Number of vehicles: ", _.size(vehicles_query))

      if (num_vehicles < 30) {
        $(".level").text("LIGHT")
      } else {
        $(".level").text("HEAVY")
      }
    }
    //getPhotos(map, L.latLng(37.760268, -122.419191));
    //getTweets(map, L.latLng(37.760268, -122.419191));

  });
});

function createStops(){

  _.each(stops.features, function(stop){

    var label = L.marker([stop.geometry.coordinates[1], stop.geometry.coordinates[0]], {
      icon: L.divIcon({
        className: 'label',
          html: "<div class='stop' id='stop_" + stop.properties.STOPID + "'><div class='name'>" + stop.properties.ONSTREET + "</div></div>"
        })
      });
    label.addTo(map)
  });
};

function cleanUpBuses(){
  // Clean up the buses every once an while
  setInterval(function(){
    var now = moment()
    _.each(vehicles_query, function(bus){
      var last_update = moment(bus.timestamp)
      console.log(last_update.toString())

      var diff = now.diff(last_update, "minutes");

      if (diff => 15) {
        console.log(bus)
        bus.rectangle.remove();
      }
    })
  }, 15 * 60 * 1000);
}

function getRecentMedia(ref, count) {
  ref
    .limitToLast(200)
    .orderByChild("time")
    .on("child_added", function(childSnapshot, prevChildKey) {
      var media = childSnapshot.val();
      addMedia(media);
  });

  ref
    .limitToLast(200)
    .on("child_changed", function(childSnapshot, prevChildKey) {
      var media = childSnapshot.val();
      addMedia(media);
    //var tweet = snapshot.val();
  });
}

function addMedia(media) {
  //console.log("New media item: ", moment.unix(media.time).toString())

  // TODO: Handle this on the API side
  if (media.location) {
    media.geo = {};
    media.geo.coordinates = [media.location.latitude, media.location.longitude];

  } else {
    return false;
  }

  if (media.geo) {
    var now = moment();
    var timestamp = moment.unix(media.time)

    if (media.places || (media.keywords && media.keywords.transit)) {
      var duration = moment.duration(now.diff(timestamp));
      var minutes = duration.minutes();
      //console.log("Scale mintues to cycle time" , scale(minutes), minutes)
      var delay = (scale(minutes) * 60 * 1000);

      setTimeout(function(){
        showIt(media);
      }, delay);
    }

  }

  function showIt(media) {

    media.coord = media.geo.coordinates;
    var point = { "type": "Feature", "properties": { "marker-color": "#0f0" }, "geometry": { "type": "Point", "coordinates": [media.location.longitude, media.location.latitude] } };
    var stop = turf.nearest(point, stops)
    var stop_id = $("#stop_" + stop.properties.STOPID);

    if (media.places) {
      _.each(media.places, function(place){
        console.log("Found a place: ", media.places)
        if (ignore.indexOf(place) == -1 && ignore.indexOf(place) == -1) {
          var name = _.findWhere(places, { place : place.toLowerCase() });
          //var thing = $("<div class='thing word'>\"" + name.name + "\"</div>");
          addThing( name.name , stop_id );
          used.push(place);
        }
      });

    }

    if (media.keywords && media.keywords.transit) {
      // Add the first keyword
      console.log("Transit keywords: ", media.keywords.transit)
      addThing( media.keywords.transit[0], stop_id );
    }

    function addThing( thing, stop_id ) {

      var thing = $("<div class='thing word'>\"" + thing + "\"</div>")
        .appendTo(stop_id)
        .fadeIn(1000);

      setTimeout(function(){
        thing.fadeOut(2000, function() { $(this).remove(); });
      }, 5 * 60 * 1000 );

    }

    /* if (media.things) {
      var best = getBest(media.things, things);
      if (best !== null) { stop_id.append("<div class='thing word'>" + best.word + "</div>"); }
    } */
  }

}
