function showTraffic(map) {

  /* Google Layer won't work
  var googleLayer = new L.Google('TRAFFIC');
  map.addLayer(googleLayer);
  */

  /*
  var bing = new L.BingLayer("Anqm0F_JjIZvT0P3abS6KONpaBaKuTnITRrnYuiJCE0WOhH6ZbE4DzeT6brvKVR5");
  var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

  map.addLayer(bing);

  map.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}, {}));
  */

  /*
  MQ.mapLayer().addTo(map);

  var tilesetUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
        subDomains = ['otile1','otile2','otile3','otile4'],
        attribution = 'Data, imagery and map information provided by <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';

    var openMapQuest = new L.TileLayer(tilesetUrl, {maxZoom: 18 });
    openMapQuest.addTo(map);

    map.addLayer(MQ.trafficLayer());
  .addTo(map);
  */

  /* MapQuest

   map = L.map('map', {
       layers: mapLayer,
       center: [ 40.731701, -73.993411 ],
       zoom: 12
   });



   var map = L.map('map', {
          layers: MQ.mapLayer(),
          center: [ 40.731701, -73.993411 ],
          zoom: 12
      });

      MQ.trafficLayer().addTo(map);

   L.control.layers({
       'Traffic Flow': MQ.trafficLayer({layers: ['flow']}),
       'Traffic Incidents': MQ.trafficLayer({layers: ['incidents']})
   }).addTo(map);

   */


}
