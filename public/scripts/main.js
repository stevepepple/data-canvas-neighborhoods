// Data Canvas API
var url = "http://sensor-api.localdata.com/api/v1/";

// TODO: Create separate arrays for multiple lines
var markers = [];
var series = {};
var graphs = {};
var summary = {};
var sensors = {};
var places = {};
var refresh_timer;

// TODO: make the min the mean value of the category
var seriesData = [];

// Lookup table for the different enviornment variables.
var fields = {
  "temperature" : { name : "temperature", label : "Temperature", unit : "C", color : "#CC714D"},
  "light" : { name : "light", label : "Light", unit : "Lux", color : "#CEB449"},
  "humidity" : { name : "humidity", label : "Humidity", unit : "%", color : "#567A86"},
  "airquality" : { name : "pollution_summary", label : "Air Quality", unit : "?", color : "#FBAF3F"},
  "airquality_raw" : { name : "pollution", label : "Pollution", unit : "mV", color : "#8F8D41"},
  "dust" : { name : "dust", label : "Dust", unit : "pcs/238ml", color : "#94753D"},
  "sound" : { name : "noise", label : "Noise", unit : "mV", color : "#827579"},
  "uv" : { name : "uv", label : "UX", unit : "UV", color : "#CEB449"}
}

var current_fields = ["dust", "pollution", "noise", "light"]

function fetchSummary(sensor_id, callback) {
  var today = new Date();
  // Or just get the selector? $("#select_sensor").val()
  fetchData(url + "aggregations?each.sources=" + sensor_id + "&fields=temperature,airquality_raw,humidity,light,dust,sound,uv&op=mean&from=2015-01-01T00:00:00Z&before=" + today.toISOString() + "&resolution=24h", callback);
}

function fetchAllData(sensor_id, callback) {
  http://sensor-api.localdata.com/api/v1/sources/ci4lr75ok000302yp9dowz3rm/entries?count=10&sort=desc
  fetchData(url + "sources/" + sensor_id + "/entries?count=60&sort=desc", function(data){
    var series = sortData(data.data);
    callback(series)
  });
}

function fetchCityData(city, timezone, callback) {
  var now = new Date();
  //var last_hour = new Date(now);

  var now = moment.tz(now, timezone);

  last_hour = moment().subtract(1, 'hour');


  //console.log(past_hour.format('MMMM Do YYYY, h:mm:ss a'));
  //last_hour.setMinutes(now.getMinutes() - 120);

  fetchData(url + "aggregations?fields=temperature,light,airquality_raw,sound,humidity,dust&from=" + last_hour.toISOString() + "&before=" + now.toISOString() + "&resolution=5m&over.city=" + city, function(data){
    var series = sortData(data.data);

    var latest = {};

    _.each(fields, function(field, key) {
      latest[field.name] = series[0][key];
    });

    callback(latest);
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

// Sensor ID, frequency of data fetching, callback with the latest data
function getSensorData(sensor, seconds, callback) {

  clearTimeout(refresh_timer);

  fetchAllData(sensor.id, function(data) {
    var series = sortData(data);
    var latest = getNewestValues(data);

    //Just show the most recent value in the series
    callback(latest)

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

  // Keep calling the function to refresh the UI
  // TODO: proper way to cancel the function

  refresh_timer = setTimeout(function(){
    getSensorData(sensor, seconds, callback);
  }, seconds * 1000);
}

function getNearestSensor(map, callback){
  // Get the nearest sensor
  // TODO: Move to modular function
  var nearest = null;
  var location = turf.point([current_place.geometry.location.lng, current_place.geometry.location.lat]);
  _.each(sensors, function(sensor){
    var sensor_location = turf.point(sensor.location);

    var units = "miles";
    var distance = turf.distance(sensor_location, location, units);

    if (nearest == null || distance < nearest.distance) {
      // TODO: Are there is the user really in the same neighborhood
      nearest = sensor;
      nearest.distance = distance;
    }

  });

  if (nearest !== null) {
    return nearest;
  } else {
    return null;
  }

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

function showLoader(element, hide) {

  var loader = $('<div class="loader"><div class="circ-animate-con">' +
      '<div class="circ-animate step-1"></div>' +
      '<div class="circ-animate step-2"></div>' +
      '<div class="circ-animate step-3"></div>' +
    '</div></div>');

  if (hide == true) {
    loader.hide();
  }

  if ($(".loader").length > 0) {
    loader.show();
  } else {
    $(element).prepend(loader);
    setTimeout(function() {
         $(".circ-animate.step-1").addClass("animate_circ");
    }, 100);
    setTimeout(function() {
        $(".circ-animate.step-2").addClass("animate_circ");
    }, 1000);
  }

  return true;
}
