# Draft recovery recheck

The current draft-warning fix passed 14 focused browser checks with no page errors: eight using an actual local-workspace save and six using a delayed mocked save response. No live Nest save or Crew delivery was performed.

With Director draft writes forced to throw `QuotaExceededError`, an unkeyed stage edit retained the previous stored draft, displayed `DRAFT NOT SAVED` and the Save-before-closing warning, and activated the unload guard. The real local save returned HTTP 200 with `shared: false`. It cleared the guard and warning and displayed `LOCAL WORKSPACE`. Its submitted and current take snapshots matched. A later failed edit restored the guard; restoring storage writes recovered the complete three-object draft and cleared the zero-key failure guard.

The separate delayed-response check confirms that edits made after submitting a save retain the unsaved warning and unload guard when the older save completes. A subsequent API error remains visible alongside the draft warning.

The earlier real-save attempt is retained. Its observed temporary dirty result was not reproduced in the fresh-session recheck, so this receipt does not claim an identified cause or a new core repair. The old fixture also returned a native function from `restoreDraftWrites()`; Playwright then raised `Illegal invocation`. The recheck returns a Boolean after restoring the method, changing the fixture rather than application behavior.

Evidence: [actual save and recovery](quota-fix-recheck.json), [concurrent edit handling](quota-concurrent-recheck.json). The matching Python harnesses are included beside the receipts. They read the private local test environment without embedding credentials. Chromium runs with software WebGL; this does not establish physical ACHE performance.
