class JobCard extends HTMLElement {
    connectedCallback() {
        // Add a small delay to ensure all attributes are set
        setTimeout(() => {
            this.renderCard();
        }, 10);
    }

    renderCard() {
        const jobId = this.getAttribute("job-id");
        const isDataDriven = jobId && typeof DataManager !== 'undefined';
        
        console.log('Job card rendering:', { jobId, isDataDriven, hasDataManager: typeof DataManager !== 'undefined' });
        
        let buttonHtml = '<button class="apply-btn">Хүсэлт илгээх</button>';
        
        if (isDataDriven) {
            const currentUser = DataManager.getCurrentUser();
            if (currentUser && currentUser.type === 'student') {
                const job = DataManager.getJobById(jobId);
                if (job) {
                    const application = job.applications.find(app => app.studentId === currentUser.id);
                    const isAccepted = job.acceptedStudents.includes(currentUser.id);
                    const isFull = job.acceptedStudents.length >= job.maxPositions;
                    
                    console.log('Job status check for job:', jobId);
                    console.log('- Current user ID:', currentUser.id);
                    console.log('- Has application:', !!application);
                    console.log('- Application status:', application?.status);
                    console.log('- Is accepted:', isAccepted);
                    console.log('- Is full:', isFull);
                    console.log('- Job applications:', job.applications);
                    console.log('- Job accepted students:', job.acceptedStudents);
                    
                    if (isAccepted) {
                        // Student is accepted for this job
                        buttonHtml = '<button class="accepted-btn" disabled>🎉 Зөвшөөрөгдсөн</button>';
                    } else if (application) {
                        // Student has applied but not accepted yet
                        if (application.status === 'rejected') {
                            buttonHtml = '<button class="rejected-btn" disabled>❌ Татгалзсан</button>';
                        } else {
                            // Pending application - show withdraw button
                            buttonHtml = `
                                <button class="pending-btn" disabled>⏳ Хүлээгдэж байна</button>
                                <button class="withdraw-btn" onclick="withdrawApplication('${jobId}')">🚫 Цуцлах</button>
                            `;
                        }
                    } else if (isFull) {
                        buttonHtml = '<button class="full-btn" disabled>Орон тоо дүүрсэн</button>';
                    } else {
                        buttonHtml = `<button class="apply-btn" onclick="applyForJob('${jobId}')">Хүсэлт илгээх</button>`;
                    }
                }
            }
        }

        this.innerHTML = `
            <div class="job">
                <div class="job-badge">${this.getAttribute("rating")}⭐</div>

                <p class="job-title">
                    ${this.getAttribute("title")}
                </p>

                <div class="job-details">
                    <strong>🏢 Компани:</strong> ${this.getAttribute("company") || 'Тодорхойгүй'}<br>
                    <strong>📍 Байршил:</strong> ${this.getAttribute("location")}<br>
                    <strong>⏰ Цаг:</strong> ${this.getAttribute("time")}<br>
                    <strong>💰 Цалин:</strong> ${this.getAttribute("salary")}
                </div>

                ${buttonHtml}
            </div>
        `;
    }
}

customElements.define("job-card", JobCard);