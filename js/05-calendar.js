/* =========================================================
13. CALENDAR FILTERING
========================================================= */

function getDayEvents(date) {
return events
.filter(event =>
event.date === date &&
event.venue === currentVenue
)
.sort((a, b) => a.time.localeCompare(b.time));
}

function getViewDateLabel() {
if (activeCalendarView === "day") {
return currentDate.toLocaleDateString("en-SG", {
weekday: "long",
day: "numeric",
month: "long",
year: "numeric"
});
}

if (activeCalendarView === "week") {
const start = startOfWeek(currentDate);
const end = addDays(start, 6);

return (
  start.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short"
  }) +
  " - " +
  end.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
);
}

return currentDate.toLocaleDateString("en-SG", {
month: "long",
year: "numeric"
});
}

/* =========================================================
14. MASTER CALENDAR RENDER
========================================================= */

function renderCalendar() {
  const grid = $("calendarGrid");

  if (!grid) {
    console.error("calendarGrid not found.");
    return;
  }

  saveCalendarDate();

  if (activeCalendarView === "eagle") {
    renderEagleView();
  } else if (activeCalendarView === "week") {
    renderWeekView();
  } else if (activeCalendarView === "day") {
    renderDayView();
  } else {
    renderMonthView();
  }
}

/* =========================================================
15. MONTH VIEW
========================================================= */

function renderMonthView() {
const grid = $("calendarGrid");

const header =
$("weekHeader") ||
document.querySelector(".week-header");

grid.className = "calendar-grid";
grid.innerHTML = "";

if (header) {
header.className = "week-header";

header.innerHTML = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
].map(day => "<div>" + day + "</div>").join("");
}

setText("monthTitle", getViewDateLabel());

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

const firstWeekday = new Date(
year,
month,
1
).getDay();

const firstGridDate = new Date(
year,
month,
1 - firstWeekday
);

for (let i = 0; i < 42; i++) {
const date = addDays(firstGridDate, i);
const dateString = formatInputDate(date);

const cell = document.createElement("div");
cell.className = "day-cell";

if (date.getMonth() !== month) {
  cell.classList.add("other-month");
}

if (isSameDay(date, new Date())) {
  cell.classList.add("today");
}

const number = document.createElement("div");
number.className = "date-number";
number.textContent = date.getDate();

cell.appendChild(number);

// Staff appears above programmes.
cell.appendChild(
  createManpowerSection(currentVenue, dateString)
);

getDayEvents(dateString).forEach(event => {
  cell.appendChild(createEventElement(event));
});

grid.appendChild(cell);
}
}

/* =========================================================
16. WEEK VIEW
========================================================= */

function renderWeekView() {
const grid = $("calendarGrid");

grid.className = "calendar-grid week-view";
grid.innerHTML = "";

const start = startOfWeek(currentDate);

setText("monthTitle", getViewDateLabel());

const dates = Array.from(
{ length: 7 },
(_, i) => addDays(start, i)
);

renderFlexibleHeader(dates);

dates.forEach(date => {
grid.appendChild(renderDayColumn(date));
});
}

/* =========================================================
17. DAY VIEW
========================================================= */

function renderDayView() {
const grid = $("calendarGrid");

grid.className = "calendar-grid day-view";
grid.innerHTML = "";

setText("monthTitle", getViewDateLabel());

renderFlexibleHeader([currentDate]);

grid.appendChild(renderDayColumn(currentDate));
}

/* =========================================================
18. WEEK / DAY HEADER
========================================================= */

function renderFlexibleHeader(dates) {
const header =
$("weekHeader") ||
document.querySelector(".week-header");

if (!header) return;

header.innerHTML = "";

header.className =
activeCalendarView === "day"
? "week-header day-view-header"
: "week-header week-view-header";

dates.forEach(date => {
const button = document.createElement("button");

button.type = "button";
button.className = "calendar-date-header";

button.textContent = date.toLocaleDateString(
  "en-SG",
  {
    weekday:
      activeCalendarView === "day"
        ? "long"
        : "short",
    day: "numeric",
    month: "short"
  }
);

if (isSameDay(date, new Date())) {
  button.classList.add("today-header");
}

if (activeCalendarView === "week") {
  button.addEventListener("click", () => {
    currentDate = new Date(date);
    activeCalendarView = "day";

    setValue("calendarView", "day");

    renderCalendar();
  });
}

header.appendChild(button);
});
}

/* =========================================================
19. DAY COLUMN
========================================================= */

function renderDayColumn(date) {
const column = document.createElement("div");

column.className = "week-column";

if (activeCalendarView === "day") {
column.classList.add("day-column");
}

if (isSameDay(date, new Date())) {
column.classList.add("today-column");
}

const dateString = formatInputDate(date);

column.appendChild(
createManpowerSection(currentVenue, dateString)
);

const dayEvents = getDayEvents(dateString);

if (dayEvents.length === 0) {
const empty = document.createElement("div");

empty.className = "view-empty";
empty.textContent = "No programmes";

column.appendChild(empty);
}

dayEvents.forEach(event => {
const element = createEventElement(event);

element.classList.add(
  activeCalendarView === "day"
    ? "day-view-event"
    : "week-view-event"
);

column.appendChild(element);
});

return column;
}

/* =========================================================
19.5   EAGLE VIEW - MONTHLY PROGRAMME OVERVIEW
========================================================= */

function renderEagleView() {
  const grid = $("calendarGrid");

  const header =
    $("weekHeader") ||
    document.querySelector(".week-header");

  if (!grid) return;

  grid.className = "calendar-grid eagle-calendar";
  grid.innerHTML = "";

  setText("monthTitle", getViewDateLabel());

  // Monday to Sunday
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  if (header) {
    header.className = "week-header eagle-header";

    header.innerHTML =
      '<div class="eagle-header-label">WEEK</div>' +
      weekdays.map(day =>
        `<div>${day}</div>`
      ).join("");
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);

  // Convert Sunday-first JavaScript numbering
  // into Monday-first calendar numbering.
  const mondayOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const totalWeeks = Math.ceil(
    (mondayOffset + daysInMonth) / 7
  );

  for (let week = 0; week < totalWeeks; week++) {

    const weekBlock = document.createElement("div");
    weekBlock.className = "eagle-week-block";

    // -----------------------------------------
    // PROGRAMME ROW
    // -----------------------------------------

    const programmeRow = document.createElement("div");
    programmeRow.className = "eagle-programme-row";

    const programmeLabel = document.createElement("div");
    programmeLabel.className = "eagle-row-label";
    programmeLabel.textContent = "PROGRAMMES";

    programmeRow.appendChild(programmeLabel);

    // -----------------------------------------
    // OFF / LEAVE ROW
    // -----------------------------------------

 const leaveCell = document.createElement("div");
leaveCell.className = "eagle-leave-cell";

if (isCurrentMonth) {
    const record = getManpower(currentVenue, dateString);

    const leaveList = document.createElement("div");
    leaveList.className = "eagle-leave-notes";

    leaveList.style.display = "flex";
    leaveList.style.flexDirection = "column";
    leaveList.style.gap = "6px";
    leaveList.style.padding = "8px 10px";

    if (record.leaveEntries?.length) {
        record.leaveEntries.forEach(entry => {
            const leaveEntry = document.createElement("div");
            leaveEntry.style.display = "flex";
            leaveEntry.style.gap = "8px";
            leaveEntry.style.alignItems = "flex-start";

            const icon = document.createElement("span");
            icon.textContent = "👤";

            const details = document.createElement("span");

            const name = document.createElement("strong");
            name.textContent = entry.staff;

            const reason = document.createElement("span");
            reason.textContent = " — " + entry.reason;

            details.append(name, reason);
            leaveEntry.append(icon, details);
            leaveList.appendChild(leaveEntry);
        });
    } else {
        leaveList.textContent = record.leaveNotes || "—";
    }

    leaveCell.appendChild(leaveList);

    leaveCell.addEventListener("click", () => {
        openManpowerModal(currentVenue, dateString);
    });
}

    // -----------------------------------------
    // MONDAY TO SUNDAY
    // -----------------------------------------

    for (let day = 0; day < 7; day++) {

      const dayNumber =
        week * 7 + day - mondayOffset + 1;

      const date = new Date(
        year,
        month,
        dayNumber
      );

      const dateString = formatInputDate(date);

      const isCurrentMonth =
        date.getMonth() === month;

      // Programme cell
      const programmeCell =
        document.createElement("div");

      programmeCell.className = "eagle-day-cell";

      if (!isCurrentMonth) {
        programmeCell.classList.add("eagle-other-month");
      }

      if (isSameDay(date, new Date())) {
        programmeCell.classList.add("eagle-today");
      }

      const dateHeading =
        document.createElement("div");

      dateHeading.className = "eagle-date-number";

      dateHeading.textContent = isCurrentMonth
        ? date.getDate()
        : "";

      programmeCell.appendChild(dateHeading);

      if (isCurrentMonth) {

        // Staff assigned for the day
        const record = getManpower(
          currentVenue,
          dateString
        );

        if (record.staff.length > 0) {
          const staffList =
            document.createElement("div");

          staffList.className = "eagle-staff-list";

          staffList.textContent =
            record.staff.join(", ");

          programmeCell.appendChild(staffList);
        }

        // Add / edit manpower button
        const manpowerButton =
          document.createElement("button");

        manpowerButton.type = "button";
        manpowerButton.className = "eagle-manpower-button";

        manpowerButton.textContent =
          record.staff.length > 0
            ? "Edit staff"
            : "+ Staff";

        manpowerButton.addEventListener("click", e => {
          e.stopPropagation();

          openManpowerModal(
            currentVenue,
            dateString
          );
        });

        programmeCell.appendChild(manpowerButton);

        // Programmes for the day
        getDayEvents(dateString).forEach(event => {

          const eventCard =
            document.createElement("div");

          eventCard.className = "eagle-event";

          const time =
            document.createElement("div");

          time.className = "eagle-event-time";

          time.textContent = formatTime(event.time);

          const name =
            document.createElement("div");

          name.className = "eagle-event-name";

          name.textContent = event.programme;

          const details =
            document.createElement("div");

          details.className = "eagle-event-details";

          details.textContent =
            getSessionLabel(event) +
            (event.pax !== ""
              ? " · " + event.pax + " pax"
              : "");

          eventCard.append(
            time,
            name,
            details
          );

          eventCard.addEventListener("click", () => {
            openEventModal(event);
          });

          programmeCell.appendChild(eventCard);
        });
      }

      programmeRow.appendChild(programmeCell);

      // -----------------------------------------
      // OFF / LEAVE CELL
      // -----------------------------------------

      const leaveCell =
        document.createElement("div");

      leaveCell.className = "eagle-leave-cell";

      if (isCurrentMonth) {

        const record = getManpower(
          currentVenue,
          dateString
        );

        const notes =
          document.createElement("div");

        notes.className = "eagle-leave-notes";

        notes.textContent = record.leaveEntries?.length
          ? record.leaveEntries.map(entry => entry.staff + " (" + entry.reason + ")").join(", ")
          : (record.leaveNotes || "—");

        leaveCell.appendChild(notes);

        leaveCell.addEventListener("click", () => {
          openManpowerModal(
            currentVenue,
            dateString
          );
        });
      }

      leaveRow.appendChild(leaveCell);
    }

    weekBlock.append(
      programmeRow,
      leaveRow
    );

    grid.appendChild(weekBlock);
  }
}

/* =========================================================
20. PROGRAMME CARD
========================================================= */

function createEventElement(event) {
const element = document.createElement("div");

element.className = "event";

const endTime = addMinutesToTime(
event.time,
event.duration
);

element.innerHTML = `
<div class="event-time">
${escapeHtml(formatTime(event.time))}
-
${escapeHtml(formatTime(endTime))}
</div>

<div class="event-name">
  ${escapeHtml(event.programme)}
</div>

<div class="event-meta">
  ${escapeHtml(getSessionLabel(event))}
  ${
    event.pax !== ""
      ? " · " + escapeHtml(event.pax) + " pax"
      : ""
  }
</div>
`;

element.addEventListener("click", e => {
e.stopPropagation();
openEventModal(event);
});

return element;
}

/* =========================================================
21. MANPOWER DISPLAY
========================================================= */

function createManpowerSection(venue, date) {
const record = getManpower(venue, date);

const container = document.createElement("div");
container.className = "manpower-container";

if (record.staff.length > 0) {
const heading = document.createElement("div");

heading.className = "calendar-staff-heading";
heading.textContent = "Staff on duty";

container.appendChild(heading);

const list = document.createElement("div");
list.className = "calendar-staff-list";

record.staff.forEach(name => {
  const staff = document.createElement("div");

  staff.className = "calendar-staff-name";
  staff.textContent = name;

  list.appendChild(staff);
});

container.appendChild(list);
}

if (record.leaveEntries?.length) {
const leaveHeading = document.createElement("div");
leaveHeading.className = "calendar-staff-heading";
leaveHeading.textContent = "Off / Leave";
container.appendChild(leaveHeading);

const leaveList = document.createElement("div");
leaveList.className = "calendar-staff-list";
record.leaveEntries.forEach(entry => {
  const leave = document.createElement("div");
  leave.className = "calendar-staff-name";
  leave.textContent = entry.staff + " — " + entry.reason;
  leaveList.appendChild(leave);
});
container.appendChild(leaveList);
}

const button = document.createElement("button");

button.type = "button";
button.className = "manpower-button";

const present = record.staff.length;

button.textContent = present
? "👥 " +
present +
" staff / " +
REQUIRED_MANPOWER +
" req."
: "👥 Set manpower";

if (present > 0) {
button.classList.add(
present >= REQUIRED_MANPOWER
? "good"
: "warning"
);
}

button.addEventListener("click", e => {
e.stopPropagation();
openManpowerModal(venue, date);
});

container.appendChild(button);

return container;
}
