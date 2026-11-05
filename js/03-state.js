/* =========================================================
5. CALENDAR DATE MEMORY
========================================================= */

let currentDate = new Date();

try {
const savedDate = localStorage.getItem(
"selectedCalendarDate"
);

if (savedDate) {
const parsed = parseInputDate(savedDate);

if (!isNaN(parsed.getTime())) {
  currentDate = parsed;
}
}
} catch (error) {
console.warn("Unable to restore calendar date:", error);
}

function saveCalendarDate() {
try {
localStorage.setItem(
"selectedCalendarDate",
formatInputDate(currentDate)
);
} catch (error) {
console.warn("Unable to save calendar date:", error);
}
}

/* =========================================================
6. ADD PROGRAMME DATE MEMORY
========================================================= */

const START_DATE_STORAGE_KEY =
"activeHealthSelectedStartDate";

function getPlanningDate() {
const today = new Date();

if (
currentDate.getFullYear() === today.getFullYear() &&
currentDate.getMonth() === today.getMonth()
) {
return formatInputDate(today);
}

return formatInputDate(
new Date(
currentDate.getFullYear(),
currentDate.getMonth(),
1
)
);
}

function getSavedStartDate() {
try {
const saved = localStorage.getItem(
START_DATE_STORAGE_KEY
);

if (
  saved &&
  !isNaN(parseInputDate(saved).getTime())
) {
  return saved;
}
} catch (error) {
console.warn("Unable to restore start date:", error);
}

return getPlanningDate();
}

function saveSelectedStartDate() {
const date = valueOf("startDate");

if (
!date ||
isNaN(parseInputDate(date).getTime())
) {
return;
}

try {
localStorage.setItem(
START_DATE_STORAGE_KEY,
date
);
} catch (error) {
console.warn("Unable to save start date:", error);
}
}

function initialiseStartDate() {
setValue("startDate", getSavedStartDate());

on("startDate", "change", saveSelectedStartDate);
}

/* =========================================================
7. APPLICATION STATE
========================================================= */

let events = [];
let manpower = {};

let currentVenue = "HBB";
let activeCalendarView = "eagle";

let selectedEventId = null;

let manpowerDate = null;
let manpowerVenue = null;

let showingSummary = false;
let summaryDate = new Date(currentDate);

let programmesLoaded = false;
let manpowerLoaded = false;

// Temporary Off / Leave entries while the manpower modal is open.
let draftLeaveEntries = [];
