var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");
var tweets_db = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/all");
var things_db = new Firebase("https://data-canvas.firebaseio.com/mission/things");

var timer_interval = null;

function getRecentMedia(ref, callback) {
  console.log("Getting recent media...")
  ref
    .limitToLast(300)
    .orderByChild("time")
    .on("child_added", function(childSnapshot, prevChildKey) {
      var media = childSnapshot.val();
      callback(media);
    //var tweet = snapshot.val();
  });
}

function getBest(items, list) {

  var best = null;

  _.each(items, function(item){

    var item = _.findWhere(list, { "word" : item })

    if ( _.size(item) > 0 ) {
      if(best == null || item.count > best.count){
        best = item;
      }
    }
  });

  return best;
}

function showTimer() {
  clearInterval(timer_interval)

  var timer = $('#timer').circleProgress({
    value: 0.0,
    duration: (15 * 60 * 1000),
    size: 80,
    easing: "circleProgressEase",
    fill: {
      gradient: ["red", "orange"]
    }
  }).on('circle-animation-progress', function(event, progress, steValue) {
    $(this).find('div').html('10 <span>mins ago</span>');
  });;

  var timer_interval = setInterval(function(){

  }, 60 * 1000)



}
