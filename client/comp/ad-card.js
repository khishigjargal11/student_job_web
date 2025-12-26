/**
 * Ажлын байрны зар харуулах компонент
 * Компанийн ажлын байрны мэдээлэл, хүсэлтүүдийг удирдах
 */
class AdCard extends HTMLElement {
    constructor() {
        super();
        this.jobData = null;
    }

    /**
     * Компонент DOM-д холбогдох үед ажиллах функц
     */
    async connectedCallback() {
        const jobId = this.getAttribute("job-id");
        if (jobId) {
            try {
                // API клиент ашиглан ажлын мэдээлэл авах
                const response = await ApiClient.getJobById(jobId);
                if (response.success) {
                    this.jobData = response.job;
                    this.render();
                } else {
                    console.error('Failed to get job data:', response.message);
                    this.renderError();
                }
            } catch (error) {
                console.error('Error loading job data:', error);
                this.renderError();
            }
        } else {
            // Буцах нийцтэй байдлын атрибут дээр суурилсан харуулалт
            this.renderFromAttributes();
        }
    }

    /**
     * Ажлын байрны зарыг харуулах функц
     */
    async render() {
        // Supabase-аас авсан ажлын мэдээлэлтэй шууд ажиллах
        const job = this.jobData;
        
        // Компанийн нэрийг nested companies объектоос авах
        const companyName = job.companies?.company_name || 'Unknown Company';
        
        // Цагийн хуваарийн харуулалт тооцоолох
        const scheduleDisplay = this.getScheduleDisplay(job.schedule);
        
        // Хүсэлтийн тоог авах
        let pendingApplicationsCount = 0;
        let acceptedCount = 0;
        
        try {
            const applicationsResponse = await ApiClient.getJobApplications(job.id);
            if (applicationsResponse.success) {
                const applications = applicationsResponse.applications;
                pendingApplicationsCount = applications.filter(app => app.status === 'pending').length;
                acceptedCount = applications.filter(app => app.status === 'accepted').length;
            }
        } catch (error) {
            console.error('Error fetching application counts:', error);
        }
        
        this.innerHTML = `
        <article class="ad-card" data-job-id="${job.id}">
            <header>
                <h3>${job.title}</h3>
                <div class="job-status ${job.status}">${this.getStatusText(job.status)}</div>
            </header>

            <ul class="ad-info">
                <li>Байршил: ${job.location}</li>
                <li>Ажлын цаг: ${scheduleDisplay}</li>
                <li>Цалин: ${this.getSalaryDisplay(job)}</li>
                <li>Тайлбар: ${job.description}</li>
                <li>Орон тоо: ${acceptedCount}/${job.max_students}</li>
                <li>Хүсэлт: ${pendingApplicationsCount} хүлээгдэж байна</li>
            </ul>

            <footer class="ad-footer">
                ${job.status === 'finished' ? 
                    `<button class="black-btn" onclick="this.closest('ad-card-box').viewFinishedJobDetails()">
                        Дэлгэрэнгүй
                    </button>` :
                    `<button class="gray-btn" onclick="this.closest('ad-card-box').toggleJobStatus()">
                        ${job.status === 'active' ? 'Түр зогсоох' : 'Идэвхжүүлэх'}
                    </button>
                    <button class="black-btn" onclick="this.closest('ad-card-box').viewApplications()">
                        Хүсэлтүүд (${pendingApplicationsCount})
                    </button>
                    <button class="finished-btn" onclick="this.closest('ad-card-box').finishJob()">
                        Дуусгах
                    </button>`
                }
            </footer>
        </article>
        `;
    }

    /**
     * Атрибутуудаас харуулах функц (буцах нийцтэй байдал)
     */
    renderFromAttributes() {
        // Буцах нийцтэй байдлын харуулалт
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
                <button class="gray-btn">Хаах</button>
                <button class="black-btn" onclick="location.href='/company/applications'">Хүсэлтүүд</button>
            </footer>
        </article>
        `;
    }

    /**
     * Хүлээгдэж буй хүсэлтүүдийг авах функц
     * @returns {Array} Хүлээгдэж буй хүсэлтүүдийн жагсаалт
     */
    getPendingApplications() {
        return this.jobData.applications.filter(app => app.status === 'pending');
    }

    /**
     * Цалингийн харуулалт авах функц
     * @param {Object} job - Ажлын мэдээлэл
     * @returns {string} Цалингийн харуулалт
     */
    getSalaryDisplay(job) {
        const formatter = new Intl.NumberFormat('mn-MN');
        switch (job.salary_type) {
            case 'hourly':
                return `${formatter.format(job.salary)}₮ / цаг`;
            case 'daily':
                return `${formatter.format(job.salary)}₮ / өдөр`;
            case 'weekly':
                return `${formatter.format(job.salary)}₮ / 7 хоног`;
            case 'monthly':
                return `${formatter.format(job.salary)}₮ / сар`;
            default:
                return `${formatter.format(job.salary)}₮`;
        }
    }

    /**
     * Ажлын статусыг монгол хэл рүү хөрвүүлэх функц
     * @param {string} status - Ажлын статус
     * @returns {string} Монгол хэл дээрх статус
     */
    getStatusText(status) {
        switch (status) {
            case 'active': return 'Идэвхтэй';
            case 'paused': return 'Түр зогссон';
            case 'closed': return 'Хаагдсан';
            case 'finished': return 'Дууссан';
            default: return 'Тодорхойгүй';
        }
    }

    /**
     * Цагийн хуваарийн харуулалт авах функц
     * @param {Object} schedule - Цагийн хуваарь
     * @returns {string} Цагийн хуваарийн харуулалт
     */
    getScheduleDisplay(schedule) {
        if (!schedule || Object.keys(schedule).length === 0) {
            return 'Цагийн хуваарь тодорхойлоогүй';
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
        
        const scheduleEntries = [];
        
        days.forEach((day, index) => {
            if (schedule[day] && Object.keys(schedule[day]).length > 0) {
                const times = Object.keys(schedule[day]);
                const startTime = Math.min(...times.map(t => parseInt(t.split('-')[0])));
                const endTime = Math.max(...times.map(t => parseInt(t.split('-')[1])));
                scheduleEntries.push(`${dayNames[index]}: ${startTime}:00–${endTime}:00`);
            }
        });
        
        return scheduleEntries.length > 0 ? scheduleEntries.join(', ') : 'Цагийн хуваарь тодорхойлоогүй';
    }

    /**
     * Ажлын статусыг солих функц
     */
    async toggleJobStatus() {
        if (!this.jobData) return;

        const newStatus = this.jobData.status === 'active' ? 'paused' : 'active';
        
        try {
            // API-аар ажлын статусыг шинэчлэх
            const response = await ApiClient.updateJob(this.jobData.id, {
                status: newStatus
            });
            
            if (response.success) {
                this.jobData.status = newStatus;
                await this.render(); // Шинэчлэгдсэн статусыг харуулахын тулд дахин харуулах
                
                const statusText = newStatus === 'active' ? 'идэвхжүүлэгдлээ' : 'түр зогсоогдлоо';
                console.log(`Job ${statusText}`);
                this.showSuccessPopup(`Ажил ${statusText}`);
            } else {
                console.error('Failed to update job status:', response.message);
                this.showErrorPopup('Ажлын статус шинэчлэхэд алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            this.showErrorPopup('Ажлын статус шинэчлэхэд алдаа гарлаа');
        }
    }

    /**
     * Алдааны харуулалт
     */
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

    /**
     * Ажлыг дуусгах функц
     */
    async finishJob() {
        if (!this.jobData) return;

        // Alert-ийн оронд тусгай баталгаажуулах popup харуулах
        this.showFinishJobConfirmation();
    }

    /**
     * Ажил дуусгах баталгаажуулах popup харуулах функц
     */
    showFinishJobConfirmation() {
        // Popup overlay үүсгэх
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        popupOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        popupOverlay.innerHTML = `
            <div class="popup" style="
                background: white;
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <button class="popup-close" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                ">✕</button>

                <div class="popup-header-large" style="margin-bottom: 20px;">
                    <h2 style="color: #333; margin-bottom: 10px;">Ажил дуусгах</h2>
                    <p style="color: #666; line-height: 1.5;">
                        Та "<strong>${this.jobData.title}</strong>" ажлыг дуусгахыг хүсэж байна уу?
                    </p>
                    <p style="color: #888; font-size: 14px; margin-top: 10px;">
                        Энэ ажил дууссан гэж тэмдэглэгдэж, ажилчдын туршлагад нэмэгдэнэ.
                    </p>
                </div>

                <div class="popup-actions" style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                ">
                    <button class="approve-btn" id="confirmFinishBtn" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Тийм, дуусгах</button>
                    <button class="reject-btn" id="cancelFinishBtn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Цуцлах</button>
                </div>
            </div>
        `;

        // Баримт бичигт нэмэх
        document.body.appendChild(popupOverlay);

        // Event listener-үүд
        const closeBtn = popupOverlay.querySelector('.popup-close');
        const confirmBtn = popupOverlay.querySelector('#confirmFinishBtn');
        const cancelBtn = popupOverlay.querySelector('#cancelFinishBtn');

        const closePopup = () => {
            document.body.removeChild(popupOverlay);
        };

        closeBtn.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        
        // Overlay дээр дарж хаах
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopup();
        });

        // Ажил дуусгахыг баталгаажуулах
        confirmBtn.addEventListener('click', async () => {
            closePopup();
            await this.executeFinishJob();
        });
    }

    /**
     * Ажил дуусгах үйлдлийг гүйцэтгэх функц
     */
    async executeFinishJob() {
        try {
            // Ажлын статусыг дууссан болгож шинэчлэх
            const response = await ApiClient.updateJob(this.jobData.id, {
                status: 'finished'
            });

            if (response.success) {
                this.jobData.status = 'finished';
                console.log('Job finished successfully');
                
                // Энд ажлын туршлага үүсгэхгүй - үнэлгээ хадгалагдах хүртэл хүлээх
                // Оюутан тус бүрийг үнэлэх үед ажлын туршлага үүсгэгдэнэ
                
                // Шинэчлэгдсэн статусыг харуулахын тулд дахин харуулах
                await this.render();
                
                // Амжилтын popup харуулах
                this.showSuccessPopup('Ажил амжилттай дууслаа! Оюутнуудыг үнэлж, ажлын туршлага үүсгэнэ үү.');
            } else {
                console.error('Failed to finish job:', response.message);
                this.showErrorPopup('Ажил дуусгахад алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error finishing job:', error);
            this.showErrorPopup('Ажил дуусгахад алдаа гарлаа');
        }
    }

    /**
     * Зөвшөөрөгдсөн оюутнуудад ажлын туршлага нэмэх функц
     */
    async addWorkExperienceForAcceptedStudents() {
        try {
            console.log('Adding work experience for accepted students...');
            
            // Энэ ажлын хүсэлтүүдийг авах
            const applicationsResponse = await ApiClient.getJobApplications(this.jobData.id);
            if (!applicationsResponse.success) {
                console.error('Failed to get applications for work experience');
                return;
            }

            const acceptedApplications = applicationsResponse.applications.filter(app => app.status === 'accepted');
            console.log(`Found ${acceptedApplications.length} accepted students`);

            // Зөвшөөрөгдсөн оюутан тус бүрт ажлын туршлага нэмэх
            for (const application of acceptedApplications) {
                const student = application.students;
                const workExperienceData = {
                    student_id: student.id,
                    job_id: this.jobData.id,
                    company_id: this.jobData.company_id,
                    job_title: this.jobData.title,
                    company_name: this.jobData.companies?.company_name || 'Unknown Company',
                    start_date: new Date().toISOString().split('T')[0], // Өнөөдрийг эхлэх огноо болгох
                    end_date: new Date().toISOString().split('T')[0], // Өнөөдрийг дуусах огноо болгох (дараа шинэчлэх боломжтой)
                    rating: application.rating !== null && application.rating !== undefined ? application.rating : 5, // Бодит үнэлгээ ашиглах, үнэлээгүй бол 5-аар тохируулах
                    salary: this.jobData.salary
                };

                console.log('Adding work experience for student:', student.name);
                console.log('Application rating:', application.rating);
                console.log('Work experience data:', workExperienceData);
                
                // Ажлын туршлага нэмэх API дуудах
                const workResponse = await ApiClient.addWorkExperience(workExperienceData);
                if (workResponse.success) {
                    console.log(`Work experience added for ${student.name}`);
                } else {
                    console.error(`Failed to add work experience for ${student.name}:`, workResponse.message);
                }
            }
        } catch (error) {
            console.error('Error adding work experience:', error);
        }
    }

    /**
     * Амжилтын popup харуулах функц
     * @param {string} message - Харуулах мессеж
     */
    showSuccessPopup(message) {
        this.showMessagePopup(message, 'success');
    }

    /**
     * Алдааны popup харуулах функц
     * @param {string} message - Харуулах мессеж
     */
    showErrorPopup(message) {
        this.showMessagePopup(message, 'error');
    }

    /**
     * Мессежийн popup харуулах функц
     * @param {string} message - Харуулах мессеж
     * @param {string} type - Popup-ийн төрөл (success/error/info)
     */
    showMessagePopup(message, type = 'info') {
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        popupOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const bgColor = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
        const textColor = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'i';

        popupOverlay.innerHTML = `
            <div class="popup" style="
                background: ${bgColor};
                border-radius: 10px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                color: ${textColor};
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">${icon}</div>
                <h3 style="margin-bottom: 15px; color: ${textColor};">${message}</h3>
                <button id="closeMessageBtn" style="
                    background: ${textColor};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">Хаах</button>
            </div>
        `;

        document.body.appendChild(popupOverlay);

        // 3 секундын дараа эсвэл товч дарж автоматаар хаах
        const closePopup = () => {
            document.body.removeChild(popupOverlay);
        };

        popupOverlay.querySelector('#closeMessageBtn').addEventListener('click', closePopup);
        setTimeout(closePopup, 3000);
    }

    /**
     * Дууссан ажлын дэлгэрэнгүй мэдээллийг харах функц
     */
    viewFinishedJobDetails() {
        if (!this.jobData) return;
        
        // Ажлын ID-г хадгалж, дууссан ажлын харагдац гэж тэмдэглэх
        sessionStorage.setItem('viewingJobId', this.jobData.id);
        sessionStorage.setItem('isFinishedJobView', 'true');
        window.location.href = '/company/applications';
    }

    /**
     * Хүсэлтүүдийг харах функц
     */
    viewApplications() {
        if (!this.jobData) return;
        
        // ID-г хадгалах
        sessionStorage.setItem('viewingJobId', this.jobData.id);
        window.location.href = '/company/applications';
    }
}

customElements.define("ad-card-box", AdCard);
