export const SITE_SCROLL_ID = 'site-scroll';

export function getScrollElement() {
  return document.getElementById(SITE_SCROLL_ID)
    || document.scrollingElement
    || document.documentElement;
}

export function getScrollState() {
  const el = getScrollElement();
  const scrollTop = el.scrollTop;
  const viewports = [el.clientHeight, window.innerHeight, window.visualViewport?.height]
    .filter((value) => Number.isFinite(value) && value > 0);
  const usesDocument = el === document.scrollingElement || el === document.documentElement;
  const scrollHeight = usesDocument
    ? Math.max(el.scrollHeight, document.documentElement.scrollHeight, document.body.scrollHeight)
    : el.scrollHeight;
  const remaining = usesDocument
    ? Math.min(...viewports.map((viewport) => scrollHeight - viewport - scrollTop))
    : scrollHeight - el.clientHeight - scrollTop;
  const maxScroll = Math.max(0, scrollHeight - el.clientHeight);

  return {
    el,
    scrollTop,
    maxScroll,
    remaining,
  };
}

export function snapToPageBottom() {
  const { el, maxScroll, scrollTop } = getScrollState();
  if (scrollTop < maxScroll) {
    el.scrollTop = maxScroll;
  }
}

function resetScroller(el) {
  if (!el) return;
  if (typeof el.scrollTo === 'function') {
    el.scrollTo(0, 0);
  }
  el.scrollTop = 0;
}

export function scrollPageToTop() {
  resetScroller(document.getElementById(SITE_SCROLL_ID));
  document.querySelectorAll('.App_mainContainer.landing-page').forEach(resetScroller);
  resetScroller(document.scrollingElement);
  resetScroller(document.documentElement);
  resetScroller(document.body);
  window.scrollTo(0, 0);
}

export function isPageScrollLocked() {
  const el = getScrollElement();
  return document.body.style.overflow === 'hidden' || el.style.overflow === 'hidden';
}

export function lockPageScroll() {
  const el = getScrollElement();
  const previousElOverflow = el.style.overflow;
  const previousBodyOverflow = document.body.style.overflow;
  el.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  return () => {
    el.style.overflow = previousElOverflow;
    document.body.style.overflow = previousBodyOverflow;
  };
}
