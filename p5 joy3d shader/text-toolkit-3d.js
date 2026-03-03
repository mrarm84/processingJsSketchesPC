const TEXTURE_CONFIG = {
    TEXT_SIZE_MULTIPLIER: 1.6,        // テキストサイズ調整倍率
    BOTH_SIDES_MULTIPLIER: 1.2,       // 両面描画サイズ倍率
    VERTICAL_OFFSET_RATIO: 0.1,       // テキスト縦位置調整比率
    MIN_CANVAS_SIZE: 500,             // 最小キャンバスサイズ
    BACKFACE_Z_OFFSET: -2             // 裏面のZ座標オフセット
};

const VALIDATION_CONFIG = {
    MIN_FONT_SIZE: 1,                 // 最小フォントサイズ
    MAX_FONT_SIZE: 5000,              // 最大フォントサイズ（3D用に拡大5
    MIN_CANVAS_SIZE: 50,              // 最小キャンバスサイズ
    MAX_CANVAS_SIZE: 8192,            // 最大キャンバスサイズ（高解像度対応）
    DEFAULT_FONT_SIZE: 200,           // デフォルトフォントサイズ
    DEFAULT_TEXT: 'A'                 // デフォルトテキスト
};

function validateFontSize(fontSize) {
    if (typeof fontSize !== 'number' || isNaN(fontSize)) {
        console.warn('フォントサイズが無効です。デフォルト値を使用します:', VALIDATION_CONFIG.DEFAULT_FONT_SIZE);
        return VALIDATION_CONFIG.DEFAULT_FONT_SIZE;
    }
    if (fontSize < VALIDATION_CONFIG.MIN_FONT_SIZE) {
        console.info('フォントサイズを最小値に調整しました:', VALIDATION_CONFIG.MIN_FONT_SIZE);
        return VALIDATION_CONFIG.MIN_FONT_SIZE;
    }
    if (fontSize > VALIDATION_CONFIG.MAX_FONT_SIZE) {
        console.info('フォントサイズを最大値に調整しました:', VALIDATION_CONFIG.MAX_FONT_SIZE);
        return VALIDATION_CONFIG.MAX_FONT_SIZE;
    }
    return fontSize;
}

function validateText(text) {
    if (typeof text !== 'string') {
        console.warn('テキストが文字列ではありません。デフォルト値を使用します:', VALIDATION_CONFIG.DEFAULT_TEXT);
        return VALIDATION_CONFIG.DEFAULT_TEXT;
    }
    if (text.length === 0) {
        console.warn('テキストが空です。デフォルト値を使用します:', VALIDATION_CONFIG.DEFAULT_TEXT);
        return VALIDATION_CONFIG.DEFAULT_TEXT;
    }
    return text;
}



// =============================================================================
// メイン関数
// =============================================================================

const textTextureCache = new Map();

function createTextTexture(text, size = 200, canvasSize = null) {
    text = validateText(text);
    size = validateFontSize(size);
    if (canvasSize === null) {
        canvasSize = Math.max(TEXTURE_CONFIG.MIN_CANVAS_SIZE, size * TEXTURE_CONFIG.TEXT_SIZE_MULTIPLIER);
    } else {
        if (typeof canvasSize !== 'number' || isNaN(canvasSize)) {
            console.warn('キャンバスサイズが無効です。自動計算します:', canvasSize);
            canvasSize = Math.max(TEXTURE_CONFIG.MIN_CANVAS_SIZE, size * TEXTURE_CONFIG.TEXT_SIZE_MULTIPLIER);
        } else {
            canvasSize = Math.max(VALIDATION_CONFIG.MIN_CANVAS_SIZE, Math.min(VALIDATION_CONFIG.MAX_CANVAS_SIZE, canvasSize));
        }
    }
    const cacheKey = `${text}_${size}_${canvasSize}`;
    if (textTextureCache.has(cacheKey)) {
        return textTextureCache.get(cacheKey);
    }
    if (typeof createGraphics !== 'function') {
        console.error('createGraphics関数が利用できません。p5.jsが読み込まれているか確認してください');
        return null;
    }

    const textCanvas = createGraphics(canvasSize, canvasSize);
    if (!textCanvas) {
        console.error('テキストキャンバスの作成に失敗しました');
        return null;
    }

    textCanvas.clear();
    textCanvas.background(0, 0);
    textCanvas.fill(255);
    textCanvas.noStroke();
    textCanvas.textAlign(CENTER, CENTER);
    textCanvas.textSize(size);

    let adjustedY;
    if (typeof font !== 'undefined' && font) {
        textCanvas.textFont(font);
        adjustedY = canvasSize/2 - size * TEXTURE_CONFIG.VERTICAL_OFFSET_RATIO; // フォントによる上下のずれを補正
    } else {
        textCanvas.textFont('Noto Sans JP, sans-serif');
        adjustedY = canvasSize/2;
    }
    textCanvas.text(text, canvasSize/2, adjustedY);
    textTextureCache.set(cacheKey, textCanvas);
    return textCanvas;
}

function setupTextGradient(gradientShader, text, adjustedTextSize, planeSize) {
    const textTexture = createTextTexture(text, adjustedTextSize, planeSize);
    gradientShader.setTexture(textTexture);
    gradientShader.setUseTexture(true);
    gradientShader.apply();
    textureMode(NORMAL);
    textureWrap(CLAMP);
    texture(textTexture);
    noStroke();
}

function drawTextWithGradient(gradientShader, text, size = 200) {
    if (!gradientShader || typeof gradientShader.apply !== 'function') {
        console.error('有効なグラデーションシェーダーが指定されていません');
        return;
    }
    text = validateText(text);
    size = validateFontSize(size);
    const adjustedTextSize = size * TEXTURE_CONFIG.TEXT_SIZE_MULTIPLIER;
    const planeSize = size * TEXTURE_CONFIG.TEXT_SIZE_MULTIPLIER;
    try {
        setupTextGradient(gradientShader, text, adjustedTextSize, planeSize);
        plane(planeSize, planeSize);
    } catch (error) {
        console.error('テキストグラデーション描画でエラーが発生しました:', error);
    }
}

function drawTextWithGradientBothSides(gradientShader, text, size = 200) {
    if (!gradientShader || typeof gradientShader.apply !== 'function') {
        console.error('有効なグラデーションシェーダーが指定されていません');
        return;
    }
    text = validateText(text);
    size = validateFontSize(size);
    const planeSize = size * TEXTURE_CONFIG.BOTH_SIDES_MULTIPLIER;
    const adjustedTextSize = size * TEXTURE_CONFIG.TEXT_SIZE_MULTIPLIER;
    try {
        setupTextGradient(gradientShader, text, adjustedTextSize, planeSize);
        plane(planeSize, planeSize);
        push();
        translate(0, 0, TEXTURE_CONFIG.BACKFACE_Z_OFFSET);
        rotateY(PI);
        plane(planeSize, planeSize);
        pop();
    } catch (error) {
        console.error('両面テキストグラデーション描画でエラーが発生しました:', error);
    }
};
