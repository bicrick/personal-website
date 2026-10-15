import { useCallback, useEffect, useRef, useState } from 'react';
import { THEME_BY_ID } from './themes';

const TYPE_MS = 34;
const STEP_MS = 620;
const APPLY_AT = 3;

/**
 * Plays one canned restyle run: type the prompt, step through the activity
 * log, apply the theme partway through, then settle. `fast` skips the pacing
 * for reduced-motion visitors.
 */
export default function useRestyle({ fast = false } = {}) {
  const [themeId, setThemeId] = useState('original');
  const [typed, setTyped] = useState('');
  const [run, setRun] = useState(null);
  const [sweepKey, setSweepKey] = useState(0);
  const timers = useRef([]);
  const busy = useRef(false);

  const later = useCallback((fn, ms) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const start = useCallback((id) => {
    if (busy.current) return;
    const theme = THEME_BY_ID[id];
    if (!theme || id === themeId) return;
    busy.current = true;

    const apply = () => {
      setThemeId(id);
      setSweepKey((k) => k + 1);
    };

    if (id === 'original') {
      apply();
      setRun({ id, prompt: 'undo restyle', step: 0, done: true });
      busy.current = false;
      return;
    }

    const typeMs = fast ? 0 : TYPE_MS;
    const stepMs = fast ? 80 : STEP_MS;
    setRun(null);
    setTyped('');

    let t = 0;
    [...theme.prompt].forEach((_, i) => {
      t += typeMs;
      later(() => setTyped(theme.prompt.slice(0, i + 1)), t);
    });

    t += fast ? 40 : 260;
    later(() => {
      setTyped('');
      setRun({ id, prompt: theme.prompt, step: 1, done: false });
    }, t);

    theme.steps.forEach((_, i) => {
      if (i === 0) return;
      t += stepMs;
      later(() => {
        if (i === APPLY_AT) apply();
        setRun((r) => (r ? { ...r, step: i + 1 } : r));
      }, t);
    });

    t += stepMs * 0.8;
    later(() => {
      setRun((r) => (r ? { ...r, step: theme.steps.length, done: true } : r));
      busy.current = false;
    }, t);
  }, [fast, later, themeId]);

  return {
    themeId,
    theme: THEME_BY_ID[themeId],
    typed,
    run,
    sweepKey,
    working: Boolean(run && !run.done) || typed.length > 0,
    start,
  };
}
