function getPhotos(map, coord) {

  console.log("map: ", map)

   var current_value = $("#place").find('.overlay').find('.value');
   //var canvas = $("#" + id).find(".photos").find("ul");

   var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");

   var now = moment();
   var past = moment().subtract(6, 'days');

   var circle_options = {
     color:'#FFFFFF',
     stroke: true,
     opacity: 0.5,
     weight: 0.5,
     fillColor:'#F7FB59',
     fillOpacity: 0.7,
     radius: 2
   }

   //photos.orderByChild("score")
   console.log("getting photos...")
   var photos = []
   photos_db
      .orderByChild("time")
      .limitToLast(100)
      .on("child_added", function(snapshot) {
        var photo = snapshot.val();
        photos.push(photo)
   });

   setInterval(function(){
     if (photos.length > 0) {
       var photo = photos.pop();
       showPhoto(photo);
     }
   }, 1400)

   photos_db
      .orderByChild("time")
      .limitToLast(200)
      .on("child_changed", function(snapshot) {
        var photo = snapshot.val();
        photos.push(photo)
        //showPhoto(photo);
   });

   photos_db.orderByChild("time")
    //.startAt(past.unix())
    //.endAt(now.unix())
    .once('value',  function(snapshot) {
      snapshot.forEach(function(photo, i){
        var photo = photo.val();
        //showPhoto(photo);
        photos.push(photo)
      });
    });

    function showPhoto(photo) {
      var coord = L.latLng(photo.location.latitude, photo.location.longitude);
      var circle = new L.circleMarker(coord, circle_options).addTo(features);
      animatePoint(coord);

      if (typeof buildings_layer !== 'undefined') {
        var results = leafletPip.pointInLayer(coord, buildings_layer);
        if (results.length > 0) {
          var layer = results[0].getLayers()[0]
          var color = layer.options.fillColor;
          color = chroma(color).brighten().hex();
          layer.setStyle({fillColor: color});
        }
      }

      if (photo.activities) {

        var best = getBest(photo.activities, activities);
        if (best !== null) {
          var label = L.marker([photo.location.latitude, photo.location.longitude], {
            icon: L.divIcon({
              className: 'label',
                html: "<div id='" + photo.id + "'></div>"
              })
          });

          $("#" + photo.id).append("<div class='word'>" + best.word + "</div>");
        }
      }


      if (photo.score > 5) {

        var xy = map.latLngToLayerPoint(coord)

        if (photo.keywords > 1) {
          console.log("keyword: ", photo.keywords)
          var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'>" + keywords[0] + "</div>");
        }

        if (photo.score > 30) {
          var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'><img src='" + photo.images.low_resolution.url + "'/></div>");
        }

        if (photo.color !== undefined) {
          var main_color = photo.color[0];
          //console.log(main_color)
          $(popup).css({ "border" : "solid 4px " + main_color })
          $(popup).css({ "-moz-transition" :  "opacity 1s ease-in-out" })

        }
        setTimeout(function(){
            $(".leaflet-popup-pane").prepend(popup);
        }, 340)

        setTimeout(function(){
          if (popup) {
            popup.remove();
          }
        }, 3400);


      }
              //console.log(photo)
      //console.log(photo.time, (photo.time > past.unix()))
      circle.on("click", function(e) {
        console.log("Show popup!")
        var xy = map.latLngToLayerPoint(e.target._latlng)
        $(".popup").remove()
        var x = Math.round(e.containerPoint.x);
        var y = Math.round(e.containerPoint.y);
        console.log(x, y)
        var popup = $("<div class='popup' style='position:absolute; top: " + (xy.y) + "px; left: " + (xy.x) + "px;'><img src='" + photo.images.low_resolution.url + "'/></div>");
        if (photo.color !== undefined) {
          var main_color = photo.color[0];
          //console.log(main_color)
          $(popup).css({ "border" : "solid 4px " + main_color })
        }

        $(".leaflet-popup-pane").prepend(popup);

        var circle_animate = d3_canvas.append("circle")
          .attr("cx", xy.x)
          .attr("cy", xy.y)
          .attr("r", 40)
          .style("fill", "rgba(255, 255, 255, 0.5)");

        /*
        circle
          .transition()
          .attr("x", 60);

        circle
          .transition()
          .style("opacity",0);
        */


        //my click stuff
      });

      if (photo.score > 70) {
        //circle.fire("click");
      }
    }

    setTimeout(function(){
      updatePhotos();
    }, 15 * 60 * 1000);


    updatePhotos();
    function updatePhotos() {
      $.getJSON('/instagram?lat=' + coord.lat + "&lng=" + coord.lng, function(data){

         // Handle the case where there are no public photos near the sensor
         if (data.data.length == 0) {
           canvas.html('<div class="no-results">No recent photos</div>');
           return false;
         }

         // Sort by both number of comments and likes
         sorted = data.data.sort(function(a,b){
         //var a_score = a.comments.count + a.likes.count;
            //var b_score = b.comments.count + b.likes.count;
            var a_score =  a.likes.count;
            var b_score =  b.likes.count;
            return a_score - b_score;
         });

         //canvas.html("");
         _.each(sorted, function(item){


           var coord = L.latLng(item.location.latitude, item.location.longitude);
           var circle = L.circle(coord, 3, circle_options).addTo(features);
           photos.push(item)

         });

         // Show the one with the most likes and comments
         //$(".overlay").find(".photo").html('<img src="' + first.images.low_resolution.url + '"/>');

         // Count the nubmer of photos
      });
    }


}
