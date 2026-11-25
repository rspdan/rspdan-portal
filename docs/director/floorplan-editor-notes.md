# Director floor-plan editor

Open **Floor plan** in the Director to edit the plan stored with the current take. New takes start with an empty plan; the editor does not assume a canonical OHC/CHO or Lighthouse layout.

## Drawing and editing

- **Draw room:** drag opposite corners. **Polygon:** tap each corner, then tap the first corner or press Enter to finish. With a mouse, double-clicking the same final corner also finishes. Nearby distinct taps remain separate corners, and trying to finish with fewer than three preserves the draft. Escape cancels the unfinished gesture.
- Select a room to drag it, move its corner handles, name it, change its materials, or edit exact corner coordinates. **Add a room by dimensions** provides a numerical alternative to drawing.
- Drag **Door**, **Window**, or **Passage** from the toolbar onto a wall, or tap the tool and then tap the wall. The preview snaps along the edge and turns green when it can be placed. Select the opening to set width, height, sill, or position along its edge. Dragging an existing opening keeps it attached to that edge.
- Drag **Stairs** or **Elevator** from the toolbar onto the plan, or tap the tool and then tap the plan. These connect two levels with different elevations; if a second level is needed, the hint offers **+ Level**. Level creation is always an explicit action. The placement message identifies the connection endpoints, which remain editable in the inspector. Stairs and elevators are planning footprints; they do not generate finished stair or elevator assets.
- Toolbar placement works with a finger or a mouse. A short tap selects the tool; moving away from its button starts a drag. The floating preview and plan footprint show the proposed drop. Releasing outside the plan, on view controls, or away from a required wall makes no change. Escape, pointer cancellation, leaving the editor or losing focus cancels the drag. A valid drop creates one undo entry. Toolbar gesture buttons suppress text selection and native callouts; inspector text fields remain selectable.
- The item selector provides keyboard access to rooms, openings and connections. With the plan surface focused, arrow keys move the selected item by one grid step; Shift multiplies the step by ten. With no selection, arrows pan. Plus/minus zoom and zero fits the active level. Exact corner coordinates and opening properties remain available in the inspector.
- Drag empty space, use **Pan**, or Alt-drag to pan. Mouse-wheel zoom is anchored to the pointer. **Fit plan** includes rotated connection footprints on the active level.
- Undo and redo use the Director's take history. A completed drag is one change. Invalid geometry or property edits leave the last valid plan in place.

Working units and metres are labels for the existing dimensions. Changing the units does not rescale a plan. Level elevation and height use those same units.

## Reuse and preview

**Preview in 3D** switches to the Director's blockout view. Plan data remains editable after preview and is saved with the take.

**Export plan** downloads one `nest-floorplan-package/v1` JSON file containing the canonical plan and derived geometry. **Import plan** accepts that package or a canonical `nest-floorplan/v1` document. The browser validates the whole plan before replacement and regenerates its geometry; it does not trust geometry supplied by an imported package. Invalid or oversized files do not replace the existing plan.

The inspector links to `/director/odk_floorplan_import.py` for bringing the exported package into Blender. This is an explicit file transfer, not live synchronization with an open Blender scene.

## Integration

`createFloorplanEditor({ canvasHost, inspectorHost, onCommit, onStatus, onPreview, onUndo, onRedo })` exposes `setPlan`, `setActive`, `setHistory`, and `dispose`. The host owns persistence, undo history, and 3D preview.

`onCommit(nextPlan, previousPlan)` runs only after validation. Passing an unchanged canonical document to `setPlan` preserves selection, focused fields, and incomplete drawing gestures. A genuinely different document replaces the current plan and cancels a pending gesture.

Room fills and walls render before openings so adjacent room walls cannot cover a shared doorway in the overhead view. All user-supplied names render as text.
