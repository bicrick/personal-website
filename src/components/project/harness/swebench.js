// SWE-bench Verified, 50-task subset, Haiku 5.5 in six harnesses.
// From bicrick/context-shaping results/swebench/summary_tokens.csv
// (latest row per task x harness; psf__requests-2317 excluded, 49 scored).
// ci = 95% Wilson interval. cache = cache_read / all prompt tokens.
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
