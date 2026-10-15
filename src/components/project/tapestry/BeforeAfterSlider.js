import React, { useCallback, useRef, useState } from 'react';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

export default function BeforeAfterSlider({
  beforeSrc = `${IMG}/banding-before.webp`,
  afterSrc = `${IMG}/banding-after.webp`,
  beforeLabel = 'banding',
  afterLabel = 'mean+noise',
  caption = 'Drag to compare. Colour banding on the left; mean+noise fill on the right.',
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, next)));
  }, []);

  const onPointerDown = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setFromClientX(event.clientX);
  };

  const onPointerMove = (event) => {
    if (!dragging.current) return;
    setFromClientX(event.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <figure className="it-demo">
      <div
        ref={ref}
        className="it-slider"
        style={{ '--pos': `${pos}%` }}
        role="img"
        aria-label={`${beforeLabel} versus ${afterLabel}. Drag to compare.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img src={beforeSrc} alt="" draggable={false} />
        <img className="it-slider-after" src={afterSrc} alt="" draggable={false} />
        <span className="it-slider-label is-before">{beforeLabel}</span>
        <span className="it-slider-label is-after">{afterLabel}</span>
        <div className="it-slider-handle" aria-hidden="true">
          <span className="it-slider-knob" />
        </div>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
