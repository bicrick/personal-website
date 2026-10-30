/* baked orchestrator scenarios — handwriting model + planner layouts */
import data from './scenarios.json';

/** Ensure inkByHand.neat exists; share the ink object when the bake was identical. */
function withHand(s) {
  if (s.inkByHand && s.inkByHand.neat) return s;
  return { ...s, inkByHand: { neat: s.ink } };
}

export const SCENARIOS = data.map(withHand);
export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
/** One precomputed hand (slant trimmed for demo chunk size). */
export const HANDS = [
  { id: 'neat', label: 'neat' },
];
