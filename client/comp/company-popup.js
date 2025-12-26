/**
 * Company Profile Popup Component
 * Similar to student-popup but for company profile editing
 */

class CompanyPopup extends HTMLElement {
    constructor() {
        super();
        this.currentCompany = null;
    }

    connectedCallback() {
        console.log('CompanyPopup connectedCallback called');
        
        // Initialize with empty overlay that's hidden
        this.innerHTML = `
            <div class="popup-overlay" id="companyPopup" style="display: none;">
                <div class="popup">
                    <!-- Content will be loaded dynamically -->
                </div>
            </div>
        `;

        // Get initial overlay reference
        this.overlay = this.querySelector("#companyPopup");
        console.log('Company overlay element found:', this.overlay);
    }

    showProfileEditor(company) {
        console.log('showProfileEditor called with company:', company);
        console.log('Overlay element:', this.overlay);
        
        if (!this.overlay) {
            console.error('Overlay element not found!');
            return;
        }
        
        this.currentCompany = company;

        // Update the popup content
        this.overlay.innerHTML = `
            <div class="popup">
                <button class="popup-close">✕</button>

                <div class="popup-header-large">
                    <img id="popupImg" src="../pics/profile.jpg" alt="company">
                    <div class="popup-info">
                        <h2>Компанийн профайл засах</h2>
                        <div class="edit-form">
                            <div class="form-group">
                                <label><strong>Компанийн нэр:</strong></label>
                                <input type="text" id="editCompanyName" value="${company.companyName}" />
                            </div>
                            <div class="form-group">
                                <label><strong>И-мэйл:</strong></label>
                                <input type="email" id="editEmail" value="${company.email}" />
                            </div>
                            <div class="form-group">
                                <label><strong>Утас:</strong></label>
                                <input type="tel" id="editPhone" value="${company.phone}" />
                            </div>
                            <div class="form-group">
                                <label><strong>Хаяг:</strong></label>
                                <input type="text" id="editAddress" value="${company.address || ''}" />
                            </div>
                            <div class="form-group">
                                <label><strong>Тайлбар:</strong></label>
                                <textarea id="editDescription" rows="3">${company.description || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="popup-stats-large">
                    <div>
                        <h3>${company.jobs ? company.jobs.length : 0}</h3>
                        <p>Нийт зар</p>
                    </div>
                    <div>
                        <h3>${this.getActiveJobsCount(company)}</h3>
                        <p>Идэвхтэй зар</p>
                    </div>
                    <div>
                        <h3>${this.getCompanyRating(company)}★</h3>
                        <p>Дундаж үнэлгээ</p>
                    </div>
                </div>

                <div class="popup-actions">
                    <button class="approve-btn" id="saveCompanyBtn">Хадгалах</button>
                    <button class="reject-btn" id="cancelEditBtn">Цуцлах</button>
                </div>
            </div>
        `;

        // Re-attach event listeners
        this.setupEventListeners();

        console.log('Setting company profile editor overlay display to flex');
        this.overlay.style.display = "flex";
        this.overlay.style.position = "fixed";
        this.overlay.style.top = "0";
        this.overlay.style.left = "0";
        this.overlay.style.width = "100vw";
        this.overlay.style.height = "100vh";
        this.overlay.style.background = "rgba(0, 0, 0, 0.7)";
        this.overlay.style.zIndex = "99999";
        this.overlay.style.justifyContent = "center";
        this.overlay.style.alignItems = "center";
        console.log('Company profile editor overlay style after setting:', this.overlay.style.display);
    }

    setupEventListeners() {
        const closeBtn = this.overlay.querySelector(".popup-close");
        const saveBtn = this.overlay.querySelector("#saveCompanyBtn");
        const cancelBtn = this.overlay.querySelector("#cancelEditBtn");

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener("click", () => this.hide());
        }

        // Overlay click to close
        this.overlay.addEventListener("click", e => {
            if (e.target === this.overlay) this.hide();
        });

        // Profile editor buttons
        if (saveBtn) {
            saveBtn.addEventListener("click", () => this.saveProfile());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => this.hide());
        }
    }

    async saveProfile() {
        console.log('saveProfile called');
        
        const companyName = this.overlay.querySelector("#editCompanyName").value.trim();
        const email = this.overlay.querySelector("#editEmail").value.trim();
        const phone = this.overlay.querySelector("#editPhone").value.trim();
        const address = this.overlay.querySelector("#editAddress").value.trim();
        const description = this.overlay.querySelector("#editDescription").value.trim();

        console.log('Form values:', { companyName, email, phone, address, description });

        // Validation
        if (!companyName || !email || !phone) {
            alert('Компанийн нэр, и-мэйл, утасны дугаар заавал бөглөнө үү!');
            return;
        }

        try {
            // Update profile via API
            const response = await ApiClient.updateCompanyProfile({
                company_name: companyName,
                email,
                phone,
                address,
                description
            });

            if (response.success) {
                console.log('Company profile updated successfully via API');
                
                // Update local user data
                const currentUser = ApiClient.getCurrentUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, name: companyName, email };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                }

                // Hide popup and refresh page data
                this.hide();
                
                // Trigger a custom event to refresh the page
                window.dispatchEvent(new CustomEvent('companyProfileUpdated'));
                
                alert('Компанийн профайл амжилттай шинэчлэгдлээ!');
            } else {
                console.error('Failed to update company profile:', response.message);
                alert(response.message || 'Профайл шинэчлэхэд алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error updating company profile:', error);
            alert('Профайл шинэчлэхэд алдаа гарлаа');
        }
    }

    getActiveJobsCount(company) {
        if (!company.jobs) return 0;
        // Count jobs that are not finished
        return company.jobs.filter(job => job.status !== 'finished').length;
    }

    getCompanyRating(company) {
        if (!company.totalRatings || company.totalRatings === 0) {
            return '0';
        }
        return (company.rating / company.totalRatings).toFixed(1);
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = "none";
        }
        this.currentCompany = null;
    }
}

customElements.define("company-popup", CompanyPopup);