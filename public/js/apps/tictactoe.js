export function getTicTacToeHTML() {
    return `
        <div class="ttt-app">
            <div class="ttt-status" id="ttt-status">Choose mode</div>
            <div id="ttt-menu" style="display:flex; gap:10px; justify-content:center; margin-bottom:10px;">
                <button id="ttt-btn-ai">Play AI</button>
                <button id="ttt-btn-mp">Play Multiplayer</button>
            </div>
            <div class="ttt-board" id="ttt-board" style="display:none;">
                <div class="ttt-cell" data-idx="0"></div>
                <div class="ttt-cell" data-idx="1"></div>
                <div class="ttt-cell" data-idx="2"></div>
                <div class="ttt-cell" data-idx="3"></div>
                <div class="ttt-cell" data-idx="4"></div>
                <div class="ttt-cell" data-idx="5"></div>
                <div class="ttt-cell" data-idx="6"></div>
                <div class="ttt-cell" data-idx="7"></div>
                <div class="ttt-cell" data-idx="8"></div>
            </div>
            <button id="ttt-restart" style="display:none;">Restart Game</button>
        </div>
    `;
}

export function initTicTacToe(windowEl) {
    const boardEl = windowEl.querySelector('#ttt-board');
    const cells = windowEl.querySelectorAll('.ttt-cell');
    const status = windowEl.querySelector('#ttt-status');
    const btnRestart = windowEl.querySelector('#ttt-restart');
    const btnAi = windowEl.querySelector('#ttt-btn-ai');
    const btnMp = windowEl.querySelector('#ttt-btn-mp');
    const menuEl = windowEl.querySelector('#ttt-menu');

    let board = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = false;
    let isPlayerTurn = false;
    let mode = ''; // 'ai' or 'multiplayer'

    // Multiplayer vars
    let socket = null;
    let myRole = null; // 'X' or 'O'
    let currentTurn = 'X';
    let roomName = null;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleResultValidation() {
        let roundWon = false;
        let winningChar = null;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                winningChar = a;
                break;
            }
        }

        if (roundWon) {
            if (mode === 'ai') {
                status.textContent = winningChar === 'X' ? 'You Win!' : 'AI Wins!';
            } else {
                status.textContent = winningChar === myRole ? 'You Win!' : 'Opponent Wins!';
            }
            isGameActive = false;
            return;
        }

        let roundDraw = !board.includes("");
        if (roundDraw) {
            status.textContent = 'Draw!';
            isGameActive = false;
            return;
        }

        if (mode === 'ai') {
            isPlayerTurn = !isPlayerTurn;
            if (isPlayerTurn) {
                status.textContent = "Your turn (X)";
            } else {
                status.textContent = "AI's turn (O)";
                setTimeout(makeAiMove, 500);
            }
        } else if (mode === 'multiplayer') {
            currentTurn = currentTurn === 'X' ? 'O' : 'X';
            if (currentTurn === myRole) {
                status.textContent = `Your turn (${myRole})`;
            } else {
                status.textContent = `Opponent's turn (${currentTurn})`;
            }
        }
    }

    function makeMove(idx, char) {
        board[idx] = char;
        cells[idx].textContent = char;
        cells[idx].classList.add(char.toLowerCase());
        handleResultValidation();
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-idx'));

        if (board[clickedCellIndex] !== "" || !isGameActive) return;

        if (mode === 'ai' && !isPlayerTurn) return;
        if (mode === 'multiplayer' && currentTurn !== myRole) return;

        const char = mode === 'ai' ? 'X' : myRole;
        makeMove(clickedCellIndex, char);

        if (mode === 'multiplayer') {
            socket.emit('ttt_move', { room: roomName, idx: clickedCellIndex, char });
        }
    }

    function makeAiMove() {
        if (!isGameActive) return;
        let emptyCells = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") emptyCells.push(i);
        }
        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            makeMove(randomIndex, "O");
        }
    }

    function restartGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove('x', 'o');
        });

        if (mode === 'ai') {
            isGameActive = true;
            isPlayerTurn = true;
            status.textContent = "Your turn (X)";
        } else if (mode === 'multiplayer') {
            socket.emit('ttt_restart', { room: roomName });
            isGameActive = true;
            currentTurn = 'X';
            status.textContent = myRole === 'X' ? "Your turn (X)" : "Opponent's turn (X)";
        }
    }

    function startGame(selectedMode) {
        mode = selectedMode;
        menuEl.style.display = 'none';
        boardEl.style.display = 'grid';
        btnRestart.style.display = 'block';

        if (mode === 'ai') {
            isGameActive = true;
            isPlayerTurn = true;
            status.textContent = "Your turn (X)";
        } else {
            status.textContent = "Connecting to server...";
            btnRestart.style.display = 'none'; // Only show after game starts

            socket = window.io();
            socket.emit('join_game', 'tictactoe');

            socket.on('waiting', (msg) => {
                status.textContent = msg;
            });

            socket.on('game_start', (data) => {
                myRole = data.role;
                roomName = data.room;
                isGameActive = true;
                currentTurn = 'X';
                btnRestart.style.display = 'block';
                status.textContent = myRole === 'X' ? "Game Started. Your turn (X)" : "Game Started. Opponent's turn (X)";
            });

            socket.on('ttt_move', (data) => {
                makeMove(data.idx, data.char);
            });

            socket.on('ttt_restart', () => {
                board = ['', '', '', '', '', '', '', '', ''];
                cells.forEach(cell => {
                    cell.textContent = "";
                    cell.classList.remove('x', 'o');
                });
                isGameActive = true;
                currentTurn = 'X';
                status.textContent = myRole === 'X' ? "Your turn (X)" : "Opponent's turn (X)";
            });

            socket.on('opponent_disconnected', () => {
                isGameActive = false;
                status.textContent = 'Opponent disconnected.';
            });
        }
    }

    btnAi.addEventListener('click', () => startGame('ai'));
    btnMp.addEventListener('click', () => startGame('multiplayer'));

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    btnRestart.addEventListener('click', restartGame);
}