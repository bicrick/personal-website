import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getLandingPage,
  isLandingPath,
  LANDING_PAGES,
} from '../constants/sections';
import { normalizePagePath } from '../constants/pages';
import {
  playChapterTitle,
  replayChapterTitle,
  resetChapterTitle,
  resolveActiveLandingId,
  scrollToLandingSection,
  setCurrentChapter,
  settleChaptersPlain,
} from '../utils/landingScroll';
import { initChapterMotion } from '../utils/chapterMotion';
import { watchChapterMode } from '../utils/chapterMode';

/** Band the nav tracks: a chapter is "current" while it holds the mid screen. */
const NAV_BAND = '-45% 0px -10% 0px';
/** Thin line at the point a chapter finishes arriving and goes sharp. */
const TITLE_LINE = '-45% 0px -50% 0px';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function chapterSections() {
  return Array.from(document.querySelectorAll('.page-section[data-chapter]'));
}

/**
 * Keeps landing URL, active nav, and title playback in sync with scroll.
 * The chapter motion itself is scrubbed by Motion off the scroll timeline —
 * nothing here runs per frame.
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
  const didInitRef = useRef(false);

  activeIdRef.current = activeId;

  const markProgrammatic = useCallback((ms = 700) => {
    programmaticRef.current = true;
    if (programTimerRef.current) clearTimeout(programTimerRef.current);
    programTimerRef.current = setTimeout(() => {
      programmaticRef.current = false;
      programTimerRef.current = null;
    }, ms);
  }, []);

  const commitActive = useCallback((id, { syncUrl = true } = {}) => {
    if (!id) return;

    if (id !== activeIdRef.current) {
      activeIdRef.current = id;
      setActiveId(id);
    }
    setCurrentChapter(id);

    if (!syncUrl || programmaticRef.current) return;
    const page = LANDING_PAGES.find((entry) => entry.id === id);
    if (!page) return;
    if (normalizePagePath(window.location.pathname) === page.path) return;
    navigate(page.path, { replace: true, state: { landingScrollSync: true } });
  }, [navigate]);

  const scrollToSection = useCallback((id, { replace = false } = {}) => {
    const page = LANDING_PAGES.find((entry) => entry.id === id);
    if (!page) return;

    markProgrammatic(prefersReducedMotion() ? 120 : 700);
    commitActive(id, { syncUrl: false });
    replayChapterTitle(document.querySelector(`.page-section[data-chapter="${id}"]`));

    if (normalizePagePath(window.location.pathname) !== page.path) {
      navigate(page.path, { replace, state: { landingNavigate: true } });
    }

    requestAnimationFrame(() => scrollToLandingSection(id));
  }, [commitActive, markProgrammatic, navigate]);

  // Desktop: scroll-scrubbed arrive/leave. Mobile: static chapters.
  useEffect(() => {
    if (!isLandingPath(path)) return undefined;
    let teardown = () => {};
    const stopWatch = watchChapterMode((motion) => {
      teardown();
      if (motion) {
        teardown = initChapterMotion();
      } else {
        settleChaptersPlain();
        teardown = () => {};
      }
    });
    return () => {
      stopWatch();
      teardown();
    };
    // Chapters are static for the whole landing route, so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep link / return from a writeup: place the matching chapter.
  useLayoutEffect(() => {
    if (!isLandingPath(path)) return;

    const page = getLandingPage(path);
    const syncOnly = Boolean(location.state?.landingScrollSync);
    const explicitNav = Boolean(location.state?.landingNavigate);

    // URL followed the scroll, or the router replayed state — do not jump.
    if (syncOnly || (didInitRef.current && !explicitNav)) {
      commitActive(page.id, { syncUrl: false });
      didInitRef.current = true;
      return;
    }

    const first = !didInitRef.current;
    didInitRef.current = true;
    markProgrammatic(prefersReducedMotion() ? 80 : 400);
    commitActive(page.id, { syncUrl: false });

    if (first || explicitNav || page.id !== resolveActiveLandingId()) {
      scrollToLandingSection(page.id, { behavior: 'auto' });
      requestAnimationFrame(() => scrollToLandingSection(page.id, { behavior: 'auto' }));
    }
  }, [path, location.state, commitActive, markProgrammatic]);

  // Nav + URL tracking. Fires on band crossings, not every frame.
  useEffect(() => {
    if (!isLandingPath(path)) return undefined;

    const sections = chapterSections();
    if (!sections.length) return undefined;

    const inBand = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-chapter');
        if (entry.isIntersecting) inBand.add(id);
        else inBand.delete(id);
      });

      // Earliest chapter still holding the band is the one being read.
      const next = sections
        .map((el) => el.getAttribute('data-chapter'))
        .find((id) => inBand.has(id));

      if (next && !programmaticRef.current) {
        commitActive(next, { syncUrl: true });
      }
    }, { rootMargin: NAV_BAND });

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path, commitActive]);

  // Title type-in, keyed to the moment a chapter finishes arriving.
  useEffect(() => {
    if (!isLandingPath(path)) return undefined;

    const sections = chapterSections();
    if (!sections.length) return undefined;

    if (document.documentElement.classList.contains('is-simple-chapters')) {
      settleChaptersPlain();
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) playChapterTitle(entry.target);
        else resetChapterTitle(entry.target);
      });
    }, { rootMargin: TITLE_LINE });

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);

  useEffect(() => () => {
    if (programTimerRef.current) clearTimeout(programTimerRef.current);
  }, []);

  return {
    activeId,
    scrollToSection,
  };
}
