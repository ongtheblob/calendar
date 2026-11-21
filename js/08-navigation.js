
/* =========================================================
32. VENUE NAVIGATION
========================================================= */

function updateVenueUI() {
    setValue("venue", currentVenue);
    setText("currentVenueLabel", currentVenue);
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
    activeCalendarView = valueOf("calendarView", "eagle");
    showCalendarView();
}

function goPrevious() {
    if (showingSummary) {
        summaryPreviousMonthHandler();
        return;
    }

    if (showingLabDeployment) {
        labDeploymentPreviousMonth();
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
}

function goNext() {
    if (showingSummary) {
        summaryNextMonthHandler();
        return;
    }

    if (showingLabDeployment) {
        labDeploymentNextMonth();
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
}

function goToday() {
    currentDate = new Date();

    if (showingLabDeployment) {
        currentDate.setDate(1);
        saveCalendarDate();
        renderLabDeploymentOverview();
    } else if (showingSummary) {
        summaryDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        renderProgrammeSummary();
        saveCalendarDate();
    } else {
        renderCalendar();
        saveCalendarDate();
    }
}

/* =========================================================
34. SCREEN VISIBILITY
========================================================= */

function showCalendarView() {
    showingSummary = false;
    showingLabDeployment = false;

    toggleHidden("summaryPanel", true);
    toggleHidden("labDeploymentPanel", true);
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
    showingLabDeployment = false;

    toggleHidden("calendarArea", true);
    toggleHidden("labDeploymentPanel", true);
    toggleHidden("summaryPanel", false);

    updateSheetTabs();
    renderProgrammeSummary();
}

function showLabDeploymentView() {
    showingSummary = false;
    showingLabDeployment = true;

    toggleHidden("calendarArea", true);
    toggleHidden("summaryPanel", true);
    toggleHidden("labDeploymentPanel", false);

    updateSheetTabs();
    renderLabDeploymentOverview();
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
        currentVenue === "HBB" &&
        !showingSummary &&
        !showingLabDeployment
    );

    $("othSheetTab")?.classList.toggle(
        "active",
        currentVenue === "OTH" &&
        !showingSummary &&
        !showingLabDeployment
    );

    $("summarySheetTab")?.classList.toggle(
        "active",
        showingSummary
    );

    $("labDeploymentSheetTab")?.classList.toggle(
        "active",
        showingLabDeployment
    );
}
