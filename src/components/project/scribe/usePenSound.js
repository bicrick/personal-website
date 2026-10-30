import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SPEED, motionAt } from './livePen';
import { PenSound } from './penSound';

const STORAGE_KEY = 'scribe.sound';

function readStoredOn() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch (e) {
    return true;
  }
}

function writeStoredOn(on) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch (e) { /* private mode */ }
}

/**
 * Friends-app pen sound driven from the demo's live.js timeline clock.
 * AudioContext + clips are created only after unlock() (a user gesture).
 * Silent under reduced-motion / forceFast.
 *
 * @param {{
 *   fast?: boolean,
 *   playbackRef: React.MutableRefObject<{
 *     vt: number,
 *     strokes: object[],
 *     playing: boolean,
 *     scrubbing: boolean,
 *     speed?: number,
 *   }>,
 * }} opts
 */
export default function usePenSound({ fast = false, playbackRef }) {
  const [soundOn, setSoundOn] = useState(() => (
    typeof window !== 'undefined' ? readStoredOn() : true
  ));
  const soundOnRef = useRef(soundOn);
  const penSndRef = useRef(null);
  const tickingRef = useRef(false);
  const sndVtRef = useRef(-1);
  const sndStrokeRef = useRef(-1);
  const fastRef = useRef(fast);

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  useEffect(() => { fastRef.current = fast; }, [fast]);

  const ensureTick = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    const tick = () => {
      tickingRef.current = true;
      requestAnimationFrame(tick);
      const penSnd = penSndRef.current;
      if (!penSnd) return;
      if (fastRef.current || !soundOnRef.current) {
        penSnd.silence();
        return;
      }
      const pb = playbackRef.current || {};
      const S = pb.strokes || [];
      const vt = pb.vt || 0;
      const step = vt - sndVtRef.current;
      sndVtRef.current = vt;
      const live = pb.playing
        && !document.hidden
        && S.length
        && !pb.scrubbing
        && step > 1e-6
        && step < 0.5;
      let st = { down: 0, v: 0 };
      let i = -1;
      if (live) {
        const m = motionAt(S, vt, pb.speed || DEFAULT_SPEED);
        i = m.i;
        st = { down: m.down, v: m.v };
        if (!st.down) i = -1;
      }
      if (i !== sndStrokeRef.current) {
        if (sndStrokeRef.current >= 0) penSnd.tap('lift');
        if (i >= 0) penSnd.tap('down');
        sndStrokeRef.current = i;
      }
      if (st.down) penSnd.update(st);
      else penSnd.silence();
    };
    requestAnimationFrame(tick);
  }, [playbackRef]);

  const unlock = useCallback(() => {
    if (fastRef.current) return;
    if (!soundOnRef.current) return;
    if (!penSndRef.current) {
      penSndRef.current = new PenSound();
      penSndRef.current.setOn(true);
      ensureTick();
    }
    penSndRef.current.unlock();
    if (typeof window !== 'undefined' && window.__SCRIBE_SOUND_LOG) {
      window.__SCRIBE_SOUND_LOG.unlocked = true;
      window.__SCRIBE_SOUND_LOG.ctxState = () => (
        penSndRef.current && penSndRef.current.ctx
          ? penSndRef.current.ctx.state
          : null
      );
      window.__SCRIBE_SOUND_LOG.instance = () => penSndRef.current;
    }
  }, [ensureTick]);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      writeStoredOn(next);
      soundOnRef.current = next;
      if (next && !fastRef.current) {
        if (!penSndRef.current) {
          penSndRef.current = new PenSound();
          ensureTick();
        }
        penSndRef.current.setOn(true);
        penSndRef.current.unlock();
      } else if (penSndRef.current) {
        penSndRef.current.setOn(false);
      }
      return next;
    });
  }, [ensureTick]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && penSndRef.current) penSndRef.current.silence();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => () => {
    if (penSndRef.current) penSndRef.current.silence();
  }, []);

  return { soundOn, toggleSound, unlockSound: unlock };
}
