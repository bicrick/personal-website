import { SWE_SAME } from './swebench';
import { byOrder } from './order';

// The five harnesses, in the post's one shared ORDER (see order.js).
export const ROSTER = byOrder([
  { id: 'swe_agent', short: 'SWE-agent', site: 'https://swe-agent.com/', line: 'A research agent from Princeton, the team behind the test itself. The model gets a few purpose-built commands to view, search and edit files.' },
  { id: 'cursor', short: 'Cursor', site: 'https://cursor.com/cli', line: 'The agent inside the popular AI code editor, run here from the command line instead of the editor.' },
  { id: 'opencode', short: 'OpenCode', site: 'https://opencode.ai/', line: 'An open-source coding agent for the terminal, with about ten tools for the model to use.' },
  { id: 'mini', short: 'mini', site: 'https://mini-swe-agent.com/', line: 'The Princeton team\u2019s stripped-down version. The model gets a shell and nothing else.' },
  { id: 'claude_code', short: 'Claude', site: 'https://claude.com/product/claude-code', line: 'Anthropic\u2019s own coding agent, with a big toolbox: reading, searching, editing, to-do lists and helpers.' },
].map((h) => ({ ...h, ...SWE_SAME.find((r) => r.id === h.id) })));

export const cents = (usd) => `${(usd * 100).toFixed(2)}¢`;
