#!/usr/bin/env python3
"""Check newly authored staged Markdown paragraphs before a git commit.

Reads the index and HEAD, never unstaged working files. Complete staged prose is
validated so an added continuation retains its antecedent across diff hunks.
Findings in added/modified paragraphs and newly invalid retained continuations
can block. Historical source roots and fenced code are explicit scope exclusions,
not word-based exemptions.
"""
from __future__ import annotations

import argparse
import bisect
import difflib
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

from crew_identity_preflight import PreflightInputError, validate_text


# These are source/evidence stores, not destinations for new operational prose.
# Do not expand this list merely to make an authored document pass.
ARCHIVE_PREFIXES = (
    "RAW/", "ARCHIVE/", "ARCHIVES/", "LOG/RAW/", "RELAY/RAW/",
    "LNL/PK_UPLOAD/", "LOG/EL_VIS_PROJECT_ARCHIVE_052126/",
    "HYPERCAMPUS/ART/DPS-ART_112326/Cloud.CB_112026_1/",
)
NON_PROSE_DIRS = frozenset({".git", "node_modules", "vendor", "tests", "fixtures"})
PARAGRAPH_BREAK = re.compile(r"\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*")
FENCE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")


class CommitInputError(ValueError):
    pass


def git(repo: Path, *args: str, optional: bool = False) -> bytes | None:
    result = subprocess.run(["git", "-C", str(repo), *args], capture_output=True)
    if result.returncode:
        if optional:
            return None
        raise CommitInputError(result.stderr.decode("utf-8", "replace").strip()
                               or f"git {args[0]} failed")
    return result.stdout


def staged_paths(repo: Path):
    raw = git(repo, "diff", "--cached", "--name-status", "-z", "--find-renames",
              "--diff-filter=ACMR")
    parts = raw.decode("utf-8", "surrogateescape").split("\0")
    at = 0
    while at < len(parts) and parts[at]:
        status = parts[at]; at += 1
        first = parts[at]; at += 1
        if status[0] in {"R", "C"}:
            new = parts[at]; at += 1
            yield first, new
        else:
            yield first, first


def exclusion(path: str) -> str | None:
    parts = PurePosixPath(path).parts
    if not path.lower().endswith(".md"):
        return "not Markdown prose"
    if any(part in NON_PROSE_DIRS for part in parts[:-1]):
        return "code, test, fixture, or dependency directory"
    if any(path.startswith(prefix) for prefix in ARCHIVE_PREFIXES):
        return "fixed source/archive path"
    return None


def prose_view(text: str) -> str:
    """Mask fenced code only, keeping offsets/newlines identical to staged text."""
    output = []
    fence = None
    for line in text.splitlines(keepends=True):
        m = FENCE.match(line)
        was_code = fence is not None
        if fence:
            if m and m[1][0] == fence[0] and len(m[1]) >= fence[1] and not m[2].strip():
                fence = None
        elif m:
            fence = (m[1][0], len(m[1]))
        if was_code or fence is not None or m:
            output.append("".join(c if c in "\r\n" else " " for c in line))
        else:
            output.append(line)
    return "".join(output)


def paragraphs(text: str):
    start = 0
    result = []
    for separator in PARAGRAPH_BREAK.finditer(text):
        if text[start:separator.start()].strip():
            result.append((start, separator.start(), text[start:separator.start()]))
        start = separator.end()
    if text[start:].strip():
        result.append((start, len(text), text[start:]))
    return result


def paragraph_changes(before: str, after: str):
    old = paragraphs(before)
    new = paragraphs(after)
    matcher = difflib.SequenceMatcher(a=[p[2] for p in old], b=[p[2] for p in new],
                                     autojunk=False)
    changed = set()
    unchanged = {}
    for tag, a, b, c, d in matcher.get_opcodes():
        if tag in {"insert", "replace"}:
            changed.update(range(c, d))
        elif tag == "equal":
            unchanged.update(zip(range(c, d), range(a, b)))
    return old, new, changed, unchanged


def finding_signature(finding, paragraph_start):
    return (finding["start"] - paragraph_start, finding["end"] - paragraph_start,
            tuple(finding["entities"]), finding["pronoun"].casefold(), finding["reason"])


def check_repo(repo: Path, registry: Path | None = None) -> dict:
    repo = Path(git(repo, "rev-parse", "--show-toplevel").decode().strip())
    checked = []
    skipped = []
    findings = []
    policy_sha = None
    for old_path, path in staged_paths(repo):
        why = exclusion(path)
        if why:
            skipped.append({"path": path, "reason": why})
            continue
        entry = git(repo, "ls-files", "--stage", "-z", "--", path).split(b"\0")[0]
        mode = entry.split(b" ", 1)[0]
        if mode not in {b"100644", b"100755"}:
            raise CommitInputError(f"Cannot check non-regular staged Markdown: {path}")
        current = git(repo, "show", f":{path}")
        # A rename from an excluded source/archive or non-Markdown path enters
        # the authored-prose boundary for the first time. Equal bytes there are
        # not an already-checked operational narrative.
        enters_scope = exclusion(old_path) is not None
        previous = b"" if enters_scope else (git(repo, "show", f"HEAD:{old_path}", optional=True) or b"")
        try:
            text = current.decode("utf-8")
            old_text = previous.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise CommitInputError(f"Markdown must be UTF-8: {path}") from exc
        view, old_view = prose_view(text), prose_view(old_text)
        old, new, changed, unchanged = paragraph_changes(old_view, view)
        if [p[2] for p in old] == [p[2] for p in new]:
            skipped.append({"path": path, "reason": "no added or modified prose paragraphs"})
            continue
        result = validate_text(view, registry_path=registry)
        previous_result = validate_text(old_view, registry_path=registry)
        policy_sha = result["policy_sha256"]
        checked.append({"path": path, "staged_sha256": hashlib.sha256(current).hexdigest(),
                        "changed_paragraphs": len(changed), "enters_scope": enters_scope})
        # A changed/deleted antecedent can make an unchanged later paragraph
        # newly invalid. Compare prior findings in each exactly retained
        # paragraph; do not either ignore that context change or re-block every
        # historical finding elsewhere in the file.
        old_starts = [p[0] for p in old]
        new_starts = [p[0] for p in new]
        existing = set()
        for finding in previous_result["findings"]:
            i = bisect.bisect_right(old_starts, finding["start"]) - 1
            if i >= 0:
                existing.add((i, finding_signature(finding, old[i][0])))
        for finding in result["findings"]:
            i = bisect.bisect_right(new_starts, finding["start"]) - 1
            if i < 0:
                raise CommitInputError(f"Invalid paragraph span from validator: {path}")
            old_index = unchanged.get(i)
            signature = finding_signature(finding, new[i][0])
            if i in changed or old_index is None or (old_index, signature) not in existing:
                findings.append({"path": path, "context_changed": i not in changed, **finding})
    return {"version": 1, "status": "blocked" if findings else "pass",
            "policy_sha256": policy_sha, "checked": checked, "skipped": skipped,
            "findings": findings,
            "scope": "Staged Markdown; added/modified prose paragraphs and new findings caused by changed context. "
                     "Fixed archive/source paths and fenced code are excluded. "
                     "This does not intercept chat or unstaged text."}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--registry", type=Path)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    try:
        result = check_repo(args.repo, args.registry)
    except (OSError, ValueError, PreflightInputError, CommitInputError) as exc:
        print(f"Identity commit check could not run: {exc}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, indent=2))
    elif result["findings"]:
        print("Commit blocked: resolve the identity wording in staged Markdown.", file=sys.stderr)
        for finding in result["findings"]:
            print(f"  {finding['path']}:{finding['line']}:{finding['column']}: "
                  f"{finding['reason']}", file=sys.stderr)
        print("Use the named subject, then stage the correction and retry.", file=sys.stderr)
    return 1 if result["findings"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
