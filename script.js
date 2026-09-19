/* =========================================================
   SUPABASE CONNECTION
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

  console.warn(
    "Supabase library was not loaded."
  );

}

/* =========================================================
   TEST SUPABASE CONNECTION
========================================================= */

async function testSupabaseConnection() {

  if (!supabaseClient) {

    console.warn(
      "Supabase client unavailable."
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("programmes")
      .select("*")
      .limit(1);


  if (error) {

    console.error(
      "Supabase connection test failed:",
      error
    );

    return;

  }


  console.log(
    "Supabase connection successful.",
    data
  );

}


/* =========================================================
   PROGRAMME CALENDAR
   FRONTEND VERSION
   Month / Week / Day
========================================================= */


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
   STATE
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
  document.getElementById("programme");

const customProgrammeGroup =
  document.getElementById("customProgrammeGroup");

const customProgrammeInput =
  document.getElementById("customProgramme");

const editVenueSelect =
  document.getElementById("editVenue");

const startDateInput =
  document.getElementById("startDate");

const startTimeInput =
  document.getElementById("startTime");

const startHour =
  document.getElementById("startHour");

const startMinute =
  document.getElementById("startMinute");

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
   SUPABASE - LOAD PROGRAMMES
========================================================= */

async function loadProgrammesFromSupabase() {

  if (!supabaseClient) {

    console.warn(
      "Supabase client unavailable."
    );

    return [];

  }


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
      "Unable to load programmes:",
      error
    );

    return [];

  }


  return data || [];

}


/* =========================================================
   CONVERT DATABASE PROGRAMME
========================================================= */

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
        row.date
      ).substring(
        0,
        10
      ),

    time:
      String(
        row.time
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
   REFRESH PROGRAMMES
========================================================= */

async function refreshProgrammesFromSupabase() {

  const rows =
    await loadProgrammesFromSupabase();


  events =
    rows.map(
      convertDatabaseProgramme
    );


  renderCalendar();

}

/* =========================================================
   EDIT REFERENCES
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

const venueSelect =
  document.getElementById("venue");

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
   INITIAL SETUP
========================================================= */

function initialise() {

  if (startDateInput) {
    startDateInput.value =
      formatInputDate(
        new Date()
      );
  }

  if (venueSelect) {
    venueSelect.value =
      currentVenue;
  }

  if (calendarViewSelect) {
    calendarViewSelect.value =
      activeCalendarView;
  }

  renderCalendar();

}


/* =========================================================
   CALENDAR VIEW SELECTOR
========================================================= */

function changeCalendarView() {

  const selectedView =
    document.getElementById("calendarView").value;

  activeCalendarView =
    selectedView;

  console.log(
    "Changing calendar view to:",
    activeCalendarView
  );

  if (
    activeCalendarView === "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }

  renderCalendar();

}


const viewSelector =
  document.getElementById("calendarView");


if (viewSelector) {

  viewSelector.addEventListener(
    "change",
    changeCalendarView
  );

  /*
    Also listen for input.
    This helps in environments where the browser/security
    layer does not reliably send the normal change event.
  */

  viewSelector.addEventListener(
    "input",
    changeCalendarView
  );

}


/* =========================================================
   VENUE SWITCHING
========================================================= */

if (hbbSheetTab) {

  hbbSheetTab.addEventListener(
    "click",
    function () {

      switchVenue("HBB");

    }
  );

}


if (othSheetTab) {

  othSheetTab.addEventListener(
    "click",
    function () {

      switchVenue("OTH");

    }
  );

}


function switchVenue(
  venue
) {

  currentVenue =
    venue;


  if (venueSelect) {

    venueSelect.value =
      venue;

  }


  if (hbbSheetTab) {

    hbbSheetTab.classList.toggle(
      "active",
      venue === "HBB"
    );

  }


  if (othSheetTab) {

    othSheetTab.classList.toggle(
      "active",
      venue === "OTH"
    );

  }


  if (currentVenueLabel) {

    currentVenueLabel.textContent =
      venue;

  }


  renderCalendar();

}


/* =========================================================
   MASTER RENDER
========================================================= */
function renderCalendar() {

  if (!calendarGrid) {

    console.error(
      "calendarGrid was not found."
    );

    return;

  }


  console.log(
    "Rendering:",
    activeCalendarView
  );


  if (
    activeCalendarView === "week"
  ) {

    renderWeekView();

    return;

  }


  if (
    activeCalendarView === "day"
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


  if (header) {

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
   VIEW DATE LABEL
========================================================= */

function getViewDateLabel() {

  if (
    activeCalendarView === "day"
  ) {

    return currentDate.toLocaleDateString(
      "en-SG",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

  }


  if (
    activeCalendarView === "week"
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
          day: "numeric",
          month: "short"
        }
      );


    const endText =
      end.toLocaleDateString(
        "en-SG",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );


    return `${startText} - ${endText}`;

  }


  return currentDate.toLocaleDateString(
    "en-SG",
    {
      month: "long",
      year: "numeric"
    }
  );

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


  monthTitle.textContent =
    getViewDateLabel();


  const dates =
    Array.from(
      {
        length: 7
      },
      function (_, index) {

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
    function (date) {

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


  if (!header) {
    return;
  }


  header.innerHTML =
    "";


  header.className =
    activeCalendarView === "day"
      ? "week-header day-view-header"
      : "week-header week-view-header";


  dates.forEach(
    function (date) {

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
        activeCalendarView === "week"
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
    dayEvents.length === 0
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
    function (event) {

      const element =
        createEventElement(
          event
        );


      if (
        activeCalendarView === "day"
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
      function (event) {

        return (
          event.date === date &&
          event.venue === currentVenue
        );

      }
    )
    .sort(
      function (a, b) {

        return a.time.localeCompare(
          b.time
        );

      }
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
    function (clickEvent) {

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
    record.required === ""
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
    function (event) {

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
   PROGRAMME FORM
========================================================= */

programmeSelect.addEventListener(
  "change",
  function () {

    const isOthers =
      programmeSelect.value ===
      "Others";


    customProgrammeGroup.classList.toggle(
      "hidden",
      !isOthers
    );


    durationGroup.classList.toggle(
      "hidden",
      !isOthers
    );


    if (!isOthers) {

      customProgrammeInput.value =
        "";

      customDuration.value =
        "";

      durationPreset.value =
        "60";

      customDuration.disabled =
        true;

    }

  }
);


durationPreset.addEventListener(
  "change",
  function () {

    const custom =
      durationPreset.value ===
      "custom";


    customDuration.disabled =
      !custom;


    if (!custom) {

      customDuration.value =
        "";

    }

  }
);

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
      event.status || null,

    remarks:
      event.remarks || null,

    session_number:
      event.sessionNumber ??
      null,

    total_sessions:
      event.totalSessions ??
      1,

    type:
      event.type || null

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
        row.date
      ).substring(
        0,
        10
      ),

    time:
      String(
        row.time
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
   ADD PROGRAMME
========================================================= */

document
  .getElementById("addButton")
  .addEventListener(
    "click",
    addProgramme
  );


async function addProgramme() {

  /* -------------------------------------------------------
     1. GET FORM VALUES
  ------------------------------------------------------- */

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
    selected === "Others"
  ) {

    programmeName =
      customProgrammeInput.value.trim();


    if (!programmeName) {

      alert(
        "Please enter a programme name."
      );

      return;

    }

  }


  const venue =
    venueSelect.value;


  const date =
    startDateInput.value;


const time =
  `${startHour.value}:${startMinute.value}`;

   const newTime =
  `${editStartHour.value}:${editStartMinute.value}`;
   
   if (!isValidHalfHourTime(time)) {

  alert(
    "Please select a start time ending in :00 or :30."
  );

  return;

}

  if (
    !date ||
    !time
  ) {

    alert(
      "Please select a date and time."
    );

    return;

  }


  /* -------------------------------------------------------
     2. DETERMINE DURATION
  ------------------------------------------------------- */

  let duration;


  if (
    programmeName === "Others"
  ) {

    if (
      durationPreset.value === "custom"
    ) {

      duration =
        Number(
          customDuration.value
        );

    } else {

      duration =
        Number(
          durationPreset.value
        );

    }

  } else {

    duration =
      60;

  }


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


  /* -------------------------------------------------------
     3. DETERMINE SESSION COUNT
  ------------------------------------------------------- */

  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] || 1;


  /* -------------------------------------------------------
     4. CREATE SERIES ID
  ------------------------------------------------------- */

  const seriesId =
    makeId(
      "series"
    );


  /* -------------------------------------------------------
     5. BUILD ALL SESSIONS
  ------------------------------------------------------- */

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
        statusInput.value,

      remarks:
        remarksInput.value.trim(),

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


  /* -------------------------------------------------------
     6. CHECK SUPABASE
  ------------------------------------------------------- */

  if (!supabaseClient) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  /* -------------------------------------------------------
     7. CONVERT TO DATABASE FORMAT
  ------------------------------------------------------- */

  const rows =
    newEvents.map(
      mapProgrammeToDatabase
    );


  console.log(
    "Saving programme to Supabase:",
    rows
  );


  /* -------------------------------------------------------
     8. INSERT INTO SUPABASE
  ------------------------------------------------------- */

  const {
    data,
    error
  } =
    await supabaseClient
      .from("programmes")
      .insert(
        rows
      )
      .select();


  /* -------------------------------------------------------
     9. HANDLE DATABASE ERROR
  ------------------------------------------------------- */

  if (error) {

    console.error(
      "Programme insert failed:",
      error
    );


    alert(
      `Unable to save programme: ${error.message}`
    );


    return;

  }


  /* -------------------------------------------------------
     10. UPDATE LOCAL APP DATA
  ------------------------------------------------------- */

  events.push(
    ...(
      data || []
    ).map(
      convertDatabaseProgramme
    )
  );


  /* -------------------------------------------------------
     11. MOVE CALENDAR TO PROGRAMME DATE
  ------------------------------------------------------- */

  currentDate =
    parseInputDate(
      date
    );


  if (
    activeCalendarView === "month"
  ) {

    currentDate =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

  }


  if (
    activeCalendarView === "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  /* -------------------------------------------------------
     12. REDRAW CALENDAR
  ------------------------------------------------------- */

  renderCalendar();


  /* -------------------------------------------------------
     13. RESET FORM
  ------------------------------------------------------- */

  resetProgrammeForm();


  alert(
    "Programme saved successfully."
  );

}
     
/* =========================================================
   RESET PROGRAMME FORM
========================================================= */

function resetProgrammeForm() {

  programmeSelect.value =
    "";

  customProgrammeInput.value =
    "";

  customProgrammeGroup.classList.add(
    "hidden"
  );

  durationGroup.classList.add(
    "hidden"
  );

  durationPreset.value =
    "60";

  customDuration.value =
    "";

  customDuration.disabled =
    true;

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
      : "Stand-alone";


  document.getElementById(
    "modalStatus"
  ).textContent =
    event.status || "";


  document.getElementById(
    "modalRemarks"
  ).textContent =
    event.remarks ||
    "—";


  eventModal.classList.add(
    "visible"
  );

}


/* =========================================================
   CLOSE EVENT MODAL
========================================================= */

function closeEventModal() {

  if (eventModal) {

    eventModal.classList.remove(
      "visible"
    );

  }

  selectedEventId =
    null;

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

document
  .getElementById(
    "closeButton"
  )
  .addEventListener(
    "click",
    closeEventModal
  );

/* =========================================================
   EDIT
========================================================= */

document
  .getElementById(
    "editButton"
  )
  .addEventListener(
    "click",
    openEditModal
  );


function openEditModal() {

  if (!selectedEventId) {
    return;
  }


  const selected =
    events.find(
      function (event) {

        return event.id ===
          selectedEventId;

      }
    );


  if (!selected) {
    return;
  }


  const series =
    events
      .filter(
        function (event) {

          return event.seriesId ===
            selected.seriesId;

        }
      )
      .sort(
        function (a, b) {

          return dateTimeValue(a) -
            dateTimeValue(b);

        }
      );


  const first =
    series[0];


  const known =
    isKnownProgramme(
      first.programme
    );


  editProgramme.value =
    known
      ? first.programme
      : "__CUSTOM__";


  editCustomProgramme.value =
    known
      ? ""
      : first.programme;


  editCustomProgrammeGroup.classList.toggle(
    "hidden",
    known
  );


  editVenue.value =
    first.venue;


  editStartDate.value =
    first.date;


  editStartTime.value =
    first.time;


  editDuration.value =
    first.duration;


  editDurationGroup.classList.toggle(
    "hidden",
    known
  );


  editRemarks.value =
    first.remarks ||
    "";


  editStatus.value =
    first.status ||
    "Uploaded (100% Created)";


  eventModal.classList.remove(
    "visible"
  );


  editModal.classList.add(
    "visible"
  );

}


document
  .getElementById(
    "saveEditButton"
  )
  .addEventListener(
    "click",
    saveEdit
  );

 /* =========================================================
   SAVE EDITED PROGRAMME TO SUPABASE
========================================================= */

/* =========================================================
   SAVE EDITED PROGRAMME TO SUPABASE
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


  /*
    All sessions belonging to this programme
    share the same seriesId.
  */

  const oldSeriesId =
    selected.seriesId;


  /*
    Get the original first session.
  */

  const series =
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
      );


  const firstEvent =
    series[0];


  if (!firstEvent) {
    return;
  }


  /*
    Determine programme name.
  */

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


  /*
    Determine duration.
  */

  let duration;


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    duration =
      Number(
        editDuration.value
      );

  } else {

    duration =
      60;

  }


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


  /*
    Determine number of sessions.
  */

  const totalSessions =
    SERIES_WEEKS[
      programmeName
    ] || 1;


  /*
    Build the replacement series.
  */

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
        editVenue.value,

      date:
        formatInputDate(
          sessionDate
        ),

      time:
        editStartTime.value,

      duration,

      pax:
        getPax(
          programmeName
        ),

      status:
        editStatus.value,

      remarks:
        editRemarks.value.trim(),

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


  /*
    Make sure Supabase is connected.
  */

  if (!supabaseClient) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  /*
    STEP 1:
    Delete the old series from Supabase.
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
      "Unable to delete old series:",
      deleteError
    );


    alert(
      `Unable to update programme: ${deleteError.message}`
    );


    return;

  }


  /*
    STEP 2:
    Insert the edited series.
  */

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

    console.error(
      "Unable to save edited series:",
      error
    );


    alert(
      `Unable to save changes: ${error.message}`
    );


    /*
      Re-load whatever is actually in Supabase.
    */

    await refreshProgrammesFromSupabase();


    return;

  }


  /*
    STEP 3:
    Replace the old events in memory.
  */

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
      convertDatabaseProgramme
    )
  );


  /*
    STEP 4:
    Move the calendar to the edited
    programme's first session.
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

  } else if (
    activeCalendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  /*
    STEP 5:
    Close modal and redraw.
  */

  closeEditModal();


  switchVenue(
    editVenue.value
  );


  renderCalendar();

}

/* =========================================================
   CANCEL EDIT
========================================================= */

document
  .getElementById(
    "cancelEditButton"
  )
  .addEventListener(
    "click",
    closeEditModal
  );


function closeEditModal() {

  editModal.classList.remove(
    "visible"
  );


  selectedEventId =
    null;

}


/* =========================================================
   DELETE BUTTON
========================================================= */

document
  .getElementById(
    "deleteButton"
  )
  .addEventListener(
    "click",
    deleteSelected
  );

/* =========================================================
   DELETE PROGRAMME FROM SUPABASE
========================================================= */

async function deleteSelected() {

  if (!selectedEventId) {
    return;
  }


  const selected =
    events.find(
      event =>
        event.id === selectedEventId
    );


  if (!selected) {
    return;
  }


  const deleteWholeSeries =
    selected.totalSessions > 1;


  const message =
    deleteWholeSeries
      ? "Delete the entire programme series?"
      : "Delete this programme?";


  if (!confirm(message)) {
    return;
  }


  if (!supabaseClient) {

    alert(
      "Supabase is not connected."
    );

    return;
  }


  /*
    Delete from Supabase
  */

  let query =
    supabaseClient
      .from("programmes")
      .delete();


  if (deleteWholeSeries) {

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
  } = await query;


  if (error) {

    console.error(
      "Unable to delete programme:",
      error
    );


    alert(
      `Unable to delete programme: ${error.message}`
    );

    return;
  }


  /*
    Delete from the local events array
  */

  if (deleteWholeSeries) {

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


  /*
    Close the popup
  */

  closeEventModal();


  /*
    Refresh the calendar
  */

  renderCalendar();

}


/* =========================================================
   MANPOWER MODAL
========================================================= */

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
    "selectAllStaff"
  )
  .addEventListener(
    "click",
    function () {

      document
        .querySelectorAll(
          '#staffList input[type="checkbox"]'
        )
        .forEach(
          function (checkbox) {

            checkbox.checked =
              true;

          }
        );


      updateStaffCount();

    }
  );


document
  .getElementById(
    "clearAllStaff"
  )
  .addEventListener(
    "click",
    function () {

      document
        .querySelectorAll(
          '#staffList input[type="checkbox"]'
        )
        .forEach(
          function (checkbox) {

            checkbox.checked =
              false;

          }
        );


      updateStaffCount();

    }
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


  manpowerModal.classList.add(
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
    function (name) {

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
    function (checkbox) {

      return checkbox.value;

    }
  );

}


function updateStaffCount() {

  document.getElementById(
    "presentCount"
  ).textContent =
    selectedStaff().length;

}


document
  .getElementById(
    "requiredManpower"
  )
  .addEventListener(
    "input",
    updateStaffStatus
  );


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
    required === ""
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


function saveManpower() {

  if (!manpowerDate) {
    return;
  }


  manpower[
    manpowerKey(
      currentVenue,
      manpowerDate
    )
  ] = {

    staff:
      selectedStaff(),

    required:
      document.getElementById(
        "requiredManpower"
      ).value === ""
        ? ""
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


  closeManpowerModal();


  renderCalendar();

}


function closeManpowerModal() {

  manpowerModal.classList.remove(
    "visible"
  );


  manpowerDate =
    null;

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
    function () {

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
  );


document
  .getElementById(
    "nextButton"
  )
  .addEventListener(
    "click",
    function () {

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
  );


document
  .getElementById(
    "todayButton"
  )
  .addEventListener(
    "click",
    function () {

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
  );


/* =========================================================
   CLEAR
========================================================= */

document
  .getElementById(
    "clearButton"
  )
  .addEventListener(
    "click",
    function () {

      if (
        !confirm(
          "Delete all programmes and manpower?"
        )
      ) {

        return;

      }


      events =
        [];


      manpower =
        {};


      renderCalendar();

    }
  );


/* =========================================================
   UTILITIES
========================================================= */
function isValidHalfHourTime(time) {

  if (!time) {
    return false;
  }

  const parts =
    time.split(":");

  if (parts.length < 2) {
    return false;
  }

  const minutes =
    Number(parts[1]);

  return minutes === 0 ||
    minutes === 30;
}
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


function parseInputDate(
  value
) {

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
    remaining === 0
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
   START
========================================================= */

initialise();

testSupabaseConnection();

refreshProgrammesFromSupabase();
