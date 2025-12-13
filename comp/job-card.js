class JobCard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="job">
                <div class="job-badge">${this.getAttribute("rating")}⭐</div>

                <p class="job-title">
                    ${this.getAttribute("title")}
                </p>

                <div class="job-details">
                    <strong>📍 Байршил:</strong> ${this.getAttribute("location")}<br>
                    <strong>⏰ Цаг:</strong> ${this.getAttribute("time")}<br>
                    <strong>💰 Цалин:</strong> ${this.getAttribute("salary")}
                </div>

                <button class="apply-btn">Хүсэлт илгээх</button>
            </div>
        `;
    }
}
customElements.define("job-card", JobCard);
