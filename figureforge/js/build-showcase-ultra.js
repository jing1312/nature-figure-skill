/* build-showcase-ultra.js — 9 more advanced compositions, jewel-pastel extended */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260922;
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

S.push(txt(16, 26, 'FigureForge ultra atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Nine further compositions — genomic, clinical and structural.', 10.5, '#777', 'start'));

/* ── a | circos-lite (regional links) ── */
{
  const cx = X0(0) + PW / 2 + 4, cy = ROWY(0) + 130, R = 84;
  head(S, 'a', 'circos links', X0(0) + 30, ROWY(0), PW);
  const P = (a, r) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  const segs = [0.16, 0.13, 0.11, 0.10, 0.09, 0.08, 0.08, 0.07, 0.06, 0.05];
  const segCol = [C.sky, C.blue, C.mint, C.teal, C.lilac, C.sage, C.sky, C.blue, C.mint, C.teal];
  const T = segs.reduce((x, y) => x + y, 0);
  const GAP = 0.09;
  const unit = (2 * Math.PI - GAP * segs.length) / T;
  let a0 = -Math.PI / 2 + GAP / 2;
  const spans = [];
  segs.forEach((s, i) => {
    const a1 = a0, a2 = a0 + s * unit;
    spans.push([a1, a2]);
    S.push(`<path d="M${P(a1, R)}A${R} ${R} 0 0 1 ${P(a2, R)}" fill="none" stroke="${segCol[i]}" stroke-width="7" stroke-opacity="0.9"/>`);
    const am = (a1 + a2) / 2;
    S.push(txt(cx + (R + 14) * Math.cos(am), cy + (R + 14) * Math.sin(am) + 2, 'chr' + (i + 1), 7, C.tick));
    a0 = a2 + GAP;
  });
  const link = (si, f1a, sj, f2a, col) => {
    const [s1a, s1b] = spans[si], [s2a, s2b] = spans[sj];
    const A1 = s1a + f1a * (s1b - s1a), A2 = A1 + 0.12 * (s1b - s1a);
    const B1 = s2a + f2a * (s2b - s2a), B2 = B1 + 0.1 * (s2b - s2a);
    S.push(pth(`M${P(A1, R)}C${P(A1, R * 0.3)} ${P(B1, R * 0.3)} ${P(B1, R)}L${P(B2, R)}C${P(B2, R * 0.3)} ${P(A2, R * 0.3)} ${P(A2, R)}Z`, col, 0.55));
  };
  link(0, 0.4, 2, 0.5, C.rose);
  link(1, 0.3, 4, 0.6, C.honey);
  link(2, 0.2, 5, 0.3, C.rose);
  link(3, 0.6, 7, 0.4, C.lilac);
  link(0, 0.75, 6, 0.5, C.honey);
  link(4, 0.25, 8, 0.5, C.rose);
}

/* ── b | QQ plot (GWAS calibration) ── */
{
  const x = X0(1) + 8, y = ROWY(0) + 34, w = PW - 38, h = PH - 58;
  head(S, 'b', 'qq plot', X0(1) + 30, ROWY(0), PW);
  const xv = t => x + t / 4 * w, yv = v => y + h - v / 8 * h;
  /* CI band */
  let band = '';
  for (let k = 0; k <= 30; k++) {
    const e = 4 * k / 30;
    band += (k ? 'L' : 'M') + f1(xv(e)) + ' ' + f1(yv(Math.min(8, e + 0.25 + e * 0.16)));
  }
  for (let k = 30; k >= 0; k--) {
    const e = 4 * k / 30;
    band += 'L' + f1(xv(e)) + ' ' + f1(yv(Math.max(0, e - (0.25 + e * 0.16) * 0.6)));
  }
  S.push(pth(band + 'Z', C.gray, 0.22));
  S.push(ln(xv(0), yv(0), xv(4), yv(8), '#999', 1, '4 3'));
  const pts = [];
  for (let k = 1; k <= 240; k++) {
    const e = -Math.log10(k / 260) * (4 / 2.6);
    let o = e + N(0, 0.06 + e * 0.05);
    if (k <= 4) o = e * 1.35 + 0.3; /* top inflation */
    o = Math.min(7.8, Math.max(0, o));
    pts.push([e, o]);
  }
  pts.forEach(([e, o]) => {
    const hot = o > e + 0.25 + e * 0.16;
    S.push(circle(xv(Math.min(4, e)), yv(o), hot ? 2.6 : 1.6, hot ? C.rose : C.blue, hot ? 0.95 : 0.65));
  });
  S.push(txt(x + 6, y + 12, 'λ = 1.04', 9, C.ink, 'start', 'bold'));
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1],
    t => f1(t * 4), t => f1(t * 8), 'Expected -log₁₀(P)', 'Observed -log₁₀(P)');
}

/* ── c | KM curves + risk table ── */
{
  const x = X0(2) + 58, y = ROWY(0) + 30, w = PW - 84, h = 118;
  head(S, 'c', 'kaplan-meier', X0(2) + 30, ROWY(0), PW);
  const xv = t => x + t / 24 * w, yv = v => y + (1 - v) * h;
  S.push(pth(`M${xv(0)} ${yv(1)}L${xv(4)} ${yv(1)}L${xv(4)} ${yv(0.92)}L${xv(7)} ${yv(0.92)}L${xv(7)} ${yv(0.83)}L${xv(10)} ${yv(0.83)}L${xv(10)} ${yv(0.75)}L${xv(14)} ${yv(0.75)}L${xv(14)} ${yv(0.62)}L${xv(18)} ${yv(0.62)}L${xv(18)} ${yv(0.5)}L${xv(24)} ${yv(0.5)}L${xv(24)} ${yv(0.42)}`, 'none', 1, C.blue, 1.8));
  let band = 'M' + `L`.slice(0, 0);
  [[0, 1], [4, 1], [4, 0.92], [7, 0.92], [7, 0.83], [10, 0.83], [10, 0.75], [14, 0.75], [14, 0.62], [18, 0.62], [18, 0.5], [24, 0.5]].forEach(([t, v], i) => {
    band += (i ? 'L' : 'M') + f1(xv(t)) + ' ' + f1(yv(Math.min(1, v + 0.07)));
  });
  [[24, 0.42], [18, 0.5], [14, 0.62], [10, 0.75], [7, 0.83], [4, 0.92], [0, 1]].forEach(([t, v], i) => {
    band += 'L' + f1(xv(t)) + ' ' + f1(yv(Math.max(0, v - 0.07)));
  });
  S.push(pth(band + 'Z', C.blue, 0.15));
  S.push(pth(`M${xv(0)} ${yv(1)}L${xv(6)} ${yv(1)}L${xv(6)} ${yv(0.96)}L${xv(9)} ${yv(0.96)}L${xv(9)} ${yv(0.88)}L${xv(13)} ${yv(0.88)}L${xv(13)} ${yv(0.8)}L${xv(18)} ${yv(0.8)}L${xv(18)} ${yv(0.72)}L${xv(24)} ${yv(0.72)}L${xv(24)} ${yv(0.65)}`, 'none', 1, C.rose, 1.8));
  [[4, 0.92], [10, 0.75], [18, 0.5]].forEach(([t, v]) => S.push(ln(xv(t) - 3, yv(v) - 3, xv(t) + 3, yv(v) + 3, C.blue, 1.2)));
  [[6, 0.96], [13, 0.8], [24, 0.65]].forEach(([t, v]) => S.push(ln(xv(t) - 3, yv(v) - 3, xv(t) + 3, yv(v) + 3, C.rose, 1.2)));
  S.push(txt(xv(20), yv(0.44) + 4, 'P = 0.03', 8.5, C.ink, 'start', 'bold'));
  /* frameless key above plot */
  S.push(ln(x + 4, y - 12, x + 18, y - 12, C.blue, 1.8));
  S.push(txt(x + 22, y - 9, 'Control', 8.5, C.ink, 'start'));
  S.push(ln(x + 62, y - 12, x + 76, y - 12, C.rose, 1.8));
  S.push(txt(x + 80, y - 9, 'Treatment', 8.5, C.ink, 'start'));
  axes(S, x, y, w, h, [0, 1 / 3, 2 / 3, 1], [0, 0.5, 1],
    t => f1(t * 24), t => f1(t), 'Time (months)', 'Survival');
  /* risk table */
  const ry = y + h + 36;
  [[C.blue, 'Control', [24, 17, 10, 6]], [C.rose, 'Treat', [24, 21, 16, 11]]].forEach(([col, nm, nums], ri) => {
    const yy = ry + ri * 11;
    S.push(rect(x - 52, yy - 3, 6, 6, col));
    S.push(txt(x - 42, yy + 3, nm, 7.5, C.ink, 'start'));
    nums.forEach((n2, i) => S.push(txt(xv(i * 8), yy + 3, n2, 7.5, C.tick)));
  });
  S.push(txt(x - 52, ry - 6, 'At risk', 7.5, C.tick, 'start'));
}

/* ── d | raincloud ── */
{
  const x = X0(0) + 8, y = ROWY(1) + 34, w = PW - 34, h = PH - 60;
  head(S, 'd', 'raincloud', X0(0) + 30, ROWY(1), PW);
  const groups = [['Ctrl', C.blue, 3.1], ['Low', C.mint, 4.2], ['High', C.rose, 5.0]];
  const gw = w / 3;
  groups.forEach(([nm, col, mu], gi) => {
    const gx = x + gi * gw + gw / 2;
    /* half violin (right side) */
    let up = '', dn = '';
    for (let k = 0; k <= 30; k++) {
      const v = mu - 1.5 + 3 * k / 30;
      const d2 = Math.exp(-((v - mu) ** 2) / (2 * 0.45 * 0.45)) / 0.45 / 2.5066;
      up += (k ? 'L' : 'M') + f1(gx + 6 + d2 * 58) + ' ' + f1(y + h - (v - 1.4) / 5.2 * h);
    }
    S.push(pth(up + `L${f1(gx + 6)} ${f1(y + h)}L${f1(gx + 6)} ${f1(y)}Z`, col, 0.4));
    S.push(`<path d="${up}" fill="none" stroke="${col}" stroke-width="1.4"/>`);
    /* jitter points (left) */
    for (let k = 0; k < 22; k++) {
      const v = Math.max(mu - 1.4, Math.min(mu + 1.4, N(mu, 0.42)));
      S.push(circle(gx - 10 - rnd() * 22, y + h - (v - 1.4) / 5.2 * h, 2.3, col, 0.65));
    }
    /* box strip in middle */
    const bx = gx + 1;
    S.push(rect(bx - 4, y + h - (mu + 0.28 - 1.4) / 5.2 * h, 8, (0.56) / 5.2 * h, '#FFFFFF', 1, 2));
    S.push(ln(bx, y + h - (mu + 0.55 - 1.4) / 5.2 * h, bx, y + h - (mu + 0.28 - 1.4) / 5.2 * h, C.ink, 1));
    S.push(ln(bx, y + h - (mu - 0.28 - 1.4) / 5.2 * h, bx, y + h - (mu - 0.55 - 1.4) / 5.2 * h, C.ink, 1));
    S.push(ln(bx - 4, y + h - (mu - 1.4) / 5.2 * h, bx + 4, y + h - (mu - 1.4) / 5.2 * h, C.ink, 1.4));
    S.push(txt(gx, y + h + 14, nm, 9, C.ink, 'middle', 'bold'));
  });
  axes(S, x, y, w, h, [], [0, 0.5, 1], null, t => f1(1.4 + t * 5.2), null, 'Response score');
}

/* ── e | lollipop (GO enrichment) ── */
{
  const x = X0(1) + 8, y = ROWY(1) + 34, w = PW - 40, h = PH - 60;
  head(S, 'e', 'go enrichment', X0(1) + 30, ROWY(1), PW);
  const rows = [
    ['Fatty acid oxidation', 4.6, C.blue, 86],
    ['Lysosome', 3.8, C.blue, 54],
    ['Antigen processing', 3.4, C.rose, 61],
    ['Interferon gamma', 2.9, C.rose, 44],
    ['Collagen fibril', 2.2, C.mint, 33],
    ['WNT signaling', 1.7, C.lilac, 27],
    ['Notch', 1.1, C.lilac, 18]
  ];
  const rowH = h / rows.length;
  rows.forEach(([nm, v, col, cnt], i) => {
    const yy = y + i * rowH + rowH / 2;
    S.push(ln(x, yy, x + v / 5 * w, yy, col, 2.2));
    S.push(circle(x + v / 5 * w, yy, 3.2 + cnt / 86 * 5, col, 0.9, '#FFFFFF', 1));
    S.push(txt(x - 4, yy + 2.5, nm, 8, C.ink, 'end'));
    S.push(txt(x + v / 5 * w, yy - 8, f1(v), 7.5, C.tick));
  });
  axes(S, x, y, w, h, [0, 0.5, 1], [], t => f1(t * 5), null, 'Enrichment (-log₁₀ FDR)');
}

/* ── f | venn (3-set) ── */
{
  const cx = X0(2) + PW / 2 + 2, cy = ROWY(1) + 128, r2 = 52;
  head(S, 'f', 'venn — platforms', X0(2) + 30, ROWY(1), PW);
  const offs = [[-24, -16, C.blue, 'WES'], [24, -16, C.rose, 'RNA-seq'], [0, 26, C.mint, 'Proteome']];
  /* blend: draw with multiply-ish alpha */
  offs.forEach(([dx, dy, col]) => S.push(circle(cx + dx, cy + dy, r2, col, 0.45)));
  offs.forEach(([dx, dy, col, nm]) => {
    const a = Math.atan2(dy, dx);
    S.push(txt(cx + dx + (r2 + 12) * Math.cos(a), cy + dy + (r2 + 12) * Math.sin(a) + 3, nm, 9, C.ink, 'middle', 'bold'));
  });
  S.push(txt(cx - 30, cy - 26, '24', 10, C.ink, 'middle', 'bold'));
  S.push(txt(cx + 30, cy - 26, '19', 10, C.ink, 'middle', 'bold'));
  S.push(txt(cx, cy + 24, '15', 10, C.ink, 'middle', 'bold'));
  S.push(txt(cx - 13, cy - 4, '8', 9, C.ink, 'middle', 'bold'));
  S.push(txt(cx + 13, cy - 4, '6', 9, C.ink, 'middle', 'bold'));
  S.push(txt(cx, cy + 6, '5', 9, C.ink, 'middle', 'bold'));
  S.push(txt(cx, cy - 8, '12', 10, C.ink, 'middle', 'bold'));
}

/* ── g | gantt timeline ── */
{
  const x = X0(0) + 60, y = ROWY(2) + 34, w = PW - 86, h = PH - 62;
  head(S, 'g', 'project gantt', X0(0) + 30, ROWY(2), PW);
  const tasks = [
    ['Ethics / IRB', 0, 2, C.gray],
    ['Recruitment', 1.5, 5, C.blue],
    ['Intervention', 2.5, 7, C.rose],
    ['Follow-up', 5, 10, C.mint],
    ['Sequencing', 8, 11, C.honey],
    ['Analysis', 10, 12, C.lilac]
  ];
  const rowH = h / tasks.length;
  tasks.forEach(([nm, s, e, col], i) => {
    const yy = y + i * rowH + rowH / 2;
    S.push(rect(x + s / 12 * w, yy - 6, (e - s) / 12 * w, 12, col, 0.88, 5));
    S.push(txt(x - 4, yy + 2.5, nm, 8, C.ink, 'end'));
    if (nm === 'Intervention') S.push(circle(x + (s + (e - s) / 2) / 12 * w, yy, 3.4, '#FFFFFF', 1, col, 1.4));
  });
  /* milestone diamonds */
  [[2, 0], [12, 5]].forEach(([m, ti]) => {
    const yy = y + ti * rowH + rowH / 2;
    const mx2 = x + m / 12 * w;
    S.push(pth(`M${f1(mx2)} ${f1(yy - 5)}L${f1(mx2 + 5)} ${f1(yy)}L${f1(mx2)} ${f1(yy + 5)}L${f1(mx2 - 5)} ${f1(yy)}Z`, C.coral, 1, '#FFFFFF', 0.8));
  });
  axes(S, x, y, w, h, [0, 1 / 4, 2 / 4, 3 / 4, 1], [], t => 'M' + Math.round(t * 12), null, 'Study month');
}

/* ── h | radial dendrogram ── */
{
  const cx = X0(1) + PW / 2 + 2, cy = ROWY(2) + 130, R = 84;
  head(S, 'h', 'radial dendrogram', X0(1) + 30, ROWY(2), PW);
  const P = (a, r) => `${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
  const leaves = ['CD3D', 'CD8A', 'GZMK', 'NKG7', 'MS4A1', 'CD79A', 'LYZ', 'S100A9'];
  const leafCol = [C.blue, C.blue, C.blue, C.blue, C.rose, C.rose, C.mint, C.mint];
  const aOf = i => -Math.PI / 2 + i * 2 * Math.PI / leaves.length;
  /* merges: [leaves..., radius, color] */
  const merge1 = [[0, 1], [2, 3], [4, 5], [6, 7]];
  merge1.forEach(([i, j], k) => {
    const r1 = R - 22;
    S.push(`<path d="M${P(aOf(i), R)}L${P(aOf(i), r1)}A${r1} ${r1} 0 0 1 ${P(aOf(j), r1)}L${P(aOf(j), R)}" fill="none" stroke="${leafCol[i]}" stroke-width="1.4" stroke-opacity="0.85"/>`);
  });
  const mid = k => {
    const [i, j] = merge1[k];
    let d = aOf(j) - aOf(i);
    return aOf(i) + d / 2;
  };
  const merges2 = [[0, 1, R - 42], [2, 3, R - 42]];
  merges2.forEach(([k1, k2, r2]) => {
    S.push(`<path d="M${P(mid(k1), R - 22)}L${P(mid(k1), r2)}A${r2} ${r2} 0 0 1 ${P(mid(k2), r2)}L${P(mid(k2), R - 22)}" fill="none" stroke="#9A9A9A" stroke-width="1.3"/>`);
  });
  S.push(`<path d="M${P(mid(0), R - 42)}L${P(mid(0), R - 60)}A${R - 60} ${R - 60} 0 0 1 ${P(mid(2), R - 60)}L${P(mid(2), R - 42)}" fill="none" stroke="#7A7A7A" stroke-width="1.3"/>`);
  leaves.forEach((g, i) => {
    const a = aOf(i);
    S.push(circle(cx + R * Math.cos(a), cy + R * Math.sin(a), 2.8, leafCol[i]));
    S.push(txt(cx + (R + 12) * Math.cos(a), cy + (R + 12) * Math.sin(a) + 2.5, g, 7.5, C.tick, Math.cos(a) > 0.2 ? 'start' : (Math.cos(a) < -0.2 ? 'end' : 'middle')));
  });
  S.push(circle(cx, cy, 2.4, '#7A7A7A'));
}

/* ── i | coverage tracks ── */
{
  const x = X0(2) + 8, y = ROWY(2) + 40, w = PW - 36, h = PH - 66;
  head(S, 'i', 'coverage tracks', X0(2) + 30, ROWY(2), PW);
  const tracks = [['Tumor', C.rose, [[0.18, 0.10], [0.42, 0.16], [0.72, 0.08]]],
                  ['Adjacent', C.blue, [[0.3, 0.06], [0.62, 0.09]]],
                  ['Normal', C.mint, [[0.5, 0.05]]]];
  const bandH = h / 3;
  tracks.forEach(([nm, col, peaks], ti) => {
    const y0 = y + ti * bandH + bandH - 6;
    let d = `M${f1(x)} ${f1(y0)}`;
    for (let k = 0; k <= 90; k++) {
      const t = k / 90;
      let v = 0.18 + Math.abs(N(0, 0.025));
      peaks.forEach(([pc, ph]) => { v += ph * 1.7 * Math.exp(-((t - pc) ** 2) / (2 * 0.018)); });
      v = Math.min(0.95, v);
      d += `L${f1(x + t * w)} ${f1(y0 - v * (bandH - 10))}`;
    }
    d += `L${f1(x + w)} ${f1(y0)}Z`;
    S.push(pth(d, col, 0.55));
    S.push(`<path d="${d.replace(/Z$/, '')}" fill="none" stroke="${col}" stroke-width="1.2"/>`);
    S.push(ln(x, y0, x + w, y0, '#C9C9C9', 0.8));
    S.push(txt(x - 4, y0 - bandH / 2 + 8, nm, 8.5, C.ink, 'end', 'bold'));
  });
  axes(S, x, y, w, h, [0, 0.5, 1], [], t => 'chr7:' + Math.round(55 + t * 10) + 'Mb', null, 'Genomic position');
}

/* ── output ── */
const H = 66 + 3 * 296 + 6;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF"/>${S.join('')}</svg>`;
const out = '../../assets/showcase-ultra.svg';
fs.writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
