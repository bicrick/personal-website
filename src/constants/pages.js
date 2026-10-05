export { PAGE_SEO, getPageSeo } from './ogPages.js';

export function normalizePagePath(pathname) {
  if (!pathname) return '/';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}
