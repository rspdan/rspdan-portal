#!/usr/bin/env python3
"""JSON CLI; credentials come only from a private configured session file."""
import argparse
import asyncio
import json
import os
from pathlib import Path
import sys

from client import BridgeError, MAX_STUDY_BODY, OperatorClient, OperatorConfig


def read_input(filename):
    try:
        with (open(filename, "rb") if filename != "-" else sys.stdin.buffer) as stream:
            raw = stream.read(MAX_STUDY_BODY + 1)
        if len(raw) > MAX_STUDY_BODY:
            raise BridgeError("request-too-large", "Input file exceeds the request bound.")
        return json.loads(raw)
    except BridgeError:
        raise
    except (OSError, ValueError):
        raise BridgeError("input", "Could not read a bounded JSON request.") from None


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--config", default=os.environ.get("MTR0_OPERATOR_CONFIG"))
    commands = p.add_subparsers(dest="command", required=True)
    for name in ("status", "studies-list"):
        commands.add_parser(name)
    get = commands.add_parser("study-get"); get.add_argument("--id", required=True); get.add_argument("--revision")
    for name in ("study-save", "asset-upload", "invoke", "continuation-select"):
        commands.add_parser(name).add_argument("--input", default="-")
    commands.add_parser("asset-read").add_argument("--sha256", required=True)
    commands.add_parser("operation-get").add_argument("--id", required=True)
    commands.add_parser("operation-history").add_argument("--study-id", required=True)
    commands.add_parser("continuation-read").add_argument("--study-id", required=True)
    resume = commands.add_parser("continuation-resume")
    resume.add_argument("--study-id", required=True)
    resume.add_argument("--operation-id", required=True)
    context = commands.add_parser("program-context")
    context.add_argument("--study-id", required=True)
    context.add_argument("--journal", required=True)
    choice = commands.add_parser("program-choice")
    choice.add_argument("--journal", required=True)
    choice.add_argument("--input", required=True)
    return p


async def dispatch(args):
    if not args.config:
        raise BridgeError("configuration", "Set MTR0_OPERATOR_CONFIG or --config to a private session file.")
    async with OperatorClient(OperatorConfig.load(args.config)) as c:
        match args.command:
            case "status": return await c.status()
            case "studies-list": return await c.list_studies()
            case "study-get": return await c.read_study(args.id, args.revision)
            case "study-save": return await c.save_study(read_input(args.input))
            case "asset-upload":
                value = read_input(args.input)
                if not isinstance(value, dict) or set(value) != {"dataUrl"}:
                    raise BridgeError("input", "Asset input must contain only dataUrl.")
                return await c.upload_asset(value["dataUrl"])
            case "asset-read": return await c.read_asset(args.sha256)
            case "invoke": return await c.invoke(read_input(args.input))
            case "operation-get": return await c.get_operation(args.id)
            case "operation-history": return await c.history(args.study_id)
            case "continuation-read": return await c.continuation_read(args.study_id)
            case "continuation-select": return await c.continuation_select(read_input(args.input))
            case "continuation-resume": return await c.continuation_resume(args.study_id, args.operation_id)
            case "program-context":
                from program import NativeProgram
                return await NativeProgram(c, args.journal).context(args.study_id)
            case "program-choice":
                from program import MAX_REPLY, NativeProgram
                try:
                    with open(args.input, "rb") as stream:
                        raw = stream.read(MAX_REPLY + 1)
                except OSError:
                    raise BridgeError("choice-input", "Could not read the operator-retained literal reply.") from None
                return await NativeProgram(c, args.journal).choose(raw)


def main():
    args = parser().parse_args()
    try:
        result = asyncio.run(dispatch(args)); code = 0 if result.get("ok") else 1
    except BridgeError as error:
        result, code = error.as_dict(), 1
    except KeyboardInterrupt:
        result, code = BridgeError("interrupted", "Local process interrupted; read the supplied operation ID before any further invocation.", uncertain=True).as_dict(), 130
    except Exception:
        result, code = BridgeError("bridge", "The bridge did not produce a confirmed receipt; read saved history before retrying a write.", uncertain=True).as_dict(), 1
    # JSON protocol is UTF-8 even when the Windows console code page differs.
    sys.stdout.buffer.write((json.dumps(result, ensure_ascii=False) + "\n").encode("utf-8"))
    return code


if __name__ == "__main__":
    sys.exit(main())
