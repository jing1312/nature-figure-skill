/**
 * FigureForge — Main Application Orchestrator
 *
 * Wires up all modules:
 *   palettes.js → templates.js → canvas.js → properties.js
 *   ai-generate.js → export.js → history.js
 */
const App = (function () {

  const state = {
    currentTemplate: null,
    selectedElement: null,
    activePalette: 'classic',
    zoom: 1,
    showGrid: true,
    snapEnabled: true,
  };

  function init() {
    populatePaletteSelects();
    populateTemplateGalleries();
    wireToolbar();
    wireExportBar();
    wireAIPanel();
    wireGlobalSettings();
    wireKeyboardShortcuts();
    wireCanvasEvents();
    console.log('FigureForge ready ✅');
  }

  function populatePaletteSelects() {
    const list = getPaletteList();
    ['ai-palette-select', 'global-palette'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '';
      list.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.key; opt.textContent = p.name;
        sel.appendChild(opt);
      });
      sel.value = state.activePalette;
    });
  }

  function populateTemplateGalleries() {
    renderGallery('chart-gallery', getChartTemplates(), 'chart');
    renderGallery('layout-gallery', getLayoutTemplates(), 'layout');
  }

  function renderGallery(containerId, templates, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    Object.entries(templates).forEach(([key, tpl]) => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.dataset.key = key; item.dataset.type = type;
      const thumb = document.createElement('div');
      thumb.className = 'template-thumb';
      thumb.innerHTML = tpl.svg;
      const svg = thumb.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 400 280');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }
      const label = document.createElement('div');
      label.className = 'template-label';
      label.textContent = `${tpl.icon || ''} ${tpl.name}`;
      item.appendChild(thumb); item.appendChild(label);
      item.addEventListener('click', () => {
        container.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        selectTemplate(key, type);
      });
      container.appendChild(item);
    });
  }

  function selectTemplate(key, type) {
    state.currentTemplate = key;
    const tpl = getTemplate(key);
    if (!tpl) return;
    Canvas.loadSVG(tpl.svg);
    if (window.History) History.clear();
    applyPaletteToSVG(state.activePalette);
  }

  function applyPaletteToSVG(paletteKey) {
    state.activePalette = paletteKey;
    const svgEl = Canvas.getSVGElement();
    if (!svgEl) return;
    const colors = getPaletteColors(paletteKey);
    if (!colors || colors.length === 0) return;
    const seriesRoles = ['bar', 'line', 'area', 'marker', 'legend-marker', 'series'];
    let colorIdx = 0;
    svgEl.querySelectorAll('[data-edit="true"]').forEach(el => {
      const role = el.getAttribute('data-role') || '';
      if (seriesRoles.includes(role)) {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== '#FFFFFF' && fill !== '#ffffff') {
          el.setAttribute('fill', colors[colorIdx % colors.length]);
          colorIdx++;
        }
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none' && role === 'line') {
          el.setAttribute('stroke', colors[colorIdx % colors.length]);
        }
      }
    });
    Canvas.updateSelectionOverlay();
  }

  function wireToolbar() {
    document.getElementById('btn-undo')?.addEventListener('click', () => History.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => History.redo());
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => { Canvas.zoomBy(1.2); updateZoomDisplay(); });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => { Canvas.zoomBy(1 / 1.2); updateZoomDisplay(); });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => { Canvas.fitToView(); updateZoomDisplay(); });
    document.getElementById('btn-grid')?.addEventListener('click', (e) => { state.showGrid = !state.showGrid; Canvas.toggleGrid(); e.target.classList.toggle('active', state.showGrid); });
    document.getElementById('btn-snap')?.addEventListener('click', (e) => { state.snapEnabled = !state.snapEnabled; Canvas.toggleSnap(); e.target.classList.toggle('active', state.snapEnabled); });
  }

  function updateZoomDisplay() {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(Canvas.getZoom() * 100) + '%';
  }

  function wireExportBar() {
    document.getElementById('btn-export-svg')?.addEventListener('click', () => Export.downloadSVG());
    document.getElementById('btn-export-png')?.addEventListener('click', () => Export.downloadPNG(2));
    document.getElementById('btn-copy-svg')?.addEventListener('click', () => Export.copySVG());
  }

  function wireAIPanel() {
    const btn = document.getElementById('btn-ai-generate');
    const prompt = document.getElementById('ai-prompt');
    const paletteSel = document.getElementById('ai-palette-select');
    btn?.addEventListener('click', async () => {
      const desc = prompt?.value.trim();
      if (!desc) { Export.toast('请先输入描述'); return; }
      const paletteKey = paletteSel?.value || state.activePalette;
      try {
        await AIGenerate.generate(desc, state.currentTemplate, paletteKey);
        if (window.History) History.clear();
        applyPaletteToSVG(paletteKey);
      } catch (e) {}
    });
    prompt?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); btn.click(); }
    });
  }

  function wireGlobalSettings() {
    document.getElementById('global-palette')?.addEventListener('change', (e) => applyPaletteToSVG(e.target.value));
    document.getElementById('global-width')?.addEventListener('change', (e) => {
      const svgEl = Canvas.getSVGElement();
      if (svgEl) svgEl.setAttribute('width', parseFloat(e.target.value) * 3.7795);
    });
    document.getElementById('global-height')?.addEventListener('change', (e) => {
      const svgEl = Canvas.getSVGElement();
      if (svgEl) svgEl.setAttribute('height', parseFloat(e.target.value) * 3.7795);
    });
    document.getElementById('global-bg')?.addEventListener('change', (e) => {
      const svgEl = Canvas.getSVGElement();
      if (!svgEl) return;
      let bgRect = svgEl.querySelector('rect:first-child');
      if (bgRect && bgRect.getAttribute('data-role') !== 'bar') bgRect.setAttribute('fill', e.target.value);
      else {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x','0'); rect.setAttribute('y','0');
        const vb = svgEl.getAttribute('viewBox')?.split(/\s+/);
        rect.setAttribute('width', vb ? vb[2] : '400'); rect.setAttribute('height', vb ? vb[3] : '280');
        rect.setAttribute('fill', e.target.value); svgEl.insertBefore(rect, svgEl.firstChild);
      }
    });
  }

  function wireCanvasEvents() {
    window.__ffOnSelectionChanged = function (el) { state.selectedElement = el; Properties.onSelectionChanged(el); };
    window.__ffOnZoomChanged = function () { updateZoomDisplay(); };
  }

  function wireKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
      else if ((ctrl && e.key === 'z' && e.shiftKey) || (ctrl && e.key === 'y')) { e.preventDefault(); History.redo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (state.selectedElement) { e.preventDefault(); Canvas.deleteElement(); } }
      else if (ctrl && e.key === 'd') { e.preventDefault(); Canvas.duplicateElement(); }
      else if (e.key === 'Escape') { Canvas.deselect(); }
      else if (ctrl && e.key === 's') { e.preventDefault(); Export.downloadSVG(); }
      else if (ctrl && e.shiftKey && e.key === 'C') { e.preventDefault(); Export.copySVG(); }
      else if (ctrl && (e.key === '=' || e.key === '+')) { e.preventDefault(); Canvas.zoomBy(1.2); updateZoomDisplay(); }
      else if (ctrl && e.key === '-') { e.preventDefault(); Canvas.zoomBy(1 / 1.2); updateZoomDisplay(); }
      else if (ctrl && e.key === '0') { e.preventDefault(); Canvas.fitToView(); updateZoomDisplay(); }
    });
  }

  return { init, state };
})();
window.App = App;

document.addEventListener('DOMContentLoaded', () => App.init());
