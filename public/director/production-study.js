(() => {
  'use strict';
  const host = document.getElementById('production-study-host');
  const entry = document.getElementById('open-production-study');
  if (!host || !entry) return;
  host.innerHTML = `
  <dialog id="production-study" aria-labelledby="ps-heading">
    <header class="ps-head"><div><h2 id="ps-heading">Production study</h2><p class="ps-subtitle">MTR0 · evidence, engine proposals and manual cards</p></div><button id="ps-save" class="primary" type="button">Save study</button><button id="ps-close" type="button">Return to Director</button></header>
    <div class="ps-library"><label>Saved studies<select id="ps-studies"><option value="">Choose a study</option></select></label><button id="ps-open" type="button">Open</button><button id="ps-refresh" type="button">Refresh</button><button id="ps-new" type="button">New study</button><button id="ps-copy" type="button">Save a copy</button></div>
    <div class="ps-body">
      <aside class="ps-sources" aria-label="Study target and sources">
        <h3>Work and evidence</h3>
        <label>Study name<input id="ps-title" maxlength="120"></label>
        <label>Native target name<input id="ps-target-name" maxlength="240"></label>
        <details><summary>Target file identity</summary><label>Choose the native file<input id="ps-target-file" type="file"></label><p class="ps-note">Only its name and fingerprint are retained. The native file is not uploaded or changed.</p><label>SHA256, if known<input id="ps-target-hash" class="ps-native-hash" maxlength="64" spellcheck="false"></label></details>
        <div class="ps-section"><h3>Add evidence</h3><label>Source title<input id="ps-source-title" maxlength="160" placeholder="Very Still Life"></label><label>Source reference<input id="ps-source-ref" maxlength="1000" placeholder="Artwork edition, file or URL"></label>
        <label>Image evidence<input id="ps-source-file" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="ps-note">PNG, JPEG or WebP, up to 8 MiB. Exact image bytes are kept separately from the scene.</p>
        <details><summary>Add source text</summary><label>Text or author direction<textarea id="ps-source-text" rows="4" maxlength="12000"></textarea></label><button id="ps-add-text" type="button">Add text</button></details></div>
        <div id="ps-evidence" aria-label="Retained evidence"></div>
      </aside>
      <section class="ps-work" aria-label="Cards and continuation">
        <section class="ps-engine" aria-labelledby="ps-engine-heading">
          <h3 id="ps-engine-heading">Ask MTR0</h3>
          <p id="ps-engine-config" class="ps-note">Checking the local engine configuration…</p>
          <details id="ps-engine-compose"><summary>Prepare a request</summary>
            <p class="ps-note">Choose the evidence and tell the engine how to use it. Only selected evidence, your instruction and the native target fingerprint are sent. Manual cards and the separate preview attachment are excluded.</p>
            <div id="ps-engine-sources" aria-label="Evidence for the engine"></div>
            <label>Study one aspect<select id="ps-engine-domain"><option value="lighting">Lighting</option><option value="camera">Camera</option><option value="composition">Composition</option></select></label>
            <label>Instruction<textarea id="ps-engine-instruction" rows="3" maxlength="3000" placeholder="Propose one lighting change. Hold the camera and materials fixed."></textarea></label>
            <p id="ps-engine-ready" class="ps-note"></p>
            <div class="ps-row"><button id="ps-engine-send" class="primary" type="button" disabled>Request proposal</button><button id="ps-step-select" type="button" hidden disabled>Save as step</button></div>
          </details>
          <section id="ps-continuation" class="ps-section" aria-labelledby="ps-step-heading" hidden>
            <h4 id="ps-step-heading">Saved steps</h4>
            <p id="ps-step-status" class="ps-note" role="status" aria-live="polite"></p>
            <div id="ps-step-detail"></div>
            <div class="ps-row"><button id="ps-step-check" type="button">Check saved step</button><button id="ps-step-resume" type="button" disabled>Run saved step</button><button id="ps-step-use" type="button" disabled>Use result in next instruction</button><button id="ps-step-retry" type="button" hidden>Retry same selection</button></div>
            <p class="ps-note">Saving a step keeps its exact inputs without calling the engine. Running it is a separate action. Manual cards and scene acceptance remain separate.</p>
          </section>
          <section id="ps-step-recovery" class="ps-section" aria-label="Requested study recovery" hidden>
            <h4>Requested study recovery</h4>
            <p id="ps-recovery-status" class="ps-note" role="status"></p>
            <div id="ps-recovery-result"></div>
            <div class="ps-row"><button id="ps-recovery-check" type="button">Check recovery</button><button id="ps-recovery-close" type="button">Close recovery view</button></div>
          </section>
          <div class="ps-row"><label>Engine request history<select id="ps-engine-history"><option value="">No requests yet</option></select></label><button id="ps-engine-refresh" type="button">Check requests</button></div>
          <p id="ps-engine-status" class="ps-note" role="status" aria-live="polite">Opening a study does not make a model request.</p>
          <div id="ps-engine-result" aria-label="Engine proposal"></div>
        </section>
        <div class="ps-section">
        <h3>Production card</h3><label>Card history<select id="ps-cards"></select></label><p id="ps-card-state" class="ps-note"></p>
        <div id="ps-card-fields">
          <label>Observations<textarea id="ps-observations" rows="3" maxlength="8000"></textarea></label>
          <label>Proposed setup<textarea id="ps-proposal" rows="3" maxlength="8000"></textarea></label>
          <label>Keep fixed<textarea id="ps-keepFixed" rows="3" maxlength="8000"></textarea></label>
          <label>Check the image<textarea id="ps-imageCheck" rows="3" maxlength="8000"></textarea></label>
          <label>Limits and unassessed details<textarea id="ps-limits" rows="2" maxlength="8000"></textarea></label>
        </div>
        <details><summary>Card source references</summary><div id="ps-card-sources"></div></details>
        <div class="ps-row"><button id="ps-use-card" type="button">Use this card</button></div><p class="ps-note">Records the card chosen for this study. It does not apply changes to the scene.</p>
        <div class="ps-section"><h3>Correction</h3><label>New direction<textarea id="ps-correction" rows="2" maxlength="8000" placeholder="Keep the exact camera. Use lighting only."></textarea></label><button id="ps-revise" type="button">Start revised card</button><p class="ps-note">Keeps the earlier wording. Edit the new card to respond to this correction.</p><div id="ps-corrections"></div></div>
        <div class="ps-section"><h3>Native preview</h3><div id="ps-preview"></div>
          <details><summary>Attach an actual preview</summary><p class="ps-note">Choose a card and identify the native target first. Attach an image you made and its actual settings.</p><label>Actual settings and held-state notes<textarea id="ps-preview-settings" rows="3" maxlength="12000"></textarea></label><label>Preview image<input id="ps-preview-file" type="file" accept="image/png,image/jpeg,image/webp"></label></details>
        </div>
        <div class="ps-section"><label>Next action<textarea id="ps-next" rows="2" maxlength="4000" placeholder="Choose a fill value; the preview is still unmade."></textarea></label><p class="ps-note">Manual cards remain your authored work. Engine proposals are kept in their own history. Reopening makes no model request.</p></div>
        </div>
      </section>
    </div>
    <div class="ps-status"><p id="ps-status" role="status" aria-live="polite">Ready for a local study.</p><span id="ps-save-state">Unsaved draft</span></div>
  </dialog>`;
  const $ = (id) => host.querySelector(`#${id}`);
  const dialog = $('production-study');
  const clone = (value) => structuredClone(value);
  const uid = (prefix) => `${prefix}_${crypto.randomUUID()}`;
  const canonical = (value) => JSON.stringify(value, function (_, item) {
    return item && !Array.isArray(item) && typeof item === 'object'
      ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
  });
  const fields = ['observations', 'proposal', 'keepFixed', 'imageCheck', 'limits'];
  const newCard = () => ({ id: uid('card'), parentId: null, origin: 'operator', observations: '', proposal: '', keepFixed: '', imageCheck: '', limits: '', sourceIds: [] });
  function newStudy() {
    const card = newCard();
    return { schema: 'nest-production-study/v1', title: 'Untitled study', target: { kind: 'external-native', name: 'Untitled native target', sha256: null }, evidence: [], cards: [card], corrections: [], selectedCardId: card.id, acceptedCardId: null, preview: null, nextAction: '' };
  }
  let study = newStudy(), studyId = uid('study'), baseRevisionId = null, viewCardId = study.selectedCardId;
  let dirty = true, saving = false, busy = 0, pending = null, targetTurn = 0, loading = false;
  let draftBaseline = canonical(study);
  let frozen = new Set(), listTurn = 0;
  const assetUrl = (asset) => `/api/director-study?asset=${encodeURIComponent(asset.sha256)}`;
  const currentCard = () => study.cards.find(card => card.id === study.selectedCardId);
  const viewedCard = () => study.cards.find(card => card.id === viewCardId);
  function status(message, error = false) { $('ps-status').textContent = message; $('ps-status').dataset.error = String(error); }
  function controls() {
    host.querySelector('.ps-body').inert = loading;
    $('ps-save').disabled = saving || busy > 0;
    $('ps-save').textContent = saving ? 'Saving…' : pending ? 'Retry save' : 'Save study';
    for (const id of ['ps-new', 'ps-open', 'ps-copy']) $(id).disabled = saving || busy > 0;
    $('ps-save-state').textContent = saving ? 'Confirming save' : dirty ? 'Unsaved changes' : 'Saved locally';
    engineControls();
  }
  function changed() { dirty = true; controls(); }
  async function api(query = '', data) {
    const response = await fetch(`/api/director-study${query}`, { credentials: 'same-origin', cache: 'no-store', ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
    let body;
    try { body = await response.json(); } catch { throw new Error('The local study service did not return a readable receipt.'); }
    if (!response.ok || !body.ok) { const error = new Error(body.error || 'The study operation was not confirmed.'); error.status = response.status; throw error; }
    return body;
  }
  let engineConfig = null, engineConfigError = '', engineStudyId = null, engineTurn = 0;
  let engineHistory = [], engineSelected = '', engineDetail = null, engineDetailTurn = 0, engineSending = false, engineReading = false;
  let engineUnconfirmed = null;
  let engineRoles = new Map(), engineSelection = new Set(), engineDraftDirty = false, engineDraftVersion = 0;
  let stepSupported = false, stepState = 'unread', stepView = null, stepReceipt = null;
  let stepWorking = false, stepReading = false, stepTurn = 0, stepContext = 0, stepMessage = '', stepDraftFrom = null;
  let stepIntent = null, stepJournalError = '';
  let recovery = null, recoveryTurn = 0;
  const stepOwner = host.dataset.owner;
  const stepKey = () => `nest-mtr0-selection/v1:${encodeURIComponent(stepOwner || '')}:${studyId}`;
  // Only the pending selection is journaled in this tab. The server owns the
  // retained program. Load it only after an owned study has been opened.
  function loadStepIntent() {
    stepIntent = null; stepJournalError = '';
    try {
      if (!stepOwner) throw new Error('The signed-in owner is unavailable.');
      const raw = sessionStorage.getItem(stepKey());
      if (!raw) return;
      const item = JSON.parse(raw);
      if (raw.length > 40000 || item.owner !== stepOwner || item.selection?.action !== 'select' ||
          item.selection.input?.studyId !== studyId || !/^op_[a-f0-9-]{36}$/.test(item.selection.input.operationId || '')) {
        throw new Error('The pending selection cannot be verified.');
      }
      stepIntent = item;
    } catch {
      stepJournalError = 'This tab cannot read its pending selection. New selection is unavailable; check the saved step without sending again.';
    }
  }
  function keepStepIntent(item) {
    sessionStorage.setItem(stepKey(), JSON.stringify(item));
    stepIntent = item;
  }
  function clearStepIntent() {
    stepIntent = null; stepJournalError = '';
    try { sessionStorage.removeItem(stepKey()); } catch {
      // The durable receipt remains authoritative even if local cleanup fails.
      stepJournalError = 'Selection is confirmed, but this tab could not clear its local retry record. Checking again is safe.';
    }
  }
  function checkStepView(value, id, expectedSelection = null) {
    const input = value?.continuation?.selection?.input;
    if (!value.ok || input?.studyId !== id ||
        (value.operation && (value.operation.id !== input.operationId || value.operation.studyId !== id || value.operation.revisionId !== input.revisionId)) ||
        (expectedSelection && canonical(value.continuation.selection) !== canonical(expectedSelection))) {
      throw new Error('The saved-step receipt differs from the selected work. Check the original selection.');
    }
    return value;
  }
  function stepInputReason() {
    if (!baseRevisionId || dirty || saving || pending || loading || busy) return 'Save and confirm the current study first.';
    if (!engineSelection.size || engineSelection.size > 8) return 'Select one to eight evidence sources.';
    if ([...engineSelection].some(id => !engineRoles.get(id))) return 'Choose a role for each selected source.';
    if (!$('ps-engine-instruction').value.trim()) return 'Write the instruction for this step.';
    return '';
  }
  function renderRecovery() {
    $('ps-step-recovery').hidden = !recovery;
    if (!recovery) return;
    $('ps-recovery-status').textContent = `Full study load failed: ${recovery.failure} The editable work remains "${study.title}". This separate, read-only recovery belongs to requested study ${recovery.id}.`;
    const container = $('ps-recovery-result'); container.replaceChildren();
    if (recovery.reading) addNode(container, 'p', 'Reading its retained step without dispatching.', 'ps-note');
    if (recovery.error) addNode(container, 'p', recovery.error, 'ps-error');
    if (recovery.view) {
      const step = recovery.view.continuation, outcome = recovery.view.operation?.outcome;
      addNode(container, 'p', `Retained step · ${step.status} · current study observation ${recovery.view.studyHead?.status || 'unavailable'}`, 'ps-note');
      addNode(container, 'code', `Requested study: ${recovery.id}\nSelected: ${step.selection.input.operationId}\nCurrent head: ${step.currentOperationId}`);
      addNode(container, 'p', step.selection.input.instruction, 'ps-step-instruction');
      if (outcome?.status === 'completed') addNode(container, 'p', outcome.card.proposal.text, 'ps-step-proposal');
      else if (outcome) addNode(container, 'p', outcome.message, 'ps-note');
      addNode(container, 'p', 'This recovered result does not load the study, replace the editable work or authorize a new request.', 'ps-note');
    }
    $('ps-recovery-check').disabled = recovery.reading;
  }
  async function recoverStudy(id, failure) {
    const turn = ++recoveryTurn;
    recovery = { id, failure, view: recovery?.id === id ? recovery.view : null, reading: true, error: '' };
    renderRecovery();
    try {
      const status = await engineApi();
      if (status.continuationCapability !== 'mtr0-continuation/v1') throw new Error('The connected server does not offer saved-step recovery.');
      const result = checkStepView(await engineApi(`?continuationStudyId=${encodeURIComponent(id)}`), id);
      if (turn !== recoveryTurn) return;
      recovery.view = result;
    } catch (error) { if (turn === recoveryTurn) recovery.error = error.message; }
    finally { if (turn === recoveryTurn) { recovery.reading = false; renderRecovery(); } }
  }
  function renderStep() {
    $('ps-continuation').hidden = !stepSupported;
    $('ps-step-select').hidden = !stepSupported;
    if (!stepSupported) return;
    const current = stepView?.continuation;
    const isHead = current && current.selection.input.operationId === current.currentOperationId;
    const head = stepView?.studyHead;
    let message = stepMessage;
    if (stepWorking) message = 'Confirming the original saved-step action…';
    else if (stepReading) message = 'Reading the retained step. No engine call is being made.';
    else if (stepJournalError) message = stepJournalError;
    else if (stepIntent) message = 'Selection delivery is unconfirmed. Check the saved step or retry the exact original selection; a new identity will not be created.';
    else if (stepMessage) message = stepMessage;
    else if (stepState === 'absent') message = 'No step has been selected for this study. Prepare an instruction and save it as a step.';
    else if (stepState !== 'known') message = 'The current saved step is not confirmed. Check it before selecting or running work.';
    else if (!isHead) message = 'This is an earlier selection receipt. Check the current saved step before continuing.';
    else if (current.next === 'dispatch') message = head?.selectedRevisionCurrent === false
      ? 'The unrun step belongs to an older saved revision. It cannot run. This version has no abandon or rebase action.'
      : head?.status !== 'available' ? 'The saved inputs are retained, but current source availability is unknown. Check again before running.'
      : 'Selected and retained. Run this saved step when ready.';
    else if (current.next === 'select-next') message = 'Completed result retained. Use its proposal in your next instruction, then save the next step.';
    else if (current.next === 'inspect-failure') message = 'This step has a retained failure. Inspect it; a dependent next step is unavailable.';
    else message = 'The outcome is unresolved. Checking preserves the original identity and does not send another request.';
    $('ps-step-status').textContent = message;
    const container = $('ps-step-detail'); container.replaceChildren();
    if (current) {
      addNode(container, 'p', `Saved step · ${current.status}`, 'ps-note');
      if (head?.status !== 'available') addNode(container, 'p', 'Current study observation unavailable. This does not change the retained result.', 'ps-note ps-engine-historical');
      else if (!head.selectedRevisionCurrent) addNode(container, 'p', 'The saved study has changed since this step was selected.', 'ps-note ps-engine-historical');
      const details = addNode(container, 'details');
      addNode(details, 'summary', 'Selected instruction and identity');
      addNode(details, 'p', current.selection.input.instruction, 'ps-step-instruction');
      addNode(details, 'code', `Selected: ${current.selection.input.operationId}\nCurrent head: ${current.currentOperationId}`);
      if (stepReceipt && stepReceipt.continuation.selection.input.operationId !== current.currentOperationId) {
        addNode(container, 'p', 'An earlier selection was confirmed. The current head shown here is a different step.', 'ps-note');
      }
      const outcome = stepView.operation?.outcome;
      if (outcome?.status === 'completed') {
        addNode(container, 'h4', 'Retained proposal');
        addNode(container, 'p', outcome.card.proposal.text, 'ps-step-proposal');
        addNode(container, 'p', 'Engine contribution · no manual card or scene change has been accepted.', 'ps-note');
      } else if (outcome) addNode(container, 'p', `${outcome.message}${outcome.uncertain ? ' Provider completion remains uncertain.' : ''}`, 'ps-error');
    }
    if (stepDraftFrom) addNode(container, 'p', 'The next instruction was prepared from this retained proposal. You can edit it before saving the next step.', 'ps-note');
    const waiting = stepWorking || stepReading || !stepSupported || Boolean(stepJournalError);
    const observed = stepState === 'known' && isHead;
    const successor = observed && current.next === 'select-next' &&
      head?.status === 'available' && head.revisionId === baseRevisionId &&
      stepDraftFrom?.operationId === current.currentOperationId && stepDraftFrom.resultHash === current.resultHash;
    $('ps-step-select').disabled = waiting || Boolean(stepIntent) || Boolean(stepInputReason()) ||
      !(stepState === 'absent' || successor);
    $('ps-step-select').textContent = current ? 'Save next step' : 'Save as first step';
    $('ps-step-check').disabled = stepWorking || stepReading || !baseRevisionId;
    $('ps-step-resume').disabled = waiting || Boolean(stepIntent) || !observed || current.next !== 'dispatch' ||
      head?.status !== 'available' || head.selectedRevisionCurrent !== true || !engineConfig?.configured ||
      dirty || saving || Boolean(pending) || loading || busy > 0;
    $('ps-step-use').disabled = waiting || Boolean(stepIntent) || !observed || current.next !== 'select-next' || stepView.operation?.outcome?.status !== 'completed';
    $('ps-step-retry').hidden = !stepIntent;
    $('ps-step-retry').disabled = stepWorking || stepReading || Boolean(stepJournalError);
  }
  async function readStep() {
    if (!stepSupported || !baseRevisionId) return;
    const id = studyId, turn = ++stepTurn;
    stepReading = true; renderStep();
    try {
      const result = checkStepView(await engineApi(`?continuationStudyId=${encodeURIComponent(id)}`), id);
      if (id !== studyId || turn !== stepTurn) return;
      stepView = result; stepState = 'known'; stepMessage = '';
      if (stepIntent && canonical(result.continuation.selection) === canonical(stepIntent.selection)) clearStepIntent();
    } catch (error) {
      if (id !== studyId || turn !== stepTurn) return;
      if (error.status === 404) { stepView = null; stepState = 'absent'; stepMessage = ''; }
      else { stepState = 'unavailable'; stepMessage = `${error.message} The last observed result, if any, is retained below.`; }
    } finally { if (id === studyId && turn === stepTurn) { stepReading = false; renderStep(); } }
  }
  async function selectStep(retry = false) {
    renderStep();
    if (retry ? $('ps-step-retry').disabled || !stepIntent : $('ps-step-select').disabled) return;
    const id = studyId, context = stepContext, version = engineDraftVersion;
    const sourceIds = study.evidence.filter(source => engineSelection.has(source.id)).map(source => source.id);
    const selection = retry ? clone(stepIntent.selection) : {
      action: 'select',
      input: { action: 'generate', operationId: uid('op'), studyId: id, revisionId: baseRevisionId,
        sourceIds, instruction: `Source roles:\n${sourceIds.map(sourceId => `${sourceId}: ${engineRoles.get(sourceId)}`).join('\n')}\n\nOperator instruction:\n${$('ps-engine-instruction').value.trim()}`,
        allowedDomains: [$('ps-engine-domain').value] },
      previousOperationId: stepView?.continuation.currentOperationId || null,
      previousResultHash: stepView?.continuation.resultHash || null,
    };
    if (selection.input.instruction.length > 4096) { stepMessage = 'Shorten the instruction and source roles before saving the step.'; renderStep(); return; }
    const earlierUncertainty = retry && stepIntent.uncertain;
    try {
      if (!retry) keepStepIntent({ owner: stepOwner, selection, uncertain: true });
    } catch { stepJournalError = 'This tab cannot retain an original selection for recovery. Nothing was sent.'; renderStep(); return; }
    stepWorking = true; renderStep();
    try {
      const result = checkStepView(await engineApi('', selection), id, selection);
      if (studyId !== id || context !== stepContext) return;
      stepReceipt = result; stepView = result; stepState = 'known'; stepMessage = '';
      clearStepIntent(); stepDraftFrom = null;
      // A retry confirms an older selection, not the newer composer draft.
      if (!retry && engineDraftVersion === version) engineDraftDirty = false;
      await readStep(); // A recovered old receipt is not substituted for the current head.
    } catch (error) {
      if (studyId !== id || context !== stepContext) return;
      if (error.status && error.status < 500 && !earlierUncertainty) clearStepIntent();
      else if (stepIntent) {
        stepIntent.uncertain = true;
        try { keepStepIntent(stepIntent); } catch { /* The original initial journal is retained. */ }
      }
      stepMessage = error.message; stepState = 'unavailable';
    } finally { stepWorking = false; renderStep(); }
  }
  async function resumeStep() {
    renderStep(); if ($('ps-step-resume').disabled) return;
    const id = studyId, context = stepContext, operationId = stepView.continuation.currentOperationId;
    stepWorking = true; renderStep();
    try {
      const result = checkStepView(await engineApi('', { action: 'resume', studyId: id, operationId }), id);
      if (result.continuation.selection.input.operationId !== operationId) throw new Error('Resume returned a different step.');
      if (studyId !== id || context !== stepContext) return;
      stepView = result; stepState = 'known'; stepMessage = '';
      // Keep this durable result visible independently of later history reads.
      engineSelected = operationId; engineDetail = result.operation; renderEngineResult();
    } catch (error) {
      if (studyId !== id || context !== stepContext) return;
      stepState = 'unavailable'; stepMessage = `${error.message} Check the saved step under its original identity. No replacement request was made.`;
    } finally { stepWorking = false; renderStep(); }
  }
  function useStepResult() {
    renderStep(); if ($('ps-step-use').disabled) return;
    const current = stepView.continuation, input = $('ps-engine-instruction');
    const prepared = `Retained proposal from ${current.currentOperationId}:\n${stepView.operation.outcome.card.proposal.text}\n\nNext direction:\n${input.value}`;
    if (prepared.length > input.maxLength) { stepMessage = 'Make room in the instruction before including the retained proposal. Your text is unchanged.'; $('ps-step-status').textContent = stepMessage; return; }
    input.value = prepared;
    stepDraftFrom = { operationId: current.currentOperationId, resultHash: current.resultHash };
    engineDraftDirty = true; engineDraftVersion++;
    $('ps-engine-compose').open = true; input.focus(); engineControls();
  }
  function engineStatus(message, error = false) {
    $('ps-engine-status').textContent = message; $('ps-engine-status').dataset.error = String(error);
  }
  async function engineApi(query = '', data) {
    const response = await fetch(`/api/director-engine${query}`, { credentials: 'same-origin', cache: 'no-store', ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
    let body;
    try { body = await response.json(); } catch { throw new Error('The engine request has no readable receipt. Check requests before trying again.'); }
    if (!response.ok || !body.ok) { const error = new Error(body.error || 'The engine operation was not confirmed.'); error.status = response.status; throw error; }
    return body;
  }
  function engineControls() {
    if (!engineConfig) $('ps-engine-config').textContent = engineConfigError || 'Checking the local engine configuration…';
    else $('ps-engine-config').textContent = engineConfig.configured
      ? `${engineConfig.serviceId} · ${engineConfig.model}${engineConfig.declaredImageInput ? ' · image input enabled' : ' · text input only'}`
      : 'No engine is configured on this local server. Saved request history remains available.';
    let reason = '';
    if (engineSending) reason = 'Request in progress. You can keep working; its result stays tied to the submitted revision.';
    else if (engineUnconfirmed?.studyId === studyId) reason = ''; // An explicit retry retains the original operation ID and input.
    else if (!engineConfig?.configured) reason = 'A configured engine is needed to request a proposal.';
    else if (!baseRevisionId || dirty || saving || pending || loading || busy) reason = 'Save and confirm the current study before requesting a proposal.';
    else if (!engineSelection.size) reason = 'Select the evidence to send.';
    else if (engineSelection.size > 8) reason = 'Select up to eight sources for one request.';
    else if ([...engineSelection].some(id => !engineRoles.get(id))) reason = 'Choose a role for each selected source.';
    else if (!engineConfig.declaredImageInput && study.evidence.some(source => engineSelection.has(source.id) && source.kind === 'image')) reason = 'This engine accepts text only. Deselect image evidence or change the server configuration.';
    else if (!$('ps-engine-instruction').value.trim()) reason = 'Write an instruction for this proposal.';
    $('ps-engine-ready').textContent = reason || (engineUnconfirmed?.studyId === studyId ? 'Delivery is unconfirmed. Check requests, or retry the same request with its original saved inputs.' : 'The request settings and returned proposal will be kept in separate engine history.');
    $('ps-engine-send').disabled = Boolean(reason);
    $('ps-engine-send').textContent = engineSending ? 'Requesting…' : engineUnconfirmed?.studyId === studyId ? 'Retry same request' : 'Request proposal';
    $('ps-engine-refresh').disabled = engineReading || !baseRevisionId;
    renderEngineResult();
    renderStep();
    renderRecovery();
  }
  function renderEngineSources() {
    const container = $('ps-engine-sources'); container.replaceChildren();
    const known = new Set(study.evidence.map(s => s.id));
    engineSelection = new Set([...engineSelection].filter(id => known.has(id)));
    const roles = ['Art reference', 'Historical render', 'Current preview', 'Construction evidence', 'Author direction', 'Other reference'];
    for (const source of study.evidence) {
      const row = addNode(container, 'div', undefined, 'ps-engine-source'); row.dataset.sourceId = source.id;
      const label = addNode(row, 'label', undefined, 'ps-source-check');
      const checkbox = addNode(label, 'input'); checkbox.type = 'checkbox'; checkbox.checked = engineSelection.has(source.id);
      checkbox.disabled = source.kind === 'image' && !source.asset;
      addNode(label, 'span', `${source.title}${checkbox.disabled ? ' · image bytes missing' : ''}`);
      const roleLabel = addNode(row, 'label', 'Use this source as');
      const select = addNode(roleLabel, 'select'); select.replaceChildren(new Option('Choose a role', ''), ...roles.map(role => new Option(role, role)));
      select.value = engineRoles.get(source.id) || ''; select.disabled = !checkbox.checked;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) engineSelection.add(source.id); else engineSelection.delete(source.id);
        select.disabled = !checkbox.checked; engineDraftDirty = true; engineDraftVersion++; engineControls();
      });
      select.addEventListener('change', () => { engineRoles.set(source.id, select.value); engineDraftDirty = true; engineDraftVersion++; engineControls(); });
    }
    if (!study.evidence.length) addNode(container, 'p', 'Add and save evidence first.', 'ps-empty');
  }
  function renderEngineHistory() {
    const select = $('ps-engine-history');
    select.replaceChildren(new Option(engineHistory.length ? 'Choose a request' : 'No requests yet', ''), ...engineHistory.map((operation, index) => new Option(`Request ${engineHistory.length - index} · ${operation.status}`, operation.id)));
    select.value = engineSelected;
    renderEngineResult();
  }
  function renderEngineResult() {
    const container = $('ps-engine-result'); container.replaceChildren();
    const operation = engineDetail?.id === engineSelected ? engineDetail : null;
    if (!operation) return;
    const item = addNode(container, 'article', undefined, 'ps-engine-card');
    const same = operation.revisionId === baseRevisionId && !dirty;
    addNode(item, 'p', same ? 'For the saved revision open here.' : 'Historical request: your open work differs from the submitted revision.', same ? 'ps-note' : 'ps-note ps-engine-historical');
    addNode(item, 'p', 'Engine output · read only · not an accepted manual card.', 'ps-note');
    const result = { request: operation.request, outcome: operation.outcome };
    if (operation.status === 'pending') addNode(item, 'p', 'This request is running. No final result has been saved yet. Check requests to read its status; checking does not send again.', 'ps-note');
    else if (operation.status === 'unknown') addNode(item, 'p', 'Provider completion is unknown, and no final result has been saved. Check requests to read the stored status; checking does not send again. A new request is a separate call.', 'ps-note ps-engine-historical');
    else if (result?.outcome?.status !== 'completed') addNode(item, 'p', `${result?.outcome?.message || 'This request did not produce a valid proposal.'}${result?.outcome?.uncertain ? ' Provider completion is uncertain.' : ''}`, 'ps-error');
    else {
      const card = result.outcome.card;
      const citation = sourceIds => sourceIds.map(id => study.evidence.find(source => source.id === id)?.title || id).join(', ');
      addNode(item, 'h4', 'Observations');
      const observations = addNode(item, 'ul');
      for (const observation of card.observations) { const li = addNode(observations, 'li', observation.text); addNode(li, 'p', `Sources: ${citation(observation.sourceIds)}`, 'ps-note'); }
      addNode(item, 'h4', `Proposal · ${card.proposal.domain}`); addNode(item, 'p', card.proposal.text); addNode(item, 'p', `Sources: ${citation(card.proposal.sourceIds)}`, 'ps-note');
      addNode(item, 'h4', 'Keep fixed'); const fixed = addNode(item, 'ul'); card.keepFixed.forEach(text => addNode(fixed, 'li', text));
      addNode(item, 'h4', 'Check the image'); addNode(item, 'p', card.imageCheck.text); addNode(item, 'p', `Sources: ${citation(card.imageCheck.sourceIds)}`, 'ps-note');
      addNode(item, 'h4', 'Limits'); const limits = addNode(item, 'ul'); card.limits.forEach(text => addNode(limits, 'li', text));
      addNode(item, 'p', 'Structure and source references were checked. Source understanding and usefulness still need your judgment.', 'ps-note');
    }
    const details = addNode(item, 'details'); addNode(details, 'summary', 'Request and source identity');
    addNode(details, 'p', operation.request?.instruction || '', 'ps-note');
    addNode(details, 'code', `Request: ${operation.id}\nRevision: ${operation.revisionId}`);
    if (result?.request) {
      addNode(details, 'p', `Configured model: ${result.request.provider.model}${result.outcome?.providerReportedModel ? ` · reported model: ${result.outcome.providerReportedModel}` : ''}`, 'ps-note');
      for (const source of result.request.sources) addNode(details, 'code', `${source.id}\n${source.sha256}\n`);
    }
  }
  async function selectEngineOperation(operationId) {
    const turn = ++engineDetailTurn, id = studyId;
    engineSelected = operationId; engineDetail = null; renderEngineResult();
    if (!operationId) return true;
    try {
      const result = await engineApi(`?operationId=${encodeURIComponent(operationId)}`);
      if (turn !== engineDetailTurn || id !== studyId || engineSelected !== operationId) return;
      if (result.operation.studyId !== id || result.operation.id !== operationId) throw new Error('The request receipt does not match this study.');
      engineDetail = result.operation; renderEngineResult(); return true;
    } catch (error) { if (turn === engineDetailTurn && id === studyId) engineStatus(error.message, true); return false; }
  }
  async function refreshEngine() {
    const turn = ++engineTurn, id = studyId, revision = baseRevisionId;
    engineReading = true; engineControls();
    try {
      const config = await engineApi();
      if (turn !== engineTurn || id !== studyId) return;
      engineConfig = config.configuration; engineConfigError = '';
      stepSupported = config.continuationCapability === 'mtr0-continuation/v1';
      renderStep();
      if (stepSupported && revision) await readStep();
      if (turn !== engineTurn || id !== studyId) return;
      if (revision) {
        const result = await engineApi(`?studyId=${encodeURIComponent(id)}`);
        if (turn !== engineTurn || id !== studyId) return;
        engineHistory = result.operations;
        if (engineUnconfirmed?.studyId === id) {
          const recovered = engineHistory.find(item => item.id === engineUnconfirmed.operationId);
          if (recovered) { engineSelected = recovered.id; engineUnconfirmed = null; }
        }
        if (!engineHistory.some(item => item.id === engineSelected)) engineSelected = engineHistory[0]?.id || '';
        renderEngineHistory(); if (!await selectEngineOperation(engineSelected)) return;
        if (turn !== engineTurn || id !== studyId) return;
      }
      engineStatus(engineUnconfirmed?.studyId === id
        ? 'The last request is not yet in saved history. Delivery remains unconfirmed. Check again, or explicitly retry the same request.'
        : 'History refreshed. This check did not send a model request.');
    } catch (error) { if (turn === engineTurn && id === studyId) { engineConfigError = error.message; engineStatus(error.message, true); } }
    finally { if (turn === engineTurn) { engineReading = false; engineControls(); } }
  }
  function engineStudyChanged() {
    if (engineStudyId !== studyId) {
      engineStudyId = studyId; engineTurn++; engineReading = false; engineDetailTurn++; engineHistory = []; engineSelected = ''; engineDetail = null;
      engineSelection = new Set(); engineRoles = new Map(); engineDraftDirty = false;
      stepContext++; stepTurn++; stepReading = false; stepState = 'unread'; stepView = null; stepReceipt = null; stepMessage = ''; stepDraftFrom = null;
      loadStepIntent();
      $('ps-engine-instruction').value = ''; $('ps-engine-domain').value = 'lighting';
      renderEngineHistory();
    }
    renderEngineSources(); engineControls();
  }
  async function requestEngine() {
    engineControls(); if ($('ps-engine-send').disabled) return;
    const id = studyId, revisionId = baseRevisionId, draftVersion = engineDraftVersion;
    const sourceIds = study.evidence.filter(source => engineSelection.has(source.id)).map(source => source.id);
    const instruction = `Source roles:\n${sourceIds.map(sourceId => `${sourceId}: ${engineRoles.get(sourceId)}`).join('\n')}\n\nOperator instruction:\n${$('ps-engine-instruction').value.trim()}`;
    if (instruction.length > 4096) { engineStatus('The instruction and source roles are too long. Shorten the instruction.', true); return; }
    const retry = engineUnconfirmed?.studyId === id ? engineUnconfirmed : null;
    const input = retry?.input || { action: 'generate', operationId: uid('op'), studyId: id, revisionId, sourceIds, instruction, allowedDomains: [$('ps-engine-domain').value] };
    const submittedDraftVersion = retry?.draftVersion ?? draftVersion;
    engineSending = true; engineControls(); engineStatus('Sending one request from this saved revision…');
    try {
      const response = await engineApi('', input);
      if (response.operation?.id !== input.operationId || response.operation.studyId !== input.studyId || response.operation.revisionId !== input.revisionId) throw new Error('The operation receipt differs from the submitted request.');
      if (engineUnconfirmed?.operationId === input.operationId) engineUnconfirmed = null;
      if (studyId !== id) return;
      if (engineDraftVersion === submittedDraftVersion) engineDraftDirty = false;
      engineSelected = response.operation.id;
      engineStatus('Request recorded. Reading its stored result…');
      await refreshEngine();
    } catch (error) {
      if (studyId !== id) return;
      if (!error.status || error.status >= 500) engineUnconfirmed = { studyId: id, operationId: input.operationId, input, draftVersion: submittedDraftVersion };
      else if ([400, 409, 413, 415].includes(error.status) && engineUnconfirmed?.operationId === input.operationId) engineUnconfirmed = null;
      engineStatus(`${error.message} Check requests to recover the recorded result.`, true);
    } finally { engineSending = false; engineControls(); }
  }

  function addNode(parent, tag, text, className) {
    const node = document.createElement(tag); if (text !== undefined) node.textContent = text;
    if (className) node.className = className; parent.append(node); return node;
  }
  function renderCardMenu() {
    $('ps-cards').replaceChildren(...study.cards.map((card, index) => new Option(`Card ${index + 1}${card.id === study.selectedCardId ? ' · current draft' : ' · earlier'}${card.id === study.acceptedCardId ? ' · chosen' : ''}`, card.id)));
    $('ps-cards').value = viewCardId || '';
    const editable = !viewedCard() || viewCardId === study.selectedCardId;
    $('ps-card-state').textContent = !viewedCard() ? 'No card yet. Write in any card field to begin.' : editable ? 'Manually authored draft. Editing a saved or chosen card keeps the earlier version.' : 'Earlier wording · read only. Start a revision here or select the current draft.';
    for (const field of fields) $(`ps-${field}`).disabled = !editable;
    $('ps-use-card').disabled = !viewedCard() || viewCardId !== study.selectedCardId || study.acceptedCardId === viewCardId;
  }
  function editableCard() {
    let card = currentCard();
    if (!card) { card = newCard(); study.cards.push(card); study.selectedCardId = card.id; viewCardId = card.id; renderCardMenu(); }
    if (frozen.has(card.id) || card.id === study.acceptedCardId) {
      const child = { ...clone(card), id: uid('card'), parentId: card.id };
      study.cards.push(child); study.selectedCardId = child.id; viewCardId = child.id; card = child; renderCardMenu();
    }
    return card;
  }
  function renderSources() {
    const refs = $('ps-card-sources'); refs.replaceChildren();
    for (const source of study.evidence) {
      const label = addNode(refs, 'label', undefined, 'ps-source-check');
      const input = addNode(label, 'input'); input.type = 'checkbox'; input.checked = viewedCard()?.sourceIds.includes(source.id) || false;
      input.disabled = viewCardId !== study.selectedCardId;
      addNode(label, 'span', source.title);
      input.addEventListener('change', () => { const card = editableCard(); card.sourceIds = input.checked ? [...new Set([...card.sourceIds, source.id])] : card.sourceIds.filter(id => id !== source.id); changed(); renderSources(); });
    }
    if (!study.evidence.length) addNode(refs, 'p', 'No evidence attached yet.', 'ps-note');
  }
  function renderEvidence() {
    const container = $('ps-evidence'); container.replaceChildren();
    if (!study.evidence.length) addNode(container, 'p', 'No evidence attached yet. You can save this unfinished draft.', 'ps-empty');
    for (const source of study.evidence) {
      const item = addNode(container, 'article', undefined, 'ps-evidence'); addNode(item, 'h4', source.title);
      if (source.kind === 'image' && source.asset) {
        const img = addNode(item, 'img'); img.src = assetUrl(source.asset); img.alt = source.title;
        img.addEventListener('error', () => { img.hidden = true; addNode(item, 'p', 'Image bytes unavailable. This attachment is unresolved.', 'ps-error'); });
        const details = addNode(item, 'details'); addNode(details, 'summary', 'Image identity'); addNode(details, 'code', source.asset.sha256); addNode(details, 'p', `${source.asset.bytes.toLocaleString()} bytes · ${source.asset.mime}`, 'ps-note');
      } else if (source.kind === 'image') addNode(item, 'p', 'Image not attached yet.', 'ps-note');
      else addNode(item, 'blockquote', source.text || '');
      if (source.source) addNode(item, 'p', source.source, 'ps-note');
    }
    renderSources();
  }
  function renderCorrections() {
    $('ps-corrections').replaceChildren();
    for (const correction of study.corrections) addNode($('ps-corrections'), 'div', correction.text, 'ps-correction');
  }
  function renderPreview() {
    const container = $('ps-preview'); container.replaceChildren();
    if (!study.preview) { addNode(container, 'p', 'No new preview attached. Actual preview settings and visual comparison are still absent.', 'ps-empty'); return; }
    const img = addNode(container, 'img'); img.id = 'ps-preview-image'; img.src = assetUrl(study.preview.asset); img.alt = 'Attached native preview';
    img.addEventListener('error', () => { img.hidden = true; addNode(container, 'p', 'Preview bytes unavailable. Its reference remains unresolved.', 'ps-error'); });
    addNode(container, 'p', 'Operator-attached image · supplied settings', 'ps-note');
    addNode(container, 'p', study.preview.settingsText, 'ps-note');
    const remove = addNode(container, 'button', 'Remove preview link'); remove.type = 'button';
    remove.addEventListener('click', () => { study.preview = null; changed(); renderPreview(); });
  }
  function render() {
    $('ps-title').value = study.title; $('ps-target-name').value = study.target.name; $('ps-target-hash').value = study.target.sha256 || ''; $('ps-next').value = study.nextAction;
    renderCardMenu();
    for (const field of fields) $(`ps-${field}`).value = viewedCard()?.[field] || '';
    renderEvidence(); renderCorrections(); renderPreview(); engineStudyChanged(); controls();
  }
  async function refresh(silent = false) {
    const turn = ++listTurn;
    try {
      const result = await api(); if (turn !== listTurn) return;
      const previous = $('ps-studies').value;
      $('ps-studies').replaceChildren(new Option('Choose a study', ''), ...result.studies.map(item => new Option(item.title, item.id)));
      $('ps-studies').value = result.studies.some(item => item.id === studyId) ? studyId : previous;
      if (!silent) status(`${result.studies.length} local studies available.`);
    } catch (error) { if (!silent) status(error.message, true); }
  }
  function updateLink() { const url = new URL(location.href); url.searchParams.set('study', studyId); url.searchParams.delete('revision'); history.replaceState(null, '', url); }
  function hasUnsavedWork() { return Boolean(engineDraftDirty || pending || (dirty && canonical(study) !== draftBaseline) || ['ps-source-text', 'ps-correction', 'ps-preview-settings'].some(id => $(id).value.trim())); }
  function mayReplace() { return !hasUnsavedWork() || confirm('Leave the current unsaved study changes? Saved revisions remain available.'); }
  async function openStudy(id, revision) {
    if (!id || !mayReplace()) return;
    busy++; loading = true; controls();
    try {
      const result = await api(`?id=${encodeURIComponent(id)}${revision ? `&revision=${encodeURIComponent(revision)}` : ''}`);
      recoveryTurn++; recovery = null;
      study = result.study; studyId = result.saved.id; baseRevisionId = result.saved.revisionId; viewCardId = study.selectedCardId || study.cards.at(-1)?.id || null; frozen = new Set(study.cards.map(card => card.id)); pending = null; dirty = false; targetTurn++;
      draftBaseline = canonical(study); $('ps-source-text').value = ''; $('ps-correction').value = ''; $('ps-preview-settings').value = ''; render(); updateLink(); status('Study reopened from the local store. No model request was made.'); refreshEngine();
    } catch (error) {
      status(error.message, true);
      if (id === studyId) { stepState = 'unavailable'; stepMessage = 'The full study could not be reopened. Fresh work is unavailable until its sources can be confirmed.'; }
      await recoverStudy(id, error.message);
    }
    finally { busy--; loading = false; controls(); }
  }
  async function save(copy = false) {
    if (saving || busy) return;
    if (copy) { studyId = uid('study'); baseRevisionId = null; pending = null; dirty = true; engineStudyChanged(); }
    if (!pending) {
      pending = { action: 'save', requestId: crypto.randomUUID(), studyId, baseRevisionId, study: clone(study) };
      for (const card of pending.study.cards) frozen.add(card.id);
    }
    const attempt = pending;
    saving = true; controls(); status('Saving the study, then reading its exact revision back…');
    try {
      const result = await api('', attempt);
      if (result.saved?.id !== attempt.studyId || result.saved?.revisionId !== `rev_${attempt.requestId}` || result.saved?.baseRevisionId !== attempt.baseRevisionId || canonical(result.study) !== canonical(attempt.study)) throw new Error('Save receipt did not match the submitted draft. Retry to confirm the same request.');
      const readback = await api(`?id=${encodeURIComponent(result.saved.id)}&revision=${encodeURIComponent(result.saved.revisionId)}`);
      if (readback.saved.studyHash !== result.saved.studyHash || canonical(readback.study) !== canonical(result.study)) throw new Error('Saved revision readback did not match. Retry to confirm the same request.');
      baseRevisionId = result.saved.revisionId; pending = null;
      const unchanged = canonical(study) === canonical(attempt.study);
      if (unchanged) { study = readback.study; dirty = false; render(); }
      else dirty = true;
      updateLink(); await refresh(true); await refreshEngine();
      status(unchanged ? `Saved locally and independently read back. ${study.preview ? 'Attached preview retained with its supplied settings.' : 'Missing preview remains explicit.'}` : 'Submitted revision saved and read back. Your newer edits remain unsaved.');
    } catch (error) {
      if (error.status && error.status < 500) pending = null;
      status(error.status === 409 ? 'This study changed or this request conflicts. Your draft is intact. Open the latest revision or save a copy.' : `${error.message} Your draft is intact.`, true);
    } finally { saving = false; controls(); }
  }
  async function raster(file) {
    if (!file || file.size > 8 * 1024 * 1024) throw new Error('Choose an image no larger than 8 MiB.');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG or WebP image.');
    const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read the selected image.')); reader.readAsDataURL(file); });
    return (await api('', { action: 'asset', dataUrl })).asset;
  }
  $('ps-title').addEventListener('input', event => { study.title = event.target.value; changed(); });
  $('ps-target-name').addEventListener('input', event => { targetTurn++; study.target.name = event.target.value; changed(); });
  $('ps-target-hash').addEventListener('input', event => { targetTurn++; study.target.sha256 = event.target.value.trim().toLowerCase() || null; changed(); });
  $('ps-next').addEventListener('input', event => { study.nextAction = event.target.value; changed(); });
  for (const field of fields) $(`ps-${field}`).addEventListener('input', event => { editableCard()[field] = event.target.value; changed(); });
  $('ps-cards').addEventListener('change', event => { viewCardId = event.target.value; renderCardMenu(); for (const field of fields) $(`ps-${field}`).value = viewedCard()?.[field] || ''; renderSources(); });
  $('ps-revise').addEventListener('click', () => {
    const text = $('ps-correction').value; if (!text.trim()) { status('Write the correction before starting its revised card.', true); return; }
    const parent = viewedCard(); if (!parent) { status('Write a first card before revising it. Your correction text is still here.', true); return; }
    const card = { ...clone(parent), id: uid('card'), parentId: parent.id };
    study.cards.push(card); study.corrections.push({ id: uid('correction'), fromCardId: parent.id, toCardId: card.id, text });
    study.selectedCardId = card.id; viewCardId = card.id; $('ps-correction').value = ''; changed(); render(); status('Earlier card retained. Edit this new draft to respond to the correction.');
  });
  $('ps-use-card').addEventListener('click', () => {
    if (!currentCard()) return;
    if (study.preview && study.acceptedCardId !== study.selectedCardId && !confirm('Choose this card and clear the older preview link from the current draft? Saved revisions keep the earlier preview.')) return;
    if (study.acceptedCardId !== study.selectedCardId) study.preview = null;
    study.acceptedCardId = study.selectedCardId; frozen.add(study.selectedCardId); changed(); renderCardMenu(); renderPreview(); status('Card chosen for this study. No scene change was applied.');
  });
  $('ps-add-text').addEventListener('click', () => {
    const text = $('ps-source-text').value; if (!text.trim()) { status('Add source text first.', true); return; }
    const source = { id: uid('source'), title: $('ps-source-title').value.trim() || 'Source text', kind: 'text', source: $('ps-source-ref').value.trim(), asset: null, text };
    study.evidence.push(source); editableCard().sourceIds.push(source.id); $('ps-source-text').value = ''; changed(); render(); status('Source text retained separately from the scene.');
  });
  $('ps-source-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    const title = $('ps-source-title').value.trim() || file.name, sourceRef = $('ps-source-ref').value.trim();
    busy++; controls(); status('Retaining the exact image bytes…');
    try { const asset = await raster(file); const source = { id: uid('source'), title, kind: 'image', source: sourceRef, asset, text: null }; study.evidence.push(source); editableCard().sourceIds.push(source.id); changed(); render(); status('Image retained locally. Save the study to retain this attachment reference.'); }
    catch (error) { status(error.message, true); }
    finally { busy--; event.target.value = ''; controls(); }
  });
  $('ps-target-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 128 * 1024 * 1024) { status('For a native larger than 128 MiB, enter its known fingerprint instead.', true); event.target.value = ''; return; }
    const turn = ++targetTurn; busy++; controls();
    try { const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); if (turn !== targetTurn) return; study.target.name = file.name; study.target.sha256 = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''); changed(); $('ps-target-name').value = study.target.name; $('ps-target-hash').value = study.target.sha256; status('Native identity recorded. Its bytes were not uploaded.'); }
    catch { status('Could not fingerprint this native file.', true); }
    finally { busy--; event.target.value = ''; controls(); }
  });
  $('ps-preview-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    const cardId = study.acceptedCardId, targetSha256 = study.target.sha256, settingsText = $('ps-preview-settings').value;
    if (!cardId || !/^[a-f0-9]{64}$/.test(targetSha256 || '') || !settingsText.trim()) { status('Choose a card, identify the native target and enter actual settings before attaching a preview.', true); event.target.value = ''; return; }
    busy++; controls();
    try { const asset = await raster(file); if (study.acceptedCardId !== cardId || study.target.sha256 !== targetSha256) throw new Error('Card or target changed during attachment. Select the preview again for the intended revision.'); study.preview = { asset, cardId, settingsText, targetSha256 }; $('ps-preview-settings').value = ''; changed(); renderPreview(); status('Native preview attached with your supplied settings. Save the study to retain it.'); }
    catch (error) { status(error.message, true); }
    finally { busy--; event.target.value = ''; controls(); }
  });
  $('ps-save').addEventListener('click', () => save()); $('ps-copy').addEventListener('click', () => save(true));
  $('ps-refresh').addEventListener('click', () => refresh()); $('ps-open').addEventListener('click', () => openStudy($('ps-studies').value));
  $('ps-new').addEventListener('click', () => { if (!mayReplace()) return; study = newStudy(); draftBaseline = canonical(study); studyId = uid('study'); baseRevisionId = null; viewCardId = study.selectedCardId; pending = null; frozen = new Set(); targetTurn++; dirty = true; $('ps-source-text').value = ''; $('ps-correction').value = ''; $('ps-preview-settings').value = ''; render(); status('New local draft. No evidence or preview is assumed.'); });
  $('ps-engine-send').addEventListener('click', requestEngine);
  $('ps-step-select').addEventListener('click', () => selectStep());
  $('ps-step-retry').addEventListener('click', () => selectStep(true));
  $('ps-step-check').addEventListener('click', readStep);
  $('ps-step-resume').addEventListener('click', resumeStep);
  $('ps-step-use').addEventListener('click', useStepResult);
  $('ps-recovery-check').addEventListener('click', () => recovery && recoverStudy(recovery.id, recovery.failure));
  $('ps-recovery-close').addEventListener('click', () => { recoveryTurn++; recovery = null; renderRecovery(); });
  $('ps-engine-refresh').addEventListener('click', refreshEngine);
  $('ps-engine-history').addEventListener('change', event => selectEngineOperation(event.target.value));
  for (const id of ['ps-engine-instruction', 'ps-engine-domain']) $(id).addEventListener('input', () => { engineDraftDirty = true; engineDraftVersion++; engineControls(); });
  $('ps-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => event.stopPropagation());
  entry.addEventListener('click', () => { dialog.showModal(); refresh(true); refreshEngine(); });
  window.addEventListener('beforeunload', event => { if (hasUnsavedWork()) { event.preventDefault(); event.returnValue = ''; } });
  render();
  const query = new URLSearchParams(location.search);
  if (query.has('study')) { dialog.showModal(); openStudy(query.get('study'), query.get('revision')).then(() => refresh(true)); }
})();
