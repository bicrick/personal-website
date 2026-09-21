/**
 * Desktop keeps the scroll-scrubbed chapter arrive/leave.
 * Phones get a static document layout — iOS does not paint those
 * compositor animations the same way, so we do not try.
 */
export const CHAPTER_MOTION_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 801px)';
export const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function usesChapterMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  if (window.matchMedia(REDUCE_MOTION_QUERY).matches) {
    return false;
  }
  return window.matchMedia(CHAPTER_MOTION_QUERY).matches;
}

export function syncChapterModeClass() {
  if (typeof document === 'undefined') return usesChapterMotion();
  const motion = usesChapterMotion();
  document.documentElement.classList.toggle('is-simple-chapters', !motion);
  return motion;
}

export function watchChapterMode(onChange) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const queries = [
    window.matchMedia(REDUCE_MOTION_QUERY),
    window.matchMedia(CHAPTER_MOTION_QUERY),
  ];

  const handle = () => {
    const motion = syncChapterModeClass();
    onChange?.(motion);
  };

  handle();
  queries.forEach((query) => {
    if (query.addEventListener) query.addEventListener('change', handle);
    else query.addListener(handle);
  });

  return () => {
    queries.forEach((query) => {
      if (query.removeEventListener) query.removeEventListener('change', handle);
      else query.removeListener(handle);
    });
  };
}
