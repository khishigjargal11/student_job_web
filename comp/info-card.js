class InfoCard extends HTMLElement {
    connectedCallback() {
        this.render();
        
        // Set up a MutationObserver to watch for attribute changes
        this.observer = new MutationObserver(() => {
            this.render();
        });
        
        this.observer.observe(this, {
            attributes: true,
            attributeFilter: ['title', 'period', 'rating']
        });
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    render() {
        const title = this.getAttribute("title") || "Ажлын туршлага байхгүй";
        const period = this.getAttribute("period") || "";
        const rating = parseInt(this.getAttribute("rating")) || 0;

        console.log('Info card rendering with:', { title, period, rating });

        this.innerHTML = `
            <section class="info-card clickable-info-card" onclick="showWorkHistory()">
                <p><strong>ӨМНӨ ХИЙСЭН АЖИЛ</strong></p>

                <p>
                    <strong>Ажлын тайлбар:</strong><br>
                    ${title}
                </p>

                ${period ? `<p>
                    <strong>Хугацаа:</strong><br>
                    ${period}
                </p>` : ''}

                ${rating > 0 ? `<p class="rating">
                    <strong>Үнэлгээ:</strong> ${"⭐".repeat(rating)}
                </p>` : ''}

                <p class="click-hint">Дэлгэрэнгүй харах</p>
            </section>
        `;
    }
}

customElements.define("info-card", InfoCard);
