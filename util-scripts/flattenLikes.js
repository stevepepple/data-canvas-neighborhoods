var jsonfile = require('jsonfile')

var express = require('express');
var request = require("request");
var moment = require("moment");
var cors = require('cors');

var Firebase = require('firebase');

var _ = require('underscore');

var mission_photos = new Firebase("https://data-canvas.firebaseio.com/mission/photos");

mission_photos.once('value', function(snapshot) {

   snapshot.forEach(function(media){
     var photo = media.val();


     var likes = photo.likes.count;
     var comments = photo.comments.count;

     if (likes !== undefined && comments !== undefined) {
       photo.likes = likes;
       photo.comments = comments;

       console.log(photo.id, photo.likes, photo.comments);
       mission_photos.child(photo.id).set(photo);
     }

   });
});

/*
_.each(photo_db, function(item){

  console.log(item.id)

  var feature = {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [0, 0] },
    "properties": { "id": "none" }
  }

  var lat = item.location.latitude;
  var lon = item.location.longitude;

  feature.geometry.coordinates = [lon, lat];

  feature.properties.id = item.id;
  feature.properties.created_time = item.created_time;
  feature.properties.likes = item.likes.count;
  feature.properties.comments = item.comments.count;
  feature.properties.link = item.link;

  geojson.features.push(feature)
  //console.log(feature)
})

jsonfile.writeFile("./public/data/market_photos.geojson", geojson, function (err) {
  console.error(err)
})
*/
//var photo_geo = GeoJSON.parse(photo_db, {Point: ['latitude', 'longitude']});
