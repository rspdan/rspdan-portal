// The same 23 bounded pure checks used to review the scratch prototype.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = fs.readFileSync(path.resolve(__dirname, '../../../../public/director/light-color.js'), 'utf8');
const sandbox = { performance: { now: () => 1234 } };
vm.runInNewContext(source, sandbox);
const { resolve, createClock } = sandbox.DirectorLightColor;
const checks = [];
const check = (name, test) => { test(); checks.push(name); };
const near = (a, b, tolerance = 1e-10) => assert(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
const rgb = (a, b) => { assert.equal(a.length, 3); a.forEach((value, i) => near(value, b[i])); };
const base = { mode: 'cycle', hue: 0, saturation: 1, lightness: .5, periodSeconds: 60 };
check('absent and temperature retain Kelvin routing', () => {
  assert.equal(resolve(), null); assert.equal(resolve({ mode: 'temperature' }), null);
});
check('six HSL primaries and secondaries', () => {
  [[0, [1, 0, 0]], [60, [1, 1, 0]], [120, [0, 1, 0]], [180, [0, 1, 1]], [240, [0, 0, 1]], [300, [1, 0, 1]]]
    .forEach(([hue, value]) => rgb(resolve({ ...base, mode: 'hsl', hue }, 17), value));
});
check('hue wraps both directions', () => {
  rgb(resolve({ ...base, hue: 360 }, 0), [1, 0, 0]);
  rgb(resolve({ ...base, hue: -120 }, 0), [0, 0, 1]);
  rgb(resolve({ ...base, hue: 780 }, 0), [1, 1, 0]);
});
check('HSL mode ignores supplied elapsed time', () => {
  rgb(resolve({ ...base, mode: 'hsl', hue: 25 }, 0), resolve({ ...base, mode: 'hsl', hue: 25 }, 999));
});
check('one continuous cycle returns to starting hue', () => {
  rgb(resolve(base, 0), resolve(base, 60)); rgb(resolve(base, 20), [0, 1, 0]); rgb(resolve(base, -20), [0, 0, 1]);
});
check('cycle boundary is continuous', () => {
  resolve(base, 60 - 1e-7).forEach((value, i) => near(value, resolve(base, 60 + 1e-7)[i], 1e-7));
});
check('long playback wraps without accumulating phase', () => {
  rgb(resolve(base, 60 * 1000000000 + 5), resolve(base, 5));
});
check('saturation and lightness stay fixed throughout cycle', () => {
  const config = { ...base, saturation: .64, lightness: .37 };
  for (let time = 0; time <= 60; time += .125) {
    const color = resolve(config, time), max = Math.max(...color), min = Math.min(...color);
    const lightness = (max + min) / 2, saturation = (max - min) / (1 - Math.abs(2 * lightness - 1));
    near(lightness, .37); near(saturation, .64);
  }
});
check('zero saturation, black and white are exact', () => {
  rgb(resolve({ ...base, saturation: 0, lightness: .25 }, 12), [.25, .25, .25]);
  rgb(resolve({ ...base, lightness: 0 }, 12), [0, 0, 0]); rgb(resolve({ ...base, lightness: 1 }, 12), [1, 1, 1]);
});
check('limits and invalid numbers are bounded', () => {
  rgb(resolve({ ...base, saturation: 2, lightness: -2 }, Infinity), [0, 0, 0]);
  rgb(resolve({ ...base, periodSeconds: 0 }, .5), [1, 0, 0]);
  rgb(resolve({ ...base, periodSeconds: 1e6 }, 3600), [1, 0, 0]);
});
check('resolution does not mutate source recipe', () => {
  const config = { ...base }, copy = JSON.stringify(config); resolve(config, 12); assert.equal(JSON.stringify(config), copy);
});
let now = 1000;
const clock = createClock(() => now); clock.configure(base);
check('clock starts selected recipe at zero', () => {
  near(clock.seconds(), 0); assert.equal(clock.isPaused(), false); rgb(resolve(base, clock.seconds()), [1, 0, 0]);
});
check('clock uses supplied monotonic milliseconds', () => { now = 3500; near(clock.seconds(), 2.5); });
check('same normalized recipe preserves elapsed', () => {
  clock.configure({ periodSeconds: 60, lightness: .5, saturation: 1, hue: 360, mode: 'cycle' }); near(clock.seconds(), 2.5);
});
check('pause is idempotent and freezes elapsed', () => {
  clock.pause(); clock.pause(); now = 9500; near(clock.seconds(), 2.5); assert.equal(clock.isPaused(), true);
});
check('resume excludes paused duration and is idempotent', () => {
  clock.resume(); now = 10500; clock.resume(); near(clock.seconds(), 3.5);
});
check('changed recipe restarts selected hue', () => {
  const config = { ...base, hue: 120 }; clock.configure(config); near(clock.seconds(), 0); rgb(resolve(config, clock.seconds()), [0, 1, 0]);
});
check('restart resets elapsed without changing pause state', () => {
  now = 12000; clock.pause(); clock.restart(); near(clock.seconds(), 0); assert.equal(clock.isPaused(), true);
  now = 13000; near(clock.seconds(), 0);
});
check('changed recipe while paused remains paused', () => {
  clock.configure({ ...base, periodSeconds: 10 }); near(clock.seconds(), 0); assert.equal(clock.isPaused(), true);
});
check('forced configure restart works for unchanged recipe', () => {
  clock.resume(); now = 15000; near(clock.seconds(), 2);
  clock.configure({ ...base, periodSeconds: 10 }, { restart: true }); near(clock.seconds(), 0);
});
check('new clock on reopen has no hidden elapsed state', () => {
  now = 300000; const reopened = createClock(() => now); reopened.configure(base); near(reopened.seconds(), 0);
});
check('backward or invalid injected readings cannot rewind', () => {
  now = 16000; near(clock.seconds(), 1); now = 15500; near(clock.seconds(), 1); now = NaN; near(clock.seconds(), 1);
});
check('default browser performance clock works', () => {
  const defaultClock = createClock(); defaultClock.configure(base); near(defaultClock.seconds(), 0);
});
console.log(JSON.stringify({
  passed: true, count: checks.length,
  sourceSha256: crypto.createHash('sha256').update(source).digest('hex'), checks,
}, null, 2));
