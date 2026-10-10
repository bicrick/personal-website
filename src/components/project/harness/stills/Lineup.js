import React from 'react';
import Critter from '../Critter';
import Logo, { HARNESSES } from '../logos';

// Same Claude, six outfits: harnesses that can all run the same Claude
// model, plus the one I built. The model inside doesn't change.
const CAST = [
  { id: 'claude', outfit: undefined, mood: 'happy' },
  { id: 'cursor', outfit: 'cursor' },
  { id: 'opencode', outfit: 'opencode' },
  { id: 'aider', outfit: 'aider' },
  { id: 'mini', outfit: 'mini' },
  { id: 'mine', outfit: 'harness', mood: 'happy' },
];

export default function Lineup() {
  return (
    <div className="hs-lineup">
      {CAST.map((c, i) => (
        <div key={c.id} className="hs-cast" style={{ '--i': i }}>
          <Critter className="hs-cast-critter" outfit={c.outfit} mood={c.mood} hop />
          <div className="hs-cast-name">
            {c.id !== 'mine' && <Logo id={c.id} />}
            <span>{c.id === 'mine' ? 'mine' : HARNESSES[c.id].name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
