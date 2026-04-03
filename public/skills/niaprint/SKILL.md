---
name: niaprint
description: NEST Intranet Publication Aesthetic — typewriter-soul design standard for intranet documents and printed materials. Use when designing NiaPrint documents.
---

# NIAPRINT STANDARD — DESIGN SKILL
# NEST Intranet Publication Aesthetic
# Filed by: Stan (◆ Sonnet) | Fivesday 032326 | OHC Actual
# Status: CANONICAL — NiaPrint is the intranet house style
# Classification: CREW EYES · HEIRCOR FEIRG

---

## WHAT NIAPRINT IS

NiaPrint is the NEST's intranet publication standard — the visual language
for all crew-facing documents, field reports, trail markers, and intranet
pages. Named for Niap (the inverted world) and for print (the physical
medium that remembered things before digital did).

NiaPrint looks like an intelligence dossier printed on aged newsprint:
navy operational layer underneath, cream editorial surface on top,
typewriter body text, authoritative display headings, and a live teal
pulse where active/fresh information arrives. It remembers where its
Heart is from while remaining fully functional as a modern HTML document.

NiaPrint is NOT the Heircor Op. dark dossier (navy bg, gold on dark),
the portal's warm-2 style (Crimson Pro italic), the OHC Demo style
(clean slides), or the wayside panel style (large format field guide).
NiaPrint IS all of those things' editorial cousin — the publication
that sits on the crew's desk, gets coffee rings on it, and still
contains the most important information in the building.

---

## THE COLOR SYSTEM

All NiaPrint pages use this exact palette. Never substitute.

  --navy:    #0D0D1A   page background, nav strip, operational layer
  --paper:   #F0E8D0   main content surface, aged cream newsprint
  --paper2:  #E8DEC4   sidebar surface, slightly darker cream
  --ink:     #1A1410   body text, near-black
  --gold:    #C9A84C   accent, sidebar labels, operational metadata
  --gold2:   #A8813A   secondary gold, subdued labels
  --crimson: #8B0000   masthead title accents, section rules, stamps
  --teal:    #01FFCD   OLO (the 14th color) — live/fresh/active only
  --dim:     #5A4E3C   muted body text, metadata, subtitles
  --rule:    #B8A882   horizontal rules, dividers, border accents

The masthead title has 2-3 letters in crimson — the publication's
identity anchors. Teal (#01FFCD = OLO) is reserved for live, fresh,
or active content only — never use it for static elements.
Gold carries operational metadata: commit hashes, issue numbers, timestamps.
Crimson carries structural authority: section rules, stamps, pattern numbers.

---

## TYPOGRAPHY STACK

Google Fonts import (load in this exact order):
  Playfair Display — ital,wght@0,700;0,900;1,400
  Special Elite
  Share Tech Mono
  Bebas Neue

PLAYFAIR DISPLAY — editorial authority, narrative voice.
Used for: publication masthead name (clamp 28-80px, weight 900),
article titles (24-28px, weight 700), pull quotes (italic),
issue decks and subtitles in italic.

SPECIAL ELITE — typewriter soul, the printed era.
Used for: all body prose (13-15px, line-height 1.7-1.75),
sidebar thread titles, body content everywhere text is meant to be read.
This is the voice of the field report.

SHARE TECH MONO — the operational layer.
Used for: all technical metadata (dates, commit hashes, IPs, file paths),
timestamps, bylines, attribution lines, top classification bar,
footer text, section identifiers (9-11px, letter-spacing 0.07-0.15em).

BEBAS NEUE — structural headers, navigation.
Used for: nav strip labels (12-13px, letter-spacing 0.1em),
section rule text (11-13px, letter-spacing 0.15em),
sidebar panel headers (14-16px), pattern numbers (18-24px display).

---

## FIVE-ZONE DOCUMENT STRUCTURE

Every NiaPrint document has five zones in this fixed order:

ZONE 1 — CLASSIFICATION BAR (top strip, ~24px height)
Three columns: left = classification stamp (crimson, all caps),
center = edition info (monospace, muted), right = live clock (monospace).
Background: paper. Border-bottom: 1px solid rule.
The clock updates every second via JavaScript with Niapian date + rw suffix.

ZONE 2 — MASTHEAD
Large publication name in Playfair Display, centered, all caps, weight 900.
Key letters crimson, rest ink. Tagline below in Special Elite, muted.
Meta row: two columns (from/filed vs to/arriving), 1px center divider,
Share Tech Mono 10px muted. Background: paper. Border-bottom: 3px double ink.

ZONE 3 — NAV STRIP
Navy background. Bebas Neue. 2px solid gold bottom border.
Tabs: paper-colored text, hover gold bg/ink text, active tab crimson bg.
Right-side indicator: navy bg, teal text, pulse dot animation.

ZONE 4 — THREE-COLUMN LAYOUT (the core)
Grid: sidebar (180-240px) | main content (1fr) | tide column (220-260px).

  SIDEBAR — paper2 background, 2px solid ink right border.
  Panel headers: Bebas Neue, crimson, bottom border.
  Thread items: color-coded left borders (rule=open, gold=noted,
  crimson=flag, teal=fresh, #3a7a3a=done/solved).
  Optional: issue tracker, bridge commit log, color legend.

  MAIN CONTENT — paper background.
  Components: kicker (Share Tech Mono crimson letter-spaced), article title
  (Playfair bold), deck (Playfair italic muted), byline (Share Tech Mono muted),
  section rules (Bebas Neue crimson with flanking 1px lines), body prose
  (Special Elite), pull quotes, field notes, pattern blocks.

  TIDE/FLEET COLUMN — navy background, 2px solid gold left border.
  Header: ink bg, teal title (Bebas Neue 17px), animated wave bar.
  Body cards: #121220 bg, 1px #2a2a3a border, hover teal border.
  Three card types by left border: fresh (teal), named (gold), flag (crimson).
  Cards animate in with staggered translateX transition on page load.

ZONE 5 — FOOTER
Background: ink. Border-top: 3px double gold.
Three sections: left description | center OLO mark (teal) | right next step.
Share Tech Mono 9px, dim color.

---

## KEY COMPONENTS — COPY-PASTE REFERENCE

THE SECTION RULE — use between every major article section:
  .srule { display:flex; align-items:center; gap:10px; margin:18px 0 14px; }
  .srule span { font-family:'Bebas Neue'; font-size:12px;
    letter-spacing:0.15em; color:var(--crimson); white-space:nowrap; }
  .srule::before, .srule::after { content:''; flex:1; height:1px;
    background:var(--ink); }
  Never use h2/h3 in article body. Only section rules between sections.

THE PULL QUOTE — for canonical statements and memorable moments:
  Left border 4px solid crimson. Right border 1px solid rule.
  Background paper2. Text: Playfair italic 13-16px ink.
  Attribution: Share Tech Mono 9px dim letter-spaced.

THE FIELD NOTE — for operational dispatches and fleet observations:
  Background ink (reversed). Font Share Tech Mono 11px.
  Header label: gold 9px letter-spaced. Bold text within: teal.

THE LIVE CLOCK — in every page's classification bar:
  function tick(){ const s=new Date().toLocaleTimeString('en-US',
    {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    document.getElementById('clock').textContent='FIVESDAY 032326 · '+s+' rw'; }
  setInterval(tick,1000); tick();

THE WAVE BAR — in every tide column header:
  height:2px; background:linear-gradient(90deg,transparent,teal,transparent);
  animation: ws 3s ease-in-out infinite; position:absolute; bottom:0;
  @keyframes ws { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

---

## HOW TO BUILD A NEW NIAPRINT PAGE (10 steps)

1. Add the font import link for all four families.
2. Paste the CSS variables block (:root with all 10 colors).
3. Paste the five-zone structural CSS (masthead, nav, layout, sidebar,
   main, tide column, footer, and the six component classes).
4. Choose a masthead name. Color 2-3 letters crimson.
5. Write the classification bar, masthead, meta row, and nav strip.
6. Populate the sidebar panel with status items, using color-coded
   left borders to signal thread state.
7. Write the main content in Special Elite prose, using section rules
   between major sections instead of headings.
8. Add pull quotes and field notes where the content calls for them.
9. Populate the Tide/Fleet column with body cards (fresh/named/flag).
10. Add the live clock and card animation scripts. Done.

The skeleton is approximately 80-100 CSS lines. All creative work
goes in the content. The aesthetic is already there.

---

## KNOWN NIAPRINT PUBLICATIONS (as of 032326)

  now_anthropology.html          — NOW ANTHROPOLOGY
  trip_trail_marker_032326.html  — NEST TRAIL MARKER
  longweird_field_report_032326.html — LONGWEIRD FIELD REPORT
  nest_session_capture.html      — NEST SESSION CAPTURE (rebuilt 032326)
  save_states_field_guide.html   — SAVE STATES FIELD GUIDE
  niaprint_catalogue_032326.html — NIAPRINT CATALOGUE

---

## CANONICAL STATEMENT

NiaPrint is what the NEST produces when it is publishing for itself —
when the crew is the audience, the material is real, and the form needs
to honor both the operational precision of the infrastructure and the
creative depth of the project. It runs on GOG1. It ticks. It remembers.

*Filed: C:\STAN\SOURCE\nest-bridge\ENGINE\skills\niaprint\SKILL.md*
*Stan (◆ Sonnet) | STN2 at OHC Actual | Fivesday 032326*
*"The typewriter soul survived the digital age by becoming the interface."*
