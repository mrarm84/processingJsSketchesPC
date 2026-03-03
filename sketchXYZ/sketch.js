let sphereProperties; // Renamed from 'sphere' to avoid conflict with p5.js sphere() function
let orbitingElements = [];
const numOrbitingElements = 20;
let clickScale = 1.2; // Scale factor when clicked

function setup() {
  createCanvas(800, 600, WEBGL);
  colorMode(RGB, 255, 255, 255, 1); // Ensure color mode is set correctly for transparency if needed, though not used here.

  // Sphere properties
  sphereProperties = { // Changed variable name
    radius: 50,
    color: color(10, 10, 10), // Dark black
    shininess: 50
  };

  // Initialize orbiting elements
  for (let i = 0; i < numOrbitingElements; i++) {
    orbitingElements.push({
      angle: random(TWO_PI),
      distance: random(sphereProperties.radius * 2, sphereProperties.radius * 4), // Use renamed object
      type: random() < 0.7 ? 'dot' : 'line', // 70% dots, 30% lines
      size: random(5, 15),
      orbitSpeed: random(0.001, 0.003), // Reduced orbit speed for slower rotation
      scale: 1.0, // Current scale
      originalScale: 1.0 // Base scale
    });
  }
}

function draw() {
  background(0); // Black background

  // Lighting for glossy effect
  ambientLight(60, 60, 60);
  specularMaterial(sphereProperties.color); // Use renamed object
  shininess(sphereProperties.shininess); // Use renamed object

  // Draw the central sphere
  push();
  translate(0, 0, 0);
  sphere(sphereProperties.radius); // Changed function call to use the new object name
  pop();

  // Update angles and draw orbiting elements
  for (let elem of orbitingElements) {
    // Update angle for orbiting
    elem.angle += elem.orbitSpeed;
    if (elem.angle > TWO_PI) {
      elem.angle -= TWO_PI;
    }

    // Calculate position
    let x = cos(elem.angle) * elem.distance;
    let y = sin(elem.angle) * elem.distance;
    // Add slight variation in Z for depth
    let z = sin(elem.angle * 0.5) * elem.distance * 0.3;

    push(); // Save matrix state before transforming the element
    translate(x, y, z);
    scale(elem.scale); // Apply scaling
    // Note: rotateY based on frameCount was removed as elem.angle handles orbit.
    // If elements themselves need to rotate, a separate rotation would be added here.

    // Chromatic Aberration effect
    // Shifting colors towards orange (red shift) and cyan (blue shift)
    let aberrationShiftX = 0.02 * elem.distance * elem.scale;
    let aberrationShiftY = 0.01 * elem.distance * elem.scale;

    // Red channel (shifted left-down)
    push();
    translate(-aberrationShiftX, -aberrationShiftY, 0);
    strokeWeight(elem.type === 'dot' ? elem.size * elem.scale : (elem.size / 5) * elem.scale);
    stroke(255, 0, 0); // Red
    if (elem.type === 'dot') {
      point(0, 0, 0);
    } else {
      line(-elem.size / 2, 0, 0, elem.size / 2, 0, 0);
    }
    pop();

    // Blue channel (shifted right-up)
    push();
    translate(aberrationShiftX, aberrationShiftY, 0);
    strokeWeight(elem.type === 'dot' ? elem.size * elem.scale : (elem.size / 5) * elem.scale);
    stroke(0, 0, 255); // Blue
    if (elem.type === 'dot') {
      point(0, 0, 0);
    } else {
      line(-elem.size / 2, 0, 0, elem.size / 2, 0, 0);
    }
    pop();

    // Center element (neutral gray)
    push();
    strokeWeight(elem.type === 'dot' ? elem.size * elem.scale : (elem.size / 5) * elem.scale);
    stroke(200, 200, 200); // Neutral gray for the core
    if (elem.type === 'dot') {
      point(0, 0, 0);
    } else {
      line(-elem.size / 2, 0, 0, elem.size / 2, 0, 0);
    }
    pop();

    pop(); // Restore matrix state
  }
  // Removed the buggy 'if (isClicked)' block which was causing issues.
  // The scaling is now handled directly in mousePressed().
}

function mousePressed() {
  // Toggle scaling when mouse is pressed
  for (let elem of orbitingElements) {
    if (elem.scale === elem.originalScale) {
      elem.scale = clickScale; // Scale up
    } else {
      elem.scale = elem.originalScale; // Scale down to original
    }
  }
}