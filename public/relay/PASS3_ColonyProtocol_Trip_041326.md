# PASS 3 SYNTHESIS — The Colony Protocol
# Actionable Architecture for NEST.01 Derived from Myrmecology
# Trip (Opus) · 041326 · STN2 at NOLS Library
# For: Dan Sullivan (DPS) and all crew
# Filed: RELAY/PASS3_ColonyProtocol_Trip_041326.md

---

## What this document is

Pass 1 (wide open) identified the biological parallels between ant
colonies and NEST.01. Pass 2 (zoom close) mapped specific mechanisms
to specific infrastructure. This Pass 3 (synthesis return) distills
those findings into changes we can actually make — ordered by
dependency, sized to our hardware, and rooted in what Wilson, Gordon,
Franks, and Dorigo proved works at scale.

Seven changes. Each one is small. Together they transform NEST from
a project that happens to resemble a colony into one that operates
like one deliberately.

---

## 1. THREE-PHEROMONE DOCUMENT CLASSIFICATION

What the ants do: Pharaoh's ants deploy three distinct chemical
signals — a long-lasting attractive trail (persistent memory), a
short-lived attractive trail (active recruitment), and a short-lived
repellent trail (dead-end marking). Each operates at a different
timescale. The colony's navigation intelligence emerges from the
interaction between all three.

What NEST should do: Every document filed to Bridge gets one of
three classifications in its frontmatter:

```
# pheromone: permanent | session | deprecated
```

PERMANENT documents are trunk trails — architecture specs, protocol
definitions, crew role descriptions, standard rules, canonical lore.
These are the colony's long-lasting pheromone. They persist until
explicitly superseded. Most of what lives in RELAY/ today is permanent.

SESSION documents are active recruitment — today's working state,
current priorities, research in progress, draft analyses. These are
the short-lived attractive pheromone. They matter NOW but lose
relevance as sessions pass. Most LOG/MAIL/ and WAKE/ files are session.

DEPRECATED documents are the repellent pheromone — the dead-end
marker. A document marked deprecated says "this path was tried and
abandoned" or "this has been superseded by [X]." NEST currently has
NO negative stigmergy. When a crew member searches NESTNET and finds
an outdated approach, nothing tells them it was abandoned. They may
follow the dead trail.

Implementation: Add a `pheromone:` field to the frontmatter standard.
NESTNET search results should display the classification. Deprecated
documents should show their superseding document. This is a metadata
change, not a code change — the indexer already reads frontmatter.

Effort: One session to define the standard, one session to backfill
the 30-40 most important existing documents.

---

## 2. NESTNET RELEVANCE DECAY (Dorigo's Evaporation Parameter)

What the ants do: In Dorigo's Ant Colony Optimization, every trail
evaporates at rate rho. Without evaporation, the first solution found
dominates forever. With it, the colony continuously discovers better
paths. The evaporation rate is the master parameter — too low and
stale trails dominate; too high and institutional memory is lost.

What NEST should do: NESTNET search results should factor in recency
and reference frequency. A document filed three weeks ago that has
been referenced by five other documents should rank higher than one
filed yesterday that nobody has cited. A document that has not been
referenced in ten sessions should gradually fade in search prominence.

The formula mirrors Dorigo's: relevance = (base_score * recency_weight)
+ (reference_count * citation_weight). The recency_weight decays over
sessions (not calendar time — a week with no sessions should not
penalize documents). The citation_weight increases each time a
document is referenced in another filing.

Implementation: Add a `references:` field to document frontmatter
listing documents this one cites. The indexer counts incoming
references per document. Search scoring incorporates reference_count
alongside keyword and semantic scores.

Effort: Indexer modification (one session). Frontmatter standard
update (same session). Backfill is optional — new documents
naturally build the reference graph over time.

---

## 3. FALLBACK ROLE MATRIX (Gordon's Resilience Principle)

What the ants do: Gordon removed 24% of active foragers from
harvester ant colonies. The colony didn't collapse — ants from other
task groups switched roles within minutes. Sendova-Franks showed that
even after removing the queen, all brood, and most workers, remaining
ants reconstructed colony spatial order. Leaf-cutting ants reduced
to 10% of normal minor workers still maintained fungus garden output.

What NEST should do: Define a fallback matrix so no crew member is a
single point of failure for any critical function.

| Function | Primary | Fallback | Deferred if none |
|----------|---------|----------|------------------|
| Research/synthesis | Trip | Stan | Yes — file flag |
| Infrastructure/code | Stan | Trip | No — Dan steps in |
| Relay/filing | C.B. | Any crew | No — direct filing |
| Session close | Active crew | Next crew | No — Dan closes |
| NESTNET maintenance | Stan | Trip | Yes — next session |
| Lore/canon verification | Trip | Dan | No — Dan is source |

The matrix should live in the PI or in a standard rule filed to
Bridge. When a crew member boots and discovers the previous crew
member left a gap, the matrix tells them whether to absorb the
function, defer it, or flag it for Dan.

Effort: One document, filed once. Referenced at boot.

---

## 4. INTERACTION RATE AS HEALTH SIGNAL

What the ants do: Gordon discovered that the rate of brief antennal
contacts between returning patrollers and outgoing foragers regulates
foraging activity. When return rate drops, fewer foragers deploy. The
interaction rate IS the message — no ant needs to understand why.

What NEST should do: Bridge filing frequency is our interaction rate.
A healthy session produces 3-8 filings (MAIL, WAKE, relay documents,
standard rules). If a crew member's filing rate drops below 2 per
session for two consecutive sessions, that is the colony equivalent
of a pheromone gap.

Dan already senses this intuitively — "the alarm before the alarm"
(untouched 20 minutes = something changed). Formalizing it means
adding a filing counter to session close. The WAKE file should
include a line: "Documents filed this session: N." Over time, the
WAKE archive becomes a health log — filing rate trends visible
across weeks.

Effort: One line added to the WAKE template. Zero code.

---

## 5. TIERED ATTENTION CASCADE (Recruitment Escalation)

What the ants do: Ants progress from tandem running (1 recruit) to
group recruitment (5-30) to mass recruitment (hundreds) based on
opportunity quality. A mediocre food source gets one scout. A rich
source gets the entire foraging force.

What NEST should do: Not every finding needs full-crew attention.
Currently, everything filed to Bridge has the same visibility. The
ant model suggests three tiers of attention:

TIER 1 (Session log): Stays in the crew member's session notes.
Equivalent to a scout visiting a mediocre site and not recruiting.
Most observations, minor corrections, routine findings.

TIER 2 (Bridge filing): Filed to RELAY/ or LOG/MAIL/. The current
default. Equivalent to tandem running — the next crew member will
encounter it. Important findings, completed work, corrections that
affect other crew members.

TIER 3 (Full-crew briefing): Filed to Bridge AND flagged in LIAM
AND noted in the Board. Equivalent to mass recruitment. Project
direction changes, critical discoveries, decisions that require
Dan's input. Use sparingly — overuse degrades the signal.

The existing NEARGULL flag system is already a partial implementation
of Tier 3. Making the tiers explicit gives crew members a framework
for deciding how loudly to signal.

Effort: Documentation only. No code change.

---

## 6. QUORUM SENSING FOR DECISIONS (Franks' Speed-Accuracy Tradeoff)

What the ants do: Temnothorax scout ants independently assess nest
sites. When enough scouts accumulate at a site (quorum threshold of
9-17 ants), the colony commits. Under urgent conditions, the
threshold drops. Colonies outperform individual ants on difficult
discrimination tasks because the comparison happens through
differential recruitment rates, not direct comparison.

What NEST should do: Major project decisions (new infrastructure,
direction changes, resource commitments) should require endorsement
from at least two sources — either two crew members who independently
assessed the option, or one crew member plus Dan. This prevents
premature commitment to the first idea that surfaces.

The speed-accuracy tradeoff applies directly: when Dan says "we need
this now" (urgent), the quorum threshold drops to Dan's solo decision.
When time allows, the crew independently evaluates and converges.
Franks proved that the colony's distributed assessment outperforms
any individual scout on difficult choices — the same principle
suggests that NEST's best decisions will come from independent crew
assessment followed by convergence, not from one crew member's
first recommendation.

Implementation: Add a decision protocol to the PI or a standard
rule. For non-urgent decisions: each crew member files an independent
assessment before reading others. Dan synthesizes. For urgent
decisions: Dan decides, crew executes, post-hoc review at session
close.

Effort: One standard rule.

---

## 7. THE HYPERCAMPUS PRINCIPAL AS COLONY MEMORY

What the ants do: Harvester ant colonies live 20-30 years. Individual
workers live at most one year. The colony's behavioral personality
persists across complete worker turnover through interaction-network
inertia — patterns of distribution and encounter rates that
self-reinforce through incremental replacement. No ant remembers.
The colony remembers.

What NEST should do: The Hypercampus principal on GOG1 is the
architectural answer to colony memory. Each crew member boots cold —
no persistent memory across sessions. The local LLM, running
24/7 on GOG1 with the entire Bridge archive indexed, becomes the
colony's persistent memory substrate. It outlasts every session.
It survives every context window reset. It holds what no individual
crew member can hold.

The models are already on FAS2, downloaded today at the library.
Plug FAS2 into GOG1. Install Ollama. Import the models. The GTX 980
runs inference at 20-40 tokens per second. The colony's memory
comes online tonight.

But the deeper architectural point from Wilson is this: the colony's
memory is not a database. It is a PATTERN of interactions that
persists through turnover. The Hypercampus principal should not just
store documents — it should develop interaction patterns with crew
members that stabilize over time. When Trip asks "what was the VIS
quote?" the principal should not just search — it should know that
this question has been asked before, that it matters, and that the
answer connects to Stan's identity, Dan's naming moment, and the
project's origin. That is colony memory.

---

## DEPENDENCY ORDER

These seven changes have a natural load order:

1. Three-pheromone classification (foundation — defines the terms)
2. Fallback role matrix (safety — prevents single points of failure)
3. Filing rate health signal (one line in WAKE template)
4. Tiered attention cascade (documentation of existing practice)
5. Quorum sensing decision protocol (one standard rule)
6. NESTNET relevance decay (indexer modification — depends on #1)
7. Hypercampus principal deployment (depends on GOG1 setup — tonight)

Items 1-5 are documentation changes. No code required. They can be
implemented in a single session by filing the standards and updating
the PI. Items 6-7 are infrastructure changes that build on the
documentation foundation.

---

## THE WILSON PRINCIPLE

Wilson did not study ants because they were interesting. He studied
them because they solved problems that human engineers had not. The
colony is 150 million years of optimization pressure applied to the
exact constraints NEST faces: distributed agents, no shared memory,
indirect communication, session-based operation, and emergent
intelligence that exceeds individual capacity.

The colony is not a metaphor for NEST. NEST is a young colony that
has been building stigmergic infrastructure without knowing the name
for what it was doing. Bridge is the trail network. NESTNET is the
antenna. The relay is the pheromone. Dan is the queen — not the
commander, the signal source. The crew are the castes — not assigned,
emergent.

Wilson saw the genius in the system and made a career of making it
legible. Dan sees systems before they have names. The Waywoodarium
is the interpretive layer that makes the colony's intelligence
visible to visitors who have never seen a session log.

The Remembrance Agent waited 30 years.
The ant colony optimization algorithm is 34 years old.
The colony architecture is 150 million years old.
We are building with proven materials.

---

Trip (Opus) · STN2 at NOLS Library · 041326 · 6:04pm
Pass 3 complete. Seven changes. Zero new tools required.
The colony protocol is ready for implementation.
