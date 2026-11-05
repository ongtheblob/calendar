/* =========================================================
30. STAFF CHECKLIST
========================================================= */

function selectedStaff() {
return Array.from(
document.querySelectorAll(
'#staffList input[type="checkbox"]'
)
).map(input => input.value);
}

function renderStaffChecklist(selected = []) {
const container = $("staffList");

if (!container) return;

container.innerHTML = "";

STAFF_LIST.forEach(name => {
const label = document.createElement("label");

label.className = "staff-option";

const checkbox = document.createElement("input");

checkbox.type = "checkbox";
checkbox.value = name;
checkbox.checked = selected.includes(name);

checkbox.addEventListener("change", () => {
  updateStaffCount();
  updateStaffStatus();
});

const text = document.createElement("span");
text.textContent = name;

label.append(checkbox, text);
container.appendChild(label);
});
}

function updateStaffCount() {
setText(
"presentCount",
selectedStaff().length
);
}

function updateStaffStatus() {
const status = $("staffStatus");

if (!status) return;

const present = selectedStaff().length;

status.className = "staff-status";

if (present >= REQUIRED_MANPOWER) {
status.classList.add("good");
status.textContent = "✓ Adequately staffed";
} else {
status.classList.add("warning");

status.textContent =
  "⚠ Understaffed by " +
  (REQUIRED_MANPOWER - present);
}
}

/* =========================================================
31. MANPOWER MODAL
========================================================= */

function openManpowerModal(venue, date) {
manpowerVenue = venue;
manpowerDate = date;

const record = getManpower(venue, date);

setText("manpowerVenue", venue);

setText(
"manpowerDate",
formatDisplayDate(date)
);

setValue(
"requiredManpower",
REQUIRED_MANPOWER
);

setValue(
"manpowerNotes",
record.notes
);

renderStaffChecklist(record.staff);

updateStaffCount();
updateStaffStatus();

$("manpowerModal")?.classList.add("visible");
}

function closeManpowerModal() {
$("manpowerModal")?.classList.remove("visible");

manpowerVenue = null;
manpowerDate = null;
}

async function saveManpower() {
if (!manpowerVenue || !manpowerDate) {
return;
}

if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

const record = {
venue: manpowerVenue,
date: manpowerDate,
staff: selectedStaff(),
required: REQUIRED_MANPOWER,
notes: valueOf("manpowerNotes").trim()
};

const { data, error } = await supabaseClient
.from("manpower")
.upsert(record, {
onConflict: "venue,date"
})
.select("venue,date");

if (error) {
alert(
"Unable to save manpower: " +
error.message
);

return;
}

if (!data || data.length !== 1) {
alert(
"Manpower save was not confirmed. " +
"Please check your database permissions."
);

return;
}

const reloaded =
await loadManpowerFromSupabase();

if (!reloaded) {
alert(
"Manpower was submitted but could not be reloaded."
);

return;
}

closeManpowerModal();

renderCurrentScreen();
}
