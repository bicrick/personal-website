/**
 * Values ported from infinitetapestry.app production viewer
 * (uploads/it-viewer.tgz: client.js, style.css, about.css).
 * Do not approximate — keep in sync with source comments.
 */

/** client.js default config */
export const SCROLL_SPEED = 30; // world px / s
export const WORLD_HEIGHT = 1024; // SDXL strip height (live)

/** client.js applyTheme() */
export const SURROUND = {
  dark: { rgb: '5,5,6', empty: '#050506', glow: 0.55 },
  light: { rgb: '244,239,231', empty: '#f4efe7', glow: 0.7 },
};

/**
 * WebGL reflection VAR from client.js refl IIFE:
 * [aBelow, aAbove, fade, gain, sat, glow]
 */
export const REFL_VAR = [0.55, 0.25, 1.25, 1.35, 1.12, 0.18];

/** Compact article demo band + reflection (not the about-page giant square). */
export const BAND_HEIGHT = 'clamp(84px, 11vw, 112px)';
export const REFL_HEIGHT_RATIO = 0.46;
export const REFL_MASK =
  'linear-gradient(rgba(0,0,0,.58), rgba(0,0,0,.22) 40%, transparent 92%)';

/** style.css --ease */
export const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** style.css .veil */
export const VEIL = {
  dark: 'linear-gradient(to bottom, rgba(0,0,0,.35), transparent 18%, transparent 70%, rgba(0,0,0,.45))',
  light: 'linear-gradient(to bottom, rgba(244,239,231,.4), transparent 18%, transparent 70%, rgba(244,239,231,.5))',
};

/** #amb-blobs opacity factor from style.css */
export const AMB_BLOB_OPACITY = 0.55;

/** client.js amb blob sample interval */
export const AMB_SAMPLE_MS = 2500;

/** client.js easeSpring for return-to-live / pan settle */
export const easeSpring = (t) => 1 - (1 - t) ** 3;
