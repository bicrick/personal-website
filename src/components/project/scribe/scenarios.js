/* baked orchestrator scenarios — handwriting model + planner layouts */
import data from './scenarios.json';
export const SCENARIOS = data;
export const SCENARIO_BY_ID = Object.fromEntries(data.map((s) => [s.id, s]));
/** One precomputed hand (slant trimmed for demo chunk size). */
export const HANDS = [
  { id: 'neat', label: 'neat' },
];
