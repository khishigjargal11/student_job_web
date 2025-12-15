// Calendar utility functions for schedule management

class CalendarUtils {
    static days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    static startHour = 8;
    static endHour = 20;

    // Build calendar grid HTML
    static buildCalendarGrid(containerId, schedule = {}) {
        const grid = document.getElementById(containerId);
        if (!grid) return;

        grid.innerHTML = ""; // clear grid first

        // Top row: empty cell + day headers
        grid.innerHTML += `<div></div>`;
        this.days.forEach(d => grid.innerHTML += `<div class="day-header">${d}</div>`);

        // Iterate through hours
        for (let hour = this.startHour; hour < this.endHour; hour++) {
            grid.innerHTML += `<div class="hour-label">${hour}:00</div>`;

            this.days.forEach(day => {
                const dayKey = day.toLowerCase();
                const timeKey = `${hour}-${hour+1}`;
                const id = `${day}_${timeKey}`;
                const isActive = schedule[dayKey] && schedule[dayKey][timeKey] ? 'active' : '';
                
                grid.innerHTML += `<div class="cell ${isActive}" id="${id}" onclick="CalendarUtils.toggleCell('${day}', ${hour})"></div>`;
            });
        }
    }

    // Toggle cell selection
    static toggleCell(day, hour) {
        const cellId = `${day}_${hour}-${hour+1}`;
        const cell = document.getElementById(cellId);
        if (!cell) return;

        const dayKey = day.toLowerCase();
        const timeKey = `${hour}-${hour+1}`;

        // Get current schedule from global variable or create new one
        if (typeof window.currentSchedule === 'undefined') {
            window.currentSchedule = {};
        }

        // Initialize day if not exists
        if (!window.currentSchedule[dayKey]) {
            window.currentSchedule[dayKey] = {};
        }

        if (cell.classList.contains("active")) {
            cell.classList.remove("active");
            delete window.currentSchedule[dayKey][timeKey];
        } else {
            cell.classList.add("active");
            window.currentSchedule[dayKey][timeKey] = 1;
        }

        // Trigger custom event for schedule change
        window.dispatchEvent(new CustomEvent('scheduleChanged', {
            detail: { schedule: window.currentSchedule }
        }));
    }

    // Save schedule for current user
    static saveSchedule() {
        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Only students can save schedule');
            return false;
        }

        const student = DataManager.getStudentById(currentUser.id);
        if (!student) {
            console.log('Student data not found');
            return false;
        }

        // Update student schedule
        student.schedule = window.currentSchedule || {};
        student.updatedAt = new Date().toISOString();

        // Save to storage
        DataManager.saveStudent(student);

        // Update current user session
        DataManager.setCurrentUser({ ...currentUser, schedule: student.schedule });

        console.log('Schedule saved successfully');
        return true;
    }

    // Load schedule for current user
    static loadUserSchedule() {
        const currentUser = DataManager.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            window.currentSchedule = {};
            return {};
        }

        const student = DataManager.getStudentById(currentUser.id);
        if (student && student.schedule) {
            window.currentSchedule = student.schedule;
            return student.schedule;
        }

        window.currentSchedule = {};
        return {};
    }

    // Convert schedule to display format
    static scheduleToDisplayText(schedule) {
        const scheduleEntries = [];
        
        for (const day in schedule) {
            const times = Object.keys(schedule[day]);
            if (times.length > 0) {
                const dayName = this.days.find(d => d.toLowerCase() === day) || day;
                const startTime = Math.min(...times.map(t => parseInt(t.split('-')[0])));
                const endTime = Math.max(...times.map(t => parseInt(t.split('-')[1])));
                scheduleEntries.push(`${dayName}: ${startTime}:00–${endTime}:00`);
            }
        }
        
        return scheduleEntries.join(', ') || 'Цагийн хуваарь тодорхойлоогүй';
    }

    // Check if two schedules conflict
    static hasConflict(schedule1, schedule2) {
        for (const day in schedule2) {
            if (schedule1[day]) {
                for (const timeSlot in schedule2[day]) {
                    if (schedule1[day][timeSlot]) {
                        return true; // Conflict found
                    }
                }
            }
        }
        return false;
    }

    // Get available time slots for a day
    static getAvailableSlots(schedule, day) {
        const dayKey = day.toLowerCase();
        const availableSlots = [];
        
        for (let hour = this.startHour; hour < this.endHour; hour++) {
            const timeKey = `${hour}-${hour+1}`;
            if (!schedule[dayKey] || !schedule[dayKey][timeKey]) {
                availableSlots.push(timeKey);
            }
        }
        
        return availableSlots;
    }

    // Initialize calendar with user's schedule
    static initializeCalendar(containerId) {
        const schedule = this.loadUserSchedule();
        this.buildCalendarGrid(containerId, schedule);
        
        // Add save button functionality if it exists
        const saveButton = document.getElementById('saveScheduleBtn');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveSchedule());
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarUtils;
} else {
    window.CalendarUtils = CalendarUtils;
}