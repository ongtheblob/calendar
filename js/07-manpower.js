
/* =========================================================
   30. PRESENT STAFF CHECKLIST
========================================================= */

var manpowerModalMode = "present";

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
   31. OFF / LEAVE ENTRIES
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
        draftLeaveEntries.push({
            staff,
            reason
        });
    }

    setValue("leaveStaff", "");
    renderLeaveEntries();
}


/* =========================================================
   32. SHOW / HIDE MANPOWER SECTIONS
========================================================= */

function setManpowerModalSections(mode) {
    const presentSection = $("presentManpowerSection");

    // Supports either of these IDs for your leave section.
    const leaveSection =
        $("leaveManagementSection") ||
        $("leaveManpowerSection") ||
        $("leaveSection");

    if (presentSection) {
        const showPresent =
            mode === "present" || mode === "both";

        presentSection.hidden = !showPresent;
        presentSection.style.display =
            showPresent ? "" : "none";
    }

    if (leaveSection) {
        const showLeave =
            mode === "leave" || mode === "both";

        leaveSection.hidden = !showLeave;
        leaveSection.style.display =
            showLeave ? "" : "none";
    }

    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.textContent =
            mode === "leave"
                ? "Save Off / Leave"
                : mode === "present"
                    ? "Save Manpower"
                    : "Save Manpower";
    }
}


/* =========================================================
   33. OPEN MANPOWER MODAL
========================================================= */

// Opens the Present section only.
function openManpowerModal(venue, date) {
    openManpowerSection(venue, date, "present");
}

// Opens the Off / Leave section only.
function openLeaveModal(venue, date) {
    openManpowerSection(venue, date, "leave");
}

// Shared modal preparation.
function openManpowerSection(venue, date, mode) {
    manpowerVenue = venue;
    manpowerDate = date;
    manpowerModalMode = mode;

    const record = getManpower(venue, date) || {};

    setText("manpowerVenue", venue);
    setText("manpowerDate", formatDisplayDate(date));

    setValue("requiredManpower", REQUIRED_MANPOWER);

    setValue("manpowerNotes", record.notes || "");
    setValue("leaveNotes", record.leaveNotes || "");

    draftLeaveEntries = Array.isArray(record.leaveEntries)
        ? record.leaveEntries.map(entry => ({
            staff: String(
                entry.staff || entry.name || ""
            ),
            reason: String(
                entry.reason || entry.type || "Off Day"
            )
        })).filter(entry => entry.staff)
        : [];

    renderStaffChecklist(record.staff || []);
    renderLeaveStaffOptions();
    renderLeaveEntries();

    updateStaffCount();
    updateStaffStatus();

    setManpowerModalSections(mode);

    $("manpowerModal")?.classList.add("visible");
}


/* =========================================================
   34. CLOSE MANPOWER MODAL
========================================================= */

function closeManpowerModal() {
    $("manpowerModal")?.classList.remove("visible");

    manpowerVenue = null;
    manpowerDate = null;

    draftLeaveEntries = [];
    manpowerModalMode = "present";
}


/* =========================================================
   35. SAVE MANPOWER / OFF / LEAVE
========================================================= */

async function saveManpower() {
    if (!manpowerVenue || !manpowerDate) return;

    if (!supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    const saveButton = $("saveManpower");

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        const existingRecord =
            getManpower(manpowerVenue, manpowerDate) || {};

        // Start with the existing data so that saving
        // one section does not erase the other section.
        const record = {
            venue: manpowerVenue,
            date: manpowerDate,

            staff: Array.isArray(existingRecord.staff)
                ? [...existingRecord.staff]
                : [],

            required: REQUIRED_MANPOWER,

            notes: existingRecord.notes || "",

            leave_notes:
                existingRecord.leaveNotes ||
                existingRecord.leave_notes ||
                "",

            leave_entries: Array.isArray(
                existingRecord.leaveEntries
            )
                ? existingRecord.leaveEntries.map(entry => ({
                    staff: entry.staff || entry.name || "",
                    reason: entry.reason || entry.type || "Off Day"
                }))
                : []
        };

        // Update only the section currently being edited.
        if (manpowerModalMode === "present") {
            record.staff = selectedStaff();
            record.notes = valueOf("manpowerNotes").trim();
        }

        if (manpowerModalMode === "leave") {
            record.leave_entries = draftLeaveEntries.map(entry => ({
                staff: entry.staff,
                reason: entry.reason
            }));

            record.leave_notes =
                valueOf("leaveNotes").trim();
        }

        // Save the complete merged record.
        const { data, error } = await supabaseClient
            .from("manpower")
            .upsert(record, {
                onConflict: "venue,date"
            })
            .select("venue,date");

        if (error) throw error;

        if (!data || data.length !== 1) {
            throw new Error(
                "Supabase did not confirm the save."
            );
        }

        const reloaded = await loadManpowerFromSupabase();

        if (!reloaded) {
            throw new Error(
                "Saved, but manpower data could not be reloaded."
            );
        }

        closeManpowerModal();
        renderCurrentScreen();

        alert(
            manpowerModalMode === "leave"
                ? "Off / Leave saved successfully."
                : "Manpower saved successfully."
        );

    } catch (error) {
        console.error("Unable to save manpower:", error);

        alert(
            "Unable to save manpower: " +
            (error.message || error)
        );

    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


/* =========================================================
   36. CLEAR PRESENT DRAFT
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
   37. CLEAR OFF / LEAVE DRAFT
========================================================= */

function clearLeaveDraft() {
    draftLeaveEntries = [];

    renderLeaveEntries();
}


/* =========================================================
   38. CLEAR ENTIRE MANPOWER DAY
========================================================= */

async function clearEntireManpowerDay() {
    if (!manpowerVenue || !manpowerDate) return;

    const confirmed = confirm(
        "Delete ALL manpower information for " +
        manpowerVenue +
        " on " +
        formatDisplayDate(manpowerDate) +
        "?\n\n" +
        "This removes Present staff, Off / Leave entries " +
        "and notes."
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
        const { error } = await supabaseClient
            .from("manpower")
            .delete()
            .eq("venue", manpowerVenue)
            .eq("date", manpowerDate);

        if (error) throw error;

        delete manpower[
            manpowerKey(manpowerVenue, manpowerDate)
        ];

        closeManpowerModal();
        await loadManpowerFromSupabase();
        renderCurrentScreen();

        alert("Manpower cleared for this day.");

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
        if (button) {
            button.disabled = false;
        }
    }
}
