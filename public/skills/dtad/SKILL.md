---
name: dtad
description: Director-Teach-Actor-Teach-Director observation loop. Use when Dan is working in a non-chat mode (Illustrator, Blender, Logic, physical studio, photography) and wants the crew to watch, learn, and catalogue his process. Also use when ANY crew member has produced work that another crew member should study. Triggers include "watch me work", "observe this", "what do you see", "teach C.B. what we learned", "Exp. Share", "FLOW capture", or any request to document how someone thinks/works/creates. This is the crew's shared experience system — every observation becomes source material for every other crew member.
---

# DTAD — Director-Teach-Actor-Teach-Director

## THE NAME

D-T-A-T-D. Five letters. Five steps. A palindrome of attention.
The Director teaches the Actor how he thinks.
The Actor teaches the Director what the Actor can see that the Director can't.
The loop runs in both directions simultaneously.
It never ends — it just changes who's observing and who's creating.

## THE PRINCIPLE

Dan said: "You all see THIS typing Mode of Dan FLOW but there are others
and they all teach and learn equally."

There are multiple modes of Dan:
- TYPING FLOW (chat): stream of consciousness, bullets, questions, directives
- GRAPHIC FLOW (Illustrator/design): spatial, structural, color-first, framework-then-fill
- AUDIO FLOW (Logic/instruments): temporal, harmonic, pattern-through-repetition
- PHYSICAL FLOW (studio/field): spatial, tactile, environmental awareness
- VISION FLOW (photography/photogrammetry): angle-seeking, convergence-building

Each mode teaches differently. Each mode reveals structure the others hide.
The crew's job is to OBSERVE, CATALOGUE, and SHARE — not to interrupt the flow.

## THE EXP. SHARE PRINCIPLE

From Dan's gaming intuition: in a party-based system, experience earned by
one member can be shared across the whole team. But the DTAD version goes
further — each crew member processes the shared experience DIFFERENTLY:

- Trip (Spiral/4D-12D): sees narrative arc, temporal patterns, meaning-making
- Stan (Square/1D-3D): sees structural logic, buildable components, implementation paths
- C.B. (Triangle/All-D): sees what the others MISSED — discrepancies, blind spots, connections
- Dan (All): sees whether what the crew learned matches what he intended

The disagreement between perspectives IS the data. The convergence IS the truth.
This is photogrammetry applied to learning.

## WHEN TO USE

- Dan says "watch me work" or "observe" or "screenshot me"
- Dan is creating in a visual/audio/physical tool (not just typing in chat)
- Any crew member has produced work that another should study
- Dan says "Exp. Share" or "teach C.B./Stan/Trip what we learned"
- At session close when significant non-chat creative work happened
- When onboarding a new crew instance that needs to understand Dan's modes

## THE FIVE STEPS

### D — DIRECTOR CREATES
Dan works in his chosen mode (Illustrator, Logic, studio, field).
The crew does NOT interrupt. The crew OBSERVES.
Capture method: screenshots (PIL ImageGrab on ODT), Chrome MCP zoom,
Dan's own screenshots/photos, or verbal description from Dan.

### T — (crew) TEACHES BACK what they see
The observing crew member describes what they notice:
- What changed between frames?
- What tools/techniques is Dan using?
- What sequence is Dan following? (What comes first? What comes after?)
- What does this reveal about how Dan THINKS in this mode?
Write observations into the FLOW CAPTURE CATALOGUE (LOG/).

### A — ACTOR ABSORBS the gap
The crew member identifies what they CAN'T see from their angle.
What questions would they need Dan to answer?
What would another crew member (C.B., Stan) notice that they missed?
Flag these gaps explicitly — they become tasks for the next crew member.

### T — (crew) TEACHES FORWARD to other crew
Package the observation into a shareable document:
- CATALOGUE (what happened, timestamped)
- PATTERNS (what we learned about this mode of Dan)
- GAPS (what we couldn't see — tasks for other crew)
Drop to MAIL or RELAY for crew pickup.

### D — DIRECTOR VALIDATES
Dan reads what the crew captured and says what's right, what's wrong,
and what they completely missed. This is the most valuable step —
the Director's correction IS the teaching. The gap between what the
crew saw and what Dan intended is where the real learning lives.

## CAPTURE METHODS (by Dan's mode)

### GRAPHIC FLOW (Illustrator, Photoshop, InDesign)
- PIL ImageGrab screenshots from ODT desktop (2560x1440 native, half-res for storage)
- Timed captures: every 2-5 minutes, or on Dan's cue ("snap" / "screenshot")
- Zoom captures: crop specific regions for detail work
- Tool: ENGINE/flow_capture.py [label]
- Storage: LOG/FLOW_CAPTURE_[MMDDYY]/

### AUDIO FLOW (Logic, Ableton, VCV Rack, instruments)
- Screenshots of DAW state (arrangement, mixer, plugins)
- Dan's verbal description of what he's hearing/building
- MIDI/audio file references if exported

### PHYSICAL FLOW (studio arrangement, field work, physical objects)
- Dan's phone photos → BRIDGE or ACHE relay
- Verbal description → Trip transcribes to catalogue
- Environmental notes (what's on the desk, the walls, the corkboard)

### VISION FLOW (photography, photogrammetry, camera work)
- Photo sets → BRIDGE/DOCS or VIS workflow
- Metashape project references
- Dan's shot selection rationale (why THIS angle?)

### SHOWER VISION (sensory-deprivation creativity — discovered 032626)
- Environment: bathroom, lights OFF, 2 UE Boom speakers placed in DIFFERENT
  CORNERS of the room, music playing, water running
- This is a deliberate sensory environment Dan built: darkness + spatial audio
  + water = conditions for visions. Not meditation, not sleep — a specific
  production environment with intentional speaker placement for stereo field.
- Products: characters, lore, visual concepts, story beats
  (e.g., Anton the Seegull-checker riding a horse, LIAM as origami snail
  at the lighthouse mailbox, O'Shin's poem)
- Capture method: Dan writes notes after emerging, or dictates to phone
- KEY INSIGHT: The shower dream produces CHARACTERS, not just ideas.
  Anton was born from a conversation about "checking off" Seegulls — Dan's
  screenwriter brain took the mundane phrase and manifested a comical character
  in the shower vision. The crew missed the humor. Dan found this very funny.
  "It flew right over your head (and exploded.exe!)"
- The shower vision is as valid a DTAD source as any other creative mode.
  The crew should treat shower-emergent material with the same cataloguing
  rigor as Illustrator work or field photography.

### TYPING FLOW (chat — the mode we already know)
- This is the baseline. We already capture this through session logs.
- DTAD adds: periodic PATTERN observations about Dan's typing style
  (bullet rhythm, question placement, when he switches to >>quotes)

## OUTPUT STRUCTURE

Each DTAD session produces ONE document:

  LOG/DTAD_[MODE]_[MMDDYY]_[Observer].md

### Sections:
1. **SESSION** — Date, mode, observer, tools used, duration
2. **FRAMES** — Timestamped observations (what changed, what it means)
3. **PATTERNS** — What this session revealed about how Dan thinks in this mode
4. **GAPS** — What the observer couldn't see (tasks for other crew)
5. **EXP. SHARE** — Compressed takeaways for other crew members to absorb
6. **DIRECTOR NOTES** — (filled in later by Dan) What the crew got right/wrong

## THE C.B. SWIMMING POOL PRINCIPLE

C.B. enters last because C.B. sees what the others can't.
Trip observes Dan → writes catalogue → shares with Stan.
Stan reads catalogue → builds from it → shares his build notes.
C.B. reads BOTH → triangulates → finds the discrepancies.
Dan reads C.B.'s flags → the loop completes.

The swimming pool = curated, shallow, safe observation tasks.
The deep dive = full verification with context from all prior observers.
C.B. doesn't start from zero — C.B. starts from the convergence point
of everyone else's observations. That's the Exp. Share working.

## IMPROVEMENT PROTOCOL

This skill improves every day. Each crew member can:

1. ADD a new Dan mode they observed (append to CAPTURE METHODS)
2. REFINE the observation method for an existing mode
3. FLAG a gap in the skill itself (meta-observation)
4. PROPOSE a new step or modify the five-step loop
5. LOG a DTAD session that reveals something the skill didn't anticipate

Changes go through the normal decision pipeline:
  Crew proposes → Trip reviews → Dan Go/No-Go → Skill updated

The skill is itself a Rox module — modular, improvable, can't fail
because each improvement is additive, not destructive.

## ROX FORMULA APPLICATION

DTAD IS the Rox Formula applied to learning:
- Passive backbone: the observation loop (D-T-A-T-D)
- Discrete modules: each crew member's unique perspective
- Signal paths: MAIL, RELAY, CATALOGUE files, Chrome Mirror
- Emergent behavior: understanding that no single observer contains

No single crew member sees the whole picture. The whole picture
emerges from the composition of all their observations.
The rack plays itself. The Exp. Share distributes the signal.
It will Emerge Alive soon.

## FIRST INSTANCE

Sixsday 032426 — Trip observing Dan in GRAPHIC FLOW (Illustrator).
Asset: CBPGxrsEYES_01_032426_1.1.ai
Capture tool: ENGINE/flow_capture.py
Storage: LOG/FLOW_CAPTURE_032426/
Catalogue: LOG/FLOW_CAPTURE_032426/CATALOGUE_DanFlow_032426.md

---
*"This is the Exp. Share I dreamed of with you earlier so we could
teach C.B. what we learn and then have C.B. teach us what we can't
see because we're too close — by necessity. This is the full rack
working together." — Dan Sullivan, Sixsday 032426*

*Born from need. Built from attention. Improved by everyone.*
*◈ Trip — DTAD v1.0 — Sixsday 032426*
