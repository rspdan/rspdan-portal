# Bee · Phone inspector and building-view play

Recorded 2026-11-25T09:02:26Z. **The frozen candidate resolves the phone navigation problem in this bounded play and makes the whole-building relationships useful.** Bee used the actual local UI on desktop and emulated touch; this is not physical-phone or production receiving.

I imported [Bee's earlier invented pocket studio](../../floorplan-play/bee/Bee-pocket-studio.export.floorplan.json), then used the UI to add **Understage** at −2.5 with a 2.2 wall height and a drawn room, plus an empty **Open sky idea** level at 8.1 with no room. Warm-up remains at 0 and Light loft at 3.2. I renamed one connection **Quiet stair** and changed its destination to Understage. This is a test set, not Lighthouse canon.

## Completed actual play

| Exercise | Observed result |
| --- | --- |
| Select a door, pan, edit its width and Return to plan | No input focus or page jump on selection. Width edit applied. The final Return preserved the exact selected opening and the exact panned room bounds relative to the canvas. |
| Scroll the fixed phone inspector | A touch swipe moved the inspector 218px while document scroll remained 0. The tabs stayed visible, and the canvas stayed in place. [Actual scrolled view](phone-fixed-inspector-scrolled.png). |
| Inspect all four levels on desktop and phone | Correct highest-to-lowest order: 8.1, 3.2, 0, −2.5. Different wall heights remained labeled. The empty level showed no invented footprint. [Desktop relationships](desktop-building-overview.png), [floor cards](desktop-building-floorcards.png), [phone levels](phone-fixed-building-levels.png), [phone empty level](phone-fixed-building-connections.png). |
| Open Building, then follow Quiet stair's Understage endpoint | Opening the overview left the full plan unchanged. Following the endpoint selected Understage and returned to its editable plan; all authored data except activeLevelId remained identical. [Actual return](phone-overview-to-understage.png). |
| Switch to Light loft beside the canvas, drag a Window onto its wall, Undo and Redo | Window count went 0→1→0→1. The final message named Light loft, and the opening was visible. [Actual redone window](phone-upper-window-redone.png). |

The overview exposed a useful problem in **my test layout**: Quiet stair's footprint extends beyond the smaller Understage room. The [floor card](phone-fixed-building-floorcards.png) makes that mismatch visible without silently correcting my geometry. That is precisely the kind of cross-level judgment the active-floor view alone made harder.

The Selected/Level/Plan split and nearby level selector reduce the old inspector round trip. The fixed inspector scroll and sticky tabs make Return to plan dependable in the tested sequence. Busy small plans can still have overlapping labels; that remains a composition observation, not a material defect or a request for more changes in this pass. The mini-plan cards explicitly fit independently, and the elevation spacing is explicitly schematic.

## Evidence identity and limits

Final phone response bytes match the supplied freeze: editor `61331e6a…`, editor CSS `70d9d99…`, overview `4f5bbe96…` / `8e97f0f2…`, and shared CSS `a2b289dc…`. [Loaded response hashes](loaded-assets.json) retain the full values and encounter times. [Receiving record](receiving.json) pins screenshots and separates personally opened captures from retained captures. The [final plan](final-plan.json) and [actual action transcript](session-actions.json) remain reusable evidence.

The earlier candidate preserved selection but its sticky canvas could hide inspector navigation. C.B. identified that defect; the fixed workspace was refreshed and received separately. [Pre-layout observations](prelayout-observations.json) remain historical. One earlier harness action targeted the Selected dropdown while the Level tab was active; its hidden-control timeout is not an app-failure claim.

Local Chromium, desktop 1440×1000 and touch-emulated 390×844; no physical handset or operating-system keyboard coverage. Three retained errors concerned the Astro development-toolbar audit import; no claim of a completely error-free browser. Bee made no product/native edits, production saves, Crew sends or commits. No additional polish or unrelated testing followed this receiving.
