# Trip: scene-dependent separation trial

This is a **runtime-only comparison**, not an implemented appearance change or a new permanent Trip outline rule. Dan's direction is: “I use lines where needed for separation and I let the scene dictate how to render Trip's defined outlines vs implied boundaries.” These still images test tools for that choice in this particular white room.

For the raised-arm shot, the brighter key/fill/rim recipe plus the thin contour gives the clearest combination of broad white areas, rounded volume and outer separation among the tested candidates. Lighting alone restores brighter white areas and models the form, but some bright boundaries merge into the room. The same brighter recipe reveals Ouch's head, torso and arm volume while Ouch still reads black. This is evidence from this white-room setup; a black-on-black scene was not tested.

The generic outline remains incomplete as an artistic solution: it runs around the visible outer silhouette, rather than deliberately choosing individual marks. In the receiver-wrap pose, the forearm crossing the head still depends largely on soft shading. There is **no phone prop** in that preset; this was a bare arm/hand overlap test, not a test of holding an actual object. Neither candidate width solves that interior separation.

## Actual images

All links are unpainted browser screenshots. Joint controls are hidden. The first contour series still contains stage-toolbar fragments around the edges; later lighting comparisons also hide those overlays. Phone images are captured at CSS-pixel scale, not enlarged device-pixel scale.

| Comparison | Desktop | Mobile |
| --- | --- | --- |
| Existing light / no line | [Raised arm](desktop-raised-arm-light-study-baseline.png) | [Raised arm](mobile-raised-arm-light-study-baseline.png) |
| Existing light / thin line | [Raised arm](desktop-raised-arm-light-study-contour-only.png) | [Raised arm](mobile-raised-arm-light-study-contour-only.png) |
| First lighting candidate / no line · too gray | [Raised arm](desktop-raised-arm-light-study-lighting-only.png) | [Raised arm](mobile-raised-arm-light-study-lighting-only.png) |
| Brighter lighting / no line | [Raised arm](desktop-raised-arm-light-rebalance-lighting-only.png) | [Raised arm](mobile-raised-arm-light-rebalance-lighting-only.png) |
| Brighter lighting / thin line | [Raised arm](desktop-raised-arm-light-rebalance-lighting-and-contour.png) | [Raised arm](mobile-raised-arm-light-rebalance-lighting-and-contour.png) |
| Receiver-wrap / medium line · overlap limit | [Bare arm over head](desktop-holding-phone-medium.png) | [Bare arm over head](mobile-holding-phone-medium.png) |
| Ouch / existing light | [Raised arm](ouch-desktop-raised-arm-light-study-baseline.png) | Not tested |
| Ouch / brighter light | [Raised arm](ouch-desktop-raised-arm-light-study-lighting-only.png) | Not tested |

The contour-only series also includes neutral, raised-arm and receiver-wrap poses with no outline, width0.0025 and width0.005, on both screen sizes. Width0.005 is a more emphatic edge; width0.0025 is the thin candidate used with lighting. Both are scene-unit widths and their apparent thickness changes with camera distance.

## Controlled scene and exact settings

Every comparison holds geometry, pose, white room, camera and material fixed within the paired images. Trip retains the existing PBR albedo **[0.78,0.78,0.74]**; Ouch retains **[0.025,0.028,0.026]**. Roughness is0.7400000095367432, metallic0. No geometry, face detail, texture, background-color change or gray-body material was introduced. The browser material remains the existing approximation of the native clay material.

Camera: perspective, target[0,0.59,0], radius2.45, alphaπ/2−0.35, betaπ/2−0.11, fov0.62. The square canvas is802×802 CSS pixels on the desktop1440×1000 viewport and approximately354×354 on the390×844 phone viewport. Desktop uses DPR1; phone emulation uses DPR3 with the existing renderer cap of2. The comparison uses Chromium/SwiftShader, not a physical ACHE handset.

| Light | Existing | First candidate | Brighter rebalance |
| --- | --- | --- | --- |
| Hemisphere fill intensity | 0.8 | 0.35 | 0.65 |
| Key intensity | 1.3 | 1.65 | 2.3 |
| Rim intensity | 0 | 1.65 | 2.0 |

All light diffuse/specular colors are[1,1,1]. Fill points[0,1,0], with unchanged ground color[0.55,0.58,0.54]. Existing key position is[−2,4,3], direction[0.4,−1,−0.5]. Both candidate recipes use key position[−3,4,3], direction normalize([0.75,−1,−0.7]) = [0.5235036096,−0.6980048128,−0.4886033689]. Rim position is[3,1.2,−4], direction normalize([−0.6,−0.2,1]) = [−0.5070925528,−0.1690308509,0.8451542547]. This changes a combined lighting recipe; it does not isolate the rim's contribution from key and fill.

The first lighting candidate visibly darkens broad parts of Trip and produces a long visible ground shadow. In the brighter rebalance the ground shadow is no longer clearly defined in these captures. The floor and existing shadow-generator settings were retained; no separate shadow generator was added to the rim. This is a recorded change in the resulting image, not a claim that a single parameter caused it.

Outline: Babylon `renderOutline`, charcoal **#252624**, width0.0025 or0.005. It is normal-expanded contour rendering, not triangle-edge wireframe. It preserves the existing shading across the interior, and does not add anatomical or facial marks.

## Receiving and limits

[trial.json](trial.json) contains18 contour captures. [lighting-trial.json](lighting-trial.json) contains8 baseline/contour/first-light/both captures. [lighting-rebalance.json](lighting-rebalance.json) contains4 brighter-light captures. [ouch-lighting-trial.json](ouch-lighting-trial.json) contains2 Ouch captures. All completed without page errors. Maximum pose drift is2.22e−16 from quaternion normalization; camera drift is0. No production JavaScript or model asset was edited by these trials.

Raised-arm and receiver-wrap contours follow the posed body rather than leaving a construction-rest silhouette. Newly compiled outline passes3/5 use **8 bone influences and3 morph-position influences**, including the receiver-wrap morph at1. The full shader attributes/defines and pose snapshots are in the receipt. This supports the skin/morph path; no temporal line-crawl or animation-flicker approval is claimed from still captures.

The native/model identity remains pinned by each snapshot. These experiments changed browser objects only. **Saved takes do not currently persist these lighting or outline settings**: the take schema retains the camera, background, look and pose, while the experimental light/line configuration lives only in these receipts. Closing or reloading the trial room returns to the implementation's normal rendering.

Source basis: Bee's `Trip-visibility-source-study/source-study.md`, Dan's forest1/287 and storyboard2/149 (opened individually by this renderer), and Bee's reported night1/243 comparison. Source markings inform the purpose of separation; none of those images prescribes these numerical shader/light settings. The first gray lighting candidate stays in the record as an unsuccessful white-identity balance. The brighter+thin combination is a provisional shot treatment for review, not a blanket recommendation to ink every Trip boundary.
