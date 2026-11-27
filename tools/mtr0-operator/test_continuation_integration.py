"""Actual operator continuation through authenticated Astro, CLI and MCP.
Synthetic providers only; existing manual study and original operation IDs retained.
"""
import asyncio
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
import uuid

import httpx
from client import BridgeError, OperatorClient, OperatorConfig
import test_operator_integration as support

HERE = Path(__file__).resolve().parent

class ContinuationReceivingTest(unittest.IsolatedAsyncioTestCase):
    cli = support.OperatorReceivingTest.cli
    mcp_call = support.OperatorReceivingTest.mcp_call

    async def test_retained_result_reaches_next_input_across_callers_and_reopen(self):
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
        async with support.Fixture() as fixture:
            with tempfile.TemporaryDirectory(prefix="mtr0-continuation-config-") as directory:
                config = OperatorConfig(fixture.ready["origin"], fixture.ready["cookie"])
                other = OperatorConfig(fixture.ready["origin"], fixture.ready["otherCookie"])
                config_path = Path(directory) / "operator.json"
                config_path.write_text(json.dumps({"origin": config.origin, "cookie": config.cookie}))
                config_path.chmod(0o600)
                async with OperatorClient(config) as client, OperatorClient(other) as outsider:
                    status = await client.status()
                    self.assertTrue(status["capabilityDescriptor"]["continuation"]["available"])
                    asset = (await client.upload_asset(support.DATA_URL))["asset"]
                    study = support.manual_study(asset)
                    save = {"action": "save", "requestId": str(uuid.uuid4()),
                            "studyId": "study_" + str(uuid.uuid4()), "baseRevisionId": None, "study": study}
                    saved = await client.save_study(save)
                    study_id = saved["saved"]["id"]
                    first_input = {"action": "generate", "operationId": "op_" + str(uuid.uuid4()),
                        "studyId": study_id, "revisionId": saved["saved"]["revisionId"],
                        "sourceIds": ["picture", "source-note"], "instruction": "Use picture and source-note for one lighting study.",
                        "allowedDomains": ["lighting"]}
                    first_selection = {"action": "select", "input": first_input,
                        "previousOperationId": None, "previousResultHash": None}
                    selected = await self.cli(config_path, "continuation-select", payload=first_selection)
                    self.assertEqual(selected["continuation"]["selection"], first_selection)
                    self.assertIsNone(selected["operation"])
                    self.assertTrue(selected["studyHead"]["selectedRevisionCurrent"])
                    # The actual route retains all existing request gates.
                    async with httpx.AsyncClient() as http:
                        url = config.origin + "/api/director-engine"
                        cookie = {"Cookie": config.cookie}
                        self.assertEqual((await http.get(url, params={"continuationStudyId": study_id})).status_code, 401)
                        for query in ("?continuationStudyId=" + study_id + "&studyId=" + study_id,
                                      "?continuationStudyId=" + study_id + "&continuationStudyId=" + study_id):
                            self.assertEqual((await http.get(url + query, headers=cookie)).status_code, 400)
                        resume = {"action": "resume", "studyId": study_id, "operationId": first_input["operationId"]}
                        self.assertEqual((await http.post(url, headers=cookie, json=resume)).status_code, 403)
                        headers = {**cookie, "Origin": config.origin}
                        self.assertEqual((await http.post(url + "?x=y", headers=headers, json=resume)).status_code, 400)
                        self.assertEqual((await http.post(url, headers=headers, json={**resume, "actor": "invented"})).status_code, 400)
                        self.assertEqual((await http.post(url, headers=headers, json={**first_selection, "actor": "invented"})).status_code, 400)
                        self.assertEqual((await http.post(url, headers={**headers, "Content-Type": "application/json"},
                            content=b" " * (32 * 1024 + 1))).status_code, 413)
                    for method in (lambda: outsider.continuation_read(study_id),
                                   lambda: outsider.continuation_resume(study_id, first_input["operationId"]),
                                   lambda: outsider.continuation_select(first_selection)):
                        with self.assertRaises(BridgeError) as hidden:
                            await method()
                        self.assertEqual(hidden.exception.status, 404)
                    first = await client.continuation_resume(study_id, first_input["operationId"])
                    self.assertEqual(first["continuation"]["next"], "select-next")
                    self.assertEqual(first["operation"]["status"], "completed")
                    returned_proposal = first["operation"]["outcome"]["card"]["proposal"]["text"]
                    next_input = {**first_input, "operationId": "op_" + str(uuid.uuid4()),
                        "instruction": "Use picture and source-note to refine this retained proposal: " + returned_proposal}
                    successor = {"action": "select", "input": next_input,
                        "previousOperationId": first_input["operationId"],
                        "previousResultHash": first["continuation"]["resultHash"]}
                    # Save the caller's result-informed choice through the actual typed tool.
                    parameters = StdioServerParameters(command=sys.executable,
                        args=[str(HERE / "server.py"), "--config", str(config_path)])
                    with open(os.devnull, "w", encoding="utf-8") as errors:
                        async with stdio_client(parameters, errlog=errors) as (reader, writer):
                            async with ClientSession(reader, writer) as session:
                                await session.initialize()
                                choices = {t.name: t for t in (await session.list_tools()).tools}
                                self.assertTrue({"mtr0_continuation_read", "mtr0_continuation_select",
                                    "mtr0_continuation_resume"} <= set(choices))
                                second_selected = await self.mcp_call(session, "mtr0_continuation_select", {"request": successor})
                                self.assertEqual(second_selected["continuation"]["selection"], successor)
                                self.assertEqual(await self.mcp_call(session, "mtr0_continuation_select",
                                    {"request": successor}), second_selected)
                    await fixture.command("restart", configuration="B")
                    reopened = await self.cli(config_path, "continuation-read", "--study-id", study_id)
                    self.assertEqual(reopened, second_selected)
                    self.assertEqual((await client.get_operation(first_input["operationId"]))["operation"], first["operation"])
                    with self.assertRaises(BridgeError) as old_step:
                        await client.continuation_resume(study_id, first_input["operationId"])
                    self.assertEqual(old_step.exception.status, 409)
                    with open(os.devnull, "w", encoding="utf-8") as errors:
                        async with stdio_client(parameters, errlog=errors) as (reader, writer):
                            async with ClientSession(reader, writer) as session:
                                await session.initialize()
                                self.assertEqual(await self.mcp_call(session, "mtr0_continuation_read",
                                    {"study_id": study_id}), reopened)
                                second = await self.mcp_call(session, "mtr0_continuation_resume",
                                    {"study_id": study_id, "operation_id": next_input["operationId"]})
                    self.assertEqual(second["operation"]["status"], "completed")
                    self.assertEqual(second["operation"]["request"]["instruction"], next_input["instruction"])
                    self.assertEqual(await self.cli(config_path, "continuation-resume", "--study-id", study_id,
                        "--operation-id", next_input["operationId"]), second)
                    stats = await fixture.command("stats")
                    self.assertEqual({k: len(v) for k, v in stats["calls"].items()}, {"A": 1, "B": 1})
                    self.assertIn(next_input["instruction"], json.dumps(stats["calls"]["B"][0]["body"]))
                    self.assertEqual(await client.read_study(study_id), saved)
                    # An exact old selection retry returns A's receipt while naming
                    # B as the current head; it neither rewinds nor dispatches.
                    old_receipt = await client.continuation_select(first_selection)
                    self.assertEqual(old_receipt["continuation"]["selection"], first_selection)
                    self.assertEqual(old_receipt["operation"], first["operation"])
                    self.assertEqual(old_receipt["continuation"]["currentOperationId"], next_input["operationId"])
                    self.assertEqual(await client.continuation_read(study_id), second)
                    revised = await client.save_study({**save, "requestId": str(uuid.uuid4()),
                        "baseRevisionId": saved["saved"]["revisionId"], "study": {**study, "title": "Edited after completion"}})
                    completed_after_edit = await client.continuation_read(study_id)
                    self.assertFalse(completed_after_edit["studyHead"]["selectedRevisionCurrent"])
                    self.assertEqual(completed_after_edit["operation"], second["operation"])
                    self.assertEqual(completed_after_edit["continuation"]["next"], "select-next")
                    self.assertEqual(await client.continuation_resume(study_id, next_input["operationId"]), completed_after_edit)
                    # A selected but undispatched revision can become stale. Report it,
                    # reject its dispatch, retain the selection and make no new call.
                    third_input = {**first_input, "operationId": "op_" + str(uuid.uuid4()),
                        "revisionId": revised["saved"]["revisionId"]}
                    third_selection = {"action": "select", "input": third_input,
                        "previousOperationId": next_input["operationId"],
                        "previousResultHash": second["continuation"]["resultHash"]}
                    await client.continuation_select(third_selection)
                    edited = await client.save_study({**save, "requestId": str(uuid.uuid4()),
                        "baseRevisionId": revised["saved"]["revisionId"], "study": {**study, "title": "Edited manual study"}})
                    stale = await client.continuation_read(study_id)
                    self.assertFalse(stale["studyHead"]["selectedRevisionCurrent"])
                    self.assertEqual(stale["studyHead"]["revisionId"], edited["saved"]["revisionId"])
                    self.assertEqual(stale["continuation"]["selection"], third_selection)
                    with self.assertRaises(BridgeError) as conflict:
                        await client.continuation_resume(study_id, third_input["operationId"])
                    self.assertEqual(conflict.exception.status, 409)
                    self.assertEqual(await client.continuation_read(study_id), stale)
                    self.assertEqual({k: len(v) for k, v in (await fixture.command("stats"))["calls"].items()}, {"A": 1, "B": 1})

                    # Independent study stays usable. A lost HTTP response is reconciled
                    # under its original ID; neither client nor host silently replaces it.
                    independent = await client.save_study({**save, "requestId": str(uuid.uuid4()),
                        "studyId": "study_" + str(uuid.uuid4())})
                    fresh = {**first_input, "operationId": "op_" + str(uuid.uuid4()),
                        "studyId": independent["saved"]["id"], "revisionId": independent["saved"]["revisionId"]}
                    await client.continuation_select({"action": "select", "input": fresh,
                        "previousOperationId": None, "previousResultHash": None})
                    await fixture.command("delay-next", configuration="B", milliseconds=1000)
                    async with OperatorClient(OperatorConfig(config.origin, config.cookie, .1)) as short:
                        with self.assertRaises(BridgeError) as lost:
                            await short.continuation_resume(fresh["studyId"], fresh["operationId"])
                    self.assertTrue(lost.exception.uncertain)
                    self.assertFalse(lost.exception.as_dict()["error"]["automaticRetry"])
                    for _ in range(100):
                        recovered = await client.continuation_read(fresh["studyId"])
                        if recovered["operation"] and recovered["operation"]["status"] == "completed":
                            break
                        await asyncio.sleep(.05)
                    self.assertEqual(recovered["operation"]["status"], "completed")
                    self.assertEqual(recovered["operation"]["id"], fresh["operationId"])
                    self.assertEqual(await client.continuation_resume(fresh["studyId"], fresh["operationId"]), recovered)
                    final_stats = await fixture.command("stats")
                    self.assertEqual({k: len(v) for k, v in final_stats["calls"].items()}, {"A": 1, "B": 2})
                    if filename := os.environ.get("MTR0_CONTINUATION_RECEIPT"):
                        Path(filename).write_text(json.dumps({"status": "pass",
                            "scope": "Actual isolated Astro, Python client, CLI and official MCP stdio; synthetic loopback providers",
                            "providerCalls": {"A": 1, "B": 2},
                            "checks": ["retained result in actual next instruction and provider wire",
                                "fresh Astro and MCP reopening", "original ID retry without replay",
                                "current/stale revision exposed", "stale resume rejected before effect",
                                "independent study despite stale selection", "lost HTTP response reconciled",
                                "session/owner/origin/query/body gates", "manual study unchanged by completion"]},
                            indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    unittest.main()
