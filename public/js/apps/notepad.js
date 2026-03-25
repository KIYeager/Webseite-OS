export function getNotepadHTML() {
    return `
        <div class="notepad-app">
            <div class="notepad-toolbar">
                <button id="np-save">Save</button>
                <button id="np-open">Open</button>
                <span id="np-status"></span>
            </div>
            <textarea id="np-textarea" spellcheck="false" placeholder="Start typing..."></textarea>
        </div>
    `;
}

export function initNotepad(windowEl) {
    const textarea = windowEl.querySelector('#np-textarea');
    const btnSave = windowEl.querySelector('#np-save');
    const btnOpen = windowEl.querySelector('#np-open');
    const status = windowEl.querySelector('#np-status');

    btnSave.addEventListener('click', () => {
        const text = textarea.value;
        localStorage.setItem('webos_notepad', text);
        status.textContent = 'Saved!';
        setTimeout(() => status.textContent = '', 2000);
    });

    btnOpen.addEventListener('click', () => {
        const text = localStorage.getItem('webos_notepad');
        if (text !== null) {
            textarea.value = text;
            status.textContent = 'Opened!';
        } else {
            status.textContent = 'No save found.';
        }
        setTimeout(() => status.textContent = '', 2000);
    });
}