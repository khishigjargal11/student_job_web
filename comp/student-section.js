class StudentSection extends HTMLElement {
  connectedCallback() {
    const raw = this.innerHTML.trim();
    let students = [];

    try {
      students = JSON.parse(raw);
    } catch {}

    const hideTitle = this.hasAttribute("no-title");

    this.classList.add("student-section");

    this.innerHTML = `
        ${hideTitle ? "" : `
        <header>
          <h3>Хүсэлт илгээсэн оюутнууд</h3>
          <span class="student-count">${students.length} оюутан</span>
        </header>
        `}

        <div class="student-list">
          ${students.map(s => `
            <div class="student-card"
              data-name="${s.name}"
              data-email="${s.email}"
              data-phone="${s.phone}"
              data-gender="${s.gender || ""}"
              data-age="${s.age || ""}">
              
              <img src="${s.img || "../pics/profile.jpg"}" alt="${s.name}">
              
              <div class="student-info">
                <h4>${s.name}</h4>
                <p>${s.email}</p>
                <p class="student-phone">${s.phone}</p>
              </div>
            </div>
          `).join("")}
        </div>
    `;
  }
}

customElements.define("student-section", StudentSection);
