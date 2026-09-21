import React from 'react';
import './ChapterStage.css';

/**
 * Three layers, because the browser's native scroll timeline measures the
 * subject's own box:
 *
 *   .chapter-stage   never transformed — the timeline subject
 *   .chapter-arrive  carries the arrival, driven by the "entry" range
 *   <section>        carries the departure, driven by the "exit" range
 *
 * Splitting arrival and departure across two elements lets each use one of
 * the named ranges Motion can hand to a native ViewTimeline, so both run on
 * the compositor instead of the main thread. Their transforms compose.
 */
export default function ChapterStage({ children }) {
  return (
    <div className="chapter-stage">
      <div className="chapter-arrive">{children}</div>
    </div>
  );
}
