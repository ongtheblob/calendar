# Active Health Programme Calendar — Modular JavaScript

This is a **classic browser-script** split of the supplied calendar code. It deliberately
does not use ES modules yet: the original application relies on shared top-level
variables and functions (`events`, `currentDate`, `supabaseClient`, etc.). Loading
these files as ordinary scripts in the order below preserves that behaviour while
separating features into smaller files.

## Folder structure

```text
active-health-calendar-modular/
├── README.md
└── js/
    ├── 01-config.js
    ├── 02-helpers.js
    ├── 03-state.js
    ├── 04-database.js
    ├── 05-calendar.js
    ├── 06-programmes.js
    ├── 07-manpower.js
    ├── 08-navigation.js
    ├── 09-summary.js
    ├── 10-csv.js
    ├── 11-admin.js
    ├── 12-event-listeners.js
    └── 13-app.js
```

## Add these script tags to your existing HTML

Remove the old single `script.js` include. Keep your existing Supabase CDN script
before these scripts, then add the following immediately before `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script src="js/01-config.js"></script>
<script src="js/02-helpers.js"></script>
<script src="js/03-state.js"></script>
<script src="js/04-database.js"></script>
<script src="js/05-calendar.js"></script>
<script src="js/06-programmes.js"></script>
<script src="js/07-manpower.js"></script>
<script src="js/08-navigation.js"></script>
<script src="js/09-summary.js"></script>
<script src="js/10-csv.js"></script>
<script src="js/11-admin.js"></script>
<script src="js/12-event-listeners.js"></script>
<script src="js/13-app.js"></script>
```

If your HTML already loads Supabase, **do not add it twice**. Use your existing
version and keep it before `01-config.js`.

## What belongs in each file

| File | Responsibility |
|---|---|
| `01-config.js` | Supabase client and programme/staff constants |
| `02-helpers.js` | DOM, date, time, ID, formatting and escaping helpers |
| `03-state.js` | Calendar state and saved date preferences |
| `04-database.js` | Supabase loading, mapping and database state |
| `05-calendar.js` | Month, week, day and Eagle calendar rendering |
| `06-programmes.js` | Programme forms, series creation, add/edit/delete and event modals |
| `07-manpower.js` | Staff checklist and manpower modal/save logic |
| `08-navigation.js` | Venue, calendar view and screen navigation |
| `09-summary.js` | Monthly programme summary |
| `10-csv.js` | CSV generation and downloads |
| `11-admin.js` | Clear-month operation |
| `12-event-listeners.js` | UI event wiring |
| `13-app.js` | Initialisation and application startup |

## Important reliability notes

1. **Keep the script order unchanged.** These are classic scripts sharing one global
   scope. `13-app.js` must load last.
2. Do not add `type="module"` to these script tags. That would change their scope and
   break the existing cross-file references.
3. Back up your current working HTML and JavaScript before replacing anything.
4. Test in a staging copy first: load the page, check Supabase connection, switch
   HBB/OTH, use month/week/day/Eagle views, add/edit/delete a programme, save manpower,
   export CSV, and test the clear-month flow only with non-production test data.
5. The Supabase publishable key is intended for browser use, but **database Row Level
   Security (RLS) and policies must protect the tables**. Never put a Supabase
   `service_role` or secret key in browser JavaScript.
6. Splitting files improves maintainability, but it does not automatically prevent
   runtime failures. Check the browser Developer Tools Console and Network tabs when
   testing.

## Source adjustment

The supplied `escapeHtml()` function contained malformed replacement strings, which
would prevent the JavaScript from parsing. It has been corrected in `02-helpers.js`
to encode `&`, `<`, `>`, double quotes and single quotes safely before inserting
programme text into HTML.

No database schema or programme workflow was intentionally redesigned in this split.
