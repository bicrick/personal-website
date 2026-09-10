const fs = require('fs');
const path = require('path');

const SITE_ORIGIN = 'https://bicrick.com';
const ASSET_ORIGIN = 'https://www.bicrick.com';
const pages = require('../src/constants/ogPages.json');

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function pageUrl(route) {
  return route === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${route}`;
}

function decorate(route, row) {
  return {
    ogTitle: row.ogTitle,
    description: row.description,
    keywords: row.keywords,
    url: pageUrl(route),
    image: `${ASSET_ORIGIN}${row.imagePath}`,
    imageAlt: row.imageAlt || row.ogTitle,
    imageWidth: String(row.imageWidth || 1200),
    imageHeight: String(row.imageHeight || 630),
    type: row.type || 'website',
  };
}

function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}"/>`;
  const re = new RegExp(`<meta\\s+[^>]*${attr}="${key}"[^>]*>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function upsertLink(html, rel, href) {
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}"/>`;
  const re = new RegExp(`<link\\s+[^>]*rel="${rel}"[^>]*>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function applySeo(html, seo) {
  let next = html;
  next = upsertMeta(next, 'name', 'title', seo.ogTitle);
  next = upsertMeta(next, 'name', 'description', seo.description);
  next = upsertMeta(next, 'name', 'keywords', seo.keywords);
  next = upsertLink(next, 'canonical', seo.url);
  next = upsertMeta(next, 'property', 'og:type', seo.type);
  next = upsertMeta(next, 'property', 'og:url', seo.url);
  next = upsertMeta(next, 'property', 'og:title', seo.ogTitle);
  next = upsertMeta(next, 'property', 'og:description', seo.description);
  next = upsertMeta(next, 'property', 'og:image', seo.image);
  next = upsertMeta(next, 'property', 'og:image:secure_url', seo.image);
  next = upsertMeta(next, 'property', 'og:image:width', seo.imageWidth);
  next = upsertMeta(next, 'property', 'og:image:height', seo.imageHeight);
  next = upsertMeta(next, 'property', 'og:image:alt', seo.imageAlt);
  next = upsertMeta(next, 'property', 'og:site_name', 'bicrick');
  next = upsertMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = upsertMeta(next, 'name', 'twitter:url', seo.url);
  next = upsertMeta(next, 'name', 'twitter:title', seo.ogTitle);
  next = upsertMeta(next, 'name', 'twitter:description', seo.description);
  next = upsertMeta(next, 'name', 'twitter:image', seo.image);
  next = upsertMeta(next, 'name', 'twitter:image:alt', seo.imageAlt);
  next = upsertMeta(next, 'name', 'twitter:creator', '@patrickbbrown');
  return next;
}

function writeRouteHtml(buildDir, route, html) {
  if (route === '/') {
    fs.writeFileSync(path.join(buildDir, 'index.html'), html);
    return;
  }
  const relative = route.replace(/^\//, '');
  const destDir = path.join(buildDir, relative);
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, 'index.html'), html);
  fs.writeFileSync(path.join(buildDir, `${relative}.html`), html);
}

function main() {
  const buildDir = path.join(__dirname, '..', 'build');
  const sourcePath = path.join(buildDir, 'index.html');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing ${sourcePath}. Run the React build first.`);
  }

  const source = fs.readFileSync(sourcePath, 'utf8');
  Object.entries(pages).forEach(([route, row]) => {
    writeRouteHtml(buildDir, route, applySeo(source, decorate(route, row)));
  });

  console.log(`Injected Open Graph tags for ${Object.keys(pages).length} routes`);
}

main();
