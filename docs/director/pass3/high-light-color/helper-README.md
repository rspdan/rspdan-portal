# Light-color helper receiving

`public/director/light-color.js` is the reviewed scratch prototype promoted without changes. Its SHA-256 is `97a8343add6f1dbac5fe9a0639d608f5f695b06eec1510dffee377b02b478ba0`.

The 23 bounded pure checks in `helper-tests.cjs` cover HSL corners, hue/time wrapping, loop continuity, constant saturation/lightness, long playback, numeric boundaries, source immutability and clock lifecycle. They evaluate the browser-classic script in an isolated JavaScript context with an injected clock. They are helper checks, not browser UI or artistic acceptance evidence.

Run from the repository with `node docs/director/pass3/high-light-color/helper-tests.cjs`. The promoted module also passes `node --check`.

## Contract

`DirectorLightColor.resolve(config, seconds)` returns an RGB array for `hsl` or `cycle`, and `null` for absent/temperature mode so existing Kelvin behavior remains available. Hue wraps; saturation and lightness remain fixed during cycling. One complete cycle takes `periodSeconds`. Missing HSL fields use hue 0, saturation 1, lightness .5 and period 60. Saturation/lightness clamp to 0–1 and period to .5–3600 seconds.

`DirectorLightColor.createClock(nowMilliseconds)` accepts an optional monotonic time function (default `performance.now`). Its methods are `configure(config, {restart})`, `seconds`, `pause`, `resume`, `restart` and `isPaused`. A matching normalized recipe preserves elapsed time; a changed recipe resets it. Restart and reconfiguration preserve explicit pause state. Start actions may call resume separately.

Absent and temperature recipes canonicalize to the same null recipe. Switching from a color recipe to temperature resets elapsed at that instant; reapplying temperature leaves its unused clock unchanged. Entering a color cycle later resets to the selected hue.

Core owns one live preview clock. It is independent of pose frames, ranges and animation playback. Only the recipe is serialized; elapsed preview time is never saved. A newly opened scene starts at the selected hue. `optics.js` remains unchanged by this work.
