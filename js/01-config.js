/* =========================================================
ACTIVE HEALTH PROGRAMME CALENDAR
COMPLETE REPLACEMENT - VERSION 144

HBB / OTH
Month / Week / Day
Supabase
Programme management
Manpower
Monthly summary
CSV exports

IMPORTANT:

Calendar month stays selected after saving.

Add Programme date stays selected after saving.

No duplicate addProgramme functions.
========================================================= */

/* =========================================================

SUPABASE
========================================================= */

const SUPABASE_URL =
"https://yrhcdpaicivyxjfrfmpy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_jxGJEa2GF2dM8q4-bAO1eA_0SrLus17";

const supabaseClient = window.supabase?.createClient
? window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
)
: null;

if (!supabaseClient) {
console.error("Supabase library was not loaded.");
}

/* =========================================================
2. PROGRAMME SETTINGS
========================================================= */

const REQUIRED_MANPOWER = 2;

const SERIES_WEEKS = {
"Manage Knee Health": 6,
"Manage Metabolic Health": 6,
"Function - Combat Age-Related Loss of Muscle (CALM) 1.0": 8,
"Function - Combat Age-Related Loss of Muscle (CALM) 2.0": 6,
"Strength 1.0": 8,
"Perform 1.0": 8
};

const WEEK_14_PROGRAMMES = [
"Manage Knee Health",
"Manage Metabolic Health"
];

const PAX = {
"Strength 1.0": 12,
"Strength 2.0 - Foundation Strength Workout": 14,
"Strength 2.0 - Functional Fitness Workout": 12,
"Strength 2.0 - Mobility Workout": 12,
"Strength 2.0 - Assessment & Check-In": 10,
"Perform 1.0": 10,
"Perform 2.0 - Multi-Modal Workout": 12,
"Perform 2.0 - AMRAP Workout": 12,
"Perform 2.0 - ENGINE Workout": 12,
"Perform 2.0 - Assessment & Check-In": 10,
"Function - Combat Age-Related Loss of Muscle (CALM) 1.0": 12,
"Function - Combat Age-Related Loss of Muscle (CALM) 2.0": 14,
"Manage Knee Health": 8,
"Manage Metabolic Health": 8,
"Body Composition Assessment": 16,
"Active Health Senior Interest Group": 12
};

const STAFF_LIST = [
"Joelle",
"Jireh",
"RJ",
"GZ", 
"Clarissa",
"Rachael",
"Team Nila",
"APS",
"Other"
];
