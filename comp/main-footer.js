class MainFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <p>© 2025 Хүний нөөцийн систем</p>
        </footer>
        `;
    }
}

customElements.define("main-footer", MainFooter);
