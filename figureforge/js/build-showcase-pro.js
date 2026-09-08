#!/usr/bin/env node
/* Chart atlas Pro v3 — advanced panels in the exact reference style:
 * radar, polar bars, polar density, bubble quadrant, volcano, z-score heatmap.
 * L-spines / circle frames, outward ticks, muted palette, no clutter. */
'use strict';
const fs = require('fs');

let seed = 20260919;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

const C = {
  blue: '#6fa8ce', teal: '#82cbbe', mauve: '#c3a3d1', red: '#e89b9b',
  gray: '#aab0b0', lgray: '#D9D9D9', ink: '#333333', tick: '#444444',
  purple: '#a79bd1', yellow: '#f0d48a', green: '#9ccb8f', orange: '#efb08c'
};

const f1 = v => Math.round(v * 10) / 10;
const txt = (x, y, t, size = 8, fill = C.tick, anchor = 'middle', w = 'normal', rot = 0) =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" font-family="Helvetica,Arial,sans-serif"${rot ? ` transform="rotate(${rot} ${f1(x)} ${f1(y)})"` : ''}>${t}</text>`;
const ln = (x1, y1, x2, y2, st = C.ink, sw = 0.8, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const rect = (x, y, w, h, fill, op = 1) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0.5, w))}" height="${f1(Math.max(0, h))}" fill="${fill}" fill-opacity="${op}"/>`;
const circle = (cx, cy, r, fill, op = 1, st = 'none', sw = 0) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;
const pth = (d, fill, op = 1, st = 'none', sw = 0) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;

function head(S, letter, title, x, y, w) {
  S.push(txt(x - 12, y, letter, 10, '#111', 'start', 'bold'));
  S.push(txt(x + w / 2, y, title, 10.5, C.ink, 'middle', 'bold'));
}
function axes(S, x, y, w, h, xt, yt, xf, yf) {
  S.push(ln(x, y, x, y + h, C.ink, 1));
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1));
  xt.forEach(t => {
    const tx = x + t * w;
    S.push(ln(tx, y + h, tx, y + h + 3, C.ink, 0.8));
    if (xf) if (xf) S.push(txt(tx, y + h + 11.5, xf(t), 8, C.tick));
  });
  yt.forEach(t => {
    const ty = y + h - t * h;
    S.push(ln(x - 3, ty, x, ty, C.ink, 0.8));
    if (yf) if (yf) S.push(txt(x - 5.5, ty + 2.5, yf(t), 8, C.tick, 'end'));
  });
}
/* polar frame: outer circle + light rings + spokes */
function polarFrame(S, cx, cy, R, rings, spokes) {
  for (let i = 1; i <= rings; i++)
    S.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R * i / rings)}" fill="none" stroke="#D5D5D5" stroke-width="0.7"/>`);
  for (let k = 0; k < spokes; k++) {
    const a = k * 360 / spokes - 90, rad = a * Math.PI / 180;
    S.push(ln(cx, cy, cx + R * Math.cos(rad), cy + R * Math.sin(rad), '#D5D5D5', 0.7));
  }
  S.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" fill="none" stroke="#888" stroke-width="1"/>`);
}
const mix = (a, b, t) => {
  const A = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16));
  const B = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// ── layout: 3 cols x 2 rows ──
const W = 1080, COLW = 355, PW = 315, PH = 218;
const ROWY = r => 74 + r * 292;
const X0 = col => 30 + col * COLW;
const S = [];

S.push(txt(16, 26, 'FigureForge chart atlas · pro', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Radial, quadrant, volcano and matrix panels in an original palette.', 10.5, '#777', 'start'));

/* ── a | radar ────────────────────────────────── */
{
  const cx = X0(0) + PW / 2, cy = ROWY(0) + PH / 2 + 4, R = 92;
  head(S, 'a', 'radar', X0(0), ROWY(0), PW);
  polarFrame(S, cx, cy, R, 3, 6);
  const axes6 = 6;
  const series = [[C.blue, [0.78, 0.45, 0.6, 0.4, 0.72, 0.5], '组别 A'],
                  [C.teal, [0.48, 0.72, 0.42, 0.65, 0.45, 0.7], '组别 B'],
                  [C.mauve, [0.6, 0.52, 0.75, 0.48, 0.58, 0.4], '组别 C']];
  for (let k = 0; k < axes6; k++) {
    const a = (k * 360 / axes6 - 90) * Math.PI / 180;
    S.push(txt(cx + (R + 12) * Math.cos(a), cy + (R + 12) * Math.sin(a) + 3, '指标 ' + (k + 1), 8, C.tick));
  }
  /* frameless legend in the empty top-right corner */
  series.forEach((s3, i) => {
    const ly3 = ROWY(0) + 16 + i * 16;
    S.push(circle(X0(0) + PW - 60, ly3, 3.2, s3[0]));
    S.push(txt(X0(0) + PW - 52, ly3 + 3, s3[2], 8.5, C.ink, 'start'));
  });
  series.forEach(([col, vs]) => {
    let p = '';
    vs.forEach((v, k) => {
      const a = (k * 360 / axes6 - 90) * Math.PI / 180;
      p += `${k ? 'L' : 'M'}${f1(cx + v * R * Math.cos(a))} ${f1(cy + v * R * Math.sin(a))}`;
    });
    S.push(pth(p + 'Z', col, 0.07, col, 1.3));
  });
}

/* ── b | polar bars ───────────────────────────── */
{
  const cx = X0(1) + PW / 2, cy = ROWY(0) + PH / 2 + 4, R = 92;
  head(S, 'b', 'polar bars', X0(1), ROWY(0), PW);
  polarFrame(S, cx, cy, R, 2, 24);
  const n = 24;
  for (let k = 0; k < n; k++) {
    const a0 = k * 360 / n - 90 + 1.6, a1 = (k + 1) * 360 / n - 90 - 1.6;
    const r0 = 8 + rnd() * 6, r1 = r0 + 14 + rnd() * 62;
    const p = (r, aDeg) => { const a = aDeg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
    S.push(pth(`M${f1(x0)} ${f1(y0)}A${f1(r1)} ${f1(r1)} 0 0 1 ${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}A${f1(r0)} ${f1(r0)} 0 0 0 ${f1(x3)} ${f1(y3)}Z`, mix('#c9e6e1', '#55a396', Math.min(1, (r1 - 20) / 62)), 1, '#FFFFFFAA', 0.6));
  }
}

/* ── c | polar density ────────────────────────── */
{
  const cx = X0(2) + PW / 2, cy = ROWY(0) + PH / 2 + 4, R = 92;
  head(S, 'c', 'polar density', X0(2), ROWY(0), PW);
  polarFrame(S, cx, cy, R, 2, 12);
  let p = '';
  for (let i = 0; i <= 120; i++) {
    const aDeg = i * 3 - 90, a = aDeg * Math.PI / 180;
    const r = R * (0.52 + 0.34 * Math.abs(Math.sin(a * 1.5 + 0.4)) * (0.6 + 0.4 * Math.sin(a * 3 + 1)));
    p += `${i ? 'L' : 'M'}${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  }
  S.push(pth(p + 'Z', C.red, 0.12, C.red, 1.6));
}

/* ── d | pathway quadrant ─────────────────────── */
{
  const x = X0(0), y = ROWY(1) + 8;
  head(S, 'd', 'pathway quadrant', x, ROWY(1), PW);
  const cats = [C.blue, C.orange, C.teal, C.purple];
  for (let k = 0; k < 30; k++) {
    const bx = x + (0.09 + rnd() * 0.82) * PW;
    const by = y + (0.09 + rnd() * 0.82) * PH;
    S.push(circle(bx, by, 3.5 + rnd() * 6.5, cats[Math.floor(rnd() * 4)], 0.5));
  }
  /* direct labels for 3 top hits (skill: prefer direct labels) */
  [[0.78, 0.86, '脂肪酸代谢', C.blue], [0.26, 0.16, '核糖体组装', C.teal], [0.66, 0.22, '抗原呈递', C.purple]].forEach(([fx, fy, name, col]) => {
    S.push(circle(x + fx * PW, y + (1 - fy) * PH, 6.5, col, 0.8, '#FFFFFF', 0.9));
    S.push(txt(x + fx * PW, y + (1 - fy) * PH - 11, name, 8.5, C.ink, 'middle', 'bold'));
  });
  S.push(ln(x + PW / 2, y, x + PW / 2, y + PH, '#BBB', 0.8, '3 2.4'));
  S.push(ln(x, y + PH / 2, x + PW, y + PH / 2, '#BBB', 0.8, '3 2.4'));
  /* quadrant corner labels sit in empty corners */
  S.push(txt(x + PW - 5, y + 11, '上调通路', 8.5, '#8a4a52', 'end', 'bold'));
  S.push(txt(x + 5, y + 11, '下调通路', 8.5, '#4d7a73', 'start', 'bold'));
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .5, 1], t => f1(t * 8), t => f1(t * 6 - 3));
  S.push(txt(x + PW / 2, y + PH + 26, '富集显著性 (-log₁₀P)', 9.5, C.ink, 'middle', 'bold'));
  S.push(txt(x - 10, y + PH / 2, '富集分数', 9.5, C.ink, 'middle', 'bold', -90));
}

/* ── e | volcano ──────────────────────────────── */
{
  const x = X0(1), y = ROWY(1) + 8;
  head(S, 'e', 'volcano', x, ROWY(1), PW);
  for (let k = 0; k < 130; k++) {
    const t = rnd();
    const vx = x + (0.5 + (rnd() - 0.5) * 0.62) * PW;
    const vy = y + (0.78 - Math.abs(vx - x - PW / 2) / PW * 1.2 + N(0, 0.1)) * PH;
    S.push(circle(vx, Math.min(y + PH - 3, Math.max(y + 4, vy)), 1.7, '#C9C9C9', 0.8));
  }
  for (let k = 0; k < 30; k++) {
    const left = rnd() > 0.5;
    const vx = x + (left ? 0.07 + rnd() * 0.18 : 0.75 + rnd() * 0.18) * PW;
    const vy = y + (0.06 + rnd() * 0.3) * PH;
    S.push(circle(vx, vy, 1.9, C.red, 0.9));
  }
  [0.22, 0.78].forEach(t => S.push(ln(x + t * PW, y, x + t * PW, y + PH, '#AAA', 0.8, '3 2.4')));
  S.push(ln(x, y + PH * 0.32, x + PW, y + PH * 0.32, '#AAA', 0.8, '3 2.4'));
  [['FASN', 0.16, 0.1], ['ACACA', 0.82, 0.07], ['SCD', 0.79, 0.28], ['CPT1A', 0.13, 0.34]].forEach(([g, fx, fy]) => {
    S.push(txt(x + fx * PW, y + fy * PH, g, 8.5, '#8a4a52', 'middle', 'bold'));
  });
  axes(S, x, y, PW, PH, [0, .5, 1], [0, .5, 1], t => f1(-3 + t * 6), t => Math.round(t * 6));
  S.push(txt(x + PW / 2, y + PH + 26, 'log₂ (Fold change)', 9.5, C.ink, 'middle', 'bold'));
  S.push(txt(x - 10, y + PH / 2, '-log₁₀ (P value)', 9.5, C.ink, 'middle', 'bold', -90));
}

/* ── f | z-score heatmap ──────────────────────── */
{
  const x = X0(2), y = ROWY(1) + 8;
  head(S, 'f', 'z-score', x, ROWY(1), PW);
  const rows = 6, cols = 9, cw = (PW - 46 - 30) / cols, ch = (PH - 12) / rows;
  const rowLabs = ['0 h', '6 h', '12 h', '24 h', '48 h', '72 h'];
  const colLabs = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];
  const zdiv = v => v >= 0 ? mix('#F5E7E3', '#d98080', Math.min(1, v / 2.2)) : mix('#EEF1F2', '#6fa8ce', Math.min(1, -v / 2.2));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = N(0, 1);
    S.push(rect(x + 34 + c * cw + 0.8, y + r * ch + 0.8, cw - 1.6, ch - 1.6, zdiv(v)));
  }
  rowLabs.forEach((s, r) => S.push(txt(x + 30, y + r * ch + ch / 2 + 3, s, 8, C.tick, 'end')));
  colLabs.forEach((s, c) => S.push(txt(x + 34 + c * cw + cw / 2, y + PH - 10 + 6, s, 7.5, C.tick, 'middle', 'normal', -38)));
  /* colorbar */
  const cbx = x + PW - 26, cbw = 7, cbh = PH * 0.62, cby = y + 4;
  for (let i = 0; i < cbh; i += 2) S.push(rect(cbx, cby + i, cbw, 2, zdiv(2.2 - i / cbh * 4.4)));
  S.push(`<rect x="${f1(cbx)}" y="${f1(cby)}" width="${cbw}" height="${f1(cbh)}" fill="none" stroke="#999" stroke-width="0.6"/>`);
  [[1, '2'], [0.5, '0'], [0, '-2']].forEach(([t, s]) => {
    S.push(ln(cbx + cbw, cby + cbh * t, cbx + cbw + 2.5, cby + cbh * t, C.ink, 0.7));
    S.push(txt(cbx + cbw + 4.5, cby + cbh * t + 2.5, s, 7.5, C.tick, 'start'));
  });
}

const H = 74 + 2 * 292 + 40;
fs.writeFileSync('../../assets/showcase-pro.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="100%" fill="#FFFFFF"/>${S.join('')}</svg>`);
console.log('showcase-pro.svg written', W, 'x', H);
