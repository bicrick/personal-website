// SWE-bench Verified, Haiku 5.5 in six harnesses, 49 scored tasks.
// From bicrick/context-shaping results/swebench/summary_tokens.csv
// (latest row per task x harness; psf__requests-2317 excluded).
// rate: tasks solved / 49 (ci = 95% Wilson interval).
// usd: total spend / solves (Cursor estimated from its own token logs).
// tok: all tokens (input + output + cache read + cache write) / solves.
// min: wall-clock minutes per solve, from the runs under the fair setup only
//      (3 at a time, 2 CPU / 4 GB each): total wall time / solves in those runs.
// cache: cache_read / (input + cache_read + cache_write).
export const SWE_N = 49;

export const SWE = [
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', solved: 38, rate: 78, ci: [64, 87], usd: 0.0111, tok: 382576, min: 8.9, cache: 93, est: true },
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'harness', solved: 36, rate: 73, ci: [60, 84], usd: 0.0172, tok: 425722, min: 14.8, cache: 92 },
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, solved: 35, rate: 71, ci: [58, 82], usd: 0.012, tok: 456423, min: 7.6, cache: 93 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', solved: 34, rate: 69, ci: [55, 80], usd: 0.0076, tok: 196178, min: 6.0, cache: 91 },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', solved: 31, rate: 63, ci: [49, 75], usd: 0.0055, tok: 149342, min: 5.8, cache: 90 },
  { id: 'aider', label: 'Aider', outfit: 'aider', solved: 30, rate: 61, ci: [47, 74], usd: 0.0853, tok: 265701, min: 7.5, cache: 4 },
];

// Real per-call logs, django__django-11880, both solved it.
// [prompt tokens, of which read from cache, usd]
export const CACHE_RACE = {
  task: 'django__django-11880',
  aider: [[85461, 2433, 0.00897], [93561, 2433, 0.009842], [70821, 0, 0.007558], [70821, 0, 0.007558]],
  opencode: [[1249, 782, 0.000078], [10448, 9909, 0.000207], [11066, 10444, 0.00037], [12134, 11064, 0.00037], [12432, 12132, 0.000199], [12563, 12430, 0.000189], [12697, 12561, 0.000226], [13419, 12695, 0.000316]],
};
