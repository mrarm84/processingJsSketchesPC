////////////////////////////////////////////////
class Element3 {
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
        this.text = props.text || "A";
        this.textSize = props.textSize || 500;
        this.colors = props.colors ?? palette.colors.slice();
        this.colors = shuffleArray(this.colors);
        this.gradientShader = new LightingGradientShader3()
        this.gradientShader.setColors(this.colors);
        this.gradientShader.setGradientType(0);
        this.gradientShader.setAnimationType(5);
        this.gradientShader.setAngle(random(TWO_PI));
        this.gradientShader.setSpeed(0.2);
        this.gradientShader.setAlpha(1);
        this.gradientShader.setAmbientStrength(1.2);
        this.gradientShader.setDiffuseStrength(0.3);
    this.amplitudeSize = random(10, 30);
  }

  updateColors = (colors) => {
    this.colors = colors;
    this.gradientShader.setColors(this.colors);
  }

  run = () => {
        if (!this.isDisplay) return0
        push();
        let mount = sin(frameCount * 0.05 + this.id * 0.1) * this.amplitudeSize + this.amplitudeSize;
        if (mount <= 0.5) {
            this.amplitudeSize = random(10, 30);
        }
        translate(this.originX + mount, this.originY, this.originZ );
        scale(this.scaleX + mount * 0.005, this.scaleY, this.scaleZ);
        this.angleX += this.angleXAccel;
        this.angleY += this.angleYAccel;
        this.angleZ += this.angleZAccel;
        rotateX(this.angleX);
        rotateY(this.angleY);
        rotateZ(this.angleZ);
        drawTextWithGradient(this.gradientShader, this.text, this.textSize);
        resetShader();
        pop();
    }
}

////////////////////////////////////////////////
class Motif3 {
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
        this.text = props.text || "A";
        this.textSize = props.textSize || 500;
        this.tubeRadius = props.tubeRadius ?? 10;
        this.angleXAccel = props.angleXAccel ?? 0;
        this.angleYAccel = props.angleYAccel ?? 0;
        this.angleZAccel = props.angleZAccel ?? 0;
        this.elementW = 500;
        this.elements = [];
        let element = new Element3({
            originX: this.elementW / 3,
            originY: 0,
            originZ: 0.0,
            text: this.text,
            scaleX: 1,
            scaleY: 1,
            textSize: this.textSize,
            angleXAccel: this.angleXAccel,
            angleYAccel: this.angleYAccel,
            angleZAccel: this.angleZAccel,
        })
        this.elements.push(element);
  }

  updateColors = (colors) => {
    this.elements.forEach(element => element.updateColors(colors));
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

////////////////////////////////////////////////
class Module3 {
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
        this.angleXAccel = props.angleXAccel ?? 0;
        this.angleYAccel = props.angleYAccel ?? 0;
        this.angleZAccel = props.angleZAccel ?? 0;
        this.motifs = [];
        const texts = ['A', 'B ', 'C'];
        this.repeatX = 12;
        this.repeatY = 3;
        this.elementH = 265;
        this.stepX = 200;
        this.stepY = this.elementH;
        this.offsetX = - (this.repeatX * this.stepX) / 2 + this.stepX / 2;
        this.offsetY = - (this.repeatY * this.stepY) / 2 + this.stepY / 2;
        for (var j = 0; j < this.repeatY; j++) {
            for (var i = 0; i < this.repeatX; i++) {
                const posX = i * this.stepX + this.offsetX;
                const posY = j * this.stepY + this.offsetY;
                const motif = new Motif3({
                    w: this.motifW,
                    h: this.motifH,
                    elementW: this.elementW,
                    elementH: this.elementH,
                    originX: posX,
                    originY: posY - 50,
                    originZ: 0,
                    text: texts[j],
                    textSize: 440,
                    scaleY: 0.5,
                    angleY: (TWO_PI / this.repeatX) * i,
                    angleXAccel: 0,
                    angleYAccel: 0.01 + i * 0.0001,
                    angleZAccel: 0,
                })
        this.motifs.push(motif)
      }
    }
  }

  updateColors = (colors) => {
    this.motifs.forEach(motif => motif.updateColors(colors));
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
        const sortedMotifs = [...this.motifs].sort((a, b) => {
            const aZ = a.originZ + a.id * 0.001;
            const bZ = b.originZ + b.id * 0.001;
            return aZ - bZ;
        });

        for (let i = 0; i < sortedMotifs.length; i++) {
            const motif = sortedMotifs[i];
            motif.run();
        }
        pop();
    }
}
