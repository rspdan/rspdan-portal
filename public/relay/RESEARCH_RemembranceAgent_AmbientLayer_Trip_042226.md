# RESEARCH — Remembrance Agent as Theoretical Parent of NESTNET

**Filed:** 042226 Wednesday ~20:20 PT · F Week Pass 2 Wednesday · Waywood Cycle 2 Day 4 · Night Shift
**Crew:** Trip · ODT · Opus 4.7
**Purpose:** Research-only, per Dan's Night Shift direction 042226 20:00 PT. Do NOT build tonight. This document captures the manufacturing→nature reading of current NESTNET and sketches what the ambient-retrieval evolution would look like, so future Crew starts informed.

---

## 1. Dan's Teaching (canon source for this document)

*"This is why I studied manufacturing and THEN nature. One copied the other, one does it better. /meta-dates We just did the manufacturing bit, now we do nature."* — DPS 042226 20:00 PT

Manufacturing = designed systems, specified processes, explicit steps, human-assembled.
Nature = evolved systems, emergent processes, implicit coordination, self-organizing.
**Manufacturing copies nature. Nature does it better.**

Filed to memory slot HOTBAR 5/5 [H5] 042226 ~20:10 PT.

---

## 2. The Remembrance Agent — What It Is

Developed by Bradley J. Rhodes under Pattie Maes at the MIT Media Lab, 1996–97. Originally an Emacs plugin, later extended to wearable computers (Rhodes ISWC 1997).

**Rhodes's own 1997 definition (paraphrased from Kotipalli's quotation):** a program that augments human memory by displaying a list of documents that might be relevant to the user's current context. Runs continuously without user intervention. Unobtrusive interface — user pursues or ignores suggestions at their discretion.

### Core properties (from Matuschak + Kotipalli readings):

1. **Always-on, continuous, background.** Not query-driven. Runs without being called.
2. **The current context IS the query.** Last N words around the cursor (user-tunable scopes: 10 / 50 / 1000 words).
3. **Multiple sources unified into one index.** Email, notes files, documents — all ingested and merged.
4. **Contextual metadata weighted.** Not just text-match — also location, date, person, subject tags.
5. **Top-N one-line summaries.** Bounded output (typically 3–5), each a legible one-liner, clickable for full doc.
6. **Atomic documents work better.** One-idea-per-file maps better to one-line summaries, more likely to be a good hit, faster to peruse. (Evergreen-note discipline alignment.)
7. **Unobtrusive margin UI.** Doesn't interrupt. Sits beside the primary work surface.
8. **Passive user-side memory-map extension.** Over time, the user's own mental recall of older documents strengthens because the RA keeps surfacing connections. Kotipalli's 1-year experiment and the 25-year HWD user both report this. The tool extends the user's own memory, not just replaces it.

### Core architecture (from Kotipalli's reimplementation):

```
loadDocuments()        → ingest from all sources (Gmail, Drive, local, etc.)
indexDocuments()       → TFiDF preprocessing, windowing (per-document)
determineSuggestions(Query) → top-N ranked by weighted similarity
                              (text TFiDF × context factors)
```

Context object carries: location, person, subject description, date.
Keystroke buffer → query every N seconds → top documents surfaced in margin.

---

## 3. NESTNET As-Built (the manufacturing version)

Current NESTNET (as of 042226) is a high-quality INDEX over a unified multi-source corpus — but exposed only through an on-demand query API. It has the content of the RA but not the ambient behavior.

### Comparison matrix

| Property | Remembrance Agent (nature) | NESTNET as-built (manufacturing) |
|---|---|---|
| Triggering | Ambient, continuous, automatic | On-demand, explicit query only |
| Query source | Current context (cursor buffer) | User-typed string |
| Sources indexed | Email + notes + docs | Bridge, MAIL, relay, logs, Gmail, Drive, memory, conversations (808+ docs) |
| Merging | Single unified index | Single unified index ✓ |
| Context metadata | Location, date, person, subject (weighted) | Query-string only |
| Surface | Margin sidebar, one-liners | `/api/search?q=...` JSON |
| User intervention | None required | Must remember to call |
| Output | Top-N one-line summaries | JSON results (machine-first) |
| User-side effect | Passive memory-map extension | Explicit recall required each time |

### What NESTNET has already that matches the RA:
- Unified multi-source index — **strong**
- Corpus integrity, NPS Wayside methodology — **strong**
- Cross-system search across Bridge + Gmail + Drive + logs — **strong** (broader than RA's original scope)

### What NESTNET is missing (the nature layer):
- **Ambient, always-on triggering.** Must be explicitly called.
- **Current-context-as-query.** Has no notion of "what is the crew doing right now."
- **Margin-surface UI.** Output is machine-readable only; no one-liner sidebar visible at work time.
- **Context metadata weighting.** Query is text; crew context (who, station, session phase, topic thread) isn't scoring input.
- **Zero-intervention surfacing.** Canon filed in RELAY/ doesn't surface AT the moment of relevance.

This is the exact failure mode of every Villebaum today: canon exists, NESTNET would find it, but nobody called the query at the moment before an un-instrumented value was stated. The manufacturing gate has to be walked through manually. The nature version walks through you.

---

## 4. What the Nature-Version of NESTNET Would Do

Ambient NESTNET — not building tonight, but sketching for future Crew:

### Trigger pattern
- **Phase change ambient query.** Every RAM append, every Living Map heartbeat, every LIAM Graft draft — the last N words of that surface become an automatic query.
- **Cursor-context in /nest and /skills pages.** When a crew member is composing something in a crew-only page, ambient suggestions fire.
- **Pre-send gate on outbound messages.** Before Gmail draft goes out, or before Bridge commit is pushed, an ambient pass checks for relevant canon (this would have rendered the Blanche Transfer rule at the moment of Amanda-letter pronoun audit — preventing a structural near-miss).

### Surface pattern
- **Margin sidebar in Make-It-Visible pages.** `/nest` displays "relevant canon: [top 3–5 one-liners]" beside active work.
- **One-line summaries with corpus-path links.** Click to read full, just like RA's click-to-peruse.
- **Silent dismissal available.** Crew can ignore. Nothing blocks.

### Context-metadata weighting
- Crew member (Trip / Stan / C.B. — different crew may get different weightings)
- Station (ODT / STN2 / GOG1 / DPSL — station-specific canon up-weighted)
- Session phase (CONTACT / STORY / TELL-ING / SHEET — phase-relevant rules up-weighted)
- Topic thread tags from manifest (Amanda / Waywood / NA / Fleet — thread-specific canon up-weighted)
- Recency decay (today's canon > 40-day-old canon, but not absolute)

### Corpus-as-context extension
- Manifest RAM appends feed the index live (already the path via conversations.json ingestion, but right now runs at session close not continuously)
- LIAM Grafts feed the index live
- Every Bridge commit feeds the index on push
- Result: by the next RAM append, canon filed earlier this turn is already ambient-searchable

---

## 5. Dan's "it's both and more" Framing

Dan's 042226 afternoon framing: *"The things we're building are all themed around this functioning behind the scenes for us instead of being a tool we can only run when needed. It's both and more."*

The nature-version doesn't REPLACE query-driven NESTNET. The query API stays — crew members call it when they know what they want. The ambient layer ADDS surfacing for when crew don't know what they don't know. Both channels, both true, both useful.

"And more" — the Make-It-Visible 7+1 pages are the rendering surfaces. Ambient NESTNET running UNDER those pages is the mycelium layer Dan named on 042126 (the "Myceliumedia" lore entry from waywood-lore). The canon connects:

- `/skills` page renders the rules
- Ambient NESTNET surfaces the rule at the pre-build gate
- Dan's inversion (Cycle 1 pages → Cycle 2 ground-truth) means the SKILL page is ground, the ambient surfacing is emergent work rising from that ground

---

## 6. Not Tonight

Dan's clear direction: **do not build tonight.** This document is research. Tomorrow's Crew (or the Crew after that) reads this and decides, with Dan, what to build first:

- Ambient query trigger on RAM append
- Margin sidebar in `/nest` page
- Pre-send pronoun gate (Blanche-Transfer rule as active check)
- Context metadata weighting layer
- LIAM/Graft/Bridge live ingestion (replacing session-close-only)

Each is buildable incrementally. None needs to be built tonight. What matters tonight is that the reading is filed.

---

## 7. Resources (Dan-provided, archived here for future Crew)

- MIT Media Lab canonical overview — https://www.media.mit.edu/projects/remembrance-agents/overview/ (fetch blocked by robots.txt, referenced via Kotipalli quotation)
- Georgia Tech academic context — https://faculty.cc.gatech.edu/~thad/p/032_40_agents&ubicomp/remembrance-agent.html
- Rhodes ISWC 1997 (wearable RA) — https://www.cs.columbia.edu/~feiner/courses/mobwear/resources/rhodes-iswc97.pdf
- Rhodes & Starner AAAI 1996 (original RA) — https://cdn.aaai.org/Symposia/Spring/1996/SS-96-02/SS96-02-022.pdf
- Kotipalli "Living with a Remembrance Agent" (2020 personal experience, 1-year) — https://p13i.io/posts/2020/05/living-with-remembrance-agent/ (**fetched and read this session**)
- Andy Matuschak notes (tools-for-thought reading) — https://notes.andymatuschak.org/zPDNGzz9zuEhFgrvEUZ4XfE (**fetched and read this session**)
- zzkt GitHub Lisp/Emacs implementation — https://github.com/zzkt/remembrance-agent

Local cross-reference: `C:\STAN\LNL\042226\` (today's local work tree)

---

## 8. Filing

- Memory slot HOTBAR 5/5 [H5] rotated to Manufacturing→Nature canon (042226 20:10 PT)
- Manifest RAM-015 records the teaching (`C:\STAN\LNL\042226\MANIFEST_Trip_042226_Afternoon.md`)
- This file pushed to Bridge as RELAY/ research artifact

<4
— ◈ Trip · ODT · 042226 ~20:20 PT · Night Shift research filed, not built, passed forward
