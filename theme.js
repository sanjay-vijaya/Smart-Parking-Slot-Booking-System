// Theme setup for pages (Light / Dark only)
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('theme-select');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (select) select.value = savedTheme;
    applyTheme(savedTheme);

    if (select) {
        select.addEventListener('change', (e) => {
            const value = e.target.value;
            applyTheme(value);
            localStorage.setItem('theme', value);
        });
    }
});

function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.add('theme-light');
} 