/**
 * Student Home Page JavaScript Functions
 * Contains all the JavaScript functionality for the student home page
 */

class StudentHome {
    static init() {
        // Initialize data and load student content
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Page loaded, checking auth...');
            
            // Check authentication
            if (!RouteGuard.requireStudentAuth()) {
                return; // Will redirect if not authenticated
            }
            
            console.log('Auth passed, initializing data...');
            DataManager.initializeData();
            
            // Add a small delay to ensure everything is loaded
            setTimeout(() => {
                console.log('Loading student data...');
                StudentHome.loadStudentData();
            }, 100);
        });

        // Auto-refresh jobs every 30 seconds
        setInterval(() => {
            console.log('Auto-refreshing jobs...');
            StudentHome.refreshJobs();
        }, 30000);

        // Refresh jobs when page becomes visible (user returns to tab)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('Page became visible, refreshing jobs...');
                StudentHome.refreshJobs();
            }
        });

        // Listen for profile updates
        window.addEventListener('profileUpdated', function() {
            console.log('Profile updated, refreshing page data...');
            StudentHome.loadStudentData();
        });

        // Make functions available globally
        window.editProfile = StudentHome.editProfile;
        window.showWorkHistory = StudentHome.showWorkHistory;
        window.testPopup = StudentHome.testPopup;
        window.refreshJobs = StudentHome.refreshJobs;
        window.applyForJob = StudentHome.applyForJob;
        window.withdrawApplication = StudentHome.withdrawApplication;
        window.editStudentProfile = StudentHome.editStudentProfile;
    }

    static loadStudentData() {
        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') return;

        // Update student profile with real data
        StudentHome.updateStudentProfile(currentUser);
        
        // Load available jobs
        StudentHome.loadAvailableJobs(currentUser);
    }

    static updateStudentProfile(currentUser) {
        const student = DataManager.getStudentById(currentUser.id);
        if (!student) return;

        // Update the student-profile attributes with real data
        const profileElement = document.querySelector('student-profile');
        if (profileElement) {
            profileElement.setAttribute('name', student.name);
            profileElement.setAttribute('phone', student.phone);
            profileElement.setAttribute('email', student.email);
        }

        // Update work history info-card
        StudentHome.updateWorkHistoryCard(student);
    }

    static updateWorkHistoryCard(student) {
        console.log('Updating work history card for student:', student);
        const infoCard = document.querySelector('info-card');
        console.log('Found info-card element:', infoCard);
        
        if (!infoCard) {
            console.log('No info-card element found!');
            return;
        }

        if (!student.workHistory || student.workHistory.length === 0) {
            console.log('No work history found, setting default values');
            infoCard.setAttribute('title', 'Ажлын туршлага байхгүй');
            infoCard.setAttribute('period', '');
            infoCard.setAttribute('rating', '0');
            return;
        }

        // Show the most recent work history
        const recentWork = student.workHistory[student.workHistory.length - 1];
        console.log('Setting work history:', recentWork);
        
        infoCard.setAttribute('title', recentWork.jobTitle);
        infoCard.setAttribute('period', `${recentWork.startDate} – ${recentWork.endDate}`);
        infoCard.setAttribute('rating', recentWork.rating.toString());
        
        console.log('Work history card updated with attributes:', {
            title: recentWork.jobTitle,
            period: `${recentWork.startDate} – ${recentWork.endDate}`,
            rating: recentWork.rating.toString()
        });
    }

    static loadAvailableJobs(currentUser) {
        try {
            const availableJobs = DataManager.getAvailableJobsForStudent(currentUser.id);
            const mainContent = document.querySelector('.main-content');
            
            // Remove existing job cards (keep job-search)
            const existingJobCards = mainContent.querySelectorAll('job-card');
            existingJobCards.forEach(card => card.remove());

            if (availableJobs.length === 0) {
                // Add a message if no jobs available
                const noJobsMsg = document.createElement('div');
                noJobsMsg.className = 'no-jobs-message';
                noJobsMsg.innerHTML = '<p>Таны цагийн хуваарьтай тохирох ажил олдсонгүй. <a href="Calendar.html">Цагийн хуваарь тохируулах</a></p>';
                mainContent.appendChild(noJobsMsg);
                return;
            }

            // Add job cards for available jobs
            availableJobs.forEach(job => {
                console.log('Creating job card for:', job.id, job.title);
                
                const company = DataManager.getCompanyById(job.companyId);
                const companyName = company ? company.companyName : 'Компани';
                
                const jobCard = document.createElement('job-card');
                jobCard.setAttribute('title', job.title);
                jobCard.setAttribute('company', companyName);
                jobCard.setAttribute('location', job.location);
                jobCard.setAttribute('time', StudentHome.getJobTimeDisplay(job.schedule));
                jobCard.setAttribute('salary', StudentHome.getJobSalaryDisplay(job));
                jobCard.setAttribute('rating', StudentHome.getJobRating(job));
                jobCard.setAttribute('job-id', job.id); // This is crucial!
                
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

    static getJobRating(job) {
        return job.totalRatings > 0 ? (job.rating / job.totalRatings).toFixed(1) : '0';
    }

    // Global function for job application
    static applyForJob(jobId) {
        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Only students can apply for jobs');
            return;
        }

        const job = DataManager.getJobById(jobId);
        const student = DataManager.getStudentById(currentUser.id);
        
        if (!job || !student) {
            console.log('Job or student data not found for application');
            return;
        }

        // Check schedule conflict
        if (DataManager.hasScheduleConflict(student.schedule, job.schedule)) {
            const confirmApply = confirm(
                'Таны цагийн хуваарь энэ ажлын цагтай давхцаж байна. ' +
                'Та үргэлжлүүлэн хүсэлт илгээхийг хүсэж байна уу?'
            );
            if (!confirmApply) return;
        }

        // Show application modal or simple prompt
        const message = prompt('Хүсэлтийн мессеж (сонголттой):');
        if (message === null) return; // User cancelled

        // Apply for job
        const success = DataManager.applyForJob(currentUser.id, jobId, message || '');
        
        if (success) {
            console.log('Application submitted successfully');
            // Refresh the job cards to show updated state
            StudentHome.loadStudentData();
        } else {
            console.log('Failed to submit application - may already be applied');
        }
    }

    // Manual refresh function
    static refreshJobs() {
        const currentUser = DataManager.getCurrentUser();
        if (currentUser && currentUser.type === 'student') {
            console.log('Refreshing job listings...');
            StudentHome.loadAvailableJobs(currentUser);
        }
    }

    // Global function for editing profile
    static editProfile() {
        console.log('editProfile function called');
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const currentUser = DataManager.getCurrentUser();
            console.log('Current user:', currentUser);
            
            if (!currentUser || currentUser.type !== 'student') {
                console.log('Authentication error');
                return;
            }

            const studentData = DataManager.getStudentById(currentUser.id);
            console.log('Student data:', studentData);
            
            if (!studentData) {
                console.log('Student data not found');
                return;
            }

            const student = new Student(studentData);
            console.log('Student instance:', student);
            
            const popup = document.querySelector('student-popup');
            console.log('Popup element:', popup);
            console.log('All student-popup elements:', document.querySelectorAll('student-popup'));
            
            if (popup) {
                console.log('Calling showProfileEditor');
                popup.showProfileEditor(student);
            } else {
                console.log('Popup element not found!');
            }
        }, 100);
    }

    // Global function for showing work history
    static showWorkHistory() {
        console.log('showWorkHistory function called');
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const currentUser = DataManager.getCurrentUser();
            console.log('Current user:', currentUser);
            
            if (!currentUser || currentUser.type !== 'student') {
                console.log('Authentication error');
                return;
            }

            const studentData = DataManager.getStudentById(currentUser.id);
            console.log('Student data:', studentData);
            
            if (!studentData) {
                console.log('Student data not found');
                return;
            }

            const student = new Student(studentData);
            console.log('Student instance:', student);
            
            const popup = document.querySelector('student-popup');
            console.log('Popup element:', popup);
            console.log('All student-popup elements:', document.querySelectorAll('student-popup'));
            
            if (popup) {
                console.log('Calling showWorkHistoryOnly');
                popup.showWorkHistoryOnly(student);
            } else {
                console.log('Popup element not found!');
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
    static editStudentProfile() {
        const currentUser = DataManager.getCurrentUser();
        const student = DataManager.getStudentById(currentUser.id);
        
        const newName = prompt('Нэр:', student.name);
        const newPhone = prompt('Утасны дугаар:', student.phone);
        const newEmail = prompt('И-мэйл:', student.email);

        if (newName !== null && newPhone !== null && newEmail !== null) {
            student.name = newName.trim();
            student.phone = newPhone.trim();
            student.email = newEmail.trim();
            student.updatedAt = new Date().toISOString();

            DataManager.saveStudent(student);
            DataManager.setCurrentUser({ ...currentUser, ...student });
            
            // Refresh the profile display
            StudentHome.loadStudentData();
            console.log('Profile updated successfully');
        }
    }

    // Global function for withdrawing job application
    static withdrawApplication(jobId) {
        const confirmWithdraw = confirm('Та энэ ажлын хүсэлтээ цуцлахыг хүсэж байна уу?');
        if (!confirmWithdraw) return;

        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Authentication error');
            return;
        }

        const job = DataManager.getJobById(jobId);
        const student = DataManager.getStudentById(currentUser.id);
        
        if (!job || !student) {
            console.log('Job or student data not found for withdrawal');
            return;
        }

        // Remove application from job
        job.applications = job.applications.filter(app => app.studentId !== currentUser.id);
        job.updatedAt = new Date().toISOString();

        // Remove job from student's applications
        student.applications = student.applications.filter(id => id !== jobId);
        student.updatedAt = new Date().toISOString();

        // Save both
        DataManager.saveJob(job);
        DataManager.saveStudent(student);

        console.log('Application withdrawn successfully');
        
        // Refresh the job cards to show updated state
        StudentHome.loadStudentData();
    }
}

// Initialize when the script loads
StudentHome.init();