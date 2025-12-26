class CalendarComponent extends HTMLElement {
    constructor() {
        super();
        this.schedule = {};
    }

    connectedCallback() {
        this.innerHTML = `
        <main class="calendar">
            <div class="calendar-header">
                <h2 id="calendarTitle">Цагийн хуваарь</h2>
                <div class="calendar-info">
                    <p id="calendarInfo">Та ажиллах боломжтой цагуудаа сонгоно уу</p>
                </div>
            </div>
            <div class="save-btn-container">
                <button class="save-btn" id="saveBtn">Хадгалах</button>
                <button class="clear-btn" id="clearBtn">Цэвэрлэх</button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
            <div class="schedule-conflicts" id="scheduleConflicts"></div>
        </main>
        `;

        this.initializeCalendar();
        this.addEventListeners();
    }

    async initializeCalendar() {
        // Check if this is for job creation
        const returnToJobForm = sessionStorage.getItem('returnToJobForm');
        
        console.log('Calendar: Initializing calendar, returnToJobForm:', returnToJobForm);
        
        if (returnToJobForm === 'true') {
            // Load existing job schedule if any
            const jobSchedule = sessionStorage.getItem('jobSchedule');
            console.log('Calendar: Found jobSchedule in sessionStorage:', jobSchedule);
            
            if (jobSchedule) {
                try {
                    this.schedule = JSON.parse(jobSchedule);
                    console.log('Calendar: Loaded job schedule:', this.schedule);
                } catch (error) {
                    console.error('Calendar: Error parsing job schedule:', error);
                    this.schedule = {};
                }
            } else {
                console.log('Calendar: No existing job schedule, starting fresh');
                this.schedule = {};
            }
            
            // Update UI for job creation
            document.getElementById('calendarTitle').textContent = 'Ажлын цагийн хуваарь';
            document.getElementById('calendarInfo').textContent = 'Ажлын цагийн хуваарьг тодорхойлно уу';
        } else {
            // Load user's existing schedule for students
            const currentUser = ApiClient.getCurrentUser();
            console.log('Calendar: Current user:', currentUser);
            
            if (currentUser && currentUser.type === 'student') {
                try {
                    console.log('Calendar: Loading student profile...');
                    const response = await ApiClient.getStudentProfile();
                    console.log('Calendar: Profile response:', response);
                    
                    if (response.success && response.student.schedule) {
                        console.log('Calendar: Found existing schedule:', response.student.schedule);
                        this.schedule = { ...response.student.schedule };
                    } else {
                        console.log('Calendar: No existing schedule found or failed to load');
                        this.schedule = {};
                    }
                } catch (error) {
                    console.error('Calendar: Error loading student schedule:', error);
                    this.schedule = {};
                }
            } else {
                console.log('Calendar: No current user or not a student');
                this.schedule = {};
            }
        }

        // Build calendar with existing schedule
        console.log('Calendar: Building grid with schedule:', this.schedule);
        CalendarUtils.buildCalendarGrid('calendarGrid', this.schedule);
        
        // Set global schedule for CalendarUtils
        window.currentSchedule = this.schedule;
        console.log('Calendar: Set global schedule:', window.currentSchedule);

        // Override CalendarUtils.toggleCell AFTER the grid is built
        this.setupCellClickHandling();

        // Check for conflicts (only for students)
        if (returnToJobForm !== 'true') {
            await this.checkScheduleConflicts();
        } else {
            console.log('Calendar: Skipping conflict check for job creation');
        }
    }

    setupCellClickHandling() {
        console.log('Calendar: Setting up cell click handling...');
        const self = this;
        
        // Override the global CalendarUtils.toggleCell function
        CalendarUtils.toggleCell = (day, hour) => {
            console.log('Calendar: CalendarUtils.toggleCell called for', day, hour);
            self.handleCellClick(day, hour);
        };
        
        console.log('Calendar: Cell click handling setup complete');
    }

    addEventListeners() {
        // Save button
        this.querySelector("#saveBtn").addEventListener("click", () => this.saveCalendar());
        
        // Clear button
        this.querySelector("#clearBtn").addEventListener("click", () => this.clearSchedule());

        // Listen for schedule changes from CalendarUtils
        window.addEventListener('scheduleChanged', (event) => {
            console.log('Calendar: Schedule changed event received:', event.detail.schedule);
            this.schedule = event.detail.schedule;
            if (sessionStorage.getItem('returnToJobForm') !== 'true') {
                this.checkScheduleConflicts();
            }
        });
    }

    handleCellClick(day, hour, cellElement = null) {
        console.log('Calendar: Handle cell click for', day, hour);
        
        const cellId = `${day}_${hour}-${hour+1}`;
        const cell = cellElement || document.getElementById(cellId);
        if (!cell) {
            console.log('Calendar: Cell not found:', cellId);
            return;
        }

        const dayKey = day.toLowerCase();
        const timeKey = `${hour}-${hour+1}`;

        // Initialize day if not exists
        if (!this.schedule[dayKey]) {
            this.schedule[dayKey] = {};
        }

        if (cell.classList.contains("active")) {
            console.log('Calendar: Removing time slot:', dayKey, timeKey);
            cell.classList.remove("active");
            delete this.schedule[dayKey][timeKey];
            // Clean up empty day objects
            if (Object.keys(this.schedule[dayKey]).length === 0) {
                delete this.schedule[dayKey];
            }
        } else {
            console.log('Calendar: Adding time slot:', dayKey, timeKey);
            cell.classList.add("active");
            this.schedule[dayKey][timeKey] = 1;
        }

        // Update global schedule
        window.currentSchedule = this.schedule;
        console.log('Calendar: Updated schedule:', this.schedule);

        // Check conflicts only for students
        if (sessionStorage.getItem('returnToJobForm') !== 'true') {
            this.checkScheduleConflicts();
        }

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('scheduleChanged', {
            detail: { schedule: this.schedule }
        }));
    }

    async saveCalendar() {
        const currentUser = ApiClient.getCurrentUser();
        
        // Check if returning to job form
        const returnToJobForm = sessionStorage.getItem('returnToJobForm');
        
        console.log('Calendar: Save button clicked');
        console.log('Calendar: returnToJobForm flag:', returnToJobForm);
        console.log('Calendar: Current schedule:', this.schedule);
        console.log('Calendar: Schedule keys count:', Object.keys(this.schedule).length);
        console.log('Calendar: Current user:', currentUser);
        
        // Validate schedule has content
        const hasScheduleContent = Object.keys(this.schedule).some(day => 
            this.schedule[day] && Object.keys(this.schedule[day]).length > 0
        );
        
        if (!hasScheduleContent) {
            console.log('Calendar: Warning - Schedule is empty!');
            if (!confirm('Цагийн хуваарь хоосон байна. Хадгалахыг хүсэж байна уу?')) {
                return;
            }
        }
        
        if (returnToJobForm === 'true') {
            // Save as job schedule
            console.log('Calendar: Saving as job schedule...');
            const scheduleJson = JSON.stringify(this.schedule);
            sessionStorage.setItem('jobSchedule', scheduleJson);
            sessionStorage.removeItem('returnToJobForm');
            console.log('Calendar: Job schedule saved to sessionStorage:', scheduleJson);
            console.log('Calendar: Redirecting to /company/add-job');
            window.location.href = '/company/add-job';
            return;
        }
        
        // Regular student schedule save
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Calendar: Only students can save regular schedule');
            alert('Зөвхөн оюутан цагийн хуваарь хадгалах боломжтой');
            return;
        }

        try {
            console.log('Calendar: Saving student schedule via API...');
            // Update student schedule via API
            const response = await ApiClient.updateStudentSchedule(this.schedule);
            
            if (response.success) {
                console.log('Calendar: Schedule saved successfully');
                alert('Цагийн хуваарь амжилттай хадгалагдлаа!');
                
                // Show updated conflicts
                await this.checkScheduleConflicts();
            } else {
                console.error('Calendar: Failed to save schedule:', response.message);
                alert(response.message || 'Цагийн хуваарь хадгалахад алдаа гарлаа');
            }
        } catch (error) {
            console.error('Calendar: Error saving schedule:', error);
            alert('Цагийн хуваарь хадгалахад алдаа гарлаа');
        }
    }

    clearSchedule() {
        if (confirm('Та цагийн хуваарьаа бүрэн цэвэрлэхийг хүсэж байна уу?')) {
            this.schedule = {};
            window.currentSchedule = {};
            
            // Clear all active cells
            const activeCells = this.querySelectorAll('.cell.active');
            activeCells.forEach(cell => cell.classList.remove('active'));
            
            // Clear conflicts
            this.querySelector('#scheduleConflicts').innerHTML = '';
            
            console.log('Schedule cleared');
        }
    }

    async checkScheduleConflicts() {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') return;

        const conflictsContainer = this.querySelector('#scheduleConflicts');
        
        try {
            // Get available jobs from API
            const response = await ApiClient.getAvailableJobs();
            if (!response.success) {
                conflictsContainer.innerHTML = `
                    <div class="no-conflicts">
                        <p>✅ Цагийн хуваарийн давхцал шалгах боломжгүй</p>
                    </div>
                `;
                return;
            }

            const availableJobs = response.jobs;
            const conflictingJobs = [];

            availableJobs.forEach(job => {
                if (CalendarUtils.hasConflict(this.schedule, job.schedule)) {
                    conflictingJobs.push({
                        job: job,
                        companyName: job.company_name || 'Тодорхойгүй'
                    });
                }
            });

            if (conflictingJobs.length > 0) {
                conflictsContainer.innerHTML = `
                    <div class="conflicts-warning">
                        <h4>⚠️ Цагийн хуваарийн давхцал</h4>
                        <p>Таны цагийн хуваарь дараах ажлуудтай давхцаж байна:</p>
                        <ul>
                            ${conflictingJobs.map(item => `
                                <li>
                                    <strong>${item.job.title}</strong> - ${item.companyName}
                                    <br><small>${CalendarUtils.scheduleToDisplayText(item.job.schedule)}</small>
                                </li>
                            `).join('')}
                        </ul>
                        <p><small>Эдгээр ажлууд таны хайлтын үр дүнд харагдахгүй.</small></p>
                    </div>
                `;
            } else {
                conflictsContainer.innerHTML = `
                    <div class="no-conflicts">
                        <p>✅ Цагийн хуваарийн давхцал байхгүй</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error checking schedule conflicts:', error);
            conflictsContainer.innerHTML = `
                <div class="no-conflicts">
                    <p>⚠️ Цагийн хуваарийн давхцал шалгахад алдаа гарлаа</p>
                </div>
            `;
        }
    }
}

window.customElements.define("calendar-component", CalendarComponent);
