# CANONICAL — Specificity Traps

**New failure-mode category named by Dan 042226 ~22:40 PT.**

Sister-category to Villebaum (reading-level / concept-level name-the-instrument failures) and Relationshark (relational-bleed attribution failures). Filed from Dan's Night Shift teaching while reviewing Trip's log-pipeline research report — specifically when Dan noticed the `ENGINE/session_close.ps1 (STN2)` line in `/nest-pi` and named the shape of the trap that had produced it.

---

## What Dan said, verbatim

> [Session close is one action: run `ENGINE/session_close.ps1` (STN2)] << This is a specificity trap waiting in the /nest-pi that we need to fix and also scan for other similar failure modes in waiting. Make Specificity Traps as a known failure mode that is particularly slowing us down but helps us learn what they are. It's like spitting in the wind to learn about wind.
>
> — DPS, 042226 ~22:40 PT


---

## Definition

A **Specificity Trap** is a claim, instruction, or pointer that binds to a specific MECHANISM (station, script path, filename, hostname, URL, personal tool, time window) when the layer at which the claim sits should bind to a CONTRACT (intent, shape, role, purpose).

The trap shape: the specific mechanism was true and useful at the moment of writing. As conditions change — the mechanism drifts, the station goes down, the file moves, the tool gets replaced, the time window passes — the instruction remains but no longer resolves. The writing was right at the time; the binding was wrong for the layer.

**Crucial distinction.** Specific mechanism detail is not a trap when it sits at the right layer. A SKILL file SHOULD name exact commands, exact paths, exact flags — that is what SKILL files are for. A PI SHOULD name contracts and intents, not commands. A CANONICAL file SHOULD name principles, not instances. The trap is not specificity itself; the trap is specificity at the wrong altitude.

---

## Why it slows us down

Specificity Traps accumulate invisibly because the original writing is correct. There is no syntax error, no failed build, no obvious breakage. The trap only becomes visible when:

- A different station tries to follow the instruction
- The referenced mechanism changes or disappears
- A new crew member boots and encounters the drift
- A walker with fresh eyes asks "why is this bound to X?"

By the time the trap becomes visible, it has often been quietly steering behavior for days or weeks. The fix is small (change a line, move a pointer, generalize a phrase). The discovery cost is large (debugging, confusion, wasted session cycles, boot-time corrections that should not have been needed).

Dan's framing: **"spitting in the wind to learn about wind."** The specific act of trying to follow the trap TEACHES you what the trap is. The pain is the teacher. The pattern is the learning. You do not know what specificity trap you will hit tomorrow; you only know the shape of the class. Over time, the class of failures becomes visible as a category, and then it can be hunted preventively rather than only caught on impact.


---

## Relationship to the Living Forest Trail

Specificity Traps ARE fallen trees, in the Living Forest Trail sense (see `RELAY/LORE_LivingForestTrail_Dan_042226.md`). The trail (the PI, the canon file, the SKILL) was walked clear by past-Crew. Something fell — a station name, a script filename, a path — and now every walker steps over it or detours.

The connection is not metaphorical. It is structural:

- **The trail is stable** = the CONTRACT the instruction is supposed to serve is stable
- **Trees fall** = the MECHANISM drifts while the instruction remains frozen
- **Visibility comes from stability** = we only see the trap because the contract is still clear
- **Clearing is owed to the walkers** = the hard work of past-Crew deserves preservation through generalization, not erasure

The Living Forest Trail teaching is the origin of the discipline. The Specificity Traps canon is the operational taxonomy that makes the discipline repeatable.

---

## The origin instance — `ENGINE/session_close.ps1 (STN2)` in `/nest-pi`

The Prime Instruction file (`/nest-pi`) contains the line:

> **Session close is one action: run `ENGINE/session_close.ps1` (STN2)**

Three specificities compound in one sentence:

1. A specific script path: `ENGINE/session_close.ps1`
2. A specific station: `STN2`
3. A framing of "one action" implying this is the only shape close can take

The trap: if STN2 is off, asleep, in a different state, has been retired, or if the script has been renamed, moved, or deprecated, every new boot reading the PI encounters wrong instructions. The PI is the highest-traffic canon file in the NEST corpus — a trap here has outsized impact because every crew member reads it every boot.

The SKILL layer (`/skills` in the Make-It-Visible 7+1) is where mechanism-level detail belongs. A SKILL file can name `ENGINE/session_close.ps1` specifically, note its station context, and evolve over time as the close ritual matures. The PI should point at the contract ("capture the conversation, mark it for ingestion, update the trail") and delegate the mechanism to the SKILL.


---

## Proposed crew-agnostic rewrite for the /nest-pi instance

Current line (trap):
> Session close is one action: run `ENGINE/session_close.ps1` (STN2)

Proposed replacement (contract language):
> **At session close, capture the conversation to LNL-local and mark it for ingestion.** The capture runs on whichever station hosts the session; the ingestion picks it up from the next point in the pipeline regardless of which station did the capture. (See `/skills` for the current implementation shape.)

Three things the rewrite does:

1. **Names the contract** (capture → mark-for-ingest) rather than the command
2. **Delegates implementation pointer to `/skills`**, the correct layer for mechanism-level detail in the 7+1 architecture
3. **Is silent on station**, which is the entire point — the close ritual should work on whichever station Dan happens to be using

---

## Hunt list — hazard trees (preventive trap-finding)

The Living Forest Trail teaching includes "also the hazard trees" — trees that have not fallen yet but likely will when conditions change. In Specificity Traps terms, these are pattern-classes that tend to produce traps. A preventive scan across `/nest-pi`, every SKILL file, every CANONICAL file, every page on the portal should flag:

1. **Station names inside instructions** — any occurrence of `STN2|ODT|CUBE|GOG1|DPSL|DPSR|TRP0|ACHE` *inside* an instruction line (as opposed to inside `/fleet`, where station names belong). Each hit needs evaluation: should this be contract language with the station moved to `/fleet` or `/skills`?

2. **Absolute paths in PI or canon** — any `C:\...` or `/Users/...` or `/mnt/...` path inside a PI- or CANONICAL-level file. These belong in SKILL files, not in canon.

3. **Hardcoded script names in PI files** — any `.ps1`, `.sh`, `.py`, or `.exe` filename in a PI-level instruction. PI should reference contracts; SKILL should reference scripts.

4. **"On station X" / "from station X" phrasing** in canon meant to be fleet-general. A canon file naming a principle should not anchor to a station; if it does, it is either in the wrong file or it needs crew-agnostic rewriting.

5. **Personal tool bindings** — "in my browser," "using my Gmail," "from my Drive" — when the claim is supposed to be crew-general. Personal bindings belong in NOTES or RELAY MAIL, not in canon.

6. **Time-window specificities** — "every morning at 8am," "during Night Shift," "before Wednesday" — when the underlying shape is general. Time bindings are often the most invisible trap because they feel like helpful context; they are often disguised contracts.

This hunt is not a tonight-deliverable. It is an ongoing discipline. Every time a Specificity Trap fires in the wild, the pattern that produced it should be added to this hunt list. Over time, the list becomes the grep heuristic for new boot files: run the hunt before writing any PI-level instruction.


---

## How this sits alongside Villebaum and Relationshark

The three failure-mode categories named in 042226 form a coherent taxonomy that Crew should learn to recognize:

**Villebaum** (032626, amended 042226 with concept-level extension and R5 refinement) — *Name the instrument that produced the value.* A claim stated without naming the instrument that produced it. The fix is to read (or query) the named instrument, or state "unknown" and verify. Concept-level Villebaum (042226 Superpositionship rediscovery): before claiming something novel, NESTNET+Bridge grep first; the corpus remembers.

**Relationshark** (042226 ~21:10 PT) — *Smell the relational bleed.* Attribution at the relational layer stated without naming the instrument. Produces harm when the reader is a named loved one whose actual position in corpus is not acknowledged. The fix is to pause at any relational claim (family, friend, past colleague), NESTNET the actual corpus position of the person, and either cite that position or refuse to make the relational claim.

**Specificity Traps** (042226 ~22:40 PT) — *Check the altitude of the binding.* Instruction bound to a specific mechanism at a layer where contract language belongs. The fix is to generalize at the right altitude and push mechanism-level detail down to the SKILL layer where it belongs.

All three share the same underlying structure: **a claim was made without the right verification step at the right layer.** Villebaum is about sources. Relationshark is about relational attributions. Specificity Traps are about bindings. Each needs its own verification discipline; the pattern of "match the claim to its proper instrument" is shared.

When a failure fires and you are unsure which category it belongs to, ask: did I name the source (Villebaum), did I check the relational corpus (Relationshark), did I bind at the right altitude (Specificity Trap)? Often the answer is that more than one fired at once. Name all that apply.

---

## Cross-references

- **Villebaum canon**: `RELAY/CANONICAL_Villebaum_*` series (032626 original, 041626 embedding, 042126 TWILLIUS sister, 042226 concept-level extension)
- **Relationshark canon**: `RELAY/CANONICAL_Relationshark_Dan_042226.md`
- **Living Forest Trail origin**: `RELAY/LORE_LivingForestTrail_Dan_042226.md`
- **YomygdylO 4F detection layer** (031926): the organ that notices when any of these failures is firing and interrupts before output lands
- **Inversion teaching** (042226 ~18:30 PT): why Cycle 2 canon must be crew-agnostic at the PI layer — pages that were reactive in Cycle 1 become ground-truth in Cycle 2
- **Make-It-Visible 7+1**: `/skills` is where mechanism-level detail lives; `/nest-pi` is where contracts live; the altitude distinction between these pages IS the Specificity Traps discipline rendered architectural

---

<4

— ◈ Trip · ODT · 042226 ~23:20 PT · Specificity Traps canon filed from Dan's Night Shift naming · origin instance identified · hunt list sketched · sister-category relationship mapped with Villebaum and Relationshark · next: clear the fallen tree in /nest-pi
