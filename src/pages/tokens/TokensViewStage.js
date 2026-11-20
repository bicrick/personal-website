import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './TokensViewStage.css';

const DURATION_MS = 260;

/**
 * Slides/fades chart views when the tab changes. Direction follows tab order:
 * selecting a tab to the right enters from the right, and vice versa.
 * Panel height tracks content so heatmap vs charts don't leave dead space
 * or jump awkwardly. Respects prefers-reduced-motion.
 */
export default function TokensViewStage({ view, order, children }) {
  const measureRef = useRef(null);
  const prevViewRef = useRef(view);
  const [height, setHeight] = useState(null);
  const [heightReady, setHeightReady] = useState(false);
  const [slide, setSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(() => (
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    const prev = prevViewRef.current;
    if (prev !== view) {
      const from = order.indexOf(prev);
      const to = order.indexOf(view);
      setSlide(to === from ? 0 : to > from ? 1 : -1);
      setAnimKey((k) => k + 1);
      prevViewRef.current = view;
    }
  }, [view, order]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return undefined;

    const apply = () => {
      const next = el.offsetHeight;
      setHeight((prev) => (prev == null || Math.abs(prev - next) > 0.5 ? next : prev));
    };

    apply();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view, animKey, children]);

  // Paint the first locked height without a transition, then enable height
  // animation so later tab switches ease instead of snapping.
  useEffect(() => {
    if (height == null || heightReady) return undefined;
    const id = requestAnimationFrame(() => setHeightReady(true));
    return () => cancelAnimationFrame(id);
  }, [height, heightReady]);

  const stageStyle = height == null
    ? undefined
    : {
      height: `${height}px`,
      transition: (reduceMotion || !heightReady) ? 'none' : `height ${DURATION_MS}ms ease`,
    };

  let dirClass = '';
  if (animKey > 0) {
    if (reduceMotion || slide === 0) dirClass = 'is-fade';
    else if (slide > 0) dirClass = 'is-from-right';
    else dirClass = 'is-from-left';
  }

  return (
    <div
      className={`tokens-view-stage${reduceMotion ? ' is-reduced' : ''}`}
      style={stageStyle}
    >
      <div
        key={animKey}
        className={`tokens-view-pane${dirClass ? ` ${dirClass}` : ''}`}
        ref={measureRef}
      >
        {children}
      </div>
    </div>
  );
}
