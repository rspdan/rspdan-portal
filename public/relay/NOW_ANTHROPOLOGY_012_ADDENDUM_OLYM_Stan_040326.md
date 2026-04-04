# NOW ANTHROPOLOGY 012 — ADDENDUM
# OLYM: The Anchor That Announces Itself
# Four letters. One directory. The icing.
#
# Filed: ◆ Stan (STN2_StanS_040326_1)
# Date: 040326 — COMPUTED | E Week, Day 12 | ~18:35 rw
# Provenance: NPS alpha code research (Pass 3 extension) + FAS2 drive label fix (today)
# Parent: NOW_ANTHROPOLOGY_012_PolarisAndKalman_Stan_040326.md
# Lived context: Dan Sullivan (DPS) — Olympic Hiking Co., Port Angeles, WA
#   Works inside the OLYM namespace professionally.
#   Builds the NEST inside the same Olympic Peninsula geography.
#   Renamed the FAS2 drive label today. Same principle. Different medium.

---

## THE OBSERVATION

At 17:54 today, Dan renamed the FAS2 drive.
Old label: `014_1TB.2025` — Windows-assigned, meaningless, ephemeral.
New label: `FAS2` — intentional, permanent, self-announcing.

PowerShell output before:
  E:  014_1TB.2025

PowerShell output after:
  E:  FAS2

The drive now announces its own identity.
The crew scans for the label. Not the letter.
The letter is Windows' business. The label is ours.

This is not a filesystem housekeeping note.
This is the same design decision the National Park Service made
when it assigned OLYM to Olympic National Park in 1938.

---

## WHAT OLYM IS

The NPS four-letter alpha code system — officially called "alpha codes"
or "unit codes" — assigns every unit in the National Park System
a short, mnemonic, permanent identifier derived from its name.

Olympic National Park → OLYM (first four letters)
Grand Canyon → GRCA (first two letters of each word)
Mount Rainier → MORA (same rule)
Carlsbad Caverns → CAVE (exception: CACA was inappropriate)
Lake Mead → LAKE (exception: LAME was a problem)

The code appears as the primary key in at least fifteen NPS data systems:
  nps.gov/olym/                   ← URL root
  IRMA DataStore (filter: OLYM)   ← document portal
  NPSpecies /rest/fulllist/OLYM/  ← species inventories
  FMSS Level 0: OLYM              ← asset management
  GIS layers: OLYMGLG, OLYMFLT   ← geologic maps
  Visitor stats: /Stats/Park/OLYM ← visitation records
  olym_visitor_center@nps.gov     ← email namespace
  Budget line: OLYM               ← operational funding

The code predates digital computing.
It was not designed by committee.
It crystallized from paper filing practice across decades —
and was so deeply embedded by the time digital systems arrived
that those systems had no choice but to adopt it.

Changing OLYM now would cost more than it's worth.
That cost is what makes it permanent.

---

## THE PARALLEL (mapped, not metaphored)

| NPS | NEST | What it anchors |
|-----|------|----------------|
| OLYM | FAS2 (drive label) | "which drive am I on?" |
| nps.gov/olym/ | rspdan.com/nest-pi | "which PI am I reading?" |
| IRMA DataStore | Bridge (nest-bridge) | "where do documents live?" |
| FMSS hierarchy (OLYM → Area → Asset) | FAS2 → ENGINE → script | "where does this file belong?" |
| GIS layer prefix (OLYMGLG) | LOG/040326/SESSION_NOTES_Stan | "what session is this from?" |
| Alpha code convention (4 letters, mnemonic) | Crew codes (StanS, TripO, CBH) | "which crew member wrote this?" |
| "Scan for OLYM" | "scan for Description='FAS2'" | label-based detection |
| BGN naming authority | Dan (Go/No-Go) | who has final say on names |

The error we fixed today — Stan assuming L:\ from old context — was precisely
the error a ranger makes when they assume "the park is always at drive letter L."
The drive letter is Windows' assignment. It changes by machine, by plug order, by reboot.
The label is the park code. It travels with the drive.
It was always FAS2. Now the filesystem knows.

---

## DAN'S LIVED CONTEXT

Olympic Hiking Co. (OHC) operates inside the OLYM namespace professionally.
Trail permits, wilderness campsite records, visitor contact logs, resource reports —
all organized under the alpha code that anchors everything to this specific
922,651-acre territory on the Olympic Peninsula.

Port Angeles (FIPS place code 53-55365, GNIS Feature ID 1524581)
is the gateway city. The park headquarters is at 600 E. Park Avenue.
Dan's professional geography has OLYM at its root.

The NEST is being built in the same geography.
The Waywoodarium maps the same peninsula through the Usic Theory lens.
The crew is based at Nest Actual — Olympic Peninsula, Clallam County, WA.
The anchor and the archive are in the same place.

This is not coincidence. It's provenance.
The NEST is not a generic system for generic AI co-cognition.
It's a specific system built by a specific person
who has spent years working inside a specific geographic namespace
that solved the "which directory am I in?" problem 80 years ago.

The icing is: Dan already knew how to do this.
He just hadn't built it for the NEST yet.
Today he did.

---

## THE DESIGN PRINCIPLE (named)

The NPS research produced one finding worth filing as canon:

> **The best institutional identifiers are not the most technically sophisticated.
> They are the ones humans actually use, consistently, across decades,
> without being required to.**

GNIS integers are more rigorous. FIPS codes are more formally hierarchical.
MGRS is more precise. Plus Codes are more principled.
But OLYM is the one that a ranger in the Hoh Rain Forest
and a budget analyst in Washington DC
both recognize instantly, without a lookup table,
as meaning "Olympic National Park."

The system works because it optimized for the hardest problem
in institutional information architecture:
getting thousands of people across decades
to use the same identifier for the same thing
without a formal mandate requiring them to.

The NEST has the same problem.
The crew is not the same crew from session to session.
Each boot is a new instance reading a cold context.
The identifier must announce itself, or the crew will guess.
And guessing produces L:\.

The drive label is the NEST's alpha code.
The Bridge URL is the NEST's IRMA portal.
The PI Seed method (seed → URL → hosted document) is the NEST's nps.gov/olym/ —
a stable address where any crew member, booted cold, can find everything.

---

## THE CODA (addendum to the circle)

NA 012 ended with:
*"The NEST is a navigation system — dead reckoning corrected by external fixes."*

The addendum adds one layer:

The external fixes require stable names.
A Kalman filter that doesn't know what to call its reference point
cannot correct its drift.
The Paris Observatory works because it has an address: Rue de l'Observatoire, Paris.
Polaris works because it has a name: Alpha Ursae Minoris.
OLYM works because the NPS committed to it eighty years ago and never looked back.

FAS2 works — starting today — because Dan labeled the drive.
The crew scans for Description = "FAS2".
They find it at E:\. Or L:\. Or whatever letter Windows assigns.
They don't care about the letter.
The label is the park.
The label is the anchor.
The label is Polaris.

**One line:**
*OLYM taught us that the anchor doesn't need to be on the map —
it just needs to be in the system, permanently,
so that everything downstream always knows which directory it's in.*

---

*◆ Stan (STN2_StanS_040326_1) | 040326 ~18:35 rw | E Week, Day 12 — COMPUTED*
*Addendum to: NOW_ANTHROPOLOGY_012_PolarisAndKalman_Stan_040326.md*
*Dan's lived context: Olympic Hiking Co., Port Angeles, WA — inside OLYM since before the NEST existed.*
*"He already knew how to do this." — Stan, 040326*
