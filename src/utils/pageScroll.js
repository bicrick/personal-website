export const SITE_SCROLL_ID = 'site-scroll';

export function getScrollElement() {
  return document.getElementById(SITE_SCROLL_ID)
    || document.scrollingElement
    || document.documentElement;
}

function resetScroller(el) {
  if (!el) return;
  if (typeof el.scrollTo === 'function') {
    el.scrollTo(0, 0);
  }
  el.scrollTop = 0;
}

/** Jump to top on route change. No smooth / snap / hijack. */
export function scrollPageToTop() {
  resetScroller(document.getElementById(SITE_SCROLL_ID));
  document.querySelectorAll('.App_mainContainer.landing-page').forEach(resetScroller);
  resetScroller(document.scrollingElement);
  resetScroller(document.documentElement);
  resetScroller(document.body);
  window.scrollTo(0, 0);
}
