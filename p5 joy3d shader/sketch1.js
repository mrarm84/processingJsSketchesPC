p5.disableFriendlyErrors = true;

const title = 'geometry';
let palette = [];
let motif;
let backgroundColor = '#f5f5f5';
let gradientShader;
let paletteIndex = 0;
let prevLB = false;

function sketch1Setup() {
    init1();
}

function initCamera1() {
    ortho(-width, width, -height, height, -10000, 10000);
    const d = 1000;
    camera(d, -d * 0.15, d, 0, 0, 0, 0, 1, 0);
}

function init1() {
    initCamera1();
    const orgPalette = getColorSchemeByIndex(paletteIndex);
    palette = repeatPalette(orgPalette, 1);
    gradientShader = new GradientShader(vertShader, flexibleFragShader);
    gradientShader.setColorsFromPalette(palette);
    gradientShader.setGradientType(0);
    gradientShader.setAnimationType(5);
    gradientShader.setSpeed(1);
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

    // Left bumper → cycle palette
    const lb = gp.buttons[4].pressed;
    if (lb && !prevLB) {
        paletteIndex = (paletteIndex + 1) % colorScheme.length;
        const newPalette = getColorSchemeByIndex(paletteIndex);
        palette = repeatPalette(newPalette, 1);
        gradientShader.setColorsFromPalette(palette);
    }
    prevLB = lb;
}

function sketch1Draw() {
    background(backgroundColor);
    orbitControl();
    gradientShader.apply();
      rotateX(rotationX);
  rotateY(rotationY);
    motif.run()
    pollGamepad();
    resetShader();
}

window.sketch1Setup = sketch1Setup;
window.sketch1Draw = sketch1Draw;