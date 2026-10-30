import React, { useEffect, useRef } from 'react';
import { resolveInk } from './hands';
import {
  buildTimeline,
  drawFrame,
  inkColor,
  tipAt,
} from './livePen';

/** Visible window around the tip, in page millimetres. */
const VIEW_W_MM = 42;
const VIEW_H_MM = 28;
/** Spring toward the tip so the camera is smooth, not jittery. */
const FOLLOW = 0.18;

/**
 * Non-interactive macro lens: high-zoom close-up that follows the pen tip
 * in sync with the full-page canvas. Reads vt from playbackRef each RAF so
 * it stays smooth even when React batches penVt updates.
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
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

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
    }

    let raf = 0;
    const paint = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      const dpr = window.devicePixelRatio || 1;
      const cssW = cv.clientWidth || 1;
      const cssH = cv.clientHeight || 1;
      const needW = Math.round(cssW * dpr);
      const needH = Math.round(cssH * dpr);
      if (cv.width !== needW || cv.height !== needH) {
        cv.width = needW;
        cv.height = needH;
      }
      const pb = playbackRef && playbackRef.current;
      let vt = (pb && typeof pb.vt === 'number') ? pb.vt : penVt;
      const finished = stage === 'done';
      if (finished) vt = tl.writeEnd;
      if (reducedRef.current) {
        // Static close-up: mid-page (or end if already done).
        vt = finished ? tl.writeEnd : tl.writeEnd * 0.45;
      }

      const tip = tipAt(tl.strokes, vt) || [tl.pageW / 2, tl.pageH / 2, 0, false];
      const cam = camRef.current;
      if (cam.x == null || reducedRef.current) {
        cam.x = tip[0];
        cam.y = tip[1];
      } else {
        cam.x += (tip[0] - cam.x) * FOLLOW;
        cam.y += (tip[1] - cam.y) * FOLLOW;
      }

      const col = inkColor();
      if (tl.strokes.length && tl.strokes[0].c !== col) {
        tl.strokes.forEach((s) => { s.c = col; });
      }

      // Cover the canvas with a VIEW_W_MM × VIEW_H_MM window centered on cam.
      const scale = Math.max(cssW / VIEW_W_MM, cssH / VIEW_H_MM);
      const ox = cssW / 2 - cam.x * scale;
      const oy = cssH / 2 - cam.y * scale;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      // Paper wash so empty margins aren't transparent.
      ctx.fillStyle = getComputedStyle(cv).getPropertyValue('--sqd-white').trim() || '#fffefb';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
      drawFrame(ctx, tl, vt, {
        showPen: !finished && !reducedRef.current,
        finished,
        poseState: poseRef.current || (poseRef.current = { t: -1, x: null, v: null }),
        pageW: tl.pageW,
        pageH: tl.pageH,
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
