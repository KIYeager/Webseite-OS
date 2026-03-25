import { Window } from './window.js';

export class WindowManager {
    constructor() {
        this.windows = [];
        this.baseZIndex = 100;
        this.desktop = document.getElementById('desktop');
        this.openAppsContainer = document.getElementById('open-apps');
    }

    createWindow(options) {
        const id = `window-${Date.now()}`;
        const newWindow = new Window(id, options, this);
        this.windows.push(newWindow);
        this.desktop.appendChild(newWindow.element);

        this.createTaskbarItem(newWindow);
        this.focusWindow(newWindow);
        return newWindow;
    }

    createTaskbarItem(win) {
        const item = document.createElement('div');
        item.className = 'taskbar-item';
        item.textContent = win.title;
        item.id = `taskbar-item-${win.id}`;

        item.addEventListener('click', () => {
            if (win.isMinimized) {
                win.restore();
                this.focusWindow(win);
            } else if (win.isActive) {
                win.minimize();
            } else {
                this.focusWindow(win);
            }
        });

        this.openAppsContainer.appendChild(item);
        win.taskbarItem = item;
    }

    focusWindow(winToFocus) {
        // Bring to front
        this.baseZIndex++;
        winToFocus.element.style.zIndex = this.baseZIndex;

        // Update active states
        this.windows.forEach(win => {
            win.element.classList.remove('active');
            if (win.taskbarItem) {
                win.taskbarItem.classList.remove('active');
            }
            win.isActive = false;
        });

        winToFocus.element.classList.add('active');
        if (winToFocus.taskbarItem) {
            winToFocus.taskbarItem.classList.add('active');
        }
        winToFocus.isActive = true;
    }

    removeWindow(winToRemove) {
        this.windows = this.windows.filter(w => w !== winToRemove);
        if (winToRemove.taskbarItem) {
            winToRemove.taskbarItem.remove();
        }
        winToRemove.element.remove();
    }
}
