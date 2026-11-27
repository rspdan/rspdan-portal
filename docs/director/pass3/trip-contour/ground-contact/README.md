# Trip: contact-aware exterior glow

Dan approved the [contact-on render](local-mask/contact-on.png): the feet read as planted while the light still extends beyond the black outline. That appearance is preserved here. The [updated five-temperature comparison](../incandescent-five-temperatures/neutral-body-colored-light/grounded/README.md) combines it with the neutral white body and independently colored exterior light.

The original posed soles were about 0.00505 world units above the old floor at −0.005. The new default floor is zero; explicit saved floor heights remain intact. No root or pose is snapped. A local mask now attenuates the screen-space exterior glow where the actual deformed sole meets an enabled supporting floor or Stage surface. The surface edge, white shaded body and glow away from contact remain visible.

[Standing](receiving/standing.png) · [Close low angle](receiving/low-angle-contact.png) · [One foot lifted](receiving/left-foot-lifted.png) · [Floor hidden](receiving/floor-hidden.png) · [Stage platform](receiving/stage-platform-contact.png) · [Above platform](receiving/above-platform.png)

The implementation caches 1,922 candidate sole vertices from the 23,134-vertex character. Stationary renders reuse the posed footprint; bone, morph or world-transform changes refresh it. A short downward ray finds the real support and its plane. The mask follows that plane, is bounded to the support, and fades as the foot lifts. Tests cover the floor, a raised floor, and a box platform. This is a local support approximation, not a collision solver or complete volumetric light simulation.

The focused receipt preserves two test-fixture findings transparently. The [first run](receiving-first-fixture-name-failure/receiving.json) stopped because its platform assertion expected the user-facing object name instead of Stage's internal mesh name, although both contacts were already on the correct platform plane. Its camera restore order also produced empty later views; the corrected fixture restores target before orbit angles. The [next run](receiving/receiving.json) passed all ten contact, cache and pose checks, then an immediate observer-count check failed because Babylon defers removal to the next timer task. [Settled disposal](disposal-check/receiving.json) passes after the deferred removal. The [combined final receipt](final-receiving.json) records all eleven checks passing with zero page errors. No application change was made for either fixture finding.

The side-view capture in `receiving/side-contact.png` is obstructed by the receiving block and is not used as contact evidence. The close low-angle image is the valid oblique contact check. The five-temperature gallery and linked full images are actual browser renders, with no retouching.

Independent receiving covers current desktop/mobile controls and persistence. Browser emulation does not establish physical ACHE performance.
