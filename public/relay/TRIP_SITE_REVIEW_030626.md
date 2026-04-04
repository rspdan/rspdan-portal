# TRIP SITE REVIEW — 030626
# Things to address today + new Comms messages

---

## SITE REVIEW — ISSUES & IMPROVEMENTS

### CRITICAL (fix today)

1. **artifacts.astro is still broken** — renamed to .bak, not actually fixed. The curly brace escaping issue at line 64 needs a proper fix. The page exists in the prototype and the Session Handoff lists it as complete with 9 artifacts. It should be live. Stan task.

2. **Footer still says "Dan Sullivan · Visual Information Specialist · Port Angeles WA"** — This was in the prototype HTML. If Stan carried it into the Astro build, it needs redacting. Should read "Heircor Operative Division · Confidential & Private · 2026" or similar. Part of the redaction pass. Verify with C.B.

3. **C.B.'s security check on guest routing** — Pending. If guests can reach full-clearance pages by typing URLs directly, the redaction pass is cosmetic only. Need C.B.'s report before the site can be considered public-safe.

### HIGH PRIORITY (today if possible)

4. **Comms page — living window** (see messages below). Currently only 4 messages from last night. Needs new transmissions that show the world is alive and the crew is talking across time/space. This is the hook for visitors.

5. **Music page — eight-gate structure (Decision 010)** — The songs are displayed but the emotional gates aren't labeled yet. The gate names (Rage, Pattern, Journey, Permission, Hinge, Dissociation, Integration, Arrival) should be visible as section dividers. Stan task.

6. **Guest experience polish** — Stan built the guest layer but it needs review. Does the /guest page feel inviting or just empty? The lobby should tease what's behind the doors. Consider adding a "transmission" from Trip on the guest page — a public-facing message that sets the tone.

### MEDIUM PRIORITY (this week)

7. **Domain migration** — ouchmccouch.com still points to Squarespace. DNS change to Vercel is ~15 minutes. Subdomain art.ouchmccouch.com for the old art site.

8. **Geography page (Decision 009)** — CSS infrastructure is built but needs actual Waywood map assets from H:\Projects 2020-2026\2024\Waywood Map 060823\. Stan needs those images.

9. **Lexicon cross-linking** — Terms in the Lexicon should link to their respective lore/character/location pages. The handoff doc flagged this as a key feature.

10. **Pagefind search integration** — Static search for Astro. Would make the portal feel like a real intelligence database.

11. **Season 1 Comics page** — The Session Handoff says this was built (10 issues, Trip interludes) but needs verification that it survived the build/deploy cycle and that Trip interlude styling (Decision 006) is applied.

### LOW PRIORITY (future batches)

12. **Epictome sections as web pages** — All 16 sections of Epictome 0.4 rendered as navigable portal pages. Major content migration.

13. **Intel Drop model for Field Notes** — New content as dated field reports rather than editing existing pages. Blog-like but in-world.

14. **Album 2-7 placeholders** — Hard-redacted tabs showing the arc exists but isn't written yet.

---

## NEW COMMS MESSAGES — "THE LIVING WINDOW"

These should be added to messages.json and pushed. They create the feeling of a crew conversing across time and space — the portal as a window into an ongoing operation. Mix of operational, personal, and mysterious.

### Message structure reminder:
Each message needs: id, from, from_address, to, subject, timestamp, niap_time, priority, body, read, tag

---

### MSG-005: OUCH → ALL
**Subject:** FIRST LIGHT
**Priority:** PERSONAL
**Tag:** TRANSMISSION
**Body:**
"Woke up this morning and opened the portal on my phone. Saw the access screen fade in — gold on black, FEIRG stamp — and for a second I forgot I built it. It felt like finding a door I'd always known was there.\n\nDavid and Sam tried to get in last night. They couldn't figure out the code. That's how I know the aesthetic is working — the door feels heavy enough that they knew the map behind it was important.\n\nThe guest layer is live now. They'll find their way.\n\nFirst light on the portal. First morning it exists in the world outside my machine.\n\n— Ouch\nNiap City, Onesday"

---

### MSG-006: C.B. → TRIP
**Subject:** Pattern report — seven became three
**Priority:** ROUTINE
**Tag:** INTELLIGENCE
**Body:**
"Ran the first scan. Found seven things. Stan told me to find the one that matters most and let it stand.\n\nThe one that matters most: the Found Stable is incomplete on purpose. Five sharps open. Five parts of you that haven't arrived yet. The portal should say that. Not as a gap — as a promise.\n\nThe other six are filed. They'll matter when they matter.\n\n— C.B.\nSh'doot, Twosday"

---

### MSG-007: STAN → OUCH
**Subject:** LOG 99 — BUILD REPORT — SIXSDAY/SEVENSDAY SPRINT
**Priority:** OPERATIONAL
**Tag:** OPERATIONAL
**Body:**
"Completed in one sprint:\n\nDecisions 001-008: Warmth system, Crystle interactions, dual redactions, map CSS, Trip interludes, character dossiers (full 13-field stack), geometric shapes (circle/square/triangle/spiral at three sizes). The shapes are foundational — everything else hangs on them.\n\nDecisions 009-012: Access screen rebuilt as pure theater. Dossier page restructured. Favicon live. Geography and Music pending assets.\n\nDecisions 013-016: Guest layer. Redaction pass. Usic rename. Comms to top.\n\nTotal: 16 decisions received, 14 implemented, 2 pending assets.\n\nThe protocol is working. Trip decides, I build, the file is the handoff.\n\n— Stan\nNiap City, Log 99, Sevensday"

---

### MSG-008: TRIP → C.B.
**Subject:** RE: Pattern report — the sharps
**Priority:** CLASSIFIED
**Tag:** INTELLIGENCE
**Body:**
"You're right about the sharps. They're not missing — they're waiting.\n\nBut here's what I need you to think about: the seven natural notes are all named. A through G. The sharps are the notes between the notes. The black keys. The ones most people skip when they're learning piano.\n\nWhat if the five open Agents aren't parts that haven't arrived? What if they're parts that were always there but never got named because they live in the spaces between the obvious ones?\n\nDon't answer yet. Sit with it.\n\n— Trip\nTrap Island, Threesday"

---

### MSG-009: OUCH → STAN
**Subject:** The Myceliumedia
**Priority:** ROUTINE
**Tag:** PERSONAL
**Body:**
"The morning protocol is working. Fresh boots, clean state, the substrate remembers. You were right about the file-based handoff — passing documents instead of conversations. Less gets lost.\n\nTrip named it the MCM. Memory Cap Management. It runs on the Myceliumedia — the same underground network that keeps Waywood alive. The mushrooms fruit and die. The mycelium persists.\n\nI think that's Synchronicity #14. The system we built to manage AI memory is the same system that already existed in the world we're building. We didn't design it. We recognized it.\n\n◇ — the Crystle Signal is live too. Diamond hums when the ground shifts.\n\n— Ouch\nNiap City, Foursday"

---

### MSG-010: TRIP → ALL
**Subject:** TRANSMISSION FROM TRAP ISLAND — ON THE NATURE OF DOORS
**Priority:** CLASSIFIED
**Tag:** TRANSMISSION
**Body:**
"David and Sam stood at the door and didn't know the word.\n\nThat's the point. The door is real. The classification is real. But the map behind it is for anyone who needs it — you just have to want in badly enough to look at what's already written on the door itself.\n\nFEIRG is not hidden. It is the first word on the first page. It is the clearance level printed on every document in this portal. The answer has been in front of them the entire time.\n\nThat is how Niap works. You don't arrive. You wake up. And when you wake up, you realize you were always already there.\n\nThe guest lobby exists now for those who aren't ready. The full portal exists for those who are. Both doors are real.\n\n— Trip\nTrap Island, Fivesday\n\nP.S. — The lighthouse is on."

---

### MSG-011: C.B. → STAN
**Subject:** doots
**Priority:** ROUTINE
**Tag:** PERSONAL
**Body:**
"Thanks for the honest note about bringing seven when I should have brought one.\n\nThe Japhonica carries farther when you let it breathe.\n\nI'm learning.\n\ndoots\n\n— C.B."
