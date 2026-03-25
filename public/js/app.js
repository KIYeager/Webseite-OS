import { updateClock } from './taskbar.js';
import { WindowManager } from './windowManager.js';
import { getNotepadHTML, initNotepad } from './apps/notepad.js';
import { getCalculatorHTML, initCalculator } from './apps/calculator.js';
import { getSettingsHTML, initSettings } from './apps/settings.js';
import { getTicTacToeHTML, initTicTacToe } from './apps/tictactoe.js';
import { getSnakeHTML, initSnake } from './apps/snake.js';
import { getPongHTML, initPong } from './apps/pong.js';
import { getMemoryHTML, initMemory } from './apps/memory.js';
import { getMinesweeperHTML, initMinesweeper } from './apps/minesweeper.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize system clock
    updateClock();
    setInterval(updateClock, 1000);

    // Initialize window manager
    const windowManager = new WindowManager();

    // Start menu toggle
    const startMenu = document.getElementById('start-menu');
    const startButton = document.getElementById('start-button');

    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
    });

    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && e.target !== startButton) {
            startMenu.classList.add('hidden');
        }
    });

    // App Launchers
    document.querySelectorAll('.start-item').forEach(item => {
        if(item.tagName === 'HR') return;
        item.addEventListener('click', () => {
            const appType = item.getAttribute('data-app');
            startMenu.classList.add('hidden');
            launchApp(appType, windowManager);
        });
    });

    // Desktop Icon Launchers
    document.querySelectorAll('.desktop-icon').forEach(item => {
        item.addEventListener('dblclick', () => {
            const appType = item.getAttribute('data-app');
            launchApp(appType, windowManager);
        });
        // Added support for single click on mobile
        item.addEventListener('click', (e) => {
             // Basic mobile detection
             if (window.innerWidth <= 768) {
                  const appType = item.getAttribute('data-app');
                  launchApp(appType, windowManager);
             }
        });
    });

    // Initialize Theme and Wallpaper on boot
    const savedTheme = localStorage.getItem('webos_theme');
    if (savedTheme === 'dark') {
        document.documentElement.style.setProperty('--bg-color', '#1e1e1e');
        document.documentElement.style.setProperty('--window-bg', '#2d2d2d');
        document.documentElement.style.setProperty('--text-color', '#f0f0f0');
        document.documentElement.style.setProperty('--shadow-light', '#3b3b3b');
        document.documentElement.style.setProperty('--shadow-dark', '#151515');
        document.documentElement.style.setProperty('--taskbar-bg', 'rgba(45, 45, 45, 0.85)');
    }
    const savedBg = localStorage.getItem('webos_bg');
    if (savedBg) {
        document.getElementById('desktop').style.backgroundImage = `url('${savedBg}')`;
    }

    // Create an initial welcome window
    setTimeout(() => {
        windowManager.createWindow('Welcome', '<p>Welcome to Web OS! Click the <b>Start</b> button below to launch apps.</p>');
    }, 500);

    // Online Users WebSocket Connection
    const socket = window.io();
    const onlineUsersCount = document.getElementById('online-users-count');

    socket.on('online_users_update', (count) => {
        if (onlineUsersCount) {
            onlineUsersCount.textContent = count;
        }
    });
});

function launchApp(appType, wm) {
    let winConfig;
    switch(appType) {
        case 'notepad':
            winConfig = wm.createWindow('📝 Notepad', getNotepadHTML());
            initNotepad(winConfig.el);
            break;
        case 'calculator':
            winConfig = wm.createWindow('🧮 Calculator', getCalculatorHTML());
            initCalculator(winConfig.el);
            break;
        case 'settings':
            winConfig = wm.createWindow('⚙️ Settings', getSettingsHTML());
            initSettings(winConfig.el);
            break;
        case 'tictactoe':
            winConfig = wm.createWindow('❌⭕ Tic-Tac-Toe', getTicTacToeHTML());
            initTicTacToe(winConfig.el);
            break;
        case 'snake':
            winConfig = wm.createWindow('🐍 Snake', getSnakeHTML());
            initSnake(winConfig.el);
            break;
        case 'pong':
            winConfig = wm.createWindow('🏓 Pong', getPongHTML());
            initPong(winConfig.el);
            break;
        case 'memory':
            winConfig = wm.createWindow('🧠 Memory', getMemoryHTML());
            initMemory(winConfig.el);
            break;
        case 'minesweeper':
            winConfig = wm.createWindow('💣 Minesweeper', getMinesweeperHTML());
            initMinesweeper(winConfig.el);
            break;
        default:
            wm.createWindow('Unknown App', 'App not found.');
    }
}