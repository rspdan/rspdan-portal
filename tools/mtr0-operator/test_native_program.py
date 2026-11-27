"""Native choice boundaries; no native model or live-service use."""
import copy
import asyncio
import hashlib
import json
from pathlib import Path
import tempfile
import sys
import unittest
import uuid

import httpx

from client import BridgeError, OperatorClient, OperatorConfig
from program import NativeProgram, READ, SELECT, RESUME, parse_choice, journal_lock
import test_operator_integration as support

STUDY = "study_" + str(uuid.uuid4())
REV = "rev_" + str(uuid.uuid4())
OP = "op_" + str(uuid.uuid4())
COOKIE = "pspt_session=synthetic-program-cookie-1234567890"
ORIGIN = "http://127.0.0.1:4491"


def selection(study=STUDY, revision=REV, op=OP):
    return {"action": "select", "input": {"action": "generate", "operationId": op,
            "studyId": study, "revisionId": revision, "sourceIds": ["source-note"],
            "instruction": "Use source-note as author direction.", "allowedDomains": ["lighting"]},
            "previousOperationId": None, "previousResultHash": None}


def choice(name, **args):
    return json.dumps({"name": name, "arguments": args}).encode()


class ChoiceParsingTests(unittest.TestCase):
    def test_whole_reply_no_duplicate_members_no_repair(self):
        valid = choice(READ, study_id=STUDY)
        self.assertEqual(parse_choice(valid)["arguments"]["study_id"], STUDY)
        for raw in (b"\x60"*3 + b"json\n" + valid + b"\n" + b"\x60"*3, valid + valid, b'[' + valid + b']',
                    b'{"name":"mtr0_continuation_read","name":"mtr0_invoke","arguments":{}}',
                    b'{"name":"mtr0_continuation_read","arguments":{"study_id":"a","study_id":"b"}}',
                    choice("getattr", study_id=STUDY), choice(READ, study_id=STUDY, actor="other"),
                    b'{"name":"mtr0_continuation_read","arguments":{"study_id":NaN}}'):
            with self.assertRaises(BridgeError):
                parse_choice(raw)

    def test_local_lock_prevents_overlapping_program_writers(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "program.json"
            with journal_lock(path):
                with self.assertRaises(BridgeError):
                    with journal_lock(path):
                        self.fail("Second writer acquired an owned journal.")


class ProgramTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "program.json"
        self.saved = {"ok": True, "saved": {"id": STUDY, "revisionId": REV},
                      "study": {"evidence": [{"id": "source-note", "kind": "text", "text": "Original note."}]}}
        self.current = None
        self.missing = False
        self.capable = True
        self.provider = False
        self.lose = False
        self.posts = []
        def handler(request):
            query = dict(request.url.params)
            if request.method == "POST":
                payload = json.loads(request.content)
                self.posts.append(payload)
                if payload["action"] == "select":
                    if len(set(payload["input"]["sourceIds"])) != len(payload["input"]["sourceIds"]):
                        return httpx.Response(400, json={"ok": False, "error": "duplicate source IDs"})
                    self.current = {"ok": True, "continuation": {"selection": payload,
                        "currentOperationId": payload["input"]["operationId"], "next": "dispatch", "resultHash": None},
                        "operation": None, "studyHead": {"status": "available", "revisionId": REV, "selectedRevisionCurrent": True}}
                if self.lose:
                    raise httpx.ReadError("synthetic lost acknowledgement", request=request)
                return httpx.Response(200, json=self.current)
            if request.url.path.endswith("director-study"):
                return httpx.Response(409, json={"ok": False, "error": "Synthetic missing source."}) if self.missing else httpx.Response(200, json=self.saved)
            if "continuationStudyId" in query:
                return httpx.Response(200, json=self.current) if self.current else httpx.Response(404, json={"ok": False, "error": "continuation not found"})
            return httpx.Response(200, json={"ok": True, "configuration": {"configured": self.provider},
                    **({"continuationCapability": "mtr0-continuation/v1"} if self.capable else {})})
        self.client = OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler))
        self.program = NativeProgram(self.client, self.path)

    async def asyncTearDown(self):
        await self.client.__aexit__()
        self.tmp.cleanup()

    async def test_capability_and_provider_are_separate_observations(self):
        context = (await self.program.context(STUDY))["context"]
        self.assertEqual({x["name"] for x in context["availableOperations"]}, {READ, SELECT})
        self.capable = False
        context = (await self.program.context(STUDY))["context"]
        self.assertEqual(context["availableOperations"], [])
        result = await self.program.choose(choice(READ, study_id=STUDY))
        self.assertEqual(result["error"]["code"], "choice-capability")
        self.assertEqual(self.posts, [])

    async def test_other_owned_study_malformed_and_stale_choices_have_no_write(self):
        await self.program.context(STUDY)
        for raw in (choice(SELECT, request=selection(study="study_" + str(uuid.uuid4()))),
                    b"Please execute " + choice(READ, study_id=STUDY),
                    choice(SELECT, request=selection(revision="rev_" + str(uuid.uuid4())))):
            result = await self.program.choose(raw)
            self.assertFalse(result["ok"])
        self.assertEqual(self.posts, [])
        turns = json.loads(self.path.read_text())["turns"]
        self.assertEqual(len(turns), 3)
        self.assertEqual(turns[1]["nativeReply"]["utf8"].encode(), b"Please execute " + choice(READ, study_id=STUDY))

    async def test_independent_full_study_failure_retains_completed_result(self):
        await self.program.context(STUDY)
        await self.program.choose(choice(SELECT, request=selection()))
        self.current["continuation"].update(next="select-next", resultHash="a" * 64)
        self.current["operation"] = {"id": OP, "status": "completed", "outcome": {"proposal": "Retained contribution."}}
        self.current["studyHead"] = {"status": "unavailable", "revisionId": None, "selectedRevisionCurrent": None}
        self.missing = True
        context = (await self.program.context(STUDY))["context"]
        self.assertEqual(context["retained"], self.current)
        self.assertIsNone(context["study"])
        self.assertNotIn(SELECT, {x["name"] for x in context["availableOperations"]})
        result = await self.program.choose(choice(READ, study_id=STUDY))
        self.assertEqual(result["hostReceipt"], self.current)
        self.assertEqual(len(self.posts), 1)

    async def test_non_string_names_retain_known_rejection_without_delivery(self):
        await self.program.context(STUDY)
        config = self.path.parent / "operator.json"
        config.write_text(json.dumps({"origin": ORIGIN, "cookie": COOKIE}), encoding="utf-8")
        config.chmod(0o600)
        reply = self.path.parent / "reply.txt"
        for name in ([], {}, None, True, 42):
            raw = choice(name) + b"\r\n"
            result = await self.program.choose(raw)
            self.assertEqual(result["error"]["code"], "choice-input")
            self.assertFalse(result["error"]["deliveryUnconfirmed"])
            reply.write_bytes(raw)
            process = await asyncio.create_subprocess_exec(sys.executable, str(Path(__file__).parent / "cli.py"),
                "--config", str(config), "program-choice", "--journal", str(self.path), "--input", str(reply),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            output, errors = await process.communicate()
            self.assertEqual((process.returncode, errors), (1, b""))
            returned = json.loads(output)
            self.assertEqual(returned["error"]["code"], "choice-input")
            self.assertFalse(returned["error"]["deliveryUnconfirmed"])
            state = json.loads(self.path.read_text(encoding="utf-8"))
            self.assertIsNone(state["pending"])
            for turn in state["turns"][-2:]:
                self.assertEqual(turn["nativeReply"]["utf8"].encode("utf-8"), raw)
                self.assertEqual(turn["inability"]["error"]["code"], "choice-input")
        self.assertEqual(self.posts, [])
        self.assertEqual(len(state["turns"]), 10)

    async def test_uncertain_identity_survives_reopen_and_absent_read(self):
        await self.program.context(STUDY)
        original = choice(SELECT, request=selection()) + b"\r\n"
        self.lose = True
        result = await self.program.choose(original)
        self.assertTrue(result["error"]["deliveryUnconfirmed"])
        self.current = None
        reopened = NativeProgram(self.client, self.path)
        context = (await reopened.context(STUDY))["context"]
        self.assertEqual(context["pendingChoice"], json.loads(original))
        replacement = await reopened.choose(choice(SELECT, request=selection(op="op_" + str(uuid.uuid4()))))
        self.assertEqual(replacement["error"]["code"], "choice-pending")
        self.assertEqual(len(self.posts), 1)
        self.lose = False
        retry = await reopened.choose(original)
        self.assertTrue(retry["ok"])
        self.assertEqual(self.posts, [selection(), selection()])
        state = json.loads(self.path.read_text())
        self.assertIsNone(state["pending"])
        self.assertEqual(state["turns"][0]["nativeReply"]["utf8"].encode("utf-8"), original)
        self.assertEqual(state["turns"][0]["nativeReply"]["sha256"], hashlib.sha256(original).hexdigest())

    async def test_committed_lost_acknowledgement_reconciles_by_read_only(self):
        await self.program.context(STUDY)
        raw = choice(SELECT, request=selection())
        self.lose = True
        await self.program.choose(raw)
        self.lose = False
        result = await NativeProgram(self.client, self.path).choose(raw)
        self.assertTrue(result["reconciledByRead"])
        self.assertEqual(result["hostReceipt"], self.current)
        self.assertEqual(len(self.posts), 1)

    async def test_new_definite_rejection_does_not_inherit_reconciled_uncertainty(self):
        await self.program.context(STUDY)
        self.lose = True
        await self.program.choose(choice(SELECT, request=selection()))
        self.lose = False
        self.current["continuation"].update(next="select-next", resultHash="a" * 64)
        self.current["operation"] = {"id": OP, "studyId": STUDY, "status": "completed"}
        second = selection(op="op_" + str(uuid.uuid4()))
        second.update(previousOperationId=OP, previousResultHash="a" * 64)
        second["input"]["sourceIds"] = ["source-note", "source-note"]
        result = await self.program.choose(choice(SELECT, request=second))
        self.assertEqual(result["error"]["httpStatus"], 400)
        self.assertFalse(result["error"]["deliveryUnconfirmed"])
        self.assertIsNone(json.loads(self.path.read_text())["pending"])

    async def test_failed_read_does_not_clear_unresolved_write(self):
        await self.program.context(STUDY)
        self.lose = True
        original = choice(SELECT, request=selection())
        await self.program.choose(original)
        self.current = None
        result = await self.program.choose(choice(READ, study_id=STUDY))
        self.assertEqual(result["error"]["httpStatus"], 404)
        self.assertEqual(json.loads(self.path.read_text())["pending"]["choice"], json.loads(original))

    async def test_completed_local_receipt_survives_lost_cli_output_retry(self):
        await self.program.context(STUDY)
        raw = choice(SELECT, request=selection())
        first = await self.program.choose(raw)
        self.assertTrue(first["ok"])
        # The CLI output can be lost after the local receipt was saved.
        retry = await NativeProgram(self.client, self.path).choose(raw)
        self.assertTrue(retry["ok"], retry)
        self.assertEqual(retry["hostReceipt"], first["hostReceipt"])
        self.assertTrue(retry["reconciledByRead"])
        self.assertEqual(len(self.posts), 1)

    async def test_final_local_record_failure_preserves_receipt_and_recovery_identity(self):
        await self.program.context(STUDY)
        original_save = self.program._save
        saves = 0
        def fail_final(state):
            nonlocal saves
            saves += 1
            if saves == 2:
                raise OSError("Synthetic final local write failure.")
            original_save(state)
        self.program._save = fail_final
        raw = choice(SELECT, request=selection())
        result = await self.program.choose(raw)
        self.assertTrue(result["ok"])
        self.assertEqual(result["hostReceipt"], self.current)
        self.assertIn("journalObservation", result)
        self.assertEqual(json.loads(self.path.read_text())["pending"]["choice"], json.loads(raw))
        recovered = await NativeProgram(self.client, self.path).choose(raw)
        self.assertTrue(recovered["reconciledByRead"])
        self.assertEqual(len(self.posts), 1)


class ActualHostProgramTests(unittest.IsolatedAsyncioTestCase):
    async def test_result_informs_next_native_choice_and_reopen_without_replay(self):
        async with support.Fixture() as fixture:
            with tempfile.TemporaryDirectory() as directory:
                async with OperatorClient(OperatorConfig(fixture.ready["origin"], fixture.ready["cookie"])) as client:
                    asset = (await client.upload_asset(support.DATA_URL))["asset"]
                    study = support.manual_study(asset)
                    saved = await client.save_study({"action": "save", "requestId": str(uuid.uuid4()),
                        "studyId": "study_" + str(uuid.uuid4()), "baseRevisionId": None, "study": study})
                    sid, rev = saved["saved"]["id"], saved["saved"]["revisionId"]
                    journal = Path(directory) / "program.json"
                    config_path = Path(directory) / "operator.json"
                    config_path.write_text(json.dumps({"origin": fixture.ready["origin"], "cookie": fixture.ready["cookie"]}))
                    config_path.chmod(0o600)
                    async def cli(*args):
                        process = await asyncio.create_subprocess_exec(sys.executable, str(Path(__file__).parent / "cli.py"),
                            "--config", str(config_path), *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
                        output, errors = await process.communicate()
                        self.assertEqual(errors, b"")
                        return process.returncode, json.loads(output.decode("utf-8"))
                    code, context = await cli("program-context", "--study-id", sid, "--journal", str(journal))
                    self.assertEqual(code, 0)
                    program = NativeProgram(client, journal)
                    self.assertIn(SELECT, {x["name"] for x in context["context"]["availableOperations"]})
                    first = selection(sid, rev, "op_" + str(uuid.uuid4()))
                    first["input"]["sourceIds"] = ["picture", "source-note"]
                    self.assertTrue((await program.choose(choice(SELECT, request=first)))["ok"])
                    original_resume = client.continuation_resume
                    async def lose_resume_ack(study_id, operation_id):
                        await original_resume(study_id, operation_id)
                        raise BridgeError("transport", "Synthetic lost resume acknowledgement", uncertain=True)
                    client.continuation_resume = lose_resume_ack
                    resume_a = choice(RESUME, study_id=sid, operation_id=first["input"]["operationId"])
                    lost = await program.choose(resume_a)
                    self.assertTrue(lost["error"]["deliveryUnconfirmed"])
                    client.continuation_resume = original_resume
                    original_result = await client.get_operation(first["input"]["operationId"])
                    result = await client.continuation_read(sid)
                    proposal = original_result["operation"]["outcome"]["card"]["proposal"]["text"]
                    successor = copy.deepcopy(first)
                    successor["input"]["operationId"] = "op_" + str(uuid.uuid4())
                    successor["input"]["instruction"] = "Use picture as reference and source-note as direction. Refine: " + proposal
                    successor["previousOperationId"] = first["input"]["operationId"]
                    successor["previousResultHash"] = result["continuation"]["resultHash"]
                    # A separate valid caller advances before the program recovers A.
                    selected = await client.continuation_select(successor)
                    self.assertTrue(selected["ok"], selected)
                    recovery = (await program.context(sid))["context"]
                    self.assertIsNone(recovery["pendingChoice"])
                    self.assertEqual(recovery["retained"]["continuation"]["currentOperationId"], successor["input"]["operationId"])
                    self.assertEqual(recovery["recoveredChoice"]["hostReceipt"], original_result)
                    recovered = await program.choose(resume_a)
                    self.assertEqual(recovered["hostReceipt"], original_result)
                    self.assertTrue(recovered["reconciledByRead"])
                    selected = await program.choose(choice(SELECT, request=successor))
                    self.assertTrue(selected["ok"], selected)
                    old = await program.choose(choice(SELECT, request=first))
                    self.assertTrue(old["ok"], old)
                    self.assertEqual(old["hostReceipt"]["continuation"]["selection"], first)
                    self.assertEqual(old["hostReceipt"]["continuation"]["currentOperationId"], successor["input"]["operationId"])
                    reopened = NativeProgram(client, Path(directory) / "program.json")
                    observed = await reopened.choose(choice(READ, study_id=sid))
                    self.assertEqual(observed["hostReceipt"]["continuation"]["selection"], successor)
                    self.assertEqual({k: len(v) for k, v in (await fixture.command("stats"))["calls"].items()}, {"A": 1, "B": 0})
                    self.assertEqual(await client.read_study(sid), saved)
                    done = await reopened.choose(choice(RESUME, study_id=sid, operation_id=successor["input"]["operationId"]))
                    self.assertTrue(done["ok"], done)
                    self.assertIn(proposal, json.dumps((await fixture.command("stats"))["calls"]["A"][1]["body"]))
                    same = await reopened.choose(choice(RESUME, study_id=sid, operation_id=successor["input"]["operationId"]))
                    self.assertEqual(same["hostReceipt"], done["hostReceipt"])
                    self.assertEqual({k: len(v) for k, v in (await fixture.command("stats"))["calls"].items()}, {"A": 2, "B": 0})
                    reply = Path(directory) / "native-reply.txt"
                    reply.write_bytes(choice(READ, study_id=sid) + b"\r\n")
                    code, read = await cli("program-choice", "--journal", str(journal), "--input", str(reply))
                    self.assertEqual(code, 0)
                    self.assertEqual(read["hostReceipt"], done["hostReceipt"])
                    reply.write_text("Not one choice: \u03bb", encoding="utf-8")
                    code, inability = await cli("program-choice", "--journal", str(journal), "--input", str(reply))
                    self.assertEqual(code, 1)
                    self.assertEqual(inability["error"]["code"], "choice-input")
