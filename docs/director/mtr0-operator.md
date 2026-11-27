# Direct operator access to MTR0

The Python client, CLI and official MCP stdio server in `tools/mtr0-operator/` call the existing `/api/director-study` and `/api/director-engine` routes. The Director UI and operator tools therefore use the same authenticated owner, immutable saved revisions, assets and operation history. This is access under the same PSPT owner, not cross-owner collaboration or impersonation; another owner's study remains inaccessible. This bridge does not create a second work store or change the v1 schemas.

The available operation is **production-card v1**, with camera, lighting and composition proposal domains. Freeform chat, an engine picker, cancellation and a general operation registry are not implemented. MTR0 is the project/interface identity; the configured service and model remain separately recorded. A browser Qwen Chat login is not an OpenAI-compatible endpoint or this portal's PSPT session.

## Configuration and entry points

Python **>=3.11** is required because the client uses `asyncio.timeout`. At the original Linux receiving, Python 3.12, official `mcp` 1.29.0, `httpx` 0.28.1 and `pydantic` 2.13.4 were already installed in the receiving environment. Exact received dependency editions and runtime limits are retained in `tools/mtr0-operator/requirements.txt` and `runtime.json`; no dependency installation was performed for that earlier slice. The portal must be running in development mode with explicitly configured `DIRECTOR_STUDY_STORE_DIR`; new model calls additionally require the existing server-side MTR0 configuration described in [mtr0-integration.md](mtr0-integration.md). These routes are disabled in production, so a hosted production portal is not an equivalent endpoint. An HTTPS origin accepted by the client does not enable those server routes.

Create a private JSON configuration outside the repository. This example contains placeholders, not usable credentials:

```json
{
  "origin": "http://127.0.0.1:4341",
  "cookie": "pspt_session=REPLACE_WITH_YOUR_EXISTING_SESSION",
  "timeout_seconds": 90
}
```

The loader requires a regular file of at most 16 KiB and, on POSIX, no group/other permissions (`chmod 600`). Use an explicit HTTPS origin, or literal loopback HTTP. The file contains one PSPT session cookie obtained separately through the existing sign-in flow. No provider key, named author or model selector belongs in a tool request. Ownership comes from the server-verified session. Keep configuration and resulting work files private; this bridge does not establish Windows ACL behavior.

From the portal root:

```sh
python3 tools/mtr0-operator/cli.py --config /private/mtr0-operator.json status
python3 tools/mtr0-operator/cli.py --config /private/mtr0-operator.json studies-list
python3 tools/mtr0-operator/cli.py --config /private/mtr0-operator.json invoke --input /private/invocation.json
python3 tools/mtr0-operator/server.py --config /private/mtr0-operator.json
```

`MTR0_OPERATOR_CONFIG` can supply the configuration path instead. The final command is a stdio server for a compatible MCP host. Register that command and private path in the host's configuration; it is **not automatically registered in the hosted conversation UI**. The CLI and callable Python client are directly usable through an execution tool in this workspace.

## Discoverable operations

`status` / `mtr0_status` reads configuration without invoking a model. Its descriptor names the actual operation, domains, required invoke/save fields, canonical study schema source and a complete **unsaved example**. `declaredImageInput` is configuration, not demonstrated vision. MCP discovery exposes typed invoke/save envelopes, action constants and allowed domain values; the existing server remains the canonical validator of IDs and study contents.

| CLI command | MCP tool | Purpose |
|---|---|---|
| `status` | `mtr0_status` | Configuration and current capability |
| `studies-list` | `mtr0_studies_list` | Owned saved study heads |
| `study-get --id ID [--revision ID]` | `mtr0_study_read` | Current or exact saved revision |
| `study-save --input FILE` | `mtr0_study_save` | Save the supplied manual study envelope |
| `asset-upload --input FILE` | `mtr0_asset_upload` | Store explicitly supplied raster bytes |
| `asset-read --sha256 HASH` | `mtr0_asset_read` | Read exact hash-verified raster bytes |
| `invoke --input FILE` | `mtr0_invoke` | Deliberate production-card operation |
| `operation-get --id ID` | `mtr0_operation_read` | Saved status and result |
| `operation-history --study-id ID` | `mtr0_history` | That study's operation history |

CLI JSON input can use `--input -` (the default) for stdin. Asset-upload input is `{ "dataUrl": "data:image/png;base64,..." }`; MCP takes `data_url` directly. Asset-read returns the descriptor and unchanged bytes as a data URL; MCP returns the descriptor plus an actual image content block. PNG, JPEG and WebP are supported by the existing service, with an 8 MiB asset bound. The bridge verifies the returned digest and MIME; the service validates raster structure.

Save input is the unchanged server envelope:

```json
{
  "action": "save",
  "requestId": "CALLER_SUPPLIED_LOWERCASE_UUID",
  "studyId": "study_CALLER_SUPPLIED_LOWERCASE_UUID",
  "baseRevisionId": null,
  "study": { "schema": "nest-production-study/v1" }
}
```

The abbreviated `study` above must be replaced by a complete document; obtain the unsaved example through status and consult `src/lib/productionStudySchema.js`. A new study uses `baseRevisionId:null`; subsequent saves use its current `rev_<UUID>`. Saved evidence, cards and corrections are retained unchanged. New evidence gets a new ID, and a correction creates a child card. Upload referenced images before saving; saving verifies every claimed attachment. Generated results remain in separate operation history and cannot be inserted as generated cards into the operator-authored v1 document.

Invoke input:

```json
{
  "action": "generate",
  "operationId": "op_CALLER_SUPPLIED_LOWERCASE_UUID",
  "studyId": "study_EXISTING_LOWERCASE_UUID",
  "revisionId": "rev_CURRENT_LOWERCASE_UUID",
  "sourceIds": ["art-reference", "baseline"],
  "instruction": "Treat art-reference as the art source and baseline as the frozen render. Propose one lighting study; retain camera, geometry and materials.",
  "allowedDomains": ["lighting"]
}
```

Use real existing IDs in place of placeholders. The caller deliberately creates and retains the operation ID; the bridge never silently generates or replaces it. Select 1–8 unique evidence IDs, a nonempty instruction of at most 4096 characters and 1–3 allowed domains. Identify source roles explicitly in the instruction. The adapter sends selected text and actual selected image bytes with IDs; it excludes existing manual cards, corrections, preview and `nextAction` from first-generation input. Exact revision reading nevertheless verifies **all** its attachments, so an unavailable unselected attachment can block preparation. Selected-only transmission is not selected-only availability.

For Python use, add `tools/mtr0-operator` to the import path, load `OperatorConfig`, and use `async with OperatorClient(config) as client`. Methods are `status`, `list_studies`, `read_study`, `save_study`, `upload_asset`, `read_asset`, `invoke`, `get_operation` and `history`. Returned server envelopes are preserved. A `BridgeError` exposes a sanitized `as_dict()` with `deliveryUnconfirmed` and `automaticRetry:false`.

## Interrupted work and engine changes

No transport performs an automatic write retry. After a missing or malformed POST receipt, retain the original request and read its original operation ID/history. `pending` means the current service process knows an invocation is active; `unknown` means a durable claim exists without a final receipt and without that local active marker. Neither means safe automatic replay or proof that the provider stopped. A lost connection or client deadline does not cancel provider work.

The existing server can return the original record for a deliberately repeated identical ID/request without reinvoking. A changed request with an existing ID conflicts. Do not create a fresh ID merely because a receipt was lost. Study saves similarly use stable `requestId` and `baseRevisionId`; read back before treating an uncertain save as complete.

Provider selection remains server configuration only. New operations use the currently configured service/model; old IDs preserve their original request, provider identity and result even after a restart under a different configuration. This tests interchange within the current profile, not a general engine registry. Application-owned work and results are separate from any model session/cache. A portable result needs its referenced study revision and asset bytes as well as the operation JSON; no new package-export endpoint is added here.

The client rejects redirects, bounds input/output and total request time, disables environment proxy inheritance, and never prints raw transport exceptions or configured session material. Its exact-known-session check is not a general secret scanner. Other source content is explicitly selected work and must be handled accordingly.

## Receiving scope

Run the focused suite from the portal root:

```sh
python3 -m unittest discover -s tools/mtr0-operator -p 'test_operator*.py' -v
```

The original Linux suite passed **10 tests**: nine unit cases and one multi-step integration case. The integration starts disposable Astro and two synthetic loopback providers, creates synthetic accounts/evidence, exercises all nine CLI commands and all nine official SDK stdio tools, and uses the callable client. It checks exact images, manual-study preservation, owner isolation, conflicting IDs, selected provider inputs, restart against the same store, old-result preservation and fresh-ID routing to the second configuration. Provider counts are exactly A=1 and B=1. The fixture removes its temporary workspace/processes on normal completion; do not run it manually expecting its private startup protocol to be safe console output.

Separate receiving recorded 11 negative/result transport cases and 12 MCP discovery/validation checks, followed by 13 actual Astro/MCP/Director UI checks including a deliberately discarded completed POST response and recovery without a duplicate provider call. These are separately attributed in the private receipts; they are not additional unit test counts. The installed SDK emitted a Pydantic forward-reference warning during discovery without failing the checks.

Evidence: `/workspace/scratch/mtr0-direct-access/halp/integration/receiving-typed.json`, `halp/final-tests.log`, `bee/negative-probe-corrected.json`, `bee/schema-probe.json`, and `root/ui-recovery-receiving.json`. No real Qwen inference, model vision, remote station, HYV0/Windows operation, hosted MCP registration, production build or deployment is established by this receiving.

## Retained continuation through this caller

The added commands use the same engine route, authenticated owner and store. Status reports capabilityDescriptor.continuation.available from the connected server's explicit continuation marker. A client package or discoverable tool alone does not establish server installation.

| CLI command | MCP tool | Python method |
|---|---|---|
| continuation-select --input FILE | mtr0_continuation_select | continuation_select(request) |
| continuation-read --study-id ID | mtr0_continuation_read | continuation_read(study_id) |
| continuation-resume --study-id ID --operation-id ID | mtr0_continuation_resume | continuation_resume(study_id, operation_id) |

A selection contains action:"select", input (the complete existing generate envelope), previousOperationId and previousResultHash. Both predecessor fields are null at the root. For a successor, use the completed predecessor's original ID and exact continuation.resultHash, and form the actual next instruction from the retained contribution. MCP exposes a typed nested generate envelope and requires both nullable predecessor fields.

Read returns the saved choice, currentOperationId, next, resultHash, the original operation/result and studyHead. After an uncertain write receipt, read the same study and original operation identity; no command silently selects a replacement ID. An exact deliberate selection retry recovers the original record, while resume of an old noncurrent step conflicts. Completed, unknown and failed claims are only read; an authoritative absence permits dispatch under the original ID subject to normal validation.

A false studyHead.selectedRevisionCurrent exposes a study edit after selection. An unclaimed stale selection cannot dispatch, and this slice has no abandonment/rebase. A completed result still retains its original revision. The dispatch next label alone does not promise current revision or configured provider readiness. Other studies remain independently usable. All writers sharing the store must use the updated ID arbitration, and the 512-ID owner capacity includes interrupted unused reservations.

CLI JSON output is explicitly UTF-8, including on Windows. The test fixture now owns and stops its known Windows child process tree and verifies its temporary cleanup path. These fixture changes do not install a service.

Run the caller checks with:

    python3 -m unittest discover -s tools/mtr0-operator -p 'test_*.py' -v

The new actual-route flow and limits are described in [mtr0-continuation.md](mtr0-continuation.md). The original Linux evidence above remains historical and separately attributed.

The optional studyHead observation has an explicit status. When status is unavailable, revisionId and selectedRevisionCurrent are null; the original continuation/operation receipt remains usable. Do not interpret that null as a fresh revision or as proof of staleness. A later observation can succeed after source availability is restored. Actual selection and dispatch still require their existing source validation, so this does not make an unavailable attachment eligible for a new effect.
