# NOW ANTHROPOLOGY — VISUAL STANDARD GUIDE
# For: All Crew — ALL STATIONS — ALL FUTURE ISSUES
# Filed: Stan (NEST.01) | 040526 11:24 -07:00 COMPUTED | OHC 5G | B Week Day 1
# Authority: Dan Sullivan (DPS)
# Portal commit: abb305d

---

## THE STANDARD

NA-001 is the visual standard. Every subsequent issue must match it.
Source file: `src/pages/journal/001.astro`
The <style> block at the bottom of 001.astro is the canonical CSS.
Do not alter it without explicit Go from Dan.
Do not write a new style block from memory or preference.
Copy from 001. Extend only for layout classes the content requires.

---

## WHAT WENT WRONG (filed 040526 for crew reference)

NA-001 through NA-008: written correctly using the standard CSS from 001.astro.
NA-009 through NA-013: written with a bespoke redesigned CSS block. Done without being asked.

Changes that broke the standard:
  - Hero gradient angle and colors changed (#0a1a12 → #0f1e18 vs the standard #1a2e28 → var(--forest))
  - Hero border: 2px solid var(--teal) → 1px solid rgba (nearly invisible)
  - Issue number ghost color: white-tinted → teal-tinted
  - Section padding: 5rem → 3.5rem
  - Section alt background: var(--off-white) cream → rgba(45,74,62,0.04) (near-invisible)
  - Meta line color: var(--teal) → var(--muted)
  - Pull quote text color: var(--forest) → var(--teal)
  - Body paragraph sizing and line-height removed from style block
  - Multiple CSS variables replaced with hardcoded hex values

By NA-013 the divergence was 244 lines of changed CSS across five files.
Dan named the fuckup. Stan fixed it 040526.

---

## THE CANONICAL STYLE BLOCK

Copy this EXACTLY into every new NA issue. Do not modify the core classes.
Add bespoke classes (finding, qa, evidence, pub-block) BELOW the core block
if the issue content requires them. Never replace the core block.

```css
/* === HERO === */
.na-hero{padding:6rem 0 4rem;background:linear-gradient(160deg,#1a2e28 0%,var(--forest) 60%);border-bottom:2px solid var(--teal);}
.na-series{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--teal);margin-bottom:0.75rem;}
.na-issue-num{font-size:5rem;line-height:1;color:rgba(255,255,255,0.08);letter-spacing:-0.05em;margin-bottom:-1.5rem;font-weight:700;}
.na-title{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.5rem);color:var(--warm-white);line-height:1.15;margin-bottom:1.25rem;}
.na-meta{font-size:0.7rem;letter-spacing:0.12em;color:var(--teal);margin-bottom:0.75rem;}
.na-deck{font-size:1rem;color:rgba(255,255,255,0.75);max-width:560px;line-height:1.8;margin-bottom:2rem;}
.na-hero-links{display:flex;gap:1rem;flex-wrap:wrap;}
.na-hero .btn-outline{color:var(--teal);border-color:var(--teal);}
.na-hero .btn-outline:hover{background:var(--teal);color:var(--forest);}

/* === LINEAGE BAR === */
.na-lineage{background:var(--off-white);border-bottom:1px solid var(--border);padding:0.75rem 0;font-size:0.7rem;}
.na-lineage .container{display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;}
.na-lineage__link{color:var(--forest);text-decoration:none;}
.na-lineage__link:hover{text-decoration:underline;}
.na-lineage__sep{margin:0 0.25rem;color:var(--muted);}

/* === SECTIONS === */
.na-section{padding:5rem 0;}
.na-section--alt{background:var(--off-white);}
.na-section--dark{background:var(--forest);}
.na-section-label{font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--forest);margin-bottom:0.75rem;}
.na-section-title{font-family:var(--font-head);font-size:clamp(1.6rem,3vw,2.5rem);color:var(--text);margin-bottom:1.75rem;}
.na-section-title--light{color:var(--warm-white);}
.na-section-intro{font-size:1rem;color:var(--muted);margin-bottom:2.5rem;line-height:1.7;font-style:italic;}
.na-prose-container{max-width:720px;}
.na-prose-container p{font-size:1.05rem;color:var(--text-lt);line-height:1.85;margin-bottom:1.25rem;}
.na-section--dark .na-prose-container p{color:rgba(255,255,255,0.8);}

/* === PULL QUOTE === */
.na-pull{font-family:var(--font-head);font-size:1.15rem;color:var(--forest);border-left:3px solid var(--teal);padding-left:1.25rem;margin:2rem 0;line-height:1.6;}

/* === ONE LINE === */
.na-one-line{padding:5rem 0;background:#0f1e18;border-top:1px solid rgba(116,201,213,0.2);border-bottom:1px solid rgba(116,201,213,0.2);}
.na-ol-text{font-family:var(--font-head);font-size:clamp(1.2rem,2.5vw,1.65rem);color:var(--warm-white);max-width:800px;line-height:1.65;margin-bottom:1.5rem;font-style:italic;}
.na-ol-meta{font-size:0.6rem;letter-spacing:0.2em;color:var(--teal);}

/* === DOWNLOADS / BUTTONS === */
.na-downloads{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;}
.btn{display:inline-block;font-size:0.9rem;font-weight:500;padding:0.7rem 1.6rem;border-radius:var(--radius);transition:all 0.2s;text-decoration:none;}
.btn-outline{background:transparent;color:var(--forest);border:2px solid var(--forest);}
.btn-outline:hover{background:var(--forest);color:#fff;}

/* === EXTENDED CLASSES (009+ issues only — add below this line if needed) === */
/* .na-pub-block, .na-finding, .na-finding__num, .na-evidence, .na-qa etc. */
/* These are additive only. They do not replace anything above. */
```

---

## THE THREE RULES

1. COPY FROM 001. Never rewrite the hero, section, pull, one-line, or button CSS from memory.
   Use the file. Read it. Copy the block. Apply it.

2. EXTEND BELOW. If a new issue needs bespoke layout classes (findings, Q&A blocks, evidence),
   add them BELOW the standard block, clearly labeled. Never replace a standard class.

3. VERIFY VISUALLY. After every new NA issue is deployed, open it in Chrome next to NA-001.
   The hero gradient must match. The section alt must be cream, not dark. The pull quote
   must be forest-colored, not teal. If it looks different, the standard was not followed.

---

## THE FIX PROCEDURE (if a future issue drifts)

Script: `D:\STAN\LNL\040526\fix_na_visuals.py`
Method: replaces the <style> block with the standard. Dry run first. Write second. Push.
Run: `python fix_na_visuals.py` (dry run) then `python fix_na_visuals.py --write`

The script is filed and documented. It is not a one-time tool.
If any issue drifts, run the script, verify visually, push.

---

## CSS VARIABLE REFERENCE (what --forest, --teal etc. resolve to)

These are defined in BaseLayout.astro / global.css. Never hardcode their values in NA files.

  --forest:     deep forest green (the primary dark color)
  --teal:       teal accent (#74c9d5 approx)
  --warm-white: warm off-white for hero headlines
  --text:       primary body text color
  --text-lt:    lighter body text (prose paragraphs)
  --muted:      muted gray (metadata, secondary)
  --off-white:  cream/sand for alt section backgrounds
  --border:     subtle border color
  --radius:     border radius (shared)
  --font-head:  display/serif headline font
  --font-mono:  monospace font

If a value looks wrong, trace it to the CSS var definition in BaseLayout.
Do not substitute hardcoded hex — the variable is the source of truth.

---

## VERIFICATION CHECKLIST (before any NA push)

[ ] Hero gradient: 160deg, #1a2e28 → var(--forest), border 2px solid var(--teal)
[ ] Issue number ghost: rgba(255,255,255,0.08), margin-bottom: -1.5rem (overlaps title)
[ ] Meta line: color var(--teal) — not muted, not white
[ ] Section padding: 5rem 0 — not 3.5rem
[ ] Section alt: background var(--off-white) — cream/sand — not near-invisible
[ ] Pull quote: color var(--forest), border-left var(--teal)
[ ] Body prose: 1.05rem, var(--text-lt), line-height 1.85
[ ] Buttons (body): forest color, forest border
[ ] Buttons (hero): teal color, teal border (overridden in .na-hero)
[ ] Open in Chrome next to 001. Match visually before filing SHEET.

---

Filed to: RELAY/STANDARD_RULE_NA_VisualStandard_Stan_040526.md
Fix scripts: D:\STAN\LNL\040526\fix_na_encoding.py (text)
             D:\STAN\LNL\040526\fix_na_visuals.py (visuals)
Source of truth: src/pages/journal/001.astro <style> block
