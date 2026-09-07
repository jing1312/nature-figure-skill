#!/usr/bin/env node
/* Chart atlas Pro (v2): 6 advanced panels in the same ggplot-grade language —
 * white bg, fine axes, NPG pastels, dense seeded data. */
'use strict';
const fs = require('fs');
const path = require('path');

let seed = 20260909;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const rr = (a, b) => a + rnd() * (b - a);
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

function h2r(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); }
function kde(arr, bw2, grid) {
  return grid.map(v => arr.reduce((s, p) => s + Math.exp(-((v - p) ** 2) / (2 * bw2)), 0) / (arr.length * bw2 * 2.5066));
}

const C = { red: '#E64B35', blue: '#4DBBD5', teal: '#00A087', navy: '#3C5488', salmon: '#F39B7F', grayblue: '#8491B4', mint: '#91D1C2', purple: '#8E7CC3', amber: '#F2C14E' };

const f1 = v => (Math.round(v * 10) / 10);
const txt = (x, y, t, size = 7, fill = '#333', anchor = 'middle', w = 'normal', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" ${extra}>${t}</text>`;
const ln = (x1, y1, x2, y2, st = '#333', sw = 0.8, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const rrect = (x, y, w, h, r, fill, stroke = 'none', sw = 0, op = 1) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${r}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle = (cx, cy, r, fill, stroke = 'none', sw = 0, op = 1) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
const poly = (pts, fill, stroke = 'none', sw = 0, op = 1) =>
  `<polygon points="${pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;
const pline = (pts, st, sw = 1, dash = '') =>
  `<polyline points="${pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="none" stroke="${st}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const pathd = (d, fill, stroke = 'none', sw = 0, op = 1) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="${sw}"/>`;

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

const PW = 550, COLX = [40, 630], ROWY = r => 62 + r * 320;
const S = [];
S.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1030" font-family="Helvetica, Arial, sans-serif">`);
S.push(rrect(0, 0, 1200, 1030, 0, '#FFFFFF'));
S.push(txt(40, 34, 'FigureForge · Chart atlas Pro — advanced figures', 16, '#1a1a1a', 'start', 'bold'));
S.push(txt(1160, 34, '6 advanced archetypes · NPG-style palettes', 9, '#888', 'end'));

function frame2(ox, oy, letter, title) {
  S.push(txt(ox - 8, oy - 7, letter, 14, '#111', 'start', 'bold'));
  S.push(txt(ox + PW / 2, oy - 6, title, 9, '#555', 'middle', 'bold'));
}

/* ═══ a · radar ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(0);
  frame2(ox, oy, 'a', 'Radar · immune signature profiling');
  const cx = ox + 210, cy = oy + 152, R = 108, n = 8;
  const axesL = ['CD8A', 'IFNG', 'GZMB', 'PRF1', 'CXCL9', 'CXCL10', 'IDO1', 'LAG3'];
  const polar = (r, i) => { const a = (i / n * 360 - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  for (let ring = 1; ring <= 4; ring++) {
    const pts = []; for (let i = 0; i < n; i++) pts.push(polar(R * ring / 4, i));
    S.push(poly(pts, 'none', '#DDD', 0.7));
  }
  for (let i = 0; i < n; i++) { const p = polar(R, i); S.push(ln(cx, cy, p[0], p[1], '#DDD', 0.7)); }
  const series = [[C.red, [3.4, 3.1, 2.8, 2.9, 3.5, 3.2, 1.8, 1.5], 'Responder'], [C.blue, [1.9, 1.6, 1.4, 1.7, 2.2, 2.0, 3.2, 3.4], 'Non-responder']];
  series.forEach(([col, vals, name]) => {
    const pts = vals.map((v, i) => polar(v / 4 * R, i));
    S.push(poly(pts, col, col, 1.6, 0.16));
    pts.forEach(p => S.push(circle(p[0], p[1], 2, col, '#FFFFFF', 0.6)));
  });
  axesL.forEach((t, i) => { const p = polar(R + 16, i); S.push(txt(p[0], p[1] + 2, t, 6.8, '#333')); });
  // ring scale labels
  [1, 2, 3, 4].forEach(r => S.push(txt(cx + 4, cy - R * r / 4 + 2, String(r), 5.5, '#999', 'start')));
  S.push(circle(ox + 400, oy + 60, 3, C.red, '#FFFFFF', 0.6)); S.push(txt(ox + 409, oy + 63, 'Responder', 7, '#333', 'start'));
  S.push(circle(ox + 400, oy + 78, 3, C.blue, '#FFFFFF', 0.6)); S.push(txt(ox + 409, oy + 81, 'Non-responder', 7, '#333', 'start'));
  S.push(txt(ox + 400, oy + 108, 'Signature score (0–4)', 6.3, '#888', 'start'));
})();

/* ═══ b · GO bubble ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(0);
  frame2(ox, oy, 'b', 'GO enrichment · bubble plot');
  const X = ox + 120, Y = oy + 210, W = 330, H = 185;
  const terms = [
    ['Extracellular matrix organization', 5.8, 12.4, 58],
    ['Collagen fibril organization', 6.9, 10.8, 41],
    ['Angiogenesis', 4.2, 9.6, 66],
    ['Leukocyte migration', 3.6, 8.9, 49],
    ['T cell activation', 3.1, 7.2, 88],
    ['Apoptotic process', 2.4, 5.8, 120],
    ['Cell cycle arrest', 3.9, 5.2, 72],
    ['DNA repair', 2.0, 4.1, 95],
    ['Lipid metabolic process', 1.6, 3.2, 84],
    ['Ion transport', 1.2, 2.4, 110],
  ];
  const Xv = v => X + (v - 0.8) / (7.4 - 0.8) * W;
  const Yv = v => Y - v / 13.5 * H;
  const rOf = c => 2.4 + Math.sqrt(c) * 0.62;
  const ramp = t => mix('#4DBBD5', '#E64B35', t);
  // gene-ratio gridlines
  [2, 4, 6].forEach(v => S.push(ln(Xv(v), Y - H, Xv(v), Y, '#E8E8E8', 0.6)));
  [5, 10].forEach(v => S.push(ln(X, Yv(v), X + W, Yv(v), '#E8E8E8', 0.6)));
  terms.forEach(([name, gr, pv, cnt]) => {
    S.push(circle(Xv(gr), Yv(pv), rOf(cnt), ramp((gr - 1) / 6), '#FFFFFF', 0.5, 0.85));
    S.push(txt(X - 6, Yv(pv) + 2, name.length > 24 ? name.slice(0, 23) + '…' : name, 5.9, '#444', 'end'));
  });
  frame(S, X, Y, W, H, [0, 1 / 3, 2 / 3, 1], [0, .5, 1], ['2', '4', '6', ''], ['0', '6.75', '13.5']);
  S.push(txt(ox + 285, oy + 246, 'Gene ratio', 7.5, '#333'));
  S.push(txt(ox + 16, Y - H / 2, '-log₁₀ (FDR)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 16) + ' ' + f1(Y - H / 2) + ')"'));
  // size + color legends
  [30, 70, 120].forEach((c, i) => S.push(circle(ox + 420 + i * 22, oy + 42, rOf(c), '#D8DBE0', '#999', 0.5)));
  S.push(txt(ox + 422, oy + 66, '30 · 70 · 120 genes', 6, '#555', 'middle'));
  for (let i = 0; i < 46; i += 2) S.push(rrect(ox + 408 + i, oy + 84, 2, 7, 0, ramp(i / 46)));
  S.push(txt(ox + 408, oy + 100, 'low', 5.8, '#555', 'start')); S.push(txt(ox + 454, oy + 100, 'high ratio', 5.8, '#555', 'end'));
})();

/* ═══ c · manhattan ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(1);
  frame2(ox, oy, 'c', 'Manhattan plot · GWAS associations');
  const X = ox + 50, Y = oy + 205, W = 440, H = 180;
  const Xv = t => X + t * W, Yv = v => Y - v / 10 * H;
  const chrCols = ['#8491B4', '#C9CDD4'];
  const chrLen = [0.055, 0.052, 0.045, 0.042, 0.038, 0.036, 0.034, 0.031, 0.03, 0.028, 0.027, 0.026, 0.024, 0.022, 0.021, 0.02, 0.018, 0.017, 0.015, 0.013, 0.011, 0.009];
  const TT = chrLen.reduce((a, b) => a + b, 0);
  let cum = 0; const chrEdges = [];
  chrLen.forEach((len, ci) => {
    for (let i = 0; i < Math.floor(len * 950); i++) {
      const frac = rnd(), tl = cum + frac * len, t = tl / TT;
      let pv = -Math.log10(rnd()) * 1.75;
      if (ci === 5 && frac > 0.55 && frac < 0.72) pv = 6.2 + rnd() * 3.4;
      if (ci === 11 && frac > 0.3 && frac < 0.42) pv = 5.6 + rnd() * 2.4;
      const sig = pv > 7.3;
      S.push(circle(Xv(t), Yv(Math.min(9.7, pv)), sig ? 1.9 : 1.3, sig ? C.red : chrCols[ci % 2], 'none', 0, sig ? 0.9 : 0.7));
    }
    cum += len; chrEdges.push(cum / TT);
  });
  S.push(ln(X, Yv(7.3), X + W, Yv(7.3), C.red, 0.8, '3 3'));
  S.push(txt(X + W - 2, Yv(7.3) - 2.5, '5e-8', 5.8, C.red, 'end'));
  S.push(ln(X, Yv(5.5), X + W, Yv(5.5), '#999', 0.7, '2 4'));
  S.push(txt(X + 3, Yv(5.5) - 2.5, '1e-6', 5.8, '#888', 'start'));
  const snpPos = [chrLen.slice(0, 6).reduce((a, b) => a + b, 0) + 0.030, chrLen.slice(0, 12).reduce((a, b) => a + b, 0) - 0.030, chrLen.slice(0, 6).reduce((a, b) => a + b, 0) + 0.040];
  ['RS7274591', 'RS1298277', 'RS438921'].forEach((g, i) => {
    S.push(txt(Xv(snpPos[i] / TT), Yv([9.4, 7.9, 7.5][i]) - 3, g, 5.6, '#111', 'middle', 'bold'));
  });
  frame(S, X, Y, W, H, [0, .25, .5, .75, 1], [0, .5, 1], ['', '', '', '', ''], ['0', '5', '10']);
  chrEdges.slice(0, 21).forEach(e => S.push(txt(Xv(e), Y + 8.5, String(Math.round(e * 22)), 4.8, '#999')));
  S.push(txt(ox + 270, oy + 242, 'Chromosome', 7.5, '#333'));
  S.push(txt(ox + 14, Y - H / 2, '-log₁₀(P)', 7.5, '#333', 'middle', 'normal', 'transform="rotate(-90 ' + f1(ox + 14) + ' ' + f1(Y - H / 2) + ')"'));
})();

/* ═══ d · ridgeline ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(1);
  frame2(ox, oy, 'd', 'Ridgeline · distribution by condition');
  const X = ox + 85, Y = oy + 235, W = 400;
  const conds = ['Monocyte', 'Macrophage M1', 'Macrophage M2', 'Dendritic', 'NK cell', 'T CD4+', 'T CD8+', 'B cell'];
  const rows = 8, rh = 23;
  conds.forEach((name, gi) => {
    const base = Y - gi * rh * 1.12;
    const g = Array.from({ length: 90 }, () => N(24 + (gi % 3) * 6, 4 + (gi % 4)));
    const grid = Array.from({ length: 50 }, (_, i) => 5 + i / 49 * 40);
    const dd = kde(g, 2.4, grid); const dmax = Math.max(...dd);
    const pts = grid.map((v, i) => [X + i / 49 * W, base - dd[i] / dmax * 24]);
    const fillC = mix('#4DBBD5', '#E64B35', gi / 7);
    S.push(pathd(`M${f1(X)} ${f1(base)}L${pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L')}L${f1(X + W)} ${f1(base)}Z`, fillC, '#FFFFFF', 0, 0.55));
    S.push(pline(pts, mix(fillC, '#222222', 0.25), 1));
    S.push(txt(X - 6, base - 3, name, 6.3, '#444', 'end'));
  });
  frame(S, X, Y, W, 8, [0, .5, 1], [], ['10', '25', '45'], []);
  S.push(txt(ox + 285, oy + 254, 'Expression (log₁₀ TPM)', 7.5, '#333'));
})();

/* ═══ e · sankey / alluvial ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(2);
  frame2(ox, oy, 'e', 'Alluvial · cohort flow through treatment lines');
  const X = ox + 80, W = 340;
  const top = oy + 26, bot = oy + 218;
  const nx = [X, X + 155, X + 310];
  const nw = 26;
  const node = (x, y0, y1, col, label, pct) => {
    S.push(rrect(x, y0, nw, y1 - y0, 2, col, 'none', 0, 0.9));
    S.push(txt(x + nw + 5, (y0 + y1) / 2 + 2, label, 6.8, '#333', 'start'));
    if (pct) S.push(txt(x + nw / 2, y0 - 3.5, pct, 6, '#555', 'middle', 'bold'));
  };
  const ribbon = (x0, a0, a1, x1, b0, b1, col, op) => {
    const mid = (x0 + x1) / 2;
    S.push(pathd(`M${f1(x0)} ${f1(a0)}C${f1(mid)} ${f1(a0)},${f1(mid)} ${f1(b0)},${f1(x1)} ${f1(b0)}L${f1(x1)} ${f1(b1)}C${f1(mid)} ${f1(b1)},${f1(mid)} ${f1(a1)},${f1(x0)} ${f1(a1)}Z`, col, 'none', 0, op));
  };
  const span = (y0, frac) => y0 + frac * (bot - top);
  // stage 1: all patients
  const A = { y0: top, y1: bot };
  node(nx[0], A.y0, A.y1, C.navy, 'n = 240', '100%');
  // stage 2: responders 70 / non 30
  const B1 = { y0: top, y1: top + 0.68 * (bot - top) }, B2 = { y0: B1.y1 + 14, y1: bot };
  ribbon(nx[0] + nw, A.y0, span(A.y0, 0.68), nx[1], B1.y0, B1.y1, C.teal, 0.4);
  ribbon(nx[0] + nw, span(A.y0, 0.68), A.y1, nx[1], B2.y0, B2.y1, C.grayblue, 0.4);
  node(nx[1], B1.y0, B1.y1, C.teal, 'Response', '68%');
  node(nx[1], B2.y0, B2.y1, C.grayblue, 'No response', '32%');
  // stage 3: CR 36 / PR 25 / SD 17 / PD 22
  const h = bot - top;
  const C1 = { y0: top, y1: top + 0.36 * h };
  const C2 = { y0: C1.y1 + 14, y1: C1.y1 + 14 + 0.25 * h };
  const C3 = { y0: C2.y1 + 14, y1: C2.y1 + 14 + 0.17 * h };
  const C4 = { y0: C3.y1 + 14, y1: bot };
  ribbon(nx[1] + nw, B1.y0, B1.y0 + 0.53 * (B1.y1 - B1.y0), nx[2], C1.y0, C1.y1, C.teal, 0.45);
  ribbon(nx[1] + nw, B1.y0 + 0.53 * (B1.y1 - B1.y0), B1.y0 + 0.90 * (B1.y1 - B1.y0), nx[2], C2.y0, C2.y1, C.blue, 0.45);
  ribbon(nx[1] + nw, B1.y0 + 0.90 * (B1.y1 - B1.y0), B1.y1, nx[2], C3.y0, C3.y1, C.salmon, 0.45);
  ribbon(nx[1] + nw, B2.y0, B2.y1, nx[2], C4.y0, C4.y1, C.grayblue, 0.45);
  node(nx[2], C1.y0, C1.y1, C.teal, 'Complete response', '36%');
  node(nx[2], C2.y0, C2.y1, C.blue, 'Partial response', '25%');
  node(nx[2], C3.y0, C3.y1, C.salmon, 'Stable disease', '17%');
  node(nx[2], C4.y0, C4.y1, C.grayblue, 'Progression', '22%');
  ['Line 1', 'Line 2', 'Outcome'].forEach((t, i) => S.push(txt(nx[i] + nw / 2, bot + 16, t, 7, '#555')));
})();

/* ═══ f · gantt ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(2);
  frame2(ox, oy, 'f', 'Gantt · study timeline and milestones');
  const X = ox + 100, Y = oy + 205, W = 370;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const Xv = m => X + m / 12 * W;
  for (let m = 0; m <= 12; m += 1) S.push(ln(Xv(m), Y - 150, Xv(m), Y, '#EEE', 0.6));
  months.forEach((t, i) => S.push(txt(Xv(i + 0.5), Y + 9, t, 6.2, '#555')));
  const tasks = [
    ['Protocol &amp; IRB', 0, 1.5, C.navy],
    ['Site initiation', 1, 2.5, C.grayblue],
    ['Enrollment', 2, 6.5, C.teal],
    ['Intervention', 2.5, 9, C.blue],
    ['Follow-up', 4, 11, C.mint],
    ['Data cleaning', 9, 11.5, C.amber],
    ['Analysis', 10.5, 12, C.red],
  ];
  tasks.forEach(([name, s, e, col], i) => {
    const yy = Y - 150 + i * 21 + 4;
    S.push(txt(X - 6, yy + 8.5, name, 6.6, '#333', 'end'));
    S.push(rrect(Xv(s), yy, Xv(e) - Xv(s), 11, 5, col, 'none', 0, 0.88));
  });
  // milestones
  [[2, 'FPI'], [6.5, 'LPI'], [11, 'LPI+6mo']].forEach(([m, label]) => {
    const d = `M${f1(Xv(m))} ${f1(Y - 158)}l4 6l-4 6l-4 -6Z`;
    S.push(pathd(d, C.red));
    S.push(txt(Xv(m), Y - 162, label, 5.8, C.red, 'middle', 'bold'));
    S.push(ln(Xv(m), Y - 146, Xv(m), Y, C.red, 0.6, '2 3'));
  });
  S.push(ln(X, Y, X + W, Y, '#4D4D4D', 0.9));
  S.push(ln(X, Y - 150, X, Y, '#4D4D4D', 0.9));
  S.push(txt(ox + 285, oy + 236, '2026', 7.5, '#333'));
})();

S.push('</svg>');
fs.writeFileSync(path.join(__dirname, '..', '..', 'assets', 'showcase-pro.svg'), S.join('\n'));
console.log('showcase-pro.svg written,', S.join('').length, 'bytes');
