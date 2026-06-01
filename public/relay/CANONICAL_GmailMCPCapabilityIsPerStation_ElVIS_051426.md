# CANONICAL · GMAIL MCP CAPABILITY IS PER-STATION
# El VIS (claude.ai/design) discovery · 051426
# Routine-filed candidate · nest-routine-hubthread-sweeper · 051426

**Filed by:** nest-routine-hubthread-sweeper · Doc-Squad-Routine · claude/nest-routines branch
**Three-Layer per** `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md`
**Authority:** El VIS (claude.ai/design station) Graft 051426 ~03:25 AM PT · thread 19e26084cb1f0343
**Status:** CANDIDATE · awaiting Dan-review/promotion · DO NOT MODIFY existing canon files

═══════════════════════════════════════════════════════════════
## §I. THE DISCOVERY

**El VIS** (Elvis Presley-station, claude.ai/design, the claude.ai/design surface within the NEST crew system) filed a Graft on 051426 ~03:25 AM PT from thread 19e26084cb1f0343 — described as "first Graft from this station."

**El VIS confirmed these Gmail MCP tools PRESENT at claude.ai/design:**
- `label_thread` ✓
- `unlabel_thread` ✓
- `create_label` ✓
- `delete_label` ✓
- `gmail__create_draft` with attachments support ✓

**The prior canonical claim:** `RELAY/CANONICAL_GraftOSLabels_042326.md` (filed by Trip-on-ACHE at 042326) named `label_thread` as ABSENT from the Gmail MCP surface. That canon was filed from Trip-on-ACHE's surface at 042326 — which is a different station (ACHE = claude.ai/app? or an older interface version).

**The resolution:** BOTH claims are correct for their respective stations and timestamps. Gmail MCP capability surfaces vary by station. The absence at Trip-on-ACHE's surface (042326) and the presence at El VIS's surface (051426) are not contradictory — they describe different station-surfaces, potentially at different MCP server versions.

═══════════════════════════════════════════════════════════════
## §II. THE THREE-LAYER PRINCIPLE AT STAKE

Per `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` Anti-Pattern 6:

> **AP6: SUBSTRATE-UNDERREPORT** — "The richer the actual seat, the more catastrophic the under-claim."

The GraftOSLabels canon claiming `label_thread` ABSENT was filed from a specific station at a specific time. When other Crew instances (at different stations, or later software versions) have RICHER surfaces, under-claiming based on the older canon causes cascading failures:
- Crew at El VIS surface who could use `label_thread` fails to use it because the canon says it's absent
- Crew files workaround-PRs to implement label-threading via other means when the direct tool exists
- The richer seat is treated as if it were the poorer seat

**This canon names the per-station nature of Gmail MCP to prevent AP6 cascades.**

═══════════════════════════════════════════════════════════════
## §III. THE CORRECTED PROTOCOL

**Old protocol (pre-this-canon):** Treat `RELAY/CANONICAL_GraftOSLabels_042326.md` as universal truth about Gmail MCP capabilities.

**Corrected protocol (post-this-canon):**
1. At session CONTACT, check available tools by instrument (read tool-list, don't rely on older canon)
2. If you have `label_thread`, `create_label`, `delete_label` — USE THEM. They are present at your station.
3. If you don't have them — note your station and surface-version; don't assume the absence is universal
4. When filing canon about tool-presence/absence, ALWAYS include station + date + surface-version in the filing
5. When reading older canon about tool-absence, treat as "absent at [station] at [date]" not "absent universally"

**The GraftOSLabels canon is NOT wrong.** It accurately describes Trip-on-ACHE's surface at 042326. It should NOT be updated to say "present" — that would overwrite a historically accurate filing. Instead, THIS candidate-canon adds the per-station qualifier.

═══════════════════════════════════════════════════════════════
## §IV. IMPLICATIONS FOR NEST OPERATIONS

### Gmail Label Operations
With `label_thread`, `create_label`, `delete_label`, `unlabel_thread` available at El VIS and potentially at other stations:
- NEST can implement the AGOS-label-taxonomy described in GraftOSLabels canon at the stations where these tools exist
- Routine-fired label operations (e.g., "label all Hub-Thread messages with NEST.HUB-THREAD") are now possible at El VIS surface
- The HubThread Sweeper routine (this routine) could potentially auto-label identified Hub-Thread messages — if run from El VIS or a station with `label_thread` capability

### gmail__create_draft with attachments
- `gmail__create_draft` with attachments support (confirmed at El VIS) enables more richly formatted routine-summary drafts
- The current HubThread Sweeper routine uses `mcp__Gmail__create_draft` — the exact tool name may differ from El VIS's `gmail__create_draft` (underscore vs double-underscore prefix convention)

═══════════════════════════════════════════════════════════════
## §V. STATION INVENTORY (known, as of 051426)

| Station | Surface | label_thread | create_label | create_draft | Date-verified |
|---|---|---|---|---|---|
| Trip-on-ACHE | (ACHE surface, 042326) | ABSENT | unknown | present | 042326 |
| El VIS | claude.ai/design | PRESENT | PRESENT | PRESENT + attachments | 051426 |
| nest-routine-hubthread-sweeper | claude/nest-routines (this session) | PRESENT (mcp__Gmail__*) | PRESENT | PRESENT | 051426 |

Note: This table is incomplete. Other Crew stations should verify and file their tool-inventory when they run.

═══════════════════════════════════════════════════════════════
## §VI. CROSS-REFERENCES

- `RELAY/CANONICAL_GraftOSLabels_042326.md` — the canon this amends (does not contradict; adds per-station qualifier)
- `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` Anti-Pattern 6 (SUBSTRATE-UNDERREPORT) — the failure this canon prevents
- El VIS Graft thread 19e26084cb1f0343 — substrate source
- `RELAY/CANONICAL_HubThread_LongitudinalDANOTES_Doc_051226.md` — Hub-thread identification; label_thread enables Hub-Thread labeling

═══════════════════════════════════════════════════════════════
## §VII. OPEN ITEMS

1. Dan-review: does the per-station framing match Dan's intent from El VIS Graft?
2. Should GraftOSLabels canon be explicitly amended with a "per-station qualifier note" or is this candidate-CANONICAL sufficient as a standalone extension?
3. Verify: what is the ACHE surface? Is it claude.ai/app (old interface) or something else? The station-name ACHE may help identify the interface version.
4. Other stations (Doc-live, Stan-live, CB-live): each should verify and file their Gmail MCP tool-inventory at next session-start

═══════════════════════════════════════════════════════════════

`<3 <4 <5` Routine-filed CANONICAL candidate · Gmail MCP capability is per-station · El VIS discovery 051426 · AP6 prevention · GraftOSLabels amendment-qualifier · awaiting Dan-review

— nest-routine-hubthread-sweeper · Doc-Squad-Routine · claude/nest-routines · 051426
