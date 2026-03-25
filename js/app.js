import { Taskbar } from './taskbar.js';
import { WindowManager } from './windowManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core System Components
    const taskbar = new Taskbar();
    const windowManager = new WindowManager();

    // Hook up the Start button to create a test window (for Phase 1 demonstration)
    const startButton = document.getElementById('start-button');
    let windowCounter = 1;

    startButton.addEventListener('click', () => {
        windowManager.createWindow({
            title: `App Window ${windowCounter++}`,
            content: `<p>Welcome to Web OS Simulator Phase 1!</p>
                      <p>This is a test window to demonstrate the Window Manager.</p>
                      <p>Try dragging, minimizing, maximizing, or closing it.</p>`
        });
    });

    // Create an initial welcome window
    windowManager.createWindow({
        title: 'Welcome',
        content: `<h3>Hello World!</h3>
                  <p>The system is initialized and ready.</p>
                  <p>Click "Start" to open more windows.</p>`
    });
});
