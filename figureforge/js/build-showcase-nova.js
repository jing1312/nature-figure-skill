/* build-showcase-nova.js — 9 closing compositions: flow, matrix and structure */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260924;
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
  lilac: '#B49CD9', plum: '#9B8AA6', indigo: '#7A89C8', coral: '#F08E7A',
  gray: '#AAB0B0', ink: '#333333', tick: '#4A4A4A'
};
const h2r = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const r2h = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mixr = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };

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

function axes(S, x, y, w, h, xt, yt, xf, yf, xlab, ylab, y2f) {
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
  if (y2f) {
    S.push(ln(x + w, y, x + w, y + h, C.ink, 1.2));
    yt.forEach(t => {
      const ty = y + h - t * h;
      S.push(ln(x + w, ty, x + w + 3.5, ty, C.ink, 1));
      S.push(txt(x + w + 6, ty + 3, y2f(t), 9, C.tick, 'start'));
    });
  }
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

S.push(txt(16, 26, 'FigureForge nova atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Nine closing compositions — flow, structure and distribution.', 10.5, '#777', 'start'));

/* ── a | sankey flow ── */
{
  const x = X0(0) + 10, y = ROWY(0) + 32, w = PW - 34, h = PH - 52;
  head(S, 'a', 'sankey flow', X0(0) + 30, ROWY(0), PW);
  const nx = [x + 14, x + w * 0.5, x + w - 60], nw = 9;
  const Ht = h - 14;
  const rib = (x0, ya0, yb0, x1, ya1, yb1, col, op) => {
    const mx = (x0 + x1) / 2;
    S.push(pth(`M${f1(x0)} ${f1(ya0)}C${f1(mx)} ${f1(ya0)} ${f1(mx)} ${f1(ya1)} ${f1(x1)} ${f1(ya1)}L${f1(x1)} ${f1(yb1)}C${f1(mx)} ${f1(yb1)} ${f1(mx)} ${f1(yb0)} ${f1(x0)} ${f1(yb0)}Z`, col, op));
  };
  const st2 = [['Surgery', 0.42, C.blue], ['Chemo', 0.34, C.rose], ['Radio', 0.24, C.mint]];
  const out3 = [['Responder', 0.456, C.teal], ['Stable', 0.341, C.honey], ['Progressive', 0.203, C.coral]];
  /* node bars */
  S.push(rect(nx[0], y, nw, Ht, C.gray, 0.9, 2));
  S.push(txt(nx[0] + nw / 2, y - 6, 'n=200', 7.5, C.tick, 'middle'));
  let y2 = y;
  st2.forEach(([nm, v, col]) => {
    const nh = v * Ht;
    S.push(rect(nx[1], y2, nw, nh, col, 0.9, 2));
    S.push(txt(nx[1] + nw + 4, y2 + nh / 2 + 2.5, nm, 8, C.ink, 'start', 'bold'));
    y2 += nh + 8;
  });
  let y3 = y;
  out3.forEach(([nm, v, col]) => {
    const nh = v * Ht;
    S.push(rect(nx[2], y3, nw, nh, col, 0.9, 2));
    S.push(txt(nx[2] + nw + 4, y3 + nh / 2 + 2.5, nm + ' ' + Math.round(v * 100) + '%', 8, C.ink, 'start'));
    y3 += nh + 8;
  });
  /* ribbons: cohort -> stage2 (track left cursors), stage2 -> outcomes (right cursors) */
  const srcCur = [y, y, y];   /* right side of cohort, consumed by stage2 order */
  const midL = [y, y, y];     /* left side of stage2 */
  const midR = [y, y, y];     /* right side of stage2 */
  y2 = y;
  st2.forEach(([nm, v], i) => { midL[i] = y2; y2 += v * Ht + 8; midR[i] = midL[i] + v * Ht; });
  /* cohort->stage2 use full node heights */
  let cCur = y;
  st2.forEach(([nm, v, col], i) => {
    rib(nx[0] + nw, cCur, cCur + v * Ht, nx[1], midL[i], midR[i], col, 0.4);
    cCur += v * Ht;
  });
  /* stage2->stage3: proportional split, track cursors */
  const tgtCur = [y, y, y];
  const fr = [[0.55, 0.30, 0.15], [0.45, 0.35, 0.20], [0.30, 0.40, 0.30]];
  st2.forEach(([nm, v, col], i) => {
    fr[i].forEach((p, j) => {
      const hSrc = v * p * Ht;
      const y1a = midL[i] + (midR[i] - midL[i]) * fr[i].slice(0, j).reduce((a2, b2) => a2 + b2, 0);
      const y1b = y1a + hSrc;
      const y2a = tgtCur[j]; tgtCur[j] += hSrc;
      rib(nx[1] + nw, y1a, y1b, nx[2], y2a, y2a + hSrc, out3[j][2], 0.32);
    });
  });
}

/* ── b | correlogram ── */
{
  const x = X0(1) + 34, y = ROWY(0) + 40, cell = 42;
  head(S, 'b', 'correlogram', X0(1) + 30, ROWY(0), PW);
  const vs = ['Age', 'BMI', 'MAP', 'Gluc', 'HDL', 'CRP'];
  const R = [
    [1, .62, .48, .55, -.31, .41],
    [0, 1, .57, .49, -.26, .38],
    [0, 0, 1, .44, -.22, .35],
    [0, 0, 0, 1, -.28, .52],
    [0, 0, 0, 0, 1, -.18],
    [0, 0, 0, 0, 0, 1]
  ];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const cx2 = x + j * cell + cell / 2, cy2 = y + i * cell + cell / 2;
    if (i === j) { S.push(txt(cx2, cy2 + 3, vs[i], 8, C.ink, 'middle', 'bold')); continue; }
    if (j < i) {
      const r = R[j][i];
      S.push(circle(cx2, cy2, 3.5 + Math.abs(r) * 11, r > 0 ? C.rose : C.teal, 0.8));
    } else {
      const r = R[j][i];
      const st = Math.abs(r) > 0.5 ? '***' : (Math.abs(r) > 0.4 ? '**' : '*');
      S.push(txt(cx2, cy2 + 3, st, 8, C.tick));
    }
  }
}

/* ── c | mosaic plot ── */
{
  const x = X0(2) + 10, y = ROWY(0) + 44, w = PW - 40, h = PH - 68;
  head(S, 'c', 'mosaic', X0(2) + 30, ROWY(0), PW);
  const groups = [['Young', .30], ['Middle', .42], ['Senior', .28]];
  const outs = [['CR', C.teal], ['PR', C.honey], ['SD', C.sky], ['PD', C.coral]];
  const frac = [[.42, .30, .18, .10], [.34, .32, .22, .12], [.20, .26, .30, .24]];
  let xx = x;
  groups.forEach(([nm, gw2], gi) => {
    const ww = gw2 * w;
    let yy = y;
    frac[gi].forEach((p, oi) => {
      const hh = p * h;
      S.push(rect(xx + 1, yy + 1, ww - 2, hh - 2, outs[oi][1], 0.85));
      if (p > 0.16) S.push(txt(xx + ww / 2, yy + hh / 2 + 2.5, Math.round(p * 100) + '%', 7.5, '#FFFFFF', 'middle', 'bold'));
      yy += hh;
    });
    S.push(txt(xx + ww / 2, y + h + 12, nm, 8.5, C.ink, 'middle', 'bold'));
    xx += ww;
  });
  /* frameless legend above plot */
  let lx = x + 2;
  outs.forEach(([nm, col]) => {
    S.push(rect(lx, y - 20, 7, 7, col, 0.85));
    S.push(txt(lx + 10, y - 14, nm, 8, C.ink, 'start'));
    lx += 30;
  });
  S.push(txt(x - 8, y + h / 2, '占比', 8.5, C.ink, 'middle', 'bold', -90));
}

/* ── d | biplot ── */
{
  const x = X0(0) + 8, y = ROWY(1) + 34, w = PW - 38, h = PH - 58;
  head(S, 'd', 'pca biplot', X0(0) + 30, ROWY(1), PW);
  S.push(ln(x + w / 2, y, x + w / 2, y + h, '#D5D5D5', 0.8));
  S.push(ln(x, y + h / 2, x + w, y + h / 2, '#D5D5D5', 0.8));
  const groups = [[C.blue, .35, .30], [C.rose, .68, .62]];
  groups.forEach(([col, mu1, mu2]) => {
    for (let k = 0; k < 26; k++) {
      const u = Math.max(0.05, Math.min(0.95, N(mu1, 0.09)));
      const v = Math.max(0.06, Math.min(0.94, N(mu2, 0.1)));
      S.push(circle(x + u * w, y + h - v * h, 2.8, col, 0.7));
    }
  });
  /* loading arrows from center */
  const cx2 = x + w / 2, cy2 = y + h / 2;
  [['CD3D', 0.62, -0.5, C.blue], ['MS4A1', -0.66, -0.35, C.rose], ['LYZ', 0.18, 0.7, C.sage], ['COL1A1', -0.3, 0.62, C.honey]].forEach(([nm, a, b, col]) => {
    const tx2 = cx2 + a * w * 0.42, ty2 = cy2 - b * h * 0.42;
    const ang = Math.atan2(ty2 - cy2, tx2 - cx2);
    S.push(ln(cx2, cy2, tx2, ty2, col, 1.8));
    S.push(pth(`M${f1(tx2)} ${f1(ty2)}L${f1(tx2 - 7 * Math.cos(ang - 0.4))} ${f1(ty2 - 7 * Math.sin(ang - 0.4))}L${f1(tx2 - 7 * Math.cos(ang + 0.4))} ${f1(ty2 - 7 * Math.sin(ang + 0.4))}Z`, col, 1));
    S.push(txt(tx2 + 10 * Math.cos(ang), ty2 + 9 * Math.sin(ang) + 3, nm, 8, C.ink, 'middle', 'bold'));
  });
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1], t => f1(-40 + t * 80), t => f1(-25 + t * 50), 'PC1 (41%)', 'PC2 (27%)');
}

/* ── e | population pyramid ── */
{
  const x = X0(1) + 22, y = ROWY(1) + 34, w = PW - 52, h = PH - 62;
  head(S, 'e', 'population pyramid', X0(1) + 30, ROWY(1), PW);
  const bins = ['70+', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
  const male = [4, 7, 11, 16, 20, 24, 18, 12];
  const fem = [5, 8, 13, 18, 22, 26, 17, 11];
  const mx2 = Math.max(...male, ...fem);
  const rowH = h / bins.length;
  const cx2 = x + w / 2;
  S.push(ln(cx2, y, cx2, y + h, C.ink, 1));
  bins.forEach((b, i) => {
    const yy = y + i * rowH + rowH / 2;
    const bm = male[i] / mx2 * (w / 2 - 4), bf = fem[i] / mx2 * (w / 2 - 4);
    S.push(rect(cx2 - bm, yy - rowH / 2 + 2, bm, rowH - 4, C.blue, 0.85));
    S.push(rect(cx2 + 1, yy - rowH / 2 + 2, bf, rowH - 4, C.rose, 0.85));
    S.push(txt(cx2, yy + 2.5, b, 6.5, C.tick));
  });
  S.push(txt(cx2 - (w / 4), y + h + 14, '男 Male', 9, C.blue, 'middle', 'bold'));
  S.push(txt(cx2 + (w / 4), y + h + 14, '女 Female', 9, C.rose, 'middle', 'bold'));
}

/* ── f | circular heatmap ── */
{
  const cx = X0(2) + PW / 2 + 2, cy = ROWY(1) + 128;
  head(S, 'f', 'circular heatmap', X0(2) + 30, ROWY(1), PW);
  const r0 = 24, dr = (88 - 24) / 7, sectors = 24;
  const P = (a, r) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  const dows = ['一', '二', '三', '四', '五', '六', '日'];
  for (let d2 = 0; d2 < 7; d2++) {
    const ra = r0 + d2 * dr, rb = ra + dr - 1.5;
    for (let s2 = 0; s2 < sectors; s2++) {
      const a1 = -Math.PI / 2 + s2 * 2 * Math.PI / sectors;
      const a2 = a1 + 2 * Math.PI / sectors - 0.012;
      const isWknd = d2 >= 5;
      let v = isWknd ? Math.max(0.03, N(0.3, 0.18)) : N(0.62, 0.24);
      v = Math.max(0.03, Math.min(1, v));
      S.push(pth(`M${P(a1, ra)}L${P(a1, rb)}A${rb} ${rb} 0 0 1 ${P(a2, rb)}L${P(a2, ra)}A${ra} ${ra} 0 0 0 ${P(a1, ra)}Z`, mixr('#EEF1F6', '#7A89C8', Math.sqrt(v)), 0.95));
    }
    S.push(txt(cx - 92, cy + (r0 + d2 * dr + dr / 2) + 2.5, dows[d2], 7, C.tick, 'end'));
  }
  [0, 6, 12, 18].forEach(s2 => {
    const a = -Math.PI / 2 + s2 * 2 * Math.PI / sectors;
    S.push(txt(cx + 98 * Math.cos(a), cy + 98 * Math.sin(a) + 2.5, s2 + 'h', 7, C.tick));
  });
}

/* ── g | dual axis combo ── */
{
  const x = X0(0) + 8, y = ROWY(2) + 36, w = PW - 44, h = PH - 62;
  head(S, 'g', 'dose combo', X0(0) + 30, ROWY(2), PW);
  const doses = ['0', '5', '10', '20', '40', '80'];
  const enroll = [12, 18, 25, 22, 16, 9];
  const resp = [18, 26, 35, 48, 57, 66];
  const bw2 = w / doses.length;
  enroll.forEach((v, i) => {
    const bh = v / 25 * (h * 0.62);
    S.push(rect(x + i * bw2 + bw2 * 0.22, y + h - bh, bw2 * 0.56, bh, C.sky, 0.85, 2));
  });
  let d2 = '';
  resp.forEach((v, i) => {
    const px2 = x + (i + 0.5) * bw2, py2 = y + h - v / 100 * h;
    d2 += (i ? 'L' : 'M') + f1(px2) + ' ' + f1(py2);
  });
  S.push(`<path d="${d2}" fill="none" stroke="${C.rose}" stroke-width="2.2"/>`);
  resp.forEach((v, i) => S.push(circle(x + (i + 0.5) * bw2, y + h - v / 100 * h, 3.4, C.rose, 1, '#FFFFFF', 1)));
  axes(S, x, y, w, h, doses.map((_, i) => (i + 0.5) / doses.length), [0, 0.33, 0.66],
    t => doses[Math.min(5, Math.floor(t * doses.length))], t => Math.round(t * 30), null, null, null);
  /* right axis labels for % */
  [0, 0.5, 1].forEach(t => S.push(txt(x + w + 6, y + h - t * h + 3, t * 100 + '%', 9, C.tick, 'start')));
  S.push(txt(x + w / 2, y + h + 27, 'Dose (mg)', 10.5, C.ink, 'middle', 'bold'));
  S.push(txt(x - 30, y + h * 0.75, 'Enroll', 9.5, C.sky, 'middle', 'bold', -90));
  S.push(txt(x + w + 26, y + h * 0.3, 'Resp', 9.5, C.rose, 'middle', 'bold', 90));
}

/* ── h | pseudo-3d surface ── */
{
  const ox = X0(1) + PW / 2 + 2, oy = ROWY(2) + 52, n2 = 9;
  head(S, 'h', 'response surface', X0(1) + 30, ROWY(2), PW);
  const Z = (i, j) => 1.25 * Math.exp(-(((i / 8 - 0.4) ** 2 + (j / 8 - 0.62) ** 2) / 0.055)) + 0.85 * Math.exp(-(((i / 8 - 0.75) ** 2 + (j / 8 - 0.28) ** 2) / 0.028));
  const PX = (i, j) => ox + (i - j) * 13.5;
  const PY = (i, j) => oy + (i + j) * 7.2 - Z(i, j) * 34;
  /* facets painter order */
  for (let s2 = 0; s2 <= 2 * (n2 - 1); s2++) {
    for (let i = Math.max(0, s2 - (n2 - 1)); i <= Math.min(n2 - 2, s2 - 0); i++) {
      const j = s2 - i;
      if (j > n2 - 2) continue;
      const zAvg = (Z(i, j) + Z(i + 1, j) + Z(i, j + 1) + Z(i + 1, j + 1)) / 4;
      S.push(pth(`M${f1(PX(i, j))} ${f1(PY(i, j))}L${f1(PX(i + 1, j))} ${f1(PY(i + 1, j))}L${f1(PX(i + 1, j + 1))} ${f1(PY(i + 1, j + 1))}L${f1(PX(i, j + 1))} ${f1(PY(i, j + 1))}Z`, mixr('#EAF0F6', C.indigo, Math.min(1, zAvg / 1.6)), 0.9));
    }
  }
  /* wireframe */
  for (let i = 0; i < n2; i++) {
    let d2 = '';
    for (let j = 0; j < n2; j++) d2 += (j ? 'L' : 'M') + f1(PX(i, j)) + ' ' + f1(PY(i, j));
    S.push(`<path d="${d2}" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.85"/>`);
  }
  for (let j = 0; j < n2; j++) {
    let d2 = '';
    for (let i = 0; i < n2; i++) d2 += (i ? 'L' : 'M') + f1(PX(i, j)) + ' ' + f1(PY(i, j));
    S.push(`<path d="${d2}" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.85"/>`);
  }
  S.push(txt(X0(1) + 66, ROWY(2) + PH - 18, 'Dose A →', 9, C.ink, 'middle', 'bold', -26));
  S.push(txt(X0(1) + PW - 52, ROWY(2) + PH - 18, 'Dose B →', 9, C.ink, 'middle', 'bold', 26));
  /* frameless z legend */
  for (let k = 0; k < 5; k++) S.push(rect(X0(1) + 14, ROWY(2) + 40 + k * 11, 9, 10, mixr('#EAF0F6', C.indigo, (4 - k) / 4 * 1.6 > 1 ? 1 : (4 - k) / 4 * 1.6)));
  S.push(txt(X0(1) + 28, ROWY(2) + 47, 'high', 7.5, C.tick, 'start'));
  S.push(txt(X0(1) + 28, ROWY(2) + 91, 'low', 7.5, C.tick, 'start'));
}

/* ── i | ecdf ── */
{
  const x = X0(2) + 8, y = ROWY(2) + 34, w = PW - 38, h = PH - 58;
  head(S, 'i', 'ecdf + ks test', X0(2) + 30, ROWY(2), PW);
  const mk = (mu, sd, n2) => Array.from({ length: n2 }, () => Math.max(18, Math.min(98, N(mu, sd)))).sort((a2, b2) => a2 - b2);
  const A2 = mk(45, 11, 48), B2 = mk(58, 12, 44);
  const ecdf = arr => {
    let d2 = `M${f1(x)} ${f1(y + h)}`;
    arr.forEach((v, i) => {
      const px2 = x + (v - 15) / 85 * w;
      d2 += `L${f1(px2)} ${f1(y + h - i / arr.length * h)}L${f1(px2)} ${f1(y + h - (i + 1) / arr.length * h)}`;
    });
    return d2;
  };
  S.push(`<path d="${ecdf(A2)}" fill="none" stroke="${C.blue}" stroke-width="1.8"/>`);
  S.push(`<path d="${ecdf(B2)}" fill="none" stroke="${C.rose}" stroke-width="1.8"/>`);
  /* max KS gap around v=52 */
  const gx = x + (52 - 15) / 85 * w;
  const fA = A2.filter(v => v <= 52).length / A2.length, fB = B2.filter(v => v <= 52).length / B2.length;
  S.push(ln(gx, y + h - fA * h, gx, y + h - fB * h, C.ink, 1.6, '3 2.4'));
  S.push(txt(gx + 5, y + h - (fA + fB) / 2 * h - 4, 'KS = 0.31', 8.5, C.ink, 'start', 'bold'));
  S.push(txt(gx + 5, y + h - (fA + fB) / 2 * h + 7, 'P = 0.04', 8, C.tick, 'start'));
  /* frameless key above */
  S.push(ln(x + 4, y - 12, x + 18, y - 12, C.blue, 1.8));
  S.push(txt(x + 22, y - 9, 'Ctrl', 8.5, C.ink, 'start'));
  S.push(ln(x + 48, y - 12, x + 62, y - 12, C.rose, 1.8));
  S.push(txt(x + 66, y - 9, 'Treat', 8.5, C.ink, 'start'));
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1], t => f1(15 + t * 85), t => f1(t), 'Marker level', 'ECDF');
}

/* ── output ── */
const H = 66 + 3 * 296 + 6;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF"/>${S.join('')}</svg>`;
const out = '../../assets/showcase-nova.svg';
fs.writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
