import React, { useEffect, useRef, useState } from 'react';
import WaveformBars from './WaveformBars';
import CaptureCountChip from './CaptureCountChip';
import {
  ClassicScale,
  formatClock,
  chipSpan,
  approach,
  IslandSlotTau,
  IslandFadeIn,
  IslandFadeOut,
  IslandFadeEase,
  restingLevels,
} from './ink';

/**
 * Port of RecordingIslandFace (classic) + IslandChromeMotion open/close.
 * Slots ease with tau 0.07; panel fades with ChromeHost reveal/dismiss curves.
 */
export default function RecordingIsland({
  visible,
  elapsed = 0,
  captures = 0,
  levels,
  paused = false,
  reduced = false,
}) {
  const [slotOpen, setSlotOpen] = useState(visible || reduced ? 1 : 0);
  const [chipOpen, setChipOpen] = useState(captures > 0 && visible ? 1 : 0);
  const [mounted, setMounted] = useState(!!visible);
  const [fadeOn, setFadeOn] = useState(!!visible);
  const slotRef = useRef(slotOpen);
  const chipRef = useRef(chipOpen);
  const visibleRef = useRef(visible);
  const capturesRef = useRef(captures);
  slotRef.current = slotOpen;
  chipRef.current = chipOpen;
  visibleRef.current = visible;
  capturesRef.current = captures;

  // Mount on open; keep mounted through close fade.
  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Next frame so the fade-in transition runs from opacity 0.
      const id = requestAnimationFrame(() => setFadeOn(true));
      return () => cancelAnimationFrame(id);
    }
    setFadeOn(false);
    return undefined;
  }, [visible]);

  // Unmount after fade-out completes.
  useEffect(() => {
    if (visible || !mounted) return undefined;
    if (reduced) {
      setMounted(false);
      setSlotOpen(0);
      setChipOpen(0);
      return undefined;
    }
    const ms = Math.round(IslandFadeOut * 1000) + 40;
    const id = window.setTimeout(() => {
      setMounted(false);
      setSlotOpen(0);
      setChipOpen(0);
    }, ms);
    return () => window.clearTimeout(id);
  }, [visible, mounted, reduced]);

  // Slot / chip exponential ease (IslandChromeMotion).
  useEffect(() => {
    if (!mounted) return undefined;
    if (reduced) {
      setSlotOpen(visible ? 1 : 0);
      setChipOpen(visible && captures > 0 ? 1 : 0);
      return undefined;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      const slotTarget = visibleRef.current ? 1 : 0;
      const chipTarget = visibleRef.current && capturesRef.current > 0 ? 1 : 0;
      const nextSlot = approach(slotRef.current, slotTarget, delta, IslandSlotTau);
      const nextChip = approach(chipRef.current, chipTarget, delta, IslandSlotTau);
      const slotDone = Math.abs(nextSlot - slotTarget) < 0.004;
      const chipDone = Math.abs(nextChip - chipTarget) < 0.004;
      const slotVal = slotDone ? slotTarget : nextSlot;
      const chipVal = chipDone ? chipTarget : nextChip;
      slotRef.current = slotVal;
      chipRef.current = chipVal;
      setSlotOpen(slotVal);
      setChipOpen(chipVal);
      if (!slotDone || !chipDone) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, captures, mounted, reduced, paused]);

  if (!mounted) return null;

  const scale = ClassicScale;
  const leadingOpen = slotOpen;
  const trailingOpen = chipOpen;
  const leadingNatural = scale.recordSize + scale.recordClockGap + scale.clockSpan;
  const trailingNatural = Math.max(chipSpan(Math.max(captures, 1)), 40);
  const sideEqual = Math.max(leadingNatural, trailingNatural);

  let leadingSide;
  let trailingSide;
  if (trailingOpen < 0.001) {
    leadingSide = leadingNatural * leadingOpen;
    trailingSide = 0;
  } else {
    leadingSide =
      (leadingNatural + (sideEqual - leadingNatural) * trailingOpen) * leadingOpen;
    trailingSide = sideEqual * trailingOpen;
  }
  const gapL = scale.sideGap * leadingOpen;
  const gapR = scale.sideGap * trailingOpen;
  const panelW =
    scale.inset * 2 + leadingSide + gapL + scale.wave.width + gapR + trailingSide;
  const panelH = scale.barHeight;

  const wave = levels || restingLevels();
  const fadeMs = (fadeOn ? IslandFadeIn : IslandFadeOut) * 1000;
  const opacity = fadeOn ? 1 : 0;

  return (
    <div
      className={`dtd-island${fadeOn ? ' is-open' : ' is-closing'}`}
      style={{
        width: panelW + 3,
        height: panelH + 3,
        opacity,
        transition: reduced
          ? 'none'
          : `opacity ${fadeMs}ms ${IslandFadeEase}`,
      }}
      role="status"
      aria-live="polite"
      aria-label={`recording, ${formatClock(elapsed)}${
        captures > 0 ? `, ${captures} capture${captures === 1 ? '' : 's'}` : ''
      }`}
    >
      <div
        className="dtd-island-face"
        style={{
          width: panelW,
          height: panelH,
          paddingLeft: scale.inset,
          paddingRight: scale.inset,
        }}
      >
        <div
          className="dtd-island-leading"
          style={{
            width: leadingSide,
            opacity: Math.min(1, leadingOpen / 0.72),
          }}
        >
          <span
            className="dtd-record-dot"
            style={{ width: scale.recordSize, height: scale.recordSize }}
          />
          <span
            className="dtd-island-clock"
            style={{
              fontSize: scale.clockFontSize,
              width: scale.clockSpan,
              marginLeft: scale.recordClockGap,
            }}
          >
            {formatClock(elapsed)}
          </span>
        </div>
        <div style={{ width: gapL, flex: '0 0 auto' }} />
        <WaveformBars levels={wave} width={scale.wave.width} height={scale.wave.height} />
        <div style={{ width: gapR, flex: '0 0 auto' }} />
        <div
          className="dtd-island-trailing"
          style={{
            width: trailingSide,
            opacity: Math.min(1, trailingOpen / 0.72),
            transform: reduced
              ? undefined
              : `scale(${0.88 + 0.12 * trailingOpen})`,
          }}
        >
          {trailingOpen > 0.02 ? <CaptureCountChip count={Math.max(captures, 1)} /> : null}
        </div>
      </div>
    </div>
  );
}
