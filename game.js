// Game configuration
const MAX_GRID_SIZE = 500;
const MIN_CELL_SIZE = 3;
let gridSize = 100;
let cellSize = 6;

// Display colors based on dominant genetic value
const COLORS = {
    0: '#ff4444', // Red (first gene dominant)
    1: '#44ff44', // Green (second gene dominant)
    2: '#4444ff'  // Blue (third gene dominant)
};

// Get display color based on dominant genetic value
function cellToColor(cell) {
    let maxIndex = 0;
    if (cell.genes[1] >= cell.genes[0] && cell.genes[1] >= cell.genes[2]) maxIndex = 1;
    else if (cell.genes[2] >= cell.genes[0] && cell.genes[2] >= cell.genes[1]) maxIndex = 2;
    return COLORS[maxIndex];
}

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

// Create a dead cell (null)
function createDeadCell() {
    return null;
}

// Create a live cell with three random genetic values
function createLiveCell() {
    return {
        genes: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
    };
}

// Create empty grid
function createEmptyGrid() {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            newGrid[i][j] = createDeadCell();
        }
    }
    return newGrid;
}

// Deep copy grid
function copyGrid(source) {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            if (source[i][j]) {
                newGrid[i][j] = { genes: [...source[i][j].genes] };
            } else {
                newGrid[i][j] = null;
            }
        }
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

// Get all living neighbors
function getLivingNeighbors(x, y) {
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = (x + i + gridSize) % gridSize;
            const ny = (y + j + gridSize) % gridSize;
            if (grid[nx][ny]) {
                neighbors.push(grid[nx][ny]);
            }
        }
    }
    return neighbors;
}

// Create a new cell from exactly 3 parent neighbors
// Each parent contributes one randomly selected gene from their genes array
function createChildCell(parents) {
    const genes = parents.map(parent => {
        const choice = Math.floor(Math.random() * 3);
        return parent.genes[choice];
    });
    return { genes };
}

// Compute next generation
function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const neighbors = getLivingNeighbors(i, j);
            const neighborCount = neighbors.length;
            const cell = grid[i][j];

            if (cell) {
                // Live cell with 2 or 3 neighbors survives
                if (neighborCount === 2 || neighborCount === 3) {
                    newGrid[i][j] = { genes: [...cell.genes] };
                }
            } else {
                // Dead cell with exactly 3 neighbors becomes alive
                if (neighborCount === 3) {
                    newGrid[i][j] = createChildCell(neighbors);
                }
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
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = grid[i][j];
            if (cell) {
                ctx.fillStyle = cellToColor(cell);
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
    if (cellSize >= 4) {
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
            grid[i][j] = Math.random() < 0.3 ? createLiveCell() : createDeadCell();
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
let drawMode = 1; // 1 = create cells, 0 = delete cells

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        isDrawing = true;
        drawMode = grid[x][y] ? 0 : 1;
        grid[x][y] = drawMode ? createLiveCell() : createDeadCell();
        draw();
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        grid[x][y] = drawMode ? createLiveCell() : createDeadCell();
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
