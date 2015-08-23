var turf = require('turf');
var fs = require('fs');

var buildings = fs.readFileSync('./public/data/mission-buildings.json');

var mission = {
  "type":"Feature",
  "properties":{
    "name":"Mission",
    "cartodb_id":17,
    "created_at":"2013-02-10T05:44:04.653Z","updated_at":"2013-02-10T05:44:04.923Z"},
    "geometry":{"type":"MultiPolygon","coordinates":[[[[-122.424756,37.747849],[-122.424949,37.749725],[-122.425578,37.756617],[-122.426761,37.769577],[-122.426329,37.769601],[-122.423302,37.772048],[-122.423269,37.772074],[-122.42269,37.770624],[-122.421172,37.770221],[-122.419768,37.770073],[-122.415771,37.769625],[-122.412755,37.769588],[-122.40876,37.769225],[-122.407029,37.768911],[-122.40528,37.767914],[-122.405032,37.766635],[-122.405014,37.765952],[-122.404982,37.76467],[-122.405465,37.762525],[-122.406285,37.760887],[-122.406249,37.759519],[-122.405147,37.758511],[-122.403943,37.757761],[-122.403271,37.756746],[-122.402891,37.754529],[-122.403019,37.751107],[-122.403576,37.749388],[-122.404159,37.749379],[-122.405767,37.749097],[-122.407579,37.748383],[-122.411344,37.748237],[-122.415005,37.748263],[-122.418126,37.748212],[-122.420171,37.748179],[-122.421568,37.74807],[-122.423181,37.747959],[-122.424756,37.747849]]]]
  }
}


try {
  var erased = turf.erase(buildings, mission);
} catch (e) {

  console.log(e)

}