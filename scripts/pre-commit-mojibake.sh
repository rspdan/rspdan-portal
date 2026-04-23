#!/bin/sh
# rspdan-portal pre-commit hook · Gate 2 mojibake defense
# Installed: 042326 by Trip · Canon: RELAY/STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md
#
# On every commit: scan staged .astro and .md files for the 8-byte mojibake
# sequences that caused three NEST portal incidents (040426/042126/042226).
# If any staged file has mojibake, refuse the commit. Developer must either
# run `python scripts/fix_mojibake.py` to auto-repair, OR bypass with --no-verify.
#
# Rationale: manufacturing → nature. The rule "use Python not PowerShell for
# UTF-8" failed three times as a remembered rule. This hook makes it ambient.

# Get staged .astro and .md files (Added, Copied, Modified — not Deleted/Renamed-out)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(astro|md)$' || true)

if [ -z "$STAGED" ]; then
    # No .astro or .md staged — nothing to check
    exit 0
fi

# Resolve repo root so the hook works from any subdirectory
REPO_ROOT=$(git rev-parse --show-toplevel)

# Build argument list of absolute paths for fix_mojibake.py
# (script accepts explicit file arguments, otherwise scans src/pages/**)
FILES=""
for f in $STAGED; do
    if [ -f "$REPO_ROOT/$f" ]; then
        FILES="$FILES $REPO_ROOT/$f"
    fi
done

if [ -z "$FILES" ]; then
    exit 0
fi

# Run the check
cd "$REPO_ROOT"
python scripts/fix_mojibake.py --dry $FILES
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo ""
    echo "=== PRE-COMMIT HOOK: MOJIBAKE DETECTED ==="
    echo ""
    echo "One or more staged files contain the UTF-8/CP1252 mojibake sequence."
    echo "This caused portal incidents on 040426, 042126, and 042226."
    echo ""
    echo "To repair automatically:"
    echo "    python scripts/fix_mojibake.py"
    echo "    git add <fixed files>"
    echo "    git commit"
    echo ""
    echo "To bypass this check (only if you know the bytes are intentional):"
    echo "    git commit --no-verify"
    echo ""
    exit 1
fi

exit 0
