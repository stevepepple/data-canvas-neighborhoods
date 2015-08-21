function getBest(items, list) {

  var best = null;

  _.each(items, function(thing){

    var thing = _.findWhere(things, { "word" : thing })

    if ( _.size(thing) > 0 ) {
      if(best == null || thing.count > best.count){
        best = thing;
      }
    }
  });

  return best;
}
