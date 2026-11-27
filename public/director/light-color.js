/* HSL recipes and a monotonic playback clock. Save the recipe, not this clock's
 * elapsed time; a newly opened scene starts again at the selected hue. */
(() => {
  'use strict';
  const clamp = (value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  const wrapHue = value => ((value % 360) + 360) % 360;
  function recipe(config) {
    if (!config || !['hsl', 'cycle'].includes(config.mode)) return null;
    return {
      mode: config.mode,
      hue: wrapHue(Number.isFinite(config.hue) ? config.hue : 0),
      saturation: clamp(config.saturation, 0, 1, 1),
      lightness: clamp(config.lightness, 0, 1, .5),
      periodSeconds: clamp(config.periodSeconds, .5, 3600, 60),
    };
  }
  function resolve(config, seconds = 0) {
    const value = recipe(config);
    if (!value) return null;
    const elapsed = Number.isFinite(seconds) ? seconds : 0;
    // Reduce elapsed before multiplication so a long session stays precise.
    const phase = value.mode === 'cycle' ? (elapsed % value.periodSeconds) / value.periodSeconds : 0;
    const hue = wrapHue(value.hue + 360 * phase) / 60;
    const chroma = (1 - Math.abs(2 * value.lightness - 1)) * value.saturation;
    const x = chroma * (1 - Math.abs(hue % 2 - 1));
    const offset = value.lightness - chroma / 2;
    const channels = hue < 1 ? [chroma, x, 0] : hue < 2 ? [x, chroma, 0] :
      hue < 3 ? [0, chroma, x] : hue < 4 ? [0, x, chroma] :
        hue < 5 ? [x, 0, chroma] : [chroma, 0, x];
    return channels.map(channel => channel + offset);
  }
  function createClock(nowMilliseconds = () => performance.now()) {
    if (typeof nowMilliseconds !== 'function') throw new TypeError('A color clock needs a time function.');
    let lastNow = 0;
    const now = () => {
      const value = nowMilliseconds();
      if (Number.isFinite(value)) lastNow = Math.max(lastNow, value);
      return lastNow;
    };
    let anchor = now(), storedSeconds = 0, paused = false, recipeKey = 'null';
    const seconds = () => storedSeconds + (paused ? 0 : (now() - anchor) / 1000);
    const restart = () => { storedSeconds = 0; anchor = now(); };
    return Object.freeze({
      configure(config, { restart: forceRestart = false } = {}) {
        const nextKey = JSON.stringify(recipe(config));
        if (forceRestart || nextKey !== recipeKey) restart();
        recipeKey = nextKey;
      },
      seconds,
      pause() {
        if (!paused) { storedSeconds = seconds(); paused = true; }
      },
      resume() {
        if (paused) { anchor = now(); paused = false; }
      },
      restart,
      isPaused: () => paused,
    });
  }
  globalThis.DirectorLightColor = Object.freeze({ resolve, createClock });
})();
