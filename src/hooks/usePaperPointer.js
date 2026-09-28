import { useEffect } from 'react';

const POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FOLLOW = 0.1;
const DRIFT = 10;

export default function usePaperPointer() {
  useEffect(() => {
    const pointerMq = window.matchMedia(POINTER_QUERY);
    const motionMq = window.matchMedia(MOTION_QUERY);
    const root = document.documentElement;

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let x = targetX;
    let y = targetY;
    let raf = 0;
    let listening = false;

    const paint = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;

      const dx = ((x / window.innerWidth) - 0.5) * DRIFT;
      const dy = ((y / window.innerHeight) - 0.5) * DRIFT;

      root.style.setProperty('--paper-x', `${x}px`);
      root.style.setProperty('--paper-y', `${y}px`);
      root.style.setProperty('--paper-dx', `${dx}px`);
      root.style.setProperty('--paper-dy', `${dy}px`);

      const moving = Math.hypot(targetX - x, targetY - y) > 0.2;
      raf = moving ? window.requestAnimationFrame(paint) : 0;
    };

    const kick = () => {
      if (!listening || raf) return;
      raf = window.requestAnimationFrame(paint);
    };

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      kick();
    };

    const enable = () => {
      if (listening) return;
      listening = true;
      root.classList.add('has-paper-pointer');
      window.addEventListener('pointermove', onMove, { passive: true });
    };

    const disable = () => {
      if (!listening) return;
      listening = false;
      window.cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('pointermove', onMove);
      root.classList.remove('has-paper-pointer');
      root.style.removeProperty('--paper-x');
      root.style.removeProperty('--paper-y');
      root.style.removeProperty('--paper-dx');
      root.style.removeProperty('--paper-dy');
    };

    const sync = () => {
      if (pointerMq.matches && !motionMq.matches) {
        enable();
        return;
      }
      disable();
    };

    sync();
    pointerMq.addEventListener('change', sync);
    motionMq.addEventListener('change', sync);

    return () => {
      pointerMq.removeEventListener('change', sync);
      motionMq.removeEventListener('change', sync);
      disable();
    };
  }, []);
}
