// SWE-bench Verified, Haiku 5.5 in five harnesses, 50 tasks, same settings
// (thinking off, every command approved, 3 at a time in 2 CPU / 4 GB containers).
// From bicrick/harness-bench scripts/swebench_final.py (*_nothink rows + cursor_nothink;
// psf__requests-2317 replaced by psf__requests-1142).
// rate: solved / 50 (ci = 95% Wilson). usd: spend / solves (Cursor estimated from its own logs).
// tok: all tokens / solves. min: wall minutes / solves. cache: cache_read / all input.
export const SWE_N = 50;

export const SWE_SAME = [
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', solved: 37, rate: 74, ci: [60, 84], usd: 0.008, tok: 250645, min: 9.1, cache: 92 },
  { id: 'cursor', label: 'Cursor', outfit: 'cursor', solved: 35, rate: 70, ci: [56, 81], usd: 0.0093, tok: 392911, min: 4.9, cache: 94, est: true },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', solved: 35, rate: 70, ci: [56, 81], usd: 0.0062, tok: 230320, min: 4.6, cache: 92 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', solved: 34, rate: 68, ci: [54, 79], usd: 0.0044, tok: 105214, min: 3.9, cache: 87 },
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, solved: 33, rate: 66, ci: [52, 78], usd: 0.0102, tok: 471176, min: 4.0, cache: 95 },
];

// Why tokens differ, per harness, from runs/<task>/<harness>_nothink/calls.jsonl
// (medians over all 50 tasks):
// start = prompt tokens of the first request that carries tools (instructions +
//         tool definitions + the bug report), before any code is read;
// tools = tool definitions sent; calls = requests to the model per bug;
// peak  = largest single request (how big the window gets);
// resent = start x calls / total prompt tokens per bug: share of everything sent
//          that is the opening, sent again.
// Cursor talks to its own servers, so only its tokens per fix (own logs) are known.
export const WHY = [
  { id: 'claude_code', start: 24280, tools: 20, calls: 6.5, peak: 28653, resent: 87 },
  // Cursor bypasses our proxy. Opening measured with /context in a matching test run (same clean HOME, git blocked,
  // same model, real benchmark prompt, stopped after the first turn). Run totals from its own stream-json usage.
  { id: 'cursor', start: 13400, measured: true, inPerBug: 131000, cached: 91 },
  { id: 'opencode', start: 11054, tools: 10, calls: 8, peak: 15779, resent: 84 },
  { id: 'swe_agent', start: 2197, tools: 3, calls: 13, peak: 9000, resent: 41 },
  { id: 'mini', start: 2448, tools: 1, calls: 7, peak: 6734, resent: 51 },
];
