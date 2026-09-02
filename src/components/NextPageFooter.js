import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNextLandingPage } from '../constants/sections';
import { normalizePagePath } from '../constants/pages';
import { useFadeNavigate } from './PageTransition';
import './NextPageFooter.css';

const FILL_DELTA = 360;
const BOTTOM_SLACK = 8;
const IDLE_MS = 180;
const COLLAPSE_MS = 420;

function isAtPageBottom() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= BOTTOM_SLACK) return true;
  return window.scrollY >= maxScroll - BOTTOM_SLACK;
}

function isBodyScrollLocked() {
  return document.body.style.overflow === 'hidden';
}

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
    if (!nextPage) return undefined;

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

    const onWheel = (event) => {
      if (navigatingRef.current || isBodyScrollLocked()) return;
      if (!isAtPageBottom()) return;

      if (event.deltaY > 0 || (event.deltaY < 0 && progressRef.current > 0)) {
        event.preventDefault();
        bump(event.deltaY / FILL_DELTA);
      }
    };

    let touchStartY = null;
    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
    };

    const onTouchMove = (event) => {
      if (touchStartY == null || navigatingRef.current || isBodyScrollLocked()) return;
      if (!isAtPageBottom()) return;
      const currentY = event.touches[0].clientY;
      const delta = touchStartY - currentY;
      touchStartY = currentY;
      if (delta > 0 || (delta < 0 && progressRef.current > 0)) {
        bump(delta / (FILL_DELTA * 0.55));
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
      if (progressRef.current > 0 && progressRef.current < 1) {
        scheduleCollapse();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      clearIdle();
      stopCollapse();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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
