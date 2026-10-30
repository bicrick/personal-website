/**
 * Port of dashboard/live.js pen clock + stroke draw + 3D pen overlay.
 * Demo strokes are {xs, ys, w}; live.js strokes carry runs of [width, flat_xy].
 * Timing matches lvTime / lvTick at the friends default speed (2×).
 */

export const PEN_MM_S = 20;
export const LIFT_S = 0.06;
export const LINE_S = 0.35;
export const GROUP_S = 0.45;
export const START_S = 0.6;
export const END_S = 1.8;
/** Friends site default playback speed. */
export const DEFAULT_SPEED = 2;

const PEN = {
  len: 140,
  az0: 0.78,
  el0: 0.86,
  wrist: 72,
  cam: 950,
  light: [0.42, -0.4],
  parts: [
    [0, 0.7, 0.4, 0.6, '#8c8f96', 'metal'],
    [0.7, 10.5, 0.55, 3.05, '#c7cad0', 'metal'],
    [10.5, 12.4, 3.35, 3.35, '#d9dbe0', 'metal'],
    [12.4, 39, 4.15, 4.3, '#2b2c30', 'grip'],
    [39, 41, 4.1, 4.1, '#c9ccd2', 'metal'],
    [41, 127, 4.0, 4.0, '#1f3260', 'barrel'],
    [127, 135, 3.95, 3.7, '#172548', 'barrel'],
    [135, 140, 2.1, 2.0, '#cfd2d8', 'metal'],
  ],
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (f) => {
  const x = clamp(f, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Friends / production navy on light paper; theme ink under html.is-dark. */
export function inkColor() {
  if (typeof window === 'undefined') return '#1b2a4a';
  if (document.documentElement.classList.contains('is-dark')) {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    return v || '#e8e6e0';
  }
  return '#1b2a4a';
}

function prepDemoStroke(s, color) {
  const xs = s.xs || [];
  const ys = s.ys || [];
  const n = Math.min(xs.length, ys.length);
  const w = s.w || 0.35;
  const ws = [];
  for (let k = 1; k < n; k += 1) ws.push(w);
  const cum = [0];
  for (let k = 1; k < n; k += 1) {
    cum.push(cum[k - 1] + Math.hypot(xs[k] - xs[k - 1], ys[k] - ys[k - 1]));
  }
  return {
    xs: xs.slice(0, n),
    ys: ys.slice(0, n),
    ws,
    cum,
    n,
    c: s.c || color,
    o: s.o == null ? 1 : s.o,
    k: s.k || 'ink',
    hl: !!s.hl,
    t: s.t || null,
    dt: s.dt || null,
    lf: s.lf || null,
    ts: null,
    group: null,
    row: null,
  };
}

/**
 * Assign region/row tags so demo strokes (no baked `t`) get the same
 * lift/line/group gaps live.js uses on production ink.
 */
function tagStrokes(list, regions, lineHeightMm) {
  const lh = lineHeightMm || 8;
  const regs = (regions || []).slice().sort((a, b) => a.box.y - b.box.y);
  for (const s of list) {
    if (s.t) continue;
    const cy = (s.ys[0] + s.ys[s.n - 1]) / 2;
    let ri = regs.length ? regs.length - 1 : 0;
    for (let i = 0; i < regs.length; i += 1) {
      const b = regs[i].box;
      if (cy >= b.y - 1 && cy <= b.y + b.h + 1) {
        ri = i;
        break;
      }
      if (cy < b.y) {
        ri = i;
        break;
      }
    }
    const b = regs[ri] ? regs[ri].box : { y: 0 };
    const row = Math.max(0, Math.floor((cy - b.y) / lh));
    s.t = [0, ri, 0, row];
  }
}

/**
 * Build a timed stroke list the same way live.js lvTime does.
 * Pass `regions` (scenario region boxes) so group/row gaps match production.
 * @returns {{ strokes: object[], writeEnd: number, end: number, dt: number }}
 */
export function buildTimeline(rawStrokes, { color, regions, lineHeightMm } = {}) {
  const col = color || inkColor();
  const list = (rawStrokes || [])
    .map((s) => prepDemoStroke(s, col))
    .filter((s) => s.n > 1);

  tagStrokes(list, regions, lineHeightMm);

  let dt = null;
  const ink = list.filter((s) => s.k === 'ink' && s.n > 1);
  if (ink.length) {
    const steps = ink.reduce((a, s) => a + s.n - 1, 0);
    const mean = steps ? ink.reduce((a, s) => a + s.cum[s.n - 1], 0) / steps : 0.2;
    dt = mean / PEN_MM_S;
  }

  const out = [];
  const v = PEN_MM_S;
  for (const s of list) {
    const prev = out[out.length - 1];
    let t = prev ? prev.ts[prev.n - 1] : START_S;
    const group = s.t ? `${s.t[0]}:${s.t[1]}` : `solo${out.length}`;
    const row = s.t ? s.t[3] : null;
    if (prev) {
      const hop = group === prev.group && s.lf ? s.lf : 1;
      t += (LIFT_S + Math.hypot(s.xs[0] - prev.xs[prev.n - 1], s.ys[0] - prev.ys[prev.n - 1]) / (v * 3)) * hop;
      if (group !== prev.group) t += s.dt ? 0.2 : GROUP_S;
      else if (row !== prev.row && row !== null && row >= 0 && prev.row !== null && prev.row >= 0) {
        t += LINE_S;
      }
    }
    s.ts = s.dt
      ? s.xs.map((_, k) => t + s.dt * k)
      : s.k === 'ink'
        ? s.xs.map((_, k) => t + (dt ?? 0.2 / PEN_MM_S) * k)
        : s.cum.map((d) => t + d / (v * 0.8));
    s.group = group;
    s.row = row;
    out.push(s);
  }

  const writeEnd = out.length ? out[out.length - 1].ts[out[out.length - 1].n - 1] : 0;
  return { strokes: out, writeEnd, end: writeEnd + END_S, dt: dt || 0 };
}

export function wallMsForWrite(writeEnd, speed = DEFAULT_SPEED, fast = false) {
  if (fast) return 400;
  const s = Number(speed) || DEFAULT_SPEED;
  return Math.max(400, Math.round((writeEnd / s) * 1000));
}

function indexAt(s, t) {
  if (t <= s.ts[0]) return 0;
  if (t >= s.ts[s.n - 1]) return s.n - 1;
  let lo = 0;
  let hi = s.n - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (s.ts[m] <= t) lo = m;
    else hi = m;
  }
  return lo + (t - s.ts[lo]) / Math.max(1e-9, s.ts[hi] - s.ts[lo]);
}

function strokeAt(strokes, t) {
  let lo = -1;
  let hi = strokes.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (strokes[m].ts[0] <= t) lo = m;
    else hi = m - 1;
  }
  return lo;
}

export function tipAt(strokes, t) {
  if (!strokes.length) return null;
  const i = strokeAt(strokes, t);
  if (i < 0) {
    const s = strokes[0];
    return [s.xs[0], s.ys[0], 5 * (1 - smooth((t - s.ts[0] + 0.45) / 0.45)), false];
  }
  const s = strokes[i];
  const te = s.ts[s.n - 1];
  if (t <= te) {
    const u = indexAt(s, t);
    const n = Math.min(Math.floor(u), s.n - 1);
    const f = u - n;
    const m = Math.min(n + 1, s.n - 1);
    return [
      s.xs[n] + (s.xs[m] - s.xs[n]) * f,
      s.ys[n] + (s.ys[m] - s.ys[n]) * f,
      0,
      true,
    ];
  }
  const ax = s.xs[s.n - 1];
  const ay = s.ys[s.n - 1];
  const nx = strokes[i + 1];
  if (!nx) return [ax, ay, 6 * smooth((t - te) / 0.4), false];
  const bx = nx.xs[0];
  const by = nx.ys[0];
  const t1 = nx.ts[0];
  const dur = Math.max(1e-6, t1 - te);
  const f = clamp((t - te) / dur, 0, 1);
  const e = smooth(f);
  const dist = Math.hypot(bx - ax, by - ay);
  const hmax = clamp(0.7 + 0.11 * dist + 1.6 * Math.min(1, dur / 0.5), 0.8, 8);
  const ramp = Math.min(0.35, 0.09 / dur + 0.15);
  const h = hmax * smooth(f / ramp) * smooth((1 - f) / ramp);
  return [ax + (bx - ax) * e, ay + (by - ay) * e, h, false];
}

function tipSmooth(strokes, t, d) {
  let x = 0;
  let y = 0;
  let wsum = 0;
  for (const [k, w] of [[-2, 0.12], [-1, 0.23], [0, 0.3], [1, 0.23], [2, 0.12]]) {
    const p = tipAt(strokes, t + k * d);
    x += w * p[0];
    y += w * p[1];
    wsum += w;
  }
  return [x / wsum, y / wsum];
}

function poseTarget(strokes, t) {
  const D = 0.1;
  const pm = tipSmooth(strokes, t - D, 0.05);
  const p0 = tipSmooth(strokes, t, 0.05);
  const pp = tipSmooth(strokes, t + D, 0.05);
  const vx = (pp[0] - pm[0]) / (2 * D);
  const vy = (pp[1] - pm[1]) / (2 * D);
  const ax = (pp[0] - 2 * p0[0] + pm[0]) / (D * D);
  const ay = (pp[1] - 2 * p0[1] + pm[1]) / (D * D);
  const speed = Math.hypot(vx, vy);
  const kappa = speed > 3 ? (vx * ay - vy * ax) / (speed * speed * speed) : 0;
  let hx = 0;
  let hy = 0;
  let hw = 0;
  for (let j = 0; j < 8; j += 1) {
    const w = 1 - j / 9;
    const q = tipAt(strokes, t - 0.2 * j);
    hx += w * q[0];
    hy += w * q[1];
    hw += w;
  }
  hx /= hw;
  hy /= hw;
  const tip = tipAt(strokes, t);
  const C = PEN;
  const wx = hx + Math.cos(C.az0) * C.wrist;
  const wy = hy + Math.sin(C.az0) * C.wrist;
  let az = Math.atan2(wy - tip[1], wx - tip[0]);
  az += 0.05 * clamp(vx / 40, -1, 1);
  az += 0.035 * Math.sin(0.37 * t + 1.3) + 0.02 * Math.sin(1.13 * t);
  az = clamp(az, 0.6, 1.25);
  let el = C.el0 - 0.16 * clamp(speed / 55, 0, 1);
  el += 0.025 * Math.sin(0.53 * t + 0.4) + 0.012 * tip[2];
  const lean = 0.075 * Math.tanh(1.2 * kappa * clamp(speed / 18, 0, 1));
  const roll = 0.55 + 2.5 * lean + 0.22 * Math.sin(0.29 * t + 0.7);
  return { az, el, lean, roll };
}

/** Spring-eased pose; mutates poseState. Snap when scrubbing backwards / jumping. */
export function poseAt(strokes, t, poseState) {
  const tgt = poseTarget(strokes, t);
  if (!poseState || t < poseState.t || t - poseState.t > 0.6) {
    const next = { t, x: { ...tgt }, v: { az: 0, el: 0, lean: 0, roll: 0 } };
    if (poseState) Object.assign(poseState, next);
    return tgt;
  }
  const dt = t - poseState.t;
  const w = 16;
  const e = Math.exp(-w * dt);
  for (const k of ['az', 'el', 'lean', 'roll']) {
    const y = poseState.x[k] - tgt[k];
    const tmp = (poseState.v[k] + w * y) * dt;
    poseState.v[k] = (poseState.v[k] - w * tmp) * e;
    poseState.x[k] = tgt[k] + (y + tmp) * e;
  }
  poseState.t = t;
  return poseState.x;
}

function mixHex(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255];
  return `rgb(${c.map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))).join(',')})`;
}

/** Draw the 3D friends-app pen. tip=[x,y,h], pose={az,el,lean,roll}, pageW/H in mm, sc=px per mm. */
export function drawPen(ctx, tip, pose, pageW, pageH, sc) {
  if (!tip || !pose) return;
  const C = PEN;
  const [tx, ty, th] = tip;
  const ce = Math.cos(pose.el);
  const se = Math.sin(pose.el);
  let A = [ce * Math.cos(pose.az), ce * Math.sin(pose.az), se];
  const g = [Math.cos(pose.az), Math.sin(pose.az), 0];
  const cl = Math.cos(pose.lean);
  const sl = Math.sin(pose.lean);
  const gxA = [
    g[1] * A[2] - g[2] * A[1],
    g[2] * A[0] - g[0] * A[2],
    g[0] * A[1] - g[1] * A[0],
  ];
  const gA = g[0] * A[0] + g[1] * A[1];
  A = A.map((v, i) => v * cl + gxA[i] * sl + g[i] * gA * (1 - cl));
  const cx = pageW / 2;
  const cy = pageH / 2;
  const proj = (X, Y, Z) => {
    const s = C.cam / (C.cam - Z);
    return [cx + (X - cx) * s, cy + (Y - cy) * s, s];
  };
  const at = (d) => [tx + A[0] * d, ty + A[1] * d, th + A[2] * d];
  const scr = (d) => proj(...at(d));
  const p0 = scr(0);
  const p1 = scr(C.len);
  let ux = p1[0] - p0[0];
  let uy = p1[1] - p0[1];
  const ul = Math.hypot(ux, uy) || 1;
  ux /= ul;
  uy /= ul;
  let nx = -uy;
  let ny = ux;
  if (nx * C.light[0] + ny * C.light[1] > 0) {
    nx = -nx;
    ny = -ny;
  }
  const fore = Math.max(0.15, A[2]);
  const rot = Math.atan2(uy, ux);
  const [lx, ly] = C.light;
  const sh = (d) => {
    const q = at(d);
    return [q[0] + q[2] * lx, q[1] + q[2] * ly, q[2]];
  };
  const OFF = 4000;
  ctx.save();
  ctx.shadowOffsetX = OFF * sc;
  const shadowBody = (d0, d1, a0, a1, blur) => {
    const s0 = sh(d0);
    const s1 = sh(d1);
    const r0 = d0 < 8 ? 1 : 4.1;
    const r1 = 4.1;
    let vx = s1[0] - s0[0];
    let vy = s1[1] - s0[1];
    const vl = Math.hypot(vx, vy) || 1;
    vx /= vl;
    vy /= vl;
    const gr = ctx.createLinearGradient(s0[0] - OFF, s0[1], s1[0] - OFF, s1[1]);
    gr.addColorStop(0, `rgba(0,0,0,${a0})`);
    gr.addColorStop(1, `rgba(0,0,0,${a1})`);
    ctx.shadowBlur = blur * sc;
    ctx.shadowColor = 'rgba(34,30,44,1)';
    ctx.beginPath();
    ctx.moveTo(s0[0] - vy * r0 - OFF, s0[1] + vx * r0);
    ctx.lineTo(s1[0] - vy * r1 - OFF, s1[1] + vx * r1);
    ctx.lineTo(s1[0] + vy * r1 - OFF, s1[1] - vx * r1);
    ctx.lineTo(s0[0] + vy * r0 - OFF, s0[1] - vx * r0);
    ctx.closePath();
    ctx.fillStyle = gr;
    ctx.fill();
  };
  const fade = 1 / (1 + 0.12 * th);
  shadowBody(0, C.len, 0.2 * fade, 0.05, 3.2 + 0.3 * th);
  shadowBody(0, 45, 0.16 * fade, 0.0, 1.0 + 0.3 * th);
  const c0 = sh(0);
  ctx.shadowBlur = (0.5 + 0.35 * th) * sc;
  ctx.shadowColor = `rgba(24,22,34,${0.45 / (1 + 0.06 * th)})`;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(c0[0] - OFF, c0[1], 0.8 + 0.3 * th, 0.55 + 0.22 * th, rot, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (const [d0, d1, r0, r1, col, kind] of C.parts) {
    const a = scr(d0);
    const b = scr(d1);
    const ra = r0 * a[2];
    const rb = r1 * b[2];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const rm = Math.max(ra, rb);
    const gr = ctx.createLinearGradient(mx - nx * rm, my - ny * rm, mx + nx * rm, my + ny * rm);
    const k = kind === 'metal'
      ? [-0.55, -0.1, 0.25, 0.85, 0.2, -0.25]
      : kind === 'grip'
        ? [-0.6, -0.2, 0, 0.18, 0.05, -0.3]
        : [-0.6, -0.15, 0.05, 0.55, 0.12, -0.3];
    [0, 0.25, 0.5, 0.68, 0.82, 1].forEach((o, i) => gr.addColorStop(o, mixHex(col, k[i])));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.ellipse(a[0], a[1], ra * fore + 1e-3, ra + 1e-3, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(b[0], b[1], rb * fore + 1e-3, rb + 1e-3, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(a[0] + nx * ra, a[1] + ny * ra);
    ctx.lineTo(b[0] + nx * rb, b[1] + ny * rb);
    ctx.lineTo(b[0] - nx * rb, b[1] - ny * rb);
    ctx.lineTo(a[0] - nx * ra, a[1] - ny * ra);
    ctx.closePath();
    ctx.fill();
    if (kind === 'grip') {
      ctx.strokeStyle = 'rgba(0,0,0,0.38)';
      ctx.lineWidth = 0.35;
      for (let d = d0 + 2; d < d1 - 1; d += 2.4) {
        const c = scr(d);
        const r = (r0 + ((r1 - r0) * (d - d0)) / (d1 - d0)) * c[2];
        ctx.beginPath();
        ctx.ellipse(c[0], c[1], r * fore, r * 0.97, rot, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    }
  }
  const top = scr(C.len);
  const rt = C.parts[C.parts.length - 1][3] * top[2];
  ctx.beginPath();
  ctx.ellipse(top[0], top[1], rt * fore, rt, rot, 0, Math.PI * 2);
  ctx.fillStyle = '#e6e8ec';
  ctx.fill();

  const e1 = [-A[1], A[0], 0].map((v) => v / (Math.hypot(A[0], A[1]) || 1));
  const e2 = [
    A[1] * e1[2] - A[2] * e1[1],
    A[2] * e1[0] - A[0] * e1[2],
    A[0] * e1[1] - A[1] * e1[0],
  ];
  const off = (d, r, phi) => {
    const q = at(d);
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    return proj(
      q[0] + r * (c * e2[0] + s * e1[0]),
      q[1] + r * (c * e2[1] + s * e1[1]),
      q[2] + r * (c * e2[2] + s * e1[2]),
    );
  };
  const facing = Math.cos(pose.roll) * e2[2] + Math.sin(pose.roll) * e1[2];
  if (facing > -0.15) {
    const w = 0.85;
    const R = 4.6;
    const pts = [
      off(96, R - 0.4, pose.roll - w / R),
      off(131, R, pose.roll - w / R),
      off(131, R, pose.roll + w / R),
      off(96, R - 0.4, pose.roll + w / R),
    ];
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.globalAlpha = clamp(0.4 + facing, 0, 1);
    const cg = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[3][0], pts[3][1]);
    cg.addColorStop(0, '#9da1a9');
    cg.addColorStop(0.5, '#f3f4f6');
    cg.addColorStop(1, '#8a8e96');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.5;
  const bandPhi = pose.roll + 2.2;
  const band = [];
  for (let j = -6; j <= 6; j += 1) band.push(off(50 + j * 1.6, 4.02, bandPhi));
  if (Math.cos(bandPhi) * e2[2] + Math.sin(bandPhi) * e1[2] > 0.1) {
    ctx.beginPath();
    band.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(p0[0], p0[1], Math.max(0.28, 0.32 * p0[2]), 0, Math.PI * 2);
  ctx.fillStyle = '#4a4c52';
  ctx.fill();
}

/** Stroke prefix up to fractional point index (live.js lvPath). */
export function drawPath(ctx, s, upto) {
  const n = Math.min(Math.floor(upto), s.n - 1);
  if (s.n < 2 || upto <= 0) return;
  ctx.strokeStyle = s.c;
  ctx.lineCap = s.hl ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  let w = s.ws[0] || 0.35;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(s.xs[0], s.ys[0]);
  for (let k = 1; k <= n; k += 1) {
    if (s.ws[k - 1] !== w) {
      ctx.stroke();
      w = s.ws[k - 1];
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(s.xs[k - 1], s.ys[k - 1]);
    }
    ctx.lineTo(s.xs[k], s.ys[k]);
  }
  const f = upto - n;
  if (n < s.n - 1 && f > 0) {
    ctx.lineTo(
      s.xs[n] + (s.xs[n + 1] - s.xs[n]) * f,
      s.ys[n] + (s.ys[n + 1] - s.ys[n]) * f,
    );
  }
  ctx.stroke();
}

/**
 * Paint ink (+ optional 3D pen) at virtual time vt onto ctx already transformed to page-mm.
 * poseState is mutated across frames for spring easing.
 */
export function drawFrame(ctx, timeline, vt, {
  showPen = true,
  finished = false,
  poseState = null,
  pageW = 0,
  pageH = 0,
  sc = 1,
} = {}) {
  const S = timeline.strokes;
  if (!S.length) return { strokesDrawn: 0 };
  let drawn = 0;
  for (let i = 0; i < S.length; i += 1) {
    const s = S[i];
    if (s.ts[s.n - 1] <= vt) {
      ctx.globalAlpha = s.o;
      drawPath(ctx, s, s.n - 1);
      ctx.globalAlpha = 1;
      drawn = i + 1;
    } else break;
  }
  const cur = S[drawn];
  if (cur && cur.ts[0] <= vt) {
    ctx.globalAlpha = cur.o;
    drawPath(ctx, cur, indexAt(cur, vt));
    ctx.globalAlpha = 1;
  }
  const done = finished || (S.length && drawn >= S.length && vt >= timeline.writeEnd);
  if (showPen && !done) {
    const tip = tipAt(S, vt);
    if (tip) {
      const pose = poseAt(S, vt, poseState);
      drawPen(ctx, tip, pose, pageW || timeline.pageW || 100, pageH || timeline.pageH || 100, sc);
    }
  }
  return { strokesDrawn: Math.min(S.length, drawn + (cur && cur.ts[0] <= vt ? 1 : 0)) };
}

/** How far through writing (0..1) for status / scrub, based on writeEnd (not END hold). */
export function progressAt(timeline, vt) {
  if (!timeline || !timeline.writeEnd) return vt > 0 ? 1 : 0;
  return clamp(vt / timeline.writeEnd, 0, 1);
}


/**
 * What the pen is doing at virtual time ``vt`` — same {down,v} + stroke index
 * the friends app feeds PenSound.update / tap from sndTick.
 * ``v`` is on-screen speed in page mm per real second at ``speed``.
 */
export function motionAt(strokes, vt, speed = DEFAULT_SPEED) {
  if (!strokes || !strokes.length) return { i: -1, down: 0, v: 0 };
  const i = strokeAt(strokes, vt);
  const s = strokes[i];
  if (s && s.n > 1 && vt <= s.ts[s.n - 1]) {
    const u = indexAt(s, vt);
    const k = Math.max(0, Math.min(s.n - 2, Math.floor(u)));
    const v = (s.cum[k + 1] - s.cum[k]) / Math.max(1e-4, s.ts[k + 1] - s.ts[k]) * Number(speed);
    return { i, down: 1, v };
  }
  return { i: -1, down: 0, v: 0 };
}
