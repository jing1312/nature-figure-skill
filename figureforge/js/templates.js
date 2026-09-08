/** FigureForge — SVG Skeleton Templates (publication-grade redraw, v3)
 *
 * 10 chart-type + 6 layout templates tuned to the look of Nature figures:
 * NPG-family muted ink-blue as the working colour, neutral greys for
 * controls, one restrained accent, hairline axes (left+bottom only),
 * light horizontal grid behind the data, declarative sentence-case titles,
 * frameless legends / direct labels, error bars with caps, significance
 * brackets, jittered raw points on box plots, colourbar legends.
 *
 * Every selectable element carries data-edit="true"; series carry
 * data-role + data-series so the global palette recolors coherently
 * (bar / line / area / marker / series recolor; stat / heat / band / grid
 * stay neutral). viewBox="0 0 400 280".
 */
const T = {
  spine: "#262626", tick: "#404040", label: "#737373", title: "#1A1A1A",
  grid: "#EBEBEF", frame: "#D9D9DE", W: "#FFFFFF", cap: "#4D4D4D",
  ctrl: "#CBD2DE", // neutral grey for control groups
};
const S = ["#5B8FDB", "#F2C14E", "#EC6F9F", "#6FC2D0", "#43B39C", "#9C7BD8"]; // Tableau-family series
const F = "'Arial',sans-serif";

/* ── geometry helpers (plot area for full-size charts) ── */
const P = { x0: 58, x1: 384, y0: 44, y1: 236 };
const sy = (v, lo, hi) => P.y1 - (v - lo) / (hi - lo) * (P.y1 - P.y0);
const sx = (v, lo, hi) => P.x0 + (v - lo) / (hi - lo) * (P.x1 - P.x0);

function figTitle(txt) {
  return '<text x="200" y="20" font-family="' + F + '" font-size="10.5" font-weight="bold" fill="' + T.title + '" text-anchor="middle" data-edit="true">' + txt + '</text>';
}
function yTitle(txt) {
  return '<text x="16" y="140" font-family="' + F + '" font-size="8" fill="' + T.label + '" text-anchor="middle" transform="rotate(-90 16 140)" data-edit="true">' + txt + '</text>';
}
function xTitle(txt) {
  return '<text x="' + ((P.x0 + P.x1) / 2) + '" y="262" font-family="' + F + '" font-size="8" fill="' + T.label + '" text-anchor="middle" data-edit="true">' + txt + '</text>';
}
function note(txt) { // small methods note, bottom-right (mean ± s.d., n = ...)
  return '<text x="' + P.x1 + '" y="261" font-family="' + F + '" font-size="6.5" font-style="italic" fill="' + T.label + '" text-anchor="end" data-edit="true">' + txt + '</text>';
}
function gridH(vals, lo, hi) {
  return vals.map(v => '<line x1="' + P.x0 + '" y1="' + sy(v, lo, hi).toFixed(1) + '" x2="' + P.x1 + '" y2="' + sy(v, lo, hi).toFixed(1) + '" stroke="' + T.grid + '" stroke-width="1" data-edit="true" data-role="grid"/>').join('');
}
function yAxis(ticks, lo, hi) {
  let s = '<line x1="' + P.x0 + '" y1="' + P.y0 + '" x2="' + P.x0 + '" y2="' + P.y1 + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="axis"/>';
  ticks.forEach(v => {
    const y = sy(v, lo, hi).toFixed(1);
    s += '<line x1="' + (P.x0 - 3.5) + '" y1="' + y + '" x2="' + P.x0 + '" y2="' + y + '" stroke="' + T.spine + '" stroke-width="0.9"/>';
    s += '<text x="' + (P.x0 - 6) + '" y="' + (+y + 2.6) + '" font-family="' + F + '" font-size="7.2" fill="' + T.tick + '" text-anchor="end" data-edit="true">' + v + '</text>';
  });
  return s;
}
function xAxisCat(names, lo, hi) {
  const n = names.length, step = (P.x1 - P.x0) / n;
  let s = '<line x1="' + P.x0 + '" y1="' + P.y1 + '" x2="' + P.x1 + '" y2="' + P.y1 + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="axis"/>';
  names.forEach((nm, i) => {
    const x = (P.x0 + step * (i + 0.5)).toFixed(1);
    s += '<line x1="' + x + '" y1="' + P.y1 + '" x2="' + x + '" y2="' + (P.y1 + 3.5) + '" stroke="' + T.spine + '" stroke-width="0.9"/>';
    s += '<text x="' + x + '" y="' + (P.y1 + 13) + '" font-family="' + F + '" font-size="7.2" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + nm + '</text>';
  });
  return s;
}
function xAxisNum(ticks, lo, hi) {
  let s = '<line x1="' + P.x0 + '" y1="' + P.y1 + '" x2="' + P.x1 + '" y2="' + P.y1 + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="axis"/>';
  ticks.forEach(v => {
    const x = sx(v, lo, hi).toFixed(1);
    s += '<line x1="' + x + '" y1="' + P.y1 + '" x2="' + x + '" y2="' + (P.y1 + 3.5) + '" stroke="' + T.spine + '" stroke-width="0.9"/>';
    s += '<text x="' + x + '" y="' + (P.y1 + 13) + '" font-family="' + F + '" font-size="7.2" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + v + '</text>';
  });
  return s;
}
function errBar(x, yTop, yBot, cap) { // error bar with caps (svg coords)
  const X = +x, YT = +yTop, YB = +yBot, CAP = cap === undefined ? 3 : +cap;
  return '<line x1="' + X + '" y1="' + YT.toFixed(1) + '" x2="' + X + '" y2="' + YB.toFixed(1) + '" stroke="' + T.cap + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
    '<line x1="' + (X - CAP) + '" y1="' + YT.toFixed(1) + '" x2="' + (X + CAP) + '" y2="' + YT.toFixed(1) + '" stroke="' + T.cap + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
    '<line x1="' + (X - CAP) + '" y1="' + YB.toFixed(1) + '" x2="' + (X + CAP) + '" y2="' + YB.toFixed(1) + '" stroke="' + T.cap + '" stroke-width="0.9" data-edit="true" data-role="stat"/>';
}
function sigBr(x1, x2, y, label) { // significance bracket above bars
  const X1 = +x1, X2 = +x2, Y = +y;
  const xm = ((X1 + X2) / 2).toFixed(1), dy = 4;
  return '<path d="M' + X1 + ' ' + (Y + dy) + ' V' + Y + ' H' + X2 + ' V' + (Y + dy) + '" fill="none" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
    '<text x="' + xm + '" y="' + (Y - 3) + '" font-family="' + F + '" font-size="8" fill="' + T.spine + '" text-anchor="middle" data-edit="true">' + label + '</text>';
}
function legendRow(x, y, color, label, kind, seriesIdx) {
  const ds = seriesIdx === undefined ? '' : ' data-series="' + seriesIdx + '"';
  let swatch;
  if (kind === 'line') swatch = '<line x1="' + x + '" y1="' + (y - 3) + '" x2="' + (x + 14) + '" y2="' + (y - 3) + '" stroke="' + color + '" stroke-width="2"' + ds + ' data-edit="true" data-role="series"/>';
  else if (kind === 'circle') swatch = '<circle cx="' + (x + 7) + '" cy="' + (y - 3) + '" r="3.5" fill="' + color + '"' + ds + ' data-edit="true" data-role="series"/>';
  else swatch = '<rect x="' + x + '" y="' + (y - 10) + '" width="13" height="7" fill="' + color + '"' + ds + ' data-edit="true" data-role="series"/>';
  return swatch + '<text x="' + (x + 18) + '" y="' + y + '" font-family="' + F + '" font-size="7.5" fill="' + T.tick + '" data-edit="true">' + label + '</text>';
}
function violinPath(cx, yTop, yBot, hw) { // smooth symmetric violin silhouette
  const h = yBot - yTop;
  return 'M' + cx + ' ' + yTop.toFixed(1) +
    ' C' + (cx + hw).toFixed(1) + ' ' + (yTop + h * 0.16).toFixed(1) + ' ' + (cx + hw).toFixed(1) + ' ' + (yTop + h * 0.5).toFixed(1) + ' ' + (cx + hw * 0.62).toFixed(1) + ' ' + (yBot - h * 0.16).toFixed(1) +
    ' Q' + (cx + hw * 0.3).toFixed(1) + ' ' + yBot.toFixed(1) + ' ' + cx + ' ' + yBot.toFixed(1) +
    ' Q' + (cx - hw * 0.3).toFixed(1) + ' ' + yBot.toFixed(1) + ' ' + (cx - hw * 0.62).toFixed(1) + ' ' + (yBot - h * 0.16).toFixed(1) +
    ' C' + (cx - hw).toFixed(1) + ' ' + (yTop + h * 0.5).toFixed(1) + ' ' + (cx - hw).toFixed(1) + ' ' + (yTop + h * 0.16).toFixed(1) + ' ' + cx + ' ' + yTop.toFixed(1) + ' Z';
}
function stepPath(pts, fx, fy) { // Kaplan-Meier step curve from [t, survival] pairs
  return pts.map((p, i) => i
    ? 'H' + fx(p[0]).toFixed(1) + ' V' + fy(p[1]).toFixed(1)
    : 'M' + fx(p[0]).toFixed(1) + ' ' + fy(p[1]).toFixed(1)).join(' ');
}
// sub-plot axes for composite panels (smaller type than full-size charts)
function subAxes(x0, y0, x1, y1, yTicks, yLo, yHi, opts) {
  opts = opts || {};
  const syv = v => y1 - (v - yLo) / (yHi - yLo) * (y1 - y0);
  let s = '';
  if (opts.grid !== false) yTicks.forEach(v => {
    if (v === yLo) return;
    s += '<line x1="' + x0 + '" y1="' + syv(v).toFixed(1) + '" x2="' + x1 + '" y2="' + syv(v).toFixed(1) + '" stroke="' + T.grid + '" stroke-width="0.8" data-edit="true" data-role="grid"/>';
  });
  s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="axis"/>' +
    '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="axis"/>';
  yTicks.forEach(v => {
    const y = syv(v).toFixed(1);
    s += '<line x1="' + (x0 - 3) + '" y1="' + y + '" x2="' + x0 + '" y2="' + y + '" stroke="' + T.spine + '" stroke-width="0.8"/>' +
      '<text x="' + (x0 - 5) + '" y="' + (+y + 2.2) + '" font-family="' + F + '" font-size="6.2" fill="' + T.tick + '" text-anchor="end" data-edit="true">' + v + '</text>';
  });
  if (opts.xLabels) {
    const n = opts.xLabels.length, step = (x1 - x0) / n;
    opts.xLabels.forEach((nm, i) => {
      const x = (x0 + step * (i + 0.5)).toFixed(1);
      s += '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y1 + 3) + '" stroke="' + T.spine + '" stroke-width="0.8"/>' +
        '<text x="' + x + '" y="' + (y1 + 11) + '" font-family="' + F + '" font-size="6.2" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + nm + '</text>';
    });
  }
  if (opts.xTicks) opts.xTicks.forEach(v => {
    const x = (x0 + (v - opts.xLo) / (opts.xHi - opts.xLo) * (x1 - x0)).toFixed(1);
    s += '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y1 + 3) + '" stroke="' + T.spine + '" stroke-width="0.8"/>' +
      '<text x="' + x + '" y="' + (y1 + 11) + '" font-family="' + F + '" font-size="6.2" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + v + '</text>';
  });
  return s;
}
function panelLetter(ch, x, y) {
  return '<text x="' + x + '" y="' + y + '" font-family="' + F + '" font-size="9" font-weight="bold" fill="' + T.title + '" data-edit="true">' + ch + '</text>';
}
function subTitle(txt, x, y) {
  return '<text x="' + x + '" y="' + y + '" font-family="' + F + '" font-size="6.5" font-style="italic" fill="' + T.label + '" text-anchor="end" data-edit="true">' + txt + '</text>';
}

/* ═══════════════ CHART TEMPLATES ═══════════════ */
const CHART_TEMPLATES = {

'bar': { name: '柱状图', icon: '📊', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Treatment raises response in a dose-dependent manner') + yTitle('Response (% of baseline)') +
  gridH([0, 20, 40, 60, 80], 0, 80) +
  yAxis([0, 20, 40, 60, 80], 0, 80) + xAxisCat(['Ctrl', 'Low', 'Mid', 'High', 'Peak'], 0, 80) +
  [[32, 4], [45, 5], [58, 6], [38, 4], [52, 5]].map((d, i) => {
    const cx = P.x0 + (P.x1 - P.x0) / 5 * (i + 0.5);
    const hi = i === 2;
    const fill = hi ? S[0] : T.ctrl;
    // superplot: raw data points over each bar
    const jdx = [-9, -3, 3, 9], jf = [0.88, 1.04, 0.94, 1.1];
    const pts = jdx.map((dx, k) => '<circle cx="' + (cx + dx).toFixed(1) + '" cy="' + sy(d[0] * jf[k], 0, 80).toFixed(1) + '" r="1.7" fill="' + (hi ? '#27406E' : '#5a6272') + '" fill-opacity="0.55" data-edit="true" data-role="stat"/>').join('');
    return '<rect x="' + (cx - 17).toFixed(1) + '" y="' + sy(d[0], 0, 80).toFixed(1) + '" width="34" height="' + (P.y1 - sy(d[0], 0, 80)).toFixed(1) + '" fill="' + fill + '" data-edit="true" data-role="bar" data-series="' + (hi ? 1 : 0) + '"/>' +
      errBar(cx.toFixed(1), sy(d[0] + d[1], 0, 80), sy(d[0] - d[1], 0, 80), 2.5) +
      pts;
  }).join('') +
  sigBr((P.x0 + (P.x1 - P.x0) / 5 * 0.5).toFixed(1), (P.x0 + (P.x1 - P.x0) / 5 * 2.5).toFixed(1), sy(72, 0, 80), '**') +
  note('mean ± s.d., n = 6') +
'</svg>' },

'grouped-bar': { name: '分组柱状图', icon: '🗂', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 2 | Proposed method outperforms the baseline') + yTitle('Accuracy (%)') +
  gridH([0, 25, 50, 75, 100], 0, 100) +
  yAxis([0, 25, 50, 75, 100], 0, 100) + xAxisCat(['G1', 'G2', 'G3'], 0, 100) +
  [[34, 58, 4], [47, 66, 5], [28, 52, 4]].map((g, gi) => {
    const cx = P.x0 + (P.x1 - P.x0) / 3 * (gi + 0.5);
    const bw = 24;
    const c0 = (cx - bw / 2 - 3).toFixed(1), c1 = (cx + bw / 2 + 3).toFixed(1);
    return '<rect x="' + c0 + '" y="' + sy(g[0], 0, 100).toFixed(1) + '" width="' + bw + '" height="' + (P.y1 - sy(g[0], 0, 100)).toFixed(1) + '" fill="' + T.ctrl + '" data-edit="true" data-role="bar" data-series="0"/>' +
      errBar(c0, sy(g[0] + g[2], 0, 100), sy(Math.max(g[0] - g[2], 0), 0, 100), 2.5) +
      '<rect x="' + c1 + '" y="' + sy(g[1], 0, 100).toFixed(1) + '" width="' + bw + '" height="' + (P.y1 - sy(g[1], 0, 100)).toFixed(1) + '" fill="' + S[0] + '" data-edit="true" data-role="bar" data-series="1"/>' +
      errBar(c1, sy(g[1] + g[2], 0, 100), sy(g[1] - g[2], 0, 100), 2.5);
  }).join('') +
  legendRow(272, 36, T.ctrl, 'Baseline', 'rect', 0) +
  legendRow(272, 50, S[0], 'Ours', 'rect', 1) +
  note('mean ± s.d., n = 5 seeds') +
'</svg>' },

'line': { name: '折线图', icon: '📈', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 3 | Signal rises steadily after treatment onset') + yTitle('Signal (a.u.)') + xTitle('Time (min)') +
  gridH([20, 40, 60, 80], 0, 100) +
  yAxis([0, 20, 40, 60, 80, 100], 0, 100) + xAxisNum([0, 5, 10, 15, 20], 0, 20) +
  (() => {
    const xs = [0, 3, 6, 9, 12, 15, 18], ys = [52, 58, 54, 66, 72, 69, 84], ci = 6;
    const pts = xs.map((x, i) => [sx(x, 0, 20), sy(ys[i], 0, 100)]);
    const up = pts.map(p => p[0].toFixed(1) + ',' + (p[1] - ci * (P.y1 - P.y0) / 100).toFixed(1)).join(' ');
    const dn = pts.slice().reverse().map(p => p[0].toFixed(1) + ',' + (p[1] + ci * (P.y1 - P.y0) / 100).toFixed(1)).join(' ');
    return '<polygon points="' + up + ' ' + dn + '" fill="' + S[0] + '" fill-opacity="0.12" stroke="none" data-edit="true" data-role="band"/>' +
      '<polyline points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + S[0] + '" stroke-width="1.6" stroke-linejoin="round" data-edit="true" data-role="line" data-series="0"/>' +
      pts.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6" fill="' + S[0] + '" data-edit="true" data-role="marker" data-series="0"/>').join('');
  })() +
  note('shaded band, 95% CI') +
'</svg>' },

'multi-line': { name: '多折线图', icon: '📉', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 4 | Expression recovers in WT but not in KO') + yTitle('Expression (a.u.)') + xTitle('Day') +
  gridH([20, 40, 60, 80], 0, 100) +
  yAxis([0, 20, 40, 60, 80, 100], 0, 100) + xAxisNum([0, 5, 10, 15, 20], 0, 20) +
  (() => {
    const xs = [0, 3, 6, 9, 12, 15, 18];
    const series = [
      { ys: [30, 38, 47, 55, 66, 76, 88], c: S[0], dash: '', label: 'WT' },
      { ys: [28, 33, 36, 42, 46, 50, 55], c: S[1], dash: '', label: 'Het' },
      { ys: [25, 24, 27, 26, 30, 28, 32], c: '#AEB4BE', dash: '5,3', label: 'KO' },
    ];
    return series.map((sr, si) => {
      const pts = xs.map((x, i) => [sx(x, 0, 20), sy(sr.ys[i], 0, 100)]);
      const last = pts[pts.length - 1];
      return '<polyline points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + sr.c + '" stroke-width="1.6" stroke-linejoin="round"' + (sr.dash ? ' stroke-dasharray="' + sr.dash + '"' : '') + ' data-edit="true" data-role="line" data-series="' + si + '"/>' +
        '<text x="' + (last[0] + 3).toFixed(1) + '" y="' + (last[1] + 2.5).toFixed(1) + '" font-family="' + F + '" font-size="7.5" fill="' + sr.c + '" data-edit="true">' + sr.label + '</text>';
    }).join('');
  })() +
'</svg>' },

'scatter': { name: '散点图', icon: '✨', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 5 | Biomarker level correlates with age') + yTitle('Biomarker (ng ml⁻¹)') + xTitle('Age (years)') +
  gridH([20, 40, 60, 80], 0, 100) +
  yAxis([0, 20, 40, 60, 80, 100], 0, 100) + xAxisNum([0, 2, 4, 6, 8, 10], 0, 10) +
  [[0.6, 34], [1.2, 30], [1.9, 42], [2.5, 38], [3.1, 48], [3.8, 44], [4.4, 55], [5.0, 50], [5.6, 58], [6.2, 63], [6.9, 59], [7.5, 70], [8.1, 66], [8.8, 76], [9.4, 72], [9.8, 82]]
    .map(p => '<circle cx="' + sx(p[0], 0, 10).toFixed(1) + '" cy="' + sy(p[1], 0, 100).toFixed(1) + '" r="2.8" fill="' + S[0] + '" fill-opacity="0.65" data-edit="true" data-role="marker" data-series="0"/>').join('') +
  '<line x1="' + sx(0, 0, 10).toFixed(1) + '" y1="' + sy(28, 0, 100).toFixed(1) + '" x2="' + sx(10, 0, 10).toFixed(1) + '" y2="' + sy(84, 0, 100).toFixed(1) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
  '<text x="' + (P.x1 - 8) + '" y="' + (sy(84, 0, 100) - 8).toFixed(1) + '" font-family="' + F + '" font-size="7.5" font-style="italic" fill="' + T.tick + '" text-anchor="end" data-edit="true">R² = 0.96</text>' +
  note('two-sided Pearson test') +
'</svg>' },

'pie': { name: '环形图', icon: '🥧', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 6 | Condition A dominates the cohort composition') +
  (() => { // rich yet harmonious donut (pathLength=100, starts at 12 o'clock)
    const cx = 148, cy = 150, r = 66;
    const segs = [[38, '#5B8FDB'], [27, '#6FC2D0'], [21, '#F2C14E'], [14, '#D4CFCA']];
    const labels = ['Condition A · 38%', 'Condition B · 27%', 'Condition C · 21%', 'Other · 14%'];
    let acc = 0, s = '';
    segs.forEach((sg, i) => {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + sg[1] + '" stroke-width="38" pathLength="100" stroke-dasharray="' + sg[0] + ' 100" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" data-edit="true" data-role="series" data-series="' + i + '"/>';
      acc += sg[0];
    });
    s += '<text x="' + cx + '" y="' + (cy - 2) + '" font-family="' + F + '" font-size="13" font-weight="bold" fill="' + T.title + '" text-anchor="middle" data-edit="true">n = 214</text>';
    labels.forEach((lb, i) => { s += legendRow(258, 92 + i * 22, segs[i][1], lb, 'rect', i); });
    return s;
  })() +
'</svg>' },

'area': { name: '面积图', icon: '🏔', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 7 | Species A expands while B stays stable') + yTitle('Abundance (%)') + xTitle('Week') +
  gridH([20, 40, 60], 0, 80) +
  yAxis([0, 20, 40, 60, 80], 0, 80) + xAxisNum([0, 5, 10, 15, 20], 0, 20) +
  (() => {
    const xs = [0, 3, 6, 9, 12, 15, 18];
    const A = [14, 20, 26, 30, 38, 44, 50], B = [8, 12, 14, 18, 20, 19, 22]; // A stacked on B
    const px = xs.map(x => sx(x, 0, 20));
    const topA = xs.map((x, i) => px[i].toFixed(1) + ',' + sy(A[i] + B[i], 0, 80).toFixed(1));
    const topB = xs.map((x, i) => px[i].toFixed(1) + ',' + sy(B[i], 0, 80).toFixed(1));
    return '<polygon points="' + topA.join(' ') + ' ' + px[px.length - 1].toFixed(1) + ',' + P.y1 + ' ' + px[0].toFixed(1) + ',' + P.y1 + '" fill="#C9D8F2" data-edit="true" data-role="area" data-series="0"/>' +
      '<polygon points="' + topB.join(' ') + ' ' + px[px.length - 1].toFixed(1) + ',' + P.y1 + ' ' + px[0].toFixed(1) + ',' + P.y1 + '" fill="#6FC2D0" fill-opacity="0.7" data-edit="true" data-role="area" data-series="1"/>' +
      '<polyline points="' + topA.join(' ') + '" fill="none" stroke="#5B8FDB" stroke-width="1.4" data-edit="true" data-role="line" data-series="0"/>' +
      '<polyline points="' + topB.join(' ') + '" fill="none" stroke="#2E9E8A" stroke-width="1.4" data-edit="true" data-role="line" data-series="1"/>';
  })() +
  legendRow(292, 36, '#5B8FDB', 'Species A', 'rect', 0) +
  legendRow(292, 50, '#6FC2D0', 'Species B', 'rect', 1) +
'</svg>' },

'box': { name: '箱线图', icon: '📦', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 8 | High dose shifts the score distribution upward') + yTitle('Score (arb. units)') + xTitle('Group') +
  gridH([20, 40, 60, 80], 0, 100) +
  yAxis([0, 20, 40, 60, 80, 100], 0, 100) + xAxisCat(['Ctrl', 'Low', 'Mid', 'High'], 0, 100) +
  (() => {
    const stats = [ // [med, q1, q3, lo, hi]
      [42, 36, 48, 30, 56], [55, 48, 62, 44, 70], [38, 32, 45, 26, 52], [61, 54, 68, 50, 78]];
    const jit = [-9, -4, 1, 6, 10, -1, 4]; // deterministic jitter for raw points
    const fracs = [0.18, 0.3, 0.42, 0.55, 0.68, 0.8, 0.92]; // position inside [lo, hi]
    return stats.map((d, i) => {
      const cx = P.x0 + (P.x1 - P.x0) / 4 * (i + 0.5), w = 30;
      const y = v => sy(v, 0, 100).toFixed(1);
      const pts = jit.map((dx, k) => {
        const v = d[3] + fracs[k] * (d[4] - d[3]);
        return '<circle cx="' + (cx + dx).toFixed(1) + '" cy="' + y(v) + '" r="1.7" fill="' + T.cap + '" fill-opacity="0.45" data-edit="true" data-role="stat"/>';
      }).join('');
      return pts +
        '<line x1="' + cx.toFixed(1) + '" y1="' + y(d[3]) + '" x2="' + cx.toFixed(1) + '" y2="' + y(d[4]) + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
        '<line x1="' + (cx - 8).toFixed(1) + '" y1="' + y(d[3]) + '" x2="' + (cx + 8).toFixed(1) + '" y2="' + y(d[3]) + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
        '<line x1="' + (cx - 8).toFixed(1) + '" y1="' + y(d[4]) + '" x2="' + (cx + 8).toFixed(1) + '" y2="' + y(d[4]) + '" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
        '<rect x="' + (cx - w / 2).toFixed(1) + '" y="' + y(d[2]) + '" width="' + w + '" height="' + (sy(d[1], 0, 100) - sy(d[2], 0, 100)).toFixed(1) + '" fill="#5B8FDB" fill-opacity="0.28" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="bar" data-series="0"/>' +
        '<line x1="' + (cx - w / 2).toFixed(1) + '" y1="' + y(d[0]) + '" x2="' + (cx + w / 2).toFixed(1) + '" y2="' + y(d[0]) + '" stroke="' + T.spine + '" stroke-width="1.5" data-edit="true" data-role="stat"/>';
    }).join('');
  })() +
  note('box, IQR; whiskers, 1.5× IQR') +
'</svg>' },

'heatmap': { name: '聚类热图', icon: '🔥', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 9 | Clustering reveals treatment-responsive programs') +
  (() => {
    const gx0 = 120, gx1 = 344, gy0 = 64, gy1 = 246;
    const rows = [ // top→bottom (cluster order): [label, values x6, program]
      ['G3', [-0.4, 0.3, -0.6, 1.7, 1.5, 0.9], 'A'],
      ['G7', [-0.7, 0.1, -0.3, 1.2, 1.9, 1.4], 'A'],
      ['G5', [0.2, -0.5, 0.4, 0.8, 1.1, 1.6], 'A'],
      ['G1', [1.5, -1.1, 0.9, -0.3, -1.6, -0.8], 'B'],
      ['G8', [1.1, -1.5, 0.6, -0.7, -1.2, -1.9], 'B'],
      ['G4', [0.7, 1.3, -0.9, -1.4, -0.5, -1.8], 'B'],
      ['G6', [-1.2, 0.8, -1.7, 0.5, 1.4, -0.4], 'C'],
      ['G2', [-1.8, 1.6, -1.1, 0.9, 0.4, 1.2], 'C']];
    const cols = [ // left→right (cluster order): [label, group]
      ['C4', 'Trt'], ['C1', 'Trt'], ['C5', 'Trt'], ['C2', 'Veh'], ['C6', 'Veh'], ['C3', 'Veh']];
    const progCol = { A: S[0], B: S[1], C: '#9AA0A8' };
    const grpCol = { Trt: '#43B39C', Veh: '#CBD2DE' };
    const rowH = (gy1 - gy0) / rows.length, colW = (gx1 - gx0) / cols.length;
    const rc = i => gy0 + rowH * (i + 0.5); // row center
    const cc = i => gx0 + colW * (i + 0.5); // col center
    const dv = v => { // diverging: -2 → #3D6BB3, 0 → white, +2 → #C9699B
      const t = Math.min(1, Math.abs(v) / 2);
      const mix = (a, b) => Math.round(a + (b - a) * t);
      return v < 0 ? 'rgb(' + mix(247, 33) + ',' + mix(247, 102) + ',' + mix(250, 172) + ')'
        : 'rgb(' + mix(247, 178) + ',' + mix(247, 24) + ',' + mix(250, 43) + ')';
    };
    let s = '';
    rows.forEach((r, ri) => {
      s += '<text x="72" y="' + (rc(ri) + 2.4).toFixed(1) + '" font-family="' + F + '" font-size="7" fill="' + T.tick + '" text-anchor="end" data-edit="true">' + r[0] + '</text>';
      r[1].forEach((v, ci) => {
        s += '<rect x="' + (gx0 + colW * ci).toFixed(1) + '" y="' + (gy0 + rowH * ri).toFixed(1) + '" width="' + colW.toFixed(1) + '" height="' + rowH.toFixed(1) + '" fill="' + dv(v) + '" stroke="#FFFFFF" stroke-width="1" data-edit="true" data-role="heat"/>';
      });
    });
    cols.forEach((c, ci) => {
      s += '<text x="' + cc(ci).toFixed(1) + '" y="' + (gy1 + 11) + '" font-family="' + F + '" font-size="7" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + c[0] + '</text>';
    });
    // annotation strips: row programs (left) + column groups (top)
    rows.forEach((r, ri) => {
      s += '<rect x="114" y="' + (gy0 + rowH * ri).toFixed(1) + '" width="6" height="' + rowH.toFixed(1) + '" fill="' + progCol[r[2]] + '" data-edit="true" data-role="series" data-series="' + ri % 3 + '"/>';
    });
    cols.forEach((c, ci) => {
      s += '<rect x="' + (gx0 + colW * ci).toFixed(1) + '" y="58" width="' + colW.toFixed(1) + '" height="6" fill="' + grpCol[c[1]] + '" data-edit="true" data-role="series" data-series="' + (c[1] === 'Trt' ? 0 : 1) + '"/>';
    });
    // row dendrogram (x 76 → leaf 114)
    const hM = (xa, ya, xb, yb, xm) => '<path d="M' + xa + ' ' + ya.toFixed(1) + ' H' + xm + ' V' + yb.toFixed(1) + ' H' + xb + '" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>';
    s += hM(114, rc(0), 114, rc(1), 106) + hM(106, (rc(0) + rc(1)) / 2, 114, rc(2), 100) +
      hM(114, rc(3), 114, rc(4), 106) + hM(106, (rc(3) + rc(4)) / 2, 114, rc(5), 100) +
      hM(114, rc(6), 114, rc(7), 106) +
      hM(100, (rc(0) + rc(1)) / 2, 100, (rc(3) + rc(4)) / 2, 94) +
      hM(94, (rc(2) + (rc(0) + rc(1)) / 2) / 2, 94, (rc(3) + rc(4) + rc(5)) / 3, 88) +
      hM(88, (rc(2) + (rc(0) + rc(1)) / 2) / 2, 88, (rc(6) + rc(7)) / 2, 82);
    // column dendrogram (y 30 → leaf 58)
    const vM = (ya, xa, yb, xb, ym) => '<path d="M' + xa.toFixed(1) + ' ' + ya + ' V' + ym + ' H' + xb.toFixed(1) + ' V' + yb + '" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>';
    s += vM(58, cc(0), 58, cc(1), 44) + vM(58, cc(3), 58, cc(4), 44) +
      vM(44, cc(2), 58, cc(5), 38) +
      vM(44, (cc(0) + cc(1)) / 2, 44, (cc(3) + cc(4)) / 2, 40) +
      vM(38, (cc(0) + cc(1) + cc(2)) / 3, 40, (cc(3) + cc(4) + cc(5)) / 3, 33);
    // colorbar (diverging) with ticks
    s += '<defs><linearGradient id="ff-cb" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="' + dv(-2) + '"/><stop offset="0.25" stop-color="' + dv(-1) + '"/><stop offset="0.5" stop-color="' + dv(0) + '"/><stop offset="0.75" stop-color="' + dv(1) + '"/><stop offset="1" stop-color="' + dv(2) + '"/></linearGradient></defs>' +
      '<rect x="354" y="' + gy0 + '" width="12" height="' + (gy1 - gy0) + '" fill="url(#ff-cb)" stroke="' + T.spine + '" stroke-width="0.6" data-edit="true" data-role="heat"/>';
    [[2, 0], [0, 0.5], [-2, 1]].forEach(pair => {
      const v = pair[0], f = pair[1];
      const y = gy0 + (1 - (v + 2) / 4) * (gy1 - gy0);
      s += '<line x1="366" y1="' + y.toFixed(1) + '" x2="369" y2="' + y.toFixed(1) + '" stroke="' + T.spine + '" stroke-width="0.6"/>' +
        '<text x="371" y="' + (y + 2.4).toFixed(1) + '" font-family="' + F + '" font-size="6.8" fill="' + T.tick + '" data-edit="true">' + (v > 0 ? '+' + v : v) + '</text>';
    });
    s += '<text x="360" y="' + (gy0 - 6) + '" font-family="' + F + '" font-size="7" fill="' + T.label + '" text-anchor="middle" data-edit="true">Z-score</text>';
    // strip legends
    s += '<rect x="120" y="260" width="6" height="6" fill="' + progCol.A + '"/><text x="129" y="266" font-family="' + F + '" font-size="6.2" fill="' + T.label + '" data-edit="true">Prog. A</text>' +
      '<rect x="168" y="260" width="6" height="6" fill="' + progCol.B + '"/><text x="177" y="266" font-family="' + F + '" font-size="6.2" fill="' + T.label + '" data-edit="true">Prog. B</text>' +
      '<rect x="216" y="260" width="6" height="6" fill="' + progCol.C + '"/><text x="225" y="266" font-family="' + F + '" font-size="6.2" fill="' + T.label + '" data-edit="true">Prog. C</text>' +
      '<rect x="280" y="260" width="6" height="6" fill="' + grpCol.Trt + '"/><text x="289" y="266" font-family="' + F + '" font-size="6.2" fill="' + T.label + '" data-edit="true">Trt</text>' +
      '<rect x="312" y="260" width="6" height="6" fill="' + grpCol.Veh + '"/><text x="321" y="266" font-family="' + F + '" font-size="6.2" fill="' + T.label + '" data-edit="true">Veh</text>';
    return s;
  })() +
'</svg>' },

'forest': { name: '森林图', icon: '🌲', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 10 | Pooled estimate favours the treatment') + xTitle('Odds ratio (95% CI)') +
  (() => {
    const F0 = { x0: 118, x1: 380, lo: 0.4, hi: 3.2 };
    const fx = v => F0.x0 + (v - F0.lo) / (F0.hi - F0.lo) * (F0.x1 - F0.x0);
    let s = '';
    [0.5, 1, 2, 3].forEach(v => {
      s += '<line x1="' + fx(v).toFixed(1) + '" y1="40" x2="' + fx(v).toFixed(1) + '" y2="216" stroke="' + T.grid + '" stroke-width="1" data-edit="true" data-role="grid"/>' +
        '<line x1="' + fx(v).toFixed(1) + '" y1="216" x2="' + fx(v).toFixed(1) + '" y2="219.5" stroke="' + T.spine + '" stroke-width="0.9"/>' +
        '<text x="' + fx(v).toFixed(1) + '" y="229" font-family="' + F + '" font-size="7.2" fill="' + T.tick + '" text-anchor="middle" data-edit="true">' + v + '</text>';
    });
    s += '<line x1="' + F0.x0 + '" y1="216" x2="' + F0.x1 + '" y2="216" stroke="' + T.spine + '" stroke-width="0.9" data-edit="true" data-role="axis"/>';
    s += '<line x1="' + fx(1).toFixed(1) + '" y1="40" x2="' + fx(1).toFixed(1) + '" y2="216" stroke="' + T.spine + '" stroke-width="0.8" stroke-dasharray="4,3" data-edit="true" data-role="stat"/>';
    const rows = [ // [name, lo, est, hi, weight(=sq size)]
      ['Study 1', 0.62, 1.12, 1.72, 9], ['Study 2', 0.55, 0.88, 1.35, 11],
      ['Study 3', 1.05, 1.58, 2.35, 7], ['Study 4', 0.66, 0.98, 1.44, 10],
      ['Study 5', 0.82, 1.26, 1.92, 8]];
    rows.forEach((r, i) => {
      const y = 58 + i * 30;
      s += '<text x="112" y="' + (y + 2.6) + '" font-family="' + F + '" font-size="7.5" fill="' + T.tick + '" text-anchor="end" data-edit="true">' + r[0] + '</text>' +
        '<line x1="' + fx(r[1]).toFixed(1) + '" y1="' + y + '" x2="' + fx(r[3]).toFixed(1) + '" y2="' + y + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
        '<line x1="' + fx(r[1]).toFixed(1) + '" y1="' + (y - 3) + '" x2="' + fx(r[1]).toFixed(1) + '" y2="' + (y + 3) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
        '<line x1="' + fx(r[3]).toFixed(1) + '" y1="' + (y - 3) + '" x2="' + fx(r[3]).toFixed(1) + '" y2="' + (y + 3) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
        '<rect x="' + (fx(r[2]) - r[4] / 2).toFixed(1) + '" y="' + (y - r[4] / 2) + '" width="' + r[4] + '" height="' + r[4] + '" fill="' + S[0] + '" data-edit="true" data-role="bar" data-series="0"/>' +
        '<text x="388" y="' + (y + 2.6) + '" font-family="' + F + '" font-size="6.8" fill="' + T.label + '" text-anchor="end" data-edit="true">' + r[2].toFixed(2) + ' [' + r[1].toFixed(2) + ', ' + r[3].toFixed(2) + ']</text>';
    });
    const py = 58 + 5 * 30, e = 1.15, lo = 0.98, hi = 1.36;
    s += '<text x="112" y="' + (py + 2.6) + '" font-family="' + F + '" font-size="7.5" font-weight="bold" fill="' + T.tick + '" text-anchor="end" data-edit="true">Pooled</text>' +
      '<polygon points="' + fx(lo).toFixed(1) + ',' + py + ' ' + fx(e).toFixed(1) + ',' + (py - 6) + ' ' + fx(hi).toFixed(1) + ',' + py + ' ' + fx(e).toFixed(1) + ',' + (py + 6) + '" fill="#EC6F9F" data-edit="true" data-role="marker" data-series="1"/>' +
      '<text x="388" y="' + (py + 2.6) + '" font-family="' + F + '" font-size="6.8" font-weight="bold" fill="' + T.label + '" text-anchor="end" data-edit="true">' + e.toFixed(2) + ' [0.98, 1.36]</text>';
    return s;
  })() +
'</svg>' },
'violin': { name: '小提琴图', icon: '🎻', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 11 | Distribution shifts across genotypes') + yTitle('Expression level (a.u.)') + xTitle('Genotype') +
  gridH([1, 2, 3, 4], 0, 5) +
  yAxis([0, 1, 2, 3, 4, 5], 0, 5) + xAxisCat(['WT', 'Het', 'KO'], 0, 5) +
  (() => {
    // violins: silhouette + embedded thin box + jittered raw points
    const groups = [ // [center, yTop(value), yBot(value), hw]
      [90.6, 1.1, 3.6, 24], [155.8, 1.6, 4.3, 27], [221, 0.7, 2.9, 22]];
    const jit = [-7, -2, 3, 8, -4, 6];
    const fr = [0.22, 0.38, 0.5, 0.62, 0.75, 0.9];
    return groups.map((g, i) => {
      const yTop = sy(g[1], 0, 5), yBot = sy(g[2], 0, 5);
      const pts = jit.map((dx, k) => {
        const v = g[1] + fr[k] * (g[2] - g[1]);
        return '<circle cx="' + (g[0] + dx).toFixed(1) + '" cy="' + sy(v, 0, 5).toFixed(1) + '" r="1.6" fill="' + S[0] + '" fill-opacity="0.55" data-edit="true" data-role="marker" data-series="0"/>';
      }).join('');
      const bx = g[0], bw = 5;
      const q1 = yTop + (yBot - yTop) * 0.3, q3 = yTop + (yBot - yTop) * 0.62, med = yTop + (yBot - yTop) * 0.46;
      return '<path d="' + violinPath(g[0], yTop, yBot, g[3]) + '" fill="' + S[0] + '" fill-opacity="0.16" stroke="' + S[0] + '" stroke-width="1" data-edit="true" data-role="bar" data-series="' + i + '"/>' +
        pts +
        '<rect x="' + (bx - bw / 2).toFixed(1) + '" y="' + q1.toFixed(1) + '" width="' + bw + '" height="' + (q3 - q1).toFixed(1) + '" fill="#FFFFFF" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>' +
        '<line x1="' + (bx - bw / 2 - 2).toFixed(1) + '" y1="' + med.toFixed(1) + '" x2="' + (bx + bw / 2 + 2).toFixed(1) + '" y2="' + med.toFixed(1) + '" stroke="' + T.spine + '" stroke-width="1.2" data-edit="true" data-role="stat"/>';
    }).join('');
  })() +
  sigBr('90.6', '221', sy(4.35, 0, 5), '**') +
  note('violin, density; box, IQR') +
'</svg>' },

'km': { name: '生存曲线', icon: '📉', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 12 | Treatment extends overall survival') + yTitle('Overall survival (%)') + xTitle('Time (months)') +
  gridH([25, 50, 75], 0, 100) +
  yAxis([0, 25, 50, 75, 100], 0, 100) + xAxisNum([0, 6, 12, 18, 24, 30, 36], 0, 36) +
  (() => {
    const fx = v => sx(v, 0, 36), fy = v => sy(v, 0, 100);
    const treat = [[0, 100], [6, 100], [6, 96], [12, 96], [12, 89], [18, 89], [18, 82], [24, 82], [24, 74], [30, 74], [30, 68], [36, 68]];
    const ctrl = [[0, 100], [6, 92], [6, 84], [12, 84], [12, 71], [18, 71], [18, 58], [24, 58], [24, 47], [30, 47], [30, 39], [36, 39]];
    // CI band for treated (upper/lower step envelopes)
    const up = [[0, 100], [6, 100], [6, 92], [12, 92], [12, 82], [18, 82], [18, 76], [24, 76], [24, 65], [30, 65], [30, 59], [36, 59]];
    const lo = [[0, 100], [6, 96], [6, 88], [12, 88], [12, 80], [18, 80], [18, 70], [24, 70], [24, 60], [30, 60], [30, 51], [36, 51]];
    const censor = [[12, 96], [18, 89], [24, 74], [30, 47]];
    return '<path d="' + stepPath(up, fx, fy) + ' L' + fx(36) + ' ' + fy(51).toFixed(1) + ' ' + stepPath(lo.slice().reverse().concat([[0, 100]]), fx, fy).replace('M', 'L') + ' Z" fill="' + S[0] + '" fill-opacity="0.1" stroke="none" data-edit="true" data-role="band"/>' +
      '<path d="' + stepPath(ctrl, fx, fy) + '" fill="none" stroke="#9AA0A8" stroke-width="1.6" data-edit="true" data-role="line" data-series="1"/>' +
      '<path d="' + stepPath(treat, fx, fy) + '" fill="none" stroke="' + S[0] + '" stroke-width="1.8" data-edit="true" data-role="line" data-series="0"/>' +
      censor.map(pt => '<line x1="' + (fx(pt[0]) - 2.4).toFixed(1) + '" y1="' + (fy(pt[1]) - 2.4).toFixed(1) + '" x2="' + (fx(pt[0]) + 2.4).toFixed(1) + '" y2="' + (fy(pt[1]) + 2.4).toFixed(1) + '" stroke="' + S[0] + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
        '<line x1="' + (fx(pt[0]) - 2.4).toFixed(1) + '" y1="' + (fy(pt[1]) + 2.4).toFixed(1) + '" x2="' + (fx(pt[0]) + 2.4).toFixed(1) + '" y2="' + (fy(pt[1]) - 2.4).toFixed(1) + '" stroke="' + S[0] + '" stroke-width="1" data-edit="true" data-role="stat"/>').join('') +
      legendRow(252, 40, S[0], 'Treated (n = 42)', 'line', 0) +
      legendRow(252, 53, '#9AA0A8', 'Control (n = 40)', 'line', 1) +
      '<text x="' + (P.x1 - 6) + '" y="' + sy(20, 0, 100).toFixed(1) + '" font-family="' + F + '" font-size="7.5" font-style="italic" fill="' + T.tick + '" text-anchor="end" data-edit="true">P = 0.003 (log-rank)</text>' +
      subTitle('ticks, censored', P.x1, P.y1 + 24);
  })() +
'</svg>' },

'volcano': { name: '火山图', icon: '🌋', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 13 | Transcriptional changes after treatment') + yTitle('−log₁₀ P') + xTitle('log₂ fold change') +
  gridH([2, 4, 6], 0, 8) +
  yAxis([0, 2, 4, 6, 8], 0, 8) + xAxisNum([-4, -2, 0, 2, 4], -4, 4) +
  '<line x1="' + sx(-1, -4, 4).toFixed(1) + '" y1="' + P.y0 + '" x2="' + sx(-1, -4, 4).toFixed(1) + '" y2="' + P.y1 + '" stroke="' + T.spine + '" stroke-width="0.7" stroke-dasharray="3,2.5" data-edit="true" data-role="stat"/>' +
  '<line x1="' + sx(1, -4, 4).toFixed(1) + '" y1="' + P.y0 + '" x2="' + sx(1, -4, 4).toFixed(1) + '" y2="' + P.y1 + '" stroke="' + T.spine + '" stroke-width="0.7" stroke-dasharray="3,2.5" data-edit="true" data-role="stat"/>' +
  '<line x1="' + P.x0 + '" y1="' + sy(1.3, 0, 8).toFixed(1) + '" x2="' + P.x1 + '" y2="' + sy(1.3, 0, 8).toFixed(1) + '" stroke="' + T.spine + '" stroke-width="0.7" stroke-dasharray="3,2.5" data-edit="true" data-role="stat"/>' +
  (() => {
    // deterministic pseudo-random cloud: NS grey, up teal-right red?, down blue
    const pts = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 30; i++) pts.push([(rnd() - 0.5) * 2.2, 0.05 + rnd() * 1.15, '#B9BDC4']);   // NS
    for (let i = 0; i < 8; i++) pts.push([1.15 + rnd() * 2.4, 1.4 + rnd() * 5.4, '#5B8FDB']);      // up
    for (let i = 0; i < 7; i++) pts.push([-1.15 - rnd() * 2.2, 1.4 + rnd() * 4.2, '#EC6F9F']);     // down
    const hitA = pts[31], hitB = pts[38];
    return pts.map(p => '<circle cx="' + sx(p[0], -4, 4).toFixed(1) + '" cy="' + sy(p[1], 0, 8).toFixed(1) + '" r="2.6" fill="' + p[2] + '" fill-opacity="0.8" data-edit="true" data-role="marker" data-series="' + (p[2] === '#B9BDC4' ? 0 : p[2] === '#5B8FDB' ? 1 : 2) + '"/>').join('') +
      '<line x1="' + sx(hitA[0], -4, 4).toFixed(1) + '" y1="' + (sy(hitA[1], 0, 8) - 3).toFixed(1) + '" x2="' + (sx(hitA[0], -4, 4) + 10).toFixed(1) + '" y2="' + (sy(hitA[1], 0, 8) - 12).toFixed(1) + '" stroke="' + T.tick + '" stroke-width="0.6" data-edit="true" data-role="stat"/>' +
      '<text x="' + (sx(hitA[0], -4, 4) + 12).toFixed(1) + '" y="' + (sy(hitA[1], 0, 8) - 13).toFixed(1) + '" font-family="' + F + '" font-size="6.8" font-style="italic" fill="' + T.tick + '" data-edit="true">Krt14</text>' +
      '<text x="' + (P.x1 - 8) + '" y="' + (P.y0 + 12) + '" font-family="' + F + '" font-size="6.5" fill="' + T.label + '" text-anchor="end" data-edit="true">up, 186</text>' +
      '<text x="' + (P.x0 + 8) + '" y="' + (P.y0 + 12) + '" font-family="' + F + '" font-size="6.5" fill="' + T.label + '" data-edit="true">down, 154</text>';
  })() +
  note('|log₂FC| &gt; 1, P &lt; 0.05') +
'</svg>' },
};

/* mini-chart helpers for layout skeletons */
function miniFrame(x, y, w, h) {
  return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + h) + '" stroke="' + T.spine + '" stroke-width="0.7" data-edit="true" data-role="axis"/>' +
    '<line x1="' + x + '" y1="' + (y + h) + '" x2="' + (x + w) + '" y2="' + (y + h) + '" stroke="' + T.spine + '" stroke-width="0.7" data-edit="true" data-role="axis"/>';
}
function miniGrid(x, y, w, h, n) {
  let s = '';
  for (let i = 1; i <= n; i++) s += '<line x1="' + x + '" y1="' + (y + h - i * h / (n + 1)).toFixed(1) + '" x2="' + (x + w) + '" y2="' + (y + h - i * h / (n + 1)).toFixed(1) + '" stroke="' + T.grid + '" stroke-width="0.7" data-edit="true" data-role="grid"/>';
  return s;
}
function miniBars(x, y, w, h) {
  const vals = [0.45, 0.8, 0.6, 0.95];
  return miniFrame(x, y, w, h) + miniGrid(x, y, w, h, 2) + vals.map((v, i) => {
    const bw = w / 4 * 0.55, cx = x + w / 4 * (i + 0.5);
    const hi = i === 3;
    return '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + (y + h * (1 - v)).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (h * v).toFixed(1) + '" fill="' + (hi ? S[0] : T.ctrl) + '" data-edit="true" data-role="bar" data-series="' + (hi ? 1 : 0) + '"/>';
  }).join('');
}
function miniLine(x, y, w, h) {
  const pts = [[0, 0.55], [0.25, 0.4], [0.5, 0.55], [0.75, 0.3], [1, 0.14]];
  return miniFrame(x, y, w, h) + miniGrid(x, y, w, h, 2) +
    '<polyline points="' + pts.map(p => (x + p[0] * w).toFixed(1) + ',' + (y + p[1] * h).toFixed(1)).join(' ') + '" fill="none" stroke="' + S[0] + '" stroke-width="1.4" stroke-linejoin="round" data-edit="true" data-role="line" data-series="0"/>' +
    '<circle cx="' + (x + w).toFixed(1) + '" cy="' + (y + 0.14 * h).toFixed(1) + '" r="2" fill="' + S[0] + '" data-edit="true" data-role="marker" data-series="0"/>';
}
function miniScatter(x, y, w, h) {
  const pts = [[0.08, 0.8], [0.2, 0.68], [0.3, 0.74], [0.42, 0.55], [0.52, 0.6], [0.65, 0.42], [0.78, 0.34], [0.9, 0.22]];
  return miniFrame(x, y, w, h) + miniGrid(x, y, w, h, 2) +
    pts.map(p => '<circle cx="' + (x + p[0] * w).toFixed(1) + '" cy="' + (y + p[1] * h).toFixed(1) + '" r="2" fill="' + S[0] + '" fill-opacity="0.65" data-edit="true" data-role="marker" data-series="0"/>').join('');
}
function miniHeat(x, y, w, h) {
  const vals = [[0.8, 0.3, 0.55], [0.4, 0.9, 0.25], [0.6, 0.5, 0.85]];
  const col = v => 'rgb(' + Math.round(247 - v * 169) + ',' + Math.round(247 - v * 126) + ',' + Math.round(250 - v * 83) + ')';
  const cw = w / 3, ch = h / 3;
  let s = '';
  vals.forEach((row, r) => row.forEach((v, c) => {
    s += '<rect x="' + (x + c * cw).toFixed(1) + '" y="' + (y + r * ch).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '" fill="' + col(v) + '" data-edit="true" data-role="heat"/>';
  }));
  return s;
}
function miniBox(x, y, w, h) {
  const bw = Math.min(w * 0.22, 16);
  const boxes = [[0.3, 0.45, 0.62], [0.5, 0.62, 0.8]];
  return miniFrame(x, y, w, h) + miniGrid(x, y, w, h, 2) + boxes.map((b, i) => {
    const cx = x + w * (i + 0.5) / 2;
    return '<line x1="' + cx.toFixed(1) + '" y1="' + (y + (1 - b[0]) * h).toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + (y + (1 - b[2]) * h).toFixed(1) + '" stroke="' + T.spine + '" stroke-width="0.7" data-edit="true" data-role="stat"/>' +
      '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + (y + (1 - b[2]) * h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + ((b[2] - b[1]) * h).toFixed(1) + '" fill="#5B8FDB" fill-opacity="0.28" stroke="' + T.spine + '" stroke-width="0.7" data-edit="true" data-role="bar" data-series="0"/>' +
      '<line x1="' + (cx - bw / 2).toFixed(1) + '" y1="' + (y + (1 - b[1]) * h).toFixed(1) + '" x2="' + (cx + bw / 2).toFixed(1) + '" y2="' + (y + (1 - b[1]) * h).toFixed(1) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>';
  }).join('');
}
function panelFrame(x, y, w, h, label) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + T.W + '" stroke="' + T.frame + '" stroke-width="1" data-edit="true"/>' +
    '<text x="' + (x + 5) + '" y="' + (y + 13) + '" font-family="' + F + '" font-size="9.5" font-weight="bold" fill="' + T.title + '" data-edit="true">' + label + '</text>';
}
function miniIn(x, y, w, h, kind) { // inset mini chart inside a panel, below its label
  const ix = x + 14, iy = y + 22, iw = w - 24, ih = h - 32;
  return { bars: miniBars, line: miniLine, scatter: miniScatter, heat: miniHeat, box: miniBox }[kind](ix, iy, iw, ih);
}

/* ═══════════════ LAYOUT TEMPLATES ═══════════════ */
const LAYOUT_TEMPLATES = {
'single': { name: '单面板', icon: '▭', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Main finding in a single panel') +
  panelFrame(20, 32, 360, 230, 'a') + miniIn(20, 32, 360, 230, 'bars') +
'</svg>' },
'two-h': { name: '左右双面板', icon: '▥', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Observation and validation') +
  panelFrame(16, 32, 180, 230, 'a') + miniIn(16, 32, 180, 230, 'line') +
  panelFrame(204, 32, 180, 230, 'b') + miniIn(204, 32, 180, 230, 'bars') +
'</svg>' },
'two-v': { name: '上下双面板', icon: '▤', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Time course and specificity') +
  panelFrame(24, 30, 352, 118, 'a') + miniIn(24, 30, 352, 118, 'line') +
  panelFrame(24, 152, 352, 110, 'b') + miniIn(24, 152, 352, 110, 'heat') +
'</svg>' },
'four-grid': { name: '四宫格', icon: '▦', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Behaviour across four assays') +
  panelFrame(16, 30, 180, 116, 'a') + miniIn(16, 30, 180, 116, 'bars') +
  panelFrame(204, 30, 180, 116, 'b') + miniIn(204, 30, 180, 116, 'line') +
  panelFrame(16, 150, 180, 116, 'c') + miniIn(16, 150, 180, 116, 'scatter') +
  panelFrame(204, 150, 180, 116, 'd') + miniIn(204, 150, 180, 116, 'box') +
'</svg>' },
'title-caption': { name: '标题+图注', icon: '📰', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Main finding of this study') +
  panelFrame(24, 30, 352, 172, 'a') + miniIn(24, 30, 352, 172, 'line') +
  '<rect x="24" y="210" width="352" height="56" fill="#F4F4F7" data-edit="true"/>' +
  '<text x="34" y="228" font-family="' + F + '" font-size="7.5" fill="' + T.label + '" data-edit="true">(a) Experimental result showing the main effect (mean ± s.e.m., n = 6 biologically</text>' +
  '<text x="34" y="240" font-family="' + F + '" font-size="7.5" fill="' + T.label + '" data-edit="true">independent samples). Statistical analysis by two-sided t-test; **P &lt; 0.01.</text>' +
'</svg>' },
'schematic': { name: '流程示意', icon: '🧩', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Workflow overview') +
  '<defs><marker id="ff-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#4D4D4D"/></marker></defs>' +
  (() => {
    // Thin-outline boxes on near-white fills; only the pivotal step carries the accent
    const steps = [['Sample collection', 36, '#F2F4F8', '#4D4D4D'], ['Preprocessing', 158, '#F2F4F8', '#4D4D4D'], ['Model training', 280, '#EAF0FA', '#5B8FDB']];
    let s = '';
    steps.forEach((st, i) => {
      const x = st[1], y = 52, w = 92, h = 52;
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + st[2] + '" stroke="' + st[3] + '" stroke-width="1" data-edit="true" data-role="frame"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 3) + '" font-family="' + F + '" font-size="8.5" fill="' + T.title + '" text-anchor="middle" data-edit="true">' + st[0].split(' ')[0] + '</text>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 14) + '" font-family="' + F + '" font-size="8.5" fill="' + T.title + '" text-anchor="middle" data-edit="true">' + (st[0].split(' ')[1] || '') + '</text>';
      if (i < steps.length - 1) s += '<line x1="' + (x + w + 6) + '" y1="' + (y + h / 2) + '" x2="' + (x + w + 24) + '" y2="' + (y + h / 2) + '" stroke="#4D4D4D" stroke-width="1.2" marker-end="url(#ff-arrow)" data-edit="true" data-role="stat"/>';
    });
    s += '<rect x="60" y="150" width="288" height="86" rx="6" fill="none" stroke="#9A9AA4" stroke-width="0.9" stroke-dasharray="5,3" data-edit="true"/>' +
      '<text x="70" y="166" font-family="' + F + '" font-size="7.5" fill="' + T.label + '" data-edit="true">Evaluation</text>';
    const nodes = [['Cross-validation', 78, '#5B8FDB'], ['Ablation', 172, '#43B39C'], ['External test', 258, '#EC6F9F']];
    nodes.forEach((nd, i) => {
      s += '<rect x="' + nd[1] + '" y="178" width="' + (nd[1] === 258 ? 78 : 74) + '" height="34" rx="5" fill="#FFFFFF" stroke="' + nd[2] + '" stroke-width="1.2" data-edit="true" data-role="series" data-series="' + i + '"/>' +
        '<text x="' + (nd[1] + 37) + '" y="198" font-family="' + F + '" font-size="7.5" fill="' + T.title + '" text-anchor="middle" data-edit="true">' + nd[0] + '</text>';
    });
    s += '<line x1="204" y1="104" x2="204" y2="142" stroke="#4D4D4D" stroke-width="1.2" marker-end="url(#ff-arrow)" data-edit="true" data-role="stat"/>';
    return s;
  })() +
'</svg>' },

/* ── 多面板综合示例：像成稿一样的 Nature 组图骨架 ── */
'comp-ab': { name: '综合 a+b', icon: '🧪', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Knockout reshapes expression and its time course') +
  panelFrame(16, 30, 180, 232, 'a') +
  panelLetter('a', 22, 44) +
  subAxes(42, 58, 186, 240, [0, 1, 2, 3, 4], 0, 4, { xLabels: ['WT', 'Het', 'KO'] }) +
  (() => {
    const groups = [[100, 2.1, 3.3, 15], [136, 2.4, 3.6, 17], [172, 1.6, 2.7, 14]];
    const jit = [-5, -1, 3, 6], fr = [0.3, 0.5, 0.68, 0.85];
    return groups.map((g, i) => {
      const yT = 240 - (g[1] / 4) * (240 - 58), yB = 240 - (g[2] / 4) * (240 - 58);
      const pts = jit.map((dx, k) => '<circle cx="' + (g[0] + dx).toFixed(1) + '" cy="' + (yT + fr[k] * (yB - yT)).toFixed(1) + '" r="1.3" fill="' + S[0] + '" fill-opacity="0.55" data-edit="true" data-role="marker" data-series="0"/>').join('');
      const bw = 4, q1 = yT + (yB - yT) * 0.3, q3 = yT + (yB - yT) * 0.62, med = yT + (yB - yT) * 0.47;
      return '<path d="' + violinPath(g[0], yT, yB, g[3]) + '" fill="' + S[0] + '" fill-opacity="0.15" stroke="' + S[0] + '" stroke-width="0.9" data-edit="true" data-role="bar" data-series="' + i + '"/>' +
        pts +
        '<rect x="' + (g[0] - bw / 2).toFixed(1) + '" y="' + q1.toFixed(1) + '" width="' + bw + '" height="' + (q3 - q1).toFixed(1) + '" fill="#FFFFFF" stroke="' + T.spine + '" stroke-width="0.7" data-edit="true" data-role="stat"/>' +
        '<line x1="' + (g[0] - bw / 2 - 1.6).toFixed(1) + '" y1="' + med.toFixed(1) + '" x2="' + (g[0] + bw / 2 + 1.6).toFixed(1) + '" y2="' + med.toFixed(1) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>';
    }).join('') +
      '<path d="M100 62 H172" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>' +
      '<text x="136" y="59" font-family="' + F + '" font-size="7" fill="' + T.spine + '" text-anchor="middle" data-edit="true">**</text>';
  })() +
  panelFrame(204, 30, 180, 232, 'b') +
  panelLetter('b', 210, 44) +
  subAxes(230, 58, 374, 240, [0, 20, 40, 60, 80], 0, 100, { xTicks: [0, 6, 12, 18, 24], xLo: 0, xHi: 24 }) +
  (() => {
    const fx = v => 230 + v / 24 * 144, fy = v => 240 - v / 100 * 182;
    const ys = [52, 58, 54, 66, 72, 69, 84], xs = [0, 4, 8, 12, 15, 19, 24];
    const pts = xs.map((x, i) => [fx(x), fy(ys[i])]);
    const up = pts.map(p => p[0].toFixed(1) + ',' + (p[1] - 9).toFixed(1)).join(' ');
    const dn = pts.slice().reverse().map(p => p[0].toFixed(1) + ',' + (p[1] + 9).toFixed(1)).join(' ');
    return '<polygon points="' + up + ' ' + dn + '" fill="' + S[0] + '" fill-opacity="0.12" data-edit="true" data-role="band"/>' +
      '<polyline points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + S[0] + '" stroke-width="1.5" stroke-linejoin="round" data-edit="true" data-role="line" data-series="0"/>' +
      pts.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2" fill="' + S[0] + '" data-edit="true" data-role="marker" data-series="0"/>').join('') +
      '<text x="374" y="66" font-family="' + F + '" font-size="6.5" font-style="italic" fill="' + T.tick + '" text-anchor="end" data-edit="true">95% CI, n = 6</text>';
  })() +
'</svg>' },

'comp-abc': { name: '综合 a+b+c', icon: '🧬', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Assay performance across cohorts and markers') +
  panelFrame(16, 30, 180, 110, 'a') + panelLetter('a', 22, 44) +
  subAxes(38, 48, 190, 126, [0, 25, 50, 75], 0, 100, { xLabels: ['G1', 'G2', 'G3'] }) +
  (() => {
    const gs = [[70, 38, 60], [114, 52, 72], [158, 30, 56]];
    const bw = 15;
    return gs.map((g, i) => {
      const fy = v => 126 - v / 100 * 78;
      const c0 = (g[0] - bw / 2 - 2).toFixed(1), c1 = (g[0] + bw / 2 + 2).toFixed(1);
      return '<rect x="' + c0 + '" y="' + fy(g[1]).toFixed(1) + '" width="' + bw + '" height="' + (126 - fy(g[1])).toFixed(1) + '" fill="#CBD2DE" data-edit="true" data-role="bar" data-series="0"/>' +
        '<rect x="' + c1 + '" y="' + fy(g[2]).toFixed(1) + '" width="' + bw + '" height="' + (126 - fy(g[2])).toFixed(1) + '" fill="' + S[0] + '" data-edit="true" data-role="bar" data-series="1"/>' +
        errBar(c0, fy(g[1] + 4), fy(g[1] - 4), 2) + errBar(c1, fy(g[2] + 4), fy(g[2] - 4), 2);
    }).join('') +
      '<path d="M' + (gs[0][0] - 7) + ' ' + (126 - 76 / 100 * 78 - 6) + ' H' + (gs[2][0] + 7) + '" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>' +
      '<text x="' + gs[1][0] + '" y="' + (126 - 76 / 100 * 78 - 9) + '" font-family="' + F + '" font-size="6.5" fill="' + T.spine + '" text-anchor="middle" data-edit="true">**</text>';
  })() +
  panelFrame(204, 30, 180, 110, 'b') + panelLetter('b', 210, 44) +
  subAxes(226, 48, 378, 126, [0, 50, 100], 0, 100, { xTicks: [0, 5, 10], xLo: 0, xHi: 10 }) +
  (() => {
    const pts = [[0.6, 34], [1.9, 42], [3.1, 48], [4.4, 55], [5.6, 58], [6.9, 63], [8.1, 66], [9.4, 72]];
    return pts.map(p => '<circle cx="' + (226 + p[0] / 10 * 152).toFixed(1) + '" cy="' + (126 - p[1] / 100 * 78).toFixed(1) + '" r="2" fill="' + S[0] + '" fill-opacity="0.65" data-edit="true" data-role="marker" data-series="0"/>').join('') +
      '<line x1="226" y1="' + (126 - 28 / 100 * 78).toFixed(1) + '" x2="378" y2="' + (126 - 84 / 100 * 78).toFixed(1) + '" stroke="' + T.spine + '" stroke-width="1" data-edit="true" data-role="stat"/>' +
      '<text x="376" y="58" font-family="' + F + '" font-size="6" font-style="italic" fill="' + T.tick + '" text-anchor="end" data-edit="true">R² = 0.96</text>';
  })() +
  panelFrame(16, 146, 368, 116, 'c') + panelLetter('c', 22, 160) +
  (() => {
    const gx0 = 46, gx1 = 310, gy0 = 162, gy1 = 244;
    const rows = ['Sig 1', 'Sig 2', 'Sig 3'], cols = 8;
    const vals = [
      [0.8, 0.35, 0.6, 0.9, 0.25, 0.7, 0.45, 0.85],
      [0.3, 0.85, 0.4, 0.25, 0.75, 0.3, 0.9, 0.35],
      [0.55, 0.2, 0.8, 0.5, 0.4, 0.85, 0.3, 0.6]];
    const cw = (gx1 - gx0) / cols, ch = (gy1 - gy0) / 3;
    const col = v => 'rgb(' + Math.round(247 - v * 169) + ',' + Math.round(247 - v * 126) + ',' + Math.round(250 - v * 83) + ')';
    let s = '';
    rows.forEach((r, ri) => {
      s += '<text x="' + (gx0 - 5) + '" y="' + (gy0 + ch * ri + ch / 2 + 2.2).toFixed(1) + '" font-family="' + F + '" font-size="6" fill="' + T.tick + '" text-anchor="end" data-edit="true">' + r + '</text>';
      for (let ci = 0; ci < cols; ci++) {
        s += '<rect x="' + (gx0 + cw * ci).toFixed(1) + '" y="' + (gy0 + ch * ri).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '" fill="' + col(vals[ri][ci]) + '" stroke="#FFFFFF" stroke-width="0.8" data-edit="true" data-role="heat"/>';
      }
    });
    for (let ci = 0; ci < cols; ci++) {
      s += '<text x="' + (gx0 + cw * (ci + 0.5)).toFixed(1) + '" y="' + (gy1 + 10) + '" font-family="' + F + '" font-size="5.8" fill="' + T.tick + '" text-anchor="middle" data-edit="true">M' + (ci + 1) + '</text>';
    }
    s += '<rect x="330" y="162" width="10" height="82" fill="url(#ff-cb2)" stroke="' + T.spine + '" stroke-width="0.5" data-edit="true" data-role="heat"/>' +
      '<defs><linearGradient id="ff-cb2" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="' + col(0) + '"/><stop offset="0.5" stop-color="' + col(0.5) + '"/><stop offset="1" stop-color="' + col(1) + '"/></linearGradient></defs>' +
      '<text x="335" y="158" font-family="' + F + '" font-size="6" fill="' + T.label + '" text-anchor="middle" data-edit="true">Z</text>';
    return s;
  })() +
'</svg>' },

'comp-hero': { name: '综合 主图+副图', icon: '🏆', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">' +
  figTitle('Figure 1 | Treatment extends survival across models') +
  panelFrame(16, 30, 234, 232, 'a') + panelLetter('a', 22, 44) +
  subAxes(38, 52, 242, 240, [0, 25, 50, 75, 100], 0, 100, { xTicks: [0, 12, 24, 36], xLo: 0, xHi: 36 }) +
  (() => {
    const fx = v => 38 + v / 36 * 204, fy = v => 240 - v / 100 * 188;
    const treat = [[0, 100], [6, 100], [6, 96], [12, 96], [12, 89], [18, 89], [18, 82], [24, 82], [24, 74], [30, 74], [30, 68], [36, 68]];
    const ctrl = [[0, 100], [6, 92], [6, 84], [12, 84], [12, 71], [18, 71], [18, 58], [24, 58], [24, 47], [30, 47], [30, 39], [36, 39]];
    const censor = [[12, 96], [18, 89], [24, 74], [30, 47]];
    return censor.map(pt => '<line x1="' + (fx(pt[0]) - 2).toFixed(1) + '" y1="' + (fy(pt[1]) - 2).toFixed(1) + '" x2="' + (fx(pt[0]) + 2).toFixed(1) + '" y2="' + (fy(pt[1]) + 2).toFixed(1) + '" stroke="' + S[0] + '" stroke-width="0.9" data-edit="true" data-role="stat"/>' +
      '<line x1="' + (fx(pt[0]) - 2).toFixed(1) + '" y1="' + (fy(pt[1]) + 2).toFixed(1) + '" x2="' + (fx(pt[0]) + 2).toFixed(1) + '" y2="' + (fy(pt[1]) - 2).toFixed(1) + '" stroke="' + S[0] + '" stroke-width="0.9" data-edit="true" data-role="stat"/>').join('') +
      '<path d="' + stepPath(ctrl, fx, fy) + '" fill="none" stroke="#9AA0A8" stroke-width="1.5" data-edit="true" data-role="line" data-series="1"/>' +
      '<path d="' + stepPath(treat, fx, fy) + '" fill="none" stroke="' + S[0] + '" stroke-width="1.7" data-edit="true" data-role="line" data-series="0"/>' +
      legendRow(150, 62, S[0], 'Treated', 'line', 0) +
      legendRow(150, 74, '#9AA0A8', 'Control', 'line', 1) +
      '<text x="240" y="232" font-family="' + F + '" font-size="6.5" font-style="italic" fill="' + T.tick + '" text-anchor="end" data-edit="true">P = 0.003, log-rank</text>';
  })() +
  panelFrame(258, 30, 126, 110, 'b') + panelLetter('b', 264, 44) +
  subAxes(280, 48, 378, 126, [0, 50, 100], 0, 100, { xLabels: ['A', 'B'] }) +
  (() => {
    const fy = v => 126 - v / 100 * 78;
    return '<rect x="292" y="' + fy(38).toFixed(1) + '" width="18" height="' + (126 - fy(38)).toFixed(1) + '" fill="#CBD2DE" data-edit="true" data-role="bar" data-series="0"/>' +
      '<rect x="336" y="' + fy(66).toFixed(1) + '" width="18" height="' + (126 - fy(66)).toFixed(1) + '" fill="' + S[0] + '" data-edit="true" data-role="bar" data-series="1"/>' +
      errBar('301', fy(43), fy(33), 2) + errBar('345', fy(71), fy(61), 2) +
      '<path d="M292 ' + (fy(74) - 5) + ' H354" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>' +
      '<text x="323" y="' + (fy(74) - 8) + '" font-family="' + F + '" font-size="6.5" fill="' + T.spine + '" text-anchor="middle" data-edit="true">*</text>';
  })() +
  panelFrame(258, 146, 126, 116, 'c') + panelLetter('c', 264, 160) +
  subAxes(280, 168, 378, 244, [0, 2, 4], 0, 5, { xLabels: ['WT', 'KO'] }) +
  (() => {
    const v1 = { t: 240 - (3.2 / 5) * 76, b: 240 - (1.2 / 5) * 76 };
    const v2 = { t: 240 - (2.3 / 5) * 76, b: 240 - (0.8 / 5) * 76 };
    return '<path d="' + violinPath(305, v1.t, v1.b, 14) + '" fill="' + S[0] + '" fill-opacity="0.15" stroke="' + S[0] + '" stroke-width="0.9" data-edit="true" data-role="bar" data-series="0"/>' +
      '<path d="' + violinPath(352, v2.t, v2.b, 14) + '" fill="' + S[1] + '" fill-opacity="0.15" stroke="' + S[1] + '" stroke-width="0.9" data-edit="true" data-role="bar" data-series="1"/>' +
      '<rect x="303.5" y="' + (v1.t + (v1.b - v1.t) * 0.3).toFixed(1) + '" width="3" height="' + ((v1.b - v1.t) * 0.32).toFixed(1) + '" fill="#FFFFFF" stroke="' + T.spine + '" stroke-width="0.6" data-edit="true" data-role="stat"/>' +
      '<rect x="350.5" y="' + (v2.t + (v2.b - v2.t) * 0.3).toFixed(1) + '" width="3" height="' + ((v2.b - v2.t) * 0.32).toFixed(1) + '" fill="#FFFFFF" stroke="' + T.spine + '" stroke-width="0.6" data-edit="true" data-role="stat"/>' +
      '<path d="M305 ' + (v1.t - 6) + ' H352" fill="none" stroke="' + T.spine + '" stroke-width="0.8" data-edit="true" data-role="stat"/>' +
      '<text x="328.5" y="' + (v1.t - 9) + '" font-family="' + F + '" font-size="6.5" fill="' + T.spine + '" text-anchor="middle" data-edit="true">ns</text>';
  })() +
'</svg>' },
};

function getChartTemplates() { return CHART_TEMPLATES; }
function getLayoutTemplates() { return LAYOUT_TEMPLATES; }
function getTemplate(key) {
  return CHART_TEMPLATES[key] || LAYOUT_TEMPLATES[key] || null;
}
window.getChartTemplates = getChartTemplates;
window.getLayoutTemplates = getLayoutTemplates;
window.getTemplate = getTemplate;
