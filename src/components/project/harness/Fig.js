import React from 'react';
import Stack from './Stack';

// Crisp figure frame: thin rule, square corners, small pixel title,
// italic caption underneath like the rest of the site.
export default function Fig({ title, aside, caption, captionAt = 0, children, innerRef, className = '' }) {
  return (
    <figure className={`hs-fig ${className}`}>
      <div className="hs-fig-box" ref={innerRef}>
        {(title || aside) && (
          <div className="hs-fig-head"><span>{title}</span>{aside && <span>{aside}</span>}</div>
        )}
        {children}
      </div>
      {caption && (Array.isArray(caption)
        ? <figcaption><Stack items={caption} at={captionAt} /></figcaption>
        : <figcaption>{caption}</figcaption>)}
    </figure>
  );
}
