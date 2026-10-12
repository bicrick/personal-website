// SWE-bench Verified, Haiku 5.5 in five harnesses, 50 tasks, same settings
// (thinking off, every command approved, 3 at a time in 2 CPU / 4 GB containers).
// From bicrick/context-shaping scripts/swebench_final.py (*_nothink rows + cursor_nothink;
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

// What sits in the window before the model reads any code: the first request
// that carries tools (system prompt + tool definitions + the bug report), median
// over all 50 tasks, from runs/<task>/<harness>_nothink/calls.jsonl.
// tools = tool definitions sent; calls = median requests per bug.
// Cursor talks to its own servers, so its requests are not logged.
export const WINDOW_START = [
  { id: 'claude_code', label: 'Claude Code', outfit: undefined, start: 24280, tools: 20, calls: 6.5 },
  { id: 'opencode', label: 'OpenCode', outfit: 'opencode', start: 11054, tools: 10, calls: 7 },
  { id: 'mini', label: 'mini-swe-agent', outfit: 'mini', start: 2448, tools: 1, calls: 7 },
  { id: 'swe_agent', label: 'SWE-agent', outfit: 'swe', start: 2197, tools: 3, calls: 13 },
];
