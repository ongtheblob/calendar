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

if (showingSummary) {
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
showingSummary = true;

toggleHidden("calendarArea", true);
toggleHidden("summaryPanel", false);

updateSheetTabs();

renderProgrammeSummary();
}

function renderCurrentScreen() {
if (showingSummary) {
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
showingSummary
);
}
