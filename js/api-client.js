/**
 * API Client - Node.js backend-тэй харилцах клиент
 * localStorage-д суурилсан DataManager-ийг HTTP API дуудлагаар солих
 */

class ApiClient {
    static baseUrl = '';

    // ===== НЭВТРЭХ СИСТЕМ =====
    
    /**
     * Хэрэглэгчийг нэвтрүүлэх функц
     * @param {string} username - Хэрэглэгчийн нэр
     * @param {string} password - Нууц үг
     * @param {string} userType - Хэрэглэгчийн төрөл (student/company)
     * @returns {Object} Нэвтрэх үр дүн
     */
    static async login(username, password, userType) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, userType })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    type: userType,
                    name: userType === 'student' ? data.user.name : data.user.company_name
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Хэрэглэгчийг гаргах функц
     * @returns {Object} Гарах үр дүн
     */
    static async logout() {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            }
            
            return data;
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Нэвтрэх статусыг шалгах функц
     * @returns {Object} Нэвтрэх статусын мэдээлэл
     */
    static async checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                // localStorage-г серверийн мэдээллээр шинэчлэх
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                localStorage.removeItem('currentUser');
            }
            
            return data;
        } catch (error) {
            console.error('Auth status check error:', error);
            return { success: false, authenticated: false };
        }
    }

    /**
     * Оюутан бүртгүүлэх функц
     * @param {Object} userData - Оюутны мэдээлэл
     * @returns {Object} Бүртгэлийн үр дүн
     */
    static async registerStudent(userData) {
        try {
            const response = await fetch('/auth/register/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            console.error('Student registration error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Компани бүртгүүлэх функц
     * @param {Object} userData - Компанийн мэдээлэл
     * @returns {Object} Бүртгэлийн үр дүн
     */
    static async registerCompany(userData) {
        try {
            const response = await fetch('/auth/register/company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Company registration failed:', response.status, data);
            }
            
            return data;
        } catch (error) {
            console.error('Company registration error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== ОЮУТНЫ API =====
    
    /**
     * Оюутны профайл авах функц
     * @returns {Object} Оюутны профайлын мэдээлэл
     */
    static async getStudentProfile() {
        try {
            const response = await fetch('/api/students/profile');
            return await response.json();
        } catch (error) {
            console.error('Get student profile error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Оюутны профайл шинэчлэх функц
     * @param {Object} profileData - Шинэчлэх профайлын мэдээлэл
     * @returns {Object} Шинэчлэлийн үр дүн
     */
    static async updateStudentProfile(profileData) {
        try {
            const response = await fetch('/api/students/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update student profile error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Оюутны ажлын туршлага авах функц
     * @returns {Object} Ажлын туршлагын жагсаалт
     */
    static async getStudentWorkHistory() {
        try {
            const response = await fetch('/api/students/work-history');
            return await response.json();
        } catch (error) {
            console.error('Get work history error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Оюутны ажлын хүсэлтүүд авах функц
     * @returns {Object} Хүсэлтүүдийн жагсаалт
     */
    static async getStudentApplications() {
        try {
            const response = await fetch('/api/students/applications');
            return await response.json();
        } catch (error) {
            console.error('Get student applications error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Оюутны цагийн хуваарь шинэчлэх функц
     * @param {Object} schedule - Цагийн хуваарь
     * @returns {Object} Шинэчлэлийн үр дүн
     */
    static async updateStudentSchedule(schedule) {
        try {
            const response = await fetch('/api/students/schedule', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ schedule })
            });

            return await response.json();
        } catch (error) {
            console.error('Update student schedule error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== КОМПАНИЙН API =====
    
    /**
     * Компанийн профайл авах функц
     * @returns {Object} Компанийн профайлын мэдээлэл
     */
    static async getCompanyProfile() {
        try {
            const response = await fetch('/api/companies/profile');
            return await response.json();
        } catch (error) {
            console.error('Get company profile error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Компанийн профайл шинэчлэх функц
     * @param {Object} profileData - Шинэчлэх профайлын мэдээлэл
     * @returns {Object} Шинэчлэлийн үр дүн
     */
    static async updateCompanyProfile(profileData) {
        try {
            const response = await fetch('/api/companies/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update company profile error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Компанийн ажлын байрнууд авах функц
     * @returns {Object} Ажлын байрнуудын жагсаалт
     */
    static async getCompanyJobs() {
        try {
            const response = await fetch('/api/companies/jobs');
            return await response.json();
        } catch (error) {
            console.error('Get company jobs error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Компанийн хүсэлтүүд авах функц
     * @returns {Object} Хүсэлтүүдийн жагсаалт
     */
    static async getCompanyApplications() {
        try {
            const response = await fetch('/api/companies/applications');
            return await response.json();
        } catch (error) {
            console.error('Get company applications error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Тодорхой ажлын хүсэлтүүд авах функц
     * @param {string} jobId - Ажлын ID
     * @returns {Object} Хүсэлтүүдийн жагсаалт
     */
    static async getJobApplications(jobId) {
        try {
            const response = await fetch(`/api/companies/jobs/${jobId}/applications`);
            return await response.json();
        } catch (error) {
            console.error('Get job applications error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Хүсэлтийн статус шинэчлэх функц
     * @param {string} applicationId - Хүсэлтийн ID
     * @param {string} status - Шинэ статус
     * @returns {Object} Шинэчлэлийн үр дүн
     */
    static async updateApplicationStatus(applicationId, status) {
        try {
            const response = await fetch(`/api/companies/applications/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            return await response.json();
        } catch (error) {
            console.error('Update application status error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== АЖЛЫН API =====
    
    /**
     * Бүх ажлын байр авах функц
     * @returns {Object} Ажлын байрнуудын жагсаалт
     */
    static async getAllJobs() {
        try {
            const response = await fetch('/api/jobs');
            return await response.json();
        } catch (error) {
            console.error('Get all jobs error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Боломжтой ажлын байрнууд авах функц (цагийн хуваарьтай тохирох)
     * @returns {Object} Боломжтой ажлын байрнуудын жагсаалт
     */
    static async getAvailableJobs() {
        try {
            const response = await fetch('/api/jobs/available');
            return await response.json();
        } catch (error) {
            console.error('Get available jobs error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * ID-аар ажлын байр авах функц
     * @param {string} jobId - Ажлын ID
     * @returns {Object} Ажлын байрны мэдээлэл
     */
    static async getJobById(jobId) {
        try {
            const response = await fetch(`/api/jobs/${jobId}`);
            return await response.json();
        } catch (error) {
            console.error('Get job by ID error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Шинэ ажлын байр үүсгэх функц
     * @param {Object} jobData - Ажлын байрны мэдээлэл
     * @returns {Object} Үүсгэлийн үр дүн
     */
    static async createJob(jobData) {
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create job error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Ажлын байр шинэчлэх функц
     * @param {string} jobId - Ажлын ID
     * @param {Object} jobData - Шинэчлэх мэдээлэл
     * @returns {Object} Шинэчлэлийн үр дүн
     */
    static async updateJob(jobId, jobData) {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update job error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Ажлын байр устгах функц
     * @param {string} jobId - Ажлын ID
     * @returns {Object} Устгалын үр дүн
     */
    static async deleteJob(jobId) {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE'
            });

            return await response.json();
        } catch (error) {
            console.error('Delete job error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Ажилд хүсэлт илгээх функц
     * @param {string} jobId - Ажлын ID
     * @param {string} message - Хүсэлтийн мессеж
     * @returns {Object} Хүсэлт илгээх үр дүн
     */
    static async applyForJob(jobId, message = '') {
        try {
            const response = await fetch(`/api/jobs/${jobId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            return await response.json();
        } catch (error) {
            console.error('Apply for job error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Ажлын хүсэлт цуцлах функц
     * @param {string} jobId - Ажлын ID
     * @returns {Object} Цуцлалтын үр дүн
     */
    static async withdrawJobApplication(jobId) {
        try {
            const response = await fetch(`/api/jobs/${jobId}/apply`, {
                method: 'DELETE'
            });

            return await response.json();
        } catch (error) {
            console.error('Withdraw job application error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== ХАЙЛТ БА ЕРӨНХИЙ API =====
    
    /**
     * Ажлын байр хайх функц
     * @param {Object} searchParams - Хайлтын параметрүүд
     * @returns {Object} Хайлтын үр дүн
     */
    static async searchJobs(searchParams) {
        try {
            const queryString = new URLSearchParams(searchParams).toString();
            const response = await fetch(`/api/search/jobs?${queryString}`);
            return await response.json();
        } catch (error) {
            console.error('Search jobs error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Хяналтын самбарын статистик авах функц
     * @returns {Object} Статистикийн мэдээлэл
     */
    static async getDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            return await response.json();
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Сүүлийн үйл ажиллагаа авах функц
     * @param {number} limit - Хязгаар
     * @returns {Object} Үйл ажиллагааны жагсаалт
     */
    static async getRecentActivities(limit = 10) {
        try {
            const response = await fetch(`/api/activities/recent?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get recent activities error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== АЖЛЫН ТУРШЛАГА =====
    
    /**
     * Ажлын туршлага нэмэх функц
     * @param {Object} workData - Ажлын туршлагын мэдээлэл
     * @returns {Object} Нэмэлтийн үр дүн
     */
    static async addWorkExperience(workData) {
        try {
            const response = await fetch('/api/work-experience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workData)
            });

            return await response.json();
        } catch (error) {
            console.error('Add work experience error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    /**
     * Оюутанд үнэлгээ өгөх функц
     * @param {string} studentId - Оюутны ID
     * @param {string} applicationId - Хүсэлтийн ID
     * @param {number} rating - Үнэлгээ (1-5)
     * @param {string} review - Тайлбар
     * @returns {Object} Үнэлгээний үр дүн
     */
    static async rateStudent(studentId, applicationId, rating, review = '') {
        try {
            const response = await fetch('/api/students/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    student_id: studentId, 
                    application_id: applicationId, 
                    rating, 
                    review 
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Rate student error:', error);
            return { success: false, message: 'Серверийн алдаа' };
        }
    }

    // ===== КЛИЕНТИЙН ТУСЛАХ ФУНКЦҮҮД =====
    
    /**
     * Одоогийн хэрэглэгч авах функц
     * @returns {Object|null} Хэрэглэгчийн мэдээлэл эсвэл null
     */
    static getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Нэвтэрсэн эсэхийг шалгах функц
     * @returns {boolean} Нэвтэрсэн эсэх
     */
    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Нэвтрэх шаардлагатай эсэхийг шалгах функц
     * @returns {boolean} Нэвтэрсэн эсэх
     */
    static async ensureAuthenticated() {
        const localUser = this.getCurrentUser();
        if (!localUser) {
            window.location.href = '/login';
            return false;
        }

        // Серверээс баталгаажуулах
        const authStatus = await this.checkAuthStatus();
        if (!authStatus.authenticated) {
            window.location.href = '/login';
            return false;
        }

        return true;
    }
}

// ApiClient-г глобал хүрээнд ашиглах боломжтой болгох
window.ApiClient = ApiClient;