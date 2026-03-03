p5.disableFriendlyErrors = true;

let palette2 = [];
let motif2;
let backgroundColor2 = '#ffffff';
let rotationX3 = 0;
let rotationY3 = 0;
let timeFactor3 = 1;
let paletteIndex3 = 1;
let prevLB3 = false;
let prevRB3 = false;

function sketch2Setup() {
    init2();
}

function initCamera2() {
    ortho(-width, width, -height, height, -10000, 10000);
    const d = 1000;
    camera(d, -d * 0.15, d, 0, 0, 0, 0, 1, 0);
}

function init2() {
    initCamera2();
    const orgPalette = getColorSchemeByIndex(paletteIndex3);
    palette2 = repeatPalette(orgPalette, 1);
    let palette = palette2; // for Element2
    motif2 = new Motif2({
        originX: 0,
        originY: 0,
        originZ: 0,
    });
}

let rotationX2 = 0;
function pollGamepad3() {
    const gp = navigator.getGamepads()[0];
    if (!gp) return;

    // Left stick → rotation
    const lx = gp.axes[0]; // -1..1
    const ly = gp.axes[1];
    rotationY3 += lx * 0.05; // yaw
    rotationX3 += ly * 0.05; // pitch

    // Right stick → time modulation
    const rx = gp.axes[2];
    timeFactor3 += rx * 0.01;

    // Left bumper → cycle palette
    const lb = gp.buttons[4].pressed;
    if (lb && !prevLB3) {
        paletteIndex3 = (paletteIndex3 + 1) % colorScheme.length;
        const newPalette = getColorSchemeByIndex(paletteIndex3);
        palette2 = repeatPalette(newPalette, 1);
        let palette = palette2; // update global for new elements
        motif2.updateColors(palette.colors);
    }
    prevLB3 = lb;
}

function sketch2Draw() {
    background(backgroundColor2);
    orbitControl();
      rotateX(rotationX3);
   rotateY(rotationY3);
    motif2.run()
    pollGamepad3();
    resetShader();
}

window.sketch2Setup = sketch2Setup;
window.sketch2Draw = sketch2Draw;
