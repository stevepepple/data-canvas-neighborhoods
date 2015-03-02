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

var current_fields = ["dust", "pollution", "noise", "light"]

function fetchSummary(sensor_id, callback) {
  var today = new Date();
  // Or just get the selector? $("#select_sensor").val()
  fetchData(url + "aggregations?each.sources=" + sensor_id + "&fields=temperature,airquality_raw,humidity,light,dust,sound,uv&op=mean&from=2015-01-01T00:00:00Z&before=" + today.toISOString() + "&resolution=24h", callback);
}

function fetchAllData(sensor_id, callback) {
  fetchData(url + "sources/" + sensor_id + "/entries?&sort=desc", function(data){
    var series = sortData(data.data);
    callback(series)
  });
}

// Sort the object and prepare it for Rickshaw chart
function sortData(data) {
    // For precaution, sort the object by date
    data.sort(function(a, b){
	  	return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
	  });

  	initFields();
    // Create X and Y fields, which Rickshaw expects
    _.each(data, function(x, i) {

      //initFields();
      _.each(x.data, function(y, j){
          if (j !== "location" && j !== "airquality") {
						var key = fields[j].name
						series[key].push({ x : i, y : y, time: x.timestamp })
          }
      });
  	});

  	return data;
}

function getNewestValues(data) {

  var latest = {};

  data.sort(function(a, b){
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  });

  _.each(fields, function(field, key) {
    latest[field.name] = data[0].data[key];
  });

  return latest;

}

function getSensorData(sensor) {

  fetchAllData(sensor.id, function(data) {
    var series = sortData(data);
    var latest = getNewestValues(data);

    //Just show the most recent value in the series
    showExperiments(latest)

    // Prepart the other fields for stats and summaries
    // TODO: Properly clear the summary stats object
    summary = {};
    _.each(fields, function(field) {
      summary[field.name] = [];
    });

    _.each(series, function(item, key){
        _.each(fields, function(field, j) {
          summary[field.name].push(item[j])
        });
    });




  });
}

initFields();
function initFields() {
	_.each(fields, function(field) {
  	series[field.name] = [];
	});
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
