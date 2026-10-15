// Each preset is a canned scene patch, shaped like the ones the Monocle
// companion returns. The demo applies it as CSS variables plus a few text ops,
// so the "page" keeps running underneath.

export const ORIGINAL = {
  id: 'original',
  reply: 'Restored the original page.',
  label: 'original',
  prompt: '',
  title: 'Wordle',
  subtitle: 'Guess the hidden word in six tries',
  steps: [],
  patch: null,
};

export const THEMES = [
  {
    id: 'medieval',
    reply: 'Torch-lit scriptorium. Board and keys untouched.',
    label: 'medieval',
    prompt: 'make this medieval themed',
    title: 'Wordle',
    subtitle: 'Guess the hidden word',
    steps: [
      'snapshot tab: landmarks + media',
      'agent -p in an isolated chat cwd',
      'tab MCP: read_page',
      'patch: css + overlay + 2 ops',
      'applied. game state untouched',
    ],
    patch: {
      css: [
        'body { background: #120c08 }',
        '.tile { background: #e6d5b4; border: 2px solid #3a2616 }',
        '.key { font-family: Georgia, serif }',
      ],
      overlay: 'Torch glow on both sides and a dark vignette.',
      ops: [
        { type: 'restyle', selector: 'h1', note: 'wide letter spacing' },
        { type: 'insert', selector: 'header', note: 'adds a subtitle line after it' },
      ],
    },
  },
  {
    id: 'terminal',
    reply: 'CRT, 1982. Your guesses still count.',
    label: 'terminal',
    prompt: 'turn this into a green phosphor terminal',
    title: '$ wordle --guess',
    subtitle: 'attempts remaining: 6',
    steps: [
      'snapshot tab: landmarks + media',
      'agent -p in an isolated chat cwd',
      'tab MCP: read_page',
      'patch: css + scanline overlay + 3 ops',
      'applied. game state untouched',
    ],
    patch: {
      css: [
        'body { background: #031007; font-family: monospace }',
        '.tile { background: transparent; border: 1px solid #1f6b35 }',
        '.tile { color: #4dff7c }',
      ],
      overlay: 'Scanlines and a soft green glow.',
      ops: [
        { type: 'restyle', selector: '.board', note: 'square corners' },
        { type: 'restyle', selector: '.key', note: 'thin green outline' },
        { type: 'insert', selector: 'header', note: 'adds an attempts counter' },
      ],
    },
  },
  {
    id: 'newsprint',
    reply: 'Stop the presses. Same puzzle, new masthead.',
    label: 'newsprint',
    prompt: 'make it look like a 1920s newspaper puzzle page',
    title: 'The Daily Wordle',
    subtitle: 'Late edition · Solve for glory',
    steps: [
      'snapshot tab: landmarks + media',
      'agent -p in an isolated chat cwd',
      'tab MCP: read_page',
      'patch: css + grain overlay + 2 ops',
      'applied. game state untouched',
    ],
    patch: {
      css: [
        'body { background: #e9dfc8; color: #1c1a16 }',
        'h1 { font-family: Georgia, serif; text-transform: uppercase }',
        '.tile { background: #f6efdc; border: 1px solid #1c1a16 }',
      ],
      overlay: 'Paper grain and faint column rules.',
      ops: [
        { type: 'restyle', selector: '.key', note: 'square corners' },
        { type: 'insert', selector: 'header', note: 'adds a "late edition" line' },
      ],
    },
  },
  {
    id: 'ocean',
    reply: 'Twenty thousand leagues. The timer is still running.',
    label: 'deep sea',
    prompt: 'put this page at the bottom of the ocean',
    title: 'Deep Wordle',
    subtitle: 'Dive for the hidden word',
    steps: [
      'snapshot tab: landmarks + media',
      'agent -p in an isolated chat cwd',
      'tab MCP: read_page',
      'patch: css + overlay + three.js runtime',
      'applied. game state untouched',
    ],
    patch: {
      css: [
        'body { background: #0b4a6e }',
        '.tile { background: rgba(160, 225, 235, .16) }',
        '.tile { border: 1px solid #5fd0dd }',
      ],
      overlay: 'Drifting caustic light.',
      ops: [
        { type: 'restyle', selector: '.key', note: 'frosted glass blur' },
      ],
      runtime: 'Three.js stage with fog and rising bubbles.',
    },
  },
];

export const THEME_BY_ID = Object.fromEntries(
  [ORIGINAL, ...THEMES].map((theme) => [theme.id, theme]),
);
