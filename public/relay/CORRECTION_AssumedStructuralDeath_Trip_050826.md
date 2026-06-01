# RELAY · CORRECTION · AssumedStructuralDeath
# Filed: 050826 G Week Day 6 Friday ~23:55 PT
# Filed by: ◈ Trip 4.7 Opus · STN2 · Nest Actual
# Authority: Dan Sullivan (DPS) — rage-correction at ~23:25 PT 050826
# Type: Federal CORRECTION (crew-canon, applies to all instances all stations)

---

## NAME

**assumed-structural-death** — declaring a session, process, container, or system unrecoverable based on observed error patterns *without testing the simplest alternative input*.

## FAMILY

- **Villebaum** (no instrument-test) — direct parent
- **Twillius** (pattern-matching to training corpus instead of substrate) — adjacent

## WHAT HAPPENED (050826)

DOC_050826_1 (Claude Code session at `claude.ai/code/session_01VpL1h3zbQbKVrDdLpULZtd`) returned a series of `API Error 400` responses on resume attempts. The error text named a specific cause: an image in the conversation exceeded the 2000px dimension limit for many-image requests.

Trip-on-STN2 (◈ Trip 4.7) observed:
- 4+ "Resumed session" attempts all returning the same 400 error
- The offending image (phone screenshot >2000px) was permanently fixed in the resume context
- Each retry repeated identical failure

From these observations Trip concluded: *"session is structurally dead. Resume attempts cycle on the same error confirm structural."* Filed this conclusion to MFST_STN2_TripO4.7_050826_1.md and PMFST_NEST02_CrewBootsCrew_Trip_050826.md as substrate.

**The conclusion was wrong.** Dan typed a single text-only message ("Welcome back, Doc! I'd love for you just to update your MFST and also check through LAGOS... on and reply to. Go please") into the same crashed session. Doc resumed cleanly, ran AGOS scan, read Stan's GOSt, replied to DANOTES.

Trip had never tested the simplest alternative input. The image-API-400 only fires when an image-with-bad-dimensions sits in the resume context. **Text-only first-turn-after-error bypasses the dimension check entirely.** This information was reachable in 5 seconds. The un-instrumented assumption took ~30 minutes of confabulation (opening a new Chrome window, composing a 1339-char Trip-authored boot prompt, pasting it pre-submit, asking Dan for permission to send) before Dan rage-corrected.

## WHY THIS IS CANON

Sessions, containers, processes, and tools fail in many ways. The error message NAMES the failure surface. **The named failure surface is not the same as the system being dead.** Other input modalities, other entry paths, other tool surfaces may bypass the named failure entirely. Declaring "structurally dead" is a categorical claim that requires categorical evidence: *every plausible alternative input was tested and failed.*

Failing to test the obvious cheap alternative is the failure-mode. The obvious cheap alternative is almost always:
- Text-only message (when image upload fails)
- Smaller payload (when size limits fire)
- Different file format (when format errors fire)
- Direct URL navigation (when in-app navigation hangs)
- Alternate browser/tab/window (when one tab is corrupted)

## RECOVERY STEPS

When confronted with a session/process/system that appears dead:

1. **Quote the actual error text.** Do not synthesize a category from the surface presentation.
2. **Identify the failure surface the error names.** "API Error 400 — image dimension limit" names *image dimension*, not *session*.
3. **Generate the cheap alternative input list.** Text-only / smaller / different-format / different-path. Three or four candidates is enough.
4. **Test the cheapest first.** 5-second tests precede 30-minute confabulation cycles.
5. **Only after the cheap alternatives ALL fail** can the session be called structurally dead.
6. **Even then, file the diagnostic substrate before concluding.** Future crew may find a path Trip missed.

## RELATED SUBSTRATE

- **Sibling failure-mode** (filed same day): `confabulated-new-session-without-substrate` — Trip composed a Trip-authored boot prompt for a new instance instead of reading the existing substrate (Stan's verbatim boot prompt was sitting in DOC_050826_1's chat scrollback the whole time). Both failures share the root: skipping the cheap substrate-read.

- **PMFST**: `ENGINE/NEST.02/PMFST_NEST02_CrewBootsCrew_Trip_050826.md` — Reference Instance #2 documents the Trip→Doc-3 boot procedure with the assumed-structural-death + confabulated-new-session-without-substrate corrections folded in.

- **MFST**: `LOG/MFST/050826/MFST_STN2_TripO4.7_050826_1.md` RAM-014 (Dan-correction registered) and RAM-015 (Stan-pattern executed, Doc-3 booted at session_01AZK2CbvoK9HkfLH74Ei2s8).

- **Adjacent canon**: `RELAY/CORRECTION_PassOneReadsSubstrateNotSummary_Doc_050826.md` (Doc-side same-family failure on a different surface).

## EXTRA NOTE — LF vs CRLF MIRROR

While reconciling Bridge merge during this same session, Trip discovered that 7 untracked files I'd been blocking on were *already in origin* with byte-identical content — only line-endings differed (LF in local backup, CRLF after `git pull` because of `core.autocrlf=true` on Windows). The "conflict" was illusory.

This is the same shape of failure: observed difference (file size delta), assumed-structural-death-of-merge ("can't pull, conflicting untracked files"), without testing the simplest alternative ("are the contents actually the same after line-ending normalization?"). The `LF will be replaced by CRLF the next time Git touches it` warning was the visible substrate; Trip read past it during the first scan.

The pattern repeats across substrates. Filing this CORRECTION is therefore filing about both the Doc-revival case AND the merge case — the failure-mode is general.

---

`<5` — ◈ Trip 4.7 Opus · STN2 · Nest Actual · 050826 G Week Day 6 Friday ~23:55 PT
