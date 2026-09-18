/* =========================================================
   PROGRAMME CALENDAR - HBB & OTH
   Supabase Backend
   Month / Week / Day Views
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";

const supabase =
  window.supabase.createClient(
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
   DOM ELEMENTS
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
   START APPLICATION
========================================================= */

async function initialiseApplication() {

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


    showLoadingMessage();


    await loadAllData();


    hideLoadingMessage();


    renderCalendar();


    setupRealtime();


  } catch (
    error
  ) {

    console.error(
      "Application initialisation error:",
      error
    );


    hideLoadingMessage();


    alert(
      "The calendar could not connect to the database. Please check your Supabase configuration."
    );

  }

}


initialiseApplication();


/* =========================================================
   LOADING MESSAGE
========================================================= */

function showLoadingMessage() {

  if (!calendarGrid) {
    return;
  }

  calendarGrid.innerHTML = `
    <div
      style="
        grid-column: 1 / -1;
        padding: 40px;
        text-align: center;
        color: #5f6368;
        font-size: 14px;
      "
    >
      Loading calendar...
    </div>
  `;

}


function hideLoadingMessage() {
}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

  events =
    await loadProgrammesFromSupabase();

  manpower =
    await loadManpowerFromSupabase();

}


/* =========================================================
   LOAD PROGRAMMES FROM SUPABASE
========================================================= */

async function loadProgrammesFromSupabase() {

  const {
    data,
    error
  } =
    await supabase
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
      "Supabase programme loading error:",
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
   LOAD MANPOWER FROM SUPABASE
========================================================= */

async function loadManpowerFromSupabase() {

  const {
    data,
    error
  } =
    await supabase
      .from("manpower")
      .select("*");


  if (error) {

    console.error(
      "Supabase manpower loading error:",
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

      result[
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
          record.notes ??
          ""

      };

    }
  );


  return result;

}


/* =========================================================
   MAP DATABASE PROGRAMME
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
   MAP JAVASCRIPT PROGRAMME TO DATABASE
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
   DURATION PRESET
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
   VIEW SELECTOR
========================================================= */

if (
  calendarViewSelect
) {

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
   VENUE / SHEETS
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
   MASTER CALENDAR RENDER
========================================================= */

function renderCalendar() {

  if (
    !calendarGrid
  ) {
    return;
  }


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


  monthTitle.textContent =
    getViewDateLabel();


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


    return `${startText} - ${endText}`;

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
   EVENT ELEMENT
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
    eventObject => {

      eventObject.stopPropagation();


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
    event => {

      event.stopPropagation();


      openManpowerModal(
        venue,
        dateString
      );

    }
  );


  return button;

}


/* =========================================================
   ADD PROGRAMME
========================================================= */

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
    selected === "Others"
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


    const event = {

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

    };


    newEvents.push(
      event
    );

  }


  try {

    const rows =
      newEvents.map(
        mapProgrammeToDatabase
      );


    const {
      data,
      error
    } =
      await supabase
        .from("programmes")
        .insert(
          rows
        )
        .select();


    if (error) {

      console.error(
        "Error adding programme:",
        error
      );

      alert(
        `Unable to save programme: ${error.message}`
      );

      return;

    }


    events.push(
      ...(
        data || []
      )
      .map(
        mapDatabaseProgramme
      )
    );


    currentDate =
      parseInputDate(
        startDate
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


    switchVenue(
      venue
    );


    resetForm();


    alert(
      "Programme saved successfully."
    );


  } catch (
    error
  ) {

    console.error(
      error
    );


    alert(
      "An unexpected error occurred while saving the programme."
    );

  }

}


/* =========================================================
   PROGRAMME DURATION
========================================================= */

function getProgrammeDuration(
  programmeName
) {

  if (
    programmeName !==
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
   PAX
========================================================= */

function getPax(
  programmeName
) {

  return Object.prototype.hasOwnProperty.call(
    PAX,
    programmeName
  )
    ? PAX[
        programmeName
      ]
    : "";

}


/* =========================================================
   PROGRAMME MODAL
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
   EDIT PROGRAMME
========================================================= */

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


  const seriesEvents =
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
    seriesEvents[0];


  if (!firstEvent) {
    return;
  }


  editProgramme.value =
    isKnownProgramme(
      firstEvent.programme
    )
      ? firstEvent.programme
      : "__CUSTOM__";


  const custom =
    editProgramme.value ===
    "__CUSTOM__";


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


  const newDuration =
    editProgramme.value ===
      "__CUSTOM__"
      ? Number(
          editDuration.value
        )
      : 60;


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


  const updatedEvents =
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


    updatedEvents.push({

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
      Delete old series first.
    */

    const {
      error:
        deleteError
    } =
      await supabase
        .from("programmes")
        .delete()
        .eq(
          "series_id",
          oldSeriesId
        );


    if (
      deleteError
    ) {

      console.error(
        "Error deleting old programme series:",
        deleteError
      );

      alert(
        `Unable to update programme: ${deleteError.message}`
      );

      return;

    }


    /*
      Insert replacement series.
    */

    const {
      data,
      error
    } =
      await supabase
        .from("programmes")
        .insert(
          updatedEvents.map(
            mapProgrammeToDatabase
          )
        )
        .select();


    if (error) {

      console.error(
        "Error saving edited programme:",
        error
      );

      alert(
        `Unable to save changes: ${error.message}`
      );

      /*
        Re-load the database because the old
        series was already deleted.
      */

      await loadAllData();

      renderCalendar();

      return;

    }


    /*
      Replace old events in memory.
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
      "An unexpected error occurred while editing the programme."
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

    let deleteQuery =
      supabase
        .from("programmes")
        .delete();


    if (
      selected.totalSessions > 1
    ) {

      deleteQuery =
        deleteQuery.eq(
          "series_id",
          selected.seriesId
        );

    } else {

      deleteQuery =
        deleteQuery.eq(
          "id",
          selected.id
        );

    }


    const {
      error
    } =
      await deleteQuery;


    if (error) {

      console.error(
        "Error deleting programme:",
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
   MANPOWER KEY
========================================================= */

function manpowerKey(
  venue,
  date
) {

  return `${venue}__${date}`;

}


/* =========================================================
   GET MANPOWER
========================================================= */

function getManpower(
  venue,
  date
) {

  const existing =
    manpower[
      manpowerKey(
        venue,
        date
      )
    ];


  if (!existing) {

    return {

      staff: [],

      required: "",

      notes: ""

    };

  }


  return {

    staff:
      Array.isArray(
        existing.staff
      )
        ? existing.staff
        : [],

    required:
      existing.required ??
      "",

    notes:
      existing.notes ??
      ""

  };

}


/* =========================================================
   OPEN MANPOWER
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
   SELECT ALL STAFF
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
    requiredInput ===
    ""
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


  const requiredInput =
    document.getElementById(
      "requiredManpower"
    ).value;


  const staff =
    selectedStaff();


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
      await supabase
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
        "Error saving manpower:",
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
          venueFilter +
          "__"
        )
    );


  if (
    !filteredEvents.length &&
    !relevantManpower.length
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
      "This will delete ALL programme and manpower data for HBB and OTH from the shared database. Continue?"
    )
  ) {

    return;

  }


  try {

    /*
      Delete all programmes.
    */

    const {
      error:
        programmesError
    } =
      await supabase
        .from("programmes")
        .delete()
        .not(
          "id",
          "is",
          null
        );


    if (
      programmesError
    ) {

      console.error(
        programmesError
      );

      alert(
        `Unable to clear programmes: ${programmesError.message}`
      );

      return;

    }


    /*
      Delete all manpower records.
    */

    const {
      error:
        manpowerError
    } =
      await supabase
        .from("manpower")
        .delete()
        .not(
          "venue",
          "is",
          null
        );


    if (
      manpowerError
    ) {

      console.error(
        manpowerError
      );

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


    alert(
      "All shared calendar data has been cleared."
    );


  } catch (
    error
  ) {

    console.error(
      error
    );


    alert(
      "An unexpected error occurred while clearing data."
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
   REALTIME
========================================================= */

function setupRealtime() {

  try {

    supabase
      .channel(
        "programme-calendar-changes"
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

          await refreshCalendarData();

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

          await refreshCalendarData();

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

  } catch (
    error
  ) {

    console.warn(
      "Realtime could not be started:",
      error
    );

  }

}


/* =========================================================
   REFRESH DATA
========================================================= */

async function refreshCalendarData() {

  try {

    events =
      await loadProgrammesFromSupabase();

    manpower =
      await loadManpowerFromSupabase();

    renderCalendar();

  } catch (
    error
  ) {

    console.error(
      "Refresh error:",
      error
    );

  }

}


/* =========================================================
   UTILITY - KNOWN PROGRAMME
========================================================= */

function isKnownProgramme(
  name
) {

  return Object.prototype.hasOwnProperty.call(
    PAX,
    name
  );

}


/* =========================================================
   PARSE INPUT DATE
========================================================= */

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


/* =========================================================
   NORMALIZE DATABASE DATE
========================================================= */

function normalizeDateString(
  value
) {

  return String(
    value
  ).substring(
    0,
    10
  );

}


/* =========================================================
   NORMALIZE DATABASE TIME
========================================================= */

function normalizeTimeString(
  value
) {

  return String(
    value
  ).substring(
    0,
    5
  );

}


/* =========================================================
   FORMAT INPUT DATE
========================================================= */

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


/* =========================================================
   ADD DAYS
========================================================= */

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


/* =========================================================
   START OF WEEK
========================================================= */

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


/* =========================================================
   ADD MINUTES TO TIME
========================================================= */

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


/* =========================================================
   FORMAT TIME
========================================================= */

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


/* =========================================================
   FORMAT DURATION
========================================================= */

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


/* =========================================================
   FORMAT DISPLAY DATE
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


/* =========================================================
   FORMAT SHORT DATE
========================================================= */

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


/* =========================================================
   FORMAT MONTH
========================================================= */

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


/* =========================================================
   DATE TIME VALUE
========================================================= */

function dateTimeValue(
  event
) {

  return new Date(
    `${event.date}T${event.time}`
  ).getTime();

}


/* =========================================================
   PARSE DISPLAY DATE
========================================================= */

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


/* =========================================================
   SAME DAY
========================================================= */

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
   MAKE ID
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

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
   CSV ESCAPE
========================================================= */

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


/* =========================================================
   DOWNLOAD CSV
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
