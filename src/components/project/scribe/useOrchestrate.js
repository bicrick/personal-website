import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENARIO_BY_ID, SCENARIOS } from './scenarios';

const TYPE_MS = 34;
const STEP_MS = 620;
/** Index in steps[] where the visible page change lands (0-based). */
const WIRE_AT = 2;
const REGIONS_AT = 3;
const WRITE_AT = 4;

/**
 * Plays one canned scribe run: type the request, step the activity log,
 * reveal paper → wireframe → parallel regions → pen. `fast` skips pacing
 * for reduced-motion visitors. Timers freeze while `paused` is true.
 */
export default function useOrchestrate({ fast = false, paused = false, bootScenario = null, bootDone = false } = {}) {
  const [scenarioId, setScenarioId] = useState(null);
  const [typed, setTyped] = useState('');
  const [run, setRun] = useState(null);
  const [stage, setStage] = useState('idle'); // idle|typing|plan|wire|regions|write|done
  const [regionStatus, setRegionStatus] = useState({}); // id -> pending|running|done
  const [penProgress, setPenProgress] = useState(0); // 0..1
  const [wireOn, setWireOn] = useState(true);
  const [handId, setHandId] = useState('neat');
  const [replayKey, setReplayKey] = useState(0);
  const timers = useRef([]);
  const busy = useRef(false);
  const pausedRef = useRef(paused);
  const penRaf = useRef(0);
  const penStart = useRef(0);
  const penFrozen = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    penRaf.current = 0;
  }, []);

  /** Schedule `fn` after `ms`, freezing remaining delay while paused. */
  const later = useCallback((fn, ms) => {
    let remaining = ms;
    let last = performance.now();
    let id = 0;
    const step = () => {
      const now = performance.now();
      if (!pausedRef.current) {
        remaining -= now - last;
      }
      last = now;
      if (remaining <= 0) {
        fn();
        return;
      }
      id = window.setTimeout(step, Math.min(50, Math.max(1, remaining)));
      timers.current.push(id);
    };
    id = window.setTimeout(step, Math.min(50, Math.max(1, ms)));
    timers.current.push(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // QA / deep-link: snap straight to a finished page (full ink + log).
  useEffect(() => {
    if (!bootDone || !bootScenario) return undefined;
    const scenario = SCENARIO_BY_ID[bootScenario];
    if (!scenario) return undefined;
    busy.current = false;
    clearTimers();
    const statuses = {};
    scenario.regions.forEach((r) => { statuses[r.id] = 'done'; });
    setScenarioId(bootScenario);
    setTyped('');
    setWireOn(true);
    setRegionStatus(statuses);
    setPenProgress(1);
    setStage('done');
    setRun({
      id: bootScenario,
      prompt: scenario.prompt,
      step: scenario.steps.length,
      done: true,
    });
    return undefined;
  }, [bootDone, bootScenario, clearTimers]);

  const runPen = useCallback((durationMs) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    penStart.current = performance.now();
    penFrozen.current = 0;
    const tick = (now) => {
      if (pausedRef.current) {
        penFrozen.current += 16;
        penRaf.current = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - penStart.current - penFrozen.current) / durationMs);
      setPenProgress(p);
      if (p < 1) penRaf.current = requestAnimationFrame(tick);
    };
    setPenProgress(0);
    penRaf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback((id) => {
    if (busy.current) return;
    const scenario = SCENARIO_BY_ID[id];
    if (!scenario) return;
    busy.current = true;
    clearTimers();
    setScenarioId(id);
    setWireOn(true);
    setRegionStatus({});
    setPenProgress(0);
    setStage('typing');
    setRun(null);
    setTyped('');

    const typeMs = fast ? 0 : TYPE_MS;
    const stepMs = fast ? 60 : STEP_MS;
    let t = 0;
    

    [...scenario.prompt].forEach((_, i) => {
      t += typeMs;
      later(() => setTyped(scenario.prompt.slice(0, i + 1)), t);
    });

    t += fast ? 40 : 260;
    later(() => {
      setTyped('');
      setStage('plan');
      setRun({ id, prompt: scenario.prompt, step: 1, done: false });
    }, t);

    scenario.steps.forEach((_, i) => {
      if (i === 0) return;
      t += stepMs;
      later(() => {
        if (i === WIRE_AT) {
          setStage('wire');
        }
        if (i === REGIONS_AT) {
          setStage('regions');
          const statuses = {};
          scenario.regions.forEach((r) => {
            statuses[r.id] = 'pending';
          });
          setRegionStatus(statuses);
          scenario.regions.forEach((r, ri) => {
            later(() => {
              setRegionStatus((s) => ({ ...s, [r.id]: 'running' }));
            }, ri * (fast ? 20 : 90));
            later(() => {
              setRegionStatus((s) => ({ ...s, [r.id]: 'done' }));
            }, (fast ? 120 : 420) + ri * (fast ? 40 : 140));
          });
        }
        if (i === WRITE_AT) {
          setStage('write');
          const writeDur = fast ? 400 : Math.min(5200, 900 + scenario.ink.strokes.length * 18);
          runPen(writeDur);
        }
        setRun((r) => (r ? { ...r, step: i + 1 } : r));
      }, t);
    });

    // Wait for pen payoff before marking done (writeDur captured at schedule time via closure of later)
    const penWait = fast
      ? 400
      : Math.min(5200, 900 + scenario.ink.strokes.length * 18);
    t += Math.max(stepMs * 0.9, penWait + 80);
    later(() => {
      setPenProgress(1);
      setStage('done');
      setRun((r) => (r ? { ...r, step: scenario.steps.length, done: true } : r));
      busy.current = false;
    }, t);
  }, [clearTimers, fast, later, runPen]);

  const replayPen = useCallback(() => {
    const scenario = SCENARIO_BY_ID[scenarioId];
    if (!scenario) return;
    setStage('write');
    setPenProgress(0);
    setReplayKey((k) => k + 1);
    const dur = fast ? 400 : Math.min(5200, 900 + scenario.ink.strokes.length * 18);
    runPen(dur);
    later(() => {
      setPenProgress(1);
      setStage('done');
    }, dur + 40);
  }, [fast, later, runPen, scenarioId]);

  const scrubPen = useCallback((p) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    penRaf.current = 0;
    setPenProgress(Math.max(0, Math.min(1, p)));
    if (stage === 'idle' || stage === 'typing' || stage === 'plan') return;
    setStage(p >= 1 ? 'done' : 'write');
  }, [stage]);

  const setHand = useCallback((hid) => {
    setHandId(hid);
    setReplayKey((k) => k + 1);
  }, []);

  const scenario = scenarioId ? SCENARIO_BY_ID[scenarioId] : null;

  return {
    scenarios: SCENARIOS,
    scenarioId,
    scenario,
    typed,
    run,
    stage,
    regionStatus,
    penProgress,
    wireOn,
    setWireOn,
    handId,
    setHand,
    replayKey,
    working: Boolean(run && !run.done) || typed.length > 0 || stage === 'typing',
    start,
    replayPen,
    scrubPen,
  };
}
