let mic;


 




var nTiles = 10;
var nFrames = 128;
var phase = 0.0;
var phaseInc = 1.0 / nFrames;


// Draw sine wave
function drawWave(w, freq, amp, phase) {
  push();
  beginShape();
  for (var x = -w / 2.0; x < w / 2.0 + 1; x++) {
    vertex(x, sin(x / w * TAU * freq + phase) * amp);
  }
  endShape();
  pop();
}

function setup() {
  var cnv = createCanvas(600, 600);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
 
  background(255, 0, 200);

  // Create an Audio input
  mic = new p5.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
  
  noFill();
  seed = random(10000);
}



function draw() {
  background(0);
  resetMatrix();
  randomSeed(seed);
  noiseSeed(seed);

  // Get the overall volume (between 0 and 1.0)
  let vol = mic.getLevel();
   fill(127);
  stroke(0);

  // Draw an ellipse with height based on volume
  //let h = map(vol, 0, 1, height, 0);
  //ellipse(width / 2, h - 25, 50, 50);
  
  
  var w = width / nTiles;
  var amp = w;
  var nInc = 0.25;
  
  // Create border
  var thisWidth = 500;
  var thisHeight = 500;
  var thisScale = thisWidth / width;
  var t = (width - thisWidth) / 2.0;
  var sw = w / 2.0 * vol;
  translate(t + sw, t + sw * vol);

  for (var y = 0; y < nTiles; y++) {
    var yPos = y / nTiles * thisHeight;
    for (var x = 0; x < nTiles; x++) {
      push();
      var n = noise(x * nInc, (y + 1000) * nInc);  // Add noise to phase offset
      var xPos = x / nTiles * thisWidth;
      
      // Move to where sine will be drawn on screen
      translate(xPos, yPos);

      // Rotate approximately half of the sines
      if (random() < 0.5) {
        rotate(HALF_PI);
      }

      // Reverse direction for approximately half of the sines
      var thisPhase = phase;
      if (random() < 0.5) {
        thisPhase = 1.0 - thisPhase;
      }

      // Select between cyan and magents
      if (random() < 0.5) {
        stroke(64, 255, 255);
      } else {
        stroke(248, 64, 248);
      }
      
      // Select frequency / period of sine
      var freq = pow(2, random(5));
      
      // Draw the wave
      drawWave(w * 0.5 * vol * 10, freq* vol * 10, amp* vol * 10 * n * thisScale * 0.5, n * TAU * vol + thisPhase * TAU);

      pop();
    }
  }

  // Update phasor
  phase += phaseInc;
}