var transitFirebaseRef = new Firebase("https://publicdata-transit.firebaseio.com/");
var vehicles_query = {};
var timer;
var agency;
var hood;
var map;
var buses = [];
var trains = [];
var traces = {};
var paths = [];
var bus_width = 13;
var bus_height = 72;


//drawLines();

var trace_style = { color: '#FFD3AB', weight: 1.0, opacity: 1.0 }

var circle_options = { color:'#FFFFFF', opacity: 0, weight: 1, fillColor:'#FFFFFF', fillOpacity: 1.0 }

function showBuses(map, hood) {

	var lat = 37.760268;
	var lon = -122.419191;

	agency = _.findWhere(agencies, { city : city_name });

	if (city_name == "Boston") {
		agency = _.findWhere(agencies, { tag : 'mbta' });
  }

	hood = hood;
	map = map;

	updateBus();

	// Check for updated buses
  function updateBus() {

		// One time
    transitFirebaseRef.child(agency.tag + "/vehicles").once("value", function(snapshot) {

			snapshot.forEach(function (bus) {
  			var vehicle = bus.val();
				var vehicleId = bus.key();
				showBus(vehicle, vehicleId);
      });

		});

		// On change
		transitFirebaseRef.child(agency.tag + "/vehicles").on("child_changed", function (snapshot) {

			var vehicle = snapshot.val();
			var vehicleId = snapshot.key();
			showBus(vehicle, vehicleId);

    });
  }

// TODO: Make this a protoype?
function showBus(vehicle, vehicleId) {

		vehicleLocation = [vehicle.lat, vehicle.lon];
		var point = new turf.point([vehicle.lon, vehicle.lat]);
		var inside = turf.inside(point, hood)

		var existing_vehicle = vehicles_query[vehicleId];

		//var filter = getShadow();

		// The bus exists and is still in the Mission
		if (inside && typeof existing_vehicle !== "undefined" ) {

			// Show a visable trace
			traceBus(vehicle, existing_vehicle);
			console.log("Update existing bus for: ", vehicle.routeTag)

		// The bus is not longer in the the Mission
		} else if (typeof existing_vehicle !== "undefined" && inside == false) {
			// Remove it and delete from memory
			if (vehicles_query[vehicleId]) {
				delete vehicles_query[vehicleId];
				console.log("remove this bus: ", vehicle)
			}

		// The bus is is new to the Mission
		} else if (inside) {

			try {
				//vehicle.marker = getBusMarker(vehicle, map);
				//vehicle.marker.addTo(map);

				var start = map.latLngToContainerPoint([ vehicle.lat, vehicle.lon ]);
				var heading = vehicle.heading;

			} catch (e) {
				console.log("error: ", e)
			}

			vehicle.rectangle = d3_canvas.append("rect")
				.attr("class", "bus")
				.attr("x", start.x)
				.attr("y", start.y)
				.attr("rx", 3)
				.attr("ry", 3)
				.attr("width", bus_width)
				.attr("height", bus_height)
				.attr("transform", "rotate(-2," + start.x + "," + start.y +")")
				//.style("filter", "url(#drop-shadow)")
				.style({"fill" : "#FF885F", "fill-opacity" : 0.5, "stroke" : "#3A2840", "stroke-width": 1 })

			setHeading(vehicle);

			vehicles_query[vehicleId] = vehicle;
			//console.log("route: ", vehicle.routeTag, vehicle)
			var match = turf.filter(routes, "LINEABBR", vehicle.routeTag);
			//console.log(vehicle, match)
			if (match) {
				L.geoJson(match, { style:  trace_style, addClass: "routes"}).addTo(map);
			}
			//console.log(match);
		} else {
		// Do nothing
	}
}

function traceBus(vehicle, existing_vehicle) {

	var trace = L.polyline([], trace_style);
	var line_list = [];

	var start = map.latLngToContainerPoint([ existing_vehicle.lat, existing_vehicle.lon ]);
	var end = map.latLngToContainerPoint([ vehicle.lat, vehicle.lon ]);
	existing_vehicle.end = end;

	var speed = 1000 / vehicle.speedKmHr; // KmMs
	var heading = vehicle.heading;

	var direction_change = Math.abs(vehicle.heading - existing_vehicle.heading);
	var same_direction = (getDirection(vehicle) == getDirection(existing_vehicle));
	existing_vehicle.time_passed = moment(vehicle.timestamp) - moment(existing_vehicle.timestamp) // ms?

	var dest = createPoint(vehicle.lat, vehicle.lon);
	var origin = createPoint(existing_vehicle.lat, existing_vehicle.lon);
	var distance = turf.distance(dest, origin, 'kilometers'); // km
	var degrees = turf.bearing(dest, origin);
	var speed =  distance / existing_vehicle.time_passed; // km / ms

	vehicle.degrees;
	console.log("---- degres: ", degrees, isStraight(degrees));

	try {

		line_list = [L.latLng( existing_vehicle.lat, existing_vehicle.lon), L.latLng( vehicle.lat, vehicle.lon)];

		// Cache XY coords
		var coord = L.latLng(vehicleLocation[0], vehicleLocation[1]);
		existing_vehicle.xy = map.latLngToLayerPoint(coord);

		// Only animate if the bus is going straight
		if (same_direction && isStraight(degrees) && direction_change < 15) {
			/*
			console.log("    bus speed: ", speed)
			console.log("    bus distance: ", distance)
			console.log("    bus heading: ", existing_vehicle.heading, vehicle.heading)
			console.log("    direction change: ", direction_change)
			console.log("    time_passed: ", existing_vehicle.time_passed)
			console.log("    change in direction? ", getDirection(vehicle), getDirection(existing_vehicle))
			*/

			var line_list = [L.latLng( existing_vehicle.lat, existing_vehicle.lon), L.latLng( vehicle.lat, vehicle.lon)];
			var trace = new Trace(line_list, existing_vehicle);

		} else {
			console.log("--- Drawright angle for: ", existing_vehicle.routeTag )
			line_list = [];

			if (existing_vehicle.dir == "east" || existing_vehicle.dir == "west") {
				line_list.push(L.latLng( existing_vehicle.lat, existing_vehicle.lon));
				line_list.push(L.latLng( existing_vehicle.lat, vehicle.lon));
				line_list.push(L.latLng( vehicle.lat, vehicle.lon));
			} else {
				line_list.push(L.latLng( existing_vehicle.lat, existing_vehicle.lon));
				line_list.push(L.latLng( vehicle.lat, existing_vehicle.lon));
				line_list.push(L.latLng( vehicle.lat, vehicle.lon));
			}

			trace = new Trace(line_list, existing_vehicle);
		}

	} catch(e) { console.log(e) }
}
}

function Trace(line_list, vehicle) {

	this.trace = new L.polyline(line_list, trace_style);

	var duration = vehicle.time_passed / 3;
	//var duration = 1000;

	var path = "M ";
	var length = line_list.length - 1;

	if (line_list.length == 2) {

		var from = map.latLngToContainerPoint([ line_list[0].lat, line_list[0].lng ]);
		var to = map.latLngToContainerPoint([ line_list[1].lat, line_list[1].lng ]);

		vehicle.rectangle
			.transition()
			.duration(duration)
			.attr("x", to.x)
			.attr("y", to.y)
			.style("fill-opacity", 0.8);

	 /*
		_.each(line_list, function(line, i){
				var point = map.latLngToContainerPoint([ line.lat, line.lng ]);

				if (i == length) {
					path += "\n L " + point.x + " " + point.y;
				} else if (i == 0) {
					path += "" + point.x + " " + point.y;
				} else {
					path += "\n L " + point.x + " " + point.y;
				}
			});

			var path = d3_canvas.append("path")
				.attr("d", path)
				.attr("class", "path")
				.attr("h", vehicle.heading)
				.attr("h", vehicle.dirTag)
				.attr("deg", vehicle.degrees)
				.style({'stroke-width': 3, 'stroke-opacity': 0.2, 'stroke': '#F2CEAA', 'fill' : "none", 'stroke-linejoin': 'round'});

			paths.push(path);
			if (line_list > 2) {
				path.style("stroke", "#B056E1");
			}

			var totalLength = path.node().getTotalLength();

			// Create a path from the routing directions
			path
				.attr("stroke-dasharray", totalLength + " " + totalLength)
				.attr("stroke-dashoffset", totalLength)
				.transition()
					.duration(duration + 150)
					.attr("stroke-dashoffset", 0)
				.transition()
					.delay(5 * 60 * 1000)
					.style({ "stroke-opacity" : 0 })
					.duration(200)
				.remove();
	 */
	} else {

		var last = line_list.length -1;

		var last_line = line_list[last];

		var to = map.latLngToContainerPoint([ last_line.lat, last_line.lng ]);

		setHeading(vehicle);
		setTimeout(function(){
			vehicle.rectangle
				.transition().duration(duration).delay(duration)
				.attr("x", to.x).attr("y", to.y).style("fill-opacity", 0.8)
		}, 800)



	}
}


function isStraight(bearing) {

	result = false;

	if (bearing >= -15 && bearing <= 15 ) {
		result = true;
	}

	if (bearing >= 165 || bearing <= -165 ) {
		result = true;
	}

	if (bearing >= 75 && bearing <= 105 ) {
		result = true;
	}

	if (bearing >= -105 && bearing <= -75) {
		result = true;
	}


	return result;

}

function getDirection(vehicle) {

	var heading = vehicle.heading;
	var direction = null;
	if (heading > 315 || heading < 45) {
		direction = "north"
	// East
	} else if (heading >= 45 && heading < 135) {
		direction = "east";
	// South
	} else if (heading >= 135 && heading < 225) {
		direction = "south"
	// West
	} else {
		direction = "north"
	}
	return direction;
}

function setHeading(vehicle) {

	var heading = vehicle.heading;

	// North
	if (heading > 315 || heading < 45) {
		vehicle.dir = "north"
		goVertical();
	// East
	} else if (heading >= 45 && heading < 135) {
		vehicle.dir = "east";
		goHorizontal();
	// South
	} else if (heading >= 135 && heading < 225) {
		vehicle.dir = "south"
		goVertical();

	// West
	} else {
		vehicle.dir = "north"
		goHorizontal();
	}

	function goVertical() {
		vehicle.rectangle
			.transition()
			.attr("width", 4)
			.attr("height", 4)
			.duration(500)
			.transition()
			.attr("width", bus_width)
			.attr("height", bus_height)
			.duration(500)
	}

	function goHorizontal() {
		vehicle.rectangle
			.transition()
			.attr("width", 4)
			.attr("height", 4)
			.duration(500)
			.transition()
			.attr("width", bus_height)
			.attr("height", bus_width)
			.duration(500)
	}
}

function showTrains(map, hood) {

	var s16 = L.latLng(37.765062, -122.419694);
	var s24 = L.latLng(37.752254, -122.418466);

	//var filter = getShadow();

	fetchEstimates();

	setInterval(function(){ fetchEstimates(); }, (30 * 1000));

	function fetchEstimates() {
		var stations = ["16TH", "24TH"];

		var next_train = {
			"24th St. Mission North" : { estimate: 40, train: "DALY" },
			"24th St. Mission South" : { estimate: 40, train: "DALY" },
			"16th St. Mission North" : { estimate: 40, train: "DALY" },
			"16th St. Mission South" : { estimate: 40, train: "DALY" }
		}

		for (var i = 0; i < stations.length; i++) {
			// Use the BART rest API
			var url = "http://bart.crudworks.org/api/departures/" + stations[i] + "/";

			$.getJSON(url, function(data){
				 	_.each(data.etd, function(train) {
						_.each(train.estimate, function(estimate){

							var next = next_train[data.name + " " + estimate.direction];

							if (estimate.minutes < next_train.estimate) {
								next.estimate = estimate.minutes;
								next.train =  train.abbreviation;
							}

							if (estimate.minutes <= 1 || estimate.minutes == "Leaving") {

								train.direction = estimate.direction;

								// 2 minutes between stations.
								// 0.9 mile distance between stations.
								var jitter = Math.floor(Math.random() * 7);
								var correction = 100;
								if (train.direction == "North") {
									train.start = map.latLngToContainerPoint(s24);
									train.end = map.latLngToContainerPoint(s16);
									train.start.x += 40 + jitter;
									train.end.x += 40 + correction + jitter;
								} else {
									train.start = map.latLngToContainerPoint(s16);
									train.end = map.latLngToContainerPoint(s24);
									train.start.x -= 40 - jitter;
									train.end.x -= (40 + correction + jitter);

								}

								train.y = train.start.y;
								train.x = train.start.x;
								train.particle = null;

								var rectangle = d3_canvas.append("rect")
				          .attr("x", train.x)
				          .attr("y", train.y)
									.attr("rx", 8)
									.attr("ry", 8)
									.attr("class", "train")
				          .attr("width", 18)
									.attr("opacity", 0.3)
									.attr("transform", "rotate(-3," + train.x + "," + train.y +")")
									.attr("height", 200)
									//.style("filter", "url(#drop-shadow)")
				          .style("fill", "#86CDE2")
									.style("stroke-width", "1px")
									.style("stroke", "#000000");

								rectangle
							    .transition()
									.duration(1000 * 60)
									.attr("x", train.end.x)
				          .attr("y", train.end.y)
									.attr("opacity", 0.7)
									.transition()
									.attr("width", 0)
				          .attr("height", 0)
									.remove()
									//.style("filter", "url(#drop-shadow)")

								var line = d3_canvas.append("line")
									.attr("x1", train.start.x)
	 								.attr("y1", train.start.y)
									.attr("x2", train.start.x)
									.attr("y2", train.start.y)
									.attr("stroke-width", "3px")
									.attr("stroke-opacity", 0.4)
									.attr("transform", "rotate(-3," + train.x + "," + train.y +")")
									//.style("filter", "url(#drop-shadow)")
									.attr("stroke", "#AEECFF");

								line
										.transition()
											.duration(1000 * 60)
											.attr("x2", train.end.x)
											.attr("y2", train.end.y)
										.transition()
											.delay(5 * 60 * 1000)
											.style({ "stroke-opacity" : 0 })
											.duration(200)
										.remove();

								trains.push(train);
							}
						});

						// TODO: Handle direction automatically in the draw function?
					});

					/* TODO: Key estimates
					$("#canvas").find(".station").remove();
					_.each(next_train, function(value, station){
						var station = "_" + station.replace(".", "");
						var station = station.replace(/\s/g, "_");
						//var station = string.replace(/\s/g, "-");
						var div = $("<div class='" + station + " station'>")
						var time = moment().add(value.estimate, 'minutes');

						div.countdown(time.toDate(), function(event) {
							 $(this).html(
								 "<div class='train'>" + value.train + "</div>" +
								 "<div class='estimate'>" + event.strftime('%M:%S') + "</div>" +
								 "<div class='mins'>mins</div>"
							 );
						 });

						$("#canvas").prepend(div)
					});
					*/
			});
		}
	}
}

Trace.prototype.show = function(map) {

	var trace = this.trace;
	var id = this.vehicleId;

	if (traces[id] !== undefined) {
		traces[id].push(trace);
	} else {
		traces[id] = [trace];
	}

	trace.addTo(map);

	// TODO: Gradually fade the object out;
	setTimeout(function(){
		// Remove from map and delete reference
		var trace = traces[id].shift()
		map.removeLayer(trace);
	// TODO: Make decay time a global var
	}, 2 * 1000 * 60);

}

function getShadow(){
  var filter = d3_canvas.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "150%");

  // SourceAlpha refers to opacity of graphic that this filter will be applied to
  // convolve that with a Gaussian with standard deviation 3 and store result
  // in blur
  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 4)
      .attr("result", "blur");

  // translate output of Gaussian blur to the right and downwards with 2px
  // store result in offsetBlur
  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 2)
      .attr("dy", 4)
      .attr("result", "offsetBlur");

  // overlay original SourceGraphic over translated blurred opacity by using
  // feMerge filter. Order of specifying inputs is important!
  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
  feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");


  return filter;
}
