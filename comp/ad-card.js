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
                <button class="gray-btn" onclick="this.closest('ad-card-box').toggleJobStatus()">
                    ${this.jobData.status === 'active' ? 'Түр зогсоох' : 'Идэвхжүүлэх'}
                </button>
                <button class="black-btn" onclick="this.closest('ad-card-box').viewApplications()">
                    Хүсэлтүүд (${pendingApplications.length})
                </button>
                <button class="delete-btn" onclick="this.closest('ad-card-box').deleteJob()">
                     Устгах
                </button>
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
        alert(`Зар ${statusText}`);
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

    deleteJob() {
        if (!this.jobData) return;

        const confirmDelete = confirm(
            `Та "${this.jobData.title}" зарыг бүрмөсөн устгахыг хүсэж байна уу?\n\n` +
            'Энэ үйлдлийг буцаах боломжгүй!'
        );

        if (!confirmDelete) return;

        // Remove job from storage
        const jobs = DataManager.getJobs();
        const updatedJobs = jobs.filter(job => job.id !== this.jobData.id);
        DataManager.saveJobs(updatedJobs);

        // Remove job from company's posted jobs
        const currentUser = DataManager.getCurrentUser();
        if (currentUser && currentUser.type === 'company') {
            const company = DataManager.getCompanyById(currentUser.id);
            if (company) {
                company.postedJobs = company.postedJobs.filter(jobId => jobId !== this.jobData.id);
                company.updatedAt = new Date().toISOString();
                DataManager.saveCompany(company);
            }
        }

        alert('Зар амжилттай устгагдлаа');
        
        this.remove();     

    }

    viewApplications() {
        if (!this.jobData) return;
        
        // id g hadgalna
        sessionStorage.setItem('viewingJobId', this.jobData.id);
        window.location.href = 'ReqForMarket.html';
    }
}

customElements.define("ad-card-box", AdCard);
