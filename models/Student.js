class Student {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.username = data.username || '';
        this.password = data.password || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.name = data.name || '';
        this.profilePicture = data.profilePicture || 'pics/profile.jpg';
        this.schedule = data.schedule || {}; // Weekly availability schedule
        this.workHistory = data.workHistory || [];
        this.applications = data.applications || []; // Applied job IDs
        this.rating = data.rating || 0;
        this.totalRatings = data.totalRatings || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate average rating
    getAverageRating() {
        return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
    }

    // Add work history entry
    addWorkHistory(jobData) {
        const workEntry = {
            id: this.generateId(),
            jobId: jobData.jobId,
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            startDate: jobData.startDate,
            endDate: jobData.endDate,
            rating: jobData.rating || 0,
            review: jobData.review || '',
            salary: jobData.salary || 0,
            addedAt: new Date().toISOString()
        };
        this.workHistory.push(workEntry);
        this.updatedAt = new Date().toISOString();
    }

    // Apply for a job
    applyForJob(jobId) {
        if (!this.applications.includes(jobId)) {
            this.applications.push(jobId);
            this.updatedAt = new Date().toISOString();
        }
    }

    // Check if schedule conflicts with job schedule
    hasScheduleConflict(jobSchedule) {
        for (const day in jobSchedule) {
            if (this.schedule[day]) {
                for (const timeSlot in jobSchedule[day]) {
                    if (this.schedule[day][timeSlot]) {
                        return true; // Conflict found
                    }
                }
            }
        }
        return false;
    }

    // Update schedule
    updateSchedule(newSchedule) {
        this.schedule = newSchedule;
        this.updatedAt = new Date().toISOString();
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            password: this.password,
            email: this.email,
            phone: this.phone,
            name: this.name,
            profilePicture: this.profilePicture,
            schedule: this.schedule,
            workHistory: this.workHistory,
            applications: this.applications,
            rating: this.rating,
            totalRatings: this.totalRatings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Student;
} else {
    window.Student = Student;
}