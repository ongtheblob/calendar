/* =========================================================
   PROGRAMME CALENDAR
   HBB / OTH
   Supabase backend
   Month / Week / Day
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";


let supabaseClient = null;


/*
  Try to initialise Supabase.

  IMPORTANT:
  The calendar will still render if Supabase
  is unavailable.
*/

if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

} else {

  console.warn(
    "Supabase library not loaded."
  );

}


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
   PAX
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
   STAFF
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

let currentVenue =
  "HBB";

let currentDate =
  new Date();

let activeCalendarView =
  "month";

let selectedEventId =
  null;

let manpowerDate =
  null;


/* =========================================================
   DOM
========================================================= */

const programmeSelect =
  document.getElementById(
    "programme"
  );

const customProgrammeGroup =
  document.getElementById(
    "customProgrammeGroup"
  );

const customProgrammeInput =
  document.getElementById(
    "customProgramme"
  );

const venueSelect =
  document.getElementById(
    "venue"
  );

const startDateInput =
  document.getElementById(
    "startDate"
  );

const startTimeInput =
  document.getElementById(
    "startTime"
  );

const durationGroup =
  document.getElementById(
    "durationGroup"
  );

const durationPreset =
  document.getElementById(
    "durationPreset"
  );

const customDuration =
  document.getElementById(
    "customDuration"
  );

const remarksInput =
  document.getElementById(
    "remarks"
  );

const statusInput =
  document.getElementById(
    "status"
  );

const calendarGrid =
  document.getElementById(
    "calendarGrid"
  );

const monthTitle =
  document.getElementById(
    "monthTitle"
  );

const currentVenueLabel =
  document.getElementById(
    "currentVenueLabel"
  );

const calendarViewSelect =
  document.getElementById(
    "calendarView"
  );

const hbbSheetTab =
  document.getElementById(
    "hbbSheetTab"
  );

const othSheetTab =
  document.getElementById(
    "othSheetTab"
  );

const eventModal =
  document.getElementById(
    "eventModal"
  );

const editModal =
  document.getElementById(
    "editModal"
  );

const manpowerModal =
  document.getElementById(
    "manpowerModal"
  );


/* =========================================================
   EDIT DOM
========================================================= */

const editProgramme =
  document.getElementById(
    "editProgramme"
  );

const editCustomProgrammeGroup =
  document.getElementById(
    "editCustomProgrammeGroup"
  );

const editCustomProgramme =
  document.getElementById(
    "editCustomProgramme"
  );

const editVenue =
  document.getElementById(
    "editVenue"
  );

const editStartDate =
  document.getElementById(
    "editStartDate"
  );

const editStartTime =
  document.getElementById(
    "editStartTime"
  );

const editDurationGroup =
  document.getElementById(
    "editDurationGroup"
  );

const editDuration =
  document.getElementById(
    "editDuration"
  );

const editRemarks =
  document.getElementById(
    "editRemarks"
  );

const editStatus =
  document.getElementById(
    "editStatus"
  );


/* =========================================================
   STARTUP
========================================================= */

function startApplication() {

  try {

    startDateInput.value =
      formatInputDate(
        new Date()
      );

    venueSelect.value =
      currentVenue;

    if (
      calendarViewSelect
    ) {

      calendarViewSelect.value =
        activeCalendarView;

    }


    /*
      Render immediately.
      This is intentionally before Supabase.
    */

    renderCalendar();


    /*
      Load database in the background.
    */

    loadDatabase();


  } catch (
    error
  ) {

    console.error(
      "Startup error:",
      error
    );

  }

}


startApplication();


/* =========================================================
   LOAD DATABASE
========================================================= */

async function loadDatabase() {

  if (!supabaseClient) {

    console.warn(
      "Supabase is unavailable. Running frontend only."
    );

    return;

  }


  try {

    await loadProgrammes();

    await loadManpower();

    renderCalendar();

    setupRealtime();

  } catch (
    error
  ) {

    console.error(
      "Supabase loading error:",
      error
    );

    /*
      IMPORTANT:
      Do not blank the calendar if the database
      has an error.
    */

    renderCalendar();

  }

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
          ascending:
            true
        }
      )
      .order(
        "time",
        {
          ascending:
            true
        }
      );


  if (error) {

    throw error;

  }


  events =
    (
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

    throw error;

  }


  manpower =
    {};


  (
    data || []
  )
  .forEach(
    record => {

      manpower[
        manpowerKey(
          record.venue,
          normalizeDateString(
            record.date
          )
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
          record.notes ||
          ""

      };

    }
  );

}


/* =========================================================
   DATABASE -> APPLICATION
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
        row.duration ||
        60
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
      "Stand-alone"

  };

}


/* =========================================================
   APPLICATION -> DATABASE
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


/* =========================================================
   VENUE SWITCHING
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
   RENDER CONTROLLER
========================================================= */

function renderCalendar() {

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

  calendarGrid.className =
    "calendar-grid";


  calendarGrid.innerHTML =
    "";


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
    let i = 0;
    i < 42;
    i++
  ) {

    let cellDate;

    let dayNumber;

    let otherMonth =
      false;


    if (
      i < firstWeekday
    ) {

      dayNumber =
        previousMonthDays -
        firstWeekday +
        i +
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
      i <
      firstWeekday +
      daysInMonth
    ) {

      dayNumber =
        i -
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
        i -
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


    const number =
      document.createElement(
        "div"
      );


    number.className =
      "date-number";


    number.textContent =
      dayNumber;


    cell.appendChild(
      number
    );


    const dateString =
      formatInputDate(
        cellDate
      );


    getDayEvents(
      dateString
    ).forEach(
      event => {

        cell.appendChild(
          createEventElement(
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


  calendarGrid.className =
    "calendar-grid week-view";


  calendarGrid.innerHTML =
    "";


  const dates =
    Array.from(
      {
        length:
          7
      },
      (_, i) =>
        addDays(
          currentDate,
          i
        )
    );


  monthTitle.textContent =
    getViewDateLabel();


  renderFlexibleHeader(
    dates
  );


  dates.forEach(
    date => {

      calendarGrid.appendChild(
        renderDayColumn(
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

  calendarGrid.className =
    "calendar-grid day-view";


  calendarGrid.innerHTML =
    "";


  monthTitle.textContent =
    getViewDateLabel();


  renderFlexibleHeader(
    [
      currentDate
    ]
  );


  calendarGrid.appendChild(
    renderDayColumn(
      currentDate
    )
  );

}


/* =========================================================
   WEEK / DAY HEADER
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


  header.className =
    activeCalendarView ===
    "day"
      ? "week-header day-view-header"
      : "week-header week-view-header";


  dates.forEach(
    date => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


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
        isSameDay(
          date,
          new Date()
        )
      ) {

        button.classList.add(
          "today-header"
        );

      }


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


            calendarViewSelect.value =
              "day";


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
   DAY COLUMN
========================================================= */

function renderDayColumn(
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
        createEventElement(
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
   EVENTS
========================================================= */

function getDayEvents(
  date
) {

  return events
    .filter(
      event =>
        event.date ===
          date &&
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


function createEventElement(
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


function createManpowerButton(
  venue,
  date
) {

  const record =
    getManpower(
      venue,
      date
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
    event => {

      event.stopPropagation();


      openManpowerModal(
        venue,
        date
      );

    }
  );


  return button;

}


/* =========================================================
   ADD PROGRAMME
========================================================= */

document
  .getElementById(
    "addButton"
  )
  .addEventListener(
    "click",
    addProgramme
  );


async function addProgramme() {

  const selected =
    programmeSelect.value;


  if (!selected) {

    alert(
      "Please select a programme."
    );

    return;

  }


  let programmeName =
    selected;


  if (
    selected ===
    "Others"
  ) {

    programmeName =
      customProgrammeInput
        .value
        .trim();


    if (!programmeName) {

      alert(
        "Please enter the Other Programme name."
      );

      return;

    }

  }


  const venue =
    venueSelect.value;


  const startDate =
    startDateInput.value;


  const startTime =
    startTimeInput.value;


  if (
    !startDate ||
    !startTime
  ) {

    alert(
      "Please enter a first session date and time."
    );

    return;

  }


  const duration =
    getProgrammeDuration(
      programmeName
    );


  if (
    !Number.isFinite(
      duration
    ) ||
    duration <= 0
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


  const seriesId =
    makeId(
      "series"
    );


  const newEvents =
    [];


  for (
    let week = 0;
    week < totalSessions;
    week++
  ) {

    const sessionDate =
      addDays(
        parseInputDate(
          startDate
        ),
        week * 7
      );


    newEvents.push({

      id:
        makeId(
          "event"
        ),

      seriesId,

      programme:
        programmeName,

      venue,

      date:
        formatInputDate(
          sessionDate
        ),

      time:
        startTime,

      duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        statusInput.value,

      remarks:
        remarksInput.value
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


  /*
    Always update the visible app immediately.
  */

  events.push(
    ...newEvents
  );


  renderCalendar();


  /*
    Then try Supabase.
  */

  if (supabaseClient) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("programmes")
        .insert(
          newEvents.map(
            mapProgrammeToDatabase
          )
        )
        .select();


    if (error) {

      console.error(
        "Supabase save error:",
        error
      );


      alert(
        `The programme appeared locally but was not saved to the shared database: ${error.message}`
      );


      return;

    }


    /*
      Replace the locally-created IDs
      with the database rows.
    */

    events =
      events.filter(
        event =>
          !newEvents.some(
            item =>
              item.id ===
              event.id
          )
      );


    events.push(
      ...(
        data || []
      )
      .map(
        mapDatabaseProgramme
      )
    );


    renderCalendar();

  }


  resetForm();

}


/* =========================================================
   DURATION
========================================================= */

function getProgrammeDuration(
  name
) {

  if (
    name !==
    "Others"
  ) {

    return 60;

  }


  if (
    durationPreset.value !==
    "custom"
  ) {

    return Number(
      durationPreset.value
    );

  }


  return Number(
    customDuration.value
  );

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
   EDIT
========================================================= */

document
  .getElementById(
    "editProgramme"
  )
  .addEventListener(
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

    }
  );


async function openEditModal() {

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


  const first =
    series[0];


  const custom =
    !isKnownProgramme(
      first.programme
    );


  editProgramme.value =
    custom
      ? "__CUSTOM__"
      : first.programme;


  editCustomProgramme.value =
    custom
      ? first.programme
      : "";


  editCustomProgrammeGroup
    .classList
    .toggle(
      "hidden",
      !custom
    );


  editVenue.value =
    first.venue;


  editStartDate.value =
    first.date;


  editStartTime.value =
    first.time;


  editDuration.value =
    first.duration;


  editDurationGroup
    .classList
    .toggle(
      "hidden",
      !custom
    );


  editRemarks.value =
    first.remarks ||
    "";


  editStatus.value =
    first.status ||
    "Uploaded (100% Created)";


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


  let programmeName;


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    programmeName =
      editCustomProgramme
        .value
        .trim();

  } else {

    programmeName =
      editProgramme.value;

  }


  if (!programmeName) {

    alert(
      "Please select or enter a programme."
    );

    return;

  }


  const newVenue =
    editVenue.value;


  const newDate =
    editStartDate.value;


  const newTime =
    editStartTime.value;


  const newDuration =
    editProgramme.value ===
      "__CUSTOM__"
      ? Number(
          editDuration.value
        )
      : 60;


  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] || 1;


  const replacement =
    [];


  for (
    let i = 0;
    i < totalSessions;
    i++
  ) {

    replacement.push({

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
          addDays(
            parseInputDate(
              newDate
            ),
            i * 7
          )
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
        editRemarks.value
          .trim(),

      sessionNumber:
        totalSessions > 1
          ? i + 1
          : null,

      totalSessions,

      type:
        totalSessions > 1
          ? "Series"
          : "Stand-alone"

    });

  }


  if (supabaseClient) {

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

      alert(
        `Unable to update programme: ${deleteError.message}`
      );

      return;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("programmes")
        .insert(
          replacement.map(
            mapProgrammeToDatabase
          )
        )
        .select();


    if (error) {

      alert(
        `Unable to save programme: ${error.message}`
      );

      await loadProgrammes();

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

  } else {

    events =
      events.filter(
        event =>
          event.seriesId !==
          oldSeriesId
      );


    events.push(
      ...replacement
    );

  }


  currentDate =
    parseInputDate(
      newDate
    );


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

  } else if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  closeEditModal();

  switchVenue(
    newVenue
  );

}


/* =========================================================
   DELETE
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


  if (supabaseClient) {

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

      alert(
        `Unable to delete programme: ${error.message}`
      );

      return;

    }

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

}


/* =========================================================
   EVENT MODAL
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
    event.remarks ||
    "—";


  eventModal
    .classList
    .add(
      "visible"
    );

}


/* =========================================================
   CLOSE MODALS
========================================================= */

document
  .getElementById(
    "closeButton"
  )
  .addEventListener(
    "click",
    closeEventModal
  );


document
  .getElementById(
    "cancelEditButton"
  )
  .addEventListener(
    "click",
    closeEditModal
  );


function closeEventModal() {

  selectedEventId =
    null;


  eventModal
    .classList
    .remove(
      "visible"
    );

}


function closeEditModal() {

  selectedEventId =
    null;


  editModal
    .classList
    .remove(
      "visible"
    );

}


/* =========================================================
   MANPOWER MODAL
========================================================= */

document
  .getElementById(
    "selectAllStaff"
  )
  .addEventListener(
    "click",
    selectAllStaff
  );


document
  .getElementById(
    "clearAllStaff"
  )
  .addEventListener(
    "click",
    clearAllStaff
  );


document
  .getElementById(
    "saveManpower"
  )
  .addEventListener(
    "click",
    saveManpower
  );


document
  .getElementById(
    "closeManpower"
  )
  .addEventListener(
    "click",
    closeManpowerModal
  );


document
  .getElementById(
    "requiredManpower"
  )
  .addEventListener(
    "input",
    updateStaffStatus
  );


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


function updateStaffCount() {

  document.getElementById(
    "presentCount"
  ).textContent =
    selectedStaff().length;

}


function updateStaffStatus() {

  const status =
    document.getElementById(
      "staffStatus"
    );


  const required =
    document.getElementById(
      "requiredManpower"
    ).value;


  const present =
    selectedStaff().length;


  status.className =
    "staff-status";


  if (
    required ===
    ""
  ) {

    status.textContent =
      "";

    return;

  }


  if (
    present >=
    Number(required)
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
      `⚠ Understaffed by ${Number(required) - present}`;

  }

}


async function saveManpower() {

  if (!manpowerDate) {
    return;
  }


  const record = {

    venue:
      currentVenue,

    date:
      manpowerDate,

    staff:
      selectedStaff(),

    required:
      document.getElementById(
        "requiredManpower"
      ).value === ""
        ? null
        : Number(
            document.getElementById(
              "requiredManpower"
            ).value
          ),

    notes:
      document.getElementById(
        "manpowerNotes"
      ).value.trim()

  };


  if (supabaseClient) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("manpower")
        .upsert(
          record,
          {
            onConflict:
              "venue,date"
          }
        )
        .select()
        .single();


    if (error) {

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
        data.staff || [],

      required:
        data.required ??
        "",

      notes:
        data.notes ||
        ""

    };

  } else {

    manpower[
      manpowerKey(
        currentVenue,
        manpowerDate
      )
    ] = {

      staff:
        record.staff,

      required:
        record.required ??
        "",

      notes:
        record.notes

    };

  }


  closeManpowerModal();


  renderCalendar();

}


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

document
  .getElementById(
    "previousButton"
  )
  .addEventListener(
    "click",
    goPrevious
  );


document
  .getElementById(
    "nextButton"
  )
  .addEventListener(
    "click",
    goNext
  );


document
  .getElementById(
    "todayButton"
  )
  .addEventListener(
    "click",
    goToday
  );


function goPrevious() {

  if (
    activeCalendarView ===
    "day"
  ) {

    currentDate =
      addDays(
        currentDate,
        -1
      );

  } else if (
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
    "day"
  ) {

    currentDate =
      addDays(
        currentDate,
        1
      );

  } else if (
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
    "month"
  ) {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

  } else if (
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


/* =========================================================
   REALTIME
========================================================= */

function setupRealtime() {

  if (!supabaseClient) {
    return;
  }


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

        await refreshDatabase();

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

        await refreshDatabase();

      }
    )

    .subscribe();

}


async function refreshDatabase() {

  try {

    await loadProgrammes();

    await loadManpower();

    renderCalendar();

  } catch (
    error
  ) {

    console.error(
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


  const [
    year,
    month,
    day
  ] =
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
    year,
    month - 1,
    day
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
    total <
    60
  ) {

    return `${total} min`;

  }


  const hours =
    Math.floor(
      total /
      60
    );


  const remaining =
    total %
    60;


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
   CSV
========================================================= */

document
  .getElementById(
    "exportCurrentButton"
  )
  .addEventListener(
    "click",
    () =>
      exportCSV(
        currentVenue
      )
  );


document
  .getElementById(
    "exportAllButton"
  )
  .addEventListener(
    "click",
    () =>
      exportCSV(
        null
      )
  );


function exportCSV(
  venueFilter
) {

  const filtered =
    venueFilter
      ? events.filter(
          event =>
            event.venue ===
            venueFilter
        )
      : [
          ...events
        ];


  if (
    filtered.length ===
    0
  ) {

    alert(
      "There is no programme data to export."
    );


    return;

  }


  const headers = [

    "Programme Name",
    "Venue",
    "Date",
    "Time",
    "Duration",
    "Pax",
    "Status",
    "Remarks",
    "Session",
    "Total Sessions"

  ];


  const rows =
    filtered
      .sort(
        (a, b) =>
          dateTimeValue(a) -
          dateTimeValue(b)
      )
      .map(
        event => [

          event.programme,

          event.venue,

          event.date,

          event.time,

          formatDuration(
            event.duration
          ),

          event.pax,

          event.status,

          event.remarks,

          event.sessionNumber ||
            "",

          event.totalSessions

        ]
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


  downloadCSV(
    csv,
    venueFilter
      ? `Programme_Schedule_${venueFilter}.csv`
      : "Programme_Schedule_HBB_OTH.csv"
  );

}


function csvEscape(
  value
) {

  const text =
    value === null ||
    value === undefined
      ? ""
      : String(
          value
        );


  return `"${text.replace(
    /"/g,
    '""'
  )}"`;

}


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
