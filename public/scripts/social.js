var here_and_now =  new Firebase("https://data-canvas.firebaseio.com/mission/hereandnow");
getMedia();

var media = [];

function getMedia() {
  here_and_now
     .orderByChild("time")
     .limitToLast(30)
     .on("child_added", function(snapshot) {
       var item = snapshot.val();

       //console.log(item)

       // Handle tweets
       if (item.entities && item.retweet_count !== null) {

         item.source = "twitter";
         if (item.entities.hashtags) {
           var tags = [];

           _.each(item.entities.hashtags, function(tag){
              tags.push(tag.text)
           });

           var has_it = hasHashtag(tags);

           // Push valid media to the list
           if (has_it) {
             media.push(item)
           }
         }
       }

       // Handle photos
       if (item["type"] == "image") {

         console.log("Found a photo.")
         item.source = "instagram";

         if (item.tags) {
           var has_it = hasHashtag(item.tags);

           if (has_it) {
             media.push(item)
           }
         }
       }

       checkLatest();

  });


}

function checkLatest(){

  var sorted = _.sortBy(media, 'time');

  var last = sorted[sorted.length - 1 ];

  if (last) {
    console.log("-- Best item: ", last, moment.unix(last.time).toString())
    console.log(last.source)
    var source = last.source;
    if (source == "instagram") {
      showPhoto(last)
    }

    if (source == "twitter") {
      showTweet(last)
    }
  }
};

function showTweet(media) {
  console.log("Show this: ", media)

  $(".quote").html(
    "<a>@" + media.user.screen_name + "</a>" +
    "<div class='text'>" + media.text + "</div>"
  )

}

function showPhoto(media) {
  console.log("Show this: ", media)

  console.log(media.images.standard_resolution.url)

  if (media.caption) {
    $(".quote").html(
      "<a>@" + media.user.full_name + "</a>" +
      "<img class='image' src='" + media.images.standard_resolution.url + "'/>" +
      "<div class='caption'>" + media.caption.text + "</div>"
    )

  } else {
    $(".quote").html(
      "<a>" + media.user.full_name + "</a>" +
      "<img class='image' src='" + media.images.standard_resolution.url + "'/>");
  }

}


function hasHashtag(tags) {

  var has_it = false;
  _.each(tags, function(tag){
    if (tag.toLowerCase() == "hereandnow") {
      console.log(tag)

      has_it = true;
    }
  })

  return has_it;

}

function getPhotos() {

     // Handle the case where there are no public photos near the sensor

}
