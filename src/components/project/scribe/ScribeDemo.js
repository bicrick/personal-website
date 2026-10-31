import React, { useEffect, useRef, useState } from 'react';
import PaperView from './PaperView';
import MacroView from './MacroView';
import SidePanel from './SidePanel';
import useOrchestrate from './useOrchestrate';
import usePenSound from './usePenSound';
import useReducedMotion from '../useReducedMotion';
import deskUrl from './media/desk-m.jpg';
import './scribe.css';

/**
 * Interactive scribe orchestrator demo restyled like the friends desk app:
 * brown desk, floating cream panel, transport, no fake browser chrome.
 * Autoplay on mount; after a run finishes, advance through the reel.
 * Macro is a separate cream card (bottom-left); panel floats top-right.
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
  const [inView, setInView] = useState(true);
  const autoplayed = useRef(false);
  const reelTimer = useRef(0);

  const orch = useOrchestrate({
    fast: reduced || forceFast,
    paused: !inView,
    bootScenario: bootDone || reduced ? (bootScenario || 'newton3') : bootScenario,
    bootDone: bootDone || (reduced && !bootScenario && !disableAutoplay),
  });
  const { start, scenarios, stage, scenarioId } = orch;
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
    }, { threshold: 0.35 });
    io.observe(el);
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
    if (reduced || autoplayed.current) return undefined;
    const id = window.setTimeout(() => {
      autoplayed.current = true;
      start(scenarios[0] ? scenarios[0].id : 'newton3');
    }, 700);
    return () => window.clearTimeout(id);
  }, [reduced, start, disableAutoplay, bootDone, bootScenario, scenarios]);

  useEffect(() => {
    if (!bootScenario || bootDone) return undefined;
    if (autoplayed.current) return undefined;
    const id = window.setTimeout(() => {
      autoplayed.current = true;
      start(bootScenario);
    }, forceFast ? 50 : 200);
    return () => window.clearTimeout(id);
  }, [bootScenario, bootDone, start, forceFast]);

  useEffect(() => {
    if (disableAutoplay || reduced || bootDone) return undefined;
    if (stage !== 'done' || !scenarioId) return undefined;
    if (reelTimer.current) window.clearTimeout(reelTimer.current);
    const ids = scenarios.map((s) => s.id);
    const ix = ids.indexOf(scenarioId);
    if (ix < 0 || ids.length < 2) return undefined;
    const next = ids[(ix + 1) % ids.length];
    reelTimer.current = window.setTimeout(() => {
      if (!orch.working) start(next);
    }, 2200);
    return () => {
      if (reelTimer.current) window.clearTimeout(reelTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, scenarioId, scenarios, start, disableAutoplay, reduced, bootDone]);

  const busy = orch.working;

  return (
    <figure
      className="sqd"
      ref={wrapRef}
      onPointerDownCapture={sound.unlockSound}
    >
      <div
        className="sqd-stage"
        style={{ '--sqd-desk': `url(${deskUrl})` }}
      >
        <div className="sqd-desk">
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

          <MacroView
            scenario={orch.scenario}
            handId={orch.handId}
            playbackRef={orch.playbackRef}
            penVt={orch.penVt}
            stage={orch.stage}
            replayKey={orch.replayKey}
            reduced={reduced}
          />
          <SidePanel
            scenarios={orch.scenarios}
            scenarioId={orch.scenarioId}
            scenario={orch.scenario}
            run={orch.run}
            typed={orch.typed}
            writeFlash={orch.writeFlash}
            working={busy}
            wireOn={orch.wireOn}
            setWireOn={orch.setWireOn}
            handId={orch.handId}
            setHand={orch.setHand}
            onPick={(id) => {
              autoplayed.current = true;
              if (reelTimer.current) window.clearTimeout(reelTimer.current);
              orch.start(id);
            }}
            onReplay={orch.replayPen}
            onTogglePlay={orch.togglePlay}
            playing={orch.playing}
            userPaused={orch.userPaused}
            userSpeed={orch.userSpeed}
            setUserSpeed={orch.setUserSpeed}
            wallTotalSec={orch.wallTotalSec}
            penProgress={orch.penProgress}
            scrubPen={orch.scrubPen}
            setScrubbing={orch.setScrubbing}
            stage={orch.stage}
            soundOn={sound.soundOn}
            onToggleSound={sound.toggleSound}
          />
        </div>
      </div>
      <figcaption>
        a reel of real pages. the live app plans the layout, then a handwriting model writes it.
      </figcaption>
    </figure>
  );
}
