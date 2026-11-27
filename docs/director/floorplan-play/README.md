# ODK floor-plan play · C.B., Bee and Halp

Dan reported that drawing a room worked on his phone, but dragging the listed items did not. His screenshot showed Android selecting toolbar text. He asked C.B., Bee and Halp to play together and learn from the tool.

We each built small invented sets through the actual UI:

| Observer | Play |
| --- | --- |
| [C.B.](cb/README.md) | A reading nook with windows and a doorway, an upper lookout landing, a moved stair, 3D preview and export. |
| [Bee](bee/README.md) | A pocket studio with Warm-up and Light loft, openings and both connection types, using desktop and touch. |
| [Halp](halp/README.md) | Rain Rooms: adjoining foyer/listening rooms, a Quiet loft, shared passage, stair and lift; move, rotate, undo, export and reopen. |

The initial toolbar supplied mode-selection buttons. Real toolbar-to-plan drags created nothing on both mouse and emulated touch; selecting a tool and then tapping its target did work. Earlier touch receiving had covered drawing and tap placement but missed this drag interaction. Dan's attempted gesture exposed that gap.

The resulting update supports dragging Door, Window, Passage, Stairs and Elevator directly onto the plan. A visible preview shows a valid wall or footprint before release. Invalid or cancelled drops leave the plan unchanged, and each successful drop is one undo step. Tap-to-place remains available. Gesture controls suppress native text selection while inspector text stays selectable.

Stairs and elevators explain their second-level requirement beside the canvas, with an explicit + Level action. Creating a level states which view is now selected and where the earlier level remains. Connection placement states both endpoint names. The Active level control has an explicit accessible name.

Exploratory receiving also found rapid touch polygon taps being mistaken for a double-click and an exception when a selection event originated from a text node. The final interaction update preserves unfinished polygons and handles those event targets safely.

The phone inspector still requires scrolling between the drawing and detailed properties. An all-level/section view and more visible custom connection names are useful future design questions from play; they are not part of this interaction fix. The tested layouts are invented exercises, not Lighthouse dimensions or Story changes. Trip's pose and the native importer are unchanged.

[Independent receiving](receiving/README.md) pins tested files and gestures. These browser encounters used Chromium, including touch emulation. Dan's physical-phone screenshot remains the direct evidence of the original Android selection menu; the update still needs his physical-device use to confirm its feel.
