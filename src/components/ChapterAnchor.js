import React from 'react';
import './ChapterAnchor.css';

/** Untransformed probe so chapter position can be read without scale/blur. */
export default function ChapterAnchor({ id }) {
  return (
    <div
      className="chapter-anchor"
      data-chapter-anchor={id}
      aria-hidden="true"
    />
  );
}
