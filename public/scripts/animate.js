
function animatePoint(coord) {
  var xy = map.latLngToLayerPoint(coord)

  var circle_animate = d3_canvas.append("circle")
    .attr("cx", xy.x)
    .attr("cy", xy.y)
    .attr("r", 2)
    .style("fill", "rgba(255, 255, 255, 0.5)");

  circle_animate
    .transition()
    .attr("r", 80)
    .style("fill", "rgba(255, 255, 255, 0.3)")
    .duration(3000) // this is 1s
    .transition()
    .attr("r", 3)
    .duration(500) // this is 1s

}


// var move_interval = setInterval(function() { animate() }, frame);


//$(trace._path).attr("style", "transition:stroke-dashoffset " + time_passed + "s ease-in; -moz-transition:stroke-dashoffset " + time_passed + "s ease-in;");
// This pair of CSS properties hides the line initially http://css-tricks.com/svg-line-animation-works/
/*
existing_vehicle.marker.setLatLng([vehicleLocation[0], vehicleLocation[1]]);
existing_vehicle.marker._icon.style[L.DomUtil.TRANSITION] = 'all ' + time_passed + 'ms ease';
existing_vehicle.marker.update();
*/
// TODO: Move to processing/animation layer.
function animate() {
  move_dist += segment;

  var point_along = turf.along(line, move_dist, 'kilometers');
  var new_coord = pointToLatLng(point_along);

  L.circle( new_coord, 0.5, circle_options).addTo(map);

  if (move_dist > distance) {
    clearInterval(move_interval);
    // Make the trace;
    trace.show(map);
  }
}
