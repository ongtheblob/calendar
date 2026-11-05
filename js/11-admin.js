/* =========================================================
39. CLEAR ALL DATA
========================================================= */

async function clearAllData() {
if (!supabaseClient) {
alert("Supabase is not connected.");
return;
}

// Ask user to pick a month (YYYY-MM format)
const monthInput = prompt(
"Enter the month to clear data for (YYYY-MM format):\n" +
"e.g. 2026-11 for November 2026"
);

if (!monthInput) return;

if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthInput)) {
alert("Invalid format. Please enter a valid month in YYYY-MM format (e.g. 2026-11).");
return;
}

const [year, month] = monthInput.split("-").map(Number);
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 1);

// Use date-only strings because Supabase date columns are YYYY-MM-DD.
// Avoid timezone shifts caused by converting local midnight to ISO.
const startISO = `${year}-${String(month).padStart(2, "0")}-01`;
const endISO = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01`;

const monthLabel = startDate.toLocaleString("default", { month: "long", year: "numeric" });

  const confirmed = confirm(
  "WARNING: DELETE DATA FOR " + monthLabel.toUpperCase() + "\n\n" +
  "This will permanently delete:\n" +
  "- ALL HBB programmes in " + monthLabel + "\n" +
  "- ALL OTH programmes in " + monthLabel + "\n" +
  "- ALL manpower records in " + monthLabel + "\n" +
  "- ALL staff assignments and notes for this month\n\n" +
  "This affects EVERYONE using the shared calendar.\n\n" +
  "Continue?"
);

if (!confirmed) return;

const verification = prompt(
  "Type \"DELETE " + monthInput + "\" to confirm:"
);

if (verification !== "DELETE " + monthInput) {
  alert("Deletion cancelled.");
  return;
}

const clearButton = $("clearButton");
if (clearButton) clearButton.disabled = true;

try {
// Delete programmes within the selected month
// Adjust "date" to match your actual date column name in the programmes table
const programmesResult = await supabaseClient
.from("programmes")
.delete()
.gte("date", startISO)
.lt("date", endISO);

if (programmesResult.error) {
  throw programmesResult.error;
}

// Delete manpower records within the selected month
// Adjust "date" to match your actual date column name in the manpower table
const manpowerResult = await supabaseClient
  .from("manpower")
  .delete()
  .gte("date", startISO)
  .lt("date", endISO);

if (manpowerResult.error) {
  throw manpowerResult.error;
}

// Clear local state only for the selected month
events = events.filter(e => {
  const eventDate = String(e.date).slice(0, 10);
  return eventDate < startISO || eventDate >= endISO;
});

Object.keys(manpower).forEach(key => {
  // manpowerKey() stores keys as "VENUE__YYYY-MM-DD".
  const keyDate = key.split("__")[1] || "";
  if (keyDate >= startISO && keyDate < endISO) {
    delete manpower[key];
  }
});

selectedEventId = null;
manpowerDate = null;
manpowerVenue = null;

renderCurrentScreen();

alert(
  `Clear operation submitted for ${monthLabel}. ` +
  "Verify the database records for this month are empty."
);
} catch (error) {
console.error("Clear Month Data failed:", error);

alert(
  "Unable to clear data: " +
  error.message +
  "\nSome records may already have been deleted."
);
} finally {
if (clearButton) clearButton.disabled = false;

await Promise.all([
  refreshProgrammesFromSupabase(),
  loadManpowerFromSupabase()
]);
}
}
