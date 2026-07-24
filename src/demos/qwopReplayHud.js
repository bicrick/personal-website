/** Edge-HUD helpers for the QWOP demo (data outside the game buffer). */

const COURSE_METERS = 100;
const SPEED_WINDOW_SEC = 3.5;
const SPARK_POINTS = 48;

export function modelLabelFromMeta(meta = {}) {
  if (meta.model_label) return meta.model_label;
  const file = meta.model_file || '';
  if (/QRDQN/i.test(file)) return 'QRDQN';
  const parts = file.split('/').filter(Boolean);
  // Prefer parent folder of model.zip (e.g. data/QRDQN-PROVEN-xxx/model.zip)
  let folder = parts[parts.length - 1] || '';
  if (/^model\.zip$/i.test(folder) && parts.length >= 2) {
    folder = parts[parts.length - 2];
  }
  folder = folder.replace(/\.zip$/i, '');
  if (folder) {
    // Drop trailing training-run ids like -k3jlgned and variant suffixes like -PROVEN
    const cleaned = folder
      .replace(/-[a-z0-9]{6,}$/i, '')
      .replace(/-(PROVEN|STABLE|SPEED)(-[A-Z0-9]+)*$/i, '');
    return (cleaned || folder).replace(/_/g, '-');
  }
  return 'RL agent';
}

export const QRDQN_INFO =
  'Quantile Regression DQN learns a distribution of returns instead of a single Q-value, which helps with noisy QWOP physics. The agent picks from a small discrete set of Q/W/O/P key combinations each step; this replay is a recorded episode from that policy (not live inference).';

export function formatSeedLine(meta = {}) {
  const seed = meta.seed != null ? `seed ${meta.seed}` : null;
  const bits = [seed, 'realtime replay'].filter(Boolean);
  return bits.join(' · ');
}

export function formatRecordedLine(meta = {}) {
  const dist = Number(meta.final_distance);
  if (!Number.isFinite(dist)) return 'recorded run · loops';
  return `~${dist.toFixed(1)} m recorded · loops`;
}

export function hudStatsForFrame(run, frameIndex) {
  const distances = run.distance || [];
  const n = distances.length;
  if (!n) {
    return {
      distance: 0,
      progress: 0,
      speed: 0,
      spark: [],
    };
  }

  const i = Math.max(0, Math.min(frameIndex, n - 1));
  const distance = distances[i] || 0;
  const progress = Math.max(0, Math.min(1, distance / COURSE_METERS));
  const dt = run.dt || 1 / 30;
  const windowFrames = Math.max(2, Math.round(SPEED_WINDOW_SEC / dt));
  const start = Math.max(0, i - windowFrames);
  const elapsed = Math.max(dt, (i - start) * dt);
  const speed = (distance - distances[start]) / elapsed;

  const spark = [];
  const sparkStart = Math.max(0, i - SPARK_POINTS + 1);
  for (let s = sparkStart; s <= i; s += 1) {
    const prev = Math.max(0, s - 1);
    const inst = s === 0 ? 0 : (distances[s] - distances[prev]) / dt;
    spark.push(inst);
  }

  return {
    distance,
    progress,
    speed: Number.isFinite(speed) ? Math.max(0, speed) : 0,
    spark,
  };
}

export function sparklinePath(values, width, height) {
  if (!values.length) return '';
  const max = Math.max(0.1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((v, idx) => {
      const x = idx * step;
      const y = height - (Math.max(0, v) / max) * (height - 2) - 1;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
