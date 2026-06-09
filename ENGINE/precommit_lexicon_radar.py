#!/usr/bin/env python3
"""NEST lexicon radar: the coining catch in CODE (warn-only, never blocks).

Root: Dan-direct 060926 "DO NOT USE COIN FUCKING EVER EVEN IN THINKING... FIND OUT WHY
AND FIX WHY IT KEEPS HAPPENING." The prose coining-impulse gate fires at the reach-to-name
inside the model; this radar is the mechanical backstop at the commit boundary: any NEW
capitalized multi-word sequence in ADDED lines that is absent from the known-canon lexicon
(ENGINE/dan_lexicon.txt, built from the existing corpus) gets SURFACED with a warning, so
a freshly-minted name cannot slip into the substrate unannounced. Mirror 4 Dan-naming-first.

WARN-ONLY by design (exit 0 always): naming needs human judgment; plenty of legitimate new
sequences exist (a person's name in a study, a product Dan loaded). The radar makes the
candidate-coin VISIBLE; the seat answers for it (LAGOS-search Dan's name, or describe
plainly, or confirm it is substrate-real) and refreshes the lexicon when canon grows
(re-run the builder in this file's docstring or add the line by hand).

ADDED-LINES-ONLY, Crew-substrate .md only. FAIL-OPEN: any error -> silent exit 0.
"""
import os
import re
import subprocess
import sys

PAT = re.compile(r"\b([A-Z][A-Za-z'#]+(?:\s+[A-Z][A-Za-z'#]+)+)\b")


def main() -> int:
    try:
        root = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                              capture_output=True, text=True, timeout=10).stdout.strip()
        lexpath = os.path.join(root, "ENGINE", "dan_lexicon.txt")
        if not os.path.exists(lexpath):
            return 0
        lex = set(open(lexpath, errors="replace").read().splitlines())
        diff = subprocess.run(["git", "diff", "--cached", "--unified=0", "--", "*.md"],
                              capture_output=True, text=True, timeout=30).stdout
        fresh = set()
        for line in diff.splitlines():
            if not line.startswith("+") or line.startswith("+++"):
                continue
            for m in PAT.finditer(line[1:]):
                s = m.group(1).strip()
                if s not in lex:
                    fresh.add(s)
        if fresh:
            sys.stderr.write(
                "NEST lexicon radar (warn-only): NEW capitalized name-sequences not in the "
                "known-canon lexicon. If any is a freshly-minted name: do not coin; LAGOS-"
                "search Dan's name or describe plainly. If substrate-real (a person, a "
                "product, Dan's own new coin): proceed and refresh ENGINE/dan_lexicon.txt.\n  "
                + "\n  ".join(sorted(fresh)[:20]) + "\n"
            )
        return 0  # never blocks
    except Exception:
        return 0


if __name__ == "__main__":
    sys.exit(main())
