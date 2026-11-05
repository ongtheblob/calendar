/* =========================================================
   30. PRESENT STAFF CHECKLIST
========================================================= */

let manpowerModalMode = "manpower";

// Keep the draft in one place for the lifetime of the open modal.
// This variable is declared in 03-state.js.
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
        empty.textContent = "No Off / Leave entries for this day.";
        container.appendChild(empty);
        return;
    }

    entries.forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = "leave-entry-item";

        const details = document.createElement("span");
        details.textContent = entry.staff + " — " + entry.reason;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "small-btn";
        remove.textContent = "Remove";
        remove.setAttribute(
            "aria-label",
            "Remove " + entry.staff + " leave entry"
        );

        remove.addEventListener("click", () => {
            getLeaveDraft().splice(index, 1);
            renderLeaveEntries();
        });

        item.append(details, remove);
        container.appendChild(item);
    });
}


/* =========================================================
   33. ADD OFF / LEAVE ENTRY
========================================================= */

function addLeaveEntry() {
    const staff = valueOf("leaveStaff").trim();
    const reason = valueOf("leaveReason", "Off Day").trim() || "Off Day";

    console.log("ADD OFF / LEAVE clicked", {
        staff,
        reason,
        mode: manpowerModalMode,
        venue: manpowerVenue,
        date: manpowerDate
    });

    if (manpowerModalMode !== "leave") {
        console.warn(
            "Add Off / Leave was clicked while modal mode is:",
            manpowerModalMode
        );
    }

    if (!staff) {
        alert("Please select a staff member for Off / Leave.");
        return;
    }

    const entries = getLeaveDraft();
    const existingIndex = entries.findIndex(
        entry => entry.staff === staff
    );

    if (existingIndex >= 0) {
        entries[existingIndex].reason = reason;
    } else {
        entries.push({ staff, reason });
    }

    console.log("Off / Leave draft after adding:", JSON.stringify(entries));

    setValue("leaveStaff", "");
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

function openManpowerSection(venue, date, mode) {
    const requestedMode = mode === "leave" ? "leave" : "manpower";

    manpowerVenue = venue;
    manpowerDate = date;
    manpowerModalMode = requestedMode;

    // Load the existing record for this exact venue/date.
    const record = getManpower(venue, date) || {};

    setText("manpowerVenue", venue);
    setText("manpowerDate", formatDisplayDate(date));
    setValue("requiredManpower", REQUIRED_MANPOWER);
    setValue("manpowerNotes", record.notes || "");

    // Start a fresh draft from the records currently loaded from Supabase.
    draftLeaveEntries = Array.isArray(record.leaveEntries)
        ? record.leaveEntries.map(entry => ({
            staff: String(entry.staff || entry.name || "").trim(),
            reason: String(entry.reason || "Off Day")
        })).filter(entry => entry.staff)
        : [];

    renderStaffChecklist(record.staff || []);
    renderLeaveStaffOptions();
    renderLeaveEntries();
    updateStaffCount();
    updateStaffStatus();

    const presentSection = $("presentManpowerSection");
    const notesSection = $("manpowerNotesSection");
    const leaveSection = document.querySelector(".leave-management");
    const clearDayButton = $("clearManpowerDay");

    const showPresent = requestedMode === "manpower";
    const showLeave = requestedMode === "leave";

    if (presentSection) {
        presentSection.hidden = !showPresent;
        presentSection.style.display = showPresent ? "" : "none";
    }

    if (notesSection) {
        notesSection.hidden = !showPresent;
        notesSection.style.display = showPresent ? "" : "none";
    }

    if (leaveSection) {
        leaveSection.hidden = !showLeave;
        leaveSection.style.display = showLeave ? "" : "none";
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
        buttonMode: saveButton?.dataset.mode,
        venue: manpowerVenue,
        date: manpowerDate,
        draft: JSON.stringify(draftLeaveEntries)
    });

    $("manpowerModal")?.classList.add("visible");
}


/* =========================================================
   35. CLOSE MODAL
========================================================= */

function closeManpowerModal() {
    $("manpowerModal")?.classList.remove("visible");

    const presentSection = $("presentManpowerSection");
    const notesSection = $("manpowerNotesSection");
    const leaveSection = document.querySelector(".leave-management");
    const clearDayButton = $("clearManpowerDay");

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

    const { data: existing, error: readError } = await supabaseClient
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
            "Supabase did not confirm the manpower save. Check table permissions and RLS."
        );
    }
}


/* =========================================================
   37. SAVE OFF / LEAVE ENTRIES
========================================================= */

async function saveLeaveEntries() {
    const venue = manpowerVenue;
    const date = manpowerDate;
    const desiredEntries = getLeaveDraft().map(entry => ({
        venue,
        date,
        staff: entry.staff,
        reason: entry.reason
    }));

    if (!venue || !date) {
        throw new Error("Missing venue or date for Off / Leave save.");
    }

    if (!desiredEntries.length) {
        throw new Error("There are no Off / Leave entries to save.");
    }

    // Read current records for this venue/date.
    const { data: existingRows, error: readError } = await supabaseClient
        .from("manpower_leave_entries")
        .select("id,staff")
        .eq("venue", venue)
        .eq("date", date);

    if (readError) throw readError;

    // Upsert the entries currently shown in the draft.
    const { data: savedRows, error: upsertError } = await supabaseClient
        .from("manpower_leave_entries")
        .upsert(desiredEntries, {
            onConflict: "venue,date,staff"
        })
        .select("id,venue,date,staff,reason");

    if (upsertError) throw upsertError;

    console.log("Supabase returned saved Off / Leave rows:", savedRows);

    // Remove records that the user removed from the draft.
    const desiredNames = new Set(
        desiredEntries.map(entry => entry.staff)
    );

    const removedRows = (existingRows || []).filter(
        row => !desiredNames.has(row.staff)
    );

    for (const row of removedRows) {
        const { error } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("id", row.id);

        if (error) throw error;
    }

    // Verify the final database contents.
    const { data: verifiedRows, error: verifyError } = await supabaseClient
        .from("manpower_leave_entries")
        .select("id,venue,date,staff,reason")
        .eq("venue", venue)
        .eq("date", date);

    if (verifyError) throw verifyError;

    const verified = verifiedRows || [];
    if (verified.length !== desiredEntries.length) {
        throw new Error(
            "Supabase save verification failed. Expected " +
            desiredEntries.length +
            " record(s), but found " +
            verified.length +
            ". Check RLS policies and table permissions."
        );
    }

    return verified;
}


/* =========================================================
   38. SAVE BUTTON
========================================================= */

async function saveManpower() {
    const saveButton = $("saveManpower");

    // Prefer the mode attached to the button when the modal was opened.
    // This prevents a stale label/state mismatch from routing to the wrong table.
    const buttonMode = saveButton?.dataset.mode;
    const saveMode = buttonMode === "leave"
        ? "leave"
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
        alert("Please reopen the Manpower or Off / Leave window and try again.");
        return;
    }

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    if (saveButton) saveButton.disabled = true;

    try {
        if (saveMode === "leave") {
            const entries = getLeaveDraft();

            if (!entries.length) {
                throw new Error(
                    "No Off / Leave entries found. Add a staff member to the list before saving."
                );
            }

            await saveLeaveEntries();
        } else {
            await savePresentManpower();
        }

        const reloaded = await loadManpowerFromSupabase();
        if (!reloaded) {
            throw new Error(
                "The save request completed, but the latest records could not be reloaded."
            );
        }

        closeManpowerModal();
        renderCurrentScreen();

        alert(
            saveMode === "leave"
                ? "Off / Leave saved successfully."
                : "Manpower saved successfully."
        );
    } catch (error) {
        console.error("Unable to save manpower:", error);
        alert("Unable to save: " + (error.message || String(error)));
    } finally {
        if (saveButton) saveButton.disabled = false;
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
    draftLeaveEntries = [];
    renderLeaveEntries();
}


/* =========================================================
   41. CLEAR ENTIRE MANPOWER DAY
========================================================= */

async function clearEntireManpowerDay() {
    if (!manpowerVenue || !manpowerDate) return;

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
    if (button) button.disabled = true;

    try {
        const venue = manpowerVenue;
        const date = manpowerDate;

        const { error: leaveError } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (leaveError) throw leaveError;

        const { error: manpowerError } = await supabaseClient
            .from("manpower")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (manpowerError) throw manpowerError;

        delete manpower[manpowerKey(venue, date)];

        closeManpowerModal();

        const reloaded = await loadManpowerFromSupabase();
        if (!reloaded) {
            throw new Error("The calendar could not reload after clearing the day.");
        }

        renderCurrentScreen();
        alert("Manpower and Off / Leave cleared for this day.");
    } catch (error) {
        console.error("Unable to clear manpower day:", error);
        alert("Unable to clear manpower: " + (error.message || String(error)));
    } finally {
        if (button) button.disabled = false;
    }
}
