import { getLandingPageById } from '../constants/sections';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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

/**
 * Which chapter owns the reading band right now. Used for the initial paint
 * and deep links; ongoing tracking runs off an IntersectionObserver instead.
 */
export function resolveActiveLandingId() {
  const navH = getStickyNavHeight();
  const probeY = navH + Math.min(140, Math.round(getViewportHeight() * 0.22));
  let activeId = 'home';

  document.querySelectorAll('.page-section[data-chapter]').forEach((el) => {
    const rect = getStageRect(el);
    if (rect.top <= probeY && rect.bottom > navH) {
      activeId = el.getAttribute('data-chapter') || activeId;
    }
  });

  return getLandingPageById(activeId)?.id || 'home';
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

/** Chapter reached the reading band — let its title type itself in. */
export function playChapterTitle(section) {
  if (prefersReducedMotion()) {
    section.classList.remove('is-chapter-pending', 'is-chapter-drawn');
    section.classList.add('is-chapter-settled');
    return;
  }
  if (section.classList.contains('is-chapter-drawn')) return;
  section.classList.remove('is-chapter-pending', 'is-chapter-settled');
  section.classList.add('is-chapter-drawn');
}

/** Chapter left the band — arm it so a return visit types again. */
export function resetChapterTitle(section) {
  if (prefersReducedMotion()) return;
  section.classList.remove('is-chapter-drawn', 'is-chapter-settled');
  section.classList.add('is-chapter-pending');
}

/** Nav click on the chapter you are already reading should retype it. */
export function replayChapterTitle(section) {
  if (!section || prefersReducedMotion()) return;
  resetChapterTitle(section);
  window.requestAnimationFrame(() => {
    if (section.isConnected) playChapterTitle(section);
  });
}
