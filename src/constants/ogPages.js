import rawPages from './ogPages.json';

export const SITE_ORIGIN = 'https://bicrick.com';
export const ASSET_ORIGIN = 'https://www.bicrick.com';

function normalizePath(pathname) {
  if (!pathname) return '/';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function pageUrl(pathname) {
  const path = normalizePath(pathname);
  return path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

export function assetUrl(imagePath) {
  return `${ASSET_ORIGIN}${imagePath}`;
}

export function decoratePageSeo(path, row) {
  return {
    ogTitle: row.ogTitle,
    seoTitle: row.seoTitle || row.ogTitle,
    description: row.description,
    keywords: row.keywords,
    url: pageUrl(path),
    image: assetUrl(row.imagePath),
    imagePath: row.imagePath,
    imageAlt: row.imageAlt || row.ogTitle,
    imageWidth: row.imageWidth || 1200,
    imageHeight: row.imageHeight || 630,
    type: row.type || 'website',
  };
}

export const OG_PAGES = Object.fromEntries(
  Object.entries(rawPages).map(([path, row]) => [path, decoratePageSeo(path, row)])
);

export function getPageSeo(pathname) {
  const path = normalizePath(pathname);
  return OG_PAGES[path] || OG_PAGES['/'];
}

export const PAGE_SEO = OG_PAGES;
