import { getLandingPageById } from '../constants/sections';
import { prefersReducedMotion } from './chapterMode';

/**
 * A chapter arrives when its top crosses this line. Titles type here,
 * and the nav underline moves with them.
 */
export const ARRIVAL_LINE = 0.38;

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

function arrivalY() {
  return getViewportHeight() * ARRIVAL_LINE;
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

/** Chapter whose top has reached the arrival line. The last one, at the bottom. */
export function resolveActiveLandingId() {
  const sections = [...document.querySelectorAll('.page-section[data-chapter]')];
  if (!sections.length) return 'home';

  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(
    0,
    (document.scrollingElement || document.documentElement).scrollHeight - getViewportHeight(),
  );
  if (maxScroll - scrollY < 32) {
    return getLandingPageById(sections[sections.length - 1].getAttribute('data-chapter'))?.id || 'home';
  }

  const y = arrivalY();
  let passed = sections[0];
  for (const el of sections) {
    const rect = getStageRect(el);
    if (rect.top <= y && rect.bottom > y) {
      return getLandingPageById(el.getAttribute('data-chapter'))?.id || 'home';
    }
    if (rect.top <= y) passed = el;
  }

  return getLandingPageById(passed.getAttribute('data-chapter'))?.id || 'home';
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
