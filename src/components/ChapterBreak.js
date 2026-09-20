import React from 'react';
import './ChapterBreak.css';

/** Quiet vertical pause between chapters — spacing only, no label. */
export default function ChapterBreak() {
  return <div className="chapter-break" data-chapter-break="" aria-hidden="true" />;
}
