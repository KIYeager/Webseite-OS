export function getMinesweeperHTML() {
    return `
        <div class="minesweeper-app">
            <div class="minesweeper-header">
                <span id="minesweeper-bombs">010</span>
                <button id="minesweeper-start">😊</button>
                <span id="minesweeper-timer">000</span>
            </div>
            <div id="minesweeper-grid" class="minesweeper-grid"></div>
            <style>
                .minesweeper-app { display: flex; flex-direction: column; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; padding: 5px; font-family: 'Courier New', Courier, monospace; }
                .minesweeper-header { display: flex; justify-content: space-between; background: #c0c0c0; border: 2px solid #808080; border-right-color: #fff; border-bottom-color: #fff; padding: 5px; margin-bottom: 5px; align-items: center; }
                .minesweeper-header span { background: black; color: red; font-size: 20px; padding: 2px 5px; font-weight: bold; }
                .minesweeper-start { font-size: 20px; cursor: pointer; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; background: #c0c0c0; padding: 2px; }
                .minesweeper-start:active { border-color: #808080 #fff #fff #808080; }
                .minesweeper-grid { display: grid; grid-template-columns: repeat(9, 20px); grid-template-rows: repeat(9, 20px); border: 2px solid #808080; border-right-color: #fff; border-bottom-color: #fff; background: #c0c0c0; gap: 0; }
                .ms-cell { width: 20px; height: 20px; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; display: flex; justify-content: center; align-items: center; font-weight: bold; cursor: default; user-select: none; font-size: 14px; box-sizing: border-box;}
                .ms-cell.revealed { border: 1px solid #808080; background: #c0c0c0; }
                .ms-cell.flagged { color: red; }
                .ms-cell.bomb { background: red; }
                .ms-1 { color: blue; }
                .ms-2 { color: green; }
                .ms-3 { color: red; }
                .ms-4 { color: darkblue; }
                .ms-5 { color: darkred; }
                .ms-6 { color: darkcyan; }
                .ms-7 { color: black; }
                .ms-8 { color: gray; }
            </style>
        </div>
    `;
}

export function initMinesweeper(windowEl) {
    const gridEl = windowEl.querySelector('#minesweeper-grid');
    const btnStart = windowEl.querySelector('#minesweeper-start');
    const bombsEl = windowEl.querySelector('#minesweeper-bombs');
    const timerEl = windowEl.querySelector('#minesweeper-timer');

    const ROWS = 9;
    const COLS = 9;
    const BOMBS = 10;

    let grid = [];
    let isGameOver = false;
    let timerInterval;
    let seconds = 0;
    let firstClick = true;
    let flagsLeft = BOMBS;

    function formatNumber(num) {
        return num.toString().padStart(3, '0');
    }

    function initGame() {
        isGameOver = false;
        firstClick = true;
        flagsLeft = BOMBS;
        seconds = 0;
        bombsEl.textContent = formatNumber(flagsLeft);
        timerEl.textContent = formatNumber(seconds);
        btnStart.textContent = '😊';
        clearInterval(timerInterval);

        // Generate grid UI
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${COLS}, 20px)`;
        gridEl.style.gridTemplateRows = `repeat(${ROWS}, 20px)`;

        grid = [];
        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('ms-cell');
                cell.dataset.r = r;
                cell.dataset.c = c;

                cell.addEventListener('mousedown', handleCellClick);
                cell.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent right-click menu

                gridEl.appendChild(cell);
                row.push({
                    el: cell,
                    r, c,
                    isBomb: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborBombs: 0
                });
            }
            grid.push(row);
        }
    }

    function placeBombs(firstR, firstC) {
        let bombsPlaced = 0;
        while (bombsPlaced < BOMBS) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);

            // Don't place bomb on first click or if already a bomb
            if (!grid[r][c].isBomb && !(r === firstR && c === firstC)) {
                grid[r][c].isBomb = true;
                bombsPlaced++;
            }
        }

        // Calculate neighbors
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!grid[r][c].isBomb) {
                    let count = 0;
                    getNeighbors(r, c).forEach(n => {
                        if (n.isBomb) count++;
                    });
                    grid[r][c].neighborBombs = count;
                }
            }
        }
    }

    function getNeighbors(r, c) {
        let neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let nr = r + i, nc = c + j;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    neighbors.push(grid[nr][nc]);
                }
            }
        }
        return neighbors;
    }

    function handleCellClick(e) {
        if (isGameOver) return;

        let cellDiv = e.target;
        let r = parseInt(cellDiv.dataset.r);
        let c = parseInt(cellDiv.dataset.c);
        let cell = grid[r][c];

        // Right click (Flag)
        if (e.button === 2) {
            if (cell.isRevealed) return;

            cell.isFlagged = !cell.isFlagged;
            cellDiv.textContent = cell.isFlagged ? '🚩' : '';
            flagsLeft += cell.isFlagged ? -1 : 1;
            bombsEl.textContent = formatNumber(flagsLeft);
            checkWin();
            return;
        }

        // Left click
        if (e.button === 0) {
            if (cell.isFlagged || cell.isRevealed) return;

            if (firstClick) {
                firstClick = false;
                placeBombs(r, c);
                timerInterval = setInterval(() => {
                    seconds++;
                    if (seconds > 999) seconds = 999;
                    timerEl.textContent = formatNumber(seconds);
                }, 1000);
            }

            if (cell.isBomb) {
                gameOver(false);
                cellDiv.classList.add('bomb');
                cellDiv.textContent = '💣';
            } else {
                revealCell(r, c);
                checkWin();
            }
        }
    }

    function revealCell(r, c) {
        let cell = grid[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        cell.el.classList.add('revealed');
        cell.el.style.border = '1px solid #808080';

        if (cell.neighborBombs > 0) {
            cell.el.textContent = cell.neighborBombs;
            cell.el.classList.add(`ms-${cell.neighborBombs}`);
        } else {
            // Flood fill for 0 bombs
            getNeighbors(r, c).forEach(n => {
                if (!n.isRevealed && !n.isBomb) {
                    revealCell(n.r, n.c);
                }
            });
        }
    }

    function gameOver(win) {
        isGameOver = true;
        clearInterval(timerInterval);
        btnStart.textContent = win ? '😎' : '😵';

        // Reveal all bombs
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let cell = grid[r][c];
                if (cell.isBomb && !cell.isFlagged) {
                    cell.el.textContent = '💣';
                    if (!win) cell.el.classList.add('revealed');
                } else if (!cell.isBomb && cell.isFlagged) {
                    cell.el.textContent = '❌'; // False flag
                }
            }
        }
    }

    function checkWin() {
        let revealedCount = 0;
        let correctFlags = 0;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c].isRevealed) revealedCount++;
                if (grid[r][c].isBomb && grid[r][c].isFlagged) correctFlags++;
            }
        }

        // Win if all non-bombs revealed, OR all bombs correctly flagged
        if (revealedCount === (ROWS * COLS - BOMBS) || correctFlags === BOMBS) {
            gameOver(true);
        }
    }

    btnStart.addEventListener('click', initGame);

    initGame();
}
