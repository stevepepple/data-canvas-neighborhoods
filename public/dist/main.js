// Data Canvas API
var url = "https://sensor-api.localdata.com/api/v1/";

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
  console.log("show loader here: ", $("#" + current_place.id));
  showLoader($("#" + current_place.id).find(".overlay"));

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

/* Do some uniteresting initialiation */
var main_map = 'osaez.kp2ddba3';
var side_map = 'stevepepple.lbj8m1n3'
L.mapbox.accessToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';
var map_options = {
  attributionControl: false,
  zoomControl: false,
  maxZoom: 18,
  minZoom: 5
}

var circle_outer = {
  color:'#ACB63C',
  opacity: 0,
  weight: 1,
  fillColor:'#ACB63C',
  fillOpacity: .6
}

var circle_inner = {
  color:'#8D9700',
  opacity: 0,
  weight: 1,
  fillColor:'#8D9700',
  fillOpacity: .6
}

var LeafIcon = L.Icon.extend({})
var marker_icon =  new LeafIcon({iconUrl: '//api.tiles.mapbox.com/mapbox.js/v2.1.5/images/marker-icon-2x.png'});
var selected_icon = new LeafIcon({iconUrl: 'marker-selected.png'})

// Setup the Leaflet Geocoder
var geo_search;
var city_name;
var city_bounds;
var current_layer;
var sensor_layer;
var hood_layer;
var timer;
//initGeoCoder(showNeighborhood);

function initGeoCoder(map, callback) {

  // Disable drag and zoom handlers.
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();

  // Initialize the Leaflet Geocoder
  city_name = $('#cities option').not(function(){ return !this.selected }).text();

  geo_search = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    showMarker: false,
    params : { city : city_name },
    callback : setResult
  }).addTo(map);

  // Style the search area
  $("#leaflet-control-geosearch-qry").addClass("topcoat-search-input--large")

  // See if there are new results
  var expire;
  function setResult(result) {
     console.log("Geocode result: ", result)
    // Use a timer to reduce the number of map operations
    clearMap(map);
    //clearTimeout(expire);
    clearInterval(timer);
    //vehicles_query = {}

    expire = setTimeout(function(){
       callback(result, map);
       setNeighborhood(result, map)
       //showTransit(result)
    }, 1000);
  }
}

// User the Google Geocoder to find neigborhood and address
function getAddress(coord, callback) {
  var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coord.lat + "," + coord.lng + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54&result_type=neighborhood|locality|sublocality|";
  fetchData(query, function(results){
    // Simply take the best result, if there is more than one.
    var result = results.results[0];

    callback(result);
  });
}

// User the Google Timezone Service
function getTimezone(coord, callback) {

  var now = new Date();
  var timestamp = Math.floor(Date.now() / 1000)

  var query = "https://maps.googleapis.com/maps/api/timezone/json?location=" + coord.lat + "," + coord.lng + "&timestamp=" + timestamp + "&key=AIzaSyA-YiurRX6GixuExPSrQgbcOwcUWinAn54";
  fetchData(query, function(result){

    callback(result);
  });
}

function showNeighborhood(place) {

   var point = new turf.point([place.X, place.Y])
	 var selected = null;
   var selected_routes = [];

   _.each(hoods.features, function(feature){
		var isInside = turf.inside(point, feature);
      // Only find the best hood
      // TODO: Handle overlapping hoods?
		if(isInside) { selected = feature; }
   });

}

function showSensorMarker(coord, map) {

  var marker = L.latLng(coord);
  //places[id].marker = marker;

  var location = L.latLng(coord);
  var circle = L.circle(marker, map.getZoom() * 20, circle_outer).addTo(map);
  markers.push(circle);
  var circle = L.circle(marker, map.getZoom() * 2, circle_inner).addTo(map);
  markers.push(circle);

  var zoom = 16;
  // Some cities cannot be zoomed to 16
  if (city_id == "shanghai" || city_id == "bangalore" || city_id == "singapore") { zoom = 14; }
  map.setView(marker, 14)
}

function showCityLayer(data, map, callback, onclick) {
   hoods = data;
   // Show all hoods
   hood_layer = L.geoJson(data, {
      style: {
         cursor: "pointer", fillColor: '#00BAF4', fillOpacity: 0.1, weight: 2, opacity: 0.6, color: '#00BAF4'
      },
      onEachFeature: onEachFeature
   });

   hood_layer.addTo(map);
   city_bounds = hood_layer.getBounds();
   //map.fitBounds(hood_layer.getBounds());

   callback();

   function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
     if (feature.properties && feature.properties.popupContent) {
          //layer.bindPopup(feature.properties.popupContent);
     }
     layer.on({
        click: function(e) {
           var place = {}
           place.X = e.latlng.lng;
           place.Y = e.latlng.lat;
           setNeighborhood(place, map, onclick)
        }
     });
   }
 }

 function setNeighborhood(place, map, callback) {

   var point = new turf.point([place.X, place.Y])
	 var selected = null;
   var selected_routes = [];

   _.each(hoods.features, function(feature){
     var isInside = turf.inside(point, feature);
     // Only find the best hood
     // TODO: Handle overlapping hoods?
     if(isInside) { selected = feature; }
   });

   // Clear the geojson layer
   if (current_layer !== undefined) { map.removeLayer(current_layer) }

   if(selected !== null) {
     current_layer = L.geoJson(selected, {  fillColor: '#BC2285', fillOpacity: 0.5, weight: 4, opacity: 0.6, color: '#9E005D'})
	   current_layer.addTo(map);

     // Setup the UI in cityUI
     callback(place);

     //TODO: Should we zoom to it or just mark it as selected?
     //map.fitBounds(current_layer.getBounds());
     //map.setZoom(map.getZoom() - 2)
   }
}

function showSensor(place, map, callback) {

  console.log(map)

  var coord = L.latLng(place.location[1], place.location[0]);
  var marker = L.marker(coord);
  marker.id = place.id;
  markers.push(marker);
  marker.addTo(sensor_layer);

  marker.on('click', function(e) {
    //console.log(e);
    e.target.setIcon(selected_icon);
    map.setView(e.target.getLatLng(), 14);

    var place = e.target.getLatLng();
    place.X = place.lng;
    place.Y = place.lat;
    place.id = e.target.id;
    callback(place);
  });

}

function selectSensor(place, map) {

  _.each(markers, function(marker) {
    try {
      marker.setIcon(marker_icon);
    } catch(e) {
      console.log(e)
    }
  });

  // Find the clicked marker in the list cached markers
  var marker = _.findWhere(markers, { id : place.id });

  // Click the marker to perform the ops in showSensor
  marker.fire("click");
}

function centerPlaces() {
  // Do some magic to make the maps fit
  _.each(places, function(place){
    var width = $("#" + place.place_id).width();
    place.map._size.x = width;
    //place.map.setView(place.marker)
    place.map.panTo(place.marker)
  });
}

// Util function to clear all features/markers
function clearMap(map, layer) {

  if (layer) {
    map.removeLayer(layer)
  }


  for (i = 0; i < markers.length; i++) {
      map.removeLayer(markers[i])
  }

}

/*
 * L.Control.GeoSearch - search for an address and zoom to its location
 * https://github.com/smeijer/leaflet.control.geosearch
 */

L.GeoSearch = {};
L.GeoSearch.Provider = {};

L.GeoSearch.Result = function (x, y, label) {
    this.X = x;
    this.Y = y;
    this.Label = label;
};

L.Control.GeoSearch = L.Control.extend({
    options: {
        position: 'topcenter',
        showMarker: true
    },

    _config: {
        country: '',
        searchLabel: 'Search for neighborhood or address',
        notFoundMessage: 'Sorry, that address could not be found.',
        messageHideDelay: 3000,
        zoomLevel: 16
    },

    initialize: function (options) {
        L.Util.extend(this.options, options);
        L.Util.extend(this._config, options);
    },

    onAdd: function (map) {
        var $controlContainer = map._controlContainer,
            nodes = $controlContainer.childNodes,
            topCenter = false;

        for (var i = 0, len = nodes.length; i < len; i++) {
            var klass = nodes[i].className;
            if (/leaflet-top/.test(klass) && /leaflet-center/.test(klass)) {
                topCenter = true;
                break;
            }
        }

        if (!topCenter) {
            var tc = document.createElement('div');
            tc.className += 'leaflet-top leaflet-center';
            $controlContainer.appendChild(tc);
            map._controlCorners.topcenter = tc;
        }

        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-geosearch');

        var searchbox = document.createElement('input');
        searchbox.id = 'leaflet-control-geosearch-qry';
        searchbox.type = 'text';
        searchbox.placeholder = this._config.searchLabel;
        this._searchbox = searchbox;

        var msgbox = document.createElement('div');
        msgbox.id = 'leaflet-control-geosearch-msg';
        msgbox.className = 'leaflet-control-geosearch-msg';
        this._msgbox = msgbox;

        var resultslist = document.createElement('ul');
        resultslist.id = 'leaflet-control-geosearch-results';
        this._resultslist = resultslist;

        this._msgbox.appendChild(this._resultslist);
        this._container.appendChild(this._searchbox);
        this._container.appendChild(this._msgbox);

        L.DomEvent
          .addListener(this._container, 'click', L.DomEvent.stop)
          .addListener(this._searchbox, 'keydown', this._onKeyUp, this);

        L.DomEvent.disableClickPropagation(this._container);

        return this._container;
    },

    geosearch: function (qry, params) {

        try {

            var provider = this._config.provider;
            var params = this._config.params;

            /* Allow for regional city bias */
            if (typeof params != "undefined" && typeof params.city != "undefined") {
              qry = qry + " " + params.city;
            }

            if(typeof provider.GetLocations == 'function') {
                var results = provider.GetLocations(qry, params, function(results) {
                    this._processResults(results);

                }.bind(this));
            }
            else {
                var url = provider.GetServiceUrl(qry);
                this.sendRequest(provider, url);
            }
        }
        catch (error) {
            this._printError(error);
        }
    },

    sendRequest: function (provider, url) {
        var that = this;

        window.parseLocation = function (response) {
            var results = provider.ParseJSON(response);
            that._processResults(results);

            document.body.removeChild(document.getElementById('getJsonP'));
            delete window.parseLocation;
        };

        function getJsonP (url) {
            url = url + '&callback=parseLocation'
            var script = document.createElement('script');
            script.id = 'getJsonP';
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
        }

        if (XMLHttpRequest) {
            var xhr = new XMLHttpRequest();

            if ('withCredentials' in xhr) {
                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            var response = JSON.parse(xhr.responseText),
                                results = provider.ParseJSON(response);

                            that._processResults(results);
                        } else if (xhr.status == 0 || xhr.status == 400) {
                            getJsonP(url);
                        } else {
                            that._printError(xhr.responseText);
                        }
                    }
                };

                xhr.open('GET', url, true);
                xhr.send();
            } else if (XDomainRequest) {
                var xdr = new XDomainRequest();

                xdr.onerror = function (err) {
                    that._printError(err);
                };

                xdr.onload = function () {
                    var response = JSON.parse(xdr.responseText),
                        results = provider.ParseJSON(response);

                    that._processResults(results);
                };

                xdr.open('GET', url);
                xdr.send();
            } else {
                getJsonP(url);
            }
        }
    },

    _processResults: function(results) {
        if (results.length > 0) {
            this._map.fireEvent('geosearch_foundlocations', {Locations: results});
            this._showLocation(results[0]);
            this.result = results[0];
            this.options.callback(this.result)
        } else {
            this._printError(this._config.notFoundMessage);
        }
    },

    _showLocation: function (location) {
        if (this.options.showMarker == true) {
            if (typeof this._positionMarker === 'undefined')
                this._positionMarker = L.marker([location.Y, location.X]).addTo(this._map);
            else
                this._positionMarker.setLatLng([location.Y, location.X]);
        }

        this._map.setView([location.Y, location.X], this._config.zoomLevel, false);
        this._map.fireEvent('geosearch_showlocation', {Location: location});
    },

    _printError: function(message) {
        var elem = this._resultslist;
        elem.innerHTML = '<li>' + message + '</li>';
        elem.style.display = 'block';

        setTimeout(function () {
            elem.style.display = 'none';
        }, 3000);
    },

    _onKeyUp: function (e) {
        var esc = 27,
            enter = 13,
            queryBox = document.getElementById('leaflet-control-geosearch-qry');

        if (e.keyCode === esc) { // escape key detection is unreliable
            queryBox.value = '';
            this._map._container.focus();
        } else if (queryBox.value.length > 1) {
            this.geosearch(queryBox.value);
        }
    }
});

/**
 * L.Control.GeoSearch - search for an address and zoom to it's location
 * L.GeoSearch.Provider.Google uses google geocoding service
 * https://github.com/smeijer/leaflet.control.geosearch
 */

onLoadGoogleApiCallback = function() {
    L.GeoSearch.Provider.Google.Geocoder = new google.maps.Geocoder();
    document.body.removeChild(document.getElementById('load_google_api'));
};

L.GeoSearch.Provider.Google = L.Class.extend({
    options: {

    },

    initialize: function(options) {
        options = L.Util.setOptions(this, options);
        this.loadMapsApi();
    },

    loadMapsApi: function () {
        var url = "https://maps.googleapis.com/maps/api/js?v=3&callback=onLoadGoogleApiCallback&sensor=false";
        var script = document.createElement('script');
        script.id = 'load_google_api';
        script.type = "text/javascript";
        script.src = url;
        document.body.appendChild(script);
    },

    GetLocations: function(qry, params, callback) {
        var geocoder = L.GeoSearch.Provider.Google.Geocoder;
        /* TODO: allow for any Google Geocoding Param to be included */
        var parameters = L.Util.extend({
            address: qry
        }, this.options);

        /* TODO: allow the user to pass other paramters */

        var results = geocoder.geocode(parameters, function(data){
            data = {results: data};

            if (data.results.length == 0)
                return [];

            var results = [];
            for (var i = 0; i < data.results.length; i++)
                results.push(new L.GeoSearch.Result(
                    data.results[i].geometry.location.lng(),
                    data.results[i].geometry.location.lat(),
                    data.results[i].formatted_address
                ));

            if(typeof callback == 'function')
                callback(results);
        });
    },
});
