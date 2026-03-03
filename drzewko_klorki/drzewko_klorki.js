// Credit to original designer of the tree: https://openprocessing.org/sketch/1991212
// Hope you enjoy!

// =====================
// Utility functions
// =====================

// Return full canvas width if no value provided, or width scaled by n
function w(n) {
  if (n == null) return width;
  return width * n;
}

// Return full canvas height if no value provided, or height scaled by n
function h(n) {
  if (n == null) return height;
  return height * n;
}

// Shift a color's hue, saturation, and brightness
function hsbShift(col, h, s, b) {
  return color(hue(col) + h, saturation(col) + s, brightness(col) + b);
}

// Return a random positive or negative version of a number
function randNeg(n) {
  return (n == null) ? (random() < 0.5 ? 1 : -1) : (random() < 0.5 ? n : -n);
}

// Easing function to create smoother transitions
function ease(n) {
  return n ** 3;
}

// =====================
// Particle class - handles growth and rendering of tree parts
// =====================
class particle {
  constructor(sx, sy, sc, ss, sd, sl, ls, tag, others) {
    this.tag = tag; // Type: "trunk", "branch", or "twig"
    this.pos = createVector(sx, sy); // Current position of particle
    this.col = sc; // Color of this particle
    this.siz = 1.1; // Current size scale factor
    this.asiz = ss; // Absolute size
    this.dir = sd; // Direction of movement in degrees
    this.spd = (this.tag == "trunk") ? 2 : random(0.25, 2); // Speed (trunk grows faster)
    this.life = sl; // Current lifetime
    this.lifespan = ls; // Maximum lifetime
    this.others = others; // Reference to global particle array
    this.thshift = random(-1, 1) * 0; // Hue shift (currently unused)
    this.tsshift = random(1) * 0; // Saturation shift (currently unused)
    this.tbshift = random(-1) * 0; // Brightness shift (currently unused)
    this.rsiz = this.asiz * this.siz; // Real size based on current scaling
  }

  // Remove particle from global array
  kill() {
    let index = this.others.indexOf(this);
    if (index > -1) {
      this.others.splice(index, 1);
    }
  }

  // Update particle state each frame
  update() {
    // Update real size
    this.rsiz = this.asiz * this.siz;

    // Move particle forward based on direction and speed
    this.pos.add(createVector(
      cos(radians(this.dir)) * this.spd,
      sin(radians(this.dir)) * this.spd
    ));

    // Adjust direction slightly for organic growth movement
    this.dir += random(-0.9, 1) *
      (this.tag == "trunk" && this.siz > 0.7 ?
        1 :
        map(this.life, 0, this.lifespan, 1, 5));

    // Slight random bending (disabled by multiplier *0)
    if (random() < (this.tag == "branch" ? 0.003 : 0.005) && this.tag != "trunk") {
      this.dir += randNeg(72) * 0;
    }

    // Slowly shrink particle size for fade-out effect
    this.siz = lerp(this.siz, 0, random(0.015));

    // Kill particle if too small or too fast
    if (this.rsiz < 0.1 || this.spd > this.rsiz) {
      this.kill();
    }

    // Slight color shifts (effectively disabled)
    if (counter % 50 == 0) {
      if (branchColorOption == 0) {
        branchColorOption = 1
        this.col = 0
      } else {
        branchColorOption = 0
        this.col = 255
      }
    }

    // Grow branches from trunk
    if (random() < 0.03 && this.tag == "trunk" && this.siz < 0.55) {
      this.others.push(new particle(
        this.pos.x, this.pos.y, this.col, this.rsiz,
        this.dir + randNeg(random(15, 30)),
        this.life, this.lifespan, "branch", this.others
      ));
    }

    // Grow more branches from existing branches
    if (random() < 0.01 && this.tag == "branch") {
      this.others.push(new particle(
        this.pos.x, this.pos.y, this.col, this.rsiz,
        this.dir,
        this.life, this.lifespan, "branch", this.others
      ));
    }

    // Grow twigs from small branches
    if (random() < map(this.siz, 0, 0.25, 0.5, 0.3) &&
      this.tag == "branch" && this.siz < 0.25) {
      this.others.push(new particle(
        this.pos.x, this.pos.y, this.col,
        (this.siz ** 0.5) * this.rsiz,
        this.dir + randNeg(random(5, 20)),
        0, random(this.lifespan * 0.05), "twig", this.others
      ));
    }

    // Draw particle
    noStroke();
    fill(this.col);
    circle(this.pos.x, this.pos.y, this.siz * this.asiz);

    // Once lifespan exceeded, draw a line (like grass) and remove particle
    if (this.life > this.lifespan) {
      let chance = round(random(3));
      strokeWeight(random(9));
      if (chance == 0) stroke(255);
      else stroke(0);
      //line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + random(50));
      this.kill();
    }

    // Increment particle's life counter
    this.life++;
  }
}

// =====================
// Globals and setup
// =====================
let PARTS = []; // Array to hold all particles
let count = 2; // Number of initial trunks to grow
let counter = 0
let branchColorOption = 0

function setup() {
  createCanvas(1000, 900); // Create main canvas
  background(255); //  background
  //Creates half background that is black
  fill(0)
  rect(0, height / 2, width, height)
  //creates background of randomly generated black and white boxes
  for (let i = 0; i < 500; i++) 
  {
    let choice = round(random(1))
    if (choice == 0) 
    {
      stroke(0)
      fill(0)
    }
    if (choice == 1) 
    {
      stroke(255)
      fill(255)
    }
    rect(random(width), random(height), random(50), random(50))
  }

  //Creates backgorund colored boxes
  let ypos = 1
  for(let z = 0; z < 4; z++) 
  {
      let xpos = random(20, width)
    for (let i = 0; i < round(random(5,300)); i++) 
    {
      fill(random(255),random(255), random(255))
      noStroke()
      rect(xpos, ypos+(i*10),50,10 )
    }
  }

  // Create initial trunk particles
  for (let i = 0; i < count; i++) {
    PARTS.push(new particle(
      w(0), h(0.1), "#000", // Start in center bottom
      100, 0, 0, 1500, "trunk", PARTS // Direction right, long lifespan
    ));
  }
  fill(0);
  rect(0, height, width, -40); // Draw "ground" rectangle
}

// =====================
// Main draw loop
// =====================
function draw() {
  counter++
  push();
  translate(-250, 100); // Shift scene to left for composition
  // Update and render each particle
  for (let p of PARTS) {
    for (let i = 0; i < 1; i++) p.update();
  }
  pop();
  
  //Creates overlapping colored boxes
  if(counter==900)
  {
    for(let z = 0; z < 4; z++) 
    {
      let ypos = random(200, height)
      for (let i = 0; i < round(random(5,900)); i++) 
      {
        fill(random(255),random(255), random(255))
        noStroke()
        rect(width-(i*10), ypos,10,50)
      }
    }
  }
}

// =====================
// Smooth interpolation helper
// =====================
function smoothstep(start, end, amount) {
  amount = Math.max(0, Math.min(1, amount)); // Clamp value between 0 and 1
  return (amount * amount * (3 - 2 * amount)) * (end - start) + start;
}
