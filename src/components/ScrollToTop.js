import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isLandingPath } from '../constants/sections';
import { scrollPageToTop } from '../utils/pageScroll';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    // Landing ↔ landing: continuous page handles its own scroll position.
    if (isLandingPath(prev) && isLandingPath(pathname)) {
      return;
    }

    // Staying on landing after first paint: do not yank to top.
    if (isLandingPath(pathname) && isLandingPath(prev)) {
      return;
    }

    // Entering a writeup/demo or leaving landing entirely: reset.
    if (!isLandingPath(pathname)) {
      scrollPageToTop();
    }
  }, [pathname]);

  return null;
}
