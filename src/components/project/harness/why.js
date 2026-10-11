// Behavioural analysis of the SWE-bench runs (Haiku 5.5, 50 tasks).
// From bicrick/context-shaping docs/WHY_HARNESSES_DIFFER.md and
// scripts/why_harnesses_differ.py -> results/swebench/why_harnesses.json.
// outcome: fixed / wrong fix submitted / ended with no fix (empty patch).
export const OUTCOMES = [
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', fixed: 39, wrong: 11, none: 0 },
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', fixed: 37, wrong: 12, none: 1 },
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, fixed: 36, wrong: 12, none: 2 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', fixed: 35, wrong: 13, none: 2 },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', fixed: 32, wrong: 13, none: 5 },
  { id: 'aider', label: 'Aider', outfit: 'aider', fixed: 31, wrong: 13, none: 6 },
];
export const OPENCODE_PERMISSION_STOPS = 7; // runs that ended at a permission prompt
export const AIDER_HANDBACKS = 22; // (counted on the original 49) runs whose last message asks the user to run/confirm

// Share of runs that ran code (tests or a repro) after their first edit.
// Only measurable where we have step-by-step transcripts.
export const CHECKED = [
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', pct: 98, rate: 74 },
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', pct: 82, rate: 78 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', pct: 64, rate: 70 },
];

// django__django-14376: the deprecated MySQL "db"/"passwd" keywords.
export const TWO_FILES = {
  task: 'django__django-14376',
  files: ['mysql/base.py', 'mysql/client.py'],
  others: ['swe', undefined, 'mini', 'opencode', 'aider'],
};

// Confound check (all 50 tasks). OpenCode with auto-approve: permission stops 7 -> 0, empty runs 5 -> 0.
// Cursor without thinking: 39 -> 35 solved, and none of its 3 unique wins (incl. TWO_FILES) survive.
export const OUTCOMES_VARIANTS = {
  opencode_auto: { id: 'opencode_auto', base: 'opencode', label: 'OpenCode (auto-approve)', outfit: 'opencode', fixed: 36, wrong: 14, none: 0, permissionStops: 0 },
  cursor_nothink: { id: 'cursor_nothink', base: 'cursor', label: 'Cursor (no thinking)', outfit: 'cursor', fixed: 35, wrong: 15, none: 0, thinkingRuns: 0, uniqueWinsKept: 0 },
};
export const CHECKED_VARIANTS = {
  cursor_nothink: { id: 'cursor_nothink', label: 'Cursor (no thinking)', outfit: 'cursor', pct: 80, rate: 70 },
};
export const TWO_FILES_NOTHINK = { cursor_nothink: { files: ['mysql/base.py'], solved: false } };
