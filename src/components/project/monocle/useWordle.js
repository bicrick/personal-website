import { useCallback, useState } from 'react';
import { makeRow, randomWord } from './wordle';

const OPENER = 'ADIEU';

function freshGame(target) {
  return { target, rows: [makeRow(OPENER, target)], current: '', toast: null };
}

/** Real Wordle rules. The state lives outside the theme, like site JS lives outside a patch. */
export default function useWordle() {
  const [game, setGame] = useState(() => freshGame(randomWord()));

  const press = useCallback((key) => {
    setGame((g) => {
      const over = g.rows.length >= 6 || g.rows.some((r) => r.letters === g.target);
      if (over) {
        return key === 'ENTER' ? freshGame(randomWord(g.target)) : g;
      }
      if (key === 'BACK') return { ...g, current: g.current.slice(0, -1) };
      if (key === 'ENTER') {
        if (g.current.length < 5) return g;
        const rows = [...g.rows, makeRow(g.current, g.target)];
        const won = g.current === g.target;
        let toast = null;
        if (won) toast = `solved in ${rows.length}. enter for a new word`;
        else if (rows.length >= 6) toast = `${g.target.toLowerCase()}. enter for a new word`;
        return { ...g, rows, current: '', toast };
      }
      if (g.current.length >= 5) return g;
      return { ...g, current: g.current + key };
    });
  }, []);

  const onKeyDown = useCallback((event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    let key = null;
    if (/^[a-zA-Z]$/.test(event.key)) key = event.key.toUpperCase();
    else if (event.key === 'Enter') key = 'ENTER';
    else if (event.key === 'Backspace') key = 'BACK';
    if (!key) return;
    event.preventDefault();
    press(key);
  }, [press]);

  return { ...game, press, onKeyDown };
}
