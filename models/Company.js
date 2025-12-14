class Company {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.username = data.username || '';
        this.password = data.password || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.companyName = data.companyName || '';
        this.description = data.description || '';
        this.address = data.address || '';
        this.website = data.website || '';
        this.logo = data.logo || '';
        this.postedJobs = data.postedJobs || []; // Array of job IDs
        this.rating = data.rating || 0;
        this.totalRatings = data.totalRatings || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'company_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate average rating
    getAverageRating() {
        return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
    }

    // Add a new job posting
    addJob(jobId) {
        if (!this.postedJobs.includes(jobId)) {
            this.postedJobs.push(jobId);
            this.updatedAt = new Date().toISOString();
        }
    }

    // Remove a job posting
    removeJob(jobId) {
        const index = this.postedJobs.indexOf(jobId);
        if (index > -1) {
            this.postedJobs.splice(index, 1);
            this.updatedAt = new Date().toISOString();
        }
    }

    // Update company information
    updateInfo(newData) {
        Object.keys(newData).forEach(key => {
            if (key !== 'id' && key !== 'createdAt' && this.hasOwnProperty(key)) {
                this[key] = newData[key];
            }
        });
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
            companyName: this.companyName,
            description: this.description,
            address: this.address,
            website: this.website,
            logo: this.logo,
            postedJobs: this.postedJobs,
            rating: this.rating,
            totalRatings: this.totalRatings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Company;
} else {
    window.Company = Company;
}