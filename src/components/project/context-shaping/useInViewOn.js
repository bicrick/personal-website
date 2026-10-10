import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../useReducedMotion';

export default function useInViewOn() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (reduce) {
      setOn(true);
      return undefined;
    }
    const node = ref.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduce]);

  return { ref, on };
}
