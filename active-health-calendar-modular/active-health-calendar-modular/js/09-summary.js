/* =========================================================
35. MONTHLY PROGRAMME SUMMARY
========================================================= */

function renderProgrammeSummary() {
const body = $("summaryTableBody");

if (!body) return;

const year = summaryDate.getFullYear();
const month = summaryDate.getMonth();

setText(
"summaryMonth",
summaryDate.toLocaleDateString(
"en-SG",
{
month: "long",
year: "numeric"
}
)
);

setText(
"summarySubtitle",
"Venue: " + currentVenue
);

const counts = new Map();

events.forEach(event => {
if (event.venue !== currentVenue) {
return;
}

const date = parseInputDate(event.date);

if (
  date.getFullYear() !== year ||
  date.getMonth() !== month
) {
  return;
}

const name =
  event.programme || "Unnamed Programme";

counts.set(
  name,
  (counts.get(name) || 0) + 1
);
});

body.innerHTML = "";

let total = 0;

const names = Array.from(
counts.keys()
).sort((a, b) => a.localeCompare(b));

if (names.length === 0) {
const row = document.createElement("tr");
const cell = document.createElement("td");

cell.colSpan = 2;
cell.className = "summary-zero";

cell.textContent =
  "No programmes scheduled this month.";

row.appendChild(cell);
body.appendChild(row);
}

names.forEach(name => {
const count = counts.get(name);

total += count;

const row = document.createElement("tr");

const nameCell =
  document.createElement("td");

nameCell.textContent = name;

const countCell =
  document.createElement("td");

countCell.textContent = count;

row.append(nameCell, countCell);
body.appendChild(row);
});

setText("summaryTotal", total);
}

function summaryPreviousMonthHandler() {
summaryDate = new Date(
summaryDate.getFullYear(),
summaryDate.getMonth() - 1,
1
);

currentDate = new Date(summaryDate);

saveCalendarDate();

renderProgrammeSummary();
}

function summaryNextMonthHandler() {
summaryDate = new Date(
summaryDate.getFullYear(),
summaryDate.getMonth() + 1,
1
);

currentDate = new Date(summaryDate);

saveCalendarDate();

renderProgrammeSummary();
}
