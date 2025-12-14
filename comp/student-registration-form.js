class StudentRegistrationForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <form class="login-box" id="student-registration">
            <p>Оюутнаар бүртгүүлэх</p>
            <div class="form">
                <label for="username">Хэрэглэгчийн нэр:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form">
                <label for="email">Имэйл:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form">
                <label for="phone">Утасны дугаар:</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form">
                <label for="age">Нас:</label>
                <input type="number" id="age" name="age" required>
            </div>
            <div class="form-select">
                <label for="gender">Хүйс:</label>
                <select id="gender" name="gender" required>
                    <option value="" disabled selected>Сонгох</option>
                    <option value="male">Эрэгтэй</option>
                    <option value="female">Эмэгтэй</option>
                </select>
            </div>
            <div class="form">
                <label for="password">Нууц үг:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form">
                <label for="confirmPassword">Нууц үг давтах:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
            <button class="login-btn" type="submit">Бүртгүүлэх</button>
            <div class="divider">
                <span class="divider-text">эсвэл</span>
            </div>
            <div class="login-link">
                Бүртгэлтэй юу? <a href="Login.html">Нэвтрэх</a>
            </div>
        </form>
        `;

        this.querySelector('#student-registration').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });
    }

    handleRegistration() {
        const formData = new FormData(this.querySelector('#student-registration'));
        const data = Object.fromEntries(formData);
        
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            alert('Нууц үг таарахгүй байна');
            return;
        }

        // Store user data (temporary - replace with backend)
        localStorage.setItem('studentData', JSON.stringify(data));
        alert('Амжилттай бүртгэгдлээ!');
        window.location.href = 'Login.html';
    }
}

customElements.define('student-registration-form', StudentRegistrationForm);