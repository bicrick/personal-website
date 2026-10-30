/* baked orchestrator scenarios — handwriting model + planner layouts */
import data from './scenarios.json';
export const SCENARIOS = data;
export const SCENARIO_BY_ID = Object.fromEntries(data.map((s) => [s.id, s]));
/** Two precomputed hands. */
export const HANDS = [
  { id: 'neat', label: 'neat' },
  { id: 'slant', label: 'slant' },
];
