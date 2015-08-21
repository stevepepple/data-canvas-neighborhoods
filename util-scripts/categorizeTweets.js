var Firebase = require('firebase');
var moment = require('moment');
_ = require('underscore');
var S = require('string');


var searches = {
  "mission" : {
    // #SouthernExposure, #StreetArt, #sfist
    streets : ["Mission st", "Valencia", "Van Ness", "24th st", "23rd st", "22nd st", "21st st", "20th st", "19th st", "18th st", "17th st","16th st", "Capp st"],
    things : [ "Mission", "Mission dist", "Neighborhood", "Mission life", "Mission local", "gentrification", "taquerias", "New Mission", "tourist"],
    general : ["Mission", "SF", "SF Public", "street art", "mural", "#streetart", "mission art", "Mission park", "Mission Parklet", "pop-up", "cafe"]
  },
  "transit" : {
    transit : ["transit", "transport","MUNI", "BART", "Waze", "shuttle bus", "Uber", "Lyft", "Ridesharing", "commute", "parking", "traffic"],
    things : ["bike", "bike lane", "sidewalk", "cyclist", "bicycle", "pedestrian", "walk", "airport", "automobiles", "car", "bus", "train", "tech bus", "taxi"],
    adjectives: ["slow", "waiting", "chilling", "fast"]
  },
  "housing" : {
    rentals : ["airbnb", "condo", "apartment", "housing project", "market rate", "dwell"],
    things : ["house", "home", "residence"],
    adjectives : ["affordable", "luxury", "comfort", "cheap", "expensive"]
  },
  "environment" : {
    weather: ["Weather", "Raining", "Rain", "fog", "foggy", "earthquake", "#Earthquake", "quake", "drought"],
    things: ["Trees", "flowers", "Summer", "Winter", "Trash", "Litter"],
    phrases: ["Felt like", "Feels like"]
  }
}

var tweets = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/housing");

tweets.limitToLast(6000).once('value', function(snapshot) {
  snapshot.forEach(function(item, i){
    var tweet = item.val()
    console.log(tweet.opinion.comparative)

    var id = tweet.id;
    tweet.time =  moment(new Date(tweet.created_at)).unix();

    tweet.keywords = getKeywords(tweet.text);
    if (_.size(tweet.keywords) > 0) { tweet.score++; }


  });
});

// Utilitiy function for saving item to Firebase DB
function saveData(ref, id, item) {
  ref.once('value', function(snapshot) {
      ref.child(id).set(item);
  });
}

function getKeywords(text) {
  var keywords = {};
  _.each(searches, function(terms, type) {
    _.each(terms, function(queries){
      var query = "";
      _.each(queries, function(term) {
        if (S(text).contains(term)) {
          //console.log("Found match: ", term, type, text);
          if (keywords[type]) {
            keywords[type].push(term)
          } else {
            keywords[type] = [term]
          }
        }
      });
    })
  });

  return keywords;
}
