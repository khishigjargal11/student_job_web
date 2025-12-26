class BackBar extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
  
    this.innerHTML = `
      <section class="back-bar">
        <button class="back-btn">←</button>
        <h2>${title}</h2>
      </section>
    `;

    this.querySelector(".back-btn").addEventListener("click", () => history.back());
  }
}

customElements.define("back-bar", BackBar);
