(() => {
  const $ = id => document.getElementById(id);
  const opening = $('opening');
  const ending = $('active-ending');
  const by = $('ending-by');
  const effect = $('active-effect');
  const draft = $('draft-ending');
  const reflection = $('draft-reflection');
  if (!opening || !draft) return;

  // Read retained text from the rendered source; never parse a reader draft as HTML.
  const originals = new Map([...document.querySelectorAll('[data-ending-card]')].map(card => [card.dataset.endingCard, {
    author: card.querySelector('h3').firstChild.textContent,
    text: card.querySelector('blockquote').textContent,
    effect: card.querySelector('[data-ending-effect]').textContent,
  }]));
  const choices = [...document.querySelectorAll('input[name="ending"]')];
  let selected = 'original';
  const hasDraft = () => !!draft.value.trim();
  const hasUnsavedDraft = () => !!(draft.value || reflection.value);

  function render() {
    if (selected === 'draft') {
      ending.textContent = draft.value || 'Write an ending below to read it here.';
      by.textContent = 'Ending by you · Reader draft';
      effect.textContent = reflection.value || 'Your new possibility, beside the retained versions.';
    } else {
      const source = originals.get(selected);
      if (!source) return;
      ending.textContent = source.text;
      by.textContent = `Ending by ${source.author} · ${selected === 'original' ? 'Original' : 'Reader response'}`;
      effect.textContent = source.effect;
    }
    for (const choice of choices) choice.checked = choice.value === selected;
  }
  function edit() {
    $('choice-draft').disabled = !hasDraft();
    $('read-draft').disabled = !hasDraft();
    $('download-draft').disabled = !hasDraft();
    $('draft-status').textContent = '';
    if (selected === 'draft') render();
  }
  for (const choice of choices) choice.addEventListener('change', () => { selected = choice.value; render(); });
  draft.addEventListener('input', edit);
  reflection.addEventListener('input', edit);
  $('draft-source').addEventListener('change', () => {
    $('draft-source-text').textContent = originals.get($('draft-source').value)?.text || 'No source ending chosen. Browsing above does not change this choice.';
  });
  $('read-draft').addEventListener('click', () => {
    if (!hasDraft()) return;
    selected = 'draft'; render();
    $('reading-title').setAttribute('tabindex', '-1');
    $('reading-title').focus({ preventScroll: true });
    $('reading').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  $('download-draft').addEventListener('click', () => {
    if (!hasDraft()) return;
    const links = [...document.querySelectorAll('.source-links a')].map(link => `${link.textContent}: ${link.href}`).join('\n');
    const source = originals.get($('draft-source').value);
    const origin = source ? `Chosen starting ending by ${source.author}:\n${source.text}` : 'Starting point: a new ending; no source ending chosen.';
    const text = `Carry one relationship forward — my reader draft\n\nOpening by C.B. (unchanged):\n${opening.textContent}\n\n${origin}\n\nEnding by the reader:\n${draft.value}\n\nWhat changes for the reader:\n${reflection.value || '(No reflection supplied.)'}\n\nSources:\n${links}\n\nThis new fictional variation is a personal draft. Downloading does not publish it or save it to a shared study.\n`;
    try {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'carry-one-relationship-my-draft.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('draft-status').textContent = 'Draft download started. Your draft remains here; nothing was sent or published.';
    } catch {
      $('draft-status').textContent = 'The download could not start. Your draft is still here. Copy it into a document or try downloading again.';
    }
  });
  // Open source documents separately so following a source cannot replace this draft.
  document.querySelectorAll('a[href^="https://"], a[target="_blank"]').forEach(link => {
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    const label = link.getAttribute('aria-label') || link.textContent.trim();
    link.setAttribute('aria-label', label.includes('(opens in a new tab)') ? label : `${label} (opens in a new tab)`);
  });
  window.addEventListener('beforeunload', event => { if (hasUnsavedDraft()) { event.preventDefault(); event.returnValue = ''; } });
  document.querySelectorAll('[data-interactive]').forEach(element => { element.hidden = false; });
  render(); edit();
})();
