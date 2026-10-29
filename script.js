
/* =========================================================
   ACTIVE HEALTH PROGRAMME CALENDAR
   COMPLETE REPLACEMENT - VERSION 144

   HBB / OTH
   Month / Week / Day
   Supabase
   Programme management
   Manpower
   Monthly summary
   CSV exports

   IMPORTANT:
   - Calendar month stays selected after saving.
   - Add Programme date stays selected after saving.
   - No duplicate addProgramme functions.
========================================================= */


/* =========================================================
   1. SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";

const supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    )
  : null;

if (!supabaseClient) {
  console.error("Supabase library was not loaded.");
}


/* =========================================================
   2. PROGRAMME SETTINGS
========================================================= */

const REQUIRED_MANPOWER = 2;

const SERIES_WEEKS = {
  "Manage Knee Health": 6,
  "Manage Metabolic Health": 6,
  "Function - Combat Age-Related Loss of Muscle (CALM) 1.0": 8,
  "Function - Combat Age-Related Loss of Muscle (CALM) 2.0": 6,
  "Strength 1.0": 8,
  "Perform 1.0": 8
};

const WEEK_14_PROGRAMMES = [
  "Manage Knee Health",
  "Manage Metabolic Health"
];

const PAX = {
  "Strength 1.0": 12,
  "Strength 2.0 - Foundation Strength Workout": 14,
  "Strength 2.0 - Functional Fitness Workout": 12,
  "Strength 2.0 - Mobility Workout": 12,
  "Strength 2.0 - Assessment & Check-In": 10,
  "Perform 1.0": 10,
  "Perform 2.0 - Multi-Modal Workout": 12,
  "Perform 2.0 - AMRAP Workout": 12,
  "Perform 2.0 - ENGINE Workout": 12,
  "Perform 2.0 - Assessment & Check-In": 10,
  "Function - Combat Age-Related Loss of Muscle (CALM) 1.0": 12,
  "Function - Combat Age-Related Loss of Muscle (CALM) 2.0": 14,
  "Manage Knee Health": 8,
  "Manage Metabolic Health": 8,
  "Body Composition Assessment": 16,
  "Active Health Senior Interest Group": 12
};

const STAFF_LIST = [
  "Joelle",
  "Jireh",
  "RJ",
  "Clarissa",
  "Rachael",
  "Team Nila",
  "APS",
  "Other"
];


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
   5. CALENDAR DATE MEMORY
========================================================= */

let currentDate = new Date();

try {
  const savedDate = localStorage.getItem(
    "selectedCalendarDate"
  );

  if (savedDate) {
    const parsed = parseInputDate(savedDate);

    if (!isNaN(parsed.getTime())) {
      currentDate = parsed;
    }
  }
} catch (error) {
  console.warn("Unable to restore calendar date:", error);
}

function saveCalendarDate() {
  try {
    localStorage.setItem(
      "selectedCalendarDate",
      formatInputDate(currentDate)
    );
  } catch (error) {
    console.warn("Unable to save calendar date:", error);
  }
}


/* =========================================================
   6. ADD PROGRAMME DATE MEMORY
========================================================= */

const START_DATE_STORAGE_KEY =
  "activeHealthSelectedStartDate";

function getPlanningDate() {
  const today = new Date();

  if (
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth()
  ) {
    return formatInputDate(today);
  }

  return formatInputDate(
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
  );
}

function getSavedStartDate() {
  try {
    const saved = localStorage.getItem(
      START_DATE_STORAGE_KEY
    );

    if (
      saved &&
      !isNaN(parseInputDate(saved).getTime())
    ) {
      return saved;
    }
  } catch (error) {
    console.warn("Unable to restore start date:", error);
  }

  return getPlanningDate();
}

function saveSelectedStartDate() {
  const date = valueOf("startDate");

  if (
    !date ||
    isNaN(parseInputDate(date).getTime())
  ) {
    return;
  }

  try {
    localStorage.setItem(
      START_DATE_STORAGE_KEY,
      date
    );
  } catch (error) {
    console.warn("Unable to save start date:", error);
  }
}

function initialiseStartDate() {
  setValue("startDate", getSavedStartDate());

  on("startDate", "change", saveSelectedStartDate);
}


/* =========================================================
   7. APPLICATION STATE
========================================================= */

let events = [];
let manpower = {};

let currentVenue = "HBB";
let activeCalendarView = "month";

let selectedEventId = null;

let manpowerDate = null;
let manpowerVenue = null;

let showingSummary = false;
let summaryDate = new Date(currentDate);

let programmesLoaded = false;
let manpowerLoaded = false;


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
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 12)
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
      notes: row.notes || ""
    };
  });

  manpowerLoaded = true;

  renderCurrentScreen();
  return true;
}


/* =========================================================
   13. CALENDAR FILTERING
========================================================= */

function getDayEvents(date) {
  return events
    .filter(event =>
      event.date === date &&
      event.venue === currentVenue
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

function getViewDateLabel() {
  if (activeCalendarView === "day") {
    return currentDate.toLocaleDateString("en-SG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  if (activeCalendarView === "week") {
    const start = startOfWeek(currentDate);
    const end = addDays(start, 6);

    return (
      start.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short"
      }) +
      " - " +
      end.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    );
  }

  return currentDate.toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric"
  });
}


/* =========================================================
   14. MASTER CALENDAR RENDER
========================================================= */

function renderCalendar() {
  const grid = $("calendarGrid");

  if (!grid) {
    console.error("calendarGrid not found.");
    return;
  }

  saveCalendarDate();

  if (activeCalendarView === "week") {
    renderWeekView();
  } else if (activeCalendarView === "day") {
    renderDayView();
  } else {
    renderMonthView();
  }
}


/* =========================================================
   15. MONTH VIEW
========================================================= */

function renderMonthView() {
  const grid = $("calendarGrid");

  const header =
    $("weekHeader") ||
    document.querySelector(".week-header");

  grid.className = "calendar-grid";
  grid.innerHTML = "";

  if (header) {
    header.className = "week-header";

    header.innerHTML = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ].map(day => "<div>" + day + "</div>").join("");
  }

  setText("monthTitle", getViewDateLabel());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstWeekday = new Date(
    year,
    month,
    1
  ).getDay();

  const firstGridDate = new Date(
    year,
    month,
    1 - firstWeekday
  );

  for (let i = 0; i < 42; i++) {
    const date = addDays(firstGridDate, i);
    const dateString = formatInputDate(date);

    const cell = document.createElement("div");
    cell.className = "day-cell";

    if (date.getMonth() !== month) {
      cell.classList.add("other-month");
    }

    if (isSameDay(date, new Date())) {
      cell.classList.add("today");
    }

    const number = document.createElement("div");
    number.className = "date-number";
    number.textContent = date.getDate();

    cell.appendChild(number);

    // Staff appears above programmes.
    cell.appendChild(
      createManpowerSection(currentVenue, dateString)
    );

    getDayEvents(dateString).forEach(event => {
      cell.appendChild(createEventElement(event));
    });

    grid.appendChild(cell);
  }
}


/* =========================================================
   16. WEEK VIEW
========================================================= */

function renderWeekView() {
  const grid = $("calendarGrid");

  grid.className = "calendar-grid week-view";
  grid.innerHTML = "";

  const start = startOfWeek(currentDate);

  setText("monthTitle", getViewDateLabel());

  const dates = Array.from(
    { length: 7 },
    (_, i) => addDays(start, i)
  );

  renderFlexibleHeader(dates);

  dates.forEach(date => {
    grid.appendChild(renderDayColumn(date));
  });
}


/* =========================================================
   17. DAY VIEW
========================================================= */

function renderDayView() {
  const grid = $("calendarGrid");

  grid.className = "calendar-grid day-view";
  grid.innerHTML = "";

  setText("monthTitle", getViewDateLabel());

  renderFlexibleHeader([currentDate]);

  grid.appendChild(renderDayColumn(currentDate));
}


/* =========================================================
   18. WEEK / DAY HEADER
========================================================= */

function renderFlexibleHeader(dates) {
  const header =
    $("weekHeader") ||
    document.querySelector(".week-header");

  if (!header) return;

  header.innerHTML = "";

  header.className =
    activeCalendarView === "day"
      ? "week-header day-view-header"
      : "week-header week-view-header";

  dates.forEach(date => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "calendar-date-header";

    button.textContent = date.toLocaleDateString(
      "en-SG",
      {
        weekday:
          activeCalendarView === "day"
            ? "long"
            : "short",
        day: "numeric",
        month: "short"
      }
    );

    if (isSameDay(date, new Date())) {
      button.classList.add("today-header");
    }

    if (activeCalendarView === "week") {
      button.addEventListener("click", () => {
        currentDate = new Date(date);
        activeCalendarView = "day";

        setValue("calendarView", "day");

        renderCalendar();
      });
    }

    header.appendChild(button);
  });
}


/* =========================================================
   19. DAY COLUMN
========================================================= */

function renderDayColumn(date) {
  const column = document.createElement("div");

  column.className = "week-column";

  if (activeCalendarView === "day") {
    column.classList.add("day-column");
  }

  if (isSameDay(date, new Date())) {
    column.classList.add("today-column");
  }

  const dateString = formatInputDate(date);

  column.appendChild(
    createManpowerSection(currentVenue, dateString)
  );

  const dayEvents = getDayEvents(dateString);

  if (dayEvents.length === 0) {
    const empty = document.createElement("div");

    empty.className = "view-empty";
    empty.textContent = "No programmes";

    column.appendChild(empty);
  }

  dayEvents.forEach(event => {
    const element = createEventElement(event);

    element.classList.add(
      activeCalendarView === "day"
        ? "day-view-event"
        : "week-view-event"
    );

    column.appendChild(element);
  });

  return column;
}


/* =========================================================
   20. PROGRAMME CARD
========================================================= */

function createEventElement(event) {
  const element = document.createElement("div");

  element.className = "event";

  const endTime = addMinutesToTime(
    event.time,
    event.duration
  );

  element.innerHTML = `
    <div class="event-time">
      ${escapeHtml(formatTime(event.time))}
      -
      ${escapeHtml(formatTime(endTime))}
    </div>

    <div class="event-name">
      ${escapeHtml(event.programme)}
    </div>

    <div class="event-meta">
      ${escapeHtml(getSessionLabel(event))}
      ${
        event.pax !== ""
          ? " · " + escapeHtml(event.pax) + " pax"
          : ""
      }
    </div>
  `;

  element.addEventListener("click", e => {
    e.stopPropagation();
    openEventModal(event);
  });

  return element;
}


/* =========================================================
   21. MANPOWER DISPLAY
========================================================= */

function createManpowerSection(venue, date) {
  const record = getManpower(venue, date);

  const container = document.createElement("div");
  container.className = "manpower-container";

  if (record.staff.length > 0) {
    const heading = document.createElement("div");

    heading.className = "calendar-staff-heading";
    heading.textContent = "Staff on duty";

    container.appendChild(heading);

    const list = document.createElement("div");
    list.className = "calendar-staff-list";

    record.staff.forEach(name => {
      const staff = document.createElement("div");

      staff.className = "calendar-staff-name";
      staff.textContent = name;

      list.appendChild(staff);
    });

    container.appendChild(list);
  }

  const button = document.createElement("button");

  button.type = "button";
  button.className = "manpower-button";

  const present = record.staff.length;

  button.textContent = present
    ? "👥 " +
      present +
      " staff / " +
      REQUIRED_MANPOWER +
      " req."
    : "👥 Set manpower";

  if (present > 0) {
    button.classList.add(
      present >= REQUIRED_MANPOWER
        ? "good"
        : "warning"
    );
  }

  button.addEventListener("click", e => {
    e.stopPropagation();
    openManpowerModal(venue, date);
  });

  container.appendChild(button);

  return container;
}


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
      valueOf("editProgramme") === "__CUSTOM__";

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

    alert("Programme saved successfully.");

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
    "Uploaded (100% Created)"
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
    known ? first.programme : "__CUSTOM__"
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

  setValue("editVenue", first.venue);
  setValue("editStartDate", first.date);

  const [hour, minute] = first.time.split(":");

  setValue("editStartHour", hour);
  setValue("editStartMinute", minute);
  setValue("editStartTime", first.time);

  setValue("editDuration", first.duration);
  setValue("editRemarks", first.remarks);

  setValue(
    "editStatus",
    first.status ||
      "Uploaded (100% Created)"
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
    selectedName === "__CUSTOM__";

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

  const replacement = buildProgrammeEvents({
    programmeName,
    venue: valueOf("editVenue", currentVenue),
    startDate,
    time,
    duration,
    status: valueOf("editStatus"),
    remarks: valueOf("editRemarks").trim(),
    seriesId: oldSeriesId
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

    alert("Programme updated successfully.");

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

  alert("Programme deleted successfully.");
}


/* =========================================================
   30. STAFF CHECKLIST
========================================================= */

function selectedStaff() {
  return Array.from(
    document.querySelectorAll(
      '#staffList input[type="checkbox"]:checked'
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


/* =========================================================
   32. VENUE NAVIGATION
========================================================= */

function updateVenueUI() {
  setValue("venue", currentVenue);

  setText(
    "currentVenueLabel",
    currentVenue
  );

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
  activeCalendarView = valueOf(
    "calendarView",
    "month"
  );

  showCalendarView();
}

function goPrevious() {
  if (showingSummary) {
    summaryPreviousMonthHandler();
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

  // Do not change the Add Programme Start Date.
}

function goNext() {
  if (showingSummary) {
    summaryNextMonthHandler();
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

  // Do not change the Add Programme Start Date.
}

function goToday() {
  currentDate = new Date();

  if (showingSummary) {
    summaryDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    renderProgrammeSummary();
  } else {
    renderCalendar();
  }

  saveCalendarDate();

  // Do not reset the Add Programme Start Date.
}


/* =========================================================
   34. SCREEN VISIBILITY
========================================================= */

function showCalendarView() {
  showingSummary = false;

  toggleHidden("summaryPanel", true);
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

  toggleHidden("calendarArea", true);
  toggleHidden("summaryPanel", false);

  updateSheetTabs();

  renderProgrammeSummary();
}

function renderCurrentScreen() {
  if (showingSummary) {
    renderProgrammeSummary();
  } else {
    renderCalendar();
  }
}

function updateSheetTabs() {
  $("hbbSheetTab")?.classList.toggle(
    "active",
    currentVenue === "HBB" && !showingSummary
  );

  $("othSheetTab")?.classList.toggle(
    "active",
    currentVenue === "OTH" && !showingSummary
  );

  $("summarySheetTab")?.classList.toggle(
    "active",
    showingSummary
  );
}


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


/* =========================================================
   39. CLEAR ALL DATA
   DISABLED FOR SHARED CALENDAR SAFETY
========================================================= */

function clearAllData() {
  alert(
    "Clear All Data is disabled to protect " +
    "the shared calendar."
  );
}


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
