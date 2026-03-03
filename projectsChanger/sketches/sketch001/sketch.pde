// Particle parameters
let particleCount = 100;
let particleSize = 5;
let speed = 2;
let gravity = 0.1;
let friction = 0.99;

let particles = [];

void setup() {
    size(window.innerWidth, window.innerHeight);
    background(20);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

void draw() {
    background(20, 20, 20, 30);
    
    for (let particle of particles) {
        particle.update();
        particle.display();
        particle.checkEdges();
    }
}

class Particle {
    void Particle() {
        this.pos = new PVector(random(width), random(height));
        this.vel = new PVector(random(-speed, speed), random(-speed, speed));
        this.acc = new PVector(0, 0);
        this.color = color(random(100, 255), random(100, 255), random(200, 255));
    }
    
    void update() {
        this.vel.add(this.acc);
        this.vel.mult(friction);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.vel.y += gravity;
    }
    
    void display() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, particleSize * 2);
    }
    
    void checkEdges() {
        if (this.pos.x < 0 || this.pos.x > width) {
            this.vel.x *= -1;
            this.pos.x = constrain(this.pos.x, 0, width);
        }
        if (this.pos.y < 0 || this.pos.y > height) {
            this.vel.y *= -0.8;
            this.pos.y = constrain(this.pos.y, 0, height);
        }
    }
}