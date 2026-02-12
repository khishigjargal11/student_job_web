class SideBar extends HTMLElement {
    connectedCallback() {
        const hasApiClient = typeof ApiClient !== 'undefined';
        
        if (hasApiClient) {
            setTimeout(() => {
                this.loadCompanyData();
            }, 50);
        } else {
            this.renderDefault();
        }
        this.setupProfileUpdateListener();
    }

    setupProfileUpdateListener() {
        window.addEventListener('companyProfileUpdated', () => {
            console.log('Company profile updated, refreshing sidebar...');
            this.loadCompanyData();
        });
    }

    async loadCompanyData() {
        const currentUser = ApiClient.getCurrentUser();
        
        if (!currentUser || currentUser.type !== 'company') {
            this.renderDefault();
            return;
        }

        try {
            const response = await ApiClient.getCompanyProfile();
            
            if (!response.success) {
                console.error('Failed to get company profile:', response.message);
                this.renderDefault();
                return;
            }

            const company = response.company;
            this.renderCompanyProfile(company);
        } catch (error) {
            console.error('Error loading company data:', error);
            this.renderDefault();
        }
    }

    renderDefault() {
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
                <button class="edit-profile-btn" id="edit-profile-btn"> Профайл засах</button>
                <button class="add-btn" id="add-btn">Зар нэмэх</button>
            </nav>
        </aside>
        `;

        this.setupEventListeners();
    }

    renderCompanyProfile(company) {
        this.innerHTML = `
        <aside class="sidebar">
            <h3>Хувийн мэдээлэл</h3>

            <figure class="profile">
                <img src="../pics/profile.jpg" alt="Profile photo">
            </figure>

            <section class="info-card">   
                <p><strong>Компанийн нэр:</strong> ${company.companyName}</p>
                <p><strong>УТАС:</strong> ${company.phone}</p>
                <p><strong>GMAIL:</strong> ${company.email}</p>
                <p><strong>Хаяг:</strong> ${company.address || 'Тодорхойгүй'}</p>
            </section>

            <nav class="sidebar-actions">
                <button class="edit-profile-btn" id="edit-profile-btn">Профайл засах</button>
                <button class="add-btn" id="add-btn">Зар нэмэх</button>
            </nav>
        </aside>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.querySelector("#add-btn").onclick = () => {
            location.href = "/company/add-job";
        };

        this.querySelector("#edit-profile-btn").onclick = () => {
            this.editCompanyProfile();
        };
    }

    async editCompanyProfile() {
        console.log('editCompanyProfile function called');
        
        // Wait a bit for DOM to be ready
        setTimeout(async () => {
            const currentUser = ApiClient.getCurrentUser();
            console.log('Current user:', currentUser);
            
            if (!currentUser || currentUser.type !== 'company') {
                console.log('Authentication error');
                return;
            }

            try {
                const response = await ApiClient.getCompanyProfile();
                if (!response.success) {
                    console.log('Failed to get company data:', response.message);
                    return;
                }

                const companyData = response.company;
                console.log('Company data:', companyData);
                
                const popup = document.querySelector('company-popup');
                console.log('Popup element:', popup);
                
                if (popup) {
                    console.log('Calling showProfileEditor');
                    popup.showProfileEditor(companyData);
                } else {
                    console.log('Popup element not found!');
                }
            } catch (error) {
                console.error('Error loading company data for editing:', error);
            }
        }, 100);
    }
}

customElements.define("side-bar", SideBar);
