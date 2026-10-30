/** Resolve precomputed production ink for a hand. No geometric remorphs. */
export function resolveInk(ink, handId) {
  if (!ink) return ink;
  const by = ink.byHand || ink.inkByHand;
  if (by && handId && by[handId]) return by[handId];
  if (by && by.neat) return by.neat;
  return ink;
}

/** @deprecated kept for import compat — returns precomputed ink, never remorphs */
export function applyHand(ink, handId) {
  return resolveInk(ink, handId);
}
