p5.disableFriendlyErrors = true;

const title3 = 'geometry3';
let palette3 = [];
let module3;
let backgroundColor3 = '#f5f5f5';

async function preload() {
    window.font = loadFont("./BodoniModa_18pt-Black.ttf");
}
function sketch3Setup() {
    init3();
}

function initCamera3() {
    ortho(-width, width, -height, height, -10000, 10000);
    const d = 1000;
    camera(d, -d * 0.15, d, 0, 0, 0, 0, 1, 0);
}

function init3() {
    initCamera3();
    const orgPalette = getColorSchemeByIndex(1);
    palette3 = repeatPalette(orgPalette, 1);
    palette = palette3; // for Element3
    module3 = new Module3({
        originX: 0,
        originY: 0,
        originZ: 0,
    });
}

let rotationX33 = 0;
let rotationY33 = 0;
let timeFactor33 = 1;
let paletteIndex33 = 0;
let prevLB33 = false;
let prevRB33 = false;

function pollGamepad3() {
    const gp = navigator.getGamepads()[0];
    if (!gp) return;

    // Left stick → rotation
    const lx = gp.axes[0]; // -1..1
    const ly = gp.axes[1];
    rotationY33 += lx * 0.05; // yaw
    rotationX33 += ly * 0.05; // pitch

    // Right stick → time modulation
    const rx = gp.axes[2];
    timeFactor33 += rx * 0.01;

    // Left bumper → cycle palette
    const lb = gp.buttons[4].pressed;
    if (lb && !prevLB33) {
        paletteIndex33 = (paletteIndex33 + 1) % colorScheme.length;
        const newPalette = getColorSchemeByIndex(paletteIndex33);
        palette3 = repeatPalette(newPalette, 1);
        palette = palette3; // update global palette
        module3.updateColors(palette.colors);
    }
    prevLB33 = lb;
}

function sketch3Draw() {
    background(backgroundColor3);
    orbitControl();
      rotateX(rotationX33);
    rotateY(rotationY33);
    module3.run()
    pollGamepad3();
    resetShader();
}

window.sketch3Setup = sketch3Setup;
window.sketch3Draw = sketch3Draw;
