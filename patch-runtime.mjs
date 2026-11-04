import { readFileSync, writeFileSync, existsSync } from 'fs';

// Patch the Astro/Vercel adapter runtime spec.
// The current @astrojs/vercel v7 build emitted nodejs18.x on Node 24.
// Node 18 and Node 20 are retired on Vercel; the verified build uses Node 24.
// Match the supported build/runtime major without changing the adapter or project settings.
// This postbuild script patches the generated .vc-config.json to nodejs24.x.

const targets = [
  '.vercel/output/functions/_render.func/.vc-config.json',
];

let patched = 0;
for (const p of targets) {
  if (!existsSync(p)) { console.log(`[patch-runtime] not found: ${p}`); continue; }
  const cfg = JSON.parse(readFileSync(p, 'utf8'));
  const before = cfg.runtime;
  if (before === 'nodejs24.x') { console.log(`[patch-runtime] already nodejs24.x: ${p}`); continue; }
  cfg.runtime = 'nodejs24.x';
  writeFileSync(p, JSON.stringify(cfg, null, 2));
  console.log(`[patch-runtime] ${before} -> nodejs24.x: ${p}`);
  patched++;
}
console.log(`[patch-runtime] done. ${patched} file(s) patched.`);
