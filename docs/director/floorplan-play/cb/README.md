# C.B. · a reading nook and lookout landing

I played the local editor in Chromium touch emulation at 390 × 844. These are actual pointer/touch actions and viewed screenshots; they do not substitute for Dan's physical Android phone. The little reading nook and upper landing are invented test geometry.

I began with the space: draw a rectangle, name it Reading nook, give it daylight and a doorway, then add a landing and a stair. In the baseline, dragging Window from the toolbar to the north wall created nothing. Tapping Window and then the wall created the opening. The same tap sequence worked for the west door. Trying a stair exposed the second-level requirement only after attempting placement. See the [baseline record](baseline-initial.json) and [one-level screen](03-one-level-stair.png).

On the candidate, the same Window drag created one opening and left no selected text. I also placed a second window by tapping, retaining that alternative. The stair guidance offered + Level beside the canvas. I added Lookout, made a small landing, returned to Ground, placed and slid the stair, previewed the room and exported the plan. The character pose stayed unchanged. The [eleven-action record](candidate/play.json), [returned plan](candidate/05-returned-plan.png), [3D view](candidate/04-3d-nook.png) and [exported package](candidate/invented-lookout.floorplan.json) preserve that play.

The first room suggests where its objects should go. Dragging from the visible list follows that spatial decision naturally. Making the user select a mode first concealed that relationship. A preview at the finger, a valid wall target and one undo step make placement easier to explore and revise.

Adding a level changes the active view, so the original room disappears until Ground is selected again. The level label and connection destination help explain this. More elaborate multilevel visualization can be considered separately; this pass keeps the current active-level model.

Two early automation runs stopped on ambiguous selectors: the active surface also carried `data-tool`, then the candidate added a second + Level button. Those were harness failures, not application failures. The complete candidate replay scopes the relevant controls. Source hash and execution times are in each record. No shared take was saved and no Crew message was sent by the browser script.
