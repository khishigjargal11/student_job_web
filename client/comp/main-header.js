class MainHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="topbar">
            <div class="logo">
                <div class="user-icon">👤</div>
                <span id="logout-btn">Гарах</span>
            </div>
            <nav>
                <a href="#">Нүүр</a>
                <a href="#">Холбогдох</a>
                <a href="#">Бидний тухай</a>
            </nav>
        </header>
        `;

        this.querySelector("#logout-btn").onclick = () => {
            window.location.href = "/login";
        };
    }
}

customElements.define("main-header", MainHeader);
