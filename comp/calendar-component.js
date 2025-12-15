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

    initializeCalendar() {
        // Check if this is for job creation
        const returnToJobForm = sessionStorage.getItem('returnToJobForm');
        
        if (returnToJobForm === 'true') {
            // Load existing job schedule if any
            const jobSchedule = sessionStorage.getItem('jobSchedule');
            if (jobSchedule) {
                this.schedule = JSON.parse(jobSchedule);
            }
            
            // Update UI for job creation
            document.getElementById('calendarTitle').textContent = 'Ажлын цагийн хуваарь';
            document.getElementById('calendarInfo').textContent = 'Ажлын цагийн хуваарьг тодорхойлно уу';
        } else {
            // Load user's existing schedule for students
            const currentUser = DataManager.getCurrentUser();
            if (currentUser && currentUser.type === 'student') {
                const student = DataManager.getStudentById(currentUser.id);
                if (student && student.schedule) {
                    this.schedule = { ...student.schedule };
                }
            }
        }

        // Build calendar with existing schedule
        CalendarUtils.buildCalendarGrid('calendarGrid', this.schedule);
        
        // Set global schedule for CalendarUtils
        window.currentSchedule = this.schedule;

        // Check for conflicts (only for students)
        if (returnToJobForm !== 'true') {
            this.checkScheduleConflicts();
        }
    }

    addEventListeners() {
        // Save button
        this.querySelector("#saveBtn").addEventListener("click", () => this.saveCalendar());
        
        // Clear button
        this.querySelector("#clearBtn").addEventListener("click", () => this.clearSchedule());

        // Listen for schedule changes from CalendarUtils
        window.addEventListener('scheduleChanged', (event) => {
            this.schedule = event.detail.schedule;
            this.checkScheduleConflicts();
        });

        // Override CalendarUtils toggle function to use our instance
        const originalToggle = CalendarUtils.toggleCell;
        CalendarUtils.toggleCell = (day, hour) => {
            const cellId = `${day}_${hour}-${hour+1}`;
            const cell = document.getElementById(cellId);
            if (!cell) return;

            const dayKey = day.toLowerCase();
            const timeKey = `${hour}-${hour+1}`;

            // Initialize day if not exists
            if (!this.schedule[dayKey]) {
                this.schedule[dayKey] = {};
            }

            if (cell.classList.contains("active")) {
                cell.classList.remove("active");
                delete this.schedule[dayKey][timeKey];
            } else {
                cell.classList.add("active");
                this.schedule[dayKey][timeKey] = 1;
            }

            // Update global schedule
            window.currentSchedule = this.schedule;

            // Check conflicts
            this.checkScheduleConflicts();

            // Trigger custom event
            window.dispatchEvent(new CustomEvent('scheduleChanged', {
                detail: { schedule: this.schedule }
            }));
        };
    }

    saveCalendar() {
        const currentUser = DataManager.getCurrentUser();
        
        // Check if returning to job form
        const returnToJobForm = sessionStorage.getItem('returnToJobForm');
        
        if (returnToJobForm === 'true') {
            // Save as job schedule
            sessionStorage.setItem('jobSchedule', JSON.stringify(this.schedule));
            sessionStorage.removeItem('returnToJobForm');
            console.log('Job schedule saved');
            window.location.href = 'AddNews.html';
            return;
        }
        
        // Regular student schedule save
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Only students can save schedule');
            return;
        }

        const student = DataManager.getStudentById(currentUser.id);
        if (!student) {
            console.log('Student data not found');
            return;
        }

        // Update student schedule
        student.schedule = this.schedule;
        student.updatedAt = new Date().toISOString();

        // Save to storage
        DataManager.saveStudent(student);

        // Update current user session
        DataManager.setCurrentUser({ ...currentUser, schedule: student.schedule });

        console.log('Schedule saved successfully');
        
        // Show updated conflicts
        this.checkScheduleConflicts();
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

    checkScheduleConflicts() {
        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') return;

        const conflictsContainer = this.querySelector('#scheduleConflicts');
        const activeJobs = DataManager.getActiveJobs();
        const conflictingJobs = [];

        activeJobs.forEach(job => {
            if (DataManager.hasScheduleConflict(this.schedule, job.schedule)) {
                const company = DataManager.getCompanyById(job.companyId);
                conflictingJobs.push({
                    job: job,
                    companyName: company ? company.companyName : 'Тодорхойгүй'
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
    }
}

window.customElements.define("calendar-component", CalendarComponent);
