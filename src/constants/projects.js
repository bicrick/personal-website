export const PROJECTS = [
  {
    title: 'qwop-python',
    description: 'world-record RL environment for QWOP',
    timelineDescription:
      'Reverse-engineered minified QWOP into a headless Python gym, then beat the official world record at 45.167s with a grok-bot research loop.',
    livePreview: 'qwop',
    blogLink: '/projects/qwop-python',
    appLink: '/demos/qwop',
    appLabel: 'demo',
    relevanceRank: 1,
    dateRank: 2,
    date: 'September 2026',
    featured: true,
  },
  {
    title: 'cart-pole-autoresearch',
    description: 'agentic loops on cart-pole and pendulums',
    timelineDescription:
      'Agentic loops on cart-pole, double, triple, and quadruple pendulums running in the browser.',
    livePreview: 'cartpole',
    blogLink: '/projects/auto-research',
    appLink: 'https://cart-pole-autoresearch.vercel.app/#triple',
    appLabel: 'demo',
    relevanceRank: 2,
    dateRank: 1,
    date: 'September 2026',
    featured: true,
  },
  {
    title: 'monocle',
    description: 'restyle the live tab with your local Cursor CLI',
    timelineDescription:
      'A Chrome extension that restyles the page you are looking at using your local Cursor CLI. Site JS and media keep running.',
    image: `${process.env.PUBLIC_URL}/images/monocle/wordle-after.png`,
    blogLink: '/projects/monocle',
    appLink: 'https://github.com/bicrick/monocle',
    appLabel: 'repo',
    relevanceRank: 3,
    dateRank: 5,
    date: 'September 2026',
  },
  {
    title: 'tracebench',
    description: 'offline eval harness for agent traces',
    timelineDescription:
      'Instrument a tool-using agent, dump JSONL traces, replay them offline, and score tool-error rate, task success, and keep rate.',
    image: `${process.env.PUBLIC_URL}/images/tracebench/tracebench-1200x600.png`,
    blogLink: '/projects/tracebench',
    appLink: 'https://github.com/bicrick/tracebench',
    appLabel: 'repo',
    relevanceRank: 4,
    dateRank: 0,
    date: 'September 2026',
  },
  {
    title: 'trace2tasks',
    description: 'RL tasks mined from agent traces',
    timelineDescription:
      'Turn success and failure traces into Gymnasium tasks with reward heuristics and a dataset card.',
    image: `${process.env.PUBLIC_URL}/images/tracebench/trace2tasks-1200x600.png`,
    blogLink: '/projects/trace2tasks',
    appLink: 'https://github.com/bicrick/trace2tasks',
    appLabel: 'repo',
    relevanceRank: 5,
    dateRank: 0,
    date: 'September 2026',
  },
  {
    title: 'cifar10-fast-mps',
    description: 'airbench reimplementation on Apple Silicon',
    timelineDescription:
      'Reimplementation of 94% on CIFAR-10 in seconds, ported to MPS. 5.1x faster than a ResNet-18 baseline on an M3.',
    image: `${process.env.PUBLIC_URL}/images/cifar10/cifar10-1200x600.png`,
    blogLink: '/projects/cifar10-fast-mps',
    appLink: 'https://github.com/bicrick/cifar10-fast-mps',
    appLabel: 'repo',
    relevanceRank: 6,
    dateRank: 8,
    date: 'December 2025',
  },
  {
    title: 'range rat',
    description: 'golf incremental video game, built with agents',
    timelineDescription:
      'A golf incremental video game built with coding agents. Godot gameplay plus gen-ai sprites and music.',
    image: `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-preview.gif`,
    blogLink: '/projects/golf-incremental',
    appLink: 'https://golf.bicrick.com',
    appLabel: 'play',
    relevanceRank: 7,
    dateRank: 3,
    date: 'August 2026',
  },
  {
    title: 'mcpixel',
    description: 'local pixel-art pipeline behind range rat',
    timelineDescription:
      'Generate, cut out, and snap sprites to a pixel grid on your machine. The art pipeline used for Range Rat.',
    image: `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-preview.gif`,
    blogLink: '/projects/mcpixel',
    appLink: 'https://github.com/bicrick/MCPixel',
    appLabel: 'repo',
    relevanceRank: 8,
    dateRank: 4,
    date: 'July 2026',
  },
  {
    title: 'gd-visualizer',
    description: 'compare optimizer performance in 3d',
    timelineDescription:
      'A 3D race track for gradient descent. Compare Batch, Momentum, Adam, and SGD on the same loss landscape.',
    image: `${process.env.PUBLIC_URL}/images/gd-visualizer/testing-it.gif`,
    blogLink: '/projects/gd-visualizer',
    appLink: 'https://gd.bicrick.com',
    relevanceRank: 9,
    dateRank: 7,
    date: 'November 2025',
  },
  {
    title: 'notepadable',
    description: 'text editor encoded in the URL',
    timelineDescription:
      'A minimalist text editor that encodes the whole document into the URL. Share a link, share the doc.',
    image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-header.gif`,
    imageFit: 'contain',
    blogLink: '/projects/notepadable',
    appLink: 'https://notepadable.com',
    relevanceRank: 10,
    dateRank: 6,
    date: 'March 2026',
  },
  {
    title: 'docprep',
    description: 'msoffice plaintext extractor',
    timelineDescription:
      'Extract clean plaintext from Microsoft Office docs. Built for feeding documents into LLM workflows.',
    image: `${process.env.PUBLIC_URL}/images/docprep/docprep-extract.gif`,
    blogLink: '/projects/docprep',
    appLink: 'https://docprep.site',
    relevanceRank: 11,
    dateRank: 9,
    date: 'December 2025',
  },
];

export function featuredProjects() {
  return PROJECTS.filter((project) => project.featured)
    .sort((a, b) => a.relevanceRank - b.relevanceRank);
}

export function listedProjects() {
  return [...PROJECTS].sort((a, b) => a.relevanceRank - b.relevanceRank);
}
