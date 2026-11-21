/* =========================================================
14. LAB DEPLOYMENT OVERVIEW
Separate monthly data stored in lab_deployment_overview.
Expected table:
  month_key DATE PRIMARY KEY
  deployment_data JSONB NOT NULL DEFAULT '{}'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

JSON shape:
{
  "pddDate": "YYYY-MM-DD",
  "days": {
    "YYYY-MM-DD": {
      "OTH": "deployment details",
      "HBB": "deployment details",
      "HQ": "deployment details",
      "remarks": "remarks"
    }
  }
}
========================================================= */

let showingLabDeployment = false;
let labDeploymentMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
);
let labDeploymentData = {
  pddDate: "",
  days: {}
};
let labDeploymentLoading = false;
let labDeploymentSaveTimer = null;

function labEscapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[character]);
}

function labDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function labMonthKey(date = labDeploymentMonth) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function labMonthTitle(date = labDeploymentMonth) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}

function labGetDayData(dateKey) {
  if (!labDeploymentData.days[dateKey]) {
    labDeploymentData.days[dateKey] = {
      OTH: "",
      HBB: "",
      HQ: "",
      remarks: ""
    };
  }

  return labDeploymentData.days[dateKey];
}

function labIsPdd(dateKey) {
  return labDeploymentData.pddDate === dateKey;
}

function labDeploymentCellInput(dateKey, venue, value, isPdd) {
  const disabled = isPdd ? "disabled" : "";
  const title = isPdd
    ? "PDD meeting date — lab deployment is blocked"
    : `Edit ${venue} deployment`;
  return `
    <textarea
      class="lab-deployment-entry"
      data-lab-date="${dateKey}"
      data-lab-venue="${venue}"
      aria-label="${title} for ${dateKey}"
      placeholder="${isPdd ? "PDD meeting — no deployment" : "Enter deployment"}"
      ${disabled}
    >${labEscapeHTML(value || "")}</textarea>
  `;
}

function renderLabDeploymentOverview() {
  const panel = $("labDeploymentPanel");
  if (!panel) return;

  const first = new Date(
    labDeploymentMonth.getFullYear(),
    labDeploymentMonth.getMonth(),
    1
  );
  const last = new Date(
    labDeploymentMonth.getFullYear(),
    labDeploymentMonth.getMonth() + 1,
    0
  );

  const startOffset = (first.getDay() + 6) % 7; // Monday first
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  const endOffset = (7 - ((last.getDay() + 6) % 7) - 1);
  const gridEnd = new Date(last);
  gridEnd.setDate(last.getDate() + endOffset);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let html = `
    <section class="lab-deployment">
      <header class="lab-deployment-header">
        <div>
          <h2>Lab Deployment Overview</h2>
          <p class="lab-deployment-subtitle">${labMonthTitle()}</p>
        </div>
        <div class="lab-deployment-controls">
          <button type="button" class="toolbar-btn" id="labDeploymentPrevious">‹</button>
          <button type="button" class="toolbar-btn" id="labDeploymentToday">Today</button>
          <button type="button" class="toolbar-btn" id="labDeploymentNext">›</button>
        </div>
      </header>

      <div class="lab-pdd-control">
        <label for="labPddDate">PDD meeting date for ${labMonthTitle()}</label>
        <input type="date" id="labPddDate"
          
          value="${labDeploymentData.pddDate || ""}">
        <small>Choose the actual date each month. Deployment entries on that date are disabled; remarks remain editable.</small>
      </div>

      <div class="lab-deployment-scroll">
        <div class="lab-deployment-weekdays">
          ${weekdays.map(day => `<div>${day}</div>`).join("")}
        </div>
        <div class="lab-deployment-grid">
  `;

  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const dateKey = labDateKey(cursor);
    const outside = cursor.getMonth() !== labDeploymentMonth.getMonth();
    const pdd = labIsPdd(dateKey);
    const dayData = labGetDayData(dateKey);

    html += `
      <article class="lab-deployment-day ${outside ? "lab-outside-month" : ""} ${pdd ? "lab-pdd-day" : ""}">
        <div class="lab-deployment-date">
          <span>${cursor.getDate()}</span>
          ${pdd ? '<span class="lab-pdd-badge">PDD</span>' : ""}
        </div>
        ${["OTH", "HBB", "HQ"].map(venue => `
          <label class="lab-venue-entry">
            <span>${venue}</span>
            ${labDeploymentCellInput(dateKey, venue, dayData[venue], pdd)}
          </label>
        `).join("")}
        <label class="lab-remarks-entry">
          <span>Remarks</span>
          <textarea class="lab-deployment-remarks"
            data-lab-date="${dateKey}"
            placeholder="Remarks (editable on PDD)">${labEscapeHTML(dayData.remarks || "")}</textarea>
        </label>
      </article>
    `;
    cursor.setDate(cursor.getDate() + 1);
  }

  html += `
        </div>
      </div>
      <div class="lab-deployment-save-status" id="labDeploymentSaveStatus" aria-live="polite"></div>
    </section>
  `;

  panel.innerHTML = html;
  setupLabDeploymentPanelEvents();
}

async function loadLabDeploymentMonth() {
  if (!supabaseClient) return;

  labDeploymentLoading = true;
  const monthKey = labMonthKey();

  try {
    const { data, error } = await supabaseClient
      .from("lab_deployment_overview")
      .select("deployment_data")
      .eq("month_key", monthKey)
      .maybeSingle();

    if (error) throw error;

    labDeploymentData = data?.deployment_data || {
      pddDate: "",
      days: {}
    };

    if (!labDeploymentData.days) labDeploymentData.days = {};
    if (!labDeploymentData.pddDate) labDeploymentData.pddDate = "";
  } catch (error) {
    console.error("Unable to load Lab Deployment Overview:", error);
    labDeploymentData = { pddDate: "", days: {} };
    labSetSaveStatus("Could not load this month's deployment data.");
  } finally {
    labDeploymentLoading = false;
    renderLabDeploymentOverview();
  }
}

async function saveLabDeploymentMonth() {
  if (!supabaseClient || labDeploymentLoading) return;

  labSetSaveStatus("Saving…");

  const payload = {
    month_key: labMonthKey(),
    deployment_data: labDeploymentData,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabaseClient
      .from("lab_deployment_overview")
      .upsert(payload, { onConflict: "month_key" });

    if (error) throw error;
    labSetSaveStatus("Saved");
  } catch (error) {
    console.error("Unable to save Lab Deployment Overview:", error);
    labSetSaveStatus("Save failed — check the console and Supabase policies.");
  }
}

function labQueueSave() {
  clearTimeout(labDeploymentSaveTimer);
  labSetSaveStatus("Unsaved changes…");
  labDeploymentSaveTimer = setTimeout(saveLabDeploymentMonth, 500);
}

function labSetSaveStatus(message) {
  const status = $("labDeploymentSaveStatus");
  if (status) status.textContent = message;
}

function setupLabDeploymentPanelEvents() {
  const panel = $("labDeploymentPanel");
  if (!panel || panel.dataset.eventsReady === "true") return;
  panel.dataset.eventsReady = "true";

  panel.addEventListener("input", event => {
    const target = event.target;
    if (target.matches("[data-lab-date][data-lab-venue]")) {
      const day = labGetDayData(target.dataset.labDate);
      day[target.dataset.labVenue] = target.value;
      labQueueSave();
    } else if (target.matches(".lab-deployment-remarks")) {
      labGetDayData(target.dataset.labDate).remarks = target.value;
      labQueueSave();
    }
  });

  panel.addEventListener("change", event => {
    if (event.target.id === "labPddDate") {
      const value = event.target.value;
      if (value && value.slice(0, 7) !== labMonthKey().slice(0, 7)) {
        alert("Please select a PDD date within the displayed month.");
        event.target.value = labDeploymentData.pddDate || "";
        return;
      }

      labDeploymentData.pddDate = value;
      renderLabDeploymentOverview();
      labQueueSave();
    }
  });

  panel.addEventListener("click", event => {
    if (event.target.id === "labDeploymentPrevious") {
      labDeploymentMonth = new Date(
        labDeploymentMonth.getFullYear(),
        labDeploymentMonth.getMonth() - 1,
        1
      );
      loadLabDeploymentMonth();
    } else if (event.target.id === "labDeploymentNext") {
      labDeploymentMonth = new Date(
        labDeploymentMonth.getFullYear(),
        labDeploymentMonth.getMonth() + 1,
        1
      );
      loadLabDeploymentMonth();
    } else if (event.target.id === "labDeploymentToday") {
      labDeploymentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      loadLabDeploymentMonth();
    }
  });
}

function showLabDeploymentView() {
  showingLabDeployment = true;
  showingSummary = false;

  toggleHidden("calendarArea", true);
  toggleHidden("summaryPanel", true);
  toggleHidden("labDeploymentPanel", false);

  const header = $("weekHeader") || document.querySelector(".week-header");
  header?.classList.add("hidden");

  updateSheetTabs();
  labDeploymentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  loadLabDeploymentMonth();
}

function hideLabDeploymentView() {
  showingLabDeployment = false;
  toggleHidden("labDeploymentPanel", true);
}

function setupLabDeployment() {
  setupLabDeploymentPanelEvents();
}
