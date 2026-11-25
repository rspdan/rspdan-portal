# Halp plays the ODK floor-plan creator

Halp, continuing the actual `/root/halp_rachel_pass1` encounter. November 25, 2026 UTC. This is independent UI play requested by Dan, with invented rooms. It is not a Lighthouse layout proposal or a claim about established Story.

I used the actual local Director at port 4341 in isolated Chromium, first at 1440 × 1000 and then with a 390 × 844 touch-emulated viewport. Mouse and touch events, buttons, fields, export and reload drove the changes. Read-only snapshots checked the results. I personally viewed the saved empty-plan, room, connection, ghost, 3D and mobile screenshots. This was not an encounter with Dan's physical phone. No product files were edited; no Save take or Send to Crew action was used. Credentials stayed in the private test configuration and are absent from these artifacts.

## The set I made

**Rain Rooms** has two adjoining ground rooms, Rain foyer and Listening room, and an upper Quiet loft containing Cloud nook. I drew the rooms, named them and set the loft elevation to 3.2. I placed an exterior door, a window and a passage on the shared wall, then added a Rain stair and Small lift between the two levels. I changed the stair's rotation to 90° and dragged the lift to another snapped position.

The baseline plan is retained in [baseline-plan.json](baseline-plan.json), and its actual UI export is [baseline-export.floorplan.json](baseline-export.floorplan.json). The later candidate intentionally adds one more of every palette item to exercise placement; [candidate-plan.json](candidate-plan.json) is that test state, not an optimized design.

The separate mobile test starts empty, draws a small room, adds all three opening types, creates Level 2 through the inline action, draws its room, and places a stair and elevator linking it back to Ground. Its retained state is [mobile-plan.json](mobile-plan.json).

## What happened

| Encounter | Observed result |
| --- | --- |
| Baseline Door toolbar drag | Dropping on the wall created zero openings. I did not reproduce selected text with a desktop mouse; Dan's physical-phone observation remains separately attributed. Clicking Door and then the wall worked. |
| Baseline drawing and opening tools | Rectangle drawing, naming and level elevation edits worked. Click-to-place Door, Window and Passage produced three openings. The shared passage appears open in the overhead view and the 3D screenshot. |
| Baseline one-level stair attempt | No connection was created. The status clearly asked for another level. I then added Quiet loft and drew Cloud nook. |
| Baseline connection edit and history | Stair naming/rotation and lift placement worked. A lift drag changed position from `[3.25, -1.5]` to `[3.5, -1.25]`. One Undo restored the whole drag; Redo restored it. |
| Baseline preview/export/reopen | The 3D view showed the ground rooms, actual door/window/passage cutouts and a connection planning marker. The exported canonical plan equaled the authored plan. Browser reload restored the same plan. No remote save was needed. |
| Candidate desktop palette drags | Door, Window and Passage each added one opening: total 3 → 6. Stairs and Elevator each added one connection: total 2 → 4. |
| Candidate invalid and valid destinations | Reload refit the plan. My first drop used a former coordinate that was now inside a room. The red “Door · move to a wall” ghost rejected it without mutation. Moving to the visible wall produced the green “Door · release to place” ghost and placed the door. This was a useful recovery cue, not a placement failure. |
| Candidate touch openings | Touch-drew one room, then dragged Door, Window and Passage from the toolbar onto its edges. Opening counts became 1, 2 and 3. No page text was selected. |
| Candidate touch levels/connections | A stair attempt with only Ground showed inline “+ Level.” Tapping it created Level 2 at 2.7 and selected that new level. I drew its room, then touch-dragged Stairs and Elevator; both linked Level 2 to Ground. The status explicitly stated the endpoint pair and pointed to the inspector for changing the destination. |
| Candidate touch history | One Undo removed the last dragged elevator. Redo restored the exact mobile plan. |

## What I learned about using it

The room-first invitation works. Dragging a rectangle gives a recognizable room with dimensions and editable corners; I did not need a prewritten plan file to begin. Click-tool-then-wall remains useful alongside dragging. The new ghost makes the required wall target much easier to understand, especially when the plan has been refitted.

The inline level action helps on a phone because the main level controls sit below the canvas. It does switch the user to a new empty level. That is a meaningful context change: the visible level name and “Level added” status explain it, but someone intending only to finish the pending stair still needs to choose where to continue. The later endpoint status, “Elevator: Level 2 → Ground. Edit the destination in the inspector,” makes the automatic connection choice explicit.

The phone inspector is a long vertical surface. Opening dimensions, level elevation and connection destination are available, but changing them requires moving away from the canvas and back. This is workable for this small set; repeated comparison between exact properties and the drawing remains the main spatial-editing friction I encountered.

The 3D preview is useful for checking openings, wall height and room adjacency. It shows the active level, as its status says. It does not give me an immediate view of the complete multilevel stack. I would still want a section or all-level overview for the Lighthouse work. Stairs and elevators are honestly presented as planning footprints, not completed circulation assets.

Room names are visible on the plan, while connection footprints primarily show their type and destination. My custom Rain stair / Small lift names remained available in the item selector and inspector. With more connections, seeing those custom names on the plan would make orientation easier.

## Evidence and limits

- [Ground rooms and connections](09-ground-complete.png)
- [Actual baseline 3D preview](10-baseline-preview.png)
- [Invalid destination ghost](12-candidate-drag-ghost.png) and [valid destination ghost](14-candidate-valid-door-ghost.png)
- [Candidate with all five desktop drags](15-candidate-five-drags.png)
- [Touch openings](17-mobile-touch-openings.png)
- [Inline level guidance](18-mobile-needs-level.png)
- [Touch-created level connections and endpoint status](20-mobile-connected.png)

The baseline on-disk editor hash observed before play was `c85a0f9219e1df8b7a4bae848bcba89c0918b7ded4b73b4da60bbcfcd20209df`; CSS was `fa5e08d6587e23c41525de6a60fce823c63de12ee60e77c94cde1a5574dad552`. During candidate play, a read of the served editor and current disk file matched at `305b882bc538493face36451d1348b8728e38658ccc21a96f4ebdbbab7707990`. Work was concurrent; these observations do not claim the candidate was frozen for the entire encounter.

The baseline Active level control did not resolve through its accessible label. After candidate reload, it did: the accessibility snapshot reported a combobox named “Active level.” A separate automation ambiguity from hidden fields sharing “Name” was resolved by selecting the visible textbox; I am not counting that as a user-facing failure.

Desktop runtime observation collected two Astro development-toolbar audit-module fetch errors. I have not attributed those to the floor-plan editor. Desktop request observation recorded no non-read HTTP request. No production save/message was attempted in either context. The mobile error listener was attached later, so it cannot certify the absence of earlier mobile exceptions.

Root reports that separate QA found a text-node selection exception and a rapid-touch polygon completion problem, and that the final UI work adds their fixes plus a more explicit level-switch message. I did not independently reproduce those defects in the rectangle-based play above or reload that final edition. QA owns their receiving. This completed Halp report claims only the baseline/candidate actions and observations described here; it does not extend those results to an uninspected final revision.
