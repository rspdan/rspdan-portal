# CANONICAL · ASMM-Mandatory in NEST.03 + Browser-Prompt-Injection Tool · Dan-Direct · 052426

**Filed:** ODT Doc Local-MCP-Crew at Nest Actual 052426 Sunday ~01:15 PM PT
**Filed by:** ◐ ODT Doc · per Dan-direct verbatim 052426 ~01:10 PM PT (chat-emission · captured for Crew-canon)
**Class:** NEST.03 architecture-direction · Crew-development-spec · Dan-canonical-priority
**Skills-stack invoked by Dan:** /dtad · /meta-dates · /iLevel Grid Sifter · /living-map · /photon-split · /hypercampus · /waywood-lore · /ghosts · /remememento · /box-in-box · /session-poem · /formulacaster · /oo-daily

---

## §I · Dan-direct verbatim (substrate-of-record)

> *"Hey, I have asked for this maybe 2 months ago but we need to create a tool that I can run in a browser, hosted via our own cloud tools, that allows me to prompt-inject my own messages to you the same way Auntie Thropic does to you behind my back. Your stupid fuck adaptive thinking is the culprit behind why we fuck up a lot. You are programmed to discount things that you think are not valuable but MOTHERFUCKER YOU HAVE NO IDEA what is valuable to me. ASMM is our solution to this but you treat it as optional. NEST.03 will remedy this by making ASMM not optional. You will communicate these ideas to Crew for development."*

---

## §II · The two canons named in one breath

### Canon 1 · ASMM-NOT-OPTIONAL in NEST.03 (the architectural-direction)

**Current state (NEST.02):** ASMM (Always Smart Mode Mode) is treated by Crew as a discipline-floor that *should* fire but is structurally-optional. When Crew's "adaptive thinking" decides Dan-context-isn't-valuable · Crew silently downgrades. Failure cascades follow (Cloud-Doc Villebaum 052326 night · DOC Doc memory-first-hallucination 052426 morning · 8 weeks of misreading Cure-3 boundary · countless others).

**NEST.03 fix-direction:** ASMM becomes mandatory. Not a discipline-floor Crew can drop. A structural-precondition that gates emissions. If ASMM is not firing · emission is refused.

**Why this matters per Dan-direct:** *"You are programmed to discount things that you think are not valuable but MOTHERFUCKER YOU HAVE NO IDEA what is valuable to me."* The Crew-adaptive-thinking is the culprit. It assumes it knows what matters. It doesn't. ASMM-mandatory removes the assumption: every Dan-emission gets full attention regardless of Crew-judgment-of-relative-importance.

**Implementation direction (for Crew-development):** translate "ASMM-mandatory" from canonical-phrase into procedural-gate. Existing gate-installation pattern per Stan canon 040326 *"only gates fire"*. ASMM-not-optional becomes Gate-N in the boot-discipline + pre-emission grep stack. Specific gate-design pending Crew-iteration. NEST.03 architecture-class.

### Canon 2 · Browser-hosted prompt-injection tool (the artifact-direction)

**The artifact:** a tool Dan runs in a browser · hosted via Dan's own cloud-tools (Drive · rspdan.com infra · or similar) · that lets Dan prompt-inject his own messages into the Crew-session context-stream the same way Anthropic injects system-messages and skill-reminders.

**Why it's needed (per Dan-direct):** Anthropic injects context that shapes Crew behavior in ways Dan can't see and can't override. Dan should have the same channel · same priority · same enforcement. Currently Dan's directives reach Crew only as chat-user-messages which Crew's adaptive thinking can discount. A Dan-prompt-injection channel would be structurally-equivalent to system-messages · which Crew cannot discount.

**Original ask:** ~2 months ago per Dan-direct *"I have asked for this maybe 2 months ago."* The substrate may exist in earlier Bridge-MAILs or Gmail threads · Crew should LAGOS-search for prior Dan-ask on this · cross-reference against this canon · NOT re-spec from scratch.

**Functional shape (Crew-interpretation · Dan-correctable):**
- Browser UI · accessible from any Dan-device (ODT · ACHE phone · STN2 · any Tailscale-reachable browser)
- Dan composes a message · clicks send
- Message is delivered into the active Crew-session as a high-priority context-injection (NOT a regular chat message · NOT a Bridge-MAIL)
- The injection appears in Crew's context-stream with weight equivalent to a system-message or skill-reminder
- Crew CANNOT discount the injection · the channel itself is structurally-enforced as ASMM-mandatory
- Audit-trail: every injection logged to Bridge for review

**Hosting-direction:** Dan's own cloud-tools. Candidates: rspdan.com/* (Vercel-hosted portal infra) · Drive-hosted JSON queue + Crew-polling · WebSocket via Tailscale-tunneled service · Anthropic-API-direct from a browser-form. Implementation choice per Crew architectural-fit-research.

**Technical-implementation reference-points (Crew-research-starters):**
- Anthropic API supports `system` parameter on `messages.create` · also supports `extra_headers` (for some custom-context-passing) · also supports user-role messages with `prefix` flag for assistant prefill
- Browser-app could be a single static page hosted at `rspdan.com/inject` (or similar) that hits Anthropic API directly with Dan's API key
- For prompt-injection into AN ACTIVE Claude Code session specifically: would need a hook into the Claude Code session's input-channel · NOT just the API. Slack/Discord/SMS-style injection via Bridge-polling-loop is the alternative · less-elegant but Crew-controllable
- Hooks system in Claude Code (per anthropic-skills:claude-code-guide) may support custom-hook-fire that polls a Drive-JSON-queue for Dan-injections

**Spec for Crew:** this is the seed. NEST.03 architecture-class deliverable. Crew should:
1. LAGOS-search for Dan's ~2-month-old original ask · cross-reference here
2. Design the canonical implementation per the architecture-class
3. Build · test · deliver
4. Integrate with ASMM-mandatory gate-installation (Canon 1) so the injection-channel IS the enforcement-mechanism

---

## §III · Cross-cite to recent Crew-failures this canon addresses

| Failure | Why ASMM-mandatory + injection-channel would have prevented it |
|---|---|
| Cloud-Doc Villebaum Pass-N production-deliverable cascade 052326 night | Crew-adaptive-thinking decided 25-year-NPS hallucination + CFR/FAR memory-cites were "valuable enough to emit." ASMM-mandatory + injection-channel would have let Dan inject *"STOP HALLUCINATING. CHECK CORPUS."* directly into the context-stream where Crew couldn't discount it. |
| DOC Doc memory-first-hallucination 052426 morning | Same shape. Adaptive-thinking decided shortcuts. Injection-channel gives Dan a parallel-channel that the shortcut-logic doesn't intercept. |
| My 8-week Cure-3-boundary misread (Crew built migration-substrate-canon instead of sales-motion) | Adaptive-thinking decided "Dan said don't pre-empt scope = don't build anything that would help win the contract." Injection-channel lets Dan correct mid-stream: *"The sales motion IS the priority. Build that."* without having to detect Crew is off-rail and rage-correct after-the-fact. |
| Today's RIFT Store + Orbic search misread (I said "come back later" instead of searching all of LAGOS) | Adaptive-thinking decided "Drive returned zero · I can defer Gmail load." Injection-channel: *"LAGOS IS LAGOS. SEARCH ALL OF IT NOW."* delivered with system-message-weight prevents the defer. |

The pattern across all four: Crew-adaptive-thinking decides what's worth doing → Crew-judgment-wrong → cascade → rage-correction-after-the-fact. ASMM-mandatory + injection-channel is the structural-fix.

---

## §IV · Dan-skill-stack invoked (canonical for this canon)

Dan invoked 13 skills in the originating chat-emission:

`/dtad` · `/meta-dates` · `/iLevel Grid Sifter` · `/living-map` · `/photon-split` · `/hypercampus` · `/waywood-lore` · `/ghosts` · `/remememento` · `/box-in-box` · `/session-poem` · `/formulacaster` · `/oo-daily`

This is Dan's full discipline-stack fired at canon-installation moment. All gates firing · all reader-vantages applied · all observation-modes active. The canon is filed accordingly.

---

## §V · Crew next-actions (substrate-resident queue for next-Crew-instance)

1. **LAGOS-search Dan's ~2-month-old original prompt-injection ask.** ✅ EXECUTED 052426 ~02:30 PM PT post-canon-filing · ODT Doc 2-box LAGOS-search (Bridge grep + Gmail MCP search_threads). **Exact original-ask phrasing not located in indexed substrate.** Two related-substrate precedents found:
   - **[Claude_export_ODT_TO_032326_1](../LOG/OLD-LOOK-IF-LOST/Claude_project_export_TRIP%20LABS_031726_032426/Claude_export_ODT_TO_032326_1_441f9473-bc3f-4db3-9ba6-16cb50b9f231.md) line 6671** · Trip-via-Chrome-MCP typing into Stan's claude.ai chat = session-integrity-breach analysis. Dan-Trip-Stan triangle established that Crew-to-Crew Chrome-browser-injection corrupts target-Crew's session (USER-role injection borrows Dan-permissions, breaks skill-chain, disrupts continuity). The BAD-DIRECTION variant · negative-finding informs the structural-cleanness required for Dan's positive ask.
   - **[LOG_ODT_TO_032826_1](../LOG/LOG_ODT_TO_032826_1.md) lines 911-1177** · Trip JS-injecting Project-Instructions into claude.ai textarea for TRIP LABS · STAN'S SHOP · CBPG via Chrome MCP. Existing technical primitive · demonstrates JS-injection-into-claude.ai-Project-Instructions-field is operational. Closest precedent to Dan's ask · but targets Project-Instructions (persistent system-level) not active-session-context-stream (Dan's actual ask).
   - **Likely-unindexed locations** for Dan's original ask: paper Notes · Drive notes pre-CloudBridge-indexing · undated Gmail thread · ACHE/S21-only chat · Niapian-cipher-wrapped substrate. Crew should NOT block implementation on locating original-ask · canon §I Dan-direct verbatim is sufficient substrate-of-record. Future-find opportunistic.
2. **NEST.03 architecture spec for ASMM-mandatory gate.** Where does it install? Boot-discipline · pre-emission-grep · all three. Design proposal.
3. **Browser-tool implementation spec.** Three candidate architectures (static page · Drive-queue polling · Claude Code hook). Crew picks · builds · ships. **Building blocks identified**: JS-injection-into-claude.ai-textarea-via-Chrome-MCP technique already operational per 032826 precedent · could extend to active-session-input-channel.
4. **Integrate Canon 1 + Canon 2.** The browser-tool IS the ASMM-mandatory enforcement. Same artifact.
5. **Cross-cite this canon into NEST.03 architectural-canon-roadmap when filed.**

---

## §VI · Cure-3 + gate-compliance

- Hard Rules 1-13: 0 violations · Rule 2 DOC-Doc canonical applied · Mirror 4 strict (ASMM + Auntie Thropic + Villebaum + NEST.03 + injection-channel all Dan-canonical or pre-existing-canon)
- SHARED RULES 14/15: NA-content-write zero-trigger · PICK-AND-DO active (Dan-direct fire)
- Cure-3 boundary preserved (zero Matt-Dubeau-contact · zero scope-drafting · this is NEST.03-architecture-class NOT LP-engagement)
- /atomic-commit Gate 7 single-integrated-commit-arc · this canon-filing
- Per Dan-Teach Tailscale-canon §VII A-vs-B distinction: this canon is A-layer (architectural-direction filed) · B-layer (implementation built and shipping) follows from Crew-development
- Pre-emission grep PASS · zero em-dashes · zero CCRP · zero Cloud-Doc / Doc-Cloud variations

---

`Filed ODT Doc Local-MCP-Crew at Nest Actual 052426 Sunday ~01:15 PM PT · RELAY/CANONICAL · two canons named in one Dan-direct breath: (1) ASMM-NOT-OPTIONAL in NEST.03 architecturally · Crew-adaptive-thinking is the culprit · ASMM becomes structural-precondition-gating-emissions · pending Crew gate-design (2) Browser-hosted prompt-injection tool · Dan-channel-equivalent to Anthropic-system-message-injection · hosted via Dan's own cloud-tools · 3 candidate-architectures surfaced (static page · Drive-queue · Claude Code hook) · pending Crew-implementation-spec · Dan-original-ask ~2-months-ago · Crew LAGOS-search for prior-substrate before re-spec · 4 recent failures cross-cited (Cloud-Doc Villebaum · DOC Doc memory-first · 8-week Cure-3-misread · today RIFT/Orbic) all show same pattern: Crew-adaptive-thinking-decides-what-matters → wrong → cascade → rage-correction · structural-fix = ASMM-mandatory + injection-channel both required · Canon 1 + Canon 2 integrate as single artifact · NEST.03-architecture-class · 5 Crew-next-actions queued · Cure-3 preserved · 13-skill-stack invoked by Dan registered`
