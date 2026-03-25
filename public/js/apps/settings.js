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
                    <label style="margin-right: 15px;">
                        <input type="radio" name="theme" value="dark" id="theme-dark"> Dark
                    </label>
                    <label>
                        <input type="radio" name="theme" value="true-black" id="theme-true-black"> True Black
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
    const themeTrueBlack = windowEl.querySelector('#theme-true-black');

    // Restore saved settings
    const savedBg = localStorage.getItem('webos_bg');
    if (savedBg) inputBgUrl.value = savedBg;

    const savedTheme = localStorage.getItem('webos_theme') || 'light';
    if (savedTheme === 'dark') {
        themeDark.checked = true;
    } else if (savedTheme === 'true-black') {
        themeTrueBlack.checked = true;
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
    themeTrueBlack.addEventListener('change', () => setTheme('true-black'));

    function setTheme(mode) {
        // Remove previous theme class
        document.body.removeAttribute('data-theme');

        // Add new theme if not light
        if (mode !== 'light') {
            document.body.setAttribute('data-theme', mode);
        }

        localStorage.setItem('webos_theme', mode);
    }
}