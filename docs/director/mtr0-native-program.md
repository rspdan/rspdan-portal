# One native engine choice through the existing host

This finite caller connects an operator-retained native reply to the existing authenticated continuation operations. It does not automate the native UI, register an MCP host, configure a provider or replace the continuing conversation. The host still owns study access, exact identities, validation, storage and effects.

Use the established private operator configuration and an existing task directory. Invoke the same CLI with the compatible Python environment already used by the operator:

    python tools/mtr0-operator/cli.py --config <private-config> program-context --study-id <selected-study> --journal <task-directory/program.json>
    python tools/mtr0-operator/cli.py --config <private-config> program-choice --journal <same-program.json> --input <literal-native-reply.txt>

The context command creates the journal for the explicitly selected study, or reopens that same study and configured origin. It reads actual server capability, current study and retained continuation separately. A failed full-study read does not erase an independently available continuation/result. Unknown freshness stays unknown. Capability and provider configuration are distinct: read and selection can be available without a configured provider. Asset references do not deliver image bytes to the native conversation.

Give the resulting context and reply contract to the existing native conversation through its working text route. Preserve the completed whole reply through the established Copy operation as UTF-8. The choice command reads those exact bytes. It accepts exactly one JSON object with name and arguments, using only these existing MCP envelopes:

    {"name":"mtr0_continuation_read","arguments":{"study_id":"study_<exact selected UUID>"}}
    {"name":"mtr0_continuation_select","arguments":{"request":{"action":"select","input":{...existing generate envelope...},"previousOperationId":null,"previousResultHash":null}}}
    {"name":"mtr0_continuation_resume","arguments":{"study_id":"study_<exact selected UUID>","operation_id":"op_<exact current selected UUID>"}}

The selection example is abbreviated, not executable. The actual context supplies the existing typed schema, exact current revision, eligible evidence IDs and predecessor bindings. A new selection needs one fresh caller-supplied lowercase operation UUID; that ID remains unchanged for retry. No other study is in scope even if the authenticated owner owns it. Origins, credentials, arbitrary client methods and model/provider selection are not accepted arguments.

The parser rejects Markdown fences, prose around JSON, multiple choices, duplicate member names, non-finite numbers, invalid Unicode scalar values, unknown operations, extra arguments and coercion. It does not extract the first plausible object, evaluate generated code or repair identifiers. Valid parsed choices are rechecked against current capability and eligibility before forwarding through the existing client. The server remains authoritative for its complete canonical validation and atomic identity arbitration.

The local journal stores the literal UTF-8 reply, byte count and SHA-256 separately from its parsed choice and unchanged host receipt or inability. CRLF is preserved; no normalization is performed. The journal is local receiving and pending-delivery evidence, not another authoritative study/operation store. It binds the configured origin and selected study. Use one journal for this continuing interaction; creating another journal does not reconcile this one's pending write.

Before a write can be sent, its exact choice is saved atomically. A process lock serializes writers of that journal and releases on process exit. After an uncertain response, only reading or retrying that exact pending choice is eligible. An absent read does not erase it. A matching authoritative selection/operation read can reconcile the pending choice without another write. Final local-record failure does not suppress an already returned host receipt; it reports unavailable local recording while the pre-write identity remains recoverable.

Losing CLI output after the journal recorded success also permits exact recovery. A matching current selection returns through readback. An older exact selection already received in this journal uses the existing server's idempotent recovery; its historical receipt and actual current head stay distinct. Neither path replaces an operation ID or dispatches a provider.

If another caller advances the head while a resume receipt is uncertain, context preparation reads the original operation independently. Its unchanged receipt appears under recoveredChoice, separately from retained, which describes the current continuation. The operation ID and study binding must match. A known claim establishes delivery, not necessarily completion; pending, unknown and failed outcomes retain their server meanings. Missing original-operation readback preserves the pending choice. An exact recovered resume uses original-operation reading without dispatch. A later definite rejection for a different choice does not inherit an already reconciled choice's uncertainty.

Return the actual host receipt or precise inability to the same native conversation. Then obtain a new context for the next choice. The useful test is whether returned content informs that choice. Selection is a storage effect; resume may dispatch an unclaimed eligible operation or read an existing claim. Neither accepts an authored card, changes a scene or establishes that the native model itself executed the host effect.

Bounds: 32 KiB per literal UTF-8 reply, 128 locally retained turns and 8 MiB for this journal. Existing store limits, updated-writer requirement and stale-selection/no-abandonment rule still apply. Context consists of separate observations, not an atomic snapshot or a dispatch promise. A persistent provider failure and an uncertain operation remain distinct from an unavailable observation. There is no automatic retry, polling worker or approval at every ordinary step.

The focused checks use the existing isolated Astro fixture and synthetic providers:

    python -m unittest discover -s tools/mtr0-operator -p test_native_program.py -v

They cover whole-reply parsing, selected-study scope, actual capability/provider separation, missing-source retained results, stale choices, process locking, lost acknowledgement, original-identity recovery, final local-record failure and an actual CLI/HTTP result-informed successor. This is host behavior; actual native conversation receiving is separately attributed.
