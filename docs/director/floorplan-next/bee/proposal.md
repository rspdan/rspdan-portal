# Bee · Next floor-plan UX receiving criteria

Recorded 2026-11-25T08:43:38Z. Current portal baseline: `895c5ff`; parent-supplied native checkpoint: `981e961cd`. This is a proposal grounded in [Bee's actual earlier play](../../floorplan-play/bee/README.md) and the current editor/overview documentation. **No new candidate has been played in this record yet.**

## Phone editing with the plan still in reach

The prior touch play required repeated travel between the canvas and the long inspector. The active-level label and new connection endpoint message already worked; preserve those gains.

Use **Selected / Level / Plan** inspector tabs on phone, with Selected first when an item is chosen. Keep a compact item header beside the canvas: name/type and current level, or From → To for a connection. Prioritize the common edits: opening dimensions; connection destination/rotation; room name. Keep full properties available without repeating the entire plan inspector above each selected item.

An explicit **Return to plan** should preserve selected item, active level and current pan/zoom. Selection alone must not open the keyboard or jump the page. When an input is deliberately opened, the selected-item identity should remain obvious; finishing or collapsing the inspector should bring that same object back into view. A useful portion of the canvas should remain adjacent to the common fields where the available height permits. Do not cover the footprint itself with an oversized floating tooltip.

The canvas-near level dropdown should let me switch between Warm-up and Light loft without hunting down the page. Existing tap-then-place, toolbar dragging, ghost feedback, corner dragging and Undo/Redo must remain usable.

## Whole-building context without invented construction

Provide a **Plan / Building** choice in the same workspace. Building can show all level mini-plans plus an elevation/connection overview. Each mini-plan derives from that level's actual room polygons; name, elevation, height and the active state remain legible. Order the elevation view by numeric elevation, including negative values and unequal heights, rather than assuming insertion order is vertical order.

Show connections by their existing name/type and declared endpoints. They remain planned links, not completed stairs, lift shafts, landings or proof of navigability. Empty levels should remain visible as empty. Do not create a floor slab, room, connector or intermediate level merely to make the overview look complete.

Clicking or tapping a level should return to its editable plan with clear active-level feedback. Overview navigation must not rewrite room coordinates, dimensions or connections. If the vertical graphic is a schematic elevation projection, name it **Elevation overview** or **Levels**, not a measured architectural section with an unstated cutting plane.

## Bounded actual play when ready

| Exercise | What Bee will look for |
| --- | --- |
| Select a door on phone, change its width, return to plan | Same object remains identifiable; visible change occurs; no accidental page jump, lost pan or selection. |
| Select/rename a connection and change destination | Header and plan labels agree; name/type/endpoints remain readable at phone size. |
| Switch level near canvas and continue placing | Active level is explicit; tap and toolbar-drag behavior survive the new navigation. |
| Open Building with two drawn levels, a negative-elevation level and an empty level | Correct order and actual footprints; empty remains empty; source plan unchanged by viewing. |
| Follow a connection, select a level and return to plan | Route endpoints are clear, navigation lands on the intended editable level. |
| Undo/redo a small edit after view changes | The authored edit recovers without confusing it with a lost draft or implied new geometry. |

The test remains an invented pocket studio, not Lighthouse Story. Bee owns only this evidence area. C.B. coordinates implementation and delivery; the UI and building-view owners received these criteria directly. Actual candidate screenshots and limits will be recorded separately when available.
