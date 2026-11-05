/* =========================================================
36. CSV EXPORT
========================================================= */

const CSV_HEADERS = [
"Month",
"Remarks",
"Programme Name",
"Date/ Week 1",
"Time",
"Pax",
"Status",
"W1",
"W2",
"W3",
"W4",
"W5",
"W6",
"W7",
"W8"
];

function csvEscape(value) {
return (
'"' +
String(value ?? "").replace(/"/g, '""') +
'"'
);
}

function downloadCSV(csv, filename) {
const blob = new Blob(
["\uFEFF", csv],
{
type: "text/csv;charset=utf-8;"
}
);

const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;
link.download = filename;

document.body.appendChild(link);

link.click();
link.remove();

setTimeout(() => {
URL.revokeObjectURL(url);
}, 1000);
}

function getExportMonthDate() {
return showingSummary
? new Date(summaryDate)
: new Date(currentDate);
}

function isDateInExportMonth(dateString) {
const date = parseInputDate(dateString);
const selected = getExportMonthDate();

return (
date.getFullYear() === selected.getFullYear() &&
date.getMonth() === selected.getMonth()
);
}

/* =========================================================
37. GROUP ROLLING PROGRAMMES
========================================================= */

function getVenueSeries(venue) {
const groups = new Map();

events
.filter(event => event.venue === venue)
.forEach(event => {
const key = event.seriesId || event.id;

  if (!groups.has(key)) {
    groups.set(key, []);
  }

  groups.get(key).push(event);
});
return Array.from(groups.values()).map(series =>
series.sort(
(a, b) => dateTimeValue(a) - dateTimeValue(b)
)
);
}

function buildVenueExportRows(venue) {
const rows = [];

getVenueSeries(venue).forEach(series => {
if (!series.length) return;

const first = series[0];

// Export only when Week 1 starts
// in the selected month.
if (!isDateInExportMonth(first.date)) {
  return;
}

const row = [
  formatMonth(first.date),
  "", // Remarks always blank.
  first.programme || "",
  formatShortDate(first.date),
  formatTime(first.time),
  first.pax ?? "",
  first.status || "",
  "", "", "", "", "", "", "", ""
];

const rolling =
  Number(first.totalSessions) > 1;

if (rolling) {
  series.forEach(event => {
    const week = Number(
      event.sessionNumber
    );

    if (week >= 1 && week <= 8) {
      row[7 + week - 1] =
        formatShortDate(event.date);
    }
  });
}

rows.push({
  date: first.date,
  time: first.time,
  row
});
});

rows.sort((a, b) => {
const first = a.date + "T" + a.time;
const second = b.date + "T" + b.time;

return first.localeCompare(second);
});

return rows.map(item => item.row);
}

/* =========================================================
38. CSV DOWNLOAD FUNCTIONS
========================================================= */

function makeVenueCSV(venue) {
const rows = buildVenueExportRows(venue);

if (!rows.length) return null;

return [
CSV_HEADERS,
...rows
]
.map(row => row.map(csvEscape).join(","))
.join("\r\n");
}

function getExportFilename(venue) {
const date = getExportMonthDate();

const year = date.getFullYear();

const month = String(
date.getMonth() + 1
).padStart(2, "0");

return (
venue +
"_" +
year +
"-" +
month +
"_programme_schedule.csv"
);
}

function exportVenueMonthCSV(venue) {
if (!programmesLoaded) {
alert("Programme data has not loaded yet.");
return false;
}

const csv = makeVenueCSV(venue);

if (!csv) {
alert(
"No " +
venue +
" programmes begin in the selected month."
);

return false;
}

downloadCSV(
csv,
getExportFilename(venue)
);

return true;
}

function exportCurrentMonthCSV() {
exportVenueMonthCSV(currentVenue);
}

function exportBothVenuesCSV() {
if (!programmesLoaded) {
alert("Programme data has not loaded yet.");
return;
}

const hbb = makeVenueCSV("HBB");
const oth = makeVenueCSV("OTH");

if (!hbb && !oth) {
alert(
"No programmes begin in the selected month."
);

return;
}

if (hbb) {
downloadCSV(
hbb,
getExportFilename("HBB")
);
}

if (oth) {
downloadCSV(
oth,
getExportFilename("OTH")
);
}
}
