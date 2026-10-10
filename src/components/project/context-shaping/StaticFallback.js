import React from 'react';

export default function StaticFallback({ src, alt }) {
  if (!src) return null;
  return (
    <div className="cs-fallback">
      <details>
        <summary>static chart</summary>
        <img src={src} alt={alt || ''} loading="lazy" />
      </details>
    </div>
  );
}
