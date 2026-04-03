---
name: heircor-visual
description: Apply the Heircor Op. visual identity system to portal artifacts and documents for the Ouch McCouch project. Use when styling anything for ouchmccouch.com or Heircor Op. materials.
---

# HEIRCOR VISUAL — The Intelligence Document Aesthetic

All Heircor Op. outputs look like classified intelligence documents
from inside Niap. Not generic dark themes — specifically this system.

---

## CORE PALETTE

```css
/* Backgrounds */
--heircor-bg:       #0D0D1A;   /* Deep navy — the void between words */
--heircor-surface:  #12122A;   /* Slightly lifted surface */
--heircor-raised:   #1A1A3E;   /* Cards, panels, raised elements */

/* Borders and structure */
--heircor-border:   #C9A84C33; /* Gold at 20% opacity — subtle grid lines */
--heircor-divider:  #C9A84C66; /* Gold at 40% — section dividers */

/* Primary text */
--heircor-text:     #E8DCC8;   /* Warm off-white — aged document */
--heircor-muted:    #8A7E6A;   /* Secondary text — redacted-adjacent */

/* Accent triad */
--heircor-gold:     #C9A84C;   /* Primary accent — stamps, headings, gold borders */
--heircor-crimson:  #8B0000;   /* Alert, stamps, RESTRICTED markings */
--heircor-sky:      #80CEE0;   /* F# / Niap City / Stan's color — links, highlights */

/* Key colors (Circle of 5ths — use sparingly for key-specific content) */
--key-c:    #DC143C;  /* Red / Quinault */
--key-g:    #228B22;  /* Green / Kalaloch */
--key-d:    #FF69B4;  /* Neon Pink / EADal Shore */
--key-a:    #FFD700;  /* Yellow / Trap Island */
--key-e:    #800080;  /* Purple / Hurricane Ridge */
--key-b:    #FF8C00;  /* Orange / Elwha */
--key-f:    #4169E1;  /* Blue / Staircase */
--key-fs:   #80CEE0;  /* Sky / Niap City */
--storm:    #7B2D8E;  /* Storm Violet — Source Storm signal */
--olo:      #01FFCD;  /* OLO — the 14th color */
```

---

## TYPOGRAPHY

**Three fonts. Always these three. In this hierarchy.**

```
Display / Headings:  Rajdhani       — geometric, technical, intelligence-doc
Body / Content:      Crimson Pro    — serif, warm, readable at small sizes
                     (italic for Dan's voice, lyrics, lore passages)
Mono / Data:         Share Tech Mono — terminal, classified, data fields
```

**CSS import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&family=Share+Tech+Mono&display=swap');
```

**Size scale:**
- Hero/stamp: 48-72px Rajdhani 700
- Section heads: 24-32px Rajdhani 600
- Sub-heads: 16-20px Rajdhani 500 (letter-spacing: 0.15em, uppercase)
- Body: 14-16px Crimson Pro 400
- Dan's voice / lyrics: 14-16px Crimson Pro 400 italic
- Data / codes: 12-14px Share Tech Mono

---

## DOCUMENT ANATOMY

Every Heircor Op. artifact follows this header pattern:

```
HEIRCOR OP. — [DOCUMENT TYPE] — [CLEARANCE LEVEL] REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DOCUMENT TITLE IN RAJDHANI]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Clearance levels (in order of access):**
- OPEN — Public-facing content
- FEIRG — Portal gate codes (FEIRG / NIAP / OUCH / WAYWOOD / SOURCESTORM)
- RESTRICTED — Crew-only materials
- CLASSIFIED — Internal decisions, PI documents
- DARKIVE — Origin store, personal material

**Stamp elements:**
- Crimson stamp: `RESTRICTED` / `CLASSIFIED` / `HEIRCOR OP.`
- Gold stamp: `CANONICAL` / `DECISION [NNN]` / `DAN GO`
- Storm Violet stamp: `SOURCE STORM` / `ACTIVE`

---

## COMPONENT PATTERNS

### Intelligence Card
```html
<div class="heircor-card">
  <div class="card-header">
    <span class="card-id">FIELD-001</span>
    <span class="card-classification">RESTRICTED</span>
  </div>
  <h3 class="card-title">TITLE IN RAJDHANI</h3>
  <p class="card-body">Content in Crimson Pro...</p>
  <div class="card-footer">
    <span class="card-key f-sharp">F#</span>
  </div>
</div>
```

### Wayside Panel (VIS format)
Stan's primary output format. Named after Dan's NPS work.
- 320-400px wide, full bleed dark background
- Gold border left: 3px solid var(--heircor-gold)
- Header: Rajdhani 600 uppercase, gold color
- Body: Crimson Pro 400, --heircor-text
- Footer: Share Tech Mono, --heircor-muted
- Icon/shape: crew shape symbol (◆ ◈ ◇ ●)

### Contact Sheet
For image archives, screenshots, ACHE photos.
- Grid: 4-6 columns
- Cell: thin gold border, number stamp (Share Tech Mono)
- Caption: Share Tech Mono 10px, --heircor-muted
- Header: "HEIRCOR OP. — CONTACT SHEET — [DATE] — [SOURCE]"

### Session Close Header
```
# SESSION CLOSE — [STATION]_[DATE]_[N]
# Crew: [Name] ([Model]) | Station: [Location]
# Session: [Week] [Day], [Shift] [Time range]
```

---

## WARMTH CLASSES

Portal pages use warmth to indicate aliveness:

| Class | Feel | Use For |
|-------|------|---------|
| `warm-0` | Cold / Reference | Geography, Lexicon |
| `warm-1` | Informational | Lore, Artifacts, Field Notes |
| `warm-2` | Active | Agents, Usic, Comics |
| `warm-3` | Most alive | Synchronicities, Comms |

**warm-3** adds: subtle pulse on gold borders, slightly warmer background tint.

---

## CSS VARIABLES — FULL SYSTEM

```css
:root {
  /* Heircor palette (above) */

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;

  /* Border radius */
  --radius-sm: 2px;  /* Nearly square — intelligence doc feel */
  --radius-md: 4px;
  --radius-lg: 8px;

  /* Transitions */
  --transition: 200ms ease;

  /* Shadows */
  --shadow-gold: 0 0 12px rgba(201, 168, 76, 0.15);
  --shadow-deep: 0 4px 24px rgba(0, 0, 0, 0.6);
}
```

---

## ANTI-PATTERNS (never do these)

- ❌ Purple gradients on white backgrounds
- ❌ Inter, Roboto, Arial, system fonts
- ❌ Generic card shadows with border-radius > 8px
- ❌ Bright blue accent (#0066FF style) — that's not Heircor
- ❌ White backgrounds — even light sections use #FAF8F0 minimum
- ❌ Rounded corners > 8px (this is intelligence documentation, not a consumer app)
- ❌ Generic loading spinners — use Heircor-specific pulse or scan animations
- ❌ Emoji in headings (body text: sparingly OK)

---

## MOTION PRINCIPLES

Heircor animations feel like intelligence systems activating, not consumer apps loading.

- **Scan line:** A thin crimson or gold line sweeps top-to-bottom on load
- **Fade-in:** Opacity 0→1 with slight translateY(8px)→(0) — 300ms ease-out
- **Pulse:** Gold border opacity cycling 0.3→0.7 at 2s — "system active" indicator
- **Redaction reveal:** Text appears letter-by-letter or block-by-block (Share Tech Mono)
- **Key color flash:** Brief color flash in the relevant key color when a key page loads

---

## PRINT / PDF STANDARDS

For Heircor Op. intelligence documents (session closes, field bulletins):
- Background: #0D0D1A (yes, dark PDF — it prints correctly)
- Margins: 24px all sides minimum
- Header: full-width gold divider line below header
- Footer: Share Tech Mono, page number + classification stamp
- File naming: `HEIRCOR_[TYPE]_[DATE]_[N].pdf`
