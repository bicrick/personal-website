import { getLandingPageById } from '../constants/sections';

export const CHAPTER_INK_MIN = 0;
export const CHAPTER_INK_MAX = 1;
/** Ink at which blur is gone (chapter top at mid-viewport). */
export const CHAPTER_SHARP_ON = 0.99;
/** Drop below this before a return visit can type again. */
export const CHAPTER_SHARP_OFF = 0.55;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getViewportHeight() {
  const visual = window.visualViewport?.height;
  if (typeof visual === 'number' && visual > 0) return visual;
  return window.innerHeight;
}

/** iOS often leaves window.scrollY at 0 while body / visualViewport actually move. */
export function getScrollY() {
  const visual = window.visualViewport;
  const fromVisual = typeof visual?.pageTop === 'number' ? visual.pageTop : 0;
  const fromWin = window.scrollY || window.pageYOffset || 0;
  const fromRoot = document.documentElement?.scrollTop || 0;
  const fromBody = document.body?.scrollTop || 0;
  const fromSe = document.scrollingElement?.scrollTop || 0;
  return Math.max(fromVisual, fromWin, fromRoot, fromBody, fromSe);
}

function paintChapterInk(el, ink, slide = 1 - ink, originY = 4) {
  el.style.setProperty('--chapter-ink', String(ink));
  el.style.setProperty('--chapter-slide', String(slide));
  el.style.setProperty('--chapter-origin-y', `${originY}%`);
  // Drop compositing when sharp so photos stay at native resolution
  if (prefersReducedMotion() || ink >= 0.995) {
    el.classList.remove('is-chapter-turning');
    el.style.filter = '';
    el.style.webkitFilter = '';
    return;
  }
  el.classList.add('is-chapter-turning');
  // Set filter in JS so WebKit/iOS repaints when the custom property changes
  const blur = `${((1 - ink) * 14).toFixed(2)}px`;
  el.style.filter = `blur(${blur})`;
  el.style.webkitFilter = `blur(${blur})`;
}

/** Viewport rect ignoring chapter scale/blur so measurements cannot feed back. */
function getLayoutRect(el) {
  let top = 0;
  let node = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  top -= getScrollY();
  const height = el.offsetHeight;
  return { top, bottom: top + height, height };
}

function easeChapterProgress(t) {
  const clamped = Math.max(0, Math.min(1, t));
  // Stay far back, then rush into place near mid-viewport
  return clamped ** 1.8;
}

export function getStickyNavHeight() {
  const nav = document.querySelector('.landing-nav');
  if (!nav) return 72;
  return Math.ceil(nav.getBoundingClientRect().height);
}

export function getChapterGutterPx() {
  const breakEl = document.querySelector('[data-chapter-break]');
  if (breakEl) {
    const height = breakEl.getBoundingClientRect().height;
    if (height > 0) return height;
  }
  return Math.round(getViewportHeight() * 0.4);
}

/** Scroll distance over which blur → focus runs (a bit longer than the gutter). */
export function getChapterFocusPx() {
  const gutter = getChapterGutterPx();
  return Math.max(gutter * 1.15, Math.round(getViewportHeight() * 0.48));
}

export function scrollToLandingSection(id, { behavior } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = prefersReducedMotion();
  const scrollBehavior = reduced ? 'auto' : (behavior || 'smooth');
  const navH = getStickyNavHeight();
  const top = getScrollY() + getLayoutRect(el).top - navH;
  const maxScroll = Math.max(
    0,
    (document.scrollingElement || document.documentElement).scrollHeight - getViewportHeight(),
  );
  const target = Math.max(0, Math.min(top, maxScroll));

  if (typeof window.scrollTo === 'function') {
    window.scrollTo({ top: target, behavior: scrollBehavior });
  } else {
    el.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  }
}

/**
 * One-shot type-in when a chapter first goes sharp; reset when it blurs away.
 * Nav current/settled is separate — this is the mid-viewport trigger.
 */
export function applyChapterPlayFromInk(el, ink, { forceReplay = false } = {}) {
  const reduced = prefersReducedMotion();
  const isSharp = ink >= CHAPTER_SHARP_ON;
  const isFaded = ink <= CHAPTER_SHARP_OFF;
  const drawn = el.classList.contains('is-chapter-drawn');
  const settled = el.classList.contains('is-chapter-settled');

  if (isFaded) {
    if (drawn || settled || !el.classList.contains('is-chapter-pending')) {
      el.classList.remove('is-chapter-drawn', 'is-chapter-settled');
      el.classList.add('is-chapter-pending');
    }
    return;
  }

  if (!isSharp) return;

  if (reduced) {
    el.classList.remove('is-chapter-pending', 'is-chapter-drawn');
    el.classList.add('is-chapter-settled');
    return;
  }

  if (!forceReplay && (drawn || settled)) return;

  if (forceReplay) {
    el.classList.remove('is-chapter-settled', 'is-chapter-drawn');
    el.classList.add('is-chapter-pending');
    window.requestAnimationFrame(() => {
      if (!el.isConnected) return;
      el.classList.remove('is-chapter-pending');
      el.classList.add('is-chapter-drawn');
    });
    return;
  }

  el.classList.remove('is-chapter-pending');
  el.classList.add('is-chapter-drawn');
}

export function setChapterInkImmediate(activeId, { replay = false } = {}) {
  const pages = document.querySelectorAll('.page-section[data-chapter]');
  pages.forEach((el) => {
    const id = el.getAttribute('data-chapter');
    const isActive = id === activeId;
    const ink = isActive ? CHAPTER_INK_MAX : CHAPTER_INK_MIN;
    paintChapterInk(el, ink, isActive ? 0 : 1);
    applyChapterPlayFromInk(el, ink, { forceReplay: replay && isActive });
  });
}

function getChapterFocusEnd(navH) {
  // Sharp once the chapter top reaches mid-viewport, not only when pinned to the nav
  return Math.max(navH, Math.round(getViewportHeight() * 0.5));
}

function arrivalProgress(rect, navH, focusPx) {
  const end = getChapterFocusEnd(navH);
  const start = end + focusPx;
  if (rect.top >= start) return 0;
  if (rect.top <= end) return 1;
  return 1 - ((rect.top - end) / focusPx);
}

/**
 * How far this chapter has scrolled off the top, over one viewport.
 * 0 = still a full screen of it; 1 = gone. Mirrors arrival so the exit
 * is the same curve running backwards.
 */
function leaveProgress(rect, navH) {
  const viewH = getViewportHeight();
  const remaining = rect.bottom - navH;
  const span = Math.max(1, viewH - navH);
  if (remaining >= span - 8) return 0;
  if (remaining <= 0) return 1;
  return 1 - remaining / span;
}

export function updateChapterInkFromScroll() {
  if (prefersReducedMotion()) {
    const activeId = resolveActiveLandingId();
    setChapterInkImmediate(activeId);
    return;
  }

  const navH = getStickyNavHeight();
  const focusPx = Math.max(1, getChapterFocusPx());
  const sections = Array.from(document.querySelectorAll('.page-section[data-chapter]'));
  const maxScroll = Math.max(
    0,
    (document.scrollingElement || document.documentElement).scrollHeight - getViewportHeight(),
  );
  const scrollY = getScrollY();
  const nearBottom = scrollY >= maxScroll - 8;
  const atPageTop = scrollY <= 16;
  const layouts = sections.map((el) => getLayoutRect(el));
  const arrives = layouts.map((rect) => arrivalProgress(rect, navH, focusPx));

  sections.forEach((el, index) => {
    const rect = layouts[index];
    const arrive = arrives[index];
    const nextArrive = arrives[index + 1] ?? 0;
    const leave = leaveProgress(rect, navH);
    const next = sections[index + 1];
    const viewH = getViewportHeight();
    let ink = easeChapterProgress(arrive);
    const leaveEase = easeChapterProgress(leave);
    ink = Math.min(ink, 1 - leaveEase);
    if (next) {
      const nextEase = easeChapterProgress(nextArrive);
      // Tall chapters (about) only pair to the next slide as they actually
      // leave. A boolean mid-screen gate made short pages pop out.
      const tall = rect.height > viewH * 1.15;
      const pair = nextEase * (tall ? leaveEase : 1);
      ink = Math.min(ink, 1 - pair);
    }

    if (rect.top >= viewH - 8) {
      ink = 0;
    } else if (atPageTop && index === 0) {
      ink = 1;
    } else if (!next && nearBottom) {
      ink = Math.max(ink, 0.92);
    }

    const leaving = leave > 0 || (Boolean(next) && nextArrive > 0 && arrive >= 0.999);
    const slide = leaving ? 0 : (1 - ink);
    paintChapterInk(el, ink, slide, leaving ? 92 : 4);
    applyChapterPlayFromInk(el, ink);
  });
}

export function resolveActiveLandingId() {
  // Probe below the sticky nav so a chapter counts as active once its
  // title/content is in the upper reading band — not only when flush to the nav.
  const navH = getStickyNavHeight();
  const probeY = navH + Math.min(140, Math.round(getViewportHeight() * 0.22));
  let activeId = 'home';

  document.querySelectorAll('.page-section[data-chapter]').forEach((el) => {
    const rect = getLayoutRect(el);
    if (rect.top <= probeY && rect.bottom > navH) {
      activeId = el.getAttribute('data-chapter') || activeId;
    }
  });

  return getLandingPageById(activeId)?.id || 'home';
}
