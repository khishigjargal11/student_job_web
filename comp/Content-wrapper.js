class MainContent extends HTMLElement {
    connectedCallback() {
        // actual content comes from HTML, so keep wrapper only
        this.innerHTML = `<div class="content">${this.innerHTML}</div>`;
    }
}
customElements.define('main-content', MainContent);
