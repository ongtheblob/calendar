/* =========================================================
32. VENUE NAVIGATION
========================================================= */

function updateVenueUI() {
setValue("venue", currentVenue);

setText(
"currentVenueLabel",
currentVenue
);

updateSheetTabs();
}

function switchVenue(venue) {
currentVenue = venue;

updateVenueUI();

showCalendarView();
}

/* =========================================================
33. CALENDAR VIEW NAVIGATION
========================================================= */

function changeCalendarView() {
activeCalendarView = valueOf(
"calendarView",
"eagle"
);

showCalendarView();
}

function goPrevious() {
if (showingLabDeployment) {
labDeploymentMonth = new Date(labDeploymentMonth.getFullYear(), labDeploymentMonth.getMonth() - 1, 1);
loadLabDeploymentMonth();
return;
}
if (showingSummary) {
summaryPreviousMonthHandler();
return;
}

if (activeCalendarView === "day") {
currentDate = addDays(currentDate, -1);

} else if (activeCalendarView === "week") {
currentDate = addDays(currentDate, -7);

} else {
currentDate = new Date(
currentDate.getFullYear(),
currentDate.getMonth() - 1,
1
);
}

renderCalendar();

// Do not change the Add Programme Start Date.
}

function goNext() {
if (showingLabDeployment) {
labDeploymentMonth = new Date(labDeploymentMonth.getFullYear(), labDeploymentMonth.getMonth() + 1, 1);
loadLabDeploymentMonth();
return;
}
if (showingSummary) {
summaryNextMonthHandler();
return;
}

if (activeCalendarView === "day") {
currentDate = addDays(currentDate, 1);

} else if (activeCalendarView === "week") {
currentDate = addDays(currentDate, 7);

} else {
currentDate = new Date(
currentDate.getFullYear(),
currentDate.getMonth() + 1,
1
);
}

renderCalendar();

// Do not change the Add Programme Start Date.
}

function goToday() {
currentDate = new Date();

if (showingLabDeployment) {
labDeploymentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
loadLabDeploymentMonth();
} else if (showingSummary) {
summaryDate = new Date(
currentDate.getFullYear(),
currentDate.getMonth(),
1
);

renderProgrammeSummary();
} else {
renderCalendar();
}

saveCalendarDate();

// Do not reset the Add Programme Start Date.
}

/* =========================================================
34. SCREEN VISIBILITY
========================================================= */

function showCalendarView() {
if (typeof showingLabDeployment !== "undefined") hideLabDeploymentView();
showingSummary = false;

toggleHidden("summaryPanel", true);
toggleHidden("calendarArea", false);
toggleHidden("calendarGrid", false);

const header =
$("weekHeader") ||
document.querySelector(".week-header");

header?.classList.remove("hidden");

updateSheetTabs();

renderCalendar();
}

function showSummaryView() {
if (typeof showingLabDeployment !== "undefined") hideLabDeploymentView();
showingSummary = true;

toggleHidden("calendarArea", true);
toggleHidden("summaryPanel", false);

updateSheetTabs();

renderProgrammeSummary();
}

function renderCurrentScreen() {
if (showingLabDeployment) {
renderLabDeploymentOverview();
} else if (showingSummary) {
renderProgrammeSummary();
} else {
renderCalendar();
}
}

function updateSheetTabs() {
$("hbbSheetTab")?.classList.toggle(
"active",
currentVenue === "HBB" && !showingSummary
);

$("othSheetTab")?.classList.toggle(
"active",
currentVenue === "OTH" && !showingSummary
);

$("summarySheetTab")?.classList.toggle(
"active",
showingSummary && !showingLabDeployment
);

$("labDeploymentSheetTab")?.classList.toggle(
"active",
showingLabDeployment
);
}



==========================================================================================
FILE: js/12-event-listeners.js
==========================================================================================

/* =========================================================
40. BUTTON LISTENERS
========================================================= */

function setupButtons() {
// Add Programme
on("addButton", "click", function(event) {
event.preventDefault();
addProgramme();
});

// Edit Programme
on("editButton", "click", openEditModal);

on("saveEditButton", "click", function(event) {
event.preventDefault();
saveEdit();
});

on(
"cancelEditButton",
"click",
closeEditModal
);

// Delete Programme
on("deleteButton", "click", deleteSelected);

on("closeButton", "click", closeEventModal);

// Manpower
on("saveManpower", "click", function(event) {
event.preventDefault();
saveManpower();
});

on(
"closeManpower",
"click",
closeManpowerModal
);

on("selectAllStaff", "click", () => {
document.querySelectorAll(
'#staffList input[type="checkbox"]'
).forEach(input => {
input.checked = true;
});

updateStaffCount();
updateStaffStatus();
});

on("clearAllStaff", "click", () => {
document.querySelectorAll(
'#staffList input[type="checkbox"]'
).forEach(input => {
input.checked = false;
});

updateStaffCount();
updateStaffStatus();
});

const addLeaveButton = $("addLeaveEntry");

if (addLeaveButton) {
    addLeaveButton.addEventListener("click", function(event) {
        event.preventDefault();

        console.log("ADD BUTTON EVENT FIRED");

        addLeaveEntry();
    });
}
on("clearLeaveButton", "click", clearLeaveDraft);
on("clearManpowerDay", "click", clearEntireManpowerDay);

// Calendar navigation
on("previousButton", "click", goPrevious);
on("nextButton", "click", goNext);
on("todayButton", "click", goToday);

on(
"calendarView",
"change",
changeCalendarView
);

// Venue tabs
on("hbbSheetTab", "click", () => {
switchVenue("HBB");
});

on("othSheetTab", "click", () => {
switchVenue("OTH");
});

// Monthly summary
on("summarySheetTab", "click", () => {
summaryDate = new Date(
currentDate.getFullYear(),
currentDate.getMonth(),
1
);

showSummaryView();
});

// Lab Deployment Overview tab
on("labDeploymentSheetTab", "click", showLabDeploymentView);

on(
"summaryPreviousMonth",
"click",
summaryPreviousMonthHandler
);

on(
"summaryNextMonth",
"click",
summaryNextMonthHandler
);

// CSV exports
on(
"exportCurrentMonthButton",
"click",
exportCurrentMonthCSV
);

on(
"exportBothVenuesButton",
"click",
exportBothVenuesCSV
);

// Clear All disabled
on(
"clearButton",
"click",
clearAllData
);
}


