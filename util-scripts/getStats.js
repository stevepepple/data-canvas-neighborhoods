var jsonfile = require('jsonfile')

var express = require('express');
var request = require("request");
var moment = require("moment");
var cors = require('cors');

var _ = require('underscore');

var Firebase = require('firebase');

var photos = new Firebase("https://data-canvas.firebaseio.com/mission/photos");
var colors = new Firebase("https://data-canvas.firebaseio.com/mission/colors/");
var words = new Firebase("https://data-canvas.firebaseio.com/mission/words/");

// Get stats for colors
colors.orderByValue().on("value", function(snapshot) {
  snapshot.forEach(function(data) {
    //console.log("The " + data.key() + " color count is " + data.val());
  });
});

words.orderByValue().on("value", function(snapshot) {
  snapshot.forEach(function(data) {
    console.log( data.key() + " has be used " + data.val()); + " times."
  });
});
