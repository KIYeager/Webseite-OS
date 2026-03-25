export class Taskbar {
    constructor() {
        this.clockElement = document.getElementById('clock');
        this.initClock();
    }

    initClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        this.clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}
