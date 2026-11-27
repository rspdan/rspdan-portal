# Bounded scene persistence review

Read the current server take schema and API body handling, core snapshot/restore/history and mode bindings, and stage image lifetime/fit/disposal paths. This was a targeted code review after the earlier automated and browser receiving; those suites were not rerun or claimed as this reviewer's execution.

## Concrete issue

In `director.js`, `changed()` catches a failed `localStorage.setItem()` and writes a storage-full warning, then immediately replaces that warning with the normal operation message and the `BROWSER DRAFT` label. The unload guard only covers takes with pose keys. A new scene with set pieces, lights or a background but no pose keys therefore has no warning or automatic draft recovery if storage is exhausted.

The isolated [browser reproduction](quota-reproduction.json) injected `QuotaExceededError` for Director draft writes, then added one stage object. It observed `Set piece added.`, the `BROWSER DRAFT` label, an unchanged persisted draft, one stage object, zero keys, and no unload guard. No live save was performed.

Recommended bounded repair: retain draft failure state, keep its warning/unsaved label visible, and include a failed unsaved draft in the unload guard regardless of pose keys. This reviewer did not edit the core; the issue was handed to root. The receipt is the pre-repair reproduction, not proof of a fix.

## Otherwise within reviewed scope

No additional concrete regression was identified in the inspected paths. Snapshots carry stage design, light transforms, outline and Trip settings together with the pose; controllers read proxy transforms so direct manipulation is included. Optional server fields remain omitted when absent from old serialized takes. Mode-specific transforms respect the registered bounds. Image import normalizes local raster files to bounded data URLs, the authenticated API enforces a streaming body limit, and the schema rejects external image URLs. Stage image epochs reject stale completion after replacement/disposal and rendering errors have an explicit fallback/status path.

This is not exhaustive security validation or a guarantee that every browser can decode every bounded raster. The schema explicitly bounds serialized data rather than asserting decoded pixel dimensions; ordinary browser imports additionally impose size/dimension and normalization limits. Native receiver parity and physical ACHE behavior were outside this review.
