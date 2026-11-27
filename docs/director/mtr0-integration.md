# Local MTR0 operation API

This development-only API connects the existing study service to the separate MTR0 adapter and a durable local operation history. Generated proposals remain separate from operator-authored study v1. Nothing is adopted into manual cards or applied to a scene. The adapter's [request/output contract](mtr0-adapter.md) still governs image delivery, proposal validation and its limits.

## Configuration and authenticated calls

`/api/director-engine` requires development mode, an explicit private `DIRECTOR_STUDY_STORE_DIR`, and an existing signed PSPT operator session. API keys do not substitute for an operator session. All POST requests require exact same-origin and JSON content type; the streamed request body is bounded to 32 KiB. The browser cannot supply an actor, endpoint, key, model or raw generated record. Unknown body/query fields and mixed/duplicate queries are rejected.

Provider configuration is server-only:

| Variable | Meaning |
| --- | --- |
| `MTR0_ENDPOINT` | Complete HTTPS Chat Completions URL; URL credentials/query/fragment are rejected. |
| `MTR0_SERVICE_ID` | Safe configured service identifier, separate from project name MTR0. |
| `MTR0_MODEL` | Configured model identifier, not a path or URL. |
| `MTR0_API_KEY` | Optional server credential, used only in the provider authorization header. |
| `MTR0_IMAGE_INPUT` | `true` explicitly declares image input; absence/`false` declares no image input. |
| `MTR0_ALLOW_LOOPBACK_HTTP` | `true` explicitly permits loopback HTTP for a local fixture/runtime. |

The configuration response is `{configured,serviceId,model,declaredImageInput,reason}`. Missing configuration is `unconfigured`; partial/invalid configuration is `invalid-configuration`. Both return null service/model labels and disable new calls. Configured is not a claim of entitlement, connectivity, model vision or usefulness. Endpoints, credentials and filesystem paths are never returned. Previously saved operation history remains readable without provider configuration.

## HTTP contract

- `GET /api/director-engine` returns `{ok,configuration,operations:[],storage:'local-workspace',shared:false}`.
- `GET ?studyId=<study_uuid>` returns the same envelope with that owner's operation summaries, newest claim first. A summary contains `id`, `studyId`, `revisionId`, `createdAt`, `finishedAt`, `status`, `serviceId`, `model`, `sourceIds`, `allowedDomains`.
- `GET ?operationId=op_<lowercase UUID>` returns `{ok,operation,storage,shared:false}`. An absent or other-owner operation is 404. Reads never invoke a provider or adopt a result.
- `POST {action:'generate',operationId,studyId,revisionId,sourceIds,instruction,allowedDomains}` returns the same operation envelope. The UI can provide one domain as a one-item array and spell out each source's role by ID in the instruction. The operation ID is stable for that deliberate action; it is different from the adapter's request ID.

An operation is `{id,studyId,revisionId,createdAt,finishedAt,status,request,outcome}`. `request` is the adapter's bounded public receipt. `outcome` is null until a final result has been durably recorded, then contains the validated adapter outcome. Possible states:

| State | Established fact |
| --- | --- |
| `pending` | A durable claim exists and this service instance currently observes its invocation. |
| `unknown` | A durable claim exists but no final result is readable and this instance cannot establish a live invocation. This includes restart or an unfinished call owned by another process. |
| `completed` | A complete, structurally validated proposal and its request identity have been stored and read back. This does not establish semantic usefulness. |
| `failed` | A bounded adapter failure has been stored and read back. A failed transport/cancelled call can still carry `uncertain:true` about provider completion. |

POST normally waits for its final operation. A same-process duplicate still pending receives HTTP 202; other readable states receive 200. A provider failure is a durable failed operation inside an `ok:true` envelope, not an HTTP transport failure of this API. Errors use `{ok:false,error}` with 400 validation, 401 authentication, 403 origin/operator rejection, 404 absence, 409 changed ID reuse/stale revision/capacity, 413 size, 415 media type or 503 configuration/storage unavailability. Raw provider and filesystem errors are not echoed.

## Claim before invocation, result after receiving

The service reads an existing operation before consulting current provider configuration or the study head. Identical normalized input under the same operation ID returns that existing status/result. Changed valid input under that ID conflicts. This continues to hold after restart and after a provider or study revision changes.

For a new operation, the service verifies the owned study's current revision, prepares its exact selected source bytes, checks again for a duplicate, and checks the current head again. It atomically installs a claim and independently reads the claim back before invoking. The study and operation stores do not share a transaction: the revision check is a point-in-time check immediately before claiming, not a lock against later study edits. Every result remains pinned to its exact revision. The UI must display older or locally edited work as historical and must not automatically apply a returned proposal.

Authentication, invalid input, disabled configuration, stale revision and source-preparation failures are rejected before claiming and do not create operation history. After invocation, both successful proposals and bounded adapter failures receive immutable result records where storage permits.

Claim and result records live under `DIRECTOR_STUDY_STORE_DIR/mtr0/owners/<owner hash>/`. An owner-wide immutable claim chain uses one atomic hard-link slot for its next operation. Competing processes recheck the chain; only one can claim a given operation ID. The chain accepts up to 512 operations per owner and fails explicitly at capacity. Results are separate immutable files bound to the claim hash. Every record has a SHA-256 integrity envelope and a 256-KiB file bound. Hashes detect accidental changed bytes; they are not signatures against a privileged filesystem editor.

This deliberate two-stage boundary preserves uncertainty. A crash after the claim but before result installation leaves an unknown operation. An identical retry or status read **never reinvokes that claim**, even if the crash actually occurred before the provider received anything. A failure before claim installation sends nothing. If result writing fails, the service returns only the readable durable state, usually unknown with null outcome; it does not label a volatile card as saved. If the final file was installed before a later I/O error, independent readback can still recover it. Corrupt records fail closed with storage unavailability.

A lost browser response is followed by GET history/status using the same operation ID, not an automatic second request. No resume queue, provider idempotency, durable worker lease or exactly-once provider execution is claimed. Local claims prevent automatic re-invocation; a provider can still complete a sent call after local interruption. This route does not expose a cancellation endpoint. A browser disconnect is not itself a durable cancellation instruction.

## Storage and source limits

The store syncs complete file data before atomic installation and attempts directory sync. Hard links must be supported; Windows and power-loss durability depend on the actual filesystem. Copying this local folder and the study data preserves ownership by the same operator identifier; cross-machine/Windows receiving must still be performed. There is no shared backend, record-delete or history-prune API.

The existing study service verifies all study attachments during readback. An unselected damaged image or preview can therefore block a new operation even though only explicit selected evidence is transmitted. Existing operation history can still be read without re-sending or re-reading source images. Source roles belong in the instruction because filenames, titles and locators are omitted. Credential/path checks are not general secret detection or OCR. New provider calls require deliberately appropriate evidence selection.

## Receiving boundary

Focused tests are `mtr0Service.test.mjs` and `mtr0Service.http.test.mjs`, with the preceding adapter suite retained. They use temporary real stores, synthetic sources, isolated Astro sessions and disposable loopback providers. The final private receiving receipt records actual completed counts and file editions. No live model/private-source transmission, useful generated result, new native preview, HYV0 operation, deployment or device readiness is established by synthetic receiving.
