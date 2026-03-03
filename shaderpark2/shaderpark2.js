let sdf;
let mic;
let smoothedLevel = 0;

function setup() {
  createCanvas(512, 512, WEBGL);

  sdf = createShaderPark(() => {
    let scale = 0.7;
    let t = time * 0.2;
    occlusion(0.9);

    let scale2 = 0.9;
    let noiselvl = input(); // audio-reactive distortion

    let n = noiselvl * noise(getSpace() * scale2);
    let ray = getRayDirection();

    for (let i = 0; i < 3; i++) {
      scale *= 0.5;
      mirrorXYZ();
      displace(scale);
      rotateX(-t);
      rotateY(-t);
      rotateZ(t);
    }

    blend(0.2);
    color(ray);
    sphere(scale);
  });
  let selectedDeviceId = 1; // from the list above

//navigator.mediaDevices.getUserMedia({
//  audio: { deviceId: selectedDeviceId }
//}).then(stream => {
//  let audioCtx = getAudioContext();
//  let source = audioCtx.createMediaStreamSource(stream);
//  source.connect(audioCtx.destination); // or connect to FFT, etc.
//});
 //userStartAudio().then(() => {
 //   navigator.mediaDevices.enumerateDevices().then(devices => {
 //     devices.forEach(device => {
 //       if (device.kind === "audioinput" || device.kind === "audiooutput") {
 //         console.log(`${device.kind}: ${device.label || "Unnamed device"}`);
 //       }
 //     });
 //   });
 // });
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic); // Connect mic to FFT
  
}

function draw() {
  clear();
  let micLevel = fft.analyze();
  //let micLevel = mic.getLevel();
  smoothedLevel = lerp(smoothedLevel, micLevel, 0.05);
  let noiselvl = constrain(map(smoothedLevel, 0, 0.3, 0.0, 1.0), 0.0, 1.0);

  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.015);
box(smoothedLevel);

  sdf.shader.setUniform("noiselvl", noiselvl);
  orbitControl();
  sdf.draw();
}
