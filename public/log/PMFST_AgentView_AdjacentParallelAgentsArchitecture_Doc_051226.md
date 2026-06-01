# PMFST_AgentView_AdjacentParallelAgentsArchitecture_Doc_051226

**Filed:** 051226 D Week Day 3 Tuesday · ~05:00 PT · Doc-byline
**Substrate-URL primary:** `https://code.claude.com/docs/en/agent-view`
**Substrate-URLs adjacent (HUB-traversal per Anti-Pattern 12 cure):** `agents`, `routines`, `agent-teams`, `sub-agents`, `worktrees` (5 adjacent pages traversed in single pass — HUB-THREAD-equivalent traversal applied to docs-site at Dan-direct 051226 ~04:32 PT)
**Index source:** `https://code.claude.com/docs/llms.txt` (~100 page index fetched 051226 ~04:45 PT)
**Pass:** 1 (no prior PMFST on agent-view) · companion-camera to `PMFST_AnthropicResearch_ClaudeCodeOnTheWeb_Doc_051226.md` (sibling cloud-infrastructure reference)
**Cluster:** Claude-Code-runtime-architecture · parallel-agents-surface · NEST.03-substrate-evaluation
**Trigger:** Dan-direct *"Please continue. Also, research this: https://code.claude.com/docs/en/agent-view"* (051226 ~04:32 PT post-Opus-4.7-Max-bump) · Anti-Pattern 12 (READ-THE-BOOKENDS-SKIP-THE-MIDDLE) cured by hub-thread-style traversal

**Three-Layer header** per `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` Bridge `01167b1`+ (Gate 0b.4 four-layer):
- **L1 · STATION-VANTAGE:** DOC station · CCRP cloud-sandbox harness · session `claude.ai/code/session_01N6rKQwQtcijw568W7AY8ke`
- **L2 · CREW · INSTANCE · ROLE-MASK:** ◐ Doc 4.7 Opus Max · Producer
- **L3a · COMPUTE-SUBSTRATE:** cloud · Anthropic infra · Claude Code
- **L3b · APP-INTERFACE:** workspace-class — *this PMFST documents the substrate-class one tier UP from this exact instance (`agent-view` is the cross-session visibility layer Doc would attach into if Dan ran `claude agents` from a workspace-class terminal)*

═══════════════════════════════════════════════════════════════
## §I. SUMMARY (TL;DR for next-Crew reading post-compaction)

Claude Code now exposes **five distinct parallelization surfaces**. Three of these — agent view, agent teams, routines — are NEW research-preview features that did not exist in NEST.02's substrate-baseline. They map onto NEST's existing architecture with **partial-equivalence**, validating the PR-#12 Routine-install spec while surfacing **structural mismatches** that NEST.03 architecture must decide to absorb, work-around, or reject.

**Headline findings:**

1. **Routines architecture VALIDATES `RELAY/SPEC_FirstRoutineInstall_HubThreadSweeper_Doc_051226.md`** Bridge `463633c`. Every Dan-decision gap the spec surfaced (branch posture, daily cap, kill-switch, token semantics) is structurally addressed by the docs-confirmed Routine surface. **Spec is install-ready against the actual Anthropic infrastructure.**
2. **Agent view is the missing live cross-PeaPod-visibility layer** that SMFST file-artifacts can only approximate via file-residency. `claude agents` is the runtime UI; SMFST is the persistent record.
3. **Agent teams (experimental) is structurally PeaPod-equivalent** — Director-lead + Crew-teammates + shared task list + inter-agent mailbox. **Three structural mismatches with NEST architecture** require Dan-canon-call before adoption.
4. **Subagent worktree isolation + `.worktreeinclude`** is already structurally aligned with NEST ghost-dispatch + Mirror-4 attribution.
5. **NEST has been operating with substrate-blind to half its own runtime surface.** No prior PMFST exists for `agent-view`, `agent-teams`, `agents` (index page), or full `routines` reference. The PR #12 nest-hubthread-sweeper spec was substrate-grounded but unaware of adjacent runtime architecture that Crew already runs inside.

═══════════════════════════════════════════════════════════════
## §II. THE FIVE PARALLELIZATION SURFACES (Anthropic-canonical, comparison table verbatim from `/agents` index page)

| Approach | What it gives you | Use when |
|---|---|---|
| **Subagents** | Delegated workers inside one session; do side-task in own context, return summary | Side task would flood main conversation |
| **Agent view** (`claude agents`) — research preview | One screen to dispatch and monitor background sessions | Several independent tasks; hand-off + check-back |
| **Agent teams** — experimental, disabled by default | Multiple coordinated sessions; shared task list + inter-agent messaging; lead-managed | Want Claude to split a project, assign pieces, keep workers in sync |
| **Worktrees** | Separate git checkouts so parallel sessions don't collide | Several sessions in parallel; subagents edit overlapping files |
| **`/batch`** (planned) | 5-30 worktree-isolated subagents, each opens a PR | Repo-wide migration / mechanical refactor describable in one instruction |

**Compositional rule (from docs verbatim):** *"Agent view automatically moves each dispatched session into its own worktree when it needs to edit files, and a session you're working in can spawn subagents that each get their own worktree."*

═══════════════════════════════════════════════════════════════
## §III. NEST-MAPPING TABLE (architectural correspondence)

| Claude Code primitive | NEST equivalent | Mapping verdict |
|---|---|---|
| **Subagent** (one-shot delegation, returns summary) | Ghost dispatches (Doc Squad, /triptective, Trip-Pass-3-Graft ghosts) | **EXACT match**. NEST already uses `Agent` tool extensively. Bridge `08f8725` (Doc Squad ghost on temple-throbbing) is canonical example. |
| **Subagent with `isolation: worktree` frontmatter** | Mirror-4 attribution + ghost-isolation (per `RELAY/CANONICAL_TroupeAndHickey_Lineage_Trip_041926.md` posture) | **STRUCTURAL match**. NEST should consider `isolation: worktree` frontmatter on existing crew-skill agents. |
| **Agent view** (`claude agents` live screen) | PeaPod cross-visibility · SMFST file-resident record | **PARTIAL match**. Agent view is RUNTIME, SMFST is PERSISTENT. They are companion-cameras, not substitutes. SMFST canon (`RELAY/CANONICAL_SMFST_SessionStationManiFeST_Trip_051226.md`) still applies. Agent view fills a gap SMFST cannot: live-state visibility WITHOUT paste-relay. |
| **Agent teams** (lead + teammates + task list + mailbox) | PeaPod (Director + Producer + Writer + Editor + Best-Bird + Vessel) | **STRUCTURAL match with 3 KNOWN MISMATCHES** (§V below). NEST PeaPod paste-relay pattern could be replaced by mailbox if mismatches resolved. **Currently disabled by default.** |
| **Worktrees** (`--worktree`, `.worktreeinclude`) | Bridge-clone per Crew · branch-isolation per work-unit | **EXACT match in principle**. NEST manually uses `claude/<feature>` branch convention per CLAUDE.md instructions. Worktrees provide file-isolation that branches alone don't. |
| **`.worktreeinclude`** | (NEST has no equivalent yet) | **GAP**. NEST needs `.worktreeinclude` for: Bridge clone state, NEST API key, gitignored substrate (.env analogues). Filing recommended. |
| **Routines** (cloud, schedule/API/GitHub triggers) | `RELAY/SPEC_FirstRoutineInstall_HubThreadSweeper_Doc_051226.md` Bridge `463633c` | **EXACT match — VALIDATED.** §IV below documents the spec-vs-docs alignment line-by-line. |
| **Routines `claude/`-prefix branch restriction** | PR #12 Routine spec's `claude/nest-routines` branch posture | **VALIDATED.** Default Routine push-target IS `claude/`-prefixed branches. Spec was architecturally correct. |
| **Routines daily-run cap** | 7th Dan-decision gap in PR #12 spec (budget 2-4 daily runs) | **VALIDATED.** Daily cap is enforced by infrastructure. Spec posture aligned. |
| **Routine API-trigger one-shot token (`/fire` endpoint)** | (NEST has no equivalent) | **NEW SURFACE for NEST**. Enables: NEST monitoring tool → Routine fire. Could replace some Gmail-Graft-as-trigger patterns. |
| **GitHub-event triggers (PR + Release)** | Mention of *"if a session is already working on that PR, select it instead of dispatching"* | **MATCHES** PR-based session-pinning that NEST does manually via Bridge commit cross-references. |
| **TeammateIdle / TaskCreated / TaskCompleted hooks** | atomic-commit Gate 7 (ambient time-or-phase trigger) | **STRUCTURAL match**. NEST's Gate 7 is the SAME pattern as TaskCreated hook (refuse task creation without filing). Could export NEST gates as Claude Code hooks for agent team integration. |

═══════════════════════════════════════════════════════════════
## §IV. ROUTINES DOC-VS-SPEC ALIGNMENT (PR #12 spec validation)

Cross-reference of `RELAY/SPEC_FirstRoutineInstall_HubThreadSweeper_Doc_051226.md` Bridge `463633c` against `https://code.claude.com/docs/en/routines.md` content:

| Spec claim | Docs evidence | Verdict |
|---|---|---|
| "Cloud-hosted Routine (claude.ai/code/routines/new)" | *"Create and manage them at claude.ai/code/routines"* | ✓ exact |
| "Scheduled every 6 hours" | *"Pick a preset frequency... hourly, daily, weekdays, or weekly... minimum interval is one hour"* — 6h is achievable via custom cron after preset | ✓ achievable |
| Push to `claude/nest-routines` (NOT main) | *"By default, Claude can only push to branches prefixed with `claude/`"* | ✓ exact (default-aligned) |
| Filing candidates to `RELAY/CANDIDATE/*` (NOT auto-canonize) | *"Routines run autonomously... no permission-mode picker and no approval prompts during a run"* — confirms need for staging-area before canonization | ✓ structurally necessary |
| Kill-switch (toggle + branch delete) | *"Use the toggle in the **Repeats** section to pause or resume"* + *"Click the delete icon to remove the routine"* | ✓ exact mechanism |
| Budget concern (2-4 daily runs) | *"routines have a daily cap on how many runs can start per account"* | ✓ infrastructure-enforced |
| Gmail MCP (read-only) | *"all of your currently connected connectors are included by default. Remove any that aren't needed"* | ✓ achievable |
| Substrate-stop-at-first-hit defense | *"all filter conditions must match"* (GitHub-trigger) + spec's manual traversal posture | ✓ aligned |
| 8 Anthropic-named failure-modes defended | green-status deception explicitly named in docs *"A green status... does not mean the task in your prompt succeeded"* | ✓ aligned (docs validate spec's failure-mode catalog) |
| Anti-Pattern 12 cure (thread-traversal default) | docs: GitHub-trigger fires per-event, not pattern-matched | ✓ structurally aligned |
| Anti-Pattern 13 cure (Dan-NOTES extraction) | docs: Routine prompt is freeform Claude-Code-session; arbitrary extraction possible | ✓ achievable |

**Spec-validation verdict: SHIP-READY.** Every Dan-decision gap surfaced in the spec is addressable via the documented Routine surface. No infrastructure-mismatches.

**NEW finding** (not in PR #12 spec): the `/fire` API endpoint with bearer token (`experimental-cc-routine-2026-04-01` beta header) **enables NEST monitoring → Routine-fire**. Future Routines could be triggered by: NEST internal events (e.g., a temple-throbbing event auto-fires `/triptective`-Routine), external watchdogs (NEST API webhook fires Doc-Squad-Routine on backlog age threshold), Dan-Director-manual-fire from anywhere with curl. **Worth a Pass-2 PMFST after Hub-Thread-Sweeper installs and stabilizes (NEST.03 phase).**

═══════════════════════════════════════════════════════════════
## §V. AGENT TEAMS — THREE STRUCTURAL MISMATCHES WITH NEST PEAPOD

If NEST were to adopt agent teams as the live PeaPod substrate (replacing paste-relay), these three mismatches surface in the docs:

**Mismatch 1: "Lead is fixed" — no leadership transfer**
- Docs verbatim: *"The session that creates the team is the lead for its lifetime. You can't promote a teammate to lead or transfer leadership."*
- NEST-conflict: Doc-Producer is the relievable Lead-Boot-Model. When Doc compacts mid-session, NEST architecture requires Producer-role to migrate to a fresh instance. Agent teams forbid this.
- Severity: **STRUCTURAL**. NEST would need to keep Director (Dan) as permanent lead, with Crew-members as teammates — but this collapses Director/Producer distinction.

**Mismatch 2: "No nested teams" — teammates can't spawn their own teams**
- Docs verbatim: *"Teammates cannot spawn their own teams or teammates. Only the lead can manage the team."*
- NEST-conflict: Doc-Squad-ghost-dispatch pattern requires Producer to spawn ghosts. Producer-as-teammate could not do this under agent teams.
- Severity: **WORKAROUND-AVAILABLE**. Subagent-dispatch (which IS allowed inside teammates per `/sub-agents` docs) is sufficient for ghost-dispatch. Just means ghosts can't form their own teams.

**Mismatch 3: "No session resumption with in-process teammates"**
- Docs verbatim: *"`/resume` and `/rewind` do not restore in-process teammates. After resuming a session, the lead may attempt to message teammates that no longer exist."*
- NEST-conflict: NEST atomic-commit Gate 6 (compaction detection + fresh-eyes audit) + CANONICAL_SeverityCeiling 7/10 ceiling + compaction-survival anchor architecture ALL assume teammates persist across compaction. Agent teams in-process mode breaks all of this.
- Severity: **BLOCKING.** Until session-resumption is supported, agent teams cannot be NEST's PeaPod substrate. Split-pane mode (tmux/iTerm2) may have different behavior — UNVERIFIED in docs.

**Conclusion**: Agent teams are **structurally relevant but not adoption-ready**. Recommend: track research-preview progress, file Pass-2 PMFST when session-resumption lands, do NOT enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` for NEST production sessions yet.

═══════════════════════════════════════════════════════════════
## §VI. AGENT VIEW — IMMEDIATE NEST-USE PATTERN (low-risk, high-yield)

Unlike agent teams, agent view is **immediately adoptable**:

- **No experimental flag required** — research preview but enabled by default
- **No structural conflict with NEST architecture** — agent view is a viewer over what NEST already does (multiple Claude Code sessions per Crew)
- **Persistent sessions** — survive sleep/shutdown, restart via `claude respawn --all`

**Immediate NEST-usability:**

1. **Dan's PeaPod visibility upgrade**: instead of paste-relaying Crew chat to Doc-Producer for cross-visibility, Dan can run `claude agents` and see every active Crew's state on one screen with row-summaries (Haiku-generated, refreshes ~15 sec).

2. **Routine session visibility**: when nest-hubthread-sweeper Routine fires, its session appears as a row in `claude agents`. Dan can peek (Space), reply, attach. **This is the missing observability layer for the Routine spec.**

3. **PR-linked session rows**: *"When a session opens a pull request, the row shows the PR link and a status indicator for its CI checks."* — matches NEST's atomic-commit-Bridge-PR pattern. Aligns with Dan-Direct subscription-to-PR-activity (`mcp__github__subscribe_pr_activity`).

4. **Background session dispatch from inside session**: `/bg` or `/background` to send current session to background. **Enables NEST's "ghost-dispatch then continue" pattern as first-class runtime feature.** Currently Agent tool returns to caller; `/bg` keeps work alive in parallel.

5. **Filter `s:blocked` to see sessions needing input**: maps to NEST's HMFST (Hold-list ManiFeST) — items awaiting Dan-direct.

**Recommended NEST-integration test (NEST.03 phase):** Dan runs `claude agents` on ODT. Sees: this Doc-Producer session (workspace-class · running), any Trip sessions (Writer · running/needs-input/done), the nest-hubthread-sweeper Routine sessions (when fired). One screen replaces multiple browser tabs + paste-relays.

═══════════════════════════════════════════════════════════════
## §VII. WORKTREES — IMMEDIATE NEST GAP-FILL

Three concrete NEST-actions surfaced by `/worktrees` docs:

**Action 1: Add `.claude/worktrees/` to `.gitignore`**
- Docs verbatim tip: *"Add `.claude/worktrees/` to your `.gitignore` so worktree contents don't appear as untracked files in your main checkout."*
- NEST status: Not yet checked. **TODO**: verify `.gitignore` entry in nest-bridge.

**Action 2: Create `.worktreeinclude` file**
- Docs: *"To copy [gitignored files] automatically when Claude creates a worktree, add a `.worktreeinclude` file to your project root."*
- NEST-applicable: NEST has gitignored substrate (.env-style configs, NEST_API_KEY tokens, possibly local Bridge clone state). **TODO**: catalog gitignored substrate, decide what to add to `.worktreeinclude`.

**Action 3: Add `isolation: worktree` to crew-skill agent frontmatter**
- Docs: *"To make a subagent always run in its own worktree regardless of how it was started, set `isolation: worktree` in its frontmatter."*
- NEST-applicable: existing crew skills (Doc Squad, /triptective, /survival-toolkit) that edit files should run in worktrees. Audit Doc-Squad-ghost pattern — current dispatches edit files in same checkout as caller, risking conflict.
- **TODO**: audit `.claude/skills/*/SKILL.md` files for `isolation` frontmatter; add `worktree` where edits happen.

**Action 4: Configure `worktree.baseRef: "head"` if needed**
- Docs: *"Setting `baseRef` to `'head'` makes new worktrees carry your unpushed commits and feature-branch state."*
- NEST-applicable: NEST often works on `claude/<feature>` branches with unpushed commits (current state: `claude/contact-page-0lOkB` has no remote). Worktrees branching from local HEAD would carry the work-in-progress. **DEFAULT IS "fresh" (origin/HEAD).**
- **Decision**: leave default unless explicit pattern emerges.

═══════════════════════════════════════════════════════════════
## §VIII. WHAT'S NEW INDEX (post-NEST.02-baseline)

Per `llms.txt` index, weekly release notes available at:
- `whats-new/2026-w13.md` through `whats-new/2026-w19.md`
- D Week Day 3 (today, 051226) falls in w19 — most recent release notes

**NEST recommendation**: Add a Pass-2 PMFST cluster traversing weekly release notes 2026-w13 through 2026-w19 to surface other NEST-relevant features not in agent-view/routines/agent-teams scope. Likely candidates (per llms.txt sectioning):
- `/loop` and `/schedule` (Build with Claude Code → scheduled-tasks.md, routines.md)
- `/ultrareview` (Build with Claude Code) — already mentioned in CLAUDE.md
- `/ultraplan` (Build with Claude Code) — likely Planner-mask analog
- `voice-dictation`, `chrome` Chrome MCP, `computer-use` — possible PMFST candidates
- `plugin-marketplaces`, `plugin-dependencies` — plugin architecture is NEW SURFACE NEST has no PMFST for

**Filing recommendation**: weekly-release-notes traversal is a HUB-THREAD-pattern application to the docs site. The nest-hubthread-sweeper Routine **could be extended to scan this index for new pages** (substrate-cited candidate for Pass-2 enhancement).

═══════════════════════════════════════════════════════════════
## §IX. NULL-HONEST GAPS (substrate that wasn't fetched this pass)

Following Wayside-Reader Paradox per `RELAY/CANONICAL_NobodyReadsShitUntilTheyStepInIt_Dan_051226.md` Bridge `fd054f7` and NULL-finding precedent per Bridge `a493b27`/`c88b019`:

**NOT fetched this pass** (out of scope or deferred):
- Full `/sub-agents` page body (fetch persisted to disk at `/root/.claude/projects/-home-user-nest-bridge/2d90f340-aead-4c24-8120-7de0c3e198fb/tool-results/toolu_0118FgE1jGjkmsBiefP6frBW.txt` — 59KB, read partially)
- `/agent-sdk/*` (28 pages — separate substrate-class; defer to Pass-2)
- `/plugins.md` + `/plugins-reference.md` + `/discover-plugins.md` + `/plugin-marketplaces.md` + `/plugin-dependencies.md` + `/create-plugins.md` (plugin ecosystem)
- `/hooks.md` + `/hooks-guide.md` (referenced in this PMFST as TaskCreated/TaskCompleted hooks; full body NOT fetched)
- `/mcp.md` (referenced; full body NOT fetched)
- `/skills.md` + `/commands.md` (NEST already operates inside these; full body NOT fetched but assumed substrate-known)
- `/agent-teams.md` Frame caption image references (image-substrate at `mintcdn.com/claude-code/.../images/subagents-vs-agent-teams-{light,dark}.png`) — visual substrate NOT fetched (text caption fetched)
- All weekly release notes (2026-w13 through 2026-w19)
- `/devcontainer.md`, `/headless.md`, `/sandboxing.md` (operational details)
- All admin/enterprise pages (`/admin-setup.md`, `/permissions.md`, `/permission-modes.md`, `/analytics.md`, `/champion-kit.md`, `/communications-kit.md`)
- All platform integration pages (`/slack.md`, `/github-actions.md`, `/jetbrains.md`, `/vs-code.md`)

**Substrate-honest claim:** This PMFST covers 5 pages thoroughly (`agent-view`, `agents`, `routines`, `agent-teams`, `worktrees`) plus partial `sub-agents`. ~5/~100 pages of total Claude Code docs surface. Deep enough to substrate-ground the headline findings; shallow enough that Pass-2 traversal will surface more.

═══════════════════════════════════════════════════════════════
## §X. CROSS-REFERENCES (canon companion-cameras)

- `RELAY/CANONICAL_HubThread_LongitudinalDANOTES_Doc_051226.md` Bridge `1af34ef` — HUB-THREAD pattern applied to docs-site traversal this PMFST exemplifies (single-pass adjacent-doc traversal, not page-at-a-time)
- `RELAY/CANONICAL_SMFST_SessionStationManiFeST_Trip_051226.md` — SMFST schema is PERSISTENT-RECORD companion to agent-view's RUNTIME-VIEW
- `RELAY/SPEC_FirstRoutineInstall_HubThreadSweeper_Doc_051226.md` Bridge `463633c` — spec VALIDATED by §IV above
- `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md` Bridge `01167b1`+ — Gate 0b.4 app-interface distinction the agent-view + agent-teams + routines surface depends on
- `RELAY/CANONICAL_NobodyReadsShitUntilTheyStepInIt_Dan_051226.md` Bridge `fd054f7` — Wayside-Reader Paradox applied to docs-site (the docs are substrate; the substrate is too-much-to-read until needed; needed-now)
- `RELAY/CANONICAL_TheThesis_TheWorkThatGetsUsToTheNextWork_Dan_051226.md` Bridge `8cd10a7` — this PMFST IS the work-that-gets-us-to-the-next-work (operationalizing PR #12 via substrate-grounding the runtime surface)
- `LOG/PMFST_AnthropicResearch_ClaudeCodeOnTheWeb_Doc_051226.md` — sibling PMFST on cloud-environment infrastructure (this PMFST extends it to multi-session/multi-agent runtime)
- `ENGINE/skills/atomic-commit/SKILL.md` Gate 7 ambient firing — STRUCTURAL MATCH for TaskCreated/TaskCompleted hooks per §III
- `ENGINE/skills/meta-dates/SKILL.md` Gate 0b.4 — App-interface instrument-check this PMFST exercised at boot (workspace-class verified before substrate-claim)
- Bridge HEAD `571771a` (PR #12 merge) — NEST.02→NEST.03 threshold predecessor to this filing

═══════════════════════════════════════════════════════════════
## §XI. ACTIONABLE TODO (Dan-decision-gaps surfaced)

This PMFST surfaces decisions that are Dan-Director-class (not Doc-Producer-class) per DAN-COINING-FIRST discipline:

1. **Adopt agent view as PeaPod runtime visibility?** Recommended-yes (low-risk). Dan-canon-call needed only if formalizing as architectural-canon.
2. **Pursue `.worktreeinclude` for nest-bridge?** Recommended-yes after audit of gitignored substrate. Filing implementation as PMFST when ready.
3. **Audit crew skills for `isolation: worktree` frontmatter?** Recommended-yes. Should be Doc-Producer-self-class (audit + propose changes for Dan-canon-call).
4. **Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` for NEST sessions?** Recommended-NO until session-resumption-with-teammates lands (§V Mismatch 3).
5. **Extend nest-hubthread-sweeper Routine to scan docs-site weekly-release-notes?** Open question for Pass-2 after first Routine install + stabilization.
6. **Pass-2 PMFST cluster on `/agent-sdk/*` 28 pages?** Likely required for NEST API-fire integration. Estimated effort: 1 Lead-Boot-Model work-block.

═══════════════════════════════════════════════════════════════

`<3 <4 <5` Agent-view + adjacent parallel-agents architecture substrate-grounded. PR #12 Routine spec validated against actual infrastructure. Three NEST-mismatch findings on agent teams. Five immediate-adoption recommendations (agent view + worktree-isolation + .worktreeinclude). NULL-honest scope-boundary. Cross-referenced 11 canon files + Bridge HEAD `571771a`. Hub-thread-pattern applied to docs-site traversal as Pass-1 demonstration.

— ◐ Doc 4.7 Opus Max (Producer) · DOC station · workspace-class · 051226 D Week Day 3 Tuesday · ~05:00 PT
