/* Build assets/showcase.svg — 3×3 mosaic of real FigureForge template outputs.
 * Usage: node build-showcase.js  (run from figureforge/js or pass path) */
const fs = require('fs');
const path = require('path');

// Load templates.js in this scope: it defines CHART_TEMPLATES as top-level const
const src = fs.readFileSync(path.join(__dirname, 'templates.js'), 'utf8');
const vm = require('vm');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src + '\n;this.__T = CHART_TEMPLATES;', sandbox);
const T = sandbox.__T;

const PICK = ['bar', 'heatmap', 'volcano', 'grouped-bar', 'violin', 'km', 'box', 'forest', 'multi-line'];
const LABELS = {
  'bar': '柱状图 + 原始点', 'heatmap': '聚类热图', 'volcano': '火山图', 'grouped-bar': '分组柱状图',
  'violin': '小提琴图', 'km': '生存曲线', 'box': '箱线图', 'forest': '森林图', 'multi-line': '多折线图',
};

// strip outer <svg ...> / </svg> from a template svg string
function inner(svg) {
  const a = svg.indexOf('>') + 1;
  const b = svg.lastIndexOf('</svg>');
  return svg.slice(a, b);
}

// layout
const CW = 980, M = 24, GAP = 16, CARD_W = 300, CARD_H = 210, LABEL_H = 26;
const HEAD = 96, FOOT = 26;
const rows = 3, cols = 3;
const H = HEAD + rows * (CARD_H + LABEL_H + 12) - 12 + FOOT;

let parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" font-family="PingFang SC, Microsoft YaHei, sans-serif">`);
parts.push(`<defs><filter id="cs" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.45"/></filter></defs>`);
parts.push(`<rect width="${CW}" height="${H}" fill="#171a21"/>`);
parts.push(`<text x="${M}" y="44" font-size="24" font-weight="700" fill="#ffffff">出版级模板，开箱即用</text>`);
parts.push(`<text x="${M}" y="72" font-size="14" fill="#8a94ab">以下每张图都是 FigureForge 内置模板的真实渲染 — 选骨架、改数据、导出投稿格式</text>`);
parts.push(`<rect x="${CW - M - 118}" y="28" width="118" height="26" rx="13" fill="none" stroke="rgba(43,184,171,0.45)"/>`);
parts.push(`<text x="${CW - M - 59}" y="45" font-size="13" fill="#2bb8ab" text-anchor="middle">22 模板 · 14 色卡</text>`);

let i = 0;
for (const key of PICK) {
  const t = T[key];
  if (!t) { console.error('missing template:', key); continue; }
  const r = Math.floor(i / cols), c = i % cols;
  const x = M + c * (CARD_W + GAP), y = HEAD + r * (CARD_H + LABEL_H + 12);
  parts.push(`<g filter="url(#cs)"><rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="8" fill="#ffffff"/></g>`);
  parts.push(`<svg x="${x + 2}" y="${y + 2}" width="${CARD_W - 4}" height="${CARD_H - 4}" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">`);
  parts.push(inner(t.svg));
  parts.push(`</svg>`);
  parts.push(`<text x="${x + CARD_W / 2}" y="${y + CARD_H + 18}" font-size="13" fill="#8a94ab" text-anchor="middle">${LABELS[key]}</text>`);
  i++;
}
parts.push('</svg>');

fs.writeFileSync(path.join(__dirname, '..', '..', 'assets', 'showcase.svg'), parts.join('\n'));
console.log('written, templates used:', i, 'height:', H);
