class InfoCard extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title");
        this.innerHTML = `
            <section class="info-card">
                <p><strong>${title}</strong></p>
                <p><slot></slot></p>
            </section>
        `;
    }
}
customElements.define("info-card", InfoCard);
