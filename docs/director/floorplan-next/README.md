# Floor-plan navigation after play

Dan asked us to keep going after C.B., Bee and Halp's [first tool play](../floorplan-play/README.md). That play made two needs concrete: exact item edits required too much travel down the phone inspector, and active-level editing did not show the building's full arrangement of levels and connections.

The next tool pass adds a canvas-near level selector, a focused phone inspector, visible custom connection names, and a read-only Building overview. The plan data, portable package and Blender importer retain their existing contracts.

Building groups levels by their actual elevation, including negative values and shared elevations. Named connection endpoints use level IDs, so duplicate names remain distinct. Each mini-plan shows authored footprints and openings, fitted separately. The elevation stack is schematic. Empty levels stay empty; the tool does not infer shafts, floor apertures, landings or missing rooms.

Selecting a level returns to its editable plan. Merely opening or closing Building does not change the plan. Selected / Level / Plan tabs shorten the phone inspector, and Return to plan preserves the drawing view. Common opening and connection controls remain tied to the selected item.

- [Bee's proposal and play criteria](bee/proposal.md)
- [Bee's continued studio play](bee/README.md)
- [C.B.'s phone layout observation](cb/README.md)
- [Independent receiving](receiving/README.md)
- [Standalone overview receiving](overview/README.md)
- [Editor controls](../floorplan-editor-notes.md)

The receiving layouts are invented tool exercises. They do not establish the Lighthouse floor plan or change Trip's restored pose. The existing 3D preview still shows the active level, while Building supplies the whole-building overview in the authoring workspace.
