/* build-showcase-max.js — 9 further compositions: matrix, ranking and density */
const fs = require('fs');
const f1 = n => Math.round(n * 10) / 10;
let seed = 20260923;
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

S.push(txt(16, 26, 'FigureForge max atlas', 17, '#111', 'start', 'bold'));
S.push(txt(16, 44, 'Nine further compositions — matrices, ranking and density.', 10.5, '#777', 'start'));

/* ── a | scatterplot matrix ── */
{
  const x0 = X0(0) + 46, y0 = ROWY(0) + 36, cs = 56;
  head(S, 'a', 'splom', X0(0) + 30, ROWY(0), PW);
  const dims = ['Age', 'BMI', 'MAP', 'Gluc'];
  const colsG = [C.blue, C.rose];
  const raw = Array.from({ length: 34 }, () => [N(50, 12), N(25, 3.5), N(95, 9), N(6, 1)]);
  const rng = [[28, 72], [17, 33], [70, 120], [3, 9]];
  const pos = (d, v) => (v - rng[d][0]) / (rng[d][1] - rng[d][0]);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const cx2 = x0 + c * cs, cy2 = y0 + r * cs;
    S.push(rect(cx2, cy2, cs - 2, cs - 2, '#FAFBFC', 1, 2));
    if (r === c) {
      /* diagonal density */
      let d2 = '';
      for (let k = 0; k <= 24; k++) {
        const v = rng[r][0] + (rng[r][1] - rng[r][0]) * k / 24;
        const d3 = raw.reduce((s2, p) => s2 + Math.exp(-((v - p[r]) ** 2) / (2 * 2.2)), 0);
        const px2 = cx2 + 2 + (cs - 6) * k / 24;
        const py2 = cy2 + cs - 4 - Math.min(1, d3 / 10) * (cs - 10);
        d2 += (k ? 'L' : 'M') + f1(px2) + ' ' + f1(py2);
      }
      S.push(`<path d="${d2}" fill="none" stroke="${C.plum}" stroke-width="1.5"/>`);
    } else {
      raw.forEach(p => {
        const px2 = cx2 + 3 + pos(c, p[c]) * (cs - 8);
        const py2 = cy2 + cs - 3 - pos(r, p[r]) * (cs - 8);
        S.push(circle(px2, py2, 1.9, p[0] > 50 ? C.blue : C.rose, 0.65));
      });
    }
  }
  dims.forEach((d2, i) => {
    S.push(txt(x0 + i * cs + cs / 2 - 1, y0 - 6, d2, 8, C.ink, 'middle', 'bold'));
    S.push(txt(x0 - 6, y0 + i * cs + cs / 2, d2, 8, C.ink, 'end', 'bold'));
  });
}

/* ── b | MA plot ── */
{
  const x = X0(1) + 8, y = ROWY(0) + 34, w = PW - 38, h = PH - 58;
  head(S, 'b', 'ma plot', X0(1) + 30, ROWY(0), PW);
  for (let k = 0; k < 200; k++) {
    const ax = N(1.6, 0.9);
    let ly = N(0, 0.35);
    if (rnd() < 0.07) ly = rnd() > 0.5 ? N(1.6, 0.4) : N(-1.6, 0.4);
    ly = Math.max(-2.9, Math.min(2.9, ly));
    const px2 = Math.max(0.1, Math.min(3.4, ax)), py2 = y + h - (ly + 3) / 6 * h;
    const sig = Math.abs(ly) > 1 && ax > 1.2;
    S.push(circle(x + px2 / 3.4 * w, py2, sig ? 2.4 : 1.6, sig ? C.rose : C.gray, sig ? 0.9 : 0.55));
  }
  S.push(ln(x, y + h / 2, x + w, y + h / 2, '#999', 1, '4 3'));
  S.push(txt(x + w - 4, y + h / 2 - 4, 'logFC = 0', 7.5, C.tick, 'end'));
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1],
    t => f1(t * 3.4 - 0.4), t => f1(-3 + t * 6), 'Mean abundance (log10)', 'log₂ (Fold change)');
}

/* ── c | gsea dot plot ── */
{
  const x = X0(2) + 8, y = ROWY(0) + 40, w = PW - 44, h = PH - 66;
  head(S, 'c', 'pathway dot plot', X0(2) + 30, ROWY(0), PW);
  const rows = ['Glycolysis', 'OxPhos', 'Fatty acid', 'IFN response', 'Antigen', 'ECM remodel'];
  const cols2 = ['CD8', 'Macro', 'Fibro', 'Endo'];
  const cw2 = w / cols2.length, rh = h / rows.length;
  rows.forEach((nm, i) => {
    S.push(txt(x - 4, y + i * rh + rh / 2 + 2.5, nm, 8, C.ink, 'end'));
    cols2.forEach((cm, j) => {
      const nes = N(0, 1.15);
      const fd = Math.abs(nes) + rnd() * 1.4;
      const col = nes > 0 ? mixr('#F5EFF2', '#D97A93', Math.min(1, Math.abs(nes) / 2)) : mixr('#EFF5F2', '#5FA98B', Math.min(1, Math.abs(nes) / 2));
      S.push(circle(x + (j + 0.5) * cw2, y + (i + 0.5) * rh, 2.5 + fd * 3.4, col, 0.95, '#FFFFFF', 0.7));
    });
  });
  cols2.forEach((cm, j) => S.push(txt(x + (j + 0.5) * cw2, y - 7, cm, 8.5, C.ink, 'middle', 'bold')));
  /* horizontal NES colorbar */
  for (let k = 0; k < 46; k++) {
    const t2 = (k - 23) / 23;
    S.push(rect(x + w / 2 - 46 + k * 2, y + h + 10, 2, 7, t2 < 0 ? mixr('#EFF5F2', '#5FA98B', -t2) : mixr('#F5EFF2', '#D97A93', t2)));
  }
  S.push(txt(x + w / 2 - 50, y + h + 16, '-2', 7, C.tick, 'end'));
  S.push(txt(x + w / 2 + 50, y + h + 16, '+2', 7, C.tick, 'start'));
  S.push(txt(x + w / 2, y + h + 28, 'NES', 8.5, C.ink, 'middle', 'bold'));
  S.push(txt(x + w / 2 - 84, y + h + 16, 'dot size = significance', 7.5, C.tick, 'end'));
}

/* ── d | circle packing ── */
{
  const cx = X0(0) + PW / 2 + 2, cy = ROWY(1) + 128;
  head(S, 'd', 'circle packing', X0(0) + 30, ROWY(1), PW);
  S.push(circle(cx, cy, 104, '#F6F7F9', 1, '#DDD', 1));
  const packs = [[-40, -22, 46, C.blue, 'Firmicutes'], [34, -30, 40, C.rose, 'Bacteroidetes'], [8, 44, 36, C.mint, 'Actinobacteria']];
  packs.forEach(([dx, dy, r2, col, nm]) => {
    S.push(circle(cx + dx, cy + dy, r2, col, 0.35, col, 1.4));
    const kids = 3 + (r2 > 42 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const a = k * 2.1 + dx * 0.05;
      const rr2 = r2 * (0.3 + 0.16 * (k % 2));
      S.push(circle(cx + dx + Math.cos(a) * r2 * 0.5, cy + dy + Math.sin(a) * r2 * 0.5, rr2, col, 0.75, '#FFFFFF', 0.8));
    }
    const labAbove = nm !== 'Actinobacteria';
    S.push(txt(cx + dx + (labAbove ? 0 : -14), cy + dy + (labAbove ? -r2 - 5 : r2 + 12), nm, 8, C.ink, 'middle', 'bold'));
  });
}

/* ── e | bump chart ── */
{
  const x = X0(1) + 8, y = ROWY(1) + 38, w = PW - 76, h = PH - 66;
  head(S, 'e', 'bump — rank flow', X0(1) + 30, ROWY(1), PW);
  const ents = [['T cell', C.blue, [1, 1, 2, 1, 1]], ['Macro', C.rose, [2, 3, 1, 2, 2]], ['Fibro', C.mint, [3, 2, 3, 3, 4]],
                ['Endo', C.honey, [4, 4, 4, 5, 3]], ['NK', C.lilac, [5, 6, 5, 4, 5]], ['B cell', C.teal, [6, 5, 6, 6, 6]]];
  const xv = t => x + t / 4 * w, yv = rk => y + (rk - 1) / 5 * h;
  ents.forEach(([nm, col, rk], i) => {
    let d2 = '';
    rk.forEach((r2, t) => { d2 += (t ? 'L' : 'M') + f1(xv(t)) + ' ' + f1(yv(r2)); });
    S.push(`<path d="${d2}" fill="none" stroke="${col}" stroke-width="2.4" stroke-opacity="0.85"/>`);
    rk.forEach((r2, t) => S.push(circle(xv(t), yv(r2), 3.6, col, 1, '#FFFFFF', 1.2)));
    S.push(txt(x - 6, yv(rk[0]) + 3, nm, 8.5, C.ink, 'end', 'bold'));
    S.push(txt(x + w + 6, yv(rk[4]) + 3, nm, 8.5, C.ink, 'start', 'bold'));
  });
  [0, 1, 2, 3, 4].forEach(t => S.push(txt(xv(t), y + h + 14, 'W' + t, 8, C.tick)));
  S.push(ln(x, y, x, y + h, '#C9C9C9', 0.8, '2 3'));
}

/* ── f | contour density + points ── */
{
  const x = X0(2) + 8, y = ROWY(1) + 34, w = PW - 38, h = PH - 58;
  head(S, 'f', '2d density contour', X0(2) + 30, ROWY(1), PW);
  const g = [[0.42, 0.5, 0.11, 0.09, 0.7], [0.68, 0.32, 0.07, 0.06, 0.3]];
  const dens = (u, v) => g.reduce((acc2, [mu1, mu2, sg1, sg2, w2]) => acc2 + w2 * Math.exp(-(((u - mu1) / sg1) ** 2 + ((v - mu2) / sg2) ** 2) / 2), 0);
  const px = u => x + u * w, py = v => y + h - v * h;
  const AR = h / w; /* aspect ratio for circular contours in data space */
  [0.30, 0.11, 0.04].forEach((lv, li) => {
    let d2 = '', open = false;
    for (let k = 0; k <= 64; k++) {
      const a = k / 64 * 2 * Math.PI;
      let lo = 0.001, hi = 0.55, mid = lo;
      for (let it = 0; it < 24; it++) {
        mid = (lo + hi) / 2;
        const u = 0.42 + mid * Math.cos(a), v = 0.5 + mid * Math.sin(a) * 1.15;
        if (u < -0.05 || u > 1.05 || v < -0.05 || v > 1.05) { hi = mid; continue; }
        if (dens(u, v) > lv) lo = mid; else hi = mid;
      }
      const u = 0.42 + lo * Math.cos(a), v = 0.5 + lo * Math.sin(a) * 1.15;
      if (u < -0.02 || u > 1.02 || v < -0.02 || v > 1.02) { open = false; continue; }
      d2 += (open ? 'L' : 'M') + f1(px(u)) + ' ' + f1(py(v));
      open = true;
    }
    S.push(`<path d="${d2}${open ? 'Z' : ''}" fill="none" stroke="${mixr('#C9D8E8', C.blue, li / 2)}" stroke-width="1.3"${li === 2 ? '' : ' stroke-dasharray="3 2.4"'}/>`);
  });
  for (let k = 0; k < 140; k++) {
    const which = rnd() < 0.7 ? 0 : 1;
    const [mu1, mu2, sg1, sg2] = g[which];
    const u = Math.max(0.03, Math.min(0.97, N(mu1, sg1)));
    const v = Math.max(0.04, Math.min(0.96, N(mu2, sg2)));
    S.push(circle(px(u), py(v), 1.8, C.plum, 0.5));
  }
  axes(S, x, y, w, h, [0, 0.5, 1], [0, 0.5, 1], t => f1(t * 10), t => f1(t * 20), 'PC1 (34%)', 'PC2 (21%)');
}

/* ── g | dumbbell ── */
{
  const x = X0(0) + 8, y = ROWY(2) + 38, w = PW - 38, h = PH - 62;
  head(S, 'g', 'dumbbell — pre/post', X0(0) + 30, ROWY(2), PW);
  const pros = [['IL-6', 62, 38], ['TNF-a', 55, 47], ['CRP', 78, 41], ['SAA', 44, 52], ['MCP-1', 58, 50], ['ICAM-1', 36, 57], ['VCAM-1', 49, 44], ['MMP-9', 66, 58]];
  const rowH = h / pros.length;
  pros.forEach(([nm, pre, post], i) => {
    const yy = y + i * rowH + rowH / 2;
    const up = post < pre;
    S.push(ln(x + pre / 100 * w, yy, x + post / 100 * w, yy, up ? C.teal : C.rose, 2.4, ''));
    S.push(circle(x + pre / 100 * w, yy, 3.6, '#FFFFFF', 1, C.gray, 1.4));
    S.push(circle(x + post / 100 * w, yy, 3.6, up ? C.teal : C.rose, 1, '#FFFFFF', 0.8));
    S.push(txt(x - 4, yy + 2.5, nm, 8, C.ink, 'end'));
  });
  /* frameless key above plot */
  S.push(circle(x + 6, y - 12, 3.6, '#FFFFFF', 1, C.gray, 1.4));
  S.push(txt(x + 13, y - 9, 'Pre', 8.5, C.ink, 'start'));
  S.push(circle(x + 38, y - 12, 3.6, C.rose, 1));
  S.push(txt(x + 45, y - 9, 'Post', 8.5, C.ink, 'start'));
  axes(S, x, y, w, h, [0, 0.5, 1], [], t => f1(t * 100), null, 'Serum level (arb.)');
}

/* ── h | diverging stacked bar ── */
{
  const x = X0(1) + 8, y = ROWY(2) + 38, w = PW - 34, h = PH - 62;
  head(S, 'h', 'diverging stacked bar', X0(1) + 30, ROWY(2), PW);
  const rows = [['Drug A', 8, 14, 30, 22, 6], ['Drug B', 5, 10, 34, 26, 5], ['Placebo', 16, 20, 28, 10, 2],
                ['Combo low', 4, 9, 30, 28, 9], ['Combo high', 2, 6, 26, 30, 16]];
  const rowH = h / rows.length;
  const cols5 = [mixr('#5FA98B', '#FFFFFF', 0.15), shade2('#5FA98B', 0.45), '#E4E4E4', shade2('#D97A93', 0.45), mixr('#D97A93', '#FFFFFF', 0.12)];
  rows.forEach(([nm, ...vs], i) => {
    const yy = y + i * rowH + rowH / 2;
    const totNeg = vs[0] + vs[1], bh = rowH - 8;
    let acc = -totNeg;
    vs.forEach((v, j) => {
      const xx = x + (100 + acc) / 200 * w;
      const ww = v / 100 * w;
      S.push(rect(xx, yy - bh / 2, ww, bh, cols5[j], 0.92));
      acc += v;
    });
    S.push(txt(x - 4, yy + 2.5, nm, 8, C.ink, 'end'));
  });
  S.push(ln(x + w / 2, y - 2, x + w / 2, y + h + 2, '#999', 0.9, '3 2.4'));
  [-40, 0, 40, 80].forEach(v => S.push(txt(x + (100 + v) / 200 * w, y + h + 13, v, 8, C.tick)));
  S.push(txt(x + w / 2, y + h + 26, '变化评分（人数）', 9.5, C.ink, 'middle', 'bold'));
  function shade2(hx, t) { const A = h2r(hx), W2 = [255, 255, 255]; return r2h(A.map((v, i) => v + (W2[i] - v) * t)); }
}

/* ── i | calendar heatmap ── */
{
  const x = X0(2) + 8, y = ROWY(2) + 44, w = PW - 40, h = PH - 70;
  head(S, 'i', 'calendar heatmap', X0(2) + 30, ROWY(2), PW);
  const weeks = 16, days = 7;
  const cw2 = w / weeks, ch = h / days;
  const dows = ['一', '二', '三', '四', '五', '六', '日'];
  const months = [['7月', 0], ['8月', 5], ['9月', 10]];
  months.forEach(([nm, wk]) => S.push(txt(x + wk * cw2 + cw2, y - 6, nm, 7.5, C.ink, 'start', 'bold')));
  for (let wk = 0; wk < weeks; wk++) {
    for (let d2 = 0; d2 < days; d2++) {
      const isWknd = d2 >= 5;
      let v = isWknd ? Math.max(0, N(0.25, 0.2)) : N(0.6, 0.26);
      v = Math.max(0.02, Math.min(1, v));
      S.push(rect(x + wk * cw2 + 1, y + d2 * ch + 1, cw2 - 2, ch - 2, mixr('#F4F0F2', '#C06A90', Math.sqrt(v)), 1, 2));
    }
  }
  dows.forEach((d2, i) => S.push(txt(x - 4, y + i * ch + ch / 2 + 2.5, d2, 7, C.tick, 'end')));
  /* mini legend */
  S.push(txt(x + w - 74, y + h + 14, '低', 7.5, C.tick, 'end'));
  for (let k = 0; k < 5; k++) S.push(rect(x + w - 70 + k * 13, y + h + 7, 12, 8, mixr('#F4F0F2', '#C06A90', (k + 1) / 5), 1, 1.5));
  S.push(txt(x + w - 70 + 5 * 13 + 3, y + h + 14, '高', 7.5, C.tick, 'start'));
}

/* ── output ── */
const H = 66 + 3 * 296 + 6;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFFFFF"/>${S.join('')}</svg>`;
const out = '../../assets/showcase-max.svg';
fs.writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
