/**
 * Baked production ribbon (public/images/infinite-tapestry/ribbon-thumb.webp,
 * 3675×400). Scroll matches infinitetapestry.app: 30 world px/s across a 512px
 * band, so one pass of the image is (3675/400) × (512/30) = 156.8s.
 * Phase 0.25 starts past the grey join in the bake. The tile animates that
 * with a CSS translate3d, not by redrawing pixels.
 */

const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;

export const RIBBON_SRC = `${BASE}/ribbon-thumb.webp`;
export const RIBBON_FALLBACK = `${BASE}/ribbon-thumb.jpg`;
export const MARK_SRC = `${BASE}/brand/mark-plain.svg`;

export const SCROLL_SECONDS = 156.8;
export const SCROLL_PHASE = 0.25;

/** Optical center of the production viewer (6% lift). Band is 3/5 of the tile. */
export const MARK_TOP = 0.47;
export const MARK_H = 0.22;
export const BAND_H = 0.6;
export const BAND_TOP = MARK_TOP - BAND_H / 2;
