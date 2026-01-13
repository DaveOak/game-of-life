// Game configuration
const MAX_GRID_SIZE = 500;
const MIN_CELL_SIZE = 3;
let gridSize = 100;
let cellSize = 6;

// Game state
let grid = [];
let initialState = [];
let isRunning = false;
let generation = 0;
let intervalId = null;
let speed = 10;

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const genCount = document.getElementById('genCount');
const gridSizeInput = document.getElementById('gridSizeInput');
const gridSizeDisplay = document.getElementById('gridSizeDisplay');
const applySizeBtn = document.getElementById('applySizeBtn');

// Calculate cell size based on grid size
function calculateCellSize() {
    // Keep cells at minimum visible size, let canvas grow larger
    cellSize = MIN_CELL_SIZE;
}

// Update canvas size
function updateCanvasSize() {
    calculateCellSize();
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
}

// Initialize canvas
updateCanvasSize();

// Create empty grid
function createEmptyGrid() {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            newGrid[i][j] = 0;
        }
    }
    return newGrid;
}

// Copy grid
function copyGrid(source) {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = [...source[i]];
    }
    return newGrid;
}

// Initialize game
function init() {
    grid = createEmptyGrid();
    initialState = createEmptyGrid();
    generation = 0;
    updateGeneration();
    draw();
}

// Count neighbors
function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = (x + i + gridSize) % gridSize;
            const ny = (y + j + gridSize) % gridSize;
            count += grid[nx][ny];
        }
    }
    return count;
}

// Compute next generation
function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const neighbors = countNeighbors(i, j);
            const cell = grid[i][j];

            if (cell === 1) {
                // Live cell with 2 or 3 neighbors survives
                newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
            } else {
                // Dead cell with exactly 3 neighbors becomes alive
                newGrid[i][j] = (neighbors === 3) ? 1 : 0;
            }
        }
    }

    grid = newGrid;
    generation++;
    updateGeneration();
}

// Update generation display
function updateGeneration() {
    genCount.textContent = generation;
}

// Draw the grid
function draw() {
    const canvasSize = gridSize * cellSize;

    // Clear canvas
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw cells
    ctx.fillStyle = '#00d4ff';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 1) {
                ctx.fillRect(
                    i * cellSize + 1,
                    j * cellSize + 1,
                    cellSize - 1,
                    cellSize - 1
                );
            }
        }
    }

    // Draw grid lines (only if cells are large enough)
    if (cellSize >= 3) {
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvasSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvasSize, i * cellSize);
            ctx.stroke();
        }
    }
}

// Game loop
function gameLoop() {
    nextGeneration();
    draw();
}

// Start simulation
function play() {
    if (isRunning) return;
    isRunning = true;
    // Save initial state when first starting
    if (generation === 0) {
        initialState = copyGrid(grid);
    }
    intervalId = setInterval(gameLoop, 1000 / speed);
}

// Pause simulation
function pause() {
    isRunning = false;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Reset to initial state
function reset() {
    pause();
    grid = copyGrid(initialState);
    generation = 0;
    updateGeneration();
    draw();
}

// Clear grid
function clear() {
    pause();
    grid = createEmptyGrid();
    initialState = createEmptyGrid();
    generation = 0;
    updateGeneration();
    draw();
}

// Randomize grid
function randomize() {
    pause();
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.random() < 0.3 ? 1 : 0;
        }
    }
    initialState = copyGrid(grid);
    generation = 0;
    updateGeneration();
    draw();
}

// Update speed
function updateSpeed(newSpeed) {
    speed = newSpeed;
    speedValue.textContent = speed;
    if (isRunning) {
        pause();
        play();
    }
}

// Apply new grid size
function applyGridSize() {
    let newSize = parseInt(gridSizeInput.value);

    // Clamp to valid range
    if (isNaN(newSize) || newSize < 10) newSize = 10;
    if (newSize > MAX_GRID_SIZE) newSize = MAX_GRID_SIZE;

    gridSizeInput.value = newSize;
    gridSizeDisplay.textContent = newSize;

    pause();
    gridSize = newSize;
    updateCanvasSize();
    grid = createEmptyGrid();
    initialState = createEmptyGrid();
    generation = 0;
    updateGeneration();
    draw();
}

// Update display when input changes
function updateGridSizeDisplay() {
    gridSizeDisplay.textContent = gridSizeInput.value;
}

// Handle canvas drag for drawing
let isDrawing = false;
let drawMode = 1;

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        isDrawing = true;
        drawMode = grid[x][y] ? 0 : 1;
        grid[x][y] = drawMode;
        draw();
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        grid[x][y] = drawMode;
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Event listeners
playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
clearBtn.addEventListener('click', clear);
randomBtn.addEventListener('click', randomize);
speedSlider.addEventListener('input', (e) => updateSpeed(parseInt(e.target.value)));
applySizeBtn.addEventListener('click', applyGridSize);
gridSizeInput.addEventListener('input', updateGridSizeDisplay);

// Initialize game
init();
