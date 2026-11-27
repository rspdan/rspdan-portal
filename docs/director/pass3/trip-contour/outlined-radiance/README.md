# Outlined Trip radiance and optional head flare

This next editable comparison follows Dan's request to combine the shaded-white base, black surface boundary and light spilling beyond it. It is not an assertion of final artistic approval.

The low LED setting keeps the white base and pale dimensional shading. Through the middle range, concentrated radiance expands outside a visible contour. The outline is rendered against the character stencil after the additive field, with normal depth testing, so the light no longer erases its surface reference. White remains the body color; temperature changes the emitted field and nearby illumination.

Head flare is a separate `tripFlare` value from 0 to1, off by default. High glow does not switch it on. Its source is parented to the head and centered from that bone's bound geometry, so rotating the head moves the source. The optional flare can also be used with body glow at zero. Scene occluders and a source behind the camera suppress it. Nonphysical lighting-effect meshes do not block it.

## Actual comparisons

- [Low LED base](desktop-module-low-led.png)
- [Medium warm incandescent](desktop-module-medium-warm.png)
- [High cool, no flare](desktop-module-high-cool.png)
- [Optional head flare](desktop-head-flare.png)
- [White room with outline](desktop-module-white-outline.png)
- [Mobile medium](mobile-module-medium-warm.png)
- [Mobile high](mobile-module-high-cool.png)
- [Mobile head flare](mobile-head-flare.png)

The pose, body, camera and receiver are held fixed within each viewport comparison. These are actual Chromium canvas captures. Mobile uses390x844 touch/DPR3 emulation, not physical ACHE.

## Verification and provenance

[Combined receipt](module-receiving.json):35 checks passed, zero page errors. Checks cover UI glow/temperature values, unchanged pose and white albedo, separate head flare, head-following movement, occlusion and behind-camera rejection, Ouch disabling effects, disposal/restoration, and both actual blur axes after mobile resize.

The initial run completed23 desktop checks, then the local server stopped before the mobile context could navigate. Its [interrupted receipt](desktop-receiving-interrupted.json) is retained. After root restarted the server, the [mobile-only receiving](mobile-receiving.json) passed12 checks. These are bounded component results, not an uninterrupted full-run claim.

The earlier first candidate had a thinner field and was retained as `first-*`. An inherited harness path accidentally overwrote the preceding `sharp-radiance/receiving` files during that first candidate run. Those original pre-outline bytes were not restored, and that directory now explicitly labels the provenance. The untouched runtime-only `sharp-radiance/local-band` comparison remains historical evidence.

The skin, morphs and frozen native asset are unchanged. Transparent PNG output still does not carry this halo correctly; this pass does not claim alpha-export or native Blender parity. The field remains an editable approximation under study.
