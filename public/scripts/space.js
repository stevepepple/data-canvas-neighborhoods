var side_map = 'stevepepple.n81nmd73';
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
city_name = "San Francisco";

var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 22,
  minZoom: 1
}

var circle_options = {
  color:'#4A3454', radius: 4,
  stroke: true, opacity: 1.0, weight: 1.0,
  fillColor:'#13D8D3', fillOpacity: 0.7
}

var cycle_time = 15 * 60 * 1000;

// Scale recent activity to a 15 minute timline
var scale = d3.scale.linear();
scale.domain([0, 60]);
scale.range([0.1, 15]);

var color_scale = chroma.scale(['#1F1F2D', '#13D8D3']);

$(document).ready(function() {

  //showTraffic(map);
  $.getJSON("data/san-francisco.json", function(hoods){
    hoods = hoods;
    var hood = turf.filter(hoods, "name", "Mission");

    map = L.mapbox.map("map", side_map, map_options).setView([37.758393, -122.419043], 17);

    svg = d3.select(map.getPanes().popupPane).append("svg").attr("class", "d3_canvas")
    d3_canvas = svg.append("g");

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    extendBounds(map);

    features = new L.FeatureGroup().addTo(map);

    // Show the you are here marker
    var label = L.marker([37.754338, -122.418655], {
      icon: L.divIcon({
        className: 'you-are-here', html: "<div></div>"
      })
    });

    label.addTo(map);

    // Update the screen on an interval
    setInterval(function(){
      startCycle();
    }, cycle_time);

    setTimeout(function(){
      startCycle();
    }, 2 * 1000);

    function startCycle() {

      showTimer();

      showBuildings(map, hood.features[0]);

      getRecentMedia(photos_db, addMedia);
      getRecentMedia(tweets_db, addMedia);
    }

  });
});

function addMedia(media) {

  var now = moment();
  var timestamp = moment.unix(media.time)

  var duration = moment.duration(now.diff(timestamp));
  var minutes = duration.minutes();

  if (media.location) {
    media.geo = {};
    media.geo.coordinates = [media.location.latitude, media.location.longitude];
    media.coord = media.geo.coordinates;
  } else {
    return false;
  }

  //console.log("delay ", (minutes * 100) + 100)
  if (media.geo) {
    var now = moment();
    var timestamp = moment.unix(media.time)

    var duration = moment.duration(now.diff(timestamp));
    var minutes = duration.minutes();

    var delay = (scale(minutes) * 60 * 1000);
    //console.log("minutes to scale: ", minutes, delay)

    setTimeout(function(){
      showIt(media);
    }, delay);
  }

  function showIt(media) {
    var found = [];
    var label = L.marker([media.geo.coordinates[0], media.geo.coordinates[1]], {
      icon: L.divIcon({
        className: 'label',
          html: "<div id='" + media.id + "' class='photo'></div>"
        })
    });
    label.addTo(map);

    var circle = new L.circleMarker(media.geo.coordinates, circle_options).addTo(features);
    findingBuilding(circle, 2.0);

    var random_circles = [];
    var amount = 0.00018;

    var lat = media.geo.coordinates[0];
    var lon = media.geo.coordinates[1];

    //var ops = [ [+, +], [+, -], [-, +], [-, -], [+, =], [=, +], [-, =], [=, -] ]
    random_circles.push( L.latLng( lat + amount, lon + amount ) );
    random_circles.push( L.latLng( lat + amount, lon ) );
    random_circles.push( L.latLng( lat, lon + amount ) );
    random_circles.push( L.latLng( lat - amount, lon + amount ) );
    random_circles.push( L.latLng( lat + amount, lon - amount ) );
    random_circles.push( L.latLng( lat - amount, lon - amount ) );
    random_circles.push( L.latLng( lat - amount, lon ) );
    random_circles.push( L.latLng( lat, lon - amount ) );

    for (var i = 0; i < random_circles.length; i++) {
      var circle = new L.circleMarker( random_circles[i], circle_options );
      //circle.addTo(features);
      findingBuilding(circle, 1.5);
    }

    /*
    if (media.activities) {
      var best = getBest(media.activities, activities);
      if (best !== null) {
        $("#" + media.id).append("<div class='word'>" + best.word + "</div>");
      }
    }
    */

    function findingBuilding(circle, weight) {
      // Make buildings lighter
      if (typeof buildings_layer !== 'undefined') {
        var results = leafletPip.pointInLayer([media.geo.coordinates[1], media.geo.coordinates[0]], buildings_layer);

        if (results.length > 0) {

          var layer = results[0].getLayers()[0]
          var color = layer.options.fillColor;

          var id = layer._leaflet_id;
          if ( found.indexOf(id) == -1 ) {
            //console.log("Hit a new building!" , id)

            var activity_level = layer.options.level;
            //console.log("Level for building: ", activity_level)
            activity_level = parseInt(activity_level) + parseInt(weight);
            layer.options.level = activity_level;
            //console.log("Updated activity level: ", activity_level)
            var color = color_scale( activity_level / 12 ).hex();

            layer.setStyle({fillColor: color});
          }

          found.push(id)
        }
      }
    }


    if (media.activities && media.score > 4 && media.images) {
      var xy = map.latLngToLayerPoint(media.coord)

      var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'><img src='" + media.images.low_resolution.url + "'/></div>");

      if (media.color !== undefined) {
        var main_color = media.color[0];
        //console.log(main_color)
        $(popup).css({ "border" : "solid 10px " + main_color })

        setTimeout(function(){
          $(popup).fadeOut(2000, function() { $(this).remove(); });
        }, 5 * 1000 );

      }

    }


  }

  /*
  if (media.emojis) {
    _.each(media.emojis, function(icon) {
      if (emoji_activities.indexOf(icon) !== -1) {
        $("#" + media.id).append("<div class='emoji'> :" + icon + ": </div>")
      } else {
        console.log("excluding this icon: ", icon)
      }
    });

    emojify.setConfig({
      emojify_tag_type : 'img',
        img_dir : 'https://raw.githubusercontent.com/Ranks/emojify.js/master/dist/images/basic'
    });
    emojify.run();
  }
  */

}
