# Trip base: white body and retained form

Dan’s correction supersedes the preceding gray/off-white clay trials: Trip is white and made of light. This study keeps the shared Ouch/Trip geometry, flexible rig and smooth rounded volume while separating Trip’s material from Ouch’s black material. It does not add a glass shell, bulb filament, facial detail or geometry.

Dan subsequently accepted these pixels as a **base only** and said the glow was not yet apparent. Technical receiving below does not establish completion of the artistic glow goal. The source-led follow-up lives in `../radiance/`.

The base module is `public/director/appearance.js`. Its classic-script API is `DirectorAppearance.create(scene)`, returning `apply({look, tripGlow, tripTemperature, outline})` and idempotent `dispose()`. State remains owned and saved by Director’s caller. The material controller makes separate clones and restores originals on disposal. Scene meshes with `metadata.directorCharacter` receive the character appearance.

## Received base recipe

For glow control `g` from 0 to 1:

| Component | Setting |
| --- | --- |
| Trip albedo | Pure white `[1,1,1]` |
| Trip body emission | Neutral white, `.35 + .10*g` |
| Body roughness / metallic | Existing imported values, `.7400000095` / `0` |
| Outer halo | Babylon `HighlightLayer`, `innerGlow=false`, `outerGlow=true`, additive blend |
| Halo color amplitude | Temperature tint × `(.06 + .8*g²)` |
| Halo blur | Horizontal and vertical `4 + 12*g`; main texture ratio `.5`, blur texture size ratio `1` |
| Nearby light spill | Actual Babylon `PointLight`, intensity `8*g²`, range `4`, radius `.12` |
| Spill position | Follows evaluated `torso.upper` world position every render; character world-bounds center fallback |
| Spill exclusion | Character meshes and editor helpers are excluded; ordinary stage/prop materials receive it |
| Temperature | 1800–10000 K, default 6500 K; approximate display tint, normalized so 6500 K is white |
| Independent outline | Enabled switch, grayscale tone 0–1, width `.0005`–`.01`; affects both Ouch and Trip |

Temperature tints the outer halo and derived light; the body core remains neutral white. Low glow retains a subtle outer halo but emits no point-light spill. The point light is tagged `metadata.directorAppearanceLight`, is separate from the editable light list, and has no shadow generator. It is disabled with the halo when Ouch is selected. The lighting module reserves ten simultaneous material lights: eight editable lights, ambient and Trip’s derived light.

The derived point light creates actual scene illumination on the floor and nearby props. The halo is a separate screen-space effect; it does not itself illuminate geometry. This is an artistic control mapping, not a calibrated spectral light simulation.

## Actual comparisons

`dark-temperature-trial.json` pins six desktop captures made on frozen core source `951dd89f…`, before the new UI integration. All use the same raised-arm pose, geometry and camera. Dark context uses ambient `.35`, directional key `1.65`, no rim; key position `[-3,4,3]`, direction normalized `[.75,-1,-.7]`. The room background is `[.005,.005,.008]`, floor `[.025,.025,.03]`.

- `desktop-dark-led-low.png`: `g=0`, 6500 K, body emission `.35`.
- `desktop-dark-incandescent-warm.png`: `g=.5`, 3000 K, body emission `.40`.
- `desktop-dark-incandescent-neutral.png`: `g=.5`, 6500 K, body emission `.40`.
- `desktop-dark-neon-cool-retained.png`: `g=1`, 8500 K, body emission `.45`.
- `desktop-dark-neon-cool-flat.png`: same high settings but body emission `3`, a deliberately flattening counterexample.
- `desktop-white-volume-025.png`: one lower-emission white-room comparison, emission `.25`, ambient `.65`, key `2.3`, no rim. This is not a perfectly matched light comparison against the earlier `.35` image, which also had a rim light.

Root and Bee viewed the low, medium and retained-high pixels. The retained-high version preserves broad white surfaces and rounded shading while increasing the halo and cool floor pool; head/arm/leg gaps remain open. Warm versus neutral medium is subtle at full-body scale. The module retains this tested mapping rather than amplifying temperature without receiving another render.

The earlier `trial.json` and `followup.json` document why a straight body-emission ramp was rejected. Emission `1`, `3` and even `.6` under the brighter white-room setup clip the interior toward featureless white. The earlier GlowLayer normal/strong white-field stills do not demonstrate a clearly different body appearance. Those files remain historical evidence and are not the final recipe.

`appearance-receiving.json` records focused testing of the actual base module, including mobile-emulated captures, raw transparent PNG alpha, material isolation, repeated switching, derived-light following and disposal. It pins the module SHA. These are Chromium software-rendered browser tests; they do not claim physical ACHE performance or native Blender material parity. The integrated UI and save/restore are independently received by the root/integration team.

## Source and limits

`asset-inventory.json` records the actual GLB: 23,134 body vertices, eight supported skin influences, three position morph targets, normals, and no textures, images or UV coordinates. The native procedural clay/fingerprint shader was not baked into this GLB. Browser rounded form comes from geometry normals and PBR shading, not a preserved fingerprint texture. Trip need not inherit Ouch’s surface treatment to share the flexible geometry.

The outline is a controllable exterior contour, not automatic selective drawing of every internal overlap. The forearm/head contact still depends on pose and shading. The earlier `holding-phone` preset contains no phone prop; those captures test a receiver-wrap arm gesture only. Dan’s scene-dependent selective-boundary principle remains broader than a uniform outline switch.

Transparent PNG receiving confirms the background remains transparent and the body edge retains antialiasing. The current additive outer halo does **not** contribute translucent alpha to that PNG: its partial alpha values are only 64/128/192 at the body edge, with no alpha 1–32 pixels. Thus an opaque scene visibly shows the halo, while transparent cutout export currently loses it. The alpha test must not be described as successful halo export.
