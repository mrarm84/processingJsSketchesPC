const lightingVertShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vPosition;

void main() {
  vTexCoord = aTexCoord;
  vNormal = normalize(uNormalMatrix * aNormal);
  
  vec4 worldPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  vPosition = worldPosition.xyz;
  
  gl_Position = uProjectionMatrix * worldPosition;
}
`;

// ライティング対応のフラグメントシェーダー
const lightingFragShader = `
#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vPosition;

uniform float uTime;
uniform float uGradientType;
uniform float uAnimationType;
uniform float uSpeed;
uniform float uAngle;
uniform float uScale;
uniform float uStripeWidth;
uniform float uStripeCount;
uniform int uColorCount;

// ライト情報
uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightDirection;

// 透明度
uniform float uAlpha;

// 最大16色まで対応
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform vec3 uColor8;
uniform vec3 uColor9;
uniform vec3 uColor10;
uniform vec3 uColor11;
uniform vec3 uColor12;
uniform vec3 uColor13;
uniform vec3 uColor14;
uniform vec3 uColor15;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 getColorAt(float position) {
  if (uColorCount <= 1) return uColor0;
  
  position = clamp(position, 0.0, 1.0);
  float scaledPos = position * float(uColorCount - 1);
  int index = int(floor(scaledPos));
  float fraction = fract(scaledPos);
  
  vec3 color1, color2;
  
  // インデックスに基づいて色を選択
  if (index == 0) {
    color1 = uColor0;
    color2 = uColor1;
  } else if (index == 1) {
    color1 = uColor1;
    color2 = (uColorCount > 2) ? uColor2 : uColor1;
  } else if (index == 2) {
    color1 = uColor2;
    color2 = (uColorCount > 3) ? uColor3 : uColor2;
  } else if (index == 3) {
    color1 = uColor3;
    color2 = (uColorCount > 4) ? uColor4 : uColor3;
  } else if (index == 4) {
    color1 = uColor4;
    color2 = (uColorCount > 5) ? uColor5 : uColor4;
  } else if (index == 5) {
    color1 = uColor5;
    color2 = (uColorCount > 6) ? uColor6 : uColor5;
  } else if (index == 6) {
    color1 = uColor6;
    color2 = (uColorCount > 7) ? uColor7 : uColor6;
  } else if (index == 7) {
    color1 = uColor7;
    color2 = (uColorCount > 8) ? uColor8 : uColor7;
  } else if (index == 8) {
    color1 = uColor8;
    color2 = (uColorCount > 9) ? uColor9 : uColor8;
  } else if (index == 9) {
    color1 = uColor9;
    color2 = (uColorCount > 10) ? uColor10 : uColor9;
  } else if (index == 10) {
    color1 = uColor10;
    color2 = (uColorCount > 11) ? uColor11 : uColor10;
  } else if (index == 11) {
    color1 = uColor11;
    color2 = (uColorCount > 12) ? uColor12 : uColor11;
  } else if (index == 12) {
    color1 = uColor12;
    color2 = (uColorCount > 13) ? uColor13 : uColor12;
  } else if (index == 13) {
    color1 = uColor13;
    color2 = (uColorCount > 14) ? uColor14 : uColor13;
  } else if (index == 14) {
    color1 = uColor14;
    color2 = (uColorCount > 15) ? uColor15 : uColor14;
  } else {
    color1 = uColor15;
    color2 = uColor15;
  }
  return mix(color1, color2, fraction);
}

void main() {
  vec2 st = (vTexCoord - 0.5) * uScale;
  float t = uTime;
  float mixValue = 0.0;
  
  // グラデーションタイプ
  if (uGradientType == 0.0) { // Linear
    vec2 rotated = rotate2d(uAngle) * st;
    mixValue = rotated.x + 0.5;
  }
  else if (uGradientType == 1.0) { // Radial
    mixValue = 1.0 - length(st);
  }
  else if (uGradientType == 2.0) { // Stripe
    vec3 normal = normalize(vec3(st.x, st.y, sqrt(1.0 - dot(st, st))));
    float lat = normal.y;
    float normalizedLat = (lat + 1.0) * 0.5;
    mixValue = mod(normalizedLat * uStripeCount, 1.0) < uStripeWidth ? 1.0 : 0.0;
  }
  else if (uGradientType == 3.0) { // Checker
    float checkerSize = 0.1;
    vec2 checker = floor(st / checkerSize);
    mixValue = mod(checker.x + checker.y, 2.0);
  }
  else if (uGradientType == 4.0) { // Conic
    mixValue = (atan(st.y, st.x) + PI) / TWO_PI;
  }
  else if (uGradientType == 5.0) { // Diamond
    mixValue = 1.0 - (abs(st.x) + abs(st.y));
  }
  else if (uGradientType == 6.0) { // Spiral
    float r = length(st);
    float a = atan(st.y, st.x);
    mixValue = 1.0 - mod(r + a / TWO_PI, 1.0);
  }
  else if (uGradientType == 7.0) { // Star
    float a = atan(st.y, st.x);
    float r = length(st);
    float star = 0.5 + 0.5 * cos(5.0 * a);
    mixValue = 1.0 - (r / star);
  }
  else if (uGradientType == 8.0) { // Kaleidoscope
    float a = atan(st.y, st.x);
    float segments = 8.0;
    float segmentAngle = mod(a, TWO_PI / segments) * segments;
    mixValue = 1.0 - (sin(segmentAngle + length(st) * 5.0) * 0.5 + 0.5);
  }
  
  // アニメーション
  if (uSpeed > 0.0) {
    if (uAnimationType == 1.0) { // Move
      mixValue = mod(mixValue + t, 1.0);
    }
    else if (uAnimationType == 2.0) { // Rotate
      vec2 rotated = rotate2d(t) * st;
      if (uGradientType == 0.0) {
        mixValue = rotated.x + 0.5;
      } else if (uGradientType == 4.0) {
        mixValue = (atan(rotated.y, rotated.x) + PI) / TWO_PI;
      }
    }
    else if (uAnimationType == 3.0) { // Wave
      mixValue += sin(st.y * 10.0 + t * 3.0) * 0.1;
    }
    else if (uAnimationType == 4.0) { // Pulse
      float pulse = sin(t * 2.0) * 0.5 + 0.5;
      mixValue *= (0.5 + pulse * 0.5);
    }
    else if (uAnimationType == 5.0) { // Wave Pattern
      float wave = sin(mixValue * 3.0 + t * 2.0) * 0.5 + 0.5;
      mixValue = wave;
    }
    else if (uAnimationType == 6.0) { // Noise
      float n = noise(st * 5.0 + t);
      mixValue = mix(mixValue, n, 0.3);
    }
  }
  
  mixValue = clamp(mixValue, 0.0, 1.0);
  
  // ベース色を取得
  vec3 baseColor = getColorAt(mixValue);
  
  // ライティング処理
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightDirection);
  
  // 環境光
  vec3 ambient = uAmbientColor * baseColor;
  
  // 拡散反射
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = uDirectionalColor * diff * baseColor;
  
  // 最終的な色を計算
  vec3 finalColor = ambient + diffuse;
  
  gl_FragColor = vec4(finalColor, uAlpha);
}
`;

// ライティング対応のGradientShaderクラス
class LightingGradientShader {
  constructor(colors = null) {
    this.shader = createShader(lightingVertShader, lightingFragShader);
    const defaultColors = [
      [1.0, 0.0, 0.0],
      [0.0, 1.0, 0.0],
      [0.0, 0.0, 1.0],
      [1.0, 1.0, 0.0]
    ];
    this.config = {
      gradientType: 0,
      animationType: 0,
      speed: 0.0,
      angle: 0,
      scale: 1.0,
      stripeWidth: 0.2,
      stripeCount: 8.0,
      colors: colors || defaultColors,
      // ライティング設定
      ambientStrength: 0.1,
      diffuseStrength: 1.0,
      lightingEnabled: true
    };
  }
  
  apply() {
    shader(this.shader);
    this.updateUniforms();
  }
  
  updateUniforms() {
    const currentTime = millis() / 1000.0;
    this.shader.setUniform('uTime', currentTime * this.config.speed);
    this.shader.setUniform('uGradientType', this.config.gradientType);
    this.shader.setUniform('uAnimationType', this.config.animationType);
    this.shader.setUniform('uSpeed', this.config.speed);
    this.shader.setUniform('uAngle', this.config.angle);
    this.shader.setUniform('uScale', this.config.scale);
    this.shader.setUniform('uStripeWidth', this.config.stripeWidth);
    this.shader.setUniform('uStripeCount', this.config.stripeCount);
    this.shader.setUniform('uColorCount', this.config.colors.length);
    
    for (let i = 0; i < Math.min(16, this.config.colors.length); i++) {
      this.shader.setUniform(`uColor${i}`, this.config.colors[i]);
    }
    
    for (let i = this.config.colors.length; i < 16; i++) {
      this.shader.setUniform(`uColor${i}`, [0.0, 0.0, 0.0]);
    }
    
    this.shader.setUniform('uAmbientColor', [
      this.config.ambientStrength, 
      this.config.ambientStrength, 
      this.config.ambientStrength
    ]);
    this.shader.setUniform('uDirectionalColor', [
      this.config.diffuseStrength, 
      this.config.diffuseStrength, 
      this.config.diffuseStrength
    ]);

    this.shader.setUniform('uLightDirection', [0.5, -1.0, 0.5]);
    this.shader.setUniform('uAlpha', this.config.alpha || 1.0);
  }
  
  setGradientType(type) {
    this.config.gradientType = type;
  }
  
  setAnimationType(type) {
    this.config.animationType = type;
  }
  
  setColors(...colors) {
    if (Array.isArray(colors[0])) {
      this.config.colors = colors[0].map(color => {
        if (typeof color === 'string' && color.startsWith('#')) {
          const c = window.color(color);
          return [red(c) / 255, green(c) / 255, blue(c) / 255];
        }
        return color;
      });
    } else {
      this.config.colors = colors.map(color => {
        if (typeof color === 'string' && color.startsWith('#')) {
          const c = window.color(color);
          return [red(c) / 255, green(c) / 255, blue(c) / 255];
        }
        return color;
      });
    }
  }
  
  setColorsFromP5(...p5Colors) {
    this.config.colors = p5Colors.map(c => [
      red(c) / 255,
      green(c) / 255,
      blue(c) / 255
    ]);
  }
  
  setColorsFromPalette(palette) {
    this.config.colors = palette.colors.map(hexColor => {
      const c = color(hexColor);
      return [red(c) / 255, green(c) / 255, blue(c) / 255, alpha(c) / 255];
    });
  }
  
  setSpeed(speed) {
    this.config.speed = speed;
  }
  
  setAngle(angle) {
    this.config.angle = angle;
  }
  
  setScale(scale) {
    this.config.scale = scale;
  }

  setStripeWidth(width) {
    this.config.stripeWidth = width;
  }
  
  setStripeCount(count) {
    this.config.stripeCount = count;
  }

  setRandomSpeed(min = -10, max = 10) {
    this.config.speed = random(min, max);
  }

  setLightingMode(enabled) {
    this.config.lightingEnabled = enabled;
  }
  
  setAmbientStrength(strength) {
    this.config.ambientStrength = strength;
  }
  
  setDiffuseStrength(strength) {
    this.config.diffuseStrength = strength;
  }
  
  setAlpha(alpha) {
    this.config.alpha = alpha;
  }

  setNormal(normalX, normalY, normalZ) {
    this.config.normalX = normalX;
    this.config.normalY = normalY;
    this.config.normalZ = normalZ;
  }
}
