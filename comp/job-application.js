class JobApplication extends HTMLElement {
    connectedCallback() {
        const jobId = this.getAttribute('job-id');
        const jobTitle = this.getAttribute('job-title');
        
        this.innerHTML = `
        <div class="job-application-modal" id="application-modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${jobTitle} - Ажилд орох хүсэлт</h2>
                <form id="application-form">
                    <div class="form">
                        <label for="cover-letter">Танилцуулга:</label>
                        <textarea id="cover-letter" name="coverLetter" rows="4" 
                                placeholder="Өөрийгөө танилцуулж, яагаад энэ ажилд орохыг хүсч байгаагаа бичнэ үү..." required></textarea>
                    </div>
                    <div class="form">
                        <label for="experience">Туршлага:</label>
                        <textarea id="experience" name="experience" rows="3" 
                                placeholder="Өмнөх ажлын туршлагаа бичнэ үү..."></textarea>
                    </div>
                    <div class="form">
                        <label for="availability">Боломжтой цаг:</label>
                        <input type="text" id="availability" name="availability" 
                               placeholder="Жишээ: Даваа-Баасан 9:00-17:00" required>
                    </div>
                    <button type="submit" class="login-btn">Хүсэлт илгээх</button>
                    <button type="button" class="cancel-btn">Цуцлах</button>
                </form>
            </div>
        </div>
        `;

        this.querySelector('.close').onclick = () => this.close();
        this.querySelector('.cancel-btn').onclick = () => this.close();
        this.querySelector('#application-form').onsubmit = (e) => {
            e.preventDefault();
            this.submitApplication(jobId);
        };
    }

    submitApplication(jobId) {
        const formData = new FormData(this.querySelector('#application-form'));
        const applicationData = Object.fromEntries(formData);
        
        // Store application 
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push({
            id: Date.now(),
            jobId: jobId,
            userId: DataManager.getCurrentUser().username,
            ...applicationData,
            status: 'pending',
            appliedAt: new Date().toISOString()
        });
        localStorage.setItem('applications', JSON.stringify(applications));
        
        console.log('Application submitted successfully');
        this.close();
    }

    close() {
        this.remove();
    }
}

customElements.define('job-application', JobApplication);