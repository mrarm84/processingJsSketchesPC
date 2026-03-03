// Wave parameters
let waveCount = 5;
let amplitude = 100;
let frequency = 0.01;
let speed = 0.02;
let pointCount = 200;

let waves = [];

void setup() {
    size(window.innerWidth, window.innerHeight);
    background(30);
    
    for (let i = 0; i < waveCount; i++) {
        waves.push(new Wave(i));
    }
}

void draw() {
    background(30, 30, 30, 20);
    
    for (let wave of waves) {
        wave.update();
        wave.display();
    }
}