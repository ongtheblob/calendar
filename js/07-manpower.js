/* =========================================================
   30. PRESENT STAFF CHECKLIST
========================================================= */

let manpowerModalMode = "manpower";

// Tracks which leave entry is currently being edited.
let editingLeaveIndex = null;

// Tracks saved leave periods that the user removes.
let removedLeavePeriods = [];

// draftLeaveEntries is declared in 03-state.js.
// Do not declare it again in this file.
function getLeaveDraft() {
    if (!Array.isArray(draftLeaveEntries)) {
        draftLeaveEntries = [];
    }

    return draftLeaveEntries;
}

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
    setText("presentCount", selectedStaff().length);
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
   31.1 LEAVE DATE RANGE CONTROLS
   Added dynamically so index.html does not need new controls.
========================================================= */

function ensureLeaveDateRangeControls() {
    const leaveSection = document.querySelector(".leave-management");
    if (!leaveSection) return;

    let wrapper = $("leaveDateRangeControls");

    if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.id = "leaveDateRangeControls";
        wrapper.className = "leave-date-range-controls";
        wrapper.setAttribute("aria-label", "Leave date range");

        const makeDateField = (id, labelText) => {
            const group = document.createElement("label");
            group.className = "leave-date-field";
            group.textContent = labelText;

            const input = document.createElement("input");
            input.type = "date";
            input.id = id;
            input.className = "leave-date-input";
            input.setAttribute("aria-label", labelText);

            group.appendChild(input);
            return group;
        };

        wrapper.append(
            makeDateField("leaveStartDate", "Leave from"),
            makeDateField("leaveEndDate", "Leave until")
        );

        const formCard = leaveSection.querySelector(".leave-form-card");
        const fieldsGrid = leaveSection.querySelector(".leave-fields-grid");

        if (formCard && fieldsGrid) {
            formCard.insertBefore(wrapper, fieldsGrid);
        } else {
            leaveSection.prepend(wrapper);
        }
    }

    const start = $("leaveStartDate");
    const end = $("leaveEndDate");

    if (start && !start.value) {
        start.value = manpowerDate || "";
    }

    if (end && !end.value) {
        end.value = manpowerDate || "";
    }
}


/* =========================================================
   31.2 LEAVE FORM FEEDBACK
========================================================= */

function showLeaveFormFeedback(message = "") {
    const feedback = $("leaveFormFeedback");

    if (feedback) {
        feedback.textContent = message;
    }

    const staffSelect = $("leaveStaff");
    const startInput = $("leaveStartDate");
    const endInput = $("leaveEndDate");

    if (staffSelect) {
        staffSelect.removeAttribute("aria-invalid");
    }

    if (startInput) {
        startInput.removeAttribute("aria-invalid");
    }

    if (endInput) {
        endInput.removeAttribute("aria-invalid");
    }
}

function setupLeaveFormControls() {
    const cancelButton = $("cancelLeaveEdit");

    if (!cancelButton || cancelButton.dataset.bound === "true") {
        return;
    }

    cancelButton.dataset.bound = "true";

    cancelButton.addEventListener("click", () => {
        cancelLeavePeriodEdit();
        showLeaveFormFeedback();
        renderLeaveEntries();
    });
}


/* =========================================================
   31.3 LEAVE DATE VALIDATION
========================================================= */

function getLeaveDateRange() {
    const start = valueOf(
        "leaveStartDate",
        manpowerDate || ""
    ).trim();

    const end = valueOf(
        "leaveEndDate",
        manpowerDate || ""
    ).trim();

    if (!start || !end) {
        showLeaveFormFeedback(
            "Choose both a start date and an end date."
        );

        if (!start && $("leaveStartDate")) {
            $("leaveStartDate").setAttribute(
                "aria-invalid",
                "true"
            );
        }

        if (!end && $("leaveEndDate")) {
            $("leaveEndDate").setAttribute(
                "aria-invalid",
                "true"
            );
        }

        return null;
    }

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate < startDate
    ) {
        showLeaveFormFeedback(
            "The end date must be the same as or later than the start date."
        );

        if ($("leaveEndDate")) {
            $("leaveEndDate").setAttribute(
                "aria-invalid",
                "true"
            );
        }

        return null;
    }

    const days =
        Math.round((endDate - startDate) / 86400000) + 1;

    if (days > 366) {
        showLeaveFormFeedback(
            "Please keep each leave period to 366 days or fewer."
        );

        return null;
    }

    return {
        startDate: start,
        endDate: end,
        days
    };
}


/* =========================================================
   31.4 EXPAND DATE RANGE INTO INDIVIDUAL DATES
========================================================= */

function datesInLeaveRange(start, end) {
    const dates = [];

    const current = new Date(start + "T00:00:00");
    const last = new Date(end + "T00:00:00");

    while (current <= last) {
        const year = current.getFullYear();

        const month = String(
            current.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            current.getDate()
        ).padStart(2, "0");

        dates.push(`${year}-${month}-${day}`);

        current.setDate(current.getDate() + 1);
    }

    return dates;
}


/* =========================================================
   31. OFF / LEAVE STAFF OPTIONS
========================================================= */

function renderLeaveStaffOptions() {
    const select = $("leaveStaff");
    if (!select) return;

    const currentValue = select.value;

    select.innerHTML =
        '<option value="">Select staff member</option>';

    STAFF_LIST.forEach(name => {
        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        select.appendChild(option);
    });

    if (STAFF_LIST.includes(currentValue)) {
        select.value = currentValue;
    }
}


/* =========================================================
   32. RENDER OFF / LEAVE DRAFT
========================================================= */

function renderLeaveEntries() {
    const container = $("leaveEntriesList");
    if (!container) return;

    const entries = getLeaveDraft();

    container.innerHTML = "";

    if (!entries.length) {
        const empty = document.createElement("div");

        empty.className = "leave-empty";

        empty.textContent =
            "No leave periods added for this day. " +
            "Add a staff member above to get started.";

        container.appendChild(empty);
        return;
    }

    entries.forEach((entry, index) => {
        const item = document.createElement("div");

        item.className = "leave-entry-item";

        // Display-only elements. No database writes occur here.
        const details = document.createElement("div");

        details.className = "leave-entry-details";

        const staffLabel = document.createElement("span");

        staffLabel.className = "leave-entry-staff";
        staffLabel.textContent = entry.staff || "Staff member";

        const metaLabel = document.createElement("span");

        metaLabel.className = "leave-entry-meta";

        const from = entry.startDate || manpowerDate;
        const until = entry.endDate || manpowerDate;

        const dateLabel = from && until
            ? (
                from === until
                    ? formatDisplayDate(from)
                    : formatDisplayDate(from) +
                      " – " +
                      formatDisplayDate(until)
            )
            : "Date not set";

        metaLabel.textContent =
            (entry.reason || "Leave") +
            " · " +
            dateLabel;

        details.append(staffLabel, metaLabel);

        // Edit button.
        const edit = document.createElement("button");

        edit.type = "button";
        edit.className = "small-btn";
        edit.textContent = "Edit period";

        edit.addEventListener("click", () => {
            editingLeaveIndex = index;

            setValue("leaveStaff", entry.staff);
            setValue("leaveReason", entry.reason);

            setValue(
                "leaveStartDate",
                entry.startDate || manpowerDate
            );

            setValue(
                "leaveEndDate",
                entry.endDate || manpowerDate
            );

            const addButton = $("addLeaveEntry");

            if (addButton) {
                addButton.innerHTML =
                    '<span aria-hidden="true">✓</span> ' +
                    "Update leave period";
            }

            const formTitle = document.querySelector(
                ".leave-form-heading h5"
            );

            if (formTitle) {
                formTitle.textContent = "Edit leave period";
            }

            const cancelButton = $("cancelLeaveEdit");

            if (cancelButton) {
                cancelButton.hidden = false;
            }

            showLeaveFormFeedback();
        });

        // Remove button.
        const remove = document.createElement("button");

        remove.type = "button";
        remove.className = "small-btn leave-remove-button";
        remove.textContent = "Remove";

        remove.addEventListener("click", () => {
            const currentEntry = getLeaveDraft()[index];

            if (!currentEntry) return;

            // Mark the entire original saved period for deletion.
            if (
                currentEntry.originalStartDate &&
                currentEntry.originalEndDate
            ) {
                removedLeavePeriods.push({
                    staff: currentEntry.staff,
                    reason: currentEntry.reason,
                    startDate: currentEntry.originalStartDate,
                    endDate: currentEntry.originalEndDate
                });
            }

            // Remove the whole period from the draft.
            getLeaveDraft().splice(index, 1);

            // Cancel editing if this period was being edited.
            if (editingLeaveIndex === index) {
                cancelLeavePeriodEdit();
            } else if (
                editingLeaveIndex !== null &&
                editingLeaveIndex > index
            ) {
                editingLeaveIndex -= 1;
            }

            renderLeaveEntries();

            console.log(
                "Entire Off / Leave period marked for removal:",
                currentEntry
            );
        });

        item.append(details, edit, remove);

        container.appendChild(item);
    });
}


/* =========================================================
   32.1 RESET LEAVE PERIOD EDITING
========================================================= */

function cancelLeavePeriodEdit() {
    editingLeaveIndex = null;

    const addButton = $("addLeaveEntry");

    if (addButton) {
        addButton.innerHTML =
            '<span aria-hidden="true">＋</span> ' +
            "Add leave period";
    }

    const formTitle = document.querySelector(
        ".leave-form-heading h5"
    );

    if (formTitle) {
        formTitle.textContent = "Add a leave period";
    }

    const cancelButton = $("cancelLeaveEdit");

    if (cancelButton) {
        cancelButton.hidden = true;
    }

    setValue("leaveStaff", "");
    setValue("leaveReason", "Off Day");

    setValue(
        "leaveStartDate",
        manpowerDate || ""
    );

    setValue(
        "leaveEndDate",
        manpowerDate || ""
    );

    showLeaveFormFeedback();
}


/* =========================================================
   33. ADD OFF / LEAVE ENTRY
========================================================= */

function addLeaveEntry() {
    showLeaveFormFeedback();

    const staff = valueOf("leaveStaff").trim();

    const reason =
        valueOf("leaveReason", "Off Day").trim() ||
        "Off Day";

    const range = getLeaveDateRange();

    if (!staff) {
        showLeaveFormFeedback(
            "Select a staff member before adding this leave period."
        );

        if ($("leaveStaff")) {
            $("leaveStaff").setAttribute(
                "aria-invalid",
                "true"
            );
        }

        return;
    }

    if (!range) return;

    const entries = getLeaveDraft();

    const leaveEntry = {
        staff,
        reason,
        startDate: range.startDate,
        endDate: range.endDate
    };

    // Updating an existing period.
    if (
        editingLeaveIndex !== null &&
        entries[editingLeaveIndex]
    ) {
        const oldEntry = entries[editingLeaveIndex];

        leaveEntry.originalStartDate =
            oldEntry.originalStartDate ||
            oldEntry.startDate;

        leaveEntry.originalEndDate =
            oldEntry.originalEndDate ||
            oldEntry.endDate;

        entries[editingLeaveIndex] = leaveEntry;

        cancelLeavePeriodEdit();

    } else {
        // If the same staff member already exists in the draft,
        // update their period instead of creating a duplicate.
        const existingIndex = entries.findIndex(
            entry => entry.staff === staff
        );

        if (existingIndex >= 0) {
            const oldEntry = entries[existingIndex];

            leaveEntry.originalStartDate =
                oldEntry.originalStartDate ||
                oldEntry.startDate;

            leaveEntry.originalEndDate =
                oldEntry.originalEndDate ||
                oldEntry.endDate;

            entries[existingIndex] = leaveEntry;

        } else {
            entries.push(leaveEntry);
        }

        setValue("leaveStaff", "");
    }

    renderLeaveEntries();
}

/* =========================================================
   34. OPEN MANPOWER / OFF-LEAVE MODALS
========================================================= */

function openManpowerModal(venue, date) {
    openManpowerSection(venue, date, "manpower");
}

function openLeaveModal(venue, date) {
    openManpowerSection(venue, date, "leave");
}


/* =========================================================
   LOAD SAVED OFF / LEAVE DATE PERIODS
========================================================= */

async function loadLeavePeriodsForDate(venue, date) {
    if (!supabaseClient) {
        throw new Error("Supabase is not connected.");
    }

    const { data: rows, error } = await supabaseClient
        .from("manpower_leave_entries")
        .select("venue,date,staff,reason")
        .eq("venue", venue)
        .order("date", { ascending: true });

    if (error) {
        throw error;
    }

    const entries = rows || [];

    // Group database rows by staff member and reason.
    const grouped = {};

    entries.forEach(row => {
        const staff = String(row.staff || "").trim();
        const reason = String(row.reason || "Off Day").trim();
        const rowDate = String(row.date || "").slice(0, 10);

        if (!staff || !rowDate) return;

        const key = staff + "|" + reason;

        if (!grouped[key]) {
            grouped[key] = [];
        }

        grouped[key].push(rowDate);
    });

    const periods = [];

    Object.entries(grouped).forEach(([key, dates]) => {
        const [staff, reason] = key.split("|");

        const uniqueDates = [...new Set(dates)].sort();

        let startDate = null;
        let previousDate = null;

        function addPeriod(endDate) {
            if (!startDate) return;

            periods.push({
                staff,
                reason,
                startDate,
                endDate,
                originalStartDate: startDate,
                originalEndDate: endDate
            });
        }

        uniqueDates.forEach(currentDate => {
            if (!startDate) {
                startDate = currentDate;
                previousDate = currentDate;
                return;
            }

            const nextDay = new Date(
                previousDate + "T00:00:00Z"
            );

            nextDay.setUTCDate(nextDay.getUTCDate() + 1);

            const expectedDate = nextDay
                .toISOString()
                .slice(0, 10);

            if (currentDate === expectedDate) {
                previousDate = currentDate;
            } else {
                addPeriod(previousDate);

                startDate = currentDate;
                previousDate = currentDate;
            }
        });

        addPeriod(previousDate);
    });

    // Return only periods that include the selected date.
    return periods.filter(period =>
        period.startDate <= date &&
        period.endDate >= date
    );
}


/* =========================================================
   OPEN MANPOWER SECTION
========================================================= */

async function openManpowerSection(venue, date, mode) {
    const requestedMode =
        mode === "leave" ? "leave" : "manpower";

    manpowerVenue = venue;
    manpowerDate = date;
    manpowerModalMode = requestedMode;

    const record = getManpower(venue, date) || {};

    setText("manpowerVenue", venue);
    setText("manpowerDate", formatDisplayDate(date));

    setValue("requiredManpower", REQUIRED_MANPOWER);
    setValue("manpowerNotes", record.notes || "");

    // Reset edit and removal tracking each time the modal opens.
    editingLeaveIndex = null;
    removedLeavePeriods = [];

    // Load saved leave periods from Supabase.
    // This allows the user to edit the complete period.
    try {
        if (mode === "leave" && supabaseClient) {
            draftLeaveEntries =
                await loadLeavePeriodsForDate(venue, date);
        } else {
            draftLeaveEntries =
                Array.isArray(record.leaveEntries)
                    ? record.leaveEntries.map(entry => ({
                        staff: String(
                            entry.staff || entry.name || ""
                        ).trim(),
                        reason: String(
                            entry.reason || "Off Day"
                        ),
                        startDate: date,
                        endDate: date
                    })).filter(entry => entry.staff)
                    : [];
        }
    } catch (error) {
        console.error(
            "Could not load saved leave periods:",
            error
        );

        draftLeaveEntries = [];
    }

    renderStaffChecklist(record.staff || []);
    renderLeaveStaffOptions();

    ensureLeaveDateRangeControls();
    setupLeaveFormControls();
    showLeaveFormFeedback();

    if ($("leaveStartDate")) {
        $("leaveStartDate").value = date;
    }

    if ($("leaveEndDate")) {
        $("leaveEndDate").value = date;
    }

    renderLeaveEntries();

    updateStaffCount();
    updateStaffStatus();

    const presentSection =
        $("presentManpowerSection");

    const notesSection =
        $("manpowerNotesSection");

    const leaveSection =
        document.querySelector(".leave-management");

    const clearDayButton =
        $("clearManpowerDay");

    const showPresent =
        requestedMode === "manpower";

    const showLeave =
        requestedMode === "leave";

    if (presentSection) {
        presentSection.hidden = !showPresent;
        presentSection.style.display =
            showPresent ? "" : "none";
    }

    if (notesSection) {
        notesSection.hidden = !showPresent;
        notesSection.style.display =
            showPresent ? "" : "none";
    }

    if (leaveSection) {
        leaveSection.hidden = !showLeave;
        leaveSection.style.display =
            showLeave ? "" : "none";
    }

    if (clearDayButton) {
        clearDayButton.hidden = showLeave;
    }

    setText(
        "manpowerModalTitle",
        showLeave ? "Off / Leave" : "Manpower"
    );

    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.textContent = showLeave
            ? "Save Off / Leave"
            : "Save Manpower";

        saveButton.dataset.mode = requestedMode;
    }

    console.log("Manpower modal opened:", {
        mode: manpowerModalMode,
        venue: manpowerVenue,
        date: manpowerDate,
        draft: JSON.stringify(getLeaveDraft())
    });

    $("manpowerModal")?.classList.add("visible");
}


/* =========================================================
   35. CLOSE MODAL
========================================================= */

function closeManpowerModal() {
    $("manpowerModal")?.classList.remove("visible");

    const presentSection =
        $("presentManpowerSection");

    const notesSection =
        $("manpowerNotesSection");

    const leaveSection =
        document.querySelector(".leave-management");

    const clearDayButton =
        $("clearManpowerDay");

    if (presentSection) {
        presentSection.hidden = false;
        presentSection.style.display = "";
    }

    if (notesSection) {
        notesSection.hidden = false;
        notesSection.style.display = "";
    }

    if (leaveSection) {
        leaveSection.hidden = false;
        leaveSection.style.display = "";
    }

    if (clearDayButton) {
        clearDayButton.hidden = false;
    }

    manpowerModalMode = "manpower";
    manpowerVenue = null;
    manpowerDate = null;
    draftLeaveEntries = [];

    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.textContent = "Save Manpower";
        saveButton.dataset.mode = "manpower";
    }
}


/* =========================================================
   36. SAVE PRESENT MANPOWER

   Only modifies the manpower table.
========================================================= */

async function savePresentManpower() {
    const venue = manpowerVenue;
    const date = manpowerDate;

    const record = {
        venue,
        date,
        staff: selectedStaff(),
        required: REQUIRED_MANPOWER,
        notes: valueOf("manpowerNotes").trim()
    };

    const {
        data: existing,
        error: readError
    } = await supabaseClient
        .from("manpower")
        .select("venue,date")
        .eq("venue", venue)
        .eq("date", date)
        .maybeSingle();

    if (readError) throw readError;

    let result;

    if (existing) {
        result = await supabaseClient
            .from("manpower")
            .update({
                staff: record.staff,
                required: record.required,
                notes: record.notes
            })
            .eq("venue", venue)
            .eq("date", date)
            .select("venue,date");
    } else {
        result = await supabaseClient
            .from("manpower")
            .insert(record)
            .select("venue,date");
    }

    if (result.error) throw result.error;

    if (!result.data || result.data.length !== 1) {
        throw new Error(
            "Supabase did not confirm the manpower save. " +
            "Check table permissions and RLS."
        );
    }
}

/* =========================================================
   37. SAVE OFF / LEAVE ENTRIES

   Uses manpower_leave_entries table.

   An empty draft is valid:
   it means delete all leave entries for this venue/date.
========================================================= */

async function saveLeaveEntries() {
    const venue = manpowerVenue;
    const date = manpowerDate;

    if (!venue || !date) {
        throw new Error(
            "Missing venue or date for Off / Leave save."
        );
    }

    if (!supabaseClient) {
        throw new Error("Supabase is not connected.");
    }

    const draft = getLeaveDraft();

    // Remove entire original ranges for deleted or edited periods.
    const periodsToDelete = [
        ...removedLeavePeriods,
        ...draft
            .filter(entry =>
                entry.originalStartDate &&
                entry.originalEndDate
            )
            .map(entry => ({
                staff: entry.staff,
                startDate: entry.originalStartDate,
                endDate: entry.originalEndDate
            }))
    ];

    const uniquePeriods = [];
    const periodKeys = new Set();

    periodsToDelete.forEach(period => {
        if (
            !period.staff ||
            !period.startDate ||
            !period.endDate
        ) {
            return;
        }

        const key = [
            period.staff,
            period.startDate,
            period.endDate
        ].join("|");

        if (!periodKeys.has(key)) {
            periodKeys.add(key);
            uniquePeriods.push(period);
        }
    });

    // Delete saved rows belonging to original leave periods.
    for (const period of uniquePeriods) {
        const { error } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("venue", venue)
            .eq("staff", period.staff)
            .gte("date", period.startDate)
            .lte("date", period.endDate);

        if (error) throw error;
    }

    // Expand each draft period into one row per date.
    const rangeEntries = [];

    for (const entry of draft) {
        const startDate = entry.startDate || date;
        const endDate = entry.endDate || date;

        for (
            const leaveDate of datesInLeaveRange(
                startDate,
                endDate
            )
        ) {
            rangeEntries.push({
                venue,
                date: leaveDate,
                staff: entry.staff,
                reason: entry.reason || "Off Day"
            });
        }
    }

    // Remove selected-day entries that are no longer in the draft.
    const {
        data: existingRows,
        error: readError
    } = await supabaseClient
        .from("manpower_leave_entries")
        .select("id,staff")
        .eq("venue", venue)
        .eq("date", date);

    if (readError) throw readError;

    const draftStaff = new Set(
        draft.map(entry => entry.staff)
    );

    const rowsToRemove = (existingRows || []).filter(
        row => !draftStaff.has(row.staff)
    );

    for (const row of rowsToRemove) {
        const { error } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("id", row.id);

        if (error) throw error;
    }

    // Insert or update all dates in the selected leave periods.
    if (rangeEntries.length) {
        const { error } = await supabaseClient
            .from("manpower_leave_entries")
            .upsert(rangeEntries, {
                onConflict: "venue,date,staff"
            });

        if (error) throw error;
    }

    // Verify selected-date rows against the draft.
    const {
        data: verifiedRows,
        error: verifyError
    } = await supabaseClient
        .from("manpower_leave_entries")
        .select("id,venue,date,staff,reason")
        .eq("venue", venue)
        .eq("date", date);

    if (verifyError) throw verifyError;

    const verified = verifiedRows || [];

    if (verified.length !== draft.length) {
        throw new Error(
            "Unable to verify Off / Leave changes. Expected " +
            draft.length +
            " record(s), but found " +
            verified.length +
            "."
        );
    }

    console.log(
        "Verified Off / Leave records:",
        verified
    );

    removedLeavePeriods = [];

    return verified;
}


/* =========================================================
   38. SAVE BUTTON

   One function handles both modal modes.
========================================================= */

async function saveManpower() {
    const saveButton = $("saveManpower");

    const buttonMode = saveButton?.dataset.mode;

    const saveMode =
        buttonMode === "leave" ||
        buttonMode === "manpower"
            ? buttonMode
            : manpowerModalMode;

    console.log("SAVE BUTTON CLICKED", {
        modalMode: manpowerModalMode,
        buttonMode,
        saveMode,
        venue: manpowerVenue,
        date: manpowerDate,
        draft: JSON.stringify(getLeaveDraft())
    });

    if (!manpowerVenue || !manpowerDate) {
        alert(
            "Please reopen the Manpower or Off / Leave window."
        );

        return;
    }

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        if (saveMode === "leave") {
            // Empty drafts are allowed so users can delete
            // the last Off / Leave record.
            await saveLeaveEntries();
        } else {
            await savePresentManpower();
        }

        // Refresh the calendar data from Supabase.
        const reloaded =
            await loadManpowerFromSupabase();

        if (!reloaded) {
            throw new Error(
                "Saved, but unable to reload the latest records."
            );
        }

        closeManpowerModal();
        renderCurrentScreen();

    } catch (error) {
        console.error(
            "Unable to save manpower:",
            error
        );

        alert(
            "Unable to save: " +
            (error.message || String(error))
        );

    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


/* =========================================================
   39. CLEAR PRESENT DRAFT
========================================================= */

function clearPresentDraft() {
    document.querySelectorAll(
        '#staffList input[type="checkbox"]'
    ).forEach(input => {
        input.checked = false;
    });

    updateStaffCount();
    updateStaffStatus();
}


/* =========================================================
   40. CLEAR OFF / LEAVE DRAFT
========================================================= */

function clearLeaveDraft() {
    // Mark every loaded saved period for full-range deletion.
    getLeaveDraft().forEach(entry => {
        if (
            entry.originalStartDate &&
            entry.originalEndDate
        ) {
            removedLeavePeriods.push({
                staff: entry.staff,
                reason: entry.reason,
                startDate: entry.originalStartDate,
                endDate: entry.originalEndDate
            });
        }
    });

    draftLeaveEntries = [];
    editingLeaveIndex = null;

    cancelLeavePeriodEdit();
    renderLeaveEntries();

    console.log(
        "Off / Leave draft cleared; saved periods marked for deletion."
    );
}


/* =========================================================
   41. CLEAR ENTIRE MANPOWER DAY

   Deletes both Present Manpower and Off / Leave.
========================================================= */

async function clearEntireManpowerDay() {
    if (!manpowerVenue || !manpowerDate) {
        return;
    }

    const confirmed = confirm(
        "Delete ALL manpower information for " +
        manpowerVenue +
        " on " +
        formatDisplayDate(manpowerDate) +
        "?\n\n" +
        "This removes Present staff and all Off / Leave entries."
    );

    if (!confirmed) return;

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    const button = $("clearManpowerDay");

    if (button) {
        button.disabled = true;
    }

    try {
        const venue = manpowerVenue;
        const date = manpowerDate;

        // Delete Off / Leave entries.
        const {
            error: leaveError
        } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (leaveError) throw leaveError;

        // Delete Present Manpower.
        const {
            error: manpowerError
        } = await supabaseClient
            .from("manpower")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (manpowerError) throw manpowerError;

        delete manpower[manpowerKey(venue, date)];

        const reloaded =
            await loadManpowerFromSupabase();

        if (!reloaded) {
            throw new Error(
                "Records were deleted, but the calendar could not reload."
            );
        }

        closeManpowerModal();
        renderCurrentScreen();

        alert(
            "Manpower and Off / Leave cleared for this day."
        );

    } catch (error) {
        console.error(
            "Unable to clear manpower day:",
            error
        );

        alert(
            "Unable to clear manpower: " +
            (error.message || String(error))
        );

    } finally {
        if (button) {
            button.disabled = false;
        }
    }
}
