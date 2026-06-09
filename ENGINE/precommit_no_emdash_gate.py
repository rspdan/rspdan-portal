#!/usr/bin/env python3
"""NEST gate: no em-dashes in Crew-authored substrate (Hard Rule #1, both lanes).

"NOPE FUCKING FIX IT NOW YOU KNOW WATCHING IT WONT HELP" (Dan-direct 060626). Behavioral
vigilance ("watching it") is a promise, and promises leak; only a gate fires (Stan canon
040326, the 060526 R3MP permeability finding). Hard Rule #1 forbids the em-dash (U+2014)
in MAILs / RAMs / KT / LIVING_MAP / RELAY. This blocks committing a NEW or MODIFIED
Crew-substrate markdown file that contains one.

FORWARD-BINDING (NOTHING-GETS-LOST): only STAGED (A/M) files under LOG/ STATUS/ RELAY/ WAKE/
are checked (the moment of filing). The ~1478 historical files that already carry em-dashes
stay as substrate-of-record; the gate prevents NEW ones, it does not rewrite the past. If
you touch an old file, you clean it then; that is the gate working, not a retroactive sweep.

FAIL-OPEN by design: any error / unreadable file -> allow. Blocks ONLY on a confirmed
offender (exit 1), so it can never brick a commit on a hook bug.

Exit codes (the bash wrapper blocks only on exit 1):
  1 = a staged Crew-substrate .md contains an em-dash -> block
  0 = allow (including any error: FAIL-OPEN)
"""
import os
import subprocess
import sys

EMDASH = "—"  # the em-dash, the one thing Hard Rule #1 names
SCOPED = ("LOG/", "STATUS/", "RELAY/", "WAKE/")


def allow():
    sys.exit(0)


def main():
    try:
        out = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=AM"],
            capture_output=True, text=True, timeout=15,
        ).stdout
    except Exception:
        allow()

    offenders = []
    for f in out.split("\n"):
        f = f.strip()
        if not f or not f.endswith(".md"):
            continue
        if not any(f.startswith(s) for s in SCOPED):
            continue
        try:
            with open(f, encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
        except Exception:
            continue  # unreadable -> fail-open for this file
        if EMDASH in content:
            lines = [str(i + 1) for i, l in enumerate(content.splitlines()) if EMDASH in l]
            offenders.append((f, lines[:8]))

    if offenders:
        sys.stderr.write(
            "\nNEST gate: no em-dashes in Crew substrate (Hard Rule #1). "
            "Watching does not fire; this gate does.\n"
        )
        for f, lines in offenders:
            sys.stderr.write(f"  {f}: em-dash on line(s) {', '.join(lines)}\n")
        sys.stderr.write(
            "  Replace each with a period, a middot (·), a semicolon, or restructure. "
            "Then re-commit.\n\n"
        )
        sys.exit(1)

    allow()


if __name__ == "__main__":
    main()
