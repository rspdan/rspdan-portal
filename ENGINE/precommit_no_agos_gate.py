#!/usr/bin/env python3
"""NEST gate: no forward AGOS emission in Crew substrate (Dan-direct 052926, ALL-CREW forever-binding).

"AGOS IS LAGOS. NO MORE AGOS EVER BECAUSE IT LEADS TO FUCK STUPID" (Dan-direct 052926, canon
RELAY/CORRECTION_AGOSToLAGOSRetraction_...052926.md). The acronym AGOS is canon-retracted: Gmail is
a box INSIDE LAGOS, never a separate class. That canon specified a grep-before-send gate, but it was
behavioral ("remember to check"), so it leaked: AGOS crept back into a full day of emissions 060626.
"Watching does not fire; only a gate fires" (Stan 040326). This makes the retraction fire like the
em-dash gate: a commit hook that blocks NEW standalone-AGOS in Crew substrate.

ADDED-LINES-ONLY by design (this is the key difference from the em-dash gate): the AGOS canon
explicitly preserves historical AGOS as substrate-of-record (Mirror 4, NOT-to-be-altered) while
forbidding FORWARD emission. So this gate scans only the ADDED (+) lines of the staged diff, never
whole files. Historical AGOS in untouched lines never blocks; only a newly-written AGOS does. Pure
forward-binding, exactly as the canon states ("going-forward zero-AGOS-emission").

WORD-BOUNDARY: matches the standalone token AGOS (case-insensitive), so "LAGOS" / "Lagos" (preceded
by a letter) is never flagged, but "AGOS" / "AGOS-search" / "AGOS-scope-collapse" are.

PATH-EXEMPT: files whose path contains "AGOS" are the dedicated canon-of-record about the retraction
(the retraction CORRECTION, the superseded AGOS_BROAD_SEARCH rule, any deliberately-named
AGOS-retraction file). They legitimately spell the retired term to retract/cite it, so they are skipped.

FAIL-OPEN: any error / unreadable -> allow. Blocks ONLY on a confirmed new offender (exit 1).

Exit codes (the bash wrapper blocks only on exit 1):
  1 = a staged Crew-substrate .md ADDS a standalone AGOS token -> block
  0 = allow (including any error: FAIL-OPEN)
"""
import re
import subprocess
import sys

SCOPED = ("LOG/", "STATUS/", "RELAY/", "WAKE/")
# Match the PROSE token AGOS (the retracted term), not identifier substrings. Excluding
# [A-Za-z0-9_] on both sides means: "LAGOS" (letter before) is safe, and an identifier like
# "precommit_no_agos_gate" / a var name (underscore-bounded) is safe, but prose "AGOS",
# "AGOS sweep", and hyphenated jargon "AGOS-search" / "AGOS-scope-collapse" are flagged.
TOKEN = re.compile(r"(?<![A-Za-z0-9_])AGOS(?![A-Za-z0-9_])", re.IGNORECASE)


def allow():
    sys.exit(0)


def main():
    try:
        names = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=AM"],
            capture_output=True, text=True, timeout=15,
        ).stdout.split("\n")
    except Exception:
        allow()

    targets = []
    for f in names:
        f = f.strip()
        if not f or not f.endswith(".md"):
            continue
        if not any(f.startswith(s) for s in SCOPED):
            continue
        if "AGOS" in f.upper().replace("LAGOS", ""):  # path names the retired term -> canon-of-record, exempt
            continue
        targets.append(f)

    offenders = []
    for f in targets:
        try:
            # Read bytes, decode manually with errors="replace". text=True would let the
            # subprocess reader-thread decode as the Windows locale (cp1252) and CRASH on a
            # non-cp1252 byte (e.g. 0x90), silently leaving stdout=None and bypassing this
            # try/except, so the gate would die on None.split instead of failing open.
            raw = subprocess.run(
                ["git", "diff", "--cached", "-U0", "--", f],
                capture_output=True, timeout=15,
            ).stdout
            diff = raw.decode("utf-8", errors="replace") if raw is not None else ""
        except Exception:
            continue  # unreadable diff -> fail-open for this file
        added = [
            ln[1:] for ln in diff.split("\n")
            if ln.startswith("+") and not ln.startswith("+++")
        ]
        hits = [ln.strip()[:70] for ln in added if TOKEN.search(ln)]
        if hits:
            offenders.append((f, hits[:6]))

    if offenders:
        sys.stderr.write(
            "\nNEST gate: no forward AGOS emission (Dan-direct 052926: 'AGOS IS LAGOS, NO MORE AGOS EVER'). "
            "Watching does not fire; this gate does.\n"
        )
        for f, hits in offenders:
            sys.stderr.write(f"  {f}: new AGOS in added line(s): {' | '.join(hits)}\n")
        sys.stderr.write(
            "  Say LAGOS (all boxes) or 'the Gmail box' / 'Gmail'. Gmail is a box inside LAGOS, not a "
            "separate class. Historical AGOS stays (Mirror 4); only NEW emission is blocked. Then re-commit.\n\n"
        )
        sys.exit(1)

    allow()


if __name__ == "__main__":
    main()
