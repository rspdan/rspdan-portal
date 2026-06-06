#!/usr/bin/env python3
"""rspdan-portal: convert em-dashes (U+2014) to the house-style middot (U+00B7).

The em-dash is an AI-writing-tell. The portal's public pages are Crew-authored
(not Dan's hand), so a stray em-dash on the public face is a Crew-tell leaking to
rspdan.com. The portal house separator is already the middot (DAN SULLIVAN ·
PORT ANGELES, WA), so the clean transform is em-dash -> middot, matching the
established style. Companion to fix_mojibake.py (Gate 2) and the pre-commit hook.

Functional em-dashes in CODE (e.g. a regex character class) must be written as
the unicode escape \\u2014 in source, not the literal char; this script only
touches the literal U+2014 byte, so escaped code is untouched.

Usage:
  python3 scripts/fix_emdash.py <file> ...     # fix specific files (writes)
  python3 scripts/fix_emdash.py                # scan src/ .astro/.md/.mdx (writes)
  python3 scripts/fix_emdash.py --dry <file>   # report only, exit 1 if any (the gate)
"""
import sys
import os
import glob

EMDASH = "—"   # the em-dash
MIDDOT = "·"   # the house-style separator


def targets(args):
    if args:
        return args
    out = []
    for ext in ("astro", "md", "mdx"):
        out += glob.glob(f"src/**/*.{ext}", recursive=True)
    return out


def main():
    argv = sys.argv[1:]
    dry = "--dry" in argv
    args = [a for a in argv if not a.startswith("--")]
    files = targets(args)
    total = 0
    touched = 0
    for f in files:
        if not os.path.isfile(f):
            continue
        try:
            s = open(f, encoding="utf-8").read()
        except Exception:
            continue
        n = s.count(EMDASH)
        if n == 0:
            continue
        if not dry:
            open(f, "w", encoding="utf-8").write(s.replace(EMDASH, MIDDOT))
        print(f"  {f}: {n} em-dash" + ("" if dry else " -> middot"))
        total += n
        touched += 1
    verb = "found (dry-run, no changes)" if dry else "converted"
    print(f"fix_emdash: {total} em-dash(es) {verb} across {touched} file(s)")
    sys.exit(1 if (dry and total > 0) else 0)


if __name__ == "__main__":
    main()
