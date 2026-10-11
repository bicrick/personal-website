// Behavioural analysis of the SWE-bench runs (Haiku 5.5, 49 scored tasks).
// From bicrick/context-shaping docs/WHY_HARNESSES_DIFFER.md and
// scripts/why_harnesses_differ.py -> results/swebench/why_harnesses.json.
// outcome: fixed / wrong fix submitted / ended with no fix (empty patch).
export const OUTCOMES = [
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', fixed: 38, wrong: 11, none: 0 },
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', fixed: 36, wrong: 12, none: 1 },
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, fixed: 35, wrong: 12, none: 2 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', fixed: 34, wrong: 13, none: 2 },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', fixed: 31, wrong: 13, none: 5 },
  { id: 'aider', label: 'Aider', outfit: 'aider', fixed: 30, wrong: 13, none: 6 },
];
export const OPENCODE_PERMISSION_STOPS = 7; // runs that ended at a permission prompt
export const AIDER_HANDBACKS = 22; // runs whose last message asks the user to run/confirm

// Share of runs that ran code (tests or a repro) after their first edit.
// Only measurable where we have step-by-step transcripts.
export const CHECKED = [
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', pct: 98, rate: 73 },
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', pct: 82, rate: 78 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', pct: 63, rate: 69 },
];

// django__django-14376: the deprecated MySQL "db"/"passwd" keywords.
export const TWO_FILES = {
  task: 'django__django-14376',
  files: ['mysql/base.py', 'mysql/client.py'],
  others: ['swe', undefined, 'mini', 'opencode', 'aider'],
};
