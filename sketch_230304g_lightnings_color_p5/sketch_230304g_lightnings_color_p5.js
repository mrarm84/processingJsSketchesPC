// Sorry for the quite ugly code...

var f = 60,
  r = 0,
  u = Math.PI * 2,
  v = Math.cos,
  q;

function setup() {
  createCanvas(1000, 400);
  frameRate(60)

  // To capture static screenshot
  // noLoop();
  // for(var i=0; i < 10; i++) { draw() } 
}

function draw() {
  // background(225, 200); // Try this for white background pattern
  background(25, 200);
  drawLightnings();
  drawCircles();
}

function drawLightnings() {
  // stroke(0, 100); // Try this to emphasize lightnings
  noStroke()
  for(var i=0; i < 10; i++) {
    q = [ {x: f, y: height * 0.7 + f}, {x: random(f-10, f+10), y: height * 0.7 - f} ]
    while(q[1].x < width + f) drawTriangle(q[0], q[1])
  }
}

function drawTriangle(i, j, direction){
  r -= u / -50;
  c = (v(r)*127+128<<16 | v(r+u/3)*127+128<<8 | v(r+u/3*2)*127+128).toString(16);

  fill(color(
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
    200));

  beginShape();
  vertex(i.x, i.y);
  vertex(j.x, j.y);
  var k = j.x + (Math.random()*2-0.25)*f;
  var n = y(j.y);
  vertex(k, n);
  endShape(CLOSE);

  q[0] = q[1];
  q[1] = { x: k, y: n };
}

function y(p){
  var t = p + (Math.random() * 2 - 1.1) * f;
  return (t > height || t < 0) ? y(p) : t;
}

function drawCircles() {
  stroke(255, 200);

  var radius = 10;
  for(var i=0; i < 100; i++) {
    fill(color(random(100, 255), random(100, 255), random(255), 100));
    ellipse(random(f-radius, f+radius), random(height - f -radius, height - f +radius, ), random(50));
  }
}
