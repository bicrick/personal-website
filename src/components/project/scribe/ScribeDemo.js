import React, { useEffect, useRef, useState } from 'react';
import PaperView from './PaperView';
import SidePanel from './SidePanel';
import useOrchestrate from './useOrchestrate';
import usePenSound from './usePenSound';
import useReducedMotion from '../useReducedMotion';
import './scribe.css';

function badgeLabel(stage, working) {
  if (stage === 'write') return 'scribe writing';
  if (stage === 'done') return 'scribe done';
  if (working || stage === 'typing' || stage === 'plan' || stage === 'wire' || stage === 'regions') {
    return 'scribe busy';
  }
  return 'scribe idle';
}

/**
 * Interactive scribe orchestrator demo. Left: a browser-framed page that
 * plans then writes. Right: canned runs with a live activity log.
 */
export default function ScribeDemo({
  bootScenario,
  bootDone = false,
  forceFast = false,
  disableAutoplay = false,
  forceInView = false,
} = {}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  // Optimistic true so a missing/stuck IntersectionObserver can never freeze
  // the orchestrator paused forever. IO may still pause once it reports.
  const [inView, setInView] = useState(true);
  const autoplayed = useRef(false);

  const orch = useOrchestrate({
    fast: reduced || forceFast,
    paused: !inView,
    bootScenario,
    bootDone,
  });
  const { start } = orch;
  const sound = usePenSound({
    fast: reduced || forceFast,
    playbackRef: orch.playbackRef,
  });

  useEffect(() => {
    if (forceInView) {
      setInView(true);
      return undefined;
    }
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    let reported = false;
    const io = new IntersectionObserver(([entry]) => {
      reported = true;
      setInView(entry.isIntersecting);
    }, {
      threshold: 0.35,
    });
    io.observe(el);
    // If IO never callbacks (some headless / zero-size hosts), unstick.
    const fallback = window.setTimeout(() => {
      if (!reported) setInView(true);
    }, 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [forceInView]);

  useEffect(() => {
    if (disableAutoplay || bootDone || bootScenario) return undefined;
    if (!inView || autoplayed.current || reduced) return undefined;
    // Mark played only when it actually fires: inView starts optimistic-true,
    // so IO flipping to false before 900ms must not burn the one autoplay.
    const id = window.setTimeout(() => {
      autoplayed.current = true;
      start('card');
    }, 900);
    return () => window.clearTimeout(id);
  }, [inView, reduced, start, disableAutoplay, bootDone, bootScenario]);

  // QA: start a specific scenario once visible (animated unless bootDone handled in hook)
  useEffect(() => {
    if (!bootScenario || bootDone) return undefined;
    if (!inView || autoplayed.current) return undefined;
    const id = window.setTimeout(() => {
      autoplayed.current = true;
      start(bootScenario);
    }, forceFast ? 50 : 200);
    return () => window.clearTimeout(id);
  }, [bootScenario, bootDone, inView, start, forceFast]);

  const regionDone = Object.values(orch.regionStatus).filter((s) => s === 'done').length;
  const regionTotal = orch.scenario ? orch.scenario.regions.length : 0;
  const strokeTotal = orch.scenario ? orch.scenario.ink.strokes.length : 0;
  const strokeDrawn = Math.round(strokeTotal * (orch.penProgress || 0));
  const busy = orch.working;
  const badgeOn = orch.stage !== 'idle' && orch.scenarioId;

  return (
    <figure
      className="sqd"
      ref={wrapRef}
      onPointerDownCapture={sound.unlockSound}
    >
      <div className="sqd-stage">
        <div className="sqd-browser">
          <div className="sqd-chrome">
            <span className="sqd-lights" aria-hidden="true"><i /><i /><i /></span>
            <span className="sqd-url">
              {orch.scenario
                ? `scribe.app/write/${orch.scenario.id}`
                : 'scribe.app/write'}
            </span>
            <span className={`sqd-badge${badgeOn ? ' is-on' : ''}`}>
              {badgeLabel(orch.stage, busy)}
            </span>
          </div>
          <div className="sqd-viewport">
            <PaperView
              scenario={orch.scenario}
              stage={orch.stage}
              regionStatus={orch.regionStatus}
              penVt={orch.penVt}
              wireOn={orch.wireOn}
              handId={orch.handId}
              replayKey={orch.replayKey}
            />
          </div>
          <div className="sqd-status">
            <span>
              {regionTotal
                ? `regions ${regionDone}/${regionTotal}`
                : 'regions —'}
            </span>
            <span>
              {strokeTotal
                ? `strokes ${strokeDrawn}/${strokeTotal}`
                : 'strokes —'}
            </span>
            <span className="sqd-status-hint">
              {orch.scenario ? orch.scenario.paper.label : 'waiting'}
            </span>
          </div>
        </div>

        <SidePanel
          scenarios={orch.scenarios}
          scenarioId={orch.scenarioId}
          scenario={orch.scenario}
          run={orch.run}
          typed={orch.typed}
          working={busy}
          wireOn={orch.wireOn}
          setWireOn={orch.setWireOn}
          handId={orch.handId}
          setHand={orch.setHand}
          onPick={orch.start}
          onReplay={orch.replayPen}
          penProgress={orch.penProgress}
          scrubPen={orch.scrubPen}
          setScrubbing={orch.setScrubbing}
          stage={orch.stage}
          soundOn={sound.soundOn}
          onToggleSound={sound.toggleSound}
        />
      </div>
      <figcaption>
        canned runs. the real app plans the page, then a handwriting model writes it live.
      </figcaption>
    </figure>
  );
}
