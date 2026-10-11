// SWE-bench Verified, 50-task subset, Haiku 5.5 in six harnesses.
// From bicrick/context-shaping results/swebench/summary_tokens.csv
// (latest row per task x harness; psf__requests-2317 excluded, 49 scored).
// ci = 95% Wilson interval. cache = cache_read / (input + cache_read + cache_write).
// Cursor bills outside the cost proxy, so its $ is estimated from its own token logs.
export const SWE_N = 49;
export const SWE_ALL = 26; // solved by all six
export const SWE_NONE = 8; // solved by none
export const SWE_SPEND = 5.34; // total proxied spend incl. pilot + retries

export const SWE = [
  { id: 'cursor', label: 'Cursor', logo: 'cursor', solved: 38, pct: 78, ci: [64, 87], perSolve: 0.0111, tokPerSolve: 382576, cache: 93, est: true },
  { id: 'swe_agent', label: 'SWE-agent', solved: 36, pct: 73, ci: [60, 84], perSolve: 0.0172, tokPerSolve: 425722, cache: 92 },
  { id: 'claude_code', label: 'Claude Code', logo: 'claude', solved: 35, pct: 71, ci: [58, 82], perSolve: 0.012, tokPerSolve: 456423, cache: 93 },
  { id: 'mini', label: 'mini-swe-agent', logo: 'mini', solved: 34, pct: 69, ci: [55, 80], perSolve: 0.0076, tokPerSolve: 196178, cache: 91 },
  { id: 'opencode', label: 'OpenCode', logo: 'opencode', solved: 31, pct: 63, ci: [49, 75], perSolve: 0.0055, tokPerSolve: 149342, cache: 90 },
  { id: 'aider', label: 'Aider', logo: 'aider', solved: 30, pct: 61, ci: [47, 74], perSolve: 0.0853, tokPerSolve: 265701, cache: 4 },
];

// Tasks by how many of the six harnesses solved them (sums to 49).
export const SWE_SPREAD = [
  { k: 6, n: 26 }, { k: 5, n: 6 }, { k: 4, n: 2 }, { k: 3, n: 1 }, { k: 2, n: 1 }, { k: 1, n: 5 }, { k: 0, n: 8 },
];

// Real per-call logs, django__django-11880, both solved it.
// [prompt tokens, of which read from cache, usd]
export const CACHE_RACE = {
  task: 'django__django-11880',
  aider: [[85461, 2433, 0.00897], [93561, 2433, 0.009842], [70821, 0, 0.007558], [70821, 0, 0.007558]],
  opencode: [[1249, 782, 0.000078], [10448, 9909, 0.000207], [11066, 10444, 0.00037], [12134, 11064, 0.00037], [12432, 12132, 0.000199], [12563, 12430, 0.000189], [12697, 12561, 0.000226], [13419, 12695, 0.000316]],
};
