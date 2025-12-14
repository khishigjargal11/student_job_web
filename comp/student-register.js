class StudentRegister extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="login-box">
        <p>Оюутнаар бүртгүүлэх</p>

        <div class="form">
          <label>Хэрэглэгчийн нэр:</label>
          <input type="text" name="username" required>
        </div>

        <div class="form">
          <label>Имэйл:</label>
          <input type="email" name="email" required>
        </div>

        <div class="form">
          <label>Утасны дугаар:</label>
          <input type="tel" name="phone" required>
        </div>

        <div class="form">
          <label>Нас:</label>
          <input type="number" name="age" required>
        </div>

        <div class="form-select">
          <label>Хүйс:</label>
          <select name="gender" required>
            <option value="" disabled selected>Сонгох</option>
            <option value="male">Эрэгтэй</option>
            <option value="female">Эмэгтэй</option>
          </select>
        </div>

        <div class="form">
          <label>Нууц үг:</label>
          <input type="password" name="password" required>
        </div>

        <div class="form">
          <label>Нууц үг давтах:</label>
          <input type="password" name="confirm" required>
        </div>

        <button class="login-btn" type="submit">Бүртгүүлэх</button>

        <div class="login-link">
          Бүртгэлтэй юу? <a href="Login.html">Нэвтрэх</a>
        </div>
      </form>
    `;

    this.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      const form = e.target;

      if (form.password.value !== form.confirm.value) {
        alert("Нууц үг таарахгүй байна");
        return;
      }

      console.log(Object.fromEntries(new FormData(form)));
      alert("Амжилттай бүртгэгдлээ");
    });
  }
}

customElements.define("student-register", StudentRegister);
