# Independent lens and body-temperature receiving

The final current-source pass completed **32 focused checks with zero JavaScript page errors**, with actual desktop and mobile images personally reviewed. The earlier UI/history/save run completed 40 automated assertions with zero JavaScript page errors. Functional UI, backward omission, Undo/Redo and actual local save/fresh mobile reopen passed. That earlier receipt is **not a final visual pass**: personal image review caught mobile screenshots one rendered preset behind under software WebGL. The original pixels and receipt remain unchanged as historical evidence, with that limitation recorded explicitly.

## Received behavior

- A legacy local take still omits `tripLens`, `tripBodyTemperature` and per-light `lens` fields when reopened. Its body remains linked.
- An explicit 6500 K body stays neutral while five external temperatures change spill color. Re-enabling the link removes the override and applies the warm body tint. Undo/Redo restores both states.
- Four desktop presets produce distinct actual images: compact head glow, eight-ray starburst, a long horizontal streak and optical reflections. The desktop images were personally viewed. This first source version still includes rays in the Multi-Iris preset; the later current-source capture must verify the new rays-off default.
- Three consecutive component edits survive three Undo and three Redo operations. Head and each hand retain independent lens settings; attachment points stay on the head and measured hand endpoints.
- Neutral Trip remains white with handles shown and after a fresh saved-take reopen. This specifically guards the earlier black-body mask regression.
- A local API save returned HTTP 200 and `shared:false`; a new mobile browser context reopened appearance, both per-hand lens configurations and pose. An actual CDP touch drag edited ray strength, and touch Undo/Redo restored it.

## Evidence limits

`receiving.json` pins all eight tested JavaScript files. It uses optics `15a45175…`, before the rays-off Multi-Iris revision `029b264c…`. Current-source behavior is not silently attributed to that older receipt.

DOM input-event checks exercise real handlers but are not described as physical pointer interactions. The mobile ray-strength drag used actual CDP touch events. Tests use Chromium with software WebGL and mobile emulation, not native Android or a physical ACHE station. No live Send to Crew was performed. All contexts from this run were closed.

The mobile pixel files are one preset behind: `mobile-starburst.png` shows compact glow, `mobile-anamorphic.png` shows the starburst, and `mobile-glass.png` shows the streak. Their numeric differences are real, but their filenames do not establish the selected preset was rendered. A subsequent narrow capture must await completed scene frames and inspect active optical configuration. Dan's later request to repair glow beneath grounded feet also remains outside this historical receipt.

## Final current-source receiving

`current-source-receiving.json` is the separate passing receipt. It pins appearance `88429419…` (ground support correction), optics `029b264c…` (Multi-Iris rays off), and the then-current core. The earlier UI/save/history suite was not repeated.

Each optical capture waits four completed scene frames and checks the active optical controller's `inspect().lens` against the selected snapshot. All four styles now render under their correct names on desktop and mobile. Their actual pixels differ, and all eight current style images were personally reviewed. Multi-Iris is deliberately subtler, with faint optical discs and no default radial rays. The harness wraps the optical factory only to retain read-only diagnostics; no application file was changed.

The same focused pass confirms fresh floor height 0, preservation of an old saved explicit height -0.005, warm/neutral/cool buttons 2700/6500/10000 K with the independent 6500 K body retained, and head flare Off at high body glow. Two local foot support masks are active while grounded, disappear when the root lifts 0.12 units, and clear when the floor is hidden. Grounded and lifted actual images were reviewed on both viewport sizes. Neutral Trip remains white after controls are shown. All browser contexts were closed.

Current images use the `current-desktop-` and `current-mobile-` prefixes; historical captures and their limitations remain available. These are technical receiving results, not a new claim of artistic approval or testing on physical ACHE hardware.
