/** InkTheme values from bicrick/da-transcribuh — classic island + Paint chrome. */

export const Ink = {
  // Surfaces (light / dark). Demo CSS maps these via html.is-dark.
  window: { light: '#FFFFFF', dark: '#2C2C2E' },
  front: { light: '#FFFFFF', dark: '#3A3A3D' },
  card: { light: '#FFFFFF', dark: '#353538' },
  fill: { light: '#F0F0F0', dark: '#353538' },
  label: { light: '#000000', dark: '#F2F2F2' },
  secondary: { light: '#666666', dark: '#A8A8AD' },
  tertiary: { light: '#999999', dark: '#7A7A80' },
  hairline: { light: '#C0C0C0', dark: '#4A4A4E' },
  bevel: { light: '#000000', dark: '#F2F2F2' },
  record: '#ED1C24',
  paintCyan: '#00A2E8',
  paintYellow: '#FFF200',
  paintGreen: '#22B14C',
  paintMagenta: '#A349A4',

  stroke: 2,
  bevelOffset: 3,
  cardRadius: 2,
  buttonRadius: 2,
  space1: 4,
  space2: 8,
  space3: 12,
};

/** Classic IslandChromeScale (IslandMetrics.scale(.classic)). */
export const ClassicScale = {
  inset: 14,
  sideGap: 12,
  recordSize: 8,
  recordClockGap: 8,
  clockFontSize: 12,
  chipFontSize: 12,
  chipIconSize: 10,
  chipMinHeight: 28,
  barHeight: 48,
  wave: { width: 188, height: 26 },
  // Approx Departure Mono digit width for "59:59" at 12px — Swift uses FontMetrics.
  // Measured ~7.2px/char for Departure Mono; "59:59" ≈ 36 + 2 pad = 38.
  clockSpan: 40,
};

export const WaveformCount = 64;

export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/** Live-ish waveform levels (WaveformMotion.loading) — soft dual-hump travel. */
export function waveformLevels(time, count = WaveformCount) {
  if (count <= 0) return [];
  const travel = time * 0.48;
  const span = Math.max(count - 1, 1);
  const wrap = (v) => {
    const w = v % 1;
    return w < 0 ? w + 1 : w;
  };
  const hump = (x, center, width) => {
    let delta = Math.abs(x - center);
    if (delta > 0.5) delta = 1 - delta;
    const half = width / 2;
    if (delta >= half || half <= 0) return 0;
    return 0.5 + 0.5 * Math.cos((delta / half) * Math.PI);
  };
  return Array.from({ length: count }, (_, index) => {
    const x = index / span;
    const lead = hump(x, wrap(travel), 0.22);
    const follow = hump(x, wrap(travel + 0.42), 0.16);
    const level = 0.1 + lead * 0.34 + follow * 0.2;
    return Math.min(1, Math.max(0.08, level));
  });
}

export function chipSpan(count) {
  // digits + icon(10) + gap(6) + hPad*2 (space2=8 → 16) + 2
  const digits = String(Math.max(count, 1)).length * 7.2;
  return Math.ceil(digits + 6 + ClassicScale.chipIconSize + Ink.space2 * 2) + 2;
}
