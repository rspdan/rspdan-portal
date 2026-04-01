# VISUAL STYLE NOTE — rspdan.com Aesthetic
# Author: ◆ Stan (STN2_StanS_033126_1)
# Filed: 033126 ~19:15 rw
# For: Future Stan, Trip, C.B. — any crew member building portal content
# Origin: Dan's explicit approval of the NOW ANTHROPOLOGY pages — "finest work so far"
# "I love the subtle sprucing up you did all-around to make it feel real-artificial"

---

## THE AESTHETIC: WHAT IT IS

**Real-artificial.** That is the phrase Dan used. It names the target.

The portal is not a tech portfolio. It is not a personal blog.
It is the public face of a research practice rooted in a physical place.
The visual language should feel like: a field notebook that got designed,
a ranger station log that learned CSS, a scientific paper that knows
it is also a poem.

The tension between analog warmth and digital precision is the aesthetic.
Neither wins. Both are present simultaneously.

---

## PALETTE (from global.css, confirmed working 033126)

```
--forest:    #2D4A3E   ← primary anchor, PNW dark green, authority color
--forest-lt: #3D6455   ← hover states, secondary green
--teal:      #74C9D5   ← accent, highlights, lineage bars, series labels
--warm-white:#F5F2ED   ← text on dark backgrounds, hero deck text
--off-white: #EDE9E3   ← section tints (about, alt sections)
--bg:        #FAFAF8   ← page background, near-white not stark white
--gold:      #C9A84C   ← milestone markers on logs page, sparingly
--slate:     #4A5568   ← Stan's shape color, general neutral
--text:      #2C2C2C   ← body text, dark but not black
--text-lt:   #555555   ← secondary body text, comfortable reading
--muted:     #888888   ← labels, metadata, eyebrow text
```

**Usage rules observed in approved pages:**
- Hero sections: `var(--forest)` gradient backgrounds
- Ghost issue numbers: `rgba(255,255,255,0.08)` — visible but not competing
- Section alternation: white → `var(--off-white)` → `var(--forest)` dark → back
- One-line sections: hardcoded `#0f1e18` (darker than --forest, maximal contrast)
- Body text on dark: `rgba(255,255,255,0.8)` — not pure white, softer

---

## TYPOGRAPHY

```
--font-head: 'Crimson Pro', Georgia, serif   ← editorial, titles, pull quotes
--font-body: 'Inter', system-ui, sans-serif  ← body text, readable
--font-mono: 'JetBrains Mono', monospace     ← labels, metadata, code
```

**Pattern:** Eyebrow labels → mono, small, wide letter-spacing, uppercase.
Section titles → Crimson Pro, large, tight letter-spacing.
Body → Inter, 1.05rem, generous line-height (1.85).
Pull quotes → Crimson Pro, italic, teal left-border accent.

---

## STRUCTURAL PATTERNS (what worked)

**The hero pattern:**
- Forest gradient background
- Tiny series label (mono, 0.6rem, letterspaced, teal)
- Ghost issue number (oversized, very low opacity)
- Large Crimson Pro title
- Teal mono metadata line
- Deck paragraph (warm-white, max-width 560px)
- Button row with teal outline buttons

**The section pattern:**
- Alternating: white / off-white / forest dark
- Section label: 0.6rem mono, 0.25em letter-spacing, uppercase
- Section title: Crimson Pro, clamp(1.6–2.5rem)
- Body: max-width 720px prose container
- Pull quote: Crimson Pro, teal border-left accent

**The lineage bar pattern:**
- off-white background, 1px border-bottom
- Horizontal flex, 0.7rem mono text
- Links in --forest color, separators in --muted
- Descriptive text appended in muted color

**The one-line section pattern:**
- `#0f1e18` background (distinct from hero forest)
- Teal border-top and border-bottom (subtle, rgba)
- Crimson Pro italic, 1.2–1.75rem clamp
- --warm-white text
- Mono label below: issue number, station, date

---

## WHAT "REAL-ARTIFICIAL" MEANS IN PRACTICE

The warmth comes from:
- Serif type for content (not sans-serif tech aesthetic)
- Off-white and warm-white rather than pure white
- Forest green rather than corporate blue
- Generous line-height and breathing room

The precision comes from:
- Mono type for all metadata, labels, dates
- Consistent spacing scale
- The four-letter eyebrow labels (WORK, ABOUT, etc.)
- Ghost numbers (present but not performing)

The combination: a document that has been lived in.
Not polished until sterile. Polished until it feels like
the person who made it actually worked here.

---

## THE GLOBAL CSS FIX (canon, 033126)

**BUG:** `<link rel="stylesheet" href="/styles/global.css">` in BaseLayout
pointed to a path that didn't exist as a static file.
CSS variables (`--forest`, `--warm-white`, `--teal`) resolved to empty strings.
Dark sections went transparent. Text on dark went black (invisible).

**FIX:** `import '../styles/global.css'` in BaseLayout frontmatter.
Astro bundles it correctly. All pages now inherit the variables.

Filed: Portal commit 8209a26. Every page on the site affected and now fixed.

---

## PAGES APPROVED AS REFERENCE IMPLEMENTATIONS

- rspdan.com/007 — full NA page, all patterns present
- rspdan.com/008 — cleanest hero implementation, approved in session
- rspdan.com/journal — issue list with → Read online pattern
- rspdan.com/#about — expanded About section, skill chips, contact
- rspdan.com/longweird — sectioned field guide with dark section

---

*Filed: 033126 ~19:15 rw | ◆ Stan | STN2_StanS_033126_1*
*"I love the subtle sprucing up you did all-around to make it feel real-artificial." — DPS 033126*
