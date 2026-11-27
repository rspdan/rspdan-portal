# Retained MTR0 continuation slice

This library service joins the existing study and operation boundary. It records a selected input before dispatch and records result consumption together with the selected successor in one immutable step. It does not choose an input, run a worker, modify authored study v1, adopt a proposal, or apply a scene effect. The Director UI and operator-mediated model route remain compatible. The existing engine HTTP route and operator client now expose the bounded selection/read/resume interface described below.

## Interface

Construct `createMtr0ContinuationService({store, studyService, engine})` with the existing operation store, study service and MTR0 service.

- `select({action:'select', input, previousOperationId, previousResultHash}, actor)` persists a step. `input` is the existing normalized generate request, including its original operation ID and saved study revision. Both predecessor fields are null for the first step. A successor supplies the preceding step's operation ID and the SHA-256 of its entire retained result payload, as returned in `continuation.resultHash`.
- `get(studyId, actor)` reopens the current selection and exact durable operation snapshot without invoking the engine.
- `resume({studyId, operationId}, actor)` reconciles the expected current step. A successful authoritative absence read permits dispatch of the already selected input through the existing claim arbitration. Any existing claim is only read. A stale step ID conflicts rather than dispatching a newer selection implicitly.

The response separates `continuation` from `operation`. The continuation includes the saved selection, its creation time, current operation ID, durable status, available next action and exact result hash. Result content remains in the existing operation record. An unfinished claim is reported as unknown by this durable reader; it makes no claim to observe another instance's active invocation.

A completed result makes successor selection eligible. The caller uses the retained contribution to choose the next input. An unknown claim or uncertain failure requires reconciliation; a confirmed failure requires inspection. Neither failure case advances a dependent step. This slice has no retry-with-new-ID shortcut and no cancellation, abandonment or automatic branching mechanism. Unrelated studies remain independently usable.

## One atomic advance

The operation store retains `continuations/<studyId>/next_<predecessor-or-root>.json` under its existing private owner home. Each record has the existing SHA-256 envelope and file bound, and uses the existing synced temporary-file/atomic-hard-link helper. The successor selection and predecessor-result reference are the consumption receipt **in the same record**. There is no separate mutable cursor or second consumption write.

Every read validates the explicit continuation chain, input identity and each predecessor's actual retained completed result. The owner-wide claim chain's `previousOperationId` remains append order; it is not reused as a workflow dependency. Provider response-body SHA-256 is also distinct from the full retained result payload hash.

The exported store mutation also rejects reused step IDs before installation; invalid direct calls cannot poison an accepted chain. The response validates the actual operation snapshot against its selected input, in addition to chain validation.

Concurrent identical selections reconcile to the winning saved record. Different selections for the same predecessor conflict. If installation succeeds but acknowledgement is lost, retrying the exact selection recovers the same successor. A result saved before advancement remains available for that later transition. Failed reads and corrupt records are never interpreted as absence or completion.

Existing claim/result schemas and historical model-validation markers remain unchanged. A historical structural-only result does not acquire stronger validation when used by a continuation. A stored model-identity failure cannot become a completed proposal after configuration changes.

## Owner-wide selected input identity

Selection and direct operation claims share a bounded immutable input-binding chain under the same owner home. The operation ID binds one normalized input before either a selection or provider claim can be installed. The existing atomic installer arbitrates concurrent different inputs; losing callers receive a conflict before creating an accepted continuation or invoking a provider. A per-study lookup or an unlocked check of existing claims is insufficient.

An input binding is not a provider claim and does not indicate that an effect was attempted. If a process stops after binding but before step installation, an exact selection retry recovers that binding; a different input cannot take its ID. Direct generation uses the same arbitration. Existing operation claims predating input bindings still constrain compatible reservation and remain readable under their original formats. All writers sharing a store must use this updated arbitration before accepting new selections; an older process does not know about the new input-binding chain.

The input chain accepts at most 512 IDs per owner, including retained unused reservations. It fails explicitly at capacity and does not erase an interrupted identity to reclaim space.

A selected input can also become stale if the study is edited before dispatch. The existing engine correctly rejects that revision without invoking. This slice deliberately has no abandonment/rebase operation: the caller must expose that limitation rather than promise general editing/continuation recovery. The returned dispatch label means no claim exists, subject to current-revision/provider validation at actual dispatch; it does not establish that a formerly selected revision is still current.

The same local filesystem limits apply: atomic hard links are required, file data is synced, directory sync is best effort on Windows, and each study's continuation chain is bounded to 512 steps. This is local persistence, not a Fleet queue or an exactly-once external effect guarantee.

## Executed receiving

The focused `mtr0Continuation.test.mjs` suite exercises real temporary stores, a disposable loopback provider and fresh Node processes. It shows the retained proposal becoming part of the actual next selected instruction, then reopens that exact selection without another provider invocation. It also covers lost result and advancement acknowledgements, concurrent identical/conflicting advances, original-ID dispatch arbitration, unresolved claims, failed reads, uncertain and model-identity failures, owner boundaries, corrupt continuation data and unchanged historical validation. Added identity tests cover incompatible unclaimed studies, simultaneous selections, direct-generation conflicts/races and interruption between input reservation and step publication.

On HYV0, the 20 continuation checks and 28 existing operation/study checks passed together:

```powershell
node --test src/lib/mtr0Continuation.test.mjs src/lib/mtr0Service.test.mjs src/lib/productionStudy.test.mjs
```

These synthetic results establish the library behavior on the observed Windows runtime. They do not establish a live model call, UI integration, authored acceptance, native scene effect, deployment or complete continuing program executor.

## Existing host/operator caller

The existing authenticated /api/director-engine route constructs the continuation service with the same study service, operation store and engine used by direct generation. Existing generate and operation-read behavior remains available.

- GET ?continuationStudyId=<studyId> reopens the current step.
- POST with the exact select envelope above persists the caller's choice, without invoking.
- POST {action:'resume', studyId, operationId} reconciles that explicit original selected ID. Extra fields are rejected.
- Engine status advertises continuationCapability:'mtr0-continuation/v1'. The operator descriptor reports availability only when the connected server returns this marker, so a newer client does not imply installation on an older server.

Continuation responses preserve the library envelope and add studyHead:{status, revisionId, selectedRevisionCurrent}. This is the observed current saved revision, not a dispatch guarantee. Actual dispatch still rechecks revision and provider configuration. If an unclaimed selection is stale, the caller can see the mismatch and resume returns the existing 409 conflict without a provider call. The selection remains retained; this interface provides no abandonment or rebase. Completed results remain readable under their original revisions.

The existing Python client offers continuation_select, continuation_read and continuation_resume; CLI and typed MCP counterparts are documented in [mtr0-operator.md](mtr0-operator.md). No command creates an operation ID or automatically retries after uncertain delivery. Selection, dispatch and authored acceptance remain separate actions.

The caller reads the completed result, chooses a next instruction that actually uses its contribution, and supplies that instruction with the predecessor ID and full result hash. Reopening recovers that exact choice. A hash reference by itself does not prove that the caller made useful use of the result.

The test_continuation_integration.py flow exercises the actual authenticated Astro route, callable client, CLI subprocesses and official MCP stdio server. The synthetic flow carries a returned proposal into the next selected instruction and checks that text on the next provider wire after fresh Astro/MCP reopening. It also checks a lost HTTP response under the original ID, explicit stale revision with zero extra effects, independent eligible work, owner/request gates and manual-study preservation. This is operator-caller integration, not Director browser UI integration or a live model receiving.

### Unavailable current-head observation

Current-head enrichment follows the authoritative durable continuation response. If the extra study read fails, the response preserves its original selection, result and result hash, and reports studyHead.status as unavailable with null revisionId and selectedRevisionCurrent. Null means unknown, not a current or stale revision. A later successful observation reports status available.

This correction addresses Halp's executed caller-1 counterexample from Assembly3324: an attachment disappeared after validated provider preparation but before the optional head read. The old route returned 409 and hid a durably completed result. The retained regression now removes only a synthetic fixture attachment during a delayed provider response and verifies that resume/read/exact select retry preserve the completed result. Restoring the original bytes restores the head observation. New selection, direct generation and full study reading still reject the missing attachment; no pre-effect source validation was weakened.


## Director browser caller

The existing Production study dialog now uses the same bounded continuation interface when the connected server advertises mtr0-continuation/v1. A newer page does not infer that an older server supports it. The existing direct proposal request and read-only history remain available.

Prepare evidence roles and an instruction, then choose **Save as first step**. This persists the exact selection without calling a provider. **Run saved step** is a separate deliberate action and always names the saved operation ID. Opening a study and **Check saved step** perform reads only. The panel displays the retained instruction, its operation identity and the actual current head separately from ordinary request history. A completed historical request cannot make a different unresolved current step eligible.

After completion, **Use result in next instruction** copies the retained proposal text into the existing editable composer. It preserves any instruction already there. The operator can revise that wording, choose evidence and save the successor with the exact predecessor ID and full retained result hash. Source-role changes, history refresh and manual-study rendering do not rebuild the composer. A result reference is not an assertion of useful interpretation or manual-card acceptance.

Before sending a selection, this tab records the exact pending envelope in sessionStorage under the signed-in owner and study ID. A missing acknowledgement leaves an explicit retry of that same selection; it never creates a replacement ID automatically. Reload first reads the server's retained choice. Confirming an older selection must not clear the dirty state of a newer composer draft. If browser storage is unavailable, a new selection is not sent. This journal contains pending input, not credentials or image bytes; it is tab-local recovery data, not the durable program store. Closing the tab can discard a selection that has not been confirmed by the server. Server-retained steps remain reopenable independently.

If local journal removal fails after a matching selection response or definite rejection, the browser keeps the exact handled intent and retries cleanup on the next check. It clears that identity only after removal succeeds. This local cleanup does not dispatch work and cannot erase an unresolved intent merely because a read returns no saved step.

Unavailable current-study observation stays unknown and does not erase a completed result. Fresh selection/run controls require the relevant confirmed saved state; the server still enforces source validation. A stale unclaimed step is visibly blocked, with the existing no-abandonment/no-rebase limit. Ordinary history selection does not override the current step.

If the full requested study cannot be opened, the dialog separately reads continuation under the requested study ID. The recovery view keeps the failed full-study load visible, labels the requested identity, and stays read-only. An older editable study remains distinct and can still support its own eligible work. The recovered result never replaces that study or supplies its predecessor. Saving a copy resets the browser continuation identity immediately, before waiting for the save receipt; delayed responses from the earlier identity cannot enter the copy.

Saving a copy preserves the existing engine composer text, selected evidence, source roles, domain and unsaved state through both failed and successful manual-copy saves. The copied manual study does not save that prepared engine input. The composer remains editable, but its old continuation predecessor is detached.

Manual cards, accepted-card lineage, preview, corrections and manual nextAction keep their existing meanings. Continuation selection and results do not save or accept them. Actual browser receiving uses the existing disposable operator fixture at /director with synthetic accounts, sources and providers; its Director scene store is also inside the owned fixture directory. No running-service adoption or live provider use follows from that check.
