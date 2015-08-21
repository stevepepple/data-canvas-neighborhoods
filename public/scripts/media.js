var photos_db = new Firebase("https://data-canvas.firebaseio.com/mission/photos/all");
var tweets_db = new Firebase("https://data-canvas.firebaseio.com/mission/tweets/all");
var things_db = new Firebase("https://data-canvas.firebaseio.com/mission/things");

function getRecentMedia(ref, callback) {
  console.log("Getting recent media...")
  ref
    .limitToLast(300)
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
