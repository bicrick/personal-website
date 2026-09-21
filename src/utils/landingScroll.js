import { getLandingPageById } from '../constants/sections';
import { prefersReducedMotion } from './chapterMode';

/** Same insets the current-chapter observer uses: mid-screen reading slice. */
export const READING_BAND_ROOT_MARGIN = '-45% 0px -10% 0px';
const READING_BAND_TOP = 0.45;
const READING_BAND_BOTTOM_INSET = 0.10;

function getViewportHeight() {
  const visual = window.visualViewport?.height;
  if (typeof visual === 'number' && visual > 0) return visual;
  return window.innerHeight;
}

export function getStickyNavHeight() {
  const nav = document.querySelector('.landing-nav');
  if (!nav) return 72;
  return Math.ceil(nav.getBoundingClientRect().height);
}

/**
 * Chapter position measured from its untransformed stage wrapper, so the
 * arrival animation's scale never feeds back into the reading.
 */
function getStageRect(section) {
  const stage = section.closest('.chapter-stage') || section;
  return stage.getBoundingClientRect();
}

function getReadingBand() {
  const viewH = getViewportHeight();
  return {
    top: viewH * READING_BAND_TOP,
    bottom: viewH * (1 - READING_BAND_BOTTOM_INSET),
  };
}

export function chapterOwnsReadingBand(section) {
  const rect = getStageRect(section);
  const { top, bottom } = getReadingBand();
  return rect.top < bottom && rect.bottom > top;
}

export function scrollToLandingSection(id, { behavior } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  const scrollBehavior = prefersReducedMotion() ? 'auto' : (behavior || 'smooth');
  const navH = getStickyNavHeight();
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const top = scrollY + getStageRect(el).top - navH;
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

/** Earliest chapter whose stage intersects the reading band. */
export function resolveActiveLandingId() {
  const sections = document.querySelectorAll('.page-section[data-chapter]');
  for (const el of sections) {
    if (chapterOwnsReadingBand(el)) {
      return getLandingPageById(el.getAttribute('data-chapter'))?.id || 'home';
    }
  }
  return 'home';
}

/** Mark which chapter the nav is pointing at. */
export function setCurrentChapter(activeId) {
  document.querySelectorAll('.page-section[data-chapter]').forEach((el) => {
    el.classList.toggle(
      'is-chapter-current',
      el.getAttribute('data-chapter') === activeId,
    );
  });
}

/** Clear leftover Motion inline styles when phones drop the scrub. */
export function settleChaptersPlain() {
  document.querySelectorAll('.chapter-arrive, .page-section[data-chapter]').forEach((el) => {
    el.style.opacity = '';
    el.style.transform = '';
  });
}
