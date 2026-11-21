
/* =========================================================
   14. LAB DEPLOYMENT OVERVIEW
   Connected to the existing Manpower Staffing records.

   Deployment data:
   - Supabase table: lab_deployment_overview

   Manpower data:
   - Supabase table: manpower
   - Supabase table: manpower_leave_entries

   OTH and HBB show manpower information.
   HQ remains deployment-only.
========================================================= */

const LAB_DEPLOYMENT_TABLE = "lab_deployment_overview";

const LAB_DEPLOYMENT_ROWS = [
    "OTH",
    "HBB",
    "HQ"
];

const LAB_DEPLOYMENT_STORAGE_PREFIX = "labDeployment__";

const labDeploymentCache = {};
const labDeploymentLoadedMonths = new Set();

let labDeploymentRenderToken = 0;
let labDeploymentManpowerLoadPromise = null;


/* =========================================================
   1. MONTH AND DATE HELPERS
========================================================= */

function labMonthKey(date = currentDate) {
    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-01"
    );
}


function labDateKey(date) {
    return formatInputDate(date);
}


function emptyLabMonthData() {
    return {
        days: {},
        pddEnabled: true,
        fridayOccurrence: "1"
    };
}


function labDataForMonth(monthKey) {
    if (!labDeploymentCache[monthKey]) {
        labDeploymentCache[monthKey] =
            emptyLabMonthData();
    }

    return labDeploymentCache[monthKey];
}


function labDayData(monthKey, dateKey) {
    const monthData = labDataForMonth(monthKey);

    if (!monthData.days[dateKey]) {
        monthData.days[dateKey] = {
            OTH: "",
            HBB: "",
            HQ: "",
            remarks: ""
        };
    }

    return monthData.days[dateKey];
}


/* =========================================================
   2. PDD DATE
========================================================= */

function getPddFridayDate(
    year,
    monthIndex,
    occurrence
) {
    const fridays = [];

    const lastDay = new Date(
        year,
        monthIndex + 1,
        0
    ).getDate();

    for (
        let day = 1;
        day <= lastDay;
        day++
    ) {
        const date = new Date(
            year,
            monthIndex,
            day
        );

        if (date.getDay() === 5) {
            fridays.push(date);
        }
    }

    if (occurrence === "last") {
        return fridays[fridays.length - 1] || null;
    }

    return fridays[
        Number(occurrence) - 1
    ] || null;
}


function labPddDateForMonth(
    monthKey,
    monthData
) {
    const [year, month] =
        monthKey.split("-").map(Number);

    if (monthData.pddDate) {
        const [y, m, d] =
            monthData.pddDate.split("-").map(Number);

        const selected = new Date(
            y,
            m - 1,
            d
        );

        if (
            !Number.isNaN(selected.getTime()) &&
            selected.getFullYear() === year &&
            selected.getMonth() === month - 1
        ) {
            return selected;
        }
    }

    // Backward-compatible default:
    // first Friday of the month.
    return getPddFridayDate(
        year,
        month - 1,
        monthData.fridayOccurrence || "1"
    );
}


/* =========================================================
   3. INITIALISE
========================================================= */

function setupLabDeploymentOverview() {
    const monthKey = labMonthKey();

    try {
        const saved = localStorage.getItem(
            LAB_DEPLOYMENT_STORAGE_PREFIX +
            monthKey
        );

        if (saved) {
            labDeploymentCache[monthKey] =
                JSON.parse(saved);
        }
    } catch (error) {
        console.warn(
            "Unable to restore Lab Deployment draft:",
            error
        );
    }
}


/* =========================================================
   4. MONTH NAVIGATION
========================================================= */

function labDeploymentPreviousMonth() {
    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    );

    saveCalendarDate();

    renderLabDeploymentOverview();
}


function labDeploymentNextMonth() {
    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
    );

    saveCalendarDate();

    renderLabDeploymentOverview();
}


/* =========================================================
   5. LOAD DEPLOYMENT DATA
========================================================= */

async function loadLabDeploymentMonth(
    monthKey = labMonthKey()
) {
    if (
        labDeploymentLoadedMonths.has(monthKey)
    ) {
        return true;
    }

    // Restore local data first.
    try {
        const saved = localStorage.getItem(
            LAB_DEPLOYMENT_STORAGE_PREFIX +
            monthKey
        );

        if (saved) {
            labDeploymentCache[monthKey] =
                JSON.parse(saved);
        }
    } catch (error) {
        console.warn(
            "Unable to read local Lab Deployment data:",
            error
        );
    }

    if (!supabaseClient) {
        labDeploymentLoadedMonths.add(monthKey);
        return false;
    }

    const { data, error } =
        await supabaseClient
            .from(LAB_DEPLOYMENT_TABLE)
            .select("month_key,deployment_data")
            .eq("month_key", monthKey)
            .maybeSingle();

    if (error) {
        console.warn(
            "Unable to load Lab Deployment data:",
            error.message
        );

        labDeploymentLoadedMonths.add(monthKey);
        return false;
    }

    if (
        data?.deployment_data &&
        typeof data.deployment_data === "object"
    ) {
        labDeploymentCache[monthKey] =
            data.deployment_data;
    } else if (
        !labDeploymentCache[monthKey]
    ) {
        labDeploymentCache[monthKey] =
            emptyLabMonthData();
    }

    labDeploymentLoadedMonths.add(monthKey);

    return true;
}


/* =========================================================
   6. SAVE DEPLOYMENT DATA
========================================================= */

async function saveLabDeploymentMonth(
    monthKey,
    showStatus = true
) {
    const monthData =
        labDataForMonth(monthKey);

    // Save a local backup.
    try {
        localStorage.setItem(
            LAB_DEPLOYMENT_STORAGE_PREFIX +
            monthKey,
            JSON.stringify(monthData)
        );
    } catch (error) {
        console.warn(
            "Unable to save local Lab Deployment copy:",
            error
        );
    }

    if (!supabaseClient) {
        if (showStatus) {
            setLabDeploymentStatus(
                "Saved on this device only."
            );
        }

        return false;
    }

    const { error } =
        await supabaseClient
            .from(LAB_DEPLOYMENT_TABLE)
            .upsert(
                {
                    month_key: monthKey,
                    deployment_data: monthData,
                    updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict: "month_key"
                }
            );

    if (error) {
        console.error(
            "Unable to save Lab Deployment month:",
            error
        );

        if (showStatus) {
            setLabDeploymentStatus(
                "Local draft saved. Supabase save failed."
            );
        }

        return false;
    }

    if (showStatus) {
        setLabDeploymentStatus("Saved");
    }

    return true;
}


/* =========================================================
   7. SAVE STATUS
========================================================= */

function setLabDeploymentStatus(message) {
    const status =
        $("labDeploymentSaveStatus");

    if (!status) return;

    status.textContent = message;

    status.classList.toggle(
        "error",
        /unable|draft|failed|only/i.test(message)
    );
}


/* =========================================================
   8. DEPLOYMENT TEXT INPUT
========================================================= */

function labTextArea(
    monthKey,
    dateKey,
    rowKey,
    value,
    isBlocked
) {
    const area =
        document.createElement("textarea");

    area.className =
        "lab-cell-input lab-cell-" +
        rowKey.toLowerCase();

    area.setAttribute(
        "aria-label",
        rowKey + " deployment on " + dateKey
    );

    area.value = value || "";

    area.placeholder =
        rowKey === "remarks"
            ? "Add remarks…"
            : "Deployment…";

    area.disabled =
        isBlocked && rowKey !== "remarks";

    area.addEventListener("input", () => {
        labDayData(
            monthKey,
            dateKey
        )[rowKey] = area.value;

        setLabDeploymentStatus(
            "Unsaved changes…"
        );
    });

    area.addEventListener("blur", () => {
        saveLabDeploymentMonth(monthKey);
    });

    return area;
}


/* =========================================================
   9. MANPOWER SUMMARY FOR DEPLOYMENT DATE

   Uses the same local manpower object populated by
   loadManpowerFromSupabase() in 04-database.js.

   Does not create duplicate manpower records.
========================================================= */

function getLabManpowerSummary(
    venue,
    dateKey
) {
    if (
        typeof manpowerKey !== "function" ||
        typeof getManpower !== "function"
    ) {
        return {
            present: [],
            leave: [],
            required: 2,
            status: "Manpower data unavailable"
        };
    }

    const record =
        getManpower(venue, dateKey) || {};

    const present =
        Array.isArray(record.staff)
            ? record.staff
            : [];

    const leave =
        Array.isArray(record.leaveEntries)
            ? record.leaveEntries
            : [];

    const required =
        Number(record.required) || 2;

    let status = "";

    if (present.length >= required) {
        status =
            "Adequately staffed (" +
            present.length +
            "/" +
            required +
            ")";
    } else {
        status =
            "Understaffed (" +
            present.length +
            "/" +
            required +
            ")";
    }

    return {
        present,
        leave,
        required,
        status
    };
}


/* =========================================================
   10. DISPLAY MANPOWER IN DEPLOYMENT CELL
========================================================= */

function renderLabManpowerSummary(
    venue,
    dateKey
) {
    const summary =
        getLabManpowerSummary(
            venue,
            dateKey
        );

    const container =
        document.createElement("div");

    container.className =
        "lab-manpower-summary";

    container.style.marginTop = "7px";
    container.style.padding = "7px 9px";
    container.style.borderRadius = "7px";
    container.style.background = "#f5f8fc";
    container.style.border = "1px solid #e1e8f0";
    container.style.fontSize = "12px";
    container.style.lineHeight = "1.5";
    container.style.color = "#334155";

    const status =
        document.createElement("div");

    status.className =
        "lab-manpower-status";

    status.textContent =
        summary.status;

    status.style.fontWeight = "700";

    if (
        summary.present.length >=
        summary.required
    ) {
        status.style.color = "#15803d";
    } else {
        status.style.color = "#b45309";
    }

    container.appendChild(status);

    const presentLine =
        document.createElement("div");

    presentLine.textContent =
        "Present: " +
        (
            summary.present.length
                ? summary.present.join(", ")
                : "Not assigned"
        );

    presentLine.style.marginTop = "3px";

    container.appendChild(presentLine);

    const leaveLine =
        document.createElement("div");

    leaveLine.textContent =
        "Off / Leave: " +
        (
            summary.leave.length
                ? summary.leave
                    .map(entry => {
                        const name =
                            entry.staff ||
                            entry.name ||
                            "Unknown";

                        const reason =
                            entry.reason || "Off Day";

                        return name + " (" + reason + ")";
                    })
                    .join(", ")
                : "None recorded"
        );

    leaveLine.style.marginTop = "3px";

    container.appendChild(leaveLine);

    return container;
}


/* =========================================================
   11. RENDER LAB DEPLOYMENT OVERVIEW
========================================================= */

function renderLabDeploymentOverview() {
    const grid =
        $("labDeploymentGrid");

    if (!grid) return;

    const token =
        ++labDeploymentRenderToken;

    const monthKey =
        labMonthKey();

    const monthData =
        labDataForMonth(monthKey);

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();

    setText(
        "labDeploymentMonth",
        currentDate.toLocaleDateString(
            "en-SG",
            {
                month: "long",
                year: "numeric"
            }
        )
    );

    if ($("labPddEnabled")) {
        $("labPddEnabled").checked =
            monthData.pddEnabled !== false;
    }

    const pddDate =
        labPddDateForMonth(
            monthKey,
            monthData
        );

    setValue(
        "labPddDate",
        pddDate
            ? labDateKey(pddDate)
            : ""
    );

    setText(
        "labPddDateLabel",
        pddDate
            ? "PDD meeting: " +
              pddDate.toLocaleDateString(
                  "en-SG",
                  {
                      weekday: "short",
                      day: "numeric",
                      month: "short"
                  }
              )
            : "Select a PDD date for this month"
    );

    const table =
        document.createElement("table");

    table.className =
        "lab-deployment-table";

    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Day</th>
                <th>OTH Deployment</th>
                <th>HBB Deployment</th>
                <th>HQ Deployment</th>
                <th>Remarks</th>
            </tr>
        </thead>
    `;

    const tbody =
        document.createElement("tbody");

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    for (
        let dayNumber = 1;
        dayNumber <= daysInMonth;
        dayNumber++
    ) {
        const date =
            new Date(
                year,
                month,
                dayNumber
            );

        const dateKey =
            labDateKey(date);

        const dayData =
            labDayData(
                monthKey,
                dateKey
            );

        const isPdd =
            monthData.pddEnabled !== false &&
            pddDate &&
            labDateKey(pddDate) === dateKey;

        const tr =
            document.createElement("tr");

        if (isPdd) {
            tr.classList.add(
                "lab-table-pdd-row"
            );
        }

        const dateCell =
            document.createElement("td");

        dateCell.className =
            "lab-table-date";

        dateCell.textContent =
            dayNumber +
            " " +
            date.toLocaleDateString(
                "en-SG",
                { month: "short" }
            );

        const dayCell =
            document.createElement("td");

        dayCell.textContent =
            date.toLocaleDateString(
                "en-SG",
                { weekday: "short" }
            );

        tr.append(
            dateCell,
            dayCell
        );

        LAB_DEPLOYMENT_ROWS.forEach(
            rowKey => {
                const td =
                    document.createElement("td");

                const cell =
                    document.createElement("div");

                cell.className =
                    "lab-table-entry";

                const input =
                    labTextArea(
                        monthKey,
                        dateKey,
                        rowKey,
                        dayData[rowKey],
                        isPdd
                    );

                input.rows = 1;

                input.placeholder =
                    isPdd
                        ? "PDD meeting — blocked"
                        : "Enter deployment…";

                cell.appendChild(input);

                // Connect OTH and HBB deployment
                // entries to their manpower data.
                if (
                    rowKey === "OTH" ||
                    rowKey === "HBB"
                ) {
                    cell.appendChild(
                        renderLabManpowerSummary(
                            rowKey,
                            dateKey
                        )
                    );

                    const jump =
                        document.createElement("button");

                    jump.type = "button";

                    jump.className =
                        "lab-calendar-jump";

                    jump.title =
                        "Open " +
                        rowKey +
                        " calendar and manpower on " +
                        dateKey;

                    jump.setAttribute(
                        "aria-label",
                        "Open " +
                        rowKey +
                        " manpower on " +
                        dateKey
                    );

                    jump.textContent = "↗";

                    jump.addEventListener(
                        "click",
                        () => {
                            navigateToDeploymentCalendar(
                                rowKey,
                                dateKey
                            );
                        }
                    );

                    cell.appendChild(jump);
                }

                td.appendChild(cell);
                tr.appendChild(td);
            }
        );

        const remarksCell =
            document.createElement("td");

        remarksCell.appendChild(
            labTextArea(
                monthKey,
                dateKey,
                "remarks",
                dayData.remarks,
                false
            )
        );

        tr.appendChild(remarksCell);
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    grid.replaceChildren(table);

    // Load deployment data from Supabase.
    if (
        !labDeploymentLoadedMonths.has(monthKey)
    ) {
        loadLabDeploymentMonth(monthKey)
            .then(() => {
                if (
                    token === labDeploymentRenderToken &&
                    showingLabDeployment
                ) {
                    renderLabDeploymentOverview();
                }
            });
    }

    // Manpower is loaded by 13-app.js during
    // application startup. If it is not ready yet,
    // load it once and refresh the deployment sheet.
    if (
        typeof manpowerLoaded !== "undefined" &&
        !manpowerLoaded &&
        supabaseClient &&
        !labDeploymentManpowerLoadPromise
    ) {
        labDeploymentManpowerLoadPromise =
            loadManpowerFromSupabase()
                .then(() => {
                    if (
                        token === labDeploymentRenderToken &&
                        showingLabDeployment
                    ) {
                        renderLabDeploymentOverview();
                    }
                })
                .catch(error => {
                    console.error(
                        "Unable to load manpower for Lab Deployment:",
                        error
                    );
                })
                .finally(() => {
                    labDeploymentManpowerLoadPromise =
                        null;
                });
    }
}


/* =========================================================
   12. OPEN THE MATCHING CALENDAR AND MANPOWER MODAL

   Clicking the arrow beside OTH or HBB:
   1. Selects the venue.
   2. Selects the deployment date.
   3. Switches to Day view.
   4. Opens Manpower Staffing for that date.
========================================================= */

async function navigateToDeploymentCalendar(
    venue,
    dateKey
) {
    const [year, month, day] =
        dateKey.split("-").map(Number);

    const selectedDate =
        new Date(
            year,
            month - 1,
            day
        );

    if (
        Number.isNaN(selectedDate.getTime())
    ) {
        return;
    }

    currentDate = selectedDate;
    currentVenue = venue;

    activeCalendarView = "day";

    setValue(
        "calendarView",
        "day"
    );

    saveCalendarDate();

    updateVenueUI();

    // Switch back to the normal calendar.
    showCalendarView();

    // Ensure the latest manpower data is available.
    if (
        typeof manpowerLoaded !== "undefined" &&
        !manpowerLoaded &&
        supabaseClient
    ) {
        await loadManpowerFromSupabase();
    }

    // Open the matching Present Manpower window.
    if (
        typeof openManpowerModal === "function"
    ) {
        openManpowerModal(
            venue,
            dateKey
        );
    } else {
        console.error(
            "openManpowerModal() is not available. " +
            "Check that 07-manpower.js loads before 14-lab-deployment.js."
        );
    }
}


/* =========================================================
   13. SAVE PDD SETTINGS
========================================================= */

async function saveLabPddSettings() {
    const monthKey =
        labMonthKey();

    const data =
        labDataForMonth(monthKey);

    data.pddEnabled =
        $("labPddEnabled")?.checked ?? true;

    data.pddDate =
        valueOf("labPddDate", "");

    renderLabDeploymentOverview();

    await saveLabDeploymentMonth(
        monthKey
    );
}


/* =========================================================
   14. SETUP FUNCTION
========================================================= */

function setupLabDeployment() {
    setupLabDeploymentOverview();

    // PDD toggle.
    const pddToggle =
        $("labPddEnabled");

    if (pddToggle) {
        pddToggle.addEventListener(
            "change",
            saveLabPddSettings
        );
    }

    // PDD date selector.
    const pddDateInput =
        $("labPddDate");

    if (pddDateInput) {
        pddDateInput.addEventListener(
            "change",
            saveLabPddSettings
        );
    }

    // Month navigation.
    const previousButton =
        $("labPreviousMonth");

    if (previousButton) {
        previousButton.addEventListener(
            "click",
            labDeploymentPreviousMonth
        );
    }

    const nextButton =
        $("labNextMonth");

    if (nextButton) {
        nextButton.addEventListener(
            "click",
            labDeploymentNextMonth
        );
    }
}
