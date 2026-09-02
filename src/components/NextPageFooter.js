import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNextLandingPage } from '../constants/sections';
import { normalizePagePath } from '../constants/pages';
import { getScrollState, isPageScrollLocked, snapToPageBottom } from '../utils/pageScroll';
import { useFadeNavigate } from './PageTransition';
import './NextPageFooter.css';

const FILL_DELTA = 360;
const TAKEOVER_PX = 96;
const IDLE_MS = 180;
const COLLAPSE_MS = 420;

export default function NextPageFooter() {
  const { pathname } = useLocation();
  const currentPath = normalizePagePath(pathname);
  const nextPage = getNextLandingPage(currentPath);
  const { navigateWithFade } = useFadeNavigate();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const progressRef = useRef(0);
  const navigatingRef = useRef(false);
  const idleTimerRef = useRef(null);
  const collapseFrameRef = useRef(null);
  const nextPathRef = useRef(nextPage?.path);

  nextPathRef.current = nextPage?.path;

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    setVisible(false);
    setCollapsing(false);
    navigatingRef.current = false;
  }, [currentPath]);

  useEffect(() => {
    const stopCollapse = () => {
      if (collapseFrameRef.current != null) {
        window.cancelAnimationFrame(collapseFrameRef.current);
        collapseFrameRef.current = null;
      }
    };

    const clearIdle = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const setProgressValue = (next) => {
      const clamped = Math.max(0, Math.min(1, next));
      progressRef.current = clamped;
      setProgress(clamped);
      if (clamped <= 0.01) {
        progressRef.current = 0;
        setProgress(0);
        setVisible(false);
        setCollapsing(false);
        return;
      }
      setVisible(true);
      if (clamped >= 1 && !navigatingRef.current) {
        navigatingRef.current = true;
        clearIdle();
        stopCollapse();
        window.setTimeout(() => {
          const path = nextPathRef.current;
          if (path) navigateWithFade(path);
        }, 0);
      }
    };

    const startCollapse = () => {
      stopCollapse();
      setCollapsing(true);
      const start = progressRef.current;
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / COLLAPSE_MS);
        const eased = 1 - ((1 - t) ** 3);
        setProgressValue(start * (1 - eased));
        if (t < 1 && !navigatingRef.current) {
          collapseFrameRef.current = window.requestAnimationFrame(tick);
        } else {
          collapseFrameRef.current = null;
        }
      };

      collapseFrameRef.current = window.requestAnimationFrame(tick);
    };

    const scheduleCollapse = () => {
      clearIdle();
      idleTimerRef.current = setTimeout(() => {
        if (navigatingRef.current) return;
        startCollapse();
      }, IDLE_MS);
    };

    const bump = (delta) => {
      if (delta === 0) return;
      stopCollapse();
      setCollapsing(false);
      setProgressValue(progressRef.current + delta);
      if (progressRef.current > 0 && progressRef.current < 1) {
        scheduleCollapse();
      }
    };

    const consumeTowardNextPage = (delta, fillScale) => {
      if (delta === 0) return false;

      const { el, remaining } = getScrollState();
      const reversingProgress = delta < 0 && progressRef.current > 0;
      const nearBottom = remaining <= TAKEOVER_PX;

      if (reversingProgress) {
        if (nextPage) bump(delta / fillScale);
        return Boolean(nextPage);
      }

      if (delta > 0 && nearBottom) {
        const applied = Math.min(Math.max(0, remaining), delta);
        if (applied > 0) {
          el.scrollTop += applied;
        } else {
          snapToPageBottom();
        }
        const leftover = delta - applied;
        if (leftover > 0 && nextPage) {
          bump(leftover / fillScale);
        }
        return true;
      }

      return false;
    };

    const onWheel = (event) => {
      if (navigatingRef.current || isPageScrollLocked()) return;
      if (consumeTowardNextPage(event.deltaY, FILL_DELTA)) {
        event.preventDefault();
      }
    };

    let touchStartY = null;
    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
    };

    const onTouchMove = (event) => {
      if (touchStartY == null || navigatingRef.current || isPageScrollLocked()) return;
      if (event.touches.length !== 1) return;
      const currentY = event.touches[0].clientY;
      const delta = touchStartY - currentY;
      touchStartY = currentY;
      if (consumeTowardNextPage(delta, FILL_DELTA * 0.55)) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
      if (progressRef.current > 0 && progressRef.current < 1) {
        scheduleCollapse();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });

    return () => {
      clearIdle();
      stopCollapse();
      window.removeEventListener('wheel', onWheel, { capture: true });
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('touchmove', onTouchMove, { capture: true });
      document.removeEventListener('touchend', onTouchEnd, { capture: true });
      document.removeEventListener('touchcancel', onTouchEnd, { capture: true });
    };
  }, [nextPage, navigateWithFade]);

  if (!nextPage) return null;

  const label = nextPage.label;

  const goNext = () => {
    if (!visible || navigatingRef.current) return;
    navigatingRef.current = true;
    progressRef.current = 1;
    setProgress(1);
    navigateWithFade(nextPage.path);
  };

  return (
    <div
      className={`next-page-overlay${visible ? ' is-visible' : ''}${collapsing ? ' is-collapsing' : ''}`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        className="next-page-chip"
        onClick={goNext}
        tabIndex={visible ? 0 : -1}
        aria-label={`Go to ${label}`}
      >
        <span className="next-page-chip-label">{label}</span>
        <span className="next-page-chip-track" aria-hidden="true">
          <span
            className="next-page-chip-fill"
            style={{ transform: `scaleX(${progress})` }}
          />
        </span>
      </button>
    </div>
  );
}
