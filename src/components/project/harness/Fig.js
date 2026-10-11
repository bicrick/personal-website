import React from 'react';

// Crisp figure frame: thin rule, square corners, small pixel title,
// italic caption underneath like the rest of the site.
export default function Fig({ title, aside, caption, children, innerRef, className = '' }) {
  return (
    <figure className={`hs-fig ${className}`}>
      <div className="hs-fig-box" ref={innerRef}>
        {(title || aside) && (
          <div className="hs-fig-head"><span>{title}</span>{aside && <span>{aside}</span>}</div>
        )}
        {children}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
