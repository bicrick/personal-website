import React from 'react';

export default function ProjectFigure({ src, alt, caption, width, height, contain }) {
  return (
    <figure className="project-figure">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={contain ? 'is-contain' : undefined}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
