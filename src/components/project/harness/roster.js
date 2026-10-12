import { SWE_SAME } from './swebench';

// The five harnesses, in grid column order (matches GRID_COLS).
export const ROSTER = [
  { id: 'swe_agent', slug: 'swe-agent', site: 'https://swe-agent.com/', short: 'SWE-agent', line: 'Purpose-built commands to view, search and edit, and it tests after nearly every change.' },
  { id: 'cursor', slug: 'cursor', site: 'https://cursor.com/cli', short: 'Cursor', line: "An editor's agent, run here from the command line." },
  { id: 'opencode', slug: 'opencode', site: 'https://opencode.ai/', short: 'OpenCode', line: 'An open-source terminal agent that only ever adds to the end of the conversation.' },
  { id: 'mini', slug: 'mini-swe-agent', site: 'https://mini-swe-agent.com/', short: 'mini', line: 'Nothing but a shell. One tool, a short prompt, and a loop.' },
  { id: 'claude_code', slug: 'claude-code', site: 'https://claude.com/product/claude-code', short: 'Claude', line: 'A full toolbox: files, search, edits, todos and sub-agents.' },
].map((h) => ({ ...h, ...SWE_SAME.find((r) => r.id === h.id) }));

export const harnessHref = (h) => `/writing/context-shaping/harnesses/${h.slug}`;
export const cents = (usd) => `${(usd * 100).toFixed(usd < 0.1 ? 2 : 1)}¢`;
