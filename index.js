var express = require('express');
var request = require("request");
var cors = require('cors');

var app = express();
app.set('port', (process.env.PORT || 9000));
app.use(express.static(__dirname + '/public'));
app.use(cors());

// Libraries for ReadMe
var fs = require('fs');
var marked = require('marked');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.options('/data', function(req, res){
  console.log("writing headers only");
  res.header("Access-Control-Allow-Origin", "*");
  res.end('');
});

var request = require('request');

var OAuth= require('oauth').OAuth;

app.options('/test', cors());
app.get('/test', cors(), function(req, res, next){
  res.json({
    text: 'Complex CORS requests are working. [DELETE]'
  });
});


var natural = require('natural');
var wordnet = new natural.WordNet();
var moment = require("moment");

app.get('/instagram', function(req, res, next) {

  var now = new Date();
  var now = moment(now);
  // TODO: add timezone support?
  last_hour = moment().subtract(6, 'hour');
  console.log("last hour", last_hour.unix())

  // Get places
  // https://api.instagram.com/v1/locations/search?lat=37.73914&lng=-122.428851&access_token=1184614097.1677ed0.775666861a0a4a89a395a5a8229f3493&distance=10m

  // Get recent photos
  // https://api.instagram.com/v1/locations/214366876/media/recent?access_token=1184614097.1677ed0.775666861a0a4a89a395a5a8229f3493

  // Get photos by lat/lon
  //https://api.instagram.com/v1/media/search?lat=48.858844&lng=2.294351&access_token=ACCESS-TOKEN

  console.log("getting photos...")
  var url = 'https://api.instagram.com/v1/';
  var access_token = "1184614097.1677ed0.775666861a0a4a89a395a5a8229f3493";

  var lat = req.query.lat;
  var lng = req.query.lng;

  if (lat == undefined || lng == undefined) {
    res.json("error");
    return false;
  }

  var path = 'media/search?' + 'lat=' + lat + '&lng=' + lng + '&distance=200m' + '&min_timestamp=' + last_hour.unix() + '&access_token=' + access_token;

  request(url + path, function(error, response, body) {
    if (error == null) {
      var data = JSON.parse(response.body);
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } else {
      var error = JSON.parse(error);
      res.setHeader('Content-Type', 'application/json');
      res.json(error);
    }
  });
});

app.get('/twitter', function(req, res, next) {

  var type = req.query.q;
  var lat = req.query.lat;
  var lng = req.query.lng;

  oa = new OAuth("https://api.twitter.com/oauth/request_token",
                 "https://api.twitter.com/oauth/access_token",
                 "g4REcxl2oS4ocLgLBVJYx2tWr", "8cHUGBOdfNQQwNyJ5D7hw2UaMraezDHa0lebSufejqvHXWeR3k",
                 "1.0A", "http://localhost:3000/oauth/callback", "HMAC-SHA1");

  var access_token= "13500422-7qv43jOTKNnB4N2YNg75zZrxSCR3x5ESa0IJ3cwXz";
  var access_token_secret= "MZf8A7ZGSoYtWpY7usoxbfYCXZovG0ZpM4zh1dBLJfGX9";

  // TODO: req.query = q
  // TODO: req.location = lat,lon
  oa.get("https://api.twitter.com/1.1/search/tweets.json?q=' '&geocode=" + lat + "%2C" + lng + "%2C0.5mi", access_token, access_token_secret,
  function(error, data) {

    if (error == null) {
      var data = JSON.parse(data);
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } else {
      var error = JSON.parse(error);
      res.setHeader('Content-Type', 'application/json');
      res.json(error);
    }

  });


});

app.get('/about', function(req, res){

  function readModuleFile(path, callback) {
	    try {
	        var filename = require.resolve(path);
	        fs.readFile(filename, 'utf8', callback);
	    } catch (e) {
	        callback(e);
	    }
	}

  readModuleFile('./README.md', function (err, string) {
	    console.log( "Converting Read Me" );
		var header = 	'<meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Urban Heartbeat</title><meta name="description" content=""><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">' +
						'<link rel="stylesheet" href="../styles/main.css" type="text/css" media="screen"/>';

		var html = "<html><head>" + header + "</head><body><header><img src='logo.svg'/></header><article class='markdown-body'>" + marked(string) + "</article></body>";
    res.send( html );

	});

});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
