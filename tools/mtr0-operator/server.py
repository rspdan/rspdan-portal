#!/usr/bin/env python3
"""Official MCP SDK stdio exposure of the same local operator HTTP client."""
import argparse
import json
import os
import sys
from typing import Any, Literal

from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.exceptions import ToolError
from mcp.types import ImageContent, TextContent, ToolAnnotations
from pydantic import BaseModel, ConfigDict, Field

from client import BridgeError, OperatorClient, OperatorConfig


class InvokeRequest(BaseModel):
    """Discoverable envelope only; existing HTTP service owns canonical validation."""
    model_config = ConfigDict(extra="forbid")
    action: Literal["generate"]
    operationId: str = Field(description="Explicit stable op_<lowercase UUID> for this deliberate operation. Reuse unchanged only to recover the same operation.")
    studyId: str = Field(description="Owned saved study_<UUID> identifier.")
    revisionId: str = Field(description="Exact current saved rev_<UUID> identifier.")
    sourceIds: list[str] = Field(min_length=1, max_length=8, description="Unique evidence IDs present in this saved revision.")
    instruction: str = Field(min_length=1, max_length=4096, description="Operator instruction including each selected source ID's intended role.")
    allowedDomains: list[Literal["camera", "lighting", "composition"]] = Field(min_length=1, max_length=3)


class SaveStudyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["save"]
    requestId: str = Field(description="Caller-supplied lowercase UUID. Reuse unchanged to recover this exact save.")
    studyId: str = Field(description="Owned study_<UUID>; supply a fresh ID for new work.")
    baseRevisionId: str | None = Field(description="Current saved rev_<UUID>, or null for a new study.")
    study: dict[str, Any] = Field(description="Complete operator-authored nest-production-study/v1 document. mtr0_status supplies studyExampleOnly; src/lib/productionStudySchema.js remains authoritative.")


def create_server(config: OperatorConfig) -> FastMCP:
    mcp = FastMCP("MTR0 operator", log_level="WARNING", instructions=(
        "Operate the existing local production-card v1 function. Use explicit saved study and operation IDs. "
        "No freeform chat, provider selection, cancellation endpoint or automatic retry is exposed. "
        "Read history after interrupted delivery. Session ownership is resolved by the server; no named author is inferred."))
    read = ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False)
    save = ToolAnnotations(readOnlyHint=False, destructiveHint=False, idempotentHint=True, openWorldHint=False)
    invoke = ToolAnnotations(readOnlyHint=False, destructiveHint=False, idempotentHint=True, openWorldHint=True)

    async def call(method: str, *args):
        try:
            async with OperatorClient(config) as client:
                return await getattr(client, method)(*args)
        except BridgeError as error:
            raise ToolError(json.dumps(error.as_dict())) from None
        except Exception:
            raise ToolError("Bridge receipt unavailable; read saved history before any write retry.") from None

    @mcp.tool(annotations=read)
    async def mtr0_status() -> dict[str, Any]:
        """Read configuration and the precise production-card v1 capability descriptor; no inference."""
        return await call("status")

    @mcp.tool(annotations=read)
    async def mtr0_studies_list() -> dict[str, Any]:
        """List this authenticated owner's saved study heads."""
        return await call("list_studies")

    @mcp.tool(annotations=read)
    async def mtr0_study_read(study_id: str, revision_id: str | None = None) -> dict[str, Any]:
        """Read an exact saved revision, or the current head when revision_id is absent."""
        return await call("read_study", study_id, revision_id)

    @mcp.tool(annotations=save)
    async def mtr0_study_save(request: SaveStudyRequest) -> dict[str, Any]:
        """Save an operator-authored study using explicit requestId, studyId and baseRevisionId. Server validation applies."""
        return await call("save_study", request.model_dump(mode="json"))

    @mcp.tool(annotations=save)
    async def mtr0_asset_upload(data_url: str) -> dict[str, Any]:
        """Store explicitly supplied exact raster bytes; this alone does not call a model."""
        return await call("upload_asset", data_url)

    @mcp.tool(annotations=read, structured_output=False)
    async def mtr0_asset_read(sha256: str) -> list[TextContent | ImageContent]:
        """Read and hash-verify an owned original raster, returning its descriptor and actual pixels."""
        result = await call("read_asset", sha256)
        return [TextContent(type="text", text=json.dumps({"ok": True, "asset": result["asset"]})),
                ImageContent(type="image", data=result["dataUrl"].split(",", 1)[1], mimeType=result["asset"]["mime"])]

    @mcp.tool(annotations=invoke)
    async def mtr0_invoke(request: InvokeRequest) -> dict[str, Any]:
        """Deliberately invoke production-card v1 using the supplied stable operationId and saved inputs. Never auto-retries."""
        return await call("invoke", request.model_dump(mode="json"))

    @mcp.tool(annotations=read)
    async def mtr0_operation_read(operation_id: str) -> dict[str, Any]:
        """Read pending, unknown or final saved status/result; reading never invokes the provider."""
        return await call("get_operation", operation_id)

    @mcp.tool(annotations=read)
    async def mtr0_history(study_id: str) -> dict[str, Any]:
        """Read the saved operation history for a study, preserving each original provider identity."""
        return await call("history", study_id)

    return mcp


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--config", default=os.environ.get("MTR0_OPERATOR_CONFIG"))
    args = p.parse_args()
    try:
        if not args.config:
            raise BridgeError("configuration", "Set a private MTR0_OPERATOR_CONFIG or --config file.")
        create_server(OperatorConfig.load(args.config)).run(transport="stdio")
    except BridgeError as error:
        print(json.dumps(error.as_dict()), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
