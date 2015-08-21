var jsonfile = require('jsonfile')

var express = require('express');
var request = require("request");
var moment = require("moment");
var cors = require('cors');
var https = require('https');

var Firebase = require('firebase');
var fs = require('fs');

var _ = require('underscore');

var sentiment = require('sentiment');
var Canvas = require('canvas');
var quantize = require('quantize');
var chroma = require ('chroma-js');


var mission_photos = new Firebase("https://data-canvas.firebaseio.com/mission/photos");
var colors = new Firebase("https://data-canvas.firebaseio.com/colors/");

mission_photos.orderByChild("likes").limitToLast(200).once('value', function(snapshot) {

   snapshot.forEach(function(media){
     var photo = media.val();

     var likes = photo.likes.count;
     var comments = photo.comments.count;

     if (likes !== undefined && comments !== undefined) {
       photo.likes = likes;
       photo.comments = comments;

       //console.log(photo.id, photo.likes, photo.comments);

     }

     var url = photo.images.standard_resolution.url;

     try {
      getPalette(url, photo.id, writeColor);
    } catch (e) {
      console.log("error getting palette", e);
    }

    function writeColor(palette) {

      if (palette !== undefined) {
        for (var i = 0; i < palette.length; i++) {

          // Firebase doesn't accept ids with # char
          var color = palette[i].replace("#", "");


          colors.once('value', function(snapshot) {
            if (snapshot.hasChild(color)) {
              var count = snapshot.child(color).val();
              colors.child(color).set(count + 1);
            } else {
              colors.child(color).set(1);
              console.log(color)
            }
          });
        }

        photo.color = palette;
        mission_photos.child(photo.id).set(photo);
      }
    }



   });
});

function getPalette(url, id, callback) {
  var file = fs.createWriteStream("images/" + id + ".jpg");
  var palette = null;

  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      analyzeImage(url, id, callback);

      //file.close(analyzeImage());
    });
  });

  function analyzeImage(file, id, callback){

    var palette_size = 8;
    var palette = null;
    var data = null;
    fs.readFile('./images/' + id + '.jpg', function(err, data) {
      if (err) {
        console.log("error reading file: ", err);
        //throw err;
      }
      media = data;
      processFile(media, callback);

    });

    function processFile(data, callback) {
      console.log("Ready to process data")
      var img = new Canvas.Image;
      img.src = data;

      // Initialiaze a new Canvas with the same dimensions
      // as the image, and get a 2D drawing context for it.
      try {
        var canvas = new Canvas(img.width, img.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
        pixels = ctx.getImageData(0, 0, img.width, img.height).data
        pixelCount = img.width * img.height;

        var pixelArray = [];
        var offset = undefined;
        var r = undefined;
        var g = undefined;
        var b = undefined;
        var a = undefined;

        var i = 0;
        while (i < pixelCount) {
          offset = i * 4
          r = pixels[offset + 0]
          g = pixels[offset + 1]
          b = pixels[offset + 2]
          a = pixels[offset + 3]

          // If pixel is mostly opaque
          if (a >= 125 && r < 250 && g < 250 && b < 250) {
            pixelArray.push([r, g, b])
          }
          i++;
        }

        var cmap = quantize(pixelArray, palette_size);
        palette = cmap.palette();

        var hex_palatte = [];
        for (var i = 0; i < palette.length; i++) {
            var rgb = palette[i];
            var color = chroma(rgb);
            // TODO:  Dominant color is the first in the array?
            hex_palatte.push(color.hex());
        }
      } catch (e) {
        console.log(e)
      }

      callback(hex_palatte);

    }

  }
}
