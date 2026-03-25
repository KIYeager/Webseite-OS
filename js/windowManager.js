export class WindowManager {
    constructor() {
        this.windows = [];
        this.highestZIndex = 100;
        this.container = document.getElementById('window-container');
        this.taskbarContainer = document.getElementById('open-apps');
    }

    createWindow(title, contentHTML) {
        const id = 'win-' + Math.random().toString(36).substr(2, 9);
        const winConfig = {
            id,
            title,
            isMaximized: false,
            isMinimized: false,
            zIndex: ++this.highestZIndex,
            el: null,
            taskbarEl: null
        };

        // Create DOM Elements
        const winEl = document.createElement('div');
        winEl.className = 'os-window';
        winEl.id = id;
        winEl.style.zIndex = winConfig.zIndex;
        // Random initial position
        winEl.style.left = Math.floor(Math.random() * 200) + 50 + 'px';
        winEl.style.top = Math.floor(Math.random() * 150) + 50 + 'px';

        winEl.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <div class="control-btn btn-minimize" title="Minimize">-</div>
                    <div class="control-btn btn-maximize" title="Maximize">□</div>
                    <div class="control-btn btn-close" title="Close">X</div>
                </div>
            </div>
            <div class="window-content">
                ${contentHTML}
            </div>
        `;

        this.container.appendChild(winEl);
        winConfig.el = winEl;

        // Taskbar item
        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item active';
        taskbarItem.textContent = title;
        taskbarItem.id = `tb-${id}`;
        this.taskbarContainer.appendChild(taskbarItem);
        winConfig.taskbarEl = taskbarItem;

        this.windows.push(winConfig);

        this._bindEvents(winConfig);
        this.focusWindow(id);

        return winConfig;
    }

    _bindEvents(winConfig) {
        const header = winConfig.el.querySelector('.window-header');
        const btnMin = winConfig.el.querySelector('.btn-minimize');
        const btnMax = winConfig.el.querySelector('.btn-maximize');
        const btnClose = winConfig.el.querySelector('.btn-close');

        // Dragging
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('control-btn')) return; // ignore buttons
            if (winConfig.isMaximized) return; // don't drag if maximized
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = winConfig.el.offsetLeft;
            initialY = winConfig.el.offsetTop;
            this.focusWindow(winConfig.id);
            document.body.style.userSelect = 'none'; // prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            winConfig.el.style.left = (initialX + dx) + 'px';
            winConfig.el.style.top = (initialY + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
            }
        });

        // Focus on click
        winConfig.el.addEventListener('mousedown', () => {
            this.focusWindow(winConfig.id);
        });

        // Controls
        btnClose.addEventListener('click', () => this.closeWindow(winConfig.id));
        btnMax.addEventListener('click', () => this.toggleMaximize(winConfig.id));
        btnMin.addEventListener('click', () => this.toggleMinimize(winConfig.id));

        // Taskbar click
        winConfig.taskbarEl.addEventListener('click', () => {
            if (winConfig.isMinimized) {
                this.toggleMinimize(winConfig.id);
                this.focusWindow(winConfig.id);
            } else {
                if (winConfig.el.style.zIndex == this.highestZIndex) {
                    // It's focused, so minimize it
                    this.toggleMinimize(winConfig.id);
                } else {
                    this.focusWindow(winConfig.id);
                }
            }
        });
    }

    focusWindow(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        this.highestZIndex++;
        win.zIndex = this.highestZIndex;
        win.el.style.zIndex = win.zIndex;

        // Update taskbar active state
        this.windows.forEach(w => w.taskbarEl.classList.remove('active'));
        win.taskbarEl.classList.add('active');
    }

    closeWindow(id) {
        const index = this.windows.findIndex(w => w.id === id);
        if (index > -1) {
            const win = this.windows[index];
            win.el.remove();
            win.taskbarEl.remove();
            this.windows.splice(index, 1);
        }
    }

    toggleMaximize(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        win.isMaximized = !win.isMaximized;
        if (win.isMaximized) {
            win.el.classList.add('maximized');
            win.el.style.left = '0px';
            win.el.style.top = '0px';
        } else {
            win.el.classList.remove('maximized');
            // could restore previous position here, simpler for now to just let it snap to 0,0
            // but we removed the class so inline styles apply again.
            // For robust system, we would save left/top/width/height before maximize.
        }
        this.focusWindow(id);
    }

    toggleMinimize(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;

        win.isMinimized = !win.isMinimized;
        if (win.isMinimized) {
            win.el.classList.add('minimized');
            win.taskbarEl.classList.remove('active');
        } else {
            win.el.classList.remove('minimized');
            this.focusWindow(id);
        }
    }
}