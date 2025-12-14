class Job {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.companyId = data.companyId || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.location = data.location || '';
        this.salary = data.salary || 0;
        this.salaryType = data.salaryType || 'hourly'; // 'hourly', 'daily', 'monthly'
        this.schedule = data.schedule || {}; // Weekly schedule requirement
        this.requirements = data.requirements || [];
        this.benefits = data.benefits || [];
        this.category = data.category || '';
        this.status = data.status || 'active'; // 'active', 'paused', 'closed'
        this.applications = data.applications || []; // Array of application objects
        this.acceptedStudents = data.acceptedStudents || []; // Array of accepted student IDs
        this.maxPositions = data.maxPositions || 1;
        this.rating = data.rating || 0;
        this.totalRatings = data.totalRatings || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.deadline = data.deadline || null;
    }

    generateId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate average rating
    getAverageRating() {
        return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
    }

    // Add student application
    addApplication(studentId, applicationData = {}) {
        const existingApp = this.applications.find(app => app.studentId === studentId);
        if (!existingApp) {
            const application = {
                studentId: studentId,
                appliedAt: new Date().toISOString(),
                status: 'pending', // 'pending', 'accepted', 'rejected'
                message: applicationData.message || '',
                ...applicationData
            };
            this.applications.push(application);
            this.updatedAt = new Date().toISOString();
        }
    }

    // Accept student application
    acceptStudent(studentId) {
        const application = this.applications.find(app => app.studentId === studentId);
        if (application && this.acceptedStudents.length < this.maxPositions) {
            application.status = 'accepted';
            if (!this.acceptedStudents.includes(studentId)) {
                this.acceptedStudents.push(studentId);
            }
            this.updatedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    // Reject student application
    rejectStudent(studentId) {
        const application = this.applications.find(app => app.studentId === studentId);
        if (application) {
            application.status = 'rejected';
            this.updatedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    // Check if job is full
    isFull() {
        return this.acceptedStudents.length >= this.maxPositions;
    }

    // Check if student has applied
    hasStudentApplied(studentId) {
        return this.applications.some(app => app.studentId === studentId);
    }

    // Get pending applications
    getPendingApplications() {
        return this.applications.filter(app => app.status === 'pending');
    }

    // Format salary display
    getSalaryDisplay() {
        const formatter = new Intl.NumberFormat('mn-MN');
        switch (this.salaryType) {
            case 'hourly':
                return `${formatter.format(this.salary)}₮ / цаг`;
            case 'daily':
                return `${formatter.format(this.salary)}₮ / өдөр`;
            case 'monthly':
                return `${formatter.format(this.salary)}₮ / сар`;
            default:
                return `${formatter.format(this.salary)}₮`;
        }
    }

    // Format schedule display
    getScheduleDisplay() {
        const scheduleEntries = [];
        for (const day in this.schedule) {
            const times = Object.keys(this.schedule[day]);
            if (times.length > 0) {
                const startTime = Math.min(...times.map(t => parseInt(t.split('-')[0])));
                const endTime = Math.max(...times.map(t => parseInt(t.split('-')[1])));
                scheduleEntries.push(`${day}: ${startTime}:00–${endTime}:00`);
            }
        }
        return scheduleEntries.join(', ');
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            companyId: this.companyId,
            title: this.title,
            description: this.description,
            location: this.location,
            salary: this.salary,
            salaryType: this.salaryType,
            schedule: this.schedule,
            requirements: this.requirements,
            benefits: this.benefits,
            category: this.category,
            status: this.status,
            applications: this.applications,
            acceptedStudents: this.acceptedStudents,
            maxPositions: this.maxPositions,
            rating: this.rating,
            totalRatings: this.totalRatings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deadline: this.deadline
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Job;
} else {
    window.Job = Job;
}