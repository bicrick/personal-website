export const PERIOD = 14000;

export const VIEW = { w: 560, h: 380 };
export const BOT = { x: 280, y: 190 };
export const CARD = { w: 188, h: 118 };

// Card centers, clockwise from the top left. The track runs through these,
// so the token disappears under a card while that step is running.
export const STATIONS = [
  { id: 'farm', x: 118, y: 83 },
  { id: 'observe', x: 442, y: 83 },
  { id: 'shape', x: 442, y: 297 },
  { id: 'enqueue', x: 118, y: 297 },
];

const STAGE = 0.25;
const HOLD = 0.18;
const HEAD = 114.2705;

const smooth = (t) => t * t * (3 - 2 * t);

// Each step owns a quarter of the loop: arrive, hold on the card, then travel.
export function sampleLoop(u) {
  const w = ((u % 1) + 1) % 1;
  const k = Math.min(3, Math.floor(w / STAGE));
  const local = w - k * STAGE;
  const from = STATIONS[k];
  if (local <= HOLD) return { stage: from.id, x: from.x, y: from.y };
  const to = STATIONS[(k + 1) % 4];
  const t = smooth((local - HOLD) / (STAGE - HOLD));
  return {
    stage: 'travel',
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

// Motion borrowed from the marketplace states: farm works, observe searches,
// shape settles, enqueue hops, and travel idles.
function stageMotion(stage, i) {
  if (stage === 'farm') {
    const e = Math.sin(i * Math.PI * 3.2);
    return { x: 0, y: 1.5 + 3 * Math.max(0, e), rot: 2.5 * e, sy: 1 - 0.02 * Math.max(0, e) };
  }
  if (stage === 'observe') {
    const e = Math.sin(1.3 * i);
    return { x: 3 * e, y: 3 * Math.sin(1.7 * i), rot: 5 * e, sy: 1 };
  }
  if (stage === 'shape') {
    return { x: 0, y: 1.2 * Math.sin(0.85 * i), rot: 0, sy: 1 };
  }
  if (stage === 'enqueue') {
    const hop = (2.2 * i) % 1;
    return {
      x: 2 * Math.sin(1.1 * i),
      y: -(10 * Math.sin(hop * Math.PI)) + 2,
      rot: 3 * Math.sin(i * Math.PI * 2.2),
      sy: hop < 0.1 ? 0.92 : hop < 0.3 ? 1.05 : 1,
    };
  }
  return {
    x: 0,
    y: 1.2 * Math.sin(0.85 * i),
    rot: 1.5 * Math.sin(0.5 * i),
    sy: 1 + 0.007 * Math.sin(0.85 * i),
  };
}

// The eyes aim at the token (yaw and pitch in degrees, like the engine's gaze
// channels). The head leans a little toward it too.
export function poseTarget(stage, seconds, bead) {
  const dx = bead.x - BOT.x;
  const dy = bead.y - BOT.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const m = stageMotion(stage, seconds);
  return {
    x: m.x + 5 * ux,
    y: m.y + 3 * uy,
    rot: m.rot + 7 * ux,
    sy: m.sy,
    yaw: 38 * ux,
    pitch: 28 * uy,
  };
}

const RAD = Math.PI / 180;
const EYE_C = { x: 153, y: 90 };

export function bodyTransform(s) {
  return `translate(${(HEAD + s.x.x).toFixed(2)} ${(HEAD + s.y.x).toFixed(2)}) rotate(${s.rot.x.toFixed(2)}) scale(1 ${s.sy.x.toFixed(4)}) translate(${-HEAD} ${-HEAD})`;
}

// Eyes ride a sphere: they slide with the gaze, bunch up as they turn away,
// and close from their own center when blinking. The head clips them.
export function eyeTransform(s) {
  const gx = 30 * Math.sin(s.yaw.x * RAD);
  const gy = 20 * Math.sin(s.pitch.x * RAD);
  const fore = 1 - 0.3 * Math.abs(Math.sin(s.yaw.x * RAD));
  const open = Math.max(0.04, s.open.x);
  return `translate(${gx.toFixed(2)} ${gy.toFixed(2)}) translate(${EYE_C.x} ${EYE_C.y}) scale(${fore.toFixed(3)} ${open.toFixed(3)}) translate(${-EYE_C.x} ${-EYE_C.y})`;
}
