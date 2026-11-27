> Dan rejected this optical appearance (a streak with added shapes). These checks establish functionality only; they do not establish an accepted lens-flare design. A later lens-type study supersedes it.

# Head optics and temperature integration

The appearance controller now delegates the optional head flare to `DirectorOptics`. Its source remains centered on the bound head geometry and follows the head; `tripFlare` remains independent from body glow. The optical module responds to camera/source movement and occlusion. Its dedicated movement tests are recorded separately by the optics module author.

Body temperature is also integrated: neutral6500 K and the low LED base retain the uncolored white appearance, while incandescent warm/cool settings visibly tint body albedo and emission along with emitted light. The [five-temperature body comparison](../incandescent-five-temperatures/body-temperature/README.md) holds the approved glow intensity fixed.

[Receiving](module-receiving.json):35 checks pass, nine actual browser captures, zero page errors. Desktop and mobile Chromium touch/DPR3 emulation verify appearance state, temperature response, head-following source movement, independent flare at body glow0, full occlusion/behind-camera rejection, Ouch disabling effects, bounded repeated application/disposal, and both blur axes after resize. Source modules were pinned against concurrent edits and HMR. This is technical receiving, not final artistic approval of the new optics.

- [Desktop head flare](desktop-head-flare.png)
- [Mobile head flare](mobile-head-flare.png)
- [Desktop incandescent warm](desktop-module-medium-warm.png)
- [Mobile incandescent warm](mobile-module-medium-warm.png)

## Outline mask repair

The post-glow contour initially relied on the character stencil remaining available at the end of the scene. Visible editor handles use a later rendering group that clears depth/stencil, so a reopened take with handles visible could draw the whole Trip silhouette black even though its actual material remained white. The glow and contour now compose in character rendering group0, before editor helper groups clear those buffers.

Independent runtime causality was established by changing only that render-group setting on the failing saved take: [before/after probe](../../effects-receiving/black-render-group0-probe.json). Fresh integrated reopen/Undo/mobile receiving is owned by the independent effects reviewer and recorded in that directory.

The previous five-temperature images remain valid fixed-camera, no-flare captures. The old body-hard-white sheet is explicitly superseded by the body-temperature comparison. Transparent halo export and native Blender parity remain outside this pass.
