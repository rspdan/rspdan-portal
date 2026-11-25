# ODK Floorplan in the Director

Choose **Floor plan** in the Director to build an overhead layout for a set. The tool starts blank. Draw rectangular or polygonal rooms, place doors/windows/passages on their edges, and name the levels. Select items to edit exact coordinates, dimensions and materials. Undo and redo share the Director's take history.

**Preview in 3D** shows the active level as a blockout. The canonical plan stays editable in `stage.design.floorplan` and is saved with its take. Switching levels changes the level shown by the preview; exports retain every level. Stairs and elevators are planning markers connecting levels, not finished stair/elevator assets.

Working units and metres label the existing dimensions. Changing that label does not convert coordinates or rescale the layout.

## Export and Blender

**Export plan** downloads a `nest-floorplan-package/v1` JSON document containing the editable plan and derived geometry. Browser import accepts this package or a canonical `nest-floorplan/v1` plan, validates it, and regenerates the geometry. An invalid import retains the current plan.

Download the [standalone Blender importer](../../public/director/odk_floorplan_import.py), also linked in the Director's **Keep and reuse** section at `/director/odk_floorplan_import.py`. Use the separate ODK Floorplan instructions and receiver under `ShellGame.Development/ODK.Floorplan/` for the native workflow. Transfer is explicit through the exported file; this is not live synchronization with an open Blender scene. The earlier character-tool ZIP remains a separate package.

In Blender, install the `.py` file through **Edit → Preferences → Add-ons → Install from Disk** and enable **ODK Floor Plans**. In the 3D View, open **N → Director → Sets → Import floor plan**, or find **Import floor plan** with F3, then choose the exported JSON. Each import creates a separate editable set; importing again does not replace the first copy. The receiver was tested in Blender 5.3.0.

## Scope and source authority

The tool is reusable across sets. Its fixture rooms and tests do not establish an OHC/CHO or Lighthouse floorplan. OHC Actual photographs, recovered plans and Dan's authored floor-by-floor descriptions remain the sources for that eventual design. The exact restored Lighthouse v005 pose and source-inspired furniture study remain separate checkpoints; no additional pose or bespoke Lighthouse build is implied by this tool.

- [Editor controls and keyboard operations](floorplan-editor-notes.md)
- [Canonical schema and geometry contract](floorplan-schema.md)
- [Synthetic receiving fixture](floorplan-fixture.json)

Local implementation, receiving tests, shared-preview deployment and Dan's design acceptance are separate states. Consult the development registry and receiving records for the current delivery state.
