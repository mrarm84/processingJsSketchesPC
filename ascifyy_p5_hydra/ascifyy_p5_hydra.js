/**
 * @name 06_hydra-synth
 * @description Basic example utilizing hydra-synth with p5.js and p5.asciify.
 * @author flordefuego
 * @coauthor humanbydefinition
 * @link https://github.com/humanbydefinition/p5.asciify
 * @link https://github.com/hydra-synth/hydra-synth
 * @link https://hydra.ojack.xyz/
 * 
 * This example demonstrates how to utilize the `hydra-synth` library with `p5.asciify`.
 * The default 'brightness' renderer is used to asciify the hydra canvas.
 * 
 * The `hydra-synth` library is imported globally in the HTML file.
 */
let libs = ['https://unpkg.com/hydra-synth', 'includes/libs/hydra-synth.js',"https://cdn.jsdelivr.net/npm/p5.asciify@0.6.3/dist/p5.asciify.min.js","https://cdn.jsdelivr.net/npm/p5.glitch@latest/p5.glitch.js"]

// hydra canvas + init
let hc = document.createElement('canvas') // hydra canvas + custom size
hc.width = 640 // window.innerWidth // for full res
hc.height = 360 // window.innerHeight // for full res
let hydra = new Hydra({detectAudio: false,canvas: hc})
noize = noise // use noize() since noise() is taken by p5js

let pg // store hydra texture

// // sandbox - start
// voronoi(8,1)
// .mult(osc(10,0.1,()=>Math.sin(time)*3).saturate(3).kaleid(200))
// .modulate(o0,0.5)
// .add(o0,2.8)
// .scrollY(-1.01)
// .scale(0.99)
// .modulate(voronoi(8,1),0.008)
// .luma(0.3)
// .out()

//load p5 source to use it in Hydra
// s0.init({src: hc}) 

// osc(10).layer(src(s0).modulate(noise(2))).out()

speed = 0.1
// sandbox - stop

let fishPath = 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Triangulo_HSV.png'

// function setup() {
// 	createCanvas(windowWidth, windowHeight, WEBGL)
// 	background(0)
// 	  glitch = new Glitch();
// 	glitch.loadType('jpg'); // specify jpeg file glitching, default
// 	glitch.loadQuality(.225); 
// 	// glitch.loadImage('https://upload.wikimedia.org/wikipedia/commons/1/1b/Triangulo_HSV.png', function(im) {
// 	// 	glitch.loadImage(pg);
// 	// });
// 	glitch.loadBytes(fishPath, function() {
// 		glitch.randomBytes(50); // 50 random bytes
// 		// glitch.saveBytes('fish_glitch.png'); // toggle saveBytes()
// 	});
// 	pg = createGraphics(hc.width, hc.height)
  

// }


// function draw() {
// 	// grab + apply hydra texture
// 	pg.clear()
// // 	glitch.loadImage(hc);
// // 	glitch.randomBytes(10); // randomize 10 bytes
// // glitch.replaceBytes(45, 127); // find + replace all
// // glitch.replaceHex('ffdb00430001','ffdb004300ff'); // jpg quant table
// // 	glitch.replaceBytes(100, 104); 
// // 	glitch.randomBytes(200);
// // 	glitch.limitBytes(0.2);
// // 	glitch.buildImage();
// 	pg.drawingContext.drawImage(hc, 0, 0, pg.width, pg.height)
//  image(pg, -width / 2, -height / 2, width, height);
// //  image(glitch.image, width / 2, height / 2, width, height)
// }



// Define the default options for the brightness renderer
const BRIGHTNESS_OPTIONS = {
  enabled: true,
  characters: " .:-=+*#%@",
  characterColor: "#ffffff",
  characterColorMode: 'sampled',
  backgroundColor: "#000000",
  backgroundColorMode: 'fixed',
  invertMode: false,
  fontSize: 16,
  rotationAngle: 0
};

// Global variables
let hydraCanvas; // Create a canvas for hydra to render to
let pGraphic; // Create a p5.Graphics object to store the hydra canvas
let asciifier; // Define the `asciifier` variable to store the `P5Asciifier` instance

function setup() {
  setAttributes('antialias', false);
  createCanvas(windowWidth, windowHeight, WEBGL);

  pGraphic = createGraphics(width, height);

  // taken from p5Live references
  // https://teddavis.org/p5live/
  // hydra canvas + init
  hydraCanvas = document.createElement("canvas");
  hydraCanvas.width = width;
  hydraCanvas.height = height;
  hydra = new Hydra({ detectAudio: false, canvas: hydraCanvas });

  // hydra code
//   osc(10, 0.1, [0, 2].smooth()).out();
  
// sandbox - start
voronoi(1,1)
.mult(osc(1,0.1,()=>Math.sin(time)*3).saturate(1).kaleid(200))
.modulate(o0,0.5)
.add(o0,0.8)
.scrollY(-1.01)
.scale(0.99)
.modulate(voronoi(8,1),0.008)
.luma(0.3)
.out()



}

// After `p5.asciify` is set up in the background after `setup()`,
// we can call `setupAsciify()` to configure `p5asciify` and it's `P5Asciifier` instances and rendering pipelines
function setupAsciify() {
  // Fetch the default `P5Asciifier` instance provided by the library
  asciifier = p5asciify.asciifier();

  if (BRIGHTNESS_OPTIONS.fontSize) { // If a `fontSize` is provided, set it in the `asciifier` instance
    asciifier.fontSize(BRIGHTNESS_OPTIONS.fontSize);
  }

  // Update the pre-defined `brightness` renderer with the provided options
  asciifier.renderers().get("brightness").update({
    enabled: BRIGHTNESS_OPTIONS.enabled,
    characters: BRIGHTNESS_OPTIONS.characters,
    characterColor: BRIGHTNESS_OPTIONS.characterColor,
    characterColorMode: BRIGHTNESS_OPTIONS.characterColorMode,
    backgroundColor: BRIGHTNESS_OPTIONS.backgroundColor,
    backgroundColorMode: BRIGHTNESS_OPTIONS.backgroundColorMode,
    invertMode: BRIGHTNESS_OPTIONS.invertMode,
    rotationAngle: BRIGHTNESS_OPTIONS.rotationAngle
  });
}

function draw() {
  pGraphic.clear(); // Draw hydra to pGraphic
  pGraphic.drawingContext.drawImage(hydraCanvas, 0, 0, width, height);

  clear(); // Draw pGraphic to the screen for `p5asciify` to process
  image(pGraphic, -width / 2, -height / 2);
}

// After the asciified content is drawn to the canvas, use `drawAsciify()` to draw on top of it
function drawAsciify() {
  const fpsText = "FPS:" + Math.min(Math.ceil(frameRate()), 60);

  noStroke();
  fill(0);
  rect(-width / 2, height / 2 - textAscent() - 4, textWidth(fpsText), textAscent());

  textFont(asciifier.fontManager.font);
  textSize(64);
  fill(255, 255, 0);
  text(fpsText, -width / 2, height / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pGraphic.resizeCanvas(width, height);

  hydra.setResolution(width, height);
}