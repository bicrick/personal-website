import { useEffect } from 'react';
import {
  PERIOD,
  bodyTransform,
  eyeTransform,
  poseTarget,
  sampleLoop,
} from './pose';
import { blinkSequence, createSprings, nextBlinkGap, stepSprings } from './springs';

// The CSS timeline is the one clock. Cards, token and bot all read from it.
function loopTime(root, now) {
  const driver = root.querySelector('.loop-clock');
  const anim = driver && driver.getAnimations()[0];
  if (anim && typeof anim.currentTime === 'number') {
    return anim.currentTime % PERIOD;
  }
  return now % PERIOD;
}

export default function useLoopClock(rootRef, reduce) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const bead = root.querySelector('.loop-bead');
    const body = root.querySelector('.grok-bot-body');
    const eyes = root.querySelector('.grok-bot-eyes');
    const springs = createSprings();
    let blinks = [];
    let openTarget = 1;
    let nextBlink = null;
    let last = null;
    let frame;

    const tick = (now) => {
      const ms = loopTime(root, now);
      const dt = last == null ? 0.016 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (nextBlink == null) nextBlink = now + nextBlinkGap();

      const loop = sampleLoop(ms / PERIOD);
      root.dataset.stage = loop.stage;
      if (bead) {
        bead.setAttribute('cx', loop.x.toFixed(2));
        bead.setAttribute('cy', loop.y.toFixed(2));
      }

      if (now >= nextBlink) {
        blinks = blinkSequence(now);
        nextBlink = now + nextBlinkGap();
      }
      const targets = poseTarget(loop.stage, ms / 1000, loop);
      while (blinks.length && now >= blinks[0].at) {
        openTarget = blinks[0].v;
        blinks.shift();
      }
      targets.open = openTarget;

      stepSprings(springs, targets, dt);
      if (body) body.setAttribute('transform', bodyTransform(springs));
      if (eyes) eyes.setAttribute('transform', eyeTransform(springs));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rootRef, reduce]);
}
