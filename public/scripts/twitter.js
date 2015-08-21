var points = [];

function getTweets(map, coord) {
   var current_value = $("#place").find('.overlay').find('.value');
   //var canvas = $("#" + id).find(".tweets").find("ul");

   var url = "https://data-canvas.firebaseio.com/mission/tweets/housing";
   var tweets = new Firebase(url);

   var now = moment();
   var past = moment().subtract(60 * 12, 'minutes');

   var circle_options = {
     color:'#FFFFFF',
     stroke: true,
     opacity: 0.5,
     weight: 0.5,
     fillColor:'#1FFFF2',
     fillOpacity: 1.0,
     radius: 4
   }

   console.log("getting photos...")
   tweets.on("child_added", function(snapshot) {
     var tweet = snapshot.val();
     // TODO: Show the tweet!
     //console.log("New tweet: ", tweet);
   });

   tweets.on('child_changed', function(childSnapshot, prevChildKey) {
   // code to handle new child.
    var tweet = childSnapshot.val();
    var coord = L.latLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);

    console.log("New Tweet: ", tweet)
   });

   tweets.orderByChild("time")
    .startAt(past.unix())
    .endAt(now.unix())
    .limitToLast(200)
    .once('value',  function(snapshot) {
      snapshot.forEach(function(item, i){
        var tweet = item.val();

        var coord = L.latLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
        var circle = new L.circleMarker(coord, circle_options).addTo(features);
        //console.log(photo)
        //console.log(photo.time, (photo.time > past.unix()))
        circle.on("click", function(e) {
          var xy = map.latLngToLayerPoint(e.target._latlng)

          $("body").prepend(popup);
          //my click stuff
        });

    });
  });



   $.getJSON('twitter?lat=' + coord.lat + "&lng=" + coord.lng, function(data){

      // Sort by favorites and then retweets
      //sorted = _.sortBy(data.statuses, 'favorite_count');
      //sorted = _.sortBy(data.statuses, 'retweet_count');
      /*
      sorted = data.statuses.sort(function(a,b){
			var a_score = a.favorite_count + a.retweet_count;
         var b_score = b.favorite_count + b.retweet_count;
         return a_score - b_score;
      });
      sorted.reverse();

      _.each(sorted, function(item){

        var circle_options = {
          color:'#4A90E2',
          opacity: 0,
          weight: 1,
          fillColor:'#4A90E2',
          fillOpacity: 1.0
        }

        if(item.geo !== null) {

          var coord = L.latLng(item.geo.coordinates[0], item.geo.coordinates[1]);

          var point = map.latLngToContainerPoint(coord);
          points.push(point)
          //train.end = map.latLngToContainerPoint(s16);

          var circle = L.circle(coord, 3, circle_options).addTo(features);

        };


        //canvas.append('<li class="tweet"><img src="' + item.user.profile_image_url_https + '"/><span class="text"><a href="' + item.user.url + '" target="_blank">' + item.user.name + '</a>: ' + twitify(item.text) + '</span></li>');
      })
      */
      /*
      if (typeof places[id].tweet_slider !== 'undefined') {
        places[id].tweet_slider.reloadSlider();
      } else {
        places[id].tweet_slider = $("#" + id).find('.tweets').find(".bxslider").bxSlider({ slideWidth: 200, minSlides: 1, maxSlides: 3, slideMargin: 10, pager: false });
      }

      $("#" + id).find('.tweets').find(".bx-wrapper").css('max-height', $("#" + id).find('.photos').height() - 10 + ' !important');

      current_value.html(data.statuses.length + ' <span class="unit"> Tweets</span>');

	    function twitify( text ) {
        // replace urls with linked ones
        var t2 = text.replace(/(http|https)(:\/\/)([^ )]+)/ig, '<a href="$1$2$3">$1$2$3</a>' );
        // replace @username with clickable twitter link
        t2 = t2.replace(/@([^ ]+)/gi,'<a href="http://twitter.com/$1" target="_blank">@$1</a>');
        // replace hashtags with Twitter searches
        t2 = t2.replace(/#([^ ]+)/gi,'<a href="http://search.twitter.com/search?q=%23$1" target="_blank">#$1</a>');
        return t2;
      }
      */
   });
}
