#!/usr/bin/env node
/* Chart atlas (v2): 12 ggplot-grade panels — white bg, fine axes, dense seeded
 * data, NPG pastels, alpha blending. Same visual language as build-showcase-bio. */
'use strict';
const fs = require('fs');
const path = require('path');

let seed = 20260908;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const rr = (a, b) => a + rnd() * (b - a);
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

function h2r(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); }

// NPG palette
const C = { red: '#E64B35', blue: '#4DBBD5', teal: '#00A087', navy: '#3C5488', salmon: '#F39B7F', grayblue: '#8491B4', mint: '#91D1C2', darkred: '#DC0000', brown: '#7E6148', gray: '#BFBFBF' };

const f1 = v => (Math.round(v * 10) / 10);
const txt = (x, y, t, size = 7, fill = '#333', anchor = 'middle', w = 'normal', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" ${extra}>${t}</text>`;
const ln = (x1, y1, x2, y2, st = '#333', sw = 0.8, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const rrect = (x, y, w, h, r, fill, stroke = 'none', sw = 0, op = 1) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${r}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle = (cx, cy, r, fill, stroke = 'none', sw = 0, op = 1) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
const poly = (pts, fill, stroke = 'none', sw = 0, op = 1, dash = '') =>
  `<polygon points="${pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const pline = (pts, st, sw = 1, dash = '') =>
  `<polyline points="${pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="none" stroke="${st}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;

// ── ggplot-style frame: panel origin = bottom-left ──
function frame(S, x, y, w, h, xt, yt, xlab, ylab) {
  xt.forEach(t => S.push(ln(x + w * t, y - h, x + w * t, y, '#E8E8E8', 0.6)));
  yt.forEach(t => S.push(ln(x, y - h * t, x + w, y - h * t, '#E8E8E8', 0.6)));
  S.push(ln(x, y, x + w, y, '#4D4D4D', 0.9));
  S.push(ln(x, y, x, y - h, '#4D4D4D', 0.9));
  xt.forEach(t => S.push(ln(x + w * t, y, x + w * t, y + 2.4, '#4D4D4D', 0.8)));
  yt.forEach(t => S.push(ln(x, y - h * t, x - 2.4, y - h * t, '#4D4D4D', 0.8)));
  xt.forEach((t, i) => S.push(txt(x + w * t, y + 9, xlab[i], 6.3, '#555')));
  yt.forEach((t, i) => S.push(txt(x - 4.5, y - h * t + 2, ylab[i], 6.3, '#555', 'end')));
}

const PW = 550, PH = 285, COLX = [40, 630], ROWY = r => 62 + r * 301;
const S = [];
S.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1880" font-family="Helvetica, Arial, sans-serif">`);
S.push(rrect(0, 0, 1200, 1880, 0, '#FFFFFF'));
S.push(txt(40, 34, 'FigureForge · Chart atlas — publication-grade charts', 16, '#1a1a1a', 'start', 'bold'));
S.push(txt(1160, 34, '12 chart archetypes · NPG-style palettes', 9, '#888', 'end'));

function frame2(ox, oy, letter, title) {
  S.push(txt(ox - 8, oy - 7, letter, 14, '#111', 'start', 'bold'));
  S.push(txt(ox + PW / 2, oy - 6, title, 9, '#555', 'middle', 'bold'));
}
function kde(arr, bw2, grid) {
  return grid.map(v => arr.reduce((s, p) => s + Math.exp(-((v - p) ** 2) / (2 * bw2)), 0) / (arr.length * bw2 * 2.5066));
}

/* ═══ a · histogram + KDE ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(0);
  frame2(ox, oy, 'a', 'Distribution · histogram with kernel density');
  const X = ox + 55, Y = oy + 195, W = 400, H = 175;
  const g1 = Array.from({ length: 70 }, () => N(24, 5.5));
  const g2 = Array.from({ length: 70 }, () => N(34, 4.2));
  const bins = (arr) => { const b = Array(12).fill(0); arr.forEach(v => { const i = Math.floor((v - 8) / 40 * 12); if (i >= 0 && i < 12) b[i]++; }); return b; };
  const b1 = bins(g1), b2 = bins(g2), mx = 22;
  const bw = W / 12;
  b1.forEach((v, i) => S.push(rrect(X + i * bw + 1.2, Y - v / mx * H, bw - 2.4, v / mx * H, 1.2, C.navy, 'none', 0, 0.5)));
  b2.forEach((v, i) => S.push(rrect(X + i * bw + 1.2, Y - v / mx * H, bw - 2.4, v / mx * H, 1.2, C.red, 'none', 0, 0.5)));
  const grid = Array.from({ length: 60 }, (_, i) => 8 + i / 59 * 40);
  const d1 = kde(g1, 2.6, grid), d2 = kde(g2, 2.6, grid);
  const dmax = Math.max(...d1, ...d2);
  const scale = d => d.map((v, i) => [X + i / (grid.length - 1) * W, Y - v / dmax * 60]);
  S.push(pline(scale(d1), C.navy, 1.6));
  S.push(pline(scale(d2), C.red, 1.6));
  g1.slice(0, 40).forEach(v => S.push(ln(X + (v - 8) / 40 * W, Y + 2, X + (v - 8) / 40 * W, Y + 5.5, C.navy, 0.5, '')));
  g2.slice(0, 40).forEach(v => S.push(ln(X + (v - 8) / 40 * W, Y + 6.5, X + (v - 8) / 40 * W, Y + 10, C.red, 0.5, '')));
  frame(S, X, Y, W, H, [0, .25, .5, .75, 1], [0, .5, 1], ['8', '18', '28', '38', '48'], ['0', '11', '22']);
  S.push(txt(ox + 255, oy + 232, 'Expression level (TPM)', 7.5, '#333'));
  S.push(txt(ox + 18, Y - H / 2, 'Count', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 18) + ' ' + f1(Y - H / 2) + ')"'));
  S.push(rrect(ox + 392, oy + 28, 9, 9, 1, C.navy, 'none', 0, 0.6)); S.push(txt(ox + 406, oy + 35.5, 'Control', 7, '#333', 'start'));
  S.push(rrect(ox + 392, oy + 43, 9, 9, 1, C.red, 'none', 0, 0.6)); S.push(txt(ox + 406, oy + 50.5, 'Treated', 7, '#333', 'start'));
})();

/* ═══ b · raincloud: half-violin + box + jitter ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(0);
  frame2(ox, oy, 'b', 'Raincloud · half-violin, box and raw points');
  const X = ox + 70, Y = oy + 200, W = 380, H = 180;
  const groups = ['WT', 'HET', 'KO'];
  const cols = [C.grayblue, C.teal, C.salmon];
  const data = groups.map((g, gi) => Array.from({ length: 46 }, () => N(28 - gi * 6.5, 4.5 + gi * 1.3)).map(v => Math.max(6, Math.min(50, v))));
  const Yv = v => Y - (v - 5) / 45 * H;
  const gw = W / 3;
  data.forEach((arr, gi) => {
    const cx = X + gw * gi + gw / 2;
    const grid = Array.from({ length: 40 }, (_, i) => 5 + i / 39 * 45);
    const dd = kde(arr, 2.8, grid); const dmax = Math.max(...dd);
    const vs = grid.map((v, i) => [cx - 3 - dd[i] / dmax * 26, Yv(v)]);
    S.push(poly([[cx - 3, Yv(5)], ...vs, [cx - 3, Yv(50)]], cols[gi], 'none', 0, 0.45));
    S.push(pline(vs, cols[gi], 1));
    const srt = [...arr].sort((a, b) => a - b);
    const q = p => srt[Math.floor(p * (srt.length - 1))];
    const bx = cx - 1, bwid = 11;
    S.push(ln(bx, Yv(q(.02)), bx, Yv(q(.98)), '#555', 0.9));
    S.push(rrect(bx - bwid / 2, Yv(q(.75)), bwid, Yv(q(.25)) - Yv(q(.75)), 1.5, '#FFFFFF', cols[gi], 1.4));
    S.push(ln(bx - bwid / 2, Yv(q(.5)), bx + bwid / 2, Yv(q(.5)), cols[gi], 1.8));
    arr.forEach(v => S.push(circle(cx + 7 + rnd() * 22, Yv(v) + rr(-1, 1), 1.6, cols[gi], 'none', 0, 0.55)));
  });
  frame(S, X, Y, W, H, [0, 1, 2], [0, .5, 1], groups, ['10', '27', '45']);
  S.push(txt(ox + 260, oy + 236, 'Plasma cytokine (pg/mL)', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'Concentration', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
})();

/* ═══ c · bars + error bars + sig brackets + points ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(1);
  frame2(ox, oy, 'c', 'Bar chart · error bars, replicates and brackets');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const groups = ['Vehicle', 'Low', 'Mid', 'High'];
  const mus = [100, 78, 52, 41], cols = [C.gray, C.blue, C.teal, C.navy];
  const bw = W / 4 * 0.52;
  const pts = mus.map((m, i) => Array.from({ length: 8 }, () => N(m, 6 + i)));
  const mx = 138;
  pts.forEach((arr, i) => {
    const cx = X + W / 4 * i + W / 8;
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    const sd = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
    S.push(rrect(cx - bw / 2, Y - mean / mx * H, bw, mean / mx * H, 1.5, cols[i], 'none', 0, 0.88));
    const e = sd / Math.sqrt(arr.length) * 1.4;
    S.push(ln(cx, Y - (mean + e) / mx * H, cx, Y - (mean - e) / mx * H, '#333', 1));
    S.push(ln(cx - 4, Y - (mean + e) / mx * H, cx + 4, Y - (mean + e) / mx * H, '#333', 1));
    S.push(ln(cx - 4, Y - (mean - e) / mx * H, cx + 4, Y - (mean - e) / mx * H, '#333', 1));
    arr.forEach(v => S.push(circle(cx + bw / 2 + 5 + rnd() * 16, Y - v / mx * H + rr(-1, 1), 1.5, '#555', 'none', 0, 0.5)));
  });
  const br = (x1, x2, yy, label) => {
    S.push(ln(x1, yy, x1, yy - 4, '#333', 0.9)); S.push(ln(x1, yy, x2, yy, '#333', 0.9)); S.push(ln(x2, yy, x2, yy - 4, '#333', 0.9));
    S.push(txt((x1 + x2) / 2, yy - 4, label, 7.5, '#111', 'middle', 'bold'));
  };
  const cx4 = i => X + W / 4 * i + W / 8;
  br(cx4(0), cx4(1), Y - 108 / mx * H - 14, '**');
  br(cx4(0), cx4(3), Y - 118 / mx * H - 26, 'p = 2.1e-5');
  frame(S, X, Y, W, H, [0, 1, 2, 3], [0, .5, 1], groups, ['0', '62', '125']);
  S.push(txt(ox + 255, oy + 236, 'Dose group', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'Tumor volume (mm³)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
})();

/* ═══ d · scatter + fits + CI ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(1);
  frame2(ox, oy, 'd', 'Correlation · scatter with fitted CI bands');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const mk = (n, f) => Array.from({ length: n }, () => { const xx = rr(10, 90); return [xx, Math.max(5, Math.min(95, f(xx) + N(0, 9)))]; });
  const A = mk(46, x => 20 + x * 0.62), B = mk(46, x => 55 - x * 0.5);
  const Xv = v => X + v / 100 * W, Yv = v => Y - v / 100 * H;
  const band = (slope, icept, col) => {
    const lo = [], hi = [];
    for (let xv = 12; xv <= 88; xv += 4) {
      const yh = icept + slope * xv, se = 4.5 + Math.abs(xv - 50) * 0.12;
      lo.push([Xv(xv), Yv(Math.max(0, yh - se))]); hi.push([Xv(xv), Yv(Math.min(100, yh + se))]);
    }
    S.push(poly([...lo, ...hi.reverse()], col, 'none', 0, 0.16));
  };
  band(0.62, 20, C.blue); band(-0.5, 55, C.red);
  const fit = (arr, slope, icept, col) => {
    arr.forEach(p => S.push(circle(Xv(p[0]), Yv(p[1]), 1.8, col, 'none', 0, 0.5)));
    S.push(ln(Xv(10), Yv(icept + slope * 10), Xv(90), Yv(icept + slope * 90), col, 1.6));
  };
  fit(A, 0.62, 20, C.blue); fit(B, -0.5, 55, C.red);
  frame(S, X, Y, W, H, [0, .25, .5, .75, 1], [0, .5, 1], ['0', '25', '50', '75', '100'], ['0', '50', '100']);
  S.push(txt(ox + 255, oy + 236, 'Radiographic score', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'Biomarker (ng/mL)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  S.push(rrect(ox + 360, oy + 28, 9, 9, 1, C.blue, 'none', 0, 0.6)); S.push(txt(ox + 374, oy + 35.5, 'Responder (r = 0.81)', 7, '#333', 'start'));
  S.push(rrect(ox + 360, oy + 43, 9, 9, 1, C.red, 'none', 0, 0.6)); S.push(txt(ox + 374, oy + 50.5, 'Non-responder (r = -0.66)', 7, '#333', 'start'));
})();

/* ═══ e · KM survival + censor ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(2);
  frame2(ox, oy, 'e', 'Survival · Kaplan–Meier with censoring marks');
  const X = ox + 55, Y = oy + 175, W = 400, H = 155;
  const Xv = m => X + m / 36 * W, Yv = s => Y - s / 100 * H;
  const step = (drops, col) => {
    let s = 100; const pts = [[Xv(0), Yv(100)]];
    for (let m = 0; m <= 36; m += 3) {
      if (drops.includes(m)) { const d = 8 + rnd() * 9; pts.push([Xv(m), Yv(s - d)]); s -= d; }
      else pts.push([Xv(m), Yv(s)]);
      if (drops.includes(m) && rnd() > .4) {
        S.push(ln(Xv(m) - 2, Yv(s) - 2, Xv(m) + 2, Yv(s) + 2, col, 0.9), ln(Xv(m) - 2, Yv(s) + 2, Xv(m) + 2, Yv(s) - 2, col, 0.9));
      }
    }
    S.push(pline(pts, col, 1.8));
    const lo = pts.map(p => [p[0], Math.min(Yv(0), p[1] + 14)]);
    S.push(poly([...pts, ...lo.reverse()], col, 'none', 0, 0.12));
  };
  step([3, 9, 15, 21, 30], C.teal);
  step([6, 12, 18, 24], C.navy);
  frame(S, X, Y, W, H, [0, 1 / 3, 2 / 3, 1], [0, .5, 1], ['0', '12', '24', '36'], ['0', '50', '100']);
  S.push(txt(ox + 255, oy + 212, 'Months from randomization', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'Overall survival (%)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  S.push(ln(ox + 380, oy + 30, ox + 404, oy + 30, C.teal, 1.8)); S.push(txt(ox + 409, oy + 33, 'Combo (n = 54)', 7, '#333', 'start'));
  S.push(ln(ox + 380, oy + 45, ox + 404, oy + 45, C.navy, 1.8)); S.push(txt(ox + 409, oy + 48, 'Mono (n = 52)', 7, '#333', 'start'));
  S.push(txt(ox + 409, oy + 66, 'log-rank p = 0.008', 7, '#555', 'start'));
})();

/* ═══ f · volcano ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(2);
  frame2(ox, oy, 'f', 'Volcano plot · differential expression');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const Xv = v => X + (v + 5) / 10 * W, Yv = v => Y - v / 9 * H;
  for (let i = 0; i < 340; i++) {
    const fc = Math.abs(N(0, 1.7));
    const pv = Math.max(0, -Math.log10(rnd()) * 1.75 - Math.abs(fc) * 0.42);
    const up = rnd() > .5;
    const sig = pv > 2.2 && fc > 1;
    const col = sig ? (up ? C.red : C.teal) : '#C9CDD4';
    S.push(circle(Xv(up ? fc : -fc), Yv(Math.min(8.8, pv)), sig ? 2 : 1.5, col, 'none', 0, sig ? 0.85 : 0.6));
  }
  S.push(ln(X, Yv(2.2), X + W, Yv(2.2), '#999', 0.8, '3 3'));
  S.push(ln(Xv(1), Y, Xv(1), Y - H, '#999', 0.8, '3 3'));
  S.push(ln(Xv(-1), Y, Xv(-1), Y - H, '#999', 0.8, '3 3'));
  [['S100A9', 2.6, 6.6], ['IL1B', -3.2, 5.9], ['NFKBIA', 2.1, 4.8], ['CXCL8', -2.4, 4.4], ['TGFBR1', 1.4, 3.4]].forEach(([g, x, y]) =>
    S.push(txt(Xv(x), Yv(y) - 3, g, 5.8, '#333', 'middle', 'bold')));
  frame(S, X, Y, W, H, [0, .5, 1], [0, .5, 1], ['-5', '0', '5'], ['0', '4.5', '9']);
  S.push(txt(ox + 255, oy + 236, 'log₂ fold change', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, '-log₁₀ (adj. P)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  S.push(circle(ox + 408, oy + 30, 2, C.red)); S.push(txt(ox + 415, oy + 33, 'Up (142)', 7, '#333', 'start'));
  S.push(circle(ox + 408, oy + 45, 2, C.teal)); S.push(txt(ox + 415, oy + 48, 'Down (96)', 7, '#333', 'start'));
  S.push(circle(ox + 408, oy + 60, 2, '#C9CDD4')); S.push(txt(ox + 415, oy + 63, 'NS', 7, '#333', 'start'));
})();

/* ═══ g · forest ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(3);
  frame2(ox, oy, 'g', 'Forest plot · subgroup hazard ratios');
  const X = ox + 150, Y = oy + 190, W = 270, H = 160;
  const Xv = v => X + (Math.log10(v) + 1.1) / 2.2 * W;
  S.push(ln(Xv(1), Y + 4, Xv(1), Y - H, '#999', 0.9, '4 3'));
  const rows = ['Age ≥ 65', 'Age &lt; 65', 'Male', 'Female', 'EGFR mut', 'EGFR wt', 'Stage III', 'Stage IV'];
  const hrs = [[0.62, 0.41, 0.94], [0.58, 0.36, 0.9], [0.71, 0.5, 1.02], [0.55, 0.38, 0.81], [0.42, 0.27, 0.66], [0.78, 0.55, 1.1], [0.69, 0.44, 1.05], [0.61, 0.45, 0.83]];
  const rh = H / 9;
  rows.forEach((r, i) => {
    const yy = Y - H + rh * (i + 0.6);
    S.push(txt(ox + 10, yy + 2, r, 6.8, '#333', 'start'));
    const [m, lo, hi] = hrs[i];
    S.push(ln(Xv(lo), yy, Xv(hi), yy, '#4D4D4D', 1));
    S.push(ln(Xv(lo), yy - 2.5, Xv(lo), yy + 2.5, '#4D4D4D', 1));
    S.push(ln(Xv(hi), yy - 2.5, Xv(hi), yy + 2.5, '#4D4D4D', 1));
    S.push(circle(Xv(m), yy, 3, C.teal, '#FFFFFF', 0.8));
    S.push(txt(ox + 435, yy + 2, `${m.toFixed(2)} (${lo.toFixed(2)}–${hi.toFixed(2)})`, 6, '#444', 'start'));
  });
  const dy = Y - H - 14;
  S.push(poly([[Xv(0.62), dy], [Xv(0.66), dy + 4], [Xv(0.62), dy + 8], [Xv(0.58), dy + 4]], C.navy));
  S.push(txt(ox + 10, dy + 5, 'Overall', 7, '#111', 'start', 'bold'));
  S.push(txt(ox + 435, dy + 5, '0.62 (0.55–0.70)', 6, '#111', 'start', 'bold'));
  S.push(ln(X - 20, Y + 2, X + W + 40, Y + 2, '#4D4D4D', 0.9));
  [0.1, 0.25, 0.5, 1, 2, 4, 10].forEach(v => {
    S.push(ln(Xv(v), Y + 2, Xv(v), Y + 5.5, '#4D4D4D', 0.8));
    S.push(txt(Xv(v), Y + 13, String(v), 6.3, '#555'));
  });
  S.push(txt(X + W / 2 - 20, Y + 26, 'HR (95% CI), log scale', 7, '#333'));
  S.push(txt(ox + 437, oy + 28, 'Favors', 6.3, '#555', 'start')); S.push(txt(ox + 437, oy + 37, 'treatment', 6.3, '#555', 'start'));
})();

/* ═══ h · ROC ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(3);
  frame2(ox, oy, 'h', 'ROC curves · diagnostic performance');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const Xv = v => X + v * W, Yv = v => Y - v * H;
  S.push(ln(X, Y, X + W, Y - H, '#BBB', 0.9, '4 3'));
  const curve = (a, k, col) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const f = i / 40; pts.push([Xv(f), Yv(Math.min(1, Math.pow(1 - Math.pow(1 - f, k), 1 / a)))]); }
    S.push(pline(pts, col, 1.8));
  };
  curve(1.9, 1.15, C.red); curve(1.45, 1.2, C.teal); curve(1.15, 1.3, C.navy); curve(1.02, 1.4, C.salmon);
  frame(S, X, Y, W, H, [0, .25, .5, .75, 1], [0, .25, .5, .75, 1], ['0.0', '0.25', '0.50', '0.75', '1.0'], ['0.0', '0.25', '0.50', '0.75', '1.0']);
  S.push(txt(ox + 255, oy + 236, 'False positive rate', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'True positive rate', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  const leg = [['Panel-4 (AUC 0.94)', C.red], ['CTNNB1 (AUC 0.86)', C.teal], ['AFP (AUC 0.78)', C.navy], ['DCP (AUC 0.71)', C.salmon]];
  leg.forEach(([t, c], i) => { S.push(ln(ox + 370, oy + 28 + i * 14, ox + 394, oy + 28 + i * 14, c, 1.8)); S.push(txt(ox + 399, oy + 31 + i * 14, t, 6.8, '#333', 'start')); });
})();

/* ═══ i · lines + CI bands ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(4);
  frame2(ox, oy, 'i', 'Longitudinal · trajectories with confidence bands');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const series = [[C.teal, 30, 0.9, 'Sham'], [C.navy, 38, -0.7, 'Sham+drug'], [C.red, 46, -1.6, 'MI model']];
  const Xv = w => X + w / 12 * W, Yv = v => Y - v / 70 * H;
  series.forEach(([col, y0, slope, name]) => {
    const rib = [], rib2 = [];
    for (let w = 0; w <= 12; w++) {
      const m = y0 + slope * w + (name === 'MI model' ? -w * w * 0.06 : 0);
      rib.push([Xv(w), Yv(m + 3.4)]); rib2.push([Xv(w), Yv(m - 3.4)]);
    }
    S.push(poly([...rib, ...rib2.reverse()], col, 'none', 0, 0.14));
    S.push(pline(rib.map((p, i) => [p[0], (p[1] + rib2[i][1]) / 2]), col, 1.8));
    for (let w = 0; w <= 12; w += 2) {
      const m = y0 + slope * w + (name === 'MI model' ? -w * w * 0.06 : 0);
      S.push(circle(Xv(w), Yv(m + N(0, 1.4)), 1.7, col, '#FFFFFF', 0.5));
    }
  });
  frame(S, X, Y, W, H, [0, 1 / 6, 1 / 3, .5, 2 / 3, 5 / 6, 1], [0, .5, 1], ['0', '2', '4', '6', '8', '10', '12'], ['0', '35', '70']);
  S.push(txt(ox + 255, oy + 236, 'Weeks post-surgery', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'LVEF (%)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  series.forEach(([col, , , name], i) => { S.push(ln(ox + 370, oy + 28 + i * 14, ox + 394, oy + 28 + i * 14, col, 1.8)); S.push(txt(ox + 399, oy + 31 + i * 14, name, 6.8, '#333', 'start')); });
})();

/* ═══ j · box + jitter + brackets ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(4);
  frame2(ox, oy, 'j', 'Box plots · group comparison with p-values');
  const X = ox + 55, Y = oy + 200, W = 400, H = 180;
  const groups = ['D0', 'D3', 'D7', 'D14', 'D28'];
  const mus = [20, 30, 41, 47, 44], cols = [C.grayblue, C.teal, C.blue, C.salmon, C.red];
  const gw = W / 5;
  const Yv = v => Y - v / 72 * H;
  groups.forEach((g, gi) => {
    const arr = Array.from({ length: 22 }, () => Math.max(4, Math.min(72, N(mus[gi], 6.5))));
    const cx = X + gw * gi + gw / 2;
    const srt = [...arr].sort((a, b) => a - b);
    const q = p => srt[Math.floor(p * (srt.length - 1))];
    S.push(ln(cx, Yv(q(.02)), cx, Yv(q(.98)), '#555', 0.9));
    S.push(rrect(cx - gw * 0.18, Yv(q(.75)), gw * 0.36, Yv(q(.25)) - Yv(q(.75)), 2, '#FFFFFF', cols[gi], 1.5));
    S.push(ln(cx - gw * 0.18, Yv(q(.5)), cx + gw * 0.18, Yv(q(.5)), cols[gi], 2));
    arr.forEach(v => S.push(circle(cx + rr(-gw * 0.3, gw * 0.3), Yv(v), 1.5, cols[gi], 'none', 0, 0.55)));
  });
  const br = (i1, i2, yy, label) => {
    const x1 = X + gw * i1 + gw / 2, x2 = X + gw * i2 + gw / 2;
    S.push(ln(x1, yy, x1, yy - 4, '#333', 0.9), ln(x1, yy, x2, yy, '#333', 0.9), ln(x2, yy, x2, yy - 4, '#333', 0.9));
    S.push(txt((x1 + x2) / 2, yy - 4.5, label, 6.8, '#111', 'middle', 'bold'));
  };
  br(0, 1, Yv(48) - 8, '***'); br(0, 4, Yv(60) - 12, 'p = 6.8e-9'); br(3, 4, Yv(55) - 8, 'ns');
  frame(S, X, Y, W, H, [0, 1, 2, 3, 4], [0, .5, 1], groups, ['0', '36', '72']);
  S.push(txt(ox + 255, oy + 236, 'Days after transplant', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, 'Serum creatinine (µmol/L)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
})();

/* ═══ k · heatmap + row colors ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(5);
  frame2(ox, oy, 'k', 'Expression matrix · heatmap with annotations');
  const X = ox + 78, Y = oy + 34, gw = 34, gh = 22, n = 9;
  const ramp = t => t < .5 ? mix('#3E6FA8', '#F5F3EE', t * 2) : mix('#F5F3EE', '#C9366B', (t - .5) * 2);
  const genes = ['CDH1', 'VIM', 'MMP9', 'TWIST1', 'CDH2', 'SNAI1', 'KRT19', 'FN1', 'ZEB1'];
  const conds = ['Ctrl', 'TGF-b 2h', 'TGF-b 8h', 'TGF-b 24h', 'TGF-b 48h', 'ECT', 'ECT+inh', 'KD-SNAI1', 'Rescue'];
  const condCols = ['#BFBFBF', '#E64B35', '#E64B35', '#E64B35', '#E64B35', '#4DBBD5', '#4DBBD5', '#00A087', '#00A087'];
  for (let r = 0; r < n; r++) {
    S.push(rrect(X - 8, Y + r * gh + 2, 5, gh - 4, 0, r < 3 ? '#8491B4' : r < 6 ? '#E64B35' : '#00A087'));
    for (let c = 0; c < n; c++) {
      const base = r < 3 ? 0.25 : 0.75 - c * 0.05;
      const v = Math.max(0, Math.min(1, base + N(0, 0.16)));
      S.push(rrect(X + c * gw + 0.6, Y + r * gh + 0.6, gw - 1.2, gh - 1.2, 1, ramp(v)));
      if (v > 0.72) S.push(txt(X + c * gw + gw / 2, Y + r * gh + gh / 2 + 2.2, v.toFixed(2), 5.2, '#FFFFFF', 'middle'));
    }
    S.push(txt(X + n * gw + 5, Y + r * gh + gh / 2 + 2, genes[r], 6.3, '#444', 'start'));
  }
  conds.forEach((t, c) => {
    S.push(rrect(X + c * gw + 2, Y - 8, gw - 4, 4.5, 1, condCols[c]));
    S.push(`<text x="${f1(X + c * gw + gw / 2)}" y="${f1(Y + n * gh + 7)}" font-size="5.8" fill="#444" text-anchor="end" transform="rotate(-45 ${f1(X + c * gw + gw / 2)} ${f1(Y + n * gh + 7)})">${t}</text>`);
  });
  for (let i = 0; i < 70; i += 2) S.push(rrect(ox + 470, oy + 40 + i, 9, 2, 0, ramp(1 - i / 70)));
  S.push(`<rect x="${f1(ox + 470)}" y="${f1(oy + 40)}" width="9" height="70" fill="none" stroke="#999" stroke-width="0.5"/>`);
  S.push(txt(ox + 483, oy + 47, '2', 6, '#555', 'start')); S.push(txt(ox + 483, oy + 113, '-2', 6, '#555', 'start'));
  S.push(txt(ox + 474.5, oy + 33, 'Z', 7, '#333', 'middle', 'bold'));
  S.push(txt(ox + 40, oy + 148, 'Row side color:', 6.5, '#555', 'start'));
  S.push(rrect(ox + 105, oy + 142, 8, 8, 1, '#8491B4')); S.push(txt(ox + 117, oy + 149, 'Epithelial', 6.3, '#444', 'start'));
  S.push(rrect(ox + 165, oy + 142, 8, 8, 1, '#E64B35')); S.push(txt(ox + 177, oy + 149, 'Mesenchymal', 6.3, '#444', 'start'));
  S.push(rrect(ox + 248, oy + 142, 8, 8, 1, '#00A087')); S.push(txt(ox + 260, oy + 149, 'Hybrid', 6.3, '#444', 'start'));
})();

/* ═══ l · dumbbell ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(5);
  frame2(ox, oy, 'l', 'Dumbbell · paired change across cohorts');
  const X = ox + 95, Y = oy + 200, W = 360, H = 160;
  const items = ['CD8A', 'GZMB', 'PRF1', 'CXCL9', 'IDO1', 'LAG3', 'TIGIT', 'PDCD1'];
  const vals = items.map(() => [rr(8, 30), rr(45, 88)]);
  const Xv = v => X + v / 100 * W;
  const rh = H / 8;
  items.forEach((g, i) => {
    const yy = Y - rh * (i + 0.5);
    const [a, b] = vals[i];
    S.push(ln(Xv(a), yy, Xv(b), yy, '#C9CDD4', 2.4));
    S.push(circle(Xv(a), yy, 3.4, C.grayblue, '#FFFFFF', 0.7));
    S.push(circle(Xv(b), yy, 3.4, C.red, '#FFFFFF', 0.7));
    S.push(txt(ox + 12, yy + 2, g, 6.8, '#333', 'start'));
    S.push(txt(Xv(b) + 6, yy + 2, '+' + Math.round(b - a) + '%', 5.8, C.red, 'start', 'bold'));
  });
  frame(S, X, Y, W, H, [0, .5, 1], [], ['0', '50', '100'], []);
  S.push(txt(ox + 275, oy + 236, 'T cell exhaustion score', 7.5, '#333'));
  S.push(circle(ox + 360, oy + 28, 3.4, C.grayblue, '#FFFFFF', 0.7)); S.push(txt(ox + 369, oy + 31, 'Pre-therapy', 7, '#333', 'start'));
  S.push(circle(ox + 360, oy + 43, 3.4, C.red, '#FFFFFF', 0.7)); S.push(txt(ox + 369, oy + 46, 'Post-therapy', 7, '#333', 'start'));
})();

S.push('</svg>');
fs.writeFileSync(path.join(__dirname, '../../assets/showcase.svg'), S.join('\n'));
console.log('showcase.svg written,', S.join('').length, 'bytes');
