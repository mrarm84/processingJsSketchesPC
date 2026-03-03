const canvas = document.getElementById('processingCanvas');
const sketchSelect = document.getElementById('sketchSelect');
const randomizeBtn = document.getElementById('randomizeBtn');
let currentSketch = null;
let currentSketchData = null;
let processingInstance = null;

const sketches = [];

async function loadSketches() {
    try {
        const response = await fetch('sketches/index.json');
        const data = await response.json();
        sketches.push(...data);
        populateSelectBox();
    } catch (error) {
        console.error('Failed to load sketches:', error);
        createDefaultSketches();
    }
}

function createDefaultSketches() {
    const defaultSketches = [
        { id: 'sketch001', name: 'Particle System', files: ['sketch.pde'] },
        { id: 'sketch002', name: 'Wave Patterns', files: ['sketch.pde', 'wave.js'] },
        { id: 'sketch003', name: 'Generative Art', files: ['sketch.pde', 'shapes.js', 'colors.js'] }
    ];
    sketches.push(...defaultSketches);
    populateSelectBox();
}

function populateSelectBox() {
    sketchSelect.innerHTML = '<option value="">Select a sketch...</option>';
    sketches.forEach(sketch => {
        const option = document.createElement('option');
        option.value = sketch.id;
        option.textContent = sketch.name;
        sketchSelect.appendChild(option);
    });
}

async function loadSketch(sketchId) {
    if (!sketchId) return;

    const sketch = sketches.find(s => s.id === sketchId);
    if (!sketch) return;

    randomizeBtn.disabled = true;

    if (processingInstance) {
        await hideCurrentSketch();
    }

    try {
        const sketchFiles = {};
        
        for (const file of sketch.files) {
            const response = await fetch(`sketches/${sketchId}/${file}`);
            const content = await response.text();
            sketchFiles[file] = content;
        }

        currentSketchData = {
            id: sketch.id,
            files: sketchFiles,
            params: extractParams(sketchFiles)
        };

        const combinedCode = combineSketchFiles(sketchFiles);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        processingInstance = new Processing(canvas, combinedCode);
        
        showSketch();

    } catch (error) {
        console.error('Failed to load sketch:', error);
    }
}

function combineSketchFiles(sketchFiles) {
    let combined = '';
    
    const pdeFiles = Object.entries(sketchFiles)
        .filter(([filename]) => filename.endsWith('.pde'))
        .sort(([a], [b]) => {
            if (a === 'sketch.pde') return -1;
            if (b === 'sketch.pde') return 1;
            return a.localeCompare(b);
        })
        .map(([, content]) => content)
        .join('\n\n');

    const jsFiles = Object.entries(sketchFiles)
        .filter(([filename]) => filename.endsWith('.js'))
        .map(([, content]) => content)
        .join('\n\n');

    combined = pdeFiles + '\n\n' + jsFiles;
    
    return combined;
}

function extractParams(sketchFiles) {
    const params = {};
    
    const paramRegex = /let\s+(\w+)\s*=\s*(\d+\.?\d*)/g;
    
    for (const [filename, content] of Object.entries(sketchFiles)) {
        let match;
        while ((match = paramRegex.exec(content)) !== null) {
            const paramName = match[1];
            const paramValue = parseFloat(match[2]);
            
            if (!params[filename]) {
                params[filename] = {};
            }
            params[filename][paramName] = paramValue;
        }
    }
    
    return params;
}

async function hideCurrentSketch() {
    return new Promise((resolve) => {
        canvas.classList.remove('visible');
        canvas.classList.add('hiding');
        
        setTimeout(() => {
            if (processingInstance) {
                processingInstance.exit();
                processingInstance = null;
            }
            currentSketchData = null;
            resolve();
        }, 800);
    });
}

function showSketch() {
    canvas.classList.remove('hiding');
    canvas.classList.add('visible');
    randomizeBtn.disabled = false;
}

function randomizeParams() {
    if (!currentSketchData || Object.keys(currentSketchData.params).length === 0) {
        alert('No parameters found to randomize');
        return;
    }

    const originalParams = JSON.parse(JSON.stringify(currentSketchData.params));

    for (const filename in currentSketchData.params) {
        for (const paramName in currentSketchData.params[filename]) {
            const currentValue = currentSketchData.params[filename][paramName];
            const changePercent = 0.01 + Math.random() * 0.02;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const newValue = currentValue * (1 + (changePercent * direction));
            currentSketchData.params[filename][paramName] = newValue;
        }
    }

    reloadSketchWithNewParams(originalParams);
}

async function reloadSketchWithNewParams(originalParams) {
    await hideCurrentSketch();
    
    const sketchId = currentSketchData.id;
    const sketch = sketches.find(s => s.id === sketchId);
    
    const sketchFiles = {};
    for (const file of sketch.files) {
        let content = currentSketchData.files[file];
        
        if (originalParams[file]) {
            for (const paramName in originalParams[file]) {
                const oldValue = originalParams[file][paramName];
                const newValue = currentSketchData.params[file][paramName];
                
                const regex = new RegExp(`let\\s+${paramName}\\s*=\\s*${oldValue}`, 'g');
                content = content.replace(regex, `let ${paramName} = ${newValue.toFixed(6)}`);
            }
        }
        
        sketchFiles[file] = content;
    }

    currentSketchData.files = sketchFiles;

    const combinedCode = combineSketchFiles(sketchFiles);
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    processingInstance = new Processing(canvas, combinedCode);
    
    showSketch();
}

sketchSelect.addEventListener('change', (e) => {
    loadSketch(e.target.value);
});

randomizeBtn.addEventListener('click', randomizeParams);

window.addEventListener('resize', () => {
    if (processingInstance && canvas.width > 0 && canvas.height > 0) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

loadSketches();