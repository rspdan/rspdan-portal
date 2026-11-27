#!/usr/bin/env python3
"""Install the existing identity check while retaining the active git hooks.

Generated wrappers live in Git's metadata, not in tracked work. The previous
hook route remains a delegate for every hook type. This is a git installer;
it deliberately updates Git's hook route. It neither installs a hosted-chat
interceptor nor rewrites Claude user settings.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys

HOOKS = (
    "applypatch-msg", "pre-applypatch", "post-applypatch", "pre-commit",
    "pre-merge-commit", "prepare-commit-msg", "commit-msg", "post-commit",
    "pre-rebase", "post-checkout", "post-merge", "pre-push", "pre-receive",
    "update", "proc-receive", "post-receive", "post-update", "reference-transaction",
    "push-to-checkout", "pre-auto-gc", "post-rewrite", "sendemail-validate",
    "fsmonitor-watchman", "p4-changelist", "p4-prepare-changelist",
    "p4-post-changelist", "p4-pre-submit",
)
TAG = "nest-identity-hooks/v1"


class InstallError(ValueError):
    pass


def git(root, *args, optional=False):
    result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True)
    if result.returncode:
        if optional:
            return None
        raise InstallError(result.stderr.strip() or f"git {args[0]} failed")
    return result.stdout.strip()


def paths(root):
    root = Path(git(root, "rev-parse", "--show-toplevel")).resolve()
    common = Path(git(root, "rev-parse", "--path-format=absolute", "--git-common-dir")).resolve()
    gitdir = Path(git(root, "rev-parse", "--absolute-git-dir")).resolve()
    worktree_config = git(root, "config", "--bool", "--get", "extensions.worktreeConfig", optional=True) == "true"
    managed = (gitdir if worktree_config else common) / "nest-identity-hooks"
    return root, common, managed, "--worktree" if worktree_config else "--local"


def route_dir(root, common, route):
    if route is None:
        return common / "hooks"
    expanded = Path(os.path.expanduser(route))
    return (expanded if expanded.is_absolute() else root / expanded).resolve()


def profile(root):
    if (root / "ENGINE/crew_identity_commit_gate.py").is_file():
        folder = root / "ENGINE"
        kind = "bridge"
    elif (root / "scripts/crew-identity/crew_identity_commit_gate.py").is_file():
        folder = root / "scripts/crew-identity"
        kind = "portal"
    else:
        raise InstallError("This checkout has no installed identity-check sources")
    for name in ("install_identity_hooks.py", "crew_identity_commit_gate.py", "crew_identity_preflight.py", "crew_identity_registry.json"):
        if not (folder / name).is_file():
            raise InstallError(f"Missing identity installation source: {folder / name}")
    return kind, folder


def write_if_changed(path, data, executable=False):
    if not path.exists() or path.read_bytes() != data:
        temporary = path.with_name(path.name + f".tmp-{os.getpid()}")
        temporary.write_bytes(data)
        os.replace(temporary, path)
    if executable:
        path.chmod(path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def wrapper(hook):
    return f'''#!/bin/sh
# {TAG} managed wrapper; prior hooks remain delegated.
ROOT=$(git rev-parse --show-toplevel) || exit 2
PY=""
for candidate in python3 python py; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys' >/dev/null 2>&1; then PY="$candidate"; break; fi
done
if [ -z "$PY" ]; then echo "Identity hook could not run: Python is unavailable." >&2; exit 2; fi
if [ -f "$ROOT/ENGINE/install_identity_hooks.py" ]; then
  DRIVER="$ROOT/ENGINE/install_identity_hooks.py"
elif [ -f "$ROOT/scripts/crew-identity/install_identity_hooks.py" ]; then
  DRIVER="$ROOT/scripts/crew-identity/install_identity_hooks.py"
else
  echo "Identity hook could not run: installer source is missing in this checkout." >&2; exit 2
fi
exec "$PY" "$DRIVER" --repo "$ROOT" --run-hook {hook} -- "$@"
'''.encode()


def read_state(directory):
    try:
        data = json.loads((directory / "state.json").read_text())
    except (OSError, ValueError) as exc:
        raise InstallError(f"Cannot read identity hook installation state: {directory}") from exc
    if not isinstance(data, dict) or data.get("format") != TAG or not isinstance(data.get("previous_route"), (str, type(None))):
        raise InstallError("Invalid identity hook installation state")
    return data


def install(root):
    root, common, managed, scope = paths(root)
    kind, folder = profile(root)
    # Validate the actual policy through the existing validator, not a new parser.
    spec = importlib.util.spec_from_file_location("identity_install_preflight", folder / "crew_identity_preflight.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    policy = module.validate_text("")
    if kind == "portal":
        checked = subprocess.run([sys.executable, str(root / "scripts/sync_crew_identity.py"), "--check"], cwd=root)
        if checked.returncode:
            raise InstallError("Portable identity bundle verification failed")
    elif not (root / ".githooks/legacy-pre-commit").is_file():
        raise InstallError("The existing non-identity gate roster is missing")

    current = git(root, "config", "--path", "--get", "core.hooksPath", optional=True)
    active = route_dir(root, common, current)
    if active == managed.resolve():
        state = read_state(managed)
        previous = state["previous_route"]
    elif (active / "state.json").is_file():
        # A linked worktree can inherit this installer's common-directory route.
        # Retain the original delegate instead of chaining managed wrappers.
        # An unrelated legacy tool may also have a state.json helper; preserve it.
        try:
            candidate_state = json.loads((active / "state.json").read_text())
        except (OSError, ValueError):
            candidate_state = None
        if isinstance(candidate_state, dict) and candidate_state.get("format") == TAG:
            previous = read_state(active)["previous_route"]
        else:
            previous = current
    else:
        previous = current
    previous_dir = route_dir(root, common, previous)
    if previous_dir == managed.resolve():
        raise InstallError("Refusing a recursive identity hook route")
    if managed.exists():
        unknown = [p.name for p in managed.iterdir()
                   if p.name != "state.json" and p.is_file() and TAG.encode() not in p.read_bytes()]
        if unknown:
            raise InstallError("Refusing to replace unmanaged files in identity hook directory: " + ", ".join(unknown))
    managed.mkdir(parents=True, exist_ok=True)
    # Helpers in the legacy directory remain there for its hooks to use. Git
    # does not invoke helper filenames as hooks, so do not wrap or rename them.
    names = set(HOOKS)
    for name in names:
        if not name.replace("-", "").replace("_", "").isalnum():
            raise InstallError(f"Unsupported legacy hook filename: {name}")
        write_if_changed(managed / name, wrapper(name), executable=True)
    state = {"format": TAG, "previous_route": previous, "profile": kind,
             "policy_sha256_at_install": policy["policy_sha256"]}
    write_if_changed(managed / "state.json", (json.dumps(state, indent=2) + "\n").encode())
    git(root, "config", scope, "core.hooksPath", str(managed))
    effective = git(root, "config", "--path", "--get", "core.hooksPath")
    if route_dir(root, common, effective) != managed.resolve():
        raise InstallError("Installed hook route is not effective; another config scope overrides it")
    return {"status": "configured", "repository": str(root), "hooks_path": effective,
            "previous_hooks_path": str(previous_dir), "hook_types": sorted(names),
            "policy_sha256": policy["policy_sha256"],
            "scope": "Effective git hook route verified. This is not a hosted-chat interceptor or a claim that a commit ran."}


def run_hook(root, hook, args):
    root, common, managed, _ = paths(root)
    kind, folder = profile(root)
    effective = route_dir(root, common, git(root, "config", "--path", "--get", "core.hooksPath", optional=True))
    state = read_state(effective)
    previous = route_dir(root, common, state["previous_route"])
    key = str(effective) + "|" + hook
    try:
        stack = json.loads(os.environ.get("NEST_IDENTITY_HOOK_STACK", "[]"))
    except ValueError as exc:
        raise InstallError("Invalid identity hook recursion state") from exc
    if not isinstance(stack, list) or any(not isinstance(item, str) for item in stack) or key in stack:
        raise InstallError("Recursive identity hook invocation refused")
    env = {**os.environ, "NEST_IDENTITY_HOOK_STACK": json.dumps([*stack, key])}
    legacy = previous / hook
    if previous == effective:
        raise InstallError("Recursive legacy hook route refused")
    if hook == "pre-commit":
        result = subprocess.run([sys.executable, str(folder / "crew_identity_commit_gate.py"), "--repo", str(root)], cwd=root, env=env)
        if result.returncode:
            return result.returncode
        if kind == "bridge":
            roster = root / ".githooks/legacy-pre-commit"
            # Old bootstrap versions installed this exact roster as pre-commit.
            # Run it once, while retaining arbitrary custom legacy hooks.
            nested = common / "hooks/pre-commit" if previous == root / ".githooks" else legacy
            same_roster = nested.is_file() and nested.read_bytes() == roster.read_bytes()
            if not same_roster:
                result = subprocess.run(["bash", str(roster), *args], cwd=root, env=env)
                if result.returncode:
                    return result.returncode
        else:
            # Fresh portal clones still need the existing mojibake/em-dash
            # content gates, even when no prior hook route was configured.
            content_hook = root / "scripts/hooks/pre-commit"
            if legacy.resolve() != content_hook.resolve():
                result = subprocess.run(["sh", str(content_hook), *args], cwd=root, env=env)
                if result.returncode:
                    return result.returncode
    if legacy.is_file() and os.access(legacy, os.X_OK):
        # Git's shell honors the legacy hook's own shebang, including Python
        # hooks, and provides the same launch behavior on Git for Windows.
        return subprocess.run(["sh", "-c", 'exec "$0" "$@"', str(legacy), *args], cwd=root, env=env).returncode
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--run-hook")
    parser.add_argument("hook_args", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    try:
        if args.run_hook:
            if not args.run_hook.replace("-", "").replace("_", "").isalnum():
                raise InstallError("Invalid hook name")
            return run_hook(args.repo, args.run_hook, args.hook_args[1:] if args.hook_args[:1] == ["--"] else args.hook_args)
        print(json.dumps(install(args.repo), indent=2))
        return 0
    except (OSError, ValueError, ImportError) as exc:
        print(f"Identity hook installation/execution failed: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
