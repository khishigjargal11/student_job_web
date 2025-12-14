class StudentProfile extends HTMLElement {
    connectedCallback() {
        // Check if we have real data available
        const hasDataManager = typeof DataManager !== 'undefined';
        
        console.log('Student profile connecting:', { hasDataManager });
        
        if (hasDataManager) {
            // Add a small delay to ensure DataManager is fully initialized
            setTimeout(() => {
                this.loadStudentData();
            }, 50);
        } else {
            // Fallback to attribute-based rendering
            this.renderFromAttributes();
        }
    }

    loadStudentData() {
        const currentUser = DataManager.getCurrentUser();
        console.log('Loading student data:', { currentUser });
        
        if (!currentUser || currentUser.type !== 'student') {
            console.log('No current user or not student, using fallback');
            this.renderFromAttributes();
            return;
        }

        const student = DataManager.getStudentById(currentUser.id);
        console.log('Found student:', { student });
        
        if (!student) {
            console.log('Student not found, using fallback');
            this.renderFromAttributes();
            return;
        }

        console.log('Rendering student profile with real data');
        console.log('Student data:', student);
        this.renderProfile(student);
    }

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
                    <button class="schedule-btn" onclick="window.location.href='Calendar.html'">
                        📅 Цагийн хуваарь засах
                    </button>
                </div>

                <slot></slot>
        `;
    }

    renderProfile(student) {
        this.innerHTML = `
                <div class="profile-header">
                    <div class="profile-title">ХУВИЙН МЭДЭЭЛЭЛ</div>
                <div class="profile-image-wrapper">
                    <img src="${student.profilePicture || '../pics/profile.jpg'}" class="profile-image" alt="Profile" onerror="this.src='pics/profile.jpg'">
                    <div class="camera-icon">📷</div>
                </div>
                    <div class="profile-name">${student.name}</div>
                    <div class="profile-rating">⭐ ${this.getAverageRating(student)}</div>
                </div>

                <section class="info-card">
                    <p><strong>Утас:</strong> ${student.phone}</p>
                    <p><strong>Gmail:</strong> ${student.email}</p>
                    <p><strong>Хэрэглэгчийн нэр:</strong> ${student.username}</p>
                </section>

                <div class="profile-actions">
                    <button class="schedule-btn" onclick="window.location.href='Calendar.html'">
                        📅 Цагийн хуваарь засах
                    </button>
                </div>

                <slot></slot>
        `;
    }

    renderWorkHistory(workHistory) {
        if (!workHistory || workHistory.length === 0) {
            return '';
        }

        const recentWork = workHistory[workHistory.length - 1];
        return `
            <section class="work-history-section">
                <h4>Сүүлд хийсэн ажил</h4>
                <div class="work-item">
                    <div class="work-title">${recentWork.jobTitle}</div>
                    <div class="work-company">${recentWork.companyName}</div>
                    <div class="work-period">${recentWork.startDate} – ${recentWork.endDate}</div>
                    <div class="work-rating">${'⭐'.repeat(recentWork.rating)}</div>
                </div>
            </section>
        `;
    }

    renderAppliedJobs(applications) {
        if (!applications || applications.length === 0) {
            return '';
        }

        const recentApplications = applications.slice(-2); // Show last 2 applications
        const jobsHtml = recentApplications.map(jobId => {
            const job = DataManager.getJobById(jobId);
            if (!job) return '';

            const application = job.applications.find(app => app.studentId === DataManager.getCurrentUser().id);
            const statusText = this.getStatusText(application ? application.status : 'unknown');

            return `
                <div class="applied-job-item">
                    <div class="job-title">${job.title}</div>
                    <div class="application-status ${application ? application.status : 'unknown'}">${statusText}</div>
                </div>
            `;
        }).join('');

        return `
            <section class="applied-jobs-section">
                <h4>Сүүлд илгээсэн хүсэлт</h4>
                ${jobsHtml}
            </section>
        `;
    }

    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Хүлээгдэж байна';
            case 'accepted': return 'Зөвшөөрөгдсөн';
            case 'rejected': return 'Татгалзсан';
            default: return 'Тодорхойгүй';
        }
    }

    getAverageRating(student) {
        if (!student || !student.totalRatings || student.totalRatings === 0) {
            return '0';
        }
        return (student.rating / student.totalRatings).toFixed(1);
    }
}
customElements.define("student-profile", StudentProfile);