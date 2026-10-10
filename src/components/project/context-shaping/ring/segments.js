/**
 * The shared vocabulary of the context window. Every ring, bar and legend in the
 * post draws from this list, in this order (the order is part of the palette's
 * colorblind validation: adjacent segments stay distinguishable).
 */
export const SEGMENTS = [
  {
    key: 'system',
    label: 'system prompt',
    what: 'The harness’s standing instructions, resent on every call. In this study it’s one short paragraph: do the whole refactor, update every reference.',
  },
  {
    key: 'tools',
    label: 'tool definitions',
    what: 'The JSON schema of every tool the agent may call, resent on every call whether it’s used or not. Single-shot prompts have none.',
  },
  {
    key: 'procedure',
    label: 'skill / AGENTS.md',
    what: 'Procedure notes prepended to the task: a refactor skill or an AGENTS.md conventions doc. They ride in the first user message, not the system prompt.',
  },
  {
    key: 'repo',
    label: 'repo context',
    what: 'Code loaded up front, before the model has done anything: the whole repo, chosen files, or a skeleton of it.',
  },
  {
    key: 'messages',
    label: 'messages',
    what: 'The task plus everything the model has said and done so far, including every tool call it made. Its own edits count here.',
  },
  {
    key: 'toolout',
    label: 'tool outputs',
    what: 'What grep, read_file, run_tests and friends sent back. Each result stays in the prompt for every later call unless the harness removes it.',
  },
  {
    key: 'summary',
    label: 'summary',
    what: 'The model’s own handoff note. When compaction fires, it replaces the whole history, so everything before it is gone.',
  },
];

export const FREE = {
  key: 'free',
  label: 'free space',
  what: 'Room left in the window (or the budget, where one is set). Unused space costs nothing.',
};

export const SEGMENT_BY_KEY = Object.fromEntries(
  [...SEGMENTS, FREE].map((s) => [s.key, s])
);

export function sumTokens(segments) {
  return SEGMENTS.reduce((acc, s) => acc + (segments[s.key] || 0), 0);
}

export function fmtTokens(n) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

export function fmtPct(part, whole) {
  const p = (part / whole) * 100;
  if (p === 0) return '0%';
  if (p < 0.1) return '<0.1%';
  if (p < 10) return `${p.toFixed(1)}%`;
  return `${Math.round(p)}%`;
}
