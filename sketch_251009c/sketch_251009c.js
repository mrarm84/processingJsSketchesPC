  // サンプルコードをいじってみる
// https://p5.textmode.art/docs/guides/first-rendering-pipeline

let asciifier;
let brightnessRenderer;
let edgeRenderer;

const palette = ["#ffff00", "#ff00ff", "#00ffff"];

const blocksNum = 10;
let blocks = [];

let minSize;

function setup() {
  setAttributes("antialias", false);
  createCanvas(windowWidth, windowHeight, WEBGL);

  minSize = min(width, height);

  for (let i = 0; i < blocksNum; i++) {
    blocks.push(new Block());
  }
}

// Called automatically after p5.js `setup()`
// to set up the rendering pipeline(s)
function setupAsciify() {
  // Fetch relevant objects from the library
  asciifier = p5asciify.asciifier();
  brightnessRenderer = asciifier
    .renderers() // get the renderer manager
    .get("brightness"); // get the "brightness" renderer

  edgeRenderer = asciifier
    .renderers() // get the renderer manager
    .get("edge"); // get the "edge" renderer

  // Update the font size of the rendering pipeline
  asciifier.fontSize(16);

  // Update properties of the brightness renderer
  brightnessRenderer.update({
    enabled: true, // redundant, but for clarity
    characters: " .:-=+*%@#",
    characterColor: "#ffffff",
    characterColorMode: "sampled", // or "fixed"
    backgroundColor: "#000000",
    backgroundColorMode: "fixed", // or "sampled"
    invert: true, // swap char and bg colors
    rotation: 0, // rotation angle in degrees
    flipVertically: false, // flip chars vertically
    flipHorizontally: false, // flip chars horizontally
  });

  // Update properties of the edge renderer
  edgeRenderer.update({
    enabled: true, // redundant, but for clarity
    characters: "-/|\\-/|\\", // should be 8 characters long
    characterColor: "#ffffff",
    characterColorMode: "fixed", // or "sampled"
    backgroundColor: "#000000",
    backgroundColorMode: "fixed", // or "sampled"
    invert: false, // swap char and bg colors
    rotation: 0, // rotation angle in degrees
    flipVertically: false, // flip chars vertically
    flipHorizontally: false, // flip chars horizontally
    sampleThreshhold: 16, // sample threshold for edge detection
    sobelThreshold: 0.5, // sobel threshold for edge detection
  });
}

function draw() {
  background(0);

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].move();
    blocks[i].display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Block {
  constructor() {
    this.pos = createVector(0, 0, 0);
    this.size = random(minSize * 0.4, minSize * 0.5);
    this.c = color(random(palette));
    this.rot = createVector(random(TWO_PI), random(TWO_PI), random(TWO_PI));
    this.rotStep = createVector(
      random(-0.01, 0.01),
      random(-0.01, 0.01),
      random(-0.01, 0.01)
    );
  }

  move() {
    this.rot.add(this.rotStep);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    rotateX(this.rot.x);
    rotateY(this.rot.y);
    rotateZ(this.rot.z);
    fill(this.c);
    box(this.size);
    pop();
  }
}
