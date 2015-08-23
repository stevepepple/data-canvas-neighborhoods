var side_map = 'stevepepple.n2j7good';
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
city_name = "San Francisco";

var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 22,
  minZoom: 1
}

var d3_canvas;

//   { name: "Bernal Heights", key : "KCASANFR460", coord : [37.744427, -122.408691], fog : 0.8 },
/*
{ name: "North Mission", key : "KCASANFR49", coord : [37.770599,-122.423500], fog : 0.5 },
{ name: "SOMA", key : "KCASANFR58", coord : [37.773285,-122.417725], fog : 0.7 },
{ name: "19th and Folsom", key : "KCASANFR259", coord : [37.759354,-122.415085], fog : 0.2 },
{ name: "Mission Bar and Burrito", key : "KCASANFR142", coord : [37.765530,-122.422913], fog: 0.6 },
{ name: "Noe Valley", key : "KCASANFR319", coord : [37.754993,-122.429291], fog: 0.8 },
{ name: "Diamond Heights", key : "KCASANFR73", coord : [37.741833,-122.433586], fog: 0.0 },
{ name: "Bernal Heights 2", key : "KCASANFR338", coord : [37.740891,-122.418312], fog: 0.3 },
{ name: "Japantown", key : "KCASANFR240", coord : [37.787968,-122.430611], fog: 0.8 },
{ name: "Glen Park", key : "KCASANFR385", coord : [37.734421,-122.432434], fog: 0.9 }
*/
var stations = [
  { name: "North Mission", key : "KCASANFR49", coord : [37.770599,-122.423500], fog : 0.5 },
  { name: "Mission", key : "KCASANFR335", coord : [37.763035,-122.412949], fog : 0.8 }
]

var emoji_feelings = ["blush", "heart", "laughing", "heart_eyes", "tuck_out_tongue", "stuck_out_tongue", "lips",
  "cupid", "pensive", "moyai", "city_sunset", "v", "relaxed", "ok_hand", "sunny", "green_heart", "broken_heart",
  "bouquet", "sunglasses", "dizzy", "dizzy_face", "smiling_imp", "stuck_out_tongue_winking_eye", "kiss", "joy",
  "sob", "100", "heartpulse", "yum", "weary", "relieved", "unamused", "tada", "grin", "fist", "wink", "smirk",
  "facepunch", "dizzy", "pensive", "smile", "sunflower", "skull", "laughing", "grinning", "bangbang", "confused", "nose",
  "eyes", "eyeroll", "hand", "boom", "expressionless", "ring", "flushed", "zap", "sweat", "sweat_drops", "bulb", "stars", "snowman",
  "sweat_smile", "cry", "innocent", "umbrella", "hearts", "smiley", "balloon", "scream", "leaves", "sleepy", "cloud", "couplekiss",
  "couplekiss", "couple", "rainbow", "mask", "heartbeat", "tongue", "triumph", "sunrise", "disappointed", "star", "star2", "rage", "kissing", "anger",
  "cactus", "cyclone", "grimacing", "foggy", "worried", "confounded", "guardsman", "hankey", "persevere", "ribbon", "princess", "frowning",
  "hushed", "droplet", "snowflake", "astonished", "angry", "imp", "anguished", "fearful", "bow", "fireworks", "exclamation", "cool", "sos"]


$(document).ready(function() {

  //showTraffic(map);
  $.getJSON("data/san-francisco.json", function(hoods){
    hoods = hoods;
    var hood = turf.filter(hoods, "name", "Mission");

    map = L.mapbox.map("map", side_map, map_options).setView([37.758826, -122.415752], 15);

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    extendBounds(map);

    features = new L.FeatureGroup().addTo(map);

    $("body").bind("click", function(e){
      console.log(e)
    })

    // Setup the d3 Canvas
    svg = d3.select(map.getPanes().popupPane).append("svg").attr("class", "d3_canvas");
    d3_canvas = svg.append("g");

    svg2 = d3.select("#canvas").append("svg").attr("class", "canvas");
    canvas = svg2.append("g");

    // TODO: Update every 5 mins?
    getWeather();

    setInterval(function(){
      showFog();
    }, 8 * 2000)

    emojify.setConfig({
      emojify_tag_type : 'img',
        img_dir : 'https://raw.githubusercontent.com/Ranks/emojify.js/master/dist/images/basic'
    });

    //getRecentMedia(tweets_db, addMedia);
    //getRecentMedia(photos_db, addMedia);


    //showBuildings(map, hood.features[0]);
    //showTrains(map, hood.features[0]);
    //showBuses(map, hood.features[0]);

    //getPhotos(map, L.latLng(37.760268, -122.419191));
    //getTweets(map, L.latLng(37.760268, -122.419191));

  });


  function getWeather(){
    var url = "http://api.wunderground.com/api/5f604b3481da54f8/conditions/q/pws:";

    _.each(stations, function(station){

      station.xy = map.latLngToContainerPoint([ station.coord[0], station.coord[1] ]);

      var label = L.marker(station.coord, {
        icon: L.divIcon({
          className: 'label',
          html: "<div id='" + station.key + "' class='sensor'>" + station.name + "</div>"
        })
      });
      label.addTo(map);
    });

    _.each(stations, function(station){
      $.getJSON(url + station.key + ".json", function(result){

        var id = result.current_observation.station_id;
        var current_station = _.findWhere(stations, { key : id });
        console.log(current_station, result.current_observation)

        $("#" + station.key).html(result.current_observation.feelslike_f + "&#176;" + "<img class='weather_icon' src='" + result.current_observation.icon_url + "'/>");

        var temp = result.current_observation.feelslike_f;
        var dew = result.current_observation.dewpoint_f;
        var wind_degrees = result.current_observation.wind_degrees;
        var ratio = dew / temp;
        var humidity = result.current_observation.relative_humidity;
        current_station.humidity = humidity.replace("%", "") / 100;

        console.log("temp_f: ", temp)
        console.log("dewpoint_f: ", dew)
        console.log("dew to fog: ", ratio)
        console.log("wind_dir: ", wind_degrees)
        console.log("humidity: ", current_station.humidity)

        // If humidity is 100% or dewpoint temperature that is the same or higher than the actual temperature,
        // then their is likeley fog.
        current_station.fog_ratio = ratio;
        current_station.wind_degrees = wind_degrees;

        if (wind_degrees != -9999) {
          console.log("For direction: ", result.current_observation.wind_dir)
          var radians = wind_degrees * Math.PI / 180;
          console.log("Radians: ", radians)
          var x = Math.cos(radians);
          var y = Math.cos(radians);
          current_station.slope = [x * -1, y * -1]
          console.log("Slope for direction: ", current_station.slope)
        } else {
          current_station.slope = null;
        }
        //var point = L.latLng(current_station.coords)

      });
    })
  }

  var scale = chroma.scale(['#FFD36F', '#4DCFDD'])
    .domain([0.2, 1.0]);

  function showFog() {

    var points = [[524, 945, 0.1]]

    var num_particles = 200;
    var width = 1080;
    var height = 1920;

    var count = num_particles;

    while (count > 1) {
      var particle = {};

      var x = Math.floor(Math.random() * width)
      var y = Math.floor(Math.random() * height)

      particle.x = x;
      particle.y = y;

      var dist = null;
      var closest = null;
      _.each(stations, function(station){
        var between = getDistance(station.xy, particle);
        //console.log("distance between", between)
        if (between < dist || dist == null) {
          closest = station;
          dist = between;
        }
      });

      //var radius = Math.floor(Math.random() * 32)
      var radius = 30;
      //var duration = Math.floor(Math.random() * 10)

      var hum_color = scale(closest.humidity).hex();

      var filter = getShadow();

      // Group the particles
      /*
      x = x + (closest.xy.y / 3);
      y = y + (closest.xy.y / 3);
      */

      dot = d3_canvas.append("circle")
        .attr("class", "dot")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radius * closest.fog_ratio)
        .style("filter", "url(#drop-shadow)")
        .style({ "fill" : chroma.blend.lighten("#FFFFFF", hum_color).hex(), "opacity" : closest.fog_ratio });

      if (closest.slope) {
        //console.log("starting position: ", x, y)
        x = x + (closest.slope[0] * 1000);
        y = y + (closest.slope[1] * 1000);

        //console.log("move in this direction: ", x, y)
      } else {
        x += 1000;
        y
      }

      dot
        .transition()
        .ease("quad")
        .duration(2000 * 10)
        .attr("cx", x)
        .attr("cx", y)
        .attr("opacity", "0.5")
        .remove();

      count--;
    }
  };

});

function getDistance(a, b){
  var distance = Math.sqrt(
      Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
  );

  return distance;
}

function addMedia(media) {
  //console.log("New media item: ", moment.unix(media.time).toString())

  if (media.location) {
    media.geo = {};
    media.geo.coordinates = [media.location.latitude, media.location.longitude];
  } else {
    return false;
  }

  if (media.geo) {

    var point = map.latLngToContainerPoint([ media.geo.coordinates[0], media.geo.coordinates[1] ]);

    var label = L.marker([media.geo.coordinates[0], media.geo.coordinates[1]], {
      icon: L.divIcon({
        className: 'label',
          html: "<div id='" + media.id + "'></div>"
        })
    });

    label.addTo(map);

    if (media.emojis) {
      _.each(media.emojis, function(icon) {

        if (emoji_feelings.indexOf(icon) !== -1) {

          var duration = Math.floor(Math.random() * 20)

          setTimeout(function(){

            $("#" + media.id).append("<div class='emoji'> :" + icon + ": </div>");
            $("#" + media.id).find(".emoji").animate({
              "margin-left": "+=600",
            }, 5000, function() {
              // Animation complete.
            });

            emojify.run();
          }, 2000 * duration);

        }

      });
    }



  }


  label.addTo(map);

  if (media.feelings) {
    var best = getBest(media.activities, activities);
    if (best !== null) {
      $("#" + media.id).append("<div class='word'>" + best.word + "</div>");
    }
  }
}

function getShadow(){
  var filter = d3_canvas.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "140%");

  // SourceAlpha refers to opacity of graphic that this filter will be applied to
  // convolve that with a Gaussian with standard deviation 3 and store result
  // in blur
  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 8)
      .attr("result", "blur");

  // translate output of Gaussian blur to the right and downwards with 2px
  // store result in offsetBlur
  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 20)
      .attr("dy", 20)
      .attr("result", "offsetBlur");

  // overlay original SourceGraphic over translated blurred opacity by using
  // feMerge filter. Order of specifying inputs is important!
  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
  feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");


  return filter;
}
