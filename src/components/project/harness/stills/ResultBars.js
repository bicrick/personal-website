import React from 'react';
import Critter from '../Critter';
import useInView from '../useInView';
import Logo from '../logos';

// Horizontal pass-rate bars. rows: [{ label, value, side, hl, mood }]
export default function ResultBars({ title, sideLabel, rows, foot }) {
  const { ref, on } = useInView();
  return (
    <div ref={ref} className={`hs-card hs-bars${sideLabel ? ' has-side' : ''}${on ? ' is-on' : ''}`}>
      {(title || sideLabel) && (
        <div className="hs-card-head">
          <span>{title}</span>
          {sideLabel && <span className="hs-muted">{sideLabel}</span>}
        </div>
      )}
      {rows.map((row, i) => (
        <div key={row.label} className={`hs-bar-row${row.hl ? ' is-hl' : ''}`} style={{ '--i': i, '--w': `${row.value}%` }}>
          <span className="hs-bar-label">{row.logo && <Logo id={row.logo} />}{row.label}</span>
          <div className="hs-bar-track">
            <span className="hs-bar-fill" />
            {(row.mood || row.outfit) && (
              <Critter className="hs-bar-critter" mood={row.mood} outfit={row.outfit} hop={row.mood === 'happy'} />
            )}
          </div>
          <span className="hs-bar-val">{row.value}%</span>
          {sideLabel && <span className="hs-bar-side">{row.side}</span>}
        </div>
      ))}
      {foot && <div className="hs-foot">{foot}</div>}
    </div>
  );
}
