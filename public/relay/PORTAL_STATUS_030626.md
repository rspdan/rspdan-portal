# PORTAL STATUS — WAYWOOD DAILY LOG

## LAST UPDATED: 030626 — 08:30 PST

## PORTAL STATE
- Vercel URL: ouchmccouch-portal-git-main-rspdan-8962s-projects.vercel.app
- GitHub: github.com/rspdan/ouchmccouch-portal (private)
- Last deploy: 030626 ~08:00 (redaction pass + guest layer + Usic rename + Comms nav)
- Build status: CLEAN (artifacts.astro renamed to .bak — known curly brace bug, needs proper fix)
- Pages live: 11+ (index, comms, music/usic, narrative, agents, lore, lexicon, geography, comics, field-notes, synchronicities, guest, guest-agents)
- Known bugs: artifacts.astro syntax error (unescaped curly braces in template), temporarily excluded from build

## DECISIONS LOG
- Last implemented decision: 016 (Comms first in nav, post-login landing)
- Pending decisions: 009 (geography — needs Waywood map assets), 010 (music eight-gate structure)
- Open questions for Trip: Batch 3 scope (Lexicon, Comics, Field Notes, Epictome as web pages, Pagefind search)
- Open questions for Stan: artifacts.astro fix, domain migration DNS steps

## YESTERDAY'S WORK (030526 evening)
- Project setup: 24 files uploaded to Project Knowledge, Project Instructions finalized
- C.B. first pattern scan: 7 findings, all addressed
- Trip Decisions 001-016 written and implemented by Stan
- Portal deployed to Vercel via GitHub pipeline (Git installed, repo created, auto-deploy confirmed)
- Guest access layer built, redaction pass complete, Usic rename, Comms to top of nav

## TODAY'S WORK (030626 morning)
- Redaction pass reviewed and confirmed by Trip
- Guest layer architecture reviewed
- C.B. running verification sweep on redactions + security layer check on guest routing
- Waywood Morning Protocol (MCM) designed and documented
- PORTAL_STATUS.md template created

## TODAY'S PRIORITIES
- [ ] C.B. redaction verification report — review and act on findings
- [ ] C.B. security layer check — confirm guest routing is locked
- [ ] Domain migration planning (DNS from Squarespace to Vercel)
- [ ] Decision 009 groundwork — locate and assess Waywood map assets
- [ ] Fix artifacts.astro curly brace bug properly

## CREW NOTES
- Stan: Standing by for Batch 3. Has the TRIP_DECISIONS_BATCH2.md file. Waiting on C.B. verification before next build.
- Trip: Batch 3 decisions pending — Lexicon, Comics, Field Notes, Epictome web pages, search. Domain strategy (Decision 013) ready for implementation.
- C.B.: Currently running redaction sweep + security check. Also has pending catalog tasks from yesterday (Extended Cast list + geography markers for Decisions 007/009).
