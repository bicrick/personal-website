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

/**
 * Separate cream macro card: a true zoom of the same page (ruled sheet,
 * red margin, ink, pen) centered on the nib. Sibling of the side panel —
 * not inside it.
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
      // Page wash (same sheet cream as PaperView), not panel cream.
      ctx.fillStyle = '#fffefb';
      ctx.fillRect(0, 0, cv.width, cv.height);

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

      const paper = paperRef.current || {};
      const pageW = tl.pageW;
      const pageH = tl.pageH;
      const margins = paper.margins || { l: 20, r: 20, t: 20, b: 20 };
      const ruled = paper.ruled || paper.kind === 'college_ruled';

      if (ruled) {
        const lh = paper.line_height_mm || 8;
        // Same page geometry as PaperView — absolute ruled lines + red margin.
        ctx.strokeStyle = 'rgba(157,180,220,0.55)';
        ctx.lineWidth = 0.25;
        for (let y = margins.t + lh; y < pageH - margins.b; y += lh) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(pageW, y);
          ctx.stroke();
        }
        const marginX = Math.max(25, Math.min(32, margins.l || 28));
        ctx.strokeStyle = 'rgba(192,57,43,0.55)';
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        ctx.moveTo(marginX, 0);
        ctx.lineTo(marginX, pageH);
        ctx.stroke();
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
