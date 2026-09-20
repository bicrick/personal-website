import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getLandingPage,
  isLandingPath,
  LANDING_PAGES,
} from '../constants/sections';
import { normalizePagePath } from '../constants/pages';
import {
  resolveActiveLandingId,
  scrollToLandingSection,
  setChapterInkImmediate,
  updateChapterInkFromScroll,
} from '../utils/landingScroll';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Keeps landing URL, active nav, chapter ink, and heading underline in sync
 * with continuous scroll. LandingPage stays mounted across / /about /projects /contact.
 */
export default function useLandingSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = normalizePagePath(location.pathname);
  const initialPage = getLandingPage(path);
  const [activeId, setActiveId] = useState(initialPage.id);

  const activeIdRef = useRef(activeId);
  const programmaticRef = useRef(false);
  const programTimerRef = useRef(null);
  const rafRef = useRef(null);
  const didInitRef = useRef(false);

  activeIdRef.current = activeId;

  const clearProgrammatic = useCallback(() => {
    programmaticRef.current = false;
    if (programTimerRef.current) {
      clearTimeout(programTimerRef.current);
      programTimerRef.current = null;
    }
  }, []);

  const markProgrammatic = useCallback((ms = 900) => {
    programmaticRef.current = true;
    if (programTimerRef.current) clearTimeout(programTimerRef.current);
    programTimerRef.current = setTimeout(() => {
      programmaticRef.current = false;
      programTimerRef.current = null;
    }, ms);
  }, []);

  const applyCurrentClass = useCallback((id) => {
    document.querySelectorAll('.page-section[data-chapter]').forEach((el) => {
      el.classList.toggle('is-chapter-current', el.getAttribute('data-chapter') === id);
    });
  }, []);

  const commitActive = useCallback((id, { syncUrl = true } = {}) => {
    if (!id) return;

    const changed = id !== activeIdRef.current;
    if (changed) {
      activeIdRef.current = id;
      setActiveId(id);
      applyCurrentClass(id);
    } else {
      // Initial mount starts with matching id — apply current once
      const el = document.querySelector(`.page-section[data-chapter="${id}"]`);
      if (el && !el.classList.contains('is-chapter-current')) {
        applyCurrentClass(id);
      }
    }

    if (!syncUrl || programmaticRef.current) return;
    const page = LANDING_PAGES.find((entry) => entry.id === id);
    if (!page) return;
    if (normalizePagePath(window.location.pathname) === page.path) return;
    navigate(page.path, { replace: true, state: { landingScrollSync: true } });
  }, [applyCurrentClass, navigate]);

  const scrollToSection = useCallback((id, { replace = false } = {}) => {
    const page = LANDING_PAGES.find((entry) => entry.id === id);
    if (!page) return;

    markProgrammatic(prefersReducedMotion() ? 120 : 700);
    setChapterInkImmediate(id, { replay: true });
    commitActive(id, { syncUrl: false });

    const current = normalizePagePath(window.location.pathname);
    if (current !== page.path) {
      navigate(page.path, { replace, state: { landingNavigate: true } });
    }

    requestAnimationFrame(() => {
      scrollToLandingSection(id);
    });
  }, [commitActive, markProgrammatic, navigate]);

  // Deep link / writeup return / explicit nav: place the matching chapter
  useLayoutEffect(() => {
    if (!isLandingPath(path)) return;

    const page = getLandingPage(path);
    const syncOnly = Boolean(location.state?.landingScrollSync);

    if (syncOnly) {
      // URL followed the scroll; do not move the viewport
      commitActive(page.id, { syncUrl: false });
      updateChapterInkFromScroll(page.id);
      return;
    }

    markProgrammatic(prefersReducedMotion() ? 80 : 200);
    setChapterInkImmediate(page.id);
    commitActive(page.id, { syncUrl: false });

    const shouldJump = !didInitRef.current
      || Boolean(location.state?.landingNavigate)
      || page.id !== resolveActiveLandingId();

    didInitRef.current = true;

    if (shouldJump) {
      scrollToLandingSection(page.id, { behavior: 'auto' });
      window.requestAnimationFrame(() => {
        scrollToLandingSection(page.id, { behavior: 'auto' });
        setChapterInkImmediate(page.id);
      });
      window.setTimeout(() => {
        scrollToLandingSection(page.id, { behavior: 'auto' });
        setChapterInkImmediate(page.id);
      }, 120);
    }
  }, [path, location.state, commitActive, markProgrammatic]);

  // Scroll listener: ink scrub + active section
  useEffect(() => {
    if (!isLandingPath(path)) return undefined;

    const tick = () => {
      rafRef.current = null;
      const nextId = resolveActiveLandingId();
      updateChapterInkFromScroll(nextId);

      if (!programmaticRef.current && nextId !== activeIdRef.current) {
        commitActive(nextId, { syncUrl: true });
      } else if (programmaticRef.current) {
        // Still keep ink in sync while a programmatic scroll settles
        updateChapterInkFromScroll(activeIdRef.current);
      }
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    // Any real user scroll cancels the post-click lock so the nav can track again
    const onUserScrollIntent = () => {
      if (programmaticRef.current) clearProgrammatic();
    };

    // iOS often skips window scroll during the gesture. Keep a rAF pump
    // running while a finger is down so ink scrubs with the page.
    let touching = false;
    let touchRaf = null;
    const pumpTouch = () => {
      touchRaf = null;
      tick();
      if (touching) touchRaf = window.requestAnimationFrame(pumpTouch);
    };
    const onTouchStart = () => {
      onUserScrollIntent();
      touching = true;
      if (touchRaf == null) touchRaf = window.requestAnimationFrame(pumpTouch);
    };
    const onTouchMove = () => {
      onUserScrollIntent();
      if (!touching) onTouchStart();
      else onScroll();
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };

    tick();
    const scrollOpts = { passive: true };
    const touchOpts = { passive: true, capture: true };
    const scroller = document.scrollingElement || document.documentElement;
    window.addEventListener('scroll', onScroll, scrollOpts);
    document.addEventListener('scroll', onScroll, scrollOpts);
    scroller.addEventListener('scroll', onScroll, scrollOpts);
    document.body.addEventListener('scroll', onScroll, scrollOpts);
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', onUserScrollIntent, scrollOpts);
    document.addEventListener('touchstart', onTouchStart, touchOpts);
    document.addEventListener('touchmove', onTouchMove, touchOpts);
    document.addEventListener('touchend', onTouchEnd, touchOpts);
    document.addEventListener('touchcancel', onTouchEnd, touchOpts);
    const viewport = window.visualViewport;
    viewport?.addEventListener('scroll', onScroll);
    viewport?.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scroll', onScroll);
      document.body.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onUserScrollIntent);
      document.removeEventListener('touchstart', onTouchStart, touchOpts);
      document.removeEventListener('touchmove', onTouchMove, touchOpts);
      document.removeEventListener('touchend', onTouchEnd, touchOpts);
      document.removeEventListener('touchcancel', onTouchEnd, touchOpts);
      viewport?.removeEventListener('scroll', onScroll);
      viewport?.removeEventListener('resize', onScroll);
      touching = false;
      if (touchRaf != null) window.cancelAnimationFrame(touchRaf);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      if (programTimerRef.current) clearTimeout(programTimerRef.current);
    };
  }, [path, commitActive, clearProgrammatic]);

  return {
    activeId,
    scrollToSection,
  };
}
