import React, { useEffect, useRef } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Silent looping clip that only plays while on screen. Replaces the animated
 * GIFs, which decoded and repainted continuously whether visible or not.
 */
export default function LoopingVideo({
  src,
  poster,
  width = 1200,
  height = 600,
  className,
  style,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      el.pause();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const started = el.play();
          if (started && typeof started.catch === 'function') {
            started.catch(() => {});
          }
        } else {
          el.pause();
        }
      },
      { rootMargin: '150px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      width={width}
      height={height}
      style={style}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
