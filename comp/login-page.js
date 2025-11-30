class LoginPage extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <main-header></main-header>

        <main class="container">
            <login-form></login-form>
        </main>
        `;
    }
}

customElements.define("login-page", LoginPage);
