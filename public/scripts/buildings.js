var buildings;
var streets;
var feature_group = new L.featureGroup([]);

function showBuildings(map) {

  console.log("showing buildings...")
  var request = $.getJSON("data/buildings-with-density.js", function(data){

    buildings = data;
    buildings_layer = new L.geoJson(data,{
			onEachFeature: getBuildingInfo,
			style: styleBuilding
		});

    feature_group.addLayer(buildings_layer);
		feature_group.addTo(map);

    //getDevelopment();
    //getBusinesses();

  }).fail(function(e) {
    console.log( "error", e );
  });

  request.complete(function(data) {
    getListings()
  });

  function getDevelopment() {
    var request = $.getJSON("data/buildings-in-development.js", function(data){

      in_development = data;
      var layer = new L.geoJson(data, {
        style: styleDevelopment
      });

      feature_group.addLayer(layer);
      feature_group.addTo(map);

    });

    request.complete(function(data) {
      getBusinesses()
    });
  }

  function getBusinesses() {
    var request = $.getJSON("data/businesses.js", function(data){

      businesses = data;
      var layer = new L.geoJson(businesses, {
        style: styleBusiness
      });

      feature_group.addLayer(layer);
      feature_group.addTo(map);
    })

    function styleBusiness(feature) {
      var style = {
        weight: '1.3',
        fillColor: '#F0635A',
        color: '#CCCCCC',
        weight: '0.0',
        dashArray: '',
        fillOpacity: '0.8'
      }
      return style;
    }
  }


  function getBuildingInfo(feature, layer) {
    var popupContent = '<div>' + String(feature.properties['objname']) + '</div>';
  	layer.bindPopup(popupContent);
  }

  function getListings() {
    var listings = new Firebase("https://data-canvas.firebaseio.com/mission/apartments/listings");
    var points = [];
    listings.once('value',  function(snapshot) {
      snapshot.forEach(function(item, i){
        listing = item.val();

        var point = new turf.point([listing.location.lon, listing.location.lat], listing);

        var coord = L.latLng(listing.location.lat, listing.location.lon);
        var circle_options = {
          color:'#F18445',
          opacity: 0,
          weight: 1,
          fillColor:'#F18445',
          fillOpacity: 1
        }

        //var circle = L.circle(coord, 3, circle_options).addTo(features);
        //circle.bindPopup('<div>' + JSON.stringify(listing) + '</div>');
        points.push(point)
      });

      //styleRentals(points);

    });
  }

  function styleRentals(points) {
    var point_fc = turf.featurecollection(points);
    var poly_fc = turf.featurecollection(buildings.features);
    console.log(poly_fc)

    var tagged = turf.tag(point_fc, poly_fc, "objname", "name");
    console.log(tagged)

    _.each(tagged.features, function(item){
      var id = item.properties;
      //console.log(id)
      // e.g. "SanfranD_0835"
      var building = turf.filter(buildings, "objname", id);
    //  console.log(building)

    });

  }

  function styleDevelopment(feature) {
    var style = {
      weight: '1.3',
      fillColor: '#962EC6',
      color: '#CCCCCC',
      weight: '0.5',
      dashArray: '',
      opacity: '0.8',
      fillOpacity: '0.8'
    }
    return style;
  }

  function styleBuilding(feature) {
    //console.log(feature.properties)
    var style = {
      weight: '1.3',
      fillColor: '#314044',
      color: '#FFFFFF',
      weight: '0.0',
      dashArray: '',
      opacity: '0.8',
      fillOpacity: '0.6'
    }

    if(feature.properties.density !== null) {
      feature.properties.density = feature.properties.density.toString();

  			switch (feature.properties.density) {
  				case '0':
            style.fillColor = '#314044';
            style.fillOpacity = '1.0';
  					break;
  				case '1':
            style.fillColor = '#3C555B';
            style.fillOpacity = '1.0';
  					break;
  				case '2':
            style.fillColor = '#426D77';
            style.fillOpacity ='1.0';
  					break;
  				case '3':
            style.fillColor = '#418393';
            style.fillOpacity = '0.4';
  					break;
  				case '4':
            style.fillColor = '#3D9CB2';
            break;
  				default:
            style.fillColor = '#314044';
  					break;
  			}
    }

    /*
    if (feature.properties.code == "NCT") {
      style.fillColor = '#C953B3';
      style.fillColor = chroma('#C953B3').brighten().hex()
    }
    */

    if (feature.properties.num_businesses !== null) {
      var color ='#CE5D57';
      style.fillOpacity = '1.0'
      for (var i = 0; i < feature.properties.num_businesses; i++) {
        color = chroma(color).brighten(1.6).hex();
        //var color = chroma(color).brighten(0.5).hex();
      }

      style.fillColor = color
    }

    /*
    if (feature.properties.rental == "apartment") {
      style.color = '#FFFFFF',
      style.fillColor = "#FF7554",
      style.weight = 1;
    } */

    return style;

	}

  getVenues();
  //buildings = new OSMBuildings(map);

  //buildings.date(new Date());

  //buildings.style({ wallColor:'rgb(86, 120, 120, 20)', shadows:true });

  //buildings.load();

  /*
  $.getJSON("data/mission-streets.json", function(data){

    function street_style(feature) {
				return {
					color: '#000000', fillColor: '#9430cd', weight: 12.5, dashArray: '', opacity: 0.6, fillOpacity: 1.0
				}
		}

    streets = new L.geoJson(data,{
      style: street_style
    }).addTo(map);
  });
  */
  /*
  var promise = $.getJSON("data/mission-buildings.js", function(data){

    buildings = data;
    console.log("buildings", buildings);

    function doStylemissionbuildings(feature) {
				return {
					color: '#000000',
					fillColor: '#9430cd',
					weight: 1.3,
					dashArray: '',
					opacity: 1.0,
					fillOpacity: 1.0
				};

		}

    var buildings_layer = new L.geoJson(buildings,{
				style: doStylemissionbuildings
		});

    //features.addLayer(buildings_layer);

    var marker = L.marker([37.754392, -122.418503]).addTo(features);
    //place.map.panBy([200,0]);

    var buildings_layer = L.geoJson(buildings, {
      style: style
    });

    //buildings_layer.addTo(map)


    getVenues();
  });
  */

  //promise.done(getVenues());

  // TODO: Move to API Layer
  function getVenues(){
    var places_db = new Firebase("https://data-canvas.firebaseio.com/mission/checkins");

    var now = moment();
    var past = moment().subtract(60, 'minutes');


    places_db
      .orderByChild("time")
      .startAt(past.unix())
      .endAt(now.unix())
      .once('value', function(snapshot) {
        snapshot.forEach(function(child) {
          var place = child.val();
          showCircle(place);
        });
    });

    places_db.on("child_changed", function (snapshot) {
			var place = snapshot.val();
			showCircle(place);
    });
  };

  function showCircle(place) {

      var num_people = place.hereNow.count;

      var circle_options = {
        color:'#F18445',
        opacity: 0,
        weight: 1,
        fillColor:'#F18445',
        fillOpacity: 1
      }

      var coord = L.latLng(place.location.lat, place.location.lng);

      var point = new turf.point([place.location.lng, place.location.lat]);
      var buffer = turf.buffer(point, 20, "feet");
      var bbox = turf.extent(buffer);

      var points = turf.random('points', num_people, {
        bbox: bbox
      });

      for (var i = 0; i < points.features.length; i++) {
        var point = points.features[i];
        //var circle = L.circle(pointToLatLng(point), 3, circle_options).addTo(features);
      }
      //var circle = L.circle(coord, 6 + num_people, circle_options).addTo(features);
  }

  function whichBuildings(places) {

    var places = places.response.venues;

    inside_buildings = [];

    //collection = new turf.featurecollection([]);

    _.each(buildings.features, function(building){
      //console.log(building);

      _.each(places, function(place) {

          var num_people = place.hereNow.count;
          var point = turf.point([place.location.lng, place.location.lat]);

          try {
            var is_inside = turf.inside(point, building);

            if (is_inside) {
              inside_buildings.push(building);
            } else {
              //var marker = L.marker([place.location.lat, place.location.lng]).addTo(features);
            }
          } catch (e) {
            //console.log(e);
          }
          //console.log(point.properties.count = num_people)
          //collection.features.push(point);
          //var marker = L.marker([place.location.lat, place.location.lng]).addTo(features);
      });

    });

    _.each(inside_buildings, function(building){

      function doStylemissionbuildings(feature) {
  				return {
  					color: '#000000',
  					fillColor: '#9430cd',
  					weight: 1.3,
  					dashArray: '',
  					opacity: 1.0,
  					fillOpacity: 1.0
  				};

  		}

      var building= new L.geoJson(building,{
  				style: doStylemissionbuildings
  		});

      building.addTo(features)

    });

    //var intersection = turf.intersect(point, buildings);
    //var tagged = turf.tag(collection, buildings, 'objname', 'id');

  }

}
