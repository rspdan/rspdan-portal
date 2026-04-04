import { readFileSync, writeFileSync, existsSync } from 'fs';

// Patch the Astro/Vercel adapter runtime spec.
// @astrojs/vercel v7.x hardcodes nodejs18.x when build machine runs Node 24.
// Node 18 is EOL (Apr 2025) and Vercel now rejects it.
// This postbuild script patches the generated .vc-config.json to nodejs20.x.

const targets = [
  '.vercel/output/functions/_render.func/.vc-config.json',
];

let patched = 0;
for (const p of targets) {
  if (!existsSync(p)) { console.log(`[patch-runtime] not found: ${p}`); continue; }
  const cfg = JSON.parse(readFileSync(p, 'utf8'));
  const before = cfg.runtime;
  if (before === 'nodejs20.x') { console.log(`[patch-runtime] already nodejs20.x: ${p}`); continue; }
  cfg.runtime = 'nodejs20.x';
  writeFileSync(p, JSON.stringify(cfg, null, 2));
  console.log(`[patch-runtime] ${before} -> nodejs20.x: ${p}`);
  patched++;
}
console.log(`[patch-runtime] done. ${patched} file(s) patched.`);
