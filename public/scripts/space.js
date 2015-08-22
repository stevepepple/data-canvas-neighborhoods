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
  color:'#FFFFFF', radius: 2,
  stroke: true, opacity: 0.5, weight: 0.5,
  fillColor:'#F7FB59', fillOpacity: 0.7
}


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

    showBuildings(map, hood.features[0]);
    //showTrains(map, hood.features[0]);
    //showBuses(map, hood.features[0]);

    //getPhotos(map, L.latLng(37.760268, -122.419191));
    //getTweets(map, L.latLng(37.760268, -122.419191));

    getRecentMedia(photos_db, addMedia);
    getRecentMedia(tweets_db, addMedia);

  });
});

var emjoi_movement = ["footprints", "running", "runner", "walking", "bicyclist", "airplane", "ship", "end", "dash", "bike", "car", "fuelpump", "rocket", "boat", "anchor", "top", "house", "rowboat", "speedboat", "bus", "taxi", "truck", "train", "wheelchair", "trolleybus"]
var emjoi_things = ["egg", "bouquet", "icecream", "eggplant", "fire_engine", "cat", "dog", "beer", "copyright", "battery", "corn", "spaghetti", "tea", "mushroom", "rooster", "volcano", "bird", "spades", "recycle",
  "camera", "registered", "sunflower", "pizza", "fries", "bread", "ring", "beers", "balloon", "gun", "crown", "octopus", "dress", "goat", "dolls", "horse", "dollar", "dart", "poodle", "five", "watch",
  "moneybag", "rose", "ghost", "peach", "hamburger", "hibiscus", "alien", "cactus", "cake", "seedling", "grapes", "bulb", "pill", "pig", "candy", "tophat", "iphone", "snowman", "chicken", "boar",
  "cherries", "santa", "blossom", "gift", "bear", "angel", "tulip", "cookie", "shell", "gem", "tangerine", "strawberry", "lipstick", "rice", "monkey", "chestnut", "bug", "snake", "cat2",
  "elephant", "watermelon", "rocket", "one", "two", "pineapple", "bee", "frog", "man", "banana", "doughnut", "dolphin", "wolf", "turtle", "whale2", "hash", "tiger2", "cow2", "warning",
  "books", "bomb", "tomato", "boy", "lollipop", "girl", "apple", "fish", "woman", "tiger", "three", "four", "whale", "lemon"]

var emoji_activities = ["running", "runner", "walking", "sparkles", "dancer", "wave", "art", "footprints", "golf", "trophy", "calling",
  "raised_hands", "loud_sound", "notes", "pray", "clap", "muscle", "tent", "tada", "fire", "fireworks", "woman", "dress", "rice", "curry", "bento", "sake", "dvd", "calendar",
  "facepunch", "beer", "beers", "sleeping", "camera", "bicyclist", "ocean", "coffee", "eyeglasses", "baby", "bowling", "scissors", "iphone", "fax", "flashlight", "Mixtape", "blowfish",
  "zap", "sweat", "balloon", "herb", "couple", "mask", "cocktail", "birthday", "headphones", "dash", "baseball", "tophat", "tea", "smoking", "pencil2", "notebook", "memo", "book", "swimmer",
  "microphone", "family", "feet", "cake", "seedling", "bike", "massage", "swimmer", "football", "zzz", "surfer", "soccer", "house", "hocho", "saxophone", "trumpet", "barber",
  "syringe", "basketball", "bikini", "stew", "clapper", "oden", "haircut", "man", "guitar", "books", "boy", "girl", "sushi", "fish", "ramen", "pic", "bath", "bathtub"]

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

function addMedia(media) {

  var now = moment();
  var timestamp = moment.unix(media.time)

  var duration = moment.duration(now.diff(timestamp));
  var minutes = duration.minutes();

  var delay = (minutes * 4000);

  if (media.location) {
    media.geo = {};
    media.geo.coordinates = [media.location.latitude, media.location.longitude];
    media.coord = media.geo.coordinates;
  } else {
    return false;
  }

  //console.log("delay ", (minutes * 100) + 100)
  if (media.geo) {
    setTimeout(function(){
      showIt(media);
    }, delay);
  }

  function showIt(media) {
    var label = L.marker([media.geo.coordinates[0], media.geo.coordinates[1]], {
      icon: L.divIcon({
        className: 'label',
          html: "<div id='" + media.id + "'></div>"
        })
    });
    label.addTo(map);

    var circle = new L.circleMarker(media.geo.coordinates, circle_options).addTo(features);
    animatePoint(media.geo.coordinates);

    if (media.activities) {
      var best = getBest(media.activities, activities);
      if (best !== null) {
        $("#" + media.id).append("<div class='word'>" + best.word + "</div>");
      }
    }

    // Make buildings lighter
    if (typeof buildings_layer !== 'undefined') {
      var results = leafletPip.pointInLayer([media.geo.coordinates[1], media.geo.coordinates[0]], buildings_layer);

      if (results.length > 0) {
        var layer = results[0].getLayers()[0]
        var color = layer.options.fillColor;
        color = chroma(color).brighten().hex();
        layer.setStyle({fillColor: color});
      }
    }

    if (media.score > 5 && media.images) {
      var xy = map.latLngToLayerPoint(media.coord)

      if (media.keywords > 1) {
        console.log("keyword: ", media.keywords)
        var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'>" + keywords[0] + "</div>");
      }

      if (media.score > 30) {
        var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'><img src='" + media.images.low_resolution.url + "'/></div>");
      }

      if (media.color !== undefined) {
        var main_color = media.color[0];
        //console.log(main_color)
        $(popup).css({ "border" : "solid 4px " + main_color })
        $(popup).css({ "-moz-transition" :  "opacity 1s ease-in-out" })

      }
      setTimeout(function(){
          $(".leaflet-popup-pane").prepend(popup);
      }, 340)

      setTimeout(function(){
        if (popup) {
          popup.remove();
        }
      }, 3400);
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
