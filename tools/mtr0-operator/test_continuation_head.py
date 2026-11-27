"""Preserve a durable completion when later current-head observation fails.
Adapted by Stan from Halp's independently executed caller-1 counterexample,
Assembly3324. Synthetic fixture only; original counterexample remains retained.
"""
import asyncio
import hashlib
from pathlib import Path
import tempfile
import unittest
import uuid

from client import BridgeError, OperatorClient, OperatorConfig
import test_operator_integration as support


class HeadObservationTest(unittest.IsolatedAsyncioTestCase):
    async def test_optional_head_observation_cannot_hide_retained_result(self):
        async with support.Fixture() as fixture:
            async with OperatorClient(OperatorConfig(fixture.ready["origin"], fixture.ready["cookie"])) as client:
                asset = (await client.upload_asset(support.DATA_URL))["asset"]
                saved = await client.save_study({"action": "save", "requestId": str(uuid.uuid4()),
                    "studyId": "study_" + str(uuid.uuid4()), "baseRevisionId": None,
                    "study": support.manual_study(asset)})
                selected = {"action": "generate", "operationId": "op_" + str(uuid.uuid4()),
                    "studyId": saved["saved"]["id"], "revisionId": saved["saved"]["revisionId"],
                    "sourceIds": ["picture", "source-note"], "instruction": "Use picture and source-note for one lighting study.",
                    "allowedDomains": ["lighting"]}
                selection = {"action": "select", "input": selected, "previousOperationId": None, "previousResultHash": None}
                await client.continuation_select(selection)
                workspace = Path(fixture.ready["workspace"]).resolve()
                self.assertEqual(workspace.parent, Path(tempfile.gettempdir()).resolve())
                self.assertTrue(workspace.name.startswith("mtr0-operator-fixture-"))
                image = (workspace / "owners" / hashlib.sha256(b"fixture").hexdigest() / "assets" / (asset["sha256"] + ".bin")).resolve()
                held = image.with_suffix(".held-by-test")
                self.assertTrue(image.is_relative_to(workspace) and held.is_relative_to(workspace))
                self.assertFalse(held.exists())
                self.assertEqual(hashlib.sha256(image.read_bytes()).hexdigest(), asset["sha256"])
                await fixture.command("delay-next", configuration="A", milliseconds=1500)
                pending = asyncio.create_task(client.continuation_resume(selected["studyId"], selected["operationId"]))
                moved = False
                try:
                    for _ in range(200):
                        stats = await fixture.command("stats")
                        if len(stats["calls"]["A"]) == 1:
                            break
                        await asyncio.sleep(.01)
                    self.assertEqual(len(stats["calls"]["A"]), 1)
                    image.rename(held)
                    moved = True
                    # Provider preparation and source validation already succeeded.
                    result = await pending
                    self.assertEqual(result["operation"]["status"], "completed")
                    self.assertEqual(result["operation"]["id"], selected["operationId"])
                    self.assertEqual(result["continuation"]["selection"], selection)
                    self.assertEqual(result["studyHead"], {"status": "unavailable",
                        "revisionId": None, "selectedRevisionCurrent": None})
                    self.assertEqual(await client.continuation_read(selected["studyId"]), result)
                    self.assertEqual(await client.continuation_resume(selected["studyId"], selected["operationId"]), result)
                    self.assertEqual(await client.continuation_select(selection), result)
                    self.assertEqual((await client.get_operation(selected["operationId"]))["operation"], result["operation"])
                    # Optional enrichment does not weaken actual study/dispatch validation.
                    with self.assertRaises(BridgeError) as missing:
                        await client.read_study(selected["studyId"])
                    self.assertEqual(missing.exception.status, 409)
                    fresh = {**selected, "operationId": "op_" + str(uuid.uuid4())}
                    for method in (lambda: client.invoke(fresh), lambda: client.continuation_select({
                        "action": "select", "input": fresh, "previousOperationId": selected["operationId"],
                        "previousResultHash": result["continuation"]["resultHash"]})):
                        with self.assertRaises(BridgeError) as rejected:
                            await method()
                        self.assertEqual(rejected.exception.status, 409)
                    self.assertEqual({k: len(v) for k, v in (await fixture.command("stats"))["calls"].items()}, {"A": 1, "B": 0})
                finally:
                    if not pending.done():
                        try:
                            await pending
                        except BridgeError:
                            pass
                    if moved and held.exists():
                        held.rename(image)
                reopened = await client.continuation_read(selected["studyId"])
                self.assertEqual(reopened["operation"], result["operation"])
                self.assertEqual(reopened["continuation"], result["continuation"])
                self.assertEqual(reopened["studyHead"], {"status": "available",
                    "revisionId": selected["revisionId"], "selectedRevisionCurrent": True})


if __name__ == "__main__":
    unittest.main()
