const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const startHour = 8;
const endHour = 20;

const schedule = {};   // store as JSON
days.forEach(d => schedule[d.toLowerCase()] = {});

// Initialize schedule based on context
async function initializeSchedule() {
    const returnToJobForm = sessionStorage.getItem('returnToJobForm');

    if (returnToJobForm === 'true') {
        // Load existing job schedule if any
        const jobSchedule = sessionStorage.getItem('jobSchedule');
        console.log('Loading job schedule from sessionStorage:', jobSchedule);

        if (jobSchedule) {
            try {
                const loadedSchedule = JSON.parse(jobSchedule);
                Object.assign(schedule, loadedSchedule);
                console.log('Loaded job schedule:', schedule);
            } catch (error) {
                console.error('Error parsing job schedule:', error);
            }
        }

        // Update UI for job creation
        document.getElementById('calendarTitle').textContent = 'Ажлын цагийн хуваарь';
        document.getElementById('calendarInfo').textContent = 'Ажлын цагийн хуваарьг тодорхойлно уу';
    } else {
        // Load student schedule
        const currentUser = ApiClient.getCurrentUser();
        if (currentUser && currentUser.type === 'student') {
            try {
                const response = await ApiClient.getStudentProfile();
                if (response.success && response.student.schedule) {
                    Object.assign(schedule, response.student.schedule);
                    console.log('Loaded student schedule:', schedule);
                }
            } catch (error) {
                console.error('Error loading student schedule:', error);
            }
        }
    }
}

// ===== BUILD GRID =====
async function buildCalendar() {
    // Initialize schedule first
    await initializeSchedule();

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = ""; // clear grid first

    // Top row: empty cell + day headers
    grid.innerHTML += `<div></div>`;
    days.forEach(d => grid.innerHTML += `<div class="day-header">${d}</div>`);

    // Start and end times
    const startTime = new Date();
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(endHour, 0, 0, 0);

    // Iterate through hours using Date
    for (let time = new Date(startTime); time < endTime; time.setHours(time.getHours() + 1)) {
        const hour = time.getHours();
        grid.innerHTML += `<div class="hour-label">${hour}:00</div>`;

        days.forEach(day => {
            const dayKey = day.toLowerCase();
            const timeKey = `${hour}-${hour+1}`;
            const id = `${day}_${timeKey}`;
            const isActive = schedule[dayKey] && schedule[dayKey][timeKey] ? 'active' : '';
            grid.innerHTML += `<div class="cell ${isActive}" id="${id}" onclick="toggleCell('${day}', ${hour})"></div>`;
        });
    }

    console.log('Calendar grid built with schedule:', schedule);
}

// Wait for DOM to be ready, then build calendar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCalendar);
} else {
    buildCalendar();
}
// ===== CLICK TO TOGGLE =====
function toggleCell(day, hour) {
    const cellId = `${day}_${hour}-${hour+1}`;
    const cell = document.getElementById(cellId);

    const key = `${hour}-${hour+1}`;

    if (cell.classList.contains("active")) {
        cell.classList.remove("active");
        delete schedule[day.toLowerCase()][key];
    } else {
        cell.classList.add("active");
        schedule[day.toLowerCase()][key] = 1;
    }
}

function saveCalendar() {
    console.log("Saving schedule...");
    console.log('Schedule data:', schedule);

    // Check if this is for job creation
    const returnToJobForm = sessionStorage.getItem('returnToJobForm');

    if (returnToJobForm === 'true') {
        // Save as job schedule
        console.log('Saving as job schedule...');
        const scheduleJson = JSON.stringify(schedule);
        sessionStorage.setItem('jobSchedule', scheduleJson);
        sessionStorage.removeItem('returnToJobForm');
        console.log('Job schedule saved to sessionStorage:', scheduleJson);
        alert('Ажлын цагийн хуваарь амжилттай хадгалагдлаа!');
        window.location.href = '/company/add-job';
        return;
    }

    // Regular student schedule save
    const currentUser = ApiClient.getCurrentUser();
    if (!currentUser || currentUser.type !== 'student') {
        console.log('Only students can save regular schedule');
        alert('Зөвхөн оюутан цагийн хуваарь хадгалах боломжтой');
        return;
    }

    // Save student schedule via API
    ApiClient.updateStudentSchedule(schedule).then(response => {
        if (response.success) {
            console.log('Student schedule saved successfully');
            alert('Цагийн хуваарь амжилттай хадгалагдлаа!');
        } else {
            console.error('Failed to save student schedule:', response.message);
            alert(response.message || 'Цагийн хуваарь хадгалахад алдаа гарлаа');
        }
    }).catch(error => {
        console.error('Error saving student schedule:', error);
        alert('Цагийн хуваарь хадгалахад алдаа гарлаа');
    });
}

function clearSchedule() {
    if (confirm('Та цагийн хуваарьаа бүрэн цэвэрлэхдээ итгэлтэй байна уу?')) {
        // Clear schedule object
        days.forEach(d => schedule[d.toLowerCase()] = {});

        // Clear all active cells
        const activeCells = document.querySelectorAll('.cell.active');
        activeCells.forEach(cell => cell.classList.remove('active'));

        console.log('Schedule cleared');
    }
}
