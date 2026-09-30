/* =========================================================
   PROGRAMME CALENDAR

   Features:
   - Supabase
   - HBB / OTH
   - Month / Week / Day views
   - Add / Edit / Delete programmes
   - Rolling programme sessions
   - Manage Knee / Metabolic Week 14 session
   - Body Composition = 30 minutes
   - Start minutes only :00 / :30
   - Fixed required manpower = 2
   - Staff on duty shown above programmes
   - Monthly programme summary
========================================================= */


/* =========================================================
   SUPABASE CONFIG
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


/* =========================================================
   PROGRAMME SERIES LENGTH
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
   PROGRAMMES WITH AN EXTRA WEEK 14 SESSION
========================================================= */

const WEEK_14_PROGRAMMES = [

  "Manage Knee Health",

  "Manage Metabolic Health"

];


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

let manpowerVenue =
  null;

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


/* =========================================================
   CALENDAR REFERENCES
========================================================= */

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


/* =========================================================
   MODAL REFERENCES
========================================================= */

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
   SUPABASE TEST
========================================================= */

async function testSupabaseConnection() {

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
        "programmes"
      )
      .select("*")
      .limit(1);


  if (
    error
  ) {

    console.error(
      "Supabase connection test failed:",
      error
    );

  } else {

    console.log(
      "Supabase connection successful.",
      data
    );

  }

}


/* =========================================================
   TIME SELECTOR SETUP
========================================================= */

function populateHours() {

  const selectors = [
    startHour,
    editStartHour
  ];


  selectors.forEach(
    function (select) {

      if (
        !select
      ) {

        return;

      }


      select.innerHTML =
        "";


      for (
        let hour = 0;
        hour < 24;
        hour++
      ) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          String(
            hour
          ).padStart(
            2,
            "0"
          );


        option.textContent =
          String(
            hour
          ).padStart(
            2,
            "0"
          );


        select.appendChild(
          option
        );

      }

    }
  );


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
    editStartHour
  ) {

    editStartHour.value =
      "09";

  }


  if (
    editStartMinute
  ) {

    editStartMinute.value =
      "00";

  }

}


/* =========================================================
   DATE HELPERS
========================================================= */

function parseInputDate(
  value
) {

  const parts =
    String(
      value ||
      ""
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
    (
      parts[1] ||
      1
    ) - 1,
    parts[2] ||
    1
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
   TIME HELPERS
========================================================= */

function isValidHalfHourTime(
  time
) {

  const parts =
    String(
      time ||
      ""
    )
    .split(
      ":"
    );


  if (
    parts.length <
    2
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
      `${String(
        startHour.value
      ).padStart(
        2,
        "0"
      )}:` +
      `${String(
        startMinute.value
      ).padStart(
        2,
        "0"
      )}`
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
      `${String(
        editStartHour.value
      ).padStart(
        2,
        "0"
      )}:` +
      `${String(
        editStartMinute.value
      ).padStart(
        2,
        "0"
      )}`
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

  const [
    hours,
    mins
  ] =
    String(
      time ||
      "09:00"
    )
    .split(
      ":"
    )
    .map(
      Number
    );


  const total =
    (
      hours *
      60
    ) +
    mins +
    Number(
      minutes ||
      0
    );


  const newHours =
    Math.floor(
      total /
      60
    ) % 24;


  const newMinutes =
    total %
    60;


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

  const [
    hours,
    minutes
  ] =
    String(
      time ||
      "09:00"
    )
    .split(
      ":"
    )
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
      minutes ||
      0
    );


  if (
    total <
    60
  ) {

    return (
      `${total} min`
    );

  }


  const hours =
    Math.floor(
      total /
      60
    );


  const remainder =
    total %
    60;


  if (
    remainder ===
    0
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
    `${hours} hr ${remainder} min`
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
    Math.random()
      .toString(36)
      .slice(2)
  );

}


function escapeHtml(
  value
) {

  return String(
    value ??
    ""
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
   PROGRAMME HELPERS
========================================================= */

function getPax(
  programme
) {

  return Object.prototype
    .hasOwnProperty.call(
      PAX,
      programme
    )

    ? PAX[
        programme
      ]

    : "";

}


function isKnownProgramme(
  programme
) {

  return Object.prototype
    .hasOwnProperty.call(
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


  /*
    Custom programme name has already
    replaced "Others" before this function
    is normally called, so the supplied
    value is used when available.
  */

  if (
    Number(
      value
    ) > 0
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
   DATABASE MAPPING
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
      event.pax ===
        "" ||
      event.pax ==
        null

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
   FILTER EVENTS
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


/* =========================================================
   MASTER CALENDAR RENDER
========================================================= */

function renderCalendar() {

  if (
    !calendarGrid
  ) {

    console.error(
      "calendarGrid was not found."
    );


    return;

  }


  console.log(
    "Rendering calendar view:",
    activeCalendarView
  );


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

    let dayNumber;

    let cellDate;

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


    /*
      Manpower / staff first.
    */

    cell.appendChild(
      createManpowerSection(
        currentVenue,
        dateString
      )
    );


    /*
      Programmes second.
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

  if (
    !calendarGrid
  ) {

    return;

  }


  const weekStart =
    startOfWeek(
      currentDate
    );


  currentDate =
    new Date(
      weekStart
    );


  calendarGrid.innerHTML =
    "";


  calendarGrid.className =
    "calendar-grid week-view";


  if (
    monthTitle
  ) {

    monthTitle.textContent =
      getViewDateLabel();

  }


  const dates =
    [];


  for (
    let index = 0;
    index < 7;
    index++
  ) {

    dates.push(
      addDays(
        weekStart,
        index
      )
    );

  }


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


  console.log(
    "Week view rendered with",
    calendarGrid.children.length,
    "columns."
  );

}


/* =========================================================
   DAY VIEW
========================================================= */

function renderDayView() {

  if (
    !calendarGrid
  ) {

    return;

  }


  calendarGrid.innerHTML =
    "";


  calendarGrid.className =
    "calendar-grid day-view";


  if (
    monthTitle
  ) {

    monthTitle.textContent =
      getViewDateLabel();

  }


  renderFlexibleHeader(
    [
      new Date(
        currentDate
      )
    ]
  );


  calendarGrid.appendChild(
    renderDayColumn(
      currentDate
    )
  );


  console.log(
    "Day view rendered with",
    calendarGrid.children.length,
    "column."
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


  if (
    !header
  ) {

    console.error(
      "week-header was not found."
    );


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


      button.className =
        "calendar-date-header";


      button.textContent =
        date.toLocaleDateString(
          "en-SG",
          {
            weekday:
              activeCalendarView ===
              "day"

                ? "long"

                : "short",

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


      /*
        Clicking a date in Week view
        opens that date in Day view.
      */

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
    activeCalendarView ===
    "day"
  ) {

    column.classList.add(
      "day-column"
    );

  }


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
    STAFF / MANPOWER FIRST
  */

  const manpowerSection =
    createManpowerSection(
      currentVenue,
      dateString
    );


  column.appendChild(
    manpowerSection
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

  } else {

    dayEvents.forEach(
      function (
        event
      ) {

        const eventElement =
          createEventElement(
            event
          );


        if (
          activeCalendarView ===
          "week"
        ) {

          eventElement.classList.add(
            "week-view-event"
          );

        }


        if (
          activeCalendarView ===
          "day"
        ) {

          eventElement.classList.add(
            "day-view-event"
          );

        }


        column.appendChild(
          eventElement
        );

      }
    );

  }


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

      ? (
          event.sessionNumber ===
          14

            ? "Week 14"

            : `Week ${event.sessionNumber}`
        )

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
   MANPOWER HELPERS
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
    Array.isArray(
      record.staff
    ) &&
    record.staff.length >
      0
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
    Array.isArray(
      record.staff
    )

      ? record.staff.length

      : 0;


  if (
    present === 0
  ) {

    button.textContent =
      "👥 Set manpower";

  } else {

    button.textContent =
      `👥 ${present} staff / ${REQUIRED_MANPOWER} req.`;


    if (
      present >=
      REQUIRED_MANPOWER
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
   PROGRAMME FORM SETUP
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


          if (
            !custom
          ) {

            customDuration.value =
              "";

          }

        }

      }
    );

  }


  /*
    EDIT PROGRAMME SELECT
  */

  if (
    editProgramme
  ) {

    editProgramme.addEventListener(
      "change",
      function () {

        const isCustom =
          editProgramme.value ===
          "__CUSTOM__";


        if (
          editCustomProgrammeGroup
        ) {

          editCustomProgrammeGroup
            .classList.toggle(
              "hidden",
              !isCustom
            );

        }


        if (
          editDurationGroup
        ) {

          editDurationGroup
            .classList.toggle(
              "hidden",
              !isCustom
            );

        }

      }
    );

  }

}


/* =========================================================
   BUILD PROGRAMME EVENTS
========================================================= */

function buildProgrammeEvents(
  options
) {

  const {
    programmeName,
    venue,
    startDate,
    time,
    duration,
    status,
    remarks,
    seriesId
  } =
    options;


  const normalSessions =
    SERIES_WEEKS[
      programmeName
    ] ||
    1;


  const hasWeek14 =
    needsWeek14Session(
      programmeName
    );


  const storedSessionCount =
    normalSessions +
    (
      hasWeek14
        ? 1
        : 0
    );


  const result =
    [];


  /*
    Normal weekly sessions.
  */

  for (
    let index = 0;
    index < normalSessions;
    index++
  ) {

    const sessionDate =
      addDays(
        parseInputDate(
          startDate
        ),
        index * 7
      );


    result.push({

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
        status,

      remarks:
        remarks,

      sessionNumber:
        normalSessions > 1 ||
        hasWeek14

          ? index + 1

          : null,

      totalSessions:
        storedSessionCount,

      type:
        storedSessionCount > 1

          ? "Series"

          : "Stand-alone"

    });

  }


  /*
    Additional Week 14 session.
  */

  if (
    hasWeek14
  ) {

    const week14Date =
      addDays(
        parseInputDate(
          startDate
        ),
        13 * 7
      );


    result.push({

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
        status,

      remarks:
        remarks,

      sessionNumber:
        14,

      totalSessions:
        storedSessionCount,

      type:
        "Series"

    });

  }


  return result;

}


/* =========================================================
   ADD PROGRAMME
========================================================= */

async function addProgramme() {

  const selected =
    programmeSelect
      ? programmeSelect.value
      : "";


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


  let isCustom =
    false;


  if (
    selected ===
    "Others"
  ) {

    isCustom =
      true;


    programmeName =
      customProgrammeInput

        ? customProgrammeInput
            .value
            .trim()

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
    !time ||
    !isValidHalfHourTime(
      time
    )
  ) {

    alert(
      "Please select a start time ending in :00 or :30."
    );

    return;

  }


  let duration =
    60;


  if (
    selected ===
    "Body Composition Assessment"
  ) {

    duration =
      30;

  } else if (
    isCustom
  ) {

    let durationValue =
      durationPreset
        ? durationPreset.value
        : "60";


    if (
      durationValue ===
      "custom"
    ) {

      durationValue =
        customDuration
          ? customDuration.value
          : "";

    }


    duration =
      Number(
        durationValue
      );

  }


  if (
    !Number.isFinite(
      duration
    ) ||
    duration <=
      0
  ) {

    alert(
      "Please enter a valid duration."
    );

    return;

  }


  const seriesId =
    makeId(
      "series"
    );


  const newEvents =
    buildProgrammeEvents(
      {

        programmeName:
          programmeName,

        venue:
          venue,

        startDate:
          date,

        time:
          time,

        duration:
          duration,

        status:
          statusInput
            ? statusInput.value
            : "",

        remarks:
          remarksInput
            ? remarksInput.value.trim()
            : "",

        seriesId:
          seriesId

      }
    );


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


  currentVenue =
    venue;


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


  updateVenueUI();


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


  function setText(
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

  }


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

      ? (
          event.sessionNumber === 14

            ? "Week 14"

            : `Week ${event.sessionNumber}`
        )

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
    )
    .split(
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


  /*
    IMPORTANT:
    Do NOT call closeEventModal() here,
    because it clears selectedEventId.
  */

  if (
    eventModal
  ) {

    eventModal.classList.remove(
      "visible"
    );

  }


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


  let isCustom =
    false;


  if (
    programmeName ===
    "__CUSTOM__"
  ) {

    isCustom =
      true;


    programmeName =
      editCustomProgramme

        ? editCustomProgramme
            .value
            .trim()

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
    !newTime ||
    !isValidHalfHourTime(
      newTime
    )
  ) {

    alert(
      "Please select a start time ending in :00 or :30."
    );

    return;

  }


  let duration =
    60;


  if (
    programmeName ===
    "Body Composition Assessment"
  ) {

    duration =
      30;

  } else if (
    isCustom
  ) {

    duration =
      Number(
        editDuration
          ? editDuration.value
          : ""
      );

  }


  if (
    !Number.isFinite(
      duration
    ) ||
    duration <=
      0
  ) {

    alert(
      "Please enter a valid duration."
    );

    return;

  }


  const newVenue =
    editVenue
      ? editVenue.value
      : currentVenue;


  const replacement =
    buildProgrammeEvents(
      {

        programmeName:
          programmeName,

        venue:
          newVenue,

        startDate:
          editStartDate.value,

        time:
          newTime,

        duration:
          duration,

        status:
          editStatus
            ? editStatus.value
            : "",

        remarks:
          editRemarks
            ? editRemarks.value.trim()
            : "",

        seriesId:
          oldSeriesId

      }
    );


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


  currentVenue =
    newVenue;


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


  updateVenueUI();


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
    ) >
    1;


  const message =
    wholeSeries

      ? "Delete the entire programme series?"

      : "Delete this programme?";


  if (
    !confirm(
      message
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
   STAFF CHECKLIST
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


  status.className =
    "staff-status";


  if (
    present >=
    REQUIRED_MANPOWER
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
        REQUIRED_MANPOWER -
        present
      }`;

  }

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


  manpowerVenue =
    venue;


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


/* =========================================================
   CLOSE MANPOWER MODAL
========================================================= */

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


  manpowerVenue =
    null;

}


/* =========================================================
   SAVE MANPOWER
========================================================= */

async function saveManpower() {

  if (
    !manpowerDate ||
    !manpowerVenue
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


  if (
    !supabaseClient
  ) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const record = {

    venue:
      manpowerVenue,

    date:
      manpowerDate,

    staff:
      staff,

    required:
      REQUIRED_MANPOWER,

    notes:
      notes

  };


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


  manpower[
    manpowerKey(
      manpowerVenue,
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


/* =========================================================
   LOAD MANPOWER
========================================================= */

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
   VENUE UI
========================================================= */

function updateVenueUI() {

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


  updateSheetTabs();

}


/* =========================================================
   SWITCH VENUE
========================================================= */

function switchVenue(
  venue
) {

  currentVenue =
    venue;


  showingSummary =
    false;


  updateVenueUI();


  showCalendarView();

}


/* =========================================================
   CHANGE CALENDAR VIEW
========================================================= */

function changeCalendarView() {

  if (
    !calendarViewSelect
  ) {

    return;

  }


  activeCalendarView =
    calendarViewSelect.value;


  console.log(
    "Changing calendar view to:",
    activeCalendarView
  );


  showingSummary =
    false;


  if (
    summaryPanel
  ) {

    summaryPanel.classList.add(
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
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  updateSheetTabs();


  renderCalendar();

}


/* =========================================================
   PREVIOUS
========================================================= */

function goPrevious() {

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


    return;

  }


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


/* =========================================================
   NEXT
========================================================= */

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


/* =========================================================
   TODAY
========================================================= */

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
   SHOW CALENDAR
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


  if (
    calendarGrid
  ) {

    calendarGrid.classList.remove(
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


  updateSheetTabs();


  renderCalendar();

}


/* =========================================================
   SHOW SUMMARY
========================================================= */

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


/* =========================================================
   UPDATE TABS
========================================================= */

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
   MONTHLY PROGRAMME SUMMARY
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
        ] =
          0;

      }


      programmeCounts[
        programme
      ]++;

    }
  );


  const programmes =
    Object.keys(
      programmeCounts
    )
    .sort(
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
        No programmes conducted this month.
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


/* =========================================================
   SUMMARY MONTH NAVIGATION
========================================================= */

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


  const programmeResult =
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
    programmeResult.error
  ) {

    alert(
      `Unable to clear programmes: ${programmeResult.error.message}`
    );

    return;

  }


  const manpowerResult =
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
    manpowerResult.error
  ) {

    alert(
      `Unable to clear manpower: ${manpowerResult.error.message}`
    );

    return;

  }


  events =
    [];


  manpower =
    {};


  renderCalendar();


  alert(
    "All data cleared."
  );

}


/* =========================================================
   BUTTON SETUP
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

  populateHours();


  setupProgrammeForm();


  setupButtons();


  if (
    startDateInput
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
   START APPLICATION
========================================================= */

initialise();

testSupabaseConnection();

refreshProgrammesFromSupabase();

loadManpowerFromSupabase();
