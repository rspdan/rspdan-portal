"""Bounded operator client for the existing local MTR0 v1 HTTP routes.

No provider transport, named author, retry loop or model credentials live here.
"""
from __future__ import annotations

import base64
import asyncio
from dataclasses import dataclass, field
import hashlib
import json
import math
import os
from pathlib import Path
import re
import stat
from typing import Any
from urllib.parse import urlsplit

import httpx

STUDY_ROUTE = "/api/director-study"
ENGINE_ROUTE = "/api/director-engine"
MAX_STUDY_BODY = 12 * 1024 * 1024
MAX_ENGINE_BODY = 32 * 1024
MAX_RESPONSE = 16 * 1024 * 1024
MAX_ASSET = 8 * 1024 * 1024


class BridgeError(Exception):
    def __init__(self, code: str, message: str, *, status: int | None = None,
                 uncertain: bool = False):
        super().__init__(message)
        self.code, self.status, self.uncertain = code, status, uncertain

    def as_dict(self) -> dict[str, Any]:
        return {"ok": False, "error": {"code": self.code, "message": str(self),
                "httpStatus": self.status, "deliveryUnconfirmed": self.uncertain,
                "automaticRetry": False}}


@dataclass(frozen=True)
class OperatorConfig:
    origin: str
    cookie: str = field(repr=False)
    timeout_seconds: float = 90

    def __post_init__(self):
        if (not isinstance(self.origin, str) or not 1 <= len(self.origin) <= 2048 or
                any(c.isspace() or ord(c) < 33 for c in self.origin)):
            raise BridgeError("configuration", "Invalid configured portal origin.")
        try:
            u = urlsplit(self.origin)
            port = u.port
        except (ValueError, TypeError):
            raise BridgeError("configuration", "Invalid configured portal origin.") from None
        if (u.scheme not in {"http", "https"} or not u.hostname or u.username or
                u.password or u.query or u.fragment or u.path not in {"", "/"} or
                (u.scheme == "http" and u.hostname not in {"127.0.0.1", "::1", "localhost"}) or
                (port is not None and not 1 <= port <= 65535)):
            raise BridgeError("configuration", "Use a configured HTTPS origin or literal loopback HTTP origin.")
        if (not isinstance(self.cookie, str) or not self.cookie.startswith("pspt_session=") or
                not self.cookie.removeprefix("pspt_session=") or len(self.cookie) > 8192 or
                any(ord(c) < 33 or ord(c) > 126 or c == ";" for c in self.cookie)):
            raise BridgeError("configuration", "Configure one private PSPT session cookie.")
        if (isinstance(self.timeout_seconds, bool) or not isinstance(self.timeout_seconds, (int, float)) or
                not math.isfinite(self.timeout_seconds) or not 0.05 <= self.timeout_seconds <= 180):
            raise BridgeError("configuration", "Configured timeout is outside its bound.")
        host = f"[{u.hostname}]" if ":" in u.hostname else u.hostname
        suffix = f":{port}" if port and port != (443 if u.scheme == "https" else 80) else ""
        object.__setattr__(self, "origin", f"{u.scheme}://{host}{suffix}")

    @classmethod
    def load(cls, filename: str | Path) -> "OperatorConfig":
        try:
            path = Path(filename)
            info = path.stat()
            if not stat.S_ISREG(info.st_mode) or info.st_size > 16384:
                raise ValueError()
            if os.name == "posix" and info.st_mode & 0o077:
                raise BridgeError("configuration", "The session configuration must be private (mode 0600).")
            value = json.loads(path.read_text(encoding="utf-8"))
            if (not isinstance(value, dict) or set(value) - {"origin", "cookie", "timeout_seconds"} or
                    not {"origin", "cookie"} <= set(value)):
                raise ValueError()
            return cls(**value)
        except BridgeError:
            raise
        except (OSError, ValueError, TypeError):
            raise BridgeError("configuration", "Could not read a valid private session configuration.") from None


def _identifier(value: str) -> str:
    if not isinstance(value, str) or not 1 <= len(value) <= 160 or not re.fullmatch(r"[A-Za-z0-9_-]+", value):
        raise BridgeError("input", "Invalid bounded record identifier.")
    return value


def _payload(value: dict, keys: set[str], action: str) -> dict:
    if not isinstance(value, dict) or set(value) != keys or value.get("action") != action:
        raise BridgeError("input", "Use the exact existing server request shape and action.")
    return value


class OperatorClient:
    def __init__(self, config: OperatorConfig, *, transport: httpx.AsyncBaseTransport | None = None):
        self.config = config
        self._http = httpx.AsyncClient(timeout=config.timeout_seconds, follow_redirects=False,
                                      trust_env=False, transport=transport)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self._http.aclose()

    def _check_credentials(self, value: Any) -> None:
        try:
            text = json.dumps(value, ensure_ascii=False, allow_nan=False)
        except (TypeError, ValueError, RecursionError):
            raise BridgeError("input", "Request or receipt is not bounded JSON data.") from None
        # Exact known session material, not general secret detection or image OCR.
        token = self.config.cookie.split("=", 1)[1]
        if self.config.cookie in text or token in text:
            raise BridgeError("credential-content", "Session material cannot be sent as work or returned as content.")

    async def _request(self, route: str, *, params: dict | None = None,
                       payload: dict | None = None, raster_hash: str | None = None):
        try:
            async with asyncio.timeout(self.config.timeout_seconds):
                return await self._exchange(route, params=params, payload=payload, raster_hash=raster_hash)
        except TimeoutError:
            raise BridgeError("timeout", "Portal receipt deadline expired. Read history/status; no automatic retry occurred.",
                              uncertain=payload is not None) from None

    async def _exchange(self, route: str, *, params: dict | None = None,
                        payload: dict | None = None, raster_hash: str | None = None):
        if route not in {STUDY_ROUTE, ENGINE_ROUTE}:
            raise BridgeError("input", "Unsupported bridge route.")
        method = "POST" if payload is not None else "GET"
        wire = None
        headers = {"Cookie": self.config.cookie, "Accept": "application/json", "Accept-Encoding": "identity"}
        if payload is not None:
            self._check_credentials(payload)
            try:
                wire = json.dumps(payload, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode()
            except (TypeError, ValueError):
                raise BridgeError("input", "Request is not bounded JSON data.") from None
            bound = MAX_ENGINE_BODY if route == ENGINE_ROUTE else MAX_STUDY_BODY
            if len(wire) > bound:
                raise BridgeError("request-too-large", "Request exceeds the route byte bound.")
            headers.update({"Origin": self.config.origin, "Content-Type": "application/json"})
        uncertain = method == "POST"
        try:
            async with self._http.stream(method, self.config.origin + route, params=params,
                                         headers=headers, content=wire) as response:
                if 300 <= response.status_code < 400:
                    raise BridgeError("redirect", "Portal redirect was rejected; sign in separately if needed.",
                                      status=response.status_code, uncertain=uncertain)
                limit = MAX_ASSET if raster_hash and response.is_success else MAX_RESPONSE
                data = bytearray()
                async for chunk in response.aiter_bytes():
                    data.extend(chunk)
                    if len(data) > limit:
                        raise BridgeError("response-too-large", "Portal response exceeded the byte bound.",
                                          status=response.status_code, uncertain=uncertain)
                if raster_hash and response.is_success:
                    mime = response.headers.get("content-type", "").split(";", 1)[0].strip().lower()
                    if (mime not in {"image/png", "image/jpeg", "image/webp"} or not data or
                            hashlib.sha256(data).hexdigest() != raster_hash):
                        raise BridgeError("asset-integrity", "Returned raster bytes or MIME do not match the requested asset.")
                    return {"ok": True, "asset": {"sha256": raster_hash, "mime": mime, "bytes": len(data)},
                            "dataUrl": f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"}
                try:
                    result = json.loads(data.decode("utf-8"))
                except (ValueError, UnicodeError):
                    raise BridgeError("invalid-response", "Portal returned no readable JSON receipt.",
                                      status=response.status_code, uncertain=uncertain) from None
                try:
                    self._check_credentials(result)
                except BridgeError as error:
                    raise BridgeError(error.code, str(error), status=response.status_code,
                                      uncertain=uncertain) from None
                if not isinstance(result, dict) or not isinstance(result.get("ok"), bool):
                    raise BridgeError("invalid-response", "Portal receipt has no valid result envelope.",
                                      status=response.status_code, uncertain=uncertain)
                if not response.is_success or not result["ok"]:
                    message = result.get("error")
                    if not isinstance(message, str) or not 1 <= len(message) <= 1000:
                        message = "Portal rejected the operation."
                    raise BridgeError("portal-rejected", message, status=response.status_code,
                                      uncertain=uncertain and response.status_code >= 500)
                return result
        except BridgeError:
            raise
        except (httpx.HTTPError, OSError):
            raise BridgeError("transport", "Portal delivery was not confirmed. Read history/status; no automatic retry occurred.",
                              uncertain=uncertain) from None

    async def status(self):
        result = await self._request(ENGINE_ROUTE)
        return {**result, "capabilityDescriptor": {
            "bridge": "mtr0-operator/v1", "operation": "production-card",
            "inputSchema": "existing-director-engine-generate/v1",
            "outputSchema": "mtr0-production-card/v1", "domains": ["camera", "lighting", "composition"],
            "requiresCurrentSavedStudy": True, "providerSelection": "server-configuration-only",
            "imageCapability": "declared-by-server-not-vision-verified", "automaticRetry": False,
            "cancellationEndpoint": False, "freeformChat": False,
            "identity": "Existing PSPT session; owner is resolved by the server. No named author is inferred.",
            "hostRegistration": "stdio-compatible-host-required; not automatically registered here",
            "invokeFields": {
                "action": "generate", "operationId": "op_<caller-supplied lowercase UUID>",
                "studyId": "study_<saved UUID>", "revisionId": "rev_<saved UUID>",
                "sourceIds": "1–8 unique evidence IDs from that revision",
                "instruction": "1–4096 characters, including each selected source's intended role",
                "allowedDomains": ["camera", "lighting", "composition"],
            },
            "studySaveFields": {"action": "save", "requestId": "caller-supplied lowercase UUID",
                "studyId": "study_<caller-supplied lowercase UUID>",
                "baseRevisionId": "current saved rev_<UUID>, or null for a new study",
                "study": "nest-production-study/v1; existing server validator remains authoritative"},
            "studySchemaSource": "src/lib/productionStudySchema.js",
            "studyExampleOnly": {
                "schema": "nest-production-study/v1", "title": "Replace with the study title",
                "target": {"kind": "external-native", "name": "Unspecified native", "sha256": None},
                "evidence": [{"id": "source-1", "title": "Selected note", "kind": "text",
                    "source": "Operator supplied", "asset": None, "text": "Replace with intended evidence."}],
                "cards": [{"id": "card-1", "parentId": None, "origin": "operator",
                    "observations": "Replace with an operator-authored observation.",
                    "proposal": "No generated proposal has been accepted.", "keepFixed": "State the held parts.",
                    "imageCheck": "No preview is attached.", "limits": "This is an example, not saved work.",
                    "sourceIds": ["source-1"]}],
                "corrections": [], "selectedCardId": "card-1", "acceptedCardId": None,
                "preview": None, "nextAction": "Choose intended sources and an explicit instruction.",
            },
        }}

    async def list_studies(self):
        return await self._request(STUDY_ROUTE)

    async def read_study(self, study_id: str, revision_id: str | None = None):
        params = {"id": _identifier(study_id)}
        if revision_id is not None:
            params["revision"] = _identifier(revision_id)
        return await self._request(STUDY_ROUTE, params=params)

    async def save_study(self, request: dict):
        return await self._request(STUDY_ROUTE, payload=_payload(request,
            {"action", "requestId", "studyId", "baseRevisionId", "study"}, "save"))

    async def upload_asset(self, data_url: str):
        if not isinstance(data_url, str):
            raise BridgeError("input", "Supply a raster data URL.")
        return await self._request(STUDY_ROUTE, payload={"action": "asset", "dataUrl": data_url})

    async def read_asset(self, sha256: str):
        if not isinstance(sha256, str) or not re.fullmatch(r"[a-f0-9]{64}", sha256):
            raise BridgeError("input", "Supply an exact SHA-256 asset identifier.")
        return await self._request(STUDY_ROUTE, params={"asset": sha256}, raster_hash=sha256)

    async def invoke(self, request: dict):
        return await self._request(ENGINE_ROUTE, payload=_payload(request,
            {"action", "operationId", "studyId", "revisionId", "sourceIds", "instruction", "allowedDomains"}, "generate"))

    async def get_operation(self, operation_id: str):
        return await self._request(ENGINE_ROUTE, params={"operationId": _identifier(operation_id)})

    async def history(self, study_id: str):
        return await self._request(ENGINE_ROUTE, params={"studyId": _identifier(study_id)})
