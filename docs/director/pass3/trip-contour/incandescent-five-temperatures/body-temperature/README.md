> This linked body-and-light option is retained. The newer [balanced-body/colored-light experiment](../neutral-body-colored-light/README.md) is a separate selectable option, not a replacement.

# Trip body and light: five incandescent temperatures

This revision follows Dan's correction that Trip himself must respond to the deliberately changed white balance. Body albedo and emission now receive the same normalized temperature tint as emitted light, blended in with incandescent intensity. The low LED base remains nearly uncolored;6500 K remains neutral. The frozen character asset and its white identity are unchanged.

[Five-panel comparison](five-temperatures.png) · [Responsive gallery](index.html)

- [Cool:10,000 K](01-10000K.png)
- [Cool-neutral:8,000 K](02-8000K.png)
- [Balanced neutral:6,500 K](03-6500K.png)
- [Warm-neutral:4,500 K](04-4500K.png)
- [Warm:2,700 K](05-2700K.png)

The approved incandescent glow intensity, outline, pose, camera and room are preserved. Flare is off. Warm Trip now visibly warms through the lit body and its shading; cool Trip acquires a cool cast. The body is no longer kept hard white while only the room changes.

[Receiving](receiving.json):11 checks pass, five actual802x802 Chromium captures, zero page errors. Each temperature retains the fixed physical take and uses matching body/emitted-light tint. The five-panel sheet is a browser screenshot of the unmodified render PNGs in HTML. Individual JSON files retain exact state and source hashes.

The earlier parent-directory sheet is retained as superseded by this body-temperature correction. Temperature values are artistic display controls, not calibrated spectral measurements. This renderer pass also includes the separate head-optics and helper-stencil fixes, but flare is off here; their own tests are recorded separately.
