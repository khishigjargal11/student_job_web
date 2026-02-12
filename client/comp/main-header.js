class MainHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="topbar">
            <div class="logo">
                <div class="user-icon">👤</div>
                <a id="logout-btn">Гарах</a>
            </div>
            <nav>
                <a href="#">Нүүр</a>
                <a href="#">Холбогдох</a>
                <a href="#">Бидний тухай</a>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme" title="Toggle light/dark mode">
                    <span class="theme-icon">🌙</span>
                </button>
            </nav>
        </header>
        `;

        // Logout functionality
        this.querySelector("#logout-btn").onclick = () => {
            window.location.href = "/login";
        };

        // Theme toggle functionality
        this.initThemeToggle();
    }

    initThemeToggle() {
        const themeToggle = this.querySelector("#theme-toggle");
        const themeIcon = this.querySelector(".theme-icon");
        
        // Initialize theme manager if not already loaded
        if (!window.themeManager) {
            // Fallback if theme-manager.js is not loaded
            this.initFallbackTheme(themeToggle, themeIcon);
            return;
        }

        // Update icon based on current theme
        this.updateThemeIcon(themeIcon, window.themeManager.getCurrentTheme());

        // Toggle theme on button click
        themeToggle.addEventListener("click", () => {
            const newTheme = window.themeManager.toggleTheme();
            this.updateThemeIcon(themeIcon, newTheme);
        });

        // Listen for theme changes from other sources
        window.addEventListener('themeChanged', (e) => {
            this.updateThemeIcon(themeIcon, e.detail.theme);
        });
    }

    initFallbackTheme(themeToggle, themeIcon) {
        // Fallback theme toggle without theme manager
        const currentTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", currentTheme);
        this.updateThemeIcon(themeIcon, currentTheme);

        themeToggle.addEventListener("click", () => {
            const theme = document.documentElement.getAttribute("data-theme");
            const newTheme = theme === "light" ? "dark" : "light";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    }

    updateThemeIcon(iconElement, theme) {
        iconElement.textContent = theme === "light" ? "🌙" : "☀️";
        iconElement.setAttribute('aria-label', theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
}

customElements.define("main-header", MainHeader);
