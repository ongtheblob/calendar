/* =========================================================
3. DOM HELPERS
========================================================= */

function $(id) {
return document.getElementById(id);
}

function valueOf(id, fallback = "") {
return $(id)?.value ?? fallback;
}

function setValue(id, value) {
if ($(id)) {
$(id).value = value;
}
}

function setText(id, value) {
if ($(id)) {
$(id).textContent = value;
}
}

function toggleHidden(id, hidden) {
$(id)?.classList.toggle("hidden", hidden);
}

function on(id, eventName, callback) {
$(id)?.addEventListener(eventName, callback);
}

/* =========================================================
4. DATE HELPERS
========================================================= */

function parseInputDate(value) {
const parts = String(value || "")
.slice(0, 10)
.split("-")
.map(Number);

if (
parts.length !== 3 ||
parts.some(n => !Number.isInteger(n))
) {
return new Date(NaN);
}

const date = new Date(
parts[0],
parts[1] - 1,
parts[2]
);

if (
date.getFullYear() !== parts[0] ||
date.getMonth() !== parts[1] - 1 ||
date.getDate() !== parts[2]
) {
return new Date(NaN);
}

return date;
}

function formatInputDate(date) {
return [
date.getFullYear(),
String(date.getMonth() + 1).padStart(2, "0"),
String(date.getDate()).padStart(2, "0")
].join("-");
}

function addDays(date, days) {
const result = new Date(date);
result.setDate(result.getDate() + days);
return result;
}

function startOfWeek(date) {
const result = new Date(date);
result.setHours(0, 0, 0, 0);
result.setDate(result.getDate() - result.getDay());
return result;
}

function isSameDay(a, b) {
return formatInputDate(a) === formatInputDate(b);
}

function formatShortDate(value) {
const date = parseInputDate(value);

return [
String(date.getDate()).padStart(2, "0"),
String(date.getMonth() + 1).padStart(2, "0"),
date.getFullYear()
].join("/");
}

function formatMonth(value) {
return parseInputDate(value).toLocaleDateString(
"en-SG",
{
month: "long",
year: "numeric"
}
);
}

function formatDisplayDate(value) {
return parseInputDate(value).toLocaleDateString(
"en-SG",
{
weekday: "short",
day: "numeric",
month: "short",
year: "numeric"
}
);
}

/* =========================================================
8. TIME HELPERS
========================================================= */

function populateHours() {
["startHour", "editStartHour"].forEach(id => {
const select = $(id);

if (!select) return;

select.innerHTML = "";

for (let hour = 0; hour < 24; hour++) {
  const option = document.createElement("option");

  option.value = String(hour).padStart(2, "0");
  option.textContent = option.value;

  select.appendChild(option);
}

select.value = "09";
});

setValue("startMinute", "00");
setValue("editStartMinute", "00");
}

function getAddTime() {
if ($("startHour") && $("startMinute")) {
return (
valueOf("startHour") +
":" +
valueOf("startMinute")
);
}

return valueOf("startTime").slice(0, 5);
}

function getEditTime() {
if ($("editStartHour") && $("editStartMinute")) {
return (
valueOf("editStartHour") +
":" +
valueOf("editStartMinute")
);
}

return valueOf("editStartTime").slice(0, 5);
}

function isValidHalfHourTime(time) {
return /^([01]\d|2[0-3]):(00|30)$/.test(time);
}

function addMinutesToTime(time, minutes) {
const [hour, minute] = time.split(":").map(Number);

const total =
hour * 60 +
minute +
Number(minutes);

return [
String(Math.floor(total / 60) % 24).padStart(2, "0"),
String(total % 60).padStart(2, "0")
].join(":");
}

function formatTime(time) {
const [hour, minute] = time.split(":").map(Number);

const date = new Date();
date.setHours(hour, minute, 0, 0);

return date.toLocaleTimeString("en-SG", {
hour: "numeric",
minute: "2-digit",
hour12: true
});
}

function formatDuration(minutes) {
const value = Number(minutes);

if (value < 60) {
return value + " min";
}

const hours = Math.floor(value / 60);
const remaining = value % 60;

if (remaining) {
return hours + " hr " + remaining + " min";
}

return hours + (hours === 1 ? " hour" : " hours");
}

/* =========================================================
9. GENERAL HELPERS
========================================================= */

function makeId(prefix) {
return (
prefix +
"" +
Date.now() +
"" +
Math.random().toString(36).slice(2, 12)
);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dateTimeValue(event) {
return new Date(
event.date + "T" + event.time
).getTime();
}

function getPax(programme) {
return Object.prototype.hasOwnProperty.call(
PAX,
programme
)
? PAX[programme]
: "";
}

function isKnownProgramme(programme) {
return Object.prototype.hasOwnProperty.call(
PAX,
programme
);
}

function needsWeek14Session(programme) {
return WEEK_14_PROGRAMMES.includes(programme);
}

function getProgrammeDuration(
programme,
customValue = 60
) {
if (programme === "Body Composition Assessment") {
return 30;
}

if (isKnownProgramme(programme)) {
return 60;
}

return Number(customValue);
}

function getSessionLabel(event) {
if (Number(event.totalSessions) <= 1) {
return "Stand-alone";
}

return event.sessionNumber
? "Week " + event.sessionNumber
: "Series";
}
