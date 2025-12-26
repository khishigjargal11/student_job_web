// Calendar utility functions for schedule management

class CalendarUtils {
    static days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    static startHour = 8;
    static endHour = 20;

    // Build calendar grid HTML
    static buildCalendarGrid(containerId, schedule = {}) {
        console.log('CalendarUtils: Building grid for container:', containerId, 'with schedule:', schedule);
        
        const grid = document.getElementById(containerId);
        if (!grid) {
            console.error('CalendarUtils: Grid container not found:', containerId);
            return;
        }

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
                
                if (isActive) {
                    console.log('CalendarUtils: Setting active cell:', id, 'for', dayKey, timeKey);
                }
                
                grid.innerHTML += `<div class="cell ${isActive}" id="${id}" onclick="CalendarUtils.toggleCell('${day}', ${hour})"></div>`;
            });
        }
        
        console.log('CalendarUtils: Grid building complete');
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

    // Save schedule for current user (using API)
    static async saveSchedule() {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            console.log('Only students can save schedule');
            return false;
        }

        try {
            const response = await ApiClient.updateStudentSchedule(window.currentSchedule || {});
            
            if (response.success) {
                console.log('Schedule saved successfully');
                return true;
            } else {
                console.error('Failed to save schedule:', response.message);
                return false;
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            return false;
        }
    }

    // Load schedule for current user (using API)
    static async loadUserSchedule() {
        const currentUser = ApiClient.getCurrentUser();
        if (!currentUser || currentUser.type !== 'student') {
            window.currentSchedule = {};
            return {};
        }

        try {
            const response = await ApiClient.getStudentProfile();
            if (response.success && response.student.schedule) {
                window.currentSchedule = response.student.schedule;
                return response.student.schedule;
            }
        } catch (error) {
            console.error('Error loading user schedule:', error);
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

    // Initialize calendar with user's schedule (using API)
    static async initializeCalendar(containerId) {
        const schedule = await this.loadUserSchedule();
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