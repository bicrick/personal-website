// SWE-bench Verified, Haiku 5.5 in six harnesses, 50 tasks.
// From bicrick/context-shaping results/swebench/summary_tokens.csv
// (latest row per task x harness; psf__requests-2317 replaced by psf__requests-1142).
// rate: tasks solved / 50 (ci = 95% Wilson interval).
// usd: total spend / solves (Cursor estimated from its own token logs).
// tok: all tokens (input + output + cache read + cache write) / solves.
// min: wall-clock minutes per solve, from the runs under the fair setup only
//      (3 at a time, 2 CPU / 4 GB each): total wall time / solves in those runs.
// cache: cache_read / (input + cache_read + cache_write).
export const SWE_N = 50;

export const SWE = [
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', solved: 39, rate: 78, ci: [65, 87], usd: 0.0109, tok: 375207, min: 8.6, cache: 93, est: true },
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', solved: 37, rate: 74, ci: [60, 84], usd: 0.0168, tok: 416052, min: 14.2, cache: 92 },
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, solved: 36, rate: 72, ci: [58, 83], usd: 0.0118, tok: 448870, min: 7.2, cache: 93 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', solved: 35, rate: 70, ci: [56, 81], usd: 0.0075, tok: 192858, min: 5.8, cache: 91 },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', solved: 32, rate: 64, ci: [50, 76], usd: 0.0054, tok: 146641, min: 5.4, cache: 90 },
  { id: 'aider', label: 'Aider', outfit: 'aider', solved: 31, rate: 62, ci: [48, 74], usd: 0.0828, tok: 258870, min: 7.0, cache: 4 },
];

// Real per-call logs, django__django-11880, both solved it.
// [prompt tokens, of which read from cache, usd]
export const CACHE_RACE = {
  task: 'django__django-11880',
  aider: [[85461, 2433, 0.00897], [93561, 2433, 0.009842], [70821, 0, 0.007558], [70821, 0, 0.007558]],
  opencode: [[1249, 782, 0.000078], [10448, 9909, 0.000207], [11066, 10444, 0.00037], [12134, 11064, 0.00037], [12432, 12132, 0.000199], [12563, 12430, 0.000189], [12697, 12561, 0.000226], [13419, 12695, 0.000316]],
};

// Confound check (all 50 tasks, same fair setup), not shown in the main lineup:
// opencode_auto = OpenCode with every permission auto-approved (no headless permission stops);
// cursor_nothink = Cursor on "Haiku 5.5 High No Thinking" (0 of 50 runs had thinking vs 49 of 50).
export const SWE_VARIANTS = {
  opencode_auto: { id: 'opencode_auto', base: 'opencode', label: 'OpenCode (auto-approve)', outfit: 'opencode', solved: 36, rate: 72, ci: [58, 83], usd: 0.0071, tok: 226806, min: 3.8, cache: 93 },
  cursor_nothink: { id: 'cursor_nothink', base: 'cursor', label: 'Cursor (no thinking)', outfit: 'cursor', solved: 35, rate: 70, ci: [56, 81], usd: 0.0093, tok: 392911, min: 4.9, cache: 94, est: true },
};
