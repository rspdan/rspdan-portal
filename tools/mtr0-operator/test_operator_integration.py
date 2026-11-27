"""Receive the operator bridge against actual isolated Astro routes.

Run from this directory with ``python3 -m unittest test_operator_integration``.
Only disposable accounts, stores, and loopback provider fixtures are used. The
optional MTR0_OPERATOR_RECEIPT path receives a credential-free success receipt.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
import uuid

from client import BridgeError, OperatorClient, OperatorConfig


HERE = Path(__file__).resolve().parent
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII="
)
DATA_URL = "data:image/png;base64," + base64.b64encode(PNG).decode("ascii")
ASSET = {"sha256": hashlib.sha256(PNG).hexdigest(), "mime": "image/png", "bytes": len(PNG)}
TOOLS = {
    "mtr0_status", "mtr0_studies_list", "mtr0_study_read", "mtr0_study_save",
    "mtr0_asset_upload", "mtr0_asset_read", "mtr0_invoke",
    "mtr0_operation_read", "mtr0_history",
    "mtr0_continuation_select", "mtr0_continuation_read", "mtr0_continuation_resume",
}


class Fixture:
    """Keep credentials inside the subprocess pipe and private config file."""

    def __init__(self):
        self.process = None
        self.sequence = 0

    async def receive(self):
        line = await asyncio.wait_for(self.process.stdout.readline(), timeout=90)
        if not line:
            raise RuntimeError("Isolated fixture exited without a protocol response")
        try:
            response = json.loads(line)
        except (ValueError, UnicodeError) as error:
            raise RuntimeError("Invalid isolated fixture protocol response") from error
        if not response.get("ok"):
            raise RuntimeError("Isolated fixture did not confirm the requested action; stage=" + str(response.get("stage", "command")))
        return response

    async def __aenter__(self):
        self.process = await asyncio.create_subprocess_exec(
            "node", str(HERE / "fixture_server.mjs"),
            stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        try:
            self.ready = await self.receive()
            return self
        except BaseException:
            await self.__aexit__(None, None, None)
            raise

    async def command(self, command, **arguments):
        self.sequence += 1
        message = {"id": self.sequence, "command": command, **arguments}
        self.process.stdin.write((json.dumps(message) + "\n").encode("utf-8"))
        await self.process.stdin.drain()
        response = await self.receive()
        if response.get("id") != self.sequence:
            raise RuntimeError("Isolated fixture response identity differs")
        return response

    async def __aexit__(self, *_):
        if not self.process or self.process.returncode is not None:
            return
        try:
            await asyncio.wait_for(self.command("stop"), timeout=15)
            await asyncio.wait_for(self.process.wait(), timeout=10)
        except (Exception, asyncio.CancelledError):
            if self.process.returncode is None:
                self.process.terminate()
                try:
                    await asyncio.wait_for(self.process.wait(), timeout=10)
                except asyncio.TimeoutError:
                    self.process.kill()
                    await self.process.wait()


def manual_study(asset):
    return {
        "schema": "nest-production-study/v1",
        "title": "Synthetic direct operator receiving study",
        "target": {"kind": "external-native", "name": "TARGET_CANARY.blend", "sha256": "a" * 64},
        "evidence": [
            {"id": "picture", "title": "Synthetic PNG", "kind": "image",
             "source": "LOCATOR_CANARY", "asset": asset, "text": None},
            {"id": "source-note", "title": "Source note", "kind": "text",
             "source": "NOTE_LOCATOR_CANARY", "asset": None,
             "text": "  An invented source note.\nLiteral text stays unchanged.  "},
            {"id": "not-selected", "title": "Unselected source", "kind": "text",
             "source": "Unused fixture", "asset": None, "text": "UNSELECTED_TEXT_CANARY"},
        ],
        "cards": [{"id": "manual", "parentId": None, "origin": "operator",
                   "observations": "MANUAL_CARD_CANARY", "proposal": "A retained manual draft.",
                   "keepFixed": "Keep camera and materials unchanged.", "imageCheck": "No preview exists.",
                   "limits": "This is a synthetic test.", "sourceIds": ["not-selected"]}],
        "corrections": [], "selectedCardId": "manual", "acceptedCardId": None,
        "preview": None, "nextAction": "NEXT_ACTION_CANARY",
    }


class OperatorReceivingTest(unittest.IsolatedAsyncioTestCase):
    async def cli(self, config, command, *arguments, payload=None, input_file=False):
        argv = [sys.executable, str(HERE / "cli.py"), "--config", str(config), command, *arguments]
        data = None
        if payload is not None:
            if input_file:
                path = config.parent / "synthetic-input.json"
                path.write_text(json.dumps(payload), encoding="utf-8")
                argv.extend(["--input", str(path)])
            else:
                data = json.dumps(payload).encode("utf-8")
        process = await asyncio.create_subprocess_exec(
            *argv, stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        try:
            stdout, _ = await asyncio.wait_for(process.communicate(data), timeout=100)
        except BaseException:
            process.kill()
            await process.wait()
            raise
        self.assertEqual(process.returncode, 0, f"CLI {command} did not succeed")
        result = json.loads(stdout)
        self.assertTrue(result.get("ok"), f"CLI {command} did not confirm success")
        return result

    async def mcp_call(self, session, name, arguments=None):
        result = await session.call_tool(name, arguments or {})
        self.assertFalse(result.isError, f"MCP {name} returned a tool error")
        value = result.structuredContent
        if value is None:
            texts = [item.text for item in result.content if item.type == "text"]
            self.assertEqual(len(texts), 1, f"MCP {name} did not return one JSON result")
            value = json.loads(texts[0])
        self.assertIsInstance(value, dict)
        self.assertTrue(value.get("ok"), f"MCP {name} did not confirm success")
        if name == "mtr0_asset_read":
            images = [item for item in result.content if item.type == "image"]
            self.assertEqual(len(images), 1, "MCP asset read must return actual pixels")
            self.assertEqual(images[0].mimeType, ASSET["mime"])
            self.assertEqual(base64.b64decode(images[0].data), PNG)
            value = {**value, "dataUrl": f"data:{images[0].mimeType};base64,{images[0].data}"}
        return value

    def check_asset(self, result):
        self.assertEqual(result["asset"], ASSET)
        self.assertEqual(result["dataUrl"], DATA_URL)
        self.assertEqual(base64.b64decode(result["dataUrl"].split(",", 1)[1]), PNG)

    def check_provider_call(self, call, operation, configuration):
        self.assertEqual(call["model"], f"synthetic-model-{configuration}")
        self.assertEqual(operation["request"]["requestSha256"], call["requestSha256"])
        self.assertEqual(operation["request"]["requestBytes"], call["requestBytes"])
        self.assertEqual(call["images"], [ASSET])
        user_parts = next(m["content"] for m in call["body"]["messages"] if m["role"] == "user")
        image_parts = [part for part in user_parts if part["type"] == "image_url"]
        self.assertEqual(len(image_parts), 1)
        self.assertEqual(image_parts[0]["image_url"]["url"], DATA_URL)
        wire = json.dumps(call["body"])
        for omitted in ["TARGET_CANARY", "LOCATOR_CANARY", "NOTE_LOCATOR_CANARY",
                        "MANUAL_CARD_CANARY", "UNSELECTED_TEXT_CANARY", "NEXT_ACTION_CANARY"]:
            self.assertNotIn(omitted, wire)

    async def test_client_cli_and_official_mcp_keep_work_across_engine_restart(self):
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client

        async with Fixture() as fixture:
            with tempfile.TemporaryDirectory(prefix="mtr0-operator-config-") as directory:
                config_path = Path(directory) / "operator.json"
                config_path.write_text(json.dumps({
                    "origin": fixture.ready["origin"], "cookie": fixture.ready["cookie"],
                    "timeout_seconds": 90,
                }), encoding="utf-8")
                config_path.chmod(0o600)
                config = OperatorConfig(fixture.ready["origin"], fixture.ready["cookie"], timeout_seconds=90)
                other_config = OperatorConfig(fixture.ready["origin"], fixture.ready["otherCookie"], timeout_seconds=90)
                async with OperatorClient(config) as client, OperatorClient(other_config) as other:
                    initial = await client.status()
                    self.assertEqual(initial["configuration"]["serviceId"], "synthetic-service-A")
                    self.assertTrue(initial["configuration"]["declaredImageInput"])
                    self.assertIn("capabilityDescriptor", initial)
                    self.assertEqual((await client.list_studies())["studies"], [])
                    uploaded = await client.upload_asset(DATA_URL)
                    self.assertEqual(uploaded["asset"], ASSET)
                    self.check_asset(await client.read_asset(ASSET["sha256"]))

                    study = manual_study(uploaded["asset"])
                    save = {"action": "save", "requestId": str(uuid.uuid4()),
                            "studyId": "study_" + str(uuid.uuid4()), "baseRevisionId": None, "study": study}
                    saved = await client.save_study(save)
                    study_id, revision_id = saved["saved"]["id"], saved["saved"]["revisionId"]
                    self.assertEqual(saved["study"], study)
                    self.assertEqual(await client.read_study(study_id, revision_id), saved)
                    self.assertEqual(await client.save_study(save), saved)
                    self.assertEqual((await client.list_studies())["studies"], [saved["saved"]])
                    invocation = {"action": "generate", "operationId": "op_" + str(uuid.uuid4()),
                                  "studyId": study_id, "revisionId": revision_id,
                                  "sourceIds": ["picture", "source-note"],
                                  "instruction": "Propose one bounded synthetic lighting study.",
                                  "allowedDomains": ["lighting"]}
                    first = await client.invoke(invocation)
                    first_operation = first["operation"]
                    self.assertEqual(first_operation["status"], "completed")
                    self.assertEqual(first_operation["request"]["provider"]["serviceId"], "synthetic-service-A")
                    self.assertEqual(await client.get_operation(invocation["operationId"]), first)
                    self.assertEqual(await client.invoke(invocation), first)
                    self.assertEqual(len((await client.history(study_id))["operations"]), 1)
                    self.assertEqual(await client.read_study(study_id), saved,
                                     "generated proposals must not replace authored work")
                    with self.assertRaises(BridgeError) as conflict:
                        await client.invoke({**invocation, "instruction": "Different request under an existing ID."})
                    self.assertEqual(conflict.exception.status, 409)

                    for read in [lambda: other.read_study(study_id), lambda: other.read_asset(ASSET["sha256"]),
                                 lambda: other.get_operation(invocation["operationId"])]:
                        with self.assertRaises(BridgeError) as hidden:
                            await read()
                        self.assertEqual(hidden.exception.status, 404)
                    self.assertEqual((await other.list_studies())["studies"], [])
                    self.assertEqual((await other.history(study_id))["operations"], [])
                    with self.assertRaises(BridgeError) as forbidden:
                        await other.invoke({**invocation, "operationId": "op_" + str(uuid.uuid4())})
                    self.assertEqual(forbidden.exception.status, 404)

                    # Exercise the complete CLI surface without creating another provider call.
                    self.assertEqual((await self.cli(config_path, "status"))["configuration"], initial["configuration"])
                    self.assertEqual((await self.cli(config_path, "studies-list"))["studies"], [saved["saved"]])
                    self.assertEqual(await self.cli(config_path, "study-get", "--id", study_id, "--revision", revision_id), saved)
                    self.assertEqual(await self.cli(config_path, "study-save", payload=save, input_file=True), saved)
                    self.assertEqual((await self.cli(config_path, "asset-upload", payload={"dataUrl": DATA_URL}))["asset"], ASSET)
                    self.check_asset(await self.cli(config_path, "asset-read", "--sha256", ASSET["sha256"]))
                    self.assertEqual(await self.cli(config_path, "invoke", payload=invocation), first)
                    self.assertEqual(await self.cli(config_path, "operation-get", "--id", invocation["operationId"]), first)
                    self.assertEqual(len((await self.cli(config_path, "operation-history", "--study-id", study_id))["operations"]), 1)
                    before_restart = await fixture.command("stats")
                    self.assertEqual(len(before_restart["calls"]["A"]), 1)
                    self.assertEqual(len(before_restart["calls"]["B"]), 0)
                    self.check_provider_call(before_restart["calls"]["A"][0], first_operation, "A")

                    await fixture.command("restart", configuration="B")
                    current = await client.status()
                    self.assertEqual(current["configuration"]["serviceId"], "synthetic-service-B")
                    self.assertEqual(current["configuration"]["model"], "synthetic-model-B")
                    self.assertEqual(await client.read_study(study_id), saved)
                    self.check_asset(await client.read_asset(ASSET["sha256"]))
                    self.assertEqual(await client.get_operation(invocation["operationId"]), first)
                    self.assertEqual(await client.invoke(invocation), first)
                    no_resend = await fixture.command("stats")
                    self.assertEqual(len(no_resend["calls"]["A"]), 1)
                    self.assertEqual(len(no_resend["calls"]["B"]), 0)

                    parameters = StdioServerParameters(
                        command=sys.executable, args=[str(HERE / "server.py"), "--config", str(config_path)],
                    )
                    with open(os.devnull, "w", encoding="utf-8") as errors:
                        async with stdio_client(parameters, errlog=errors) as (reader, writer):
                            async with ClientSession(reader, writer) as session:
                                await session.initialize()
                                tool_list = await session.list_tools()
                                self.assertEqual({tool.name for tool in tool_list.tools}, TOOLS)
                                mcp_status = await self.mcp_call(session, "mtr0_status")
                                self.assertEqual(mcp_status["configuration"], current["configuration"])
                                self.assertIn("capabilityDescriptor", mcp_status)
                                self.assertEqual((await self.mcp_call(session, "mtr0_studies_list"))["studies"], [saved["saved"]])
                                self.assertEqual(await self.mcp_call(session, "mtr0_study_read", {"study_id": study_id, "revision_id": revision_id}), saved)
                                self.assertEqual(await self.mcp_call(session, "mtr0_study_save", {"request": save}), saved)
                                self.assertEqual((await self.mcp_call(session, "mtr0_asset_upload", {"data_url": DATA_URL}))["asset"], ASSET)
                                self.check_asset(await self.mcp_call(session, "mtr0_asset_read", {"sha256": ASSET["sha256"]}))
                                self.assertEqual(await self.mcp_call(session, "mtr0_invoke", {"request": invocation}), first)
                                self.assertEqual(await self.mcp_call(session, "mtr0_operation_read", {"operation_id": invocation["operationId"]}), first)
                                after_mcp_replay = await fixture.command("stats")
                                self.assertEqual(len(after_mcp_replay["calls"]["B"]), 0)

                                fresh = {**invocation, "operationId": "op_" + str(uuid.uuid4())}
                                second = await self.mcp_call(session, "mtr0_invoke", {"request": fresh})
                                self.assertEqual(second["operation"]["status"], "completed")
                                self.assertEqual(second["operation"]["request"]["provider"]["serviceId"], "synthetic-service-B")
                                self.assertNotEqual(second["operation"]["outcome"]["card"], first_operation["outcome"]["card"])
                                self.assertEqual(await self.mcp_call(session, "mtr0_operation_read", {"operation_id": fresh["operationId"]}), second)
                                history = await self.mcp_call(session, "mtr0_history", {"study_id": study_id})
                                self.assertEqual({row["id"]: row["serviceId"] for row in history["operations"]},
                                                 {invocation["operationId"]: "synthetic-service-A", fresh["operationId"]: "synthetic-service-B"})
                    self.assertEqual(await client.get_operation(invocation["operationId"]), first)
                    self.assertEqual(await client.read_study(study_id), saved)
                    stats = await fixture.command("stats")
                    self.assertEqual(len(stats["calls"]["A"]), 1)
                    self.assertEqual(len(stats["calls"]["B"]), 1)
                    self.check_provider_call(stats["calls"]["B"][0], second["operation"], "B")

                    if receipt_path := os.environ.get("MTR0_OPERATOR_RECEIPT"):
                        receipt = {
                            "status": "pass", "scope": "Actual isolated Astro; synthetic accounts, saved work and loopback providers only",
                            "transports": ["Python callable", "CLI subprocess", "official MCP SDK stdio"],
                            "mcpTools": sorted(TOOLS), "cliCommandsExercised": 9,
                            "checks": ["exact image bytes", "manual authored study round trip", "owner isolation",
                                       "conflicting operation ID rejected", "selected evidence only on provider wire",
                                       "same durable workspace after Astro restart", "historical A receipt unchanged under B",
                                       "historical retry sends no provider request", "fresh caller ID reaches B",
                                       "generated cards do not overwrite authored work"],
                            "providerCalls": {"A": 1, "B": 1}, "studyId": study_id,
                            "operationIds": {"A": invocation["operationId"], "B": fresh["operationId"]},
                            "asset": ASSET,
                            "sourceSha256": {name: hashlib.sha256((HERE / name).read_bytes()).hexdigest()
                                             for name in ["client.py", "cli.py", "server.py", "fixture_server.mjs", "test_operator_integration.py"]},
                        }
                        Path(receipt_path).write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    unittest.main()
