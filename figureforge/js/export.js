/**
 * FigureForge — Export Functions
 *
 * - Download SVG (cleaned of editor-only attributes)
 * - Download PNG (SVG → canvas → PNG)
 * - Copy SVG to clipboard
 * - Save / Load project as JSON
 */
const Export = (function () {

  const EDITOR_ATTRS = ['data-edit', 'data-selected', 'data-role'];

  function cleanSVG(svgEl) {
    const clone = svgEl.cloneNode(true);
    clone.querySelectorAll('*').forEach(el => {
      EDITOR_ATTRS.forEach(attr => el.removeAttribute(attr));
    });
    EDITOR_ATTRS.forEach(attr => clone.removeAttribute(attr));
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadSVG() {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    const svgStr = cleanSVG(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    triggerDownload(blob, `figureforge-${timestamp()}.svg`);
    toast('✅ SVG 已下载');
  }

  function downloadPNG(scale = 2) {
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) { toast('没有可导出的内容'); return; }
    const svgStr = cleanSVG(svgEl);
    const viewBox = svgEl.getAttribute('viewBox');
    let vbW = 400, vbH = 280;
    if (viewBox) {
      const parts = viewBox.split(/\s+/);
      vbW = parseFloat(parts[2]); vbH = parseFloat(parts[3]);
    }
    const canvas = document.createElement('canvas');
    canvas.width = vbW * scale; canvas.height = vbH * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (pngBlob) {
        triggerDownload(pngBlob, `figureforge-${timestamp()}.png`);
        toast('✅ PNG 已下载');
      }, 'image/png');
    };
    img.onerror = function () { URL.revokeObjectURL(url); toast('❌ PNG 导出失败'); };
    img.src = url;
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
      version: '1.0', createdAt: new Date().toISOString(), svg: svgStr,
      meta: {
        palette: App.state.activePalette || 'classic',
        width: document.getElementById('global-width')?.value || 183,
        height: document.getElementById('global-height')?.value || 120,
        bg: document.getElementById('global-bg')?.value || '#FFFFFF',
      },
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `figureforge-project-${timestamp()}.json`);
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
          toast('✅ 项目已加载');
        } else { toast('❌ 文件中没有 SVG 数据'); }
      } catch (err) { toast('❌ 无法解析项目文件'); }
    };
    reader.readAsText(file);
  }

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

  return { downloadSVG, downloadPNG, copySVG, saveProject, loadProject, cleanSVG, toast };
})();
window.Export = Export;
