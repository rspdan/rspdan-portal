# Local Production studies and MTR0 proposals

**MTR0** is the NSTX project name for Qwengine. The Production study surface is the first local work area in that project. The project name stays separate from the actual configured model and service. The optional local engine connection keeps its requests and generated proposals in a separate history.

Director can retain a study's evidence, manually authored cards, corrections and next action independently of a take or floor plan. An unfinished study is valid: it can have no chosen card, target fingerprint or preview. Reopening restores the saved work without invoking a model.

## Requesting and reviewing an engine proposal

Configure the server through the [local MTR0 operation API](mtr0-integration.md). With no provider configured, manual studies and previously saved engine history still work. The UI displays the configured service/model and declared image capability; this is configuration, not a successful live-model test.

1. Open and save a study. **Ask MTR0 → Prepare a request** has a separate evidence selection from the manual card references.
2. Select up to eight sources, choose a role for each, write an instruction and select one aspect: lighting, camera or composition. The UI inserts the source-ID/role mapping; no UUID retyping is needed. It sends actual selected image bytes and text, the instruction and native target fingerprint. Source titles/locators, manual cards, corrections, previews and next-action text are excluded.
3. Choose **Request proposal**. The operation captures the exact saved revision. You can continue editing and saving manual work while the request runs; a result for different work is visibly historical.
4. Inspect the read-only generated proposal and its source references in **Engine request history**. The proposal is not inserted into manual cards, chosen for the study or applied to the scene. The request details retain instruction, exact revision/source hashes and configured/reported model identities. Source understanding and usefulness remain matters for review.
5. Use **Check requests** to recover saved status or a lost response. This performs reads only. If delivery is unconfirmed, **Retry same request** explicitly retries the original operation ID and frozen inputs, even if the form has newer edits. The durable claim prevents a second provider invocation for that ID. No retry occurs automatically.

Reopening reads existing history without inference, including failed and unknown operations. An unknown operation has no recorded final result and is never silently reinvoked. A fresh request is a separate deliberate operation. Request-form settings are recorded when a request is sent; unsent form edits remain in the current tab and participate in the leave/reload warning. Saving the manual study does not persist those unsent settings.

## Open it locally

Use the existing development environment and PSPT operator session. Set `DIRECTOR_STUDY_STORE_DIR` to a private absolute directory outside the repository's public files, then run `npm run dev`. In Director's inspector, choose **Open study**. The entry and service are enabled only in development with that directory explicitly configured. This feature is not enabled by a production build and has no hosted-store fallback.

1. Name the study and its external native target. Optionally choose the native file to retain its name and locally computed SHA256; its bytes are not uploaded.
2. Add source images or literal source text. Images are kept unchanged, with an authenticated private retrieval route. Adding evidence does not replace the scene backdrop.
3. Write observations, a proposed setup, what stays fixed, image checks and limits. Source references belong to each card.
4. Enter a correction and choose **Start revised card**. This retains the earlier card and the exact correction. Edit the new card in response. Editing a saved or chosen card also creates a new child; earlier wording is read-only.
5. Save, then reopen. A save is confirmed only after the client receives the exact submitted revision and independently reads it back. **Return to Director** closes the dialog and keeps the current in-memory study while preserving the editor.

**Use this card** records a choice within the study. It does not change the scene. To attach a preview, choose a card, identify the native target and supply the actual image plus settings. These are operator-supplied claims: the service checks their references and exact asset bytes, not whether a render happened or improved the work. Removing a preview link from the current draft preserves saved historical revisions.

## Recovery behavior

An explicit `/director?study=study_<uuid>&revision=rev_<uuid>` address stays tied to that saved revision after opening and reloading. A successful save from that view advances the address to the newly confirmed revision; unsaved edits or a rejected save do not. An ordinary study address without `revision`, the saved-study **Open** action, and a newly saved study or copy keep their current-head behavior. These local links still require the owning operator session and the same configured store.

Changes made while a save is in flight remain an unsaved draft after the submitted snapshot is confirmed. A lost receipt keeps the same request for **Retry save**, even if newer edits exist. A stale revision reports a conflict and leaves the draft intact; **Save a copy** gives that draft a separate study. Loading another saved study temporarily prevents editing the body, so the response cannot replace freshly typed work unnoticed.

Saved sources, cards and corrections retain their identities. Unsaved changes live in page memory; closing the dialog preserves them, but reloading requires an explicit save. The browser warns when leaving unsaved work. A preview's absence is distinct from a referenced image whose bytes are missing or damaged: the latter fails receiving instead of being reported as successfully reopened media.

The store can be copied as an intact folder and reopened with the same operator identity. Native files remain external. No export/import manager, cleanup service, automatic scene application or native renderer is included. The optional MTR0 adapter and operation history are separate from this manual-study format. This version keeps at most 512 revisions per operator, 24 evidence entries per study and 64 cards/corrections. Images are bounded to 8 MiB each. It is a small local store, not a high-volume service.

## Receiving and platform limits

The [backend contract](production-study-backend.md) documents validation, immutable records and filesystem requirements. Focused unit and actual HTTP tests cover retries, process restart, copied-store reopen, concurrent writers, ownership, changed/missing assets and disabled configuration. Browser receiving additionally exercises exact source uploads, manual corrections, save/reopen, in-flight edits, lost receipts, stale saves, desktop/phone controls and preservation of the existing editor.

The current implementation has been exercised in the Cloud Linux workspace with Chromium, including 390px touch emulation and an unavailable scene asset. That is not a Windows or physical-phone result. The storage filesystem must support atomic same-directory hard links; Windows installation, actual filesystem behavior and Engine Room transfer still need receiving on the target machine. No inference or new production render is established by these persistence checks.

The connected request interface is received with synthetic loopback providers, including exact source selection, pending/newer work, lost receipts, history reload and rejected output. The integration contract records the API and persistence receiving boundaries; real-model usefulness and HYV0 receiving require separate observation.

The focused address regression is `node tools/mtr0-operator/test_study_revision_links.mjs`, using an installed Playwright/Chromium runtime. `PLAYWRIGHT_MODULE` and `BROWSER_PATH` can select existing installations. It starts its own disposable study fixture, checks a historical address after a later save, ordinary head opening, confirmed and rejected saves, and copying. It uses synthetic sessions and asserts zero provider calls. It does not use the working study or its credentials.
