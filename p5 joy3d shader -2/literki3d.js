p5.disableFriendlyErrors = true;

const title = 'geometry';
let palette = [];
let motif;
let backgroundColor = '#f5f5f5';

function setup() {
  createCanvas(1000, 1000, WEBGL);
  setAttributes('antialias', true);
  setAttributes('depth', true);
  angleMode(RADIANS);
  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER, CENTER);
  pixelDensity(1);
  smooth();
  frameRate(30);
  noStroke();
  init();
}

function initCamera() {
  ortho(-width, width, -height, height, -10000, 10000);
  const d = 1000;
  camera(d, -d * 0.15, d, 0, 0, 0, 0, 1, 0);
}

function init() {
  initCamera();
   const orgPalette = getColorScheme('Giftcard_sub');  
  palette = repeatPalette(orgPalette, 1);
  motif = new Motif({
    originX: 0,
    originY: 0,
    originZ: 0,
  });
}
let rotationX = 0;
let rotationY = 0;
let timeFactor = 1;

function pollGamepad() {
  const gp = navigator.getGamepads()[0];
  if (!gp) return;

  // Left stick → rotation
  const lx = gp.axes[0]; // -1..1
  const ly = gp.axes[1];
  rotationY += lx * 0.05; // yaw
  rotationX += ly * 0.05; // pitch

  // Right stick → time modulation
  const rx = gp.axes[2];
  timeFactor += rx * 0.01;
}

function draw() {
  background(palette.colors[0]);
  pollGamepad();

  ambientLight(240);
  shininess(20);
  pointLight(255, 255, 255, 50, -100, 80);
  specularColor(255);
  specularMaterial(255);

  push();
  rotateX(rotationX);
  rotateY(rotationY);
  motif.run(timeFactor); // pass time modulation
  pop();


}
