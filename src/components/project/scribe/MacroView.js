import React, { useEffect, useRef } from 'react';
import { resolveInk } from './hands';
import {
  buildTimeline,
  drawFrame,
  inkColor,
  tipAt,
} from './livePen';

/** Visible window in page mm — ~2.5–3 college-ruled lines, 16:10 lens. */
const VIEW_W_MM = 36;
const VIEW_H_MM = 22.5;
/** Smooth follow of the nib (no barrel/ink bias). */
const FOLLOW = 0.22;
/** Live tip pinned so ink fills left/center; barrel exits lower-right. */
const TIP_FX = 0.625;
const TIP_FY = 0.5;

const paperCache = new Map();

/**
 * Build the same college_ruled sheet the desk PaperView draws (phase-matched
 * lines + red margin + light grain), as an Image for canvas drawImage.
 */
function paperKey(paper) {
  if (!paper) return 'blank';
  const m = paper.margins || {};
  return [
    paper.kind || 'letter',
    paper.width_mm || 216,
    paper.height_mm || 279,
    paper.ruled ? 1 : 0,
    paper.line_height_mm || 8,
    m.l, m.r, m.t, m.b,
  ].join('|');
}

function buildPaperSvg(paper) {
  const W = paper.width_mm || 216;
  const H = paper.height_mm || 279;
  const margins = paper.margins || { l: 20, r: 20, t: 20, b: 20 };
  const ruled = paper.ruled || paper.kind === 'college_ruled';
  const lh = paper.line_height_mm || 8;
  const lines = [];
  if (ruled) {
    const top = margins.t;
    const bottom = H - margins.b;
    for (let y = top + lh; y < bottom; y += lh) {
      lines.push(
        `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#a8c3e2" stroke-width="0.20" stroke-opacity="0.90"/>`,
      );
    }
    const marginX = paper.kind === 'college_ruled'
      ? Math.max(25, Math.min(32, margins.l || 28))
      : null;
    if (marginX != null) {
      lines.push(
        `<line x1="${marginX}" y1="0" x2="${marginX}" y2="${H}" stroke="#e58b8b" stroke-width="0.28" stroke-opacity="0.85"/>`,
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>`
    + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">`
    + `<defs><filter id="pgrain" x="0" y="0" width="100%" height="100%">`
    + `<feTurbulence type="fractalNoise" baseFrequency="1.67" numOctaves="3" seed="3"/>`
    + `<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.14 0"/>`
    + `</filter></defs>`
    + `<rect width="${W}" height="${H}" fill="#fdfdfb"/>`
    + `<rect width="${W}" height="${H}" filter="url(#pgrain)"/>`
    + lines.join('')
    + `</svg>`;
}

function loadPaperImage(paper) {
  const key = paperKey(paper);
  const hit = paperCache.get(key);
  if (hit) return hit;
  const entry = { img: null, ready: false, key };
  paperCache.set(key, entry);
  if (typeof Image === 'undefined') {
    entry.ready = true;
    return entry;
  }
  const img = new Image();
  entry.img = img;
  const svg = buildPaperSvg(paper || {
    width_mm: 216,
    height_mm: 279,
    margins: { l: 20, r: 20, t: 20, b: 20 },
    ruled: false,
    kind: 'letter',
  });
  img.onload = () => { entry.ready = true; };
  img.onerror = () => { entry.ready = true; };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return entry;
}

/**
 * Separate cream macro card: true zoom of the same page paper (SVG rules,
 * red margin, grain) + ink + pen, tip-pinned. Sibling overlay — not inside
 * the side panel.
 */
export default function MacroView({
  scenario,
  handId = 'neat',
  playbackRef,
  penVt = 0,
  stage,
  replayKey = 0,
  reduced = false,
}) {
  const ref = useRef(null);
  const timelineRef = useRef(null);
  const poseRef = useRef(null);
  const camRef = useRef({ x: null, y: null });
  const keyRef = useRef('');
  const paperRef = useRef(null);
  const paperEntryRef = useRef(null);
  const reducedRef = useRef(reduced);
  const stageRef = useRef(stage);
  const penVtRef = useRef(penVt);
  reducedRef.current = reduced;
  stageRef.current = stage;
  penVtRef.current = penVt;

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !scenario) return undefined;
    const ctx = cv.getContext('2d');
    const data = resolveInk(
      { ...scenario.ink, byHand: scenario.inkByHand || scenario.ink.byHand },
      handId,
    );
    const key = `${scenario.id}|${handId}|${replayKey}|${data.strokes.length}`;
    if (keyRef.current !== key) {
      keyRef.current = key;
      poseRef.current = null;
      camRef.current = { x: null, y: null };
      const tl = buildTimeline(data.strokes, {
        color: inkColor(),
        regions: scenario.regions,
        lineHeightMm: (scenario.paper && scenario.paper.line_height_mm) || 8,
      });
      tl.pageW = scenario.paper.width_mm || data.w;
      tl.pageH = scenario.paper.height_mm || data.h;
      timelineRef.current = tl;
      paperRef.current = scenario.paper || null;
      paperEntryRef.current = loadPaperImage(scenario.paper);
    }

    let raf = 0;
    const paint = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      const dpr = window.devicePixelRatio || 1;
      const cssW = cv.clientWidth || 1;
      const cssH = cv.clientHeight || 1;
      if (cssW < 2 || cssH < 2) return;
      const needW = Math.max(1, Math.round(cssW * dpr));
      const needH = Math.max(1, Math.round(cssH * dpr));
      if (cv.width !== needW || cv.height !== needH) {
        cv.width = needW;
        cv.height = needH;
      }

      const pb = playbackRef && playbackRef.current;
      let vt = (pb && typeof pb.vt === 'number') ? pb.vt : penVtRef.current;
      const finished = stageRef.current === 'done';
      if (finished) vt = tl.writeEnd;
      if (reducedRef.current) {
        vt = finished ? tl.writeEnd : tl.writeEnd * 0.45;
      }

      const tip = tipAt(tl.strokes, vt) || [tl.pageW / 2, tl.pageH / 2, 0, false];
      const tipX = tip[0];
      const tipY = tip[1];
      const cam = camRef.current;
      if (cam.x == null || reducedRef.current) {
        cam.x = tipX;
        cam.y = tipY;
      } else {
        cam.x += (tipX - cam.x) * FOLLOW;
        cam.y += (tipY - cam.y) * FOLLOW;
      }

      const col = inkColor();
      if (tl.strokes.length && tl.strokes[0].c !== col) {
        tl.strokes.forEach((s) => { s.c = col; });
      }

      // Cover VIEW window; pin the *live* tip at TIP_FX/TIP_FY.
      const scale = Math.max(cssW / VIEW_W_MM, cssH / VIEW_H_MM);
      const ox = TIP_FX * cssW - tipX * scale;
      const oy = TIP_FY * cssH - tipY * scale;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      // Card cream behind the page crop (visible only if paper not yet ready).
      ctx.fillStyle = '#fcfcfa';
      ctx.fillRect(0, 0, cv.width, cv.height);

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

      const pageW = tl.pageW;
      const pageH = tl.pageH;
      const entry = paperEntryRef.current;
      if (entry && entry.ready && entry.img && entry.img.naturalWidth) {
        ctx.drawImage(entry.img, 0, 0, pageW, pageH);
      } else {
        // Fallback wash until SVG decodes — never synthetic out-of-phase rules.
        ctx.fillStyle = '#fdfdfb';
        ctx.fillRect(0, 0, pageW, pageH);
      }

      drawFrame(ctx, tl, vt, {
        showPen: !finished && !reducedRef.current,
        finished,
        poseState: poseRef.current || (poseRef.current = { t: -1, x: null, v: null }),
        pageW,
        pageH,
        sc: scale,
      });
    };

    if (reducedRef.current) {
      paint();
      return undefined;
    }

    const tick = () => {
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scenario, handId, playbackRef, penVt, stage, replayKey, reduced]);

  if (!scenario) {
    return <div className="sqd-macro is-empty" aria-hidden="true" />;
  }

  return (
    <div
      className="sqd-macro"
      aria-label="Close-up of the pen writing"
      role="img"
    >
      <canvas ref={ref} className="sqd-macro-canvas" aria-hidden="true" />
      <span className="sqd-macro-tag" aria-hidden="true">macro</span>
    </div>
  );
}
