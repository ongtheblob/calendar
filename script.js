/* =========================================================
   PROGRAMME CALENDAR
   HBB & OTH
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
   STORAGE
========================================================= */

const EVENTS_KEY =
  "programme_calendar_events_final";

const MANPOWER_KEY =
  "programme_calendar_manpower_final";


let events =
  loadData(
    EVENTS_KEY,
    []
  );


let manpower =
  loadData(
    MANPOWER_KEY,
    {}
  );


/* =========================================================
   STATE
========================================================= */

let currentVenue =
  "HBB";


let currentDate =
  new Date();


let calendarView =
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
   INITIALISE
========================================================= */

startDateInput.value =
  formatInputDate(
    new Date()
  );


venueSelect.value =
  currentVenue;


if (calendarViewSelect) {

  calendarViewSelect.value =
    calendarView;

}


renderCalendar();


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
   DURATION
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

if (calendarViewSelect) {

  calendarViewSelect.addEventListener(
    "change",
    () => {

      calendarView =
        calendarViewSelect.value;


      if (
        calendarView ===
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
   SHEETS / VENUES
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


function addProgramme() {

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


    events.push({

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
        remarksInput.value.trim(),

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


  saveData(
    EVENTS_KEY,
    events
  );


  const selectedDate =
    parseInputDate(
      startDate
    );


  currentDate =
    selectedDate;


  if (
    calendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  if (
    calendarView ===
    "month"
  ) {

    currentDate =
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );

  }


  switchVenue(
    venue
  );


  resetForm();

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
   MAIN RENDER CONTROLLER
========================================================= */

function renderCalendar() {

  if (
    calendarView ===
    "week"
  ) {

    renderWeekView();

    return;

  }


  if (
    calendarView ===
    "day"
  ) {

    renderDayView();

    return;

  }


  renderMonthView();

}


/* =========================================================
   VIEW LABEL
========================================================= */

function getViewDateLabel() {

  if (
    calendarView ===
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
    calendarView ===
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
    calendarView ===
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
        calendarView ===
        "week"
      ) {

        button.addEventListener(
          "click",
          () => {

            currentDate =
              new Date(
                date
              );


            calendarView =
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
    e => {

      e.stopPropagation();


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

  const manpowerRecord =
    getManpower(
      venue,
      dateString
    );


  const manpowerButton =
    document.createElement(
      "button"
    );


  manpowerButton.type =
    "button";


  manpowerButton.className =
    "manpower-button";


  const present =
    manpowerRecord.staff.length;


  const required =
    manpowerRecord.required ===
    ""
      ? null
      : Number(
          manpowerRecord.required
        );


  if (
    present === 0 &&
    required === null
  ) {

    manpowerButton.textContent =
      "👥 Set manpower";

  } else if (
    required !== null &&
    present >= required
  ) {

    manpowerButton.classList.add(
      "good"
    );


    manpowerButton.textContent =
      `👥 ${present} staff / ${required} req.`;

  } else {

    manpowerButton.classList.add(
      "warning"
    );


    manpowerButton.textContent =
      `👥 ${present} staff / ${required} req.`;

  }


  manpowerButton.addEventListener(
    "click",
    e => {

      e.stopPropagation();


      openManpowerModal(
        venue,
        dateString
      );

    }
  );


  return manpowerButton;

}


/* =========================================================
   WEEK / DAY COLUMN
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
    events
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
        calendarView ===
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
   WEEK VIEW
========================================================= */

function renderWeekView() {

  currentVenueLabel.textContent =
    currentVenue;


  const start =
    startOfWeek(
      currentDate
    );


  currentDate =
    new Date(
      start
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
          start,
          index
        )
    );


  renderFlexibleHeader(
    dates
  );


  calendarGrid.innerHTML =
    "";


  calendarGrid.className =
    "calendar-grid week-view";


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

  currentVenueLabel.textContent =
    currentVenue;


  monthTitle.textContent =
    getViewDateLabel();


  const date =
    new Date(
      currentDate
    );


  renderFlexibleHeader(
    [
      date
    ]
  );


  calendarGrid.innerHTML =
    "";


  calendarGrid.className =
    "calendar-grid day-view";


  calendarGrid.appendChild(
    renderFlexibleDayColumn(
      date
    )
  );

}


/* =========================================================
   MONTH VIEW
========================================================= */

function renderMonthView() {

  currentVenueLabel.textContent =
    currentVenue;


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
      events
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


    dayEvents.forEach(
      event => {

        const element =
          createCalendarEventElement(
            event
          );


        cell.appendChild(
          element
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
   OPEN EDIT
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
      event =>
        event.id ===
        selectedEventId
    );


  if (!selected) {

    return;

  }


  const firstEvent =
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
      )[0];


  editProgramme.value =
    isKnownProgramme(
      firstEvent.programme
    )
      ? firstEvent.programme
      : "__CUSTOM__";


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    editCustomProgrammeGroup
      .classList
      .remove(
        "hidden"
      );


    editCustomProgramme.value =
      firstEvent.programme;

  } else {

    editCustomProgrammeGroup
      .classList
      .add(
        "hidden"
      );


    editCustomProgramme.value =
      "";

  }


  editVenue.value =
    firstEvent.venue;


  editStartDate.value =
    firstEvent.date;


  editStartTime.value =
    firstEvent.time;


  editRemarks.value =
    firstEvent.remarks || "";


  editStatus.value =
    firstEvent.status ||
    "Uploaded (100% Created)";


  if (
    editProgramme.value ===
    "__CUSTOM__"
  ) {

    editDurationGroup
      .classList
      .remove(
        "hidden"
      );


    editDuration.value =
      firstEvent.duration;

  } else {

    editDurationGroup
      .classList
      .add(
        "hidden"
      );


    editDuration.value =
      60;

  }


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
   EDIT PROGRAMME SELECT CHANGE
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


/* =========================================================
   SAVE EDIT
========================================================= */

document
  .getElementById(
    "saveEditButton"
  )
  .addEventListener(
    "click",
    saveEdit
  );


function saveEdit() {

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
      editCustomProgramme.value
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


  events =
    events.filter(
      event =>
        event.seriesId !==
        oldSeriesId
    );


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


    events.push({

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
        editRemarks.value
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


  saveData(
    EVENTS_KEY,
    events
  );


  const date =
    parseInputDate(
      newDate
    );


  currentDate =
    date;


  if (
    calendarView ===
    "week"
  ) {

    currentDate =
      startOfWeek(
        currentDate
      );

  }


  if (
    calendarView ===
    "month"
  ) {

    currentDate =
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );

  }


  closeEditModal();


  switchVenue(
    newVenue
  );


  renderCalendar();

}


/* =========================================================
   DELETE
========================================================= */

document
  .getElementById(
    "deleteButton"
  )
  .addEventListener(
    "click",
    deleteSelected
  );


function deleteSelected() {

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


  saveData(
    EVENTS_KEY,
    events
  );


  closeEventModal();


  renderCalendar();

}


/* =========================================================
   CLOSE PROGRAMME MODAL
========================================================= */

document
  .getElementById(
    "closeButton"
  )
  .addEventListener(
    "click",
    closeEventModal
  );


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
   EDIT MODAL CLOSE
========================================================= */

document
  .getElementById(
    "cancelEditButton"
  )
  .addEventListener(
    "click",
    closeEditModal
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
   STAFF LIST
========================================================= */

function renderStaffChecklist(
  selectedStaff
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
        selectedStaff.includes(
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
   SELECT ALL / CLEAR ALL
========================================================= */

document
  .getElementById(
    "selectAllStaff"
  )
  .addEventListener(
    "click",
    () => {

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
  );


document
  .getElementById(
    "clearAllStaff"
  )
  .addEventListener(
    "click",
    () => {

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
  );


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

document
  .getElementById(
    "saveManpower"
  )
  .addEventListener(
    "click",
    saveManpower
  );


function saveManpower() {

  if (!manpowerDate) {

    return;

  }


  const requiredInput =
    document.getElementById(
      "requiredManpower"
    ).value;


  manpower[
    manpowerKey(
      currentVenue,
      manpowerDate
    )
  ] = {

    staff:
      selectedStaff(),

    required:
      requiredInput === ""
        ? ""
        : Number(
            requiredInput
          ),

    notes:
      document.getElementById(
        "manpowerNotes"
      ).value.trim()

  };


  saveData(
    MANPOWER_KEY,
    manpower
  );


  closeManpowerModal();


  renderCalendar();

}


/* =========================================================
   CLOSE MANPOWER
========================================================= */

document
  .getElementById(
    "closeManpower"
  )
  .addEventListener(
    "click",
    closeManpowerModal
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
    () => {

      if (
        calendarView ===
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
        calendarView ===
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
  );


document
  .getElementById(
    "nextButton"
  )
  .addEventListener(
    "click",
    () => {

      if (
        calendarView ===
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
        calendarView ===
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
  );


document
  .getElementById(
    "todayButton"
  )
  .addEventListener(
    "click",
    () => {

      currentDate =
        new Date();


      if (
        calendarView ===
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
   EXPORT CSV
========================================================= */

document
  .getElementById(
    "exportCurrentButton"
  )
  .addEventListener(
    "click",
    () => {

      exportCSV(
        currentVenue
      );

    }
  );


document
  .getElementById(
    "exportAllButton"
  )
  .addEventListener(
    "click",
    () => {

      exportCSV(
        null
      );

    }
  );


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
          venueFilter + "__"
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


  /* -------------------------------------------------------
     ADD MANPOWER-ONLY DAYS
  ------------------------------------------------------- */

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


  const name =
    venueFilter
      ? `Programme_Schedule_${venueFilter}.csv`
      : "Programme_Schedule_HBB_OTH.csv";


  downloadCSV(
    csv,
    name
  );

}


/* =========================================================
   CLEAR ALL
========================================================= */

document
  .getElementById(
    "clearButton"
  )
  .addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "This will delete all programme and manpower data for HBB and OTH. Continue?"
        )
      ) {

        return;

      }


      events =
        [];


      manpower =
        {};


      saveData(
        EVENTS_KEY,
        events
      );


      saveData(
        MANPOWER_KEY,
        manpower
      );


      renderCalendar();

    }
  );


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
   UTILITY FUNCTIONS
========================================================= */

function isKnownProgramme(
  name
) {

  return Object.keys(
    PAX
  ).includes(
    name
  );

}


/* =========================================================
   PARSE DATE
========================================================= */

function parseInputDate(
  value
) {

  const [
    year,
    month,
    day
  ] =
    value
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
   ADD MINUTES
========================================================= */

function addMinutesToTime(
  time,
  minutes
) {

  const [
    hours,
    mins
  ] =
    time
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
    total %
    60;


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
    time
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
    total <
    60
  ) {

    return `${total} min`;

  }


  const hours =
    Math.floor(
      total / 60
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


/* =========================================================
   FORMAT DISPLAY DATE
========================================================= */

function formatDisplayDate(
  dateString
) {

  return parseInputDate(
    dateString
  ).toLocaleDateString(
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
  ).toLocaleDateString(
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
  ).toLocaleDateString(
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
   LOAD DATA
========================================================= */

function loadData(
  key,
  fallback
) {

  try {

    const saved =
      localStorage.getItem(
        key
      );


    if (!saved) {

      return fallback;

    }


    const parsed =
      JSON.parse(
        saved
      );


    return parsed ??
      fallback;

  } catch (
    error
  ) {

    console.error(
      error
    );


    return fallback;

  }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData(
  key,
  data
) {

  localStorage.setItem(
    key,
    JSON.stringify(
      data
    )
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
