/**
 * Desktop shell: native platform chrome and theme, shared calendar logic unchanged.
 */
function detectPlatform() {
    const fromTauri = document.documentElement.dataset.platform;
    if (fromTauri)
        return fromTauri;
    const ua = navigator.userAgent;
    if (ua.includes('Mac'))
        return 'macos';
    if (ua.includes('Windows'))
        return 'windows';
    return 'linux';
}

function applyTheme() {
    document.documentElement.dataset.theme =
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

document.documentElement.classList.add('desktop-app');
document.documentElement.dataset.platform = detectPlatform();
applyTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
