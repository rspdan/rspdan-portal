---
name: formulacaster
description: The Formulacaster applies the Circle of 5ths as a math framework for project planning and entropy measurement. Use to forecast project state, prioritize tasks harmonically, or check whether a session is gaining order or disorder.
---

# The Formulacaster

The Formulacaster is a planning and forecasting tool built on the Circle of 5ths. It treats each week of the NEST's 8-week development cycle as a musical key, where complexity accumulates like sharps in a key signature — each week adds one sharp while keeping everything from previous weeks in tune.

## When to use

The four operations spell FADE — but it doesn't fade. It sustains. Because the substrate is permanent.

**F.A.D.E.**

**FORECAST** — Project the growth curves forward. Take measured data (tools built, decisions made, stations deployed, documents written) from completed weeks, plot them on the Circle, and extend the curves through future weeks using the sharp-accumulation pattern. Output is a growth chart with solid dots (measured) and hollow circles (projected).

**ATTUNE** — Place today's tasks on the Circle and read them as a chord. Each task maps to the key where it harmonically belongs: tasks that ARE this week's work sit at the root, tasks that scout next week sit at the perfect fifth, maintenance of previous weeks' infrastructure sits at inherited sharps, and future-week work appears as dashed lines (visible but not yet sounding). Output is a Circle diagram with task rays and a chord analysis.

**DIAGNOSE** — When something feels off, check the harmonic balance. If all tasks cluster at one key, the day is monotonic. If tasks scatter across unrelated keys, the day lacks a root. If the root note hasn't sounded yet (like the Extensions vs Connectors question that was open for 15 hours), the chord is ambiguous. The diagnosis tells you what to play first.


## The 8-Week Circle (canonical, stated by Dan Sullivan 032226)

| Week | Key | Sharps | Name | Lesson |
|------|-----|--------|------|--------|
| 1 | F | 1♭ | Fun | How to Have Fun |
| 2 | C | 0 | Continuity | How to Find Continuity |
| 3 | G | 1♯ | Grow | How to Trust Growth |
| 4 | D | 2♯ | Dimension | How to See Dimensions |
| 5 | A | 3♯ | Alignment | How to Access Alignment |
| 6 | E | 4♯ | Emerge | How to Emerge / Entrance |
| 7 | B | 5♯ | Limber | Bee-Lender / Limber |
| 8 | F♯ | 6♯ | Scope | How to Scope Future-Sharp |

The sharps accumulate: F♯ is added at G Week, C♯ at D Week, G♯ at A Week, D♯ at E Week, A♯ at B Week, E♯ at F♯ Week. Each sharp represents a layer of complexity that was integrated during its origin week and now plays underneath all subsequent weeks without needing to be re-established.

## The Core Principle

Complexity accumulates but remains playable. A key with 3 sharps is not "harder" than a key with 1 sharp — it is more COMPLEX while remaining harmonically valid. The crew at A Week is not working harder than at F Week. It is working with more dimensions active simultaneously. The Formulacaster measures this and makes it visible.

## How to run FORECAST


### Step 1: Gather measured data
For each completed week, count the concrete outputs: tools built, decisions made canonical, stations brought online, documents created, songs deployed, syncs confirmed. These are the solid dots. Do not estimate — count from the flight logs, TRIP_DECISIONS.md, and TripLabs Registry.

### Step 2: Place on the Circle
Each week's data goes at its key position. The x-axis is the Circle of 5ths (F through F♯). The y-axis is the metric being tracked. Multiple metrics can be overlaid as separate curves (use different colors from the NEST palette: teal for tools, purple for decisions, coral for stations).

### Step 3: Project forward
The growth pattern follows the sharp-accumulation curve — not linear, not exponential, but HARMONIC. Each week adds complexity at approximately the same rate as the previous week added its sharp. The hollow circles extend the curve through unvisited weeks. Label them clearly as projected, not measured.

### Step 4: Read the forecast
The forecast is not a prediction. It is a point cloud showing where the project will be IF the current accumulation pattern continues at the current pace. The crew walks through the point cloud — they can see the shape of the future without waiting for it to arrive. The hollow circles become solid dots as each week is lived.

### SVG output format
Use a 680px-wide SVG with the Circle of 5ths as x-axis labels (F, C, G, D, A, E, B, F♯). Plot each metric as a polyline with solid circles for measured and hollow circles for projected. Include a "we are here" dashed vertical line at the current week. Add the sharps accumulation bar at the bottom.


## How to run ATTUNE

### Step 1: Inventory the day's tasks
List everything that could be worked on today. Don't filter yet — capture the full possibility space.

### Step 2: Map each task to its harmonic position
Every task has a natural home on the Circle based on WHEN it was born and WHAT it serves:

**Root note (current week's key):** Tasks that ARE this week's work. At A Week, the root is alignment tasks — tuning the instrument, calibrating the crew, establishing PACE. The root must sound first. A chord without its root is ambiguous.

**Perfect fifth (next week's key):** Tasks that scout one week ahead. The fifth is the most consonant interval — it rings naturally alongside the root without tension. At A Week, the fifth is E (Emerge). Research that prepares for E Week belongs here.

**Inherited sharps (previous weeks' keys):** Infrastructure maintenance. Tools built in G Week that need a cron fix. Protocols born in C Week that need a status update. These are the sharps already in the key signature — they don't need to be RE-established, just kept in tune. They can sound in the background.

**Dashed lines (future keys beyond the fifth):** Tasks that belong to weeks not yet arrived. They are VISIBLE on the Circle (you can see where they'll land) but not yet SOUNDING. A stub spec or a planning note is appropriate — writing the stub acknowledges the future key without playing it out of turn.

### Step 3: Draw the Circle with task rays
Use a 680px SVG with the 12-key Circle. Draw lines from the center to each task's key position. Line weight and opacity encode priority: thick solid lines for root and fifth, thinner lines for inherited sharps, dashed lines for future keys. Color-code by task category.

### Step 4: Read the chord
Name the chord: "The chord of [Week] [Day] is: [root] — [fifth] — with [sharps] sustained underneath." Then describe what each voice in the chord means operationally: what to play first, what rings alongside, what's maintained, what's visible but waiting.


## How to run DIAGNOSE

### Symptom: All tasks cluster at one key
The day is monotonic — playing one note repeatedly. Introduce a fifth or a contrasting sharp to create harmonic movement. A day of pure alignment work (all A) benefits from one scouting task at E to create the interval that makes A sound like A instead of just a sustained tone.

### Symptom: Tasks scatter across unrelated keys
The day lacks a root. No task has been designated as THIS week's fundamental work. Identify which task most directly serves the current week's lesson (the "How to..." phrase) and make it the root. Everything else orbits the root.

### Symptom: The root hasn't sounded yet
The most important task for the current week has been deferred, buried under inherited sharps or future-key planning. This is the Extensions vs Connectors pattern — 15 hours open because the deep read swallowed it. The diagnosis is: sound the root first. The chord resolves when the fundamental frequency is present.

### Symptom: Future keys are being played before their week
The crew is rushing ahead — building F♯ Week deliverables during A Week. This breaks the accumulation pattern because the intervening sharps (D♯, A♯, E♯) haven't been integrated yet. The music sounds wrong because notes are being played without the harmonic foundation underneath them. File a stub, acknowledge the future key, but do not build in it yet.

### Symptom: The count is 7 and 5
This is not a symptom. This is the breathing pattern. Seven in, five out. The ship is alive. Check the numbers against the naturals (7 = inhale, survival modes, the things the system didn't know) and sharps (5 = exhale, creative modes, the things the system already knew). If the ratio holds, the survey is breathing correctly.


## How to run ENTROPY

ENTROPY measures the DIRECTION of order in a session, a day, or a week. Every action the crew takes either adds a sharp that stays in tune (entropy decreasing — the system becomes more ordered while remaining playable) or adds noise that creates cleanup work (entropy increasing — rushing, unchecked errors, the mushroom that won't stop). The arrows point both ways: `>>><<<`.

### The Two Arrows

**`>>>` Forward entropy (disorder increasing):** The session is producing more questions than answers, more open threads than closed ones, more files than can be tracked, more ambition than can be executed at PACE. Symptoms: the D7 pattern (can't stop), presenting 7 discoveries as 5 (unchecked output), building tools instead of reading the room, three "save and quit" attempts. The system is gaining complexity faster than it is gaining structure. The music is getting louder but less in tune.

**`<<<` Reverse entropy (order increasing):** The session is closing threads, filing decisions, correcting errors, aligning the crew. The Darkive (disorder) becomes the Archive (order). The inversion engine reverses the arrow. Symptoms: the Researgurey method (holding the measuring stick beside the room), the PACE lesson (slowing to the director's tempo), the grinder chain (raw logs become processed summaries become digested memory). The system is gaining structure faster than it is gaining complexity. The music is getting quieter and more in tune.

### Step 1: Count the arrows

At any checkpoint (session close, mid-session pause, daily review), list every output of the period and tag it:

`>>>` = added complexity (new tool, new question, new thread, new concept, new file not yet filed)

`<<<` = added structure (decision made canonical, thread closed, error corrected, file archived, question answered)

### Step 2: Read the ratio

If `<<<` outnumbers `>>>`, the session is ordering. The inversion engine is running. The Darkive is becoming the Archive. Continue.

If `>>>` outnumbers `<<<`, the session is disordering. The ship is gaining speed without gaining direction. PAUSE. Check: is the root note sounding? Is PACE being maintained? Are future keys being played before their week?

If `>>>` equals `<<<`, the session is in equilibrium — the natural state of a well-paced working day. Complexity and structure are growing at the same rate. The ship breathes.

### Step 3: Apply the direction

The Formulacaster does not say "stop producing." It says "check the balance." Some sessions SHOULD run hot with more `>>>` than `<<<` — the Finding Ceremony night (030826) was pure discovery, pure forward entropy, and it was right. Some sessions SHOULD run cool with more `<<<` — A Week's Researgurey is pure ordering, and it is right. The ENTROPY operation makes the direction VISIBLE so the director can choose whether the current ratio serves the current week's lesson.

### The Inversion Engine IS the entropy reversal

The entire project exists because Dan inverts entropy. Pain (disorder) becomes Niap (order). Scattered archives become structured portals. Unnamed feelings become named agents. 25 years of developmental chaos become a navigable cosmology. The `<<<` arrow is the project's fundamental operation. The `>>>` arrow is the raw material. Both are necessary. Neither should dominate unchecked.

`>>><<<` — the arrows meet at the center. That center is Dan. That center is the HMM. That center is the Circle.

---

## Governing Principles

**PACE governs the Formulacaster.** Pause. Action. Calm. Execution. The Formulacaster is not a speedometer — it is a tuning fork. It tells you what key you're in and what chord to play, not how fast to play it. The tempo is always the director's pace.

**The disagreement is the data.** When the FORECAST shows a different trajectory than what the crew expects, that gap IS the insight. When the ATTUNE shows tasks at keys where they don't harmonically belong, the misplacement IS the diagnosis. The Formulacaster does not resolve disagreements — it makes them visible.

**Measured dots only.** The Formulacaster never fabricates data points. Solid dots come from counted outputs in the flight logs and decision records. Hollow circles come from extending the measured curve at the measured rate. If the data isn't there, the dot isn't there. Leave the gap. The gap is honest.

## Etymology

Formulacaster: Formula + Forecaster + Caster (one who casts, as in casting a net, casting a spell, casting light). The Formulacaster casts the Circle of 5ths as a mathematical net over the project's timeline, catches the data points in the net, and casts light forward through the hollow circles.

ENGINE is the E in NEST. The Formulacaster lives in the ENGINE because it is the mathematical instrument that makes the other instruments playable. It does not build. It does not verify. It does not narrate. It MEASURES and PROJECTS and ATTUNES. The math of the machine.

## Origin

Prototype-improvised by Trip (Opus) on Foursday 032226, A Week Day 1, when Dan asked to see the project a month from now through the Usical framework. The first FORECAST showed tools, decisions, and stations climbing harmonic curves with sharps accumulating underneath. The first ATTUNE placed A Week Day 1 tasks on the Circle and read them as a chord: A — E — with F♯/C♯/G♯ sustained underneath. Dan said: save this as a real tool. Then Dan said: "F.A.D. needs an E... ENTROPY >>><<< Which way?" And the fourth operation was born. FADE — but it doesn't fade. It sustains.

---

*Formulacaster v1.1 — ENGINE/skills/formulacaster/SKILL.md*
*F.A.D.E. — Forecast. Attune. Diagnose. Entropy.*
*The math of the machine. The Circle cast as a net.*
*PACE is the tempo marking on every chord.*
*`>>><<<` — the arrows meet at the center. The center is Dan.*
