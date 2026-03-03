// Camera and GUI variables
let capture;
let controls = {
  gridSize: 8,
  charMode: 'sampled',
  bgMode: 'sampled',
  fixedCharColor: '#ffffff',
  fixedBgColor: '#000000',
  customChars: '█▓▒░',
  charSet: 'ascii_blocks',
  threshold: 128,
  redEffect: false,
  greenEffect: false,
  blueEffect: false,
  invertEffect: false,
  posterizeEffect: false
};

// Character sets
const charSets = {
  ascii_blocks: '█▓▒░',
  ansi_boxes: '┌─┐│└┘├┤┬┴┼',
  ascii_chars: '@%#*+=-:. ',
  numbers: '0123456789',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: controls.gridSize,
    frameRate: 60
});

t.setup(() => {
    // Initialize camera
    capture = document.createElement('video');
    capture.width = 640;
    capture.height = 480;
    capture.autoplay = true;

    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            capture.srcObject = stream;
        })
        .catch(err => {
            console.log('Camera access denied or not available:', err);
        });

    // Create GUI
    createGUI();
});

function createGUI() {
    // Create main GUI container
    let guiContainer = document.createElement('div');
    guiContainer.style.position = 'absolute';
    guiContainer.style.top = '10px';
    guiContainer.style.left = '10px';
    guiContainer.style.background = 'rgba(0,0,0,0.8)';
    guiContainer.style.color = 'white';
    guiContainer.style.padding = '10px';
    guiContainer.style.borderRadius = '5px';
    guiContainer.style.fontFamily = 'monospace';
    guiContainer.style.fontSize = '12px';
    guiContainer.style.zIndex = '1000';
    document.body.appendChild(guiContainer);

    // Grid Size
    let gridLabel = document.createElement('p');
    gridLabel.textContent = 'Grid Size:';
    gridLabel.style.margin = '5px 0 2px 0';
    guiContainer.appendChild(gridLabel);

    let gridSelect = document.createElement('select');
    [6, 8, 12, 16, 32].forEach(size => {
        let option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        if (size === 8) option.selected = true;
        gridSelect.appendChild(option);
    });
    guiContainer.appendChild(gridSelect);
    gridSelect.addEventListener('change', () => {
        controls.gridSize = parseInt(gridSelect.value);
        updateTextmode();
    });

    // Character Mode
    let charLabel = document.createElement('p');
    charLabel.textContent = 'Character:';
    charLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(charLabel);

    let charSelect = document.createElement('select');
    ['sampled', 'fixed'].forEach(mode => {
        let option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        if (mode === 'sampled') option.selected = true;
        charSelect.appendChild(option);
    });
    guiContainer.appendChild(charSelect);
    charSelect.addEventListener('change', () => {
        controls.charMode = charSelect.value;
    });

    // Background Mode
    let bgLabel = document.createElement('p');
    bgLabel.textContent = 'Background:';
    bgLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(bgLabel);

    let bgSelect = document.createElement('select');
    ['sampled', 'fixed'].forEach(mode => {
        let option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        if (mode === 'sampled') option.selected = true;
        bgSelect.appendChild(option);
    });
    guiContainer.appendChild(bgSelect);
    bgSelect.addEventListener('change', () => {
        controls.bgMode = bgSelect.value;
    });

    // Color Pickers
    let colorLabel = document.createElement('p');
    colorLabel.textContent = 'Fixed Colors:';
    colorLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(colorLabel);

    let charColorInput = document.createElement('input');
    charColorInput.type = 'color';
    charColorInput.value = '#ffffff';
    guiContainer.appendChild(charColorInput);
    charColorInput.addEventListener('input', () => {
        controls.fixedCharColor = charColorInput.value;
    });

    let bgColorInput = document.createElement('input');
    bgColorInput.type = 'color';
    bgColorInput.value = '#000000';
    guiContainer.appendChild(bgColorInput);
    bgColorInput.addEventListener('input', () => {
        controls.fixedBgColor = bgColorInput.value;
    });

    // Character Sets
    let charsetLabel = document.createElement('p');
    charsetLabel.textContent = 'Character Set:';
    charsetLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(charsetLabel);

    let charsetSelect = document.createElement('select');
    Object.keys(charSets).forEach(set => {
        let option = document.createElement('option');
        option.value = set;
        option.textContent = set;
        if (set === 'ascii_blocks') option.selected = true;
        charsetSelect.appendChild(option);
    });
    guiContainer.appendChild(charsetSelect);
    charsetSelect.addEventListener('change', () => {
        controls.charSet = charsetSelect.value;
        controls.customChars = charSets[controls.charSet];
    });

    // Custom Characters Input
    let customLabel = document.createElement('p');
    customLabel.textContent = 'Custom Chars:';
    customLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(customLabel);

    let customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.value = '█▓▒░';
    guiContainer.appendChild(customInput);
    customInput.addEventListener('input', () => {
        controls.customChars = customInput.value;
    });

    // Threshold Slider
    let thresholdLabel = document.createElement('p');
    thresholdLabel.textContent = 'Threshold:';
    thresholdLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(thresholdLabel);

    let thresholdSlider = document.createElement('input');
    thresholdSlider.type = 'range';
    thresholdSlider.min = '0';
    thresholdSlider.max = '255';
    thresholdSlider.value = '128';
    guiContainer.appendChild(thresholdSlider);
    thresholdSlider.addEventListener('input', () => {
        controls.threshold = parseInt(thresholdSlider.value);
    });

    // RGB Effects
    let effectsLabel = document.createElement('p');
    effectsLabel.textContent = 'Effects:';
    effectsLabel.style.margin = '10px 0 2px 0';
    guiContainer.appendChild(effectsLabel);

    ['Red Channel', 'Green Channel', 'Blue Channel', 'Invert', 'Posterize'].forEach(effect => {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = effect.toLowerCase().replace(' ', '');

        let label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = effect;
        label.style.display = 'block';
        label.style.margin = '2px 0';

        label.insertBefore(checkbox, label.firstChild);
        guiContainer.appendChild(label);

        checkbox.addEventListener('change', () => {
            let effectKey = effect.toLowerCase().replace(' ', '') + 'Effect';
            controls[effectKey] = checkbox.checked;
        });
    });
}

function updateTextmode() {
    // Update textmode font size based on grid size
    // Note: textmode.js may not support dynamic font size changes after creation
    // This would require recreating the textmode instance
}

function getBrightness(r, g, b) {
    return (r * 0.299 + g * 0.587 + b * 0.114);
}

function sampleFromCamera(x, y, w, h) {
    if (!capture || !capture.videoWidth) return { r: 0, g: 0, b: 0 };

    // Create a temporary canvas to sample the camera feed
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = capture.videoWidth;
    tempCanvas.height = capture.videoHeight;
    tempCtx.drawImage(capture, 0, 0);

    let imageData = tempCtx.getImageData(x, y, w, h).data;
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
    }

    return {
        r: Math.floor(r / count),
        g: Math.floor(g / count),
        b: Math.floor(b / count)
    };
}

t.draw(() => {
    // Set background based on mode
    if (controls.bgMode === 'fixed') {
        let bgColor = hexToRgb(controls.fixedBgColor);
        t.background(bgColor.r, bgColor.g, bgColor.b);
    } else {
        t.background(32); // Default dark gray
    }

    // Process camera feed and convert to ASCII
    if (capture && capture.videoWidth) {
        let cols = t.grid.cols;
        let rows = t.grid.rows;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Sample color from camera at this grid position
                let sampleX = Math.floor((x / cols) * capture.videoWidth);
                let sampleY = Math.floor((y / rows) * capture.videoHeight);
                let color = sampleFromCamera(sampleX, sampleY, 1, 1);

                // Apply effects
                if (controls.redEffect) {
                    color.g = 0;
                    color.b = 0;
                }
                if (controls.greenEffect) {
                    color.r = 0;
                    color.b = 0;
                }
                if (controls.blueEffect) {
                    color.r = 0;
                    color.g = 0;
                }
                if (controls.invertEffect) {
                    color.r = 255 - color.r;
                    color.g = 255 - color.g;
                    color.b = 255 - color.b;
                }
                if (controls.posterizeEffect) {
                    color.r = Math.floor(color.r / 64) * 64;
                    color.g = Math.floor(color.g / 64) * 64;
                    color.b = Math.floor(color.b / 64) * 64;
                }

                // Calculate brightness for character selection
                let brightness = getBrightness(color.r, color.g, color.b);
                let threshold = controls.threshold;
                let charIndex = Math.floor((brightness / 255) * (controls.customChars.length - 1));
                let selectedChar = controls.customChars[Math.max(0, Math.min(controls.customChars.length - 1, charIndex))];

                // Set character and color
                if (controls.charMode === 'sampled') {
                    t.charColor(color.r, color.g, color.b);
                } else {
                    let charColor = hexToRgb(controls.fixedCharColor);
                    t.charColor(charColor.r, charColor.g, charColor.b);
                }

                t.char(selectedChar, x, y);
            }
        }
    } else {
        // Fallback when camera is not available
        t.char('B');
        if (controls.charMode === 'sampled') {
            t.charColor(255, 0, 0);
        } else {
            let charColor = hexToRgb(controls.fixedCharColor);
            t.charColor(charColor.r, charColor.g, charColor.b);
        }
        t.rect(0, 0, Math.min(t.grid.cols / 2, 10), Math.min(t.grid.rows / 2, 10));
    }
});

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
