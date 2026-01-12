/**
 * Оюутны профайл компонент
 * Оюутны хувийн мэдээлэл, үнэлгээ, ажлын туршлагыг харуулах
 */
class StudentProfile extends HTMLElement {
    /**
     * Компонент DOM-д холбогдох үед ажиллах функц
     */
    connectedCallback() {
        // ApiClient боломжтой эсэхийг шалгах
        const hasApiClient = typeof ApiClient !== 'undefined';
        
        console.log('Student profile connecting:', { hasApiClient });
        
        if (hasApiClient) {
            setTimeout(() => {
                this.loadStudentData();
            }, 50);
        } else {
            this.renderFromAttributes();
        }
    }

    /**
     * Оюутны мэдээллийг API-аас ачаалах функц
     */
    async loadStudentData() {
        const currentUser = ApiClient.getCurrentUser();
        console.log('Loading student data:', { currentUser });
        
        if (!currentUser || currentUser.type !== 'student') {
            console.log('No current user or not student, using fallback');
            this.renderFromAttributes();
            return;
        }

        try {
            // API-аас оюутны профайл авах
            const response = await ApiClient.getStudentProfile();
            console.log('Student profile response:', response);
            
            if (response.success && response.student) {
                console.log('Rendering student profile with API data');
                console.log('Student data:', response.student);
                this.renderProfile(response.student);
            } else {
                console.log('Failed to get student profile, using fallback');
                this.renderFromAttributes();
            }
        } catch (error) {
            console.error('Error loading student profile:', error);
            this.renderFromAttributes();
        }
    }

    /**
     * HTML атрибутуудаас профайл харуулах функц
     */
    renderFromAttributes() {
        const name = this.getAttribute("name") || "Хэрэглэгч";
        const phone = this.getAttribute("phone") || "";
        const email = this.getAttribute("email") || "";

        this.innerHTML = `
                <div class="profile-header">
                    <div class="profile-title">ХУВИЙН МЭДЭЭЛЭЛ</div>
                <div class="profile-image-wrapper">
                    <img src="../pics/profile.jpg" class="profile-image">
                    <div class="camera-icon">📷</div>
                </div>
                    <div class="profile-name">${name}</div>
                </div>

                <section class="info-card">
                    <p><strong>Утас:</strong> ${phone}</p>
                    <p><strong>Gmail:</strong> ${email}</p>
                </section>

                <div class="profile-actions">
                    <button class="schedule-btn" onclick="window.location.href='/student/calendar'">
                        Цагийн хуваарь засах
                    </button>
                </div>

                <slot></slot>
        `;
    }

    /**
     * Оюутны профайлыг API мэдээллээр харуулах функц
     * @param {Object} student - Оюутны мэдээлэл
     */
    renderProfile(student) {
        this.innerHTML = `
                <div class="profile-header">
                    <div class="profile-title">ХУВИЙН МЭДЭЭЛЭЛ</div>
                <div class="profile-image-wrapper">
                    <img src="../pics/profile.jpg" class="profile-image" alt="Profile">
                    <div class="camera-icon">📷</div>
                </div>
                    <div class="profile-name">${student.name}</div>
                    <div class="profile-rating">⭐ ${this.getAverageRating(student)}</div>
                </div>

                <section class="info-card">
                    <p><strong>Утас:</strong> ${student.phone || 'Тодорхойлоогүй'}</p>
                    <p><strong>Gmail:</strong> ${student.email || 'Тодорхойлоогүй'}</p>
                    <p><strong>Хэрэглэгчийн нэр:</strong> ${student.username}</p>
                </section>

                <div class="profile-actions">
                    <button class="schedule-btn" onclick="window.location.href='/student/calendar'">
                        Цагийн хуваарь засах
                    </button>
                </div>

                <slot></slot>
        `;
    }

    /**
     * Ажлын туршлагыг харуулах функц
     * @param {Array} workHistory - Ажлын туршлагын жагсаалт
     * @returns {string} HTML мөр
     */
    renderWorkHistory(workHistory) {
        if (!workHistory || workHistory.length === 0) {
            return '';
        }

        const recentWork = workHistory[workHistory.length - 1];
        return `
            <section class="work-history-section">
                <h4>Сүүлд хийсэн ажил</h4>
                <div class="work-item">
                    <div class="work-title">${recentWork.job_title}</div>
                    <div class="work-company">${recentWork.company_name}</div>
                    <div class="work-period">${recentWork.start_date} – ${recentWork.end_date}</div>
                    <div class="work-rating">${'⭐'.repeat(recentWork.rating)}</div>
                </div>
            </section>
        `;
    }

    /**
     * Илгээсэн хүсэлтүүдийг харуулах функц
     * @returns {string} HTML мөр
     */
    async renderAppliedJobs() {
        try {
            const response = await ApiClient.getStudentApplications();
            if (!response.success || !response.applications || response.applications.length === 0) {
                return '';
            }

            const recentApplications = response.applications.slice(-2); // Сүүлийн 2 хүсэлтийг харуулах
            const jobsHtml = recentApplications.map(application => {
                const statusText = this.getStatusText(application.status);

                return `
                    <div class="applied-job-item">
                        <div class="job-title">${application.jobs?.title || 'Тодорхойгүй ажил'}</div>
                        <div class="application-status ${application.status}">${statusText}</div>
                    </div>
                `;
            }).join('');

            return `
                <section class="applied-jobs-section">
                    <h4>Сүүлд илгээсэн хүсэлт</h4>
                    ${jobsHtml}
                </section>
            `;
        } catch (error) {
            console.error('Error loading applications:', error);
            return '';
        }
    }

    /**
     * Хүсэлтийн статусыг монгол хэл рүү хөрвүүлэх функц
     * @param {string} status - Хүсэлтийн статус
     * @returns {string} Монгол хэл дээрх статус
     */
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Хүлээгдэж байна';
            case 'accepted': return 'Зөвшөөрөгдсөн';
            case 'rejected': return 'Татгалзсан';
            default: return 'Тодорхойгүй';
        }
    }

    /**
     * Оюутны дундаж үнэлгээ тооцоолох функц
     * @param {Object} student - Оюутны мэдээлэл
     * @returns {string} Дундаж үнэлгээ
     */
    getAverageRating(student) {
        if (!student || !student.total_ratings || student.total_ratings === 0) {
            return '0';
        }
        return (student.rating / student.total_ratings).toFixed(1);
    }
}
customElements.define("student-profile", StudentProfile);