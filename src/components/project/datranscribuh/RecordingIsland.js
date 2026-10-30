import React, { useEffect, useState } from 'react';
import WaveformBars from './WaveformBars';
import CaptureCountChip from './CaptureCountChip';
import {
  ClassicScale,
  formatClock,
  waveformLevels,
  chipSpan,
} from './ink';

/**
 * Port of RecordingIslandFace (classic). Double-pane bevel via CSS.
 * Layout mirrors IslandMetrics.layout for classic + open slots.
 */
export default function RecordingIsland({
  visible,
  elapsed = 0,
  captures = 0,
  levels,
  paused = false,
  reduced = false,
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || paused || reduced) return undefined;
    let raf = 0;
    let start = performance.now();
    const loop = (now) => {
      setTick((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, paused, reduced]);

  if (!visible) return null;

  const scale = ClassicScale;
  const hasChip = captures > 0;
  const leadingNatural = scale.recordSize + scale.recordClockGap + scale.clockSpan;
  const trailingNatural = Math.max(chipSpan(Math.max(captures, 1)), 40);
  const sideEqual = Math.max(leadingNatural, trailingNatural);
  const leadingSide = hasChip ? sideEqual : leadingNatural;
  const trailingSide = hasChip ? sideEqual : 0;
  const gapL = scale.sideGap;
  const gapR = hasChip ? scale.sideGap : 0;
  const panelW =
    scale.inset * 2 + leadingSide + gapL + scale.wave.width + gapR + trailingSide;
  const panelH = scale.barHeight;

  const wave = levels || waveformLevels(reduced ? 0 : tick);

  return (
    <div
      className="dtd-island"
      style={{ width: panelW + 3, height: panelH + 3 }}
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
        <div className="dtd-island-leading" style={{ width: leadingSide }}>
          <span className="dtd-record-dot" style={{ width: scale.recordSize, height: scale.recordSize }} />
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
        <div style={{ width: gapL }} />
        <WaveformBars levels={wave} width={scale.wave.width} height={scale.wave.height} />
        {hasChip ? (
          <>
            <div style={{ width: gapR }} />
            <div className="dtd-island-trailing" style={{ width: trailingSide }}>
              <CaptureCountChip count={captures} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
