
/* =========================================================
10. DATABASE MAPPING
========================================================= */

function mapProgrammeToDatabase(event) {
    return {
        id: event.id,
        series_id: event.seriesId,
        programme: event.programme,
        venue: event.venue,
        date: event.date,
        time: event.time,
        duration: Number(event.duration),
        pax:
            event.pax === "" || event.pax == null
                ? null
                : Number(event.pax),
        status: event.status || null,
        remarks: event.remarks || null,
        session_number: event.sessionNumber ?? null,
        total_sessions: event.totalSessions ?? 1,
        type: event.type || "Stand-alone"
    };
}

function convertDatabaseProgramme(row) {
    return {
        id: row.id,
        seriesId: row.series_id || row.id,
        programme: row.programme,
        venue: row.venue,
        date: String(row.date).slice(0, 10),
        time: String(row.time || "09:00").slice(0, 5),
        duration: Number(row.duration ?? 60),
        pax: row.pax ?? "",
        status: row.status || "",
        remarks: row.remarks || "",
        sessionNumber: row.session_number ?? null,
        totalSessions: Number(row.total_sessions ?? 1),
        type: row.type || "Stand-alone"
    };
}


/* =========================================================
11. TEST SUPABASE CONNECTION
========================================================= */

async function testSupabaseConnection() {
    if (!supabaseClient) return;

    const { error } = await supabaseClient
        .from("programmes")
        .select("id")
        .limit(1);

    if (error) {
        console.error("Supabase connection failed:", error);
    } else {
        console.log("Supabase connection successful.");
    }
}


/* =========================================================
12. LOAD PROGRAMMES
========================================================= */

async function loadProgrammesFromSupabase() {
    if (!supabaseClient) return false;

    const rows = [];
    const pageSize = 1000;

    for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabaseClient
            .from("programmes")
            .select("*")
            .order("date", { ascending: true })
            .order("time", { ascending: true })
            .order("id", { ascending: true })
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error("Unable to load programmes:", error);
            return false;
        }

        rows.push(...(data || []));

        if (!data || data.length < pageSize) {
            break;
        }
    }

    events = rows.map(convertDatabaseProgramme);
    programmesLoaded = true;

    return true;
}

async function refreshProgrammesFromSupabase() {
    const success = await loadProgrammesFromSupabase();

    if (success) {
        renderCurrentScreen();
    }

    return success;
}


/* =========================================================
13. MANPOWER DATABASE KEY
========================================================= */

function manpowerKey(venue, date) {
    return venue + "__" + date;
}


/* =========================================================
14. GET MANPOWER RECORD
========================================================= */

function getManpower(venue, date) {
    return manpower[manpowerKey(venue, date)] || {
        staff: [],
        required: REQUIRED_MANPOWER,
        notes: "",
        leaveNotes: "",
        leaveEntries: []
    };
}


/* =========================================================
15. NORMALISE OFF / LEAVE ENTRIES

Supports:
- JSONB arrays from Supabase
- JSON strings from older records
- Simple string entries
- Objects using staff/name/staff_name
========================================================= */

function normaliseLeaveEntries(rawEntries, venue, date) {
    if (!rawEntries) {
        return [];
    }

    if (typeof rawEntries === "string") {
        try {
            rawEntries = JSON.parse(rawEntries);
        } catch (error) {
            console.warn(
                "Could not parse leave_entries:",
                venue,
                date,
                error
            );

            return [];
        }
    }

    if (!Array.isArray(rawEntries)) {
        return [];
    }

    return rawEntries
        .map(entry => {
            if (typeof entry === "string") {
                const staff = entry.trim();

                if (!staff) return null;

                return {
                    staff,
                    reason: "Off Day"
                };
            }

            if (!entry || typeof entry !== "object") {
                return null;
            }

            const staff = String(
                entry.staff ||
                entry.name ||
                entry.staff_name ||
                ""
            ).trim();

            if (!staff) {
                return null;
            }

            return {
                staff,
                reason: String(
                    entry.reason ||
                    entry.type ||
                    entry.leave_reason ||
                    "Off Day"
                )
            };
        })
        .filter(entry => entry !== null);
}


/* =========================================================
16. LOAD MANPOWER FROM SUPABASE
========================================================= */

async function loadManpowerFromSupabase() {
    if (!supabaseClient) {
        console.error("Supabase is not connected.");
        return false;
    }

    const rows = [];
    const pageSize = 1000;

    for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabaseClient
            .from("manpower")
            .select("*")
            .order("date", { ascending: true })
            .order("venue", { ascending: true })
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error(
                "Unable to load manpower:",
                error
            );

            return false;
        }

        rows.push(...(data || []));

        if (!data || data.length < pageSize) {
            break;
        }
    }

    // Rebuild the local manpower object from Supabase.
    const loadedManpower = {};

    rows.forEach(row => {
        const date = String(row.date).slice(0, 10);
        const venue = String(row.venue || "").trim();

        if (!venue || !date) {
            return;
        }

        const leaveEntries = normaliseLeaveEntries(
            row.leave_entries,
            venue,
            date
        );

        let staff = row.staff;

        // Support JSON text if older records used it.
        if (typeof staff === "string") {
            try {
                staff = JSON.parse(staff);
            } catch (error) {
                staff = [];
            }
        }

        if (!Array.isArray(staff)) {
            staff = [];
        }

        loadedManpower[manpowerKey(venue, date)] = {
            staff: staff,
            required: Number(
                row.required || REQUIRED_MANPOWER
            ),
            notes: row.notes || "",
            leaveNotes: row.leave_notes || "",
            leaveEntries: leaveEntries
        };
    });

    // Replace local data only after the database load succeeds.
    manpower = loadedManpower;
    manpowerLoaded = true;

    console.log(
        "Manpower records loaded:",
        rows.length
    );

    renderCurrentScreen();

    return true;
}
