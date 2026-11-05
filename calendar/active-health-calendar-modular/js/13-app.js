/* =========================================================
41. INITIALISE
========================================================= */

function initialise() {
populateHours();

setupProgrammeForm();

setupButtons();

// Restore last selected Add Programme date.
initialiseStartDate();

setValue("venue", currentVenue);

setValue(
"calendarView",
activeCalendarView
);

updateVenueUI();

renderCalendar();
}

/* =========================================================
42. START APPLICATION
========================================================= */

async function startApplication() {
initialise();

if (!supabaseClient) {
console.error(
"Supabase could not be initialised. " +
"Check that its library loads before script.js."
);

return;
}

await testSupabaseConnection();

await Promise.all([
refreshProgrammesFromSupabase(),
loadManpowerFromSupabase()
]);

console.log(
"Active Health Work Calendar initialised."
);
}

if (document.readyState === "loading") {
document.addEventListener(
"DOMContentLoaded",
startApplication,
{ once: true }
);
} else {
startApplication();
}
