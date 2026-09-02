export const PAGE_SEO = {
  '/': {
    ogTitle: 'bicrick - Patrick Brown | Agent-First Engineer',
    description: 'Patrick Brown (bicrick) - Agent-first engineer specializing in machine learning. Currently at H-E-B. Austin, TX.',
    url: 'https://bicrick.com',
  },
  '/about': {
    ogTitle: 'About bicrick - Patrick Brown | Data Engineer',
    description: 'About Patrick Brown (bicrick) - Data Engineer at H-E-B focused on large-scale ML data prep, pipelines, analytics dashboards, and cloud infrastructure on GCP and AWS. UT Austin AI Masters. Austin, TX.',
    url: 'https://bicrick.com/about',
    keywords: 'bicrick, Patrick Brown, About, Data Engineer, ML Data Prep, GCP, AWS, Austin, HEB, UT Austin, AI Masters',
  },
  '/projects': {
    ogTitle: 'Projects by bicrick - Software Development Portfolio',
    description: 'Software projects by bicrick (Patrick Brown) - docprep, AI Masters coursework, gradient descent visualizer, and more.',
    url: 'https://bicrick.com/projects',
    keywords: 'bicrick, Patrick Brown, Projects, Portfolio, Software Development, docprep, AI, Machine Learning',
  },
  '/contact': {
    ogTitle: 'Contact bicrick - Patrick Brown',
    description: 'Contact Patrick Brown (bicrick) — email patrickbrownai@gmail.com',
    url: 'https://bicrick.com/contact',
    keywords: 'bicrick, Patrick Brown, Contact, Email',
  },
};

export function normalizePagePath(pathname) {
  if (!pathname) return '/';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}
