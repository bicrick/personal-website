import React from 'react';
import Critter from '../Critter';
import Logo, { HARNESSES } from '../logos';

// Same Claude, six outfits: the six harnesses in the SWE-bench run.
const CAST = [
  { id: 'claude', outfit: undefined, mood: 'happy' },
  { id: 'cursor', outfit: 'cursor' },
  { id: 'opencode', outfit: 'opencode' },
  { id: 'aider', outfit: 'aider' },
  { id: 'mini', outfit: 'mini' },
  { id: 'swe', outfit: 'harness' },
];

export default function Lineup() {
  return (
    <div className="hs-lineup">
      {CAST.map((c, i) => (
        <div key={c.id} className="hs-cast" style={{ '--i': i }}>
          <Critter className="hs-cast-critter" outfit={c.outfit} mood={c.mood} hop />
          <div className="hs-cast-name">
            {c.id !== 'swe' && <Logo id={c.id} />}
            <span>{c.id === 'swe' ? 'SWE-agent' : HARNESSES[c.id].name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
