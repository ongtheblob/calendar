
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
11. SUPABASE CONNECTION
========================================================= */


async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.error("Supabase client is unavailable.");
        return false;
    }

    const tables = [
        "programmes",
        "manpower",
        "manpower_leave_entries"
    ];

    let allSuccessful = true;

    for (const table of tables) {
        const { data, error } = await supabaseClient
            .from(table)
            .select("*")
            .limit(1);

        if (error) {
            console.error(
                `Supabase table check failed: ${table}`,
                error
            );

            allSuccessful = false;
        } else {
            console.log(
                `Supabase table accessible: ${table}`,
                data
            );
        }
    }

    return allSuccessful;
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

        if (!data || data.length < pageSize) break;
    }

    events = rows.map(convertDatabaseProgramme);
    programmesLoaded = true;

    return true;
}

async function refreshProgrammesFromSupabase() {
    const success = await loadProgrammesFromSupabase();

    if (success) renderCurrentScreen();

    return success;
}


/* =========================================================
13. MANPOWER DATABASE
========================================================= */

function manpowerKey(venue, date) {
    return venue + "__" + date;
}

function getManpower(venue, date) {
    return manpower[manpowerKey(venue, date)] || {
        staff: [],
        required: REQUIRED_MANPOWER,
        notes: "",
        leaveEntries: []
    };
}


/* =========================================================
14. NORMALISE LEAVE ENTRIES
========================================================= */

function normaliseLeaveEntries(entries) {
    if (!Array.isArray(entries)) return [];

    return entries.map(entry => {
        if (typeof entry === "string") {
            return {
                staff: entry.trim(),
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

        if (!staff) return null;

        return {
            staff,
            reason: String(
                entry.reason ||
                entry.type ||
                entry.leave_reason ||
                "Off Day"
            )
        };
    }).filter(Boolean);
}


/* =========================================================
15. LOAD MANPOWER AND LEAVE ENTRIES

manpower:
- Present staff
- Required manpower
- General notes

manpower_leave_entries:
- Staff on leave
- Leave reason
- Venue
- Date
========================================================= */

async function loadManpowerFromSupabase() {
    if (!supabaseClient) {
        console.error("Supabase is not connected.");
        return false;
    }

    try {
        const manpowerRows = [];
        const leaveRows = [];
        const pageSize = 1000;

        // Load Present manpower records.
        for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await supabaseClient
                .from("manpower")
                .select("*")
                .order("date", { ascending: true })
                .order("venue", { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (error) throw error;

            manpowerRows.push(...(data || []));

            if (!data || data.length < pageSize) break;
        }

        // Load separate Off / Leave records.
        for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await supabaseClient
                .from("manpower_leave_entries")
                .select("id,venue,date,staff,reason")
                .order("date", { ascending: true })
                .order("venue", { ascending: true })
                .range(offset, offset + pageSize - 1);

            if (error) throw error;

            leaveRows.push(...(data || []));

            if (!data || data.length < pageSize) break;
        }

        // Build the local manpower records.
        const loadedManpower = {};

        manpowerRows.forEach(row => {
            const venue = String(row.venue || "").trim();
            const date = String(row.date).slice(0, 10);

            if (!venue || !date) return;

            let staff = row.staff;

            if (typeof staff === "string") {
                try {
                    staff = JSON.parse(staff);
                } catch (error) {
                    staff = [];
                }
            }

            if (!Array.isArray(staff)) staff = [];

            loadedManpower[manpowerKey(venue, date)] = {
                staff,
                required: Number(
                    row.required || REQUIRED_MANPOWER
                ),
                notes: row.notes || "",
                leaveEntries: []
            };
        });

        // Add leave entries to their matching venue/date.
        leaveRows.forEach(row => {
            const venue = String(row.venue || "").trim();
            const date = String(row.date).slice(0, 10);
            const staff = String(row.staff || "").trim();

            if (!venue || !date || !staff) return;

            const key = manpowerKey(venue, date);

            // Create a local record even if there is no
            // Present manpower record for that date.
            if (!loadedManpower[key]) {
                loadedManpower[key] = {
                    staff: [],
                    required: REQUIRED_MANPOWER,
                    notes: "",
                    leaveEntries: []
                };
            }

            loadedManpower[key].leaveEntries.push({
                staff,
                reason: row.reason || "Off Day"
            });
        });

        // Replace local data after both database loads succeed.
        manpower = loadedManpower;
        manpowerLoaded = true;

        console.log(
            "Present manpower records loaded:",
            manpowerRows.length
        );

        console.log(
            "Off / Leave records loaded:",
            leaveRows.length
        );

        console.table(leaveRows);

        console.log(
        "Manpower records with Off / Leave:",
        Object.entries(manpower).filter(
        ([key, record]) =>
            Array.isArray(record.leaveEntries) &&
            record.leaveEntries.length > 0
    )
);

        renderCurrentScreen();

        return true;

    } catch (error) {
        console.error(
            "Unable to load manpower and leave entries:",
            error
        );

        return false;
    }
}
