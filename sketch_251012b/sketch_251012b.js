let asciifier;
let customRenderer;

let characterFramebuffer;
let primaryColorFramebuffer;
let secondaryColorFramebuffer;
let rotationFramebuffer;
let transformFramebuffer;

// Camera and GUI variables
let capture;
let gui;
let controls = {
  gridSize: 8,
  charMode: 'sampled',
  bgMode: 'sampled',
  fixedCharColor: '#ffffff',
  fixedBgColor: '#000000',
  customChars: '█▓▒░',
  charSet: 'ascii_blocks',
  threshold: 128,
  redEffect: false,
  greenEffect: false,
  blueEffect: false,
  invertEffect: false,
  posterizeEffect: false
};

// Character sets
const charSets = {
  ascii_blocks: '█▓▒░',
  ansi_boxes: '┌─┐│└┘├┤┬┴┼',
  ascii_chars: '@%#*+=-:. ',
  numbers: '0123456789',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

function setup() {
  setAttributes('antialias', false);
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Initialize camera
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // Create GUI
  createGUI();
}

function createGUI() {
  // Create main GUI container
  let guiContainer = createDiv('');
  guiContainer.style('position', 'absolute');
  guiContainer.style('top', '10px');
  guiContainer.style('left', '10px');
  guiContainer.style('background', 'rgba(0,0,0,0.8)');
  guiContainer.style('color', 'white');
  guiContainer.style('padding', '10px');
  guiContainer.style('border-radius', '5px');
  guiContainer.style('font-family', 'monospace');
  guiContainer.style('font-size', '12px');
  guiContainer.style('z-index', '1000');

  // Grid Size
  let gridLabel = createP('Grid Size:');
  gridLabel.parent(guiContainer);
  gridLabel.style('margin', '5px 0 2px 0');

  let gridSelect = createSelect();
  gridSelect.parent(guiContainer);
  gridSelect.option('6');
  gridSelect.option('8');
  gridSelect.option('12');
  gridSelect.option('16');
  gridSelect.option('32');
  gridSelect.selected('8');
  gridSelect.changed(() => {
    controls.gridSize = parseInt(gridSelect.value());
    updateAsciifier();
  });

  // Character Mode
  let charLabel = createP('Character:');
  charLabel.parent(guiContainer);
  charLabel.style('margin', '10px 0 2px 0');

  let charSelect = createSelect();
  charSelect.parent(guiContainer);
  charSelect.option('sampled');
  charSelect.option('fixed');
  charSelect.selected('sampled');
  charSelect.changed(() => {
    controls.charMode = charSelect.value();
    updateAsciifier();
  });

  // Background Mode
  let bgLabel = createP('Background:');
  bgLabel.parent(guiContainer);
  bgLabel.style('margin', '10px 0 2px 0');

  let bgSelect = createSelect();
  bgSelect.parent(guiContainer);
  bgSelect.option('sampled');
  bgSelect.option('fixed');
  bgSelect.selected('sampled');
  bgSelect.changed(() => {
    controls.bgMode = bgSelect.value();
    updateAsciifier();
  });

  // Color Pickers
  let colorLabel = createP('Fixed Colors:');
  colorLabel.parent(guiContainer);
  colorLabel.style('margin', '10px 0 2px 0');

  let charColorInput = createColorPicker('#ffffff');
  charColorInput.parent(guiContainer);
  charColorInput.input(() => {
    controls.fixedCharColor = charColorInput.value();
    updateAsciifier();
  });

  let bgColorInput = createColorPicker('#000000');
  bgColorInput.parent(guiContainer);
  bgColorInput.input(() => {
    controls.fixedBgColor = bgColorInput.value();
    updateAsciifier();
  });

  // Character Sets
  let charsetLabel = createP('Character Set:');
  charsetLabel.parent(guiContainer);
  charsetLabel.style('margin', '10px 0 2px 0');

  let charsetSelect = createSelect();
  charsetSelect.parent(guiContainer);
  charsetSelect.option('ascii_blocks');
  charsetSelect.option('ansi_boxes');
  charsetSelect.option('ascii_chars');
  charsetSelect.option('numbers');
  charsetSelect.option('letters');
  charsetSelect.selected('ascii_blocks');
  charsetSelect.changed(() => {
    controls.charSet = charsetSelect.value();
    controls.customChars = charSets[controls.charSet];
    updateAsciifier();
  });

  // Custom Characters Input
  let customLabel = createP('Custom Chars:');
  customLabel.parent(guiContainer);
  customLabel.style('margin', '10px 0 2px 0');

  let customInput = createInput('█▓▒░');
  customInput.parent(guiContainer);
  customInput.input(() => {
    controls.customChars = customInput.value();
    updateAsciifier();
  });

  // Threshold Slider
  let thresholdLabel = createP('Threshold:');
  thresholdLabel.parent(guiContainer);
  thresholdLabel.style('margin', '10px 0 2px 0');

  let thresholdSlider = createSlider(0, 255, 128);
  thresholdSlider.parent(guiContainer);
  thresholdSlider.input(() => {
    controls.threshold = thresholdSlider.value();
    updateAsciifier();
  });

  // RGB Effects
  let effectsLabel = createP('Effects:');
  effectsLabel.parent(guiContainer);
  effectsLabel.style('margin', '10px 0 2px 0');

  let redCheckbox = createCheckbox('Red Channel', false);
  redCheckbox.parent(guiContainer);
  redCheckbox.changed(() => {
    controls.redEffect = redCheckbox.checked();
    updateAsciifier();
  });

  let greenCheckbox = createCheckbox('Green Channel', false);
  greenCheckbox.parent(guiContainer);
  greenCheckbox.changed(() => {
    controls.greenEffect = greenCheckbox.checked();
    updateAsciifier();
  });

  let blueCheckbox = createCheckbox('Blue Channel', false);
  blueCheckbox.parent(guiContainer);
  blueCheckbox.changed(() => {
    controls.blueEffect = blueCheckbox.checked();
    updateAsciifier();
  });

  let invertCheckbox = createCheckbox('Invert', false);
  invertCheckbox.parent(guiContainer);
  invertCheckbox.changed(() => {
    controls.invertEffect = invertCheckbox.checked();
    updateAsciifier();
  });

  let posterizeCheckbox = createCheckbox('Posterize', false);
  posterizeCheckbox.parent(guiContainer);
  posterizeCheckbox.changed(() => {
    controls.posterizeEffect = posterizeCheckbox.checked();
    updateAsciifier();
  });
}

function updateAsciifier() {
  if (!asciifier) return;

  // Apply grid size
  asciifier.grid(controls.gridSize, controls.gridSize);

  // Apply character settings
  if (controls.charMode === 'fixed') {
    asciifier.characters(controls.customChars);
  } else {
    asciifier.characters('█▓▒░'); // Default sampled characters
  }

  // Apply threshold
  asciifier.threshold(controls.threshold);

  // Apply effects
  let effects = [];
  if (controls.redEffect) effects.push('red');
  if (controls.greenEffect) effects.push('green');
  if (controls.blueEffect) effects.push('blue');
  if (controls.invertEffect) effects.push('invert');
  if (controls.posterizeEffect) effects.push('posterize');

  // Note: The exact API for effects might vary, this is a placeholder
  // You may need to adjust based on p5.asciify documentation
}

// Called automatically after p5.js `setup()`
// to set up the rendering pipeline(s)
function setupAsciify() {
  // Fetch relevant objects from the library
  asciifier = p5asciify.asciifier();
  customRenderer = asciifier
    .renderers() // get the renderer manager
    .get("custom2D"); // get the "custom" renderer

  asciifier
    .renderers() // get the renderer manager
    .get("brightness") // get the brightness renderer
    .disable(); // disable the renderer

  customRenderer.enable(); // enable the custom renderer

  characterFramebuffer = customRenderer.characterFramebuffer;
  primaryColorFramebuffer = customRenderer.primaryColorFramebuffer;
  secondaryColorFramebuffer = customRenderer.secondaryColorFramebuffer;
  rotationFramebuffer = customRenderer.rotationFramebuffer;
  transformFramebuffer = customRenderer.transformFramebuffer;

  // Apply initial settings
  updateAsciifier();
}

function draw() {
  // Draw camera feed to the main canvas (this will be processed by asciify)
  push();
  translate(-width/2, -height/2);
  image(capture, 0, 0, width, height);
  pop();

  // Now draw to the custom framebuffers for asciify effects
  characterFramebuffer.begin();
  if (controls.charMode === 'sampled') {
    // Sample characters from camera
    push();
    translate(-characterFramebuffer.width/2, -characterFramebuffer.height/2);
    image(capture, 0, 0, characterFramebuffer.width, characterFramebuffer.height);
    pop();
  } else {
    // Use fixed character color
    let c = color(controls.fixedCharColor);
    background(red(c), green(c), blue(c));
  }
  characterFramebuffer.end();

  primaryColorFramebuffer.begin();
  if (controls.charMode === 'sampled') {
    push();
    translate(-primaryColorFramebuffer.width/2, -primaryColorFramebuffer.height/2);
    image(capture, 0, 0, primaryColorFramebuffer.width, primaryColorFramebuffer.height);
    pop();
  } else {
    let c = color(controls.fixedCharColor);
    background(red(c), green(c), blue(c));
  }
  primaryColorFramebuffer.end();

  secondaryColorFramebuffer.begin();
  if (controls.bgMode === 'sampled') {
    push();
    translate(-secondaryColorFramebuffer.width/2, -secondaryColorFramebuffer.height/2);
    image(capture, 0, 0, secondaryColorFramebuffer.width, secondaryColorFramebuffer.height);
    pop();
  } else {
    let c = color(controls.fixedBgColor);
    background(red(c), green(c), blue(c));
  }
  secondaryColorFramebuffer.end();

  rotationFramebuffer.begin();
  background("rgb(25%, 0%, 0%)");
  rotationFramebuffer.end();

  transformFramebuffer.begin();
  // Draw the camera feed as base
  push();
  translate(-transformFramebuffer.width/2, -transformFramebuffer.height/2);
  image(capture, 0, 0, transformFramebuffer.width, transformFramebuffer.height);
  pop();

  // Add visual effects based on checkboxes
  if (controls.redEffect) {
    push();
    translate(-transformFramebuffer.width/2, -transformFramebuffer.height/2);
    tint(255, 0, 0, 150); // Red tint
    image(capture, 0, 0, transformFramebuffer.width, transformFramebuffer.height);
    noTint();
    pop();
  }

  if (controls.greenEffect) {
    push();
    translate(-transformFramebuffer.width/2, -transformFramebuffer.height/2);
    tint(0, 255, 0, 150); // Green tint
    image(capture, 0, 0, transformFramebuffer.width, transformFramebuffer.height);
    noTint();
    pop();
  }

  if (controls.blueEffect) {
    push();
    translate(-transformFramebuffer.width/2, -transformFramebuffer.height/2);
    tint(0, 0, 255, 150); // Blue tint
    image(capture, 0, 0, transformFramebuffer.width, transformFramebuffer.height);
    noTint();
    pop();
  }

  if (controls.invertEffect) {
    filter(INVERT);
  }

  if (controls.posterizeEffect) {
    filter(POSTERIZE, 4);
  }

  // Add a rotating cube overlay
  push(); // Save current transformation state
  translate(-transformFramebuffer.width / 4, 0, 0); // Move to center-left
  rotateX(frameCount * 0.01); // Rotate around X axis
  rotateY(frameCount * 0.02); // Rotate around Y axis
  fill(255, 100, 150, 150); // Pink color with transparency
  stroke(255); // White outline
  strokeWeight(2);
  box(100); // Draw a cube with side length 100
  pop(); // Restore transformation state

  transformFramebuffer.end();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
