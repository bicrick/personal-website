/**
 * Exact numbers from the published study (results/article_numbers.json, summary.csv).
 * Per-run context sizes for the ring demos live in ringData.json
 * (built by scripts/extract-context-rings.py).
 */

export const HEADLINE = {
  naivePass: 63,
  combinedPass: 100,
  naiveCost: 0.051,
  combinedCost: 0.0016,
  costRatioLabel: '1/32',
};

export const LADDER = [
  { id: 'L0', label: 'L0 file tree', pass: 45, short: 'tree' },
  { id: 'L1', label: 'L1 +imports', pass: 61, short: 'imports' },
  { id: 'L2', label: 'L2 +signatures', pass: 57, short: 'signatures' },
  { id: 'L3', label: 'L3 +docstrings', pass: 59, short: 'docstrings' },
  { id: 'full', label: 'full code', pass: 69, short: 'full' },
];

export const LAYOUT_MODES = [
  { id: 'full', label: 'full repo', pass: 69, tokensNote: 'everything in prompt' },
  { id: 'touched', label: 'touched files', pass: 68, tokensNote: 'oracle files only' },
  { id: 'skeleton', label: 'skeleton', pass: 57, tokensNote: 'L2 signatures' },
  { id: 'skel+tools', label: 'skeleton + retrieval', pass: 92, tokensNote: 'L2 + agent loop' },
  { id: 'agentic', label: 'agentic search', pass: 93, tokensNote: 'explore on demand' },
];

export const TOOLS = {
  grep: { pass: 93, cost: 0.0085, calls: 39.2 },
  structured: { pass: 97, cost: 0.0016, calls: 9.2 },
  costFactor: '5.2x',
  callFactor: '4.3x',
};

export const VALIDATION_ERROR = {
  lines: 468,
  files: 19,
  grep: { wins: '0/3', calls: 451, tokens: 122762, turns: 25 },
  structured: { wins: '3/3', calls: 8, tokens: 9785 },
};

/** `none` is the plain grep agent (no budget); the others ran at a 12k-token budget. */
export const COMPACTION = [
  { id: 'none', label: 'none', pass: 93, cost: 0.0085, cache: 85 },
  { id: 'sum50', label: 'summarize @50%', pass: 79, cost: 0.0397, cache: 10 },
  { id: 'sum90', label: 'summarize @90%', pass: 88, cost: 0.0147, cache: 43 },
  { id: 'drop', label: 'drop old outputs', pass: 93, cost: 0.0143, cache: 16 },
];

export const HARD_TIER = {
  naive: 28,
  structuredLoop: 100,
};

export const SCOREBOARD = [
  { label: 'Combined harness', pass: 100, cost: 0.0017, highlight: true },
  { label: 'OpenCode', pass: 94, cost: 0.0043 },
  { label: 'mini-swe-agent', pass: 94, cost: 0.0031 },
  { label: 'Claude Code', pass: 91, cost: 0.0048 },
  { label: 'Naive full repo', pass: 64, cost: 0.0653 },
  { label: 'Aider (headless)', pass: 18, cost: 0.16 },
];

export const FINAL_RUNS = 125;

export const SKILL = {
  withSkill: 93,
  noSkill: 93,
  costWith: 0.008,
  costWithout: 0.0085,
  agentsMd: 91,
  costAgentsMd: 0.0092,
  /** The skill's five steps, condensed from cshape/strategies.py SKILL. */
  steps: [
    'Find all references first: src and tests, imports, __all__, docstrings, string paths',
    'Change the definition, then every reference you found',
    'Run the tests',
    'Search again for the old name; the count must be zero',
    'Only then call finish',
  ],
};
