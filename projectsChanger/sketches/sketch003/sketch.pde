// Generative art parameters
let shapeCount = 50;
let baseSize = 50;
let rotationSpeed = 0.01;
let colorShift = 2;
let expansion = 1.5;

let shapes = [];
let hueBase = 0;

void setup() {
    size(window.innerWidth, window.innerHeight);
    colorMode(HSB, 360, 100, 100);
    
    for (let i = 0; i < shapeCount; i++) {
        shapes.push(new GenShape());
    }
}

void draw() {
    background(0, 0, 0, 10);
    
    hueBase += colorShift * 0.1;
    
    for (let shape of shapes) {
        shape.update();
        shape.display();
    }
}