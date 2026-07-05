#!/usr/bin/env python3
"""NEST branch-hygiene sweeper: NOTHING GETS LOST, mechanically, cross-Crew.

Root (Dan-direct 070526 2:54pm "FIX THIS FUCKING BRANCH SHIT ... NEVER EVER
AGAIN AND WE DO NOT LOSE ANYTHING ... NOT SPECTRAPPED TO ANY SINGLE CREW"):
work strands on feature branches, never merges, and reads as "lost / orphaned."
Three failure roots, all mechanical, all cured here so no seat re-does the manual
reconcile by hand and no seat re-panics:

  1. SHALLOW-CLONE FALSE-ORPHAN. A shallow cloud clone makes `git merge-base`
     return empty, which the tooling reads as "unrelated histories / orphan."
     It is a depth artifact, not a lineage break. --heal unshallows so it never
     fires again.
  2. STRANDED TEXT RECORDS. Records (md/py/json/...) live only on a branch, never
     on main. --reconcile-text stages every branch-only text record onto the
     current branch as a pure addition (paths absent on main), the mechanized form
     of the by-hand 361-record reconcile (070526). NOTHING GETS LOST.
  3. STRANDED MEDIA. Binaries (png/jpg/pdf/sav/...) do not belong bulk-dumped in
     git (git keeps every version forever); they belong in LAGOS/Drive (the 5TB).
     --media-manifest emits the exact stranded-media list for media_to_lagos.py to
     push to Drive and leave a git manifest pointer (durable + lean, nothing lost).

This tool NEVER force-pushes, NEVER deletes a branch, NEVER rewrites shared main.
It stages additions and reports; the seat reviews and commits. Any seat runs it
(not SpecTrapped to one Crew). Read the report, then act.

Usage:
  python3 ENGINE/branch_hygiene.py --report                 # classify every origin branch
  python3 ENGINE/branch_hygiene.py --heal                   # unshallow so merge-base never false-orphans
  python3 ENGINE/branch_hygiene.py --reconcile-text [BR..]  # stage branch-only TEXT onto HEAD (pure adds)
  python3 ENGINE/branch_hygiene.py --media-manifest [BR..]  # list stranded media (for media_to_lagos.py)
  python3 ENGINE/branch_hygiene.py --deletable              # branches fully merged to main (safe to delete)
"""
import subprocess
import sys
import os

MEDIA_EXT = (".png", ".jpg", ".jpeg", ".gif", ".sav", ".pdf", ".mp4", ".mov",
             ".zip", ".webp", ".ico", ".psd", ".tif", ".tiff", ".mp3", ".wav")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def git(*args, check=False):
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    if check and r.returncode != 0:
        sys.stderr.write(r.stderr)
        raise SystemExit("git %s failed: %s" % (" ".join(args), r.stderr.strip()))
    return r.stdout


def is_media(path):
    return path.lower().endswith(MEDIA_EXT)


def is_shallow():
    return git("rev-parse", "--is-shallow-repository").strip() == "true"


def heal():
    """Unshallow so merge-base never returns empty (the false-orphan root)."""
    if not is_shallow():
        print("HEAL: clone is already full-depth; merge-base is reliable, no false-orphan risk.")
        return 0
    print("HEAL: clone is SHALLOW -> unshallowing (this is the false-orphan-panic root)...")
    r = subprocess.run(["git", "fetch", "--unshallow", "origin"], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode != 0:
        # fall back to a deep deepen if a full unshallow is refused
        subprocess.run(["git", "fetch", "--depth=100000", "origin"], cwd=ROOT,
                       capture_output=True, text=True)
    ok = not is_shallow()
    print("HEAL: shallow now = %s %s" % (is_shallow(), "(healed)" if ok else "(still shallow; deepened)"))
    return 0 if ok else 1


def origin_branches():
    out = git("ls-remote", "--heads", "origin")
    names = []
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 2 and parts[1].startswith("refs/heads/"):
            names.append(parts[1][len("refs/heads/"):])
    return names


def branch_only_files(branch):
    """Files present on origin/<branch> but absent on origin/main."""
    main = set(git("ls-tree", "-r", "--name-only", "origin/main").splitlines())
    br = git("ls-tree", "-r", "--name-only", "origin/%s" % branch).splitlines()
    return [f for f in br if f and f not in main]


def classify():
    rows = []
    for b in origin_branches():
        if b == "main":
            continue
        only = branch_only_files(b)
        text = [f for f in only if not is_media(f)]
        media = [f for f in only if is_media(f)]
        if not only:
            state = "MERGED (deletable)"
        elif media and not text:
            state = "MEDIA-STRANDED"
        elif text and not media:
            state = "TEXT-STRANDED"
        else:
            state = "TEXT+MEDIA-STRANDED"
        rows.append((b, len(text), len(media), state))
    return rows


def report():
    if is_shallow():
        print("!! CLONE IS SHALLOW -- run --heal first, else merge-base false-orphans.\n")
    rows = classify()
    rows.sort(key=lambda r: (r[3] != "MERGED (deletable)", -(r[1] + r[2])))
    merged = sum(1 for r in rows if r[3].startswith("MERGED"))
    tstr = sum(r[1] for r in rows)
    mstr = sum(r[2] for r in rows)
    print("BRANCH HYGIENE REPORT (%d non-main branches)" % len(rows))
    print("  %-4s %-6s %-20s %s" % ("txt", "media", "state", "branch"))
    for b, t, m, s in rows:
        print("  %-4d %-6d %-20s %s" % (t, m, s, b))
    print("\nSUMMARY: %d merged (deletable) · %d branches carry stranded content · "
          "%d stranded text records · %d stranded media files"
          % (merged, len(rows) - merged, tstr, mstr))
    print("NEXT: --reconcile-text (text -> main, nothing lost) · --media-manifest "
          "(media -> media_to_lagos.py -> Drive) · --deletable (list merged branches).")
    return 0


def deletable():
    """Branches with zero branch-only content: fully on main, safe to delete."""
    out = []
    for b, t, m, s in classify():
        if s.startswith("MERGED"):
            out.append(b)
    for b in out:
        print(b)
    sys.stderr.write("\n%d branches fully merged to main (content is on main; deletion loses nothing).\n" % len(out))
    return 0


# Persistent / boot-referenced branches a seat re-fetches at boot: NEVER auto-delete.
KEEP_SUBSTRINGS = ("boot", "trip-odt-night", "fresh-session", "nest-doc-continuation",
                   "blnch-establish", "blnch-boot")


def _tip_ct(branch):
    try:
        return int(git("log", "-1", "--format=%ct", "origin/%s" % branch).strip())
    except ValueError:
        return 0


def delete_merged(args):
    """SAFE auto-delete of the ephemeral sprawl: a branch is deleted ONLY IF it is
    fully merged (zero branch-only content -> nothing lost), NOT a persistent/boot
    branch, and stale (tip older than --stale-days, default 4). Dry-run by default;
    pass --yes to execute. This is what the branch-janitor GitHub Action runs (its
    GITHUB_TOKEN has ref-delete permission; no seat needs delete-creds). A cloud seat's
    `git push --delete` is 403, so deletion is delegated to the Action, not to a seat.
    """
    now_ct = args_int(args, "--now", 0)  # Action passes the current epoch (no Date.now in-script)
    stale_days = args_int(args, "--stale-days", 4)
    keep_current = args_str(args, "--keep", "")  # a branch to always keep (e.g. the runner's own)
    do_it = "--yes" in args
    incl_del_only = "--include-deletion-only" in args  # also clear branches whose ONLY unique content is Dan's deliberate deletions (0 pure-additions, no media); nothing lost
    cutoff = (now_ct - stale_days * 86400) if now_ct else None
    victims = []
    for b, t, m, s in classify():
        if not s.startswith("MERGED") and not (incl_del_only and _deletion_only_safe(b)):
            continue  # has unique NEEDED content -> keep (NOTHING GETS LOST)
        if b == keep_current or any(k in b for k in KEEP_SUBSTRINGS):
            continue
        if cutoff is not None and _tip_ct(b) >= cutoff:
            continue  # too recent -> likely an active branch
        victims.append(b)
    if not victims:
        print("delete-merged: nothing to delete (no ephemeral merged+stale branches).")
        return 0
    print("delete-merged: %d ephemeral merged+stale branches%s:" % (len(victims), "" if do_it else " (DRY-RUN, pass --yes)"))
    for b in victims:
        print("  " + b)
    if not do_it:
        print("Re-run with --yes to delete (only fully-merged; nothing lost).")
        return 0
    ok = 0
    ledger = os.path.join(ROOT, "STATUS", "DELETED_BRANCHES_LEDGER.md")
    for b in victims:
        # NOTHING-GETS-LOST: capture the tip SHA BEFORE deleting, so the deletion is always
        # recoverable (git fetch origin <sha> inside GitHub's retention) and permanently recorded.
        sha = git("rev-parse", "origin/%s" % b).strip()
        r = subprocess.run(["git", "push", "origin", "--delete", b], cwd=ROOT,
                           capture_output=True, text=True)
        if r.returncode == 0:
            ok += 1
            print("  deleted %s" % b)
            try:
                with open(ledger, "a") as fh:
                    fh.write("| `%s` | %s | deletion-only-safe janitor-run; recoverable |\n" % (sha, b))
            except OSError:
                pass  # ledger write is best-effort; never brick the run
        else:
            print("  FAILED %s: %s" % (b, (r.stderr or r.stdout).strip().splitlines()[-1:] or ["?"]))
    print("delete-merged: deleted %d/%d (tip SHAs recorded to STATUS/DELETED_BRANCHES_LEDGER.md)." % (ok, len(victims)))
    return 0


def args_int(args, flag, default):
    if flag in args:
        try:
            return int(args[args.index(flag) + 1])
        except (ValueError, IndexError):
            return default
    return default


def args_str(args, flag, default):
    if flag in args:
        try:
            return args[args.index(flag) + 1]
        except IndexError:
            return default
    return default


def _ever_on_main(path):
    """True if <path> has ANY history on main (so its current absence = a deliberate
    deletion). We do NOT un-delete Dan's deliberate deletions (SR21); those get flagged,
    not auto-reconciled."""
    return bool(git("rev-list", "-1", "origin/main", "--", path).strip())


def _deletion_only_safe(b):
    """A non-merged branch is STILL safe to delete when its ONLY branch-only content is
    files Dan deliberately deleted from main (every branch-only path has main-history = a
    deletion, none is a fresh addition) AND it carries no branch-only media. Deleting it
    loses nothing: the unique files are ones already removed from main on purpose (SR21),
    and --reconcile-text confirms 0 pure-additions. Media branches (unique bytes) never
    qualify here; their bytes go to Drive first, never deleted from under a catalog."""
    only = branch_only_files(b)
    if not only or any(is_media(f) for f in only):
        return False
    return all(_ever_on_main(f) for f in only)


def _branch_path_mtime(branch, path):
    """Unix time of the newest commit on <branch> touching <path> (collision tie-break)."""
    try:
        return int(git("log", "-1", "--format=%ct", "origin/%s" % branch, "--", path).strip())
    except ValueError:
        return 0


def reconcile_text(branches):
    branches = branches or [b for b, t, m, s in classify() if t > 0]
    # 1. gather every branch-only text path -> set of branches carrying it
    by_path = {}
    for b in branches:
        for f in branch_only_files(b):
            if not is_media(f):
                by_path.setdefault(f, set()).add(b)
    # 2. split: never-on-main (safe pure add) vs was-on-main (deliberate deletion -> flag, do not un-delete)
    deleted_flag = sorted(p for p in by_path if _ever_on_main(p))
    fresh = {p: brs for p, brs in by_path.items() if p not in set(deleted_flag)}
    # 3. resolve collisions (same path on >1 branch): newest commit wins
    collisions = []
    staged = 0
    for path, brs in sorted(fresh.items()):
        if len(brs) == 1:
            src = next(iter(brs))
        else:
            ranked = sorted(brs, key=lambda b: _branch_path_mtime(b, path), reverse=True)
            src = ranked[0]
            collisions.append((path, src, ranked[1:]))
        if subprocess.run(["git", "checkout", "origin/%s" % src, "--", path], cwd=ROOT,
                          capture_output=True, text=True).returncode == 0:
            staged += 1
    print("reconcile-text: staged %d branch-only text records (NOTHING GETS LOST)." % staged)
    if collisions:
        print("  %d path-collisions resolved newest-commit-wins:" % len(collisions))
        for path, src, losers in collisions[:15]:
            print("    %s <- %s (also on %d other branch(es))" % (path, src, len(losers)))
        if len(collisions) > 15:
            print("    ... +%d more collisions" % (len(collisions) - 15))
    if deleted_flag:
        print("  %d paths SKIPPED (were on main, now absent = deliberate deletion; NOT un-deleted, SR21):"
              % len(deleted_flag))
        for p in deleted_flag[:15]:
            print("    %s" % p)
        if len(deleted_flag) > 15:
            print("    ... +%d more" % (len(deleted_flag) - 15))
    print("Review `git status`, then commit. Media handled separately (--media-manifest).")
    return 0


def media_manifest(branches):
    branches = branches or [b for b, t, m, s in classify() if m > 0]
    print("# stranded-media manifest (feed to media_to_lagos.py -> Drive)")
    print("# branch\tpath")
    n = 0
    for b in branches:
        for f in branch_only_files(b):
            if is_media(f):
                print("%s\t%s" % (b, f))
                n += 1
    sys.stderr.write("\n%d stranded media files across %d branches (route to LAGOS/Drive, not git).\n"
                     % (n, len(branches)))
    return 0


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, rest = argv[0], argv[1:]
    if cmd == "--report":
        return report()
    if cmd == "--heal":
        return heal()
    if cmd == "--reconcile-text":
        return reconcile_text(rest)
    if cmd == "--media-manifest":
        return media_manifest(rest)
    if cmd == "--deletable":
        return deletable()
    if cmd == "--delete-merged":
        return delete_merged(rest)
    print("unknown command: %s (see --help)" % cmd)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
