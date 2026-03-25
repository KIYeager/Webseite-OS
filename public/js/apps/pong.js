export function getPongHTML() {
    return `
        <div class="pong-app" style="display:flex; flex-direction:column; align-items:center; height: 100%; background: #222; color: #fff; padding: 10px; border-radius: 8px;">
            <div id="pong-menu" style="display:flex; gap:10px; margin-bottom:10px;">
                <button id="pong-btn-ai">Play AI</button>
                <button id="pong-btn-mp">Play Multiplayer</button>
            </div>
            <div class="pong-header" style="display:none; justify-content:space-between; width:100%; margin-bottom: 10px; font-family: monospace;">
                <span id="pong-score1">Player 1: 0</span>
                <button id="pong-start" style="padding: 5px 10px; cursor: pointer; background: #555; border: none; color: #fff; border-radius: 4px;">Start</button>
                <span id="pong-score2">Player 2: 0</span>
            </div>
            <div id="pong-canvas-container" style="display:none; position: relative; width: 100%; flex-grow: 1; min-height: 200px;">
                <canvas id="pong-canvas" style="background: #000; width: 100%; height: 100%; display:block; border-radius: 4px; border: 1px solid #444;"></canvas>
                <div id="pong-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); font-weight: bold; font-family: sans-serif;">Press Start to Play</div>
            </div>
            <div id="pong-footer" style="display:none; margin-top: 10px; font-size: 12px; color: #aaa;">
                Player 1: W/S keys | Player 2 (AI): Auto
            </div>
        </div>
    `;
}

export function initPong(windowEl) {
    const canvas = windowEl.querySelector('#pong-canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    const btnStart = windowEl.querySelector('#pong-start');
    const score1El = windowEl.querySelector('#pong-score1');
    const score2El = windowEl.querySelector('#pong-score2');
    const overlay = windowEl.querySelector('#pong-overlay');

    const menuEl = windowEl.querySelector('#pong-menu');
    const headerEl = windowEl.querySelector('.pong-header');
    const canvasContainerEl = windowEl.querySelector('#pong-canvas-container');
    const footerEl = windowEl.querySelector('#pong-footer');
    const btnAi = windowEl.querySelector('#pong-btn-ai');
    const btnMp = windowEl.querySelector('#pong-btn-mp');

    let gameLoop;
    let isPlaying = false;
    let mode = ''; // 'ai' or 'multiplayer'

    // Multiplayer variables
    let socket = null;
    let myRole = null; // 'p1' or 'p2'
    let roomName = null;

    const paddleWidth = 10, paddleHeight = 50;
    let p1 = { x: 10, y: canvas.height/2 - paddleHeight/2, score: 0, dy: 0 };
    let p2 = { x: canvas.width - 20, y: canvas.height/2 - paddleHeight/2, score: 0, dy: 0 };
    let ball = { x: canvas.width/2, y: canvas.height/2, radius: 5, dx: 4, dy: 4 };

    function resetRound() {
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;
        ball.dx = (Math.random() > 0.5 ? 4 : -4);
        ball.dy = (Math.random() * 4) - 2;
    }

    function update() {
        if (!isPlaying) return;

        // Movement for current player
        if (mode === 'ai') {
            p1.y += p1.dy;
            if (p1.y < 0) p1.y = 0;
            if (p1.y + paddleHeight > canvas.height) p1.y = canvas.height - paddleHeight;

            // Player 2 (AI) movement
            const paddleCenter = p2.y + paddleHeight/2;
            if (paddleCenter < ball.y - 10) {
                p2.y += 3;
            } else if (paddleCenter > ball.y + 10) {
                p2.y -= 3;
            }
            if (p2.y < 0) p2.y = 0;
            if (p2.y + paddleHeight > canvas.height) p2.y = canvas.height - paddleHeight;
        } else {
            // Multiplayer movement
            if (myRole === 'p1') {
                p1.y += p1.dy;
                if (p1.y < 0) p1.y = 0;
                if (p1.y + paddleHeight > canvas.height) p1.y = canvas.height - paddleHeight;
                socket.emit('pong_paddle_move', { room: roomName, y: p1.y, role: 'p1' });
            } else {
                p2.y += p2.dy;
                if (p2.y < 0) p2.y = 0;
                if (p2.y + paddleHeight > canvas.height) p2.y = canvas.height - paddleHeight;
                socket.emit('pong_paddle_move', { room: roomName, y: p2.y, role: 'p2' });
            }
        }

        // Ball calculation (only P1 calculates and emits for multiplayer, or AI)
        if (mode === 'ai' || (mode === 'multiplayer' && myRole === 'p1')) {
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall collision (top/bottom)
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.dy *= -1;
            }

            // Paddle collision
            // P1
            if (ball.dx < 0 && ball.x - ball.radius < p1.x + paddleWidth && ball.x + ball.radius > p1.x && ball.y > p1.y && ball.y < p1.y + paddleHeight) {
                ball.dx *= -1.05; // speed up slightly
                ball.x = p1.x + paddleWidth + ball.radius;
                ball.dy = ((ball.y - (p1.y + paddleHeight/2)) / (paddleHeight/2)) * 5; // angle based on hit location
            }
            // P2
            if (ball.dx > 0 && ball.x + ball.radius > p2.x && ball.x - ball.radius < p2.x + paddleWidth && ball.y > p2.y && ball.y < p2.y + paddleHeight) {
                ball.dx *= -1.05;
                ball.x = p2.x - ball.radius;
                ball.dy = ((ball.y - (p2.y + paddleHeight/2)) / (paddleHeight/2)) * 5;
            }

            // Scoring
            let scored = false;
            if (ball.x < 0) {
                p2.score++;
                scored = true;
            } else if (ball.x > canvas.width) {
                p1.score++;
                scored = true;
            }

            if (scored) {
                score1El.textContent = `Player 1: ${p1.score}`;
                score2El.textContent = `Player 2: ${p2.score}`;
                resetRound();

                if (mode === 'multiplayer') {
                    socket.emit('pong_score', { room: roomName, p1Score: p1.score, p2Score: p2.score });
                }

                if(p1.score >= 5 || p2.score >= 5){
                    const msg = p1.score >= 5 ? "Player 1 Wins!" : "Player 2 Wins!";
                    gameOver(msg);
                }
            }

            if (mode === 'multiplayer' && !scored) {
                // Sync ball position
                socket.emit('pong_ball_sync', { room: roomName, ball: ball });
            }
        }
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center dashed line
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, 0);
        ctx.lineTo(canvas.width/2, canvas.height);
        ctx.strokeStyle = '#555';
        ctx.stroke();

        // Paddles
        ctx.fillStyle = '#fff';
        ctx.fillRect(p1.x, p1.y, paddleWidth, paddleHeight);
        ctx.fillRect(p2.x, p2.y, paddleWidth, paddleHeight);

        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
        ctx.fill();
    }

    function loop() {
        update();
        draw();
    }

    function gameOver(msg) {
        clearInterval(gameLoop);
        isPlaying = false;
        overlay.style.display = 'flex';
        overlay.textContent = msg;
        btnStart.textContent = 'Restart';
    }

    function startGame() {
        if (isPlaying) return;
        p1.score = 0;
        p2.score = 0;
        score1El.textContent = `Player 1: 0`;
        score2El.textContent = `Player 2: 0`;
        resetRound();
        isPlaying = true;
        overlay.style.display = 'none';
        btnStart.textContent = 'Playing...';

        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(loop, 1000/60); // 60fps
    }

    function startSelectedMode(selectedMode) {
        mode = selectedMode;
        menuEl.style.display = 'none';
        headerEl.style.display = 'flex';
        canvasContainerEl.style.display = 'block';
        footerEl.style.display = 'block';

        if (mode === 'ai') {
            footerEl.textContent = "Player 1: W/S keys | Player 2 (AI): Auto";
            btnStart.style.display = 'block';
            draw();
        } else {
            footerEl.textContent = "Use W/S keys to move";
            btnStart.style.display = 'none';
            overlay.textContent = "Connecting to server...";

            socket = window.io();
            socket.emit('join_game', 'pong');

            socket.on('waiting', (msg) => {
                overlay.textContent = msg;
                draw();
            });

            socket.on('game_start', (data) => {
                myRole = data.role;
                roomName = data.room;
                p1.score = 0;
                p2.score = 0;
                score1El.textContent = `Player 1: 0`;
                score2El.textContent = `Player 2: 0`;
                overlay.style.display = 'none';
                isPlaying = true;

                if (myRole === 'p1') {
                    resetRound();
                }

                if (gameLoop) clearInterval(gameLoop);
                gameLoop = setInterval(loop, 1000/60);
            });

            socket.on('pong_paddle_move', (data) => {
                if (data.role === 'p1') p1.y = data.y;
                if (data.role === 'p2') p2.y = data.y;
            });

            socket.on('pong_ball_sync', (data) => {
                ball = data.ball;
            });

            socket.on('pong_score', (data) => {
                p1.score = data.p1Score;
                p2.score = data.p2Score;
                score1El.textContent = `Player 1: ${p1.score}`;
                score2El.textContent = `Player 2: ${p2.score}`;
                if(p1.score >= 5 || p2.score >= 5){
                    const msg = p1.score >= 5 ? "Player 1 Wins!" : "Player 2 Wins!";
                    gameOver(msg);
                }
            });

            socket.on('opponent_disconnected', () => {
                gameOver('Opponent disconnected.');
            });
        }
    }

    // Controls
    // Using a keydown/keyup on the document is okay for a simple game,
    // but in a window manager, it will capture input even if window isn't focused.
    // For now, it matches previous behavior.
    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if (mode === 'ai') {
            if (e.key === 'w' || e.key === 'W') p1.dy = -4;
            if (e.key === 's' || e.key === 'S') p1.dy = 4;
        } else if (mode === 'multiplayer') {
            if (myRole === 'p1') {
                if (e.key === 'w' || e.key === 'W') p1.dy = -4;
                if (e.key === 's' || e.key === 'S') p1.dy = 4;
            } else {
                if (e.key === 'w' || e.key === 'W') p2.dy = -4;
                if (e.key === 's' || e.key === 'S') p2.dy = 4;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (mode === 'ai') {
            if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') p1.dy = 0;
        } else if (mode === 'multiplayer') {
            if (myRole === 'p1') {
                if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') p1.dy = 0;
            } else {
                if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') p2.dy = 0;
            }
        }
    });

    btnStart.addEventListener('click', startGame);
    btnAi.addEventListener('click', () => startSelectedMode('ai'));
    btnMp.addEventListener('click', () => startSelectedMode('multiplayer'));
}
