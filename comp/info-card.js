class InfoCard extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title") || "Тодорхойгүй";
        const period = this.getAttribute("period") || "Тодорхойгүй";
        const rating = parseInt(this.getAttribute("rating")) || 0;

        this.innerHTML = `
            <section class="info-card">
                <p><strong>ӨМНӨ ХИЙСЭН АЖИЛ</strong></p>

                <p>
                    <strong>Ажлын тайлбар:</strong><br>
                    ${title}
                </p>

                <p>
                    <strong>Хугацаа:</strong><br>
                    ${period}
                </p>

                <p class="rating">
                    <strong>Үнэлгээ:</strong> ${"⭐".repeat(rating)}
                </p>
            </section>
        `;
    }
}

customElements.define("info-card", InfoCard);
