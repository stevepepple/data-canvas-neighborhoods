var Factual = require('factual-api');
var factual = new Factual('4sYNx5b1swkQNDqRCPzj80g2UGJGDQdrF4W4fc2A', 'rxO7tMKW0XGcpdTrq6FKlWvsHgWshFoEBNEWzYjn');

var _ = require('underscore');
var fs = require('fs');

var url = "/t/places-?geo={'$within':{'$rect': [[37.769268, -122.431223],[37.748572, -122.404873]] }}";

var count = 0;
var total = 5000;
var offset = 50;

//getPlaces();
getPlacesCloser();

var places = [];

// Here how to filter: filters: {category_ids:{ $includes : 430 }},
function getPlaces() {

  factual.get('/t/places-us', { include_count : true, offset : count, sort : "placerank:desc", geo: { $within :{ $rect : [[37.769268, -122.431223],[37.748572, -122.404873]] }}}, function (error, res) {

    console.log("factual response: ", res);

    total = res.total_row_count;
    count += offset;

    console.log("updated count: ", count);
    //console.log(res.data);

    _.each(res.data, function(place){
      places.push(place)
    });

    if (count < 2000) {
      getPlaces();
    } else {
      // Write the object to filesytem
      var out = JSON.stringify(places, null, ' ');
      fs.writeFile("./data/mission_places.json", out, function(err) {
          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
      });
    }
  });
}

// Here how to filter: filters: {category_ids:{ $includes : 430 }},
function getPlacesCloser() {

  factual.get('/t/places-us', { include_count : true, offset : count, sort : "placerank:desc", geo: { $within :{ $rect : [[37.756964, -122.426126],[37.748549, -122.421491]] }}}, function (error, res) {

    console.log("factual response: ", res);

    total = res.total_row_count;
    count += offset;

    console.log("updated count: ", count);
    //console.log(res.data);

    _.each(res.data, function(place){
      places.push(place)
    });

    if (count < 5000 && count < total ) {
      getPlacesCloser();
    } else {
      // Write the object to filesytem
      var out = JSON.stringify(places, null, ' ');
      fs.writeFile("./data/mission_places.json", out, function(err) {
          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
      });
    }
  });
}
