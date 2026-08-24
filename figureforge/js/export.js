/**
 * FigureForge — Export Functions
 *
 * - Dialog with format (SVG / PNG / TIFF / PPTX / JSON) and resolution
 *   presets: 1x / 2x / 4x / 300 dpi / 600 dpi (dpi computed from mm size)
 * - TIFF: baseline RGB encoder written by hand (browsers cannot encode TIFF)
 * - PPTX: single-slide deck via pptxgenjs loaded from CDN on demand
 * - Save / Load project JSON, copy SVG to clipboard
 */
const Export = (function () {

  const EDITOR_ATTRS = ['data-edit', 'data-selected', 'data-role'];

  const FORMATS = [
    { key: 'svg', label: 'SVG', hint: '矢量图，可继续编辑 / 期刊投稿' },
    { key: 'png', label: 'PNG', hint: '位图，支持透明背景' },
    { key: 'tiff', label: 'TIFF', hint: '出版级位图（多数期刊要求）' },
    { key: 'pptx', label: 'PPTX', hint: '插入 PowerPoint 幻灯片' },
    { key: 'json', label: '项目', hint: '保存为 .json 项目文件，可再编辑' },
  ];
  const SCALES = [
    { key: '1x', label: '1×', scale: 1 },
    { key: '2x', label: '2×', scale: 2 },
    { key: '4x', label: '4×', scale: 4 },
    { key: 'w1280', label: '宽 1280px', targetW: 1280 },
    { key: 'w1920', label: '宽 1920px', targetW: 1920 },
    { key: '300dpi', label: '300 dpi (印刷)', dpi: 300 },
    { key: '600dpi', label: '600 dpi (印刷)', dpi: 600 },
  ];

  function cleanSVG(svgEl) {
    const clone = svgEl.cloneNode(true);
    clone.querySelectorAll('*').forEach(el => {
      EDITOR_ATTRS.forEach(attr => el.removeAttribute(attr));
      if (el.getAttribute('style') === '') el.removeAttribute('style');
    });
    EDITOR_ATTRS.forEach(attr => clone.removeAttribute(attr));
    if (clone.getAttribute('style') === '') clone.removeAttribute('style');
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    return new XMLSerializer().serializeToString(clone);
  }

  function viewBoxSize(svgEl) {
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
      const p = vb.split(/[\s,]+/).map(Number);
      if (p.length === 4) return { w: p[2], h: p[3] };
    }
    return { w: parseFloat(svgEl.getAttribute('width')) || 400, h: parseFloat(svgEl.getAttribute('height')) || 280 };
  }

  function mmSize() {
    const w = parseFloat(document.getElementById('global-width')?.value) || 183;
    const h = parseFloat(document.getElementById('global-height')?.value) || 120;
    return { w, h };
  }

  function scaleFor(sel, svgEl) {
    const s = SCALES.find(x => x.key === sel);
    if (!s) return 2;
    if (s.scale) return s.scale;
    const vb = viewBoxSize(svgEl);
    if (s.targetW) return Math.max(0.1, s.targetW / vb.w);
    const mm = mmSize();
    const pxW = (mm.w / 25.4) * s.dpi;
    return Math.max(0.1, pxW / vb.w);
  }

  // Render SVG string to a canvas at the given scale. cb(canvas).
  function renderToCanvas(svgEl, scale, background, cb) {
    const svgStr = cleanSVG(svgEl);
    const vb = viewBoxSize(svgEl);
    const canvas = document.createElement('canvas');
    const maxPx = 12000;
    canvas.width = Math.min(maxPx, Math.round(vb.w * scale));
    canvas.height = Math.min(maxPx, Math.round(vb.h * scale * (canvas.width / (vb.w * scale))));
    const ctx = canvas.getContext('2d');
    if (background && background !== 'transparent') {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      cb(canvas);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      console.error('[FigureForge] SVG rasterization failed, markup head:', svgStr.slice(0, 400));
      toast('❌ SVG 渲染失败（详见控制台）');
    };
    img.src = url;
  }

  function downloadSVG() {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    const svgStr = cleanSVG(svgEl);
    triggerDownload(new Blob([svgStr], { type: 'image/svg+xml' }), `figureforge-${timestamp()}.svg`);
    toast('✅ SVG 已下载');
  }

  function downloadPNG(scale = 2, background = '#FFFFFF') {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    renderToCanvas(svgEl, scale, background, canvas => {
      canvas.toBlob(blob => {
        triggerDownload(blob, `figureforge-${timestamp()}.png`);
        toast('✅ PNG 已下载');
      }, 'image/png');
    });
  }

  // ── TIFF baseline encoder (uncompressed RGB, little-endian) ──
  function encodeTIFF(canvas, dpi) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, w, h).data;
    const rgb = new Uint8Array(w * h * 3);
    for (let i = 0, j = 0; i < data.length; i += 4) {
      rgb[j++] = data[i]; rgb[j++] = data[i + 1]; rgb[j++] = data[i + 2];
    }
    const NUM_ENTRIES = 13;
    const ifdOffset = 8;
    const ifdSize = 2 + NUM_ENTRIES * 12 + 4;
    const extraOffset = ifdOffset + ifdSize;      // BitsPerSample(6) + XRes(8) + YRes(8) = 22
    const dataOffset = extraOffset + 22;
    const buf = new ArrayBuffer(dataOffset + rgb.length);
    const dv = new DataView(buf);
    let p = 0;
    // header
    dv.setUint8(p++, 0x49); dv.setUint8(p++, 0x49); // "II"
    dv.setUint16(p, 42, true); p += 2;
    dv.setUint32(p, ifdOffset, true); p += 4;

    const entries = [
      [256, 4, 1, w],            // ImageWidth LONG
      [257, 4, 1, h],            // ImageLength LONG
      [258, 3, 3, extraOffset],  // BitsPerSample SHORT x3 -> offset
      [259, 3, 1, 1],            // Compression = none
      [262, 3, 1, 2],            // Photometric = RGB
      [273, 4, 1, dataOffset],   // StripOffsets
      [277, 3, 1, 3],            // SamplesPerPixel
      [278, 4, 1, h],            // RowsPerStrip
      [279, 4, 1, rgb.length],   // StripByteCounts
      [282, 5, 1, extraOffset + 6],  // XResolution RATIONAL
      [283, 5, 1, extraOffset + 14], // YResolution RATIONAL
      [296, 3, 1, 2],            // ResolutionUnit = inch
      [284, 3, 1, 1],            // PlanarConfiguration = chunky
    ];
    dv.setUint16(p, NUM_ENTRIES, true); p += 2;
    for (const [tag, type, count, value] of entries) {
      dv.setUint16(p, tag, true); p += 2;
      dv.setUint16(p, type, true); p += 2;
      dv.setUint32(p, count, true); p += 4;
      if (type === 3 && count === 1) { dv.setUint16(p, value, true); dv.setUint16(p + 2, 0, true); p += 4; }
      else { dv.setUint32(p, value, true); p += 4; }
    }
    dv.setUint32(p, 0, true); p += 4; // next IFD = none
    // extra data
    dv.setUint16(extraOffset, 8, true); dv.setUint16(extraOffset + 2, 8, true); dv.setUint16(extraOffset + 4, 8, true);
    dv.setUint32(extraOffset + 6, dpi, true); dv.setUint32(extraOffset + 10, 1, true);
    dv.setUint32(extraOffset + 14, dpi, true); dv.setUint32(extraOffset + 18, 1, true);
    // pixel data
    new Uint8Array(buf, dataOffset).set(rgb);
    return new Blob([buf], { type: 'image/tiff' });
  }

  function downloadTIFF(scale = 2, dpi = 300) {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    renderToCanvas(svgEl, scale, '#FFFFFF', canvas => {
      try {
        const blob = encodeTIFF(canvas, dpi);
        triggerDownload(blob, `figureforge-${timestamp()}.tif`);
        toast(`✅ TIFF 已下载 (${canvas.width}×${canvas.height}px, ${dpi}dpi)`);
      } catch (e) {
        toast('❌ TIFF 导出失败：图像过大');
      }
    });
  }

  // ── PPTX via pptxgenjs (CDN, loaded on demand) ──
  function loadPptxGenJS() {
    if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
      s.onload = () => window.PptxGenJS ? resolve(window.PptxGenJS) : reject(new Error('loaded but missing'));
      s.onerror = () => reject(new Error('network'));
      document.head.appendChild(s);
    });
  }

  function downloadPPTX(scale = 2) {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    toast('⏳ 正在生成 PPTX…');
    loadPptxGenJS().then(PptxGenJS => {
      renderToCanvas(svgEl, scale, '#FFFFFF', canvas => {
        try {
          const mm = mmSize();
          const wIn = mm.w / 25.4, hIn = mm.h / 25.4;
          const pptx = new PptxGenJS();
          pptx.defineLayout({ name: 'FIG', width: wIn, height: hIn });
          pptx.layout = 'FIG';
          const slide = pptx.addSlide();
          const b64 = canvas.toDataURL('image/png').split(',')[1];
          slide.addImage({ data: 'image/png;base64,' + b64, x: 0, y: 0, w: wIn, h: hIn });
          pptx.writeFile({ fileName: `figureforge-${timestamp()}.pptx` })
            .then(() => toast('✅ PPTX 已下载'))
            .catch(() => toast('❌ PPTX 生成失败'));
        } catch (e) { toast('❌ PPTX 生成失败'); }
      });
    }).catch(() => toast('❌ 无法加载 PPTX 组件（需要联网）'));
  }

  async function copySVG() {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可复制的内容'); return; }
    const svgStr = cleanSVG(svgEl);
    try {
      await navigator.clipboard.writeText(svgStr);
      toast('✅ SVG 已复制到剪贴板');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = svgStr; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('✅ SVG 已复制到剪贴板'); }
      catch (e2) { toast('❌ 复制失败'); }
      document.body.removeChild(ta);
    }
  }

  function saveProject() {
    const svgEl = Canvas.getSVGElement();
    const svgStr = svgEl ? cleanSVG(svgEl) : '';
    const project = {
      version: '1.1', createdAt: new Date().toISOString(), svg: svgStr,
      meta: {
        palette: App.state.activePalette || 'classic',
        width: document.getElementById('global-width')?.value || 183,
        height: document.getElementById('global-height')?.value || 120,
        bg: document.getElementById('global-bg')?.value || '#FFFFFF',
      },
    };
    triggerDownload(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `figureforge-project-${timestamp()}.json`);
    toast('✅ 项目已保存');
  }

  function loadProject(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const project = JSON.parse(e.target.result);
        if (project.svg) {
          Canvas.loadSVG(project.svg);
          if (window.History) History.clear();
          if (project.meta && project.meta.palette && window.App) {
            App.state.activePalette = project.meta.palette;
          }
          toast('✅ 项目已加载');
        } else { toast('❌ 文件中没有 SVG 数据'); }
      } catch (err) { toast('❌ 无法解析项目文件'); }
    };
    reader.readAsText(file);
  }

  // ── Export dialog ──
  let dialogFormat = 'svg';
  let dialogScale = '2x';
  let dialogBg = '#FFFFFF';

  function openDialog() {
    const modal = document.getElementById('export-modal');
    if (!modal) { downloadSVG(); return; }
    renderDialog();
    modal.classList.remove('hidden');
  }

  function closeDialog() {
    document.getElementById('export-modal')?.classList.add('hidden');
  }

  function renderDialog() {
    const fmtBox = document.getElementById('exp-formats');
    const scaleBox = document.getElementById('exp-scales');
    const bgRow = document.getElementById('exp-bg-row');
    const hint = document.getElementById('exp-hint');
    fmtBox.innerHTML = '';
    FORMATS.forEach(f => {
      const b = document.createElement('button');
      b.className = 'seg-btn' + (f.key === dialogFormat ? ' active' : '');
      b.textContent = f.label;
      b.addEventListener('click', () => { dialogFormat = f.key; renderDialog(); });
      fmtBox.appendChild(b);
    });
    scaleBox.innerHTML = '';
    const needScale = dialogFormat === 'png' || dialogFormat === 'tiff' || dialogFormat === 'pptx';
    scaleRowVisibility(needScale);
    if (needScale) {
      SCALES.forEach(s => {
        const b = document.createElement('button');
        b.className = 'seg-btn' + (s.key === dialogScale ? ' active' : '');
        b.textContent = s.label;
        b.addEventListener('click', () => { dialogScale = s.key; renderDialog(); });
        scaleBox.appendChild(b);
      });
    }
    bgRow.classList.toggle('hidden', dialogFormat !== 'png');
    const f = FORMATS.find(x => x.key === dialogFormat);
    hint.textContent = f ? f.hint : '';
  }

  function scaleRowVisibility(show) {
    const row = document.getElementById('exp-scale-row');
    if (row) row.classList.toggle('hidden', !show);
  }

  function doExport() {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    const scale = scaleFor(dialogScale, svgEl);
    const dpi = (SCALES.find(s => s.key === dialogScale) || {}).dpi || 300;
    closeDialog();
    if (dialogFormat === 'svg') downloadSVG();
    else if (dialogFormat === 'png') downloadPNG(scale, dialogBg);
    else if (dialogFormat === 'tiff') downloadTIFF(scale, dpi);
    else if (dialogFormat === 'pptx') downloadPPTX(scale);
    else if (dialogFormat === 'json') saveProject();
  }

  function wireDialog() {
    document.getElementById('btn-export-do')?.addEventListener('click', doExport);
    document.getElementById('btn-export-cancel')?.addEventListener('click', closeDialog);
    document.getElementById('export-modal')?.addEventListener('mousedown', e => {
      if (e.target.id === 'export-modal') closeDialog();
    });
    document.querySelectorAll('#exp-bg-row input[name="exp-bg"]').forEach(r => {
      r.addEventListener('change', e => { dialogBg = e.target.value; });
    });
  }

  document.addEventListener('DOMContentLoaded', wireDialog);

  // ── helpers ──
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function timestamp() {
    const d = new Date();
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById('ff-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ff-toast'; el.className = 'ff-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }

  return { downloadSVG, downloadPNG, downloadTIFF, downloadPPTX, copySVG, saveProject, loadProject, openDialog, closeDialog, cleanSVG, toast };
})();
window.Export = Export;
