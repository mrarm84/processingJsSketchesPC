p5.disableFriendlyErrors = true;

const title = 'geometry';
let palette = [];
let motif;
let backgroundColor = '#f5f5f5';

function setup() {
    createCanvas(1000, 1000, WEBGL);
    setAttributes('antialias', true);
    setAttributes('depth', true);
    setAttributes('alpha', true);
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
    const d = 1000;
    camera(0, 0, -d, 0, 0, 0, 0, 1, 0);
    ortho(-width, width, -height, height, -10000, 10000);
}

function init() {
    initCamera();
    const orgPalette = getColorScheme('Hokusai');
    palette = repeatPalette(orgPalette, 1);
    motif = new Motif({
        originX: 0,
        originY: 0,
        originZ: 0,
    });
}

function draw() {
    background(palette.colors[0]);
    ambientLight(240);
    shininess(20);
    pointLight(255, 255, 255, 50, -100, 80);
    specularColor(255);
    specularMaterial(255);
    motif.run();
}
