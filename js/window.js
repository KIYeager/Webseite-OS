export class Window {
    constructor(id, options, manager) {
        this.id = id;
        this.manager = manager;
        this.title = options.title || 'New Window';
        this.contentHtml = options.content || '';

        this.isMinimized = false;
        this.isMaximized = false;
        this.isActive = false;

        this.element = this.createDOM();
        this.bindEvents();

        // Set initial position
        this.element.style.top = `${100 + (manager.windows.length * 30)}px`;
        this.element.style.left = `${100 + (manager.windows.length * 30)}px`;
    }

    createDOM() {
        const win = document.createElement('div');
        win.className = 'os-window';
        win.id = this.id;

        win.innerHTML = `
            <div class="window-header">
                <div class="window-title">${this.title}</div>
                <div class="window-controls">
                    <button class="window-btn btn-minimize" title="Minimize">_</button>
                    <button class="window-btn btn-maximize" title="Maximize">O</button>
                    <button class="window-btn btn-close" title="Close">X</button>
                </div>
            </div>
            <div class="window-content">
                ${this.contentHtml}
            </div>
        `;
        return win;
    }

    bindEvents() {
        // Focus on click
        this.element.addEventListener('mousedown', () => {
            this.manager.focusWindow(this);
        });

        // Window controls
        const btnClose = this.element.querySelector('.btn-close');
        const btnMaximize = this.element.querySelector('.btn-maximize');
        const btnMinimize = this.element.querySelector('.btn-minimize');

        btnClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        btnMaximize.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize();
        });

        btnMinimize.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimize();
        });

        // Drag and drop logic
        this.makeDraggable();
    }

    makeDraggable() {
        const header = this.element.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            if (this.isMaximized) return; // Don't drag maximized windows

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Restrict dragging slightly so header remains accessible
            const newTop = Math.max(0, initialTop + dy);

            this.element.style.left = `${initialLeft + dx}px`;
            this.element.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (e) => {
            // Don't initiate drag if clicking on controls
            if (e.target.closest('.window-controls')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Get current computed position
            const rect = this.element.getBoundingClientRect();
            // We use standard left/top based on parent (desktop)
            // Since desktop is relative, we can just parse the inline style if it exists,
            // or fallback to the offsetLeft/offsetTop
            initialLeft = this.element.offsetLeft;
            initialTop = this.element.offsetTop;

            this.manager.focusWindow(this);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    close() {
        this.manager.removeWindow(this);
    }

    toggleMaximize() {
        this.isMaximized = !this.isMaximized;
        if (this.isMaximized) {
            this.element.classList.add('maximized');
        } else {
            this.element.classList.remove('maximized');
        }
        this.manager.focusWindow(this);
    }

    minimize() {
        this.isMinimized = true;
        this.element.classList.add('minimized');
        if (this.taskbarItem) {
            this.taskbarItem.classList.remove('active');
        }
    }

    restore() {
        this.isMinimized = false;
        this.element.classList.remove('minimized');
    }
}
