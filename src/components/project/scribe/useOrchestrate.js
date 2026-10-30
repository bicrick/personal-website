import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENARIO_BY_ID, SCENARIOS } from './scenarios';
import {
  buildTimeline,
  inkColor,
  progressAt,
} from './livePen';
import { resolveInk } from './hands';

const TYPE_MS = 34;
const STEP_MS = 620;
/** Index in steps[] where the visible page change lands (0-based). */
const WIRE_AT = 2;
const REGIONS_AT = 3;
const WRITE_AT = 4;
/** User-facing playback multipliers. 1x = real-time ink clock (PEN_MM_S). */
export const SPEED_OPTIONS = [1, 2, 4];
export const DEFAULT_USER_SPEED = 1;


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
 * real-time ink clock (1x) times the user speed multiplier. `fast` skips
 * pacing for reduced-motion. Timers freeze while `paused` is true.
 * Speeds never compound: only userSpeed advances the pen clock.
 */
export default function useOrchestrate({
  fast = false,
  paused = false,
  bootScenario = null,
  bootDone = false,
} = {}) {
  const [scenarioId, setScenarioId] = useState(null);
  const [typed, setTyped] = useState('');
  const [writeFlash, setWriteFlash] = useState(false);
  const [run, setRun] = useState(null);
  const [stage, setStage] = useState('idle'); // idle|typing|plan|wire|regions|write|done
  const [regionStatus, setRegionStatus] = useState({}); // id -> pending|running|done
  const [penVt, setPenVt] = useState(0);
  const [penEnd, setPenEnd] = useState(0);
  const [wireOn, setWireOn] = useState(false); // layout boxes off by default
  const [handId, setHandId] = useState('neat');
  const [replayKey, setReplayKey] = useState(0);
  const [userPaused, setUserPausedState] = useState(false);
  const userPausedRef = useRef(false);
  const [userSpeed, setUserSpeedState] = useState(DEFAULT_USER_SPEED);
  const userSpeedRef = useRef(DEFAULT_USER_SPEED);
  const stageRef = useRef('idle');
  const finishRef = useRef(() => {});
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
    speed: DEFAULT_USER_SPEED,
  });

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    handRef.current = handId;
  }, [handId]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const setUserPaused = useCallback((on) => {
    userPausedRef.current = !!on;
    setUserPausedState(!!on);
  }, []);

  const setUserSpeed = useCallback((sp) => {
    const n = Number(sp);
    const next = SPEED_OPTIONS.includes(n) ? n : DEFAULT_USER_SPEED;
    userSpeedRef.current = next;
    setUserSpeedState(next);
    playbackRef.current.speed = next;
  }, []);

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
    setTyped(scenario.prompt);
    setWriteFlash(false);
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

  /** Start the pen RAF loop. It holds still while paused / scrubbing / off-screen
   * and keeps ticking, so a scrub mid-play continues from the new spot. */
  const loopPen = useCallback((tl) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    timelineRef.current = tl;
    penLast.current = 0;
    const tick = (now) => {
      const held = pausedRef.current || userPausedRef.current || scrubbingRef.current;
      const last = penLast.current || now;
      const dtReal = held ? 0 : Math.min(0.1, (now - last) / 1000);
      penLast.current = now;
      const speed = userSpeedRef.current || DEFAULT_USER_SPEED;
      // playbackRef.vt is the source of truth (scrubPen writes it too).
      // Only userSpeed advances the clock — no demo compression stacked on top.
      const next = Math.min(tl.writeEnd, (playbackRef.current.vt || 0) + dtReal * speed);
      playbackRef.current.vt = next;
      playbackRef.current.strokes = tl.strokes;
      playbackRef.current.playing = !held && next < tl.writeEnd;
      playbackRef.current.scrubbing = scrubbingRef.current;
      playbackRef.current.speed = speed;
      // Functional update reads the ref at flush time so a stale RAF setState
      // cannot overwrite a newer scrub seek.
      if (dtReal > 0) setPenVt(() => playbackRef.current.vt);
      if (!held && next >= tl.writeEnd) {
        penRaf.current = 0;
        finishRef.current();
        return;
      }
      penRaf.current = requestAnimationFrame(tick);
    };
    penRaf.current = requestAnimationFrame(tick);
  }, []);

  const runPen = useCallback((tl) => {
    if (penRaf.current) cancelAnimationFrame(penRaf.current);
    penRaf.current = 0;
    timelineRef.current = tl;
    setUserPaused(false);
    setPenEnd(tl.writeEnd);
    setPenVt(0);
    playbackRef.current.strokes = tl.strokes;
    playbackRef.current.vt = 0;
    playbackRef.current.playing = !fast;
    playbackRef.current.speed = userSpeedRef.current || DEFAULT_USER_SPEED;
    if (fast) {
      setPenVt(tl.writeEnd);
      playbackRef.current.vt = tl.writeEnd;
      playbackRef.current.playing = false;
      finishRef.current();
      return;
    }
    loopPen(tl);
  }, [fast, loopPen, setUserPaused]);

  // Pen reached the end of the page: mark the run done.
  finishRef.current = () => {
    const tl = timelineRef.current;
    if (tl) setPenVt(tl.writeEnd);
    playbackRef.current.playing = false;
    setUserPaused(false);
    setStage('done');
    setRun((r) => (r ? { ...r, step: r.total || r.step, done: true } : r));
    busy.current = false;
  };

  const start = useCallback((id) => {
    const scenario = SCENARIO_BY_ID[id];
    if (!scenario) return;
    clearTimers();
    busy.current = true;
    setUserPaused(false);
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

    setWriteFlash(false);
    [...scenario.prompt].forEach((_, i) => {
      t += typeMs;
      later(() => setTyped(scenario.prompt.slice(0, i + 1)), t);
    });

    // Brief Write-button press like someone hitting submit, then plan.
    t += fast ? 40 : 280;
    later(() => setWriteFlash(true), t);
    t += fast ? 40 : 320;
    later(() => {
      setWriteFlash(false);
      setStage('plan');
      setRun({ id, prompt: scenario.prompt, step: 1, total: scenario.steps.length, done: false });
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
          runPen(timelineFor(scenario, handRef.current));
        }
        setRun((r) => (r ? { ...r, step: i + 1 } : r));
      }, t);
    });

  }, [clearTimers, fast, later, runPen, setUserPaused]);

  const replayPen = useCallback(() => {
    const scenario = SCENARIO_BY_ID[scenarioId];
    if (!scenario) return;
    clearTimers();
    busy.current = false;
    setStage('write');
    setReplayKey((k) => k + 1);
    runPen(timelineFor(scenario, handRef.current));
  }, [clearTimers, runPen, scenarioId]);

  /** Pause / resume the pen mid-page; replay once the page is done. */
  const togglePlay = useCallback(() => {
    const st = stageRef.current;
    if (st === 'done') {
      replayPen();
      return;
    }
    if (st !== 'write') return;
    const nextPaused = !userPausedRef.current;
    setUserPaused(nextPaused);
    if (!nextPaused) {
      const tl = timelineRef.current;
      if (tl && !penRaf.current) loopPen(tl);
    }
  }, [loopPen, replayPen, setUserPaused]);

  /**
   * Seek the pen. Playing keeps playing from the new spot; paused stays
   * paused. Scrubbing back from a finished page leaves it paused there.
   */
  const scrubPen = useCallback((p) => {
    const st = stageRef.current;
    if (st === 'idle' || st === 'typing' || st === 'plan') return;
    const scenario = SCENARIO_BY_ID[scenarioId];
    let tl = timelineRef.current;
    if (!tl && scenario) {
      tl = timelineFor(scenario, handRef.current);
      timelineRef.current = tl;
    }
    if (!tl) return;
    const end = tl.writeEnd || 1;
    const f = Math.max(0, Math.min(1, p));
    const next = f * end;
    playbackRef.current.vt = next;
    setPenEnd(end);
    setPenVt(() => playbackRef.current.vt);
    if (st === 'done') {
      if (f >= 1) {
        setStage('done');
        return;
      }
      clearTimers();
      setUserPaused(true);
      setStage('write');
      setRun((r) => (r ? { ...r, done: false } : r));
      loopPen(tl);
      return;
    }
    if (st !== 'write') {
      setStage('write');
    }
    // Keep the RAF loop alive so pause/resume and mid-play scrub stay smooth.
    if (!penRaf.current) loopPen(tl);
  }, [clearTimers, loopPen, scenarioId, setUserPaused]);

  const setHand = useCallback((hid) => {
    setHandId(hid);
    setReplayKey((k) => k + 1);
    // Retarget timeline for the new hand at the same progress fraction.
    const scenario = SCENARIO_BY_ID[scenarioId];
    if (!scenario) return;
    const tl = timelineFor(scenario, hid);
    timelineRef.current = tl;
    setPenEnd(tl.writeEnd);
    const prev = playbackRef.current.vt || 0;
    const frac = penEnd > 0 ? prev / penEnd : 1;
    playbackRef.current.vt = frac * tl.writeEnd;
    setPenVt(frac * tl.writeEnd);
    if (penRaf.current) loopPen(tl);
  }, [loopPen, penEnd, scenarioId]);


  useEffect(() => {
    const tl = timelineRef.current;
    // vt is owned by the RAF loop / scrubPen — do not clobber it here.
    playbackRef.current.strokes = (tl && tl.strokes) || [];
    playbackRef.current.playing = stage === 'write' && !userPaused && !scrubbingRef.current;
    playbackRef.current.scrubbing = scrubbingRef.current;
    playbackRef.current.speed = userSpeedRef.current || DEFAULT_USER_SPEED;
  }, [penVt, stage, userPaused, userSpeed]);

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
    writeFlash,
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
    working: (Boolean(run && !run.done) || stage === 'typing' || writeFlash) && stage !== 'write',
    start,
    replayPen,
    togglePlay,
    userPaused,
    userSpeed,
    setUserSpeed,
    playing: stage === 'write' && !userPaused,
    wallTotalSec: penEnd > 0 ? penEnd / (userSpeed || DEFAULT_USER_SPEED) : 0,
    scrubPen,
    setScrubbing,
    playbackRef,
  };
}
