# Balanced body, colored exterior light

Dan requested a separate experiment: Trip inside the black outline stays balanced at6500 K, with the existing white surface and shading. Only the exterior glow and projected light change through10,000 K,8,000 K,6,500 K,4,500 K and2,700 K. The approved incandescent intensity, pose, camera, room and outline are unchanged. Head flare is off, and no speculative surface texture is added.

[Five-panel comparison](five-temperatures.png) · [Responsive gallery](index.html)

- [Cool:10,000 K](01-10000K.png)
- [Cool-neutral:8,000 K](02-8000K.png)
- [Balanced neutral:6,500 K](03-6500K.png)
- [Warm-neutral:4,500 K](04-4500K.png)
- [Warm:2,700 K](05-2700K.png)

The optional `tripBodyTemperature` take field is1800–10000 K. When absent, the body remains linked to `tripTemperature`, preserving the earlier body-and-light option. When present, it controls the body separately; these frames set it to6500 K. `tripTemperature` continues to color the halo and projected light.

The exterior shader now preserves hue before additive blending rather than allowing each RGB channel to clip to white. Its spatial falloff is unchanged. This makes the halo itself change color instead of leaving a white fringe while only the floor changes. The entire neutral6500 K frame is pixel-identical to the previous balanced frame, confirming neutral intensity and falloff were preserved.

[Receiving](receiving.json):15 checks pass, five actual802x802 browser captures, zero page errors. Real UI events set the independent body temperature. Exact state, image hashes and pinned module hashes are in each image's JSON record. [Pixel receiving](pixel-receiving.json) records five interior sample points that remain identical in all five renders, a halo sample that changes from cool88/96/115 to warm114/75/41, and the changing floor/receiver colors. The comparison sheet is a browser screenshot of the HTML gallery using unmodified render images.

The earlier [linked body-and-light study](../body-temperature/README.md) is retained as another option and evidence. This experiment does not replace it. The old optical appearance was rejected; no flare is present here. Transparent halo export, physical ACHE performance and native Blender parity are not established by this study.
