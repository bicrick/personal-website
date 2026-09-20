import { normalizePagePath } from './pages';

export const LANDING_PAGES = [
  { id: 'home', path: '/', label: 'home' },
  { id: 'about', path: '/about', label: 'about' },
  { id: 'projects', path: '/projects', label: 'projects' },
  { id: 'contact', path: '/contact', label: 'contact' },
];

export const LANDING_PATHS = new Set(LANDING_PAGES.map((page) => page.path));

export function isLandingPath(pathname) {
  return LANDING_PATHS.has(normalizePagePath(pathname));
}

export function getLandingPage(pathname) {
  const path = normalizePagePath(pathname);
  return LANDING_PAGES.find((page) => page.path === path) || LANDING_PAGES[0];
}

export function getLandingPageById(id) {
  return LANDING_PAGES.find((page) => page.id === id) || null;
}
