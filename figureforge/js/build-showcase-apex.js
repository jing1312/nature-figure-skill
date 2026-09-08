/* build-showcase-apex.js — 9 final compositions: meta, diagnostics and layout */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260925;
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

S.push(txt(16, 26, 'FigureForge apex atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Nine final compositions — meta-analysis, diagnostics and layout.', 10.5, '#777', 'start'));

/* ── a | funnel plot (meta-analysis) ── */
{
  const x = X0(0) + 8, y = ROWY(0) + 32, w = PW - 38, h = PH - 56;
  head(S, 'a', 'funnel plot', X0(0) + 30, ROWY(0), PW);
  const xv = r2 => x + (r2 + 2) / 4 * w, yv = s2 => y + s2 / 1.2 * h;
  /* pseudo 95% CI funnel */
  S.push(pth(`M${xv(0)} ${yv(0)}L${xv(-1.96 * 0.5)} ${yv(0.5)}L${xv(-1.96 * 1.2)} ${yv(1.2)}L${xv(1.96 * 1.2)} ${yv(1.2)}L${xv(1.96 * 0.5)} ${yv(0.5)}Z`, C.gray, 0.18));
  S.push(ln(xv(-1.96 * 1.2), yv(1.2), xv(0), yv(0), '#AAA', 1, '4 3'));
  S.push(ln(xv(1.96 * 1.2), yv(1.2), xv(0), yv(0), '#AAA', 1, '4 3'));
  S.push(ln(xv(0), y, xv(0), y + h, '#888', 1.1, '4 3'));
  /* studies */
  for (let k = 0; k < 16; k++) {
    const se2 = 0.12 + rnd() * 0.95;
    let rr = N(0, 0.35 + se2 * 0.8);
    const outside = k === 3;
    if (outside) rr = -1.35;
    rr = Math.max(-1.9, Math.min(1.9, rr));
    S.push(circle(xv(rr), yv(se2), 3, outside ? C.rose : C.blue, 0.85, '#FFFFFF', 0.8));
  }
  /* pooled diamond */
  const dx = xv(0), dy = yv(1.02), dw = 0.12 / 4 * w;
  S.push(pth(`M${f1(dx - dw)} ${f1(dy)}L${f1(dx)} ${f1(dy - 6)}L${f1(dx + dw)} ${f1(dy)}L${f1(dx)} ${f1(dy + 6)}Z`, C.ink, 0.9));
  S.push(txt(x + w - 4, y + 10, 'pooled RR 1.00', 8, C.ink, 'end', 'bold'));
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1],
    t => f1(-2 + t * 4), t => f1(t * 1.2), 'Risk ratio (log scale)', 'Standard error');
}

/* ── b | taylor diagram ── */
{
  const x = X0(1) + 10, y = ROWY(0) + 30, w = PW - 30, h = PH - 48;
  head(S, 'b', 'taylor diagram', X0(1) + 30, ROWY(0), PW);
  const cx2 = x + 26, cy2 = y + h - 30, sc = 58;
  const P = (a, r) => `${f1(cx2 + r * Math.cos(a))} ${f1(cy2 - r * Math.sin(a))}`;
  /* std-dev arcs */
  [0.5, 1, 1.5, 2].forEach(sv => {
    S.push(`<path d="M${P(0, sv * sc)}A${sv * sc} ${sv * sc} 0 0 0 ${P(Math.PI / 2, sv * sc)}" fill="none" stroke="#D5D5D5" stroke-width="0.9"/>`);
    S.push(txt(cx2 + sv * sc, cy2 + 11, f1(sv), 7.5, C.tick));
  });
  S.push(`<path d="M${P(0, 2.2 * sc)}A${2.2 * sc} ${2.2 * sc} 0 0 0 ${P(Math.PI / 2, 2.2 * sc)}" fill="none" stroke="#999" stroke-width="1"/>`);
  S.push(ln(cx2, cy2, cx2 + 2.2 * sc, cy2, '#999', 1));
  S.push(ln(cx2, cy2, cx2, cy2 - 2.2 * sc, '#999', 1));
  /* reference std point */
  const refR = 1.5 * sc;
  circle;
  S.push(circle(cx2 + refR, cy2, 3.4, '#555', 1, '#FFFFFF', 1));
  S.push(txt(cx2 + refR, cy2 + 12, "σ ref'", 7.5, C.tick));
  /* correlation lines from reference point */
  [0.99, 0.95, 0.9, 0.8, 0.6].forEach(rr => {
    const th = Math.acos(rr), L = 2.2 * sc;
    S.push(ln(cx2 + refR, cy2, cx2 + refR + L * Math.cos(Math.PI - th), cy2 - L * Math.sin(th), '#C9C9C9', 0.8, '3 2.4'));
    S.push(txt(cx2 + refR + (L + 8) * Math.cos(Math.PI - th), cy2 - (L + 8) * Math.sin(th) + 2.5, 'r=' + rr, 6.5, C.tick));
  });
  /* models */
  const models = [[1.35, 0.97, C.blue, 'CNN'], [1.62, 0.93, C.rose, 'RF'], [1.05, 0.88, C.mint, 'SVM'], [1.8, 0.78, C.honey, 'GLM'], [1.45, 0.85, C.lilac, 'XGB']];
  models.forEach(([sv, rr, col, nm]) => {
    const th = Math.acos(rr);
    const px2 = cx2 + refR + sv * sc * Math.cos(Math.PI - th), py2 = cy2 - sv * sc * Math.sin(th);
    S.push(circle(px2, py2, 4.2, col, 0.9, '#FFFFFF', 1));
    S.push(txt(px2, py2 - 7, nm, 7.5, C.ink, 'middle', 'bold'));
  });
  S.push(txt(cx2 + sc, cy2 + 24, 'σ (std dev)', 8.5, C.ink, 'middle', 'bold'));
}

/* ── c | arc diagram ── */
{
  const x = X0(2) + 12, y = ROWY(0) + 150, w = PW - 40;
  head(S, 'c', 'arc diagram', X0(2) + 30, ROWY(0), PW);
  const nodes = ['T', 'B', 'T', 'NK', 'M', 'F', 'M', 'T', 'B', 'F', 'NK', 'M'];
  const ncol = { T: C.blue, B: C.rose, NK: C.lilac, M: C.mint, F: C.honey };
  const links = [[0, 7, 3], [1, 8, 2], [2, 0, 1.4], [3, 10, 1.8], [4, 6, 2.2], [5, 9, 1.6], [4, 11, 1.2], [2, 4, 1], [7, 10, 1.3], [0, 2, 1.1], [5, 11, 0.9], [1, 3, 0.8]];
  links.forEach(([i, j, wgt]) => {
    const x1 = x + i / 11 * w, x2 = x + j / 11 * w;
    const h2 = Math.abs(x2 - x1) * 0.52;
    S.push(`<path d="M${f1(x1)} ${f1(y)}A${f1(h2)} ${f1(h2)} 0 0 1 ${f1(x2)} ${f1(y)}" fill="none" stroke="${ncol[nodes[i]]}" stroke-width="${f1(wgt)}" stroke-opacity="0.4"/>`);
  });
  nodes.forEach((nm, i) => S.push(circle(x + i / 11 * w, y, 3.8, ncol[nm], 1, '#FFFFFF', 1)));
  /* module key */
  const keys = [['T cell', C.blue], ['B cell', C.rose], ['NK', C.lilac], ['Macro', C.mint], ['Fibro', C.honey]];
  let lx = x + 2;
  keys.forEach(([nm, col]) => {
    S.push(circle(lx, y + 16, 3, col));
    S.push(txt(lx + 7, y + 19, nm, 7.5, C.ink, 'start'));
    lx += 52;
  });
}

/* ── d | icicle chart ── */
{
  const x = X0(0) + 14, y = ROWY(1) + 36, w = PW - 28, h = PH - 62;
  head(S, 'd', 'icicle', X0(0) + 30, ROWY(1), PW);
  const tree = [
    ['Metabolism', 0.32, C.blue, [['Glycolysis', 0.55], ['TCA', 0.45]]],
    ['Immune', 0.28, C.rose, [['IFN', 0.6], ['Antigen', 0.4]]],
    ['Cell cycle', 0.22, C.mint, [['G2M', 0.5], ['E2F', 0.5]]],
    ['ECM', 0.18, C.honey, [['Collagen', 0.6], ['MMP', 0.4]]]
  ];
  const dw = 22;
  S.push(rect(x, y, dw, h, C.plum, 0.85));
  S.push(txt(x + dw / 2, y + h / 2 + 3, 'Root', 8, '#FFFFFF', 'middle', 'bold', -90));
  let yy = y;
  tree.forEach(([nm, share, col, kids]) => {
    const hh = share * h;
    S.push(rect(x + dw + 2, yy, dw, hh - 1.5, col, 0.85));
    S.push(txt(x + dw + 2 + dw / 2, yy + hh / 2 + 3, nm, 7.5, '#FFFFFF', 'middle', 'bold', -90));
    let ky = yy;
    kids.forEach(([knm, kp]) => {
      const kh = kp * (hh - 2);
      S.push(rect(x + 2 * (dw + 2), ky, dw, kh - 1.5, col, 0.5));
      if (kh > 16) S.push(txt(x + 2 * (dw + 2) + dw / 2, ky + kh / 2 + 3, knm, 7, C.ink, 'middle', 'bold', -90));
      ky += kh;
    });
    yy += hh;
  });
  S.push(txt(x + w / 2, y + h + 16, '通路层级（宽度 = 数量占比）', 8.5, C.tick));
}

/* ── e | beeswarm ── */
{
  const x = X0(1) + 8, y = ROWY(1) + 34, w = PW - 38, h = PH - 58;
  head(S, 'e', 'beeswarm', X0(1) + 30, ROWY(1), PW);
  const groups = [['Ctrl', C.blue, 3.2], ['Low', C.mint, 4.1], ['High', C.rose, 5.2]];
  const gw = w / 3, r2 = 3.2, minD2 = (2 * r2 + 0.5) ** 2;
  groups.forEach(([nm, col, mu], gi) => {
    const gx = x + gi * gw + gw / 2;
    const vals = Array.from({ length: 42 }, () => Math.max(mu - 1.5, Math.min(mu + 1.5, N(mu, 0.45)))).sort((a2, b2) => a2 - b2);
    const placed = [];
    vals.forEach(v => {
      const py2 = y + h - (v - 1.4) / 5.2 * h;
      let best = null;
      for (let step = 0; step < 40; step++) {
        for (const sgn of (step === 0 ? [1] : [1, -1])) {
          const off = step * 2.6 * sgn;
          const px2 = gx + off;
          let ok = true;
          for (const [qx, qy] of placed) {
            if ((px2 - qx) ** 2 + (py2 - qy) ** 2 < minD2) { ok = false; break; }
          }
          if (ok) { best = px2; break; }
        }
        if (best !== null) break;
      }
      if (best === null) best = gx;
      placed.push([best, py2]);
      S.push(circle(best, py2, r2, col, 0.8));
    });
    S.push(txt(gx, y + h + 14, nm, 9, C.ink, 'middle', 'bold'));
  });
  axes(S, x, y, w, h, [], [0, 0.5, 1], null, t => f1(1.4 + t * 5.2), null, 'Response score');
}

/* ── f | cycle plot ── */
{
  const x = X0(2) + 8, y = ROWY(1) + 36, w = PW - 36, h = PH - 62;
  head(S, 'f', 'cycle plot', X0(2) + 30, ROWY(1), PW);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const colW = w / 12;
  const monthly = m2 => 10 + 6 * Math.sin(m2 / 12 * 2 * Math.PI - 1.2);
  const means = months.map((_, m2) => monthly(m2));
  months.forEach((mn, m2) => {
    const cx2 = x + m2 * colW + colW / 2;
    const yrs = Array.from({ length: 6 }, () => Math.max(1, Math.min(19, means[m2] + N(0, 1.1))));
    yrs.forEach(v => S.push(circle(cx2 - 5, y + h - v / 20 * h, 1.9, C.gray, 0.7)));
    const mMean = yrs.reduce((a2, b2) => a2 + b2, 0) / 6;
    S.push(ln(cx2 - 10, y + h - mMean / 20 * h, cx2 + 1, y + h - mMean / 20 * h, C.blue, 1.6));
    S.push(txt(cx2 + colW / 2 - 3, y + h + 11, mn, 7.5, C.tick));
  });
  let d2 = '';
  means.forEach((v, m2) => { d2 += (m2 ? 'L' : 'M') + f1(x + m2 * colW + colW / 2 + colW * 0.15) + ' ' + f1(y + h - v / 20 * h); });
  S.push(`<path d="${d2}" fill="none" stroke="${C.rose}" stroke-width="2"/>`);
  S.push(txt(x + w - 4, y + 10, '月均值连线', 7.5, C.rose, 'end', 'bold'));
  axes(S, x, y, w, h, [], [0, 0.5, 1], null, t => f1(t * 20), null, 'Outpatient volume');
}

/* ── g | horizon chart ── */
{
  const x = X0(0) + 8, y = ROWY(2) + 38, w = PW - 38, h = PH - 64;
  head(S, 'g', 'horizon', X0(0) + 30, ROWY(2), PW);
  const vals = Array.from({ length: 56 }, (_, i) => 1.6 + 1.1 * Math.sin(i / 9) + 0.55 * Math.sin(i / 3.1 + 1) + Math.abs(N(0, 0.22)));
  const mx2 = Math.max(...vals), bh = mx2 / 3;
  const bands = [[C.indigo, 0.34], [C.indigo, 0.62], [C.indigo, 1]];
  bands.forEach(([col, op], k) => {
    let d2 = `M${f1(x)} ${f1(y + h)}`;
    vals.forEach((v, i) => {
      const folded = Math.max(0, Math.min(bh, v - (2 - k) * bh));
      d2 += `L${f1(x + i / 55 * w)} ${f1(y + h - folded / bh * h)}`;
    });
    d2 += `L${f1(x + w)} ${f1(y + h)}Z`;
    S.push(pth(d2, col, op * 0.55));
  });
  S.push(txt(x + 2, y + 10, '3 层折叠 · 深=高值', 7.5, C.tick, 'start'));
  axes(S, x, y, w, h, [0, 0.5, 1], [], t => 'w' + Math.round(t * 8), null, 'Time');
}

/* ── h | bullet chart ── */
{
  const x = X0(1) + 8, y = ROWY(2) + 38, w = PW - 38, h = PH - 62;
  head(S, 'h', 'bullet kpis', X0(1) + 30, ROWY(2), PW);
  const rows = [['Enrollment', 0.72, 0.7], ['Response', 0.58, 0.65], ['Safety', 0.83, 0.75], ['Data quality', 0.66, 0.7], ['Budget use', 0.49, 0.6]];
  const rowH = h / rows.length;
  rows.forEach(([nm, v, tgt], i) => {
    const yy = y + i * rowH + rowH / 2;
    const bh = rowH * 0.38;
    S.push(rect(x, yy - bh / 2, w, bh, '#E9E9E9', 1, 2));
    S.push(rect(x, yy - bh / 2, w * 0.6, bh, '#D5D5D5', 1, 2));
    S.push(rect(x, yy - bh / 2, w * 0.32, bh, '#C4C4C4', 1, 2));
    S.push(rect(x, yy - bh * 0.32, w * v, bh * 0.64, C.ink, 0.82, 1.5));
    S.push(ln(x + w * tgt, yy - bh * 0.7, x + w * tgt, yy + bh * 0.7, C.rose, 2));
    S.push(txt(x - 4, yy + 2.5, nm, 8, C.ink, 'end'));
  });
  /* scale */
  [0, 0.5, 1].forEach(t => S.push(txt(x + t * w, y + h + 13, t * 100 + '%', 8, C.tick)));
  S.push(txt(x + w - 4, y - 8, '— 玫红 = 目标', 7.5, C.tick, 'end'));
}

/* ── i | waffle chart ── */
{
  const x = X0(2) + 14, y = ROWY(2) + 44, sq = 17, gap2 = 3;
  head(S, 'i', 'waffle 100', X0(2) + 30, ROWY(2), PW);
  const cats = [['Responder', 42, C.teal], ['Stable', 26, C.honey], ['Progressive', 18, C.coral], ['Not evaluable', 14, '#D9D9D9']];
  let idx = 0;
  for (let r2 = 0; r2 < 10; r2++) {
    for (let c2 = 0; c2 < 10; c2++) {
      let acc = 0, col = '#EEE';
      for (const [nm, n2, cc] of cats) {
        if (idx < acc + n2) { col = cc; break; }
        acc += n2;
      }
      S.push(rect(x + c2 * (sq + gap2), y + r2 * (sq + gap2), sq, sq, col, 0.92, 2.5));
      idx++;
    }
  }
  let ly = y + 12;
  cats.forEach(([nm, n2, col]) => {
    S.push(rect(x + waffleW(sq) + 18, ly - 6, 9, 9, col, 0.92, 2));
    S.push(txt(x + waffleW(sq) + 31, ly + 2, nm + ' ' + n2 + '%', 8.5, C.ink, 'start'));
    ly += 22;
  });
  function waffleW(sq2) { return 10 * (sq2 + gap2) - gap2; }
}

/* ── output ── */
const H = 66 + 3 * 296 + 6;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF"/>${S.join('')}</svg>`;
const out = '../../assets/showcase-apex.svg';
fs.writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
