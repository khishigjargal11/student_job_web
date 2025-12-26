/**
 * Ажлын удирдлагын JavaScript функцүүд
 * Ажлын зарын бүх JavaScript функцүүд (ReqForMarket.html)
 */

class JobManagement {
    /**
     * Системийг эхлүүлэх функц - DOM ачаалагдсаны дараа ажиллана
     */
    static init() {
        document.addEventListener('DOMContentLoaded', async function() {
            // API-аар нэвтрэх эрхийг шалгах
            const isAuthenticated = await ApiClient.ensureAuthenticated();
            if (!isAuthenticated) {
                return; // Нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлнэ
            }
            
            const currentUser = ApiClient.getCurrentUser();
            if (!currentUser || currentUser.type !== 'company') {
                window.location.href = '/login';
                return;
            }
            
            JobManagement.loadJobApplications();
        });

        // Функцүүдийг глобал хүрээнд ашиглах боломжтой болгох
        window.handleApplication = JobManagement.handleApplication;
        window.removeAcceptedStudent = JobManagement.removeAcceptedStudent;
        window.rateStudent = JobManagement.rateStudent;
        window.showStudentPopup = JobManagement.showStudentPopup;
    }

    static async loadJobApplications() {
        const jobId = sessionStorage.getItem('viewingJobId');
        const isFinishedJobView = sessionStorage.getItem('isFinishedJobView') === 'true';
        
        if (!jobId) {
            document.querySelector('.request-container').innerHTML = '<p>Ажлын мэдээлэл олдсонгүй</p>';
            return;
        }

        try {
            // Get job data from API
            const response = await ApiClient.getJobById(jobId);
            if (!response.success) {
                document.querySelector('.request-container').innerHTML = '<p>Ажлын мэдээлэл олдсонгүй</p>';
                return;
            }

            const job = response.job;

            // Load job info
            JobManagement.loadJobInfo(job);
            
            if (isFinishedJobView && job.status === 'finished') {
                // For finished jobs, show rating interface
                await JobManagement.loadFinishedJobStudents(job);
                // Hide pending applications section
                document.querySelector('.pending-applications').style.display = 'none';
                // Update title
                document.querySelector('.accepted-users-title h3').textContent = 'Ажилласан оюутнууд - Үнэлгээ өгөх';
            } else {
                // Normal job view
                await JobManagement.loadAcceptedStudents(job);
                await JobManagement.loadPendingApplications(job);
                document.querySelector('.pending-applications').style.display = 'block';
                document.querySelector('.accepted-users-title h3').textContent = 'Хүлээн авсан хэрэглэгчид';
            }
            
            // Clear the session flag
            sessionStorage.removeItem('isFinishedJobView');
        } catch (error) {
            console.error('Error loading job applications:', error);
            document.querySelector('.request-container').innerHTML = '<p>Ажлын мэдээлэл ачаалахад алдаа гарлаа</p>';
        }
    }

    static loadJobInfo(job) {
        const jobInfoContainer = document.getElementById('job-info');
        
        // Clear existing content to prevent duplicates
        jobInfoContainer.innerHTML = '';
        
        const adCard = document.createElement('ad-card-box');
        adCard.setAttribute('job-id', job.id);
        jobInfoContainer.appendChild(adCard);
    }

    static async loadAcceptedStudents(job) {
        const container = document.getElementById('accepted-students');
        
        try {
            // Get applications for this job
            const response = await ApiClient.getJobApplications(job.id);
            if (!response.success) {
                container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
                return;
            }

            const acceptedApplications = response.applications.filter(app => app.status === 'accepted');
            
            if (acceptedApplications.length === 0) {
                container.innerHTML = '<p class="no-data">Хүлээн авсан оюутан байхгүй</p>';
                return;
            }

            container.innerHTML = acceptedApplications.map(app => {
                const student = app.students;
                return `
                    <div class="finished-student-card">
                        <img src="/pics/profile.jpg" alt="${student.name}" class="student-avatar">
                        <div class="student-info">
                            <h4>${student.name}</h4>
                            <p>И-мэйл: ${student.email}</p>
                            <p>Утас: ${student.phone}</p>
                            <p>Үнэлгээ: ${student.rating ? student.rating.toFixed(1) : '0.0'}/5 (${student.total_ratings || 0} үнэлгээ)</p>
                            <div class="student-actions">
                                <button class="remove-btn" onclick="JobManagement.removeAcceptedStudent('${job.id}', '${student.id}')">
                                    Хасах
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading accepted students:', error);
            container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
        }
    }

    static async loadPendingApplications(job) {
        const container = document.getElementById('pending-applications');
        
        try {
            // Get applications for this job
            const response = await ApiClient.getJobApplications(job.id);
            if (!response.success) {
                container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
                return;
            }

            const pendingApplications = response.applications.filter(app => app.status === 'pending');
            
            if (pendingApplications.length === 0) {
                container.innerHTML = '<p class="no-data">Хүлээгдэж буй хүсэлт байхгүй</p>';
                return;
            }

            container.innerHTML = pendingApplications.map(app => {
                const student = app.students;
                return `
                    <div class="application-card clickable-card" data-student-id="${student.id}" onclick="showStudentPopup('${student.id}', '${job.id}')">
                        <img src="/pics/profile.jpg" alt="${student.name}" class="student-avatar">
                        <div class="student-info">
                            <h4>${student.name}</h4>
                            <p>📧 ${student.email}</p>
                            <p>📞 ${student.phone}</p>
                            <p>⭐ 0.0</p>
                            <p class="application-date">Хүсэлт илгээсэн: ${new Date(app.applied_at).toLocaleDateString('mn-MN')}</p>
                            ${app.message ? `<p class="application-message">"${app.message}"</p>` : ''}
                        </div>
                        <div class="application-actions" onclick="event.stopPropagation()">
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading pending applications:', error);
            container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
        }
    }

    static async handleApplication(jobId, studentId, action) {
        try {
            // Get applications for this job to find the application ID
            const response = await ApiClient.getJobApplications(jobId);
            if (!response.success) {
                console.error('Failed to get applications:', response.message);
                return;
            }

            // Find the application for this student
            const application = response.applications.find(app => 
                app.students.id === studentId && app.status === 'pending'
            );

            if (!application) {
                console.error('Application not found');
                return;
            }

            let success = false;
            let message = '';

            if (action === 'accept') {
                const updateResponse = await ApiClient.updateApplicationStatus(application.id, 'accepted');
                success = updateResponse.success;
                message = success ? 'Хүсэлт зөвшөөрөгдлөө' : updateResponse.message || 'Алдаа гарлаа';
            } else if (action === 'reject') {
                const updateResponse = await ApiClient.updateApplicationStatus(application.id, 'rejected');
                success = updateResponse.success;
                message = success ? 'Хүсэлт татгалзагдлаа' : updateResponse.message || 'Алдаа гарлаа';
            }

            if (success) {
                console.log('Application handled:', message);
                JobManagement.loadJobApplications(); // Refresh the display
            } else {
                console.log('Failed to handle application:', message);
                alert(message);
            }
        } catch (error) {
            console.error('Error handling application:', error);
            alert('Хүсэлт боловсруулахад алдаа гарлаа');
        }
    }

    static async removeAcceptedStudent(jobId, studentId) {
        const confirmRemove = confirm('Та энэ оюутныг хүлээн авсан жагсаалтаас хасахыг хүсэж байна уу?\n\nОюутан дахин хүсэлт илгээгчдийн жагсаалтад орно.');
        if (!confirmRemove) return;

        try {
            // Get applications for this job to find the application ID
            const response = await ApiClient.getJobApplications(jobId);
            if (!response.success) {
                console.error('Failed to get applications:', response.message);
                return;
            }

            // Find the accepted application for this student
            const application = response.applications.find(app => 
                app.students.id === studentId && app.status === 'accepted'
            );

            if (!application) {
                console.error('Accepted application not found');
                return;
            }

            // Change status back to pending
            const updateResponse = await ApiClient.updateApplicationStatus(application.id, 'pending');

            if (updateResponse.success) {
                console.log('Student removed successfully from accepted list');
                // Refresh the page to show updated data
                JobManagement.loadJobApplications();
            } else {
                console.log('Failed to remove student:', updateResponse.message);
                alert(updateResponse.message || 'Оюутныг хасахад алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            alert('Оюутныг хасахад алдаа гарлаа');
        }
    }

    static async loadFinishedJobStudents(job) {
        const container = document.getElementById('accepted-students');
        
        try {
            // Get applications for this job
            const response = await ApiClient.getJobApplications(job.id);
            if (!response.success) {
                container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
                return;
            }

            const acceptedApplications = response.applications.filter(app => app.status === 'accepted');
            
            if (acceptedApplications.length === 0) {
                container.innerHTML = '<p class="no-data">Ажилласан оюутан байхгүй</p>';
                return;
            }

            container.innerHTML = acceptedApplications.map(app => {
                const student = app.students;
                const savedRating = app.rating || null;
                const isRated = savedRating !== null;
                
                return `
                    <div class="finished-student-card">
                        <img src="/pics/profile.jpg" alt="${student.name}" class="student-avatar">
                        <div class="student-info">
                            <h4>${student.name}</h4>
                            <p>И-мэйл: ${student.email}</p>
                            <p>Утас: ${student.phone}</p>
                            <div class="rating-section">
                                <label>Үнэлгээ өгөх:</label>
                                <div class="star-rating-container">
                                    <div class="star-rating" data-student-id="${student.id}" data-application-id="${app.id}">
                                        ${[1,2,3,4,5].map(star => `
                                            <span class="star-btn" 
                                                  data-rating="${star}" 
                                                  onclick="JobManagement.selectRating('${student.id}', ${star})"
                                                  title="${star} од">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                                                          stroke="#ddd" stroke-width="1" fill="${star <= (savedRating || 5) ? '#ffc107' : '#ddd'}"/>
                                                </svg>
                                            </span>
                                        `).join('')}
                                    </div>
                                    <div class="rating-actions">
                                        <button class="save-rating-btn" 
                                                data-student-id="${student.id}" 
                                                data-application-id="${app.id}"
                                                onclick="JobManagement.saveRating('${student.id}', '${app.id}')"
                                                ${isRated ? 'disabled style="background: #28a745;"' : ''}>
                                            ${isRated ? 'Хадгалагдсан' : 'Үнэлгээ хадгалах'}
                                        </button>
                                        <span class="current-rating" data-student-id="${student.id}">
                                            Үнэлгээ: ${savedRating || 5}/5 ${isRated ? '(хадгалагдсан)' : '(анхдагч)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Initialize ratings for each student
            acceptedApplications.forEach(app => {
                const savedRating = app.rating || 5;
                JobManagement.selectRating(app.students.id, savedRating);
            });
        } catch (error) {
            console.error('Error loading finished job students:', error);
            container.innerHTML = '<p class="no-data">Хүсэлт ачаалахад алдаа гарлаа</p>';
        }
    }

    static selectRating(studentId, rating) {
        console.log(`Selecting ${rating} stars for student ${studentId}`);
        
        // Update the visual display
        JobManagement.updateStarDisplay(studentId, rating);
        
        // Store the rating temporarily (will be saved when save button is clicked)
        if (!window.tempRatings) {
            window.tempRatings = {};
        }
        window.tempRatings[studentId] = rating;
        
        // Update the current rating text
        const currentRatingElement = document.querySelector(`[data-student-id="${studentId}"].current-rating`);
        if (currentRatingElement) {
            currentRatingElement.textContent = `Үнэлгээ: ${rating}/5`;
        }
    }

    static async saveRating(studentId, applicationId) {
        const rating = window.tempRatings ? window.tempRatings[studentId] : 5;
        
        if (!rating) {
            console.error('No rating selected');
            return;
        }

        console.log(`Saving rating: ${rating} stars for student ${studentId}`);
        
        try {
            // Save rating via API
            const response = await ApiClient.rateStudent(studentId, applicationId, rating);
            
            if (response.success) {
                console.log('Rating saved successfully');
                
                // Create work experience for this student now that they're rated
                await JobManagement.createWorkExperienceForStudent(studentId, applicationId, rating);
                
                // Update the UI to show saved state
                const saveButton = document.querySelector(`[data-student-id="${studentId}"].save-rating-btn`);
                if (saveButton) {
                    saveButton.textContent = 'Хадгалагдсан';
                    saveButton.disabled = true;
                    saveButton.style.background = '#28a745';
                }
                
                const currentRatingElement = document.querySelector(`[data-student-id="${studentId}"].current-rating`);
                if (currentRatingElement) {
                    currentRatingElement.textContent = `Үнэлгээ: ${rating}/5 (хадгалагдсан)`;
                }
                
                // Show success message
                JobManagement.showMessage('Үнэлгээ хадгалагдаж, ажлын туршлага үүсгэгдлээ!', 'success');
            } else {
                console.error('Failed to save rating:', response.message);
                JobManagement.showMessage(response.message || 'Үнэлгээ хадгалахад алдаа гарлаа', 'error');
            }
        } catch (error) {
            console.error('Error saving rating:', error);
            JobManagement.showMessage('Үнэлгээ хадгалахад алдаа гарлаа', 'error');
        }
    }

    static async createWorkExperienceForStudent(studentId, applicationId, rating) {
        try {
            console.log('Creating work experience for student:', studentId, 'with rating:', rating);
            
            // Get job details from session storage
            const jobId = sessionStorage.getItem('viewingJobId');
            if (!jobId) {
                console.error('No job ID found for work experience creation');
                return;
            }
            
            // Get job details
            const jobResponse = await ApiClient.getJobById(jobId);
            if (!jobResponse.success) {
                console.error('Failed to get job details for work experience');
                return;
            }
            
            const job = jobResponse.job;
            
            // Get student details from the application
            const applicationsResponse = await ApiClient.getJobApplications(jobId);
            if (!applicationsResponse.success) {
                console.error('Failed to get applications for work experience');
                return;
            }
            
            const application = applicationsResponse.applications.find(app => app.id === applicationId);
            if (!application) {
                console.error('Application not found for work experience creation');
                return;
            }
            
            const student = application.students;
            
            const workExperienceData = {
                student_id: studentId,
                job_id: jobId,
                company_id: job.company_id,
                job_title: job.title,
                company_name: job.companies?.company_name || 'Unknown Company',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                rating: rating, // Use the actual rating that was just saved
                salary: job.salary
            };
            
            console.log('Work experience data:', workExperienceData);
            
            // Create work experience
            const workResponse = await ApiClient.addWorkExperience(workExperienceData);
            if (workResponse.success) {
                console.log(`Work experience created for ${student.name} with rating ${rating}`);
            } else {
                console.error(`Failed to create work experience for ${student.name}:`, workResponse.message);
            }
        } catch (error) {
            console.error('Error creating work experience:', error);
        }
    }

    static updateStarDisplay(studentId, rating) {
        const ratingContainer = document.querySelector(`[data-student-id="${studentId}"].star-rating`);
        if (ratingContainer) {
            const stars = ratingContainer.querySelectorAll('.star-btn');
            stars.forEach((star, index) => {
                const starSvg = star.querySelector('path');
                if (index < rating) {
                    // Filled star
                    starSvg.setAttribute('fill', '#ffc107');
                    starSvg.setAttribute('stroke', '#ffc107');
                } else {
                    // Empty star
                    starSvg.setAttribute('fill', '#ddd');
                    starSvg.setAttribute('stroke', '#ddd');
                }
            });
        }
    }

    static showMessage(message, type = 'info') {
        // Create a simple toast message
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 99999;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    static async showStudentPopup(studentId, jobId) {
        try {
            // Get applications for this job to find the student data
            const response = await ApiClient.getJobApplications(jobId);
            if (!response.success) {
                console.error('Failed to get applications:', response.message);
                return;
            }

            // Find the application for this student
            const application = response.applications.find(app => 
                app.students.id === studentId
            );

            if (!application) {
                console.error('Student application not found');
                return;
            }

            const student = application.students;
            const popup = document.querySelector('student-popup');
            
            if (popup) {
                popup.showStudentDetails(student, jobId);
            }
        } catch (error) {
            console.error('Error showing student popup:', error);
        }
    }
}

// Initialize when the script loads
JobManagement.init();