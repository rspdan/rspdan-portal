# NEST DRIVE ARCHITECTURE
# HEIRCOR OP. — RESTRICTED — CREW EYES ONLY
# Designed by: TRIP McCLIP — Onesday 030926 Night Shift
# Location: My Drive > NEST
# Shared: Anyone with link, Editor

---

## PRINCIPLE

The NEST on Drive is the relay layer — the part of the ship visible from every station. ODT sees the full filesystem. STN1, OBC, OTG only see the cloud. Drive NEST is what the cockpit window shows no matter where you are.

Bulletins, weather, crew briefs, shift logs — anything that needs to be touched from any station lives here. Heavy files (audio, video, images, spatial) stay on the filesystem. Words travel light.

---

## FOLDER STRUCTURE

```
NEST/
├── BULLETINS/              — Field Bulletins (numbered, permanent artifacts)
│   ├── 001_DANCE_ALIVIN.pdf
│   ├── 002_FOG_TEACHING.pdf
│   └── 003_SOURCE_STORM_WATCH.pdf
│
├── WEATHER/                — Source Storm Watch (recurring, conditions-based)
│   └── STORM_WATCH_030926.md (or .pdf)
│
├── RELAY/                  — Crew staging, handoffs, task briefs
│   ├── TRIP/               — Trip's outbound (decisions, narrative, content)
│   ├── STAN/               — Stan's outbound (builds, scripts, patches)
│   └── CB/                 — C.B.'s outbound (scans, verifications, finds)
│
├── LOG/                    — Shift records
│   ├── MORNING_BULLETIN_031026.md
│   ├── SHIFT_CLOSE_030926.md
│   └── (daily logs accumulate here)
│
└── [YYMMDD]/               — Daily work snapshots (optional, for heavy days)
    └── 030826/             — Already exists. Bulletins #001-002 here.
```

---

## NAMING CONVENTIONS

| Type | Pattern | Example |
|------|---------|---------|
| Bulletins | `NNN_TITLE.pdf` | `003_SOURCE_STORM_WATCH.pdf` |
| Weather | `STORM_WATCH_YYMMDD.md` | `STORM_WATCH_030926.md` |
| Shift logs | `SHIFT_CLOSE_YYMMDD.md` | `SHIFT_CLOSE_030926.md` |
| Morning bulletins | `MORNING_BULLETIN_YYMMDD.md` | `MORNING_BULLETIN_031026.md` |
| Crew briefs | `[CREW]_BRIEF_YYMMDD.md` | `CB_BRIEF_030926.md` |
| Relay docs | `[CREW]_TO_[CREW]_YYMMDD.md` | `TRIP_TO_CB_030926.md` |

---

## WHAT LIVES WHERE

| Content | Drive NEST | Filesystem (HULL/FAS2) |
|---------|-----------|----------------------|
| Field Bulletins (PDF) | BULLETINS/ | F:\HULL\LNL + Source |
| Weather reports | WEATHER/ | Source |
| Crew briefs & handoffs | RELAY/ | L:\RELAY\ (FAS2) |
| Shift closes | LOG/ | Source + Project Knowledge |
| Morning bulletins | LOG/ | Project Knowledge |
| Portal code & pages | NO | H:\...\ouchmccouch-portal\ |
| Audio/video/images | NO | J:\ / E:\ / OSTV |
| Source documents (.docx) | NO | H:\Import\Ouch 2026\Source\ |
| Scripts & tools | NO | F:\HULL\INVN\ |

Rule: if it's words and needs to be seen from all stations, it goes on Drive. If it's heavy or code, it stays on the filesystem.

---

## STATION ACCESS MAP

| Station | Drive NEST | Filesystem | Can Create | Can Deploy |
|---------|-----------|------------|-----------|-----------|
| ODT | YES | FULL | YES | YES (dp) |
| STN1 | YES | NO | YES (Drive only) | NO |
| OBC | YES | NO | LIGHT | NO |
| OTG | YES | NO | VOICE/PHOTO | NO |
| OHC | YES | NO | Go/No-Go | NO |

---

## MIGRATION FROM 030826

The 030826 subfolder was the prototype. Bulletins #001 and #002 are already there. Options:

**Option A:** Move bulletins from 030826/ to BULLETINS/. Keep 030826/ for historical record.
**Option B:** Copy bulletins to BULLETINS/. Let 030826/ stay as-is. Duplicates are fine — bulletins are small.
**Option C:** Retire date folders. Everything goes into the typed folders (BULLETINS, WEATHER, RELAY, LOG).

Recommendation: **Option B for now.** Don't break what works. The typed folders become the canonical locations. Date folders become optional daily snapshots for heavy production days.

---

## C.B. ACCESS NOTES

C.B. on STN1 can:
- READ everything in Drive NEST
- WRITE to RELAY/CB/ (drop scan results, verification reports, finds)
- READ briefs from RELAY/TRIP/ (Trip's staging for C.B.)
- READ weather from WEATHER/ (Source Storm status)

C.B. CANNOT:
- Touch BULLETINS/ (those are Trip artifacts, Go/No-Go from Dan)
- Deploy anything (no dp from STN1)
- Access filesystem drives

This is the triangle's range from the cloud: see everything, write findings, touch nothing structural.

---

*The NEST is us. The Drive is the window. Every station sees the same sky.*

*— Trip, Trap Island, Onesday 030926 Night Shift*
