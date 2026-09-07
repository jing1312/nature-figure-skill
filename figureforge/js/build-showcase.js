#!/usr/bin/env node
/* Chart atlas v3 — replicates the reference chart-atlas style exactly:
 * L-shaped thin spines, outward ticks, muted palette, small panels in a
 * 4-col grid, bold letters + small centered lowercase titles, no grids,
 * no frames, no occlusion. Seeded, reproducible. */
'use strict';
const fs = require('fs');

let seed = 20260907;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

// ── muted reference palette ──
const C = {
  blue: '#4878A8', teal: '#79A79E', mauve: '#B0779F', red: '#BF5B5B',
  gray: '#8C8C8C', lgray: '#D9D9D9', ink: '#333333', tick: '#444444'
};

// ── svg helpers ──
const f1 = v => Math.round(v * 10) / 10;
const txt = (x, y, t, size = 8, fill = C.tick, anchor = 'middle', w = 'normal') =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" font-family="Helvetica,Arial,sans-serif">${t}</text>`;
const ln = (x1, y1, x2, y2, st = C.ink, sw = 0.8, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const rect = (x, y, w, h, fill, op = 1) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0.5, w))}" height="${f1(Math.max(0, h))}" fill="${fill}" fill-opacity="${op}"/>`;
const circle = (cx, cy, r, fill, op = 1) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}"/>`;
const pth = (d, fill, op = 1, st = 'none', sw = 0) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;

/* panel header: bold letter left + small centered lowercase title */
function head(S, letter, title, x, y, w) {
  S.push(txt(x - 12, y, letter, 10, '#111', 'start', 'bold'));
  S.push(txt(x + w / 2, y, title, 10.5, C.ink, 'middle'));
}

/* L-axes: left + bottom spines, outward ticks, small labels.
 * xt / yt are data-fraction arrays with formatters. */
function axes(S, x, y, w, h, xt, yt, xf, yf) {
  S.push(ln(x, y, x, y + h, C.ink, 1));
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1));
  xt.forEach(t => {
    const tx = x + t * w;
    S.push(ln(tx, y + h, tx, y + h + 3, C.ink, 0.8));
    if (xf) S.push(txt(tx, y + h + 11.5, xf(t), 8, C.tick));
  });
  yt.forEach(t => {
    const ty = y + h - t * h;
    S.push(ln(x - 3, ty, x, ty, C.ink, 0.8));
    if (yf) S.push(txt(x - 5.5, ty + 2.5, yf(t), 8, C.tick, 'end'));
  });
}

const kde = (arr, bw, grid) =>
  grid.map(v => arr.reduce((s, p) => s + Math.exp(-((v - p) ** 2) / (2 * bw * bw)), 0) / (arr.length * bw * 2.5066));

// ── layout (matches reference atlas pages) ──
const W = 1080, COLW = 262, PW = 205, PH = 132, ROWY = r => 74 + r * 196;
const X0 = col => 26 + col * COLW;
const S = [];

/* page header */
S.push(txt(16, 26, 'FigureForge chart atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Baseline, distribution and longitudinal panels in the reference style.', 10.5, '#777', 'start'));

/* ── a | grouped bar ───────────────────────────── */
{
  const x = X0(0), y = ROWY(0) + 8;
  head(S, 'a', 'grouped bar', x, ROWY(0), PW);
  const g = 6, vals = [[.78, .62], [.44, .66], [.7, .74], [.88, .66], [.95, .86], [.68, .81]];
  const bw = PW / (g * 2 + 1.6), gap = bw * 0.18;
  vals.forEach((v, i) => {
    const bx = x + 12 + i * (bw * 2 + gap * 2);
    S.push(rect(bx, y + PH - v[0] * PH, bw, v[0] * PH, C.blue));
    S.push(rect(bx + bw + gap, y + PH - v[1] * PH, bw, v[1] * PH, C.mauve));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── b | stacked bar ──────────────────────────── */
{
  const x = X0(1), y = ROWY(0) + 8;
  head(S, 'b', 'stacked bar', x, ROWY(0), PW);
  const g = 6, tot = [.92, .78, .88, .98, .94, .96], f1s = [.2, .18, .14, .24, .21, .23], f2s = [.3, .28, .26, .34, .33, .31];
  const bw = PW / (g + 1.2), slot = PW / g;
  for (let i = 0; i < g; i++) {
    const bx = x + 14 + i * slot;
    let cy = PH;
    S.push(rect(bx, y + cy - f1s[i] * PH, bw, f1s[i] * PH, C.lgray)); cy -= f1s[i] * PH;
    S.push(rect(bx, y + cy - f2s[i] * PH, bw, f2s[i] * PH, C.teal)); cy -= f2s[i] * PH;
    S.push(rect(bx, y + cy - (tot[i] - f1s[i] - f2s[i]) * PH, bw, (tot[i] - f1s[i] - f2s[i]) * PH, C.red));
  }
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── c | histogram ────────────────────────────── */
{
  const x = X0(2), y = ROWY(0) + 8;
  head(S, 'c', 'histogram', x, ROWY(0), PW);
  const data = Array.from({ length: 260 }, () => N(0.1, 0.42));
  const bins = 21, lo = -1.6, hi = 1.6, cnt = new Array(bins).fill(0);
  data.forEach(v => { const b = Math.floor((v - lo) / (hi - lo) * bins); if (b >= 0 && b < bins) cnt[b]++; });
  const mx = Math.max(...cnt), bw = PW / bins;
  cnt.forEach((n, i) => S.push(rect(x + i * bw + 0.5, y + PH - n / mx * PH, bw - 1.2, n / mx * PH, C.teal)));
  axes(S, x, y, PW, PH, [0, .25, .5, .75, 1], [0, .34, .67, 1], t => f1(lo + t * (hi - lo)), t => Math.round(t * mx));
}

/* ── d | violin ───────────────────────────────── */
{
  const x = X0(3), y = ROWY(0) + 8;
  head(S, 'd', 'violin', x, ROWY(0), PW);
  const cols = [C.blue, C.teal, C.mauve, C.red], mus = [-0.4, -0.1, 0.2, 0.5];
  const grid = Array.from({ length: 60 }, (_, i) => -1.5 + i * 3 / 59);
  mus.forEach((m, i) => {
    const data = Array.from({ length: 90 }, () => N(m, 0.3 + i * 0.05));
    const d = kde(data, 0.22, grid), mx = Math.max(...d);
    const cx = x + 28 + i * 50, half = 21;
    let up = '', dn = '';
    d.forEach((v, j) => { const yy = y + PH - (grid[j] + 1.5) / 3 * PH; up += `${j ? 'L' : 'M'}${f1(cx + v / mx * half)} ${f1(yy)}`; });
    for (let j = d.length - 1; j >= 0; j--) { const yy = y + PH - (grid[j] + 1.5) / 3 * PH; dn += `L${f1(cx - d[j] / mx * half)} ${f1(yy)}`; }
    S.push(pth(up + dn + 'Z', cols[i], 1, '#00000022', 0.6));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .5, 1], t => f1(-1.5 + t * 3), null);
}

/* ── e | box ──────────────────────────────────── */
{
  const x = X0(0), y = ROWY(1) + 8;
  head(S, 'e', 'box', x, ROWY(1), PW);
  const cols = [C.blue, C.teal, C.mauve, C.red];
  cols.forEach((col, i) => {
    const cx = x + 30 + i * 49, w = 24;
    const q1 = 0.32 + i * 0.09, med = q1 + 0.1, q3 = med + 0.11;
    const lo = q1 - 0.22 - rnd() * 0.06, hi = q3 + 0.22 + rnd() * 0.08;
    S.push(ln(cx, y + PH - lo * PH, cx, y + PH - q1 * PH, C.ink, 0.9));
    S.push(ln(cx, y + PH - q3 * PH, cx, y + PH - hi * PH, C.ink, 0.9));
    S.push(ln(cx - 5, y + PH - lo * PH, cx + 5, y + PH - lo * PH, C.ink, 0.9));
    S.push(ln(cx - 5, y + PH - hi * PH, cx + 5, y + PH - hi * PH, C.ink, 0.9));
    S.push(rect(cx - w / 2, y + PH - q3 * PH, w, (q3 - q1) * PH, col, 1));
    S.push(ln(cx - w / 2, y + PH - med * PH, cx + w / 2, y + PH - med * PH, '#111', 1.2));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── f | ridgeline ────────────────────────────── */
{
  const x = X0(1), y = ROWY(1) + 8;
  head(S, 'f', 'ridgeline', x, ROWY(1), PW);
  const cols = [C.blue, C.teal, C.mauve, C.red];
  const grid = Array.from({ length: 80 }, (_, i) => -2 + i * 4 / 79);
  const rh = PH / 4.1;
  cols.forEach((col, i) => {
    const data = Array.from({ length: 90 }, () => N(0.5 - i * 0.28, 0.5));
    const d = kde(data, 0.35, grid), mx = Math.max(...d);
    const base = y + PH - i * rh * 0.92 - rh * 0.55;
    let p = `M${f1(x)} ${f1(base)}`;
    d.forEach((v, j) => { p += `L${f1(x + j / 79 * PW)} ${f1(base - v / mx * rh * 0.95)}`; });
    p += `L${f1(x + PW)} ${f1(base)}Z`;
    S.push(pth(p, col, 0.85, '#FFFFFF88', 0.7));
    S.push(ln(x, base, x + PW, base, '#00000033', 0.6));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [], t => f1(-2 + t * 4), t => t);
}

/* ── g | multi-series lines ───────────────────── */
{
  const x = X0(2), y = ROWY(1) + 8;
  head(S, 'g', 'multi-series', x, ROWY(1), PW);
  const series = [[C.red, .9, .16], [C.mauve, .78, .2], [C.teal, .5, .14], [C.blue, .28, .18]];
  series.forEach(([col, m, s]) => {
    const n = 40;
    let p = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const v = m - m * 0.55 * Math.exp(-((t - 0.32) ** 2) / 0.05) + N(0, s * 0.35);
      p += `${i ? 'L' : 'M'}${f1(x + t * PW)} ${f1(y + PH - Math.max(0.02, Math.min(0.98, v)) * PH)}`;
    }
    S.push(pth(p, 'none', 1, col, 1.4));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── h | ribbon ───────────────────────────────── */
{
  const x = X0(3), y = ROWY(1) + 8;
  head(S, 'h', 'ribbon', x, ROWY(1), PW);
  const n = 40, up = [], dn = [], mid = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const v = 0.12 + 0.75 / (1 + Math.exp(-(t - 0.45) * 9)) + N(0, 0.02);
    mid.push([t, v]); up.push([t, v + 0.05 + 0.02 * Math.sin(t * 9)]); dn.push([t, v - 0.05 - 0.02 * Math.cos(t * 7)]);
  }
  let p = 'M' + up.map(([t, v]) => `${f1(x + t * PW)} ${f1(y + PH - v * PH)}`).join('L');
  p += 'L' + dn.reverse().map(([t, v]) => `${f1(x + t * PW)} ${f1(y + PH - v * PH)}`).join('L') + 'Z';
  S.push(pth(p, C.red, 0.16));
  let lp = 'M' + mid.map(([t, v]) => `${f1(x + t * PW)} ${f1(y + PH - v * PH)}`).join('L');
  S.push(pth(lp, 'none', 1, C.red, 1.4));
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── i | event line ───────────────────────────── */
{
  const x = X0(0), y = ROWY(2) + 8;
  head(S, 'i', 'event', x, ROWY(2), PW);
  const evX = x + PW * 0.62;
  const series = [[C.red, .42, .028], [C.teal, .3, .03], [C.gray, .12, .026]];
  series.forEach(([col, m, s]) => {
    const n = 44; let p = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const v = m + m * 0.7 * t + N(0, s);
      p += `${i ? 'L' : 'M'}${f1(x + t * PW)} ${f1(y + PH - Math.max(0.02, Math.min(0.97, v)) * PH)}`;
    }
    S.push(pth(p, 'none', 1, col, 1.4));
  });
  S.push(ln(evX, y, evX, y + PH, '#666', 0.9, '3 2.4'));
  S.push(txt(evX + 4, y + 9, 'event', 8, '#555', 'start'));
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── j | individual traces ────────────────────── */
{
  const x = X0(1), y = ROWY(2) + 8;
  head(S, 'j', 'individual traces', x, ROWY(2), PW);
  for (let k = 0; k < 34; k++) {
    const a = rnd() * 0.6 + 0.15, b = a + 0.35 + rnd() * 0.2;
    let p = '';
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const v = a + (b - a) * t + N(0, 0.05);
      p += `${i ? 'L' : 'M'}${f1(x + t * PW)} ${f1(y + PH - Math.max(0.02, Math.min(0.98, v)) * PH)}`;
    }
    S.push(pth(p, 'none', 1, C.blue, 0.7));
  }
  S.push(`<path d="M${f1(x)} ${f1(y + PH - 0.28 * PH)}L${f1(x + PW)} ${f1(y + PH - 0.82 * PH)}" stroke="#1F4E79" stroke-width="2.2" fill="none"/>`);
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── k | point range ──────────────────────────── */
{
  const x = X0(2), y = ROWY(2) + 8;
  head(S, 'k', 'point range', x, ROWY(2), PW);
  const n = 7, slot = PW / n;
  for (let i = 0; i < n; i++) {
    const cx = x + slot * (i + 0.5);
    const m = 0.45 + rnd() * 0.35, e = 0.05 + rnd() * 0.06;
    S.push(ln(cx, y + PH - (m - e) * PH, cx, y + PH - (m + e) * PH, '#111', 1));
    S.push(ln(cx - 4, y + PH - (m - e) * PH, cx + 4, y + PH - (m - e) * PH, '#111', 1));
    S.push(ln(cx - 4, y + PH - (m + e) * PH, cx + 4, y + PH - (m + e) * PH, '#111', 1));
    S.push(circle(cx, y + PH - m * PH, 2.6, C.teal));
  }
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .25, .5, .75, 1], t => f1(t), t => f1(t));
}

/* ── l | slope ────────────────────────────────── */
{
  const x = X0(3), y = ROWY(2) + 8;
  head(S, 'l', 'slope', x, ROWY(2), PW);
  const xl = x + PW * 0.18, xr = x + PW * 0.82;
  for (let k = 0; k < 9; k++) {
    const yl = y + PH * (0.12 + rnd() * 0.7), yr = y + PH * (0.1 + rnd() * 0.72);
    S.push(ln(xl, yl, xr, yr, '#999', 0.8));
    S.push(circle(xl, yl, 2.4, C.gray));
    S.push(circle(xr, yr, 2.4, C.red));
  }
  S.push(txt(xl, y + PH + 12.5, 'pre', 8.5, C.ink));
  S.push(txt(xr, y + PH + 12.5, 'post', 8.5, C.ink));
}

/* footer */
S.push(txt(W / 2, 74 + 3 * 196 + 40, 'Seeded synthetic data · FigureForge reference style', 9, '#999'));

const H = 74 + 3 * 196 + 56;
fs.writeFileSync('../../assets/showcase.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="100%" fill="#FFFFFF"/>${S.join('')}</svg>`);
console.log('showcase.svg written', W, 'x', H);
