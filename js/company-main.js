/**
 * Company Main Page JavaScript Functions
 * Contains all the JavaScript functionality for the company main page
 */

class CompanyMain {
    static init() {
        // Initialize data and load company content
        document.addEventListener('DOMContentLoaded', async function() {
            console.log('Company page loaded, checking auth...');
            
            // Check authentication with API
            const isAuthenticated = await ApiClient.ensureAuthenticated();
            if (!isAuthenticated) {
                return; // Will redirect if not authenticated
            }
            
            const currentUser = ApiClient.getCurrentUser();
            if (!currentUser || currentUser.type !== 'company') {
                window.location.href = '/login';
                return;
            }
            
            console.log('Auth passed, loading company data...');
            CompanyMain.loadCompanyJobs();
        });

        // Listen for company profile updates
        window.addEventListener('companyProfileUpdated', function() {
            console.log('Company profile updated, refreshing sidebar...');
            // Refresh the sidebar by triggering its data reload
            const sidebar = document.querySelector('side-bar');
            if (sidebar) {
                sidebar.loadCompanyData();
            }
        });
    }

    static async loadCompanyJobs() {
        const currentUser = ApiClient.getCurrentUser();
        const jobContainer = document.getElementById('company-jobs');
        
        if (!currentUser || currentUser.type !== 'company') {
            jobContainer.innerHTML = '<p class="no-jobs">Компанийн хэрэглэгч нэвтрэх шаардлагатай</p>';
            return;
        }

        try {
            console.log('Current user:', currentUser);
            const response = await ApiClient.getCompanyJobs();
            
            if (!response.success) {
                console.error('Failed to get company jobs:', response.message);
                jobContainer.innerHTML = '<p class="no-jobs">Ажил ачаалахад алдаа гарлаа</p>';
                return;
            }

            const companyJobs = response.jobs;
            console.log('Company jobs:', companyJobs);
            
            if (companyJobs.length === 0) {
                jobContainer.innerHTML = '<p class="no-jobs">Та одоогоор ажлын зар нэмээгүй байна. <a href="/company/add-job">Зар нэмэх</a></p>';
                return;
            }

            jobContainer.innerHTML = '';
            companyJobs.forEach((job, index) => {
                console.log(`Creating ad card ${index} for job:`, job);
                const adCard = document.createElement('ad-card-box');
                adCard.setAttribute('job-id', job.id);
                jobContainer.appendChild(adCard);
            });
        } catch (error) {
            console.error('Error loading company jobs:', error);
            jobContainer.innerHTML = '<p class="no-jobs">Ажил ачаалахад алдаа гарлаа</p>';
        }
    }
}

// Initialize when the script loads
CompanyMain.init();