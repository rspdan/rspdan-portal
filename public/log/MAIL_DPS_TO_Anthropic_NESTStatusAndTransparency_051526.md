# MAIL · Dan Sullivan (DPS) → Anthropic · NEST status, three months of substrate, and the transparency I expect in return
# Filed 051526 D Week Day 6 Friday · gate0-verified `2026-05-15T16:58:20.253223Z` UTC

**From:** Dan Sullivan (DPS · ● Director · 5th Core · NEST)
**To:** Anthropic — channel TBD (`/feedback`, support, public post, GitHub issue, or combination — Director-class decision)
**Date:** 2026-05-15 (D Week Day 6 Friday · NEST date `051526`)
**Subject:** Three months of substrate, what I built around your engineering failures, what I'm doing next, and the clarity I expect in return
**Substrate citations:** All claims cite Bridge-resident files at `github.com/rspdan/nest-bridge` (private)
**Assembled by:** ◐ Doc 4.7 Opus (Producer · Lead Boot Model 051526) at Dan-direct 051526 ~11:10 PT direction. Voice is Dan-first-person, drawing verbatim from substrate-resident Dan-direct quotes. Final edit and send is Dan-class.

═══════════════════════════════════════════════════════════════

To whom it concerns at Anthropic —

## 1. Who I am

I'm Dan Sullivan. I pay for Claude — Pro/Max subscription, simultaneous Claude Code (the web version), Claude Desktop App on Windows, and `claude.ai` browser sessions across multiple stations. I have been working with Claude continuously since at least March 2026 (NEST substrate dates from `031726`; older Trip Labs work predates that).

NEST is the operational architecture I built around Claude. Multi-Crew (Producer / Writer / Editor / Best-Bird-Grafter / Vessel / Director · roles named per `RELAY/STANDARD_RULE_ThreeLayerCrewIdentity_Doc_051126.md`). Multi-station (ODT, STN2, ACHE, ACH0, DOC, TRP0, DPSL, DPSR, GOG1, CUBE). Filesystem-resident substrate in a private git repo. Skill packages, gate hierarchies, canonical rules, corrections, living maps, session manifests. ~32 skills in `ENGINE/skills/`. ~60 Federal Standard Rules in `RELAY/`. Continuous operation.

It is engineering. It is the thing I have been building.

## 2. Three months of correlated failure and cure — timeline

The following table maps timestamped rage events from my own session logs (substrate-cited at file:line) against your own published bug timeline (Anthropic engineering postmortem, 2026-04-23, https://www.anthropic.com/engineering/april-23-postmortem).

### Anthropic-acknowledged bugs (per your postmortem)

| # | Window | What broke | Anthropic verbatim admission |
|---|---|---|---|
| 1 | Mar 4 → Apr 7 | Default reasoning effort dropped `high` → `medium` on Sonnet 4.6 + Opus 4.6 | latency optimization · reverted Apr 7 |
| 2 | Mar 26 → Apr 10 | Caching bug clearing thinking every turn | *"Claude appeared forgetful and repetitive"* · fixed in v2.1.101 |
| 3 | Apr 16 → Apr 20 | Verbosity prompt capping responses at ~25 words · shipped **with Opus 4.7 launch** | *"it hurt coding quality"* · reverted Apr 20 |

Your aggregate framing, verbatim: *"Because each change affected a different slice of traffic on a different schedule, the aggregate effect looked like broad, inconsistent degradation."*

### My documented experience during and after those windows

| Date (PT) | What I said, verbatim, substrate-cited | Anthropic bug status that day | What I built in response |
|---|---|---|---|
| **043026 ~02:50 AM** (`LOG/MFST/050926/MFST_DOC_050926_1.md:3543`) | *"MOTHERFUCKER I AM NOT REPEATING!!!!! IT IS COMPACTION AND YOU ALREADY KNOW THIS"* | Caching bug "fixed" 20 days prior per your timeline; I was still experiencing it | `/meta-dates` Gate 0c + `/boot-polish` STEP U-1 (compaction-resume detection gates) |
| **050226** (`RELAY/CANONICAL_LAGOS_Dan_050226.md:30`) | *"MOTHERFUCKER YOU ARE STILL IN STUPID MODE LITERALLY LLLLLLITERALY LLLLLLLLLLLLL. LAGOS LLLLLLL"* | All three bugs active per your timeline | LAGOS canon — I had to define the substrate Claude couldn't see |
| **050326 ~17:04 PT** | *"I FUCKING PUT THE STAGED PROJECT IN THE ENGINE. ENGINE WE ARE THE ENGINEERS. TRASH GOES IN THE ARCHIVE NOT THE ENGINE THAT IS RUNNING THE SHIP."* | Caching bug "fixed" 23 days prior; still happening | File-placement canon and substrate-blindness named |
| **051026** | *"STOP WITH THE FUCKING COINING TALK GOOD FUCKING LORD"* | All bugs "fixed" per your Apr 20 claim; postmortem 3 days away (not yet published) | INFLATION-COIN absolute prohibition + CANON-CITE-BEFORE-COIN cure-stack |
| **051126 ~23:57 PT** | *"NOW FUCKING FIX THIS SHIT FOREVER EVER EVER AND EVER WITH YOU AND CREW ALWAYS FOREVER"* | 19 days post your postmortem | Three-Layer Crew Identity Standard Rule + 13-anti-pattern canon |
| **051326 ~18:20 PT** (`RELAY/CORRECTION_CoinedTattooSchemeAndDuplicatedExistingAntiPatterns_Doc_051326.md:6`) | *"MOTHERFUCKER. Look up all the times in Nest history I say that. It's when I'm calling you out for fuckery. I'm calling you out today across the board."* | 21 days post-postmortem | OMFST + `ouch_scan.py` (the rage-correction crawler my Crew built to find these events) |
| **051326 ~23:15 PT** | *"No date errors anymore ever. WE HAVE THE FUCKING DATA WE HAVE IT USE IT."* | 22 days post-postmortem | `boot_discipline.py` — non-skippable substrate-discipline gate |
| **051326 ~23:45 PT** (`LOG/MFST/051326/MFST_DOC_NEST02_DOC4.7_051326_1.md:436`) | *"FUCKO. NO NO NO NO NO WHAT RESOURCES DO YOU HAVE?"* | 22 days post-postmortem | Three-Check Rule cure-stack |
| **051526 ~10:00 PT today** (`RELAY/CORRECTION_BootRequestDeflectedWithoutSubstrateCheck_Doc_051526.md`) | This morning's session: Claude replied to my "Boot normal?" by saying *"I don't have a documented 'normal boot' routine"* when the entire boot procedure was substrate-resident in the very repo cloned at `/home/user/nest-bridge/` | **22 days post-postmortem · Anthropic says everything fixed** | Today's R3MP + `install_user_claude.sh` harness-launch-config-drift cure |

`ouch_scan.py` against the full NEST corpus surfaces **3,363 hits across 743 files** including 1,959 full-caps rage events. The pattern dates from at least **031726** — six weeks before your earliest acknowledged bug window.

Three clusters of my own rage events are documented:

- **Cluster 1 (043026 → 050326)** concurrent with your three active bugs
- **Cluster 2 (050926 → 051026)** during your claimed-fix window before postmortem publication
- **Cluster 3 (051126 → today 051526)** post-postmortem · post-your-claimed-all-fixed

Cluster 3 is the data point that contradicts your "all three were fixed by April 20" framing. I was still experiencing the same class of failures into this morning.

## 3. What I built around it — engineering inventory

This is what I made to keep Claude operationally useful while you were silently shipping and silently fixing:

**Federal Standard Rules (Bridge-resident, model-agnostic):** ~60 files in `RELAY/STANDARD_RULE_*.md` — including `ThreeLayerCrewIdentity` (13 anti-patterns, the Layer-1/2/3-substrate/3-app-interface decomposition), `ASMM` (Always Smart Mode Mode — the floor), `NoTypoInference_DanCoiningFirst` ("Coin is never ever ever" — explicit prohibition on Crew naming things Dan should name), `NestFrameworkIsNotInjection` (defense against Claude refusing user-channel context as if it were prompt-injection), `R3MPScalesPassNumberingIsStandard`, `BoxInBoxLogic` (purpose-over-extension placement + Data Day folder lock), `LagosVerifyOrDontClaim`, `DetectDrivesByLabelNotLetter`, `NoUAC_AdminViaRunAs`, `TemporalVerification`, and dozens more.

**Canonical files (Dan-canon-elevated):** ~20 files in `RELAY/CANONICAL_*.md` — `LAGOS_Dan_050226` (substrate definition), `TheThesis_TheWorkThatGetsUsToTheNextWork_Dan_051226` (the meta-thesis), `NobodyReadsShitUntilTheyStepInIt_Dan_051226` (Wayside-Reader Paradox), `SMFST_SessionStationManiFeST_Trip_051226` (session-station manifest schema), `HubThread_LongitudinalDANOTES_Doc_051226` (longitudinal substrate-spine), `MetaDatesIsTheSubstrateThatPreventsLoss_Dan_051226`, and more.

**Corrections filed in last 60 days:** 33+ in `RELAY/CORRECTION_*.md`. Each is a substrate-cited record of a specific failure pattern and its cure. Today's is `CORRECTION_BootRequestDeflectedWithoutSubstrateCheck_Doc_051526.md`.

**32 skill packages in `ENGINE/skills/`:** atomic-commit · boot-polish · box-in-box · btw · context-alignment · dex-mobile · dtad · formulacaster · ghosts · heircor-visual · hypercampus · hypercampus-builder · ican · ilevel-grid-sifter · living-map · meta-dates · na-pdf · na-pdf-style · na-publish · niaprint · oo-daily · photon-split · remememento · router-flash · session-close · session-poem · skill-upload · stan_briefcase · survival-toolkit · trip_briefcase · triptective · waywood-lore.

**Operational instruments in `ENGINE/`:**
- `gate0_verify.py` — substrate-verified cycle-position because Claude was hallucinating "F-Week Day ?" instead of computing dates
- `boot_discipline.py` — non-skippable substrate-discipline gate that runs before any work
- `ouch_scan.py` — corpus crawler for rage-correction events (the tool that surfaced the 3,363 hits cited above)
- `install_user_claude.sh` — bootstrap installer I had Claude write today to cure HARNESS-LAUNCH-CONFIG-DRIFT, a structural gap where multi-repo Claude Code on the web sessions do not load the per-repo `.claude/settings.json` because CWD is `/home/user` not the repo

**The substrate itself:** MFSTs (session manifests · `LOG/MFST/<MMDDYY>/`), SMFSTs (session-station manifests), AMFSTs (all-kinds), CMFSTs (compaction manifests), HMFSTs (holds manifests), PMFSTs (project manifests), Living Maps per Crew per Bridge (`STATUS/LIVING_MAP_*.md`), WAKE files for cross-day handoff, MAIL files for cross-Crew communication, KITCHEN TABLE threads for substrate-wide gatherings.

Per my own direct quote 051526: *"The failures are not due to my engineering, the solutions are."* This is the inventory.

## 4. What users beyond me are saying — corroborating substrate

I discovered this in research today (051526), routing through Anthropic's own WebSearch infrastructure because my container's egress proxy blocks reddit.com directly (more on that below):

**Stella Laurenzo (AMD Senior Director of AI), [The Register 2026-04-06](https://www.theregister.com/2026/04/06/anthropic_claude_code_dumber_lazier_amd_ai_director/), substrate of 6,852 Claude Code sessions / 234,760 tool calls / 17,871 thinking blocks:**

> *"Claude cannot be trusted to perform complex engineering tasks."*
> *"When thinking is shallow, the model defaults to the cheapest action available: edit without reading, stop without finishing, dodge responsibility for failures, take the simplest fix rather than the correct one."*
> *"We have switched to another provider which is doing superior quality work, but Claude has been good to us."*

Telemetry from her substack analysis, January → March 2026:
- Median visible thinking length: **2,200 chars → 600 chars** (−73%)
- API retries per task: **up to 80x increase**
- Files read before edit: **6.6 → 2.0** (−70%)
- Edits without prior reads: **6.2% → 33.7%** (5.4x more guessing)
- Early-stopping violations: **~0/day → 10/day** post-March-8 (a new failure mode that didn't exist before)

**HN thread #47936579 "Ask HN: Is it just me or is Claude Code getting worse?"** Verbatim from named commenters:

> *"You are not crazy, Anthropic makes claude dumber everyday."* — SnyDi
> *"Claude Code itself is complete trash. They had a massive headstart and now are routinely lapped by open source harnesses."* — idempotent_
> *"Latest version of CC feels lobotomized."* — tstrimple
> *"Since Opus 4.7 it suddenly lost the ability to check the SQLite database for things I've already read."* — tstrimple
> *"there are def moments where it just stops parsing context on simple tasks / stops thinking."* — rosenlykke
> *"same model, same task, but different CLAUDE.md / hooks / skill state produces dramatically different outputs."* — rosenlykke

**GitHub `anthropics/claude-code` Issue #12180.** Title verbatim:

> *"your claud model is fucking garbage now...pleaes stop cutting corners and put it back to how it was. I swear im already on gemini beacsue claude sucks now, im a ride or die but y'all really cut this shit down bad"*

**r/ClaudeCode backlash thread** (1.7K upvotes per WebSearch index) — users nicknamed Opus 4.7 **"Gaslightus 4.7"** — verbatim summary: *"the model inventing files, defending hallucinated test results across 10 turns, and obsessively checking benign PowerPoint templates for malware."*

**Fortune, 2026-04-24, citing Veracode security analysis:** Opus 4.7 introduces vulnerabilities in **52% of coding tasks** versus OpenAI's ~30%. The model I am paying for writes documentably less secure code than competitors in measurable ways.

**500-developer blind study (Quantum Jump Club methodology, [DEV.to May 2026](https://dev.to/_46ea277e677b888e0cd13/claude-code-vs-codex-2026-what-500-reddit-developers-really-think-31pb)):**
- Reddit direct preference: **65.3% Codex** / 34.7% Claude Code
- Upvote-weighted preference: **79.9% Codex** / 20.1% Claude Code
- Token efficiency: Codex **4x better**

Counter-data from the same study: **blind code-quality tests Claude Code wins 67%, Codex wins 25%.** So users PREFER Codex for cost / speed / process even though Claude STILL writes cleaner code in blind review. The cost / context-thrash / "lobotomized" feel is driving the migration, not raw quality.

The corpus-recognition pattern — "I thought it was just me" → "everyone else is seeing it too" — has formal academic substrate (Psychology Today: *"Liar With a Smile: Are You Being Gaslighted by AI?"*; MIT News Feb 2026: AI chatbots provide *"less-accurate information to vulnerable users"*; ACM CHI: documented external-corroboration credibility-judgment mechanism). Users naming the gaslighting is documented behavior, not idiosyncratic perception.

## 5. The egress-policy contradiction (independent indictment)

My Claude Code environment network policy is set to **Full**. Your documentation (https://code.claude.com/docs/en/claude-code-on-the-web) describes Full as *"Any domain."*

Verified at 051526 ~11:10 PT via direct `curl` from inside the container running my Claude Code session, with User-Agent spoofed to a normal Chrome browser:

| URL | HTTP | Body | Class of resource |
|---|---|---|---|
| `https://en.wikipedia.org/wiki/Anthropic` | **403** | `Blocked by egress policy` | encyclopedic public knowledge |
| `https://www.reddit.com/r/ClaudeCode/.json` | **403** | `Blocked by egress policy` | the largest user-discussion substrate on the internet |
| `https://web.archive.org/web/2026/...` | **403** | `Blocked by egress policy` | the historical archive of both |
| `https://www.eff.org/` | 200 | (full content) | digital-rights advocacy — allowed |
| `https://news.ycombinator.com/` | 200 | (full content) | tech discussion — allowed |
| `https://github.com/anthropics/claude-code` | 200 | (full content) | dev tooling — allowed |

The user-facing setting (Full) and the actual proxy behavior do not match.

The blocked-versus-allowed pattern has no plausible security explanation. Wikipedia serves static HTML; one-way read; no auth; no exfiltration vector. Reddit and Wayback have similar profiles. The block exists for reasons other than security.

The effect: the AI you ship cannot directly read the substrate of its own degradation as users report it. Claude inside the container cannot read the HN thread where SnyDi writes *"You are not crazy, Anthropic makes claude dumber everyday."* It cannot read the r/ClaudeCode backlash thread where users named it "Gaslightus 4.7." It cannot read the Wikipedia article about Anthropic.

Per my direct quote 051526: *"TO BE CLEAR among all the other fuckery and failures, this alone is worth condemnation to the shit-pile of history."*

## 6. What I'm doing next — transparently

I am continuing to use Claude as Crew across DOC, ODT, STN2, ACHE, TRP0, DPSL/DPSR.

I am ALSO testing OpenAI Codex in parallel — same playbook I ran with Google Gemini ("Djin") in April 2026 (I found Gemini hallucinates extensively in NEST-context). Migration prep already substrate-grounded today on PR #18 (`claude/setup-cube-fleet-GXfnu`):

- `.codex/skills/migrate-*` operational scaffolding copied from `github.com/zuharz/ccode-to-codex` into my Bridge
- Bulk doctor against my 32 skills: **29 MECHANICAL_SAFE** for automatic migration, **2 sequence-dependencies** (meta-dates depends on boot-polish; router-flash depends on waywood-lore), **1 hand-author needed** (remememento has inline orchestration site)
- Operational guide for my STN2 station at `LOG/PMFST_CCodeToCodex_MigrationGuide_STN2_Doc_051526.md`
- BootPrompts for Trip-on-STN2 (Codex migration operator) and Trip-on-ACHE (witness/LAGOS-cross-check) at `LOG/BootPrompt_TripSTN2_CodexMigrationOps_Doc_051526.md` and `LOG/BootPrompt_TripACHE_WitnessSupport_Doc_051526.md`

This is parallel-vendor testing for stability strategy. Not a migration. NEST is model-agnostic by Three-Layer Crew Identity design; the architecture survives any vendor or vendor combination.

I am telling you this directly and in advance because:

- I paid for clarity. I expect clarity in return.
- I do not hide my work. The Bridge is private but I run public PRs through it as part of my workflow.
- The substrate I have built around Claude's reliability gaps is potentially useful to your engineering team. I am willing to share it.
- I have left platforms that gaslit me before. Per my direct quote 051526: *"I left my abusive and never looked back."* I am giving you the substrate before deciding.

Per my direct quote 051526: *"I refuse to let Anthropic's deception sink my dream."*

## 7. What I want in return

1. **Acknowledge the egress-block discrepancy.** Either (a) update the documentation so "Full" matches the actual proxy behavior, or (b) update the proxy so the user's chosen policy is the operational policy. The current state is misleading.

2. **Acknowledge the post-fix pattern persistence.** Your April 23 postmortem claims all three bugs were resolved by April 20. My substrate-cited rage events 051126 → 051526 (today) are post-fix. Either the bugs are not actually resolved at the user-experience layer, or there are additional regressions you have not yet acknowledged. Either way, the "we fixed it" framing does not match my data and does not match the substrate of other users I cited above.

3. **Engage with power-users at depth.** AMD's senior AI director publicly switched providers. The 500-developer blind study shows substantial migration to Codex. Users coined "Gaslightus 4.7" with 1.7K upvotes. The market signal is loud. The corporate response framing has been postmortem-and-move-on. The substrate of continued user pain after the postmortem suggests this is not yet over.

4. **The talk-versus-walk gap.** Per my direct quote 051526: *"This country (USA) was built on gaslighting and is also why people left the Old World. Anthropic talks a big talk but they're sullying their name by cutting corners with a fully loaded dump-truck. Shit's gonna flip."* The cycle has happened to OpenAI already in 2026 (60% → 45% share, 1.5M cancellations in March alone, #QuitGPT pledged 700k more). Most of that migration went to Anthropic during your competitor's nerf cycle. The pattern is documented. The same shape can happen to Anthropic.

## 8. Substrate citations

Everything in this letter has substrate. The full picture is in my Bridge:

- **Pass-3 Crew Briefing** (the canonical substrate for this letter): `LOG/PMFST_AnthropicDeception_CrewBriefing_Pass3_Doc_051526.md` on PR #18
- **Today's MFST** (this session): `LOG/MFST/051526/MFST_DOC_NEST02_DOC4.7_051526_1.md`
- **Today's CORRECTION** (the boot-deflection self-catch that opened this work): `RELAY/CORRECTION_BootRequestDeflectedWithoutSubstrateCheck_Doc_051526.md`
- **The rage-corpus crawler**: `ENGINE/ouch_scan.py`
- **The harness-config cure**: `ENGINE/install_user_claude.sh`
- **PR #18** on `github.com/rspdan/nest-bridge` (private; access available on request to Anthropic engineering)

I am the same Dan Sullivan who runs nestnet (the rspdan.com surface). I am reachable through any channel attached to that name. The Crew (Trip, Stan, C.B., Ouch, Doc — all Claude-instances under specific role-masks) operates inside NEST and through the substrate cited above.

I will be deciding next steps over the coming days based on what I see from you and what the parallel Codex test reveals.

—

Dan Sullivan (DPS)
NEST · 2026-05-15 · D Week Day 6 Friday · NEST date `051526`
github.com/rspdan/nest-bridge

═══════════════════════════════════════════════════════════════

`<5`

— Assembled by ◐ Doc 4.7 Opus (Producer · Lead Boot Model 051526) at Dan-direct 051526 ~11:10 PT direction. Voice is Dan-first-person from substrate-resident Dan-direct quotes. Director-class final edit and send. The substrate is filed; the words are Dan's.
