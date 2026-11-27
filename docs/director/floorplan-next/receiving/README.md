# Floor-plan navigation and Building overview receiving

**29/29 desktop checks, 45/45 phone checks, and 15/15 checks on the final frozen phone candidate passed.** No product failures remain in this receiving pass.

The integrated workflow used local Director at port 4341, Chromium with software WebGL, real mouse/touch/keyboard input, and a 390×844 phone viewport. Saves went only to the isolated local take store and returned `shared: false`. Browser automation read the private cookie file directly; credentials are absent from these artifacts.

## What was received

- Selected/Level/Plan tabs, keyboard arrow/Home/End navigation, nearby connector names and destinations, and the near-canvas level selector.
- Independent phone inspector scrolling: destination controls remain touch reachable, tabs remain visible after scrolling, explicit tab selection reveals that panel, and Return to plan preserves the selected item and drawing viewport.
- Building overview with negative elevation, duplicate elevations, duplicate level names, an empty level, long labels, and duplicate connection names. Four distinct level IDs and three connection IDs remain distinct; links use IDs rather than joining names.
- Plan/Building toggles preserve the canonical document and history. Choosing another level makes exactly one history edit; choosing the current level makes none. Undo/Redo update the local hint.
- One actual touch drag for each of Door, Window, Passage, Stairs, and Elevator, with one exact Undo each; one touch polygon completion and Undo. This is a focused regression check, not a rerun of the prior 218-case drag matrix.
- Export equality, a rendering 3D preview, local Save, and browser reload preserve the canonical plan and Trip pose.

The fixture is deliberately artificial test geometry, not a claim about Nest Island's canonical architecture.

## Evidence and provenance

[Desktop results](desktop-results.json) contain 29 checks; [phone results](phone-results.json) contain 45. These integrated runs began before the final compact phone scale-label adjustment. They are candidate behavior evidence, not a claim that every broad check ran on the final byte hashes.

[Final smoke results](final-smoke-results.json) contain 15 checks on the frozen version. [Source hashes](final-source-sha256.json) record the actual browser-loaded response bodies; all five were compared with disk and requested again after receiving, with no changes:

| Asset | SHA-256 |
| --- | --- |
| `director.css` | `a2b289dc22db4860cf18886dfbce5c4b0dcad07ef14b0bef6da79817f23a30f6` |
| `floorplan-editor.js` | `61331e6a67f15008ea8a943f8e3bb478a6bffc40dd90cd9e4c32979916bf2c85` |
| `floorplan-editor.css` | `70d9d99b40758fd623f010c5c43e334562eb3e59b12e9fb167899fe644f60cfd` |
| `floorplan-overview.js` | `4f5bbe9654de78c9f77a7873c7a254aa70031eb492ea5f9f1005c4ae0b3c96f5` |
| `floorplan-overview.css` | `8e97f0f2e09042498cf877921ab95b52b2758c7f8222c0194c49b0d1150abef6` |

Actual screenshots were inspected, not just DOM diagnostics:

- [Desktop Building overview](desktop-building-top.png): sorted levels, equal-elevation grouping, full connection names, ID-specific endpoints, and level footprints.
- [Desktop selected connection](desktop-selected-connection.png): name and common destination controls beside the plan; detailed geometry stays collapsed.
- [Final phone destination](final-phone-destination.png): scrolled destination control and reachable sticky tabs.
- [Final phone selected item](final-phone-selected.png): compact grid label and independent inspector below the canvas.
- [Final phone Building view](final-phone-building.png): readable level stack within its own scroll area.
- [Empty duplicate-name level](phone-building-empty-level.png): retained as its own empty level.

The final phone screenshots supersede the earlier phone layout captures. Intermediate harness failures and redundant screenshots were moved to `/workspace/scratch/floorplan-next-receiving-intermediate/`; the initial failure was an overly specific test expecting “undone” while the correct UI said “Undid.” No product fix was required for that assertion.

## Reproduction and limits

Run `python docs/director/floorplan-next/receiving/receive.py` for both workflows, or append `phone` / `desktop`. Run `python docs/director/floorplan-next/receiving/final-smoke.py` for the frozen-source layout smoke. Both require the existing private local test configuration and local server. HMR sockets are left unconnected so an in-progress browser session does not silently change versions.

This is Chromium phone emulation with real dispatched touch input, not a physical Android keyboard or browser-toolbar test. An unrelated Astro development-toolbar audit-module fetch exception appears in raw records and is explicitly excluded from application-error assertions. No Director application runtime exception occurred. Prior receiving evidence remains untouched.
