/* =========================================================
   PROGRAMME CALENDAR
   HBB / OTH
   Supabase Backend
   Month / Week / Day Views
========================================================= */


/* =========================================================
   SUPABASE CONNECTION
========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";

const supabaseClient =
  createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

/* =========================================================
   PROGRAMME RULES
========================================================= */

const SERIES_WEEKS = {

  "Manage Knee Health": 6,

  "Manage Metabolic Health": 6,

  "Function - Combat Age-Related Loss of Muscle (CALM) 1.0": 8,

  "Function - Combat Age-Related Loss of Muscle (CALM) 2.0": 6,

  "Strength 1.0": 8,

  "Perform 1.0": 8

};


/* =========================================================
   PAX RULES
========================================================= */

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


/* =========================================================
   STAFF LIST
========================================================= */

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
   APPLICATION STATE
========================================================= */

let events = [];

let manpower = {};

let currentVenue = "HBB";

let currentDate = new Date();

/*
  IMPORTANT:
  Do not call this variable calendarView because
  the HTML element itself has id="calendarView".
*/
let activeCalendarView = "month";

let selectedEventId = null;

let manpowerDate = null;


/* =========================================================
   DOM
========================================================= */

const programmeSelect =
  document.getElementById("programme");

const customProgrammeGroup =
  document.getElementById("customProgrammeGroup");

const customProgrammeInput =
  document.getElementById("customProgramme");

const venueSelect =
  document.getElementById("venue");

const startDateInput =
  document.getElementById("startDate");

const startTimeInput =
  document.getElementById("startTime");

const durationGroup =
  document.getElementById("durationGroup");

const durationPreset =
  document.getElementById("durationPreset");

const customDuration =
  document.getElementById("customDuration");

const remarksInput =
  document.getElementById("remarks");

const statusInput =
  document.getElementById("status");

const calendarGrid =
  document.getElementById("calendarGrid");

const monthTitle =
  document.getElementById("monthTitle");

const currentVenueLabel =
  document.getElementById("currentVenueLabel");

const calendarViewSelect =
  document.getElementById("calendarView");

const hbbSheetTab =
  document.getElementById("hbbSheetTab");

const othSheetTab =
  document.getElementById("othSheetTab");

const eventModal =
  document.getElementById("eventModal");

const editModal =
  document.getElementById("editModal");

const manpowerModal =
  document.getElementById("manpowerModal");


/* =========================================================
   EDIT DOM
========================================================= */

const editProgramme =
  document.getElementById("editProgramme");

const editCustomProgrammeGroup =
  document.getElementById(
    "editCustomProgrammeGroup"
  );

const editCustomProgramme =
  document.getElementById(
    "editCustomProgramme"
  );

const editVenue =
  document.getElementById("editVenue");

const editStartDate =
  document.getElementById("editStartDate");

const editStartTime =
  document.getElementById("editStartTime");

const editDurationGroup =
  document.getElementById("editDurationGroup");

const editDuration =
  document.getElementById("editDuration");

const editRemarks =
  document.getElementById("editRemarks");

const editStatus =
  document.getElementById("editStatus");


/* =========================================================
   STARTUP
========================================================= */

async function initialiseApplication() {

  try {

    startDateInput.value =
      formatInputDate(
        new Date()
      );

    venueSelect.value =
      currentVenue;

    if (calendarViewSelect) {

      calendarViewSelect.value =
        activeCalendarView;

    }

    showLoading();

    await loadAllData();

    renderCalendar();

    hideLoading();

    setupRealtime();

    console.log(
      "Programme Calendar loaded successfully."
    );

  } catch (error) {

    console.error(
      "Application startup error:",
      error
    );

    hideLoading();

    calendarGrid.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          padding:40px;
          text-align:center;
          color:#d93025;
        "
      >
        Unable to load calendar data.
        Check the browser console for details.
      </div>
    `;

  }

}


function showLoading() {

  calendarGrid.innerHTML = `
    <div
      style="
        grid-column:1/-1;
        padding:40px;
        text-align:center;
        color:#5f6368;
      "
    >
      Loading calendar...
    </div>
  `;

}


function hideLoading() {
}


/* =========================================================
   LOAD DATABASE DATA
========================================================= */

async function loadAllData() {

  events =
    await loadProgrammes();

  manpower =
    await loadManpower();

}


/* =========================================================
   LOAD PROGRAMMES
========================================================= */

async function loadProgrammes() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("programmes")
      .select("*")
      .order(
        "date",
        {
          ascending: true
        }
      )
      .order(
        "time",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Supabase programmes error:",
      error
    );

    throw error;

  }


  return (
    data || []
  )
  .map(
    mapDatabaseProgramme
  );

}


/* =========================================================
   LOAD MANPOWER
========================================================= */

async function loadManpower() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("manpower")
      .select("*");


  if (error) {

    console.error(
      "Supabase manpower error:",
      error
    );

    throw error;

  }


  const result = {};


  (
    data || []
  )
  .forEach(
    record => {

      const date =
        normalizeDateString(
          record.date
        );


      result[
        manpowerKey(
          record.venue,
          date
        )
      ] = {

        staff:
          Array.isArray(
            record.staff
          )
            ? record.staff
            : [],

        required:
          record.required ??
          "",

        notes:
          record.notes ??
          ""

      };

    }
  );


  return result;

}


/* =========================================================
   DATABASE -> JAVASCRIPT
========================================================= */

function mapDatabaseProgramme(
  row
) {

  return {

    id:
      row.id,

    seriesId:
      row.series_id,

    programme:
      row.programme,

    venue:
      row.venue,

    date:
      normalizeDateString(
        row.date
      ),

    time:
      normalizeTimeString(
        row.time
      ),

    duration:
      Number(
        row.duration
      ),

    pax:
      row.pax ??
      "",

    status:
      row.status ||
      "",

    remarks:
      row.remarks ||
      "",

    sessionNumber:
      row.session_number ??
      null,

    totalSessions:
      row.total_sessions ??
      1,

    type:
      row.type ||
      (
        row.total_sessions > 1
          ? "Series"
          : "Stand-alone"
      )

  };

}


/* =========================================================
   JAVASCRIPT -> DATABASE
========================================================= */

function mapProgrammeToDatabase(
  event
) {

  return {

    id:
      event.id,

    series_id:
      event.seriesId,

    programme:
      event.programme,

    venue:
      event.venue,

    date:
      event.date,

    time:
      event.time,

    duration:
      Number(
        event.duration
      ),

    pax:
      event.pax === ""
        ? null
        : Number(
            event.pax
          ),

    status:
      event.status ||
      null,

    remarks:
      event.remarks ||
      null,

    session_number:
      event.sessionNumber ??
      null,

    total_sessions:
      event.totalSessions ??
      1,

    type:
      event.type ||
      null

  };

}


/* =========================================================
   VIEW SELECTOR
========================================================= */

if (calendarViewSelect) {

  calendarViewSelect.addEventListener(
    "change",
    () => {

      activeCalendarView =
        calendarViewSelect.value;


      if (
        activeCalendarView ===
        "week"
      ) {

        currentDate =
          startOfWeek(
            currentDate
          );

      }


      renderCalendar();

    }
  );

}


/* =========================================================
   PROGRAMME FORM
========================================================= */

programmeSelect.addEventListener(
  "change",
  () => {

    const isOthers =
      programmeSelect.value ===
      "Others";


    customProgrammeGroup
      .classList
      .toggle(
        "hidden",
        !isOthers
      );


    durationGroup
      .classList
      .toggle(
        "hidden",
        !isOthers
      );


    if (!isOthers) {

      customProgrammeInput.value =
        "";

      durationPreset.value =
        "60";

      customDuration.value =
        "";

      customDuration.disabled =
        true;

    }

  }
);


/* =========================================================
   DURATION SELECTOR
========================================================= */

durationPreset.addEventListener(
  "change",
  () => {

    const isCustom =
      durationPreset.value ===
      "custom";


    customDuration.disabled =
      !isCustom;


    if (!isCustom) {

      customDuration.value =
        "";

    }

  }
);


/* =========================================================
   VENUE TABS
========================================================= */

hbbSheetTab.addEventListener(
  "click",
  () => {

    switchVenue(
      "HBB"
    );

  }
);


othSheetTab.addEventListener(
  "click",
  () => {

    switchVenue(
      "OTH"
    );

  }
);


function switchVenue(
  venue
) {

  currentVenue =
    venue;


  venueSelect.value =
    venue;


  hbbSheetTab
    .classList
    .toggle(
      "active",
      venue === "HBB"
    );


  othSheetTab
    .classList
    .toggle(
      "active",
      venue === "OTH"
    );


  currentVenueLabel.textContent =
    venue;


  renderCalendar();

}


/* =========================================================
   MASTER RENDER
========================================================= */

function renderCalendar() {

  currentVenueLabel.textContent =
    currentVenue;


  if (
    activeCalendarView ===
    "week"
  ) {

    renderWeekView();

    return;

  }


  if (
    activeCalendarView ===
    "day"
  ) {

    renderDayView();

    return;

  }


  renderMonthView();

}


/* =========================================================
   MONTH VIEW
========================================================= */

function renderMonthView() {

  const header =
    document.querySelector(
      ".week-header"
    );


  header.className =
    "week-header";


  header.innerHTML = `

    <div>Sun</div>
    <div>Mon</div>
    <div>Tue</div>
    <div>Wed</div>
    <div>Thu</div>
    <div>Fri</div>
    <div>Sat</div>

  `;


  calendarGrid.className =
    "calendar-grid";


  calendarGrid.innerHTML =
    "";


  const year =
    currentDate.getFullYear();


  const month =
    currentDate.getMonth();


  monthTitle.textContent =
    currentDate.toLocaleDateString(
      "en-SG",
      {
        month:
          "long",

        year:
          "numeric"
      }
    );


  const firstDay =
    new Date(
      year,
      month,
      1
    );


  const firstWeekday =
    firstDay.getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const previousMonthDays =
    new Date(
      year,
      month,
      0
    ).getDate();


  for (
    let index = 0;
    index < 42;
    index++
  ) {

    let cellDate;

    let dayNumber;

    let otherMonth =
      false;


    if (
      index <
      firstWeekday
    ) {

      dayNumber =
        previousMonthDays -
        firstWeekday +
        index +
        1;


      cellDate =
        new Date(
          year,
          month - 1,
          dayNumber
        );


      otherMonth =
        true;

    } else if (
      index <
      firstWeekday +
      daysInMonth
    ) {

      dayNumber =
        index -
        firstWeekday +
        1;


      cellDate =
        new Date(
          year,
          month,
          dayNumber
        );

    } else {

      dayNumber =
        index -
        firstWeekday -
        daysInMonth +
        1;


      cellDate =
        new Date(
          year,
          month + 1,
          dayNumber
        );


      otherMonth =
        true;

    }


    const cell =
      document.createElement(
        "div"
      );


    cell.className =
      "day-cell";


    if (
      otherMonth
    ) {

      cell.classList.add(
        "other-month"
      );

    }


    if (
      isSameDay(
        cellDate,
        new Date()
      )
    ) {

      cell.classList.add(
        "today"
      );

    }


    const dateNumber =
      document.createElement(
        "div"
      );


    dateNumber.className =
      "date-number";


    dateNumber.textContent =
      dayNumber;


    cell.appendChild(
      dateNumber
    );


    const dateString =
      formatInputDate(
        cellDate
      );


    const dayEvents =
      getDayEvents(
        dateString
      );


    dayEvents.forEach(
      event => {

        cell.appendChild(
          createCalendarEventElement(
            event
          )
        );

      }
    );


    cell.appendChild(
      createManpowerButton(
        currentVenue,
        dateString
      )
    );


    calendarGrid.appendChild(
      cell
    );

  }

}


/* =========================================================
   WEEK VIEW
========================================================= */

function renderWeekView() {

  currentDate =
    startOfWeek(
      currentDate
    );


  const dates =
    Array.from(
      {
        length:
          7
      },
      (_, index) =>
        addDays(
          currentDate,
          index
        )
    );


  monthTitle.textContent =
    getViewDateLabel();


  renderFlexibleHeader(
    dates
  );


  calendarGrid.className =
    "calendar-grid week-view";


  calendarGrid.innerHTML =
    "";


  dates.forEach(
    date => {

      calendarGrid.appendChild(
        renderFlexibleDayColumn(
          date
        )
      );

    }
  );

}


/* =========================================================
   DAY VIEW
========================================================= */

function renderDayView() {

  monthTitle.textContent =
    getViewDateLabel();


  renderFlexibleHeader(
    [
      currentDate
    ]
  );


  calendarGrid.className =
    "calendar-grid day-view";


  calendarGrid.innerHTML =
    "";


  calendarGrid.appendChild(
    renderFlexibleDayColumn(
      currentDate
    )
  );

}


/* =========================================================
   HEADER FOR WEEK / DAY
========================================================= */

function renderFlexibleHeader(
  dates
) {

  const header =
    document.querySelector(
      ".week-header"
    );


  header.innerHTML =
    "";


  if (
    activeCalendarView ===
    "day"
  ) {

    header.className =
      "week-header day-view-header";

  } else {

    header.className =
      "week-header week-view-header";

  }


  dates.forEach(
    date => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      if (
        isSameDay(
          date,
          new Date()
        )
      ) {

        button.classList.add(
          "today-header"
        );

      }


      button.textContent =
        date.toLocaleDateString(
          "en-SG",
          {
            weekday:
              "short",

            day:
              "numeric",

            month:
              "short"
          }
        );


      if (
        activeCalendarView ===
        "week"
      ) {

        button.addEventListener(
          "click",
          () => {

            currentDate =
              new Date(
                date
              );


            activeCalendarView =
              "day";


            if (
              calendarViewSelect
            ) {

              calendarViewSelect.value =
                "day";

            }


            renderCalendar();

          }
        );

      }


      header.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   FLEXIBLE DAY COLUMN
========================================================= */

function renderFlexibleDayColumn(
  date
) {

  const column =
    document.createElement(
      "div"
    );


  column.className =
    "week-column";


  if (
    isSameDay(
      date,
      new Date()
    )
  ) {

    column.classList.add(
      "today-column"
    );

  }


  const dateString =
    formatInputDate(
      date
    );


  const dayEvents =
    getDayEvents(
      dateString
    );


  if (
    dayEvents.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "view-empty";


    empty.textContent =
      "No programmes";


    column.appendChild(
      empty
    );

  }


  dayEvents.forEach(
    event => {

      const element =
        createCalendarEventElement(
          event
        );


      if (
        activeCalendarView ===
        "day"
      ) {

        element.classList.add(
          "day-view-event"
        );

      } else {

        element.classList.add(
          "week-view-event"
        );

      }


      column.appendChild(
        element
      );

    }
  );


  column.appendChild(
    createManpowerButton(
      currentVenue,
      dateString
    )
  );


  return column;

}


/* =========================================================
   GET DAY EVENTS
========================================================= */

function getDayEvents(
  dateString
) {

  return events
    .filter(
      event =>
        event.date ===
          dateString &&
        event.venue ===
          currentVenue
    )
    .sort(
      (a, b) =>
        a.time.localeCompare(
          b.time
        )
    );

}


/* =========================================================
   EVENT DISPLAY
========================================================= */

function createCalendarEventElement(
  event
) {

  const element =
    document.createElement(
      "div"
    );


  element.className =
    "event";


  const endTime =
    addMinutesToTime(
      event.time,
      event.duration
    );


  const sessionText =
    event.totalSessions > 1
      ? `W${event.sessionNumber} of ${event.totalSessions}`
      : "Stand-alone";


  const paxText =
    event.pax !== ""
      ? ` · ${event.pax} pax`
      : "";


  element.innerHTML = `

    <div class="event-time">

      ${escapeHtml(
        formatTime(
          event.time
        )
      )}

      -

      ${escapeHtml(
        formatTime(
          endTime
        )
      )}

    </div>


    <div class="event-name">

      ${escapeHtml(
        event.programme
      )}

    </div>


    <div class="event-meta">

      ${escapeHtml(
        sessionText
      )}

      ${escapeHtml(
        paxText
      )}

    </div>

  `;


  element.addEventListener(
    "click",
    clickEvent => {

      clickEvent.stopPropagation();


      openEventModal(
        event
      );

    }
  );


  return element;

}


/* =========================================================
   MANPOWER BUTTON
========================================================= */

function createManpowerButton(
  venue,
  dateString
) {

  const record =
    getManpower(
      venue,
      dateString
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "manpower-button";


  const present =
    record.staff.length;


  const required =
    record.required ===
      ""
      ? null
      : Number(
          record.required
        );


  if (
    present === 0 &&
    required === null
  ) {

    button.textContent =
      "👥 Set manpower";

  } else if (
    required !== null &&
    present >= required
  ) {

    button.classList.add(
      "good"
    );


    button.textContent =
      `👥 ${present} staff / ${required} req.`;

  } else {

    button.classList.add(
      "warning"
    );


    button.textContent =
      `👥 ${present} staff / ${required} req.`;

  }


  button.addEventListener(
    "click",
    clickEvent => {

      clickEvent.stopPropagation();


      openManpowerModal(
        venue,
        dateString
      );

    }
  );


  return button;

}


/* =========================================================
   OPEN PROGRAMME MODAL
========================================================= */

function openEventModal(
  event
) {

  selectedEventId =
    event.id;


  document.getElementById(
    "modalProgramme"
  ).textContent =
    event.programme;


  document.getElementById(
    "modalVenue"
  ).textContent =
    event.venue;


  document.getElementById(
    "modalDate"
  ).textContent =
    formatDisplayDate(
      event.date
    );


  document.getElementById(
    "modalTime"
  ).textContent =
    `${formatTime(
      event.time
    )} - ${formatTime(
      addMinutesToTime(
        event.time,
        event.duration
      )
    )}`;


  document.getElementById(
    "modalDuration"
  ).textContent =
    formatDuration(
      event.duration
    );


  document.getElementById(
    "modalPax"
  ).textContent =
    event.pax === ""
      ? "Not specified"
      : `${event.pax} pax`;


  document.getElementById(
    "modalSession"
  ).textContent =
    event.totalSessions > 1
      ? `Week ${event.sessionNumber} of ${event.totalSessions}`
      : "Stand-alone session";


  document.getElementById(
    "modalStatus"
  ).textContent =
    event.status || "";


  document.getElementById(
    "modalRemarks"
  ).textContent =
    event.remarks || "—";


  eventModal
    .classList
    .add(
      "visible"
    );

}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal() {

  if (!selectedEventId) {
    return;
  }


  const selected =
    events.find(
      event =>
        event.id ===
        selectedEventId
    );


  if (!selected) {
    return;
  }


  const series =
    events
      .filter(
        event =>
          event.seriesId ===
          selected.seriesId
      )
      .sort(
        (a, b) =>
          dateTimeValue(a) -
          dateTimeValue(b)
      );


  const firstEvent =
    series[0];


  if (!firstEvent) {
    return;
  }


  const custom =
    !isKnownProgramme(
      firstEvent.programme
    );


  editProgramme.value =
    custom
      ? "__CUSTOM__"
      : firstEvent.programme;


  editCustomProgrammeGroup
    .classList
    .toggle(
      "hidden",
      !custom
    );


  editCustomProgramme.value =
    custom
      ? firstEvent.programme
      : "";


  editVenue.value =
    firstEvent.venue;


  editStartDate.value =
    firstEvent.date;


  editStartTime.value =
    firstEvent.time;


  editRemarks.value =
    firstEvent.remarks ||
    "";


  editStatus.value =
    firstEvent.status ||
    "Uploaded (100% Created)";


  editDurationGroup
    .classList
    .toggle(
      "hidden",
      !custom
    );


  editDuration.value =
    custom
      ? firstEvent.duration
      : 60;


  eventModal
    .classList
    .remove(
      "visible"
    );


  editModal
    .classList
    .add(
      "visible"
    );

}


/* =========================================================
   SAVE EDIT
========================================================= */

async function saveEdit() {

  if (!selectedEventId) {
    return;
  }


  const selected =
    events.find(
      event =>
        event.id ===
        selectedEventId
    );


  if (!selected) {
    return;
  }


  const oldSeriesId =
    selected.seriesId;


  const firstEvent =
    events
      .filter(
        event =>
          event.seriesId ===
          oldSeriesId
      )
      .sort(
        (a, b) =>
          dateTimeValue(a) -
          dateTimeValue(b)
      )[0];


  if (!firstEvent) {
    return;
  }


  let programmeName;


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    programmeName =
      editCustomProgramme
        .value
        .trim();


    if (!programmeName) {

      alert(
        "Please enter the custom programme name."
      );

      return;

    }

  } else {

    programmeName =
      editProgramme.value;

  }


  const newVenue =
    editVenue.value;


  const newDate =
    editStartDate.value;


  const newTime =
    editStartTime.value;


  if (
    !newDate ||
    !newTime
  ) {

    alert(
      "Please enter a date and time."
    );

    return;

  }


  let newDuration;


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    newDuration =
      Number(
        editDuration.value
      );

  } else {

    newDuration =
      60;

  }


  if (
    !Number.isFinite(
      newDuration
    ) ||
    newDuration <= 0
  ) {

    alert(
      "Please enter a valid duration."
    );

    return;

  }


  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] || 1;


  const newSeries =
    [];


  for (
    let week = 0;
    week < totalSessions;
    week++
  ) {

    const sessionDate =
      addDays(
        parseInputDate(
          newDate
        ),
        week * 7
      );


    newSeries.push({

      id:
        makeId(
          "event"
        ),

      seriesId:
        oldSeriesId,

      programme:
        programmeName,

      venue:
        newVenue,

      date:
        formatInputDate(
          sessionDate
        ),

      time:
        newTime,

      duration:
        newDuration,

      pax:
        getPax(
          programmeName
        ),

      status:
        editStatus.value,

      remarks:
        editRemarks
          .value
          .trim(),

      sessionNumber:
        totalSessions > 1
          ? week + 1
          : null,

      totalSessions,

      type:
        totalSessions > 1
          ? "Series"
          : "Stand-alone"

    });

  }


  try {

    /*
      Remove old series from database.
    */

    const {
      error:
        deleteError
    } =
      await supabaseClient
        .from("programmes")
        .delete()
        .eq(
          "series_id",
          oldSeriesId
        );


    if (deleteError) {

      console.error(
        deleteError
      );

      alert(
        `Unable to update programme: ${deleteError.message}`
      );

      return;

    }


    /*
      Insert updated series.
    */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("programmes")
        .insert(
          newSeries.map(
            mapProgrammeToDatabase
          )
        )
        .select();


    if (error) {

      console.error(
        error
      );

      alert(
        `Unable to save changes: ${error.message}`
      );

      await loadAllData();

      renderCalendar();

      return;

    }


    events =
      events.filter(
        event =>
          event.seriesId !==
          oldSeriesId
      );


    events.push(
      ...(
        data || []
      )
      .map(
        mapDatabaseProgramme
      )
    );


    const date =
      parseInputDate(
        newDate
      );


    if (
      activeCalendarView ===
      "month"
    ) {

      currentDate =
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );

    } else if (
      activeCalendarView ===
      "week"
    ) {

      currentDate =
        startOfWeek(
          date
        );

    } else {

      currentDate =
        date;

    }


    closeEditModal();


    switchVenue(
      newVenue
    );


    alert(
      "Programme updated successfully."
    );

  } catch (
    error
  ) {

    console.error(
      error
    );

    alert(
      "An unexpected error occurred while updating the programme."
    );

  }

}


/* =========================================================
   DELETE PROGRAMME
========================================================= */

async function deleteSelected() {

  if (!selectedEventId) {
    return;
  }


  const selected =
    events.find(
      event =>
        event.id ===
        selectedEventId
    );


  if (!selected) {
    return;
  }


  const message =
    selected.totalSessions > 1

      ? "Delete the entire programme series?"

      : "Delete this session?";


  if (
    !confirm(
      message
    )
  ) {

    return;

  }


  try {

    let query =
      supabaseClient
        .from("programmes")
        .delete();


    if (
      selected.totalSessions > 1
    ) {

      query =
        query.eq(
          "series_id",
          selected.seriesId
        );

    } else {

      query =
        query.eq(
          "id",
          selected.id
        );

    }


    const {
      error
    } =
      await query;


    if (error) {

      console.error(
        error
      );

      alert(
        `Unable to delete programme: ${error.message}`
      );

      return;

    }


    if (
      selected.totalSessions > 1
    ) {

      events =
        events.filter(
          event =>
            event.seriesId !==
            selected.seriesId
        );

    } else {

      events =
        events.filter(
          event =>
            event.id !==
            selected.id
        );

    }


    closeEventModal();


    renderCalendar();

  } catch (
    error
  ) {

    console.error(
      error
    );

    alert(
      "An unexpected error occurred while deleting the programme."
    );

  }

}


/* =========================================================
   CLOSE PROGRAMME MODAL
========================================================= */

function closeEventModal() {

  selectedEventId =
    null;


  eventModal
    .classList
    .remove(
      "visible"
    );

}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModal() {

  editModal
    .classList
    .remove(
      "visible"
    );


  selectedEventId =
    null;

}


/* =========================================================
   MANPOWER
========================================================= */

function manpowerKey(
  venue,
  date
) {

  return `${venue}__${date}`;

}


function getManpower(
  venue,
  date
) {

  return (
    manpower[
      manpowerKey(
        venue,
        date
      )
    ] || {

      staff: [],

      required: "",

      notes: ""

    }
  );

}


/* =========================================================
   OPEN MANPOWER MODAL
========================================================= */

function openManpowerModal(
  venue,
  date
) {

  manpowerDate =
    date;


  const record =
    getManpower(
      venue,
      date
    );


  document.getElementById(
    "manpowerVenue"
  ).textContent =
    venue;


  document.getElementById(
    "manpowerDate"
  ).textContent =
    formatDisplayDate(
      date
    );


  document.getElementById(
    "requiredManpower"
  ).value =
    record.required;


  document.getElementById(
    "manpowerNotes"
  ).value =
    record.notes;


  renderStaffChecklist(
    record.staff
  );


  updateStaffCount();


  updateStaffStatus();


  manpowerModal
    .classList
    .add(
      "visible"
    );

}


/* =========================================================
   STAFF CHECKLIST
========================================================= */

function renderStaffChecklist(
  selected
) {

  const container =
    document.getElementById(
      "staffList"
    );


  container.innerHTML =
    "";


  STAFF_LIST.forEach(
    name => {

      const label =
        document.createElement(
          "label"
        );


      label.className =
        "staff-option";


      const checkbox =
        document.createElement(
          "input"
        );


      checkbox.type =
        "checkbox";


      checkbox.value =
        name;


      checkbox.checked =
        selected.includes(
          name
        );


      checkbox.addEventListener(
        "change",
        () => {

          updateStaffCount();

          updateStaffStatus();

        }
      );


      const text =
        document.createElement(
          "span"
        );


      text.textContent =
        name;


      label.appendChild(
        checkbox
      );


      label.appendChild(
        text
      );


      container.appendChild(
        label
      );

    }
  );

}


/* =========================================================
   SELECTED STAFF
========================================================= */

function selectedStaff() {

  return Array.from(
    document.querySelectorAll(
      '#staffList input[type="checkbox"]:checked'
    )
  )
  .map(
    checkbox =>
      checkbox.value
  );

}


/* =========================================================
   SELECT ALL
========================================================= */

function selectAllStaff() {

  document
    .querySelectorAll(
      '#staffList input[type="checkbox"]'
    )
    .forEach(
      checkbox => {

        checkbox.checked =
          true;

      }
    );


  updateStaffCount();


  updateStaffStatus();

}


/* =========================================================
   CLEAR ALL STAFF
========================================================= */

function clearAllStaff() {

  document
    .querySelectorAll(
      '#staffList input[type="checkbox"]'
    )
    .forEach(
      checkbox => {

        checkbox.checked =
          false;

      }
    );


  updateStaffCount();


  updateStaffStatus();

}


/* =========================================================
   STAFF COUNT
========================================================= */

function updateStaffCount() {

  document.getElementById(
    "presentCount"
  ).textContent =
    selectedStaff().length;

}


/* =========================================================
   STAFF STATUS
========================================================= */

function updateStaffStatus() {

  const status =
    document.getElementById(
      "staffStatus"
    );


  const requiredInput =
    document.getElementById(
      "requiredManpower"
    ).value;


  const present =
    selectedStaff().length;


  status.className =
    "staff-status";


  if (
    requiredInput === ""
  ) {

    status.classList.add(
      "neutral"
    );


    status.textContent =
      "";


    return;

  }


  const required =
    Number(
      requiredInput
    );


  if (
    present >=
    required
  ) {

    status.classList.add(
      "good"
    );


    status.textContent =
      "✓ Adequately staffed";

  } else {

    status.classList.add(
      "warning"
    );


    status.textContent =
      `⚠ Understaffed by ${required - present}`;

  }

}


/* =========================================================
   SAVE MANPOWER
========================================================= */

async function saveManpower() {

  if (!manpowerDate) {
    return;
  }


  const staff =
    selectedStaff();


  const requiredInput =
    document.getElementById(
      "requiredManpower"
    ).value;


  const required =
    requiredInput === ""
      ? null
      : Number(
          requiredInput
        );


  const notes =
    document.getElementById(
      "manpowerNotes"
    ).value
    .trim();


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("manpower")
        .upsert(
          {
            venue:
              currentVenue,

            date:
              manpowerDate,

            staff:
              staff,

            required:
              required,

            notes:
              notes

          },
          {
            onConflict:
              "venue,date"
          }
        )
        .select()
        .single();


    if (error) {

      console.error(
        error
      );


      alert(
        `Unable to save manpower: ${error.message}`
      );


      return;

    }


    manpower[
      manpowerKey(
        currentVenue,
        manpowerDate
      )
    ] = {

      staff:
        Array.isArray(
          data.staff
        )
          ? data.staff
          : [],

      required:
        data.required ??
        "",

      notes:
        data.notes ||
        ""

    };


    closeManpowerModal();


    renderCalendar();

  } catch (
    error
  ) {

    console.error(
      error
    );


    alert(
      "An unexpected error occurred while saving manpower."
    );

  }

}


/* =========================================================
   CLOSE MANPOWER
========================================================= */

function closeManpowerModal() {

  manpowerDate =
    null;


  manpowerModal
    .classList
    .remove(
      "visible"
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function goPrevious() {

  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      addDays(
        startOfWeek(
          currentDate
        ),
        -7
      );

  } else if (
    activeCalendarView ===
    "day"
  ) {

    currentDate =
      addDays(
        currentDate,
        -1
      );

  } else {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );

  }


  renderCalendar();

}


function goNext() {

  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      addDays(
        startOfWeek(
          currentDate
        ),
        7
      );

  } else if (
    activeCalendarView ===
    "day"
  ) {

    currentDate =
      addDays(
        currentDate,
        1
      );

  } else {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );

  }


  renderCalendar();

}


function goToday() {

  currentDate =
    new Date();


  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  if (
    activeCalendarView ===
    "month"
  ) {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

  }


  renderCalendar();

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV(
  venueFilter
) {

  const filteredEvents =
    venueFilter

      ? events.filter(
          event =>
            event.venue ===
            venueFilter
        )

      : [
          ...events
        ];


  const relevantManpower =
    Object.entries(
      manpower
    )
    .filter(
      ([key]) =>
        !venueFilter ||
        key.startsWith(
          `${venueFilter}__`
        )
    );


  if (
    filteredEvents.length ===
      0 &&
    relevantManpower.length ===
      0
  ) {

    alert(
      "There is no data to export."
    );


    return;

  }


  const groups =
    {};


  filteredEvents.forEach(
    event => {

      const key =
        `${event.venue}__${event.seriesId || event.id}`;


      if (
        !groups[key]
      ) {

        groups[key] =
          [];

      }


      groups[key].push(
        event
      );

    }
  );


  const headers = [

    "Month",
    "Remarks",
    "Programme Name",
    "Venue",
    "Date/ Week 1",
    "Time",
    "Duration",
    "Pax",
    "Status",
    "W1",
    "W2",
    "W3",
    "W4",
    "W5",
    "W6",
    "W7",
    "W8",
    "Manpower Present",
    "Manpower Required",
    "Staff Present",
    "Manpower Notes"

  ];


  const rows =
    [];


  Object.values(
    groups
  ).forEach(
    series => {

      series.sort(
        (a, b) =>
          dateTimeValue(a) -
          dateTimeValue(b)
      );


      const first =
        series[0];


      const dayManpower =
        getManpower(
          first.venue,
          first.date
        );


      const row = [

        formatMonth(
          first.date
        ),

        first.remarks ||
          "",

        first.programme ||
          "",

        first.venue ||
          "",

        formatDisplayDate(
          first.date
        ),

        formatTime(
          first.time
        ),

        formatDuration(
          first.duration
        ),

        first.pax ??
          "",

        first.status ||
          "",

        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",

        dayManpower.staff.length,

        dayManpower.required,

        dayManpower.staff.join(
          "; "
        ),

        dayManpower.notes

      ];


      series.forEach(
        event => {

          const week =
            event.sessionNumber ||
            1;


          if (
            week >= 1 &&
            week <= 8
          ) {

            row[
              9 +
              week -
              1
            ] =
              formatShortDate(
                event.date
              );

          }

        }
      );


      rows.push(
        row
      );

    }
  );


  relevantManpower.forEach(
    ([key, record]) => {

      const parts =
        key.split(
          "__"
        );


      const venue =
        parts[0];


      const date =
        parts[1];


      const hasProgramme =
        filteredEvents.some(
          event =>
            event.venue ===
              venue &&
            event.date ===
              date
        );


      if (
        !hasProgramme
      ) {

        rows.push([

          formatMonth(
            date
          ),

          record.notes ||
            "",

          "",

          venue,

          formatDisplayDate(
            date
          ),

          "",

          "",

          "",

          "",

          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",

          Array.isArray(
            record.staff
          )
            ? record.staff.length
            : 0,

          record.required ??
            "",

          Array.isArray(
            record.staff
          )
            ? record.staff.join(
                "; "
              )
            : "",

          record.notes ||
            ""

        ]);

      }

    }
  );


  rows.sort(
    (a, b) =>
      parseDisplayDate(
        a[4]
      ) -
      parseDisplayDate(
        b[4]
      )
  );


  const csv =
    [
      headers,
      ...rows
    ]
    .map(
      row =>
        row
          .map(
            csvEscape
          )
          .join(",")
    )
    .join(
      "\r\n"
    );


  const filename =
    venueFilter

      ? `Programme_Schedule_${venueFilter}.csv`

      : "Programme_Schedule_HBB_OTH.csv";


  downloadCSV(
    csv,
    filename
  );

}


/* =========================================================
   CLEAR ALL DATABASE DATA
========================================================= */

async function clearAllData() {

  if (
    !confirm(
      "This will permanently delete ALL shared programme and manpower data. Continue?"
    )
  ) {

    return;

  }


  try {

    const {
      error:
        programmeError
    } =
      await supabaseClient
        .from("programmes")
        .delete()
        .neq(
          "id",
          ""
        );


    if (
      programmeError
    ) {

      throw programmeError;

    }


    const {
      error:
        manpowerError
    } =
      await supabaseClient
        .from("manpower")
        .delete()
        .neq(
          "venue",
          ""
        );


    if (
      manpowerError
    ) {

      throw manpowerError;

    }


    events =
      [];


    manpower =
      {};


    renderCalendar();


    alert(
      "All shared data has been cleared."
    );

  } catch (
    error
  ) {

    console.error(
      error
    );


    alert(
      `Unable to clear database: ${error.message}`
    );

  }

}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

  programmeSelect.value =
    "";


  customProgrammeInput.value =
    "";


  customProgrammeGroup
    .classList
    .add(
      "hidden"
    );


  durationGroup
    .classList
    .add(
      "hidden"
    );


  durationPreset.value =
    "60";


  customDuration.value =
    "";


  customDuration.disabled =
    true;


  venueSelect.value =
    currentVenue;


  startDateInput.value =
    formatInputDate(
      new Date()
    );


  startTimeInput.value =
    "09:00";


  remarksInput.value =
    "";


  statusInput.value =
    "Uploaded (100% Created)";

}


/* =========================================================
   REALTIME DATABASE UPDATES
========================================================= */

function setupRealtime() {

  supabaseClient
    .channel(
      "programme-calendar"
    )

    .on(
      "postgres_changes",
      {
        event:
          "*",

        schema:
          "public",

        table:
          "programmes"
      },
      async () => {

        await refreshData();

      }
    )

    .on(
      "postgres_changes",
      {
        event:
          "*",

        schema:
          "public",

        table:
          "manpower"
      },
      async () => {

        await refreshData();

      }
    )

    .subscribe(
      status => {

        console.log(
          "Realtime status:",
          status
        );

      }
    );

}


async function refreshData() {

  try {

    await loadAllData();


    renderCalendar();

  } catch (
    error
  ) {

    console.error(
      "Realtime refresh error:",
      error
    );

  }

}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function isKnownProgramme(
  name
) {

  return Object.prototype.hasOwnProperty.call(
    PAX,
    name
  );

}


function parseInputDate(
  value
) {

  if (
    value instanceof Date
  ) {

    return new Date(
      value
    );

  }


  const parts =
    String(
      value
    )
    .substring(
      0,
      10
    )
    .split("-")
    .map(
      Number
    );


  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );

}


function normalizeDateString(
  value
) {

  return String(
    value
  )
  .substring(
    0,
    10
  );

}


function normalizeTimeString(
  value
) {

  return String(
    value
  )
  .substring(
    0,
    5
  );

}


function formatInputDate(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
    .padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    )
    .padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


function addDays(
  date,
  days
) {

  const result =
    new Date(
      date
    );


  result.setDate(
    result.getDate() +
    days
  );


  return result;

}


function startOfWeek(
  date
) {

  const result =
    new Date(
      date
    );


  result.setHours(
    0,
    0,
    0,
    0
  );


  result.setDate(
    result.getDate() -
    result.getDay()
  );


  return result;

}


function addMinutesToTime(
  time,
  minutes
) {

  const [
    hours,
    mins
  ] =
    String(
      time
    )
    .split(":")
    .map(
      Number
    );


  const total =
    hours * 60 +
    mins +
    Number(
      minutes
    );


  const newHours =
    Math.floor(
      total / 60
    ) % 24;


  const newMinutes =
    total % 60;


  return `${String(
    newHours
  ).padStart(
    2,
    "0"
  )}:${String(
    newMinutes
  ).padStart(
    2,
    "0"
  )}`;

}


function formatTime(
  time
) {

  const [
    hours,
    minutes
  ] =
    String(
      time
    )
    .split(":")
    .map(
      Number
    );


  const date =
    new Date();


  date.setHours(
    hours,
    minutes,
    0,
    0
  );


  return date.toLocaleTimeString(
    "en-SG",
    {
      hour:
        "numeric",

      minute:
        "2-digit"
    }
  );

}


function formatDuration(
  minutes
) {

  const total =
    Number(
      minutes
    );


  if (
    total < 60
  ) {

    return `${total} min`;

  }


  const hours =
    Math.floor(
      total / 60
    );


  const remaining =
    total % 60;


  if (
    remaining ===
    0
  ) {

    return `${hours} hour${hours === 1 ? "" : "s"}`;

  }


  return `${hours} hr ${remaining} min`;

}


function formatDisplayDate(
  dateString
) {

  return parseInputDate(
    dateString
  )
  .toLocaleDateString(
    "en-SG",
    {
      weekday:
        "short",

      day:
        "numeric",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


function formatShortDate(
  dateString
) {

  return parseInputDate(
    dateString
  )
  .toLocaleDateString(
    "en-SG",
    {
      day:
        "numeric",

      month:
        "short"
    }
  );

}


function formatMonth(
  dateString
) {

  return parseInputDate(
    dateString
  )
  .toLocaleDateString(
    "en-SG",
    {
      month:
        "short"
    }
  );

}


function dateTimeValue(
  event
) {

  return new Date(
    `${event.date}T${event.time}`
  ).getTime();

}


function parseDisplayDate(
  value
) {

  return new Date(
    String(
      value
    )
    .replace(
      /^[A-Za-z]+,\s*/,
      ""
    )
  ).getTime();

}


function isSameDay(
  a,
  b
) {

  return (

    a.getFullYear() ===
      b.getFullYear()

    &&

    a.getMonth() ===
      b.getMonth()

    &&

    a.getDate() ===
      b.getDate()

  );

}


function makeId(
  prefix
) {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {

    return (
      prefix +
      "_" +
      window.crypto.randomUUID()
    );

  }


  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


function escapeHtml(
  value
) {

  return String(
    value
  )
  .replace(
    /&/g,
    "&amp;"
  )
  .replace(
    /</g,
    "&lt;"
  )
  .replace(
    />/g,
    "&gt;"
  )
  .replace(
    /"/g,
    "&quot;"
  )
  .replace(
    /'/g,
    "&#039;"
  );

}


/* =========================================================
   CSV DOWNLOAD
========================================================= */

function downloadCSV(
  csv,
  filename
) {

  const blob =
    new Blob(
      [
        "\uFEFF",
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

}


/* =========================================================
   FINAL EVENT LISTENERS
========================================================= */

document
  .getElementById("addButton")
  .addEventListener(
    "click",
    addProgramme
  );


document
  .getElementById("editButton")
  .addEventListener(
    "click",
    openEditModal
  );


document
  .getElementById("deleteButton")
  .addEventListener(
    "click",
    deleteSelected
  );


document
  .getElementById("closeButton")
  .addEventListener(
    "click",
    closeEventModal
  );


document
  .getElementById("saveEditButton")
  .addEventListener(
    "click",
    saveEdit
  );


document
  .getElementById("cancelEditButton")
  .addEventListener(
    "click",
    closeEditModal
  );


document
  .getElementById("saveManpower")
  .addEventListener(
    "click",
    saveManpower
  );


document
  .getElementById("closeManpower")
  .addEventListener(
    "click",
    closeManpowerModal
  );


document
  .getElementById("selectAllStaff")
  .addEventListener(
    "click",
    selectAllStaff
  );


document
  .getElementById("clearAllStaff")
  .addEventListener(
    "click",
    clearAllStaff
  );


document
  .getElementById("previousButton")
  .addEventListener(
    "click",
    goPrevious
  );


document
  .getElementById("nextButton")
  .addEventListener(
    "click",
    goNext
  );


document
  .getElementById("todayButton")
  .addEventListener(
    "click",
    goToday
  );


document
  .getElementById("exportCurrentButton")
  .addEventListener(
    "click",
    () => {

      exportCSV(
        currentVenue
      );

    }
  );


document
  .getElementById("exportAllButton")
  .addEventListener(
    "click",
    () => {

      exportCSV(
        null
      );

    }
  );


document
  .getElementById("clearButton")
  .addEventListener(
    "click",
    clearAllData
  );


/* =========================================================
   MODAL BACKDROP LISTENERS
========================================================= */

eventModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      eventModal
    ) {

      closeEventModal();

    }

  }
);


editModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      editModal
    ) {

      closeEditModal();

    }

  }
);


manpowerModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      manpowerModal
    ) {

      closeManpowerModal();

    }

  }
);


/* =========================================================
   EDIT PROGRAMME SELECT
========================================================= */

editProgramme.addEventListener(
  "change",
  () => {

    const custom =
      editProgramme.value ===
      "__CUSTOM__";


    editCustomProgrammeGroup
      .classList
      .toggle(
        "hidden",
        !custom
      );


    editDurationGroup
      .classList
      .toggle(
        "hidden",
        !custom
      );


    if (!custom) {

      editCustomProgramme.value =
        "";

      editDuration.value =
        60;

    }

  }
);
