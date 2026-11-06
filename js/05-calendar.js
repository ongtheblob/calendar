
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
        // Month View uses the former Eagle View layout.
        activeCalendarView = "eagle";
        setValue("calendarView", "eagle");
        renderEagleView();
    }
}


/* =========================================================
15. STANDARD MONTH VIEW
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

    // Show manpower and Off / Leave above programmes.
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
19.5 MONTH VIEW - FORMER EAGLE VIEW

Programme row:
- Staff button only.

Green Off / Leave row:
- Staff names.
- Leave reasons.
- Separate Off / Leave button.
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

    const mondayOffset =
        (firstDay.getDay() + 6) % 7;

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

        /* PROGRAMME ROW */

        const programmeRow = document.createElement("div");
        programmeRow.className = "eagle-programme-row";

        const programmeLabel = document.createElement("div");
        programmeLabel.className = "eagle-row-label";
        programmeLabel.textContent = "PROGRAMMES";

        programmeRow.appendChild(programmeLabel);

        /* OFF / LEAVE ROW */

        const leaveRow = document.createElement("div");
        leaveRow.className = "eagle-leave-row";

        const leaveLabel = document.createElement("div");
        leaveLabel.className = "eagle-row-label";
        leaveLabel.textContent = "OFF / LEAVE";

        leaveRow.appendChild(leaveLabel);

        /* MONDAY TO SUNDAY */

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

            /* -------------------------------------
               PROGRAMME CELL
            ------------------------------------- */

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
                const record = getManpower(
                    currentVenue,
                    dateString
                );

                // Present staff names, if assigned.
                if (record.staff.length > 0) {
                    const staffList =
                        document.createElement("div");

                    staffList.className = "eagle-staff-list";
                    staffList.textContent =
                        record.staff.join(", ");

                    programmeCell.appendChild(staffList);
                }

                // Present staff button only.
                const manpowerButton =
                    document.createElement("button");

                manpowerButton.type = "button";
                manpowerButton.className =
                    "eagle-manpower-button";

                manpowerButton.textContent =
                    record.staff.length > 0
                        ? "Edit staff"
                        : "+ Staff";

                manpowerButton.addEventListener("click", event => {
                    event.stopPropagation();

                    openManpowerModal(
                        currentVenue,
                        dateString
                    );
                });

                programmeCell.appendChild(manpowerButton);

                // Programme cards.
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


            /* -------------------------------------
               GREEN OFF / LEAVE CELL
            ------------------------------------- */

            const leaveCell =
                document.createElement("div");

            leaveCell.className = "eagle-leave-cell";

            if (isCurrentMonth) {
                const record = getManpower(
                    currentVenue,
                    dateString
                );

                const leaveList =
                    document.createElement("div");

                leaveList.className = "eagle-leave-notes";

                leaveList.style.display = "flex";
                leaveList.style.flexDirection = "column";
                leaveList.style.alignItems = "flex-start";
                leaveList.style.gap = "6px";
                leaveList.style.padding = "8px 10px";

                // Normalise leave entries for display.
                const visibleLeaveEntries =
                    normaliseLeaveEntries(
                        record.leaveEntries,
                        currentVenue,
                        dateString
                    );

                if (visibleLeaveEntries.length > 0) {
                    visibleLeaveEntries.forEach(entry => {
                        const leaveEntry =
                            document.createElement("div");

                        leaveEntry.className = "eagle-leave-entry";

                        leaveEntry.style.display = "flex";
                        leaveEntry.style.alignItems = "flex-start";
                        leaveEntry.style.gap = "8px";
                        leaveEntry.style.lineHeight = "1.35";
                        leaveEntry.style.fontSize = "14px";

                        const personIcon =
                            document.createElement("span");

                        personIcon.className =
                            "eagle-leave-person-icon";

                        personIcon.textContent = "👤";
                        personIcon.setAttribute(
                            "aria-hidden",
                            "true"
                        );

                        const details =
                            document.createElement("span");

                        details.className =
                            "eagle-leave-details";

                        const staffName =
                            document.createElement("strong");

                        staffName.className =
                            "eagle-leave-staff-name";

                        staffName.textContent = entry.staff;

                        const reason =
                            document.createElement("span");

                        reason.className =
                            "eagle-leave-reason";

                        reason.textContent =
                            " — " + entry.reason;

                        details.append(
                            staffName,
                            reason
                        );

                        leaveEntry.append(
                            personIcon,
                            details
                        );

                        leaveList.appendChild(leaveEntry);
                    });
                } else {
                    leaveList.textContent =
                        record.leaveNotes || "—";

                    leaveList.style.paddingTop = "10px";
                }

                leaveCell.appendChild(leaveList);

                // Off / Leave button appears ONLY in green row.
                const leaveButton =
                    document.createElement("button");

                leaveButton.type = "button";

                leaveButton.className =
                    "eagle-manpower-button eagle-leave-button";

                leaveButton.textContent =
                    visibleLeaveEntries.length > 0
                        ? "Edit Off / Leave"
                        : "+ Off / Leave";

                leaveButton.addEventListener("click", event => {
                    event.stopPropagation();

                    openLeaveModal(
                        currentVenue,
                        dateString
                    );
                });

                leaveCell.appendChild(leaveButton);

                // Clicking the green cell also opens Off / Leave.
                leaveCell.addEventListener("click", () => {
                    openLeaveModal(
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

    element.addEventListener("click", eventObject => {
        eventObject.stopPropagation();
        openEventModal(event);
    });

    return element;
}


/* =========================================================
21. MANPOWER DISPLAY - MONTH / WEEK / DAY

Displays:
- Who is present at the lab
- Off / Leave staff and reasons
- Separate Manpower and Off / Leave buttons
========================================================= */

function createManpowerSection(venue, date) {
    const record = getManpower(venue, date);

    const container = document.createElement("div");
    container.className = "manpower-container";

    const presentStaff = Array.isArray(record.staff)
        ? record.staff
        : [];

    const leaveEntries = normaliseLeaveEntries(
        record.leaveEntries,
        venue,
        date
    );

const leaveNotes = String(
    record.leaveNotes || ""
).trim();

    /* PRESENT STAFF */

    const heading = document.createElement("div");

    heading.className = "calendar-staff-heading";
    heading.textContent = "Who is present at the lab";

    container.appendChild(heading);

    const presentList = document.createElement("div");
    presentList.className = "calendar-staff-list";

    if (presentStaff.length > 0) {
        presentStaff.forEach(name => {
            const staff = document.createElement("div");

            staff.className = "calendar-staff-name";
            staff.textContent = name;

            presentList.appendChild(staff);
        });
    } else {
        const empty = document.createElement("div");

        empty.className = "calendar-staff-name";
        empty.textContent = "No staff recorded";

        presentList.appendChild(empty);
    }

    container.appendChild(presentList);


  /* OFF / LEAVE STAFF */

const leaveHeading = document.createElement("div");

leaveHeading.className = "calendar-staff-heading";
leaveHeading.textContent = "Off / Leave";

container.appendChild(leaveHeading);

const leaveList = document.createElement("div");
leaveList.className = "calendar-staff-list";

if (leaveEntries.length > 0) {

    leaveEntries.forEach(entry => {
        const leave = document.createElement("div");

        leave.className = "calendar-staff-name";
        leave.textContent =
            entry.staff + " — " + entry.reason;

        leaveList.appendChild(leave);
    });

} else if (leaveNotes) {

    const leave = document.createElement("div");

    leave.className = "calendar-staff-name";
    leave.textContent = leaveNotes;

    leaveList.appendChild(leave);

} else {

    const empty = document.createElement("div");

    empty.className = "calendar-staff-name";
    empty.textContent = "No Off / Leave recorded";

    leaveList.appendChild(empty);
}

container.appendChild(leaveList);

    /* MANPOWER BUTTON */

    const button = document.createElement("button");

    button.type = "button";
    button.className = "manpower-button";

    const present = presentStaff.length;

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

    button.addEventListener("click", event => {
        event.stopPropagation();

        openManpowerModal(venue, date);
    });

    container.appendChild(button);


    /* OFF / LEAVE BUTTON */

    const leaveButton = document.createElement("button");

    leaveButton.type = "button";
    leaveButton.className =
        "manpower-button leave-button";

    leaveButton.textContent =
    leaveEntries.length > 0 || leaveNotes
        ? "🌿 Edit Off / Leave"
        : "🌿 Set Off / Leave";

    leaveButton.addEventListener("click", event => {
        event.stopPropagation();

        openLeaveModal(venue, date);
    });

    container.appendChild(leaveButton);

    return container;
}
