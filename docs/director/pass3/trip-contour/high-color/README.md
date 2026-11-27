# Trip: HSL color and cycling light

This study adds optional HSL light colors to the approved grounded incandescent appearance from commit `41929281b15a25a9192ac6f878d5816ee588b691`. The temperature path, glow falloff, contact mask, outline, intensity, geometry and pose are unchanged.

[Six-hue comparison](six-hues/six-hues.png) · [Responsive gallery](six-hues/index.html) · [Saturation and lightness](six-hues/saturation-lightness.png)

The six primary/secondary hue examples use saturation 100%, lightness 50%, `tripGlow=1`, no head flare, and an independent body temperature of 6,500 K. Trip stays white inside the black outline while the exterior light and receiving surfaces change color. These are actual browser captures assembled in an HTML gallery without retouching.

The optional take field is `tripLightColor: {mode, hue, saturation, lightness, periodSeconds}`. Modes are `temperature`, `hsl`, and `cycle`; omitted configuration follows the existing temperature path. Core owns one independent preview clock and passes its elapsed seconds to `appearance.setLightTime(seconds)`. The color recipe is saved; elapsed preview time is not. Cycling updates existing material colors, the retained halo color, light colors and optional optical source color without creating new render resources or rebuilding the mask.

The body can remain independently white or follow the active light. In linked HSL mode, active colored light tints the body; at zero lightness, emission becomes zero and the underlying material returns to white, lit by the set. Zero saturation keeps the material neutral rather than painting it gray. This is an artistic control mapping. An explicit body-temperature override remains independent of exterior saturation, lightness and cycling.

All five preceding temperature PNGs remain byte-identical, and an explicit temperature-mode frame after using HSL and cycling has identical pixels to the approved neutral frame. The completed high-color study has 25 passing state/pixel checks and 15 captures; the separate temperature run has 11 passing checks and five captures. Both report zero page errors. Contact and white-body samples are checked across the six hues. Additional endpoint and cycle/pause checks are recorded in the [study receipt](six-hues/receiving.json), [temperature receipt](temperature-regression/receiving.json), and [pixel comparison](pixel-receiving.json).

Two preliminary fixture receipts are retained: `temperature-regression/startup-before-helper-include.json` began before the new helper script was included, and `six-hues/collapsed-control-fixture.json` attempted Playwright's visibility-checked select action on the collapsed appearance panel. The completed study starts after integration and dispatches the same change/input events on the real controls. Neither preliminary receipt is evidence of the final integrated behavior.

Physical ACHE performance and native Blender appearance are not established by these browser captures. This phase does not add surface texture or change the approved light intensity mapping.
