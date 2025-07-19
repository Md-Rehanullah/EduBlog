/**
 * Theme Switcher for EduBlog
 * Handles switching between light and dark themes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create theme switcher element
    createThemeSwitcher();
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon('light');
    }
    
    // Set up event listener for theme toggle
    document.getElementById('theme-switcher').addEventListener('click', toggleTheme);
});

function createThemeSwitcher() {
    // Create theme switcher button
    const navContainer = document.querySelector('.nav-container');
    const themeButton = document.createElement('div');
    themeButton.className = 'theme-switcher';
    themeButton.id = 'theme-switcher';
    themeButton.setAttribute('aria-label', 'Toggle Dark Mode');
    themeButton.setAttribute('role', 'button');
    themeButton.setAttribute('tabindex', '0');
    
    themeButton.innerHTML = `
        <div class="theme-switcher-icon">
            <i class="fas fa-moon"></i>
        </div>
    `;
    
    // Insert before the hamburger menu
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navContainer.insertBefore(themeButton, navToggle);
    } else {
        navContainer.appendChild(themeButton);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Set the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update the icon
    updateThemeIcon(newTheme);
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-switcher-icon i');
    if (!icon) return;
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}
