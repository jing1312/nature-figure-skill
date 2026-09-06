#!/usr/bin/env node
/**
 * build-showcase.js — 生成 assets/showcase.svg（Chart atlas 图鉴风格）
 *
 * 排版对标《Chart atlas 03 | Heatmaps》：
 *   白底 + 大留白 / 粗体字母标签在图外 / 面板小标题居中 / 面板无边框
 *   柔和低饱和配色 / 无图表垃圾（仅浅网格 + 细坐标轴）
 *   柱状图采用 Nature 式「浅灰柱 + 单色高亮 + 显著性括号」
 * 纯手绘生成，不依赖 templates.js。改配色或数据后 `node build-showcase.js` 重跑。
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ── 基础工具 ──────────────────────────────────────────────
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function lerp(a, b, t) { return a + (b - a) * t; }
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(c1, c2, t) {
  const a = hex2rgb(c1), b = hex2rgb(c2);
  return '#' + [0, 1, 2].map(i => Math.round(lerp(a[i], b[i], t)).toString(16).padStart(2, '0')).join('');
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

// ── 全局样式常量 ─────────────────────────────────────────
const INK = '#1A1A1A';
const MUTE = '#6B6B6B';
const TICK = '#8A8A8A';
const AXIS = '#B9B9B9';
const GRID = '#EBEBEB';
const GRAY_BAR = '#D8DCE1';
const GRAY_BAR_DK = '#C4C9D0';
const FONT = "Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";

const C = {
  rose:  { m: '#D98A94', d: '#C06B76', l: '#F2C9CD' },
  blue:  { m: '#7FA6C9', d: '#5F87AD', l: '#C2D5E4' },
  green: { m: '#7FAF8E', d: '#5E9270', l: '#C4DAC9' },
  violet:{ m: '#9C8BC4', d: '#7E6AA9', l: '#D5CCE6' },
  teal:  { m: '#6B9E9C', d: '#4F8280', l: '#C0D8D7' },
  slate: { m: '#8CA0B3', d: '#69809A', l: '#CCD6DF' },
};
const DIVERGE_NEG = '#7FA3C8', DIVERGE_POS = '#CE8B8B', DIVERGE_MID = '#F7F4F1';
const SEQ_LO = '#E3ECDF', SEQ_HI = '#4E8062';

// ── 版面 ─────────────────────────────────────────────────
const W = 1120, H = 880;
const MX = 34;
const COLS = 4, GAPX = 26, GAPY = 34;
const PW = (W - MX * 2 - GAPX * (COLS - 1)) / COLS;
const HEAD_H = 96;
const TITLE_H = 22;
const CH = 196;
const ROW_H = TITLE_H + CH + GAPY;

const panels = [];

function panelXY(row, col) {
  const x = MX + col * (PW + GAPX);
  const y = HEAD_H + row * ROW_H;
  return { x, y };
}
function plotArea(x, y) {
  return { px: x + 36, py: y + TITLE_H + 8, pw: PW - 44, ph: CH - 26 };
}
function scaleY(p, vmax, v) { return p.py + p.ph - (v / vmax) * p.ph; }

function axes(p, vmax, ngrid, opts = {}) {
  let s = '';
  for (let i = 0; i <= ngrid; i++) {
    const v = (vmax / ngrid) * i;
    const yy = scaleY(p, vmax, v);
    if (i > 0) s += `<line x1="${p.px}" y1="${yy.toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${GRID}" stroke-width="0.8"/>`;
    s += `<text x="${p.px - 5}" y="${(yy + 2.6).toFixed(1)}" font-size="8" fill="${TICK}" text-anchor="end">${opts.yFmt ? opts.yFmt(v) : v}</text>`;
  }
  s += `<line x1="${p.px}" y1="${p.py}" x2="${p.px}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  s += `<line x1="${p.px}" y1="${(p.py + p.ph).toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  return s;
}
function xticks(p, labels, centers) {
  return labels.map((lb, i) =>
    `<text x="${centers[i].toFixed(1)}" y="${p.py + p.ph + 12}" font-size="8" fill="${TICK}" text-anchor="middle">${esc(lb)}</text>`
  ).join('');
}
function xTitle(p, txt) {
  return `<text x="${(p.px + p.pw / 2).toFixed(1)}" y="${p.py + p.ph + 23}" font-size="8.5" fill="${MUTE}" text-anchor="middle">${esc(txt)}</text>`;
}
function errBar(cx, yTop, yBot, w = 4) {
  return `<line x1="${cx.toFixed(1)}" y1="${yTop.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${yBot.toFixed(1)}" stroke="#4A4A4A" stroke-width="1"/>` +
    `<line x1="${(cx - w / 2).toFixed(1)}" y1="${yTop.toFixed(1)}" x2="${(cx + w / 2).toFixed(1)}" y2="${yTop.toFixed(1)}" stroke="#4A4A4A" stroke-width="1"/>` +
    `<line x1="${(cx - w / 2).toFixed(1)}" y1="${yBot.toFixed(1)}" x2="${(cx + w / 2).toFixed(1)}" y2="${yBot.toFixed(1)}" stroke="#4A4A4A" stroke-width="1"/>`;
}
function sigBracket(x1, x2, yv, label) {
  return `<path d="M ${x1.toFixed(1)} ${(yv - 4).toFixed(1)} V ${yv.toFixed(1)} H ${x2.toFixed(1)} V ${(yv - 4).toFixed(1)}" fill="none" stroke="#3A3A3A" stroke-width="1"/>` +
    `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${(yv - 4).toFixed(1)}" font-size="9" fill="#3A3A3A" text-anchor="middle" font-weight="600">${label}</text>`;
}
function panelHead(x, y, letter, title) {
  return `<text x="${x}" y="${y + 14}" font-size="13" font-weight="700" fill="${INK}">${letter}</text>` +
    `<text x="${(x + PW / 2 + 8).toFixed(1)}" y="${y + 13}" font-size="10.5" fill="${MUTE}" text-anchor="middle">${esc(title)}</text>`;
}

// ══ 面板绘制器 ════════════════════════════════════════════

function drawHighlightBar(row, col, letter, title, hl, seed, sig) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  const rnd = mulberry32(seed);
  const labels = ['Ctrl', 'Low', 'Mid', 'High', 'Combo'];
  const vals = [46, 58, 82, 52, 64];
  const errs = [7, 8, 6, 8, 7];
  const bw = p.pw / 5 * 0.52;
  const step = p.pw / 5;
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, labels, labels.map((_, i) => p.px + step * i + step / 2));
  s += xTitle(p, '剂量组');
  vals.forEach((v, i) => {
    const cx = p.px + step * i + step / 2;
    const yy = scaleY(p, 100, v);
    const isHl = i === 2;
    s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(p.py + p.ph - yy).toFixed(1)}" fill="${isHl ? hl.m : GRAY_BAR}" stroke="${isHl ? hl.d : GRAY_BAR_DK}" stroke-width="0.8"/>`;
    s += errBar(cx, scaleY(p, 100, v + errs[i]), scaleY(p, 100, v - errs[i]));
    for (let k = 0; k < 6; k++) {
      const jx = cx + (rnd() - 0.5) * bw * 0.85;
      const jy = scaleY(p, 100, v + (rnd() - 0.5) * 22);
      s += `<circle cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="1.4" fill="${isHl ? hl.d : '#8A8F96'}" opacity="0.55"/>`;
    }
  });
  if (sig) {
    const cx1 = p.px + step * 1 + step / 2, cx2 = p.px + step * 2 + step / 2;
    s += sigBracket(cx1, cx2, scaleY(p, 100, 97), '**');
  }
  panels.push(s);
}

function drawGroupedBar(row, col, letter, title, main) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  const groups = ['G1', 'G2', 'G3', 'G4'];
  const a = [62, 78, 55, 84], b = [48, 60, 70, 58];
  const step = p.pw / 4, bw = step * 0.28;
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, groups, groups.map((_, i) => p.px + step * i + step / 2));
  s += xTitle(p, '分组');
  groups.forEach((_, i) => {
    const cx = p.px + step * i + step / 2;
    [[a[i], main.m, main.d], [b[i], GRAY_BAR, GRAY_BAR_DK]].forEach(([v, f, st], k) => {
      const xx = cx + (k === 0 ? -bw - 1.5 : 1.5);
      const yy = scaleY(p, 100, v);
      s += `<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(p.py + p.ph - yy).toFixed(1)}" fill="${f}" stroke="${st}" stroke-width="0.8"/>`;
      s += errBar(xx + bw / 2, scaleY(p, 100, v + 6), scaleY(p, 100, v - 6), 3.2);
    });
  });
  s += `<rect x="${p.px + p.pw - 66}" y="${p.py + 2}" width="7" height="7" fill="${main.m}" stroke="${main.d}" stroke-width="0.6"/>` +
    `<text x="${p.px + p.pw - 55}" y="${p.py + 8.5}" font-size="7.5" fill="${MUTE}">处理组</text>` +
    `<rect x="${p.px + p.pw - 66}" y="${p.py + 13}" width="7" height="7" fill="${GRAY_BAR}" stroke="${GRAY_BAR_DK}" stroke-width="0.6"/>` +
    `<text x="${p.px + p.pw - 55}" y="${p.py + 19.5}" font-size="7.5" fill="${MUTE}">对照</text>`;
  panels.push(s);
}

function drawViolin(row, col, letter, title, vc, seed) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  const rnd = mulberry32(seed);
  const groups = ['WT', 'Het', 'KO'];
  const mus = [38, 55, 72], sds = [10, 13, 9];
  const step = p.pw / 3;
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, groups, groups.map((_, i) => p.px + step * i + step / 2));
  s += xTitle(p, '基因型');
  groups.forEach((_, gi) => {
    const cx = p.px + step * gi + step / 2;
    const maxW = step * 0.36;
    const N = 26;
    const left = [], right = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const v = 14 + t * 78;
      const g = Math.exp(-((v - mus[gi]) ** 2) / (2 * sds[gi] ** 2));
      const bw2 = Math.max(0.06, g) * maxW + (rnd() - 0.5) * 1.2;
      const yy = scaleY(p, 100, v);
      left.push([cx - bw2, yy]); right.push([cx + bw2, yy]);
    }
    const d = 'M ' + left.map(pt => pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' L ')
      + ' L ' + right.reverse().map(pt => pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' L ') + ' Z';
    s += `<path d="${d}" fill="${vc.l}" fill-opacity="0.85" stroke="${vc.m}" stroke-width="1.1"/>`;
    const q1 = scaleY(p, 100, mus[gi] - sds[gi]), q3 = scaleY(p, 100, mus[gi] + sds[gi]);
    const med = scaleY(p, 100, mus[gi]);
    s += `<rect x="${(cx - 4).toFixed(1)}" y="${q3.toFixed(1)}" width="8" height="${(q1 - q3).toFixed(1)}" fill="#FFFFFF" stroke="${vc.d}" stroke-width="1"/>` +
      `<line x1="${cx}" y1="${med.toFixed(1)}" x2="${cx + 4}" y2="${med.toFixed(1)}" stroke="${vc.d}" stroke-width="1.4"/>` +
      `<line x1="${cx}" y1="${q3.toFixed(1)}" x2="${cx}" y2="${scaleY(p, 100, mus[gi] + sds[gi] * 1.7).toFixed(1)}" stroke="${vc.d}" stroke-width="1"/>` +
      `<line x1="${cx}" y1="${q1.toFixed(1)}" x2="${cx}" y2="${scaleY(p, 100, mus[gi] - sds[gi] * 1.7).toFixed(1)}" stroke="${vc.d}" stroke-width="1"/>`;
    for (let k = 0; k < 9; k++) {
      const jx = cx + (rnd() - 0.5) * maxW * 1.5;
      const jy = scaleY(p, 100, mus[gi] + (rnd() + rnd() - 1) * sds[gi] * 2);
      s += `<circle cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="1.3" fill="${vc.d}" opacity="0.5"/>`;
    }
  });
  panels.push(s);
}

function drawBox(row, col, letter, title, bc, seed) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  const rnd = mulberry32(seed);
  const labels = ['D0', 'D3', 'D7', 'D14'];
  const med = [42, 55, 48, 68], iqr = [9, 11, 8, 10];
  const step = p.pw / 4, bw = step * 0.4;
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, labels, labels.map((_, i) => p.px + step * i + step / 2));
  s += xTitle(p, '时间（天）');
  labels.forEach((_, i) => {
    const cx = p.px + step * i + step / 2;
    const q1 = scaleY(p, 100, med[i] - iqr[i]), q3 = scaleY(p, 100, med[i] + iqr[i]);
    const mm = scaleY(p, 100, med[i]);
    const wHi = scaleY(p, 100, med[i] + iqr[i] * 1.8), wLo = scaleY(p, 100, med[i] - iqr[i] * 1.8);
    s += `<line x1="${cx.toFixed(1)}" y1="${wHi.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${wLo.toFixed(1)}" stroke="${bc.d}" stroke-width="1"/>`;
    s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${q3.toFixed(1)}" width="${bw.toFixed(1)}" height="${(q1 - q3).toFixed(1)}" fill="${bc.l}" stroke="${bc.d}" stroke-width="1.1"/>`;
    s += `<line x1="${(cx - bw / 2).toFixed(1)}" y1="${mm.toFixed(1)}" x2="${(cx + bw / 2).toFixed(1)}" y2="${mm.toFixed(1)}" stroke="${bc.d}" stroke-width="1.6"/>`;
    for (let k = 0; k < 2; k++) {
      s += `<circle cx="${cx.toFixed(1)}" cy="${scaleY(p, 100, med[i] + (rnd() > 0.5 ? 1 : -1) * iqr[i] * (2 + rnd())).toFixed(1)}" r="1.2" fill="none" stroke="${bc.d}" stroke-width="0.8"/>`;
    }
  });
  panels.push(s);
}

function drawLines(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, ['0', '2', '4', '6', '8'], [0, 1, 2, 3, 4].map(i => p.px + (p.pw / 4) * i));
  s += xTitle(p, '时间（周）');
  const X = i => p.px + (p.pw / 4) * i;
  const series = [
    { c: C.rose, vs: [30, 44, 60, 72, 85], band: 7, dash: '', label: '处理组' },
    { c: C.blue, vs: [28, 34, 42, 50, 58], band: 5, dash: '', label: '对照组' },
    { c: '#9AA5AE', vs: [30, 31, 33, 32, 34], band: 0, dash: '3 3', label: '基线' },
  ];
  series.forEach(sr => {
    if (sr.band) {
      const up = sr.vs.map((v, i) => X(i).toFixed(1) + ' ' + scaleY(p, 100, v + sr.band).toFixed(1)).join(' L ');
      const dn = sr.vs.slice().reverse().map((v, i) => X(4 - i).toFixed(1) + ' ' + scaleY(p, 100, v - sr.band).toFixed(1)).join(' L ');
      s += `<path d="M ${up} L ${dn} Z" fill="${sr.c.l}" opacity="0.45"/>`;
    }
    const d = sr.vs.map((v, i) => (i ? 'L' : 'M') + ' ' + X(i).toFixed(1) + ' ' + scaleY(p, 100, v).toFixed(1)).join(' ');
    s += `<path d="${d}" fill="none" stroke="${sr.c.m}" stroke-width="1.8" ${sr.dash ? `stroke-dasharray="${sr.dash}"` : ''}/>`;
    const ex = X(4), ey = scaleY(p, 100, sr.vs[4]);
    s += `<text x="${(ex + 4).toFixed(1)}" y="${(ey + 2.5).toFixed(1)}" font-size="7.5" fill="${sr.c.d}">${sr.label}</text>`;
  });
  panels.push(s);
}

function drawKM(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  let s = panelHead(x, y, letter, title) + axes(p, 100, 4);
  s += xticks(p, ['0', '10', '20', '30'], [0, 1, 2, 3].map(i => p.px + (p.pw / 3) * i));
  s += xTitle(p, '时间（月）');
  const X = i => p.px + (p.pw * 0.86 / 3) * i;
  const curve = (dropPts) => {
    let v = 100; const segs = [];
    for (let i = 0; i <= 9; i++) {
      const xx = X(i / 3);
      if (dropPts.includes(i)) { const v2 = v - (14 + (i % 3) * 5); segs.push([xx, scaleY(p, 100, v)], [xx, scaleY(p, 100, v2)]); v = v2; }
      else segs.push([xx, scaleY(p, 100, v)]);
    }
    return segs;
  };
  [[curve([2, 5, 7, 9]), C.blue, '实验组'], [curve([3, 6, 8]), C.rose, '对照']].forEach(([segs, cc, lb]) => {
    const d = segs.map((pt, i) => (i ? 'L' : 'M') + ' ' + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' ');
    s += `<path d="${d}" fill="none" stroke="${cc.m}" stroke-width="1.8"/>`;
    s += `<text x="${(segs[segs.length - 1][0] + 3).toFixed(1)}" y="${(segs[segs.length - 1][1] + 2.5).toFixed(1)}" font-size="7.5" fill="${cc.d}">${lb}</text>`;
    segs.forEach((pt, i) => {
      if (i % 3 === 1) s += `<line x1="${(pt[0] - 2).toFixed(1)}" y1="${(pt[1] - 2).toFixed(1)}" x2="${(pt[0] + 2).toFixed(1)}" y2="${(pt[1] + 2).toFixed(1)}" stroke="${cc.d}" stroke-width="0.9"/>`;
    });
  });
  panels.push(s);
}

function drawHeatmapDiv(row, col, letter, title, seed) {
  const { x, y } = panelXY(row, col);
  const rowsN = 6, colsN = 7;
  const px0 = x + 46, py0 = y + TITLE_H + 16;
  const cw = (PW - 60) / colsN, chh = (CH - 46) / rowsN;
  const rnd = mulberry32(seed);
  const rowLab = ['A', 'B', 'C', 'D', 'E', 'F'];
  const colLab = ['1', '2', '3', '4', '5', '6', '7'];
  let s = panelHead(x, y, letter, title);
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < colsN; c++) {
      const base = Math.sin(r * 1.7 + seed) * 0.8 + (rnd() - 0.5) * 1.6;
      const v = Math.max(-2.2, Math.min(2.2, base));
      const fill = v >= 0 ? mix(DIVERGE_MID, DIVERGE_POS, v / 2.2) : mix(DIVERGE_MID, DIVERGE_NEG, -v / 2.2);
      s += `<rect x="${(px0 + c * cw).toFixed(1)}" y="${(py0 + r * chh).toFixed(1)}" width="${(cw - 2).toFixed(1)}" height="${(chh - 2).toFixed(1)}" fill="${fill}"/>`;
    }
  }
  rowLab.forEach((lb, r) => {
    s += `<text x="${(px0 - 5).toFixed(1)}" y="${(py0 + r * chh + chh / 2 + 2.6).toFixed(1)}" font-size="7.5" fill="${TICK}" text-anchor="end">${lb}</text>`;
  });
  colLab.forEach((lb, c) => {
    s += `<text x="${(px0 + c * cw + (cw - 2) / 2).toFixed(1)}" y="${(py0 + rowsN * chh + 9).toFixed(1)}" font-size="7.5" fill="${TICK}" text-anchor="middle">${lb}</text>`;
  });
  s += `<text x="${(px0 + colsN * cw / 2).toFixed(1)}" y="${(py0 + rowsN * chh + 21).toFixed(1)}" font-size="8" fill="${MUTE}" text-anchor="middle">样本 × 基因（z-score）</text>`;
  panels.push(s);
}

function drawHeatmapAnno(row, col, letter, title, seed) {
  const { x, y } = panelXY(row, col);
  const rowsN = 5, colsN = 5;
  const px0 = x + 50, py0 = y + TITLE_H + 16;
  const cw = (PW - 100) / colsN, chh = (CH - 46) / rowsN;
  const rnd = mulberry32(seed);
  let s = panelHead(x, y, letter, title);
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < colsN; c++) {
      const v = Math.max(-0.9, Math.min(2.1, Math.sin(r * 2.1 + c * 1.3 + seed) * 1.3 + (rnd() - 0.5)));
      const t = Math.max(0, Math.min(1, v / 2.1));
      const fill = v < 0 ? mix(SEQ_LO, DIVERGE_NEG, Math.min(1, -v)) : mix(SEQ_LO, SEQ_HI, t);
      const txtFill = t > 0.55 ? '#FFFFFF' : '#3A4A42';
      s += `<rect x="${(px0 + c * cw).toFixed(1)}" y="${(py0 + r * chh).toFixed(1)}" width="${(cw - 2).toFixed(1)}" height="${(chh - 2).toFixed(1)}" fill="${fill}"/>`;
      s += `<text x="${(px0 + c * cw + (cw - 2) / 2).toFixed(1)}" y="${(py0 + r * chh + chh / 2 + 2.6).toFixed(1)}" font-size="7" fill="${txtFill}" text-anchor="middle" font-weight="600">${v.toFixed(1)}</text>`;
    }
  }
  const bx = px0 + colsN * cw + 12, by = py0, bh = chh * rowsN, bw2 = 8;
  const grad = `<defs><linearGradient id="gseq${letter}" x1="0" y1="1" x2="0" y2="0">` +
    `<stop offset="0" stop-color="${SEQ_LO}"/><stop offset="1" stop-color="${SEQ_HI}"/></linearGradient></defs>`;
  s += grad + `<rect x="${bx}" y="${by}" width="${bw2}" height="${bh}" fill="url(#gseq${letter})" stroke="#CCCCCC" stroke-width="0.5"/>`;
  [0, 1, 2].forEach(tick => {
    const yy = by + bh - (bh * tick / 2);
    s += `<text x="${bx + bw2 + 3}" y="${(yy + 2.5).toFixed(1)}" font-size="7" fill="${TICK}">${tick}</text>`;
  });
  s += `<text x="${(px0 + colsN * cw / 2).toFixed(1)}" y="${(py0 + rowsN * chh + 21).toFixed(1)}" font-size="8" fill="${MUTE}" text-anchor="middle">表达量（log₂CPM）</text>`;
  panels.push(s);
}

function drawVolcano(row, col, letter, title, seed) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  const rnd = mulberry32(seed);
  let s = panelHead(x, y, letter, title);
  s += `<line x1="${p.px}" y1="${p.py}" x2="${p.px}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  s += `<line x1="${p.px}" y1="${(p.py + p.ph).toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  const cxm = p.px + p.pw / 2;
  const thrY = scaleY(p, 5, 1.3);
  s += `<line x1="${p.px}" y1="${thrY.toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${thrY.toFixed(1)}" stroke="#C9C9C9" stroke-width="0.8" stroke-dasharray="3 3"/>`;
  [cxm - p.pw * 0.22, cxm + p.pw * 0.22].forEach(tx => {
    s += `<line x1="${tx.toFixed(1)}" y1="${p.py}" x2="${tx.toFixed(1)}" y2="${(p.py + p.ph).toFixed(1)}" stroke="#C9C9C9" stroke-width="0.8" stroke-dasharray="3 3"/>`;
  });
  const N = 90;
  for (let i = 0; i < N; i++) {
    const u = rnd();
    let dx, dy;
    if (u < 0.72) { dx = (rnd() - 0.5) * p.pw * 0.7; dy = 0.15 + rnd() * 0.95; }
    else { const side = rnd() < 0.5 ? -1 : 1; dx = side * (p.pw * 0.24 + rnd() * p.pw * 0.2); dy = 1.0 + Math.sqrt(rnd()) * 3.9; }
    const sig = Math.abs(dx / p.pw) > 0.23 && dy > 1.3;
    const fill = sig ? (dx < 0 ? C.blue.d : C.rose.d) : '#C4C9CE';
    s += `<circle cx="${(cxm + dx).toFixed(1)}" cy="${scaleY(p, 5, dy).toFixed(1)}" r="${sig ? 2 : 1.5}" fill="${fill}" opacity="${sig ? 0.9 : 0.55}"/>`;
  }
  s += `<text x="${cxm}" y="${p.py + p.ph + 12}" font-size="8" fill="${TICK}" text-anchor="middle">log₂ 倍数变化</text>`;
  s += `<text x="${p.px - 5}" y="${p.py + 8}" font-size="8" fill="${TICK}" text-anchor="end">-log₁₀P</text>`;
  s += `<text x="${(p.px + p.pw - 4).toFixed(1)}" y="${p.py + 8}" font-size="7.5" fill="${C.rose.d}" text-anchor="end">上调</text>`;
  panels.push(s);
}

function drawForest(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y);
  let s = panelHead(x, y, letter, title);
  const rows = [
    { n: 'Stage I', es: 0.82, lo: 0.55, hi: 1.21 },
    { n: 'Stage II', es: 1.34, lo: 1.02, hi: 1.76 },
    { n: 'Stage III', es: 1.86, lo: 1.38, hi: 2.51 },
    { n: 'Stage IV', es: 2.42, lo: 1.70, hi: 3.44 },
    { n: '年龄 ≥ 60', es: 1.21, lo: 0.94, hi: 1.56 },
  ];
  const X = v => p.px + ((v - 0.3) / (3.6 - 0.3)) * p.pw * 0.58;
  const valX = p.px + p.pw - 2;   // 右对齐的 HR 数值列
  const y0 = p.py + 12, dy = (CH - 52) / rows.length;
  s += `<line x1="${X(1).toFixed(1)}" y1="${y0 - 6}" x2="${X(1).toFixed(1)}" y2="${y0 + dy * rows.length + 6}" stroke="#B5B5B5" stroke-width="0.9" stroke-dasharray="3 3"/>`;
  s += `<text x="${X(1).toFixed(1)}" y="${y0 - 9}" font-size="7" fill="${TICK}" text-anchor="middle">HR=1</text>`;
  rows.forEach((r, i) => {
    const yy = y0 + dy * i + dy / 2;
    const wt = 1 - Math.abs(r.hi - r.lo) / 5;
    const sz = 3 + wt * 3.5;
    s += `<text x="${p.px - 4}" y="${yy + 2.6}" font-size="8" fill="${MUTE}" text-anchor="end">${r.n}</text>`;
    s += `<line x1="${X(r.lo).toFixed(1)}" y1="${yy.toFixed(1)}" x2="${X(r.hi).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${C.teal.d}" stroke-width="1.2"/>`;
    s += `<line x1="${X(r.lo).toFixed(1)}" y1="${(yy - 2.5).toFixed(1)}" x2="${X(r.lo).toFixed(1)}" y2="${(yy + 2.5).toFixed(1)}" stroke="${C.teal.d}" stroke-width="1.2"/>`;
    s += `<line x1="${X(r.hi).toFixed(1)}" y1="${(yy - 2.5).toFixed(1)}" x2="${X(r.hi).toFixed(1)}" y2="${(yy + 2.5).toFixed(1)}" stroke="${C.teal.d}" stroke-width="1.2"/>`;
    s += `<rect x="${(X(r.es) - sz / 2).toFixed(1)}" y="${(yy - sz / 2).toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${C.teal.m}" stroke="${C.teal.d}" stroke-width="0.8" transform="rotate(45 ${X(r.es).toFixed(1)} ${yy.toFixed(1)})"/>`;
    s += `<text x="${valX.toFixed(1)}" y="${yy + 2.6}" text-anchor="end" font-size="7.5" fill="${TICK}">${r.es.toFixed(2)} (${r.lo.toFixed(2)}–${r.hi.toFixed(2)})</text>`;
  });
  const py2 = y0 + dy * rows.length + 10;
  const pd = { es: 1.52, lo: 1.24, hi: 1.87 };
  s += `<path d="M ${X(pd.es).toFixed(1)} ${(py2 - 5).toFixed(1)} L ${X(pd.hi).toFixed(1)} ${py2.toFixed(1)} L ${X(pd.es).toFixed(1)} ${(py2 + 5).toFixed(1)} L ${X(pd.lo).toFixed(1)} ${py2.toFixed(1)} Z" fill="${C.rose.m}" stroke="${C.rose.d}" stroke-width="0.8"/>`;
  s += `<text x="${p.px - 4}" y="${py2 + 3}" font-size="8" fill="${INK}" text-anchor="end" font-weight="600">合并</text>`;
  s += `<text x="${valX.toFixed(1)}" y="${py2 + 3}" text-anchor="end" font-size="7.5" fill="${TICK}">${pd.es.toFixed(2)} (${pd.lo.toFixed(2)}–${pd.hi.toFixed(2)})</text>`;
  panels.push(s);
}

// ══ 组装 12 格 ════════════════════════════════════════════
drawHighlightBar(0, 0, 'a', '剂量响应 · 高亮柱 + 原始点', C.rose, 11, true);
drawGroupedBar(0, 1, 'b', '分组柱状图', C.blue);
drawHighlightBar(0, 2, 'c', '剂量响应 · 高亮 + 显著性', C.green, 13, true);
drawGroupedBar(0, 3, 'd', '分组柱状图 · 紫罗兰', C.violet);

drawViolin(1, 0, 'e', '小提琴图 + 内嵌箱线', C.green, 21);
drawBox(1, 1, 'f', '箱线图', C.slate, 22);
drawLines(1, 2, 'g', '多折线 + 置信带');
drawKM(1, 3, 'h', '生存曲线（KM）');

drawHeatmapDiv(2, 0, 'i', '热图 · z-score 发散', 31);
drawHeatmapAnno(2, 1, 'j', '热图 · 数值注释 + 色标', 32);
drawVolcano(2, 2, 'k', '火山图', 33);
drawForest(2, 3, 'l', '森林图（HR 合并）');

// ── 输出 ─────────────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text x="${MX}" y="44" font-size="22" font-weight="800" fill="${INK}">Chart atlas | 出版级模板图鉴</text>
<text x="${MX}" y="68" font-size="12.5" fill="${MUTE}">柱状图 / 分布 / 时序 / 矩阵 —— 每一格都是 FigureForge 可直接生成的出版级样式</text>
<text x="${W - MX}" y="44" font-size="11" fill="${MUTE}" text-anchor="end">22 模板 · 16 色卡 · SVG/PDF/PNG/TIFF/PPTX</text>
${panels.join('\n')}
</svg>`;
const out = path.join(__dirname, '..', '..', 'assets', 'showcase.svg');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log('written', out, svg.length, 'bytes');
