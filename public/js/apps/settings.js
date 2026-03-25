export function getSettingsHTML() {
    return `
        <div class="settings-app">
            <h3>Appearance</h3>

            <div class="setting-group">
                <label for="bg-url">Desktop Wallpaper URL:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" id="bg-url" placeholder="https://example.com/image.jpg" style="flex: 1; padding: 5px;">
                    <button id="btn-apply-bg">Apply</button>
                </div>
            </div>

            <div class="setting-group" style="margin-top: 20px;">
                <label>Theme Mode:</label>
                <div style="margin-top: 5px;">
                    <label style="margin-right: 15px;">
                        <input type="radio" name="theme" value="light" checked id="theme-light"> Light
                    </label>
                    <label>
                        <input type="radio" name="theme" value="dark" id="theme-dark"> Dark
                    </label>
                </div>
            </div>
        </div>
    `;
}

export function initSettings(windowEl) {
    const btnApplyBg = windowEl.querySelector('#btn-apply-bg');
    const inputBgUrl = windowEl.querySelector('#bg-url');
    const themeLight = windowEl.querySelector('#theme-light');
    const themeDark = windowEl.querySelector('#theme-dark');

    // Restore saved settings
    const savedBg = localStorage.getItem('webos_bg');
    if (savedBg) inputBgUrl.value = savedBg;

    const savedTheme = localStorage.getItem('webos_theme') || 'light';
    if (savedTheme === 'dark') {
        themeDark.checked = true;
    }

    btnApplyBg.addEventListener('click', () => {
        const url = inputBgUrl.value.trim();
        if (url) {
            document.getElementById('desktop').style.backgroundImage = `url('${url}')`;
            localStorage.setItem('webos_bg', url);
        } else {
            // Revert to default
            document.getElementById('desktop').style.backgroundImage = "url('../assets/wallpaper.jpg')";
            localStorage.removeItem('webos_bg');
        }
    });

    themeLight.addEventListener('change', () => setTheme('light'));
    themeDark.addEventListener('change', () => setTheme('dark'));

    function setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.style.setProperty('--bg-color', '#1e1e1e');
            document.documentElement.style.setProperty('--window-bg', '#2d2d2d');
            document.documentElement.style.setProperty('--text-color', '#f0f0f0');
            document.documentElement.style.setProperty('--shadow-light', '#3b3b3b');
            document.documentElement.style.setProperty('--shadow-dark', '#151515');
            document.documentElement.style.setProperty('--taskbar-bg', 'rgba(45, 45, 45, 0.85)');
        } else {
            // Light (Default)
            document.documentElement.style.setProperty('--bg-color', '#e0e5ec');
            document.documentElement.style.setProperty('--window-bg', '#e0e5ec');
            document.documentElement.style.setProperty('--text-color', '#333');
            document.documentElement.style.setProperty('--shadow-light', '#ffffff');
            document.documentElement.style.setProperty('--shadow-dark', '#a3b1c6');
            document.documentElement.style.setProperty('--taskbar-bg', 'rgba(224, 229, 236, 0.85)');
        }
        localStorage.setItem('webos_theme', mode);
    }
}