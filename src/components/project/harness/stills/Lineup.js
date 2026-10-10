import React from 'react';
import Critter from '../Critter';
import Logo, { HARNESSES } from '../logos';

// Same Claude, six outfits. The model inside doesn't change; the harness does.
const CAST = [
  { id: 'claude', outfit: undefined, mood: 'happy' },
  { id: 'cursor', outfit: 'cursor' },
  { id: 'codex', outfit: 'codex' },
  { id: 'gemini', outfit: 'gemini' },
  { id: 'opencode', outfit: 'opencode' },
  { id: 'aider', outfit: 'aider' },
];

export default function Lineup() {
  return (
    <div className="hs-lineup">
      {CAST.map((c, i) => (
        <div key={c.id} className="hs-cast" style={{ '--i': i }}>
          <Critter className="hs-cast-critter" outfit={c.outfit} mood={c.mood} hop />
          <div className="hs-cast-name">
            <Logo id={c.id} />
            <span>{HARNESSES[c.id].name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
