/* =========================================================
   PROGRAMME CALENDAR
   Supabase + Month / Week / Day
   Monthly Programme Summary
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";


let supabaseClient = null;


if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

  console.log(
    "Supabase client initialised."
  );

} else {

  console.error(
    "Supabase library was not loaded."
  );

}


/* =========================================================
   SETTINGS
========================================================= */

const REQUIRED_MANPOWER = 2;


/*
  Normal series length.

  These are consecutive weekly sessions.
*/

const SERIES_WEEKS = {

  "Manage Knee Health":
    6,

  "Manage Metabolic Health":
    6,

  "Function - Combat Age-Related Loss of Muscle (CALM) 1.0":
    8,

  "Function - Combat Age-Related Loss of Muscle (CALM) 2.0":
    6,

  "Strength 1.0":
    8,

  "Perform 1.0":
    8

};


/*
  Additional Week 14 session.

  This means these programmes have:

  Week 1
  Week 2
  Week 3
  Week 4
  Week 5
  Week 6
  Week 14
*/

const WEEK_14_PROGRAMMES = [

  "Manage Knee Health",

  "Manage Metabolic Health"

];


const PAX = {

  "Strength 1.0":
    12,

  "Strength 2.0 - Foundation Strength Workout":
    14,

  "Strength 2.0 - Functional Fitness Workout":
    12,

  "Strength 2.0 - Mobility Workout":
    12,

  "Strength 2.0 - Assessment & Check-In":
    10,

  "Perform 1.0":
    10,

  "Perform 2.0 - Multi-Modal Workout":
    12,

  "Perform 2.0 - AMRAP Workout":
    12,

  "Perform 2.0 - ENGINE Workout":
    12,

  "Perform 2.0 - Assessment & Check-In":
    10,

  "Function - Combat Age-Related Loss of Muscle (CALM) 1.0":
    12,

  "Function - Combat Age-Related Loss of Muscle (CALM) 2.0":
    14,

  "Manage Knee Health":
    8,

  "Manage Metabolic Health":
    8,

  "Body Composition Assessment":
    16,

  "Active Health Senior Interest Group":
    12

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


/*
  Summary state.
*/

let showingSummary =
  false;

let summaryDate =
  new Date();


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {

  return document.getElementById(
    id
  );

}


/* =========================================================
   DOM REFERENCES
========================================================= */

const programmeSelect =
  $("programme");

const customProgrammeGroup =
  $("customProgrammeGroup");

const customProgrammeInput =
  $("customProgramme");

const venueSelect =
  $("venue");

const startDateInput =
  $("startDate");

const startTimeInput =
  $("startTime");

const startHour =
  $("startHour");

const startMinute =
  $("startMinute");

const durationGroup =
  $("durationGroup");

const durationPreset =
  $("durationPreset");

const customDuration =
  $("customDuration");

const remarksInput =
  $("remarks");

const statusInput =
  $("status");

const calendarGrid =
  $("calendarGrid");

const monthTitle =
  $("monthTitle");

const currentVenueLabel =
  $("currentVenueLabel");

const calendarViewSelect =
  $("calendarView");

const hbbSheetTab =
  $("hbbSheetTab");

const othSheetTab =
  $("othSheetTab");

const eventModal =
  $("eventModal");

const editModal =
  $("editModal");

const manpowerModal =
  $("manpowerModal");


/* =========================================================
   EDIT REFERENCES
========================================================= */

const editProgramme =
  $("editProgramme");

const editCustomProgrammeGroup =
  $("editCustomProgrammeGroup");

const editCustomProgramme =
  $("editCustomProgramme");

const editVenue =
  $("editVenue");

const editStartDate =
  $("editStartDate");

const editStartTime =
  $("editStartTime");

const editStartHour =
  $("editStartHour");

const editStartMinute =
  $("editStartMinute");

const editDurationGroup =
  $("editDurationGroup");

const editDuration =
  $("editDuration");

const editRemarks =
  $("editRemarks");

const editStatus =
  $("editStatus");


/* =========================================================
   SUMMARY REFERENCES
========================================================= */

const summarySheetTab =
  $("summarySheetTab");

const summaryPanel =
  $("summaryPanel");

const summaryMonth =
  $("summaryMonth");

const summarySubtitle =
  $("summarySubtitle");

const summaryTableBody =
  $("summaryTableBody");

const summaryTotal =
  $("summaryTotal");

const summaryPreviousMonth =
  $("summaryPreviousMonth");

const summaryNextMonth =
  $("summaryNextMonth");


/* =========================================================
   DATE FUNCTIONS
========================================================= */

function parseInputDate(
  value
) {

  const parts =
    String(
      value
    )
    .substring(
      0,
      10
    )
    .split(
      "-"
    )
    .map(
      Number
    );


  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );

}


function formatInputDate(
  date
) {

  return (
    `${date.getFullYear()}-` +
    `${String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-` +
    `${String(
      date.getDate()
    ).padStart(
      2,
      "0"
    )}`
  );

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


/* =========================================================
   TIME FUNCTIONS
========================================================= */

function isValidHalfHourTime(
  time
) {

  if (
    !time ||
    typeof time !==
      "string"
  ) {

    return false;

  }


  const parts =
    time.split(":");


  if (
    parts.length < 2
  ) {

    return false;

  }


  const minutes =
    Number(
      parts[1]
    );


  return (
    minutes === 0 ||
    minutes === 30
  );

}


function getAddTime() {

  if (
    startHour &&
    startMinute
  ) {

    return (
      String(
        startHour.value
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        startMinute.value
      ).padStart(
        2,
        "0"
      )
    );

  }


  if (
    startTimeInput
  ) {

    return String(
      startTimeInput.value
    ).substring(
      0,
      5
    );

  }


  return "";

}


function getEditTime() {

  if (
    editStartHour &&
    editStartMinute
  ) {

    return (
      String(
        editStartHour.value
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        editStartMinute.value
      ).padStart(
        2,
        "0"
      )
    );

  }


  if (
    editStartTime
  ) {

    return String(
      editStartTime.value
    ).substring(
      0,
      5
    );

  }


  return "";

}


function addMinutesToTime(
  time,
  minutes
) {

  const parts =
    String(
      time
    )
    .split(":")
    .map(
      Number
    );


  const total =
    parts[0] * 60 +
    parts[1] +
    Number(
      minutes
    );


  const hours =
    Math.floor(
      total / 60
    ) % 24;


  const mins =
    total % 60;


  return (
    `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:` +
    `${String(
      mins
    ).padStart(
      2,
      "0"
    )}`
  );

}


function formatTime(
  time
) {

  const parts =
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
    parts[0],
    parts[1],
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

    return (
      `${total} min`
    );

  }


  const hours =
    Math.floor(
      total / 60
    );


  const remaining =
    total % 60;


  if (
    remaining === 0
  ) {

    return (
      `${hours} hour${
        hours === 1
          ? ""
          : "s"
      }`
    );

  }


  return (
    `${hours} hr ${remaining} min`
  );

}


/* =========================================================
   PROGRAMME HELPERS
========================================================= */

function getPax(
  programme
) {

  return Object.prototype.hasOwnProperty.call(
    PAX,
    programme
  )
    ? PAX[programme]
    : "";

}


function isKnownProgramme(
  programme
) {

  return Object.prototype.hasOwnProperty.call(
    PAX,
    programme
  );

}


function getProgrammeDuration(
  programme,
  value
) {

  if (
    programme ===
    "Body Composition Assessment"
  ) {

    return 30;

  }


  if (
    programme ===
    "Others"
  ) {

    return Number(
      value
    );

  }


  return 60;

}


function needsWeek14Session(
  programme
) {

  return WEEK_14_PROGRAMMES.includes(
    programme
  );

}


/* =========================================================
   DISPLAY HELPERS
========================================================= */

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

  return (
    `${prefix}_${Date.now()}_` +
    `${Math.random()
      .toString(36)
      .substring(2)}`
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
   SUPABASE MAPPING
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
      event.pax === "" ||
      event.pax == null
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


function convertDatabaseProgramme(
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
      String(
        row.date ||
        ""
      ).substring(
        0,
        10
      ),

    time:
      String(
        row.time ||
        "09:00"
      ).substring(
        0,
        5
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
   LOAD PROGRAMMES
========================================================= */

async function loadProgrammesFromSupabase() {

  if (
    !supabaseClient
  ) {

    return [];

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "programmes"
      )
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


  if (
    error
  ) {

    console.error(
      "Unable to load programmes:",
      error
    );

    return [];

  }


  return (
    data ||
    []
  );

}


async function refreshProgrammesFromSupabase() {

  events =
    (
      await loadProgrammesFromSupabase()
    )
    .map(
      convertDatabaseProgramme
    );


  if (
    showingSummary
  ) {

    renderProgrammeSummary();

  } else {

    renderCalendar();

  }

}


/* =========================================================
   CALENDAR FILTERING
========================================================= */

function getDayEvents(
  date
) {

  return events
    .filter(
      function (
        event
      ) {

        return (
          event.date ===
            date &&

          event.venue ===
            currentVenue
        );

      }
    )
    .sort(
      function (
        a,
        b
      ) {

        return (
          a.time.localeCompare(
            b.time
          )
        );

      }
    );

}


/* =========================================================
   MASTER CALENDAR RENDER
========================================================= */

function renderCalendar() {

  if (
    !calendarGrid
  ) {

    return;

  }


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


  if (
    header
  ) {

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

  }


  const year =
    currentDate.getFullYear();


  const month =
    currentDate.getMonth();


  if (
    monthTitle
  ) {

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

  }


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

    let isOtherMonth =
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


      isOtherMonth =
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


      isOtherMonth =
        true;

    }


    const cell =
      document.createElement(
        "div"
      );


    cell.className =
      "day-cell";


    if (
      isOtherMonth
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


    /*
      STAFF / MANPOWER FIRST
    */

    cell.appendChild(
      createManpowerSection(
        currentVenue,
        dateString
      )
    );


    /*
      PROGRAMMES SECOND
    */

    getDayEvents(
      dateString
    ).forEach(
      function (
        event
      ) {

        cell.appendChild(
          createEventElement(
            event
          )
        );

      }
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


  if (
    monthTitle
  ) {

    monthTitle.textContent =
      getViewDateLabel();

  }


  const dates =
    Array.from(
      {
        length:
          7
      },
      function (
        _,
        index
      ) {

        return addDays(
          currentDate,
          index
        );

      }
    );


  renderFlexibleHeader(
    dates
  );


  dates.forEach(
    function (
      date
    ) {

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


  if (
    monthTitle
  ) {

    monthTitle.textContent =
      getViewDateLabel();

  }


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
   VIEW DATE LABEL
========================================================= */

function getViewDateLabel() {

  if (
    activeCalendarView ===
    "day"
  ) {

    return currentDate.toLocaleDateString(
      "en-SG",
      {
        weekday:
          "long",

        day:
          "numeric",

        month:
          "long",

        year:
          "numeric"
      }
    );

  }


  if (
    activeCalendarView ===
    "week"
  ) {

    const start =
      startOfWeek(
        currentDate
      );


    const end =
      addDays(
        start,
        6
      );


    const startText =
      start.toLocaleDateString(
        "en-SG",
        {
          day:
            "numeric",

          month:
            "short"
        }
      );


    const endText =
      end.toLocaleDateString(
        "en-SG",
        {
          day:
            "numeric",

          month:
            "short",

          year:
            "numeric"
        }
      );


    return (
      `${startText} - ${endText}`
    );

  }


  return currentDate.toLocaleDateString(
    "en-SG",
    {
      month:
        "long",

      year:
        "numeric"
    }
  );

}


/* =========================================================
   FLEXIBLE HEADER
========================================================= */

function renderFlexibleHeader(
  dates
) {

  const header =
    document.querySelector(
      ".week-header"
    );


  if (
    !header
  ) {

    return;

  }


  header.innerHTML =
    "";


  header.className =
    activeCalendarView ===
    "day"

      ? "week-header day-view-header"

      : "week-header week-view-header";


  dates.forEach(
    function (
      date
    ) {

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
          function () {

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


  /*
    STAFF FIRST
  */

  column.appendChild(
    createManpowerSection(
      currentVenue,
      dateString
    )
  );


  /*
    PROGRAMMES SECOND
  */

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
    function (
      event
    ) {

      column.appendChild(
        createEventElement(
          event
        )
      );

    }
  );


  return column;

}


/* =========================================================
   EVENT ELEMENT
========================================================= */

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
    event.totalSessions >
    1

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
    function (
      clickEvent
    ) {

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

  return (
    `${venue}__${date}`
  );

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

      required:
        REQUIRED_MANPOWER,

      notes:
        ""

    }
  );

}


function createManpowerSection(
  venue,
  date
) {

  const record =
    getManpower(
      venue,
      date
    );


  const container =
    document.createElement(
      "div"
    );


  container.className =
    "manpower-container";


  /*
    STAFF ON DUTY
  */

  if (
    record.staff &&
    record.staff.length > 0
  ) {

    const heading =
      document.createElement(
        "div"
      );


    heading.className =
      "calendar-staff-heading";


    heading.textContent =
      "Staff on duty";


    container.appendChild(
      heading
    );


    const staffList =
      document.createElement(
        "div"
      );


    staffList.className =
      "calendar-staff-list";


    record.staff.forEach(
      function (
        name
      ) {

        const staff =
          document.createElement(
            "div"
          );


        staff.className =
          "calendar-staff-name";


        staff.textContent =
          name;


        staffList.appendChild(
          staff
        );

      }
    );


    container.appendChild(
      staffList
    );

  }


  /*
    MANPOWER BUTTON
  */

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "manpower-button";


  const present =
    record.staff
      ? record.staff.length
      : 0;


  const required =
    REQUIRED_MANPOWER;


  if (
    present === 0
  ) {

    button.textContent =
      "👥 Set manpower";

  } else {

    button.textContent =
      `👥 ${present} staff / ${required} req.`;


    if (
      present >= required
    ) {

      button.classList.add(
        "good"
      );

    } else {

      button.classList.add(
        "warning"
      );

    }

  }


  button.addEventListener(
    "click",
    function (
      clickEvent
    ) {

      clickEvent.stopPropagation();


      openManpowerModal(
        venue,
        date
      );

    }
  );


  container.appendChild(
    button
  );


  return container;

}


/* =========================================================
   PROGRAMME FORM
========================================================= */

function setupProgrammeForm() {

  if (
    programmeSelect
  ) {

    programmeSelect.addEventListener(
      "change",
      function () {

        const isOthers =
          programmeSelect.value ===
          "Others";


        if (
          customProgrammeGroup
        ) {

          customProgrammeGroup.classList.toggle(
            "hidden",
            !isOthers
          );

        }


        if (
          durationGroup
        ) {

          durationGroup.classList.toggle(
            "hidden",
            !isOthers
          );

        }


        if (
          !isOthers
        ) {

          if (
            customProgrammeInput
          ) {

            customProgrammeInput.value =
              "";

          }


          if (
            customDuration
          ) {

            customDuration.value =
              "";

            customDuration.disabled =
              true;

          }


          if (
            durationPreset
          ) {

            durationPreset.value =
              "60";

          }

        }

      }
    );

  }


  if (
    durationPreset
  ) {

    durationPreset.addEventListener(
      "change",
      function () {

        const custom =
          durationPreset.value ===
          "custom";


        if (
          customDuration
        ) {

          customDuration.disabled =
            !custom;

        }


        if (
          !custom &&
          customDuration
        ) {

          customDuration.value =
            "";

        }

      }
    );

  }

}


/* =========================================================
   ADD PROGRAMME
========================================================= */

async function addProgramme() {

  if (
    !programmeSelect
  ) {

    return;

  }


  const selected =
    programmeSelect.value;


  if (
    !selected
  ) {

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
        ? customProgrammeInput.value.trim()
        : "";


    if (
      !programmeName
    ) {

      alert(
        "Please enter a programme name."
      );

      return;

    }

  }


  const venue =
    venueSelect
      ? venueSelect.value
      : currentVenue;


  const date =
    startDateInput
      ? startDateInput.value
      : "";


  const time =
    getAddTime();


  if (
    !date
  ) {

    alert(
      "Please select a date."
    );

    return;

  }


  if (
    !time
  ) {

    alert(
      "Please select a start time."
    );

    return;

  }


  if (
    !isValidHalfHourTime(
      time
    )
  ) {

    alert(
      "Please select a start time ending in :00 or :30."
    );

    return;

  }


  let durationValue =
    "60";


  if (
    selected ===
    "Others"
  ) {

    if (
      durationPreset &&
      durationPreset.value ===
      "custom"
    ) {

      durationValue =
        customDuration
          ? customDuration.value
          : "";

    } else {

      durationValue =
        durationPreset
          ? durationPreset.value
          : "60";

    }

  }


  const duration =
    getProgrammeDuration(
      programmeName,
      durationValue
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


  const normalSessions =
    SERIES_WEEKS[
      programmeName
    ] ||
    1;


  const totalSessions =
    needsWeek14Session(
      programmeName
    )

      ? normalSessions + 1

      : normalSessions;


  const seriesId =
    makeId(
      "series"
    );


  const newEvents =
    [];


  /*
    Normal weekly sessions.
  */

  for (
    let i = 0;
    i < normalSessions;
    i++
  ) {

    const sessionDate =
      addDays(
        parseInputDate(
          date
        ),
        i * 7
      );


    newEvents.push({

      id:
        makeId(
          "event"
        ),

      seriesId:
        seriesId,

      programme:
        programmeName,

      venue:
        venue,

      date:
        formatInputDate(
          sessionDate
        ),

      time:
        time,

      duration:
        duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        statusInput
          ? statusInput.value
          : "",

      remarks:
        remarksInput
          ? remarksInput.value.trim()
          : "",

      sessionNumber:
        normalSessions > 1
          ? i + 1
          : null,

      totalSessions:
        totalSessions,

      type:
        totalSessions > 1
          ? "Series"
          : "Stand-alone"

    });

  }


  /*
    Additional Week 14 session.
  */

  if (
    needsWeek14Session(
      programmeName
    )
  ) {

    const week14Date =
      addDays(
        parseInputDate(
          date
        ),
        13 * 7
      );


    newEvents.push({

      id:
        makeId(
          "event"
        ),

      seriesId:
        seriesId,

      programme:
        programmeName,

      venue:
        venue,

      date:
        formatInputDate(
          week14Date
        ),

      time:
        time,

      duration:
        duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        statusInput
          ? statusInput.value
          : "",

      remarks:
        remarksInput
          ? remarksInput.value.trim()
          : "",

      sessionNumber:
        14,

      totalSessions:
        totalSessions,

      type:
        "Series"

    });

  }


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "programmes"
      )
      .insert(
        newEvents.map(
          mapProgrammeToDatabase
        )
      )
      .select();


  if (
    error
  ) {

    console.error(
      "Programme insert failed:",
      error
    );


    alert(
      `Unable to save programme: ${error.message}`
    );

    return;

  }


  events.push(
    ...(
      data ||
      []
    ).map(
      convertDatabaseProgramme
    )
  );


  currentDate =
    parseInputDate(
      date
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

  }


  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  currentVenue =
    venue;


  if (
    venueSelect
  ) {

    venueSelect.value =
      venue;

  }


  if (
    currentVenueLabel
  ) {

    currentVenueLabel.textContent =
      venue;

  }


  resetProgrammeForm();


  renderCalendar();


  alert(
    "Programme saved successfully."
  );

}


/* =========================================================
   RESET PROGRAMME FORM
========================================================= */

function resetProgrammeForm() {

  if (
    programmeSelect
  ) {

    programmeSelect.value =
      "";

  }


  if (
    customProgrammeInput
  ) {

    customProgrammeInput.value =
      "";

  }


  if (
    customProgrammeGroup
  ) {

    customProgrammeGroup.classList.add(
      "hidden"
    );

  }


  if (
    durationGroup
  ) {

    durationGroup.classList.add(
      "hidden"
    );

  }


  if (
    durationPreset
  ) {

    durationPreset.value =
      "60";

  }


  if (
    customDuration
  ) {

    customDuration.value =
      "";

    customDuration.disabled =
      true;

  }


  if (
    startDateInput
  ) {

    startDateInput.value =
      formatInputDate(
        new Date()
      );

  }


  if (
    startHour
  ) {

    startHour.value =
      "09";

  }


  if (
    startMinute
  ) {

    startMinute.value =
      "00";

  }


  if (
    startTimeInput
  ) {

    startTimeInput.value =
      "09:00";

  }


  if (
    remarksInput
  ) {

    remarksInput.value =
      "";

  }


  if (
    statusInput
  ) {

    statusInput.value =
      "Uploaded (100% Created)";

  }

}


/* =========================================================
   EVENT MODAL
========================================================= */

function openEventModal(
  event
) {

  selectedEventId =
    event.id;


  const setText =
    function (
      id,
      value
    ) {

      const element =
        $(id);


      if (
        element
      ) {

        element.textContent =
          value;

      }

    };


  setText(
    "modalProgramme",
    event.programme
  );


  setText(
    "modalVenue",
    event.venue
  );


  setText(
    "modalDate",
    formatDisplayDate(
      event.date
    )
  );


  setText(
    "modalTime",
    `${formatTime(
      event.time
    )} - ${formatTime(
      addMinutesToTime(
        event.time,
        event.duration
      )
    )}`
  );


  setText(
    "modalDuration",
    formatDuration(
      event.duration
    )
  );


  setText(
    "modalPax",
    event.pax === ""
      ? "Not specified"
      : `${event.pax} pax`
  );


  setText(
    "modalSession",
    event.totalSessions > 1
      ? `Week ${event.sessionNumber} of ${event.totalSessions}`
      : "Stand-alone"
  );


  setText(
    "modalStatus",
    event.status ||
    ""
  );


  setText(
    "modalRemarks",
    event.remarks ||
    "—"
  );


  if (
    eventModal
  ) {

    eventModal.classList.add(
      "visible"
    );

  }

}


function closeEventModal() {

  if (
    eventModal
  ) {

    eventModal.classList.remove(
      "visible"
    );

  }


  selectedEventId =
    null;

}


/* =========================================================
   OPEN EDIT
========================================================= */

function openEditModal() {

  if (
    !selectedEventId
  ) {

    alert(
      "Please select a programme first."
    );

    return;

  }


  const selected =
    events.find(
      function (
        event
      ) {

        return (
          event.id ===
          selectedEventId
        );

      }
    );


  if (
    !selected
  ) {

    alert(
      "Programme could not be found."
    );

    return;

  }


  const series =
    events
      .filter(
        function (
          event
        ) {

          return (
            event.seriesId ===
            selected.seriesId
          );

        }
      )
      .sort(
        function (
          a,
          b
        ) {

          return (
            dateTimeValue(a) -
            dateTimeValue(b)
          );

        }
      );


  const first =
    series[0] ||
    selected;


  const known =
    isKnownProgramme(
      first.programme
    );


  if (
    editProgramme
  ) {

    editProgramme.value =
      known
        ? first.programme
        : "__CUSTOM__";

  }


  if (
    editCustomProgramme
  ) {

    editCustomProgramme.value =
      known
        ? ""
        : first.programme;

  }


  if (
    editCustomProgrammeGroup
  ) {

    editCustomProgrammeGroup.classList.toggle(
      "hidden",
      known
    );

  }


  if (
    editVenue
  ) {

    editVenue.value =
      first.venue;

  }


  if (
    editStartDate
  ) {

    editStartDate.value =
      first.date;

  }


  const parts =
    String(
      first.time ||
      "09:00"
    )
    .split(":");


  if (
    editStartHour
  ) {

    editStartHour.value =
      parts[0] ||
      "09";

  }


  if (
    editStartMinute
  ) {

    editStartMinute.value =
      parts[1] ===
      "30"

        ? "30"

        : "00";

  }


  if (
    editStartTime
  ) {

    editStartTime.value =
      String(
        first.time ||
        "09:00"
      ).substring(
        0,
        5
      );

  }


  if (
    editDuration
  ) {

    editDuration.value =
      first.duration;

  }


  if (
    editDurationGroup
  ) {

    editDurationGroup.classList.toggle(
      "hidden",
      known
    );

  }


  if (
    editRemarks
  ) {

    editRemarks.value =
      first.remarks ||
      "";

  }


  if (
    editStatus
  ) {

    editStatus.value =
      first.status ||
      "Uploaded (100% Created)";

  }


  closeEventModal();


  if (
    editModal
  ) {

    editModal.classList.add(
      "visible"
    );

  }

}


/* =========================================================
   SAVE EDIT
========================================================= */

async function saveEdit() {

  if (
    !selectedEventId
  ) {

    alert(
      "No programme selected."
    );

    return;

  }


  const selected =
    events.find(
      function (
        event
      ) {

        return (
          event.id ===
          selectedEventId
        );

      }
    );


  if (
    !selected
  ) {

    alert(
      "Programme could not be found."
    );

    return;

  }


  const oldSeriesId =
    selected.seriesId;


  let programmeName =
    editProgramme
      ? editProgramme.value
      : "";


  if (
    programmeName ===
    "__CUSTOM__"
  ) {

    programmeName =
      editCustomProgramme
        ? editCustomProgramme.value.trim()
        : "";

  }


  if (
    !programmeName
  ) {

    alert(
      "Please select or enter a programme."
    );

    return;

  }


  const duration =
    getProgrammeDuration(
      programmeName,
      editDuration
        ? editDuration.value
        : "60"
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


  if (
    !editStartDate ||
    !editStartDate.value
  ) {

    alert(
      "Please select a date."
    );

    return;

  }


  const newTime =
    getEditTime();


  if (
    !newTime
  ) {

    alert(
      "Please select a start time."
    );

    return;

  }


  if (
    !isValidHalfHourTime(
      newTime
    )
  ) {

    alert(
      "Please select a start time ending in :00 or :30."
    );

    return;

  }


  const newVenue =
    editVenue
      ? editVenue.value
      : currentVenue;


  const normalSessions =
    SERIES_WEEKS[
      programmeName
    ] ||
    1;


  const totalSessions =
    needsWeek14Session(
      programmeName
    )

      ? normalSessions + 1

      : normalSessions;


  const replacement =
    [];


  /*
    Normal weekly sessions.
  */

  for (
    let i = 0;
    i < normalSessions;
    i++
  ) {

    const sessionDate =
      addDays(
        parseInputDate(
          editStartDate.value
        ),
        i * 7
      );


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
          sessionDate
        ),

      time:
        newTime,

      duration:
        duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        editStatus
          ? editStatus.value
          : "",

      remarks:
        editRemarks
          ? editRemarks.value.trim()
          : "",

      sessionNumber:
        normalSessions > 1
          ? i + 1
          : null,

      totalSessions:
        totalSessions,

      type:
        totalSessions > 1
          ? "Series"
          : "Stand-alone"

    });

  }


  /*
    Week 14 session.
  */

  if (
    needsWeek14Session(
      programmeName
    )
  ) {

    const week14Date =
      addDays(
        parseInputDate(
          editStartDate.value
        ),
        13 * 7
      );


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
          week14Date
        ),

      time:
        newTime,

      duration:
        duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        editStatus
          ? editStatus.value
          : "",

      remarks:
        editRemarks
          ? editRemarks.value.trim()
          : "",

      sessionNumber:
        14,

      totalSessions:
        totalSessions,

      type:
        "Series"

    });

  }


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  /*
    Delete old series.
  */

  const {
    error:
      deleteError
  } =
    await supabaseClient
      .from(
        "programmes"
      )
      .delete()
      .eq(
        "series_id",
        oldSeriesId
      );


  if (
    deleteError
  ) {

    console.error(
      "Unable to delete old programme:",
      deleteError
    );


    alert(
      `Unable to update programme: ${deleteError.message}`
    );

    return;

  }


  /*
    Insert new edited series.
  */

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "programmes"
      )
      .insert(
        replacement.map(
          mapProgrammeToDatabase
        )
      )
      .select();


  if (
    error
  ) {

    console.error(
      "Unable to save edited programme:",
      error
    );


    /*
      Restore current database state.
    */

    await refreshProgrammesFromSupabase();


    alert(
      `Unable to save changes: ${error.message}`
    );

    return;

  }


  /*
    Replace local data.
  */

  events =
    events.filter(
      function (
        event
      ) {

        return (
          event.seriesId !==
          oldSeriesId
        );

      }
    );


  events.push(
    ...(
      data ||
      []
    ).map(
      convertDatabaseProgramme
    )
  );


  currentDate =
    parseInputDate(
      editStartDate.value
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

  }


  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  currentVenue =
    newVenue;


  if (
    venueSelect
  ) {

    venueSelect.value =
      newVenue;

  }


  if (
    currentVenueLabel
  ) {

    currentVenueLabel.textContent =
      newVenue;

  }


  closeEditModal();

  renderCalendar();


  alert(
    "Programme updated successfully."
  );

}


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEditModal() {

  if (
    editModal
  ) {

    editModal.classList.remove(
      "visible"
    );

  }


  selectedEventId =
    null;

}


/* =========================================================
   DELETE PROGRAMME
========================================================= */

async function deleteSelected() {

  if (
    !selectedEventId
  ) {

    return;

  }


  const selected =
    events.find(
      function (
        event
      ) {

        return (
          event.id ===
          selectedEventId
        );

      }
    );


  if (
    !selected
  ) {

    return;

  }


  const wholeSeries =
    Number(
      selected.totalSessions
    ) > 1;


  const confirmation =
    wholeSeries

      ? "Delete the entire programme series?"

      : "Delete this programme?";


  if (
    !confirm(
      confirmation
    )
  ) {

    return;

  }


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  let query =
    supabaseClient
      .from(
        "programmes"
      )
      .delete();


  if (
    wholeSeries
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


  if (
    error
  ) {

    console.error(
      "Unable to delete programme:",
      error
    );


    alert(
      `Unable to delete programme: ${error.message}`
    );

    return;

  }


  if (
    wholeSeries
  ) {

    events =
      events.filter(
        function (
          event
        ) {

          return (
            event.seriesId !==
            selected.seriesId
          );

        }
      );

  } else {

    events =
      events.filter(
        function (
          event
        ) {

          return (
            event.id !==
            selected.id
          );

        }
      );

  }


  closeEventModal();

  renderCalendar();


  alert(
    "Programme deleted successfully."
  );

}


/* =========================================================
   MANPOWER
========================================================= */

function renderStaffChecklist(
  selected
) {

  const container =
    $("staffList");


  if (
    !container
  ) {

    return;

  }


  container.innerHTML =
    "";


  STAFF_LIST.forEach(
    function (
      name
    ) {

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
        function () {

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


function selectedStaff() {

  return Array.from(
    document.querySelectorAll(
      '#staffList input[type="checkbox"]:checked'
    )
  )
  .map(
    function (
      checkbox
    ) {

      return checkbox.value;

    }
  );

}


function updateStaffCount() {

  const count =
    $("presentCount");


  if (
    count
  ) {

    count.textContent =
      selectedStaff().length;

  }

}


function updateStaffStatus() {

  const status =
    $("staffStatus");


  if (
    !status
  ) {

    return;

  }


  const present =
    selectedStaff().length;


  const required =
    REQUIRED_MANPOWER;


  status.className =
    "staff-status";


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
      `⚠ Understaffed by ${
        required -
        present
      }`;

  }

}


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


  const venueDisplay =
    $("manpowerVenue");


  if (
    venueDisplay
  ) {

    venueDisplay.textContent =
      venue;

  }


  const dateDisplay =
    $("manpowerDate");


  if (
    dateDisplay
  ) {

    dateDisplay.textContent =
      formatDisplayDate(
        date
      );

  }


  const requiredInput =
    $("requiredManpower");


  if (
    requiredInput
  ) {

    requiredInput.value =
      REQUIRED_MANPOWER;

    requiredInput.disabled =
      true;

  }


  const notesInput =
    $("manpowerNotes");


  if (
    notesInput
  ) {

    notesInput.value =
      record.notes ||
      "";

  }


  renderStaffChecklist(
    record.staff ||
    []
  );


  updateStaffCount();

  updateStaffStatus();


  if (
    manpowerModal
  ) {

    manpowerModal.classList.add(
      "visible"
    );

  }

}


async function saveManpower() {

  if (
    !manpowerDate
  ) {

    return;

  }


  const staff =
    selectedStaff();


  const notesInput =
    $("manpowerNotes");


  const notes =
    notesInput
      ? notesInput.value.trim()
      : "";


  const record =
    {

      venue:
        currentVenue,

      date:
        manpowerDate,

      staff:
        staff,

      required:
        REQUIRED_MANPOWER,

      notes:
        notes

    };


  if (
    supabaseClient
  ) {

    const {
      error
    } =
      await supabaseClient
        .from(
          "manpower"
        )
        .upsert(
          record,
          {
            onConflict:
              "venue,date"
          }
        );


    if (
      error
    ) {

      console.error(
        "Unable to save manpower:",
        error
      );


      alert(
        `Unable to save manpower: ${error.message}`
      );

      return;

    }

  } else {

    alert(
      "Supabase is not connected."
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
      staff,

    required:
      REQUIRED_MANPOWER,

    notes:
      notes

  };


  closeManpowerModal();

  renderCalendar();

}


function closeManpowerModal() {

  if (
    manpowerModal
  ) {

    manpowerModal.classList.remove(
      "visible"
    );

  }


  manpowerDate =
    null;

}


async function loadManpowerFromSupabase() {

  if (
    !supabaseClient
  ) {

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "manpower"
      )
      .select("*");


  if (
    error
  ) {

    console.warn(
      "Unable to load manpower:",
      error
    );

    return;

  }


  manpower =
    {};


  (
    data ||
    []
  ).forEach(
    function (
      row
    ) {

      const date =
        String(
          row.date ||
          ""
        ).substring(
          0,
          10
        );


      manpower[
        manpowerKey(
          row.venue,
          date
        )
      ] = {

        staff:
          Array.isArray(
            row.staff
          )
            ? row.staff
            : [],

        required:
          REQUIRED_MANPOWER,

        notes:
          row.notes ||
          ""

      };

    }
  );


  renderCalendar();

}


/* =========================================================
   VENUE
========================================================= */

function switchVenue(
  venue
) {

  currentVenue =
    venue;


  showingSummary =
    false;


  if (
    venueSelect
  ) {

    venueSelect.value =
      venue;

  }


  if (
    currentVenueLabel
  ) {

    currentVenueLabel.textContent =
      venue;

  }


  if (
    hbbSheetTab
  ) {

    hbbSheetTab.classList.toggle(
      "active",
      venue ===
      "HBB"
    );

  }


  if (
    othSheetTab
  ) {

    othSheetTab.classList.toggle(
      "active",
      venue ===
      "OTH"
    );

  }


  showCalendarView();

}


/* =========================================================
   CALENDAR NAVIGATION
========================================================= */

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
        currentDate.getMonth() -
          1,
        1
      );

  }


  if (
    showingSummary
  ) {

    summaryDate =
      new Date(
        summaryDate.getFullYear(),
        summaryDate.getMonth() -
          1,
        1
      );


    renderProgrammeSummary();

  } else {

    renderCalendar();

  }

}


function goNext() {

  if (
    showingSummary
  ) {

    summaryDate =
      new Date(
        summaryDate.getFullYear(),
        summaryDate.getMonth() +
          1,
        1
      );


    renderProgrammeSummary();

    return;

  }


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
        currentDate.getMonth() +
          1,
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

  }


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
    showingSummary
  ) {

    summaryDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );


    renderProgrammeSummary();

  } else {

    renderCalendar();

  }

}


/* =========================================================
   CALENDAR VIEW CHANGE
========================================================= */

function changeCalendarView() {

  if (
    calendarViewSelect
  ) {

    activeCalendarView =
      calendarViewSelect.value;

  }


  if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  showCalendarView();

}


/* =========================================================
   SUMMARY VIEW
========================================================= */

function showCalendarView() {

  showingSummary =
    false;


  if (
    summaryPanel
  ) {

    summaryPanel.classList.add(
      "hidden"
    );

  }


  const header =
    document.querySelector(
      ".week-header"
    );


  if (
    header
  ) {

    header.classList.remove(
      "hidden"
    );

  }


  if (
    calendarGrid
  ) {

    calendarGrid.classList.remove(
      "hidden"
    );

  }


  updateSheetTabs();

  renderCalendar();

}


function showSummaryView() {

  showingSummary =
    true;


  if (
    calendarGrid
  ) {

    calendarGrid.classList.add(
      "hidden"
    );

  }


  const header =
    document.querySelector(
      ".week-header"
    );


  if (
    header
  ) {

    header.classList.add(
      "hidden"
    );

  }


  if (
    summaryPanel
  ) {

    summaryPanel.classList.remove(
      "hidden"
    );

  }


  updateSheetTabs();

  renderProgrammeSummary();

}


function updateSheetTabs() {

  if (
    hbbSheetTab
  ) {

    hbbSheetTab.classList.toggle(
      "active",
      currentVenue ===
        "HBB" &&
      !showingSummary
    );

  }


  if (
    othSheetTab
  ) {

    othSheetTab.classList.toggle(
      "active",
      currentVenue ===
        "OTH" &&
      !showingSummary
    );

  }


  if (
    summarySheetTab
  ) {

    summarySheetTab.classList.toggle(
      "active",
      showingSummary
    );

  }

}


/* =========================================================
   PROGRAMME SUMMARY
========================================================= */

function renderProgrammeSummary() {

  if (
    !summaryTableBody
  ) {

    return;

  }


  const year =
    summaryDate.getFullYear();


  const month =
    summaryDate.getMonth();


  if (
    summaryMonth
  ) {

    summaryMonth.textContent =
      summaryDate.toLocaleDateString(
        "en-SG",
        {
          month:
            "long",

          year:
            "numeric"
        }
      );

  }


  if (
    summarySubtitle
  ) {

    summarySubtitle.textContent =
      `Venue: ${currentVenue}`;

  }


  /*
    Only events belonging to the
    selected venue and month.
  */

  const monthlyEvents =
    events.filter(
      function (
        event
      ) {

        const eventDate =
          parseInputDate(
            event.date
          );


        return (

          event.venue ===
            currentVenue

          &&

          eventDate.getFullYear() ===
            year

          &&

          eventDate.getMonth() ===
            month

        );

      }
    );


  const programmeCounts =
    {};


  monthlyEvents.forEach(
    function (
      event
    ) {

      const programme =
        event.programme ||
        "Unnamed Programme";


      if (
        !programmeCounts[
          programme
        ]
      ) {

        programmeCounts[
          programme
        ] = 0;

      }


      programmeCounts[
        programme
      ]++;

    }
  );


  const programmes =
    Object.keys(
      programmeCounts
    ).sort(
      function (
        a,
        b
      ) {

        return a.localeCompare(
          b
        );

      }
    );


  summaryTableBody.innerHTML =
    "";


  if (
    programmes.length ===
    0
  ) {

    const row =
      document.createElement(
        "tr"
      );


    row.innerHTML = `

      <td
        colspan="2"
        class="summary-zero"
      >
        No programmes conducted
        this month.
      </td>

    `;


    summaryTableBody.appendChild(
      row
    );


    if (
      summaryTotal
    ) {

      summaryTotal.textContent =
        "0";

    }


    return;

  }


  let total =
    0;


  programmes.forEach(
    function (
      programme
    ) {

      const count =
        programmeCounts[
          programme
        ];


      total +=
        count;


      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>
          ${escapeHtml(
            programme
          )}
        </td>

        <td>
          ${count}
        </td>

      `;


      summaryTableBody.appendChild(
        row
      );

    }
  );


  if (
    summaryTotal
  ) {

    summaryTotal.textContent =
      total;

  }

}


function summaryPreviousMonthHandler() {

  summaryDate =
    new Date(
      summaryDate.getFullYear(),
      summaryDate.getMonth() -
        1,
      1
    );


  renderProgrammeSummary();

}


function summaryNextMonthHandler() {

  summaryDate =
    new Date(
      summaryDate.getFullYear(),
      summaryDate.getMonth() +
        1,
      1
    );


  renderProgrammeSummary();

}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

async function clearAllData() {

  if (
    !confirm(
      "Delete all programmes and manpower?"
    )
  ) {

    return;

  }


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const {
    error:
      programmeError
  } =
    await supabaseClient
      .from(
        "programmes"
      )
      .delete()
      .neq(
        "id",
        "__never__"
      );


  if (
    programmeError
  ) {

    alert(
      `Unable to clear programmes: ${programmeError.message}`
    );

    return;

  }


  const {
    error:
      manpowerError
  } =
    await supabaseClient
      .from(
        "manpower"
      )
      .delete()
      .neq(
        "venue",
        "__never__"
      );


  if (
    manpowerError
  ) {

    alert(
      `Unable to clear manpower: ${manpowerError.message}`
    );

    return;

  }


  events =
    [];


  manpower =
    {};


  renderCalendar();

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupProgrammeButtons() {

  const addButton =
    $("addButton");


  if (
    addButton
  ) {

    addButton.addEventListener(
      "click",
      addProgramme
    );

  }


  const editButton =
    $("editButton");


  if (
    editButton
  ) {

    editButton.addEventListener(
      "click",
      openEditModal
    );

  }


  const saveEditButton =
    $("saveEditButton");


  if (
    saveEditButton
  ) {

    saveEditButton.addEventListener(
      "click",
      saveEdit
    );

  }


  const cancelEditButton =
    $("cancelEditButton");


  if (
    cancelEditButton
  ) {

    cancelEditButton.addEventListener(
      "click",
      closeEditModal
    );

  }


  const deleteButton =
    $("deleteButton");


  if (
    deleteButton
  ) {

    deleteButton.addEventListener(
      "click",
      deleteSelected
    );

  }


  const closeButton =
    $("closeButton");


  if (
    closeButton
  ) {

    closeButton.addEventListener(
      "click",
      closeEventModal
    );

  }


  const saveManpowerButton =
    $("saveManpower");


  if (
    saveManpowerButton
  ) {

    saveManpowerButton.addEventListener(
      "click",
      saveManpower
    );

  }


  const closeManpowerButton =
    $("closeManpower");


  if (
    closeManpowerButton
  ) {

    closeManpowerButton.addEventListener(
      "click",
      closeManpowerModal
    );

  }


  const selectAllStaff =
    $("selectAllStaff");


  if (
    selectAllStaff
  ) {

    selectAllStaff.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(
            '#staffList input[type="checkbox"]'
          )
          .forEach(
            function (
              checkbox
            ) {

              checkbox.checked =
                true;

            }
          );


        updateStaffCount();

        updateStaffStatus();

      }
    );

  }


  const clearAllStaff =
    $("clearAllStaff");


  if (
    clearAllStaff
  ) {

    clearAllStaff.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(
            '#staffList input[type="checkbox"]'
          )
          .forEach(
            function (
              checkbox
            ) {

              checkbox.checked =
                false;

            }
          );


        updateStaffCount();

        updateStaffStatus();

      }
    );

  }


  const previousButton =
    $("previousButton");


  if (
    previousButton
  ) {

    previousButton.addEventListener(
      "click",
      goPrevious
    );

  }


  const nextButton =
    $("nextButton");


  if (
    nextButton
  ) {

    nextButton.addEventListener(
      "click",
      goNext
    );

  }


  const todayButton =
    $("todayButton");


  if (
    todayButton
  ) {

    todayButton.addEventListener(
      "click",
      goToday
    );

  }


  const clearButton =
    $("clearButton");


  if (
    clearButton
  ) {

    clearButton.addEventListener(
      "click",
      clearAllData
    );

  }


  if (
    calendarViewSelect
  ) {

    calendarViewSelect.addEventListener(
      "change",
      changeCalendarView
    );


    calendarViewSelect.addEventListener(
      "input",
      changeCalendarView
    );

  }


  if (
    hbbSheetTab
  ) {

    hbbSheetTab.addEventListener(
      "click",
      function () {

        currentVenue =
          "HBB";

        showCalendarView();

      }
    );

  }


  if (
    othSheetTab
  ) {

    othSheetTab.addEventListener(
      "click",
      function () {

        currentVenue =
          "OTH";

        showCalendarView();

      }
    );

  }


  /*
    Google Sheet summary tab.
  */

  if (
    summarySheetTab
  ) {

    summarySheetTab.addEventListener(
      "click",
      function () {

        summaryDate =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );


        showSummaryView();

      }
    );

  }


  if (
    summaryPreviousMonth
  ) {

    summaryPreviousMonth.addEventListener(
      "click",
      summaryPreviousMonthHandler
    );

  }


  if (
    summaryNextMonth
  ) {

    summaryNextMonth.addEventListener(
      "click",
      summaryNextMonthHandler
    );

  }

}


/* =========================================================
   INITIALISE
========================================================= */

function initialise() {

  if (
    startDateInput &&
    !startDateInput.value
  ) {

    startDateInput.value =
      formatInputDate(
        new Date()
      );

  }


  if (
    venueSelect
  ) {

    venueSelect.value =
      currentVenue;

  }


  if (
    currentVenueLabel
  ) {

    currentVenueLabel.textContent =
      currentVenue;

  }


  if (
    calendarViewSelect
  ) {

    calendarViewSelect.value =
      activeCalendarView;

  }


  updateSheetTabs();

  renderCalendar();

}


/* =========================================================
   START
========================================================= */

setupProgrammeForm();

setupProgrammeButtons();

initialise();

testSupabaseConnection();

refreshProgrammesFromSupabase();

loadManpowerFromSupabase();
