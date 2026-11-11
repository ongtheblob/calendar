
/* =========================================================
36. CSV EXPORT
========================================================= */

const CSV_HEADERS = [
    "Month",
    "Remarks",
    "Programme Name",
    "", // Blank column D
    "Date/ Week 1",
    "Time",
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
    "W14"
];

/* =========================================================
CSV HELPER FUNCTIONS
========================================================= */

function csvEscape(value) {
    return (
        '"' +
        String(value ?? "").replace(/"/g, '""') +
        '"'
    );
}

function downloadCSV(csv, filename) {
    const blob = new Blob(
        ["\uFEFF", csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/* =========================================================
EXPORT MONTH HELPERS
========================================================= */

function getExportMonthDate() {
    return showingSummary
        ? new Date(summaryDate)
        : new Date(currentDate);
}

function isDateInExportMonth(dateString) {
    const date = parseInputDate(dateString);
    const selected = getExportMonthDate();

    return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth()
    );
}

/* =========================================================
DATE FORMATTING

DATE / WEEK 1:
Tue, 13 Jan 2026

ROLLING PROGRAMME DATES:
13 Jan
20 Jan
27 Jan
3 Feb

========================================================= */

function formatRollingDate(value) {
    const date = parseInputDate(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short"
    });
}

/* =========================================================
37. GROUP ROLLING PROGRAMMES
========================================================= */

function getVenueSeries(venue) {
    const groups = new Map();

    events
        .filter(event => event.venue === venue)
        .forEach(event => {
            const key = event.seriesId || event.id;

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key).push(event);
        });

    return Array.from(groups.values()).map(series =>
        series.sort(
            (a, b) => dateTimeValue(a) - dateTimeValue(b)
        )
    );
}

/* =========================================================
BUILD VENUE EXPORT ROWS

COLUMN A: Month
COLUMN B: Remarks
COLUMN C: Programme Name
COLUMN D: Blank
COLUMN E: Date / Week 1
COLUMN F: Time
COLUMN G: Pax
COLUMN H: Status
COLUMN I-P: W1-W8
COLUMN Q: W14

========================================================= */

function buildVenueExportRows(venue) {
    const rows = [];

    getVenueSeries(venue).forEach(series => {
        if (!series.length) return;

        // Get the first session of the programme.
        const first = series[0];

        // Export only when Week 1 starts
        // in the selected month.
        if (!isDateInExportMonth(first.date)) {
            return;
        }

        // Build CSV row.
        const row = [
            formatMonth(first.date),  // A: Month
            "",                       // B: Remarks
            first.programme || "",    // C: Programme Name
            "",                       // D: Blank column

            // E: Date / Week 1
            parseInputDate(first.date).toLocaleDateString(
                "en-SG",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            ),

            formatTime(first.time),   // F: Time
            first.pax ?? "",          // G: Pax
            first.status || "",       // H: Status

            "",                       // I: W1
            "",                       // J: W2
            "",                       // K: W3
            "",                       // L: W4
            "",                       // M: W5
            "",                       // N: W6
            "",                       // O: W7
            "",                       // P: W8
            ""                        // Q: W14
        ];

        // Check whether this is a rolling programme.
        const rolling =
            Number(first.totalSessions) > 1;

        if (rolling) {
            series.forEach(event => {
                const week = Number(event.sessionNumber);

                // Normal rolling programme sessions: W1-W8.
                if (week >= 1 && week <= 8) {
                    row[8 + week - 1] =
                        formatRollingDate(event.date);
                }

                // Special Week 14 session.
                if (week === 14) {
                    row[16] =
                        formatRollingDate(event.date);
                }
            });
        }

        rows.push({
            date: first.date,
            time: first.time,
            row
        });
    });

    // Sort programmes by date and time.
    rows.sort((a, b) => {
        const firstDateTime =
            a.date + "T" + a.time;

        const secondDateTime =
            b.date + "T" + b.time;

        return firstDateTime.localeCompare(secondDateTime);
    });

    return rows.map(item => item.row);
}

/* =========================================================
38. CSV DOWNLOAD FUNCTIONS
========================================================= */

function makeVenueCSV(venue) {
    const rows = buildVenueExportRows(venue);

    if (!rows.length) {
        return null;
    }

    return [
        CSV_HEADERS,
        ...rows
    ]
        .map(row =>
            row.map(csvEscape).join(",")
        )
        .join("\r\n");
}

/* =========================================================
GET EXPORT FILENAME
========================================================= */

function getExportFilename(venue) {
    const date = getExportMonthDate();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return (
        venue +
        "_" +
        year +
        "-" +
        month +
        "_programme_schedule.csv"
    );
}

/* =========================================================
EXPORT CURRENT VENUE
========================================================= */

function exportVenueMonthCSV(venue) {
    if (!programmesLoaded) {
        alert("Programme data has not loaded yet.");
        return false;
    }

    const csv = makeVenueCSV(venue);

    if (!csv) {
        alert(
            "No " +
            venue +
            " programmes begin in the selected month."
        );

        return false;
    }

    downloadCSV(
        csv,
        getExportFilename(venue)
    );

    return true;
}

/* =========================================================
EXPORT CURRENT MONTH
========================================================= */

function exportCurrentMonthCSV() {
    exportVenueMonthCSV(currentVenue);
}

/* =========================================================
EXPORT BOTH VENUES
========================================================= */

function exportBothVenuesCSV() {
    if (!programmesLoaded) {
        alert("Programme data has not loaded yet.");
        return;
    }

    const hbb = makeVenueCSV("HBB");
    const oth = makeVenueCSV("OTH");

    if (!hbb && !oth) {
        alert(
            "No programmes begin in the selected month."
        );

        return;
    }

    if (hbb) {
        downloadCSV(
            hbb,
            getExportFilename("HBB")
        );
    }

    if (oth) {
        downloadCSV(
            oth,
            getExportFilename("OTH")
        );
    }
}
