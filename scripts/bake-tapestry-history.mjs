#!/usr/bin/env node
/**
 * Build-time bake of a curated SFW Infinite Tapestry ribbon.
 *
 * Sources:
 *   GET https://infinitetapestry.app/api/about?kind=history
 *   GET https://infinitetapestry.app/api/about?kind=tm
 *
 * Rules:
 *   - Strips 0–1268 are OG / SD 1.5 and live only in Supabase Storage.
 *     R2 live/strips is NOT a safe source for that era. If Supabase URLs
 *     are not available from the history feed, we do not invent an era
 *     comparison from R2.
 *   - SDXL starts at global strip 1269 (session live-sdxl). Those strips
 *     are fetched from the public R2 live-sdxl prefix and baked locally.
 *   - Runtime hotlinking is avoided; demos read the baked assets.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sharp = (() => {
  try {
    return require('sharp');
  } catch {
    return require('/workspace/node_modules/sharp');
  }
})();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/images/infinite-tapestry/history');
const META = path.join(OUT, 'ribbon-meta.json');
const CDN = 'https://pub-631bdb4d40c54807b1c2de9402e07893.r2.dev';
const HISTORY_URL = 'https://infinitetapestry.app/api/about?kind=history';
const TM_URL = 'https://infinitetapestry.app/api/about?kind=tm';
const SDXL_G0 = 1269;
const OVERLAP = 192 / 448;

// Hand-picked SFW scenes from the history feed (global strip start `a`).
const CURATED = [
  { a: 185, label: 'bioluminescent coral reef', handle: 'lumen' },
  { a: 5270, label: 'sea-glass lighthouse at dusk', handle: 'tide-0342' },
  { a: 6827, label: 'labradors in a field of daisies', handle: 'unknown' },
  { a: 15678, label: 'ancient china', handle: 'turbulentmarrow' },
  { a: 24070, label: 'glass lighthouse of jellyfish', handle: 'tide-0342' },
  { a: 26913, label: 'fantasy landscape', handle: 'meadow-8560' },
  { a: 45332, label: 'nature landscapes', handle: 'meadow-8957' },
  { a: 45338, label: 'hyperrealistic coral reef', handle: 'meadow-8957' },
  { a: 45849, label: 'cats in baseball hats', handle: 'meadow-8957' },
  { a: 56148, label: 'dogs running steeplechase', handle: 'Balala' },
];

const BLOCK = [
  /nsfw|nude|sex|porn|phallus|butt|poop|fecal|gore|slur|rape|dildo|labia|scrotum|areola|fellatio|fornicat|epstein|hitler|kkk|racial|negro|jew|muslim|china man|stereotype|flesh|body holes?|oil(ed|y)?|bulge|mangina|sperms?|sloppy|mutilat|tortur|napalm|vivisection/i,
];

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function isSfwText(text) {
  if (!text) return true;
  return !BLOCK.some((re) => re.test(text));
}

async function downloadStrip(globalIdx) {
  if (globalIdx < SDXL_G0) {
    throw new Error(`Refusing R2 fetch for SD1.5-era strip ${globalIdx}`);
  }
  // live-sdxl uses global indices in the public scene pages for SDXL-era strips.
  const id = String(globalIdx).padStart(8, '0');
  for (const ext of ['webp', 'jpg']) {
    const url = `${CDN}/live-sdxl/strips/${id}.${ext}`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, ext, url };
    }
  }
  // Fallback: live/ prefix (same numbers for SDXL-era globals in practice)
  for (const ext of ['webp', 'jpg']) {
    const url = `${CDN}/live/strips/${id}.${ext}`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, ext, url };
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const [history, tm] = await Promise.all([fetchJson(HISTORY_URL), fetchJson(TM_URL)]);
  fs.writeFileSync(path.join(OUT, 'eras.json'), JSON.stringify(tm, null, 2));

  const ideas = [];
  for (const day of history.days || []) {
    for (const idea of day.ideas || []) ideas.push({ ...idea, day: day.day });
  }

  const picks = [];
  for (const c of CURATED) {
    if (c.a < SDXL_G0) {
      console.warn(`skip curated ${c.a} (SD1.5 era; no public Supabase bake)`);
      continue;
    }
    const match = ideas.find((i) => i.a === c.a);
    const text = match?.text || c.label;
    if (!isSfwText(text)) {
      console.warn(`skip NSFW curated ${c.a}: ${text}`);
      continue;
    }
    picks.push({
      a: c.a,
      label: c.label,
      text,
      handle: match?.handle || c.handle,
      day: match?.day || null,
    });
  }

  // Only the hand-picked CURATED list — no opportunistic fills from the open queue.

  const stripDirs = path.join(OUT, 'strips');
  fs.mkdirSync(stripDirs, { recursive: true });
  const baked = [];

  for (const pick of picks) {
    // Take ~8 consecutive strips from each scene start
    const indices = [];
    for (let i = 0; i < 8; i++) indices.push(pick.a + i);
    const frames = [];
    for (const idx of indices) {
      const got = await downloadStrip(idx);
      if (!got) {
        console.warn(`missing strip ${idx}`);
        continue;
      }
      const file = path.join(stripDirs, `${String(idx).padStart(8, '0')}.${got.ext}`);
      fs.writeFileSync(file, got.buf);
      frames.push({ idx, file, source: got.url });
    }
    if (frames.length >= 4) {
      baked.push({ ...pick, frames: frames.map((f) => ({ idx: f.idx, file: path.relative(OUT, f.file), source: f.source })) });
      console.log(`baked ${pick.label} (${frames.length} strips from ${pick.a})`);
    }
  }

  // Stitch one long scroll ribbon (height 400)
  const height = 400;
  const images = [];
  for (const scene of baked) {
    for (const fr of scene.frames) {
      const abs = path.join(OUT, fr.file);
      const img = sharp(abs);
      const meta = await img.metadata();
      const w = Math.max(1, Math.round((meta.width * height) / meta.height));
      images.push(await img.resize(w, height).ensureAlpha().png().toBuffer().then((buf) => ({ buf, w, h: height })));
    }
  }

  if (!images.length) throw new Error('No strips baked');

  const step = Math.round(images[0].w * (1 - OVERLAP));
  const totalW = images[0].w + step * (images.length - 1);
  const composites = images.map((im, i) => ({
    input: im.buf,
    left: i * step,
    top: 0,
  }));

  const ribbon = sharp({
    create: {
      width: totalW,
      height,
      channels: 3,
      background: '#0b0b0d',
    },
  }).composite(composites);

  await ribbon.clone().webp({ quality: 78 }).toFile(path.join(OUT, 'ribbon-scroll.webp'));
  await ribbon.clone().jpeg({ quality: 80, progressive: true }).toFile(path.join(OUT, 'ribbon-scroll.jpg'));

  // Also copy as the main article ribbon used by demos/thumbs
  const mainDir = path.join(ROOT, 'public/images/infinite-tapestry');
  fs.copyFileSync(path.join(OUT, 'ribbon-scroll.webp'), path.join(mainDir, 'ribbon-scroll.webp'));
  fs.copyFileSync(path.join(OUT, 'ribbon-scroll.jpg'), path.join(mainDir, 'ribbon-scroll.jpg'));

  const meta = {
    bakedAt: new Date().toISOString(),
    historySession: history.session,
    liveEdge: history.live_edge,
    sdxlGlobalStart: SDXL_G0,
    eras: tm.eras,
    note:
      'SD1.5-era strips (0–1268) were not baked: originals live in Supabase Storage and the history feed did not expose public image URLs. R2 live/strips is not used for that era. This ribbon is SDXL-only, curated SFW from the history feed.',
    scenes: baked.map(({ a, label, text, handle, day, frames }) => ({
      a,
      label,
      text,
      handle,
      day,
      stripCount: frames.length,
      first: frames[0]?.idx,
      last: frames[frames.length - 1]?.idx,
    })),
  };
  fs.writeFileSync(META, JSON.stringify(meta, null, 2));
  // Drop per-strip cache; demos use the stitched ribbon only.
  fs.rmSync(stripDirs, { recursive: true, force: true });
  // Keep one ribbon copy under history/ for provenance; demos read the top-level copy.
  console.log('wrote', META);
  console.log('ribbon', totalW, 'x', height, 'from', images.length, 'strips');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
