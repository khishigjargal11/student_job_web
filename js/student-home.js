/**
 * Оюутны нүүр хуудасны JavaScript функцүүд
 * Оюутны нүүр хуудасны бүх JavaScript функцийг агуулна
 */

class StudentHome {
    /**
     * Системийг эхлүүлэх функц - DOM ачаалагдсаны дараа ажиллана
     */
    static init() {
        // Мэдээлэл эхлүүлж, оюутны контентыг ачаалах
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('Page loaded, checking auth...');
            
            // API-аар нэвтрэх эрхийг шалгах
            const isAuthenticated = await ApiClient.ensureAuthenticated();
            if (!isAuthenticated) {
                return; // Нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлнэ
            }
            
            const currentUser = ApiClient.getCurrentUser();
            if (!currentUser || currentUser.type !== 'student') {
                window.location.href = '/login';
                return;
            }
            
            console.log('Auth passed, loading student data...');
            StudentHome.loadStudentData();
        });

        // Хуудас харагдахад ажлын байрнуудыг шинэчлэх (хэрэглэгч таб руу буцаж ирэхэд)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('Page became visible, refreshing jobs...');
                StudentHome.refreshJobs();
            }
        });

        // Профайл шинэчлэгдсэн үед сонсох
        window.addEventListener('profileUpdated', function() {
            console.log('Profile updated, refreshing page data...');
            StudentHome.loadStudentData();
        });

        // Функцүүдийг глобал хүрээнд ашиглах боломжтой болгох
        window.editProfile = StudentHome.editProfile;
        window.showWorkHistory = StudentHome.showWorkHistory;
        window.testPopup = StudentHome.testPopup;
        window.refreshJobs = StudentHome.refreshJobs;
        window.applyForJob = StudentHome.applyForJob;
        window.withdrawApplication = StudentHome.withdrawApplication;
        window.editStudentProfile = StudentHome.editStudentProfile;
    }

    /**
     * Оюутны мэдээлэл ачаалах функц
     */
    static async loadStudentData() {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') return;

        // API-аас бодит мэдээллээр оюутны профайлыг шинэчлэх
        await StudentHome.updateStudentProfile(currentUser);
        
        // API-аас боломжтой ажлын байрнуудыг ачаалах
        await StudentHome.loadAvailableJobs(currentUser);
    }

    /**
     * Оюутны профайл шинэчлэх функц
     * @param {Object} currentUser - Одоогийн хэрэглэгч
     */
    static async updateStudentProfile(currentUser) {
        try {
            const response = await ApiClient.getStudentProfile();
            if (!response.success) {
                console.error('Failed to get student profile:', response.message);
                return;
            }

            const student = response.student;

            // Бодит мэдээллээр student-profile атрибутуудыг шинэчлэх
            const profileElement = document.querySelector('student-profile');
            if (profileElement) {
                profileElement.setAttribute('name', student.name);
                profileElement.setAttribute('phone', student.phone);
                profileElement.setAttribute('email', student.email);
            }

            // Ажлын туршлагын info-card-ыг шинэчлэх
            await StudentHome.updateWorkHistoryCard(student);
        } catch (error) {
            console.error('Error updating student profile:', error);
        }
    }

    /**
     * Ажлын туршлагын карт шинэчлэх функц
     * @param {Object} student - Оюутны мэдээлэл
     */
    static async updateWorkHistoryCard(student) {
        console.log('Updating work history card for student:', student);
        const infoCard = document.querySelector('info-card');
        console.log('Found info-card element:', infoCard);
        
        if (!infoCard) {
            console.log('No info-card element found!');
            return;
        }

        try {
            // API-аас ажлын туршлага авах
            const response = await ApiClient.getStudentWorkHistory();
            if (!response.success) {
                console.log('No work history found, setting default values');
                infoCard.setAttribute('title', 'Ажлын туршлага байхгүй');
                infoCard.setAttribute('period', '');
                infoCard.setAttribute('rating', '0');
                return;
            }

            const workHistory = response.workHistory;
            if (!workHistory || workHistory.length === 0) {
                console.log('No work history found, setting default values');
                infoCard.setAttribute('title', 'Ажлын туршлага байхгүй');
                infoCard.setAttribute('period', '');
                infoCard.setAttribute('rating', '0');
                return;
            }

            // Хамгийн сүүлийн ажлын туршлагыг харуулах
            const recentWork = workHistory[0]; // start_date DESC-ээр эрэмбэлэгдсэн
            console.log('Setting work history:', recentWork);
            
            infoCard.setAttribute('title', recentWork.job_title);
            infoCard.setAttribute('period', `${recentWork.start_date} – ${recentWork.end_date}`);
            infoCard.setAttribute('rating', recentWork.rating.toString());
            
            console.log('Work history card updated with attributes:', {
                title: recentWork.job_title,
                period: `${recentWork.start_date} – ${recentWork.end_date}`,
                rating: recentWork.rating.toString()
            });
        } catch (error) {
            console.error('Error updating work history card:', error);
            infoCard.setAttribute('title', 'Ажлын туршлага байхгүй');
            infoCard.setAttribute('period', '');
            infoCard.setAttribute('rating', '0');
        }
    }

    /**
     * Боломжтой ажлын байрнуудыг ачаалах функц
     * @param {Object} currentUser - Одоогийн хэрэглэгч
     */
    static async loadAvailableJobs(currentUser) {
        try {
            console.log('🔍 DEBUG: Loading available jobs...');
            const response = await ApiClient.getAvailableJobs();
            console.log('🔍 DEBUG: Available jobs response:', response);
            
            if (!response.success) {
                console.error('Failed to get available jobs:', response.message);
                return;
            }

            const availableJobs = response.jobs;
            console.log('🔍 DEBUG: Available jobs count:', availableJobs.length);
            console.log('🔍 DEBUG: Available jobs:', availableJobs);
            const mainContent = document.querySelector('.main-content');
            
            // Одоо байгаа ажлын картуудыг устгах (job-search-ыг үлдээх)
            const existingJobCards = mainContent.querySelectorAll('job-card');
            existingJobCards.forEach(card => card.remove());

            if (availableJobs.length === 0) {
                // Ажил байхгүй бол мессеж нэмэх
                const noJobsMsg = document.createElement('div');
                noJobsMsg.className = 'no-jobs-message';
                noJobsMsg.innerHTML = '<p>Таны цагийн хуваарьтай тохирох ажил олдсонгүй. <a href="/student/calendar">Цагийн хуваарь тохируулах</a></p>';
                mainContent.appendChild(noJobsMsg);
                return;
            }

            // Боломжтой ажлуудын картуудыг нэмэх
            availableJobs.forEach(job => {
                console.log('Creating job card for:', job.id, job.title);
                
                const jobCard = document.createElement('job-card');
                jobCard.setAttribute('title', job.title);
                jobCard.setAttribute('company', job.company_name);
                jobCard.setAttribute('location', job.location);
                jobCard.setAttribute('time', StudentHome.getJobTimeDisplay(job.schedule));
                jobCard.setAttribute('salary', StudentHome.getJobSalaryDisplay(job));
                jobCard.setAttribute('job-id', job.id); // Энэ чухал!
                
                console.log('Job card attributes set:', {
                    title: job.title,
                    jobId: job.id,
                    hasJobId: jobCard.getAttribute('job-id')
                });
                
                mainContent.appendChild(jobCard);
            });
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    }

    /**
     * Ажлын цагийн хуваарь харуулах функц
     * @param {Object} schedule - Цагийн хуваарь
     * @returns {string} Цагийн хуваарийн текст
     */
    static getJobTimeDisplay(schedule) {
        if (!schedule || Object.keys(schedule).length === 0) {
            return 'Цагийн хуваарь тодорхойлоогүй';
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
        
        let minHour = 24, maxHour = 0;
        let activeDays = [];
        
        days.forEach((day, index) => {
            if (schedule[day] && Object.keys(schedule[day]).length > 0) {
                activeDays.push(dayNames[index]);
                const times = Object.keys(schedule[day]);
                const dayMinHour = Math.min(...times.map(t => parseInt(t.split('-')[0])));
                const dayMaxHour = Math.max(...times.map(t => parseInt(t.split('-')[1])));
                minHour = Math.min(minHour, dayMinHour);
                maxHour = Math.max(maxHour, dayMaxHour);
            }
        });
        
        return activeDays.length > 0 ? `${minHour}:00 – ${maxHour}:00` : 'Тодорхойгүй';
    }

    /**
     * Ажлын цалин харуулах функц
     * @param {Object} job - Ажлын мэдээлэл
     * @returns {string} Цалингийн текст
     */
    static getJobSalaryDisplay(job) {
        const formatter = new Intl.NumberFormat('mn-MN');
        switch (job.salaryType) {
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
     * Ажилд хүсэлт илгээх глобал функц
     * @param {string} jobId - Ажлын ID
     */
    static async applyForJob(jobId) {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Only students can apply for jobs');
            return;
        }

        try {
            // Эхлээд ажлын дэлгэрэнгүй мэдээлэл авах
            const jobResponse = await ApiClient.getJobById(jobId);
            if (!jobResponse.success) {
                console.log('Job not found');
                return;
            }

            const job = jobResponse.job;

            // Prompt-ын оронд хүсэлтийн popup харуулах
            StudentHome.showApplicationPopup(jobId, job);
        } catch (error) {
            console.error('Error applying for job:', error);
            StudentHome.showMessagePopup('Хүсэлт илгээхэд алдаа гарлаа', 'error');
        }
    }

    /**
     * Хүсэлт илгээх popup харуулах функц
     * @param {string} jobId - Ажлын ID
     * @param {Object} job - Ажлын мэдээлэл
     */
    static showApplicationPopup(jobId, job) {
        // Create popup overlay
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
                    <h2 style="color: #333; margin-bottom: 10px;">Ажилд хүсэлт илгээх</h2>
                    <p style="color: #666; line-height: 1.5;">
                        <strong>${job.title}</strong> ажилд хүсэлт илгээх
                    </p>
                    <p style="color: #888; font-size: 14px; margin-top: 10px;">
                        Компани: ${job.companies?.company_name || 'Тодорхойгүй'}
                    </p>
                </div>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
                        Хүсэлтийн мессеж (сонголттой):
                    </label>
                    <textarea id="applicationMessage" 
                              placeholder="Та өөрийн талаар товч мэдээлэл, туршлага эсвэл энэ ажилд яагаад сонирхож байгаагаа бичиж болно..."
                              style="
                                  width: 100%;
                                  height: 100px;
                                  padding: 10px;
                                  border: 1px solid #ddd;
                                  border-radius: 5px;
                                  font-family: inherit;
                                  font-size: 14px;
                                  resize: vertical;
                              "></textarea>
                </div>

                <div class="popup-actions" style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                ">
                    <button class="approve-btn" id="submitApplicationBtn" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Хүсэлт илгээх</button>
                    <button class="reject-btn" id="cancelApplicationBtn" style="
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

        // Add to document
        document.body.appendChild(popupOverlay);

        // Event listeners
        const closeBtn = popupOverlay.querySelector('.popup-close');
        const submitBtn = popupOverlay.querySelector('#submitApplicationBtn');
        const cancelBtn = popupOverlay.querySelector('#cancelApplicationBtn');
        const messageTextarea = popupOverlay.querySelector('#applicationMessage');

        const closePopup = () => {
            document.body.removeChild(popupOverlay);
        };

        closeBtn.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        
        // Close on overlay click
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopup();
        });

        // Submit application
        submitBtn.addEventListener('click', async () => {
            const message = messageTextarea.value.trim();
            closePopup();
            
            try {
                // Apply for job via API
                const response = await ApiClient.applyForJob(jobId, message || '');
                
                if (response.success) {
                    console.log('Application submitted successfully');
                    StudentHome.showMessagePopup('Хүсэлт амжилттай илгээгдлээ!', 'success');
                    // Refresh the job cards to show updated state
                    StudentHome.loadStudentData();
                } else {
                    console.log('Failed to submit application:', response.message);
                    StudentHome.showMessagePopup(response.message || 'Хүсэлт илгээхэд алдаа гарлаа', 'error');
                }
            } catch (error) {
                console.error('Error submitting application:', error);
                StudentHome.showMessagePopup('Хүсэлт илгээхэд алдаа гарлаа', 'error');
            }
        });

        // Focus on textarea
        setTimeout(() => messageTextarea.focus(), 100);
    }

    static showMessagePopup(message, type = 'info') {
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
                <div style="font-size: 48px; margin-bottom: 15px; font-weight: bold;">${icon}</div>
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

        // Auto close after 3 seconds or on button click
        const closePopup = () => {
            document.body.removeChild(popupOverlay);
        };

        popupOverlay.querySelector('#closeMessageBtn').addEventListener('click', closePopup);
        setTimeout(closePopup, 3000);
    }

    // Manual refresh function
    static async refreshJobs() {
        const currentUser = ApiClient.getCurrentUser();
        if (currentUser && currentUser.type === 'student') {
            console.log('Refreshing job listings...');
            await StudentHome.loadAvailableJobs(currentUser);
        }
    }

    // Global function for editing profile
    static async editProfile() {
        console.log('editProfile function called');
        
        // Wait a bit for DOM to be ready
        setTimeout(async () => {
            const currentUser = ApiClient.getCurrentUser();
            console.log('Current user:', currentUser);
            
            if (!currentUser || currentUser.type !== 'student') {
                console.log('Authentication error');
                return;
            }

            try {
                const response = await ApiClient.getStudentProfile();
                if (!response.success) {
                    console.log('Failed to get student data:', response.message);
                    return;
                }

                const studentData = response.student;
                console.log('Student data:', studentData);
                
                // Create a Student-like object for the popup
                const student = {
                    id: studentData.id,
                    name: studentData.name,
                    email: studentData.email,
                    phone: studentData.phone,
                    gender: studentData.gender,
                    age: studentData.age,
                    schedule: studentData.schedule || {}
                };
                
                const popup = document.querySelector('student-popup');
                console.log('Popup element:', popup);
                
                if (popup) {
                    console.log('Calling showProfileEditor');
                    popup.showProfileEditor(student);
                } else {
                    console.log('Popup element not found!');
                }
            } catch (error) {
                console.error('Error loading student data for editing:', error);
            }
        }, 100);
    }

    // Global function for showing work history
    static async showWorkHistory() {
        console.log('showWorkHistory function called');
        
        // Wait a bit for DOM to be ready
        setTimeout(async () => {
            const currentUser = ApiClient.getCurrentUser();
            console.log('Current user:', currentUser);
            
            if (!currentUser || currentUser.type !== 'student') {
                console.log('Authentication error');
                return;
            }

            try {
                const response = await ApiClient.getStudentProfile();
                if (!response.success) {
                    console.log('Failed to get student data:', response.message);
                    return;
                }

                const studentData = response.student;
                console.log('Student data:', studentData);
                
                // Get work history
                const workHistoryResponse = await ApiClient.getStudentWorkHistory();
                const workHistory = workHistoryResponse.success ? workHistoryResponse.workHistory : [];
                
                // Create a Student-like object for the popup
                const student = {
                    id: studentData.id,
                    name: studentData.name,
                    email: studentData.email,
                    phone: studentData.phone,
                    gender: studentData.gender,
                    age: studentData.age,
                    workHistory: workHistory
                };
                
                const popup = document.querySelector('student-popup');
                console.log('Popup element:', popup);
                
                if (popup) {
                    console.log('Calling showWorkHistoryOnly');
                    popup.showWorkHistoryOnly(student);
                } else {
                    console.log('Popup element not found!');
                }
            } catch (error) {
                console.error('Error loading student data for work history:', error);
            }
        }, 100);
    }

    // Test function
    static testPopup() {
        console.log('Test popup called');
        const popup = document.querySelector('student-popup');
        console.log('Popup element:', popup);
        
        if (popup && popup.overlay) {
            console.log('Setting overlay to visible with red background');
            popup.overlay.style.display = 'flex';
            popup.overlay.style.background = 'rgba(255, 0, 0, 0.8)';
            popup.overlay.style.zIndex = '99999';
            popup.overlay.innerHTML = '<div style="background: white; padding: 50px; border-radius: 10px;"><h1>TEST POPUP VISIBLE!</h1><button onclick="document.querySelector(\'student-popup\').overlay.style.display=\'none\'">Close</button></div>';
        } else {
            console.log('Popup or overlay not found');
        }
    }

    // Global function for editing student profile
    static async editStudentProfile() {
        const currentUser = ApiClient.getCurrentUser();
        
        try {
            const response = await ApiClient.getStudentProfile();
            if (!response.success) {
                StudentHome.showMessagePopup('Профайл мэдээлэл авахад алдаа гарлаа', 'error');
                return;
            }

            const student = response.student;
            
            const newName = prompt('Нэр:', student.name);
            const newPhone = prompt('Утасны дугаар:', student.phone);
            const newEmail = prompt('И-мэйл:', student.email);

            if (newName !== null && newPhone !== null && newEmail !== null) {
                const updateResponse = await ApiClient.updateStudentProfile({
                    name: newName.trim(),
                    phone: newPhone.trim(),
                    email: newEmail.trim(),
                    gender: student.gender,
                    age: student.age
                });

                if (updateResponse.success) {
                    // Update local user data
                    const updatedUser = { ...currentUser, name: newName.trim(), email: newEmail.trim() };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    
                    // Refresh the profile display
                    StudentHome.loadStudentData();
                    console.log('Profile updated successfully');
                    StudentHome.showMessagePopup('Профайл амжилттай шинэчлэгдлээ', 'success');
                } else {
                    StudentHome.showMessagePopup(updateResponse.message || 'Профайл шинэчлэхэд алдаа гарлаа', 'error');
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            StudentHome.showMessagePopup('Профайл шинэчлэхэд алдаа гарлаа', 'error');
        }
    }

    // Global function for withdrawing job application
    static async withdrawApplication(jobId) {
        // Show confirmation popup instead of confirm dialog
        StudentHome.showWithdrawConfirmation(jobId);
    }

    static showWithdrawConfirmation(jobId) {
        // Create popup overlay
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
                    <h2 style="color: #333; margin-bottom: 10px;">Хүсэлт цуцлах</h2>
                    <p style="color: #666; line-height: 1.5;">
                        Та энэ ажлын хүсэлтээ цуцлахыг хүсэж байна уу?
                    </p>
                    <p style="color: #888; font-size: 14px; margin-top: 10px;">
                        Цуцлагдсан хүсэлтийг дахин сэргээх боломжгүй.
                    </p>
                </div>

                <div class="popup-actions" style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                ">
                    <button class="approve-btn" id="confirmWithdrawBtn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Тийм, цуцлах</button>
                    <button class="reject-btn" id="cancelWithdrawBtn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Үгүй</button>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(popupOverlay);

        // Event listeners
        const closeBtn = popupOverlay.querySelector('.popup-close');
        const confirmBtn = popupOverlay.querySelector('#confirmWithdrawBtn');
        const cancelBtn = popupOverlay.querySelector('#cancelWithdrawBtn');

        const closePopup = () => {
            document.body.removeChild(popupOverlay);
        };

        closeBtn.addEventListener('click', closePopup);
        cancelBtn.addEventListener('click', closePopup);
        
        // Close on overlay click
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopup();
        });

        // Confirm withdraw
        confirmBtn.addEventListener('click', async () => {
            closePopup();
            await StudentHome.executeWithdraw(jobId);
        });
    }

    static async executeWithdraw(jobId) {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Authentication error');
            return;
        }

        try {
            const response = await ApiClient.withdrawJobApplication(jobId);
            
            if (response.success) {
                console.log('Application withdrawn successfully');
                StudentHome.showMessagePopup('Хүсэлт амжилттай цуцлагдлаа', 'success');
                // Refresh the job cards to show updated state
                StudentHome.loadStudentData();
            } else {
                console.log('Failed to withdraw application:', response.message);
                StudentHome.showMessagePopup(response.message || 'Хүсэлт цуцлахад алдаа гарлаа', 'error');
            }
        } catch (error) {
            console.error('Error withdrawing application:', error);
            StudentHome.showMessagePopup('Хүсэлт цуцлахад алдаа гарлаа', 'error');
        }
    }
}

// Initialize when the script loads
StudentHome.init();