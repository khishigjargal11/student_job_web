class StudentProfile extends HTMLElement {
    connectedCallback() {
        const name = this.getAttribute("name");
        const phone = this.getAttribute("phone");
        const email = this.getAttribute("email");

        this.innerHTML = `
            <aside class="sidebar">
                <div class="profile-header">
                    <div class="profile-title">ХУВИЙН МЭДЭЭЛЭЛ</div>
                    <img src="pics/profile.jpg" class="profile-image">
                    <div class="camera-icon">📷</div>
                    <div class="profile-name">${name}</div>
                </div>

                <section class="info-card">
                    <p><strong>Утас:</strong> ${phone}</p>
                    <p><strong>Gmail:</strong> ${email}</p>
                </section>

                <slot></slot>
            </aside>
        `;
    }
}
customElements.define("student-profile", StudentProfile);
