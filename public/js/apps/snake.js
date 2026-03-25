export function getSnakeHTML() {
    return `
        <div class="snake-app">
            <div class="snake-header">
                <span id="snake-score">Score: 0</span>
                <button id="snake-start">Start</button>
            </div>
            <div class="snake-canvas-container">
                <canvas id="snake-canvas" width="300" height="300"></canvas>
                <div id="snake-overlay" class="snake-overlay">Press Start to Play</div>
            </div>
            <div class="snake-controls">
                <span>Use Arrow Keys to Move</span>
            </div>
        </div>
    `;
}

export function initSnake(windowEl) {
    const canvas = windowEl.querySelector('#snake-canvas');
    const ctx = canvas.getContext('2d');
    const btnStart = windowEl.querySelector('#snake-start');
    const scoreEl = windowEl.querySelector('#snake-score');
    const overlay = windowEl.querySelector('#snake-overlay');

    const gridSize = 15;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let isPlaying = false;
    let gameLoop;
    let nextDx = 0;
    let nextDy = 0;

    function resetGame() {
        snake = [{x: 10, y: 10}];
        dx = 0;
        dy = 0;
        nextDx = 0;
        nextDy = 0;
        score = 0;
        scoreEl.textContent = `Score: ${score}`;
        spawnFood();
    }

    function spawnFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Ensure food doesn't spawn on snake
        snake.forEach(part => {
            if(part.x === food.x && part.y === food.y) {
                spawnFood();
            }
        });
    }

    function update() {
        if (!isPlaying) return;

        // Apply input
        dx = nextDx;
        dy = nextDy;

        if (dx === 0 && dy === 0) return; // Haven't started moving yet

        const head = {x: snake[0].x + dx, y: snake[0].y + dy};

        // Wall Collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self Collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head); // Add new head

        // Food Collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = `Score: ${score}`;
            spawnFood();
        } else {
            snake.pop(); // Remove tail
        }
    }

    function draw() {
        // Clear background
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        ctx.fillStyle = '#0be881';
        snake.forEach(part => {
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
        });

        // Draw food
        ctx.fillStyle = '#ff3f34';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
    }

    function loop() {
        update();
        draw();
    }

    function gameOver() {
        clearInterval(gameLoop);
        isPlaying = false;
        overlay.style.display = 'flex';
        overlay.textContent = `Game Over! Score: ${score}`;
        btnStart.textContent = 'Restart';
    }

    function startGame() {
        if (isPlaying) return;
        resetGame();
        isPlaying = true;
        overlay.style.display = 'none';
        btnStart.textContent = 'Playing...';

        // Initial movement down
        nextDx = 0;
        nextDy = 1;

        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(loop, 100);
    }

    // Keyboard listener (bound to document so it captures input anywhere)
    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;

        switch (e.key) {
            case 'ArrowUp':
                if (dy !== 1) { nextDx = 0; nextDy = -1; }
                break;
            case 'ArrowDown':
                if (dy !== -1) { nextDx = 0; nextDy = 1; }
                break;
            case 'ArrowLeft':
                if (dx !== 1) { nextDx = -1; nextDy = 0; }
                break;
            case 'ArrowRight':
                if (dx !== -1) { nextDx = 1; nextDy = 0; }
                break;
        }
    });

    btnStart.addEventListener('click', startGame);

    // Initial draw
    draw();
}