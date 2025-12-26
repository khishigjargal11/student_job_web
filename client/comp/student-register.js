class StudentRegister extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="login-box">
        <p>Оюутнаар бүртгүүлэх</p>

        <div class="form">
          <label>Нэр:</label>
          <input type="text" name="name" required>
        </div>

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
          <input type="number" name="age" min="16" max="100" required>
        </div>

        <div class="form-select">
          <label>Хүйс:</label>
          <select name="gender" required>
            <option value="" disabled selected>Сонгох</option>
            <option value="Эрэгтэй">Эрэгтэй</option>
            <option value="Эмэгтэй">Эмэгтэй</option>
          </select>
        </div>

        <div class="form">
          <label>Нууц үг:</label>
          <input type="password" name="password" required minlength="6">
        </div>

        <div class="form">
          <label>Нууц үг давтах:</label>
          <input type="password" name="confirm" required>
        </div>

        <button class="login-btn" type="submit">Бүртгүүлэх</button>
        
        <div id="error-message" style="color: red; margin-top: 10px; display: none;"></div>
        <div id="success-message" style="color: green; margin-top: 10px; display: none;"></div>

        <div class="login-link">
          Бүртгэлтэй юу? <a href="/login">Нэвтрэх</a>
        </div>
      </form>
    `;

    this.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      const errorDiv = this.querySelector('#error-message');
      const successDiv = this.querySelector('#success-message');
      const submitBtn = this.querySelector('button[type="submit"]');
      
      // Hide previous messages
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';

      // Validation
      if (data.password !== data.confirm) {
        this.showError("Нууц үг таарахгүй байна");
        return;
      }

      if (data.password.length < 6) {
        this.showError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
        return;
      }

      // Prepare registration data
      const registrationData = {
        name: data.name.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        age: parseInt(data.age),
        gender: data.gender,
        password: data.password
      };

      try {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Бүртгүүлж байна...';
        
        // Register via API
        const response = await ApiClient.registerStudent(registrationData);
        
        if (response.success) {
          this.showSuccess('Бүртгэл амжилттай үүсгэгдлээ! Та одоо нэвтэрч орох боломжтой.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          this.showError(response.message || 'Бүртгэл үүсгэхэд алдаа гарлаа');
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.showError('Бүртгэл үүсгэхэд алдаа гарлаа');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Бүртгүүлэх';
      }
    });
  }
  
  showError(message) {
    const errorDiv = this.querySelector('#error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
  
  showSuccess(message) {
    const successDiv = this.querySelector('#success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }
}

customElements.define("student-register", StudentRegister);
