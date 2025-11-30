class MainHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header class="topbar">
            <nav class="nav-container">
                <a href="#" class="logo">
                    <div class="user-icon">👤</div>
                    <span id="logout-btn">Гарах</span>
                </a>
                <ul class="menu">
                    <li><a href="#">Нүүр</a></li>
                    <li><a href="#">Холбогдох</a></li>
                    <li><a href="#">Бидний тухай</a></li>
                </ul>
            </nav>
        </header>
        `;

        this.querySelector("#logout-btn").onclick = () => {
            location.href = "Login.html";
        };
    }
}

customElements.define("main-header", MainHeader);
