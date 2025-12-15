/**
 * Job Management JavaScript Functions
 * Ajlin zariin buh javascript funcionuud (ReqForMarket.html)
 */

class JobManagement {
    static init() {
        document.addEventListener('DOMContentLoaded', function() {
            DataManager.initializeData();
            JobManagement.loadJobApplications();
        });

        // Make functions available globally
        window.handleApplication = JobManagement.handleApplication;
        window.removeAcceptedStudent = JobManagement.removeAcceptedStudent;
        window.rateStudent = JobManagement.rateStudent;
        window.showStudentPopup = JobManagement.showStudentPopup;
    }

    static loadJobApplications() {
        const jobId = sessionStorage.getItem('viewingJobId');
        const isFinishedJobView = sessionStorage.getItem('isFinishedJobView') === 'true';
        
        if (!jobId) {
            document.querySelector('.request-container').innerHTML = '<p>Ажлын мэдээлэл олдсонгүй</p>';
            return;
        }

        const jobData = DataManager.getJobById(jobId);
        if (!jobData) {
            document.querySelector('.request-container').innerHTML = '<p>Ажлын мэдээлэл олдсонгүй</p>';
            return;
        }

        // Convert to Job instance to access methods
        const job = new Job(jobData);

        // Load job info
        JobManagement.loadJobInfo(job);
        
        if (isFinishedJobView && job.status === 'finished') {
            // For finished jobs, show rating interface
            JobManagement.loadFinishedJobStudents(job);
            // Hide pending applications section
            document.querySelector('.pending-applications').style.display = 'none';
            // Update title
            document.querySelector('.accepted-users-title h3').textContent = 'Ажилласан оюутнууд - Үнэлгээ өгөх';
        } else {
            // Normal job view
            JobManagement.loadAcceptedStudents(job);
            JobManagement.loadPendingApplications(job);
            document.querySelector('.pending-applications').style.display = 'block';
            document.querySelector('.accepted-users-title h3').textContent = 'Хүлээн авсан хэрэглэгчид';
        }
        
        // Clear the session flag
        sessionStorage.removeItem('isFinishedJobView');
    }

    static loadJobInfo(job) {
        const jobInfoContainer = document.getElementById('job-info');
        
        // Clear existing content to prevent duplicates
        jobInfoContainer.innerHTML = '';
        
        const adCard = document.createElement('ad-card-box');
        adCard.setAttribute('job-id', job.id);
        jobInfoContainer.appendChild(adCard);
    }

    static loadAcceptedStudents(job) {
        const container = document.getElementById('accepted-students');
        
        if (job.acceptedStudents.length === 0) {
            container.innerHTML = '<p class="no-data">Хүлээн авсан оюутан байхгүй</p>';
            return;
        }

        const studentsData = job.acceptedStudents.map(studentId => {
            const studentData = DataManager.getStudentById(studentId);
            if (!studentData) return null;
            
            // Convert to Student instance to access methods
            const student = new Student(studentData);
            
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                img: student.profilePicture,
                rating: student.getAverageRating()
            };
        }).filter(Boolean);

        container.innerHTML = studentsData.map(student => `
            <div class="accepted-student-card">
                <img src="${student.img}" alt="${student.name}" class="student-avatar">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <p>📧 ${student.email}</p>
                    <p>📞 ${student.phone}</p>
                    <p>⭐ ${student.rating}</p>
                </div>
                <div class="student-actions">
                    <button class="remove-btn" onclick="removeAcceptedStudent('${job.id}', '${student.id}')">
                        ❌ Хасах
                    </button>
                </div>
            </div>
        `).join('');
    }

    static loadPendingApplications(job) {
        const container = document.getElementById('pending-applications');
        const pendingApps = job.getPendingApplications();
        
        if (pendingApps.length === 0) {
            container.innerHTML = '<p class="no-data">Хүлээгдэж буй хүсэлт байхгүй</p>';
            return;
        }

        container.innerHTML = pendingApps.map(app => {
            const studentData = DataManager.getStudentById(app.studentId);
            if (!studentData) return '';

            // Convert to Student instance to access methods
            const student = new Student(studentData);

            return `
                <div class="application-card clickable-card" data-student-id="${student.id}" onclick="showStudentPopup('${student.id}', '${job.id}')">
                    <img src="${student.profilePicture}" alt="${student.name}" class="student-avatar">
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p>📧 ${student.email}</p>
                        <p>📞 ${student.phone}</p>
                        <p>⭐ ${student.getAverageRating()}</p>
                        <p class="application-date">Хүсэлт илгээсэн: ${new Date(app.appliedAt).toLocaleDateString('mn-MN')}</p>
                        ${app.message ? `<p class="application-message">"${app.message}"</p>` : ''}
                    </div>
                    <div class="application-actions" onclick="event.stopPropagation()">
                    </div>
                </div>
            `;
        }).join('');
    }

    static handleApplication(jobId, studentId, action) {
        const jobData = DataManager.getJobById(jobId);
        if (!jobData) return;

        // Convert to Job instance to access methods
        const job = new Job(jobData);

        let success = false;
        let message = '';

        if (action === 'accept') {
            success = job.acceptStudent(studentId);
            message = success ? 'Хүсэлт зөвшөөрөгдлөө' : 'Орон тоо дүүрсэн эсвэл алдаа гарлаа';
        } else if (action === 'reject') {
            success = job.rejectStudent(studentId);
            message = success ? 'Хүсэлт татгалзагдлаа' : 'Алдаа гарлаа';
        }

        if (success) {
            DataManager.saveJob(job.toJSON());
            console.log('Application handled:', message);
            JobManagement.loadJobApplications(); // Refresh the display
        } else {
            console.log('Failed to handle application:', message);
        }
    }

    static removeAcceptedStudent(jobId, studentId) {
        const confirmRemove = confirm('Та энэ оюутныг хүлээн авсан жагсаалтаас хасахыг хүсэж байна уу?\n\nОюутан дахин хүсэлт илгээгчдийн жагсаалтад орно.');
        if (!confirmRemove) return;

        const jobData = DataManager.getJobById(jobId);
        if (!jobData) return;

        const job = new Job(jobData);

        const success = job.removeAcceptedStudent(studentId);

        if (success) {
            // Save updated job
            DataManager.saveJob(job.toJSON());
            console.log('Student removed successfully from accepted list');
            
            // Refresh the page to show updated data
            JobManagement.loadJobApplications();
        } else {
            console.log('Failed to remove student');
        }
    }

    static loadFinishedJobStudents(job) {
        const container = document.getElementById('accepted-students');
        
        if (job.acceptedStudents.length === 0) {
            container.innerHTML = '<p class="no-data">Ажилласан оюутан байхгүй</p>';
            return;
        }

        const studentsData = job.acceptedStudents.map(studentId => {
            const studentData = DataManager.getStudentById(studentId);
            if (!studentData) return null;
            
            const student = new Student(studentData);
            
            // Find the work history entry for this job
            const workEntry = student.workHistory.find(work => work.jobId === job.id);
            
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                img: student.profilePicture,
                currentRating: workEntry ? workEntry.rating : 0,
                workEntryId: workEntry ? workEntry.id : null
            };
        }).filter(Boolean);

        container.innerHTML = studentsData.map(student => `
            <div class="finished-student-card">
                <img src="${student.img}" alt="${student.name}" class="student-avatar">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <p>📧 ${student.email}</p>
                    <p>📞 ${student.phone}</p>
                    <div class="rating-section">
                        <label>Үнэлгээ өгөх:</label>
                        <div class="star-rating" data-student-id="${student.id}" data-work-entry-id="${student.workEntryId}">
                            ${[1,2,3,4,5].map(star => `
                                <span class="star ${star <= student.currentRating ? 'active' : ''}" 
                                      data-rating="${star}" 
                                      onclick="rateStudent('${student.id}', '${student.workEntryId}', ${star})">⭐</span>
                            `).join('')}
                        </div>
                        <p class="current-rating">Одоогийн үнэлгээ: ${student.currentRating}/5</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static rateStudent(studentId, workEntryId, rating) {
        const studentData = DataManager.getStudentById(studentId);
        if (!studentData || !workEntryId) return;

        const student = new Student(studentData);
        
        // Find and update the work entry
        const workEntry = student.workHistory.find(work => work.id === workEntryId);
        if (workEntry) {
            const oldRating = workEntry.rating;
            workEntry.rating = rating;
            
            // Update student's overall rating
            if (oldRating === 0) {
                // New rating
                student.rating += rating;
                student.totalRatings += 1;
            } else {
                // Update existing rating
                student.rating = student.rating - oldRating + rating;
            }
            
            student.updatedAt = new Date().toISOString();
            DataManager.saveStudent(student.toJSON());
            
            console.log(`Student ${student.name} rated ${rating}/5`);
            
            // Update the UI
            JobManagement.updateStarDisplay(studentId, rating);
        }
    }

    static updateStarDisplay(studentId, rating) {
        const ratingContainer = document.querySelector(`[data-student-id="${studentId}"]`);
        if (ratingContainer) {
            const stars = ratingContainer.querySelectorAll('.star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
            
            const currentRatingText = ratingContainer.parentElement.querySelector('.current-rating');
            if (currentRatingText) {
                currentRatingText.textContent = `Одоогийн үнэлгээ: ${rating}/5`;
            }
        }
    }

    static showStudentPopup(studentId, jobId) {
        const studentData = DataManager.getStudentById(studentId);
        if (!studentData) {
            console.log('Student not found');
            return;
        }

        const student = new Student(studentData);
        const popup = document.querySelector('student-popup');
        
        if (popup) {
            popup.showStudentDetails(student, jobId);
        }
    }
}

// Initialize when the script loads
JobManagement.init();