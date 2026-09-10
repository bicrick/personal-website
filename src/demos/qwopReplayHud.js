/** Edge-HUD helpers for the QWOP demo (data outside the game buffer). */

const COURSE_METERS = 100;
const SPEED_WINDOW_SEC = 3.5;
const SPARK_POINTS = 48;

export function modelLabelFromMeta(meta = {}) {
  if (meta.model_label) return meta.model_label;
  const file = meta.model_file || meta.model || '';
  if (/PPO|early1|model_118M|earlysurv/i.test(file)) return 'PPO early1';
  const parts = String(file).split('/').filter(Boolean);
  let folder = parts[parts.length - 1] || '';
  if (/^model\.zip$/i.test(folder) && parts.length >= 2) {
    folder = parts[parts.length - 2];
  }
  folder = folder.replace(/\.zip$/i, '');
  if (folder) {
    const cleaned = folder
      .replace(/-[a-z0-9]{6,}$/i, '')
      .replace(/-(PROVEN|STABLE|SPEED)(-[A-Z0-9]+)*$/i, '');
    return (cleaned || folder).replace(/_/g, '-');
  }
  return 'PPO early1';
}

/** HUD / about copy for the early1 WR-hunt demo recording. */
export const PPO_EARLY1_INFO =
  "I trained a PPO agent in qwop-python on the early1 flex-gait + EarlySurvival line (model_118M). This replay is a ~43.7s Python finish (settle_spawn off — dive-start highlight). The same policy line, spectated on official browser physics with settle spawn, produced the 45.167 HUD keep that beat the human HTML5 WR of 45.530. Pose replay only — not live inference.";

export const AGENT_INFO = PPO_EARLY1_INFO;

export function agentInfoFromMeta(_meta = {}) {
  return PPO_EARLY1_INFO;
}

export function formatSeedLine(meta = {}) {
  const seed = meta.seed != null ? `seed ${meta.seed}` : null;
  const bits = [seed, 'realtime replay'].filter(Boolean);
  return bits.join(' · ');
}

export function formatRecordedLine(meta = {}) {
  const t = meta.final_time ?? meta.score_time_seconds;
  const timeBit =
    typeof t === 'number' && Number.isFinite(t)
      ? `~${t.toFixed(1)}s Python`
      : '~43.7s Python';
  return `Recorded PPO early1 · ${timeBit} highlight · browser WR 45.167 HUD · loops`;
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
