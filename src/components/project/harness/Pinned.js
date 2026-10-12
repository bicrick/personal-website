import React from 'react';
import Progress from './Progress';

// A tall section whose frame pins below the nav while you scroll through it.
export default function Pinned({ sref, id, label, title, aside, p, ticks, stage, height = 520, children, className = '' }) {
  return (
    <section ref={sref} id={id} className={`sg ${className}`} style={{ height: `${height}vh` }} aria-label={label}>
      <div className="sg-sticky">
        <figure className="sg-frame">
          <div className="sg-top"><span>{title}</span>{aside}</div>
          <Progress p={p} ticks={ticks} stage={stage} />
          {children}
        </figure>
      </div>
    </section>
  );
}
