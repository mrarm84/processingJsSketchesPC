class Wave {
    void Wave(index) {
        this.index = index;
        this.offset = index * (TWO_PI / waveCount);
        this.color = color(
            100 + index * 30,
            150 + index * 20,
            255 - index * 40
        );
    }
    
    void update() {
        this.offset += speed;
    }
    
    void display() {
        stroke(this.color);
        strokeWeight(2);
        noFill();
        
        beginShape();
        for (let i = 0; i <= pointCount; i++) {
            let x = map(i, 0, pointCount, 0, width);
            let y = height / 2 + 
                   sin(x * frequency + this.offset) * amplitude +
                   sin(x * frequency * 2 + this.offset * 1.5) * amplitude * 0.5;
            vertex(x, y);
        }
        endShape();
    }
}