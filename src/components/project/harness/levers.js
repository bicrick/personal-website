// The four levers, the options on each, and how real harnesses set them.
// Sources: docs/research in github.com/bicrick/context-shaping. Codex and
// Gemini CLI run their own models; they're here for how they set the
// levers, not as places to run Claude.

export const LEVERS = [
  {
    n: 1,
    name: 'what it reads',
    options: [
      { id: 'repo', label: 'whole repo' },
      { id: 'map', label: 'a map' },
      { id: 'search', label: 'search as it goes' },
      { id: 'index', label: 'an index' },
    ],
  },
  {
    n: 2,
    name: 'what it can do',
    options: [
      { id: 'reply', label: 'edits in its reply' },
      { id: 'raw', label: 'grep, read, edit' },
      { id: 'structured', label: 'find refs, rename' },
    ],
  },
  {
    n: 3,
    name: 'what it forgets',
    options: [
      { id: 'nothing', label: 'nothing' },
      { id: 'early', label: 'summarize early' },
      { id: 'late', label: 'summarize late' },
      { id: 'clear', label: 'clear old output' },
    ],
  },
  {
    n: 4,
    name: 'what it’s told',
    options: [
      { id: 'none', label: 'nothing' },
      { id: 'rules', label: 'house rules' },
      { id: 'skill', label: 'a skill for the job' },
    ],
  },
];

// picks: one array of option ids per lever.
export const HARNESS_PICKS = {
  claude: {
    picks: [['search'], ['raw'], ['late', 'clear'], ['rules', 'skill']],
    note: 'Greps on demand, summarizes near the limit and clears old tool results. Loads CLAUDE.md and skills.',
  },
  cursor: {
    picks: [['search', 'index'], ['raw'], [], ['rules']],
    note: 'Pairs grep with its own embedding index. Compaction details aren’t published.',
  },
  aider: {
    picks: [['map'], ['reply'], ['early'], ['rules']],
    note: 'Sends a repo map with every request; the model writes edits in its reply. Summarizes old chat past a token limit.',
  },
  codex: {
    picks: [['search'], ['raw'], ['late'], ['rules']],
    note: 'Searches with the shell, summarizes at 90% of the window, reads AGENTS.md. Runs OpenAI models.',
  },
  gemini: {
    picks: [['search'], ['raw'], ['early', 'clear'], ['rules']],
    note: 'Summarizes at 50% of the window and masks old tool output. Reads GEMINI.md. Runs Gemini models.',
  },
};

export const MY_PICKS = [['search'], ['structured'], ['nothing'], ['skill']];

// What I tried on each lever, with everything else held at the baseline:
// search as it goes, grep/read/edit, forget nothing, no notes.
export const BASELINE = [['search'], ['raw'], ['nothing'], ['none']];

export const EXPERIMENTS = [
  {
    tried: ['whole repo', 'only the right files', 'map: file tree', 'map: + imports', 'map: + signatures', 'map: + docstrings', 'search as it goes', 'map + search'],
    note: 'The first six answer in one shot: the model reads, then writes every edit in one reply.',
  },
  {
    tried: ['grep, read, edit', 'find_references + rename_symbol'],
    note: 'Same loop, same prompt, same 25-turn limit. Only the toolkit changes.',
  },
  {
    tried: ['forget nothing', 'summarize at 50%', 'summarize at 90%', 'clear old output'],
    note: 'Each at a 24k and a 12k token cap, so the window actually fills.',
  },
  {
    tried: ['no notes', 'AGENTS.md house rules', 'a five-step refactor skill'],
    note: 'The note is the only thing added to the prompt.',
  },
];
