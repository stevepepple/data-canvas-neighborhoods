var express = require('express');
var request = require("request");
var moment = require("moment");
var cors = require('cors');

var app = express();
app.set('port', (process.env.PORT || 9999));
app.use(express.static(__dirname + '/public'));
app.use(cors());

// Libraries for ReadMe
var fs = require('fs');
var marked = require('marked');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/foursquare.html');
});

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

  var path = 'media/search?' + 'lat=' + lat + '&lng=' + lng + '&distance=50m' + '&max_timestamp=' + last_hour.unix() + '&access_token=' + access_token;

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

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
