/**
 * Ажлын карт компонент
 * Ажлын байрны мэдээллийг харуулах веб компонент
 */
class JobCard extends HTMLElement {
    /**
     * DOM-д холбогдох үед дуудагдах функц
     */
    connectedCallback() {
        // Бүх атрибутууд тохируулагдсаныг баталгаажуулахын тулд бага зэрэг хүлээх
        setTimeout(() => {
            this.renderCard();
        }, 10);
    }

    /**
     * Ажлын картыг рендер хийх функц
     */
    async renderCard() {
        const jobId = this.getAttribute("job-id");
        const isDataDriven = jobId && typeof ApiClient !== 'undefined';
        
        console.log('Job card rendering:', { jobId, isDataDriven, hasApiClient: typeof ApiClient !== 'undefined' });
        
        let buttonHtml = '<button class="apply-btn">Хүсэлт илгээх</button>';
        
        if (isDataDriven) {
            const currentUser = ApiClient.getCurrentUser();
            if (currentUser && currentUser.type === 'student') {
                try {
                    // API-аас ажлын дэлгэрэнгүй болон хүсэлтийн статус авах
                    const jobResponse = await ApiClient.getJobById(jobId);
                    const applicationsResponse = await ApiClient.getStudentApplications();
                    
                    if (jobResponse.success && applicationsResponse.success) {
                        const job = jobResponse.job;
                        const applications = applicationsResponse.applications;
                        
                        // Энэ ажлын хүсэлт олох
                        const application = applications.find(app => app.job_id === jobId);
                        const isAccepted = application && application.status === 'accepted';
                        const isFull = job.accepted_count >= job.max_students;
                        
                        console.log('Job status check for job:', jobId);
                        console.log('- Current user ID:', currentUser.id);
                        console.log('- Has application:', !!application);
                        console.log('- Application status:', application?.status);
                        console.log('- Is accepted:', isAccepted);
                        console.log('- Is full:', isFull);
                        console.log('- Job max students:', job.max_students);
                        console.log('- Job accepted count:', job.accepted_count);
                        
                        if (isAccepted) {
                            // Оюутан энэ ажилд зөвшөөрөгдсөн
                            buttonHtml = '<button class="accepted-btn" disabled>Зөвшөөрөгдсөн</button>';
                        } else if (application) {
                            // Оюутан хүсэлт илгээсэн боловч хараахан зөвшөөрөгдөөгүй
                            if (application.status === 'rejected') {
                                buttonHtml = '<button class="rejected-btn" disabled>Татгалзсан</button>';
                            } else {
                                // Хүлээгдэж буй хүсэлт - цуцлах товч харуулах
                                buttonHtml = `
                                    <button class="pending-btn" disabled>Хүлээгдэж байна</button>
                                    <button class="withdraw-btn" onclick="withdrawApplication('${jobId}')">Цуцлах</button>
                                `;
                            }
                        } else if (isFull) {
                            buttonHtml = '<button class="full-btn" disabled>Орон тоо дүүрсэн</button>';
                        } else {
                            buttonHtml = `<button class="apply-btn" onclick="applyForJob('${jobId}')">Хүсэлт илгээх</button>`;
                        }
                    }
                } catch (error) {
                    console.error('Error loading job application status:', error);
                    // Алдаа гарвал үндсэн хүсэлт илгээх товч харуулах
                    buttonHtml = `<button class="apply-btn" onclick="applyForJob('${jobId}')">Хүсэлт илгээх</button>`;
                }
            }
        }

        this.innerHTML = `
            <div class="job">
                <p class="job-title">
                    ${this.getAttribute("title")}
                </p>

                <div class="job-details">
                    <strong>Компани:</strong> ${this.getAttribute("company") || 'Тодорхойгүй'}<br>
                    <strong>Байршил:</strong> ${this.getAttribute("location")}<br>
                    <strong>Цаг:</strong> ${this.getAttribute("time")}<br>
                    <strong>Цалин:</strong> ${this.getAttribute("salary")}
                </div>

                ${buttonHtml}
            </div>
        `;
    }
}

customElements.define("job-card", JobCard);