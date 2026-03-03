class GenShape {
    void GenShape() {
        this.pos = new PVector(random(width), random(height));
        this.size = baseSize + random(-10, 10);
        this.angle = random(TWO_PI);
        this.rotationDir = random() > 0.5 ? 1 : -1;
        this.hueOffset = random(-30, 30);
        this.sides = floor(random(3, 8));
    }
    
    void update() {
        this.angle += rotationSpeed * this.rotationDir;
        this.size += sin(frameCount * 0.01 + this.hueOffset) * expansion;
    }
    
    void display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);
        
        let hue = (hueBase + this.hueOffset) % 360;
        fill(hue, 80, 90, 0.7);
        stroke(hue, 90, 100);
        strokeWeight(2);
        
        beginShape();
        for (let i = 0; i < this.sides; i++) {
            let angle = map(i, 0, this.sides, 0, TWO_PI);
            let x = cos(angle) * this.size;
            let y = sin(angle) * this.size;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        pop();
    }
}