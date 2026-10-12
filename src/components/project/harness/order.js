// One order for the five harnesses everywhere in the post: by notoriety,
// never by result. Hero spin, meet-the-harnesses, grid columns, charts,
// why-tokens slides and the home page spin all read from here.
export const ORDER = ['claude_code', 'cursor', 'opencode', 'swe_agent', 'mini'];
// Costume for each harness (Claude Code is the plain critter).
export const OUTFIT = { claude_code: undefined, cursor: 'cursor', opencode: 'opencode', swe_agent: 'swe', mini: 'mini' };
export const OUTFITS = ORDER.map((id) => OUTFIT[id]);
export const byOrder = (list) => [...list].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
