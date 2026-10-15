export const WORDS = [
  'CRANE', 'LIGHT', 'PIANO', 'GHOST', 'RIVER', 'MAGIC', 'FLAME', 'OCEAN',
  'STORM', 'BRAVE', 'CLOCK', 'DREAM', 'EMBER', 'GLOBE', 'MAPLE', 'TRAIL',
];

export const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export function randomWord(previous) {
  const pool = WORDS.filter((word) => word !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function scoreGuess(guess, target) {
  const result = Array(guess.length).fill('absent');
  const left = {};
  for (let i = 0; i < target.length; i += 1) {
    if (guess[i] === target[i]) result[i] = 'correct';
    else left[target[i]] = (left[target[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i += 1) {
    if (result[i] !== 'correct' && left[guess[i]]) {
      result[i] = 'present';
      left[guess[i]] -= 1;
    }
  }
  return result;
}

const RANK = { absent: 1, present: 2, correct: 3 };

export function keyStatuses(rows) {
  const out = {};
  rows.forEach(({ letters, status }) => {
    [...letters].forEach((letter, i) => {
      const next = status[i];
      if (!out[letter] || RANK[next] > RANK[out[letter]]) out[letter] = next;
    });
  });
  return out;
}

export function makeRow(letters, target) {
  return { letters, status: scoreGuess(letters, target) };
}
