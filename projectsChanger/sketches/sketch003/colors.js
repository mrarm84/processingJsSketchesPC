// Helper functions for generative art

function randomColor() {
    return color(random(360), random(50, 100), random(70, 100));
}

function createPalette(baseHue) {
    let palette = [];
    for (let i = 0; i < 5; i++) {
        palette.push(color((baseHue + i * 30) % 360, 70 + i * 5, 80 + i * 3));
    }
    return palette;
}