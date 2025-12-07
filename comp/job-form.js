class JobForm extends HTMLElement {
  connectedCallback() {
    this.classList.add("form-section");

    this.innerHTML = `
      <form class="job-form">
        <h2>Зар нэмэх</h2>

        <label>Ажлын нэр <span>*</span></label>
        <input type="text" placeholder="Жишээ: Агуулахын ажилтан" required />

        <label>Ажлын байршил <span>*</span></label>
        <input type="text" placeholder="Жишээ: Улаанбаатар, Чингэлтэй дүүрэг" required />

        <label>Ажлын газрын байршил (google map link)</label>
        <input type="url" placeholder="Google Map хаяг холбоос авна уу" />

        <div class="form-row">
          <div class="form-group">
            <label>Хүйс <span>*</span></label>
            <select required>
              <option>Сонгох</option>
              <option>Эр</option>
              <option>Эм</option>
            </select>
          </div>

          <div class="form-group">
            <label>Он сар <span>*</span></label>
            <input type="date" required />
          </div>
        </div>

        <label>Ажлын тайлбар <span>*</span></label>
        <textarea placeholder="Ажлын дэлгэрэнгүй тайлбар бичнэ үү..." required></textarea>

        <div class="form-row">
          <div class="form-group">
            <label>Цалин (₮) <span>*</span></label>
            <input type="number" placeholder="Жишээ: 10000" required />
          </div>

          <div class="form-group">
            <label>Цалингийн төрөл <span>*</span></label>
            <select required>
              <option>Сонгох</option>
              <option>Сард</option>
              <option>7 хоногт</option>
              <option>Өдөрт</option>
            </select>
          </div>
        </div>

        <label>Календар</label>
        <div class="calendar-box" id="calendarBtn">
          📅 Цаг оруулах
        </div>

        <label>Зураг оруулах</label>
        <div class="upload-box">
          <img src="camera-icon.png" alt="camera" />
          <p>Зураг оруулах бол энд дарна уу<br />
            PNG, JPG хэлбэрээр (хамгийн ихдээ 5MB)
          </p>
        </div>

        <div class="button-row">
          <button type="reset" class="gray-btn">Цуцлах</button>
          <button type="submit" class="black-btn">Нэмэх</button>
        </div>
      </form>
    `;

    // Calendar handler
    this.querySelector("#calendarBtn").addEventListener("click", () => {
      location.href = "Calendar.html";
    });
  }
}

customElements.define("job-form", JobForm);
