var Firebase = require('firebase');
var fs = require('fs');

var _ = require('underscore');

var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var Trie = natural.Trie;

var mission_photos = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");

mission_photos.orderByChild("likes").limitToLast(6000).once('value', function(snapshot) {

   console.log("Search for Tokens...")
   snapshot.forEach(function(media, i){

      var photo = media.val();

      var searches = {
        "transit" : [
          "muni", "bart", "bus", "bus stop", "train", "tech bus", "shuttle bus", "uber", "lyft", "ridesharing", "commute", "automobiles", "car", "parking",
          "bike", "bike lane", "cyclist", "bicycle", "pedestrian", "walk", "slow", "waiting", "chilling", "fast"
        ],
        "mission" : [
          "mission", "sf", "sanfrancisco", "mission dist", "neighborhood", "mission life", "mission local", "gentrification", "mission st", "taquerias", "valencia street", "New Mission", "Capp st.", "Mission st.", "Valencia st", "Van Ness", "24th st.", "23rd st", "22nd st",  "21st st", "20th st", "19th st", "18th st", "17th st", "16th st", "street art mission", "Mission park", "Mission Parklet", "Mission pop-up"
        ],
        "housing" : ["affordable", "luxury", "condo", "Mission apartment", "Mission housing project", "Mission market rate", "comfort"],
        "environment" : ["earthquake",  "#Earthquake", "#quake" , "Drought"]
      }
      //console.log(photo.caption.text)

      if (photo.caption !== undefined) {
        //var trie = new Trie(false);
        //console.log(photo.caption.text)
        //trie.addString(photo.caption.text);
        _.each(searches, function(search, key) {
          var type = key;
          _.each(search, function(token) {
            if(photo.caption.text.toLowerCase().indexOf(token) > -1) {
              var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/" + type + "/");


               if (typeof(photo.keywords) !== 'undefined' ) {
                 photo.keywords.push(token);
               } else {
                 photo.keywords = [];
                 photo.keywords.push(token);
               }

               photos_db.child(photo.id).set(photo);

               console.log(photo.caption.text, " : ", type)
            }

          })
        });
      }

   });
   console.log("Done searching...")
});
