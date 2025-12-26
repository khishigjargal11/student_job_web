class LoginForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section class="login-box">
            <p>Нэвтрэх</p>

            <div class="form">
                <label>Хэрэглэгчийн нэр:</label>
                <input type="text" id="username" placeholder="Хэрэглэгчийн нэр">
            </div>

            <div class="form">
                <label>Нууц үг:</label>
                <input type="password" id="password" placeholder="********">
            </div>

            <div class="options">
                <label class="remember">
                    <input type="checkbox" id="remember"> Намайг сана
                </label>
                <a href="#" class="forgot-password">Нууц үг мартсан?</a>
            </div>

            <button class="login-btn" id="login-btn">Нэвтрэх</button>
        </section>
        <div class="divider"><span class="divider-text">эсвэл</span></div>

        <div class="signup-links">
            <a href="/company/register" class="signup-link">
                <span class="signup-link-icon">🏢</span>
                <span>Байгууллагаар бүртгүүлэх</span>
            </a>
            <a href="/student/register" class="signup-link">
                <span class="signup-link-icon">🎓</span>
                <span>Оюутнаар бүртгүүлэх</span>
            </a>
        </div>
        `;

        this.querySelector("#login-btn").addEventListener("click", async () => {
            const username = this.querySelector("#username").value.trim();
            const password = this.querySelector("#password").value.trim();

            if (!username || !password) {
                alert("Хэрэглэгчийн нэр болон нууц үгээ оруулна уу");
                return;
            }

            // Determine user type based on username or add a selector
            // For now, we'll try student first, then company
            let authResult = await ApiClient.login(username, password, 'student');
            
            if (!authResult.success) {
                // Try company login
                authResult = await ApiClient.login(username, password, 'company');
            }
            
            if (authResult.success) {
                // Redirect based on user type
                if (authResult.user.type === 'student') {
                    window.location.href = "/student/home";
                } else if (authResult.user.type === 'company') {
                    window.location.href = "/company/home";
                }
            } else {
                alert(authResult.message || "Хэрэглэгчийн нэр эсвэл нууц үг буруу");
            }
        });
    }
}

customElements.define("login-form", LoginForm);
