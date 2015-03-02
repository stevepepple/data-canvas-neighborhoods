// Data Canvas API
var url = "http://sensor-api.localdata.com/api/v1/";

// TODO: Create separate arrays for multiple lines
var markers = [];
var series = {};
var graphs = {};
var summary = {};
var sensors = {};

// TODO: make the min the mean value of the category
var seriesData = [];

// Lookup table for the different enviornment variables.
var fields = {
  "temperature" : { name : "temperature", label : "Temperature", unit : "C", color : "#CC714D"},
  "light" : { name : "light_summary", label : "Light", unit : "Lux", color : "#CEB449"},
  "humidity" : { name : "humidity", label : "Humidity", unit : "%", color : "#567A86"},
  "airquality" : { name : "pollution_summary", label : "Air Quality", unit : "?", color : "#FBAF3F"},
  "airquality_raw" : { name : "pollution", label : "Pollution", unit : "mV", color : "#8F8D41"},
  "dust" : { name : "dust", label : "Dust", unit : "pcs/238ml", color : "#94753D"},
  "sound" : { name : "noise", label : "Noise", unit : "mV", color : "#827579"},
  "uv" : { name : "light", label : "Light", unit : "Lux", color : "#CEB449"}
}

// Generic JSONP Request
function fetchData(url, callback) {
  $.ajax({
    type: "GET",
    dataType: "JSON",
    jsonpCallback: 'jsonCallback',
    url: url,
    success: function(result) {
      //var result = JSON.parse(result)
     	callback(result)
    },
    error: function(result) {
      console.log(result);
    }
  });
}
