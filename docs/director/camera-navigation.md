# Camera and navigation in Director

Choose **Camera** for direct control of the view. Edit the camera's position and look-at point, orbit angle, elevation and distance. Choose Perspective for field of view or Orthographic for visible height. **Frame character**, **Frame set** and **Top** provide useful starting views. The browser uses Y as its up axis.

The navigation strip is available in Pose, Lighting, Stage and Camera:

- **Edit** uses the current object/joint controls; dragging empty space orbits.
- **Orbit** drags around the look-at point.
- **Pan** moves the camera and look-at point together.
- **Zoom** lets you click or touch, hold and drag up to zoom in, or down to zoom out.

Pinch with two fingers to zoom and move both fingers together to pan in every 3D mode. Adding the second finger cancels an unfinished object edit before camera navigation begins. Lift both fingers before starting another edit. Camera mode exposes no pose handles.

With a mouse, the wheel zooms. Middle drag orbits, Shift + middle drag pans, and Ctrl/Meta + middle drag zooms. Right drag pans; Alt + primary drag offers the same orbit and modifier gestures. Perspective zoom changes distance while retaining the lens's field of view; orthographic zoom changes the visible height.

A completed camera gesture is one Undo step. Escape, cancellation or lost capture restores the unfinished gesture. Camera controls use the existing take camera record, so position, target, projection, field of view and orthographic height survive Save take and reopening. Navigation does not create a new pose or alter set objects.

Direct position and look-at edits must keep a slight horizontal offset: this orbit camera has a small margin around the straight-up and straight-down directions. Unsupported edits are rejected without changing the view. A legacy take inside that margin opens at a supported angle with an explicit warning and an unsaved draft; the original saved record is unchanged.

## Floor plan

The overhead editor has its own **Pan** and **Zoom** tools. Drag up/down with Zoom, or use Ctrl/Meta + middle drag. Pinch zooms around the moving midpoint and also pans, regardless of the active drawing/placement tool. A second finger cancels the unfinished room, opening or placement edit before navigating. Lift both fingers to resume editing.

Plan navigation changes only the view; it adds no plan Undo step. The inspector continues to scroll normally. Existing wheel, plus/minus and Fit plan controls remain available.

## Receiving

[Camera and navigation receiving](camera-navigation-receiving.json) identifies tested source editions, actual browser checks and delivery status. Phone tests use Chromium touch emulation and CDP touch delivery; physical handset receiving remains distinct. The control pattern is inspired by Blender navigation; the browser does not claim to reproduce every Blender camera or viewport feature.
