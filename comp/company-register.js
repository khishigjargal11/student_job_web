class CompanyRegister extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="login-box">
        <p>Компаниар бүртгүүлэх</p>

        <div class="form">
          <label>Компанийн нэр:</label>
          <input type="text" name="companyName" required>
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
          <label>Регистр / Улсын бүртгэлийн №:</label>
          <input type="text" name="register" required>
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

      const data = Object.fromEntries(new FormData(form));
      delete data.confirm;

      console.log("Company register:", data);
      alert("Компани амжилттай бүртгэгдлээ");
    });
  }
}

customElements.define("company-register", CompanyRegister);
