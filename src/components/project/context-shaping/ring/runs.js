import DATA from '../ringData.json';
import { fmtTokens } from './segments';

/** Real runs from the study, rebuilt into ring frames by scripts/extract-context-rings.py. */
export const WINDOW = DATA.window;
export const WINDOW_LABEL = '1M window';
export const SCENARIOS = DATA.scenarios;
export const COMPACTION_RUNS = DATA.compaction;
export const PROCEDURE_RUNS = DATA.procedure;
export const FINAL_PROMPTS = DATA.final;

export const TASK_LABEL = `${DATA.task.repo}: ${DATA.task.label}`;

/** A ring for one frame (one model call) of a run, on the model's real 1M window. */
export function ringFor(id, frame, extra = {}) {
  return {
    id,
    segments: frame.seg,
    reasoning: frame.reasoning || 0,
    capacity: WINDOW,
    capacityLabel: WINDOW_LABEL,
    ...extra,
  };
}

export function runLabel(run) {
  return `run ${run.run}`;
}

export const SPLIT_NOTE =
  'Totals are the token counts the API reported; the split between segments is rebuilt from the run transcript.';

export { fmtTokens };
