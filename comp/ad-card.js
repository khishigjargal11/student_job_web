class AdCard extends HTMLElement {
    connectedCallback() {

        const title = this.getAttribute("title") || "";
        const locationTxt = this.getAttribute("location") || "";
        const time = this.getAttribute("time") || "";
        const salary = this.getAttribute("salary") || "";
        const desc = this.getAttribute("desc") || "";
        const rate = this.getAttribute("rate") || "";
        const requestUrl = this.getAttribute("request-url") || "#";

        this.innerHTML = `
        <article class="ad-card">
            <header>
                <h3>${title}</h3>
            </header>

            <ul class="ad-info">
                <li>📍 Байршил: ${locationTxt}</li>
                <li>⏰ Ажлын цаг: ${time}</li>
                <li>💰 Цалин: ${salary}</li>
                <li>🧾 Тайлбар: ${desc}</li>
            </ul>

            <footer class="ad-footer">
                <span class="rating">${rate}</span>
                <button class="gray-btn">Хаах</button>
                <button class="black-btn" id="req-btn">Хүсэлтүүд</button>
            </footer>
        </article>
        `;

        this.querySelector("#req-btn").onclick = () => {
            location.href = "ReqForMarket.html";
        };
        const articleEl = this.querySelector(".ad-card");
        if (!articleEl) return; // safety guard

        // Close/Delete button:устгана
        const closeBtn = articleEl.querySelector(".gray-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();               
                this.remove();
            });
        }
    }
}

customElements.define("ad-card-box", AdCard);
