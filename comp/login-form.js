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
            <a href="CreateAccComp.html" class="signup-link">
                <span class="signup-link-icon">🏢</span>
                <span>Байгууллагаар бүртгүүлэх</span>
            </a>
            <a href="CreateAccStud.html" class="signup-link">
                <span class="signup-link-icon">🎓</span>
                <span>Оюутнаар бүртгүүлэх</span>
            </a>
        </div>
        `;

        this.querySelector("#login-btn").addEventListener("click", () => {
            const username = this.querySelector("#username").value.trim();
            const password = this.querySelector("#password").value.trim();

            if (!username || !password) {
                alert("Хэрэглэгчийн нэр болон нууц үгээ оруулна уу");
                return;
            }

            // Authenticate user using new DataManager method
            const authResult = DataManager.authenticateUser(username, password);
            
            if (authResult) {
                // Set current user with full user data
                DataManager.setCurrentUser({ 
                    type: authResult.type, 
                    ...authResult.user 
                });

                // Redirect based on user type
                if (authResult.type === 'student') {
                    window.location.href = "studhome.html";
                } else if (authResult.type === 'company') {
                    window.location.href = "Main_Company.html";
                }
            } else {
                alert("Хэрэглэгчийн нэр эсвэл нууц үг буруу байна");
            }
        });
    }
}

customElements.define("login-form", LoginForm);
