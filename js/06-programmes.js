/* =========================================================
22. PROGRAMME FORM
========================================================= */

function setupProgrammeForm() {
on("programme", "change", () => {
const custom =
valueOf("programme") === "Others";

toggleHidden("customProgrammeGroup", !custom);
toggleHidden("durationGroup", !custom);

if (!custom) {
  setValue("customProgramme", "");
  setValue("durationPreset", "60");
  setValue("customDuration", "");

  if ($("customDuration")) {
    $("customDuration").disabled = true;
  }
}
});

on("durationPreset", "change", () => {
const custom =
valueOf("durationPreset") === "custom";

if ($("customDuration")) {
  $("customDuration").disabled = !custom;
}
});

on("editProgramme", "change", () => {
const custom =
valueOf("editProgramme") === "CUSTOM";

toggleHidden("editCustomProgrammeGroup", !custom);
toggleHidden("editDurationGroup", !custom);
});
}

/* =========================================================
23. BUILD ROLLING PROGRAMMES
========================================================= */

function buildProgrammeEvents(options) {
const {
programmeName,
venue,
startDate,
time,
duration,
status,
remarks,
seriesId
} = options;

const normalSessions =
SERIES_WEEKS[programmeName] || 1;

const extraWeek14 =
needsWeek14Session(programmeName);

const totalSessions =
normalSessions + (extraWeek14 ? 1 : 0);

const weekNumbers = Array.from(
{ length: normalSessions },
(_, i) => i + 1
);

if (extraWeek14) {
weekNumbers.push(14);
}

return weekNumbers.map(week => {
const date = addDays(
parseInputDate(startDate),
(week - 1) * 7
);

return {
  id: makeId("event"),
  seriesId,
  programme: programmeName,
  venue,
  date: formatInputDate(date),
  time,
  duration,
  pax: getPax(programmeName),
  status,
  remarks,
  sessionNumber:
    totalSessions > 1 ? week : null,
  totalSessions,
  type:
    totalSessions > 1
      ? "Series"
      : "Stand-alone"
};
});
}

/* =========================================================
24. ADD PROGRAMME
PRESERVE CALENDAR MONTH AND START DATE
========================================================= */

async function addProgramme() {
const preservedDate = new Date(currentDate);
const preservedView = activeCalendarView;
const preservedVenue = currentVenue;

const preservedStartDate =
valueOf("startDate");

const selected = valueOf("programme");

if (!selected) {
alert("Please select a programme.");
return;
}

const isCustom = selected === "Others";

const programmeName = isCustom
? valueOf("customProgramme").trim()
: selected;

if (!programmeName) {
alert("Please enter a programme name.");
return;
}

const venue = valueOf("venue", currentVenue);
const date = valueOf("startDate");
const time = getAddTime();

if (
!date ||
isNaN(parseInputDate(date).getTime())
) {
alert("Please select a valid date.");
return;
}

if (!isValidHalfHourTime(time)) {
alert("Start time must end in :00 or :30.");
return;
}

let customDurationValue =
valueOf("durationPreset", "60");

if (customDurationValue === "custom") {
customDurationValue = valueOf("customDuration");
}

const duration = isCustom
? Number(customDurationValue)
: getProgrammeDuration(programmeName);

if (
!Number.isFinite(duration) ||
duration <= 0
) {
alert("Please enter a valid duration.");
return;
}

if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

const newEvents = buildProgrammeEvents({
programmeName,
venue,
startDate: date,
time,
duration,
status: valueOf("status"),
remarks: valueOf("remarks").trim(),
seriesId: makeId("series")
});

const addButton = $("addButton");

if (addButton) {
addButton.disabled = true;
}

try {
const { data, error } = await supabaseClient
.from("programmes")
.insert(
newEvents.map(mapProgrammeToDatabase)
)
.select();

if (error) {
  throw error;
}

if (
  !data ||
  data.length !== newEvents.length
) {
  throw new Error(
    "Not all sessions were confirmed by Supabase."
  );
}

events.push(
  ...data.map(convertDatabaseProgramme)
);

// Preserve the calendar's selected month.
currentDate = preservedDate;
activeCalendarView = preservedView;
currentVenue = preservedVenue;

saveCalendarDate();

// Reset programme fields only.
resetProgrammeForm();

// Preserve exact Start Date.
setValue("startDate", preservedStartDate);
saveSelectedStartDate();

updateVenueUI();

setValue(
  "calendarView",
  activeCalendarView
);

renderCurrentScreen();

} catch (error) {
console.error(
"Unable to save programme:",
error
);

alert(
  "Unable to save programme: " +
  error.message
);

// Reload in case Supabase saved some rows.
await refreshProgrammesFromSupabase();
} finally {
if (addButton) {
addButton.disabled = false;
}
}
}


/* =========================================================
COPY PROGRAMMES TO ANOTHER DAY
- Copies standalone programmes only
- Never changes existing rolling programme sessions
- Adds alongside existing destination programmes
========================================================= */

async function copyDayProgrammes() {
const selected = events.find(
event => event.id === selectedEventId
);

if (!selected) {
alert("Please select a programme first.");
return;
}

if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

const sourceDate = selected.date;
const venue = selected.venue;

// Only copy standalone programmes.
// Rolling programme sessions are deliberately excluded.
const sourceProgrammes = events.filter(event =>
event.date === sourceDate &&
event.venue === venue &&
Number(event.totalSessions || 1) <= 1 &&
!event.sessionNumber
);

if (sourceProgrammes.length === 0) {
alert(
"There are no standalone programmes to copy. " +
"Rolling programme sessions are not copied."
);
return;
}

const destinationDate = prompt(
"Copy programmes from " + sourceDate +
"\n\nEnter destination date (YYYY-MM-DD):"
);

if (!destinationDate) return;

if (
!/^\d{4}-\d{2}-\d{2}$/.test(destinationDate) ||
isNaN(parseInputDate(destinationDate).getTime()) ||
formatInputDate(parseInputDate(destinationDate)) !== destinationDate
) {
alert("Please enter a valid date in YYYY-MM-DD format.");
return;
}

if (destinationDate === sourceDate) {
alert("Please choose a different destination date.");
return;
}

const confirmed = confirm(
"Copy " + sourceProgrammes.length +
" standalone programme(s)?\n\n" +
"From: " + sourceDate +
"\nTo: " + destinationDate +
"\nVenue: " + venue +
"\n\nExisting programmes and rolling sessions will not be replaced."
);

if (!confirmed) return;

const copiedEvents = sourceProgrammes.map(event => ({
id: makeId("event"),
seriesId: makeId("series"),
programme: event.programme,
venue: event.venue,
date: destinationDate,
time: event.time,
duration: event.duration,
pax: event.pax,
status: event.status,
remarks: event.remarks,
sessionNumber: null,
totalSessions: 1,
type: "Stand-alone"
}));

const copyButton = $("copyDayProgrammesButton");

if (copyButton) {
copyButton.disabled = true;
}

try {
const { data, error } = await supabaseClient
.from("programmes")
.insert(
copiedEvents.map(mapProgrammeToDatabase)
)
.select();

if (error) throw error;

if (!data || data.length !== copiedEvents.length) {
throw new Error(
"Not all copied programmes were confirmed."
);
}

events.push(
...data.map(convertDatabaseProgramme)
);

closeEventModal();

renderCurrentScreen();

alert(
data.length +
" programme(s) copied successfully to " +
destinationDate + "."
);

} catch (error) {
console.error("Copy programmes failed:", error);

await refreshProgrammesFromSupabase();

alert(
"Unable to copy programmes: " + error.message
);

} finally {
if (copyButton) {
copyButton.disabled = false;
}
}
}

/* =========================================================
25. RESET PROGRAMME FORM
KEEP SELECTED START DATE
========================================================= */

function resetProgrammeForm() {
const selectedStartDate =
valueOf("startDate");

setValue("programme", "");
setValue("customProgramme", "");

setValue("durationPreset", "60");
setValue("customDuration", "");

// Do not reset Start Date to today.
setValue("startDate", selectedStartDate);

setValue("startHour", "09");
setValue("startMinute", "00");
setValue("startTime", "09:00");

setValue("remarks", "");

setValue(
"status",
"Confirmed"
);

toggleHidden("customProgrammeGroup", true);
toggleHidden("durationGroup", true);

if ($("customDuration")) {
$("customDuration").disabled = true;
}
}

/* =========================================================
26. EVENT MODAL
========================================================= */

function openEventModal(event) {
selectedEventId = event.id;

setText("modalProgramme", event.programme);
setText("modalVenue", event.venue);

setText(
"modalDate",
formatDisplayDate(event.date)
);

setText(
"modalTime",
formatTime(event.time) +
" - " +
formatTime(
addMinutesToTime(
event.time,
event.duration
)
)
);

setText(
"modalDuration",
formatDuration(event.duration)
);

setText(
"modalPax",
event.pax === ""
? "Not specified"
: event.pax + " pax"
);

setText(
"modalSession",
getSessionLabel(event)
);

setText("modalStatus", event.status || "");
setText("modalRemarks", event.remarks || "—");

const modalActions = document.querySelector(
    "#eventModal .modal-actions"
);

if (modalActions && !$("copyDayProgrammesButton")) {
    const copyButton = document.createElement("button");

    copyButton.type = "button";
    copyButton.id = "copyDayProgrammesButton";
    copyButton.className = "btn btn-secondary";
    copyButton.textContent = "Copy Day's Programmes";

    copyButton.addEventListener("click", copyDayProgrammes);

    modalActions.insertBefore(
        copyButton,
        modalActions.querySelector("#closeButton")
    );
}
  
$("eventModal")?.classList.add("visible");
}

function closeEventModal() {
$("eventModal")?.classList.remove("visible");
selectedEventId = null;
}

/* =========================================================
27. OPEN EDIT MODAL
========================================================= */

function openEditModal() {
const selected = events.find(
event => event.id === selectedEventId
);

if (!selected) {
alert("Programme not found.");
return;
}

const series = events
.filter(
event => event.seriesId === selected.seriesId
)
.sort(
(a, b) => dateTimeValue(a) - dateTimeValue(b)
);

const first = series[0] || selected;

const known = isKnownProgramme(
first.programme
);

setValue(
"editProgramme",
known ? first.programme : "CUSTOM"
);

setValue(
"editCustomProgramme",
known ? "" : first.programme
);

toggleHidden(
"editCustomProgrammeGroup",
known
);

toggleHidden("editDurationGroup", known);

// Use the clicked session, not always Week 1.
setValue("editVenue", selected.venue);
setValue("editStartDate", selected.date);

const [hour, minute] = selected.time.split(":");

setValue("editStartHour", hour);
setValue("editStartMinute", minute);
setValue("editStartTime", selected.time);

setValue("editDuration", selected.duration);
setValue("editRemarks", selected.remarks);
  
setValue(
"editStatus",
first.status ||
"Confirmed"
);

// Hide details without clearing selectedEventId.
$("eventModal")?.classList.remove("visible");

$("editModal")?.classList.add("visible");
}

function closeEditModal() {
$("editModal")?.classList.remove("visible");
selectedEventId = null;
}

/* =========================================================
28. SAVE EDIT
========================================================= */

async function saveEdit() {
const selected = events.find(
event => event.id === selectedEventId
);

if (!selected) {
alert("No programme selected.");
return;
}

if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

const preservedDate = new Date(currentDate);
const preservedView = activeCalendarView;
const preservedVenue = currentVenue;

const selectedName = valueOf("editProgramme");

const isCustom =
selectedName === "CUSTOM";

const programmeName = isCustom
? valueOf("editCustomProgramme").trim()
: selectedName;

const startDate = valueOf("editStartDate");
const time = getEditTime();

if (!programmeName) {
alert("Please select a programme.");
return;
}

if (
!startDate ||
isNaN(parseInputDate(startDate).getTime())
) {
alert("Please select a valid date.");
return;
}

if (!isValidHalfHourTime(time)) {
alert("Start time must end in :00 or :30.");
return;
}

const duration = isCustom
? Number(valueOf("editDuration"))
: getProgrammeDuration(programmeName);

if (
!Number.isFinite(duration) ||
duration <= 0
) {
alert("Please enter a valid duration.");
return;
}

const oldSeriesId = selected.seriesId;

const existing = events
.filter(
event => event.seriesId === oldSeriesId
)
.sort(
(a, b) => dateTimeValue(a) - dateTimeValue(b)
);

const selectedSessionNumber =
    Number(selected.sessionNumber || 1);

const dateDifference =
    Math.round(
        (parseInputDate(startDate).getTime() -
         parseInputDate(selected.date).getTime()) /
        86400000
    );

const replacement = existing.map(event => {
    const updated = { ...event };

    if (
        Number(event.sessionNumber || 1) >=
        selectedSessionNumber
    ) {
        updated.date = formatInputDate(
            addDays(
                parseInputDate(event.date),
                dateDifference
            )
        );
    }

    return updated;
});

const existingByWeek = new Map();

existing.forEach(event => {
const week = event.sessionNumber ?? 1;

existingByWeek.set(week, event);
});

const updates = [];
const inserts = [];
const retainedIds = new Set();

replacement.forEach(event => {
const week = event.sessionNumber ?? 1;
const old = existingByWeek.get(week);

if (old) {
  event.id = old.id;

  retainedIds.add(old.id);
  updates.push(event);
} else {
  inserts.push(event);
}
});

const obsolete = existing.filter(
event => !retainedIds.has(event.id)
);

const saveButton = $("saveEditButton");

if (saveButton) {
saveButton.disabled = true;
}

try {
// Update existing sessions.
for (const event of updates) {
const row = mapProgrammeToDatabase(event);

  const { id, ...changes } = row;

  const { data, error } = await supabaseClient
    .from("programmes")
    .update(changes)
    .eq("id", id)
    .select("id");

  if (error) throw error;

  if (!data || data.length !== 1) {
    throw new Error(
      "Programme update was not confirmed."
    );
  }
}

// Insert new sessions.
if (inserts.length > 0) {
  const { data, error } = await supabaseClient
    .from("programmes")
    .insert(
      inserts.map(mapProgrammeToDatabase)
    )
    .select("id");

  if (error) throw error;

  if (
    !data ||
    data.length !== inserts.length
  ) {
    throw new Error(
      "New sessions were not fully confirmed."
    );
  }
}

// Remove obsolete sessions.
if (obsolete.length > 0) {
  const ids = obsolete.map(event => event.id);

  const { data, error } = await supabaseClient
    .from("programmes")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw error;

  if (
    !data ||
    data.length !== ids.length
  ) {
    throw new Error(
      "Old sessions were not fully removed."
    );
  }
}

const reloaded =
  await refreshProgrammesFromSupabase();

if (!reloaded) {
  throw new Error(
    "Unable to reload the saved programme."
  );
}

// Preserve calendar position.
currentDate = preservedDate;
activeCalendarView = preservedView;
currentVenue = preservedVenue;

saveCalendarDate();

closeEditModal();

updateVenueUI();

setValue(
  "calendarView",
  activeCalendarView
);

renderCurrentScreen();

} catch (error) {
console.error("Programme edit failed:", error);

await refreshProgrammesFromSupabase();

alert(
  "Unable to complete programme edit: " +
  error.message +
  "\nSome changes may have been saved. " +
  "Please review the series."
);
} finally {
if (saveButton) {
saveButton.disabled = false;
}
}
}

/* =========================================================
29. DELETE PROGRAMME
========================================================= */

async function deleteSelected() {
const selected = events.find(
event => event.id === selectedEventId
);

if (!selected) return;

const wholeSeries =
Number(selected.totalSessions) > 1;

const confirmed = confirm(
wholeSeries
? "Delete the entire programme series?"
: "Delete this programme?"
);

if (!confirmed) return;

if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

let query = supabaseClient
.from("programmes")
.delete();

query = wholeSeries
? query.eq("series_id", selected.seriesId)
: query.eq("id", selected.id);

const { data, error } = await query.select("id");

if (error) {
alert(
"Unable to delete programme: " +
error.message
);

return;
}

const expectedCount = wholeSeries
? events.filter(
event => event.seriesId === selected.seriesId
).length
: 1;

if (
!data ||
data.length !== expectedCount
) {
await refreshProgrammesFromSupabase();

alert(
  "Deletion could not be fully confirmed. " +
  "Please review the calendar."
);

return;
}

const deletedIds = new Set(
data.map(row => row.id)
);

events = events.filter(
event => !deletedIds.has(event.id)
);

closeEventModal();

renderCurrentScreen();
}

