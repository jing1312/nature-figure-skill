/* build-showcase-extra.js — 8 novel panel types, fresh pastel palette */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260920;
const rnd = () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const N = (m, s) => m + s * (rnd() + rnd() + rnd() + rnd() - 2) * 1.4;
const kde = (arr, bw, grid) => grid.map(v => arr.reduce((s, p) => s + Math.exp(-((v - p) ** 2) / (2 * bw)), 0) / (arr.length * bw * 2.5066));

const C = {
  blue: '#6FA8CE', lblue: '#C9E2F0', teal: '#82CBBE', green: '#9CCB8F',
  yellow: '#F0D48A', orange: '#EFB08C', red: '#E89B9B', pink: '#F3C6D2',
  mauve: '#C3A3D1', purple: '#A79BD1', gray: '#AAB0B0', ink: '#333333',
  tick: '#4A4A4A'
};

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

/* ── layout: 4 cols x 2 rows, same slot geometry as base atlas ── */
const W = 1080, COLW = 352, PW = 316, PH = 226;
const ROWY = r => 66 + r * 296;
const X0 = col => 24 + col * COLW;
const S = [];

S.push(txt(16, 26, 'FigureForge extra atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Eight novel panel types in the same fresh pastel palette.', 10.5, '#777', 'start'));

/* ── a | oncoprint ────────────────────────────── */
{
  const x = X0(0) + 4, y = ROWY(0) + 30, w = PW - 30, h = PH - 50;
  head(S, 'a', 'oncoprint', x + 30, ROWY(0), PW);
  const genes = [['TP53', 0.62], ['KRAS', 0.34], ['STK11', 0.26], ['EGFR', 0.30], ['BRAF', 0.18], ['SMAD4', 0.22]];
  const ns = 24, cw = w / ns, ch = (h - 26) / genes.length;
  const types = [['Missense', C.blue], ['Truncating', C.red], ['Amp', C.yellow], ['Del', C.gray]];
  genes.forEach(([g, p], gi) => {
    const gy = y + 26 + gi * ch;
    let cnt = 0;
    for (let si = 0; si < ns; si++) {
      const cx = x + si * cw + 1.2;
      if (rnd() < p) {
        cnt++;
        const t1 = Math.floor(rnd() * 4);
        if (rnd() < 0.16) {
          const t2 = (t1 + 1 + Math.floor(rnd() * 3)) % 4;
          S.push(rect(cx, gy + 1, cw - 2.4, ch / 2 - 1.5, types[t1][1], 0.9));
          S.push(rect(cx, gy + ch / 2, cw - 2.4, ch / 2 - 1.5, types[t2][1], 0.9));
        } else S.push(rect(cx, gy + 1, cw - 2.4, ch - 2, types[t1][1], 0.9));
      }
      if (gi === 0) { /* TMB strip above first row */
        const th = 4 + rnd() * 14;
        S.push(rect(x + si * cw + 1.2, y + 22 - th, cw - 2.4, th, '#C9DFF2', 0.95));
      }
    }
    S.push(txt(x - 6, gy + ch / 2 + 3, g, 8.5, C.ink, 'end'));
    S.push(txt(x + w + 5, gy + ch / 2 + 3, Math.round(p * 100) + '%', 8, C.tick, 'start'));
  });
  S.push(ln(x, y + 26, x, y + h, C.ink, 1));
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1));
  S.push(txt(x + w / 2, y + h + 16, 'Tumor sample (n = 24)', 9.5, C.ink, 'middle', 'bold'));
  S.push(txt(x + 2, y + 12, 'TMB', 8, C.tick, 'start'));
  /* frameless horizontal key strip between title and plot */
  types.forEach(([name, col], i) => {
    const kx = x + 8 + i * 70;
    S.push(rect(kx, ROWY(0) + 16, 8, 8, col, 0.9, 1.5));
    S.push(txt(kx + 12, ROWY(0) + 23, name, 8, C.ink, 'start'));
  });
}

/* ── b | waterfall ────────────────────────────── */
{
  const x = X0(1) + 4, y = ROWY(0) + 28, w = PW - 30, h = PH - 46;
  head(S, 'b', 'waterfall', x + 30, ROWY(0), PW);
  const n = 22;
  let vals = Array.from({ length: n }, () => N(-18, 32));
  vals = vals.map(v => Math.max(-92, Math.min(72, v))).sort((a, b) => a - b);
  const yv = v => y + h - (v + 100) / 200 * h;
  const y0 = yv(0);
  const bw = w / n;
  vals.forEach((v, i) => {
    const col = v > 20 ? C.red : v >= -30 ? C.gray : (v < -85 ? C.teal : C.blue);
    const bx = x + i * bw + bw * 0.18;
    S.push(rect(bx, Math.min(y0, yv(v)), bw * 0.64, Math.abs(yv(v) - y0), col, 0.92));
    S.push(rect(bx, Math.min(y0, yv(v)), bw * 0.64, Math.abs(yv(v) - y0), 'none'));
  });
  [20, -30].forEach(v => {
    S.push(ln(x, yv(v), x + w, yv(v), '#999', 0.9, '4 3'));
    S.push(txt(x + w - 2, yv(v) - 3.5, (v > 0 ? '+' : '') + v + '%', 7.5, C.tick, 'end'));
  });
  S.push(ln(x, y0, x + w, y0, C.ink, 1.1));
  axes(S, x, y, w, h, [0, 1], [0, .5, 1], null, t => f1(-100 + t * 200), null, 'Best change (%)');
  S.push(txt(x + w / 2, y + h + 27, 'Patient (n = 22)', 10.5, C.ink, 'middle', 'bold'));
  /* frameless key, top-left is empty for a sorted waterfall */
  [['PR', C.blue], ['SD', C.gray], ['PD', C.red], ['CR', C.teal]].forEach(([s2, col], i) => {
    S.push(circle(x + 10 + i * 34, y + 12, 3.2, col));
    S.push(txt(x + 16 + i * 34, y + 15, s2, 8.5, C.ink, 'start'));
  });
}

/* ── c | alluvial ─────────────────────────────── */
{
  const x = X0(2) + 4, y = ROWY(0) + 28, w = PW - 30, h = PH - 46;
  head(S, 'c', 'alluvial', x + 30, ROWY(0), PW);
  const u = (h - 8) / 130;
  const nx = [x + 34, x + 136, x + 238], nw = 16;
  const col = (cx, y0, hgt, lab, n, left) => {
    S.push(rect(cx, y0, nw, hgt, '#D9D9D9', 0.95, 2));
    S.push(txt(left ? cx - 5 : cx + nw + 5, y0 + hgt / 2 + 3, lab, 8, C.ink, left ? 'end' : 'start'));
    S.push(txt(left ? cx - 5 : cx + nw + 5, y0 + hgt / 2 + 12, 'n=' + n, 7, C.tick, left ? 'end' : 'start'));
  };
  const rib = (cx0, y0, hh, cx1, y1, color) => {
    const xm = (cx0 + nw + cx1) / 2;
    S.push(pth(`M${f1(cx0 + nw)} ${f1(y0)} C${f1(xm)} ${f1(y0)} ${f1(xm)} ${f1(y1)} ${f1(cx1)} ${f1(y1)} L${f1(cx1)} ${f1(y1 + hh)} C${f1(xm)} ${f1(y1 + hh)} ${f1(xm)} ${f1(y0 + hh)} ${f1(cx0 + nw)} ${f1(y0 + hh)} Z`, color, 0.4));
  };
  const A = { Chemo: 52, Target: 44, Immuno: 34 }, B = { CR: 30, PR: 48, SD: 32, PD: 20 }, D = { '无复发': 50, '复发': 46, '死亡': 34 };
  const aCol = { Chemo: C.blue, Target: C.teal, Immuno: C.orange };
  let acc = y + 4; const aY = {};
  Object.keys(A).forEach(k => { aY[k] = acc; acc += A[k] * u; });
  acc = y + 4; const bY = {};
  Object.keys(B).forEach(k => { bY[k] = acc; acc += B[k] * u; });
  acc = y + 4; const dY = {};
  Object.keys(D).forEach(k => { dY[k] = acc; acc += D[k] * u; });
  const f12 = [['Chemo', 'PR', 20], ['Chemo', 'SD', 18], ['Chemo', 'PD', 14], ['Target', 'CR', 18], ['Target', 'PR', 16], ['Target', 'SD', 10], ['Immuno', 'CR', 12], ['Immuno', 'PR', 12], ['Immuno', 'SD', 4], ['Immuno', 'PD', 6]];
  const f23 = [['CR', '无复发', 26], ['CR', '复发', 4], ['PR', '无复发', 24], ['PR', '复发', 20], ['PR', '死亡', 4], ['SD', '复发', 18], ['SD', '死亡', 14], ['PD', '复发', 4], ['PD', '死亡', 16]];
  const cur12 = {}, cur23 = {};
  Object.keys(B).forEach(k => { cur12[k] = bY[k]; cur23[k] = bY[k]; });
  /* stage-1 ribbons track both sides */
  const p12 = { Chemo: aY.Chemo, Target: aY.Target, Immuno: aY.Immuno };
  f12.forEach(([a, b, v]) => {
    rib(nx[0], p12[a], v * u, nx[1], cur12[b], aCol[a]);
    p12[a] += v * u; cur12[b] += v * u;
  });
  const p23 = { CR: bY.CR, PR: bY.PR, SD: bY.SD, PD: bY.PD };
  const bCol = { CR: C.teal, PR: C.blue, SD: C.gray, PD: C.red };
  f23.forEach(([b, d, v]) => {
    rib(nx[1], p23[b], v * u, nx[2], cur23[d] === undefined ? dY[d] : cur23[d], bCol[b]);
    p23[b] += v * u; cur23[d] += v * u;
  });
  Object.keys(A).forEach(k => col(nx[0], aY[k], A[k] * u, k, A[k], true));
  Object.keys(B).forEach(k => col(nx[1], bY[k], B[k] * u, k, B[k], false));
  Object.keys(D).forEach(k => col(nx[2], dY[k], D[k] * u, k, D[k], false));
  S.push(txt(x + w / 2, y + h + 16, 'Cohort flow (n = 130)', 9.5, C.ink, 'middle', 'bold'));
}

/* ── d | ridgeline ────────────────────────────── */
{
  const x = X0(0) + 4, y = ROWY(1) + 28, w = PW - 30, h = PH - 46;
  head(S, 'd', 'ridgeline', x + 30, ROWY(1), PW);
  const gx = Array.from({ length: 60 }, (_, i) => i * 10 / 59);
  const groups = [['D1', 2.2, C.blue], ['D2', 3.8, C.teal], ['D3', 5.2, C.green], ['D4', 6.6, C.orange], ['D5', 8.0, C.red]];
  groups.forEach(([lab, mu, col2], gi) => {
    const base = y + h - 6 - gi * (h - 20) / (groups.length - 1);
    const data = Array.from({ length: 46 }, () => N(mu, 0.95));
    const dv = kde(data, 0.55, gx);
    const m = 0.62;
    let p = `M${f1(x)} ${f1(base)}`;
    dv.forEach((v, j) => { p += `L${f1(x + gx[j] / 10 * w)} ${f1(base - v / m * 24)}`; });
    S.push(pth(p + `L${f1(x + w)} ${f1(base)} Z`, col2, 0.55, '#FFFFFF', 1.2));
    data.slice(0, 12).forEach(px => S.push(circle(x + px / 10 * w, base - 1.5, 1.5, '#FFFFFF', 0.9, col2, 0.8)));
    S.push(txt(x - 6, base + 2.5, lab, 8.5, C.ink, 'end'));
  });
  axes(S, x, y + h - 6, w, 6, [0, .5, 1], [0], t => f1(t * 10), t => t === 0 ? '0' : '', 'Expression (a.u.)', null);
}

/* ── e | bland-altman ─────────────────────────── */
{
  const x = X0(1) + 4, y = ROWY(1) + 28, w = PW - 30, h = PH - 46;
  head(S, 'e', 'bland-altman', x + 30, ROWY(1), PW);
  const bias = 1.8, loa = 13.2;
  const yv = v => y + h - (v + 20) / 40 * h;
  for (let i = 0; i < 42; i++) {
    const m = N(62, 18), dv = Math.max(-20, Math.min(20, N(bias, 6)));
    S.push(circle(x + Math.min(99, Math.max(21, m)) / 100 * w, yv(dv), 3.4, i % 2 ? C.mauve : C.teal, 0.8));
  }
  [bias, bias + loa, bias - loa].forEach((v, i) => {
    S.push(ln(x, yv(v), x + w, yv(v), i ? '#999' : C.red, i ? 0.9 : 1.2, i ? '4 3' : ''));
    S.push(txt(x + w - 3, yv(v) - 3.5, i === 0 ? 'Bias = 1.8' : (i === 1 ? '+1.96 SD' : '-1.96 SD'), 8, i ? C.tick : '#8A4A52', 'end', 'bold'));
  });
  axes(S, x, y, w, h, [0, .5, 1], [0, .5, 1], t => f1(20 + t * 80), t => f1(-20 + t * 40), 'Mean of methods', 'Difference');
}

/* ── f | stacked area stream ──────────────────── */
{
  const x = X0(2) + 4, y = ROWY(1) + 28, w = PW - 30, h = PH - 46;
  head(S, 'f', 'immune composition', x + 30, ROWY(1), PW);
  const tp = 7, ts = [0, 8, 16, 24, 32, 40, 48];
  const raw = ts.map((_, i) => [22 + i * 3.4 + N(0, 2), 30 - i * 2.2 + N(0, 2), 26 + i * 1.8 + N(0, 2), 22 - i * 3 + N(0, 2)]);
  const sums = raw.map(r => r.reduce((a, b) => a + b, 0));
  const pct = raw.map(r => r.map(v => v / sums[raw.indexOf(r)] * 100));
  const yv = v => y + h - v / 100 * h;
  const xv = i => x + ts[i] / 48 * w;
  const cols = [C.blue, C.teal, C.yellow, C.orange];
  const labs = ['CD8 T', 'Treg', 'Macro', 'Fibro'];
  let lower = ts.map(() => 0);
  for (let s2 = 0; s2 < 4; s2++) {
    const upper = lower.map((l, i) => l + pct[i][s2]);
    let p = `M${f1(xv(0))} ${f1(yv(lower[0]))}`;
    for (let i = 0; i < tp; i++) p += `L${f1(xv(i))} ${f1(yv(upper[i]))}`;
    for (let i = tp - 1; i >= 0; i--) p += `L${f1(xv(i))} ${f1(yv(lower[i]))}`;
    S.push(pth(p + 'Z', cols[s2], 0.62, '#FFFFFF', 1));
    /* direct label inside the band */
    const mi = 3;
    S.push(txt(xv(mi), yv((lower[mi] + upper[mi]) / 2) + 3, labs[s2], 8.5, '#FFFFFF', 'middle', 'bold'));
    lower = upper;
  }
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1.2));
  S.push(ln(x, y, x, y + h, C.ink, 1.2));
  [0, .5, 1].forEach(t => {
    S.push(ln(x - 3.5, y + h - t * h, x, y + h - t * h, C.ink, 1));
    S.push(txt(x - 6, y + h - t * h + 3, f1(t * 100), 9, C.tick, 'end'));
  });
  [0, .5, 1].forEach(t => {
    S.push(ln(x + t * w, y + h, x + t * w, y + h + 3.5, C.ink, 1));
    S.push(txt(x + t * w, y + h + 13, f1(t * 48) + 'h', 9, C.tick));
  });
  S.push(txt(x + w / 2, y + h + 27, 'Time after treatment', 10.5, C.ink, 'middle', 'bold'));
  S.push(txt(x - 36, y + h / 2, 'Proportion (%)', 10.5, C.ink, 'middle', 'bold', -90));
}

/* ── g | forest ───────────────────────────────── */
{
  const x = X0(0) + 48, y = ROWY(2) + 30, w = 168, h = PH - 52;
  head(S, 'g', 'forest', x + 30, ROWY(2), PW);
  const rows = [['Overall', 0.72, 0.58, 0.89, 1], ['Age &lt; 60', 0.65, 0.48, 0.88, 0.6], ['Age ≥ 60', 0.81, 0.60, 1.09, 0.6], ['Male', 0.76, 0.57, 1.01, 0.6], ['Female', 0.66, 0.45, 0.97, 0.6], ['Stage II', 0.59, 0.42, 0.83, 0.6], ['Stage III', 0.88, 0.65, 1.19, 0.6]];
  const xr = v => (Math.log(v) - Math.log(0.4)) / (Math.log(2.5) - Math.log(0.4));
  const rh = h / rows.length;
  S.push(ln(x + xr(1) * w, y - 4, x + xr(1) * w, y + h + 2, '#999', 0.9, '4 3'));
  rows.forEach(([lab, hr, lo, hi, wt], i) => {
    const cy = y + rh * i + rh / 2;
    S.push(txt(x - 6, cy + 3, lab, 8.5, C.ink, 'end'));
    const isOverall = i === 0;
    S.push(ln(x + xr(lo) * w, cy, x + xr(hi) * w, cy, C.blue, 1.4));
    [lo, hi].forEach(v => S.push(ln(x + xr(v) * w, cy - 3, x + xr(v) * w, cy + 3, C.blue, 1.4)));
    if (isOverall) {
      const cx = x + xr(hr) * w, dw = 6;
      S.push(pth(`M${f1(cx)} ${f1(cy - 5)} L${f1(cx + dw)} ${f1(cy)} L${f1(cx)} ${f1(cy + 5)} L${f1(cx - dw)} ${f1(cy)} Z`, C.red, 0.95));
    } else S.push(rect(x + xr(hr) * w - 3.2 * wt - 1, cy - 3.2 * wt - 1, 6.4 * wt + 2, 6.4 * wt + 2, C.blue, 0.95));
    S.push(txt(x + w + 6, cy + 3, `${hr.toFixed(2)} (${lo.toFixed(2)}-${hi.toFixed(2)})`, 8, C.tick, 'start'));
  });
  S.push(ln(x, y, x, y + h, C.ink, 1.2));
  [0.5, 1, 2].forEach(v => {
    S.push(ln(x + xr(v) * w, y + h, x + xr(v) * w, y + h + 3.5, C.ink, 1));
    S.push(txt(x + xr(v) * w, y + h + 13, String(v), 9, C.tick));
  });
  S.push(txt(x + w / 2, y + h + 27, 'Hazard ratio (log scale)', 10.5, C.ink, 'middle', 'bold'));
  S.push(txt(x + w + 6, y - 9, 'HR (95% CI)', 8.5, C.ink, 'start', 'bold'));
}

/* ── h | manhattan ────────────────────────────── */
{
  const x = X0(1) + 4, y = ROWY(2) + 28, w = PW - 30, h = PH - 46;
  head(S, 'h', 'manhattan', x + 30, ROWY(2), PW);
  const yv = v => y + h - v / 10 * h;
  const chrLen = [0.055, 0.052, 0.045, 0.042, 0.038, 0.036, 0.034, 0.031, 0.03, 0.028, 0.027, 0.026, 0.024, 0.022, 0.021, 0.02, 0.018, 0.017, 0.015, 0.013, 0.011, 0.009];
  const TT = chrLen.reduce((a, b) => a + b, 0);
  let cum = 0; const chrBest = {};
  chrLen.forEach((len, ci) => {
    for (let i = 0; i < Math.floor(len * 950); i++) {
      const t = (cum + rnd() * len) / TT;
      let pv = -Math.log10(rnd()) * 1.6;
      if (ci === 3 && rnd() > 0.6) pv = 6.2 + rnd() * 3.4;
      if (ci === 10 && rnd() > 0.75) pv = 5.6 + rnd() * 2.4;
      const sig = pv > 7.3;
      if (sig && (!chrBest[ci] || pv > chrBest[ci][1])) chrBest[ci] = [t, pv];
      S.push(circle(x + t * w, yv(Math.min(9.6, pv)), sig ? 2.4 : 1.2, sig ? C.red : (ci % 2 ? C.blue : '#C9DFF2'), sig ? 0.95 : 0.7));
    }
    cum += len;
  });
  S.push(ln(x, yv(7.3), x + w, yv(7.3), '#999', 0.9, '4 3'));
  S.push(txt(x + w - 2, yv(7.3) - 3.5, 'P = 5e-8', 7.5, C.tick, 'end'));
  const peaks = Object.values(chrBest).sort((a, b) => b[1] - a[1]).slice(0, 3);
  ['PICALM', 'ABCA7', 'BIN1'].forEach((g, pi) => {
    if (peaks[pi]) S.push(txt(x + peaks[pi][0] * w, yv(peaks[pi][1]) - 5, g, 8, '#8A4A52', 'middle', 'bold'));
  });
  S.push(ln(x, y + h, x + w, y + h, C.ink, 1.2));
  [0, .5, 1].forEach(t => {
    S.push(ln(x, y + h - t * h, x - 3.5, y + h - t * h, C.ink, 1));
    S.push(txt(x - 6, y + h - t * h + 3, String(Math.round(t * 10)), 9, C.tick, 'end'));
  });
  S.push(txt(x - 36, y + h / 2, '-log10 (P)', 10.5, C.ink, 'middle', 'bold', -90));
  S.push(txt(x + w / 2, y + h + 27, 'Genomic position (chr 1-22)', 10.5, C.ink, 'middle', 'bold'));
}

const H = 66 + 3 * 296 + 6;
fs.writeFileSync('../../assets/showcase-extra.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="100%" fill="#FFFFFF"/>${S.join('')}</svg>`);
console.log('showcase-extra.svg written', W, 'x', H);
