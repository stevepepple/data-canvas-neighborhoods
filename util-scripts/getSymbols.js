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


var tweets = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/all");
var symbols = new Firebase("https://data-canvas.firebaseio.com/mission/symbols/");

tweets.limitToLast(5000).once('value', function(snapshot) {

   snapshot.forEach(function(tweet, i){
     var tweet = tweet.val();
     getSymbols(tweet);
   });

   console.log("Done.")
});

function getSymbols(tweet) {
  if (tweet.entities) {
    if (tweet.entities.symbols !== undefined) {
      console.log(tweet.entities.symbols.text);

    }
  }
}
