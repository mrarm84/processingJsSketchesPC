////////////////////////////////////////////////
class Element {
  constructor(props = {}) {
    this.id = props.id ?? 0;
    this.type = props.type ?? 0;
    this.isDisplay = props.isDisplay ?? true;
    this.originX = props.originX ?? 0;
    this.originY = props.originY ?? 0;
    this.originZ = props.originZ ?? 0;
    this.x = props.x ?? 0;
    this.y = props.y ?? 0;
    this.z = props.z ?? 0;
    if (props.baseSize !== undefined) {
      this.baseSize = props.baseSize;
      this.w = this.baseSize;
      this.h = this.baseSize;
      this.d = this.baseSize;
      this.radius = this.baseSize;
    } else {
      this.w = props.w ?? 100;
      this.h = props.h ?? 100;
      this.d = props.d ?? 100;
      this.radius = props.radius ?? 100;
    }
    this.detailX = props.detailX ?? 1;
    this.detailY = props.detailY ?? 1;
    this.detailZ = props.detailZ ?? 1;
    this.scaleX = props.scaleX ?? 1;
    this.scaleY = props.scaleY ?? 1;
    this.scaleZ = props.scaleZ ?? 1;
    this.angleX = props.angleX ?? 0;
    this.angleY = props.angleY ?? 0;
    this.angleZ = props.angleZ ?? 0;
    this.tubeRadius = props.tubeRadius ?? 10;
    this.angleXAccel = props.angleXAccel ?? 0.0;
    this.angleYAccel = props.angleYAccel ?? 0.0;
    this.angleZAccel = props.angleZAccel ?? 0.0;
    this.angleYMin = props.angleYMin ?? -PI/18;
    this.angleYMax = props.angleYMax ?? PI/18;
    this.angleYSpeed = props.angleYSpeed ?? 0.02;
    this.angleYTime = props.angleYTime ?? random(TWO_PI);
    this.colors = props.colors ?? palette.colors.slice();
    this.colors = shuffleArray(this.colors);
    this.gradientShader = new LightingGradientShader()
    this.gradientShader.setColors(this.colors);
    this.gradientShader.setGradientType(0);
    this.gradientShader.setAnimationType(5);
    this.gradientShader.setAngle(random(TWO_PI));
    this.gradientShader.setSpeed(random(0.1, 0.5));
    this.gradientShader.setAlpha(1);
    this.gradientShader.setAmbientStrength(1);
    this.gradientShader.setDiffuseStrength(1);
    this.amplitudeSize = random(50, 300)
  }

  run = () => {
    if (!this.isDisplay) return;
    push();
    const mount = sin(frameCount * 0.02 + this.id * 0.1) * this.amplitudeSize;
    if (Math.abs(mount) <= 0.5) {
      this.amplitudeSize = random(50, 300);
    }
    translate(this.originX, this.originY + mount, this.originZ);
    scale(this.scaleX, this.scaleY, this.scaleZ);
    this.angleY += this.angleYAccel;
    rotateX(this.angleX);
    rotateY(this.angleY);
    rotateZ(this.angleZ);
    this.gradientShader.apply();
    cylinder(this.w, this.h, 5, 5, false, false); 
    resetShader();
    pop();
  }
}

////////////////////////////////////////////////
class Motif {
  constructor(props = {}) {
    this.id = props.id ?? 0;
    this.isDisplay = props.isDisplay ?? true;
    this.originX = props.originX ?? 0;
    this.originY = props.originY ?? 0;
    this.originZ = props.originZ ?? 0;
    this.x = props.x ?? 0;
    this.y = props.y ?? 0;
    this.z = props.z ?? 0;
    if (props.baseSize !== undefined) {
      this.baseSize = props.baseSize;
      this.w = this.baseSize;
      this.h = this.baseSize;
      this.d = this.baseSize;
      this.radius = this.baseSize;
    } else {
      this.w = props.w ?? 100;
      this.h = props.h ?? 100;
      this.d = props.d ?? 100;
      this.radius = props.radius ?? 100;
    }
    this.detailX = props.detailX ?? 1;
    this.detailY = props.detailY ?? 1;
    this.detailZ = props.detailZ ?? 1;
    this.scaleX = props.scaleX ?? 1;
    this.scaleY = props.scaleY ?? 1;
    this.scaleZ = props.scaleZ ?? 1;
    this.angleX = props.angleX ?? 0;
    this.angleY = props.angleY ?? 0;
    this.angleZ = props.angleZ ?? 0;
    this.tubeRadius = props.tubeRadius ?? 10;
    this.angleXAccel = props.angleXAccel ?? 0.0;
    this.angleYAccel = props.angleYAccel ?? 0.0;
    this.angleZAccel = props.angleZAccel ?? 0.0;
    
    this.elements = [];
    this.repeatX = props.repeatX || 1;
    this.repeatY = props.repeatY || 18;
    this.repeatZ = props.repeatZ || 1;
    this.elementW = 200;
    this.elementH = 100;
    this.elementD = 200;
    this.stepX = this.elementW;
    this.stepY = this.elementH;
    this.stepZ = this.elementD;
    this.offsetX = - (this.repeatX * this.stepX) / 2 + this.stepX / 2;
    this.offsetY = - (this.repeatY * this.stepY) / 2 + this.stepY / 2;
    this.offsetZ = - (this.repeatZ * this.stepZ) / 2 + this.stepZ / 2;
    let elementId = 0;
    for (var k = 0; k < this.repeatZ; k++) {
      for (var j = 0; j < this.repeatY; j++) {
        for (var i = 0; i < this.repeatX; i++) {
          const posX = i * this.stepX + this.offsetX;
          const posY = j * this.stepY + this.offsetY;
          const posZ = k * this.stepZ + this.offsetZ;
          const element = new Element({
            id: elementId,
            type: 0,
            isDisplay: true,
            originX: posX,
            originY: posY,
            originZ: posZ,
            w: random(50, 1000), 
            h: random(100, 700),
            d: random(100, 700),
            angleYAccel: random(-0.02, 0.02),
          })
          this.elements.push(element)
          elementId++;
        }
      }
    }
  }


  run = () => {
    if (!this.isDisplay) return;
    push();
    translate(this.originX, this.originY, this.originZ);
    scale(this.scaleX, this.scaleY, this.scaleZ);
    this.angleX += this.angleXAccel;
    this.angleY += this.angleYAccel;
    this.angleZ += this.angleZAccel;
    rotateX(this.angleX);
    rotateY(this.angleY);
    rotateZ(this.angleZ);
    const sortedElements = [...this.elements].sort((a, b) => {
      const aZ = a.originZ + a.id * 0.001;
      const bZ = b.originZ + b.id * 0.001;
      return aZ - bZ;
    });
    for (let i = 0; i < sortedElements.length; i++) {
      const element = sortedElements[i];
      element.run();
    }
    pop();
  }
}
