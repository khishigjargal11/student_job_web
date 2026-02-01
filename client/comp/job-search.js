class JobSearch extends HTMLElement {

    connectedCallback() {
        // Search UI-г гаргах
        this.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="🔍 Ажил хайх...">

                <select class="dropdown location-filter">
                    <option value="">Байршлаар</option>
                    <option value="чингэлтэй">Чингэлтэй</option>
                    <option value="сүхбаатар">Сүхбаатар</option>
                    <option value="баянзүрх">Баянзүрх</option>
                </select>

                <select class="dropdown sort-filter">
                    <option value="">Эрэмбэлэх</option>
                    <option value="new">Шинэ эхэнд</option>
                    <option value="salary">Өндөр цалинтай</option>
                </select>

                <button class="refresh-btn" title="Шинэчлэх">
                    Шинэчлэх
                </button>
            </div>
        `;

        // DOM элементүүдийг component дотроос авна
        const searchInput = this.querySelector(".search-input");
        const refreshBtn = this.querySelector(".refresh-btn");

        const jobs = document.querySelectorAll(".job");

        // Search engine
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase();

            jobs.forEach(job => {
                const jobText = job.innerText.toLowerCase();

                if (jobText.includes(searchText)) {
                    job.style.display = "block";
                } else {
                    job.style.display = "none";
                }
            });
        });

        // Refresh товч 
        refreshBtn.addEventListener("click", () => {
            searchInput.value = "";

            jobs.forEach(job => {
                job.style.display = "block";
            });
        });
    }
}

customElements.define("job-search", JobSearch);
