/** Edge-HUD helpers for the QWOP demo (data outside the game buffer). */

const COURSE_METERS = 100;

export function modelLabelFromMeta(_meta = {}) {
  return 'PPO';
}

/** Short algorithm card for the PPO WR-hunt demo recording. */
export const PPO_EARLY1_INFO =
  'Stable-Baselines3 PPO (clipped surrogate, ε = 0.2). GAE: γ = 0.99, λ = 0.95; 2048-step rollouts, batch 64, 10 epochs, lr 3e-4, entropy 0.01. 60-dim body-state obs, Discrete(16) Q/W/O/P. Reward on this line: 10 · Δs − time_cost + terminal (speed_rew_mult = 0), plus flex-gait and early-survival shaping. Pose replay of model_118M — not live inference.';

export const AGENT_INFO = PPO_EARLY1_INFO;

export function agentInfoFromMeta(_meta = {}) {
  return PPO_EARLY1_INFO;
}

export function formatSeedLine(meta = {}) {
  const seed = meta.seed != null ? `seed ${meta.seed}` : null;
  const bits = [seed, 'realtime replay'].filter(Boolean);
  return bits.join(' · ');
}

export function formatRecordedLine(_meta = {}) {
  return 'Recorded PPO pose replay · loops';
}

export function hudStatsForFrame(run, frameIndex) {
  const distances = run.distance || [];
  const n = distances.length;
  if (!n) {
    return {
      distance: 0,
      progress: 0,
    };
  }

  const i = Math.max(0, Math.min(frameIndex, n - 1));
  const distance = distances[i] || 0;
  const progress = Math.max(0, Math.min(1, distance / COURSE_METERS));

  return {
    distance,
    progress,
  };
}
