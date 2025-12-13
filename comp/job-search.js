class JobSearch extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="🔍 Ажил хайх...">

                <select class="dropdown">
                    <option>Байршлаар</option>
                    <option>Чингэлтэй</option>
                    <option>Сүхбаатар</option>
                    <option>Баянзүрх</option>
                </select>

                <select class="dropdown">
                    <option>Эрэмбэлэх</option>
                    <option>Шинэ эхэнд</option>
                    <option>Өндөр цалинтай</option>
                </select>
            </div>
        `;
    }
}
customElements.define("job-search", JobSearch);
