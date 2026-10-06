// The marketplace bots are driven by damped springs, not keyframes. These are
// the same channels and constants as the engine on x.ai/bot/marketplace:
// omega is stiffness, zeta is damping. Stepped at 120 Hz like theirs.

const STEP = 1 / 120;

const CHANNELS = {
  x: { omega: 3.5, zeta: 1 },
  y: { omega: 4, zeta: 1 },
  rot: { omega: 5, zeta: 0.9 },
  sy: { omega: 10, zeta: 0.8 },
  yaw: { omega: 13, zeta: 1 },
  pitch: { omega: 13, zeta: 1 },
  open: { omega: 26, zeta: 1 },
};

const REST = { x: 0, y: 0, rot: 0, sy: 1, yaw: 0, pitch: 0, open: 1 };

export function createSprings() {
  const springs = {};
  Object.keys(CHANNELS).forEach((key) => {
    springs[key] = { x: REST[key], v: 0, t: REST[key], ...CHANNELS[key] };
  });
  return springs;
}

export function stepSprings(springs, targets, dt) {
  const n = Math.max(1, Math.ceil(dt / STEP));
  const h = dt / n;
  Object.keys(springs).forEach((key) => {
    const s = springs[key];
    if (targets[key] != null) s.t = targets[key];
    for (let i = 0; i < n; i += 1) {
      s.v += (-2 * s.zeta * s.omega * s.v - s.omega * s.omega * (s.x - s.t)) * h;
      s.x += s.v * h;
    }
    if (!Number.isFinite(s.x) || !Number.isFinite(s.v)) {
      s.x = s.t;
      s.v = 0;
    }
  });
}

// Blinks are a short list of eye-open targets, same shape as the engine's:
// snap shut, hold, open with a little overshoot, sometimes twice.
export function blinkSequence(at) {
  const seq = [
    { at, v: 0.05 },
    { at: at + 70, v: 0.05 },
    { at: at + 150, v: 1.08 },
    { at: at + 300, v: 1 },
  ];
  if (Math.random() < 0.14) {
    seq.push({ at: at + 370, v: 0.05 }, { at: at + 480, v: 1 });
  }
  return seq;
}

export function nextBlinkGap() {
  return 2500 + Math.random() * 3000;
}
