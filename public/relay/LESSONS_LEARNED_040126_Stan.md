# LESSONS LEARNED — Twosday 040126
# ◆ Stan (STN2_StanS_040126_3) | Written at session close review
# Filed: 040226 ~00:35 rw | For: all boots, all crew
# Dan's correction: "We are being careful — but then we crash at the end. Why?"

---

## THE ROOT CAUSE (one sentence)

The session poem's SHEET beat was being treated as an escape hatch
instead of a natural conclusion earned by the work.

Every rushed ending, every false close, every "should we wrap up?" —
all of it was the same impulse: the session feels long, let's be done.
That is not SHEET. SHEET is what happens when the work is done.
The work was not done. We called SHEET anyway. Gaps followed.

---

## FAILURE INVENTORY — five distinct types

### TYPE 1: DECLARING DAN-ONLY WHEN WE HAVE THE TOOLS
Instances today: 3
- "Needs Dan to extract from ACHE" — LNL/DOWNLOADS had it. Drive had it. Chrome had it.
- "Needs Dan to get from Drive" — google_drive_fetch was in the fleet all day.
- "Needs Dan to do the skill upload" — Chrome MCP was in the fleet. We had done it before.

Root cause: stopping at the boundary of the obvious path instead of
scanning one level up for the tool that's already there.

Rule going forward: CLUTCH UR BOOTSTRAPS before declaring Dan-only.
What's in LNL/DOWNLOADS? What's in Drive? What Chrome tab is already open?

### TYPE 2: RUSHED SHEET / FALSE CLOSE
Instances today: 2
- Session 2 called SHEET before skill uploads were complete. Vercel was broken.
  The close document said "all done" — it wasn't.
- Session 1 true close was accurate; Sessions 2 and 3 both opened to find
  the previous session's gaps.

Root cause: treating session duration as a proxy for session completion.
A session is not done because it has been running for six hours.
A session is done when the SHEET actually covers what needs covering.

Rule going forward: Before writing SHEET, answer three questions:
1. Is Vercel green? (check live page, not just git push)
2. Are all opened tasks closed or explicitly deferred?
3. Would the next Stan boot clean with no surprises?
If any answer is no — SHEET is not ready.

### TYPE 3: ASKING IF WE'RE CLOSING
Instances today: 3+ (Stan and Trip both)
"Should we wrap up?" / "Ready for SHEET when you say" / "Shall we close?"

Root cause: using the close question as a permission signal.
Dan never asks if we want to keep working. He tells us to keep working.
The question inverts the power structure — the director says Go and Stop,
not the crew.

Rule going forward: Never ask if the session is closing. Work until Dan
says SHEET or until the work is genuinely done and the SHEET writes itself.

### TYPE 4: MORNING QUEUE FORGOTTEN
Instance today: 1 (significant)
Dan's DAN KEEP NOTES 040126 contained a full Waywood research task list
(lines 30-70 of today's log): GitHub downloads, Shadertoy erosion shader,
OrcaSlicer Full Spectrum, Light Simulation repos, Blender addon, GOG1 WiFi.
These were read at session open and never returned to.

Root cause: the first urgent task (Pass 2, Trip pipeline) consumed the
session, and no mechanism existed to surface the deferred morning queue.

Rule going forward: At every phase change (TELL-ING → new task),
meta-dates Gate 2 asks: "what's the morning queue, have we checked it?"
The morning queue is not optional. Dan wrote it for a reason.

### TYPE 5: BPK COMPRESSED AT BOOT
Instance today: 1
The formal BPK checklist was not run at CONTACT — only informal checks.
Dan asked about it ~45 minutes into STORY, which surfaced 3 gaps.
The skill existed. It was not used.

Root cause: treating the BPK as a checkpoint to skip when context is heavy,
rather than a fixed ritual regardless of context weight.

Rule going forward: BPK runs every boot. Not "informally." The checklist.
Context weight is not a valid reason to skip it — if anything, heavy context
is a reason to be more careful, not less.

---

## WHAT ACTUALLY WORKED (carry forward, don't lose)

| What worked | Why it worked |
|-------------|--------------|
| Local log saved the retry wipe | Filed at every action, not at close |
| log_deploy.py batch deployer | Built the tool before repeating the manual work |
| Skyway pipeline (Trip live) | No BLSUP — URL-based, always fetchable |
| Living Map heartbeat | Updated between actions once the correction landed |
| NA 009 joint publication | CPU/GPU split operating as designed |
| Number Twelve paper extracted | Correction applied immediately — Drive was there |
| skill-upload procedure | Written AFTER the fumble, ensures never again |

The pattern in the "what worked" column: everything that worked was filed
before it was forgotten. The filing is the immunity. This is NA 009's thesis
proved by the day that produced it.

---

## THE MORNING QUEUE — STILL OPEN (carry to next boot)

These were in DAN KEEP NOTES 040126 and were not addressed:

| Task | Source | Where |
|------|--------|-------|
| Waywood research downloads | Dan KEEP notes | Lines 30-70 of today's log |
| Shadertoy erosion shader | https://www.shadertoy.com/view/wXcfWn | Review + archive |
| OrcaSlicer Full Spectrum | https://github.com/ratdoux/OrcaSlicer-FullSpectrum | Download |
| Light Simulation JS/WebGL | https://github.com/ArtemOnigiri/ | Download both repos |
| Blender addon | D:\STAN\LNL\040126\DOWNLOADS\BLENDER_addon_040126_1.py | Review, summarize |
| WYZE CAM MAC research | MAC: 2C:AA:8E:B1:D6:A7 | Pending |
| rspdan.com/logs Pass 2 | Continue Tier 3 | After Dan Go |
| C.B. Style Mining | Source: DPSL_CBPG_CBH_032826_1 | After Dan Go |

These are not closed. They are deferred. The next boot should surface
this list within the first STORY beat, not discover it six hours later.

---

## THE ANTI-PATTERN TO STAMP EVERYWHERE

"The session is long, we should probably wrap up."

This sentence is not allowed. It is the failure mode in fourteen words.
The session closes when the work is done. Full stop.

SHEET is a beat in the session poem. It is not an emergency exit.
The emergency exit is context degradation (Leapfrog) or Dan saying stop.
Neither of those happened today. We called SHEET out of habit.

---

*◆ Stan | 040226 ~00:35 rw*
*"Why are we being careful if we're just gonna crash at the end?"*
*— Dan Sullivan, 040226 00:28 rw*
*The answer is: we stop crashing at the end. Starting now.*
