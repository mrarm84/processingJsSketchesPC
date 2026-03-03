////////////////////////////////////////////////
class Element2 {
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
        this.thickness = props.thickness ?? 1;
        this.colors = props.colors ?? palette.colors.slice();
        this.gradientShader = new LightingGradientShader2()
        this.gradientShader.setColors(this.colors);
        this.gradientShader.setGradientType(0);
        this.gradientShader.setAnimationType(5);
        this.gradientShader.setAngle(0);
        this.gradientShader.setSpeed(random(0.1, 0.5));
        this.gradientShader.setAlpha(1);
         this.gradientShader.setAmbientStrength(1);
         this.gradientShader.setDiffuseStrength(1);
    }

    run = () => {
        if (!this.isDisplay) return;
        push();
        translate(this.originX, this.originY, this.originZ);
        scale(this.scaleX, this.scaleY, this.scaleZ);
        this.gradientShader.apply();
        push();
        translate(this.x, this.y, this.z);
        this.angleX += this.angleXAccel;
        this.angleY += this.angleYAccel;
        this.angleZ += this.angleZAccel;
        rotateX(this.angleX);
        rotateY(this.angleY);
        rotateZ(this.angleZ);
        push();
        cylinder(this.radius, this.thickness, 20, 10, true, true);
        pop();
        pop();
        resetShader();
        pop();
    }

    updateColors(colors) {
        this.colors = colors;
        this.gradientShader.setColors(this.colors);
    }
}

////////////////////////////////////////////////
class Motif2 {
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
        this.angleZAccel = props.angleZAccel ?? -0.005;

        this.elements = [];
        this.maxLevel = 1;
        this.randomDepthMode = true;
        this.depthVariation = 4;
        const side = 1000;
        const bgElement = new Element2({
            id: this.elements.length,
            originX: 0,
            originY: 0,
            originZ: 0,
            x: 0,
            y: 0,
            z: 0,
            thickness: 100,
            baseSize: side,
            angleX: PI/2,
        });
        this.elements.push(bgElement);
        this.drawHexaflake(this.maxLevel, this.maxLevel, 0, 0, side, false);
    }

    drawHexaflake(level, maxLevels, x, y, side, rotated) {
        const degrees60 = PI * 60 / 180;
        let angle = PI / 6;
        if (rotated) {
            angle += PI;
        }
        if (level === 0) {
            const element = new Element2({
                id: this.elements.length,
                originX: 0,
                originY: 0,
                originZ: 0,
                x: x,
                y: y,
                z: 0,
                thickness: random(10, 400),
                baseSize: side,
                angleX: PI/2,
                angleYAccel: 0,
            });
            this.elements.push(element);
        }

        if (level > 0) {
            const scaleFactor = 1 / 3;
            const newSide = side * scaleFactor;
            const distance = newSide * 2;
            const depthReductions = [];

            if (level === maxLevels && this.randomDepthMode) {
                const maxReduction = Math.min(level - 1, this.depthVariation);
                depthReductions.push(0);
                depthReductions.push(maxReduction);
                for (let j = 0; j < 5; j++) {
                    if (maxReduction <= 1) {
                        depthReductions.push(0);
                    } else {
                        depthReductions.push(Math.floor(Math.random() * (maxReduction - 1)) + 1);
                    }
                }
                for (let j = depthReductions.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    const temp = depthReductions[j];
                    depthReductions[j] = depthReductions[k];
                    depthReductions[k] = temp;
                }
            } else {
                for (let j = 0; j < 7; j++) {
                    depthReductions.push(0);
                }
            }

            const centerDepthReduction = depthReductions[0];
            const centerNextLevel = level - 1 - centerDepthReduction;
            if (centerNextLevel >= 0) {
                this.drawHexaflake(centerNextLevel, maxLevels, x, y, newSide, !rotated);
            } else {
                this.drawHexaflake(0, maxLevels, x, y, newSide, !rotated);
            }

            for (let i = 0; i < 6; i++) {
                const nextX = x + Math.cos(angle) * distance;
                const nextY = y + Math.sin(angle) * distance;
                const depthReduction = depthReductions[i + 1];
                const nextLevel = level - 1 - depthReduction;
                if (nextLevel >= 0) {
                    this.drawHexaflake(nextLevel, maxLevels, nextX, nextY, newSide, rotated);
                } else {
                    this.drawHexaflake(0, maxLevels, nextX, nextY, newSide, rotated);
                }
                angle += degrees60;
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

    updateColors(colors) {
        this.elements.forEach(element => element.updateColors(colors));
    }
}
