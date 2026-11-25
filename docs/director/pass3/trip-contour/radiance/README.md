# Broad radiance prototype · superseded

Dan subsequently rejected this wider field as too foggy. His governing correction calls for sharper edge falloff, stronger local contrast and material emission; optical flare belongs to an extreme, scene-specific event. These files remain superseded technical evidence, not an accepted final glow. The follow-up is `../sharp-radiance/`.

Dan accepted the preceding white, rounded Trip as a base but could not read its glow. This is one new runtime-only candidate against that exact base, after C.B., Bee and Halp returned to actual Dan art.

The asset agent read all three attributed studies and individually opened the 1024px displays of forest3/65, purple/white rim1/277, and campfire1/244. Dan subsequently identified forest3/65 (the same composition as Bee2/115) directly as Trip, made using his own photographs. The public study retains that identification without the private autobiographical account. The forest has a small bright center with a much broader field affecting nearby foliage. The purple form makes its white inner edge bright through a substantial surrounding progression. The campfire relates source, lit head rim and reflected flame while preserving dark forms. Those observations motivated wider radiance and a receiving set piece, not a copied painting or compulsory lens flare.

`trial.json` pins the frozen core and base appearance source, all four actual browser captures and exact runtime settings. Desktop and emulated mobile each compare `*-base.png` to `*-radiance.png`. Pose, camera, body material, room, and receiving block stay fixed. The single candidate changes only halo and derived spill. The actual portal appearance module was not edited for this comparison.

The candidate retains pure-white albedo, neutral emission `.45`, body geometry/skin/morphs and roughness. It uses two outer-only Babylon HighlightLayers with half-float main textures so source color amplitude survives above1 before blurring:

| Field | Main texture ratio | Blur kernel at802px render width | Color amplitude |
| --- | --- | --- | --- |
| Broad | .25 | 80 | 8 ×8500K tint |
| Tight | .5 | 24 | 2.5 ×mix(tint,white,.75) |

Both blur dimensions scale by render width/802. The tight field provides a bright near edge; the broad field occupies noticeably more surrounding space. Both use additive composition and exclude the body interior via the same stencil reference. The prototype explicitly shares Babylon9.37.1's internal HighlightLayer stencil reference; that dependency needs to remain bounded and documented if promoted. Without that sharing, one layer could incorrectly wash over the body marked by the other.

The real PointLight at `torso.upper` increases from base intensity8 to16, with unchanged8500K tint/range4/radius.12. A neutral-gray PBR block at `[.45,.325,-.05]`, dimensions `[.28,.65,.35]`, albedo `[.18,.18,.18]` and roughness.8 receives it. The top and floor brighten; the block's front/side remain dark. There is no new point-light shadow map, so dark faces demonstrate orientation/directional response, not a new proof of shadow occlusion.

Ambient `.35`, key1.65, room background `[.005,.005,.008]`, floor `[.025,.025,.03]`, camera radius2.45/target `[0,.59,0]`, and raised-arm pose match between base/candidate. All four captures completed with zero browser errors. At phone size the new field remains visible beyond the body, and internal head/torso/limb shading remains. This is an actual-pixel technical observation, not Dan's acceptance or a completed artistic goal.

The same additive-alpha limitation remains: an opaque stage shows the field, while transparent cutout export does not yet retain it. No shader/alpha detour was added to this bounded source-art comparison.

## Promoted module and continuous control

After C.B. and Bee individually viewed the actual comparison, C.B. authorized promoting this direction into `public/director/appearance.js`. This is authorization to implement the visible improvement, not a claim that Dan has accepted the finished glow.

The final continuous mapping uses `g=0` for no halo and no derived spill. Body emission remains `.35+.10*g`, albedo white. Tight-field color is `mix(temperatureTint,white,.75) * 2.5*g`; broad-field color is `temperatureTint * 8*g²`. Nominal blur kernels are `4+20*g` (tight) and `16+64*g` (broad), scaled by `clamp(min(renderWidth,renderHeight)/802,.25,2)`. Resize is received during the render loop, with no repeated layer allocation. The derived point-light intensity is `16*g²`; range4/radius.12 and body/helper exclusion are unchanged. Layers and the point light are created lazily when Trip first has nonzero glow, disabled for zero glow/Ouch, and disposed with their observers/material clones when the controller is disposed.

The stage can therefore retain the ordinary white base at zero, a modest LED-like surrounding field at low values, a more visible warm field/spill in the middle, and the broader high field. Temperature affects halo/spill rather than painting the body. No literal rays or flares are forced onto every shot. Outline tone and width remain independent.

The high-amplitude field relies on half-float render-target support. Where that capability is absent the controller falls back to an unsigned-byte target; the source amplitude then clips and the broad field may be weaker. Software Chromium used in these receipts supports half-float targets. Actual physical ACHE performance/compatibility remains a separate receiving task.

`module-receiving.json` pins the actual module and integrated Director source used for UI input-event tests and screenshots. HMR was blocked only to keep those sources fixed during the comparison. The test adjusts the real editor's pose, appearance, light and stage controls and captures actual rendered pixels; it makes no shared save/send. Additional create/apply/dispose checks run in that same real scene. Mobile means Chromium touch/DPR3 emulation, not a physical-device claim. The current additive export-alpha limitation remains unchanged and explicitly out of this iteration's scope.

Integrated receiving completed21 checks and failed the resize assertion. Babylon9.37.1 recreates blur postprocesses from constructor options and its vertical public setter does not update the active non-combine vertical postprocess; medium-state pixels therefore show unintended horizontal streaking. No final passing claim or deployment is attached to that receipt. The next prototype explicitly controls both active blur axes.
