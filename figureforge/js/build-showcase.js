#!/usr/bin/env node
/* Chart atlas v4 — publication-grade mini-figures in the R-bioscience style:
 * richer panels (marginal densities, jitter, error bars, CI bands, legends),
 * chromatic pastel palette, axis titles with units, larger typography.
 * Seeded, reproducible. */
'use strict';
const fs = require('fs');

let seed = 20260910;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

/* chromatic pastel palette (from 科研配色 references) */
const C = {
  blue: '#3E7CB8', lblue: '#9DC3E0', teal: '#45B5AA', green: '#94CB5E',
  yellow: '#F5C242', orange: '#F08A4B', red: '#E26A6A', pink: '#F2A7B3',
  mauve: '#C77FA8', purple: '#9B83C9', gray: '#9A9A9A', ink: '#333333',
  tick: '#4A4A4A'
};
const F = 'Helvetica,Arial,sans-serif';

const f1 = v => Math.round(v * 10) / 10;
const f2 = v => Math.round(v * 100) / 100;
const txt = (x, y, t, size = 9, fill = C.tick, anchor = 'middle', w = 'normal', rot = 0) =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" font-family="${F}"${rot ? ` transform="rotate(${rot} ${f1(x)} ${f1(y)})"` : ''}>${t}</text>`;
const ln = (x1, y1, x2, y2, st = C.ink, sw = 1, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const rect = (x, y, w, h, fill, op = 1, rx = 0) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0.5, w))}" height="${f1(Math.max(0, h))}" fill="${fill}" fill-opacity="${op}"${rx ? ` rx="${rx}"` : ''}/>`;
const circle = (cx, cy, r, fill, op = 1, st = 'none', sw = 0) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;
const pth = (d, fill, op = 1, st = 'none', sw = 0) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;

const kde = (arr, bw, grid) =>
  grid.map(v => arr.reduce((s, p) => s + Math.exp(-((v - p) ** 2) / (2 * bw * bw)), 0) / (arr.length * bw * 2.5066));

/* L-axes + axis titles with units */
function axes(S, x, y, w, h, xt, yt, xf, yf, xlab, ylab) {
  S.push(ln(x, y, x, y + h, C.ink, 1.2));
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1.2));
  xt.forEach(t => {
    const tx = x + t * w;
    S.push(ln(tx, y + h, tx, y + h + 3.5, C.ink, 1));
    if (xf) S.push(txt(tx, y + h + 13, xf(t), 9, C.tick));
  });
  yt.forEach(t => {
    const ty = y + h - t * h;
    S.push(ln(x - 3.5, ty, x, ty, C.ink, 1));
    if (yf) S.push(txt(x - 6, ty + 3, yf(t), 9, C.tick, 'end'));
  });
  if (xlab) S.push(txt(x + w / 2, y + h + 27, xlab, 10.5, C.ink, 'middle', 'bold'));
  if (ylab) S.push(txt(x - 36, y + h / 2, ylab, 10.5, C.ink, 'middle', 'bold', -90));
}
function head(S, letter, title, x, y, w) {
  S.push(txt(x - 14, y - 3, letter, 11, '#111', 'start', 'bold'));
  S.push(txt(x + w / 2, y - 3, title, 11, C.ink, 'middle', 'bold'));
}
/* legend box: rounded, white, light border */
function legend(S, x, y, items, dotR = 3.2) {
  const w = 12 + Math.max(...items.map(i => i[1].length)) * 5.4 + 26, h = items.length * 13 + 7;
  S.push(rect(x, y, w, h, '#FFFFFF', 0.92, 4));
  S.push(`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="4" fill="none" stroke="#CCCCCC" stroke-width="0.8"/>`);
  items.forEach(([col, label], i) => {
    const ly = y + 13.5 + i * 13;
    if (col === '_') S.push(ln(x + 8, ly, x + 20, ly, '#777', 1.4, '4 3'));
    else S.push(circle(x + 14, ly, dotR, col));
    S.push(txt(x + 24, ly + 3, label, 9, C.ink, 'start'));
  });
  return { w, h };
}

// ── layout: 3 cols x 4 rows of rich panels ──
const W = 1080, COLW = 352, PW = 316, PH = 226;
const ROWY = r => 66 + r * 296;
const X0 = col => 24 + col * COLW;
const S = [];

S.push(txt(16, 26, 'FigureForge chart atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Twelve publication-grade panels with chromatic pastel palette.', 10.5, '#777', 'start'));

/* ── a | PCA + ellipses + marginals ───────────── */
{
  const x = X0(0) + 4, y = ROWY(0) + 28, w = PW - 30, h = PH - 46;
  head(S, 'a', 'PCA', x + 30, ROWY(0), PW);
  const groups = [[C.orange, -2.1, -1.0], [C.teal, 2.3, 1.3], [C.blue, 2.1, -1.6]];
  const pts = groups.map(([c, mx, my]) => [c, Array.from({ length: 12 }, () => [N(mx, 0.55), N(my, 0.5)])]);
  /* marginals */
  const gx = Array.from({ length: 50 }, (_, i) => -4.5 + i * 9 / 49);
  pts.forEach(([c, data]) => {
    const dx = kde(data.map(p => p[0]), 0.5, gx), dy = kde(data.map(p => p[1]), 0.45, gx);
    const m1 = Math.max(...dx), m2 = Math.max(...dy);
    let p1 = `M${f1(x)} ${f1(y - 2)}`;
    dx.forEach((v, j) => { p1 += `L${f1(x + (gx[j] + 4.5) / 9 * w)} ${f1(y - 2 - v / m1 * 22)}`; });
    S.push(pth(p1 + `L${f1(x + w)} ${f1(y - 2)}Z`, c, 0.35));
    let p2 = `M${f1(x + w + 2)} ${f1(y)}`;
    dy.forEach((v, j) => { p2 += `L${f1(x + w + 2 + v / m2 * 22)} ${f1(y + h - (dy[j] + 3) / 6 * h)}`; });
    S.push(pth(p2 + `L${f1(x + w + 2)} ${f1(y + h)}Z`, c, 0.35));
  });
  pts.forEach(([c, data]) => data.forEach(([px, py]) =>
    S.push(circle(x + (px + 4.5) / 9 * w, y + h - (py + 3) / 6 * h, 3.2, c, 0.85))));
  S.push(ln(x + w / 2, y, x + w / 2, y + h, '#AAA', 0.9, '4 3'));
  S.push(ln(x, y + h / 2, x + w, y + h / 2, '#AAA', 0.9, '4 3'));
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(-4.5 + t * 9), t => f1(-3 + t * 6), 'PC1 (35.6%)', 'PC2 (18.9%)');
  legend(S, x + w - 76, y + 6, groups.map(g => [g[0], 'Group ' + 'ABCD'[groups.indexOf(g)]]));
}

/* ── b | jointplot: fit + CI + marginals + stats ── */
{
  const x = X0(1) + 4, y = ROWY(0) + 28, w = PW - 30, h = PH - 46;
  head(S, 'b', 'jointplot', x + 30, ROWY(0), PW);
  const data = Array.from({ length: 90 }, () => { const gx2 = N(9.5, 3); return [gx2, 2.2 + gx2 * 1.05 + N(0, 1.6)]; });
  const gx = Array.from({ length: 40 }, (_, i) => 2 + i * 16 / 39);
  const dh = kde(data.map(p => p[0]), 1.1, gx), m1 = Math.max(...dh);
  let p1 = `M${f1(x)} ${f1(y - 2)}`;
  dh.forEach((v, j) => { p1 += `L${f1(x + (gx[j] - 2) / 16 * w)} ${f1(y - 2 - v / m1 * 20)}`; });
  S.push(pth(p1 + `L${f1(x + w)} ${f1(y - 2)}Z`, C.blue, 0.35));
  const gy = Array.from({ length: 40 }, (_, i) => 2 + i * 20 / 39);
  const dv = kde(data.map(p => p[1]), 1.2, gy), m2 = Math.max(...dv);
  let p2 = `M${f1(x + w + 2)} ${f1(y)}`;
  dv.forEach((v, j) => { p2 += `L${f1(x + w + 2 + v / m2 * 20)} ${f1(y + h - (gy[j] - 2) / 20 * h)}`; });
  S.push(pth(p2 + `L${f1(x + w + 2)} ${f1(y + h)}Z`, C.blue, 0.35));
  data.forEach(([px, py]) => S.push(circle(x + (px - 2) / 16 * w, y + h - (py - 2) / 20 * h, 3.4, C.green, 0.8)));
  /* fit + CI */
  const fit = t => 2.4 + t * 16 * 1.05 + 2 - 2;
  let up = '', dn = '';
  [0, .25, .5, .75, 1].forEach(t => {
    const yy = fit(t), sd = 1.9;
    up += `${t ? 'L' : 'M'}${f1(x + t * w)} ${f1(y + h - (yy + sd - 2) / 20 * h)}`;
    dn = `L${f1(x + t * w)} ${f1(y + h - (yy - sd - 2) / 20 * h)}` + dn;
  });
  S.push(pth(up + dn + 'Z', C.blue, 0.14));
  S.push(ln(x, y + h - (fit(0) - 2) / 20 * h, x + w, y + h - (fit(1) - 2) / 20 * h, C.blue, 1.8));
  S.push(txt(x + 8, y + 16, 'R² = 0.72', 9.5, C.ink, 'start', 'bold'));
  S.push(txt(x + 8, y + 28, 'p &lt; 0.001', 9.5, C.ink, 'start'));
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(2 + t * 16), t => f1(2 + t * 20), 'Glucose', 'Hemoglobin');
}

/* ── c | bar + half violin + jitter ───────────── */
{
  const x = X0(2) + 4, y = ROWY(0) + 6, w = PW - 30, h = PH - 20;
  head(S, 'c', 'bar + half-violin', x + 30, ROWY(0), PW);
  const cols = [C.teal, C.green, C.orange, C.blue];
  cols.forEach((col, i) => {
    const cx = x + w * (0.115 + i * 0.25), bw = 34;
    const m = [98, 102, 155, 34][i], sd = [9, 8, 20, 5][i];
    S.push(rect(cx - bw / 2, y + h - m / 210 * h, bw, m / 210 * h, col, 0.9));
    S.push(ln(cx - bw / 2 - 9, y + h - (m + sd) / 210 * h, cx + bw / 2 + 9, y + h - (m + sd) / 210 * h, C.ink, 1.1));
    S.push(ln(cx, y + h - (m + sd) / 210 * h, cx, y + h - Math.max(0, m - sd) / 210 * h, C.ink, 1.1));
    S.push(ln(cx - bw / 2 - 9, y + h - Math.max(0, m - sd) / 210 * h, cx + bw / 2 + 9, y + h - Math.max(0, m - sd) / 210 * h, C.ink, 1.1));
    const pts2 = Array.from({ length: 16 }, () => N(m, sd));
    const gy2 = Array.from({ length: 30 }, (_, j) => m - 3 * sd + j * 6 * sd / 29);
    const dk = kde(pts2, sd * 0.75, gy2), mx2 = Math.max(...dk);
    let p = `M${f1(cx + bw / 2 + 10)} ${f1(y + h - (gy2[0]) / 210 * h)}`;
    dk.forEach((v, j) => { p += `L${f1(cx + bw / 2 + 10 + v / mx2 * 24)} ${f1(y + h - gy2[j] / 210 * h)}`; });
    p += `L${f1(cx + bw / 2 + 10)} ${f1(y + h - gy2[29] / 210 * h)}Z`;
    S.push(pth(p, col, 0.45, col, 1));
    pts2.forEach(v => S.push(circle(cx + bw / 2 + 12 + rnd() * 8, y + h - v / 210 * h, 1.8, col, 0.85)));
  });
  axes(S, x, y, w, h, [0.115, .365, .615, .865], [0, .5, 1], t => ['OE-3', 'OE-5', 'OE-6', 'WT'][Math.round(t * 3.55)], t => f1(t * 210), 'Line', 'Linalool content');
}

/* ── d | violin + box + brackets ──────────────── */
{
  const x = X0(0) + 4, y = ROWY(1) + 6, w = PW - 30, h = PH - 20;
  head(S, 'd', 'violin + box', x + 30, ROWY(1), PW);
  const cols = [C.blue, C.lblue, C.teal, C.pink, C.red];
  const bracket = (x1, x2, yy, label) => {
    S.push(ln(x1, yy, x1, yy - 4, C.ink, 1)); S.push(ln(x2, yy, x2, yy - 4, C.ink, 1));
    S.push(ln(x1, yy, x2, yy, C.ink, 1));
    S.push(txt((x1 + x2) / 2, yy - 7, label, 9.5, C.ink, 'middle', 'bold'));
  };
  cols.forEach((col, i) => {
    const cx = x + w * (0.09 + i * 0.205);
    const data = Array.from({ length: 60 }, () => N(0, 0.85 + i * 0.13));
    const gy2 = Array.from({ length: 44 }, (_, j) => -3 + j * 6 / 43);
    const dk = kde(data, 0.6, gy2), mx2 = Math.max(...dk);
    let up = '', dn = '';
    dk.forEach((v, j) => {
      const yy = y + h - (gy2[j] + 3) / 6 * h;
      up += `${j ? 'L' : 'M'}${f1(cx + v / mx2 * 22)} ${f1(yy)}`;
      dn = `L${f1(cx - v / mx2 * 22)} ${f1(yy)}` + dn;
    });
    S.push(pth(`M${f1(cx)} ${f1(y + h - (gy2[0] + 3) / 6 * h)}` + up.replace(/^M/, 'L') + dn + 'Z', col, 0.4, col, 1.1));
    const bw = 16, q1 = -0.75, med = 0.02, q3 = 0.8;
    S.push(rect(cx - bw / 2, y + h - (q3 + 3) / 6 * h, bw, (q3 - q1) / 6 * h, '#FFFFFF', 0.95));
    S.push(`<rect x="${f1(cx - bw / 2)}" y="${f1(y + h - (q3 + 3) / 6 * h)}" width="${bw}" height="${f1((q3 - q1) / 6 * h)}" fill="none" stroke="#111" stroke-width="1.1"/>`);
    S.push(ln(cx - bw / 2, y + h - (med + 3) / 6 * h, cx + bw / 2, y + h - (med + 3) / 6 * h, '#111', 1.3));
  });
  bracket(x + w * 0.09, x + w * 0.91, y + 12, '***');
  axes(S, x, y, w, h, [0.09, .295, .5, .705, .91], [0, .5, 1], t => ['A', 'B', 'C', 'D', 'E'][Math.min(4, Math.round(t * 4.44))], t => f1(-3 + t * 6), 'Group', 'Expression');
}

/* ── e | scatter + fit + inset ────────────────── */
{
  const x = X0(1) + 4, y = ROWY(1) + 6, w = PW - 30, h = PH - 20;
  head(S, 'e', 'scatter + inset', x + 30, ROWY(1), PW);
  const data = Array.from({ length: 110 }, () => { const g = N(10, 3.4); return [g, g * 1.2 + N(0, 2.4)]; });
  data.forEach(([px, py]) => S.push(circle(x + px / 22 * w, y + h - py / 27 * h, 4.2, C.purple, 0.8)));
  S.push(ln(x + 2 / 22 * w, y + h - (2 * 1.2 + 1.4) / 27 * h, x + 20 / 22 * w, y + h - (20 * 1.2 + 1.4) / 27 * h, C.orange, 1.8));
  let up = '', dn = '';
  [0, .5, 1].forEach(t => {
    const yy = 2 + t * 20 * 1.2 + 1.4;
    up += `${t ? 'L' : 'M'}${f1(x + t * 20 / 22 * w)} ${f1(y + h - (yy + 2.6) / 27 * h)}`;
    dn = `L${f1(x + t * 20 / 22 * w)} ${f1(y + h - (yy - 2.6) / 27 * h)}` + dn;
  });
  S.push(pth(up + dn + 'Z', C.orange, 0.15));
  /* inset zoom (top-left) */
  const ix = x + 8, iy = y + 8, iw = 108, ih = 74;
  S.push(rect(ix, iy, iw, ih, '#FFFFFF', 0.95));
  S.push(`<rect x="${f1(ix)}" y="${f1(iy)}" width="${iw}" height="${ih}" fill="none" stroke="#999" stroke-width="0.9"/>`);
  data.slice(0, 45).forEach(([px, py]) => S.push(circle(ix + px / 22 * iw, iy + ih - (py - 2) / 12 * ih, 2.4, C.teal, 0.85)));
  S.push(ln(ix + 2 / 22 * iw, iy + ih - (2 * 1.2 - 2) / 12 * ih, ix + 14 / 22 * iw, iy + ih - (14 * 1.2 - 2) / 12 * ih, C.red, 1.2));
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(t * 22), t => f1(t * 27), 'Glucose', 'Hemoglobin (%)');
}

/* ── f | bubble + color/size legends ──────────── */
{
  const x = X0(2) + 4, y = ROWY(1) + 6, w = PW - 30, h = PH - 20;
  head(S, 'f', 'bubble + colorbar', x + 30, ROWY(1), PW);
  const ramp = t => {
    const stops = ['#E8A33D', '#F3E2C2', '#C9A0D8', '#8E5FB4'];
    const i = Math.min(2, Math.floor(t * 3)), tt = t * 3 - i;
    const hx = (s, k) => parseInt(s.substr(1 + k * 2, 2), 16);
    const a = stops[i], b = stops[i + 1];
    return '#' + [0, 1, 2].map(k => Math.round(hx(a, k) + (hx(b, k) - hx(a, k)) * tt).toString(16).padStart(2, '0')).join('');
  };
  const data = Array.from({ length: 34 }, () => [N(6.5, 3), N(230, 70), N(45, 20), N(180, 70)]);
  data.forEach(([gx2, gy2, age, gl]) => {
    const px2 = x + Math.min(19.2, Math.max(0.8, gx2)) / 20 * w;
    const py2 = y + h - Math.min(395, Math.max(30, gy2)) / 420 * h;
    S.push(circle(px2, py2, 3 + gl / 330 * 10, ramp(1 - (age - 20) / 65), 0.85, '#FFFFFF', 0.8));
  });
  /* color legend */
  const cbx = x + w - 66, cby = y + 8, cbw2 = 10, cbh = 64;
  for (let i = 0; i < cbh; i += 2) S.push(rect(cbx, cby + i, cbw2, 2, ramp(1 - i / cbh)));
  S.push(`<rect x="${f1(cbx)}" y="${f1(cby)}" width="${cbw2}" height="${cbh}" fill="none" stroke="#999" stroke-width="0.7"/>`);
  S.push(txt(cbx + cbw2 + 3, cby + 8, '80', 8.5, C.tick, 'start'));
  S.push(txt(cbx + cbw2 + 3, cby + cbh, '20', 8.5, C.tick, 'start'));
  S.push(txt(cbx + cbw2 / 2, cby - 5, 'Age', 9, C.ink, 'middle', 'bold'));
  /* size legend */
  const sx = cbx - 10;
  [[5, '56'], [8, '136'], [12, '330']].forEach(([r2, s2], i) => {
    S.push(circle(sx, cby + 14 + i * 22, r2, '#FFFFFF', 1, '#555', 0.9));
    S.push(txt(sx + 16, cby + 17 + i * 22, s2, 8.5, C.tick, 'start'));
  });
  S.push(txt(sx, cby - 5, 'Glucose', 9, C.ink, 'middle', 'bold'));
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(t * 20), t => f1(t * 420), 'Glycosylated hemoglobin (%)', 'Total cholesterol');
}

/* ── g | corr heatmap + stars ─────────────────── */
{
  const x = X0(0) + 4, y = ROWY(2) + 6, w = PW - 30, h = PH - 20;
  head(S, 'g', 'correlation', x + 30, ROWY(2), PW);
  const genes = ['CD3D', 'IL32', 'CD2', 'CCR7', 'LDHB', 'AQP3', 'S100A8', 'CD79A'];
  const cw = (w - 42) / 8, ch = h / 8;
  const div = v => {
    const s = v >= 0 ? ['#F7E8E6', '#EBA9A4', '#DB6E6E', '#C0392B'] : ['#EAF2F2', '#A9D4CE', '#5FA9A0', '#2E7D74'];
    const a = Math.abs(v), i = Math.min(3, Math.floor(a * 4));
    return s[i];
  };
  const M = [];
  for (let i = 0; i < 8; i++) { M.push([]); for (let j = 0; j < 8; j++) M[i].push(i === j ? 1 : f2(N(0, 0.45))); }
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if (i === j) continue;
    M[i][j] = M[j][i] = M[Math.max(i, j)][Math.min(i, j)] = M[Math.max(i, j)][Math.min(i, j)] || f2(N(0, 0.45));
  }
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const v = i === j ? 1 : M[i][j];
    S.push(rect(x + 42 + j * cw, y + i * ch, cw - 1.5, ch - 1.5, div(v)));
    if (Math.abs(v) > 0.55 && i !== j) S.push(txt(x + 42 + j * cw + cw / 2 - 0.7, y + i * ch + ch / 2 + 3, '**', 8, v > 0 ? '#7A1F1F' : '#1F4E4A', 'middle', 'bold'));
    if (i === j) S.push(txt(x + 42 + j * cw + cw / 2 - 0.7, y + i * ch + ch / 2 + 3, '1.0', 7.5, '#FFFFFF', 'middle', 'bold'));
  }
  genes.forEach((g, i) => {
    S.push(txt(x + 40, y + i * ch + ch / 2 + 3, g, 8.5, C.tick, 'end'));
    S.push(txt(x + 42 + i * cw + cw / 2 - 0.7, y + h + 13, g, 8.5, C.tick, 'middle', 'normal', -38));
  });
  /* colorbar */
  const cbx = x + w - 26, cby = y + 4, cbw2 = 9, cbh = h * 0.7;
  for (let i = 0; i < cbh; i += 2) {
    const v = 1 - i / cbh * 2;
    S.push(rect(cbx, cby + i, cbw2, 2, div(v)));
  }
  S.push(`<rect x="${f1(cbx)}" y="${f1(cby)}" width="${cbw2}" height="${f1(cbh)}" fill="none" stroke="#999" stroke-width="0.7"/>`);
  [[0, '1'], [.5, '0'], [1, '-1']].forEach(([t, s2]) => S.push(txt(cbx + cbw2 + 3, cby + cbh * t + 3, s2, 8, C.tick, 'start')));
}

/* ── h | dot heatmap + group colorbar ─────────── */
{
  const x = X0(1) + 4, y = ROWY(2) + 6, w = PW - 30, h = PH - 20;
  head(S, 'h', 'dot heatmap', x + 30, ROWY(2), PW);
  const colsTop = [C.mauve, C.green, C.blue, C.yellow, C.orange, C.red];
  const genes = ['LDHB', 'CCR7', 'CD3D', 'S100A8', 'IL32', 'CD2', 'AQP3', 'CD79A', 'GZMA', 'NKG7', 'GNLY', 'PF4'];
  const cell = 8, cw2 = (w - 104) / 12 - 2, ch2 = (h - 16) / 12;
  colsTop.forEach((c2, j) => S.push(rect(x + 46 + j * (cw2 + 2), y, cw2, 4, c2, 0.85)));
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
    const v = N(0, 1);
    const col = v >= 0 ? '#F5B04C' : '#9B83C9';
    const op = 0.25 + Math.min(0.7, Math.abs(v) * 0.5);
    S.push(rect(x + 46 + j * (cw2 + 2), y + 12 + i * ch2 + 1, cw2, ch2 - 2, '#EFEFEF'));
    S.push(rect(x + 46 + j * (cw2 + 2) + 0.5, y + 12 + i * ch2 + 1.5, cw2 - 1, ch2 - 3, col, op, 2.5));
  }
  genes.forEach((g, i) => S.push(txt(x + 42, y + 12 + i * ch2 + ch2 / 2 + 3, g, 8, C.tick, 'end')));
  /* z colorbar */
  const cbx = x + w - 24, cby = y + 16, cbw2 = 9, cbh = h * 0.6;
  for (let i = 0; i < cbh; i += 2) {
    const t = i / cbh;
    S.push(rect(cbx, cby + i, cbw2, 2, t < .5 ? '#9B83C9' : '#F5B04C', t < .5 ? 1 - t * 1.2 : (t - .5) * 2 * 0.9 + 0.15));
  }
  S.push(`<rect x="${f1(cbx)}" y="${f1(cby)}" width="${cbw2}" height="${f1(cbh)}" fill="none" stroke="#999" stroke-width="0.7"/>`);
  S.push(txt(cbx + cbw2 / 2, cby - 5, 'Z-score', 8.5, C.ink, 'middle', 'bold'));
}

/* ── i | volcano + labels ─────────────────────── */
{
  const x = X0(2) + 4, y = ROWY(2) + 6, w = PW - 30, h = PH - 20;
  head(S, 'i', 'volcano', x + 30, ROWY(2), PW);
  for (let k = 0; k < 210; k++) {
    const side = rnd();
    let lfc;
    if (side < 0.42) lfc = N(0, 0.55);
    else lfc = (side < 0.71 ? -1 : 1) * (0.9 + Math.abs(N(0, 0.75)));
    const pv = Math.min(8.5, Math.max(0.05, -Math.log10(1 - rnd()) * (0.35 + Math.abs(lfc) * 1.15)));
    const up2 = lfc > 0.9 && pv > 1.35, dn2 = lfc < -0.9 && pv > 1.35;
    S.push(circle(x + (lfc + 4.2) / 8.4 * w, y + h - pv / 9 * h, up2 || dn2 ? 2.6 : 2.1,
      up2 ? C.red : dn2 ? C.blue : '#C9C9C9', up2 || dn2 ? 0.9 : 0.75));
  }
  S.push(ln(x, y + h - 1.35 / 9 * h, x + w, y + h - 1.35 / 9 * h, '#888', 1, '4 3'));
  S.push(ln(x + (0.9 + 4.2) / 8.4 * w, y, x + (0.9 + 4.2) / 8.4 * w, y + h, '#888', 1, '4 3'));
  S.push(ln(x + (-0.9 + 4.2) / 8.4 * w, y, x + (-0.9 + 4.2) / 8.4 * w, y + h, '#888', 1, '4 3'));
  [['S100A9', 2.5, 7.9], ['MMP17', -2.2, 7.0], ['APOD', -3.1, 5.0], ['CXCL8', 1.6, 5.6]].forEach(([g, fx, fy]) => {
    S.push(txt(x + (fx + 4.2) / 8.4 * w, y + h - fy / 9 * h - 5, g, 8.5, '#7A1F1F', 'middle', 'bold'));
  });
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(-4.2 + t * 8.4), t => f1(t * 9), 'log₂ (Fold change)', '-log₁₀ (P value)');
}

/* ── j | ROC + legend + AUC ───────────────────── */
{
  const x = X0(0) + 4, y = ROWY(3) + 6, w = PW - 30, h = PH - 20;
  head(S, 'j', 'ROC', x + 30, ROWY(3), PW);
  S.push(ln(x, y + h, x + w, y, '#AAAAAA', 1.1, '5 4'));
  [['s100b', C.orange, 0.32, 0.73], ['ndka', C.purple, 0.45, 0.61]].forEach(([name, col, bend, auc], si) => {
    let p = `M${f1(x)} ${f1(y + h)}`;
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      const fpr = t;
      const tpr = Math.min(1, Math.pow(t, 0.45 - bend * 0.5) * (1 - bend * 0.12) + N(0, 0.012));
      p += `L${f1(x + fpr * w)} ${f1(y + h - Math.min(1, tpr) * h)}`;
    }
    S.push(pth(p, 'none', 1, col, 1.8));
  });
  legend(S, x + w - 92, y + 10, [[C.orange, 's100b'], [C.purple, 'ndka']]);
  S.push(txt(x + w - 96, y + h - 8, 's100b AUC = 0.731', 9, C.orange, 'end', 'bold'));
  S.push(txt(x + w - 96, y + h - 19, 'ndka AUC = 0.612', 9, C.purple, 'end', 'bold'));
  axes(S, x, y, w, h, [0, .25, .5, .75, 1], [0, .25, .5, .75, 1], t => f1(t), t => f2(t), '1 - Specificity', 'Sensitivity');
}

/* ── k | radar + legend ───────────────────────── */
{
  const cx = X0(1) + PW / 2 - 30, cy = ROWY(3) + PH / 2 + 6, R = 86;
  head(S, 'k', 'radar', X0(1) + 34, ROWY(3), PW);
  for (let i = 1; i <= 4; i++) S.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R * i / 4)}" fill="none" stroke="#D8D8D8" stroke-width="0.8"/>`);
  const axesN = 6;
  for (let k = 0; k < axesN; k++) {
    const a = (k * 360 / axesN - 90) * Math.PI / 180;
    S.push(ln(cx, cy, cx + R * Math.cos(a), cy + R * Math.sin(a), '#D8D8D8', 0.8));
  }
  const series = [
    [C.blue, [0.82, 0.55, 0.66, 0.48, 0.74, 0.58], 'Group A'],
    [C.teal, [0.58, 0.75, 0.52, 0.63, 0.5, 0.7], 'Group B'],
    [C.mauve, [0.66, 0.5, 0.72, 0.55, 0.64, 0.46], 'Group C']
  ];
  series.forEach(([col, vs]) => {
    let p = '';
    vs.forEach((v, k) => {
      const a = (k * 360 / axesN - 90) * Math.PI / 180;
      p += `${k ? 'L' : 'M'}${f1(cx + v * R * Math.cos(a))} ${f1(cy + v * R * Math.sin(a))}`;
    });
    S.push(pth(p + 'Z', col, 0.14, col, 1.4));
  });
  for (let k = 0; k < axesN; k++) {
    const a = (k * 360 / axesN - 90) * Math.PI / 180;
    S.push(txt(cx + (R + 12) * Math.cos(a), cy + (R + 12) * Math.sin(a) + 3, '指标 ' + (k + 1), 8.5, C.tick));
  }
  legend(S, cx + R + 16, cy - 30, series.map(s2 => [s2[0], s2[2]]));
}

/* ── l | multi-line + error bars + legend ─────── */
{
  const x = X0(2) + 4, y = ROWY(3) + 6, w = PW - 30, h = PH - 20;
  head(S, 'l', 'trends ± CI', x + 30, ROWY(3), PW);
  const series = [[C.red, 18, 3.2], [C.orange, 13, 2.8], [C.teal, 8, 2.2], [C.blue, 4, 1.8]];
  series.forEach(([col, m, s2], si) => {
    let p = '', up = '', dn = '';
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const v = m * (0.55 + 0.45 * t) + Math.sin(t * 6 + si) * 1.2 + N(0, 0.5);
      const px = x + t * w, py = y + h - Math.max(2, v) / 24 * h;
      p += `${i ? 'L' : 'M'}${f1(px)} ${f1(py)}`;
      up += `${i ? 'L' : 'M'}${f1(px)} ${f1(py - (s2 * (0.5 + t * 0.6)) / 24 * h)}`;
      dn = `L${f1(px)} ${f1(py + (s2 * (0.5 + t * 0.6)) / 24 * h)}` + dn;
      S.push(circle(px, py, 2.6, col, 1, '#FFFFFF', 0.8));
    }
    S.push(pth(up + dn + 'Z', col, 0.13));
    S.push(pth(p, 'none', 1, col, 1.7));
  });
  legend(S, x + w - 78, y + 6, series.map((s2, i) => [s2[0], '组别 ' + (i + 1)]));
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(t * 30), t => f1(t * 24), '时间 (天)', '测量值');
}

const H = 66 + 4 * 296 + 6;
fs.writeFileSync('../../assets/showcase.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="100%" fill="#FFFFFF"/>${S.join('')}</svg>`);
console.log('showcase.svg written', W, 'x', H);
