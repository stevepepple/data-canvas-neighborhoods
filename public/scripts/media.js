var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");
var tweets_db = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/all");
var things_db = new Firebase("https://data-canvas.firebaseio.com/mission/things");

var timer_interval = null;

function getRecentMedia(ref, callback) {
  console.log("Getting recent media...")

  ref
    .limitToLast(200)
    .orderByChild("time")
    .on("child_added", function(childSnapshot, prevChildKey) {

      var media = childSnapshot.val();
      console.log("child_added !!!", media)
      callback(media);
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

  var time = 0;
  var total = 20;

  timer = $('#timer').circleProgress({
    value: 0.0,
    animation: { duration: 30 * 1000 },
    size: 86,
    reverse: true,
    startAngle: 180,
    easing: "circleProgressEase",
    emptyFill : "rgba(104,91,109,0.80)",
    fill: { gradient: ["#B68EB6", "#864285"] }
  }).on('circle-animation-progress', function(event, progress, steValue) {
    $(this).find('div').html( Math.round(total - time) + ' <br/><span>mins ago</span>' );
  });;

  var timer_interval = setInterval(function(){
    // Update every thirty seconds
    time += 0.5;

    showTime()

    setTimeout(function() { timer.circleProgress('value', time / 20 ); }, 1000);

  }, 30 * 1000) // 60 * 1000
  showTime();
}

function showTime() {
  var now = moment();
  $(".time").html( now.format("hh:mm A") );
}

String.prototype.toTitleCase = function () {
  var string = "";
  var words = this.split(" ");
  	for(keyvar in words) {
  		string += ' ' + words[keyvar].substr(0,1).toUpperCase()
    	+ words[keyvar].substr(1,words[keyvar].length);
  	}
  	return string;
}
