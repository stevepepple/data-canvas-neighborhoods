function showLight(data, id) {
  console.log("in showlight")

  // Do something with the data
  // dust, humidity, light, light_summary, noise, pollution, pollution_summary, temperature

  // LUX is lumens per square meter
  var max = 10000;
  var scale = 2;

  var percentage = Math.round((data / max) * 10) / 10;
  var value = percentage * scale;
  // Only make the panel
  //if (value < 0.3) { value = 0.3; }

  console.log("percentage", value)
  if (percentage >= 0.4) {
    $("#" + id).addClass("bright");
  } else {
    $("#" + id).removeClass("bright");
  }
  // Create a css 3 filter representing the brightness
  var filter = "brightness(" + (value + 0.3) +  ") saturate(0.5) contrast(" + (1.2) + ")";

  //current_value.html(Math.round(data) + ' <span class="unit">LUX</span>');

  $("#" + id).find('.leaflet-map-pane').css('filter', filter);
  $("#" + id).find('.leaflet-map-pane').css('-webkit-filter', filter);
  //$("#" + id).find('.leaflet-overlay-pane').css('filter', 1.5 - filter );
  //$('.place .leaflet-map-pane').css('filter', 'brightness(0.1)' )
  // Use the CSS3 Brightness fitler
  //$("#map").css('filter', filter )
  //$("#legend").find(".items").html("");
}

function hideLight() {
  $('.leaflet-map-pane').css('filter', "brightness(0.8)");
}

function showPollution(data, id) {

    var box = $("#" + id).find(".overlay").find(".pollution");
    if (box.length == 0) {
      $("#" + id).find(".overlay").prepend('<div class="pollution"><div class="clouds_one"></div><div class="clouds_two"></div></div>');
    }

    var max = 40;
    var scale = 1;

    var percentage = Math.round((data - 12 / max) * 10) / 1000;

    //$("#place").find('.overlay').find('.value').html(Math.round(data) + ' <span class="unit">mV</span>');

    console.log(percentage)
    $("#" + id).find(".pollution").css('opacity', percentage)
}

function showTweets(coord, id) {
   var current_value = $("#place").find('.overlay').find('.value');
   var canvas = $("#" + id).find(".tweets").find("ul");

   $.getJSON('https://data-canvas-neighborhoods.herokuapp.com/twitter?lat=' + coord.lat + "&lng=" + coord.lng, function(data){
      console.log(data.statuses[0])

      // Sort by favorites and then retweets
      //sorted = _.sortBy(data.statuses, 'favorite_count');
      //sorted = _.sortBy(data.statuses, 'retweet_count');
      sorted = data.statuses.sort(function(a,b){
			var a_score = a.favorite_count + a.retweet_count;
         var b_score = b.favorite_count + b.retweet_count;
         return a_score - b_score;
      });
      sorted.reverse();

      canvas.html("");

      _.each(sorted, function(item){
         canvas.append('<li class="tweet">' + twitify(item.text) + '<br/>' + item.user.name + '</li>');
      })

      if (typeof places[id].tweet_slider !== 'undefined') {
        places[id].tweet_slider.reloadSlider();
      } else {
        places[id].tweet_slider = $("#" + id).find('.tweets').find(".bxslider").bxSlider({ slideWidth: 200, minSlides: 1, maxSlides: 3, slideMargin: 10, pager: false });
      }

      current_value.html(data.statuses.length + ' <span class="unit"> Tweets</span>');

	    function twitify( text ) {
        // replace urls with linked ones
        var t2 = text.replace(/(http|https)(:\/\/)([^ )]+)/ig, '<a href="$1$2$3">$1$2$3</a>' );
        // replace @username with clickable twitter link
        t2 = t2.replace(/@([^ ]+)/gi,'<a href="http://twitter.com/$1">@$1</a>');
        // replace hashtags with Twitter searches
        t2 = t2.replace(/#([^ ]+)/gi,'<a href="http://search.twitter.com/search?q=%23$1">#$1</a>');
        return t2;
      }
   });
}

function showPhotos(coord, id) {

   var current_value = $("#place").find('.overlay').find('.value');
   var canvas = $("#" + id).find(".photos").find("ul");

   $.getJSON('https://data-canvas-neighborhoods.herokuapp.com/instagram?lat=' + coord.lat + "&lng=" + coord.lng, function(data){

      // Handle the case where there are no public photos near the sensor
      if (data.data.length == 0) {
        canvas.html("No recent photos");
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

      //sorted.reverse();

      var first = sorted[0];

      //canvas.html("");
      _.each(sorted, function(item){

        if (item.caption !== null) {
          canvas.prepend('<li class="photo"><img src="' + item.images.low_resolution.url + '" width="220"/><div class="caption">' + item.caption.text + '</div></li>')
        } else {
          canvas.prepend('<li class="photo"><img src="' + item.images.low_resolution.url + '" width="220"/></li>')
        }

      });

      // Show the one with the most likes and comments
      //$(".overlay").find(".photo").html('<img src="' + first.images.low_resolution.url + '"/>');

      // Count the nubmer of photos
      current_value.html(sorted.length + ' <span class="unit"> Photos</span>');

      if (typeof places[id].photo_slider !== 'undefined') {
        places[id].photo_slider.reloadSlider();
      } else {
        console.log("reinstantiating slider? ")
        places[id].photo_slider = $("#" + id).find('.photos').find(".bxslider").bxSlider({ slideWidth: 200, minSlides: 1, maxSlides: 3, slideMargin: 10, pager: false });
      }
   });
}
