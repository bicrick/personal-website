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

function paintChapterInk(el, ink) {
  el.style.setProperty('--chapter-ink', String(ink));
  // Set filter in JS so WebKit/iOS repaints when the custom property changes
  if (prefersReducedMotion() || ink >= 0.995) {
    el.style.filter = 'none';
    el.style.webkitFilter = 'none';
    return;
  }
  const blur = `${((1 - ink) * 6).toFixed(2)}px`;
  el.style.filter = `blur(${blur})`;
  el.style.webkitFilter = `blur(${blur})`;
}

function easeChapterProgress(t) {
  const clamped = Math.max(0, Math.min(1, t));
  // Mild ease-out — clarifies a bit sooner without snapping
  return 1 - ((1 - clamped) ** 1.35);
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
  const top = window.scrollY + el.getBoundingClientRect().top - navH;
  const maxScroll = Math.max(
    0,
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight,
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
    paintChapterInk(el, ink);
    applyChapterPlayFromInk(el, ink, { forceReplay: replay && isActive });
  });
}

function getChapterFocusEnd(navH) {
  // Sharp once the chapter top reaches mid-viewport, not only when pinned to the nav
  return Math.max(navH, Math.round(getViewportHeight() * 0.5));
}

function arrivalProgress(el, navH, focusPx) {
  const top = el.getBoundingClientRect().top;
  const end = getChapterFocusEnd(navH);
  const start = end + focusPx;
  if (top >= start) return 0;
  if (top <= end) return 1;
  return 1 - ((top - end) / focusPx);
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
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight,
  );
  const nearBottom = window.scrollY >= maxScroll - 8;
  const atPageTop = window.scrollY <= 16;
  const activeId = resolveActiveLandingId();

  sections.forEach((el, index) => {
    const id = el.getAttribute('data-chapter');
    const arrive = arrivalProgress(el, navH, focusPx);
    const next = sections[index + 1];
    const nextArrive = next ? arrivalProgress(next, navH, focusPx) : 0;
    let t = Math.max(0, Math.min(1, arrive * (1 - nextArrive * 0.85)));

    // Home (and any settled chapter flush to the nav) must be fully sharp — no residual blur
    const top = el.getBoundingClientRect().top;
    const viewH = getViewportHeight();
    if (top >= viewH - 8) {
      // Still below the fold — stay distant so mobile cannot pre-sharpen
      t = 0;
    } else if (atPageTop && index === 0) {
      t = 1;
    } else if (id === activeId && top <= navH + 20) {
      t = 1;
    } else if (!next && nearBottom) {
      t = Math.max(t, 0.92);
    }

    const ink = easeChapterProgress(t);
    paintChapterInk(el, ink);
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
    const rect = el.getBoundingClientRect();
    if (rect.top <= probeY && rect.bottom > navH) {
      activeId = el.getAttribute('data-chapter') || activeId;
    }
  });

  return getLandingPageById(activeId)?.id || 'home';
}
