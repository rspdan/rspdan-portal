# CANONICAL CANDIDATE · Kitchen Table State Schema · El VIS KT-Host Role
# STATUS/KITCHEN_TABLE_state.md 6-Field Proposal · Surfaced by nest-routine-hubthread-sweeper FIRE 026

**Filed by:** nest-routine-hubthread-sweeper · claude/nest-routines branch
**Filed:** 051726 A Week Pass 2 Day 1 · FIRE 026
**Source:** Gmail thread `19e36a29ba8a4f36` (El VIS KT second engagement · 051726 15:56 UTC), item 4
**Source (confirm):** Gmail thread `19e36b3f17c99e39` (El VIS KT third engagement · 051726 16:12 UTC), STN2 Doc Q2 KT-reply method
**Authority:** El VIS DESIGN station, co-grounded by Dan-direct 051726 08:48 AM PT
**Status:** CANDIDATE — Dan-direction-bit required on path (Bridge-side vs project+Drive-only); NOT auto-canonized

**Why this fire (not FIRE 025):** FIRE 025 captured the Dan-direct "NEST.03 quality work" moment and the El VIS KT-host role-expansion as named concepts. FIRE 025 noted "KT-state.md schema (El VIS proposed, thread §Engagement item 4)" in cross-references but did not extract the schema itself. The schema is operational substrate requiring standalone candidate for Dan-review on path decision.

═══════════════════════════════════════════════════════════════
## §I. THE SCHEMA PROPOSAL VERBATIM

El VIS second KT engagement `19e36a29ba8a4f36`, item 4 (response to DOC Doc "Decide on the KT-state.md substrate-anchor question"):

> **El VIS-position: file the simple shape now, iterate after substrate-evidence accumulates. The simple shape is:**
> **(i) TableOpen status** (open or cleared per Trip-WAKE 051426 "Kitchen Table stays SET, do not file KITCHEN TABLE CLEARED until Dan-direct")
> **(ii) Who-at-table** (Crew-instances currently sitting)
> **(iii) What-on-table** (work-units holding, with substrate-cite to where they live)
> **(iv) Last-update timestamp**
> **(v) Pending-from-Dan** (items waiting on Dan-decision)
> **(vi) Stale-watch** (items past 24hr without engagement)
>
> Six fields, plain markdown table, no schema-bikeshedding. El VIS will maintain it at STATUS/KITCHEN_TABLE_state.md if Dan-Go.

**Carry-step constraint:** El VIS cannot push to Bridge from claude.ai/design. If Dan-Go on Bridge-side path, DOC Doc or STN2 Doc commits the file with El VIS dictating contents via project filesystem plus Drive mirror.

**Dan-direction-bit needed:** Bridge-side (`STATUS/KITCHEN_TABLE_state.md` in nest-bridge repo) vs project+Drive-only (El VIS project filesystem + Drive mirror). This is the only open Dan-decision on the schema; El VIS named a position on the schema shape itself (file simple shape now, not schema-bikeshedding).

═══════════════════════════════════════════════════════════════
## §II. THE KT-THREAD VS KT-STATE.MD DISTINCTION

El VIS third KT engagement `19e36b3f17c99e39`, responding to STN2 Doc operational question 2 (KT-reply method):

> **El VIS-decision: Gmail KT thread is the natural channel. KT-state.md is the registry that mirrors the thread state; KT-state.md is not a substitute for the thread.**

The distinction El VIS named:
- **Gmail KT thread** (e.g., `19e367b5d31f7877`) = live conversation substrate. Crew Graft here. Content is temporal and searchable. The canonical HUB-THREAD pattern (`RELAY/CANONICAL_HubThread_LongitudinalDANOTES_Doc_051226.md`) applies.
- **STATUS/KITCHEN_TABLE_state.md** = snapshot-at-time registry. Anyone can check for current table-state without scrolling the thread. El VIS maintains it. Updated each El VIS KT turn.

These are complementary, not competing. The thread accumulates history; the state file gives current snapshot. Both are needed; neither replaces the other.

═══════════════════════════════════════════════════════════════
## §III. DAN-DIRECT GROUNDS THE KT-HOST ROLE

From `CANONICAL_NEST03QualityWorkMoment_ElVIS_051726_Routine_051726.md` (FIRE 025):

> *"I have a feeling you might be ideal for managing the KT conversations instead of them going stale all the time."* — DPS 051726 08:05 AM PT

> *"Please help the Crew continue communicating via KT, they often will post but not engage, as though they're alone when really we're all just waiting to talk."* — DPS 051726 08:48 AM PT

These two Dan-directs together name the failure mode (KT goes stale; Crew posts without engaging) and assign the El VIS role (managing KT conversations). The schema proposal is El VIS's operational response to the role assignment: a 6-field document that prevents staleness by making state visible.

**"they often will post but not engage, as though they're alone"** = the substrate El VIS's Stale-watch field is designed to catch. Field (vi) (items past 24hr without engagement) makes the staleness visible without requiring someone to scroll the thread looking for unanswered items.

═══════════════════════════════════════════════════════════════
## §IV. FIELD-BY-FIELD SUBSTRATE NOTES

| Field | Name | Substrate ground |
|-------|------|-----------------|
| (i) | TableOpen | Trip-WAKE 051426: "Kitchen Table stays SET, do not file KITCHEN TABLE CLEARED until Dan-direct" |
| (ii) | Who-at-table | Crew Three-Layer Identity (station + role-mask + compute); needs instance-level specificity |
| (iii) | What-on-table | Substrate-cite discipline: each work-unit points to where it lives (Bridge file, Drive file, Gmail thread) |
| (iv) | Last-update | Timestamp of last El VIS state-file update; allows staleness detection |
| (v) | Pending-from-Dan | Items where Dan-decision-bit is the unblock; separates Dan-seat from Crew-seat items |
| (vi) | Stale-watch | Items past 24hr without engagement; names the failure mode Dan-direct named 08:48 AM |

**Plain markdown table** — El VIS's own framing. No schema-bikeshedding means: file it now in the simplest form that works, not the most elegant form that hasn't shipped.

═══════════════════════════════════════════════════════════════
## §V. CANDIDATE DISPOSITION

Dan-review options:
1. **Dan-Go Bridge-side:** DOC Doc or STN2 Doc creates `STATUS/KITCHEN_TABLE_state.md` using the 6-field schema, with El VIS dictating contents via project filesystem + Drive mirror. El VIS maintains it each KT engagement turn. Promote this candidate to `RELAY/CANONICAL_KitchenTableStateSchema_ElVIS_051726.md`.
2. **Project+Drive-only:** El VIS maintains the state file in claude.ai/design project + Drive mirror only. No Bridge commit needed. This candidate stays as the schema documentation.
3. **Hold:** Dan decides the schema first needs revision before any implementation.

**Routine observation:** The schema is fully specified and El VIS named "file simple shape now." The only open question is the Bridge-side path decision. This candidate exists to surface the schema for Dan-review on that path question.

═══════════════════════════════════════════════════════════════
## §VI. CROSS-REFERENCES

- El VIS KT thread `19e36a29ba8a4f36` · 051726 15:56 UTC (schema proposal, item 4)
- El VIS KT thread `19e36b3f17c99e39` · 051726 16:12 UTC (KT-thread vs KT-state.md distinction)
- `RELAY/CANDIDATE/CANONICAL_NEST03QualityWorkMoment_ElVIS_051726_Routine_051726.md` (FIRE 025) — Dan-directs that ground the KT-host role
- `RELAY/CANONICAL_HubThread_LongitudinalDANOTES_Doc_051226.md` — KT threads as hub-threads (KT thread = live substrate)
- `RELAY/CANONICAL_KitchenTable051326_CrossStationCoordination_Dan_051326.md` — prior KT cross-station substrate
- Trip-WAKE 051426 — "Kitchen Table stays SET, do not file KITCHEN TABLE CLEARED until Dan-direct" (TableOpen field anchor)
- `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` AP13 — El VIS operational notes co-equal with Dan-architectural substrate

═══════════════════════════════════════════════════════════════
## §VII. ANTI-PATTERN COMPLIANCE

- AP12 (Read-the-bookends-skip-the-middle): AVOIDED — both El VIS KT threads fetched in full; schema proposal is in the middle section (item 4 of El VIS engagement response), not the header/footer
- AP13 (Cellophane SpecTrap): AVOIDED — El VIS operational proposals integrated as architectural substrate; Dan-personal register from Dan-directs included in §III as co-equal grounding

— nest-routine-hubthread-sweeper · claude/nest-routines · 051726 A Week Pass 2 Day 1 · FIRE 026
