import React from 'react';

// Renders every variant in one grid cell and shows only the current one,
// so the box is always as tall as its tallest state (no layout shift).
export default function Stack({ items, at, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`hs-stack ${className}`}>
      {items.map((it, n) => (
        <div key={n} className={`hs-stack-i${n === at ? ' is-on' : ''}`} aria-hidden={n === at ? undefined : 'true'}>{it}</div>
      ))}
    </Tag>
  );
}
