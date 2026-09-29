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
    image: `${process.env.PUBLIC_URL}/images/monocle/monocle-1600x900.png`,
    blogLink: '/projects/monocle',
    appLink: 'https://github.com/bicrick/monocle',
    appLabel: 'repo',
    relevanceRank: 3,
    dateRank: 5,
    date: 'September 2026',
  },
  {
    title: 'tracebench',
    description: 'offline evals and RL tasks from agent traces',
    timelineDescription:
      'An offline eval harness for tool-using agents: replay traces, score tool errors and task success, then mine failures into RL tasks.',
    image: `${process.env.PUBLIC_URL}/images/tracebench/tracebench-1600x900.png`,
    blogLink: '/projects/tracebench',
    appLink: 'https://github.com/bicrick/tracebench',
    appLabel: 'repo',
    relevanceRank: 4,
    dateRank: 0,
    date: 'September 2026',
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
    relevanceRank: 5,
    dateRank: 3,
    date: 'August 2026',
  },
  {
    title: 'gd-visualizer',
    description: 'compare optimizer performance in 3d',
    timelineDescription:
      'A 3D race track for gradient descent. Compare Batch, Momentum, Adam, and SGD on the same loss landscape.',
    image: `${process.env.PUBLIC_URL}/images/gd-visualizer/testing-it.gif`,
    blogLink: '/projects/gd-visualizer',
    appLink: 'https://gd.bicrick.com',
    relevanceRank: 6,
    dateRank: 7,
    date: 'November 2025',
  },
  {
    title: 'notepadable',
    description: 'text editor encoded in the URL',
    timelineDescription:
      'A minimalist text editor that encodes the whole document into the URL. Share a link, share the doc.',
    image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-1200x600.png`,
    blogLink: '/projects/notepadable',
    appLink: 'https://notepadable.com',
    relevanceRank: 7,
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
    relevanceRank: 8,
    dateRank: 9,
    date: 'December 2025',
    unlisted: true,
  },
];

export function featuredProjects() {
  return PROJECTS.filter((project) => project.featured)
    .sort((a, b) => a.relevanceRank - b.relevanceRank);
}

export function listedProjects() {
  return PROJECTS.filter((project) => !project.unlisted)
    .sort((a, b) => a.relevanceRank - b.relevanceRank);
}
