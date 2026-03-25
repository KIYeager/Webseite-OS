export function getMemoryHTML() {
    return `
        <div class="memory-app">
            <div class="memory-header">
                <span id="memory-moves">Moves: 0</span>
                <button id="memory-start">Restart</button>
                <span id="memory-timer">00:00</span>
            </div>
            <div id="memory-grid" class="memory-grid">
                <!-- Cards will be generated here -->
            </div>
            <style>
                .memory-app { display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; }
                .memory-header { display: flex; justify-content: space-between; width: 100%; padding: 10px; font-weight: bold; }
                .memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 10px; flex-grow: 1; width: 100%; align-content: center; justify-content: center; }
                .memory-card { background: #3498db; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2em; color: white; transition: transform 0.3s; perspective: 1000px; min-height: 80px; user-select: none; }
                .memory-card.flipped { background: #fff; color: #333; transform: rotateY(180deg); border: 2px solid #ccc; }
                .memory-card.matched { background: #2ecc71; color: white; transform: rotateY(180deg) scale(0.95); cursor: default; }
                .memory-card .content { transform: rotateY(180deg); display: none; }
                .memory-card.flipped .content, .memory-card.matched .content { display: block; }
            </style>
        </div>
    `;
}

export function initMemory(windowEl) {
    const grid = windowEl.querySelector('#memory-grid');
    const btnStart = windowEl.querySelector('#memory-start');
    const movesEl = windowEl.querySelector('#memory-moves');
    const timerEl = windowEl.querySelector('#memory-timer');

    const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    let cards = [];
    let flippedCards = [];
    let moves = 0;
    let matches = 0;
    let timerInterval;
    let seconds = 0;
    let isPlaying = false;

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function startGame() {
        clearInterval(timerInterval);
        seconds = 0;
        moves = 0;
        matches = 0;
        movesEl.textContent = `Moves: 0`;
        timerEl.textContent = `00:00`;
        isPlaying = true;

        grid.innerHTML = '';
        cards = [...icons, ...icons].sort(() => Math.random() - 0.5);

        cards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.icon = icon;
            card.dataset.index = index;
            card.innerHTML = `<span class="content">${icon}</span>`;

            card.addEventListener('click', () => handleCardClick(card));
            grid.appendChild(card);
        });

        timerInterval = setInterval(() => {
            seconds++;
            timerEl.textContent = formatTime(seconds);
        }, 1000);
    }

    function handleCardClick(card) {
        if (!isPlaying) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flippedCards.length >= 2) return; // Prevent clicking more than 2 at a time

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesEl.textContent = `Moves: ${moves}`;
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.icon === card2.dataset.icon) {
            // Match
            setTimeout(() => {
                card1.classList.replace('flipped', 'matched');
                card2.classList.replace('flipped', 'matched');
                flippedCards = [];
                matches++;
                if (matches === icons.length) {
                    gameOver();
                }
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    function gameOver() {
        isPlaying = false;
        clearInterval(timerInterval);
        setTimeout(() => alert(`You won in ${moves} moves and ${formatTime(seconds)}!`), 300);
    }

    btnStart.addEventListener('click', startGame);

    // Auto-start
    startGame();
}
