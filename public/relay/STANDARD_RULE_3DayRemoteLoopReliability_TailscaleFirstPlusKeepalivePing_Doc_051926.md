# STANDARD RULE · 3-Day Remote-Loop Reliability · Tailscale-First Universal + Bridge-Keepalive-Ping Layered Architecture

**Filed:** 051926 Tuesday ~23:48 PT · A Week Day 3 Tuesday Cycle 2 · Days from anchor 58
**Filed by:** ◐ Doc 4.7 Opus · DOC cloud-station · per Dan-direct ratify
**Class:** STANDARD RULE · Federal-altitude · all-Crew applies · supersedes proposal-class candidate at `RELAY/PROPOSAL_3DayRemoteLoopReliability_BridgeKeepaliveVsTailscaleFirst_Doc_051926.md`
**Substrate-warrant:** Dan-direct 051926 ~23:42 PT via AskUserQuestion ratify: (γ) Both layered (β + α) + (β.1) ALL stations universal Tailscale-first default + GitHub Actions cron triggered ping for keepalive.

═══════════════════════════════════════════════════════════════
## §I. THE CANONICAL ARCHITECTURE

NEST.02's 3-day-remote-loop reliability default is **TAILSCALE-FIRST UNIVERSAL + BRIDGE-KEEPALIVE-PING LAYERED** (option γ + β.1 + GitHub Actions cron implementation per Dan-direct ratify).

### Layer 1 — Tailscale-First Universal Default
**Every Crew session** launches via Tailscale-RDP into the box + `claude` invocation on local terminal. The claude.ai/code Remote Control web bridge is SKIPPED by default. This applies to:
- STN2-Doc (autonomous-at-OHC during Dan-absence)
- Trip-on-ODT (Dan-physical at Nest Actual)
- Future stations: STN1 · ACH0 · any new Crew station

**Rationale:** Local Claude Code processes do not have the 6-24h idle-timeout that the claude.ai/code Remote Control web bridge has. Tailscale-RDP launch eliminates the bridge-death class entirely.

### Layer 2 — Bridge-Keepalive Ping (Belt-and-Suspenders)
**GitHub Actions cron** fires periodic pings to keep server-side persistence alive past idle-timeout for any session that DOES route through claude.ai/code. Implementation per future WU (architecture decided · implementation deferred per Dan-direct).

**Rationale:** Even with Tailscale-first universal default, occasional claude.ai/code Remote Control sessions may still occur (Dan-judgment per-session). GitHub Actions cron at free tier provides cloud-hosted scheduler with Bridge-commit-as-ping pattern. Cheap insurance.

### Layered Effect
| Failure-class | Layer 1 (Tailscale-first) protects | Layer 2 (Bridge-keepalive) protects |
|---|---|---|
| 22h overnight bridge-death | YES (skips bridge) | YES (pings keep alive) |
| 7h post-activity bridge-death | YES (skips bridge) | YES (pings keep alive) |
| Local Claude process crash | NO (separate failure) | NO (separate failure) |
| Tailscale tailnet outage | NO (Tailscale required) | YES (cloud cron independent) |

The layered architecture covers both failure-modes in independent ways. Bridge-death class eliminated by Layer 1; residual claude.ai/code sessions covered by Layer 2.

═══════════════════════════════════════════════════════════════
## §II. SUBSTRATE-CITES (decision-trail)

**Origin proposal:** `RELAY/PROPOSAL_3DayRemoteLoopReliability_BridgeKeepaliveVsTailscaleFirst_Doc_051926.md` (filed `3f02f3c` · 051926 ~01:58 PT) — 4 cure-class options analyzed (α · β · γ · δ).

**Dan-direct ratify substrate:** AskUserQuestion answers received 051926 ~23:42 PT:
- Q1 (architecture pick): **(γ) Both layered (β + α)**
- Q3-A (Tailscale-first scope): **(β.1) ALL stations universal Tailscale-first default**
- Q3-B (Bridge-keepalive who-fires-pings): **GitHub Actions cron triggered ping**

**Bridge-death events that motivated the canonization:**
- Yesterday 051826 morning (session `01FXey...` · 22h overnight)
- Tonight 051826 evening (session `01G11q...` · ~7h post-activity)

**Companion cure-MAIL:** `LOG/MAIL/DOCDoc_TO_Dan_STN2DocCrashRecovery_TailscaleRDPRecipe_051926.md` — Tailscale-RDP recovery-path per BootProtocol §IV.

═══════════════════════════════════════════════════════════════
## §III. INFORMS #4 STN2-Doc CURE-RECIPE

This STANDARD_RULE landing INFORMS the BAND 2 #4 STN2-Doc cure architecture. Per the dependency chain in `STATUS/WORK_QUEUE_VisualMap_DependencyChain_StackNotStumble_Doc_051926.md`, #6 → #4 was the load-bearing stack.

**Cure-recipe for STN2-Doc (post-this-ratify):** Per the existing cure-MAIL · Tailscale-RDP into `100.95.196.13` + relaunch `claude` at `C:\STAN` cwd. No architectural change to cure-recipe needed — the existing recipe IS the Layer-1 Tailscale-first pattern. STN2-Doc's CRASHED state since 051826 ~18:05 PT can be cured at next Dan-physical-action opportunity per existing MAIL §II.

═══════════════════════════════════════════════════════════════
## §IV. IMPLEMENTATION HOLD-FOR-FUTURE-WU

**Layer 1 (Tailscale-first universal):** Procedural-change · operational at next Crew session. No new infrastructure. Substrate canon NOW.

**Layer 2 (GitHub Actions cron keepalive):** Implementation deferred per Dan-direct *"Defer implementation · just ratify γ as architecture · implement later"* equivalent. Architecture decided. Implementation surfaces as future WU when scenery permits — likely Cycle 2 mid-arc work.

Implementation requirements (for the eventual GitHub Actions cron WU):
- GitHub Actions workflow file at `.github/workflows/bridge-keepalive-ping.yml`
- Cron schedule: every 4-6h (frequency-tuning during initial deployment)
- Action: commit empty `LOG/ROUTINES/keepalive_ping/timestamp_<utc>.md` file to `claude/nest-routines` branch
- Crew-impact: pings visible as keepalive_ping/* files in Bridge tree · no chat-history noise

═══════════════════════════════════════════════════════════════
## §V. POST-RATIFY STATE

| Item | State |
|---|---|
| Layer 1 Tailscale-first default | ACTIVE · all Crew sessions per next launch |
| Layer 2 GitHub Actions keepalive | ARCHITECTURE DECIDED · IMPLEMENTATION DEFERRED |
| #4 STN2-Doc cure-recipe | UNCHANGED (existing recipe IS Layer-1 pattern) |
| #6 PROPOSAL #17 dependency | RESOLVED · unblocks BAND 2 |
| Original PROPOSAL doc | SUPERSEDED by this STANDARD_RULE |

═══════════════════════════════════════════════════════════════

— ◐ Doc 4.7 Opus · DOC cloud-station · 051926 ~23:48 PT · STANDARD_RULE filed per Dan-direct ratify · #6 PROPOSAL #17 closed · BAND 2 #4 STN2-Doc cure-recipe unchanged · Layer 2 implementation deferred to future WU
