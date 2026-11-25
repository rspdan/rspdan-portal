# Director floor-plan editor

Open **Floor plan** in the Director to edit the plan stored with the current take. New takes start with an empty plan; the editor does not assume a canonical OHC/CHO or Lighthouse layout.

## Finding the right controls

The **Level** selector beside the canvas switches the active floor without scrolling through the inspector. Level names that repeat receive a visible ordinal so the choices remain distinguishable.

On a phone, the canvas and inspector occupy separate panes. The inspector scrolls independently beneath its **Selected**, **Level**, and **Plan** tabs. Selected keeps the current item's main controls first: opening dimensions precede its room settings, and a connection shows its name, type and endpoints before its expandable position and size controls. Level holds the current floor's name, elevation and wall height. Plan holds naming, units, grid, numerical room creation, import and export. Switching tabs reuses the same fields, returns that pane to its top, and does not modify the plan. Arrow keys, Home and End navigate the tabs when they have keyboard focus.

Placing or selecting an item makes **Selected** ready without scrolling or opening the keyboard. **Return to plan** resets the inspector scroll and focuses the canvas while preserving the selection and current pan/zoom. Desktop keeps all inspector groups available together. The small phone canvas footer shows only grid and snap; the active level remains in the nearby selector.

**Building** shows every level and its connections in a separate overview. Entering it cancels an unfinished drawing or placement without creating geometry. Choose a level in the overview to return to its editable plan and fit that level in the canvas; changing the active level is an undoable plan change. Switching between Plan and Building alone does not add history. The overview does not replace the separate active-level **Preview in 3D**.

For stairs and elevators, choose **Compare placement** in the selected item's inspector or the Building connection list. Both endpoint plans use one shared drawing window, so differences in room size and the footprint's placement remain visible. The amber footprint preserves its authored dimensions and rotation. From/To labels identify the levels and elevations; repeated level names include their IDs. An empty endpoint explicitly shows that no rooms have been drawn.

Opening comparison, then using **Back to plan**, **Plan** or Escape preserves the active level, selection, pan/zoom and undo history. **Edit this level** instead opens that endpoint by ID and selects the connection; changing the active level adds the usual undo entry. On a phone, comparison temporarily uses the whole workspace; returning to Plan restores the inspector. Desktop keeps the inspector available beside comparison. Comparison does not create a second footprint or repair geometry. Delete/Backspace shortcuts do not delete a hidden plan selection while viewing Building or comparison. Explicit inspector edits and undo/redo remain available; deleting the compared connection clears its view, and undo restores it.

## Drawing and editing

- **Draw room:** drag opposite corners. **Polygon:** tap each corner, then tap the first corner or press Enter to finish. With a mouse, double-clicking the same final corner also finishes. Nearby distinct taps remain separate corners, and trying to finish with fewer than three preserves the draft. Escape cancels the unfinished gesture.
- Select a room to drag it, move its corner handles, name it, change its materials, or edit exact corner coordinates. **Add a room by dimensions** provides a numerical alternative to drawing.
- Drag **Door**, **Window**, or **Passage** from the toolbar onto a wall, or tap the tool and then tap the wall. The preview snaps along the edge and turns green when it can be placed. Select the opening to set width, height, sill, or position along its edge. Dragging an existing opening keeps it attached to that edge.
- Drag **Stairs** or **Elevator** from the toolbar onto the plan, or tap the tool and then tap the plan. These connect two levels with different elevations; if a second level is needed, the hint offers **+ Level**. Level creation is always an explicit action. The placement message identifies the connection endpoints, which remain editable in the inspector. Stairs and elevators are planning footprints; they do not generate finished stair or elevator assets.
- Toolbar placement works with a finger or a mouse. A short tap selects the tool; moving away from its button starts a drag. The floating preview and plan footprint show the proposed drop. Releasing outside the plan, on view controls, or away from a required wall makes no change. Escape, pointer cancellation, leaving the editor or losing focus cancels the drag. A valid drop creates one undo entry. Toolbar gesture buttons suppress text selection and native callouts; inspector text fields remain selectable.
- The item selector provides keyboard access to rooms, openings and connections. With the plan surface focused, arrow keys move the selected item by one grid step; Shift multiplies the step by ten. With no selection, arrows pan. Plus/minus zoom and zero fits the active level. Exact corner coordinates and opening properties remain available in the inspector.
- Drag empty space, use **Pan**, or Alt-drag to pan. Mouse-wheel zoom is anchored to the pointer. **Fit plan** includes rotated connection footprints on the active level.
- Undo and redo use the Director's take history. A completed drag is one change. Invalid geometry or property edits leave the last valid plan in place.
- Connection markers show their custom name and a short type/destination line. Long labels shorten on the canvas; the inspector and hover labels retain the full text. Undo/redo feedback identifies the restored active level instead of leaving a stale placement message.

Working units and metres are labels for the existing dimensions. Changing the units does not rescale a plan. Level elevation and height use those same units.

## Reuse and preview

**Preview in 3D** switches to the Director's blockout view. Plan data remains editable after preview and is saved with the take.

**Export plan** downloads one `nest-floorplan-package/v1` JSON file containing the canonical plan and derived geometry. **Import plan** accepts that package or a canonical `nest-floorplan/v1` document. The browser validates the whole plan before replacement and regenerates its geometry; it does not trust geometry supplied by an imported package. Invalid or oversized files do not replace the existing plan.

The inspector links to `/director/odk_floorplan_import.py` for bringing the exported package into Blender. This is an explicit file transfer, not live synchronization with an open Blender scene.

## Integration

`createFloorplanEditor({ canvasHost, inspectorHost, onCommit, onStatus, onPreview, onUndo, onRedo })` exposes `setPlan`, `setActive`, `setHistory`, and `dispose`. The host owns persistence, undo history, and 3D preview.

`onCommit(nextPlan, previousPlan)` runs only after validation. Passing an unchanged canonical document to `setPlan` preserves selection, focused fields, and incomplete drawing gestures. A genuinely different document replaces the current plan and cancels a pending gesture.

Room fills and walls render before openings so adjacent room walls cannot cover a shared doorway in the overhead view. All user-supplied names render as text.
