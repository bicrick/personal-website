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
  patch: '',
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
    patch: `{
  "message": "Torch-lit scriptorium.",
  "css": "body { background: #120c08 }
          .tile { background: #e6d5b4;
                  border: 2px solid #3a2616 }
          .key  { font-family: Georgia, serif }",
  "overlayHtml": "<div class=torch-l/><div class=torch-r/>
                  <div class=vignette/>",
  "ops": [
    { "type": "restyle", "selector": "h1",
      "css": { "letter-spacing": ".3em" } },
    { "type": "insert", "selector": "header",
      "position": "after",
      "html": "<p>Guess the hidden word</p>" }
  ]
}`,
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
    patch: `{
  "message": "CRT, 1982.",
  "css": "body { background: #031007;
                 font-family: ui-monospace }
          .tile { background: transparent;
                  border: 1px solid #1f6b35;
                  color: #4dff7c }",
  "overlayHtml": "<div class=scanlines/><div class=glow/>",
  "ops": [
    { "type": "restyle", "selector": ".board",
      "css": { "border-radius": "0" } },
    { "type": "restyle", "selector": ".key",
      "css": { "border": "1px solid #1f6b35" } },
    { "type": "insert", "selector": "header",
      "position": "after",
      "html": "<p>attempts remaining: 6</p>" }
  ]
}`,
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
    patch: `{
  "message": "Stop the presses.",
  "css": "body { background: #e9dfc8;
                 color: #1c1a16 }
          h1 { font-family: Georgia, serif;
               text-transform: uppercase }
          .tile { background: #f6efdc;
                  border: 1px solid #1c1a16 }",
  "overlayHtml": "<div class=grain/><div class=rules/>",
  "ops": [
    { "type": "restyle", "selector": ".key",
      "css": { "border-radius": "0" } },
    { "type": "insert", "selector": "header",
      "position": "after",
      "html": "<p>Late edition</p>" }
  ]
}`,
  },
  {
    id: 'ocean',
    reply: 'Twenty thousand leagues. The timer is still running.',
    label: 'deep sea',
    prompt: 'put the whole page at the bottom of the ocean',
    title: 'Deep Wordle',
    subtitle: 'Dive for the hidden word',
    steps: [
      'snapshot tab: landmarks + media',
      'agent -p in an isolated chat cwd',
      'tab MCP: read_page',
      'patch: css + overlay + three.js runtime',
      'applied. game state untouched',
    ],
    patch: `{
  "message": "Twenty thousand leagues.",
  "css": "body { background: linear-gradient(
                    #0b4a6e, #031b2e) }
          .tile { background: rgba(160,225,235,.16);
                  border: 1px solid #5fd0dd }",
  "overlayHtml": "<div class=caustics/><span class=bubble/>",
  "runtime": "monacle.three.ensure();
              monacle.three.setBackground(0x031b2e);
              monacle.three.add(bubbles)",
  "ops": [
    { "type": "restyle", "selector": ".key",
      "css": { "backdrop-filter": "blur(4px)" } }
  ]
}`,
  },
];

export const THEME_BY_ID = Object.fromEntries(
  [ORIGINAL, ...THEMES].map((theme) => [theme.id, theme]),
);
