# PASS 1 — BACKTRACK MAP
# Session: STN2_NEST01_StanS_040426_1
# Filed: Stan (NEST.01) | 040426 ~12:35 rw | E Week Day 13 — COMPUTED
# Station: Nest Actual | SSID: VZW_HOTSPOT (verified 12:29:41)
# Source: D:\STAN\LOG\040426\LOG_STN2_StanS_040426_1.md — 2956 lines read

---

## CHRONOLOGICAL MAP

### PHASE 1 — BOOT (morning)
Three wrong assumptions before any instrument was read:

| Assumption | Reported | Actual | Root cause |
|---|---|---|---|
| Time | ~05:00 PDT | 08:26 PDT | BOOT.md stale (040226), web_search used as time source |
| Station | Nest Actual | OHC | Habit inference from last session |
| Network | VZW_HOTSPOT | OHC 5G | Dark fleet assumed home network |

Observation: all three corrected by Dan before any work began.
Inference: BOOT.md was last updated April 2 — two sessions behind.
Outcome: Three Standard Rules filed. BOOT.md repaired. Gate 0 Universal documented.

---

### PHASE 2 — SKILL UPLOAD, FIRST ATTEMPT (~10:48 AM)
Target: iCan v2 SKILL.md to Claude.ai skills via Replace flow.

Step 1: Navigate → skills page → ican → More Options → Replace. OK
Step 2: find tool → ref_177. OK
Step 3: file_upload with ref_177. FAIL

Observation: native Windows file picker dialog opened.
Observation: YAML error appeared — "malformed YAML frontmatter."
Inference: file_upload tool clicks the input element before injecting → triggers OS dialog.
Inference: em dash in description field is multi-byte Unicode → rejected by YAML parser.

Dan: "STOP. You know a way to bypass this using code."

Two problems stacked. Same tooling, same call, two failure modes simultaneously.

---

### PHASE 3 — SKILL UPLOAD, DATATRANSFER (fixed)

Fix applied:
1. YAML: em dash replaced with hyphen
2. SKILL.md deployed to rspdan.com/skills/ican/SKILL.md (git push)
3. Replace modal opened
4. JavaScript DataTransfer:
   fetch(url) → File() → DataTransfer.items.add() → input.files = dt.files → change event

Result: INJECTED 14,161 bytes. No dialog. Confirmed "Last updated: Apr 4, 2026."

Why it worked: setting input.files programmatically requires no user gesture.
The browser's security model only opens the picker on user gesture (click/focus).
DataTransfer bypasses that entirely.

---

### PHASE 4 — /LOGS WORK (mid-session)

Three passes. All clean.

| Pass | Files | Days covered | Commit |
|---|---|---|---|
| Step 1 | 37 from FAS2/030826 | Mar 07-10 | c9ce5f1 |
| Step 2a | 38 from 030926_2 + Previous | Mar 05-06 + Mar 09 | ba337af |
| Step 2b | 13 FAS2 flight logs | Mar 10-16 | f788530 |

No failures. Pattern that worked: sample before copying, read before editing.

---

### PHASE 5 — PK UPLOAD, FIRST ATTEMPT (end of session)
Target: NEST_PI_SEED.md into NEST.01 Project Knowledge Files.

Step 1: Clicked Files + at coordinate (889, 663) via Chrome MCP `computer` click.
Step 2: DataTransfer injected immediately.

Result: File appeared in chat compose area as attachment — NOT in PK Files section.

Observation: NEST_PI_SEED.md showed TXT badge in the message composer.
Observation: Files section still only showed PK_SEED.md.
Inference: coordinate-based click hit the chat + button, not the Files + button.
Inference: The always-present chat file input received the injection.

Root: visual proximity in scrolled view. The Files + and chat + are near each other.
Coordinate clicks are imprecise. Wrong element, correct method.

---

### PHASE 6 — PK UPLOAD, SECOND ATTEMPT (end of session)

Step 1: Escaped to clear staged attachment.
Step 2: JavaScript enumerated all 'add' buttons.
   Found: "Add files, connectors, and more" (chat +) | "Add files" (PK Files +)
Step 3: Clicked "Add files" via JS.
Step 4: Waited 400ms.
Step 5: File inputs — before: 2, after: 2. No new inputs appeared.

Result: Upload failed. Session interrupted by Dan.

Observation: the PK "Add files" button produces no new file input after click.
Inference: it calls click() on a pre-existing hidden input → native file picker opens.
Inference: the 2 existing inputs are the chat input + the PK input, both always in DOM.

This is structurally different from the skills Replace flow:
  Skills Replace: opens a MODAL with a NEW visible drag-drop zone + NEW hidden input
  PK Add files: directly triggers a pre-existing hidden input via .click()

DataTransfer injection requires a target input. If the PK input is pre-existing,
we can inject into it BEFORE clicking the button — pre-inject, then trigger.
This was not attempted. Dan stopped the session before it could be tried.

---

## THE CORE PATTERN (appears 4x this session)

1. Boot: three assumptions stated before instruments read.
2. Skill upload phase 1: old method tried without checking the log first.
3. PK upload attempt 1: coordinate click hit wrong button.
4. PK upload attempt 2: acted without confirming structure first.

Common thread: action before structure confirmation.
Not incompetence — pattern. Specific, nameable, fixable.

The fix is not "try harder." The fix is: map the structure, confirm it, then act.
READ. WAIT. THINK. CODA. The mantra is the fix. When it's skipped, the failure appears.
