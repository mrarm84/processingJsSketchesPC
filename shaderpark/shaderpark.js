let sdf;
let mic;
let gamepadIndex = null;
let bulbPower = 8.0;
let angleX = 0;
let angleY = 0;
let smoothedLevel = 0;
let aberrationActive = false;

function setup() {
  createCanvas(512, 512, WEBGL);

  sdf = createShaderPark(() => {
    let power = input();       // from JS: reactive fractal power
    let pulse = input();       // from JS: mic volume
    let aberration = input();  // from JS: chromatic aberration toggle

    function mandelbulb(p, tm) {
      let iterations = 20;
      let z = p;
      let dr = 1.0;
      let r = 0.0;
      for (let i = 0; i < iterations; i++) {
        r = length(z);
        if (r > 2.0) break;
        let theta = acos(z.z / r);
        let phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;
        let zr = pow(r, power);
        theta *= power;
        phi *= power;
        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + p;
      }
      return 0.5 * log(r) * r / dr;
    }

    setMaxIterations(10);
    setStepSize(0.005);
    let p = getSpace();
    let d = mandelbulb(p, time);
    let ray = getRayDirection();

    let chroma = aberration > 0.5 ? sin(p.x * 10.0 + time) * 0.2 * pulse : 0.0;

    color(
      normalize(ray).x + chroma,
      normalize(ray).y - chroma,
      normalize(ray).z
    );

    setSDF(d);
  });

  mic = new p5.AudioIn();
  mic.start();

  window.addEventListener("gamepadconnected", (e) => {
    gamepadIndex = e.gamepad.index;
    console.log("Gamepad connected:", e.gamepad.id);
  });

  window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected");
    gamepadIndex = null;
  });
}

function draw() {
  clear();

  let micLevel = mic.getLevel();
  smoothedLevel = lerp(smoothedLevel, micLevel, 0.05);
  let pulse = constrain(map(smoothedLevel, 0, 0.3, 0.0, 1.0), 0.0, 1.0);
  let audioBoost = map(pulse, 0, 1, 0.8, 1.5);

  if (gamepadIndex !== null) {
    const gp = navigator.getGamepads()[gamepadIndex];
    if (gp) {
      // Log button presses
      gp.buttons.forEach((btn, i) => {
        if (btn.pressed) {
          console.log(`Button ${i} pressed`);
        }
      });

      // Log axis values
      gp.axes.forEach((axis, i) => {
        console.log(`Axis ${i}: ${axis.toFixed(2)}`);
      });

      // Use left stick X to control bulb power
      bulbPower = map(gp.axes[0], -1, 1, 4.0, 12.0);

      // Toggle chromatic aberration with Circle (Button 1)
      aberrationActive = gp.buttons[1].pressed;
    }
  }

  let reactivePower = bulbPower * audioBoost;

  angleX += 0.01;
  angleY += 0.015;
  rotateX(angleX);
  rotateY(angleY);

  sdf.shader.setUniform("power", reactivePower);
  sdf.shader.setUniform("pulse", pulse);
  sdf.shader.setUniform("aberration", aberrationActive ? 1.0 : 0.0);
  orbitControl();
  sdf.draw();
}
