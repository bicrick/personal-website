import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENARIO_BY_ID, SCENARIOS } from './scenarios';
import {
  DEFAULT_SPEED,
  buildTimeline,
  inkColor,
  progressAt,
  wallMsForWrite,
} from './livePen';
import { resolveInk } from './hands';

const TYPE_MS = 34;
const STEP_MS = 620;
/** Index in steps[] where the visible page change lands (0-based). */
const WIRE_AT = 2;
const REGIONS_AT = 3;
const WRITE_AT = 4;

function timelineFor(scenario, handId) {
  if (!scenario) return null;
  const data = resolveInk(
    { ...scenario.ink, byHand: scenario.inkByHand || scenario.ink.byHand },
    handId,
  );
  const tl = buildTimeline(data.strokes, {
    color: inkColor(),
    regions: scenario.regions,
    lineHeightMm: (scenario.paper && scenario.paper.line_height_mm) || 8,
  });
  tl.pageW = data.w;
  tl.pageH = data.h;
  return tl;
}

/**
 * Plays one canned scribe run: type the request, step the activity log,
 * reveal paper → (optional) wireframe → parallel regions → pen at the
 * friends-app live.js clock (DEFAULT_SPEED ×). `fast` skips pacing for
 * reduced-motion. Timers freeze while `paused` is true.
 */
export default function useOrchestrate({
  fast = false,
  paused = false,
  bootScenario = null,
  bootDone = false,
} = {}) {
  const [scenarioId, setScenarioId] = useState(null);
  const [typed, setTyped] = useState('');
  const [run, setRun] = useState(null);
  const [stage, setStage] = useState('idle'); // idle|typing|plan|wire|regions|write|done
  const [regionStatus, setRegionStatus] = useState({}); // id -> pending|running|done
  const [penVt, setPenVt] = useState(0);
  const [penEnd, setPenEnd] = useState(0);
  const [wireOn, setWireOn] = useState(false); // layout boxes off by default
  const [handId, setHandId] = useState('neat');
  const [replayKey, setReplayKey] = useState(0);
  const timers = useRef([]);
  const busy = useRef(false);
  const pausedRef = useRef(paused);
  const penRaf = useRef(0);
  const penLast = useRef(0);
  const timelineRef = useRef(null);
  const handRef = useRef(handId);
  const scrubbingRef = useRef(false);
  const playbackRef = useRef({
    vt: 0,
    strokes: [],
    playing: false,
    scrubbing: false,
    speed: DEFAULT_SPEED,
  });

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    handRef.current = handId;
  }, [handId]);

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
    const tl = timelineFor(scenario, handRef.current);
    timelineRef.current = tl;
    setScenarioId(bootScenario);
    setTyped('');
    setRegionStatus(statuses);
    setPenEnd(tl.writeEnd);
    setPenVt(tl.writeEnd);
    setStage('done');
    setRun({
      id: bootScenario,
      prompt: scenario.prompt,
      step: scenario.steps.length,
      done: true,
    });
    return undefined;
  }, [bootDone, bootScenario, clearTimers]);

  const runPen = useCallback((tl) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    timelineRef.current = tl;
    setPenEnd(tl.writeEnd);
    setPenVt(0);
    penLast.current = 0;
    playbackRef.current.strokes = tl.strokes;
    playbackRef.current.vt = 0;
    playbackRef.current.playing = !fast;
    playbackRef.current.speed = DEFAULT_SPEED;
    if (fast) {
      setPenVt(tl.writeEnd);
      playbackRef.current.vt = tl.writeEnd;
      playbackRef.current.playing = false;
      return;
    }
    const tick = (now) => {
      if (pausedRef.current) {
        penLast.current = now;
        penRaf.current = requestAnimationFrame(tick);
        return;
      }
      const last = penLast.current || now;
      const dtReal = Math.min(0.1, (now - last) / 1000);
      penLast.current = now;
      setPenVt((prev) => {
        const next = Math.min(tl.writeEnd, prev + dtReal * DEFAULT_SPEED);
        playbackRef.current.vt = next;
        playbackRef.current.strokes = tl.strokes;
        playbackRef.current.playing = next < tl.writeEnd;
        playbackRef.current.scrubbing = scrubbingRef.current;
        playbackRef.current.speed = DEFAULT_SPEED;
        if (next < tl.writeEnd) penRaf.current = requestAnimationFrame(tick);
        else penRaf.current = 0;
        return next;
      });
    };
    penRaf.current = requestAnimationFrame(tick);
  }, [fast]);

  const start = useCallback((id) => {
    if (busy.current) return;
    const scenario = SCENARIO_BY_ID[id];
    if (!scenario) return;
    busy.current = true;
    clearTimers();
    setScenarioId(id);
    // Keep the user's page|layout choice; do not force wireframe on.
    setRegionStatus({});
    setPenVt(0);
    setPenEnd(0);
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

    let writeWall = fast ? 400 : 5000;
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
          const tl = timelineFor(scenario, handRef.current);
          writeWall = wallMsForWrite(tl.writeEnd, DEFAULT_SPEED, fast);
          runPen(tl);
        }
        setRun((r) => (r ? { ...r, step: i + 1 } : r));
      }, t);
    });

    // Pen duration is known up front from the same timeline the canvas uses.
    const tl0 = timelineFor(scenario, handRef.current);
    writeWall = wallMsForWrite(tl0.writeEnd, DEFAULT_SPEED, fast);
    t += Math.max(stepMs * 0.9, writeWall + 80);
    later(() => {
      setPenVt((tl0 && tl0.writeEnd) || 1);
      setStage('done');
      setRun((r) => (r ? { ...r, step: scenario.steps.length, done: true } : r));
      busy.current = false;
    }, t);
  }, [clearTimers, fast, later, runPen]);

  const replayPen = useCallback(() => {
    const scenario = SCENARIO_BY_ID[scenarioId];
    if (!scenario) return;
    setStage('write');
    setReplayKey((k) => k + 1);
    const tl = timelineFor(scenario, handRef.current);
    const dur = wallMsForWrite(tl.writeEnd, DEFAULT_SPEED, fast);
    runPen(tl);
    later(() => {
      setPenVt(tl.writeEnd);
      setStage('done');
    }, dur + 40);
  }, [fast, later, runPen, scenarioId]);

  const scrubPen = useCallback((p) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    penRaf.current = 0;
    const tl = timelineRef.current || (SCENARIO_BY_ID[scenarioId]
      ? timelineFor(SCENARIO_BY_ID[scenarioId], handRef.current)
      : null);
    const end = (tl && tl.writeEnd) || penEnd || 1;
    const next = Math.max(0, Math.min(1, p)) * end;
    setPenVt(next);
    setPenEnd(end);
    if (stage === 'idle' || stage === 'typing' || stage === 'plan') return;
    setStage(p >= 1 ? 'done' : 'write');
  }, [penEnd, scenarioId, stage]);

  const setHand = useCallback((hid) => {
    setHandId(hid);
    setReplayKey((k) => k + 1);
    // Retarget timeline for the new hand at the same progress fraction.
    const scenario = SCENARIO_BY_ID[scenarioId];
    if (!scenario) return;
    const tl = timelineFor(scenario, hid);
    timelineRef.current = tl;
    setPenEnd(tl.writeEnd);
    setPenVt((prev) => {
      const frac = penEnd > 0 ? prev / penEnd : 1;
      return frac * tl.writeEnd;
    });
  }, [penEnd, scenarioId]);


  useEffect(() => {
    const tl = timelineRef.current;
    playbackRef.current.vt = penVt;
    playbackRef.current.strokes = (tl && tl.strokes) || [];
    playbackRef.current.playing = stage === 'write';
    playbackRef.current.scrubbing = scrubbingRef.current;
    playbackRef.current.speed = DEFAULT_SPEED;
  }, [penVt, stage]);

  const setScrubbing = useCallback((on) => {
    scrubbingRef.current = !!on;
    playbackRef.current.scrubbing = !!on;
  }, []);

  const scenario = scenarioId ? SCENARIO_BY_ID[scenarioId] : null;
  const tl = timelineRef.current;
  const penProgress = progressAt(
    tl || { writeEnd: penEnd },
    penVt,
  );

  return {
    scenarios: SCENARIOS,
    scenarioId,
    scenario,
    typed,
    run,
    stage,
    regionStatus,
    penProgress,
    penVt,
    penEnd,
    wireOn,
    setWireOn,
    handId,
    setHand,
    replayKey,
    working: Boolean(run && !run.done) || typed.length > 0 || stage === 'typing',
    start,
    replayPen,
    scrubPen,
    setScrubbing,
    playbackRef,
  };
}
