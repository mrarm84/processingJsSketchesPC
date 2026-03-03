p5.disableFriendlyErrors = true;

let sketches = {};
let currentSketchIndex = 0;
let loadedSketches = 0;
let blurShader;
let morphProgress = 0;
let morphing = false;
let prevSketchIndex = 0;

// Function to load scripts dynamically
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

let loadedDeps = 0;
const totalDeps = 4;

function preload() {
    // Load additional dependencies not in index.html
    loadScript('./lightShader2.js', () => { loadedDeps++; checkAllLoaded(); });
    loadScript('./pattern2.js', () => { loadedDeps++; checkAllLoaded(); });
    loadScript('./lightShader3.js', () => { loadedDeps++; checkAllLoaded(); });
    loadScript('./pattern3.js', () => { loadedDeps++; checkAllLoaded(); });
}

function checkAllLoaded() {
    if (loadedDeps === totalDeps) {
        // Now load sketches
        loadScript('./sketch1.js', () => {
            sketches[0] = { setup: window.sketch1Setup, draw: window.sketch1Draw };
            loadedSketches++;
            if (loadedSketches === 3) initializeCurrentSketch();
        });
        loadScript('./sketch2.js', () => {
            sketches[1] = { setup: window.sketch2Setup, draw: window.sketch2Draw };
            loadedSketches++;
            if (loadedSketches === 3) initializeCurrentSketch();
        });
        loadScript('./sketch3.js', () => {
            sketches[2] = { setup: window.sketch3Setup, draw: window.sketch3Draw };
            loadedSketches++;
            if (loadedSketches === 3) initializeCurrentSketch();
        });
    }
}

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
}

function initializeCurrentSketch() {
    if (sketches[currentSketchIndex]) {
        sketches[currentSketchIndex].setup();
    }
}

function draw() {
    if (sketches[currentSketchIndex]) {
        sketches[currentSketchIndex].draw();
    }

    // Poll for right bumper to switch sketch
    pollSwitch();
}

function pollSwitch() {
    const gp = navigator.getGamepads()[0];
    if (!gp) return;
    const rb = gp.buttons[5].pressed; // Right bumper
    if (rb && !prevRB_switch) {
        currentSketchIndex = (currentSketchIndex + 1) % 3;
        if (sketches[currentSketchIndex]) {
            sketches[currentSketchIndex].setup();
        }
    }
    prevRB_switch = rb;
}

function blendDraw() {
    // Simple blend: draw both with alpha
    push();
    tint(255, (1 - morphProgress) * 255);
    sketches[prevSketchIndex].draw();
    pop();
    push();
    tint(255, morphProgress * 255);
    sketches[currentSketchIndex].draw();
    pop();
}

let prevRB_switch = false;
