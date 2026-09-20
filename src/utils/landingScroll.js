import { getLandingPageById } from '../constants/sections';

export const CHAPTER_INK_MIN = 0;
export const CHAPTER_INK_MAX = 1;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeOutProgress(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - ((1 - clamped) ** 2.4);
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
  return Math.round(window.innerHeight * 0.22);
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

export function setChapterInkImmediate(activeId) {
  const pages = document.querySelectorAll('.page-section[data-chapter]');
  pages.forEach((el) => {
    const id = el.getAttribute('data-chapter');
    const ink = id === activeId ? CHAPTER_INK_MAX : CHAPTER_INK_MIN;
    el.style.setProperty('--chapter-ink', String(ink));
  });
}

function arrivalProgress(el, navH, gutterPx) {
  const top = el.getBoundingClientRect().top;
  if (top >= navH + gutterPx) return 0;
  if (top <= navH) return 1;
  return 1 - ((top - navH) / gutterPx);
}

export function updateChapterInkFromScroll(activeId) {
  if (prefersReducedMotion()) {
    setChapterInkImmediate(activeId);
    return;
  }

  const navH = getStickyNavHeight();
  const gutterPx = Math.max(1, getChapterGutterPx());
  const sections = Array.from(document.querySelectorAll('.page-section[data-chapter]'));
  const maxScroll = Math.max(
    0,
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight,
  );
  const nearBottom = window.scrollY >= maxScroll - 8;

  sections.forEach((el, index) => {
    const id = el.getAttribute('data-chapter');
    const arrive = arrivalProgress(el, navH, gutterPx);
    const next = sections[index + 1];
    const nextArrive = next ? arrivalProgress(next, navH, gutterPx) : 0;
    let t = Math.max(0, Math.min(1, arrive * (1 - nextArrive)));

    // Current chapter is always fully present (nav jumps / deep links included).
    if (id === activeId) {
      t = 1;
    } else if (!next && nearBottom) {
      t = 1;
    }

    el.style.setProperty('--chapter-ink', String(easeOutProgress(t)));
  });
}

export function resolveActiveLandingId() {
  // Probe below the sticky nav so a chapter counts as active once its
  // title/content is in the upper reading band — not only when flush to the nav.
  const navH = getStickyNavHeight();
  const probeY = navH + Math.min(140, Math.round(window.innerHeight * 0.22));
  let activeId = 'home';

  document.querySelectorAll('.page-section[data-chapter]').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= probeY && rect.bottom > navH) {
      activeId = el.getAttribute('data-chapter') || activeId;
    }
  });

  return getLandingPageById(activeId)?.id || 'home';
}
