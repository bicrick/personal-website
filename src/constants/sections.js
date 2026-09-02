import { normalizePagePath } from './pages';

export const LANDING_PAGES = [
  { id: 'home', path: '/', label: 'home' },
  { id: 'about', path: '/about', label: 'about' },
  { id: 'projects', path: '/projects', label: 'projects' },
  { id: 'contact', path: '/contact', label: 'contact' },
];

export function getNextLandingPage(pathname) {
  const path = normalizePagePath(pathname);
  const index = LANDING_PAGES.findIndex((page) => page.path === path);
  if (index < 0 || index >= LANDING_PAGES.length - 1) return null;
  return LANDING_PAGES[index + 1];
}
