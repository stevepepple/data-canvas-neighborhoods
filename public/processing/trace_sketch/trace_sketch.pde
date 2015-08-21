//GLOBAL
float x; // position of plane
float y;

//[] sz = new int [600];
float [] allX = new float[100];
float [] allY = new float[100];
int posCount = 0;

PImage plane;
int mode = 0;

//global variables apply to all, e.g. when needing to know + use over time

//LOCAL-once
void setup () {
  size (800, 800);
  x = width/2;
  y = height/2;

  plane = loadImage("bart-08.png");
}

//LOCAL-as defined inside a function or if statement

void draw() {

  background(0, 0);

  //useful in games, when needing something to rotate towards a target)
  //atan2(); to calculated an angle, on eof the only functions
  //that calauclate y before x, caluclating the difference
  float angle = atan2(mouseY - y, mouseX - x);
  float d = dist(mouseX, mouseY, x, y);
  x = x + .05*(mouseX - x);
  y = y + .05*(mouseY - y);

  float trailDist = 5;

  if (posCount > 0 ) {
    trailDist = dist(x, y, allX[posCount-1], allY[posCount-1]);
  }

  if ( trailDist >= 5 ) {
    allX[posCount] = x;
    allY[posCount] = y;

    if (posCount < allX.length-1) {
      posCount = posCount + 1;
    }

    if (posCount >= allX.length-1) {
      // erase first and move all over 1
      for (int i = 1; i < allX.length; i++) {
        allX[i-1] = allX[i];
        allY[i-1] = allY[i];
      }
    }
  }


  // loop thru all recorded position and draw ellipse
  for (int i = 0; i < posCount; i++) {
    ellipse(allX[i], allY[i], 3, 3);
  }





  noStroke();
  rectMode(CENTER);
  imageMode(CENTER);
  //shadow


  //plane
  tint(60, 60, 25, 255);
  image(plane, 0, 0, plane.width, plane.height);
}
