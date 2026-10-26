import React from 'react';
import './LiveSiteEmbed.css';

/**
 * Non-interactive live embed of another site.
 * The iframe lays out at a desktop size (viewW × viewH), shifts up by offsetY
 * so the interesting part of the page sits in the frame, then scales down to fit.
 * Nothing inside the frame accepts input. The cover link opens the real site.
 */
export default function LiveSiteEmbed({
  src,
  title,
  viewW = 1440,
  viewH = 900,
  offsetY = 0,
  frameH,
  caption,
}) {
  const visibleH = frameH || viewH - offsetY;
  return (
    <figure className="live-embed">
      <div
        className="live-embed-box"
        style={{
          '--le-vw': viewW,
          '--le-vh': viewH,
          '--le-oy': offsetY,
          aspectRatio: `${viewW} / ${visibleH}`,
        }}
      >
        <div className="live-embed-scaler" inert="">
          <iframe
            className="live-embed-iframe"
            src={src}
            title={title}
            width={viewW}
            height={viewH}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <a
          className="live-embed-hit"
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${title}`}
        >
          <span className="live-embed-hit-label">Open {title}</span>
        </a>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
