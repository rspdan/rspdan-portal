// drwSaveStatus.js -- the DRW E3 honest-save-status decision, extracted pure so
// the "nothing gets lost includes knowing when it would" guarantee is
// regression-locked (unit-tested in drwSaveStatus.test.mjs). Mirrors the
// rwdAudio.js extraction: the RWD codec bug proved that untested decision logic
// baked inline can silently regress; the DRW save-status honesty is the same
// class (a data-loss disclosure), so it gets the same durable proof.
//
// The server NEVER fails a save just because the layered (editable) scene could
// not be stored (no blob token / scene > 25MB / a blob error -> sceneUrl null).
// The flat PNG still persisted, so the API returns ok. But the operator must not
// be left believing the EDITABLE scene persisted when it did not: the status
// line says so honestly, and the LOAD button only appears when a scene actually
// stored. This function is the single source of that status string.

export function saveStatusLine(drawing) {
  const id = drawing && drawing.id ? drawing.id : '(unknown)';
  const sceneStored = Boolean(drawing && drawing.sceneUrl);
  return sceneStored
    ? `SAVED ${id} · SCENE + PNG STORED`
    : `SAVED ${id} · FLAT PNG ONLY (LAYERED SCENE NOT STORED · FILE > EXPORT DRAFT KEEPS THE EDITABLE COPY)`;
}
