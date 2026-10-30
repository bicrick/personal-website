import React, { useEffect, useRef } from 'react';
import { resolveInk } from './hands';
import {
  buildTimeline,
  drawFrame,
  inkColor,
} from './livePen';

/**
 * Draws scenario ink at virtual time `vt` (seconds on the live.js pen clock),
 * with the friends-app 3D pen while writing.
 */
export default function StrokeCanvas({
  ink,
  handId = 'neat',
  vt = 0,
  showPen = true,
  finished = false,
  pageW,
  pageH,
  regions,
  lineHeightMm,
  className,
}) {
  const ref = useRef(null);
  const timelineRef = useRef(null);
  const poseRef = useRef(null);
  const keyRef = useRef('');

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !ink) return undefined;
    const ctx = cv.getContext('2d');
    const data = resolveInk(ink, handId);
    const key = `${handId}|${data.w}x${data.h}|${data.strokes.length}|${(regions && regions.length) || 0}|${inkColor()}`;
    if (keyRef.current !== key) {
      keyRef.current = key;
      poseRef.current = null;
      const tl = buildTimeline(data.strokes, {
        color: inkColor(),
        regions,
        lineHeightMm,
      });
      tl.pageW = pageW || data.w;
      tl.pageH = pageH || data.h;
      timelineRef.current = tl;
    }
    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = cv.clientWidth || 1;
      const cssH = cv.clientHeight || 1;
      const needW = Math.round(cssW * dpr);
      const needH = Math.round(cssH * dpr);
      if (cv.width !== needW || cv.height !== needH) {
        cv.width = needW;
        cv.height = needH;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const tl = timelineRef.current;
      if (!tl) return;
      const W = tl.pageW || data.w;
      const H = tl.pageH || data.h;
      // Uniform "meet" scale + center — same transform as the wireframe SVG.
      const scale = Math.min(cssW / W, cssH / H);
      const ox = (cssW - W * scale) / 2;
      const oy = (cssH - H * scale) / 2;
      const sc = scale * dpr;
      ctx.setTransform(sc, 0, 0, sc, ox * dpr, oy * dpr);
      // Rebuild color if theme flipped since timeline build.
      const col = inkColor();
      if (tl.strokes.length && tl.strokes[0].c !== col) {
        tl.strokes.forEach((s) => { s.c = col; });
      }
      drawFrame(ctx, tl, vt, {
        showPen,
        finished,
        poseState: poseRef.current || (poseRef.current = { t: -1, x: null, v: null }),
        pageW: W,
        pageH: H,
        sc,
      });
    };
    paint();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(paint) : null;
    if (ro) ro.observe(cv);
    window.addEventListener('resize', paint);
    const mo = new MutationObserver(() => {
      keyRef.current = '';
      paint();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      if (ro) ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', paint);
    };
  }, [ink, handId, vt, showPen, finished, pageW, pageH, regions, lineHeightMm]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
