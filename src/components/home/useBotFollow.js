import { useEffect } from 'react';
import { bodyTransform, eyeTransform } from '../project/loop/pose';
import {
  blinkSequence,
  createSprings,
  nextBlinkGap,
  stepSprings,
} from '../project/loop/springs';

const IDLE_MS = 2500;

// Drives the home page bot: it follows the cursor with the same springs as the
// loop diagram, and looks idly around when the cursor is quiet. Its shadow
// slides the opposite way to its lean.
export default function useBotFollow(svgRef, reduce) {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduce) return undefined;

    const body = svg.querySelector('.writing-bot-body');
    const eyes = svg.querySelector('.writing-bot-eyes');
    const shadow = svg.querySelector('.writing-bot-shadow');
    const springs = createSprings();
    const pointer = { x: 0, y: 0, at: -Infinity };
    let visible = true;
    let blinks = [];
    let openTarget = 1;
    let nextBlink = null;
    let last = null;
    let frame = 0;

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.at = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
      : null;
    if (observer) observer.observe(svg);

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      if (!visible) {
        last = null;
        return;
      }
      const dt = last == null ? 0.016 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (nextBlink == null) nextBlink = now + nextBlinkGap();

      let ux;
      let uy;
      let reach;
      if (now - pointer.at < IDLE_MS) {
        const box = svg.getBoundingClientRect();
        const dx = pointer.x - (box.left + box.width / 2);
        const dy = pointer.y - (box.top + box.height / 2);
        const len = Math.hypot(dx, dy) || 1;
        ux = dx / len;
        uy = dy / len;
        reach = Math.min(1, len / 260);
      } else {
        const t = now / 1000;
        ux = Math.sin(t * 0.55);
        uy = 0.35 * Math.sin(t * 0.37 + 1);
        reach = 0.25;
      }

      if (now >= nextBlink) {
        blinks = blinkSequence(now);
        nextBlink = now + nextBlinkGap();
      }
      while (blinks.length && now >= blinks[0].at) {
        openTarget = blinks[0].v;
        blinks.shift();
      }

      stepSprings(springs, {
        x: 30 * ux * reach,
        y: 20 * uy * reach,
        rot: 9 * ux * reach,
        sy: 1,
        yaw: 38 * ux,
        pitch: 28 * uy,
        open: openTarget,
      }, dt);

      if (body) body.setAttribute('transform', bodyTransform(springs));
      if (eyes) eyes.setAttribute('transform', eyeTransform(springs));
      if (shadow) {
        const lean = springs.x.x;
        shadow.setAttribute('transform', `translate(${(-0.5 * lean).toFixed(2)} 0)`);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      if (observer) observer.disconnect();
    };
  }, [svgRef, reduce]);
}
