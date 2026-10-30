/** Canned dictation lines — coding-agent prompts. */
export const DICTATE_SENTENCES = [
  'refactor the auth middleware to use the new session store',
  'add a dark mode toggle that respects prefers-color-scheme',
  'write a playwright test for the checkout happy path',
  'fix the race in the websocket reconnect handler',
];

/** Capture targets on the mock bakery page — grab order cycles these. */
export const GRAB_TARGETS = [
  {
    id: 'order',
    prompt: 'make this button blue and bump the price font',
  },
  {
    id: 'price',
    prompt: 'raise the loaf to $6.50 and bold the dollar sign',
  },
  {
    id: 'hero',
    prompt: 'swap the hero for a croissant shot and shorten the tagline',
  },
];

export const HINTS = {
  dictate: 'hold to talk.',
  capture: 'grab while holding.',
  race: '~40 vs ~150 wpm.',
};
