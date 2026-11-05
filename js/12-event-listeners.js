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



