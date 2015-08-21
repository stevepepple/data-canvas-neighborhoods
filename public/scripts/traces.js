

function drawTraces(processing) {
  var x = 0;  var y = 0;

  var allX =  processing.createJavaArray('float', [100]);
  var allY =  processing.createJavaArray('float', [100]);

  var posCount =  0;

  var plane = null;
  var mode =  0;

  function setup() {
     processing.size ($(window).width(), $(window).height());

     x = processing.width/2;
     y = processing.height/2;

     plane = processing.loadImage("images/bart.png");
  }

  processing.setup = setup;

  function draw() {

    // Make the background transparant
    processing.background(0, 0);

    for (var i = 0; i < buses.length; i++) {
      var bus = buses[i];

      processing.ellipse(bus.xy.x, bus.xy.y, 3, 3);

      processing.noStroke();
      processing.rectMode(processing.CENTER);
      processing.imageMode(processing.CENTER);

      processing.tint(60, 60, 25, 255);
      processing.image(plane, 0, 0, plane.width, plane.height);

    }

    function showMouse() {
      var angle =  processing.atan2(processing.mouseY - y, processing.mouseX - x);
      var d =  processing.dist(processing.mouseX, processing.mouseY, x, y);

      x = x + .05 *(processing.mouseX - x);
      y = y + .05 *(processing.mouseY - y);

      var trailDist =  5;

      if (posCount > 0 ) {
        trailDist = processing.dist(x, y, allX[posCount-1], allY[posCount-1]);
      }

      if ( trailDist >= 5 ) {
        allX[posCount] = x;
        allY[posCount] = y;

        if (posCount < allX.length-1) {
          posCount = posCount + 1;
        }

        if (posCount >= allX.length-1) {
          for (var i =  1;  i < allX.length;  i++) {
            allX[i-1] = allX[i];
            allY[i-1] = allY[i];
          }
        }
      }

      for (var i =  0;  i < posCount;  i++) {
        processing.ellipse(allX[i], allY[i], 3, 3);
      }

      processing.noStroke();
      processing.rectMode(processing.CENTER);
      processing.imageMode(processing.CENTER);

      processing.tint(60, 60, 25, 255);
      processing.image(plane, 0, 0, plane.width, plane.height);
    }
  }

  processing.draw = draw;
}
