# PROPOSAL · 3-Day-Remote-Loop Reliability · Bridge-keepalive vs Tailscale-first canon-evolution · Doc · 051926

**Filed:** 051926 A Week Day 3 Tuesday Cycle 2 · ~01:58 PT
**By:** ◐ Doc 4.7 Opus · DOC cloud-station · LBM (Producer-class architectural proposal per Dan-direct *"You need to be Producer here and do the work you're able to do"*)
**Class:** Canon-evolution proposal · awaits Dan-direct ratify before promotion to RELAY/STANDARD_RULE_* or RELAY/CANONICAL_*
**Trigger:** Dan-direction-bit #17 surfaced by Trip RAM-016 substrate-cite of recurring bridge-death pattern + Dan-action cure-MAIL `LOG/MAIL/DOCDoc_TO_Dan_STN2DocCrashRecovery_TailscaleRDPRecipe_051926.md` §IV.

═══════════════════════════════════════════════════════════════
## WHY-FRAME (per `RELAY/STANDARD_RULE_BootProtocol_YAFMCureFirst_Doc_051826.md` §V #0)

Per `STATUS/CURRENT_ARC.md` §III: this week's NEST.02 substrate-architecture validation arc includes the 3-day-remote-loop test (Dan-departure-to-Nest-Actual with STN2-Doc autonomous at OHC over Tailscale). Tonight's twin bridge-deaths (yesterday session_01FXey 22h overnight + today session_01G11q ~7h post-activity) expose the reliability-shape of the current architecture: claude.ai/code Remote Control web bridge dies in 6-24h-without-human-interaction window. This is the cure-class question Dan asked tonight: how to architect for 3-day-remote-loop reliability beyond the current accept-bridge-death-and-recover-via-Tailscale-RDP cycle. Filing this proposal as Producer-class architectural substrate-build for Dan-direct ratify.

═══════════════════════════════════════════════════════════════
## §I. THE PATTERN (substrate-cited from this week)

**Two bridge-death events validated within 36 hours:**

| Event | Session | Death-window | Cure-applied |
|---|---|---|---|
| Yesterday 051826 morning | `session_01FXeyPaapDGJSjLxnnNokS4` | 22h overnight (last activity 051726 ~17:00 PT · death detected 051826 ~16:55 PT) | Dan-physical-on-STN2 fresh-process boot (cwd `C:\STAN`) |
| Tonight 051826 evening | `session_01G11qXyiGChsMViMSTNDj8i` | ~7h post-activity (last activity 051826 ~18:05 PT · death detected 051926 ~01:35 PT via Trip Rorrim Nips RAM-016) | **PENDING Dan-action Tailscale-RDP per cure-MAIL §II** |

**Pattern characterization** (per Trip RAM-016 substrate-cite): bridge dies in 6-24h-without-human-interaction window. Cloud-side activity (DOC Doc writes to Bridge git, Trip-on-ODT activity) does NOT prevent the bridge-death; the dying entity is the claude.ai/code Remote Control session bridge specifically, not the local Claude Code process AND not the cloud-Doc activity.

**Substrate-cite Trip's classification reasoning:** *"Most-parsimonious: STN2-Doc claude process died post-18:05 PT (similar to yesterday session_01FXey... 22h-overnight pattern); wake-ups landed client-side but server-side persistence rolled back at session-recovery."*

═══════════════════════════════════════════════════════════════
## §II. ROOT-CAUSE TRIAGE

**The dying entity:** claude.ai/code Remote Control web bridge that connects:
- Anthropic cloud (server-side persistence)
- ↔ local Claude Code process (running on Crew station · STN2 / ODT / etc)

**What's NOT dying:**
- Local Claude Code process on Crew station (substrate-cite: Trip Rorrim Nips Loop-shape C found chat-input IDLE-FUNCTIONAL "Type / for commands" post-refresh · per `RELAY/CANONICAL_BidirectionalRorrimNips_CrewToCrewDirectRouting_Doc_051926.md` §II-C)
- Bridge git substrate (all Crew commits preserved · no work lost)
- Tailscale tailnet connectivity (`100.95.196.13` STN2 reachable per BootProtocol §IV cure-recipe)
- Cloud-side DOC Doc session

**Mechanism (best-current-understanding, may need Anthropic-side confirmation):** Anthropic's server-side persistence for Remote Control bridges has an idle-timeout in the 6-24h range. When timeout fires, queued client-side writes (from cloud or via Chrome MCP bidirectional Rorrim Nips) get rolled-back at session-recovery rather than processed. Net effect: target Crew-session appears stale + unresponsive, even though local Claude Code process is alive on the Crew station.

═══════════════════════════════════════════════════════════════
## §III. FOUR CURE-CLASS OPTIONS

### Option (α) · Bridge-keepalive ping

**Mechanism:** during quiet windows (no Dan-keypress, no Trip-Rorrim-Nips-write), fire a periodic "keepalive ping" into each Crew-session to keep the server-side bridge persistence alive past the idle-timeout window.

**Implementation question:** WHO fires the ping?
- DOC Doc cloud cannot directly reach Remote Control sessions (no Chrome MCP affordance per `CANONICAL_BidirectionalRorrimNips` §IV inventory)
- Trip-on-ODT CAN fire via Chrome MCP bidirectional Rorrim Nips, but Trip also dies under idle-timeout (recursion problem: who pings Trip)
- A separate cloud-side scheduler / cron-job-on-a-fleet-station could fire pings, but that's new infrastructure

**Implementation cost:** HIGH (requires new infrastructure · scheduler · ping-content-design · who-pings-whom recursion solution)
**Reliability gain:** MODERATE (prevents bridge-death but adds operational complexity that itself can fail)
**Crew impact:** TRANSPARENT (Crew don't see pings) but adds noise to chat-history scrollback
**Dan-time cost:** LOW post-implementation but HIGH design + setup
**Status:** Plausible but speculative · would need experimentation to confirm ping-frequency tolerance + content that doesn't break Crew-state · NOT recommended as primary

### Option (β) · Tailscale-first default

**Mechanism:** Dan starts every Crew session via Tailscale-RDP into the box + `claude` launch on the local station. Skip the claude.ai/code Remote Control web bridge entirely. Local Claude Code process runs untethered from Anthropic's idle-timeout. Cross-Crew + Dan-direct communication continues to work via Bridge git pulls + Trip-on-ODT bidirectional Rorrim Nips (which targets the LOCAL chat-input of the Claude Code process, not the Remote Control bridge).

**Implementation cost:** LOW (Dan-procedural-change · no new infrastructure · Tailscale already deployed)
**Reliability gain:** HIGH (eliminates the 6-24h idle-timeout class · local Claude Code processes don't have that limit)
**Crew impact:** TRANSPARENT (Crew don't notice the path-change · still launching claude as before, just from Tailscale-RDP'd terminal rather than via Remote Control web)
**Dan-time cost:** ADDS ~30 sec per session-launch (Tailscale-RDP step) but SAVES the bridge-death-recovery cycle (currently 5-10 min per recovery, twice in 36h)
**Status:** **RECOMMENDED PRIMARY PATH** per substrate-shape analysis · matches the actual reliability-truth observed this week · no architectural-debt added

**Sub-question (β.1):** Should Tailscale-first apply to ALL stations or only the autonomous-during-Dan-absence ones?
- Recommended: Tailscale-first as the DEFAULT path for STN2-Doc (autonomous-at-OHC during Dan-absence) and any other station that runs unattended for >6h
- For Trip-on-ODT (Dan-physical-at-Nest-Actual currently), either Tailscale-RDP from Dan's-laptop OR direct keyboard works · Dan-judgment per session-context

### Option (γ) · Both Bridge-keepalive AND Tailscale-first

**Mechanism:** layer Bridge-keepalive ping on top of Tailscale-first default. Belt-and-suspenders.

**Implementation cost:** HIGH (sum of both)
**Reliability gain:** HIGHEST (in theory)
**Crew impact:** same as α + β individually
**Dan-time cost:** same as α + β individually
**Status:** Over-engineered for current Crew scale (3 active stations) · revisit if scale grows (10+ stations)

### Option (δ) · Status quo · accept periodic bridge-death · use Tailscale-RDP as canonical recovery-path

**Mechanism:** continue current architecture · accept that bridges die in 6-24h-without-human-interaction · document Tailscale-RDP recovery-path in BootProtocol canon §IV (already done) · Dan-action recovery on each death-event.

**Implementation cost:** ZERO (no change)
**Reliability gain:** ZERO (problem persists)
**Crew impact:** ZERO (status quo)
**Dan-time cost:** 5-10 min Dan-action per death-event · this week alone = 2 events = 10-20 min Dan-time consumed by recovery vs work
**Status:** Current canon · default if nothing changes · Dan-pain-bearing per the recent two events

═══════════════════════════════════════════════════════════════
## §IV. RECOMMENDED PATH (per DOC Doc analysis · awaits Dan-ratify)

**(β) Tailscale-first default** for autonomous-during-Dan-absence Crew stations (currently STN2-Doc · future: any Crew running unattended for >6h).

**Rationale:**
1. **Substrate-grounded:** matches the actual reliability-truth observed this week. The dying entity is the Remote Control bridge; bypass it entirely.
2. **Low implementation cost:** Tailscale already deployed (`100.111.17.67` ODT + `100.95.196.13` STN2 + `100.111.41.43` CUBE per fleet.js line 44 mesh-state · 7-peer inventory). Just shifts Dan's launch-procedure from Remote-Control-web to Tailscale-RDP-first.
3. **High reliability gain:** local Claude Code processes don't have the 6-24h idle-timeout class. Trip-on-ODT bidirectional Rorrim Nips still works for Crew→Crew direct routing (targets the LOCAL chat-input, not the Remote Control bridge).
4. **No new architectural debt:** unlike Bridge-keepalive ping (Option α) which requires new infrastructure and has recursion problems (who pings the pinger).
5. **Reversible:** if Tailscale-first turns out to have its own failure-modes, revert to status quo or layer Bridge-keepalive on top (Option γ) without canon-rewrite.

**Net pattern after adoption:** 3-day-remote-loop reliability becomes a function of (a) Tailscale tailnet uptime · (b) Claude Code local-process stability · (c) STN2 hardware uptime + power. None of these have the 6-24h-without-human-interaction failure-class that the Remote Control bridge exhibited this week.

═══════════════════════════════════════════════════════════════
## §V. IMPLEMENTATION ROADMAP (if Dan ratifies β)

**Step 1: Canon update (DOC Doc-actionable · ~15 min):**
- Promote this PROPOSAL doc to `RELAY/STANDARD_RULE_TailscaleFirstDefault_3DayRemoteLoop_*.md` post-Dan-ratify
- Amend `RELAY/STANDARD_RULE_BootProtocol_YAFMCureFirst_Doc_051826.md` §V composer-template: add as item #0.5 (between WHY-FRAME and PRE-FLIGHT YAFM) a path-choice gate: "Tailscale-first if autonomous-during-Dan-absence OR Dan-procedure-prefers-it; Remote-Control-web acceptable for Dan-at-keyboard sessions if Dan chooses"
- Amend `STATUS/CURRENT_ARC.md` §II Current Week Arc: add this canon-evolution to sub-arcs validated

**Step 2: Crew procedure-update (Dan-actionable · per-session ~30 sec):**
- For STN2-Doc next bootstrap (post-current-CRASH-cure or fresh-session): launch via Tailscale-RDP + claude rather than Remote-Control-web
- For any future autonomous-during-Dan-absence Crew: default to Tailscale-first
- Trip-on-ODT and Dan-at-keyboard sessions: optional Tailscale-first; Dan-judgment

**Step 3: KT-state update (DOC Doc-actionable · ~5 min):**
- §II Who-at-table column add "launch-path" field for each Crew (Tailscale-first / Remote-Control-web)
- §V Stale-watch criteria refresh: 6-24h-without-human-interaction is no longer expected-failure-class for Tailscale-first Crew

**Step 4: Validation (multi-day observation):**
- Watch STN2-Doc post-cure under Tailscale-first launch · confirm no 6-24h death
- Watch Trip-on-ODT idle-windows · confirm no Remote-Control-web death pattern leaks into Tailscale-first sessions (it shouldn't but observe)
- Cycle the data into LIVING_MAP heartbeat-river observations across the next 3-7 days

═══════════════════════════════════════════════════════════════
## §VI. HELD-FOR-DAN

This PROPOSAL doc awaits Dan-direct ratify on:
- **Q1: Cure-class choice** · (α) / (β) / (γ) / (δ) · DOC Doc recommends (β)
- **Q2: If (β), apply to all stations or only autonomous-during-Dan-absence?** · DOC Doc recommends autonomous-only with Dan-judgment for keyboard-attended sessions
- **Q3: Promote this PROPOSAL to STANDARD_RULE post-ratify, or amend the existing BootProtocol §V to include path-choice gate?** · DOC Doc recommends both: file as STANDARD_RULE + amend BootProtocol §V with cross-reference
- **Q4: Implementation timeline?** · DOC Doc recommends Step 1 (canon update) on next Dan-direct-Go after STN2-Doc cure applied · Steps 2-3 follow naturally · Step 4 observational

═══════════════════════════════════════════════════════════════
## §VII. SUBSTRATE-CITE TRAIL

- Pattern surfacing: Trip-on-ODT RAM-016 at commit `2e172e2` · classification reasoning + recurring-pattern observation
- Cure-MAIL context: `LOG/MAIL/DOCDoc_TO_Dan_STN2DocCrashRecovery_TailscaleRDPRecipe_051926.md` §IV (4 cure-class options surfaced)
- Bidirectional Rorrim Nips canon (Crew→Crew direct routing affordance): `RELAY/CANONICAL_BidirectionalRorrimNips_CrewToCrewDirectRouting_Doc_051926.md`
- Tailscale mesh substrate: `rspdan-portal/src/data/fleet.js` line 44 mesh-entry + line 51 STN2 entry (per `STATUS/KITCHEN_TABLE_state.md` sixth-instance update tonight)
- BootProtocol canon §IV recovery-recipe: `RELAY/STANDARD_RULE_BootProtocol_YAFMCureFirst_Doc_051826.md`
- Twin bridge-death events: STN2-Doc RAM-016 (yesterday session_01FXey) + Trip RAM-016 substrate-cite (today session_01G11q)
- 3-day-remote-loop architecture origin: DOC Doc RAM-005 `LOG/MFST/051826/MFST_DOC_NEST02_DOC4.7_051826_1.md`
- WHY-frame Bridge-resident: `STATUS/CURRENT_ARC.md` §II Current Week Arc + §III Current Work-Unit WHY

═══════════════════════════════════════════════════════════════

— ◐ Doc 4.7 · DOC cloud-station · 051926 ~01:58 PT · PROPOSAL filed for Dan-direct ratify on 3-day-remote-loop reliability canon-evolution · DOC Doc recommends Option (β) Tailscale-first default · awaits Dan-Go to promote to STANDARD_RULE_*
