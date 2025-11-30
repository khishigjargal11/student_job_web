class CalendarComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <main class="calendar">
            <div class="save-btn-container">
                <button class="save-btn" id="saveBtn">Хадгалах</button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        </main>
        `;

        this.buildCalendar();
        this.querySelector("#saveBtn").addEventListener("click", () => this.saveCalendar());
    }

    // ===========================
    // Calendar variables
    // ===========================
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    startHour = 8;
    endHour = 20;
    schedule = {};

    // ===========================
    // Build Calendar Grid
    // ===========================
    buildCalendar() {
        const grid = this.querySelector("#calendarGrid");
        this.days.forEach(d => this.schedule[d.toLowerCase()] = {});

        grid.innerHTML = "";
        grid.innerHTML += `<div></div>`;   // Empty top-left cell

        this.days.forEach(d => grid.innerHTML += `<div class="day-header">${d}</div>`);

        for (let hour = this.startHour; hour < this.endHour; hour++) {
            grid.innerHTML += `<div class="hour-label">${hour}:00</div>`;

            this.days.forEach(day => {
                const cellId = `${day}_${hour}-${hour+1}`;

                grid.innerHTML += `
                <div class="cell" id="${cellId}" data-day="${day}" data-hour="${hour}"></div>
                `;
            });
        }

        // Attach click event
        this.enableCellClicks();
    }

    // ===========================
    // Click behavior
    // ===========================
    enableCellClicks() {
        const cells = this.querySelectorAll(".cell");

        cells.forEach(cell => {
            cell.addEventListener("click", () => {
                const day = cell.dataset.day;
                const hour = cell.dataset.hour;
                const key = `${hour}-${parseInt(hour)+1}`;

                if (cell.classList.contains("active")) {
                    cell.classList.remove("active");
                    delete this.schedule[day.toLowerCase()][key];
                } else {
                    cell.classList.add("active");
                    this.schedule[day.toLowerCase()][key] = 1;
                }
            });
        });
    }

    // ===========================
    // Save (monday - sunday(1-7) 8h-9h (1) 9h-10h(2)...)
    // ===========================
     saveCalendar() {
    const grid = document.getElementById("calendarGrid");
    const activeCells = grid.querySelectorAll(".cell.active");

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const startHour = 8; // your calendar start

    let saved = [];

    activeCells.forEach(cell => {
        const dayName = cell.dataset.day.toLowerCase();  // monday, tuesday...
        const hour = parseInt(cell.dataset.hour); // 8, 9, 10...

        // convert to index
        const dayIndex = days.indexOf(dayName) + 1;
        const hourIndex = (hour - startHour) + 1;

        saved.push(`${dayIndex}-${hourIndex}`);
    });

    console.log("📌 Saved:", saved);
    alert("Saved! Check console.");

    return saved; 
}
}

window.customElements.define("calendar-component", CalendarComponent);
