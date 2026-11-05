
/* =========================================================
   30. PRESENT STAFF CHECKLIST
========================================================= */

let manpowerModalMode = "manpower";

function selectedStaff() {
    return Array.from(
        document.querySelectorAll('#staffList input[type="checkbox"]:checked')
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
            "⚠ Understaffed by " + (REQUIRED_MANPOWER - present);
    }
}


/* =========================================================
   31. OFF / LEAVE ENTRIES
========================================================= */

function renderLeaveStaffOptions() {
    const select = $("leaveStaff");
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Select staff member</option>';

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

function renderLeaveEntries() {
    const container = $("leaveEntriesList");
    if (!container) return;

    container.innerHTML = "";

    if (!draftLeaveEntries.length) {
        const empty = document.createElement("div");
        empty.className = "leave-empty";
        empty.textContent = "No Off / Leave entries for this day.";
        container.appendChild(empty);
        return;
    }

    draftLeaveEntries.forEach((entry, index) => {
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
            draftLeaveEntries.splice(index, 1);
            renderLeaveEntries();
        });

        item.append(details, remove);
        container.appendChild(item);
    });
}

function addLeaveEntry() {
    const staff = valueOf("leaveStaff").trim();
    const reason = valueOf("leaveReason", "Off Day").trim();

    if (!staff) {
        alert("Please select a staff member for Off / Leave.");
        return;
    }

    const existingIndex = draftLeaveEntries.findIndex(
        entry => entry.staff === staff
    );

    if (existingIndex >= 0) {
        draftLeaveEntries[existingIndex].reason = reason;
    } else {
        draftLeaveEntries.push({ staff, reason });
    }

    setValue("leaveStaff", "");
    renderLeaveEntries();
}


/* =========================================================
   32. OPEN THE TWO INDEPENDENT SECTIONS
========================================================= */

function openManpowerModal(venue, date) {
    openManpowerSection(venue, date, "manpower");
}

function openLeaveModal(venue, date) {
    openManpowerSection(venue, date, "leave");
}

function openManpowerSection(venue, date, mode) {
    manpowerVenue = venue;
    manpowerDate = date;
    manpowerModalMode = mode === "leave" ? "leave" : "manpower";

    const record = getManpower(venue, date) || {};

    setText("manpowerVenue", venue);
    setText("manpowerDate", formatDisplayDate(date));
    setValue("requiredManpower", REQUIRED_MANPOWER);
    setValue("manpowerNotes", record.notes || "");
    setValue("leaveNotes", record.leaveNotes || "");

    draftLeaveEntries = Array.isArray(record.leaveEntries)
        ? record.leaveEntries.map(entry => ({
            staff: String(entry.staff || entry.name || ""),
            reason: String(entry.reason || entry.type || "Off Day")
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

    if (presentSection) {
        presentSection.hidden = manpowerModalMode === "leave";
    }

    if (notesSection) {
        notesSection.hidden = manpowerModalMode === "leave";
    }

    if (leaveSection) {
        leaveSection.hidden = manpowerModalMode !== "leave";
    }

    if (clearDayButton) {
        clearDayButton.hidden = manpowerModalMode === "leave";
    }

    setText(
        "manpowerModalTitle",
        manpowerModalMode === "leave" ? "Off / Leave" : "Manpower"
    );

    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.textContent =
            manpowerModalMode === "leave"
                ? "Save Off / Leave"
                : "Save Manpower";
    }

    $("manpowerModal")?.classList.add("visible");
}


/* =========================================================
   33. CLOSE MANPOWER MODAL
========================================================= */

function closeManpowerModal() {
    $("manpowerModal")?.classList.remove("visible");

    const presentSection = $("presentManpowerSection");
    const notesSection = $("manpowerNotesSection");
    const leaveSection = document.querySelector(".leave-management");
    const clearDayButton = $("clearManpowerDay");

    if (presentSection) presentSection.hidden = false;
    if (notesSection) notesSection.hidden = false;
    if (leaveSection) leaveSection.hidden = false;
    if (clearDayButton) clearDayButton.hidden = false;

    manpowerModalMode = "manpower";
    manpowerVenue = null;
    manpowerDate = null;
    draftLeaveEntries = [];
}


/* =========================================================
   34. SAVE MANPOWER / OFF / LEAVE

   Read the latest database record before saving.
   This prevents one section from overwriting the other.
========================================================= */

async function saveManpower() {
    if (!manpowerVenue || !manpowerDate) return;

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    const saveMode = manpowerModalMode;
    const venueToSave = manpowerVenue;
    const dateToSave = manpowerDate;
    const saveButton = $("saveManpower");

    if (saveButton) saveButton.disabled = true;

    try {
        // Retrieve the latest saved record from Supabase.
        const { data: existingRow, error: readError } =
            await supabaseClient
                .from("manpower")
                .select("*")
                .eq("venue", venueToSave)
                .eq("date", dateToSave)
                .maybeSingle();

        if (readError) throw readError;

        const localRecord =
            getManpower(venueToSave, dateToSave) || {};

        // Preserve existing data from both sections.
        const mergedRecord = {
            venue: venueToSave,
            date: dateToSave,

            staff: Array.isArray(existingRow?.staff)
                ? existingRow.staff
                : (
                    Array.isArray(localRecord.staff)
                        ? localRecord.staff
                        : []
                ),

            required: existingRow?.required ?? REQUIRED_MANPOWER,

            notes:
                existingRow?.notes ??
                localRecord.notes ??
                "",

            leave_notes:
                existingRow?.leave_notes ??
                localRecord.leaveNotes ??
                "",

            leave_entries: Array.isArray(existingRow?.leave_entries)
                ? existingRow.leave_entries
                : (
                    Array.isArray(localRecord.leaveEntries)
                        ? localRecord.leaveEntries.map(entry => ({
                            staff: entry.staff || entry.name || "",
                            reason: entry.reason || entry.type || "Off Day"
                        }))
                        : []
                )
        };

        // Save Present staff only.
        if (saveMode === "manpower") {
            mergedRecord.staff = selectedStaff();
            mergedRecord.notes = valueOf("manpowerNotes").trim();
            mergedRecord.required = REQUIRED_MANPOWER;
        }

        // Save Off / Leave entries only.
        if (saveMode === "leave") {
            mergedRecord.leave_entries = draftLeaveEntries.map(entry => ({
                staff: entry.staff,
                reason: entry.reason
            }));

            mergedRecord.leave_notes =
                valueOf("leaveNotes").trim();
        }

        // Save the merged record.
        const { data, error } = await supabaseClient
            .from("manpower")
            .upsert(mergedRecord, {
                onConflict: "venue,date"
            })
            .select("venue,date");

        if (error) throw error;

        if (!data || data.length !== 1) {
            throw new Error(
                "Supabase did not confirm that the record was saved."
            );
        }

        // Reload the latest records from Supabase.
        const reloaded = await loadManpowerFromSupabase();

        if (!reloaded) {
            throw new Error(
                "The record was saved, but the latest data could not be reloaded. Refresh and check Supabase."
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

        alert(
            "Unable to save: " + (error.message || error)
        );

    } finally {
        if (saveButton) saveButton.disabled = false;
    }
}


/* =========================================================
   35. CLEAR PRESENT DRAFT
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
   36. CLEAR OFF / LEAVE DRAFT
========================================================= */

function clearLeaveDraft() {
    draftLeaveEntries = [];
    renderLeaveEntries();
}


/* =========================================================
   37. CLEAR ENTIRE MANPOWER DAY
========================================================= */

async function clearEntireManpowerDay() {
    if (!manpowerVenue || !manpowerDate) return;

    const confirmed = confirm(
        "Delete ALL manpower information for " +
        manpowerVenue +
        " on " +
        formatDisplayDate(manpowerDate) +
        "?\n\n" +
        "This removes Present staff, Off / Leave entries and notes."
    );

    if (!confirmed) return;

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    const button = $("clearManpowerDay");

    if (button) button.disabled = true;

    try {
        const venueToClear = manpowerVenue;
        const dateToClear = manpowerDate;

        const { error } = await supabaseClient
            .from("manpower")
            .delete()
            .eq("venue", venueToClear)
            .eq("date", dateToClear);

        if (error) throw error;

        delete manpower[
            manpowerKey(venueToClear, dateToClear)
        ];

        closeManpowerModal();

        await loadManpowerFromSupabase();
        renderCurrentScreen();

        alert("Manpower cleared for this day.");

    } catch (error) {
        console.error("Unable to clear manpower day:", error);

        alert(
            "Unable to clear manpower: " + (error.message || error)
        );

    } finally {
        if (button) button.disabled = false;
    }
}
