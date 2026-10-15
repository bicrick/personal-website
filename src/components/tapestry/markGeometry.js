/**
 * Official Infinite Tapestry woven infinity mark geometry.
 *
 * Source file: public/images/infinite-tapestry/brand/mark.svg
 * (byte-identical to mark-plain.svg path geometry and to
 * https://infinitetapestry.app/brand/mark.svg from uploads/it-brand.tgz)
 *
 * Do not approximate or substitute a generic infinity — stroke these paths
 * at the listed widths exactly as in the SVG.
 */

export const MARK_VIEWBOX = 64;

export const MARK_PATH_D = {
  right: 'M32 32c5-7 9-10 14-10a10 10 0 0 1 0 20c-5 0-9-3-14-10',
  left: 'M32 32C27 25 23 22 18 22a10 10 0 0 0 0 20c5 0 9-3 14-10',
  bridge: 'M27 37.5C29 35.6 30.5 34 32 32s3-3.6 5-5.5',
  weave: 'M18 42c5 0 9-3 14-10s9-10 14-10',
};

/** Outer silhouette strokes used for destination-in masking (from mark.svg). */
export const MARK_MASK_STROKES = [
  { key: 'right', width: 9 },
  { key: 'left', width: 9 },
  { key: 'bridge', width: 10 },
  { key: 'weave', width: 6.4 },
];

/**
 * Full woven stroke stack from mark.svg (outer → inner).
 * role "under" = dark plate (#0b0b0d); role "cream" = #efe9df weave.
 * Width 0 entries from the SVG are omitted.
 */
export const MARK_OUTLINE_STROKES = [
  { key: 'right', width: 9, role: 'under' },
  { key: 'right', width: 6.4, role: 'cream' },
  { key: 'right', width: 4, role: 'under' },
  { key: 'right', width: 1.3, role: 'cream' },
  { key: 'left', width: 9, role: 'under' },
  { key: 'left', width: 6.4, role: 'cream' },
  { key: 'left', width: 4, role: 'under' },
  { key: 'left', width: 1.3, role: 'cream' },
  { key: 'bridge', width: 10, role: 'under' },
  { key: 'weave', width: 6.4, role: 'cream' },
  { key: 'weave', width: 4, role: 'under' },
  { key: 'weave', width: 1.3, role: 'cream' },
];

export function createMarkPaths() {
  return {
    right: new Path2D(MARK_PATH_D.right),
    left: new Path2D(MARK_PATH_D.left),
    bridge: new Path2D(MARK_PATH_D.bridge),
    weave: new Path2D(MARK_PATH_D.weave),
  };
}

export function fitMark(w, h, pad = 0.1) {
  const box = MARK_VIEWBOX;
  const scale = (Math.min(w, h) * (1 - pad * 2)) / box;
  const ox = (w - box * scale) / 2;
  // Lift slightly so a soft reflection can sit under the mark
  const oy = (h - box * scale) / 2 - h * 0.02;
  return { scale, ox, oy };
}
