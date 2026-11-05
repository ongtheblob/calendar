
/* =========================================================
30. PRESENT STAFF CHECKLIST
========================================================= */

let manpowerModalMode = "manpower";

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

    container.innerHTML = "";

    if (!draftLeaveEntries.length) {
        const empty = document.createElement("div");
        empty.className = "leave-empty";
        empty.textContent =
            "No Off / Leave entries for this day.";

        container.appendChild(empty);
        return;
    }

    draftLeaveEntries.forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = "leave-entry-item";

        const details = document.createElement("span");
        details.textContent =
            entry.staff + " — " + entry.reason;

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


/* =========================================================
33. ADD OFF / LEAVE ENTRY
========================================================= */

function addLeaveEntry() {

    const staff = valueOf("leaveStaff").trim();
    const reason = valueOf("leaveReason", "Off Day").trim();

    console.log("ADD LEAVE BUTTON CLICKED");
    console.log("Selected staff:", staff);
    console.log("Selected reason:", reason);

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
        draftLeaveEntries.push({
            staff,
            reason
        });
    }

    console.log("Updated leave entries:", draftLeaveEntries);

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

    console.log("Opening Off / Leave modal");

    manpowerModalMode = "leave";

    openManpowerSection(venue, date, "leave");

    console.log("Modal mode after opening:", manpowerModalMode);
}

function openManpowerSection(venue, date, mode) {
    manpowerVenue = venue;
    manpowerDate = date;

manpowerModalMode = (mode === "leave")
    ? "leave"
    : "manpower";

console.log("Manpower modal mode set to:", manpowerModalMode);

    const record = getManpower(venue, date) || {};

    setText("manpowerVenue", venue);
    setText("manpowerDate", formatDisplayDate(date));

    setValue(
        "requiredManpower",
        REQUIRED_MANPOWER
    );

    setValue(
        "manpowerNotes",
        record.notes || ""
    );

    // Load leave entries already retrieved from the
    // separate manpower_leave_entries table.
    draftLeaveEntries = Array.isArray(record.leaveEntries)
        ? record.leaveEntries.map(entry => ({
            staff: String(entry.staff || entry.name || ""),
            reason: String(entry.reason || "Off Day")
        })).filter(entry => entry.staff)
        : [];

    renderStaffChecklist(record.staff || []);
    renderLeaveStaffOptions();
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

    if (presentSection) {
        const show = manpowerModalMode === "manpower";
        presentSection.hidden = !show;
        presentSection.style.display = show ? "" : "none";
    }

    if (notesSection) {
        const show = manpowerModalMode === "manpower";
        notesSection.hidden = !show;
        notesSection.style.display = show ? "" : "none";
    }

    if (leaveSection) {
        const show = manpowerModalMode === "leave";
        leaveSection.hidden = !show;
        leaveSection.style.display = show ? "" : "none";
    }

    if (clearDayButton) {
        clearDayButton.hidden =
            manpowerModalMode === "leave";
    }

    setText(
        "manpowerModalTitle",
        manpowerModalMode === "leave"
            ? "Off / Leave"
            : "Manpower"
    );

const saveButton = $("saveManpower");

if (saveButton) {

    saveButton.textContent =
        manpowerModalMode === "leave"
            ? "Save Off / Leave"
            : "Save Manpower";

    saveButton.dataset.mode = manpowerModalMode;
}

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
}


/* =========================================================
36. SAVE PRESENT MANPOWER

Only updates the manpower table.
Does not modify the leave table.
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

    const { data: existing, error: readError } =
        await supabaseClient
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
            "Supabase did not confirm the manpower save."
        );
    }
}


/* =========================================================
37. SAVE OFF / LEAVE ENTRIES

Uses manpower_leave_entries table.

The table must have:
- id UUID primary key
- venue TEXT
- date DATE
- staff TEXT
- reason TEXT

Unique constraint:
(venue, date, staff)
========================================================= */

async function saveLeaveEntries() {
    const venue = manpowerVenue;
    const date = manpowerDate;

    // Get existing leave records for this venue and date.
    const { data: existingRows, error: readError } =
        await supabaseClient
            .from("manpower_leave_entries")
            .select("id,staff")
            .eq("venue", venue)
            .eq("date", date);

    if (readError) throw readError;

    const existing = existingRows || [];

    const desiredEntries = draftLeaveEntries.map(entry => ({
        venue,
        date,
        staff: entry.staff,
        reason: entry.reason
    }));

    const desiredNames = new Set(
        desiredEntries.map(entry => entry.staff)
    );

    // Insert or update selected leave entries.
    if (desiredEntries.length > 0) {
        const { error: upsertError } =
            await supabaseClient
                .from("manpower_leave_entries")
                .upsert(
                    desiredEntries,
                    {
                        onConflict: "venue,date,staff"
                    }
                );

        if (upsertError) throw upsertError;
    }

    // Delete entries removed by the user.
    const removedRows = existing.filter(
        row => !desiredNames.has(row.staff)
    );

    for (const row of removedRows) {
        const { error } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("id", row.id);

        if (error) throw error;
    }

    // Verify that the saved records can be read back.
    const { data: verifiedRows, error: verifyError } =
        await supabaseClient
            .from("manpower_leave_entries")
            .select("id,venue,date,staff,reason")
            .eq("venue", venue)
            .eq("date", date);

    if (verifyError) throw verifyError;

    if ((verifiedRows || []).length !== desiredEntries.length) {
        throw new Error(
            "The Off / Leave records could not be verified after saving. Check Supabase permissions."
        );
    }
}


/* =========================================================
38. SAVE BUTTON

Routes to the correct table based on modal mode.
========================================================= */

async function saveManpower() {
    console.log("SAVE BUTTON CLICKED");
    console.log("Current mode:", manpowerModalMode);
    console.log("Venue:", manpowerVenue);
    console.log("Date:", manpowerDate);
    console.log("Leave entries:", draftLeaveEntries);
    
    if (!manpowerVenue || !manpowerDate) return;

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    const saveMode = manpowerModalMode;
    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        if (saveMode === "leave") {

    console.log(
        "Saving leave entries:",
        JSON.stringify(draftLeaveEntries)
    );

    if (!draftLeaveEntries.length) {
        throw new Error(
            "No Off / Leave entries found. Please add a staff member first."
        );
    }

    await saveLeaveEntries();

} else {

    await savePresentManpower();

}

        // Reload both tables so the calendar gets fresh data.
        const reloaded = await loadManpowerFromSupabase();

        if (!reloaded) {
            throw new Error(
                "Saved, but the latest records could not be reloaded."
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
            "Unable to save: " +
            (error.message || error)
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
    draftLeaveEntries = [];
    renderLeaveEntries();
}


/* =========================================================
41. CLEAR ENTIRE MANPOWER DAY

Deletes:
- Present manpower record
- All Off / Leave records for the date
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

        // Delete separate Off / Leave records.
        const { error: leaveError } = await supabaseClient
            .from("manpower_leave_entries")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (leaveError) throw leaveError;

        // Delete Present manpower record.
        const { error: manpowerError } = await supabaseClient
            .from("manpower")
            .delete()
            .eq("venue", venue)
            .eq("date", date);

        if (manpowerError) throw manpowerError;

        delete manpower[manpowerKey(venue, date)];

        closeManpowerModal();

        await loadManpowerFromSupabase();
        renderCurrentScreen();

        alert("Manpower and Off / Leave cleared for this day.");

    } catch (error) {
        console.error(
            "Unable to clear manpower day:",
            error
        );

        alert(
            "Unable to clear manpower: " +
            (error.message || error)
        );

    } finally {
        if (button) button.disabled = false;
    }
}
