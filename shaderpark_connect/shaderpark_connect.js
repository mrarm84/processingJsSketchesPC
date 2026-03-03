let sdf;

function setup() {
  createCanvas(512, 512, WEBGL);
 sdf = createShaderPark(() => {
    let ball1 = input();
    let ball2 = input();
    displace(-0.25,0,0);
    blend(0.1);
    color(1, 0, 0);
    metal(2);
    sphere(ball1);
    displace(0.5, 0.0, 0.0);
    sphere(ball2);
  }
  );
}

function draw() {
    clear();
  ball1 = map(mouseX, 0, width, 0.1, 0.5); 
  ball2 = map(mouseY, 0, height, 0.1, 0.5);
  sdf.shader.setUniform("ball1", ball1);
  sdf.shader.setUniform("ball2", ball2);
  orbitControl();
  sdf.draw();
}
