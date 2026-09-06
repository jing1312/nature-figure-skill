#!/usr/bin/env node
/**
 * build-showcase-pro.js — 生成 assets/showcase-pro.svg（Chart atlas Pro）
 *
 * 6 种复杂图型 × 图鉴排版（与 showcase.svg 同风格）：
 *   雷达图 / GO 富集气泡图 / 曼哈顿图 / 山脊图 / 桑基图 / 甘特时间轴
 * 纯手绘矢量。`node build-showcase-pro.js` 重跑。
 */
'use strict';
const fs = require('fs');
const path = require('path');

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

const INK = '#1A1A1A', MUTE = '#6B6B6B', TICK = '#8A8A8A', AXIS = '#B9B9B9', GRID = '#EBEBEB';
const FONT = "Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";
const C = {
  rose:  { m: '#D98A94', d: '#C06B76', l: '#F2C9CD' },
  blue:  { m: '#7FA6C9', d: '#5F87AD', l: '#C2D5E4' },
  green: { m: '#7FAF8E', d: '#5E9270', l: '#C4DAC9' },
  violet:{ m: '#9C8BC4', d: '#7E6AA9', l: '#D5CCE6' },
  teal:  { m: '#6B9E9C', d: '#4F8280', l: '#C0D8D7' },
  slate: { m: '#8CA0B3', d: '#69809A', l: '#CCD6DF' },
};

// 版面：3 列 × 2 行
const W = 1120, MX = 34, COLS = 3, GAPX = 30, GAPY = 36;
const PW = (W - MX * 2 - GAPX * (COLS - 1)) / COLS;   // ≈ 330
const HEAD_H = 96, TITLE_H = 22, CH = 300, ROW_H = TITLE_H + CH + GAPY;
const H = HEAD_H + 2 * ROW_H + 10;

const panels = [];
function panelXY(row, col) {
  return { x: MX + col * (PW + GAPX), y: HEAD_H + row * ROW_H };
}
function plotArea(x, y, padL = 36) {
  return { px: x + padL, py: y + TITLE_H + 12, pw: PW - padL - 14, ph: CH - 42 };
}
function panelHead(x, y, letter, title) {
  return `<text x="${x}" y="${y + 14}" font-size="13" font-weight="700" fill="${INK}">${letter}</text>` +
    `<text x="${(x + PW / 2 + 8).toFixed(1)}" y="${y + 13}" font-size="10.5" fill="${MUTE}" text-anchor="middle">${esc(title)}</text>`;
}

// ══ a 雷达图 ═════════════════════════════════════════════
function drawRadar(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 20);
  const cx = p.px + p.pw / 2, cy = p.py + p.ph / 2 + 6;
  const R = Math.min(p.pw, p.ph) / 2 - 34;
  const dims = ['干性', '增殖', '侵袭', '凋亡', '代谢', '免疫'];
  const N = dims.length;
  const pt = (i, r) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / N;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  };
  let s = panelHead(x, y, letter, title);
  // 网格环
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const pts = dims.map((_, i) => pt(i, R * f).map(v => v.toFixed(1)).join(',')).join(' ');
    s += `<polygon points="${pts}" fill="${f === 1 ? '#FBFBFB' : 'none'}" stroke="${GRID}" stroke-width="0.9"/>`;
  });
  dims.forEach((_, i) => {
    const [ax, ay] = pt(i, R);
    s += `<line x1="${cx}" y1="${cy}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="${GRID}" stroke-width="0.9"/>`;
    const [lx, ly] = pt(i, R + 14);
    s += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" font-size="8.5" fill="${MUTE}" text-anchor="middle">${dims[i]}</text>`;
  });
  const series = [
    { c: C.rose, vs: [82, 62, 74, 50, 66, 78], lb: '肿瘤组' },
    { c: C.blue, vs: [58, 76, 48, 72, 44, 56], lb: '对照' },
  ];
  series.forEach(sr => {
    const pts = sr.vs.map((v, i) => pt(i, (R * v) / 100));
    const poly = pts.map(pt2 => pt2.map(v => v.toFixed(1)).join(',')).join(' ');
    s += `<polygon points="${poly}" fill="${sr.c.m}" fill-opacity="0.22" stroke="${sr.c.d}" stroke-width="1.6"/>`;
    pts.forEach(pt2 => {
      s += `<circle cx="${pt2[0].toFixed(1)}" cy="${pt2[1].toFixed(1)}" r="2" fill="${sr.c.d}"/>`;
    });
  });
  s += `<rect x="${p.px + 6}" y="${p.py + 4}" width="7" height="7" fill="${C.rose.m}" fill-opacity="0.35" stroke="${C.rose.d}"/>` +
    `<text x="${p.px + 17}" y="${p.py + 10.5}" font-size="7.5" fill="${MUTE}">肿瘤组</text>` +
    `<rect x="${p.px + 6}" y="${p.py + 15}" width="7" height="7" fill="${C.blue.m}" fill-opacity="0.35" stroke="${C.blue.d}"/>` +
    `<text x="${p.px + 17}" y="${p.py + 21.5}" font-size="7.5" fill="${MUTE}">对照</text>`;
  s += `<text x="${cx}" y="${p.py + p.ph + 8}" font-size="8" fill="${MUTE}" text-anchor="middle">六个维度标准化得分（0–100）</text>`;
  panels.push(s);
}

// ══ b GO 富集气泡图 ═══════════════════════════════════════
function drawBubble(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 74);
  let s = panelHead(x, y, letter, title);
  const terms = [
    { n: '金属离子响应', p2: 8.6, g: 42, f: 5.2 },
    { n: '氧化应激反应', p2: 7.2, g: 58, f: 4.1 },
    { n: '凋亡过程调控', p2: 6.4, g: 35, f: 3.4 },
    { n: '线粒体电子传递', p2: 5.8, g: 28, f: 2.9 },
    { n: '内质网应激', p2: 5.1, g: 22, f: 2.5 },
    { n: '离子通道活性', p2: 4.3, g: 18, f: 1.8 },
    { n: '心肌收缩调节', p2: 3.6, g: 15, f: 1.4 },
    { n: '脂质代谢过程', p2: 2.8, g: 12, f: 1.1 },
  ];
  const X = v => p.px + ((v - 2) / (9 - 2)) * p.pw * 0.94;
  const Y = i => p.py + 46 + i * ((p.ph - 68) / (terms.length - 1));
  const rOf = g => 3 + (g - 10) / 50 * 7;
  // x 网格
  [2, 4, 6, 8].forEach(v => {
    const xx = X(v);
    s += `<line x1="${xx.toFixed(1)}" y1="${p.py}" x2="${xx.toFixed(1)}" y2="${(p.py + p.ph - 24).toFixed(1)}" stroke="${GRID}" stroke-width="0.8"/>` +
      `<text x="${xx.toFixed(1)}" y="${p.py + p.ph - 12}" font-size="8" fill="${TICK}" text-anchor="middle">${v}</text>`;
  });
  terms.forEach((t, i) => {
    const yy = Y(i);
    const col2 = mix(C.blue.m, C.rose.m, Math.min(1, (t.f - 1) / 4.2));
    s += `<text x="${p.px - 6}" y="${yy + 2.6}" font-size="7.5" fill="${MUTE}" text-anchor="end">${t.n}</text>`;
    s += `<circle cx="${X(t.p2).toFixed(1)}" cy="${yy.toFixed(1)}" r="${rOf(t.g).toFixed(1)}" fill="${col2}" fill-opacity="0.75" stroke="${mix(C.blue.d, C.rose.d, Math.min(1, (t.f - 1) / 4.2))}" stroke-width="1"/>`;
    s += `<text x="${(X(t.p2) + rOf(t.g) + 4).toFixed(1)}" y="${yy + 2.6}" font-size="7" fill="${TICK}">${t.g}</text>`;
  });
  s += `<line x1="${p.px}" y1="${(p.py + p.ph - 24).toFixed(1)}" x2="${(p.px + p.pw * 0.94).toFixed(1)}" y2="${(p.py + p.ph - 24).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  s += `<text x="${(p.px + p.pw * 0.47).toFixed(1)}" y="${p.py + p.ph + 2}" font-size="8.5" fill="${MUTE}" text-anchor="middle">-log₁₀（P 值）</text>`;
  // 尺寸图例（左上，数据在右下方向不会撞）
  [12, 35, 58].forEach((g, i) => {
    s += `<circle cx="${p.px + 10 + i * 15}" cy="${p.py + 6}" r="${rOf(g).toFixed(1)}" fill="${C.slate.l}" stroke="${C.slate.d}" stroke-width="0.8"/>`;
  });
  s += `<text x="${p.px + 4}" y="${p.py + 26}" font-size="7" fill="${TICK}">基因数 12 / 35 / 58</text>`;
  s += `<text x="${p.px + 4}" y="${p.py + 37}" font-size="7" fill="${C.rose.d}">颜色越暖 = 富集倍数越高</text>`;
  panels.push(s);
}

// ══ c 曼哈顿图 ═══════════════════════════════════════════
function drawManhattan(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 40);
  const rnd = mulberry32(77);
  let s = panelHead(x, y, letter, title);
  const vmax = 9;
  const Y = v => p.py + p.ph - (v / vmax) * p.ph;
  [0, 3, 6, 9].forEach(v => {
    const yy = Y(v);
    if (v > 0) s += `<line x1="${p.px}" y1="${yy.toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${GRID}" stroke-width="0.8"/>`;
    s += `<text x="${p.px - 5}" y="${(yy + 2.6).toFixed(1)}" font-size="8" fill="${TICK}" text-anchor="end">${v}</text>`;
  });
  // 显著性与建议线
  s += `<line x1="${p.px}" y1="${Y(6.5).toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${Y(6.5).toFixed(1)}" stroke="#C9C9C9" stroke-width="0.9" stroke-dasharray="4 3"/>`;
  s += `<text x="${(p.px + p.pw - 3).toFixed(1)}" y="${(Y(6.5) - 3).toFixed(1)}" font-size="7" fill="${TICK}" text-anchor="end">显著阈值</text>`;
  let ox = p.px + 2;
  const totalW = p.pw - 8;
  const peaks = { 7: 8.2, 12: 7.1 };
  for (let c = 1; c <= 22; c++) {
    const n = 16 + (c % 4) * 5;
    const cw = (totalW / 22);
    for (let k = 0; k < n; k++) {
      let v = -Math.log10(rnd()) * 1.9;
      if (peaks[c] && k === Math.floor(n / 2)) v = peaks[c] - rnd() * 0.35;
      v = Math.min(vmax - 0.1, v);
      const xx = ox + (k + 0.5) * (cw / n);
      const isPeak = peaks[c] && k === Math.floor(n / 2) && v > 6.8;
      if (isPeak) {
        s += `<rect x="${(xx - 2.6).toFixed(1)}" y="${(Y(v) - 2.6).toFixed(1)}" width="5.2" height="5.2" fill="${C.rose.d}" transform="rotate(45 ${xx.toFixed(1)} ${Y(v).toFixed(1)})"/>`;
        s += `<text x="${xx.toFixed(1)}" y="${(Y(v) - 6).toFixed(1)}" font-size="7" fill="${C.rose.d}" text-anchor="middle">rs1294${40 + c}</text>`;
      } else {
        s += `<circle cx="${xx.toFixed(1)}" cy="${Y(v).toFixed(1)}" r="1.3" fill="${c % 2 ? '#8CA0B3' : '#7FA6C9'}" opacity="0.85"/>`;
      }
    }
    ox += cw;
  }
  s += `<line x1="${p.px}" y1="${p.py}" x2="${p.px}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  s += `<line x1="${p.px}" y1="${(p.py + p.ph).toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  [1, 6, 12, 18, 22].forEach(c => {
    const xx = p.px + 2 + (totalW / 22) * (c - 0.5);
    s += `<text x="${xx.toFixed(1)}" y="${(p.py + p.ph + 12).toFixed(1)}" font-size="8" fill="${TICK}" text-anchor="middle">${c}</text>`;
  });
  s += `<text x="${(p.px + p.pw / 2).toFixed(1)}" y="${(p.py + p.ph + 24).toFixed(1)}" font-size="8.5" fill="${MUTE}" text-anchor="middle">染色体</text>`;
  s += `<text x="${p.px - 12}" y="${p.py + 8}" font-size="8.5" fill="${MUTE}" text-anchor="middle" transform="rotate(-90 ${p.px - 12} ${p.py + 8})">-log₁₀（P 值）</text>`;
  panels.push(s);
}

// ══ d 山脊图 ═════════════════════════════════════════════
function drawRidgeline(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 44);
  let s = panelHead(x, y, letter, title);
  const groups = ['Wk 0', 'Wk 2', 'Wk 4', 'Wk 6', 'Wk 8'];
  const rowH = (p.ph - 16) / groups.length;
  const baseY = i => p.py + 8 + i * rowH + rowH - 10;
  // 从最下层往上画，上层覆盖下层
  for (let i = groups.length - 1; i >= 0; i--) {
    const mu = 0.38 + i * 0.115, sd = 0.11 - i * 0.008;
    const col2 = mix(C.slate.m, C.blue.d, i / (groups.length - 1));
    let d = '';
    for (let k = 0; k <= 60; k++) {
      const t = k / 60;
      const xx = p.px + t * p.pw;
      const h = Math.exp(-(((t - mu) ** 2) / (2 * sd * sd))) * (rowH * 0.92);
      d += (k ? 'L' : 'M') + ' ' + xx.toFixed(1) + ' ' + (baseY(i) - h).toFixed(1) + ' ';
    }
    d += 'L ' + (p.px + p.pw).toFixed(1) + ' ' + baseY(i).toFixed(1) + ' L ' + p.px.toFixed(1) + ' ' + baseY(i).toFixed(1) + ' Z';
    s += `<path d="${d}" fill="${mix('#F2F4F6', col2, 0.55)}" stroke="${col2}" stroke-width="1.1"/>`;
    s += `<text x="${p.px - 6}" y="${(baseY(i) - 2).toFixed(1)}" font-size="7.5" fill="${MUTE}" text-anchor="end">${groups[i]}</text>`;
  }
  s += `<line x1="${p.px}" y1="${(p.py + p.ph).toFixed(1)}" x2="${(p.px + p.pw).toFixed(1)}" y2="${(p.py + p.ph).toFixed(1)}" stroke="${AXIS}" stroke-width="1"/>`;
  s += `<text x="${(p.px + p.pw / 2).toFixed(1)}" y="${(p.py + p.ph + 14).toFixed(1)}" font-size="8.5" fill="${MUTE}" text-anchor="middle">生物标志物水平（标准化）→ 随周次右移升高</text>`;
  panels.push(s);
}

// ══ e 桑基图 ═════════════════════════════════════════════
function drawSankey(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 24);
  let s = panelHead(x, y, letter, title);
  const k = 1.15;                       // px / %
  const nx0 = p.px + 34, nx1 = p.px + p.pw * 0.5, nx2 = p.px + p.pw - 40;
  const nw = 9;
  // 节点
  const A = { yy: p.py + 36, h: 100 * k };
  const B1 = { yy: p.py + 24, h: 70 * k };   // 应答
  const B2 = { yy: B1.yy + B1.h + 18, h: 30 * k }; // 无应答
  const C1 = { yy: p.py + 16, h: 40 * k };   // CR
  const C2 = { yy: C1.yy + C1.h + 12, h: 30 * k }; // PR
  const C3 = { yy: C2.yy + C2.h + 12, h: 30 * k }; // PD
  const node = (nx, nd, cc, lb, lp) => {
    let t = `<rect x="${nx}" y="${nd.yy.toFixed(1)}" width="${nw}" height="${nd.h.toFixed(1)}" fill="${cc.d}" stroke="none"/>`;
    t += `<text x="${nx + nw / 2}" y="${(nd.yy + nd.h / 2 + 2.6).toFixed(1)}" font-size="7.5" fill="#FFFFFF" text-anchor="middle" font-weight="600">${lb}</text>`;
    if (lp) t += `<text x="${(nx + nw + 4).toFixed(1)}" y="${(nd.yy + nd.h / 2 + 2.6).toFixed(1)}" font-size="7.5" fill="${MUTE}">${lp}</text>`;
    return t;
  };
  // 缎带
  const ribbon = (x0, y0, x1, y1, w, cc) => {
    const mx = (x0 + x1) / 2;
    return `<path d="M ${x0} ${y0.toFixed(1)} C ${mx} ${y0.toFixed(1)}, ${mx} ${y1.toFixed(1)}, ${x1} ${y1.toFixed(1)} L ${x1} ${(y1 + w).toFixed(1)} C ${mx} ${(y1 + w).toFixed(1)}, ${mx} ${(y0 + w).toFixed(1)}, ${x0} ${(y0 + w).toFixed(1)} Z" fill="${cc.m}" fill-opacity="0.4" stroke="none"/>`;
  };
  let sy = A.yy;
  s += ribbon(nx0 + nw, sy, nx1, B1.yy, B1.h, C.rose); sy += 70 * k;
  s += ribbon(nx0 + nw, sy, nx1, B2.yy, B2.h, C.slate);
  let ty = B1.yy;
  s += ribbon(nx1 + nw, ty, nx2, C1.yy, C1.h, C.green); ty += 40 * k;
  s += ribbon(nx1 + nw, ty, nx2, C2.yy, C2.h, C.blue);
  s += ribbon(nx1 + nw, B2.yy, nx2, C3.yy, C3.h, C.slate);
  s += node(nx0, A, C.slate, '', '100%');
  s += node(nx1, B1, C.rose, '应答', '70%');
  s += node(nx1, B2, C.slate, '无应答', '30%');
  s += node(nx2, C1, C.green, 'CR', '40%');
  s += node(nx2, C2, C.blue, 'PR', '30%');
  s += node(nx2, C3, C.slate, 'PD', '30%');
  [['给药前', nx0 + nw / 2], ['第 4 周', nx1 + nw / 2], ['第 12 周', nx2 + nw / 2]].forEach(([lb, xx]) => {
    s += `<text x="${xx.toFixed(1)}" y="${p.py + 12}" font-size="8.5" fill="${MUTE}" text-anchor="middle">${lb}</text>`;
  });
  panels.push(s);
}

// ══ f 甘特时间轴 ═════════════════════════════════════════
function drawGantt(row, col, letter, title) {
  const { x, y } = panelXY(row, col);
  const p = plotArea(x, y, 70);
  let s = panelHead(x, y, letter, title);
  const months = ['9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  const X = m => p.px + (m / (months.length - 1 + 0.35)) * p.pw * (months.length - 0.65) / months.length;
  const xw = p.pw / (months.length - 1 + 0.35);
  const Xm = m => p.px + m * xw;
  const tasks = [
    { n: '方案设计', s: 0, e: 1.5, c: C.rose },
    { n: '入组给药', s: 1, e: 3.5, c: C.blue },
    { n: '随访采样', s: 2, e: 5.5, c: C.green },
    { n: '测序建库', s: 3.5, e: 5, c: C.violet },
    { n: '生信分析', s: 4.5, e: 6, c: C.teal },
    { n: '论文撰写', s: 5.5, e: 7.2, c: C.slate },
  ];
  const rowH = (p.ph - 26) / tasks.length;
  // 月份网格
  months.forEach((m, i) => {
    const xx = Xm(i);
    s += `<line x1="${xx.toFixed(1)}" y1="${p.py}" x2="${xx.toFixed(1)}" y2="${(p.py + p.ph - 18).toFixed(1)}" stroke="${GRID}" stroke-width="0.8"/>`;
    s += `<text x="${xx.toFixed(1)}" y="${(p.py + p.ph - 6).toFixed(1)}" font-size="8" fill="${TICK}" text-anchor="middle">${m}</text>`;
  });
  tasks.forEach((t, i) => {
    const yy = p.py + 6 + i * rowH + rowH * 0.22;
    const hh = rowH * 0.5;
    s += `<text x="${p.px - 6}" y="${(yy + hh / 2 + 2.6).toFixed(1)}" font-size="7.5" fill="${MUTE}" text-anchor="end">${t.n}</text>`;
    s += `<rect x="${Xm(t.s).toFixed(1)}" y="${yy.toFixed(1)}" width="${(Xm(t.e) - Xm(t.s)).toFixed(1)}" height="${hh.toFixed(1)}" rx="3" fill="${t.c.m}" fill-opacity="0.8" stroke="${t.c.d}" stroke-width="0.8"/>`;
  });
  // 里程碑 + 今天线
  const mX = Xm(3.5), mY = p.py + 6 + 3 * rowH + rowH * 0.47;
  s += `<path d="M ${mX.toFixed(1)} ${(mY - 6).toFixed(1)} L ${(mX + 5).toFixed(1)} ${mY.toFixed(1)} L ${mX.toFixed(1)} ${(mY + 6).toFixed(1)} L ${(mX - 5).toFixed(1)} ${mY.toFixed(1)} Z" fill="${C.rose.d}"/>`;
  s += `<text x="${mX.toFixed(1)}" y="${(mY - 9).toFixed(1)}" font-size="7" fill="${C.rose.d}" text-anchor="middle">中期分析</text>`;
  const tX = Xm(4.3);
  s += `<line x1="${tX.toFixed(1)}" y1="${p.py - 2}" x2="${tX.toFixed(1)}" y2="${(p.py + p.ph - 18).toFixed(1)}" stroke="${C.rose.d}" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<text x="${tX.toFixed(1)}" y="${p.py - 6}" font-size="7" fill="${C.rose.d}" text-anchor="middle">今天</text>`;
  panels.push(s);
}

// ══ 组装 ═════════════════════════════════════════════════
drawRadar(0, 0, 'a', '雷达图 · 多维比较');
drawBubble(0, 1, 'b', 'GO 富集气泡图');
drawManhattan(0, 2, 'c', '曼哈顿图（GWAS）');
drawRidgeline(1, 0, 'd', '山脊图 · 纵向分布');
drawSankey(1, 1, 'e', '桑基图 · 队列流向');
drawGantt(1, 2, 'f', '甘特图 · 项目时间轴');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text x="${MX}" y="44" font-size="22" font-weight="800" fill="${INK}">Chart atlas Pro | 复杂图形版</text>
<text x="${MX}" y="68" font-size="12.5" fill="${MUTE}">雷达 / 气泡 / 曼哈顿 / 山脊 / 桑基 / 甘特 —— 组学、队列与项目管理级别的图形，全部矢量手绘</text>
<text x="${W - MX}" y="44" font-size="11" fill="${MUTE}" text-anchor="end">16 色卡 · SVG/PDF/PNG/TIFF/PPTX</text>
${panels.join('\n')}
</svg>`;
const out = path.join(__dirname, '..', '..', 'assets', 'showcase-pro.svg');
fs.writeFileSync(out, svg);
console.log('written', out, svg.length, 'bytes');
