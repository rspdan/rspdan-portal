"""Focused bridge invariants; synthetic HTTP transport only, no provider call."""
import asyncio
import base64
import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest

import httpx

from client import BridgeError, OperatorClient, OperatorConfig
from server import create_server

COOKIE = "pspt_session=synthetic-session-cookie-1234567890"
ORIGIN = "http://127.0.0.1:4491"
REQUEST = {"action": "generate", "operationId": "op_example", "studyId": "study_example",
           "revisionId": "rev_example", "sourceIds": ["s1"], "instruction": "Use s1 as a note.", "allowedDomains": ["lighting"]}


class BridgeTests(unittest.IsolatedAsyncioTestCase):
    async def test_fixed_routes_private_headers_and_unchanged_id(self):
        seen = []
        def handler(req):
            seen.append(req)
            return httpx.Response(202, json={"ok": True, "operation": {"id": REQUEST["operationId"], "status": "unknown", "outcome": None}})
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
            result = await c.invoke(REQUEST)
        self.assertEqual(len(seen), 1)
        self.assertEqual(str(seen[0].url), ORIGIN + "/api/director-engine")
        self.assertEqual(seen[0].headers["origin"], ORIGIN)
        self.assertEqual(seen[0].headers["cookie"], COOKIE)
        self.assertEqual(json.loads(seen[0].content), REQUEST)
        self.assertEqual(result["operation"]["status"], "unknown")

    async def test_redirect_never_follows_and_transport_never_retries(self):
        for redirect in (True, False):
            calls = []
            def handler(req):
                calls.append(req)
                if redirect:
                    return httpx.Response(302, headers={"location": "https://outside.invalid/collect"})
                raise httpx.ConnectError("private raw details", request=req)
            async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
                with self.assertRaises(BridgeError) as caught:
                    await c.invoke(REQUEST)
            self.assertEqual(len(calls), 1)
            self.assertTrue(caught.exception.uncertain)
            self.assertNotIn("private raw details", str(caught.exception))

    async def test_total_deadline_covers_streamed_body(self):
        class Slow(httpx.AsyncByteStream):
            async def __aiter__(self):
                while True:
                    await asyncio.sleep(.02)
                    yield b" "
        calls = []
        def handler(req):
            calls.append(req); return httpx.Response(200, stream=Slow())
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE, .06), transport=httpx.MockTransport(handler)) as c:
            with self.assertRaises(BridgeError) as caught:
                await c.invoke(REQUEST)
        self.assertEqual(caught.exception.code, "timeout")
        self.assertTrue(caught.exception.uncertain)
        self.assertEqual(len(calls), 1)

    async def test_credentials_and_unknown_actor_never_become_work(self):
        calls = []
        def handler(req):
            calls.append(req); return httpx.Response(200, json={"ok": True})
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
            for request in ({**REQUEST, "actor": "invented"}, {**REQUEST, "instruction": COOKIE}, {**REQUEST, "instruction": float('nan')}):
                with self.assertRaises(BridgeError):
                    await c.invoke(request)
        self.assertEqual(calls, [])

    async def test_receipt_cannot_echo_session_and_failed_write_stays_uncertain(self):
        for response in (json.dumps({"ok": True, "reflected": COOKIE}).encode(), b'{"ok":true,"value":NaN}'):
            def handler(req):
                return httpx.Response(200, content=response)
            async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
                with self.assertRaises(BridgeError) as caught:
                    await c.invoke(REQUEST)
            self.assertTrue(caught.exception.uncertain)
            self.assertNotIn(COOKIE, json.dumps(caught.exception.as_dict()))

    async def test_asset_bytes_are_verified_without_reencoding(self):
        data = b"synthetic raster container bytes"
        digest = hashlib.sha256(data).hexdigest()
        def handler(req):
            return httpx.Response(200, content=data, headers={"content-type": "image/png"})
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
            result = await c.read_asset(digest)
            with self.assertRaises(BridgeError):
                await c.read_asset("0" * 64)
        self.assertEqual(base64.b64decode(result["dataUrl"].split(",", 1)[1]), data)
        self.assertEqual(result["asset"]["bytes"], len(data))

    async def test_bounded_input_and_response(self):
        calls = []
        def handler(req):
            calls.append(req)
            return httpx.Response(200, content=b" " * (16 * 1024 * 1024 + 1))
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
            with self.assertRaises(BridgeError) as caught:
                await c.invoke({**REQUEST, "instruction": "a" * (32 * 1024)})
            self.assertEqual(caught.exception.code, "request-too-large")
            self.assertEqual(calls, [])
            with self.assertRaises(BridgeError) as caught:
                await c.list_studies()
            self.assertEqual(caught.exception.code, "response-too-large")

    async def test_mcp_discovery_has_complete_envelopes_without_credentials(self):
        server = create_server(OperatorConfig(ORIGIN, COOKIE))
        tools = {x.name: x for x in await server.list_tools()}
        self.assertEqual(len(tools), 12)
        invoke = tools["mtr0_invoke"].inputSchema
        # The SDK can inline or retain a definition; find the actual request shape.
        shapes = list(invoke.get("$defs", {}).values()) + [invoke["properties"]["request"]]
        request = next(x for x in shapes if "operationId" in x.get("properties", {}))
        self.assertEqual(set(request["required"]), set(REQUEST))
        self.assertEqual(request["properties"]["action"]["const"], "generate")
        self.assertEqual(request["properties"]["allowedDomains"]["items"]["enum"], ["camera", "lighting", "composition"])
        self.assertNotIn(COOKIE, json.dumps(invoke))


    async def test_continuation_commands_preserve_envelope_and_do_not_retry(self):
        seen = []
        def handler(req):
            seen.append(req)
            if req.method == "POST" and json.loads(req.content)["action"] == "resume":
                raise httpx.ReadError("unconfirmed", request=req)
            return httpx.Response(200, json={"ok": True, "continuation": {"next": "dispatch"}})
        selection = {"action": "select", "input": REQUEST, "previousOperationId": None, "previousResultHash": None}
        async with OperatorClient(OperatorConfig(ORIGIN, COOKIE), transport=httpx.MockTransport(handler)) as c:
            await c.continuation_select(selection)
            await c.continuation_read(REQUEST["studyId"])
            with self.assertRaises(BridgeError) as caught:
                await c.continuation_resume(REQUEST["studyId"], REQUEST["operationId"])
        self.assertTrue(caught.exception.uncertain)
        self.assertFalse(caught.exception.as_dict()["error"]["automaticRetry"])
        self.assertEqual(len(seen), 3)
        self.assertEqual(json.loads(seen[0].content), selection)
        self.assertEqual(seen[1].url.params["continuationStudyId"], REQUEST["studyId"])
        self.assertEqual(json.loads(seen[2].content), {"action": "resume",
            "studyId": REQUEST["studyId"], "operationId": REQUEST["operationId"]})


class ConfigTests(unittest.TestCase):
    def test_private_config_and_explicit_origin(self):
        with tempfile.TemporaryDirectory() as root:
            file = Path(root) / "session.json"
            file.write_text(json.dumps({"origin": ORIGIN, "cookie": COOKIE}))
            file.chmod(0o600)
            self.assertEqual(OperatorConfig.load(file).origin, ORIGIN)
            file.chmod(0o644)
            if os.name == "posix":
                with self.assertRaises(BridgeError):
                    OperatorConfig.load(file)
        for origin in (None, "http://remote.invalid", "https://user:secret@example.invalid", ORIGIN + "/api", ORIGIN + "?key=x", ORIGIN + "\n"):
            with self.assertRaises(BridgeError):
                OperatorConfig(origin, COOKIE)
        self.assertEqual(OperatorConfig("https://EXAMPLE.invalid:443/", COOKIE).origin, "https://example.invalid")
        self.assertNotIn(COOKIE, repr(OperatorConfig(ORIGIN, COOKIE)))


if __name__ == "__main__":
    unittest.main()
