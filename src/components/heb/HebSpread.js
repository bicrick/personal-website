import React from 'react';

function HebSpread({ year, caption, children }) {
  return (
    <figure className="heb-spread">
      <div className="heb-spread-year">{year}</div>
      {children}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export default HebSpread;
