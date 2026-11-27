#!/usr/bin/env python3
"""Prepare and release exact validated text for an authored-message caller.

The caller sends the returned `text` unchanged. This module never sends a
message, rewrites prose, or treats an old receipt as permission by itself.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys

import crew_identity_preflight as preflight

CHANNELS = {"commentary", "final", "handoff", "assembly"}


class DeliveryError(ValueError):
    pass


def validator_hash():
    return hashlib.sha256(Path(preflight.__file__).read_bytes()).hexdigest()


def check(text, subject, registry):
    result = preflight.validate_text(text, registry_path=registry,
                                     subject=subject, strict=True)
    if result["status"] != "pass" or result["findings"]:
        raise DeliveryError("Draft requires identity revision; no text released")
    return result


def prepare(text: str, channel: str, subject=None, registry=None):
    if channel not in CHANNELS:
        raise DeliveryError("Unsupported delivery channel")
    receipt = check(text, subject, registry)
    return {"version": 1, "channel": channel, "subject": subject, "text": text,
            "validator_sha256": validator_hash(), "receipt": receipt}


def release(packet, channel: str, registry=None):
    if (not isinstance(packet, dict) or packet.get("version") != 1
            or channel not in CHANNELS or packet.get("channel") != channel
            or not isinstance(packet.get("text"), str)
            or not isinstance(packet.get("receipt"), dict)
            or (packet.get("subject") is not None and not isinstance(packet["subject"], str))):
        raise DeliveryError("Malformed packet or mismatched delivery channel")
    if packet.get("validator_sha256") != validator_hash():
        raise DeliveryError("Validator changed; prepare the draft again")
    # Revalidation binds the exact body, declared subject, current policy, strict
    # mode and all findings. A caller cannot authorize new text with an old pass.
    current = check(packet["text"], packet.get("subject"), registry)
    if current != packet["receipt"]:
        raise DeliveryError("Draft, subject, policy or receipt changed; prepare again")
    return {"channel": channel, "text": packet["text"], "receipt": current,
            "validator_sha256": packet["validator_sha256"]}


def write_new_packet(path: Path, packet):
    # Exclusive creation prevents a failed new preparation from being mistaken
    # for replacement of an older successful packet at the same path.
    raw = (json.dumps(packet, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "wb") as output:
            output.write(raw)
    except BaseException:
        path.unlink(missing_ok=True)
        raise


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="operation", required=True)
    make = sub.add_parser("prepare")
    make.add_argument("--text-file", required=True, type=Path)
    make.add_argument("--packet", required=True, type=Path)
    make.add_argument("--channel", required=True, choices=sorted(CHANNELS))
    make.add_argument("--subject")
    make.add_argument("--registry", type=Path)
    send = sub.add_parser("release")
    send.add_argument("--packet", required=True, type=Path)
    send.add_argument("--channel", required=True, choices=sorted(CHANNELS))
    send.add_argument("--registry", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.operation == "prepare":
            text = args.text_file.read_bytes().decode("utf-8")
            packet = prepare(text, args.channel, args.subject, args.registry)
            write_new_packet(args.packet, packet)
            output = {"status": "prepared", "packet": str(args.packet),
                      "text_sha256": packet["receipt"]["text_sha256"],
                      "policy_sha256": packet["receipt"]["policy_sha256"]}
        else:
            packet = json.loads(args.packet.read_bytes().decode("utf-8"))
            output = release(packet, args.channel, args.registry)
    except (OSError, UnicodeError, ValueError, TypeError) as exc:
        # No draft body on stdout before every check succeeds.
        print(json.dumps({"status": "blocked", "error": str(exc)}), file=sys.stderr)
        return 1
    print(json.dumps(output, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
