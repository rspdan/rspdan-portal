# MTR0 server adapter

This is a server-side request/response library, not an enabled API route or model connection. `mtr0Adapter.js` and `mtr0Schema.js` add one nonstreaming OpenAI-compatible operation. They do not change study v1, store generated cards, mutate a scene, run tools or retry provider calls. MTR0 is the project identity; `serviceId` and `model` identify the separately configured service/model. A returned model name is a provider report, not independent proof of model identity.

## Contract

```js
import { createMtr0Adapter } from './mtr0Adapter.js';

const adapter = createMtr0Adapter({
  studyService,                      // existing authenticated-owner study service
  endpoint: process.env.MTR0_ENDPOINT, // complete Chat Completions URL; server only
  serviceId: 'configured-service',
  model: 'configured-model',
  apiKey: process.env.MTR0_API_KEY,
  imageInput: true,                  // declared capability, not tested model vision
});

const prepared = await adapter.prepare({
  actor, studyId, revisionId,        // an exact saved revision, never an implicit head
  sourceIds: ['art_1', 'baseline_1', 'direction_1'],
  instruction: 'Use art_1 as the art reference, baseline_1 as the historical render, and direction_1 as construction evidence. Propose one lighting study; hold the camera and materials.',
  allowedDomains: ['lighting'],
});
const result = await adapter.invoke(prepared, { signal });
// Or: adapter.generate(theSameInputShape, { signal }).
```

The caller must supply the authenticated operator actor. This module is not an authentication or browser exposure boundary; a future route must retain session/origin checks. No endpoint or API-key field is accepted in the operation input. HTTPS is required, except literal `127.0.0.1`, `[::1]` or `localhost` HTTP explicitly enabled by `allowLoopbackHttp:true`. Redirects are never followed. URL userinfo, query and fragment are rejected. Model identifiers allow forms such as `provider/model` and `qwen:tag`, but reject URL and drive-path forms.

`prepare` snapshots the actor, IDs, source selection, instruction and domains before asynchronous reads. It verifies the exact returned revision and study hash, then separately reads and hashes each selected raster. The request includes actual `image_url` data-URL parts, each immediately preceded by its source ID and exact hash/MIME/length. Selected text is sent literally with its ID and UTF-8 hash. Native target identity is `{kind,sha256}`; a missing native hash stays null. Native bytes are never uploaded by this module.

The existing service verifies **all** attachments when reopening a saved study, including an unselected preview. Thus selected-only transmission is not selected-only availability: missing/corrupt unrelated attachments can block preparation. This deliberately preserves the current saved-revision integrity contract.

Manual cards, corrections, preview and `nextAction` are excluded from first-generation input. Unselected sources, evidence titles/locators, study title, actor identity and native filename are also excluded. **The explicit instruction must identify each source's intended role by source ID**; the adapter does not infer art-reference/baseline roles from a filename or title. It does not retrieve external sources or interpolate historical sample answers. Selecting a text source deliberately sends that text; source selection must not include an answer key disguised as evidence.

Known configured credentials and recognizable credential/local-path syntax in transmitted text or accepted output are rejected, not silently redacted. This is not comprehensive secret detection or OCR of raster contents. Only deliberately selected, appropriate evidence should be used; the synthetic tests do not transmit private artwork or real credentials. Source locators and filenames are excluded by construction even when stored privately in the study.

## Prepared identity and one invocation

The deeply frozen `mtr0-request/v1` receipt contains:

- `project:'MTR0'`, `operation:'production-card'`, local `requestId`, `preparedAt`;
- `study:{id,revisionId,studyHash}`, `target:{kind,sha256}`, instruction and allowed domains;
- ordered `sources:[{id,kind,sha256,bytes,mime?}]`;
- `provider:{serviceId,model,endpointSha256,declaredImageInput}`;
- `requestSha256` and `requestBytes`, binding the exact serialized provider body.

It contains neither credentials nor image data URLs, source locators or endpoint configuration. The private body is detached from public nested values and held only inside this adapter instance. The opaque handle is single-use: repeated/concurrent invocation returns `already-invoked` without sending again. Copying or deserializing a receipt cannot recreate an invocable handle. This is in-process one-shot protection, not durable provider idempotency or a recovered runtime session.

An exact older revision can be prepared intentionally. The receipt preserves that edition; it does not assert that it is still the current study head. A later UI/persistence integration must compare the result's revision/request identity with the work still being edited before displaying it as current or applying an operator choice.

## Separate bounded output

`mtr0-production-card/v1` is:

```text
schema
observations: [{text,sourceIds}]
proposal: {domain,text,sourceIds}
keepFixed: [text]
imageCheck: {text,sourceIds}
limits: [text]
```

All fields are required; unknown fields are rejected. Each linked statement cites at least one selected source ID, with no duplicate/unknown references. `domain` must be explicitly allowed for this request from `camera`, `lighting`, `composition`. These are proposal labels, not permissions to execute or proof that the prose respects all restrictions. Observations are bounded to 12, their text and proposal/check text to 2,000 characters, and keep-fixed/limit lists to 12 strings of 500 characters. Empty required text/lists fail. The transport requests JSON Schema output, and the adapter independently validates it.

Success returns `{request, outcome:{status:'completed',code:'completed',validation:'structural-only',card,delivery,httpStatus,responseSha256,providerReportedModel,usage}}`. Usage retains only bounded numeric token counts. Valid structure and known citations cannot establish whether an observation belongs to an image, whether a proposed control exists, or whether the result is useful. The response is not assigned `origin:'operator'`, inserted into a study, accepted or executed.

Failure returns `{request:null|receipt,outcome:{status:'failed',code,message,delivery,uncertain,httpStatus,responseSha256,retry:'manual-only'}}`. Errors do not echo provider error bodies, raw responses, credentials or local service exceptions. Codes distinguish invalid input, unavailable sources, undeclared image input, cancellation, timeout, transport, HTTP error, redirect, response size, length truncation, invalid output and consumed handles. `prepare` throws a typed `Mtr0Error` for input/source failures; `generate` turns those into the same bounded failure shape. `finish_reason:'length'` is incomplete even if the text parses. Tool/function calls and refusals are not executed or accepted as cards.

`delivery:'attempted'` means the call was handed to fetch, not proof that a provider received it. A local cancellation, timeout or interrupted connection after that point can leave provider completion unknown. There is no automatic retry. Preparing a fresh handle and calling again is a new deliberate call, not a safe replay guarantee. Cancelling before invocation sends nothing. Cancellation is checked again after preparation; local source reads themselves are not abortable through this interface.

Bounds: at most eight selected sources; 16 MiB combined selected raster bytes (the existing individual-asset limit also applies); 64 KiB combined UTF-8 source text; 24 MiB serialized request; 4,096-character instruction. Response default is 256 KiB, configurable from 256 bytes to 1 MiB. Provider timeout defaults to 30 seconds, configurable from 1 ms to 120 seconds, covering fetch and streamed response reading. `max_completion_tokens` defaults to 4,096 and is bounded to 64–8,192. Image input must be explicitly declared for image selections; text-only requests remain possible.

## Receiving scope

Run `node --test src/lib/mtr0Adapter.test.mjs`. Receiving uses a real disposable loopback HTTP server, synthetic raster/text fixtures and temporary owned study storage. The server captures transmitted image bytes; it is a transport/protocol fixture, not a real model. The tests exercise exclusion, exact source identity, single-use invocation, malformed/truncated/tool/unknown-source output, byte limits, redirects, cancellation and unavailable sources. The accompanying private receipt records actual completed test counts and source hashes.

No real provider/model inference, account entitlement, model vision, useful production card, native preview, HYV0/Windows receiving, new dependency, route/UI integration, commit or deployment is established by this module's tests.
