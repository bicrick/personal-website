/**
 * Official Infinite Tapestry woven infinity mark geometry.
 *
 * Source file: public/images/infinite-tapestry/brand/mark.svg
 * (byte-identical to mark-plain.svg path geometry and to
 * https://infinitetapestry.app/brand/mark.svg from uploads/it-brand.tgz)
 */

export const MARK_VIEWBOX = 64;

export const MARK_PATH_D = {
  right: 'M32 32c5-7 9-10 14-10a10 10 0 0 1 0 20c-5 0-9-3-14-10',
  left: 'M32 32C27 25 23 22 18 22a10 10 0 0 0 0 20c5 0 9-3 14-10',
  bridge: 'M27 37.5C29 35.6 30.5 34 32 32s3-3.6 5-5.5',
  weave: 'M18 42c5 0 9-3 14-10s9-10 14-10',
};

/**
 * Outermost silhouette from mark.svg (stroke-width 9 / 10 / 6.4), scaled up
 * so the infinity band is a chunky cutout at thumbnail size.
 */
export const MASK_WIDTH_SCALE = 1.55;

/** Solid fill strokes for destination-in (painting cutout). */
export const MARK_MASK_STROKES = [
  { key: 'right', width: 9 * MASK_WIDTH_SCALE },
  { key: 'left', width: 9 * MASK_WIDTH_SCALE },
  { key: 'bridge', width: 10 * MASK_WIDTH_SCALE },
  { key: 'weave', width: 6.4 * MASK_WIDTH_SCALE },
];

/** Outer rim thickness in viewBox units (paired with mask widths). */
export const OUTLINE_RIM = 1.15;

/**
 * Woven over/under crossing from mark.svg — thin strokes only, drawn after
 * the rim so the painting stays visible in the thick band.
 */
export const MARK_CROSSING_STROKES = [
  { key: 'bridge', width: 2.8, role: 'under' },
  { key: 'weave', width: 1.8, role: 'cream' },
  { key: 'weave', width: 0.85, role: 'under' },
  { key: 'weave', width: 0.45, role: 'cream' },
];

export function createMarkPaths() {
  return {
    right: new Path2D(MARK_PATH_D.right),
    left: new Path2D(MARK_PATH_D.left),
    bridge: new Path2D(MARK_PATH_D.bridge),
    weave: new Path2D(MARK_PATH_D.weave),
  };
}

export function fitMark(w, h, pad = 0.05) {
  const box = MARK_VIEWBOX;
  const scale = (Math.min(w, h) * (1 - pad * 2)) / box;
  const ox = (w - box * scale) / 2;
  const oy = (h - box * scale) / 2 - h * 0.02;
  return { scale, ox, oy };
}
