#!/usr/bin/env node
/**
 * Build-time bake of Infinite Tapestry ribbons for the article + thumb.
 *
 * Sources:
 *   GET https://infinitetapestry.app/api/about?kind=history
 *   GET https://infinitetapestry.app/api/about?kind=tm
 *   R2 live-sdxl/strips/{index}.webp
 *
 * Public strip rule (Patrick):
 *   Only strips painted from 11 PM CT on Oct 13, 2026
 *   (= 2026-10-14T04:00:00Z) onward, in consecutive order so joins line up.
 *
 * SD 1.5 (0–1268) is never fetched from R2.
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
const MAIN = path.join(ROOT, 'public/images/infinite-tapestry');
const META = path.join(OUT, 'ribbon-meta.json');
const THUMB_META = path.join(OUT, 'thumb-ribbon-meta.json');
const CDN = 'https://pub-631bdb4d40c54807b1c2de9402e07893.r2.dev';
const HISTORY_URL = 'https://infinitetapestry.app/api/about?kind=history';
const TM_URL = 'https://infinitetapestry.app/api/about?kind=tm';
const SDXL_G0 = 1269;
const OVERLAP = 192 / 448;
/** 11 PM CT Oct 13, 2026 */
const CUTOFF_ISO = '2026-10-14T04:00:00+00:00';
const ARTICLE_STRIP_COUNT = 56;
const THUMB_STRIP_COUNT = 36;

const BLOCK = [
  /nsfw|nude|sex|porn|phallus|butt|poo|pee|fecal|gore|slur|rape|dildo|labia|scrotum|areola|fellatio|fornicat|epstein|hitler|kkk|racial|negro|jew|muslim|stereotype|flesh|body holes?|bulge|mangina|sperm|sloppy|mutilat|tortur|napalm|vivisection|probe|centipede|cuck|chad|abduct|ebola|ahegao|cum|milking|genital|jihad|booty|fart|coitus|\bpron\b|bob & vagene|mammary|gooch|jerkin|down syndrome|retard|racist|confederate|netanyahu|muhammad|rapture|bayonet|boudoir|tom of finland|phallic|khalifa|xvideos|floyd|\bgoy\b|wojak|soyjak|bikini|hyperborean|wendigo|turgid|carcass|\bnip\b|no clothes|male organ|heroin|coke|slim(e|ed)|human holes|fat people slumped|crushing the chinese|tojo|yakubian|drugs|rittenhouse|pit vipers|groin|fluid|african black|tony stark/i,
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

function parseTs(t) {
  const s = t.endsWith('Z') ? t : t;
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) throw new Error(`bad time ${t}`);
  return dt;
}

/** Interpolate live-sdxl strip index at or after CUTOFF_ISO from history times. */
function cutoffStripIndex(history) {
  const cutoff = new Date(CUTOFF_ISO);
  const samples = [];
  for (const day of history.days || []) {
    for (const row of day.times || []) {
      const [a, t] = row;
      samples.push({ a, t: parseTs(t) });
    }
  }
  samples.sort((x, y) => x.a - y.a);
  let before = null;
  let after = null;
  for (const s of samples) {
    if (s.t < cutoff) before = s;
    else if (!after) after = s;
  }
  if (!after && !before) throw new Error('history has no times');
  if (!before) return after.a;
  if (!after) return before.a;
  const span = after.t - before.t;
  const frac = span > 0 ? (cutoff - before.t) / span : 0;
  // First strip at/after cutoff (ceil of interpolation between samples).
  return Math.ceil(before.a + frac * (after.a - before.a));
}

async function downloadStrip(idx) {
  if (idx < 0) throw new Error(`bad strip ${idx}`);
  // live-sdxl filenames use session indices (same as history.a), not global+g0.
  const id = String(idx).padStart(8, '0');
  for (const ext of ['webp', 'jpg']) {
    const url = `${CDN}/live-sdxl/strips/${id}.${ext}`;
    const res = await fetch(url);
    if (res.ok) {
      return { buf: Buffer.from(await res.arrayBuffer()), ext, url };
    }
  }
  return null;
}

async function stitchRibbon(indices, height, outWebp, outJpg) {
  const images = [];
  for (const idx of indices) {
    const got = await downloadStrip(idx);
    if (!got) {
      console.warn(`missing strip ${idx}`);
      continue;
    }
    const img = sharp(got.buf);
    const meta = await img.metadata();
    const w = Math.max(1, Math.round((meta.width * height) / meta.height));
    const buf = await img.resize(w, height).ensureAlpha().png().toBuffer();
    images.push({ buf, w, h: height, idx, source: got.url });
  }
  if (images.length < 8) {
    throw new Error(`only ${images.length} strips for ${outWebp}`);
  }

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

  await ribbon.clone().webp({ quality: 78 }).toFile(outWebp);
  await ribbon.clone().jpeg({ quality: 80, progressive: true }).toFile(outJpg);
  return {
    stripCount: images.length,
    first: images[0].idx,
    last: images[images.length - 1].idx,
    width: totalW,
    height,
    consecutive: images.every((im, i) => i === 0 || im.idx === images[i - 1].idx + 1),
  };
}

/** First ≥ fromA start of a consecutive run with no blocked prompts overlapping. */
function firstSfwRunStart(history, fromA, runLen) {
  const ideas = [];
  for (const day of history.days || []) {
    for (const idea of day.ideas || []) ideas.push(idea);
  }
  ideas.sort((x, y) => x.a - y.a);

  const blockedInWindow = (start) => {
    const end = start + runLen;
    for (const idea of ideas) {
      if (idea.a + 64 < start) continue;
      if (idea.a >= end) break;
      // Idea covers painting until the next idea; treat as overlapping if it starts in-window
      // or is the active idea at start.
      if (!isSfwText(idea.text)) return true;
    }
    return false;
  };

  const CALM = /\b(nature|landscapes?|coral|reefs?|forests?|oceans?|seas?|mountains?|gardens?|meadows?|lighthouses?|fields?|dawn|dusk|skies|sky|rivers?|lakes?)\b/i;
  const sfwStarts = [];
  for (const idea of ideas) {
    if (idea.a < fromA) continue;
    if (!isSfwText(idea.text)) continue;
    if (blockedInWindow(idea.a)) continue;
    sfwStarts.push(idea);
  }
  if (!sfwStarts.length) {
    if (!blockedInWindow(fromA)) return fromA;
    throw new Error(`no SFW consecutive window of ${runLen} after strip ${fromA}`);
  }
  const calm = sfwStarts.find((i) => CALM.test(i.text || ''));
  return (calm || sfwStarts[0]).a;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const [history, tm] = await Promise.all([fetchJson(HISTORY_URL), fetchJson(TM_URL)]);
  fs.writeFileSync(path.join(OUT, 'eras.json'), JSON.stringify(tm, null, 2));

  const rawCutoff = cutoffStripIndex(history);
  const liveEdge = history.live_edge;
  const start = firstSfwRunStart(history, rawCutoff, ARTICLE_STRIP_COUNT);
  if (start < rawCutoff) {
    throw new Error(`start ${start} before cutoff ${rawCutoff}`);
  }
  if (liveEdge - start < ARTICLE_STRIP_COUNT) {
    throw new Error(`not enough strips after cutoff: live_edge=${liveEdge} start=${start}`);
  }

  console.log(`cutoff ${CUTOFF_ISO} → strip ≥ ${rawCutoff}; baking from ${start} (live_edge ${liveEdge})`);

  const articleIndices = Array.from({ length: ARTICLE_STRIP_COUNT }, (_, i) => start + i);
  const thumbIndices = Array.from({ length: THUMB_STRIP_COUNT }, (_, i) => start + i);

  const article = await stitchRibbon(
    articleIndices,
    400,
    path.join(OUT, 'ribbon-scroll.webp'),
    path.join(OUT, 'ribbon-scroll.jpg'),
  );
  fs.copyFileSync(path.join(OUT, 'ribbon-scroll.webp'), path.join(MAIN, 'ribbon-scroll.webp'));
  fs.copyFileSync(path.join(OUT, 'ribbon-scroll.jpg'), path.join(MAIN, 'ribbon-scroll.jpg'));

  const thumb = await stitchRibbon(
    thumbIndices,
    400,
    path.join(MAIN, 'ribbon-thumb.webp'),
    path.join(MAIN, 'ribbon-thumb.jpg'),
  );

  const common = {
    bakedAt: new Date().toISOString(),
    cutoffIso: CUTOFF_ISO,
    cutoffNote: '11 PM CT Oct 13, 2026 = 04:00 UTC Oct 14',
    cutoffStrip: rawCutoff,
    startStrip: start,
    historySession: history.session,
    liveEdge,
    sdxlGlobalStart: SDXL_G0,
    eras: tm.eras,
    rule: 'Only consecutive live-sdxl strips at/after cutoff; joins use live overlap.',
  };

  fs.writeFileSync(META, JSON.stringify({ ...common, purpose: 'article ribbon demo', ...article }, null, 2));
  fs.writeFileSync(
    THUMB_META,
    JSON.stringify({ ...common, purpose: 'homepage thumb B infinity cutout', ...thumb }, null, 2),
  );

  console.log('article', article);
  console.log('thumb', thumb);
  console.log('wrote', META, THUMB_META);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
