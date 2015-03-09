var express = require('express');
var app = express();
var cors = require('cors');

app.set('port', (process.env.PORT || 9000));
app.use(express.static(__dirname + '/public'));
app.enable("jsonp callback");
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

// Libraries for ReadMe
var fs = require('fs');
var marked = require('marked');

app.get('/', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.sendFile(__dirname + '/index.html');
});

app.options('/data', function(req, res){
  console.log("writing headers only");
  res.header("Access-Control-Allow-Origin", "*");
  res.end('');
});


var request = require('request');

var OAuth= require('oauth').OAuth;

app.get('/twitter', function(req, res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  oa = new OAuth("https://api.twitter.com/oauth/request_token",
                 "https://api.twitter.com/oauth/access_token",
                 "g4REcxl2oS4ocLgLBVJYx2tWr", "8cHUGBOdfNQQwNyJ5D7hw2UaMraezDHa0lebSufejqvHXWeR3k",
                 "1.0A", "http://localhost:3000/oauth/callback", "HMAC-SHA1");

  var access_token= "13500422-7qv43jOTKNnB4N2YNg75zZrxSCR3x5ESa0IJ3cwXz";
  var access_token_secret= "MZf8A7ZGSoYtWpY7usoxbfYCXZovG0ZpM4zh1dBLJfGX9";

  // TODO: req.query = q
  // TODO: req.location = lat,lon
  oa.get("https://api.twitter.com/1.1/search/tweets.json?q=' '&geocode=37.767358%2C-122.430467%2C1mi", access_token, access_token_secret,
  function(error, data) {

    console.log(error);
    if (error == null) {
      console.log(data)
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
