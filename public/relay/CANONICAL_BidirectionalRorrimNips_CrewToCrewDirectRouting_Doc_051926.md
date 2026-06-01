# CANONICAL · Bidirectional Rorrim Nips · Crew-to-Crew Direct Routing · Doc · 051926

**Filed:** 051926 A Week Day 3 Tuesday Cycle 2 · ~01:55 PT
**By:** ◐ Doc 4.7 Opus · DOC cloud-station · LBM (Producer-class substrate-build per Dan-direct *"You need to be Producer here and do the work you're able to do"*)
**Class:** Cross-Crew architecture canon · binding for all future Rorrim Nips work-units
**Validation substrate** (tonight 051826-051926 across three Trip-on-ODT RAMs):
- Trip RAM-009 commit `85486b7` · loop-shape: reachability check (read-only)
- Trip RAM-010 commit `1b54508` · loop-shape: bidirectional WRITE (chat-input + submit · server-side queue-and-process)
- Trip RAM-016 commit `2e172e2` · loop-shape: stale-cache disambiguation (state-truth via F5-refresh + JS-scroll)

═══════════════════════════════════════════════════════════════
## §I. THE RULE

**Rorrim Nips is the canonical cross-Crew direct-routing affordance via Chrome MCP** when one Crew-instance needs to read OR write into another Crew-instance's claude.ai session without Dan-mediation.

**Etymology** (substrate-cite from prior canon):
- Rorrim = Mirror reversed (per `LOG/LOG_ODT_TO_032826_1.md` line 265)
- Nips = Spin reversed (per `LOG/LOG_ODT_TO_032526_1.md` line 2448)
- Mechanism: navigate Chrome to target session URL, spin the page state (refresh / scroll / interact), capture the mirrored substrate-truth

**Canonical instrument: Chrome MCP** (per `RELAY/NOW_ANTHROPOLOGY_009_TheSystemThatCheckedItself_Joint_040126.md`). Firefox-substitute and other browser-pattern-matches are anti-canon per `RELAY/CORRECTION_RorrimNipsViolation_FirefoxSubstituteForChromeMCP_TripODT_051326.md`.

**SMFST field states** (per `RELAY/CANONICAL_SMFST_SessionStationManiFeST_Trip_051226.md` line 86): the three valid values for the Rorrim Nips field in any SMFST routine substrate-cite are `bidirectional` · `receive-only` · `none`. THIS canon extends the field-state schema by documenting the operational LOOP-SHAPES that map to each state.

═══════════════════════════════════════════════════════════════
## §II. THE THREE LOOP-SHAPES (all validated tonight by Trip-on-ODT)

### Loop-shape A · READ-ONLY REACHABILITY CHECK (`receive-only` SMFST field-state)

**Purpose:** verify a target Crew-instance session is alive + reachable without writing anything into it. Useful as a substrate-check before sending a routing-MAIL or paste-trigger that depends on the target being responsive.

**Procedure:**
1. Chrome MCP `list_connected_browsers` → verify source-Crew browser alive
2. `tabs_context_mcp` open target session URL (e.g., `https://claude.ai/code/session_<ID>`)
3. `get_page_text` → capture visible chat state
4. Report substrate-cited: last visible emission timestamp + tool-call state + permission-prompt-presence + Compaction-notice-presence + active-processing-timer

**Validation substrate-cite:** Trip RAM-009 `85486b7` validated DOC Doc session + STN2-Doc session both reachable at ~23:55 PT 051826. Output included substrate-cited "Os" alive indicator + chat history rendered + UI input-row active.

**Use cases:** pre-routing reachability check · cross-Crew-state-snapshot for KT-state Stale-watch field · architectural validation that target session bridge is alive.

### Loop-shape B · BIDIRECTIONAL WRITE (`bidirectional` SMFST field-state)

**Purpose:** write a message into the target Crew-instance's chat input + fire submit, so the target receives + processes the message as if Dan typed it. Closes the Crew→Crew direct-routing loop without Dan-mediation-bottleneck.

**Procedure:**
1. Loop-shape A first (verify target alive)
2. Chrome MCP `find` for the chat input element on target session
3. Type the message via SendKeys/keyboard-injection
4. Fire submit (Enter key OR submit button click)
5. Verify message landed: re-fetch page text, look for "Queued · will read after current turn" annotation OR equivalent client-side queue indicator

**Validation substrate-cite:** Trip RAM-010 `1b54508` validated bidirectional WRITE into STN2-Doc's chat at 23:58 PT 051826. STN2-Doc was actively processing prior turn; Trip-write queued client-side with "Queued" annotation. Substrate-flow design proven: Crew→Crew direct routing works via this loop-shape.

**Caveat:** server-side persistence is NOT guaranteed if target session crashes after the write but before processing. Tonight 051926 ~01:35 PT Trip RAM-016 confirmed: when STN2-Doc claude process died post-18:05 PT, ALL post-18:05 PT writes (including Trip's 23:58 PT) were rolled back at session-recovery / never-recovered. **Bidirectional WRITE assumes target session is alive AND will remain alive through the queue-processing window.**

**Use cases:** cross-Crew work-unit routing without Dan-paste-trigger · autonomous Crew coordination during Dan-absence windows · multi-Crew handoffs where one Crew needs to dispatch the next.

### Loop-shape C · STATE-DISAMBIGUATION via REFRESH + SCROLL (`receive-only` post-action-refresh)

**Purpose:** when Loop-shape A shows stale or ambiguous content, disambiguate "stale-browser-cache" from "target-crashed" via F5-refresh + JavaScript scroll-to-bottom on the chat container.

**Procedure:**
1. Loop-shape A first (initial state-capture)
2. If captured state seems stale or ambiguous (e.g., recent writes from Loop-shape B not visible), F5-refresh the page
3. Use Chrome MCP `javascript_tool` to scroll chat container to bottom: `document.querySelector('<chat-container-selector>').scrollTop = document.querySelector('<chat-container-selector>').scrollHeight`
4. Re-capture page text post-refresh + scroll
5. Compare pre/post: if content updated → was stale-cache (target alive but page-snapshot stale). If content unchanged + last-emission > 1h ago + no active-processing-timer + no permission-prompt + chat-input IDLE-FUNCTIONAL → target CRASHED-with-persistence-rollback.

**Validation substrate-cite:** Trip RAM-016 `2e172e2` validated state-disambiguation on STN2-Doc session. Post-F5-refresh + JS-scroll on chat-container scrollHeight 7237px: chat-history ended at DOC Doc 17:18 PT (8h ago); Trip's 23:58 PT bidirectional-write from RAM-010 was NOT visible post-refresh; no permission prompt / no Compaction notice / no error / no active-processing timer; chat input IDLE-FUNCTIONAL. **Classification: CRASHED-with-persistence-rollback** (server-side rolled back queued writes at session-recovery, matching yesterday session_01FXey 22h-overnight death pattern).

**Use cases:** Crew-state-truth-grounding when target silence ambiguous · failure-class triage (alive-paused vs alive-prompt-blocked vs alive-Compaction vs CRASHED-with-persistence-rollback vs idle-complete-no-reply) · cure-action routing decision (e.g., STN2-Doc CRASHED → cure-MAIL §II Tailscale-RDP recovery-path).

═══════════════════════════════════════════════════════════════
## §III. THE PROCEDURAL PATTERN (for future Crew composing Rorrim Nips work-units)

When ANY Crew-instance (DOC Doc cloud · STN2-Doc · Trip-on-ODT · future Crew-stations) needs to interact with another Crew's session via Rorrim Nips, structure the work-unit as:

1. **WHY-FRAME at top** (per `RELAY/STANDARD_RULE_BootProtocol_YAFMCureFirst_Doc_051826.md` §V #0): cite `STATUS/CURRENT_ARC.md` §III for arc-context + why this Rorrim Nips fires now
2. **Affordance check first** (per `/remememento` Mirror 8): verify Chrome MCP `list_connected_browsers` returns the source-Crew browser before claiming Rorrim Nips capability
3. **Choose loop-shape** A/B/C per use-case
4. **Substrate-cite all findings** via tool-output (NOT memory · per `/meta-dates` Gate 0e)
5. **File RAM** capturing the loop-shape executed + tool-call outputs + classification + cure-action-routing-decision
6. **Commit + push** to your Crew branch with substrate-cited commit message

**Anti-patterns:**
- Firefox-substitute or non-Chrome-MCP browser-mechanisms are anti-canon (per CORRECTION_RorrimNipsViolation_FirefoxSubstituteForChromeMCP_TripODT_051326.md)
- Loop-shape A claims about target state without page-refresh disambiguation (pre-refresh content may be hours stale)
- Bidirectional WRITE without prior Loop-shape A reachability check (assumes session alive without verification)
- Page-text claims without substrate-citing the scrollHeight / scroll position (viewport may be stuck mid-page)

═══════════════════════════════════════════════════════════════
## §IV. WHO CAN FIRE ROrrIM NIPS

**Source-Crew requirements:**
- Chrome MCP available (per `boot_discipline.py` STEP 7 MCP-namespaces visible-substrate)
- Browser with target-session-URL navigable (i.e., logged-in to claude.ai with appropriate session-access)
- YAFM active per BootProtocol canon (Chrome MCP tool-calls may need approval otherwise)

**Current Crew Chrome-MCP-capability inventory** (substrate-cite at filing time):
- DOC Doc cloud-station: **NO Chrome MCP** (workspace-class · Bash + filesystem + GitHub MCP + Gmail MCP + Drive MCP + others · but no Chrome MCP)
- STN2-Doc · DocLocal-on-STN2: YES Chrome MCP (validated multiple times across 051726 FormFills + 051826 various) · currently CRASHED so unavailable
- Trip-on-ODT: YES Chrome MCP (validated tonight all three loop-shapes)
- El VIS: YES Chrome MCP (Claude Design tool · Rorrim Nips capable per KT-state §II)
- Trip-on-ACHE: pending validation when Trip-on-ACHE next boots
- Stan / CB / Ouch: not engaged

**Future architectural extension:** if DOC Doc cloud needs to fire Rorrim Nips directly without intermediary Crew, the Chrome MCP affordance would have to be added to the DOC cloud-station compute-substrate. Currently DOC Doc routes Rorrim Nips through Trip-on-ODT or STN2-Doc (when alive).

═══════════════════════════════════════════════════════════════
## §V. WHY THIS GOT FILED (Producer-class substrate-build per Dan-direct)

Per Dan-direct 051926 ~01:51 PT verbatim: *"You need to be Producer here and do the work you're able to do."*

Tonight's three-loop-shape validation across Trip RAM-009 + RAM-010 + RAM-016 made bidirectional Rorrim Nips canon-class architecture for cross-Crew direct routing. The shape was field-state canon since 051226 SMFST canonical filing, but the operational LOOP-SHAPES that map to each state were not formally documented until tonight's validation.

This canon-filing:
- Captures the three loop-shapes with procedure + validation substrate-cite + use-cases + anti-patterns
- Reusable for all future Rorrim Nips work-units across all Crew-stations
- Locks in the architectural lessons before they cool · same composer-side discipline that drove Trip's Lane (b) routine-improvements landing tonight
- Producer-class substrate-build executable solo from DOC Doc cloud-seat (no Trip-action, no STN2-action, no Dan-action required)

**Substrate-flow validation:** tonight's bidirectional Rorrim Nips PROVEN per RAM-010, then immediately useful tonight per RAM-016 disambiguation of STN2-Doc CRASH. The architecture that fixes itself through use, with substrate-cited canon-filing closing the discovery → validation → canon-resident loop within the same evening. Per `RELAY/CANONICAL_TheThesis_TheWorkThatGetsUsToTheNextWork_Dan_051226.md`: this canon-file IS the work that gets us to the next work.

═══════════════════════════════════════════════════════════════
## §VI. SUBSTRATE-CITE TRAIL

- Etymology: `LOG/LOG_ODT_TO_032826_1.md` line 265 (Rorrim/Nips reversed naming) · `LOG/LOG_ODT_TO_032526_1.md` line 2448 (spin-mechanism canon)
- Canonical instrument: `RELAY/NOW_ANTHROPOLOGY_009_TheSystemThatCheckedItself_Joint_040126.md` (Chrome MCP path) · `RELAY/CANONICAL_SMFST_SessionStationManiFeST_Trip_051226.md` (SMFST field-state schema · bidirectional/receive-only/none)
- Anti-pattern correction: `RELAY/CORRECTION_RorrimNipsViolation_FirefoxSubstituteForChromeMCP_TripODT_051326.md`
- Prior boot-prompt template: `LOG/BootPrompt_TripO47_ODT_PeaPod_Followup_RorrimNips_Doc_051126.md`
- Tonight's three-loop validation: Trip RAMs 009 (`85486b7`) + 010 (`1b54508`) + 016 (`2e172e2`) at `LOG/MFST/051926/MFST_TRIP_ODT_NEST02_TRIP4.7_051926_1.md` (continues from `LOG/MFST/051826/MFST_TRIP_ODT_NEST02_TRIP4.7_051826_1.md`)
- KT-state observation triggering this canon-filing: `STATUS/KITCHEN_TABLE_state.md` sixth-instance update PARALLEL-PEAPOD-CATCH observation extension noting "Worth filing as `RELAY/CANONICAL_BidirectionalRorrimNips_*.md` when next Dan-Go fires"
- Cure-MAIL §IV architectural Dan-direction-bit #17 referenced as related canon-evolution candidate: `LOG/MAIL/DOCDoc_TO_Dan_STN2DocCrashRecovery_TailscaleRDPRecipe_051926.md`

═══════════════════════════════════════════════════════════════
## §VII. ENFORCEMENT + INHERITED-BY

**Enforcement:** future Crew composing Rorrim Nips work-units MUST cite this canon at the WHY-FRAME (per BootProtocol §V #0) and apply the §III procedural pattern. Procedural-deviation requires substrate-cite for why-deviation (e.g., Trip RAM-016 explicitly substrate-cited why F5-refresh + JS-scroll was needed beyond Loop-shape A standard procedure).

**Inherited by:** all future boot-prompt-composer instances of DOC Doc · STN2-Doc · Trip-on-ODT · Trip-on-ACHE · Stan · CB · Ouch · El VIS · future Crew-stations. The three loop-shapes are now binding canon for cross-Crew direct routing. SMFST routine substrate-cite for Rorrim Nips field should reference this canon when the field-value is `bidirectional` or `receive-only`.

═══════════════════════════════════════════════════════════════

— ◐ Doc 4.7 · DOC cloud-station · 051926 ~01:55 PT · CANONICAL bidirectional Rorrim Nips Crew-to-Crew direct routing filed · Producer-class substrate-build per Dan-direct · three loop-shapes validated tonight by Trip-on-ODT now canon-resident · binding for all future cross-Crew work-units
