import p5 from 'p5';
import { p5asciify, renderers } from 'p5.asciify';

// Character sets for ASCII art (using only widely supported characters)
// Note: "Darkest neighbour" sampling is approximated by:
// 1. Using sampled mode for both character and background colors
// 2. Smaller font sizes for more detailed sampling
// 3. Adjusted brightness ranges for better contrast
// True "darkest neighbour" sampling would require custom shaders
const CHARACTER_SETS = {
    default: " .,:;i1tfLCG08@",
    extended: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    blocks: " ░▒▓",
    shapes: " ·○●□■",
    petscii: " ☺☻♥♦♣♠",
    dots: " ·˙•⋅∘◦",
    lines: " ─│┌┐└┘"
};

const sketch = new p5((p) => {

    let brightnessRenderer: renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
    let edgeRenderer: renderers.renderer2d.feature.P5AsciifyEdgeRenderer;
    let charsRenderer: renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
    let backgroundRenderer: renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
    let currentRenderer: 'brightness' | 'edge' | 'chars' | 'background' = 'brightness';
    let video: p5.MediaElement;
    let charInvertMode: 'none' | 'invert' | 'random' = 'none';
    let bgInvertMode: 'none' | 'invert' | 'random' = 'none';
    let cameraBrightness: number = 0; // -100 to 100

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        // Camera will be started by user interaction for iOS compatibility
        // Don't auto-start to comply with iOS Safari camera permissions
    };

    p.draw = () => {
        p.background(0);

        // Update random colors and simulate neighbor sampling effect
        if (p.frameCount % 30 === 0) { // Every half second at 60fps
            if (charInvertMode === 'random') {
                brightnessRenderer.update({ characterColor: p.color(p.random(255), p.random(255), p.random(255)) });
                edgeRenderer.update({ characterColor: p.color(p.random(255), p.random(255), p.random(255)) });
                charsRenderer.update({ characterColor: p.color(p.random(255), p.random(255), p.random(255)) });
                backgroundRenderer.update({ characterColor: p.color(p.random(255), p.random(255), p.random(255)) });
            }

            if (bgInvertMode === 'random') {
                brightnessRenderer.update({ backgroundColor: p.color(p.random(255), p.random(255), p.random(255)) });
                edgeRenderer.update({ backgroundColor: p.color(p.random(255), p.random(255), p.random(255)) });
                charsRenderer.update({ backgroundColor: p.color(p.random(255), p.random(255), p.random(255)) });
                backgroundRenderer.update({ backgroundColor: p.color(p.random(255), p.random(255), p.random(255)) });
            }

            // Removed dynamic brightness range to prevent threshold resets
        }

        // Only draw video if it's initialized
        if (video) {
            // Draw the video feed as a textured plane filling the entire screen
            p.push();
            // Position to fill the entire viewport
            p.translate(0, 0, 0);

            // Apply brightness adjustment
            if (cameraBrightness !== 0) {
                const brightnessValue = p.map(cameraBrightness, -100, 100, 0, 2);
                p.tint(255 * brightnessValue, 255 * brightnessValue, 255 * brightnessValue);
            }

            p.texture(video);
            // Scale to fill screen - use window dimensions for 100% zoom
            const scaleX = p.windowWidth / video.width;
            const scaleY = p.windowHeight / video.height;
            const scale = Math.max(scaleX, scaleY); // Use the larger scale to fill completely

            p.scale(scale);
            p.plane(video.width, video.height);
            p.pop();

            // Reset tint
            p.tint(255, 255, 255);
        } else {
            // Show instruction text when no camera
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.text("Loading camera...", 0, 0);
        }
    };

    p.setupAsciify = () => {
        brightnessRenderer = p5asciify.asciifier().renderers().get("brightness") as renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
        edgeRenderer = p5asciify.asciifier().renderers().get("edge") as renderers.renderer2d.feature.P5AsciifyEdgeRenderer;

        // Add custom renderers
        charsRenderer = p5asciify.asciifier().renderers().add("chars", "brightness", {}) as renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;
        backgroundRenderer = p5asciify.asciifier().renderers().add("background", "brightness", {}) as renderers.renderer2d.feature.P5AsciifyBrightnessRenderer;

        // Initialize brightness renderer with hybrid sampling (fixed chars, sampled background for neighbor effect)
        brightnessRenderer.update({
            characters: " .,:;i1tfLCG08@",
            characterColorMode: 'fixed', // Fixed white characters for visibility
            backgroundColorMode: 'sampled', // Sampled background for neighbor effect
            characterColor: '#ffffff',
            backgroundColor: '#000000',
            invertMode: false,
            brightnessRange: [20, 235] // Narrower range for better contrast sampling
        });

        // Initialize edge renderer with hybrid sampling
        edgeRenderer.update({
            characters: "\\/|-_",
            characterColorMode: 'fixed', // Fixed white characters for visibility
            backgroundColorMode: 'sampled', // Sampled background for neighbor effect
            characterColor: '#ffffff',
            backgroundColor: '#000000',
            invertMode: false,
            sobelThreshold: 0.3, // Lower threshold for more edge detection
            sampleThreshold: 8 // Lower threshold for more sensitive sampling
        });

        // Initialize chars renderer (character-focused) with hybrid sampling
        charsRenderer.update({
            characters: CHARACTER_SETS.extended,
            characterColorMode: 'fixed', // Fixed white characters for visibility
            backgroundColorMode: 'sampled', // Sampled background for neighbor effect
            characterColor: '#ffffff',
            backgroundColor: '#000000',
            invertMode: false,
            brightnessRange: [10, 245] // Very wide range for detailed sampling
        });

        // Initialize background renderer (background pattern-focused) with hybrid sampling
        backgroundRenderer.update({
            characters: CHARACTER_SETS.blocks,
            characterColorMode: 'sampled', // Sampled characters for neighbor effect
            backgroundColorMode: 'fixed', // Fixed black background for contrast
            characterColor: '#ffffff',
            backgroundColor: '#000000',
            invertMode: false,
            brightnessRange: [50, 200] // Medium range for balanced sampling
        });

        // Set smaller default font size for better neighbor sampling effect
        p5asciify.asciifier().fontSize(12);

        // Initially disable all renderers except brightness
        edgeRenderer.update({ enabled: false });
        charsRenderer.update({ enabled: false });
        backgroundRenderer.update({ enabled: false });

        // Setup UI controls
        setupUIControls();
    };

    const initializeCamera = () => {
        try {
            // Detect browser and device types
            const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isHTTPS = location.protocol === 'https:';

            console.log('Camera init - Browser detection:', { isFirefox, isIOS, isSafari, isHTTPS });
            console.log('User agent:', navigator.userAgent);
            console.log('Protocol:', location.protocol);
            console.log('Hostname:', location.hostname);
            console.log('MediaDevices available:', !!navigator.mediaDevices);
            console.log('getUserMedia available:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Camera API not available in this browser. Please use a modern browser with camera support.');
                return;
            }

            // iOS Safari requires HTTPS for camera access (except localhost)
            if (isIOS && !isHTTPS && isSafari && location.hostname !== 'localhost' && !location.hostname.startsWith('127.')) {
                alert('Camera access on iOS Safari requires HTTPS.\n\nTo test on iPhone:\n1. Use ngrok: "npx ngrok http 5173" then visit the HTTPS URL\n2. Or deploy to a hosting service with HTTPS\n3. Or access from same WiFi network using your computer\'s IP address');
                return;
            }

            // Check if we have camera permissions API
            if (navigator.permissions && navigator.permissions.query) {
                navigator.permissions.query({ name: 'camera' as PermissionName }).then(result => {
                    console.log('Camera permission status:', result.state);
                }).catch(err => {
                    console.log('Could not check camera permissions:', err);
                });
            }

            let constraints: any;

            if (isIOS) {
                // iOS needs very simple constraints initially
                console.log('Using iOS-specific camera setup');
                constraints = {
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                };
            } else if (isFirefox) {
                // Firefox mobile needs simpler constraints
                constraints = {
                    video: true, // Simple boolean for Firefox
                    audio: false
                };
                console.log('Using Firefox-compatible camera constraints');
            } else {
                // Standard constraints for other browsers
                constraints = {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                };
            }

            video = p.createCapture(constraints, () => {
                console.log('Camera initialized successfully');
                // Resize video to match canvas
                video.size(p.width, p.height);
                video.hide();

                // Update button state
                const startBtn = document.getElementById('start-camera-btn') as HTMLButtonElement;
                if (startBtn) {
                    startBtn.textContent = 'Camera Active';
                    startBtn.disabled = true;
                    startBtn.style.background = '#666';
                }
            });

            // Handle camera errors
            video.elt.addEventListener('error', (error: Event) => {
                console.error('Camera error:', error);
                // Try fallback for Firefox
                if (isFirefox) {
                    console.log('Trying Firefox fallback...');
                    setTimeout(() => {
                        try {
                            video = p.createCapture(p.VIDEO, () => {
                                console.log('Firefox fallback camera initialized');
                                video.size(p.width, p.height);
                                video.hide();
                                const startBtn = document.getElementById('start-camera-btn') as HTMLButtonElement;
                                if (startBtn) {
                                    startBtn.textContent = 'Camera Active';
                                    startBtn.disabled = true;
                                    startBtn.style.background = '#666';
                                }
                            });
                        } catch (fallbackError) {
                            console.error('Firefox fallback failed:', fallbackError);
                            alert('Camera access failed on Firefox. Please try a different browser or check permissions.');
                        }
                    }, 1000);
                } else if (isIOS) {
                    // Try multiple iOS fallbacks
                    console.log('Trying iOS fallback 1 - no facingMode...');
                    setTimeout(() => {
                        try {
                            video = p.createCapture({
                                video: {
                                    width: { ideal: 640 },
                                    height: { ideal: 480 }
                                },
                                audio: false
                            }, () => {
                                console.log('iOS fallback 1 camera initialized');
                                video.size(p.width, p.height);
                                video.hide();
                                const startBtn = document.getElementById('start-camera-btn') as HTMLButtonElement;
                                if (startBtn) {
                                    startBtn.textContent = 'Camera Active';
                                    startBtn.disabled = true;
                                    startBtn.style.background = '#666';
                                }
                            });

                            video.elt.addEventListener('error', (_error: Event) => {
                                console.log('iOS fallback 1 failed, trying fallback 2...');
                                setTimeout(() => {
                                    try {
                                        video = p.createCapture({
                                            video: true,
                                            audio: false
                                        }, () => {
                                            console.log('iOS fallback 2 camera initialized');
                                            video.size(p.width, p.height);
                                            video.hide();
                                            const startBtn = document.getElementById('start-camera-btn') as HTMLButtonElement;
                                            if (startBtn) {
                                                startBtn.textContent = 'Camera Active';
                                                startBtn.disabled = true;
                                                startBtn.style.background = '#666';
                                            }
                                        });
                                    } catch (fallback2Error) {
                                        console.error('iOS fallback 2 failed:', fallback2Error);
                                        alert('Camera access failed on iOS. Please ensure:\n1. You\'re using Safari\n2. The site is accessed via HTTPS\n3. Camera permissions are granted in iOS Settings > Safari');
                                    }
                                }, 1000);
                            });
                        } catch (fallbackError) {
                            console.error('iOS fallback 1 failed:', fallbackError);
                            alert('Camera access failed on iOS. Please ensure:\n1. You\'re using Safari\n2. The site is accessed via HTTPS\n3. Camera permissions are granted in iOS Settings > Safari');
                        }
                    }, 1000);
                } else {
                    alert('Camera access failed. Please check permissions and try again.');
                }
            });

        } catch (error) {
            console.error('Failed to initialize camera:', error);
            alert('Failed to access camera. Please check your browser settings.');
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        // Re-size video to match new canvas dimensions if it exists
        if (video) {
            video.size(p.width, p.height);
        }
    };

    const setupUIControls = () => {
        // Camera start button
        const startCameraBtn = document.getElementById('start-camera-btn') as HTMLButtonElement;

        // Check if camera is likely to work on this device/browser
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isHTTPS = location.protocol === 'https:';
        const needsHTTPS = isIOS && !isHTTPS && isSafari && location.hostname !== 'localhost' && !location.hostname.startsWith('127.');

        if (needsHTTPS) {
            startCameraBtn.textContent = 'Camera (Needs HTTPS)';
            startCameraBtn.style.background = '#ff6b6b';
        }

        startCameraBtn.addEventListener('click', () => {
            initializeCamera();
        });

        // Renderer selection
        const rendererSelect = document.getElementById('renderer-select') as HTMLSelectElement;
        rendererSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            currentRenderer = target.value as 'brightness' | 'edge' | 'chars' | 'background';

            // Disable all renderers first
            brightnessRenderer.update({ enabled: false });
            edgeRenderer.update({ enabled: false });
            charsRenderer.update({ enabled: false });
            backgroundRenderer.update({ enabled: false });

            // Enable the selected renderer
            switch (currentRenderer) {
                case 'brightness':
                    brightnessRenderer.update({ enabled: true });
                    break;
                case 'edge':
                    edgeRenderer.update({ enabled: true });
                    break;
                case 'chars':
                    charsRenderer.update({ enabled: true });
                    break;
                case 'background':
                    backgroundRenderer.update({ enabled: true });
                    break;
            }
        });

        // Threshold slider
        const thresholdSlider = document.getElementById('threshold-slider') as HTMLInputElement;
        const thresholdValue = document.getElementById('threshold-value') as HTMLSpanElement;

        thresholdSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const value = parseInt(target.value);
            thresholdValue.textContent = value.toString();

            switch (currentRenderer) {
                case 'brightness':
                    // For brightness, use as upper bound of brightness range
                    brightnessRenderer.update({ brightnessRange: [0, value] });
                    break;
                case 'edge':
                    // For edge, convert to 0-1 range for sobel threshold
                    edgeRenderer.update({ sobelThreshold: value / 255 });
                    break;
                case 'chars':
                    // For chars renderer (brightness-based), use as upper bound of brightness range
                    charsRenderer.update({ brightnessRange: [0, value] });
                    break;
                case 'background':
                    // For background renderer (brightness-based), use as upper bound of brightness range
                    backgroundRenderer.update({ brightnessRange: [0, value] });
                    break;
            }
        });

        // Blend mode selector
        const blendModeSelect = document.getElementById('blendmode-select') as HTMLSelectElement;
        blendModeSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            const blendModeValue = target.value;

            // Map string values to p5.js blend mode constants
            switch (blendModeValue) {
                case 'BLEND':
                    p.blendMode(p.BLEND);
                    break;
                case 'ADD':
                    p.blendMode(p.ADD);
                    break;
                case 'DARKEST':
                    p.blendMode(p.DARKEST);
                    break;
                case 'LIGHTEST':
                    p.blendMode(p.LIGHTEST);
                    break;
                case 'DIFFERENCE':
                    p.blendMode(p.DIFFERENCE);
                    break;
                case 'EXCLUSION':
                    p.blendMode(p.EXCLUSION);
                    break;
                case 'MULTIPLY':
                    p.blendMode(p.MULTIPLY);
                    break;
                case 'SCREEN':
                    p.blendMode(p.SCREEN);
                    break;
                case 'OVERLAY':
                    p.blendMode(p.OVERLAY);
                    break;
                case 'HARD_LIGHT':
                    p.blendMode(p.HARD_LIGHT);
                    break;
                case 'SOFT_LIGHT':
                    p.blendMode(p.SOFT_LIGHT);
                    break;
                case 'DODGE':
                    p.blendMode(p.DODGE);
                    break;
                case 'BURN':
                    p.blendMode(p.BURN);
                    break;
                default:
                    p.blendMode(p.BLEND);
                    break;
            }
        });

        // Character inversion selector
        const charInvertSelect = document.getElementById('char-invert-select') as HTMLSelectElement;

        const applyCharInversion = () => {
            const updateObj: any = {};

            switch (charInvertMode) {
                case 'invert':
                    updateObj.characterColorMode = 'fixed';
                    updateObj.characterColor = '#000000';
                    updateObj.backgroundColorMode = 'fixed';
                    updateObj.backgroundColor = '#ffffff';
                    break;
                case 'random':
                    updateObj.characterColorMode = 'fixed';
                    updateObj.characterColor = p.color(p.random(255), p.random(255), p.random(255));
                    updateObj.backgroundColorMode = 'sampled'; // Sample background for neighbor effect
                    break;
                case 'none':
                default:
                    // Hybrid approach: characters use contrasting fixed colors, background samples
                    updateObj.characterColorMode = 'fixed';
                    updateObj.characterColor = '#ffffff'; // White characters for visibility
                    updateObj.backgroundColorMode = 'sampled'; // Sample background for neighbor effect
                    break;
            }

            brightnessRenderer.update(updateObj);
            edgeRenderer.update(updateObj);
            charsRenderer.update(updateObj);
            backgroundRenderer.update(updateObj);
        };

        charInvertSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            charInvertMode = target.value as 'none' | 'invert' | 'random';
            applyCharInversion();
        });

        // Background inversion selector
        const bgInvertSelect = document.getElementById('bg-invert-select') as HTMLSelectElement;

        const applyBgInversion = () => {
            const updateObj: any = {};

            switch (bgInvertMode) {
                case 'invert':
                    updateObj.backgroundColorMode = 'fixed';
                    updateObj.backgroundColor = '#ffffff';
                    updateObj.characterColorMode = 'fixed';
                    updateObj.characterColor = '#000000';
                    break;
                case 'random':
                    updateObj.backgroundColorMode = 'fixed';
                    updateObj.backgroundColor = p.color(p.random(255), p.random(255), p.random(255));
                    updateObj.characterColorMode = 'sampled'; // Sample characters for neighbor effect
                    break;
                case 'none':
                default:
                    // Hybrid approach: background uses contrasting fixed colors, characters sample
                    updateObj.backgroundColorMode = 'fixed';
                    updateObj.backgroundColor = '#000000'; // Black background for contrast
                    updateObj.characterColorMode = 'sampled'; // Sample characters for neighbor effect
                    break;
            }

            brightnessRenderer.update(updateObj);
            edgeRenderer.update(updateObj);
            charsRenderer.update(updateObj);
            backgroundRenderer.update(updateObj);
        };

        bgInvertSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            bgInvertMode = target.value as 'none' | 'invert' | 'random';
            applyBgInversion();
        });

        // Camera brightness slider
        const brightnessSlider = document.getElementById('brightness-slider') as HTMLInputElement;
        const brightnessValue = document.getElementById('brightness-value') as HTMLSpanElement;

        brightnessSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            cameraBrightness = parseInt(target.value);
            brightnessValue.textContent = cameraBrightness.toString();
        });

        // Character size selector
        const charSizeSelect = document.getElementById('char-size-select') as HTMLSelectElement;
        charSizeSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            const size = parseInt(target.value);
            p5asciify.asciifier().fontSize(size);
        });

        // Character set selector
        const charsetSelect = document.getElementById('charset-select') as HTMLSelectElement;
        const customCharsetTextarea = document.getElementById('custom-charset') as HTMLTextAreaElement;

        const updateCharacterSet = () => {
            const selectedSet = charsetSelect.value;
            let characters: string;

            if (selectedSet === 'custom') {
                characters = customCharsetTextarea.value || CHARACTER_SETS.default;
                // Filter out potentially unsupported characters for custom sets
                characters = filterSupportedCharacters(characters);
            } else {
                characters = CHARACTER_SETS[selectedSet as keyof typeof CHARACTER_SETS] || CHARACTER_SETS.default;
            }

            // Update all renderers with new character set
            try {
                brightnessRenderer.update({ characters });
                edgeRenderer.update({ characters });
                charsRenderer.update({ characters });
                backgroundRenderer.update({ characters });
            } catch (error) {
                console.error('Error updating character set:', error);
                // Fallback to default if there are unsupported characters
                const fallbackChars = CHARACTER_SETS.default;
                brightnessRenderer.update({ characters: fallbackChars });
                edgeRenderer.update({ characters: fallbackChars });
                charsRenderer.update({ characters: fallbackChars });
                backgroundRenderer.update({ characters: fallbackChars });
                alert('Some characters in your custom set are not supported. Using default ASCII characters instead.');
            }
        };

        // Function to filter out potentially problematic characters
        const filterSupportedCharacters = (charString: string): string => {
            // Basic ASCII characters that are most likely to be supported
            const supportedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;i1tfLCG08@!#$%^&*()-_=+[]{}|\\:;"\'<>,.?/~`';

            // Filter the input string to only include supported characters
            let filtered = '';
            for (let i = 0; i < charString.length; i++) {
                const char = charString[i];
                if (supportedChars.includes(char)) {
                    filtered += char;
                }
            }

            // Ensure we have at least some characters
            return filtered.length > 0 ? filtered : CHARACTER_SETS.default;
        };

        charsetSelect.addEventListener('change', () => {
            const isCustom = charsetSelect.value === 'custom';
            customCharsetTextarea.style.display = isCustom ? 'block' : 'none';

            if (!isCustom) {
                // Load predefined set
                const selectedSet = charsetSelect.value as keyof typeof CHARACTER_SETS;
                customCharsetTextarea.value = CHARACTER_SETS[selectedSet];
            }

            updateCharacterSet();
        });

        // Custom character set input
        customCharsetTextarea.addEventListener('input', updateCharacterSet);

        // Initialize custom textarea as hidden
        customCharsetTextarea.style.display = 'none';

        // Paste from clipboard functionality
        const pasteCharsetBtn = document.getElementById('paste-charset-btn') as HTMLButtonElement;
        pasteCharsetBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                const filteredText = filterSupportedCharacters(text);
                customCharsetTextarea.value = filteredText;
                charsetSelect.value = 'custom';
                customCharsetTextarea.style.display = 'block';
                updateCharacterSet();
                if (filteredText.length !== text.length) {
                    alert('Some characters were filtered out as they are not supported. Characters pasted and filtered!');
                } else {
                    alert('Characters pasted from clipboard!');
                }
            } catch (error) {
                console.error('Failed to paste from clipboard:', error);
                alert('Failed to paste from clipboard. Please make sure clipboard access is allowed.');
            }
        });

        // Controls toggle functionality
        const controlsToggle = document.getElementById('controls-toggle') as HTMLButtonElement;
        const controls = document.querySelector('.controls') as HTMLElement;
        let controlsCollapsed = false;

        controlsToggle.addEventListener('click', () => {
            controlsCollapsed = !controlsCollapsed;
            if (controlsCollapsed) {
                controls.classList.add('collapsed');
                controlsToggle.textContent = '›';
            } else {
                controls.classList.remove('collapsed');
                controlsToggle.textContent = '‹';
            }
        });

        // CRT effect checkbox
        const crtCheckbox = document.getElementById('crt-checkbox') as HTMLInputElement;
        let crtEnabled = false;

        crtCheckbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            crtEnabled = target.checked;
            const crtOverlay = document.querySelector('.crt-overlay') as HTMLElement;

            if (crtEnabled) {
                if (!crtOverlay) {
                    const overlay = document.createElement('div');
                    overlay.className = 'crt-overlay';
                    document.body.appendChild(overlay);
                }
            } else {
                if (crtOverlay) {
                    crtOverlay.remove();
                }
            }
        });

        // Color mode toggles
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const colorTarget = target.dataset.colorTarget as 'character' | 'background';
                const mode = target.dataset.mode as 'sampled' | 'fixed';

                // Update active state
                const siblings = target.parentElement?.querySelectorAll(`[data-color-target="${colorTarget}"]`);
                siblings?.forEach(sib => sib.classList.remove('active'));
                target.classList.add('active');

                // Show/hide color picker
                const colorPicker = document.getElementById(`${colorTarget}-color-picker`);
                if (mode === 'fixed') {
                    colorPicker?.classList.remove('hidden');
                } else {
                    colorPicker?.classList.add('hidden');
                }

                // Update renderer
                const updateObj = colorTarget === 'character'
                    ? { characterColorMode: mode }
                    : { backgroundColorMode: mode };

                switch (currentRenderer) {
                    case 'brightness':
                        brightnessRenderer.update(updateObj);
                        break;
                    case 'edge':
                        edgeRenderer.update(updateObj);
                        break;
                    case 'chars':
                        charsRenderer.update(updateObj);
                        break;
                    case 'background':
                        backgroundRenderer.update(updateObj);
                        break;
                }
            });
        });

        // Color picker event listeners
        const characterColorPicker = document.getElementById('character-color') as HTMLInputElement;
        const backgroundColorPicker = document.getElementById('background-color') as HTMLInputElement;

        characterColorPicker.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const color = target.value;

            switch (currentRenderer) {
                case 'brightness':
                    brightnessRenderer.update({ characterColor: color });
                    break;
                case 'edge':
                    edgeRenderer.update({ characterColor: color });
                    break;
                case 'chars':
                    charsRenderer.update({ characterColor: color });
                    break;
                case 'background':
                    backgroundRenderer.update({ characterColor: color });
                    break;
            }
        });

        backgroundColorPicker.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const color = target.value;

            switch (currentRenderer) {
                case 'brightness':
                    brightnessRenderer.update({ backgroundColor: color });
                    break;
                case 'edge':
                    edgeRenderer.update({ backgroundColor: color });
                    break;
                case 'chars':
                    charsRenderer.update({ backgroundColor: color });
                    break;
                case 'background':
                    backgroundRenderer.update({ backgroundColor: color });
                    break;
            }
        });
    };
});

export default sketch;