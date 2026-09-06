#!/usr/bin/env node
/* Chart atlas — Bio edition: 12 panels replicating high-impact bioinformatics
 * figure styles (dot heatmap + dendrograms, corr heatmaps with significance,
 * corrplot pies, circular heatmap, Mantel combo, GSEA, PCA ellipses, jointplot,
 * bar+half-violin, box+brackets, rose chart). Seeded, reproducible. */
'use strict';
const fs = require('fs');
const path = require('path');

let seed = 20260907;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const rr = (a, b) => a + rnd() * (b - a);
const N = (m, s) => m + (rnd() + rnd() + rnd() + rnd() - 2) * 1.414 * s;

// ── color utils ──
function h2r(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function r2h(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); }
function ramp(stops) {
  return t => {
    t = Math.max(0, Math.min(1, t));
    const n = stops.length - 1, i = Math.min(n - 1, Math.floor(t * n));
    return mix(stops[i], stops[i + 1], t * n - i);
  };
}
const rampPG = ramp(['#E8A0C8', '#F8F6F0', '#9CCB61']);       // pink→white→green
const rampGP = ramp(['#7CB342', '#F7F7F5', '#E8709F']);        // green→white→pink (cor)
const rampBO = ramp(['#6FA3C8', '#F8F7F4', '#E8933F']);        // blue→white→orange
const rampOP = ramp(['#8E7CC3', '#F8F5F2', '#F6A04D']);        // purple→white→orange
const rampTEAL = ramp(['#E9F4F2', '#3E9C8F']);                 // light→teal
const rampBR = ramp(['#F8F6F2', '#B5722E']);                   // light→brown
const rampGSEA = t => t < .5 ? mix('#3E6FA8', '#F2F2F0', t * 2) : mix('#F2F2F0', '#C9366B', (t - .5) * 2);

// ── svg helpers ──
const f1 = v => (Math.round(v * 10) / 10);
const txt = (x, y, t, size = 7, fill = '#333', anchor = 'middle', w = 'normal', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" ${extra}>${t}</text>`;
const ln = (x1, y1, x2, y2, st = '#333', sw = 0.8, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f2(y2)}" stroke="${st}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const f2 = v => (Math.round(v * 10) / 10);
const rrect = (x, y, w, h, r, fill, stroke = 'none', sw = 0) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle = (cx, cy, r, fill, stroke = 'none', sw = 0) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const polar = (cx, cy, r, aDeg) => { const a = (aDeg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
function annPath(cx, cy, r0, r1, a0, a1) {
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  const laf = (a1 - a0) > 180 ? 1 : 0;
  return `M${f1(x0)} ${f1(y0)}A${f1(r1)} ${f1(r1)} 0 ${laf} 1 ${f1(x1)} ${f1(y1)}L${f1(x2)} ${f2(y2)}A${f1(r0)} ${f1(r0)} 0 ${laf} 0 ${f1(x3)} ${f1(y3)}Z`;
}
// dendrogram: leaves = [{x,y}], tree nested {a,b,h in 0..1}
function dendro(S, leaves, tree, span, dir, color = '#333', sw = 0.9) {
  function walk(t) {
    if (typeof t === 'number') return leaves[t];
    const A = walk(t.a), B = walk(t.b), h = t.h * span;
    if (dir === 'up') { // col dendro above matrix: extend upward
      const yN = Math.min(A.y, B.y) - h, xN = (A.x + B.x) / 2;
      S.push(ln(A.x, A.y, A.x, yN, color, sw), ln(B.x, B.y, B.x, yN, color, sw), ln(A.x, yN, B.x, yN, color, sw));
      return { x: xN, y: yN };
    } else { // row dendro left of matrix: extend leftward
      const xN = Math.min(A.x, B.x) - h, yN = (A.y + B.y) / 2;
      S.push(ln(A.x, A.y, xN, A.y, color, sw), ln(B.x, B.y, xN, B.y, color, sw), ln(xN, A.y, xN, B.y, color, sw));
      return { x: xN, y: yN };
    }
  }
  walk(tree);
}
function vLegend(S, x, y, h, w, ramp_, ticks, label) {
  const defs = [];
  for (let i = 0; i < 20; i++) S.push(rrect(x, y + h * i / 20 - h, 0.01, 0.01, 0, 'none'));
  // gradient via thin rects
  for (let i = 0; i < h; i += 2) S.push(rrect(x, y + i, w, 2, 0, ramp_(1 - i / h)));
  S.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#999" stroke-width="0.5"/>`);
  ticks.forEach(t => S.push(txt(x + w + 3, y + h * t, String(t), 6, '#555', 'start')));
  S.push(txt(x + w / 2, y - 5, label, 7, '#333', 'middle', 'bold'));
}

// ── layout ──
const PW = 550, PH = 285, COLX = [40, 630], ROWY = r => 62 + r * 301;
const S = [];
S.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1880" font-family="Helvetica, Arial, sans-serif">`);
S.push(rrect(0, 0, 1200, 1880, 0, '#FFFFFF'));
S.push(txt(40, 34, 'FigureForge · Chart atlas — Bio edition', 16, '#1a1a1a', 'start', 'bold'));
S.push(txt(1160, 34, '12 bioinformatics figure archetypes · NPG-style palettes', 9, '#888', 'end'));

function frame(ox, oy, letter, title) {
  S.push(txt(ox - 8, oy - 7, letter, 14, '#111', 'start', 'bold'));
  S.push(txt(ox + PW / 2, oy - 6, title, 9, '#555', 'middle', 'bold'));
}

/* ═══ a · dot heatmap + double dendrogram (pink/green) ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(0);
  frame(ox, oy, 'a', 'Dot heatmap · Z-score with clustering');
  const rows = ['Memory_CD4_T', 'NK', 'DC', 'B', 'FCGR3A_Mono', 'Platelet', 'Naive_CD4_T', 'CD14_Mono', 'CD8_T'];
  const cols = ['LGALS2', 'S100A9', 'S100A8', 'CD3D', 'IL32', 'CD2', 'CCR7', 'LDHB', 'AQP3'];
  const G = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  const gOf = i => G.findIndex(g => g.includes(i));
  const gx = ox + 72, gy = oy + 34, cw = 40, ch = 24;
  const z = (r, c) => gOf(r) === gOf(c) ? 1.1 + rnd() * 1.5 : -0.7 + rnd() * 0.55;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    const v = z(r, c), cx = gx + c * cw + cw / 2, cy = gy + r * ch + ch / 2;
    S.push(circle(cx, cy, 3.4 + Math.abs(v) * 4.6, rampPG((v + 1.2) / 3.2)));
  }
  const rowLeaf = [], colLeaf = [];
  for (let r = 0; r < 9; r++) rowLeaf.push({ x: gx - 8, y: gy + r * ch + ch / 2 });
  for (let c = 0; c < 9; c++) colLeaf.push({ x: gx + c * cw + cw / 2, y: gy - 8 });
  dendro(S, rowLeaf, { a: { a: { a: 0, b: 1, h: .12 }, b: 2, h: .3 }, b: { a: { a: 3, b: 4, h: .15 }, b: { a: { a: 5, b: 6, h: .2 }, b: { a: 7, b: 8, h: .15 }, h: .4 }, h: .55 }, h: .85 }, 26, 'left');
  dendro(S, colLeaf, { a: { a: 0, b: 1, h: .2 }, b: { a: 2, b: { a: { a: 3, b: 4, h: .25 }, b: { a: { a: 5, b: 6, h: .3 }, b: { a: 7, b: 8, h: .2 }, h: .4 }, h: .6 }, h: .35 }, h: .8 }, 20, 'up');
  rows.forEach((t, r) => S.push(txt(gx + 9 * cw + 7, gy + r * ch + ch / 2 + 2, t, 6.3, '#444', 'start')));
  cols.forEach((t, c) => S.push(`<text x="${f1(gx + c * cw + cw / 2)}" y="${f1(gy + 9 * ch + 6)}" font-size="6.3" fill="#444" text-anchor="end" transform="rotate(-45 ${f1(gx + c * cw + cw / 2)} ${f1(gy + 9 * ch + 6)})">${t}</text>`));
  vLegend(S, ox + 505, oy + 40, 74, 9, rampPG, [0, 0.5, 1], 'Z-score');
  S.push(txt(ox + 509, oy + 124, '3', 6, '#555', 'middle')); S.push(txt(ox + 509, oy + 44, '-1', 6, '#555', 'middle'));
  
})();

/* ═══ b · corr tile heatmap + significance (green/pink) ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(0);
  frame(ox, oy, 'b', 'Correlation heatmap · significance marks');
  const genes = ['FGG', 'CCT3', 'RPL13', 'RPS11', 'GCN1', 'SMG5', 'ARPC3', 'RAB8A', 'SPARC', 'RPS27A'];
  const B = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const bOf = i => B.findIndex(b => b.includes(i));
  const gx = ox + 62, gy = oy + 30, cw = 42, ch = 21;
  const R = [];
  for (let i = 0; i < 10; i++) { R.push([]); for (let j = 0; j < 10; j++) {
    if (i === j) R[i].push(1);
    else { const d = bOf(i) - bOf(j);
      R[i].push(d === 0 ? 0.35 + rnd() * 0.6 : d === -1 ? -(0.25 + rnd() * 0.55) : d === 1 ? -(0.15 + rnd() * 0.5) : 0.3 + rnd() * 0.55); }
  } }
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    const v = R[r][c], x = gx + c * cw, y = gy + r * ch;
    S.push(rrect(x + 1, y + 1, cw - 2, ch - 2, 5, rampGP((1 - v) / 2)));
    if (Math.abs(v) > 0.72) S.push(txt(x + cw / 2, y + ch / 2 + 2, v > 0.9 ? '***' : '**', 6, '#3c3c3c'));
  }
  const colLeaf = []; for (let c = 0; c < 10; c++) colLeaf.push({ x: gx + c * cw + cw / 2, y: gy - 8 });
  dendro(S, colLeaf, { a: { a: { a: 0, b: 1, h: .15 }, b: { a: 2, b: 3, h: .2 }, h: .4 }, b: { a: { a: 4, b: 5, h: .15 }, b: { a: { a: 6, b: 7, h: .2 }, b: { a: 8, b: 9, h: .15 }, h: .35 }, h: .55 }, h: .85 }, 18, 'up');
  genes.forEach((t, r) => S.push(txt(gx + 10 * cw + 6, gy + r * ch + ch / 2 + 2, t, 6.3, '#444', 'start')));
  genes.forEach((t, c) => S.push(`<text x="${f1(gx + c * cw + cw / 2)}" y="${f1(gy + 10 * ch + 8)}" font-size="6.3" fill="#444" text-anchor="end" transform="rotate(-45 ${f1(gx + c * cw + cw / 2)} ${f1(gy + 10 * ch + 8)})">${t}</text>`));
  vLegend(S, ox + 500, oy + 34, 74, 9, rampGP, [0, 0.5, 1], 'Cor');
  S.push(txt(ox + 504.5, oy + 30, '1', 6, '#555', 'middle')); S.push(txt(ox + 504.5, oy + 118, '-1', 6, '#555', 'middle'));
})();

/* ═══ c · dense orange/blue heatmap + double dendrogram ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(1);
  frame(ox, oy, 'c', 'Expression heatmap · dual clustering');
  const genes = ['FREM2', 'ALDH9A1', 'RBL1', 'AP2A2', 'HNRNPK', 'ATP1A1', 'ARPC3', 'SMG5', 'RPS27A', 'RAB8A', 'SPARC', 'FGG', 'CCT3', 'RPL13', 'RPL34', 'GCN1', 'RPS11', 'EEF1B2'];
  const n = 18, gx = ox + 56, gy = oy + 26, cw = 24, ch = 13;
  const B = [[0, 5], [6, 11], [12, 17]];
  const bOf = i => B.findIndex(b => i >= b[0] && i <= b[1]);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    let v;
    if (bOf(r) === bOf(c)) v = rnd() > 0.25 ? 0.3 + rnd() * 0.7 : -(0.2 + rnd() * 0.6);
    else v = rnd() > 0.7 ? 0.2 + rnd() * 0.5 : -(0.3 + rnd() * 0.65);
    S.push(rrect(gx + c * cw + 0.8, gy + r * ch + 0.8, cw - 1.6, ch - 1.6, 2.5, rampBO((1 - v) / 2)));
  }
  const mk = (k, o) => { const a = []; for (let i = 0; i < n; i++) a.push(i); 
    const half = m => m.length <= 2 ? (m.length === 2 ? { a: m[0], b: m[1], h: rr(.12, .3) } : m[0])
      : { a: half(m.slice(0, Math.ceil(m.length / 2))), b: half(m.slice(Math.ceil(m.length / 2))), h: rr(.4, .75) };
    return half(a); };
  const rowLeaf = [], colLeaf = [];
  for (let r = 0; r < n; r++) rowLeaf.push({ x: gx - 6, y: gy + r * ch + ch / 2 });
  for (let c = 0; c < n; c++) colLeaf.push({ x: gx + c * cw + cw / 2, y: gy - 6 });
  dendro(S, rowLeaf, mk(n), 22, 'left'); dendro(S, colLeaf, mk(n), 16, 'up');
  genes.forEach((t, r) => S.push(txt(gx + n * cw + 5, gy + r * ch + ch / 2 + 1.8, t, 5.2, '#444', 'start')));
  genes.forEach((t, c) => S.push(`<text x="${f1(gx + c * cw + cw / 2)}" y="${f1(gy + n * ch + 10)}" font-size="5.2" fill="#444" text-anchor="end" transform="rotate(-45 ${f1(gx + c * cw + cw / 2)} ${f1(gy + n * ch + 10)})">${t}</text>`));
  vLegend(S, ox + 505, oy + 60, 80, 9, rampBO, [0, 0.5, 1], 'Cor');
  S.push(txt(ox + 509.5, oy + 56, '1', 6, '#555', 'middle')); S.push(txt(ox + 509.5, oy + 152, '-1', 6, '#555', 'middle'));
})();

/* ═══ d · corrplot pies ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(1);
  frame(ox, oy, 'd', 'Correlation matrix · pie variant');
  const vars = ['wt', 'hp', 'cyl', 'qsec', 'vs', 'mpg', 'drat', 'am', 'gear'];
  const n = 9, gx = ox + 56, gy = oy + 26, cw = 46, ch = 25;
  const blk = [0, 0, 0, 1, 1, 1, 2, 2, 2];
  const R = [];
  for (let i = 0; i < n; i++) { R.push([]); for (let j = 0; j < n; j++) {
    if (i === j) R[i].push(1);
    else { const d = blk[i] - blk[j];
      R[i].push(d === 0 ? 0.45 + rnd() * 0.5 : d !== 0 && (blk[i] === 1 || blk[j] === 1) ? -(0.4 + rnd() * 0.5) : -(0.2 + rnd() * 0.6)); }
  } }
  // fix drat-am-gear moderate positive
  [[6, 7], [6, 8], [7, 8]].forEach(([i, j]) => { R[i][j] = R[j][i] = 0.55 + rnd() * 0.3; });
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const x = gx + c * cw + cw / 2, y = gy + r * ch + ch / 2, v = R[r][c];
    if (r === c) { S.push(rrect(x - 9, y - 8, 18, 16, 3, '#EEF0F4')); S.push(txt(x, y + 2, '1.00', 6, '#666')); }
    else if (r > c) S.push(txt(x, y + 2, v.toFixed(2), 6.5, v > 0 ? '#6E9E3D' : '#7E6BB0'));
    else {
      if (Math.abs(v) < 0.28) { S.push(ln(x - 5, y - 5, x + 5, y + 5, '#888', 1.4), ln(x - 5, y + 5, x + 5, y - 5, '#888', 1.4)); }
      else {
        const col = v > 0 ? '#7CB342' : '#9575CD';
        S.push(circle(x, y, 9, '#F1F2F6'));
        const fr = Math.abs(v), a1 = -90 + 360 * fr, laf = fr > 0.5 ? 1 : 0;
        const [x1, y1] = polar(x, y, 9, fr * 360);
        S.push(`<path d="M${f1(x)} ${f1(y)}L${f1(x)} ${f1(y - 9)}A9 9 0 ${laf} 1 ${f1(x1)} ${f1(y1)}Z" fill="${col}"/>`);
        S.push(circle(x, y, 9, 'none', '#B9BEC9', 0.7));
        if (Math.abs(v) > 0.7) S.push(txt(x, y - 12, v > 0.85 ? '***' : '**', 5.5, '#555'));
      }
    }
  }
  vars.forEach((t, r) => S.push(txt(gx - 6, gy + r * ch + ch / 2 + 2, t, 7, '#444', 'end')));
  vars.forEach((t, c) => S.push(`<text x="${f1(gx + c * cw + cw / 2)}" y="${f1(gy + n * ch + 10)}" font-size="6.5" fill="#444" text-anchor="end" transform="rotate(-45 ${f1(gx + c * cw + cw / 2)} ${f1(gy + n * ch + 10)})">${t}</text>`));
  vLegend(S, ox + 500, oy + 40, 90, 9, t => t < .5 ? mix('#9575CD', '#F4F4F6', (0.5 - t) * 2) : mix('#F4F4F6', '#7CB342', (t - 0.5) * 2), [0, 0.5, 1], 'corr');
  S.push(txt(ox + 504.5, oy + 34, '-1', 6, '#555', 'middle')); S.push(txt(ox + 504.5, oy + 142, '1', 6, '#555', 'middle'));
})();

/* ═══ e · circular heatmap ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(2);
  frame(ox, oy, 'e', 'Circular heatmap · expression rings');
  const cx = ox + 240, cy = oy + 152;
  const genes = ['STAT1', 'VINN', 'EZH2', 'MCL1', 'GPX6', 'MXD8', 'TESB.3', 'TESB.2', 'TESA.1', 'STAU2', 'PXDN', 'PTPRN', 'PRKRX', 'MSH2', 'CASP3', 'ANKRD2', 'ZNF277', 'OGG1', 'TOR1A', 'PDK1', 'GPX6', 'AGAPFD', 'NME5', 'GJB2', 'FN1', 'JUN', 'NR4A3', 'AIFM1', 'PTGS2', 'ABL1'];
  const n = 30, seg = 360 / n;
  const ringVal = f => { const a = []; for (let i = 0; i < n; i++) a.push(f()); return a; };
  const R1 = ringVal(() => -1 + rnd() * 2.6), R2 = ringVal(() => -1.4 + rnd() * 2.8), R3 = ringVal(() => -0.5 + rnd() * 2.2);
  const rings = [[104, 92, R1], [88, 76, R2], [72, 60, R3]];
  rings.forEach(([r0, r1, vals]) => {
    for (let i = 0; i < n; i++) {
      const t = (vals[i] + 2) / 4.4;
      S.push(`<path d="${annPath(cx, cy, r0, r1, i * seg + 0.8, (i + 1) * seg - 0.8)}" fill="${rampOP(t)}"/>`);
    }
  });
  // qval dots ring
  for (let i = 0; i < n; i++) { const [x, y] = polar(cx, cy, 53, i * seg + seg / 2); S.push(circle(x, y, 2.1, i % 3 === 0 ? '#4E8FD0' : '#9EC3E4', '#33689E', 0.5)); }
  // inner dendrogram: black elbows
  const pts = i => polar(cx, cy, 36, i * seg + seg / 2);
  [[0, 4], [5, 9], [10, 14], [15, 19], [20, 24], [25, 29]].forEach(([a, b]) => {
    const [x1, y1] = pts(a), [x2, y2] = pts(b);
    S.push(`<path d="M${f1(x1)} ${f1(y1)}L${f1((x1 + x2) / 2)} ${f1((y1 + y2) / 2)}L${f1(x2)} ${f1(y2)}" fill="none" stroke="#222" stroke-width="0.8"/>`);
  });
  // labels tangential
  for (let i = 0; i < n; i++) {
    const ang = i * seg + seg / 2, [tx, ty] = polar(cx, cy, 110, ang);
    const rot = ang > 180 ? ang + 90 : ang - 90;
    S.push(`<text x="${f1(tx)}" y="${f1(ty)}" font-size="6" fill="#444" text-anchor="middle" transform="rotate(${f1(rot)} ${f1(tx)} ${f1(ty)})">${genes[i]}</text>`);
  }
  // legends
  [[ox + 420, 'Exp'], [ox + 486, 'qval']].forEach(([lx, lab], k) => {
    for (let i = 0; i < 70; i += 2) S.push(rrect(lx, oy + 60 + i, 10, 2, 0, k === 0 ? rampOP(1 - i / 70) : mix('#BFE0EA', '#2E7FA6', i / 70)));
    S.push(`<rect x="${lx}" y="${oy + 60}" width="10" height="70" fill="none" stroke="#999" stroke-width="0.5"/>`);
    S.push(txt(lx + 5, oy + 54, lab, 7, '#333', 'middle', 'bold'));
    if (k === 0) { S.push(txt(lx + 15, oy + 66, '2', 6, '#555', 'start')); S.push(txt(lx + 15, oy + 132, '-2', 6, '#555', 'start')); }
    else { S.push(txt(lx + 15, oy + 66, '1', 6, '#555', 'start')); S.push(txt(lx + 15, oy + 132, '0', 6, '#555', 'start')); }
  });
})();

/* ═══ f · Mantel test combo ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(2);
  frame(ox, oy, 'f', 'Mantel test · correlation + clusters');
  const envs = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Al', 'Fe', 'Mn', 'Zn', 'Mo', 'pH'];
  const n = 12, gx = ox + 216, gy = oy + 22, cw = 26, ch = 17;
  for (let r = 0; r < n; r++) for (let c = r + 1; c < n; c++) {
    const v = Math.abs(rnd() * 2 - 1) * 0.9, inset = (1 - Math.abs(v)) * 7;
    S.push(rrect(gx + c * cw + inset, gy + r * ch + inset * ch / cw, cw - inset * 2, ch - inset * 2, 3, rampTEAL((v + 1) / 1.9)));
  }
  envs.forEach((t, r) => S.push(txt(gx + n * cw + 6, gy + r * ch + ch / 2 + 2, t, 6.3, '#444', 'start')));
  envs.forEach((t, c) => S.push(txt(gx + c * cw + cw / 2, gy - 5, t, 6.3, '#444')));
  // cluster nodes
  const nodes = [[ox + 66, oy + 80, 'Cluster1', '#2FA79B'], [ox + 60, oy + 152, 'Cluster2', '#F5B041'], [ox + 70, oy + 222, 'Cluster3', '#E8709F']];
  nodes.forEach(([nx, ny, lab]) => { S.push(circle(nx, ny, 4.4, '#fff', '#666', 1.4)); S.push(txt(nx - 10, ny + 2.5, lab, 7, '#444', 'end')); });
  const pick = (r0) => { const a = []; for (let c = 0; c < n; c++) if (rnd() < 0.3) a.push(c); return a.length ? a : [Math.floor(rnd() * n)]; };
  nodes.forEach(([nx, ny, , col]) => {
    pick().forEach(c => {
      const tx = gx + c * cw + cw / 2, ty = gy + 4;
      const w = 0.8 + rnd() * 4;
      S.push(`<path d="M${f1(nx + 5)} ${f1(ny)}Q${f1((nx + tx) / 2)} ${f1(ty - 14)} ${f1(tx)} ${f1(ty)}" fill="none" stroke="${rnd() < 0.55 ? col : '#E3E3E3'}" stroke-width="${f1(w)}" opacity="0.9"/>`);
    });
  });
  // legends bottom-left
  S.push(txt(ox + 24, oy + 252, 'P value', 7, '#333', 'start', 'bold'));
  [['&lt; 0.01', '#2FA79B'], ['>= 0.05', '#BFBFBF'], ['0.01 - 0.05', '#F5B041']].forEach(([t, c], i) =>
    S.push(ln(ox + 80 + i * 74, oy + 249, ox + 96 + i * 74, oy + 249, c, 2.2), txt(ox + 100 + i * 74, oy + 252, t, 6, '#555', 'start')));
  S.push(txt(ox + 24, oy + 268, "Mantel's r", 7, '#333', 'start', 'bold'));
  [1, 2.2, 3.6].forEach((w, i) => S.push(ln(ox + 80 + i * 74, oy + 265, ox + 96 + i * 74, oy + 265, '#888', w)));
  for (let i = 0; i < 60; i++) S.push(rrect(ox + 330 + i, oy + 262, 1.2, 6, 0, rampTEAL(1 - i / 60)));
  S.push(txt(ox + 330, oy + 258, 'r: 0.8', 5.5, '#555', 'start')); S.push(txt(ox + 396, oy + 276, '-0.4', 5.5, '#555', 'start'));
})();

/* ═══ g · GSEA ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(3);
  frame(ox, oy, 'g', 'GSEA enrichment · running score');
  [['Hypoxia', '#8CC152', 'NES: 2.11'], ['Protein Secretion', '#F09A4B', 'NES: 2.09']].forEach(([lab, col, nes], k) => {
    const hx = ox + 8 + k * 272;
    S.push(txt(hx + 124, oy + 16, lab, 9, '#222', 'middle', 'bold'));
    // score box
    const bx = hx, by = oy + 24, bw = 248, bh = 112;
    S.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#fff" stroke="#999" stroke-width="0.8"/>`);
    const peak = 0.58 * bh, pts = [];
    for (let i = 0; i <= 100; i++) { const t = i / 100;
      const v = t < 0.28 ? peak * Math.pow(t / 0.28, 1.6) : peak * Math.exp(-(t - 0.28) * 3.1);
      pts.push([bx + t * bw, by + bh - v]); }
    S.push(`<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}L${bx + bw} ${by + bh}L${bx} ${by + bh}Z" fill="${col}" opacity="0.18"/>`);
    S.push(`<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}" fill="none" stroke="${col}" stroke-width="1.6"/>`);
    S.push(ln(bx, by + bh, bx + bw, by + bh, '#222', 1, '3 2'));
    S.push(txt(bx + bw - 4, by + 12, nes, 7, '#444', 'end', 'normal', 'font-style="italic"'));
    S.push(txt(bx + bw - 4, by + 23, 'Pvalue: &lt; 0.001', 6.5, '#444', 'end', 'normal', 'font-style="italic"'));
    // hit ticks
    const ty0 = oy + 146;
    S.push(ln(bx, ty0, bx + bw, ty0, '#222', 1.2));
    for (let i = 0; i < 70; i++) { const x = bx + rnd() * bw; S.push(ln(x, ty0, x, ty0 - rr(3, 9), '#111', 0.7)); }
    // heat band
    for (let i = 0; i < 80; i++) S.push(rrect(bx + i * bw / 80, ty0 + 3, bw / 80 + 0.4, 11, 0, k === 0 ? rampGP(rnd()) : rampBO(rnd())));
    // ranked list
    const rx = bx, ry = ty0 + 20, rw = bw, rh = 62;
    S.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#fff" stroke="#999" stroke-width="0.8"/>`);
    const zp = ry + 16, pts2 = [];
    for (let i = 0; i <= 100; i++) { const t = i / 100;
      const v = t > 0.93 ? -(t - 0.93) * 170 : 13 * Math.exp(-2.6 * t) + 0.4;
      pts2.push([rx + t * rw, zp + v]); }
    S.push(`<path d="M${rx} ${zp}L${pts2.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}L${rx + rw} ${zp}Z" fill="${col}" opacity="0.45"/>`);
    S.push(ln(rx, zp, rx + rw, zp, '#222', 1, '3 2'));
    if (k === 1) S.push(txt(bx + 124, ry + rh + 12, 'Rank in Ordered Dataset', 7, '#333'));
  });
})();

/* ═══ h · PCA confidence ellipses ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(3);
  frame(ox, oy, 'h', 'PCA · 95% confidence ellipses');
  const px = ox + 34, py = oy + 30, pw = 380, ph = 220;
  const X = v => px + (v + 6.5) / 13 * pw, Y = v => py + (4.3 - v) / 7.3 * ph;
  for (let i = 1; i < 6; i++) S.push(ln(px + pw * i / 6, py, px + pw * i / 6, py + ph, '#E8EAEE', 0.7));
  for (let i = 1; i < 4; i++) S.push(ln(px, py + ph * i / 4, px + pw, py + ph * i / 4, '#E8EAEE', 0.7));
  S.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#555" stroke-width="1.1"/>`);
  const G = [['GP1', '#F5A94E', -4.2, 0.3, -68], ['GP2', '#7FAFD8', 0.5, 2.0, -82], ['GP3', '#D883A9', 3.9, -1.2, -38]];
  G.forEach(([lab, col, mx, my, rot]) => {
    const pts = []; for (let i = 0; i < 12; i++) pts.push([N(mx, 0.85), N(my, 0.72)]);
    const cxm = X(pts.reduce((s, p) => s + p[0], 0) / 12), cym = Y(pts.reduce((s, p) => s + p[1], 0) / 12);
    pts.forEach(([a, b]) => S.push(circle(X(a), Y(b), 3.4, col, '#fff', 0.7)));
    S.push(`<ellipse cx="${f1(cxm)}" cy="${f1(cym)}" rx="${f1(2.3 / 13 * pw)}" ry="${f1(1.5 / 7.3 * ph)}" fill="${col}" opacity="0.25" stroke="${col}" stroke-width="1.5" transform="rotate(${rot} ${f1(cxm)} ${f1(cym)})"/>`);
  });
  [-4, -2, 0, 2, 4].forEach(v => S.push(txt(X(v), py + ph + 10, v, 6.5, '#555')));
  [-2, 0, 2, 4].forEach(v => S.push(txt(px - 6, Y(v) + 2, v, 6.5, '#555', 'end')));
  S.push(txt(px + pw / 2, py + ph + 24, 'PC1 (70.5%)', 8.5, '#333', 'middle', 'bold'));
  S.push(`<text x="${f1(px - 22)}" y="${f1(py + ph / 2)}" font-size="8.5" fill="#333" font-weight="bold" text-anchor="middle" transform="rotate(-90 ${f1(px - 22)} ${f1(py + ph / 2)})">PC2 (7.8%)</text>`);
  G.forEach(([lab, col], i) => { S.push(circle(ox + 466, oy + 60 + i * 20, 4, col, '#fff', 0.7)); S.push(txt(ox + 476, oy + 63 + i * 20, lab, 7.5, '#444', 'start')); });
})();

/* ═══ i · jointplot with marginals ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(4);
  frame(ox, oy, 'i', 'Joint scatter · marginal densities');
  const mx = ox + 22, my = oy + 48, mw = 300, mh = 196, mt = 30, mr = 84;
  const X = v => mx + (v - 3) / 14.5 * mw, Y = v => my + (23.5 - v) / 21 * mh;
  S.push(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#fff" stroke="#555" stroke-width="1"/>`);
  const D = [['#8CC152', 55, p => 3.5 + 1.05 * p + N(0, 2)], ['#5B9BD5', 45, p => 6.5 + 0.5 * p + N(0, 1.7)]];
  const data = D.map(([col, n, fn]) => { const a = []; for (let i = 0; i < n; i++) { const gx2 = 3.5 + rnd() * 13; a.push([gx2, Math.max(3, fn(gx2))]); } return a; });
  // CI bands + lines
  D.forEach(([col, , fn], k) => {
    const p1 = [X(3.5), Y(fn(3.5))], p2 = [X(16.5), Y(fn(16.5))];
    S.push(`<path d="M${f1(p1[0])} ${f1(p1[1] + 7)}L${f1(p2[0])} ${f1(p2[1] + 7)}L${f1(p2[0])} ${f1(p2[1] - 7)}L${f1(p1[0])} ${f1(p1[1] - 7)}Z" fill="${col}" opacity="0.15"/>`);
    S.push(ln(p1[0], p1[1], p2[0], p2[1], col, 2));
  });
  data.forEach((a, k) => a.forEach(([gx2, gy2]) => S.push(circle(X(gx2), Y(gy2), 3.2, D[k][0], '#fff', 0.6))));
  [[3.5, 'Day: R² = 0.558 , p &lt; 0.001', '#6E9E3D'], [2.2, 'Night: R² = 0.336 , p &lt; 0.001', '#4A80BC']].forEach(([dy2, t, c]) =>
    S.push(txt(mx + 8, my + 16 + dy2 * 9, t, 7, c, 'start', 'bold')));
  [5, 10, 15].forEach(v => { S.push(txt(X(v), my + mh + 10, v, 6.5, '#555')); S.push(txt(mx - 6, Y(v) + 2, v, 6.5, '#555', 'end')); });
  S.push(txt(mx + mw / 2, my + mh + 24, 'Glucose', 8.5, '#333'));
  S.push(`<text x="${f1(mx - 18)}" y="${f1(my + mh / 2)}" font-size="8" fill="#333" text-anchor="middle" transform="rotate(-90 ${f1(mx - 18)} ${f1(my + mh / 2)})">Glycosylated Hemoglobin</text>`);
  // marginal densities
  const kde = (arr, v, bw2) => arr.reduce((s, p) => s + Math.exp(-Math.pow((v - p) / bw2, 2)), 0);
  [0, 1].forEach(k => {
    const col = D[k][0], xs = data[k].map(p => p[0]), ys = data[k].map(p => p[1]);
    const top = []; for (let i = 0; i <= 50; i++) { const v = 3 + i / 50 * 14.5; top.push([X(v), my - 4 - kde(xs, v, 1.1) * (mt - 8) / 30]); }
    S.push(`<path d="M${f1(X(3))} ${f1(my - 2)}L${top.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}L${f1(X(17.5))} ${f1(my - 2)}Z" fill="${col}" opacity="${k === 0 ? 0.4 : 0.55}"/>`);
    const rit = []; for (let i = 0; i <= 50; i++) { const v = 3 + i / 50 * 21; rit.push([mx + mw + 4 + kde(ys, v, 1.6) * (mr - 16) / 26, Y(v)]); }
    S.push(`<path d="M${f1(mx + mw + 2)} ${f1(Y(3))}L${rit.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}L${f1(mx + mw + 2)} ${f1(Y(24))}Z" fill="${col}" opacity="${k === 0 ? 0.4 : 0.55}"/>`);
  });
})();

/* ═══ j · bar + half-violin + jitter ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(4);
  frame(ox, oy, 'j', 'Bar · half-violin · raw points');
  const bx0 = ox + 46, by0 = oy + 26, bw2 = 440, bh = 218;
  const Y = v => by0 + bh - v / 200 * bh;
  [0, 50, 100, 150, 200].forEach(v => { S.push(ln(bx0, Y(v), bx0 + bw2, Y(v), v === 0 ? '#555' : '#E8EAEE', v === 0 ? 1.2 : 0.8)); S.push(txt(bx0 - 8, Y(v) + 2.5, v, 7, '#555', 'end')); });
  S.push(ln(bx0, by0 - 6, bx0, by0 + bh, '#555', 1.2));
  const groups = [['OE-3', '#5B9BD5', 100, 10], ['OE-5', '#2FB5AB', 103, 9], ['OE-6', '#8FCE6B', 155, 17], ['WT', '#F4795B', 33, 7]];
  groups.forEach(([lab, col, h, err], i) => {
    const cx = bx0 + 68 + i * 106, wd = 46;
    S.push(rrect(cx - wd / 2, Y(h), wd, Y(0) - Y(h), 3, col, col, 1.2)).replace && 0;
    S[S.length - 1] = rrect(cx - wd / 2, Y(h), wd, Y(0) - Y(h), 2, mix(col, '#ffffff', 0.35), col, 1.3);
    S.push(ln(cx, Y(h + err), cx, Y(h - err), '#444', 1.4), ln(cx - 8, Y(h + err), cx + 8, Y(h + err), '#444', 1.4), ln(cx - 8, Y(h - err), cx + 8, Y(h - err), '#444', 1.4));
    // half violin right
    const vx = cx + wd / 2 + 2, hh = err * 3.4, vw = 26;
    S.push(`<path d="M${f1(vx)} ${f1(Y(h) - hh)}Q${f1(vx + vw)} ${f1(Y(h) - hh * 0.35)} ${f1(vx + vw * 0.92)} ${f1(Y(h))}Q${f1(vx + vw)} ${f1(Y(h) + hh * 0.35)} ${f1(vx)} ${f1(Y(h) + hh)}Z" fill="${col}" opacity="0.35"/>`);
    for (let k = 0; k < 8; k++) S.push(circle(vx + 4 + rnd() * vw * 0.7, Y(h) + N(0, hh * 0.42), 3.1, col, '#fff', 0.7));
    S.push(txt(cx, by0 + bh + 16, lab, 8, '#444'));
  });
  S.push(txt(ox + 16, oy + 16, 'Linalool content', 8.5, '#333', 'middle', 'bold'));
})();

/* ═══ k · box + jitter + significance brackets ═══ */
(function () {
  const ox = COLX[0], oy = ROWY(5);
  frame(ox, oy, 'k', 'Boxplot · jitter · significance');
  const bx0 = ox + 52, by0 = oy + 40, bw2 = 430, bh = 200;
  const Y = v => by0 + bh - v / 11 * bh;
  [0, 2, 4, 6, 8, 10].forEach(v => { S.push(ln(bx0, Y(v), bx0 + bw2, Y(v), '#E8EAEE', 0.8)); S.push(txt(bx0 - 8, Y(v) + 2.5, v, 7, '#555', 'end')); });
  S.push(ln(bx0, by0 - 4, bx0, by0 + bh, '#555', 1.2));
  const groups = [['IgG', '#5B9BD5', 5.7, 1.1], ['aITGA11', '#2FB5AB', 3.2, 0.9], ['aCHI3L1', '#8FCE6B', 5.5, 1.0], ['aT_aC', '#F4795B', 2.3, 0.55]];
  groups.forEach(([lab, col, med, iqr], i) => {
    const cx = bx0 + 62 + i * 104, wd = 50;
    const q1 = Y(med - iqr), q3 = Y(med + iqr), lo = Y(Math.max(0.4, med - iqr * 2)), hi = Y(med + iqr * 2);
    S.push(ln(cx, hi, cx, q3, col, 1.3), ln(cx, q1, cx, lo, col, 1.3));
    S.push(ln(cx - 9, hi, cx + 9, hi, col, 1.3), ln(cx - 9, lo, cx + 9, lo, col, 1.3));
    S.push(rrect(cx - wd / 2, q3, wd, q1 - q3, 0, mix(col, '#ffffff', 0.62), col, 1.5));
    S.push(ln(cx - wd / 2, Y(med), cx + wd / 2, Y(med), col, 2));
    for (let k = 0; k < 13; k++) S.push(circle(cx - wd / 2 + 6 + rnd() * (wd - 12), Y(Math.max(0.4, med + N(0, iqr * 1.15))), 2.6, col, '#fff', 0.6));
    S.push(txt(cx, by0 + bh + 16, lab, 8, '#444'));
  });
  // brackets
  const br = (a, b, label, yv) => {
    const x1 = bx0 + 62 + a * 104, x2 = bx0 + 62 + b * 104;
    S.push(ln(x1, yv, x1, yv + 4, '#333', 0.9), ln(x2, yv, x2, yv + 4, '#333', 0.9), ln(x1, yv, x2, yv, '#333', 0.9));
    S.push(txt((x1 + x2) / 2, yv - 3, label, 7.5, '#333'));
  };
  br(0, 1, '3e-09', Y(9.6)); br(0, 2, '0.14', Y(10.7)); br(0, 3, '8.6e-14', Y(11.6) - 4);
  S.push(`<text x="${f1(ox + 18)}" y="${f1(oy + 140)}" font-size="8.5" fill="#333" font-weight="bold" text-anchor="middle" transform="rotate(-90 ${f1(ox + 18)} ${f1(oy + 140)})">LYVE-1 positive vessel/tumor</text>`);
})();

/* ═══ l · rose / polar bar ═══ */
(function () {
  const ox = COLX[1], oy = ROWY(5);
  frame(ox, oy, 'l', 'Polar bar · monthly');
  const cx = ox + 210, cy = oy + 158, r0 = 16;
  const vals = [12.1, 9.5, 8.3, 7.2, 12.7, 13.9, 16.4, 12.5, 14.2, 7.2, 9.2, 7.8];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const QC = ['#8FB8E8', '#F5D9A8', '#63C1A8', '#A79AD8'];
  vals.forEach((v, i) => {
    const r = r0 + v / 16.4 * 106, a0 = i * 30 - 88, a1 = (i + 1) * 30 - 92;
    S.push(`<path d="${annPath(cx, cy, r0, r, a0, a1)}" fill="${QC[Math.floor(i / 3)]}" stroke="#fff" stroke-width="1"/>`);
    const [tx, ty] = polar(cx, cy, r * 0.72, i * 30 + 15 - 90);
    S.push(txt(tx, ty + 2, v.toFixed(1), 6.2, '#fff'));
    const [lx, ly] = polar(cx, cy, r + 13, i * 30 + 15 - 90);
    S.push(txt(lx, ly + 2.5, mon[i], 7, '#555'));
  });
  S.push(circle(cx, cy, r0 - 3, '#fff', '#ddd', 0.8));
  S.push(txt(ox + 470, oy + 60, 'Quarter', 8, '#333', 'middle', 'bold'));
  ['1', '2', '3', '4'].forEach((q, i) => { S.push(rrect(ox + 448, oy + 72 + i * 18, 12, 12, 2.5, QC[i])); S.push(txt(ox + 466, oy + 82 + i * 18, q, 7.5, '#444', 'start')); });
})();

S.push('</svg>');
const out = path.join(__dirname, '..', '..', 'assets', 'showcase-bio.svg');
fs.writeFileSync(out, S.join('\n'));
console.log('written', out, (fs.statSync(out).size / 1024).toFixed(1) + 'KB');
