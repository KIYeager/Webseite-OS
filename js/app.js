import { updateClock } from './taskbar.js';
import { WindowManager } from './windowManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize system clock
    updateClock();
    setInterval(updateClock, 1000);

    // Initialize window manager
    const windowManager = new WindowManager();

    // Start menu binding (for demo, just opens a new window)
    document.getElementById('start-button').addEventListener('click', () => {
        windowManager.createWindow('New Window', 'Welcome to Web OS!');
    });

    // Create an initial welcome window
    setTimeout(() => {
        windowManager.createWindow('Welcome', 'This is the Web OS Simulator Phase 1.');
    }, 500);
});