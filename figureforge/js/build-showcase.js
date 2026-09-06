/* Build assets/showcase.svg — chart-atlas style mosaic of real FigureForge
 * template renders: one grid, 12 panels (a-l), each template × a pastel accent
 * palette, echoing the "chart atlas" reference style (soft fills, panel
 * letters, variant names). Regenerate: node build-showcase.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, 'templates.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src + '\n;this.__T = { ...CHART_TEMPLATES, ...LAYOUT_TEMPLATES };', sandbox);
const T = sandbox.__T;

// ── atlas plan: 12 panels, pastel accents (heatmap/volcano keep diverging) ──
const CELLS = [
  { key: 'bar',         label: '柱状图 · 原始点叠加', accent: '#7FA6DC' }, // soft blue
  { key: 'grouped-bar', label: '分组柱状图',          accent: '#E58FB1' }, // pink
  { key: 'bar',         label: '柱状图 · 玫瑰主色',   accent: '#C97B6E' }, // soft red
  { key: 'grouped-bar', label: '分组柱状图 · 紫罗兰', accent: '#A48BD8' }, // soft purple
  { key: 'violin',      label: '小提琴图',            accent: '#6FAF9B' }, // soft green
  { key: 'box',         label: '箱线图',              accent: '#E58FB1' },
  { key: 'multi-line',  label: '多折线图',            accent: '#7FA6DC' },
  { key: 'km',          label: '生存曲线',            accent: '#E58FB1' },
  { key: 'heatmap',     label: '聚类热图',            accent: null },      // diverging
  { key: 'volcano',     label: '火山图',              accent: null },      // diverging
  { key: 'forest',      label: '森林图',              accent: '#6FAF9B' },
  { key: 'comp-ab',     label: 'a+b 双联面板',        accent: '#A48BD8' },
];
const SECONDARY = { '#F28E2B': '#E8C46B', '#E15759': '#D98A9E', '#76B7B2': '#8FC3B4', '#59A14F': '#9C7BD8', '#B07AA1': '#C9B2E4', '#4E8A85': '#5FA893' };

function inner(svg, cell) {
  const a = svg.indexOf('>') + 1;
  const b = svg.lastIndexOf('</svg>');
  let s = svg.slice(a, b);
  if (cell.accent) {
    s = s.replace(/#4E79A7/gi, cell.accent);
    for (const [f, t] of Object.entries(SECONDARY)) s = s.replace(new RegExp(f, 'gi'), t);
  }
  return s;
}

// ── layout ──
const COLS = 4, ROWS = 3, M = 26, GAP = 14;
const CARD_W = 224, CARD_H = 157, LABEL_H = 40; // label: letter+name
const HEAD = 92, FOOT = 24;
const CW = M * 2 + COLS * CARD_W + (COLS - 1) * GAP;
const H = HEAD + ROWS * (CARD_H + LABEL_H + 10) - 10 + FOOT;
const LETTERS = 'abcdefghijkl';

let parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" font-family="PingFang SC, Microsoft YaHei, sans-serif">`);
parts.push(`<defs><filter id="cs" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/></filter></defs>`);
parts.push(`<rect width="${CW}" height="${H}" fill="#171a21"/>`);
parts.push(`<text x="${M}" y="40" font-size="23" font-weight="700" fill="#ffffff">Chart atlas | 出版级模板图鉴</text>`);
parts.push(`<text x="${M}" y="66" font-size="14" fill="#8a94ab">同一图表类型 × 多种柔和配色 — 每一格都是 FigureForge 内置模板的真实渲染</text>`);
parts.push(`<rect x="${CW - M - 118}" y="26" width="118" height="26" rx="13" fill="none" stroke="rgba(43,184,171,0.45)"/>`);
parts.push(`<text x="${CW - M - 59}" y="43" font-size="13" fill="#2bb8ab" text-anchor="middle">22 模板 · 16 色卡</text>`);

CELLS.forEach((cell, i) => {
  const t = T[cell.key];
  if (!t) { console.error('missing template:', cell.key); return; }
  const r = Math.floor(i / COLS), c = i % COLS;
  const x = M + c * (CARD_W + GAP), y = HEAD + r * (CARD_H + LABEL_H + 10);
  parts.push(`<g filter="url(#cs)"><rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="6" fill="#ffffff"/></g>`);
  parts.push(`<svg x="${x + 2}" y="${y + 2}" width="${CARD_W - 4}" height="${CARD_H - 4}" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">`);
  parts.push(inner(t.svg, cell));
  parts.push(`</svg>`);
  const lx = x + 4, ly = y + CARD_H + 8;
  parts.push(`<text x="${lx}" y="${ly + 11}" font-size="13" font-weight="700" fill="#2bb8ab">${LETTERS[i]}</text>`);
  parts.push(`<text x="${lx + 16}" y="${ly + 11}" font-size="13" fill="#8a94ab">${cell.label}</text>`);
});
parts.push('</svg>');

fs.writeFileSync(path.join(__dirname, '..', '..', 'assets', 'showcase.svg'), parts.join('\n'));
console.log('written, panels:', CELLS.length, 'size:', CW + 'x' + H);
