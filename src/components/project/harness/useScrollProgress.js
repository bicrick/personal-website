import { useEffect, useRef, useState } from 'react';

// 0..1 progress of a tall section scrolling past a sticky viewport.
export default function useScrollProgress(enabled = true) {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, span > 0 ? -r.top / span : 0)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [enabled]);
  return { ref, p };
}
