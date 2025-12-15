class AdCard extends HTMLElement {
    constructor() {
        super();
        this.jobData = null;
    }

    connectedCallback() {
        const jobId = this.getAttribute("job-id");
        if (jobId) {
            this.jobData = DataManager.getJobById(jobId);
            if (this.jobData) {
                try {
                    this.render();
                } catch (error) {
                    console.error('Error rendering ad-card:', error);
                    this.renderError();
                }
            } else {
                console.error('Job not found:', jobId);
                this.renderError();
            }
        } else {
            // Fallback to attribute-based rendering for backward compatibility
            this.renderFromAttributes();
        }
    }

    render() {
        // Convert plain object to Job instance if needed
        if (!(this.jobData instanceof Job)) {
            this.jobData = new Job(this.jobData);
        }

        const pendingApplications = this.getPendingApplications();
        const acceptedCount = this.jobData.acceptedStudents.length;
        const scheduleDisplay = this.getScheduleDisplay();

        this.innerHTML = `
        <article class="ad-card" data-job-id="${this.jobData.id}">
            <header>
                <h3>${this.jobData.title}</h3>
                <div class="job-status ${this.jobData.status}">${this.getStatusText()}</div>
            </header>

            <ul class="ad-info">
                <li>📍 Байршил: ${this.jobData.location}</li>
                <li>⏰ Ажлын цаг: ${scheduleDisplay}</li>
                <li>💰 Цалин: ${this.getSalaryDisplay()}</li>
                <li>🧾 Тайлбар: ${this.jobData.description}</li>
                <li>👥 Орон тоо: ${acceptedCount}/${this.jobData.maxPositions}</li>
                <li>📋 Хүсэлт: ${pendingApplications.length} хүлээгдэж байна</li>
            </ul>

            <footer class="ad-footer">
                <span class="rating">${this.getAverageRating()}⭐</span>
                ${this.jobData.status === 'finished' ? 
                    `<button class="black-btn" onclick="this.closest('ad-card-box').viewFinishedJobDetails()">
                        Дэлгэрэнгүй
                    </button>` :
                    `<button class="gray-btn" onclick="this.closest('ad-card-box').toggleJobStatus()">
                        ${this.jobData.status === 'active' ? 'Түр зогсоох' : 'Идэвхжүүлэх'}
                    </button>
                    <button class="black-btn" onclick="this.closest('ad-card-box').viewApplications()">
                        Хүсэлтүүд (${pendingApplications.length})
                    </button>
                    <button class="finished-btn" onclick="this.closest('ad-card-box').finishJob()">
                        Дуусгах
                    </button>`
                }
            </footer>
        </article>
        `;
    }

    renderFromAttributes() {
        // Backward compatibility rendering
        const title = this.getAttribute("title") || "";
        const locationTxt = this.getAttribute("location") || "";
        const time = this.getAttribute("time") || "";
        const salary = this.getAttribute("salary") || "";
        const desc = this.getAttribute("desc") || "";
        const rate = this.getAttribute("rate") || "";

        this.innerHTML = `
        <article class="ad-card">
            <header>
                <h3>${title}</h3>
            </header>

            <ul class="ad-info">
                <li>📍 Байршил: ${locationTxt}</li>
                <li>⏰ Ажлын цаг: ${time}</li>
                <li>💰 Цалин: ${salary}</li>
                <li>🧾 Тайлбар: ${desc}</li>
            </ul>

            <footer class="ad-footer">
                <span class="rating">${rate}</span>
                <button class="gray-btn">Хаах</button>
                <button class="black-btn" onclick="location.href='ReqForMarket.html'">Хүсэлтүүд</button>
            </footer>
        </article>
        `;
    }

    getPendingApplications() {
        return this.jobData.applications.filter(app => app.status === 'pending');
    }

    getSalaryDisplay() {
        const formatter = new Intl.NumberFormat('mn-MN');
        switch (this.jobData.salaryType) {
            case 'hourly':
                return `${formatter.format(this.jobData.salary)}₮ / цаг`;
            case 'daily':
                return `${formatter.format(this.jobData.salary)}₮ / өдөр`;
            case 'weekly':
                return `${formatter.format(this.jobData.salary)}₮ / 7 хоног`;
            case 'monthly':
                return `${formatter.format(this.jobData.salary)}₮ / сар`;
            default:
                return `${formatter.format(this.jobData.salary)}₮`;
        }
    }

    getAverageRating() {
        return this.jobData.totalRatings > 0 ? (this.jobData.rating / this.jobData.totalRatings).toFixed(1) : 0;
    }

    getStatusText() {
        switch (this.jobData.status) {
            case 'active': return 'Идэвхтэй';
            case 'paused': return 'Түр зогссон';
            case 'closed': return 'Хаагдсан';
            case 'finished': return 'Дууссан';
            default: return 'Тодорхойгүй';
        }
    }

    getScheduleDisplay() {
        if (!this.jobData.schedule || Object.keys(this.jobData.schedule).length === 0) {
            return 'Цагийн хуваарь тодорхойлоогүй';
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
        
        const scheduleEntries = [];
        
        days.forEach((day, index) => {
            if (this.jobData.schedule[day] && Object.keys(this.jobData.schedule[day]).length > 0) {
                const times = Object.keys(this.jobData.schedule[day]);
                const startTime = Math.min(...times.map(t => parseInt(t.split('-')[0])));
                const endTime = Math.max(...times.map(t => parseInt(t.split('-')[1])));
                scheduleEntries.push(`${dayNames[index]}: ${startTime}:00–${endTime}:00`);
            }
        });
        
        return scheduleEntries.length > 0 ? scheduleEntries.join(', ') : 'Цагийн хуваарь тодорхойлоогүй';
    }

    toggleJobStatus() {
        if (!this.jobData) return;

        const newStatus = this.jobData.status === 'active' ? 'paused' : 'active';
        this.jobData.status = newStatus;
        this.jobData.updatedAt = new Date().toISOString();
        
        // Save as plain object
        const jobToSave = this.jobData instanceof Job ? this.jobData.toJSON() : this.jobData;
        DataManager.saveJob(jobToSave);
        this.render(); // Re-render to show updated status
        
        const statusText = newStatus === 'active' ? 'идэвхжүүлэгдлээ' : 'түр зогсоогдлоо';
        console.log(`Job ${statusText}`);
    }

    renderError() {
        this.innerHTML = `
        <article class="ad-card error">
            <header>
                <h3>Алдаа гарлаа</h3>
            </header>
            <p>Ажлын мэдээлэл ачаалахад алдаа гарлаа</p>
        </article>
        `;
    }

    finishJob() {
        if (!this.jobData) return;

        const confirmFinish = confirm(
            `Та "${this.jobData.title}" ажлыг дуусгахыг хүсэж байна уу?\n\n` +
            'Энэ ажил дууссан гэж тэмдэглэгдэж, ажилчдын туршлагад нэмэгдэнэ.'
        );

        if (!confirmFinish) return;

        // Change job status to finished
        this.jobData.status = 'finished';
        this.jobData.finishedAt = new Date().toISOString();
        this.jobData.updatedAt = new Date().toISOString();

        // Add work experience to accepted students
        this.jobData.acceptedStudents.forEach(studentId => {
            this.addWorkExperienceToStudent(studentId);
        });

        // Save updated job
        const jobToSave = this.jobData instanceof Job ? this.jobData.toJSON() : this.jobData;
        DataManager.saveJob(jobToSave);

        console.log('Job finished successfully');
        
        // Re-render to show updated status
        this.render();
    }

    addWorkExperienceToStudent(studentId) {
        const studentData = DataManager.getStudentById(studentId);
        if (!studentData) return;

        const student = new Student(studentData);
        const company = DataManager.getCompanyById(this.jobData.companyId);
        
        const workEntry = {
            id: 'work_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            jobId: this.jobData.id,
            jobTitle: this.jobData.title,
            companyName: company ? company.companyName : 'Тодорхойгүй компани',
            startDate: this.jobData.createdAt.split('T')[0], // Use job creation date as start
            endDate: new Date().toISOString().split('T')[0], // Today as end date
            rating: 0, // Will be set when company rates
            review: '',
            salary: this.jobData.salary,
            salaryType: this.jobData.salaryType,
            addedAt: new Date().toISOString()
        };

        student.workHistory.push(workEntry);
        student.updatedAt = new Date().toISOString();

        DataManager.saveStudent(student.toJSON());
        console.log(`Work experience added to student ${student.name}`);
    }

    viewFinishedJobDetails() {
        if (!this.jobData) return;
        
        // Store job ID and mark as finished job view
        sessionStorage.setItem('viewingJobId', this.jobData.id);
        sessionStorage.setItem('isFinishedJobView', 'true');
        window.location.href = 'ReqForMarket.html';
    }

    viewApplications() {
        if (!this.jobData) return;
        
        // id g hadgalna
        sessionStorage.setItem('viewingJobId', this.jobData.id);
        window.location.href = 'ReqForMarket.html';
    }
}

customElements.define("ad-card-box", AdCard);
