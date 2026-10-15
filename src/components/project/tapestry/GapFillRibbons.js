import React from 'react';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

export default function GapFillRibbons({
  caption = 'Scroll sideways. Same scene pairs: v1.1 join on top, gap-fill B2-256 below. White gaps separate windows and are not seams.',
}) {
  return (
    <figure className="it-demo it-gap">
      <div className="it-gap-row">
        <div className="it-gap-label">
          <span>A · v1.1 join</span>
          <span>rewrites the old tail</span>
        </div>
        <div className="it-gap-scroller">
          <img
            src={`${IMG}/gapfill-ribbon-a.webp`}
            alt="Ribbon of sixty v1.1 scene joins"
            height="116"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
      <div className="it-gap-row">
        <div className="it-gap-label">
          <span>B2 · 256 px gap fill</span>
          <span>keeps both scenes, paints only the gap</span>
        </div>
        <div className="it-gap-scroller">
          <img
            src={`${IMG}/gapfill-ribbon-b.webp`}
            alt="Ribbon of sixty gap-fill B2-256 scene joins"
            height="116"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
