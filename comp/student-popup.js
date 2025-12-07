class StudentPopup extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="popup-overlay" id="studentPopup">
        <div class="popup">

          <button class="popup-close">✕</button>

          <div class="popup-header-large">
            <img id="popupImg" src="../pics/profile.jpg" alt="profile">
            <div class="popup-info">
              <h2 id="popupName"></h2>
              <p><strong>И-мэйл:</strong> <span id="popupEmail"></span></p>
              <p><strong>Утас:</strong> <span id="popupPhone"></span></p>
              <p><strong>Хүйс:</strong> <span id="popupGender">-</span></p>
              <p><strong>Нас:</strong> <span id="popupAge">-</span></p>
            </div>
          </div>

          <div class="popup-stats-large">
            <div>
              <h3>4</h3>
              <p>Нийт туршлага</p>
            </div>
            <div>
              <h3>4.5★</h3>
              <p>Дундаж үнэлгээ</p>
            </div>
            <div>
              <h3>100%</h3>
              <p>Ажил дүүргэлт</p>
            </div>
          </div>

          <div class="popup-work-history-large">
            <h4>🧳 Өмнө хийсэн ажил</h4>

            <div class="job-grid">
              <div class="job-card-large">
                <h5>Агуулахын цагийн ажилтан</h5>
                <p>⏱ Хугацаа: 2 сар</p>
                <p>⭐⭐⭐⭐⭐</p>
              </div>

              <div class="job-card-large">
                <h5>Агуулахын цагийн ажилтан</h5>
                <p>⏱ Хугацаа: 1 сар</p>
                <p>⭐⭐⭐⭐⭐</p>
              </div>

              <div class="job-card-large">
                <h5>Зөөгч</h5>
                <p>⏱ Хугацаа: 3 сар</p>
                <p>⭐⭐⭐⭐⭐</p>
              </div>

              <div class="job-card-large">
                <h5>Борлуулагч</h5>
                <p>⏱ Хугацаа: 2 сар</p>
                <p>⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          </div>

          <div class="popup-actions">
            <button class="approve-btn">✓ Хүлээж авах</button>
            <button class="reject-btn">✕ Татгалзах</button>
          </div>

        </div>
      </div>
    `;

    // elements
    this.overlay = this.querySelector("#studentPopup");
    this.closeBtn = this.querySelector(".popup-close");

    // close logic
    this.closeBtn.addEventListener("click", () => this.hide());
    this.overlay.addEventListener("click", e => {
      if (e.target === this.overlay) this.hide();
    });

    // attach listener to student cards
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".student-card");
      if (!card) return;

      this.show({
        name: card.dataset.name,
        email: card.dataset.email,
        phone: card.dataset.phone,
        gender: card.dataset.gender || "-",
        age: card.dataset.age || "-"
      });
    });
  }

  show(data) {
    this.querySelector("#popupName").textContent = data.name;
    this.querySelector("#popupEmail").textContent = data.email;
    this.querySelector("#popupPhone").textContent = data.phone;
    this.querySelector("#popupGender").textContent = data.gender;
    this.querySelector("#popupAge").textContent = data.age;

    this.overlay.style.display = "flex";
  }

  hide() {
    this.overlay.style.display = "none";
  }
}

customElements.define("student-popup", StudentPopup);
