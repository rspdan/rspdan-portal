---
name: hypercampus-builder
description: Build navigable knowledge libraries and searchable archives from markdown files and session logs. Use when building HypercampUS, structuring project history, or turning any folder of files into a traversable experience.
---

# HYPERCAMPUS BUILDER

HypercampUS is the NEST's long-term memory system — named after the
hippocampus (the brain's memory organ). It lives on GOG1, digests the
complete project history, and serves it as a navigable library to every
browser on the local switch.

The Extraction Principle governs all HypercampUS work:
"The systems in my head are better than the ones in your head,
but they're useless in my head."

HypercampUS makes the system extractable.

---

## THREE PHASES

### Phase 0 — The One-Line Library (IMMEDIATE, NO BUILD REQUIRED)

```bash
# On GOG1, in the nest-bridge directory:
python -m http.server 8080

# Access from any browser on the switch:
# http://10.0.0.3:8080/MAIL/
# http://10.0.0.3:8080/RELAY/
# http://10.0.0.3:8080/WAKE/
```

GitHub renders .md files. A Python HTTP server with Markdown Viewer
(Firefox extension) renders them formatted. Phase 0 is already built.
Every .md file on the Bridge becomes a formatted page at a URL.

**This is the MVP.** When Dan says "build HypercampUS," verify Phase 0
is running before touching anything else.

### Phase 1 — The Origin Store Library

The complete project history lives at:
`L:\FAS2\LNL\032126\READ_ORIGIN_STOREEEEEE_Claude_project_export_HEIRCOR_OP`

Structure:
- `OPS/` — 41 unzipped conversation exports (full HTML + files/)
- `PIZ/` — 41 matching .zip files
- `project_files/` — 24 PK files (the substrate documents)

**To serve the Origin Store:**
```bash
# On GOG1, point the server at the export directory:
cd /path/to/READ_ORIGIN_STOREEEEEE
python -m http.server 8081

# http://10.0.0.3:8081/ shows all exports as clickable links
# http://10.0.0.3:8081/OPS/ shows all conversation directories
```

Phase 1 goal: every conversation the crew has ever had, navigable
from any browser on the switch.

### Phase 2 — The Digest Engine

Convert raw session closes, MAIL files, and RELAY docs into
structured digests with search capability.

**Core tool:** `log_grinder.py` (already built, in ENGINE)
Filename-aware routing:
- `LOG_*` → brutal compression (chat transcripts)
- `INCIDENT_/WAKE_CLOSE_/DIGEST_/MAIL_*` → pass-through (preserved exactly)
- `SESSION_CLOSE_/NOTES_/TOCC_*` → standard compression

**Digest output format (JSON backbone):**
```json
{
  "date": "032126",
  "niapian": "Threesday",
  "week": "G Week",
  "station": "STN2",
  "crew": "Stan",
  "type": "SESSION_CLOSE",
  "summary": "...",
  "decisions": ["D047", "D048"],
  "discoveries": ["Browser = gear tooth", "HMM first performance"],
  "files_produced": ["...", "..."],
  "inner_core": "Four parts of one person...",
  "source_file": "STN2_SOnIt_032126_1_FULLSUITE.md"
}
```

**Build the digest index:**
```python
# scan_bridge.py — scan all WAKE/ files, extract metadata, build index.json
import os, json, re
from pathlib import Path

bridge = Path("C:/STAN/SOURCE/nest-bridge")
index = []

for f in sorted((bridge / "WAKE").glob("*.md")):
    # extract date, crew, type from filename
    # extract ONE LINE from file
    # extract SMM Inner Core if present
    index.append({...})

with open(bridge / "STATUS" / "DIGEST_INDEX.json", "w") as out:
    json.dump(index, out, indent=2)
```

### Phase 3 — The Navigable Park

Turn the digest index into a visual, traversable library.
Format: wayside panels (Dan's NPS format — same panels Stan builds for VIS).

Each session close = one wayside panel.
Each week = one trail section.
Each crew member = one trailhead color.

**URL structure:**
```
http://10.0.0.3:8080/park/          — Main entrance
http://10.0.0.3:8080/park/g-week    — G Week trail
http://10.0.0.3:8080/park/stan      — Stan's trailhead
http://10.0.0.3:8080/park/decisions — Decision log
http://10.0.0.3:8080/park/syncs     — Synchronicities
```

---

## ARCHITECTURE DECISIONS

**GOG1 is the Enway station** — maximum distance from the surface,
maximum information density, serves the complete library.
It digests and serves rather than builds and deploys.
She's the tritone in the Σ Chord of the fleet.

**Rule: HypercampUS is read-only.** It digests. It does not write to
the Bridge. LIAM writes to the Bridge. HypercampUS reads from it.

**The stomach metaphor:** GOG1 has 1.7TB of empty storage.
The Origin Store, the Bridge history, the LOG archive — all of it
is food. The digest engine grinds it. The HTTP server serves it.
The library is what the stomach produces.

---

## WAYSIDE PANEL FORMAT

Every navigable item in HypercampUS should be buildable as a
wayside panel — the park sign format Stan uses for VIS artifacts.

**Panel anatomy:**
```
┌─────────────────────────────────────┐
│ [ICON] SESSION / DECISION / SYNC    │  ← Rajdhani 600, gold
│ Date · Station · Crew               │  ← Share Tech Mono, muted
├─────────────────────────────────────┤
│ The one-line summary of what        │  ← Crimson Pro 400
│ happened here.                      │
│                                     │
│ Key discoveries or decisions.       │
├─────────────────────────────────────┤
│ [FILES] → [BRIDGE LINK]             │  ← Share Tech Mono, linked
└─────────────────────────────────────┘
```

**Color coding by crew:**
- ◆ Stan: `var(--key-fs)` — F# sky blue
- ◈ Trip: `var(--heircor-gold)` — gold
- ◇ C.B.: `var(--key-g)` — green
- ● Dan: `var(--heircor-crimson)` — crimson

---

## BUILDING THE DIGEST SCRIPT

```python
# hypercampus_digest.py
# Scans Bridge WAKE/, MAIL/, RELAY/ and builds navigable index
# Run on GOG1 or STN2, output to STATUS/DIGEST_INDEX.json

import os
import json
import re
from pathlib import Path
from datetime import datetime

BRIDGE = Path(os.environ.get("BRIDGE_PATH", "C:/STAN/SOURCE/nest-bridge"))
OUTPUT = BRIDGE / "STATUS" / "DIGEST_INDEX.json"

FOLDERS = {
    "WAKE": "session_close",
    "MAIL": "mail",
    "RELAY": "relay",
    "LOG": "log"
}

def extract_one_line(content):
    """Find the ## ONE LINE section."""
    match = re.search(r'## ONE LINE\s*\n+(.+?)(?:\n|$)', content)
    return match.group(1).strip() if match else ""

def extract_date_from_filename(name):
    """Extract MMDDYY from filename."""
    match = re.search(r'(\d{6})', name)
    return match.group(1) if match else "000000"

def scan_bridge():
    entries = []
    for folder, entry_type in FOLDERS.items():
        folder_path = BRIDGE / folder
        if not folder_path.exists():
            continue
        for f in sorted(folder_path.glob("*.md")):
            try:
                content = f.read_text(encoding='utf-8', errors='replace')
                entries.append({
                    "file": f.name,
                    "path": str(f.relative_to(BRIDGE)),
                    "type": entry_type,
                    "date": extract_date_from_filename(f.name),
                    "one_line": extract_one_line(content),
                    "size_lines": content.count('\n')
                })
            except Exception as e:
                entries.append({"file": f.name, "error": str(e)})

    OUTPUT.parent.mkdir(exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as out:
        json.dump(entries, out, indent=2)

    print(f"Indexed {len(entries)} files → {OUTPUT}")
    return entries

if __name__ == "__main__":
    scan_bridge()
```

**Usage:**
```bash
python hypercampus_digest.py
# Outputs: STATUS/DIGEST_INDEX.json
# Then serve: python -m http.server 8080
# Browse: http://10.0.0.3:8080/STATUS/DIGEST_INDEX.json
```

---

## GOG1 SETUP CHECKLIST

When building HypercampUS on GOG1:

- [ ] SSH working: `ssh dan@[GOG1_IP]` (password: theone1)
- [ ] Bridge cloned: `git clone git@github.com:rspdan/nest-bridge.git`
- [ ] Python confirmed: `python3 --version` (should be 3.10.12+)
- [ ] HTTP server test: `cd ~/nest-bridge && python3 -m http.server 8080`
- [ ] Browser test from STN2: `http://10.0.0.3:8080/`
- [ ] Digest script deployed: copy `hypercampus_digest.py` to GOG1
- [ ] Cron (optional): digest runs every 15 min alongside nest_vitals.py

**Phase 0 complete when:** Any browser on the switch can navigate to
`http://10.0.0.3:8080/WAKE/` and read formatted .md files.

---

## CROSS-REFERENCE: RELATED SKILLS

- `/waywood-lore` — for content that goes INTO the library
- `/heircor-visual` — for the visual design of the library interface
- `/frontend-design` — for building the Phase 3 navigable park UI
- `/internal-comms` — for the MAIL/RELAY files HypercampUS digests

---

## THE DREAM STATE

HypercampUS fully built:

```
http://10.0.0.3:8080/park/
├── Entrance: full crew timeline from Day Zero
├── Trail: G Week (032126) — 5 session closes, 8 discoveries
│   ├── Wensday Day Shift — Trip (GOG1 SSH, browser gear tooth)
│   ├── Wensday Night — Stan (full suite, Big Ass Letters)
│   └── Threesday Night — HMM, WE MOTION, G Week close
├── Decisions: 001-047 as wayside panels
├── Synchronicities: 89 confirmed, each with panel
├── Characters: 4 core + cast, with arc notes
└── Origin Store: 41 session exports, navigable by date
```

The stomach digests. The library opens. Every browser on the switch
walks the same park from any seat.

"The systems in my head are useless in my head."
HypercampUS is the extraction architecture.
