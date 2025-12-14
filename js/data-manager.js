class DataManager {
    // ===== USER MANAGEMENT =====
    static setCurrentUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    static getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'Login.html';
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // ===== STUDENT MANAGEMENT =====
    static getStudents() {
        const students = localStorage.getItem('students');
        return students ? JSON.parse(students) : [];
    }

    static getStudentById(id) {
        const students = this.getStudents();
        return students.find(student => student.id === id);
    }

    static getStudentByUsername(username) {
        const students = this.getStudents();
        return students.find(student => student.username === username);
    }

    static saveStudent(studentData) {
        const students = this.getStudents();
        const existingIndex = students.findIndex(s => s.id === studentData.id);
        
        if (existingIndex >= 0) {
            students[existingIndex] = studentData;
        } else {
            students.push(studentData);
        }
        
        localStorage.setItem('students', JSON.stringify(students));
    }

    static saveStudents(students) {
        localStorage.setItem('students', JSON.stringify(students));
    }

    // ===== COMPANY MANAGEMENT =====
    static getCompanies() {
        const companies = localStorage.getItem('companies');
        return companies ? JSON.parse(companies) : [];
    }

    static getCompanyById(id) {
        const companies = this.getCompanies();
        return companies.find(company => company.id === id);
    }

    static getCompanyByUsername(username) {
        const companies = this.getCompanies();
        return companies.find(company => company.username === username);
    }

    static saveCompany(companyData) {
        const companies = this.getCompanies();
        const existingIndex = companies.findIndex(c => c.id === companyData.id);
        
        if (existingIndex >= 0) {
            companies[existingIndex] = companyData;
        } else {
            companies.push(companyData);
        }
        
        localStorage.setItem('companies', JSON.stringify(companies));
    }

    static saveCompanies(companies) {
        localStorage.setItem('companies', JSON.stringify(companies));
    }

    // ===== JOB MANAGEMENT =====
    static getJobs() {
        const jobs = localStorage.getItem('jobs');
        return jobs ? JSON.parse(jobs) : [];
    }

    static getJobById(id) {
        const jobs = this.getJobs();
        return jobs.find(job => job.id === id);
    }

    static getJobsByCompanyId(companyId) {
        const jobs = this.getJobs();
        return jobs.filter(job => job.companyId === companyId);
    }

    static getActiveJobs() {
        const jobs = this.getJobs();
        return jobs.filter(job => job.status === 'active');
    }

    static saveJob(jobData) {
        const jobs = this.getJobs();
        const existingIndex = jobs.findIndex(j => j.id === jobData.id);
        
        if (existingIndex >= 0) {
            jobs[existingIndex] = jobData;
        } else {
            jobs.push(jobData);
        }
        
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }

    static saveJobs(jobs) {
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }

    // ===== SCHEDULE CONFLICT CHECKING =====
    static getAvailableJobsForStudent(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return [];

        const activeJobs = this.getActiveJobs();
        return activeJobs.filter(job => {
            // Check if student has schedule conflict
            return !this.hasScheduleConflict(student.schedule, job.schedule);
        });
    }

    static hasScheduleConflict(studentSchedule, jobSchedule) {
        for (const day in jobSchedule) {
            if (studentSchedule[day]) {
                for (const timeSlot in jobSchedule[day]) {
                    if (studentSchedule[day][timeSlot]) {
                        return true; // Conflict found
                    }
                }
            }
        }
        return false;
    }

    // ===== APPLICATION MANAGEMENT =====
    static applyForJob(studentId, jobId, message = '') {
        const job = this.getJobById(jobId);
        const student = this.getStudentById(studentId);
        
        if (!job || !student) return false;
        
        // Check if already applied
        if (job.applications.some(app => app.studentId === studentId)) {
            return false;
        }

        // Add application to job
        job.applications.push({
            studentId: studentId,
            appliedAt: new Date().toISOString(),
            status: 'pending',
            message: message
        });

        // Add job to student's applications
        if (!student.applications.includes(jobId)) {
            student.applications.push(jobId);
        }

        // Save both
        this.saveJob(job);
        this.saveStudent(student);
        
        return true;
    }

    // ===== AUTHENTICATION =====
    static authenticateUser(username, password) {
        // Check students
        const student = this.getStudentByUsername(username);
        if (student && student.password === password) {
            return { type: 'student', user: student };
        }

        // Check companies
        const company = this.getCompanyByUsername(username);
        if (company && company.password === password) {
            return { type: 'company', user: company };
        }

        return null;
    }

    // ===== DATA INITIALIZATION =====
    static initializeData() {
        // Initialize sample data if no data exists
        if (typeof SampleData !== 'undefined') {
            SampleData.initializeSampleData();
        }
    }
}

window.DataManager = DataManager;