var play = $('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>');
var pause = $('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#FFFFF" d="M14,19.14H18V5.14H14M6,19.14H10V5.14H6V19.14Z"/></svg>');

var soundMax = 0;
var soundMin = 0;

var globalVol = 0;
var globalRate = 0;

var globalUpdateTime = 200;
var i = 0;


function setupWave(place) {
  place.waveform = new Waveform({
    container: $("#" + place.id).find('.audioViz').get(0),
    interpolate: false
  });

  place.data = [];

  var ctx = place.waveform.context;

  var gradient = ctx.createLinearGradient(0, 0, 0, place.waveform.height);
  gradient.addColorStop(0.0, "#E87B58");
  gradient.addColorStop(1.0, "#E15326");
  place.waveform.innerColor = gradient;

  place.updateWave = function() {
    place.waveInterval = setInterval(function(){
      place.data.push(place.noise * Math.cos(i++/25 * globalRate/2) - 0.2 + Math.random()*0.3);
      place.waveform.update({
        data: place.data
      });
    }, globalUpdateTime);
  }

  place.updateWave();

}


function showNoise(noise, id) {

  var place = places[id];

  if (typeof place.waveform == "undefined") {
      setupWave(place);
  }

  // define function to convert from one range to another.
  function convertRange(curr, oldMin, oldMax, newMin, newMax) {
    var oldSpan = oldMax - oldMin;
    var newSpan = newMax - newMin;

    var scaledValue = (curr - oldMin) / oldSpan;
    return newMin + (scaledValue * newSpan);
  };

  // Do something with the data
  // dust, humidity, light, light_summary, noise, pollution, pollution_summary, temperature
  var current_value = $("#place").find('.overlay').find('.value');

  if(noise > soundMax) {soundMax = noise;}
  if(noise < soundMin) {soundMin = noise;}

  //current_value.html(Math.round(data.noise) + ' <span class="unit">dB</span>');

  // Set up some of that audio stuff
  var $aud = $("#" + id).find(".track");
  place.audio = $aud[0];

  // Convert range of noise data to the range [0,1].
  var vol = convertRange(noise, soundMin, soundMax, 0, 1);

  var playbackRate = convertRange(noise, soundMin, soundMax, 0.5, 3);

  // set the current volume to the scaled value
  place.audio.volume = vol;
  globalVol = vol;
  place.audio.playbackRate = playbackRate;
  globalRate = playbackRate;
  place.noise = noise / 3000;


  if(typeof place.isPlay == "undefined") {
    place.isPlay = true;
  }

  if (place.isPlay == false) {
    place.isPlay = false;
    $(this).html(pause);
    place.audio.pause();
    place.audio.volume = 0;
  }

  // Control for playing pausing the place's beat
  $('#' + id).find('.play').unbind().on('click', function() {
    $(this).toggleClass('active');
    if (place.isPlay) {
    // we're playing currently, so we must pause.
      place.isPlay = false;
      globalUpdateTime = 0;
      place.audio.volume = 0;
      clearInterval(place.waveInterval);
      $(this).html(play);

    } else {

      // we are paused
      $(this).html(play);
      place.isPlay = true;
      place.updateWave();
      place.audio.play()
      place.audio.volume = globalVol;
    }
});
}

function showTemp(data, id) {

  var temp = Math.round(data * 1.8 + 32);

  $("#" + id).find('.temp').html('°' + temp + 'F')
}


function showLight(data, id) {

  // Do something with the data
  // dust, humidity, light, light_summary, noise, pollution, pollution_summary, temperature
  var place = places[id];

  // LUX is lumens per square meter
  var max = 10000;
  var scale = 2;

  var percentage = Math.round((data / max) * 10) / 10;
  var value = percentage * scale;
  // Only make the panel
  //if (value < 0.3) { value = 0.3; }

  if (percentage >= 0.4) {
    $("#" + id).addClass("bright");
    place.bright = true;
  } else {
    $("#" + id).removeClass("bright");
    place.bright = false;
  }
  // Create a css 3 filter representing the brightness
  var filter = "brightness(" + (value + 0.3) +  ") saturate(0.4) contrast(" + (1.2) + ")";

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

function showDust(data, id) {

  var place = places[id];

  var numParticlesMax = 700;
  var numParticlesMin = 10;
  var numParticles = 50;

  var sizeMax = 10;
  var sizeMin = 2;
  var size = 10.0;

  var dustMin = 500;
  var dustMax = 1000;
  var nodes = [];
  var w;
  var h;
  var svg;
  var box = $("#" + id).find(".overlay").find(".dust");
  var color = '#FFFFFF';

  if (box.length == 0) {
    $("#" + id).find(".overlay").prepend('<div class="dust"></div>');
    createCanvas();
  } else {
    updateData(data);
    force.start();
  }

  if (place.bright == true) {
    color = '#000000';
  }

  function createCanvas() {
    box = $("#" + id).find(".overlay").find(".dust");
    w = box.width();
    h = box.height();

    svg = d3.select(box.get(0)).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    force = d3.layout.force()
        .alpha(0)
    	  .charge(-20)
    	  .linkDistance(40)
        .size([w, h])
        .gravity(0.005)
        .nodes(nodes)
        .on("tick", tick)
        .start();

    function tick() {
    	svg.selectAll("circle")
          .attr("cx", function(d) {
            d.px = d.px + getplusorminus() * Math.floor((0.75 * w/2 * Math.random())/(w/4));
    	     return d.px;
       	})
          .attr("cy", function(d) {
          	return d.y + getplusorminus() * Math.floor((0.75 * h/2 * Math.random())/(h/4));
       	})
      	.attr("fill", color)
       	.attr("opacity", "0.8");
    }

    function getplusorminus() {
       if (Math.random() <=0.5 ) {return -1}
       else {return 1}
    }

    var interval = setInterval(function() {
      var d = {
        x: w / 2 + 2 * Math.random() - 1,
        y: h / 2 + 2 * Math.random() - 1
      };
      nodes.push(d);
      if(nodes.length >=  numParticles) {
         //get difference
         var diff =  nodes.length - numParticles;
         nodes.splice(0, diff + 1);
         for (var i =0; i<diff; i++) {
            $("svg").children("circle:first").remove();
         }
      } else {
         svg.append("svg:circle")
          .data([d])
          .attr("r", size)
        .transition()
          .ease(Math.sqrt)
          .attr("r", 1.8);

         force.start();
      }
    }, 100);
  }

  function getRandomInt(min, max) {
    return -1 * Math.floor(Math.random() * (max - min)) + min;
  }

  // This function does the work to visualize the data in a HTML canvas
  function updateData(data) {

    var current_value = $("#place").find('.overlay').find('.value');
    var dustVal =  Math.round(data);

    current_value.html(Math.round(data) + ' <span class="unit">ppm</span>');

     if (dustVal < dustMin) {dustMin = dustVal;}
     if (dustVal > dustMax) {dustMax = dustVal;}

     // Now we need to get the number of dust particles needed.
     numParticles = Math.round(convertRange(dustVal, dustMin, dustMax, numParticlesMin, numParticlesMax));
     size = Math.round(convertRange(dustVal, dustMin, dustMax, sizeMin, sizeMax));

     // TODO: What the best way to reload the dust

     // define function to convert from one range to another.
     function convertRange(curr, oldMin, oldMax, newMin, newMax) {
        var oldSpan = oldMax - oldMin;
        var newSpan = newMax - newMin;

        var scaledValue = (curr - oldMin) / oldSpan;

        return newMin + (scaledValue * newSpan);
     };
  }
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

    $("#" + id).find(".pollution").css('opacity', percentage);
}

function showTweets(coord, id) {
   var current_value = $("#place").find('.overlay').find('.value');
   var canvas = $("#" + id).find(".tweets").find("ul");

   $.getJSON('https://data-canvas-neighborhoods.herokuapp.com/twitter?lat=' + coord.lat + "&lng=" + coord.lng, function(data){

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
        canvas.append('<li class="tweet"><img src="' + item.user.profile_image_url_https + '"/><span class="text"><a href="' + item.user.url + '" target="_blank">' + item.user.name + '</a>: ' + twitify(item.text) + '</span></li>');
      })

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
   });
}

function showPhotos(coord, id) {

   var current_value = $("#place").find('.overlay').find('.value');
   var canvas = $("#" + id).find(".photos").find("ul");

   $.getJSON('https://data-canvas-neighborhoods.herokuapp.com/instagram?lat=' + coord.lat + "&lng=" + coord.lng, function(data){

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

        if (item.caption !== null) {
          canvas.prepend('<li class="photo"><a href="' + item.link + '" target="_blank"><img src="' + item.images.low_resolution.url + '"/></a><div class="caption">' + item.caption.text + '</div></li>')
        } else {
          canvas.prepend('<li class="photo"><img src="' + item.images.low_resolution.url + '"/></li>')
        }

      });

      // Show the one with the most likes and comments
      //$(".overlay").find(".photo").html('<img src="' + first.images.low_resolution.url + '"/>');

      // Count the nubmer of photos
      current_value.html(sorted.length + ' <span class="unit"> Photos</span>');

      if (typeof places[id].photo_slider !== 'undefined') {
        places[id].photo_slider.reloadSlider();
      } else {
        places[id].photo_slider = $("#" + id).find('.photos').find(".bxslider").bxSlider({ slideWidth: 200, minSlides: 1, maxSlides: 3, slideMargin: 10, pager: false });
      }

      $("#" + id).find('.photos').find(".bx-wrapper").css('max-height', $("#" + id).find('.photos').height() - 10 + ' !important');

      $("#" + id).find('.photo').mouseover(function() {
        $(this).addClass('big')
      })
      .mouseout(function() {
        $(this).removeClass('big');
      });

   });
}
