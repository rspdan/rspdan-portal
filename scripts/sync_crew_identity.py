#!/usr/bin/env python3
"""Sync or verify the portable identity-check snapshot from nest-bridge.

The registry remains authoritative in nest-bridge. No source is modified.
--check verifies local hashes and also source hashes when a source checkout is
available. A standalone clone can use its recorded snapshot without that sibling.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "scripts" / "crew-identity"
FILES = {
    "crew_identity_registry.json": "ENGINE/crew_identity_registry.json",
    "crew_identity_preflight.py": "ENGINE/crew_identity_preflight.py",
    "crew_identity_commit_gate.py": "ENGINE/crew_identity_commit_gate.py",
    "install_identity_hooks.py": "ENGINE/install_identity_hooks.py",
    "crew_identity_delivery.py": "ENGINE/crew_identity_delivery.py",
    "CREW_IDENTITY.md": "RELAY/CREW_IDENTITY.md",
}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def local_copy(name, raw, source_ref):
    if name != "CREW_IDENTITY.md":
        return raw
    text = raw.decode("utf-8")
    text = text.replace("../ENGINE/crew_identity_registry.json", "crew_identity_registry.json")
    for script in ("crew_identity_preflight.py", "crew_identity_delivery.py", "install_identity_hooks.py"):
        text = text.replace(f"python3 ENGINE/{script}", f"python3 scripts/crew-identity/{script}")
    # These provenance files remain in the authority repository, not this bundle.
    for reference in ("INCIDENT_Bee_Pronoun_112526.md", "CONTAMINATION_NOTE_BLanche_Transfer_Stan_040526.md"):
        text = text.replace(f"]({reference})", f"](https://github.com/rspdan/nest-bridge/blob/{source_ref}/RELAY/{reference})")
    return text.encode("utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path(os.environ.get("NEST_BRIDGE_ROOT", str(ROOT.parent / "nest-bridge"))))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    try:
        if args.check:
            manifest = json.loads((DEST / "manifest.json").read_text())
            if manifest.get("version") != 1 or set(manifest.get("files", {})) != set(FILES):
                raise ValueError("Unexpected identity bundle manifest")
            source_available = args.source.is_dir()
            for name, source_path in FILES.items():
                record = manifest["files"][name]
                if record.get("source") != source_path or digest((DEST / name).read_bytes()) != record.get("sha256"):
                    raise ValueError(f"Identity bundle mismatch: {name}; sync from the authority repository")
                if source_available and digest((args.source / source_path).read_bytes()) != record.get("source_sha256"):
                    raise ValueError(f"Identity source changed: {source_path}; resync the bundle")
            return 0
        prepared = {}
        records = {}
        ref_result = subprocess.run(["git", "-C", str(args.source), "symbolic-ref", "--quiet", "--short", "HEAD"], capture_output=True, text=True)
        if ref_result.returncode:
            ref_result = subprocess.run(["git", "-C", str(args.source), "rev-parse", "HEAD"], capture_output=True, text=True)
        if ref_result.returncode or not ref_result.stdout.strip():
            raise ValueError("Cannot identify the authority repository reference")
        source_ref = ref_result.stdout.strip()
        for name, source_path in FILES.items():
            raw = (args.source / source_path).read_bytes()
            local = local_copy(name, raw, source_ref)
            prepared[name] = local
            records[name] = {"source": source_path, "source_sha256": digest(raw), "sha256": digest(local)}
        DEST.mkdir(parents=True, exist_ok=True)
        for name, raw in prepared.items():
            (DEST / name).write_bytes(raw)
        (DEST / "manifest.json").write_text(json.dumps({"version": 1, "authority": "rspdan/nest-bridge", "source_ref": source_ref,
            "scope": "Verified portable snapshot; edit authority sources and resync, never edit bundle files.",
            "files": records}, indent=2) + "\n")
        print("Identity-check snapshot synced from nest-bridge.")
        return 0
    except (OSError, UnicodeError, ValueError, KeyError, TypeError) as exc:
        print(f"Identity bundle check could not run: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
