import p5 from 'p5';
import { p5asciify, renderers } from 'p5.asciify';

// Settings interface for session storage
interface AppSettings {
  characters: string;
  gridSize: number;
  rgbShift: boolean;
  glitch: boolean;
  dithering: boolean;
  charMode: 'fixed' | 'neighbor';
  bgMode: 'fixed' | 'neighbor';
  threshold: number;
  webcamContrast: number;
  webcamBrightness: number;
  rgbShiftIntensity: number;
  glitchIntensity: number;
  ditherIntensity: number;
  charColor: string;
  bgColor: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  characters: " .,:;i1tfLCG08@",
  gridSize: 12,
  rgbShift: false,
  glitch: false,
  dithering: false,
  charMode: 'fixed',
  bgMode: 'neighbor',
  threshold: 128,
  webcamContrast: 1.0,
  webcamBrightness: 0,
  rgbShiftIntensity: 2,
  glitchIntensity: 0.1,
  ditherIntensity: 0.5,
  charColor: '#ffffff',
  bgColor: '#000000'
};

const sketch = new p5((p) => {
  let video: p5.MediaElement;
  let settings: AppSettings = { ...DEFAULT_SETTINGS };
  let asciifyRenderer: renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
  let effectsShader: p5.Shader;

  // Auto-initialize camera on load
  const initializeCamera = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isHTTPS = location.protocol === 'https:';

      console.log('Auto-initializing camera...', { isIOS, isSafari, isHTTPS });

      // iOS Safari requires HTTPS for camera
      if (isIOS && !isHTTPS && isSafari &&
          location.hostname !== 'localhost' &&
          !location.hostname.startsWith('127.')) {
        console.warn('iOS Safari requires HTTPS for camera access');
        return;
      }

      const constraints = isIOS ? {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      } : {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      video = p.createCapture(constraints, () => {
        console.log('Camera initialized successfully');
        video.size(p.width, p.height);
        video.hide();
        updateAsciify();
      });

    } catch (error) {
      console.error('Camera initialization failed:', error);
    }
  };

  // Load settings from session storage
  const loadSettings = (): AppSettings => {
    try {
      const saved = sessionStorage.getItem('asciify-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  };

  // Save settings to session storage
  const saveSettings = () => {
    try {
      sessionStorage.setItem('asciify-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Update asciify renderer with current settings
  const updateAsciify = () => {
    if (!asciifyRenderer || !video) return;

    // Create character/background pattern based on density requirement (~40% characters)
    const totalCells = Math.floor(p.width / settings.gridSize) * Math.floor(p.height / settings.gridSize);
    const charCells = Math.floor(totalCells * 0.4); // 40% characters
    const colorCells = totalCells - charCells;

    // Create pattern with characters and spaces (color squares)
    const pattern = settings.characters.repeat(Math.ceil(charCells / settings.characters.length));
    const fullPattern = pattern.substring(0, charCells) + ' '.repeat(colorCells);

    asciifyRenderer.update({
      characters: fullPattern,
      characterColorMode: settings.charMode,
      backgroundColorMode: settings.bgMode,
      characterColor: settings.charColor,
      backgroundColor: settings.bgColor,
      brightnessRange: [0, settings.threshold],
      enabled: true
    });

    p5asciify.asciifier().fontSize(settings.gridSize);
    saveSettings();
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    settings = loadSettings();
    setupGUI();
    initializeCamera();
    createEffectsShader();
  };

  p.draw = () => {
    p.background(0);

    if (video) {
      // Create a graphics buffer to apply effects
      const buffer = p.createGraphics(p.width, p.height, p.WEBGL);

      buffer.push();

      // Apply webcam adjustments
      if (settings.webcamBrightness !== 0 || settings.webcamContrast !== 1.0) {
        const bright = p.map(settings.webcamBrightness, -100, 100, 0, 2);
        const contrast = settings.webcamContrast;
        buffer.tint(255 * bright * contrast, 255 * bright * contrast, 255 * bright * contrast);
      }

      buffer.texture(video);
      const scaleX = p.width / video.width;
      const scaleY = p.height / video.height;
      const scale = Math.max(scaleX, scaleY);
      buffer.scale(scale);
      buffer.plane(video.width, video.height);
      buffer.pop();
      buffer.tint(255, 255, 255);

      // Apply effects if enabled
      if (settings.rgbShift || settings.glitch || settings.dithering) {
        // Use shader for effects
        buffer.shader(effectsShader);
        effectsShader.setUniform('tex0', buffer);
        effectsShader.setUniform('resolution', [p.width, p.height]);
        effectsShader.setUniform('time', p.millis() * 0.001);
        effectsShader.setUniform('rgbShiftEnabled', settings.rgbShift);
        effectsShader.setUniform('rgbShiftAmount', settings.rgbShiftIntensity * 0.01);
        effectsShader.setUniform('glitchEnabled', settings.glitch);
        effectsShader.setUniform('glitchIntensity', settings.glitchIntensity);
        effectsShader.setUniform('ditherEnabled', settings.dithering);
        effectsShader.setUniform('ditherIntensity', settings.ditherIntensity);

        buffer.rect(-p.width/2, -p.height/2, p.width, p.height);
        buffer.resetShader();
      }

      // Draw the processed buffer
      p.image(buffer, -p.width/2, -p.height/2);
      buffer.remove();
    } else {
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text("Initializing camera...", 0, 0);
    }
  };

  p.setupAsciify = () => {
    asciifyRenderer = p5asciify.asciifier().renderers().add("main", "brightness", {}) as renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;

    // Initialize with loaded settings
    updateAsciify();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (video) {
      video.size(p.width, p.height);
    }
    updateAsciify();
  };

  // Create effects shader
  const createEffectsShader = () => {
    const vertSrc = `
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        vec4 position = vec4(aPosition, 1.0);
        gl_Position = position;
      }
    `;

    const fragSrc = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D tex0;
      uniform vec2 resolution;
      uniform float time;
      uniform bool rgbShiftEnabled;
      uniform float rgbShiftAmount;
      uniform bool glitchEnabled;
      uniform float glitchIntensity;
      uniform bool ditherEnabled;
      uniform float ditherIntensity;

      // Simple noise function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // Bayer dithering matrix
      float bayer4x4(vec2 uv) {
        vec2 i = floor(uv);
        vec2 f = fract(uv);
        float m = mod(i.x + i.y, 2.0);
        return (m * 0.5 + f.x * 0.25 + f.y * 0.125) * 0.5;
      }

      void main() {
        vec2 uv = vTexCoord;
        vec4 color = texture2D(tex0, uv);

        // RGB Shift (chromatic aberration)
        if (rgbShiftEnabled) {
          float shift = rgbShiftAmount;
          vec2 dir = normalize(uv - 0.5);
          color.r = texture2D(tex0, uv + dir * shift).r;
          color.b = texture2D(tex0, uv - dir * shift).b;
        }

        // Glitch effect
        if (glitchEnabled) {
          float glitch = sin(time * 10.0 + uv.y * 50.0) * glitchIntensity;
          if (abs(glitch) > 0.1) {
            uv.x += glitch * 0.1;
            color = texture2D(tex0, uv);
          }

          // Add some horizontal displacement
          float hGlitch = random(vec2(floor(uv.y * resolution.y * 0.1), time)) * glitchIntensity;
          if (hGlitch > 0.8) {
            uv.x += (hGlitch - 0.8) * 0.5;
            color = texture2D(tex0, uv);
          }
        }

        // Dithering effect
        if (ditherEnabled) {
          float dither = bayer4x4(uv * resolution * 0.1);
          color.rgb += (dither - 0.5) * ditherIntensity;
          color.rgb = clamp(color.rgb, 0.0, 1.0);
        }

        gl_FragColor = color;
      }
    `;

    effectsShader = p.createShader(vertSrc, fragSrc);
  };

  // GUI setup function
  const setupGUI = () => {
    const gui = document.createElement('div');
    gui.id = 'asciify-gui';
    gui.innerHTML = `
      <style>
        #asciify-gui {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          font-size: 12px;
          z-index: 1000;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 280px;
        }
        #asciify-gui .control-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        #asciify-gui .control-group {
          flex: 1;
          min-width: 60px;
        }
        #asciify-gui label {
          display: block;
          margin-bottom: 2px;
          font-weight: bold;
          font-size: 10px;
        }
        #asciify-gui input, #asciify-gui select {
          width: 100%;
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid #ccc;
          font-size: 11px;
        }
        #asciify-gui input[type="range"] {
          height: 6px;
        }
        #asciify-gui .checkbox-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        #asciify-gui .checkbox-group input[type="checkbox"] {
          width: 12px;
          height: 12px;
        }
        #asciify-gui .color-input {
          width: 40px;
          height: 20px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
      </style>

      <div class="control-row">
        <div class="control-group">
          <label for="characters">Characters:</label>
          <input type="text" id="characters" value="${settings.characters}" maxlength="50">
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="grid-size">Grid Size:</label>
          <select id="grid-size">
            <option value="6" ${settings.gridSize === 6 ? 'selected' : ''}>6</option>
            <option value="8" ${settings.gridSize === 8 ? 'selected' : ''}>8</option>
            <option value="12" ${settings.gridSize === 12 ? 'selected' : ''}>12</option>
            <option value="16" ${settings.gridSize === 16 ? 'selected' : ''}>16</option>
            <option value="32" ${settings.gridSize === 32 ? 'selected' : ''}>32</option>
          </select>
        </div>

        <div class="control-group">
          <label for="threshold">Threshold:</label>
          <input type="range" id="threshold" min="0" max="255" value="${settings.threshold}">
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="webcam-brightness">Brightness:</label>
          <input type="range" id="webcam-brightness" min="-100" max="100" value="${settings.webcamBrightness}">
        </div>

        <div class="control-group">
          <label for="webcam-contrast">Contrast:</label>
          <input type="range" id="webcam-contrast" min="0.5" max="2.0" step="0.1" value="${settings.webcamContrast}">
        </div>
      </div>

      <div class="control-row">
        <div class="checkbox-group">
          <input type="checkbox" id="rgb-shift" ${settings.rgbShift ? 'checked' : ''}>
          <label for="rgb-shift">RGB Shift</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="glitch" ${settings.glitch ? 'checked' : ''}>
          <label for="glitch">Glitch</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="dithering" ${settings.dithering ? 'checked' : ''}>
          <label for="dithering">Dither</label>
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>Char Mode:</label>
          <select id="char-mode">
            <option value="fixed" ${settings.charMode === 'fixed' ? 'selected' : ''}>Fixed</option>
            <option value="neighbor" ${settings.charMode === 'neighbor' ? 'selected' : ''}>Neighbor</option>
          </select>
        </div>

        <div class="control-group">
          <label>BG Mode:</label>
          <select id="bg-mode">
            <option value="fixed" ${settings.bgMode === 'fixed' ? 'selected' : ''}>Fixed</option>
            <option value="neighbor" ${settings.bgMode === 'neighbor' ? 'selected' : ''}>Neighbor</option>
          </select>
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label>Char Color:</label>
          <input type="color" id="char-color" class="color-input" value="${settings.charColor}">
        </div>

        <div class="control-group">
          <label>BG Color:</label>
          <input type="color" id="bg-color" class="color-input" value="${settings.bgColor}">
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="rgb-shift-intensity">RGB Shift:</label>
          <input type="range" id="rgb-shift-intensity" min="0" max="10" step="0.5" value="${settings.rgbShiftIntensity}">
        </div>
      </div>

      <div class="control-row">
        <div class="control-group">
          <label for="glitch-intensity">Glitch:</label>
          <input type="range" id="glitch-intensity" min="0" max="1" step="0.05" value="${settings.glitchIntensity}">
        </div>

        <div class="control-group">
          <label for="dither-intensity">Dither:</label>
          <input type="range" id="dither-intensity" min="0" max="1" step="0.05" value="${settings.ditherIntensity}">
        </div>
      </div>
    `;

    document.body.appendChild(gui);

    // Add event listeners
    const charactersInput = gui.querySelector('#characters') as HTMLInputElement;
    charactersInput.addEventListener('input', (e) => {
      settings.characters = (e.target as HTMLInputElement).value;
      updateAsciify();
    });

    const gridSizeSelect = gui.querySelector('#grid-size') as HTMLSelectElement;
    gridSizeSelect.addEventListener('change', (e) => {
      settings.gridSize = parseInt((e.target as HTMLSelectElement).value);
      updateAsciify();
    });

    const thresholdSlider = gui.querySelector('#threshold') as HTMLInputElement;
    thresholdSlider.addEventListener('input', (e) => {
      settings.threshold = parseInt((e.target as HTMLInputElement).value);
      updateAsciify();
    });

    const brightnessSlider = gui.querySelector('#webcam-brightness') as HTMLInputElement;
    brightnessSlider.addEventListener('input', (e) => {
      settings.webcamBrightness = parseInt((e.target as HTMLInputElement).value);
    });

    const contrastSlider = gui.querySelector('#webcam-contrast') as HTMLInputElement;
    contrastSlider.addEventListener('input', (e) => {
      settings.webcamContrast = parseFloat((e.target as HTMLInputElement).value);
    });

    // Effects checkboxes
    const rgbShiftCheckbox = gui.querySelector('#rgb-shift') as HTMLInputElement;
    rgbShiftCheckbox.addEventListener('change', (e) => {
      settings.rgbShift = (e.target as HTMLInputElement).checked;
      saveSettings();
    });

    const glitchCheckbox = gui.querySelector('#glitch') as HTMLInputElement;
    glitchCheckbox.addEventListener('change', (e) => {
      settings.glitch = (e.target as HTMLInputElement).checked;
      saveSettings();
    });

    const ditherCheckbox = gui.querySelector('#dithering') as HTMLInputElement;
    ditherCheckbox.addEventListener('change', (e) => {
      settings.dithering = (e.target as HTMLInputElement).checked;
      saveSettings();
    });

    // Mode selectors
    const charModeSelect = gui.querySelector('#char-mode') as HTMLSelectElement;
    charModeSelect.addEventListener('change', (e) => {
      settings.charMode = (e.target as HTMLSelectElement).value as 'fixed' | 'neighbor';
      updateAsciify();
    });

    const bgModeSelect = gui.querySelector('#bg-mode') as HTMLSelectElement;
    bgModeSelect.addEventListener('change', (e) => {
      settings.bgMode = (e.target as HTMLSelectElement).value as 'fixed' | 'neighbor';
      updateAsciify();
    });

    // Color pickers
    const charColorPicker = gui.querySelector('#char-color') as HTMLInputElement;
    charColorPicker.addEventListener('input', (e) => {
      settings.charColor = (e.target as HTMLInputElement).value;
      updateAsciify();
    });

    const bgColorPicker = gui.querySelector('#bg-color') as HTMLInputElement;
    bgColorPicker.addEventListener('input', (e) => {
      settings.bgColor = (e.target as HTMLInputElement).value;
      updateAsciify();
    });

    // Effect intensity sliders
    const rgbShiftIntensity = gui.querySelector('#rgb-shift-intensity') as HTMLInputElement;
    rgbShiftIntensity.addEventListener('input', (e) => {
      settings.rgbShiftIntensity = parseFloat((e.target as HTMLInputElement).value);
      saveSettings();
    });

    const glitchIntensity = gui.querySelector('#glitch-intensity') as HTMLInputElement;
    glitchIntensity.addEventListener('input', (e) => {
      settings.glitchIntensity = parseFloat((e.target as HTMLInputElement).value);
      saveSettings();
    });

    const ditherIntensity = gui.querySelector('#dither-intensity') as HTMLInputElement;
    ditherIntensity.addEventListener('input', (e) => {
      settings.ditherIntensity = parseFloat((e.target as HTMLInputElement).value);
      saveSettings();
    });
  };
});

export default sketch;