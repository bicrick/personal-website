// Dithered spinning coin, ported from the tokentracker site's hero mark.
// A 3D disc ray-cast per pixel and shaded with 8x8 ordered (Bayer) dithering.

export const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];
export const bayer = (x, y) => (BAYER8[(y & 7) * 8 + (x & 7)] + 0.5) / 64;

const RAMP = ['#8a5f1c', '#b8862f', '#DBA94C', '#F0C463', '#f8dc96'];
const TILT = -0.32;
const INNER = 0.712;
const STAR = 0.42;
const HALF = 0.13;
const LIGHT = (() => {
  const v = [-0.45, -0.55, -0.7];
  const m = Math.hypot(...v);
  return v.map((x) => x / m);
})();

const inStar = (x, y) => Math.abs(x / STAR) ** 0.78 + Math.abs(y / STAR) ** 0.78 < 1;

export function renderCoin(ctx, cells, angle) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);
  ctx.clearRect(0, 0, cells, cells);
  const half = cells / 2;
  const radius = half * 0.86;
  const sweep = (((((angle + Math.PI / 2) / Math.PI) % 1) + 1) % 1) * 3.4 - 1.7;

  for (let py = 0; py < cells; py += 1) {
    for (let px = 0; px < cells; px += 1) {
      const ux = (px + 0.5 - half) / radius;
      const uy = (py + 0.5 - half) / radius;
      const x = ux * ct - uy * st;
      const y = ux * st + uy * ct;
      if (Math.abs(y) > 1) continue;

      let best = Infinity;
      let kind = null;
      let lx = 0;
      let face = 0;

      if (Math.abs(ca) > 1e-4) {
        for (const side of [-1, 1]) {
          const z = (side * HALF - x * sa) / ca;
          const fx = x * ca - z * sa;
          if (Math.hypot(fx, y) <= 1 && !inStar(fx * side, y) && z < best) {
            best = z;
            kind = 'face';
            lx = fx * side;
            face = side;
          }
        }
      }
      if (Math.abs(sa) > 1e-4) {
        const w = Math.sqrt(1 - y * y);
        for (const xr of [-w, w]) {
          const z = (x * ca - xr) / sa;
          const zr = x * sa + z * ca;
          if (Math.abs(zr) <= HALF && z < best) {
            best = z;
            kind = 'rim';
            lx = xr;
          }
        }
      }
      if (!kind) continue;

      let n = kind === 'face' ? [face * sa, 0, face * ca] : [lx * ca, y, -lx * sa];
      if (n[2] > 0) n = n.map((v) => -v);
      const diffuse = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);

      let value;
      if (kind === 'face') {
        const r = Math.hypot(lx, y);
        value = (r > INNER ? 3 : 2) + (diffuse - 0.55) * 2.2 + (face > 0 ? -0.25 : 0);
        if (r > INNER && r < INNER + 0.05) value -= 0.6;
        const band = x * 0.8 + y * 0.6 - sweep;
        value += 1.5 * Math.exp(-(band * band) / 0.03);
      } else {
        value = 1 + (diffuse - 0.4) * 2;
      }

      const lo = Math.floor(value);
      const idx = Math.min(RAMP.length - 1, Math.max(0, value - lo > bayer(px, py) ? lo + 1 : lo));
      ctx.fillStyle = RAMP[idx];
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function hash(x, y) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => noise(x, y) * 0.65 + noise(x * 2.1 + 17, y * 2.1 + 9) * 0.35;

/** Static stippled dot screen, denser toward the edges, as on the tokentracker site. */
const STIPPLE = {
  dark: { dim: [0x2a, 0x2d, 0x36], mid: [0x24, 0x3a, 0x66], gold: [0x8a, 0x5f, 0x1c] },
  light: { dim: [0xdc, 0xde, 0xe3], mid: [0xb4, 0xc8, 0xf0], gold: [0xe0, 0xbd, 0x74] },
};

export function drawStipple(canvas, dark = true) {
  const CELL = 4;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  const W = Math.ceil(w / CELL);
  const H = Math.ceil(h / CELL);
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  const { dim, mid, gold } = dark ? STIPPLE.dark : STIPPLE.light;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const field = fbm(x / 34, y / 34);
      // Soft elliptical vignette: clear behind the content, denser toward the corners
      const ex = ((x + 0.5) / W - 0.5) * 2;
      const ey = ((y + 0.5) / H - 0.5) * 2;
      const d = Math.min(1, Math.max(0, (Math.hypot(ex, ey * 0.85) - 0.45) / 0.75));
      const edge = 0.1 + 0.9 * d * d * (3 - 2 * d);
      const v = (field - 0.25) * edge;
      if (v <= bayer(x, y)) continue;
      const rgb = v > 0.5 && field > 0.76 ? gold : v > 0.3 ? mid : dim;
      const i = (y * 2 * canvas.width + x * 2) * 4;
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
