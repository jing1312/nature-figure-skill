/* build-showcase-plus.js — 9 advanced compositions, jewel-pastel palette */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260921;
const rnd = () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const N = (m, s) => m + s * (rnd() + rnd() + rnd() + rnd() - 2) * 1.4;

const C = {
  blue: '#6FA8CE', sky: '#9CC8E8', teal: '#6FBFB2', mint: '#86C6A8',
  sage: '#A9C08C', honey: '#F2C57C', apricot: '#F0A875', rose: '#E98CA6',
  lilac: '#B49CD9', plum: '#9B8AA6', gray: '#AAB0B0', ink: '#333333',
  tick: '#4A4A4A'
};
const h2r = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const r2h = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mixr = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };
const shade = (h, t) => mixr(h, '#FFFFFF', t);

const rect = (x, y, w, h, fill, op = 1, rx = 0) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${fill}" fill-opacity="${op}"/>`;
const ln = (x1, y1, x2, y2, st, sw = 1, dash = '') =>
  `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${st}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const circle = (cx, cy, r, fill, op = 1, st = 'none', sw = 0) =>
  `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;
const pth = (d, fill, op = 1, st = 'none', sw = 0) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${op}" stroke="${st}" stroke-width="${sw}"/>`;
const txt = (x, y, t, size = 8, fill = C.tick, anchor = 'middle', w = 'normal', rot = 0) =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}" font-family="Helvetica,Arial,sans-serif"${rot ? ` transform="rotate(${rot} ${f1(x)} ${f1(y)})"` : ''}>${t}</text>`;

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

/* ── layout: 3 cols x 3 rows ── */
const W = 1080, COLW = 352, PW = 316, PH = 226;
const ROWY = r => 66 + r * 296;
const X0 = col => 24 + col * COLW;
const S = [];

S.push(txt(16, 26, 'FigureForge plus atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Nine advanced compositions in a jewel-pastel palette.', 10.5, '#777', 'start'));

/* ── a | chord diagram (ligand-receptor crosstalk) ── */
{
  const cx = X0(0) + PW / 2 + 4, cy = ROWY(0) + 130, R = 80;
  head(S, 'a', 'cell crosstalk chord', X0(0) + 30, ROWY(0), PW);
  const names = ['T cell', 'B cell', 'Macro', 'Fibro', 'NK', 'Endo'];
  const cols = [C.rose, C.honey, C.blue, C.mint, C.lilac, C.teal];
  const F = [[0, 2, 14], [0, 3, 9], [0, 4, 6], [1, 2, 8], [1, 5, 5], [2, 3, 11], [2, 4, 4], [3, 5, 7], [4, 5, 3], [0, 1, 5]];
  const tot = names.map((_, i) => F.reduce((s, f) => s + (f[0] === i || f[1] === i ? f[2] : 0), 0));
  const T = tot.reduce((x, y) => x + y, 0);
  const GAP = 0.10;
  const unit = (2 * Math.PI - GAP * names.length) / T;
  const ang = []; let a0 = -Math.PI / 2 + GAP / 2;
  tot.forEach((t, i) => { ang[i] = a0; a0 += t * unit + GAP; });
  const cur = ang.slice();
  const P = (a, r) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  F.forEach(([i, j, v]) => {
    const a1 = cur[i], a2 = cur[i] + v * unit; cur[i] = a2;
    const b1 = cur[j], b2 = cur[j] + v * unit; cur[j] = b2;
    const d = `M${P(a1, R)}A${R} ${R} 0 0 1 ${P(a2, R)}C${P(a2, R * 0.32)} ${P(b1, R * 0.32)} ${P(b1, R)}A${R} ${R} 0 0 1 ${P(b2, R)}C${P(b2, R * 0.32)} ${P(a1, R * 0.32)} ${P(a1, R)}Z`;
    S.push(pth(d, cols[i], 0.42));
  });
  names.forEach((nm, i) => {
    const am = ang[i] + tot[i] * unit / 2;
    const [xa, ya] = [cx + (R + 6) * Math.cos(am), cy + (R + 6) * Math.sin(am)];
    const [xb, yb] = [cx + (R + 20) * Math.cos(am), cy + (R + 20) * Math.sin(am)];
    S.push(`<path d="M${P(ang[i], R + 4)}A${R + 4} ${R + 4} 0 0 1 ${P(ang[i] + tot[i] * unit, R + 4)}" fill="none" stroke="${cols[i]}" stroke-width="6" stroke-opacity="0.95"/>`);
    S.push(txt(xb, yb + 2.5, nm, 8.5, C.ink, Math.cos(am) < -0.2 ? 'end' : (Math.cos(am) > 0.2 ? 'start' : 'middle'), 'bold'));
  });
}

/* ── b | upset plot (multi-omics overlaps) ── */
{
  const x = X0(1) + 4, y = ROWY(0) + 34, w = PW - 30, h = PH - 58;
  head(S, 'b', 'upset — multi-omics', X0(1) + 30, ROWY(0), PW);
  const sets = [['WES', C.blue, 58], ['RNA', C.rose, 44], ['Prot', C.mint, 36], ['Phos', C.honey, 30]];
  const combos = [
    [[0], 18], [[1], 9], [[0, 1], 12], [[0, 2], 8], [[0, 3], 5], [[1, 2], 4],
    [[2, 3], 3], [[0, 1, 2], 6], [[0, 1, 3], 3], [[0, 2, 3], 2], [[0, 1, 2, 3], 4], [[1, 3], 2]
  ].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxC = Math.max(...combos.map(c => c[1]));
  const cwid = w - 62, mx = x + 58, my = y + h - 62, chh = 62 / 4;
  /* vertical size bars above matrix */
  combos.forEach(([idx, v], i) => {
    const bxc = mx + 14 + i * (cwid - 22) / (combos.length - 1);
    const bh = v / maxC * 54;
    S.push(rect(bxc - 6, my - 4 - bh, 12, bh, C.blue, 0.85, 2));
    S.push(txt(bxc, my - 10 - bh, v, 8, C.tick));
    /* matrix dots + connector */
    const ys = [];
    sets.forEach((st, si) => {
      const cyy = my + si * chh + chh / 2;
      if (idx.includes(si)) { S.push(circle(bxc, cyy, 3.4, C.ink, 0.85)); ys.push(cyy); }
      else S.push(circle(bxc, cyy, 2.6, '#E4E4E4'));
    });
    if (ys.length > 1) S.push(ln(bxc, ys[0], bxc, ys[ys.length - 1], C.ink, 1.2));
  });
  /* left: set size bars */
  sets.forEach(([nm, col, v], si) => {
    const cyy = my + si * chh + chh / 2;
    S.push(rect(x + 2, cyy - 4, v / 58 * 44, 8, col, 0.9, 2));
    S.push(txt(x + 2, cyy - 7.5, nm, 7.5, C.ink, 'start', 'bold'));
    S.push(txt(x + 2 + v / 58 * 44 + 4, cyy + 3, v, 7.5, C.tick, 'start'));
  });
}

/* ── c | tissue network (module structure) ── */
{
  const x = X0(2) + 4, y = ROWY(0) + 30, w = PW - 30, h = PH - 46;
  head(S, 'c', 'tissue network', X0(2) + 30, ROWY(0), PW);
  const mods = [[C.blue, x + 78, y + 62, 'CD8 core'], [C.rose, x + w - 66, y + 58, 'Macrophage'], [C.mint, x + w / 2, y + h - 52, 'Fibroblast']];
  const nodes = [];
  mods.forEach(([col, mx, my, nm], mi) => {
    nodes.push([mx, my, 9 + rnd() * 3, col, nm]);
    for (let k = 0; k < 5; k++) {
      const a = k * 1.256 + mi * 0.7;
      nodes.push([mx + Math.cos(a) * (30 + rnd() * 18), my + Math.sin(a) * (26 + rnd() * 14), 3.4 + rnd() * 2.6, col, '']);
    }
  });
  /* intra edges */
  for (let m = 0; m < 3; m++) {
    for (let k = 1; k < 6; k++) {
      const [hx, hy, hr] = nodes[m * 6], [px2, py2] = nodes[m * 6 + k];
      const mxx = (hx + px2) / 2 + N(0, 6), myy = (hy + py2) / 2 + N(0, 6);
      S.push(`<path d="M${f1(hx)} ${f1(hy)}Q${f1(mxx)} ${f1(myy)} ${f1(px2)} ${f1(py2)}" fill="none" stroke="${nodes[m * 6][3]}" stroke-width="1.4" stroke-opacity="0.35"/>`);
    }
    const [a1, b1] = nodes[m * 6 + 1], [a2, b2] = nodes[m * 6 + 3];
    S.push(`<path d="M${f1(a1)} ${f1(b1)}L${f1(a2)} ${f1(b2)}" stroke="${nodes[m * 6][3]}" stroke-width="1" stroke-opacity="0.25"/>`);
  }
  /* inter edges */
  [[0, 7], [7, 13], [13, 1], [2, 14]].forEach(([i, j]) => {
    const [xi, yi] = nodes[i], [xj, yj] = nodes[j];
    const mxx = (xi + xj) / 2, myy = (yi + yj) / 2 + N(0, 8);
    S.push(`<path d="M${f1(xi)} ${f1(yi)}Q${f1(mxx)} ${f1(myy)} ${f1(xj)} ${f1(yj)}" fill="none" stroke="#9A9A9A" stroke-width="1.6" stroke-opacity="0.5" stroke-dasharray="4 3"/>`);
  });
  nodes.forEach(([nx2, ny2, r2, col, nm]) => {
    S.push(circle(nx2, ny2, r2, col, 0.92, '#FFFFFF', 1.2));
    if (nm) S.push(txt(nx2, ny2 + r2 + 10, nm, 8.5, C.ink, 'middle', 'bold'));
  });
}

/* ── d | ternary composition ── */
{
  const x = X0(0) + 22, y = ROWY(1) + 34, w = 240, h = 172;
  head(S, 'd', 'ternary composition', X0(0) + 30, ROWY(1), PW);
  const A = [x + w / 2, y], B = [x, y + h], Cc = [x + w, y + h];
  /* grid */
  for (let t = 1; t <= 4; t++) {
    const tt = t / 5;
    S.push(ln(A[0] + (B[0] - A[0]) * tt, A[1] + (B[1] - A[1]) * tt, Cc[0] + (B[0] - Cc[0]) * tt, Cc[1] + (B[1] - Cc[1]) * tt, '#D5D5D5', 0.7));
    S.push(ln(A[0] + (Cc[0] - A[0]) * tt, A[1] + (Cc[1] - A[1]) * tt, B[0] + (Cc[0] - B[0]) * tt, B[1] + (Cc[1] - B[1]) * tt, '#D5D5D5', 0.7));
    S.push(ln(B[0] + (A[0] - B[0]) * tt, B[1] + (A[1] - B[1]) * tt, Cc[0] + (A[0] - Cc[0]) * tt, Cc[1] + (A[1] - Cc[1]) * tt, '#D5D5D5', 0.7));
  }
  S.push(pth(`M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${Cc[0]} ${Cc[1]}Z`, 'none', 1, C.ink, 1.2));
  const groups = [[C.blue, 0.15, 0.55, 0.30], [C.rose, 0.30, 0.20, 0.50], [C.mint, 0.18, 0.30, 0.52]];
  groups.forEach(([col, ca, cb, cc]) => {
    for (let k = 0; k < 12; k++) {
      let a = Math.max(0.05, Math.min(0.9, N(ca, 0.07)));
      let b = Math.max(0.05, Math.min(0.9, N(cb, 0.08)));
      let c = 1 - a - b;
      if (c < 0.05) { b = 0.95 - a; c = 1 - a - b; }
      const px2 = a * A[0] + b * B[0] + c * Cc[0];
      const py2 = a * A[1] + b * B[1] + c * Cc[1];
      S.push(circle(px2, py2, 3.6, col, 0.8, '#FFFFFF', 0.8));
    }
  });
  S.push(txt(A[0], A[1] - 8, 'Tumor', 9, C.ink, 'middle', 'bold'));
  S.push(txt(B[0] - 4, B[1] + 13, 'Stroma', 9, C.ink, 'middle', 'bold'));
  S.push(txt(Cc[0] + 4, Cc[1] + 13, 'Necrosis', 9, C.ink, 'middle', 'bold'));
  S.push(txt(x - 14, y + h / 2, 'tumor fraction', 8, C.tick, 'middle', 'normal', -90));
  S.push(txt(x + w + 14, y + h / 2 + 4, 'necrosis fraction', 8, C.tick, 'middle', 'normal', 90));
}

/* ── e | clustermap (dendrogram + heatmap) ── */
{
  const x = X0(1) + 8, y = ROWY(1) + 40, h = PH - 66;
  head(S, 'e', 'clustermap', X0(1) + 30, ROWY(1), PW);
  const nc = 8, nr = 9;
  const dw = 20, lw2 = 32, cw = (PW - 30 - dw - lw2 - 18) / nc, ch = h / nr;
  const div = v => v >= 0 ? mixr('#F7F0F2', '#D97A93', Math.min(1, v / 2.4)) : mixr('#F0F6F2', '#5FA98B', Math.min(1, -v / 2.4));
  const genes = ['CXCL9', 'CXCL10', 'IDO1', 'CD274', 'MKI67', 'TYMS', 'PCNA', 'MCM2', 'GZMB'];
  const mvals = [];
  genes.forEach((g, i) => {
    const base = i < 4 ? 0.9 : (i < 6 ? -0.4 : 0.2);
    mvals.push(Array.from({ length: nc }, () => base + N(0, 0.55)));
  });
  const hx = x + dw + lw2 + 6, hy = y + 24;
  /* top dendrogram: merge pairs progressively */
  const order = [0, 1, 2, 3, 4, 5, 6, 7];
  const merges = [[[1, 0], 0.35], [[3, 2], 0.4], [[5, 4], 0.55], [[6, 3], 0.7], [[7, 6], 0.85]];
  merges.forEach(([pr, hh], mi) => {
    const i1 = pr[0], i2 = pr[1];
    const x1 = hx + i1 * cw + cw / 2, x2 = hx + i2 * cw + cw / 2;
    const y1 = hy - 4 - hh * 20, yTop = hy - 4 - (hh + 0.12) * 20;
    S.push(ln(x1, y1, x1, yTop, '#8A8A8A', 0.9));
    S.push(ln(x2, y1, x2, yTop, '#8A8A8A', 0.9));
    S.push(ln(x1, yTop, x2, yTop, '#8A8A8A', 0.9));
  });
  /* left dendrogram */
  [[0, 1], [3, 2], [5, 4], [7, 8]].forEach(([r1, r2], mi) => {
    const y1 = hy + r1 * ch + ch / 2, y2 = hy + r2 * ch + ch / 2;
    const x1 = hx - 4 - (0.4 + mi * 0.15) * 16, yTop2 = hy + (r1 + r2) / 2 * ch + ch / 2;
    S.push(ln(hx - 4, y1, x1, y1, '#8A8A8A', 0.9));
    S.push(ln(hx - 4, y2, x1, y2, '#8A8A8A', 0.9));
    S.push(ln(x1, y1, x1, y2, '#8A8A8A', 0.9));
  });
  mvals.forEach((row, i) => {
    row.forEach((v, j) => S.push(rect(hx + j * cw + 0.6, hy + i * ch + 0.6, cw - 1.2, ch - 1.2, div(v), 0.95)));
    S.push(txt(hx - lw2 - 8, hy + i * ch + ch / 2 + 3, genes[i], 7.5, C.tick, 'end'));
  });
  /* colorbar */
  for (let k = 0; k < 40; k++) {
    const v = -2.4 + 4.8 * k / 39;
    S.push(rect(x + PW - 24, hy + h - (k + 1) * h / 40, 7, h / 40 + 0.5, div(v)));
  }
  S.push(txt(x + PW - 16, hy + 6, '2.4', 7, C.tick, 'start'));
  S.push(txt(x + PW - 16, hy + h, '-2.4', 7, C.tick, 'start'));
  S.push(txt(x + PW - 20.5, hy + h + 12, 'z', 8, C.ink, 'middle', 'bold'));
}

/* ── f | treemap (pathway hierarchy) ── */
{
  const x = X0(2) + 8, y = ROWY(1) + 34, w = PW - 30, h = PH - 56;
  head(S, 'f', 'treemap', X0(2) + 30, ROWY(1), PW);
  const cats = [
    ['Metabolism', 0.34, C.blue, [['Glycolysis', 0.55], ['FA synthesis', 0.45]]],
    ['Immune', 0.26, C.rose, [['IFN response', 0.6], ['Antigen', 0.4]]],
    ['Cell cycle', 0.18, C.mint, [['G2M', 0.5], ['E2F', 0.5]]],
    ['ECM', 0.12, C.honey, [['Collagen', 0.65], ['MMP', 0.35]]],
    ['Signaling', 0.10, C.lilac, [['WNT', 0.55], ['Notch', 0.45]]]
  ];
  /* layout rows: [0.34,0.26] / [0.18] / [0.12,0.10] over heights 0.56/0.24/0.20 */
  const rows = [[0, 1], [2], [3, 4]];
  const rh = [0.56, 0.24, 0.20];
  let yy = y;
  rows.forEach((row, ri) => {
    const hh = h * rh[ri];
    let xx = x;
    const tot2 = row.reduce((s2, i) => s2 + cats[i][1], 0);
    row.forEach(ci => {
      const fr = cats[ci][1] / tot2;
      const ww = (w - (row.length - 1) * 3) * fr;
      const [nm, share, col, subs] = cats[ci];
      S.push(rect(xx, yy, ww, hh, col, 0.88, 3));
      S.push(txt(xx + 5, yy + 12, nm, 9, '#FFFFFF', 'start', 'bold'));
      S.push(txt(xx + ww - 5, yy + 12, Math.round(share * 100) + '%', 8, '#FFFFFF', 'end'));
      let sx = xx + 3, sy2 = yy + 18;
      const sw2 = ww - 6, sh2 = hh - 24;
      subs.forEach(([snm, sf]) => {
        const sww = (sw2 - (subs.length - 1) * 2) * sf;
        S.push(rect(sx, sy2, sww, sh2, shade(col, 0.45), 0.95, 2));
        if (sww > 34) S.push(txt(sx + sww / 2, sy2 + sh2 / 2 + 2.5, snm, 7.5, C.ink));
        sx += sww + 2;
      });
      xx += ww + 3;
    });
    yy += hh + 3;
  });
}

/* ── g | sunburst (hierarchy rings) ── */
{
  const cx = X0(0) + PW / 2 + 2, cy = ROWY(2) + 128, R1 = 30, R2 = 56, R3 = 82;
  head(S, 'g', 'sunburst', X0(0) + 30, ROWY(2), PW);
  const cats = [['Metabolism', 0.30, C.blue, [['Glycolysis', 0.6], ['TCA', 0.4]]],
                ['Immune', 0.24, C.rose, [['IFN', 0.55], ['TCR', 0.45]]],
                ['Cell cycle', 0.18, C.mint, [['G2M', 0.5], ['E2F', 0.5]]],
                ['ECM', 0.16, C.honey, [['Collagen', 0.6], ['MMP', 0.4]]],
                ['Signaling', 0.12, C.lilac, [['WNT', 0.55], ['Notch', 0.45]]]];
  const P = (a, r) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  const sector = (a1, a2, r0, r1, fill, op = 0.92) =>
    pth(`M${P(a1, r0)}L${P(a1, r1)}A${r1} ${r1} 0 0 1 ${P(a2, r1)}L${P(a2, r0)}A${r0} ${r0} 0 0 0 ${P(a1, r0)}Z`, fill, op);
  S.push(circle(cx, cy, R1 - 4, '#FFFFFF', 1, '#C9C9C9', 1));
  S.push(txt(cx, cy + 3, 'Cohort', 9, C.ink, 'middle', 'bold'));
  let a = -Math.PI / 2;
  cats.forEach(([nm, share, col, subs]) => {
    const sw2 = share * 2 * Math.PI - 0.035;
    const a1 = a, a2 = a + sw2;
    S.push(sector(a1, a2, R1, R2, col, 0.92));
    const am = (a1 + a2) / 2;
    if (sw2 > 0.5) {
      let deg = 90 / Math.PI * am;
      if (deg > 90 || deg < -90) deg += 180;
      S.push(txt(cx + (R1 + R2) / 2 * Math.cos(am), cy + (R1 + R2) / 2 * Math.sin(am), nm, 7.5, '#FFFFFF', 'middle', 'bold', deg));
    }
    let b = a1;
    subs.forEach(([snm, sf]) => {
      const s2 = sf * sw2 - 0.02;
      S.push(sector(b, b + s2, R2, R3, shade(col, 0.42), 0.95));
      b += s2 + 0.02;
    });
    a = a2 + 0.035;
  });
}

/* ── h | hexbin density ── */
{
  const x = X0(1) + 8, y = ROWY(2) + 34, w = PW - 40, h = PH - 58;
  head(S, 'h', 'hexbin density', X0(1) + 30, ROWY(2), PW);
  const pts = [];
  for (let k = 0; k < 130; k++) pts.push([N(0.42, 0.13), N(0.45, 0.16)]);
  for (let k = 0; k < 60; k++) pts.push([N(0.72, 0.09), N(0.28, 0.1)]);
  for (let k = 0; k < 40; k++) pts.push([N(0.2, 0.08), N(0.72, 0.09)]);
  const r2 = 8.2, hw = Math.sqrt(3) * r2, vh = 1.5 * r2;
  const cols2 = Math.floor(w / hw), rows2 = Math.floor(h / vh);
  const bins = {};
  pts.forEach(([px2, py2]) => {
    const row = Math.max(0, Math.min(rows2 - 1, Math.floor((1 - py2) * h / vh)));
    const off = row % 2 ? hw / 2 : 0;
    const col = Math.max(0, Math.min(cols2 - 1, Math.floor((px2 * w - off) / hw)));
    const key = row + '-' + col;
    bins[key] = (bins[key] || 0) + 1;
  });
  const maxB = Math.max(...Object.values(bins));
  const ramp = c => mixr('#F2EEF3', '#B4658F', Math.sqrt(c / maxB));
  for (let row = 0; row < rows2; row++) {
    const off = row % 2 ? hw / 2 : 0;
    for (let col = 0; col < cols2; col++) {
      const cnt = bins[row + '-' + col] || 0;
      const cx2 = x + col * hw + off + hw / 2, cy2 = y + row * vh + r2;
      let d = '';
      for (let k = 0; k < 6; k++) {
        const aa = Math.PI / 180 * (60 * k - 90);
        d += (k ? 'L' : 'M') + f1(cx2 + r2 * Math.cos(aa)) + ' ' + f1(cy2 + r2 * Math.sin(aa));
      }
      S.push(pth(d + 'Z', cnt ? ramp(cnt) : '#FAFAFA', 1, cnt ? 'none' : '#E8E8E8', 0.6));
    }
  }
  /* colorbar */
  for (let k = 0; k < 34; k++) S.push(rect(x + w + 8, y + h - (k + 1) * h / 34, 7, h / 34 + 0.5, mixr('#F2EEF3', '#B4658F', Math.sqrt((k + 1) / 34))));
  S.push(txt(x + w + 20, y + 8, maxB + '', 7, C.tick, 'start'));
  S.push(txt(x + w + 20, y + h, '1', 7, C.tick, 'start'));
  S.push(txt(x + w / 2, y + h + 24, 'marker A (norm.)', 9.5, C.ink, 'middle', 'bold'));
  S.push(txt(x - 30, y + h / 2, 'marker B (norm.)', 9.5, C.ink, 'middle', 'bold', -90));
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1], t => f1(t), t => f1(t));
}

/* ── i | parallel coordinates ── */
{
  const x = X0(2) + 8, y = ROWY(2) + 42, w = PW - 34, h = PH - 76;
  head(S, 'i', 'parallel coordinates', X0(2) + 30, ROWY(2), PW);
  const dims = ['Age', 'BMI', 'HbA1c', 'LDL', 'CRP'];
  const groups = [[C.blue, 0, 0.14], [C.rose, 0.16, -0.1], [C.mint, -0.12, 0.06]];
  const nA = w / (dims.length - 1);
  /* subtle range band */
  S.push(rect(x, y, w, h, '#F4F6F8'));
  dims.forEach((d, i) => {
    const ax2 = x + i * nA;
    S.push(ln(ax2, y, ax2, y + h, C.ink, 1.1));
    S.push(txt(ax2, y - 10, d, 9, C.ink, 'middle', 'bold'));
    [0, 0.5, 1].forEach(t => S.push(ln(ax2 - 2.5, y + t * h, ax2 + 2.5, y + t * h, C.ink, 0.8)));
  });
  groups.forEach(([col, off, slope]) => {
    for (let k = 0; k < 11; k++) {
      let d2 = '';
      dims.forEach((dm, i) => {
        const v = Math.max(0.04, Math.min(0.96, N(0.5 + off + slope * (i - 2) * 0.35, 0.13)));
        d2 += (i ? 'L' : 'M') + f1(x + i * nA) + ' ' + f1(y + h - v * h);
      });
      S.push(`<path d="${d2}" fill="none" stroke="${col}" stroke-width="1.5" stroke-opacity="0.45"/>`);
    }
  });
  /* frameless group key above plot, left aligned */
  groups.forEach(([col], i) => {
    const kx = x + 4 + i * 74;
    S.push(circle(kx, y - 24, 3.4, col));
    S.push(txt(kx + 8, y - 21, '组别 ' + (i + 1), 8.5, C.ink, 'start'));
  });
}

/* ── output ── */
const H = 66 + 3 * 296 + 6;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF"/>${S.join('')}</svg>`;
const out = '../../assets/showcase-plus.svg';
fs.writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
