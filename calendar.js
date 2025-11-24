const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const startHour = 8;
const endHour = 20;

const schedule = {};   // store as JSON
days.forEach(d => schedule[d.toLowerCase()] = {});

// ===== BUILD GRID =====
function buildCalendar() {
    const grid = document.getElementById("calendarGrid");

    // Top row
    grid.innerHTML += `<div></div>`;
    days.forEach(d => grid.innerHTML += `<div class="day-header">${d}</div>`);

    // Hours
    for (let hour = startHour; hour < endHour; hour++) {
        grid.innerHTML += `<div class="hour-label">${hour}:00</div>`;

        days.forEach(day => {
            const id = `${day}-${hour}-${hour+1}`;

            grid.innerHTML += `
                <div class="cell" id="${id}" onclick="toggleCell('${day}', ${hour})"></div>
            `;
        });
    }
}

buildCalendar();

// ===== CLICK TO TOGGLE =====
function toggleCell(day, hour) {
    const cellId = `${day}-${hour}-${hour+1}`;
    const cell = document.getElementById(cellId);

    const key = `${hour}-${hour+1}`;

    if (cell.classList.contains("active")) {
        cell.classList.remove("active");
        delete schedule[day.toLowerCase()][key];
    } else {
        cell.classList.add("active");
        schedule[day.toLowerCase()][key] = 1; // your “1-1”, “3-1” logic goes here
    }
}

function saveCalendar() {
    console.log("Saving schedule...");
    console.log(schedule);
    alert("JSON saved in console.");
}
