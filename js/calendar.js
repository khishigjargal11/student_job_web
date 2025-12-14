const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const startHour = 8;
const endHour = 20;

const schedule = {};   // store as JSON
days.forEach(d => schedule[d.toLowerCase()] = {});

// ===== BUILD GRID =====
function buildCalendar() {
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
            const id = `${day}_${hour}-${hour+1}`;
            grid.innerHTML += `<div class="cell" id="${id}" onclick="toggleCell('${day}', ${hour})"></div>`;
        });
    }
}

buildCalendar();
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
    console.log(schedule);
    alert("JSON saved in console.");
}
