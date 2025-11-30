class SideBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <aside class="sidebar">
            <h3>Хувийн мэдээлэл</h3>

            <figure class="profile">
                <img src="../pics/profile.jpg" alt="Profile photo">
            </figure>

            <section class="info-card">   
                <p><strong>Нэр:</strong> Taivna</p>
                <p><strong>УТАС:</strong> 88998899</p>
                <p><strong>GMAIL:</strong> Taivna@GMAIL.COM</p>
            </section>

            <nav class="sidebar-actions">
                <button class="add-btn" id="add-btn">Зар нэмэх</button>
            </nav>
        </aside>
        `;

        this.querySelector("#add-btn").onclick = () => {
            location.href = "AddNews.html";
        };
    }
}

customElements.define("side-bar", SideBar);
