/* =========================================================
   PROGRAMME CALENDAR
   Supabase + Month / Week / Day
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";


/* =========================================================
   SETTINGS
========================================================= */

const REQUIRED_MANPOWER = 2;


/* =========================================================
   SUPABASE CLIENT
========================================================= */

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
   PROGRAMME RULES
========================================================= */

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


/* =========================================================
   PAX
========================================================= */

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

let currentVenue = "HBB";

let currentDate = new Date();

let activeCalendarView = "month";

let selectedEventId = null;

let manpowerDate = null;


/* =========================================================
   DOM REFERENCES
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

const startHour =
  document.getElementById(
    "startHour"
  );

const startMinute =
  document.getElementById(
    "startMinute"
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
   EDIT REFERENCES
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

const editStartHour =
  document.getElementById(
    "editStartHour"
  );

const editStartMinute =
  document.getElementById(
    "editStartMinute"
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
   GENERIC HELPERS
========================================================= */

function $(id) {

  return document.getElementById(
    id
  );

}


/* =========================================================
   TIME HELPERS
========================================================= */

function isValidHalfHourTime(
  time
) {

  if (
    !time ||
    typeof time !== "string"
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
  durationValue
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
      durationValue
    );

  }


  return 60;

}


/* =========================================================
   DATE HELPERS
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

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-${month}-${day}`
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
   TIME DISPLAY
========================================================= */

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


  const newHours =
    Math.floor(
      total / 60
    ) % 24;


  const newMinutes =
    total % 60;


  return (
    `${String(
      newHours
    ).padStart(
      2,
      "0"
    )}:` +
    `${String(
      newMinutes
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


/* =========================================================
   GENERAL HELPERS
========================================================= */

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
    Math.random()
      .toString(36)
      .substring(2)
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
   SUPABASE PROGRAMMES
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


  renderCalendar();

}


/* =========================================================
   CALENDAR VIEW
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
            date

          &&

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

        return a.time.localeCompare(
          b.time
        );

      }
    );

}


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
      IMPORTANT:
      Staff/manpower is added BEFORE programmes.
    */

    cell.appendChild(
      createManpowerSection(
        currentVenue,
        dateString
      )
    );


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


  const dayColumn =
    renderDayColumn(
      currentDate
    );


  calendarGrid.appendChild(
    dayColumn
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

    return currentDate
      .toLocaleDateString(
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


  return currentDate
    .toLocaleDateString(
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
    IMPORTANT:
    Manpower is always inserted BEFORE programmes.
  */

  column.appendChild(
    createManpowerSection(
      currentVenue,
      dateString
    )
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
   MANPOWER STORAGE
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


/* =========================================================
   MANPOWER DISPLAY
========================================================= */

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
        staffName
      ) {

        const staff =
          document.createElement(
            "div"
          );


        staff.className =
          "calendar-staff-name";


        staff.textContent =
          staffName;


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

  } else if (
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
    function (
      event
    ) {

      event.stopPropagation();


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

          customProgrammeGroup
            .classList.toggle(
              "hidden",
              !isOthers
            );

        }


        if (
          durationGroup
        ) {

          durationGroup
            .classList.toggle(
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


  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] ||
    1;


  const seriesId =
    makeId(
      "series"
    );


  const newEvents =
    [];


  for (
    let i = 0;
    i < totalSessions;
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
        totalSessions > 1
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


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const rows =
    newEvents.map(
      mapProgrammeToDatabase
    );


  console.log(
    "Saving programme:",
    rows
  );


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "programmes"
      )
      .insert(
        rows
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

    customProgrammeGroup
      .classList.add(
        "hidden"
      );

  }


  if (
    durationGroup
  ) {

    durationGroup
      .classList.add(
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
   OPEN EDIT MODAL
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
            dateTimeValue(
              a
            ) -
            dateTimeValue(
              b
            )
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

    editCustomProgrammeGroup
      .classList.toggle(
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


  const timeParts =
    String(
      first.time ||
      "09:00"
    ).split(
      ":"
    );


  if (
    editStartHour
  ) {

    editStartHour.value =
      timeParts[0] ||
      "09";

  }


  if (
    editStartMinute
  ) {

    editStartMinute.value =
      timeParts[1] ===
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

    editDurationGroup
      .classList.toggle(
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


  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] ||
    1;


  const replacement =
    [];


  for (
    let i = 0;
    i < totalSessions;
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
        totalSessions > 1
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


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  /*
    Delete original series.
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
    Insert edited series.
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


    await refreshProgrammesFromSupabase();


    alert(
      `Unable to save changes: ${error.message}`
    );

    return;

  }


  /*
    Update local events.
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


  /*
    Move calendar.
  */

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
   CLOSE EDIT MODAL
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
    document.getElementById(
      "staffList"
    );


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
    present >= required
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


  const required =
    REQUIRED_MANPOWER;


  manpower[
    manpowerKey(
      currentVenue,
      manpowerDate
    )
  ] = {

    staff:
      staff,

    required:
      required,

    notes:
      notes

  };


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "manpower"
      )
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
   VENUE SWITCHING
========================================================= */

function switchVenue(
  venue
) {

  currentVenue =
    venue;


  if (
    venueSelect
  ) {

    venueSelect.value =
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


  if (
    currentVenueLabel
  ) {

    currentVenueLabel.textContent =
      venue;

  }


  renderCalendar();

}


/* =========================================================
   NAVIGATION
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


  renderCalendar();

}


/* =========================================================
   CLEAR ALL
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
   BUTTON INITIALISATION
========================================================= */

function setupButtons() {

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

        switchVenue(
          "HBB"
        );

      }
    );

  }


  if (
    othSheetTab
  ) {

    othSheetTab.addEventListener(
      "click",
      function () {

        switchVenue(
          "OTH"
        );

      }
    );

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


  renderCalendar();

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


  renderCalendar();

}


/* =========================================================
   START APPLICATION
========================================================= */

setupProgrammeForm();

setupButtons();

initialise();

testSupabaseConnection();

refreshProgrammesFromSupabase();

loadManpowerFromSupabase();
