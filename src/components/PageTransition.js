import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import './PageTransition.css';

export const FADE_MS = 320;

const FadeNavigateContext = createContext({
  navigateWithFade: () => {},
  phase: 'idle',
});

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useFadeNavigate() {
  return useContext(FadeNavigateContext);
}

export function FadeNavigateProvider({ children }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('idle'); // idle | exiting | entering
  const pendingRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const navigateWithFade = useCallback((to) => {
    if (!to || to === window.location.pathname) return;
    if (pendingRef.current) return;

    if (prefersReducedMotion()) {
      navigate(to);
      window.scrollTo(0, 0);
      return;
    }

    pendingRef.current = to;
    setPhase('exiting');

    const outTimer = setTimeout(() => {
      const target = pendingRef.current;
      pendingRef.current = null;
      if (target) {
        navigate(target);
        window.scrollTo(0, 0);
      }
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('idle');
        });
      });
    }, FADE_MS);

    timersRef.current.push(outTimer);
  }, [navigate]);

  return (
    <FadeNavigateContext.Provider value={{ navigateWithFade, phase }}>
      {children}
    </FadeNavigateContext.Provider>
  );
}

/** Fades the active chapter page; keep outside sticky nav. */
export default function PageTransition({ children }) {
  const { phase } = useFadeNavigate();
  const shellClass = [
    'page-shell',
    phase === 'exiting' ? 'is-exiting' : '',
    phase === 'entering' ? 'is-entering' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      {children}
    </div>
  );
}
