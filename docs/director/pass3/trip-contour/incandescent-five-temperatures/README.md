> Superseded by Dan’s body-temperature correction. Use the [body-and-light comparison](body-temperature/README.md); this earlier sheet intentionally kept the body white and is retained only as comparison history.

# Trip: five incandescent temperatures

Dan approved the attached outlined body with spill as the medium incandescent appearance. This study preserves that look's exact scalar intensity and varies only temperature:10,000 K,8,000 K,6,500 K,4,500 K and2,700 K. The current renderer treats6,500 K as balanced neutral. No intensity labels or renderer formulas were changed by this comparison.

[Five-panel comparison](five-temperatures.png) · [Responsive gallery](index.html)

- [Cool:10,000 K](01-10000K.png)
- [Cool-neutral:8,000 K](02-8000K.png)
- [Balanced neutral:6,500 K](03-6500K.png)
- [Warm-neutral:4,500 K](04-4500K.png)
- [Warm:2,700 K](05-2700K.png)

Each image is an actual802x802 Chromium viewport capture. The five-panel image is a browser screenshot of the HTML gallery using those unmodified image files. Individual JSON files record exact take state, receiver light values, image hash and pinned source hashes.

[Receiving](receiving.json):11 checks pass, five captures, zero page errors. The intensity, pose, camera, room, black outline and light rig were compared against the approved `outlined-radiance/desktop-module-high-cool.png` capture's receipt. Only the generated stage object ID is excluded from physical comparison. Head flare stays off and body albedo stays white. Temperature values are artistic display controls, not a claim of calibrated spectral output.

A first harness launch failed before rendering because its route callback argument accidentally accepted a request object as response bytes. The callback was corrected; that launch produced no images and is not counted as evidence. A file-URL attempt for the comparison sheet was blocked by browser policy; the finished sheet was served entirely through a local Playwright route.

No application code, saved take, deployment or native asset was changed for this study. The author approval applies to the cited incandescent appearance, not to all prior or future glow settings.
