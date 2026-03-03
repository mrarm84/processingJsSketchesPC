////////////////////////////////////////////////
class Element {
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
        this.angleXAccel = props.angleXAccel ?? 0.01;
        this.angleYAccel = props.angleYAccel ?? 0.01;
        this.angleZAccel = props.angleZAccel ?? 0.01;

        this.amplitude = 850;
        this.phaseShiftY = random(-PI, PI);
        this.targetH = random(500, 1000);
    }

    run = () => {
        if (!this.isDisplay) return;
        push();
        this.originY = this.amplitude * cos(frameCount * 0.01 + this.phaseShiftY) + this.targetH;
        translate(this.originX, this.originY, this.originZ);
        scale(this.scaleX, this.scaleY, this.scaleZ);
        box(this.w, this.h, this.d);
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
        this.angleXAccel = props.angleXAccel ?? random(-0.01, 0.01);
        this.angleYAccel = props.angleYAccel ?? random(-0.01, 0.01);
        this.angleZAccel = props.angleZAccel ?? random(-0.01, 0.01);

        this.elements = [];
        this.repeatX = props.repeatX || 13;
        this.repeatY = props.repeatY || 13;
        this.repeatZ = props.repeatZ || 13;
        this.elementW = 100;
        this.elementH = 100;
        this.elementD = 100;
        this.stepX = this.elementW;
        this.stepY = this.elementH;
        this.stepZ = this.elementD;
        this.offsetX = - (this.repeatX * this.stepX) / 2 + this.stepX / 2;
        this.offsetY = - (this.repeatY * this.stepY) / 2 + this.stepY / 2;
        this.offsetZ = - (this.repeatZ * this.stepZ) / 2 + this.stepZ / 2;

        for (var k = 0; k < this.repeatZ; k++) {
            for (var j = 0; j < this.repeatY; j++) {
                for (var i = 0; i < this.repeatX; i++) {
                    const element = new Element({
                        originX: i * this.stepX + this.offsetX,
                        originY: j * this.stepY + this.offsetY,
                        originZ: k * this.stepZ + this.offsetZ,
                        w: 100,
                        h: random(100, 1000),
                        d: 100,
                        radius: 100,
                        angleX: getRandomStepAngleInRadians(4, 0, TWO_PI),
                        angleY: getRandomStepAngleInRadians(4, 0, TWO_PI),
                        angleZ: getRandomStepAngleInRadians(4, 0, TWO_PI),
                        angleXAccel: random(-0.01, 0.01),
                        angleYAccel: random(-0.01, 0.01),
                        angleZAccel: random(-0.01, 0.01),
                    })
                    this.elements.push(element)
                }
            }
        }
    }

    run = () => {
        if (!this.isDisplay) return;
        push();
        translate(this.originX, this.originY, this.originZ);
        scale(this.scaleX, this.scaleY, this.scaleZ);
        rotateX(this.angleX);
        rotateY(this.angleY);
        rotateZ(this.angleZ);
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            element.run();
        }
        pop();
    }
}
