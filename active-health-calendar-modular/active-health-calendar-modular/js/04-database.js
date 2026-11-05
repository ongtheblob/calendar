/* =========================================================
10. DATABASE MAPPING
========================================================= */

function mapProgrammeToDatabase(event) {
return {
id: event.id,
series_id: event.seriesId,
programme: event.programme,
venue: event.venue,
date: event.date,
time: event.time,
duration: Number(event.duration),
pax:
event.pax === "" || event.pax == null
? null
: Number(event.pax),
status: event.status || null,
remarks: event.remarks || null,
session_number: event.sessionNumber ?? null,
total_sessions: event.totalSessions ?? 1,
type: event.type || "Stand-alone"
};
}

function convertDatabaseProgramme(row) {
return {
id: row.id,
seriesId: row.series_id || row.id,
programme: row.programme,
venue: row.venue,
date: String(row.date).slice(0, 10),
time: String(row.time || "09:00").slice(0, 5),
duration: Number(row.duration ?? 60),
pax: row.pax ?? "",
status: row.status || "",
remarks: row.remarks || "",
sessionNumber: row.session_number ?? null,
totalSessions: Number(row.total_sessions ?? 1),
type: row.type || "Stand-alone"
};
}

/* =========================================================
11. LOAD PROGRAMMES
========================================================= */

async function testSupabaseConnection() {
if (!supabaseClient) return;

const { error } = await supabaseClient
.from("programmes")
.select("id")
.limit(1);

if (error) {
console.error("Supabase connection failed:", error);
} else {
console.log("Supabase connection successful.");
}
}

async function loadProgrammesFromSupabase() {
if (!supabaseClient) return false;

const rows = [];
const pageSize = 1000;

for (let offset = 0; ; offset += pageSize) {
const { data, error } = await supabaseClient
.from("programmes")
.select("*")
.order("date", { ascending: true })
.order("time", { ascending: true })
.order("id", { ascending: true })
.range(offset, offset + pageSize - 1);

if (error) {
  console.error("Unable to load programmes:", error);
  return false;
}

rows.push(...(data || []));

if (!data || data.length < pageSize) {
  break;
}
}

events = rows.map(convertDatabaseProgramme);
programmesLoaded = true;

return true;
}

async function refreshProgrammesFromSupabase() {
const success = await loadProgrammesFromSupabase();

if (success) {
renderCurrentScreen();
}

return success;
}

/* =========================================================
12. LOAD MANPOWER
========================================================= */

function manpowerKey(venue, date) {
return venue + "__" + date;
}

function getManpower(venue, date) {
return manpower[manpowerKey(venue, date)] || {
staff: [],
required: REQUIRED_MANPOWER,
notes: ""
};
}

async function loadManpowerFromSupabase() {
if (!supabaseClient) return false;

const rows = [];
const pageSize = 1000;

for (let offset = 0; ; offset += pageSize) {
const { data, error } = await supabaseClient
.from("manpower")
.select("*")
.order("date", { ascending: true })
.order("venue", { ascending: true })
.range(offset, offset + pageSize - 1);

if (error) {
  console.error("Unable to load manpower:", error);
  return false;
}

rows.push(...(data || []));

if (!data || data.length < pageSize) {
  break;
}
}

manpower = {};

rows.forEach(row => {
  const date = String(row.date).slice(0, 10);

  manpower[manpowerKey(row.venue, date)] = {
    staff: Array.isArray(row.staff) ? row.staff : [],
    required: REQUIRED_MANPOWER,
    notes: row.notes || "",
    leaveNotes: row.leave_notes || "",
    leaveEntries: Array.isArray(row.leave_entries)
    ? row.leave_entries
    : []
  };
  }); // Close rows.forEach()

  manpowerLoaded = true;

renderCurrentScreen();
return true;
}
