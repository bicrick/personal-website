export const PROJECTS = [
  {
    title: 'infinite tapestry',
    description: 'an endless painting driven and guided by the internet',
    timelineDescription:
      'An endless horizontal AI painting streamed live from a single RTX 4090. Visitors type ideas; Auto fills the gaps. RealVisXL on SDXL, ~2.7s per strip.',
    livePreview: 'tapestry',
    blogLink: '/projects/infinite-tapestry',
    appLink: 'https://infinitetapestry.app',
    appLabel: 'live',
    repoLink: 'https://github.com/bicrick/infinite-tapestry',
    relevanceRank: 2,
    dateRank: 2,
    date: 'October 2026',
    featured: true,
  },
  {
    title: 'qwop world record with reinforcement learning',
    description: 'fully custom gym and agentic research loop',
    timelineDescription:
      'Reverse-engineered minified QWOP into a headless Python gym, then beat the official world record at 45.167s with a grok-bot research loop.',
    livePreview: 'qwop',
    blogLink: '/projects/qwop-python',
    appLink: '/demos/qwop',
    appLabel: 'demo',
    relevanceRank: 1,
    dateRank: 4,
    date: 'September 2026',
    featured: true,
  },
  {
    title: 'is your harness lobotomizing your model?',
    description: 'one model in five coding harnesses, 50 real bugs',
    timelineDescription:
      'Claude Haiku 5.5 inside Claude Code, Cursor, OpenCode, SWE-agent, and mini-swe-agent on 50 SWE-bench Verified bugs. Same accuracy, very different token bills.',
    livePreview: 'harness',
    blogLink: '/projects/harness-bench',
    appLink: 'https://github.com/bicrick/harness-bench',
    appLabel: 'repo',
    relevanceRank: 20,
    dateRank: 3,
    date: 'October 2026',
    unlisted: true,
  },
  {
    title: 'cart pole autoresearch loops',
    description: 'browser-native cart-pole and pendulum controllers',
    timelineDescription:
      'Controllers for cart-pole plus double, triple, and quadruple pendulums running in the browser.',
    livePreview: 'cartpole',
    blogLink: '/projects/auto-research',
    appLink: 'https://cart-pole-autoresearch.vercel.app/#triple',
    appLabel: 'demo',
    relevanceRank: 5,
    dateRank: 5,
    date: 'September 2026',
    featured: true,
  },
  {
    title: 'da transcribuh',
    description: 'on-device voice-to-text for your mac',
    timelineDescription:
      'A free macOS menu bar app. Hit option-space, talk, and the text pastes wherever you are typing. Runs locally with Parakeet v2.',
    // Theme-aware waving pill (card). Old da-transcribuh-demo.webp kept in public/ but unused.
    image: `${process.env.PUBLIC_URL}/images/da-transcribuh/da-transcribuh-pill-light-poster.jpg`,
    video: `${process.env.PUBLIC_URL}/images/da-transcribuh/da-transcribuh-pill-light.mp4`,
    videoDark: `${process.env.PUBLIC_URL}/images/da-transcribuh/da-transcribuh-pill-dark.mp4`,
    poster: `${process.env.PUBLIC_URL}/images/da-transcribuh/da-transcribuh-pill-light-poster.jpg`,
    posterDark: `${process.env.PUBLIC_URL}/images/da-transcribuh/da-transcribuh-pill-dark-poster.jpg`,
    blogLink: '/projects/da-transcribuh',
    appLink: 'https://da-transcribuh-site.vercel.app',
    appLabel: 'try',
    relevanceRank: 4,
    dateRank: 0,
    date: 'October 2026',
    featured: true,
  },
  {
    title: 'scribe',
    description: 'ai that writes it out by hand',
    timelineDescription:
      'Ask for a note, a card, or math with graphs, and a handwriting model writes it stroke by stroke while you watch.',
    image: `${process.env.PUBLIC_URL}/images/scribe/scribe-pen.webp`,
    blogLink: '/projects/scribe',
    appLink: 'https://scribe-friends.vercel.app',
    appLabel: 'invite only',
    relevanceRank: 3,
    dateRank: 1,
    date: 'October 2026',
    featured: true,
  },
  {
    title: 'monocle',
    description: 'restyle the live tab with your local Cursor CLI',
    timelineDescription:
      'A Chrome extension that restyles the page you are looking at using your local Cursor CLI. Site JS and media keep running.',
    livePreview: 'monocle',
    image: `${process.env.PUBLIC_URL}/images/monocle/monocle-1600x900.png`,
    blogLink: '/projects/monocle',
    appLink: 'https://github.com/bicrick/monocle',
    appLabel: 'repo',
    relevanceRank: 6,
    dateRank: 7,
    date: 'September 2026',
    featured: true,
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
    relevanceRank: 8,
    dateRank: 6,
    date: 'August 2026',
    featured: true,
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
    dateRank: 9,
    date: 'November 2025',
    featured: true,
  },
  {
    title: 'notepadable',
    description: 'text editor encoded in the URL',
    timelineDescription:
      'A minimalist text editor that encodes the whole document into the URL. Share a link, share the doc.',
    image: `${process.env.PUBLIC_URL}/images/notepadable/notepadable-1200x600.png`,
    blogLink: '/projects/notepadable',
    appLink: 'https://notepadable.com',
    livePreview: 'notepadable',
    relevanceRank: 7,
    dateRank: 8,
    date: 'March 2026',
    featured: true,
  },
  {
    title: 'docprep',
    description: 'msoffice plaintext extractor',
    timelineDescription:
      'Extract clean plaintext from Microsoft Office docs. Built for feeding documents into LLM workflows.',
    image: `${process.env.PUBLIC_URL}/images/docprep/docprep-extract.gif`,
    blogLink: '/projects/docprep',
    appLink: 'https://docprep.site',
    relevanceRank: 21,
    dateRank: 11,
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
