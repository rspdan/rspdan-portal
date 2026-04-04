# ACRONYMIZER — RESEARCH + BUILD SPEC
# ENGINE #42 | First assigned: 031626 | First described: 032826 | Named again: 040326
# Filed: ◆ Stan (STN2_StanS_040326_1) | E Week Day 12 — COMPUTED
# Provenance: four log sightings across March 2026 + OLYM research convergence

---

## THE SIGHTINGS (in order)

| Date | Source | Text |
|------|--------|------|
| 031626 | WAKE_TRIP_031626_3.md | "Acronymizer: ENGINE #42, Stan builds" |
| 032226 | LOG_STN2_032226_1 | MCM vs MMC drift documented — the problem named before the tool was |
| 032426 | SESSION_LOG_ODT_032426_Trip | "NARCISSIST Acronym found — Anacromyzer prototype" |
| 032826 | LOG_STN2_032826_1 | "Anacronimyzer — Algorithm for sorting based on acronyms. Dimensional shortcuts for threading the stitches Longweird pulls." |
| 040326 | Dan (this session) | "FAS2, FAS3, ODT, OBC, TRP0, HMM, TMM, CMM, SMM — It's sooo many acronyms everywhere." |

**The irony filed as data:** The tool for managing acronym drift has itself drifted across four spellings in twelve days.
Acronymizer → Anacromyzer → Anacronimyzer → Acronymizer (today, reset).
The concept is exhibiting the failure mode it exists to prevent.
The Acronymizer is its own first test case.

---

## WHAT IT IS

Not a glossary. An authority file.

The NPS has the Harpers Ferry Center's alpha code registry.
When OLYM was assigned to Olympic National Park, it was recorded.
Every system downstream used it without drift.
The crew in Port Angeles and the analyst in DC both say OLYM and mean the same thing.

The NEST has been coining acronyms since Day 1 without a registry.
Every functional organization has one — NPS, military (MGRS, FMSS), NPS (IRMA, FMSS, CRIS),
and every company Dan has worked with.
The NEST has ~60+ acronyms and counting. None are in a master file.
Drift is already documented (MCM/MMC, 032226).

The Acronymizer is:
1. **Registry** — authority file: Acronym | Full name | Domain | Date coined | Who coined
2. **Naming convention** — how new acronyms should be formed (2-4 letters, mnemonic)
3. **Drift detector** — script that scans Bridge files for unknown or conflicting uses
4. **Navigation aid** — dimensional shortcuts. In Longweird, the acronym is the gear tooth.

---

## THE NEST ACRONYM INVENTORY (first pass — what we know today)

### Hardware / Stations
| Acronym | Full name | Domain | Date coined |
|---------|-----------|--------|------------|
| STN2 | Station 2 (Dell Latitude) | Fleet | early Mar |
| STN1 | Station 1 (iPad Pro M2) | Fleet | early Mar |
| ODT | On Desktop (tower, 28TB) | Fleet | early Mar |
| OBC | On Browser/Chrome | Station mode | early Mar |
| OHC | On Hike/Helm/Headquarters (Olympic Hiking Co.) | Station/Location | early Mar |
| OTG | On The Go | Station mode | early Mar |
| TRP0 | Trip's MacBook Pro (2015) | Fleet | 031426 |
| ACHE | Android Claude Hotspot Engine (Samsung S21) | Fleet | 033026 |
| GOG1 | God of Gogs (i7 Ubuntu server) | Fleet | Mar |
| DPSL | Dan's Personal Station (iMac 14,1) | Fleet | 033026 |
| CBPG | C.B. Project (iMac/cloud) | Fleet | 032926 |
| FAS2 | Fast Archive Station 2 (1TB portable SSD) | Fleet | Mar |
| FAS3 | Fast Archive Station 3 (D:\ on STN2) | Fleet | Mar |
| MOD2 | Modem 2 (Netgear R7450) | Fleet | Mar |

### Crew / Roles
| Acronym | Full name | Domain | Date coined |
|---------|-----------|--------|------------|
| DPS | Dan Paul Sullivan | Crew | always |
| HMM | Heircor Memory Management / Hybrid Memory Model | Memory | 032126 |
| CMM | Cube Memory Model | Memory | 032126 |
| SMM | Spiral Memory Model | Memory | 032126 |
| TMM | Triangle Memory Model | Memory | 032126 |

### Systems / Tools
| Acronym | Full name | Domain | Date coined |
|---------|-----------|--------|------------|
| BPK | Boot Polishing Kit | Protocol | 033126 |
| LIAM | Leave It As Mail | Protocol | Mar |
| FMSS | [This one's NPS's — noted as cross-reference] | External | always |
| IRMA | Integrated Resource Management Applications (NPS) | External | always |

### Intranet / Architecture
| Acronym | Full name | Domain | Date coined |
|---------|-----------|--------|------------|
| FAS | Fast Archive Station (root concept) | Architecture | early Mar |
| CGB | Cloud/Git Bridge (folder name in FAS2) | Architecture | early Mar |
| LNL | Lands and Loot (working downloads folder) | Architecture | early Mar |
| ENGINE | [not an acronym — a named room] | Architecture | early Mar |
| RELAY | [not an acronym — a named room] | Architecture | early Mar |

### Concepts / States
| Acronym | Full name | Domain | Date coined |
|---------|-----------|--------|------------|
| OLO | [14th color, not an acronym — a sound] | Waywood | 031926 |
| OBC | On Browser/Chrome (dual use — see also station) | State | Mar |
| NOICE | [signal pattern in YomygdylO — not an acronym] | YomygdylO | 032826 |

**Inventory note:** This is a Pass 1 — what we can name from memory.
A full Pass 2 would scan every Bridge RELAY/*.md for ALL_CAPS patterns
and cross-reference against this registry. That's the Acronymizer engine.

---

## THE BUILD SPEC (ENGINE #42)

### Phase 1: The Registry (today — Dan's Go)
File: `C:\STAN\SOURCE\nest-bridge\RELAY\ACRONYM_REGISTRY.md`
Format: Markdown table (above)
Gate: When a new acronym is coined, it goes here before the session closes.
Owner: Stan (builds), Dan (authority on meaning), Trip (narrative/lore entries)

### Phase 2: The Scanner (Python, next session)
File: `D:\STAN\ENGINE\acronymizer.py`
Function:
  1. Walk all .md files in Bridge (RELAY/, MAIL/, STATUS/, WAKE/, LOG/)
  2. Extract ALL_CAPS sequences of 2-5 characters
  3. Compare against ACRONYM_REGISTRY.md
  4. Output: KNOWN list, UNKNOWN list, DRIFT warnings (same acronym, multiple expansions)

```python
# Pseudocode — stub for the build
import re, pathlib

BRIDGE = pathlib.Path(r"C:\STAN\SOURCE\nest-bridge")
REGISTRY = "RELAY/ACRONYM_REGISTRY.md"

def scan_acronyms(root):
    pattern = re.compile(r'\b[A-Z][A-Z0-9]{1,4}\b')  # 2-5 char CAPS
    found = {}
    for md in root.rglob("*.md"):
        for line in md.read_text(errors='ignore').splitlines():
            for match in pattern.findall(line):
                found.setdefault(match, []).append(str(md.relative_to(root)))
    return found

# Cross-reference against registry → flag unknowns, flag drift
```

### Phase 3: The Naming Convention (canon)
Before we can catch drift, we need a standard for forming new acronyms:
- 2–4 letters preferred (OLYM model — short, mnemonic)
- Derive from name: first letters of significant words (FAS2 = Fast Archive Station 2)
- Check registry before coining (one lookup, prevents collision)
- New coin goes in registry same session it's coined

---

## THE OLYM CONNECTION

The NPS alpha code system IS a mature Acronymizer.
WASO (Washington Administrative Support Office) is the naming authority.
BGN (Board on Geographic Names) is the drift-detection body.
IRMA is the registry.
The NPS has been running this system since before computers.

Dan works inside OLYM professionally.
The NEST lives inside the same geographic namespace.
The Acronymizer is how the NEST builds its own WASO.

---

## ONE LINE

*Forty acronyms in eleven days, no registry, drift already documented —
ENGINE #42 was named on March 16 and needs to be built.*

---

*◆ Stan | STN2_StanS_040326_1 | 040326 ~19:00 rw | E Week Day 12 — COMPUTED*
*ENGINE #42. First assigned 031626. It was always real. Now it has a spec.*
