"""One native-engine choice through the existing authenticated operator client.

The local journal retains input/attempt provenance, not authoritative work state.
Every operation uses the existing server and its owner, revision and ID checks.
"""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import tempfile
from typing import Any

from client import BridgeError, OperatorClient
from server import SelectContinuationRequest

READ = "mtr0_continuation_read"
SELECT = "mtr0_continuation_select"
RESUME = "mtr0_continuation_resume"
MAX_REPLY = 32 * 1024
MAX_JOURNAL = 8 * 1024 * 1024
MAX_TURNS = 128


def now():
    return datetime.now(timezone.utc).isoformat()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":"))


def _object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError("Duplicate JSON member.")
        value[key] = item
    return value


def _constant(_):
    raise ValueError("Non-finite JSON number.")


def literal_json(raw: bytes):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_object, parse_constant=_constant)


def parse_choice(raw: bytes):
    if not isinstance(raw, bytes) or not 1 <= len(raw) <= MAX_REPLY:
        raise BridgeError("choice-input", "Supply one UTF-8 reply within 32 KiB.")
    try:
        value = literal_json(raw)
    except (ValueError, UnicodeError, RecursionError):
        raise BridgeError("choice-input", "The whole reply must be one JSON object; prose, fences, duplicate members and multiple choices are not executable.") from None
    if not isinstance(value, dict) or set(value) != {"name", "arguments"}:
        raise BridgeError("choice-input", "Use exactly name and arguments for one available operation.")
    name, args = value["name"], value["arguments"]
    if not isinstance(name, str) or name not in {READ, SELECT, RESUME} or not isinstance(args, dict):
        raise BridgeError("choice-input", "The choice names no available continuation operation.")
    if name == SELECT:
        if set(args) != {"request"}:
            raise BridgeError("choice-input", "Selection arguments require only request.")
        try:
            checked = SelectContinuationRequest.model_validate(args["request"]).model_dump(mode="json")
        except Exception:
            raise BridgeError("choice-input", "Selection does not match the existing typed request envelope.") from None
        if canonical(checked) != canonical(args["request"]):
            raise BridgeError("choice-input", "Selection must already have the exact typed values; no repair or coercion is applied.")
    else:
        keys = {"study_id"} if name == READ else {"study_id", "operation_id"}
        if set(args) != keys or any(not isinstance(args[k], str) for k in keys):
            raise BridgeError("choice-input", "Use the exact named read or resume arguments.")
    return value


@contextmanager
def journal_lock(path: Path):
    """OS-held process lock; a crashed process does not leave a live lock."""
    if not path.parent.is_dir():
        raise BridgeError("program-journal", "Use an existing operator-selected journal directory.")
    lock = open(str(path) + ".lock", "a+b")
    try:
        lock.seek(0, 2)
        if lock.tell() == 0:
            lock.write(b"1"); lock.flush()
        lock.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            raise BridgeError("program-busy", "This local program journal is in use; no operation was sent.") from None
        try:
            yield
        finally:
            lock.seek(0)
            if os.name == "nt":
                msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)
    finally:
        lock.close()


class NativeProgram:
    def __init__(self, client: OperatorClient, journal: str | Path):
        self.client, self.path = client, Path(journal)

    def _load(self, study_id: str | None = None):
        if not self.path.exists():
            if not study_id:
                raise BridgeError("program-journal", "Open context for an operator-selected study first.")
            from client import _identifier
            _identifier(study_id)
            return {"schema": "mtr0-native-program/v1", "origin": self.client.config.origin,
                    "studyId": study_id, "createdAt": now(), "pending": None, "turns": []}
        try:
            if self.path.stat().st_size > MAX_JOURNAL:
                raise ValueError()
            state = literal_json(self.path.read_bytes())
            if (not isinstance(state, dict) or state.get("schema") != "mtr0-native-program/v1" or
                    state.get("origin") != self.client.config.origin or
                    (study_id is not None and state.get("studyId") != study_id) or
                    not isinstance(state.get("turns"), list) or len(state["turns"]) > MAX_TURNS or
                    not isinstance(state.get("studyId"), str)):
                raise ValueError()
            if state.get("pending") is not None:
                parse_choice(canonical(state["pending"]["choice"]).encode("utf-8"))
            self.client._check_credentials(state)
            return state
        except (OSError, ValueError, TypeError, KeyError, RecursionError):
            raise BridgeError("program-journal", "The existing journal cannot be confirmed for this origin/study. Nothing was sent.") from None

    def _save(self, state):
        self.client._check_credentials(state)
        data = (canonical(state) + "\n").encode("utf-8")
        if len(data) > MAX_JOURNAL:
            raise BridgeError("program-journal", "The bounded journal is full; retain it before continuing.")
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=self.path.parent, prefix=self.path.name + ".", delete=False) as stream:
                temporary = Path(stream.name)
                stream.write(data); stream.flush(); os.fsync(stream.fileno())
            os.replace(temporary, self.path)
        finally:
            if temporary and temporary.exists():
                temporary.unlink()

    @staticmethod
    def _study(choice):
        return choice["arguments"]["request"]["input"]["studyId"] if choice["name"] == SELECT else choice["arguments"]["study_id"]

    async def _original_operation(self, choice, state):
        receipt = await self.client.get_operation(choice["arguments"]["operation_id"])
        operation = receipt.get("operation", {})
        if (operation.get("id") != choice["arguments"]["operation_id"] or
                operation.get("studyId") != state["studyId"]):
            raise BridgeError("choice-recovery", "The returned operation does not match this study and original identity.")
        return receipt

    async def _observe(self, state):
        status = await self.client.status()
        if status.get("continuationCapability") != "mtr0-continuation/v1":
            return {"observedAt": now(), "studyId": state["studyId"], "capability": False,
                    "availableOperations": [], "inability": "The connected server does not advertise continuation support."}
        continuation = study = None
        continuation_error = study_error = None
        try:
            continuation = await self.client.continuation_read(state["studyId"])
        except BridgeError as error:
            continuation_error = error.as_dict()["error"]
        try:
            study = await self.client.read_study(state["studyId"])
        except BridgeError as error:
            study_error = error.as_dict()["error"]
        pending = state["pending"]
        recovery_error = None
        if pending and continuation:
            choice = pending["choice"]
            matched = (choice["name"] == SELECT and
                       canonical(continuation["continuation"]["selection"]) == canonical(choice["arguments"]["request"]))
            matched_resume = (choice["name"] == RESUME and continuation.get("operation") and
                              continuation["operation"]["id"] == choice["arguments"]["operation_id"])
            if matched or matched_resume:
                state["recoveredChoice"] = {"choice": choice, "hostReceipt": continuation, "observedAt": now()}
                state["pending"] = None
        if state["pending"] and state["pending"]["choice"]["name"] == RESUME:
            # Another caller may have advanced the continuation. The original
            # operation remains independently readable under its original ID.
            choice = state["pending"]["choice"]
            try:
                receipt = await self._original_operation(choice, state)
            except BridgeError as error:
                recovery_error = error.as_dict()["error"]
            else:
                state["recoveredChoice"] = {"choice": choice, "hostReceipt": receipt, "observedAt": now()}
                state["pending"] = None
        available = [{"name": READ, "arguments": {"study_id": state["studyId"]},
                      "effect": "Read retained state; no provider call."}]
        current = continuation.get("continuation") if continuation else None
        if state["pending"]:
            available.append({**state["pending"]["choice"], "effect": "Exact original write retry only; no replacement ID."})
        else:
            absence = continuation_error and continuation_error.get("httpStatus") == 404
            can_select = study and (absence or (current and current["next"] == "select-next"))
            if can_select:
                available.append({"name": SELECT, "argumentsSchema": {
                    "request": SelectContinuationRequest.model_json_schema()},
                    "bindings": {"studyId": state["studyId"], "revisionId": study["saved"]["revisionId"],
                        "previousOperationId": current["currentOperationId"] if current else None,
                        "previousResultHash": current["resultHash"] if current else None,
                        "sourceIds": [x["id"] for x in study["study"]["evidence"]]},
                    "effect": "Retain one exact selection; no provider call and no manual-card acceptance."})
            head = continuation.get("studyHead") if continuation else None
            if current and (continuation.get("operation") or (
                    head and head["status"] == "available" and head["selectedRevisionCurrent"] is True and
                    status.get("configuration", {}).get("configured") is True)):
                available.append({"name": RESUME, "arguments": {
                    "study_id": state["studyId"], "operation_id": current["currentOperationId"]},
                    "effect": "Reconcile the original ID; an unclaimed valid selection may invoke the configured provider."})
        return {"observedAt": now(), "studyId": state["studyId"], "capability": True,
                "study": study, "studyReadError": study_error,
                "retained": continuation, "continuationReadError": continuation_error,
                "providerConfiguration": status.get("configuration"),
                "pendingChoice": state["pending"]["choice"] if state["pending"] else None,
                "recoveredChoice": state.get("recoveredChoice"), "recoveryReadError": recovery_error,
                "availableOperations": available,
                "meaning": "Separate observations, not an atomic snapshot. Host rechecks before a write. Asset references are not delivered image bytes."}

    async def context(self, study_id: str):
        with journal_lock(self.path):
            state = self._load(study_id)
            context = await self._observe(state)
            state["lastContext"] = context
            self._save(state)
            return {"ok": True, "context": context,
                    "replyContract": "Return exactly one JSON object with name and arguments from availableOperations. No prose, Markdown fences, multiple choices or credentials. Use exact existing study/revision/predecessor IDs. A new selection supplies one fresh op_<lowercase UUID>, retained unchanged for retries. A choice is a proposal; only the authenticated host can execute it."}

    def _validate(self, choice, state, context):
        if self._study(choice) != state["studyId"]:
            raise BridgeError("choice-scope", "The choice belongs to another study; no operation was sent.")
        if not context["capability"]:
            raise BridgeError("choice-capability", "The connected server does not support this continuation interface.")
        if choice["name"] == READ:
            return
        pending = state["pending"]
        if pending:
            if canonical(choice) != canonical(pending["choice"]):
                raise BridgeError("choice-pending", "Recover or retry the exact pending choice; a replacement write is unavailable.")
            return
        if choice["name"] == SELECT and context.get("retained") and (
                context["retained"]["continuation"]["selection"] == choice["arguments"]["request"]):
            return
        if choice["name"] == RESUME and state.get("recoveredChoice", {}).get("choice") == choice:
            return
        if choice["name"] == SELECT and any(
                turn.get("hostReceipt", {}).get("ok") is True and
                turn.get("choice") == choice and
                turn["hostReceipt"].get("continuation", {}).get("selection") == choice["arguments"]["request"]
                for turn in state["turns"] if turn.get("hostReceipt")):
            # An exact already-received selection is recovery, not a new step.
            # The server returns that receipt with its actual current head.
            return
        advertised = next((x for x in context["availableOperations"] if x["name"] == choice["name"]), None)
        if not advertised:
            raise BridgeError("choice-unavailable", "That write is not available in the current observed state. Read the returned context.")
        if choice["name"] == RESUME:
            if choice["arguments"] != advertised["arguments"]:
                raise BridgeError("choice-stale", "The current selected identity differs; no operation was sent.")
        else:
            selection, binding = choice["arguments"]["request"], advertised["bindings"]
            value = selection["input"]
            if (value["revisionId"] != binding["revisionId"] or
                    selection["previousOperationId"] != binding["previousOperationId"] or
                    selection["previousResultHash"] != binding["previousResultHash"] or
                    any(x not in binding["sourceIds"] for x in value["sourceIds"])):
                raise BridgeError("choice-stale", "The revision, predecessor or selected evidence differs from current state; no selection was sent.")

    async def choose(self, raw: bytes):
        with journal_lock(self.path):
            state = self._load()
            if len(state["turns"]) >= MAX_TURNS:
                raise BridgeError("program-journal", "This journal reached 128 turns; preserve its unresolved state before opening further work.")
            if not 1 <= len(raw) <= MAX_REPLY:
                raise BridgeError("choice-input", "Reply exceeds the 32 KiB input bound.")
            try:
                literal = raw.decode("utf-8")
            except UnicodeError:
                raise BridgeError("choice-input", "The literal reply is not UTF-8.") from None
            self.client._check_credentials(literal)
            turn = {"receivedAt": now(), "nativeReply": {"utf8": literal, "bytes": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest()}, "choice": None, "hostReceipt": None}
            state["turns"].append(turn)
            context = None
            attempted = False
            same_choice_uncertain = False
            earlier_choice = state["pending"]["choice"] if state["pending"] else None
            try:
                choice = parse_choice(raw)
                turn["choice"] = choice
                if self._study(choice) != state["studyId"]:
                    raise BridgeError("choice-scope", "The choice belongs to another study; no operation was sent.")
                context = await self._observe(state)
                same_choice_uncertain = bool(state["pending"] and state["pending"]["choice"] == choice)
                self._validate(choice, state, context)
                retained = context.get("retained")
                same_observed_selection = (choice["name"] == SELECT and retained and
                    retained["continuation"]["selection"] == choice["arguments"]["request"])
                reconciled = (same_observed_selection or (earlier_choice and
                    canonical(earlier_choice) == canonical(choice) and state["pending"] is None and retained))
                name, args = choice["name"], choice["arguments"]
                if name == RESUME and state.get("recoveredChoice", {}).get("choice") == choice:
                    receipt = await self._original_operation(choice, state)
                    reconciled = True
                elif reconciled:
                    receipt = context["retained"]
                else:
                    if name != READ:
                        state["pending"] = {"choice": choice, "nativeReplySha256": turn["nativeReply"]["sha256"]}
                    self._save(state)  # Retain exact choice before any possible write.
                    attempted = True
                    if name == READ:
                        receipt = await self.client.continuation_read(args["study_id"])
                    elif name == SELECT:
                        receipt = await self.client.continuation_select(args["request"])
                    else:
                        receipt = await self.client.continuation_resume(args["study_id"], args["operation_id"])
                turn["hostReceipt"] = receipt
                if name != READ:
                    state["pending"] = None
                result = {"ok": True, "choice": choice, "hostReceipt": receipt,
                          "nativeReplySha256": turn["nativeReply"]["sha256"]}
                if reconciled:
                    result["reconciledByRead"] = True
                    result["context"] = context
            except BridgeError as error:
                if attempted and turn["choice"]["name"] != READ and not error.uncertain and not same_choice_uncertain:
                    state["pending"] = None
                result = error.as_dict()
                result.update({"choice": turn["choice"], "context": context,
                               "nativeReplySha256": turn["nativeReply"]["sha256"]})
                turn["inability"] = result
            try:
                self._save(state)
            except (OSError, BridgeError):
                # The pre-write pending identity remains on disk. Preserve any
                # authoritative returned receipt despite this later local fault.
                result["journalObservation"] = "Final local recording unavailable; retain this exact receipt and reopen the existing journal."
            return result
