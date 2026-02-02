class JobSearch extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="🔍 Ажил хайх...">

                <select class="dropdown location-filter">
                    <option value="">Байршил сонгох</option>
                    <option value="багануур">Багануур</option>
                    <option value="багахангай">Багахангай</option>
                    <option value="баянгол">Баянгол</option>
                    <option value="баянзүрх">Баянзүрх</option>
                    <option value="налайх">Налайх</option>
                    <option value="сонгинохайрхан">Сонгинохайрхан</option>
                    <option value="сүхбаатар">Сүхбаатар</option>
                    <option value="хан-уул">Хан-Уул</option>
                    <option value="чингэлтэй">Чингэлтэй</option>
                </select>


                <select class="dropdown sort-filter">
                    <option value="">Эрэмбэлэх</option>
                    <option value="salary">Өндөр цалинтай</option>
                </select>

                <button class="refresh-btn">Шинэчлэх</button>
            </div>
        `;

        // Component доторх element-үүд
        const searchInput = this.querySelector(".search-input");
        const locationFilter = this.querySelector(".location-filter");
        const sortFilter = this.querySelector(".sort-filter");
        const refreshBtn = this.querySelector(".refresh-btn");

        //  Job card
        const jobsContainer = document.querySelector(".main-content");
        let jobs = Array.from(document.querySelectorAll(".job"));

        // SEARCH + FILTER FUNCTION
        const filterJobs = () => {
            const searchText = searchInput.value.toLowerCase();
            const selectedLocation = locationFilter.value;

            jobs.forEach(job => {
                const jobText = job.innerText.toLowerCase();

                const matchSearch = jobText.includes(searchText);
                const matchLocation =
                    selectedLocation === "" ||
                    jobText.includes(selectedLocation);

                if (matchSearch && matchLocation) {
                    job.style.display = "block";
                } else {
                    job.style.display = "none";
                }
            });
        };

        // SORT BY SALARY FUNCTION
        const sortBySalary = () => {
            jobs.sort((a, b) => {
                const salaryA = extractSalary(a);
                const salaryB = extractSalary(b);
                return salaryB - salaryA; 
            });

            jobs.forEach(job => jobsContainer.appendChild(job));
        };

        // Цалин авах
        const extractSalary = (job) => {
            const text = job.innerText;
            const match = text.match(/([\d,]+)₮/);
            if (!match) return 0;
            return parseInt(match[1].replace(/,/g, ""));
        };

        // EVENTS
        searchInput.addEventListener("input", filterJobs);
        locationFilter.addEventListener("change", filterJobs);

        sortFilter.addEventListener("change", () => {
            if (sortFilter.value === "salary") {
                sortBySalary();
            }
        });

        refreshBtn.addEventListener("click", () => {
            searchInput.value = "";
            locationFilter.value = "";
            sortFilter.value = "";

            jobs.forEach(job => {
                job.style.display = "block";
            });
        });
    }
}

customElements.define("job-search", JobSearch);
