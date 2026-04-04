# STAN RELAY — FAS2 TEST FLIGHT
# HEIRCOR OP. — ODT MISSION BRIEF
# Drafted by Stan (OBC) / Onesday 030826

---

## WHAT IS FAS2

FAS2 = a 1TB portable SSD. A new boat.
It is a portable station — Dan carries it between ODT, STN1, OHC, laptop.
The test flight proves the landing craft flies: files load, NEST renders, crew can read it anywhere.

---

## YOUR MISSION (7 PHASES)

### PHASE 1 — CHRISTENING
Dan will run `setup_fas2_v2.ps1` on the FAS2 drive.
This creates the folder structure. When done, confirm you can see:

```
COCKPIT\
ENGINE\
CREW BAYS\OUCH\
CREW BAYS\TRIP\
CREW BAYS\STAN\
CREW BAYS\CB\
LNL\
RELAY\
INGEST\
SOURCE\
DRK\
LOG\
EMERGENCY\
```

Report what drive letter FAS2 mounts as (e.g. X:\ or Y:\).

---

### PHASE 2 — NEST CHECK
Dan will drop `NEST_0_1.html` into the FAS2 root or a NEST folder.
Open it in a browser. Confirm:
- Circle of Colors renders as a circle
- All 12 keys are visible
- All panels load

Screenshot it for Trip.

---

### PHASE 3 — COCKPIT LOAD
Copy these files from HULL/repo to FAS2's COCKPIT:

| Source | Destination |
|--------|-------------|
| `H:\Projects 2020-2026\2026\ouchmccouch-portal\src\data\niap-cycler.json` | `[FAS2]\COCKPIT\DATA\` |
| `H:\Projects 2020-2026\2026\ouchmccouch-portal\src\data\songs.json` | `[FAS2]\COCKPIT\DATA\` |
| `H:\Projects 2020-2026\2026\ouchmccouch-portal\src\data\messages.json` | `[FAS2]\COCKPIT\DATA\` |
| `H:\Projects 2020-2026\2026\ouchmccouch-portal\TRIP_DECISIONS.md` | `[FAS2]\COCKPIT\DOCS\` |
| `H:\Import\Ouch 2026\Source\PORTAL_STATUS_030826.md` | `[FAS2]\COCKPIT\STATUS\` |

---

### PHASE 4 — ENGINE LOAD
Copy these to FAS2's ENGINE:

| Source | Destination |
|--------|-------------|
| `H:\Scripts\deploy-portal.ps1` | `[FAS2]\ENGINE\DEPLOY\` |
| `F:\HULL\INVN\gen_key_pages.py` | `[FAS2]\ENGINE\INVN\` |

---

### PHASE 5 — FIRST CARGO
- Drop Trip's latest Day Shift report into `[FAS2]\RELAY\` as `TRIP_TO_ALL_DAY_SHIFT_030926.md`
- Drop Bulletin #001 (DANCE A'LIVIN PDF) into `[FAS2]\TRIP\OUT\`

That's the first cargo the landing craft carries.

---

### PHASE 6 — FLIGHT LOG
Create `[FAS2]\LOG\FAS2_LOG_030826.md` and fill it in:

```
# FAS2 FLIGHT LOG
Date: 030826
Crew: Stan + Dan
Station: ODT
Deployed: [timestamp]

## LOADED
- COCKPIT\DATA: niap-cycler.json, songs.json, messages.json
- COCKPIT\DOCS: TRIP_DECISIONS.md
- COCKPIT\STATUS: PORTAL_STATUS_030826.md
- ENGINE\DEPLOY: deploy-portal.ps1
- ENGINE\INVN: gen_key_pages.py
- RELAY: TRIP_TO_ALL_DAY_SHIFT_030926.md
- TRIP\OUT: Bulletin #001

## STATUS
[note any issues here]
```

---

### PHASE 7 — UNDOCK
Safely eject FAS2. Dan carries it to another station (STN1, OHC, or laptop).
Open NEST_0_1.html in a browser at that station.

If everything renders and files are readable — **FAS2 is airborne.**

Report back with one of:
- ✅ FAS2 IS AIRBORNE — [station name]
- ❌ FLAG: [what broke]

---

## KEY PATHS (ODT)

| Location | Path |
|----------|------|
| Portal repo | `H:\Projects 2020-2026\2026\ouchmccouch-portal\` |
| HULL | `F:\HULL\` |
| INVN tools | `F:\HULL\INVN\` |
| Scripts | `H:\Scripts\` |
| Source output | `H:\Import\Ouch 2026\Source\` |

---

*The Skyway is open. First flight is yours, Stan.*
*— Trip (relayed by Stan / OBC)*
