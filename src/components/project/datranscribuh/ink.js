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

/** IslandChromeMotion slot ease — tau ~0.07 settles in ~0.22–0.25s. */
export const IslandSlotTau = 0.07;
/** ChromeHost.revealIsland fade-in. */
export const IslandFadeIn = 0.26;
/** ChromeHost.dismissIsland fade-out. */
export const IslandFadeOut = 0.34;
/** Material-like standard curve used for island fade (controlPoints 0.4, 0, 0.2, 1). */
export const IslandFadeEase = 'cubic-bezier(0.4, 0, 0.2, 1)';
/** FrequencyBands.smooth live follow() taus while voiced. */
export const WaveAttackTau = 0.04;
export const WaveReleaseTau = 0.07;
/** FrequencyBands.smooth defaults (slower release used when decaying to idle). */
export const WaveIdleReleaseTau = 0.26;

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

/** FrequencyBands.resting — low center envelope. */
export function restingLevels(count = WaveformCount) {
  if (count <= 0) return [];
  const span = Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, index) => {
    const position = index / span;
    const center = Math.max(0, 1 - Math.abs(position - 0.5) * 2);
    return 0.08 + 0.05 * center;
  });
}

/** FrequencyBands.shaped — single loudness → comb with center bias. */
export function shapedLevels(level, count = WaveformCount) {
  if (count <= 0) return [];
  const span = Math.max(count - 1, 1);
  const amp = Math.min(1, Math.max(0, level));
  return Array.from({ length: count }, (_, index) => {
    const position = index / span;
    const envelope = 1 - Math.abs(position - 0.5) * 1.15;
    const height = 0.08 + amp * 0.9 * Math.max(0.25, envelope);
    return Math.min(1, Math.max(0.08, height));
  });
}

/** FrequencyBands.soften — share energy with neighbors. */
export function softenLevels(levels) {
  if (!levels || levels.length <= 2) return levels || [];
  return levels.map((_, index) => {
    const left = levels[Math.max(0, index - 1)];
    const right = levels[Math.min(levels.length - 1, index + 1)];
    return left * 0.22 + levels[index] * 0.56 + right * 0.22;
  });
}

/**
 * FrequencyBands.smooth — exponential approach; rise uses attackTau, fall uses releaseTau.
 * delta is seconds since last frame.
 */
export function smoothLevels(
  current,
  target,
  delta = 1 / 60,
  attackTau = WaveAttackTau,
  releaseTau = WaveReleaseTau
) {
  const step = Math.max(0, delta);
  const attack = 1 - Math.exp(-step / Math.max(attackTau, 0.001));
  const release = 1 - Math.exp(-step / Math.max(releaseTau, 0.001));
  const count = Math.max(current?.length || 0, target?.length || 0);
  return Array.from({ length: count }, (_, index) => {
    const from = index < (current?.length || 0) ? current[index] : 0.1;
    const to = index < (target?.length || 0) ? target[index] : 0.1;
    const rate = to > from ? attack : release;
    return from + (to - from) * rate;
  });
}

/** IslandSlots.step — same exponential used for chrome open amount. */
export function approach(value, target, delta, tau = IslandSlotTau) {
  if (!(tau > 0)) return target;
  const rate = 1 - Math.exp(-Math.max(0, delta) / tau);
  return value + (target - value) * rate;
}

/**
 * Speech-ish loudness for the character under the cursor.
 * Letters → voiced (vowels louder); spaces → quiet; punctuation → near-idle.
 */
export function charVoicing(ch, jitter = 0) {
  if (!ch || /\s/.test(ch)) return 0.02;
  if (/[.,;:!?…'"“”‘’()[\]{}]/.test(ch)) return 0.06;
  const j = Math.max(-0.08, Math.min(0.08, jitter));
  if (/[aeiouy]/i.test(ch)) return Math.min(1, 0.78 + j);
  if (/[mnrwl]/i.test(ch)) return Math.min(1, 0.55 + j);
  return Math.min(1, 0.42 + j);
}

/**
 * Build a raw comb from text progress.
 * `charIndex` is how many characters have been "spoken"/typed (0..length).
 * Adds a short trailing syllable hump so bars aren't a flat plate.
 */
export function speechTargetFromText(text, charIndex, count = WaveformCount, now = 0) {
  const rest = restingLevels(count);
  if (!text || text.length === 0) return rest;
  const i = Math.max(0, Math.min(text.length, Math.floor(charIndex)));
  const ch = i > 0 ? text[i - 1] : '';
  // Tiny deterministic jitter from time + index so bars don't lock in sync.
  const jitter =
    0.06 * Math.sin(now * 17.3 + i * 0.7) + 0.04 * Math.cos(now * 11.1 + i * 1.3);
  const level = charVoicing(ch, jitter);
  // Local syllable envelope: recent letters share energy, gaps mute.
  let syllable = level;
  if (i > 1) {
    const prev = charVoicing(text[i - 2], jitter * 0.5);
    syllable = Math.max(level, prev * 0.55);
  }
  // Soft left→right travel so the comb reads as speech, not a meter.
  const span = Math.max(count - 1, 1);
  const focus = ((i % 13) / 13) * 0.55 + 0.22;
  const raw = Array.from({ length: count }, (_, index) => {
    const position = index / span;
    const near = 1 - Math.min(1, Math.abs(position - focus) * 2.4);
    const envelope = 1 - Math.abs(position - 0.5) * 1.15;
    const height =
      0.08 +
      syllable * 0.9 * Math.max(0.2, envelope) * (0.45 + 0.55 * Math.max(0.15, near));
    return Math.min(1, Math.max(0.08, height));
  });
  return softenLevels(raw);
}

export function chipSpan(count) {
  // digits + icon(10) + gap(6) + hPad*2 (space2=8 → 16) + 2
  const digits = String(Math.max(count, 1)).length * 7.2;
  return Math.ceil(digits + 6 + ClassicScale.chipIconSize + Ink.space2 * 2) + 2;
}
