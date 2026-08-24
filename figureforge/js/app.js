/**
 * FigureForge — Main Application Orchestrator
 *
 * Wires up all modules:
 *   palettes.js → templates.js → library.js → canvas.js → properties.js
 *   ai-generate.js → export.js → storage.js → history.js
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
    Store.init();
    populatePaletteSelects();
    Library.init();
    wireToolbar();
    wireExportBar();
    wireAIPanel();
    wireGlobalSettings();
    wireKeyboardShortcuts();
    wireCanvasEvents();
    wirePanelToggle();
    wireHelp();
    applyWorkspaceBg(Store.getPref('workspaceBg', '#0f0f1a'));
    if (!Store.tryRestore()) console.log('FigureForge ready ✅ (fresh start)');
    else console.log('FigureForge ready ✅ (session restored)');
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
    Store.scheduleSave();
  }

  function wireToolbar() {
    document.getElementById('btn-undo')?.addEventListener('click', () => History.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => History.redo());
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => { Canvas.zoomBy(1.2); updateZoomDisplay(); });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => { Canvas.zoomBy(1 / 1.2); updateZoomDisplay(); });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => { Canvas.fitToView(); updateZoomDisplay(); });
    document.getElementById('btn-grid')?.addEventListener('click', (e) => { state.showGrid = !state.showGrid; Canvas.toggleGrid(); e.target.classList.toggle('active', state.showGrid); });
    document.getElementById('btn-snap')?.addEventListener('click', (e) => { state.snapEnabled = !state.snapEnabled; Canvas.toggleSnap(); e.target.classList.toggle('active', state.snapEnabled); });
    document.getElementById('btn-save')?.addEventListener('click', () => Store.saveSession());
    document.getElementById('btn-insert-text')?.addEventListener('click', () => Canvas.insertText());
    document.getElementById('btn-help')?.addEventListener('click', () => toggleHelp(true));
  }

  function updateZoomDisplay() {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(Canvas.getZoom() * 100) + '%';
  }

  function wireExportBar() {
    document.getElementById('btn-export-svg')?.addEventListener('click', () => Export.openDialog());
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
        Store.scheduleSave();
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
      Store.scheduleSave();
    });
    document.getElementById('global-height')?.addEventListener('change', (e) => {
      const svgEl = Canvas.getSVGElement();
      if (svgEl) svgEl.setAttribute('height', parseFloat(e.target.value) * 3.7795);
      Store.scheduleSave();
    });
    const bgInput = document.getElementById('global-bg-color');
    const bgTransparent = document.getElementById('global-bg-transparent');
    function applyFigureBg() {
      const svgEl = Canvas.getSVGElement();
      if (!svgEl) return;
      const vb = (svgEl.getAttribute('viewBox') || '0 0 400 280').split(/[\s,]+/);
      let bgRect = svgEl.querySelector('rect[data-role="bg"]');
      if (bgTransparent.checked) {
        if (bgRect) bgRect.remove();
      } else {
        if (!bgRect) {
          bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bgRect.setAttribute('data-role', 'bg');
          bgRect.setAttribute('x', '0'); bgRect.setAttribute('y', '0');
          bgRect.setAttribute('width', vb[2] || '400'); bgRect.setAttribute('height', vb[3] || '280');
          svgEl.insertBefore(bgRect, svgEl.firstChild);
        }
        bgRect.setAttribute('fill', bgInput.value);
      }
      Store.scheduleSave();
    }
    bgInput?.addEventListener('input', applyFigureBg);
    bgTransparent?.addEventListener('change', applyFigureBg);

    // workspace (editor chrome) background
    const wsBg = document.getElementById('workspace-bg');
    wsBg?.addEventListener('change', e => {
      applyWorkspaceBg(e.target.value);
      Store.setPref('workspaceBg', e.target.value);
    });
  }

  function applyWorkspaceBg(color) {
    document.documentElement.style.setProperty('--bg-canvas', color);
    const sel = document.getElementById('workspace-bg');
    if (sel) sel.value = color;
  }

  function wireCanvasEvents() {
    window.__ffOnSelectionChanged = function (el) { state.selectedElement = el; Properties.onSelectionChanged(el); };
    window.__ffOnZoomChanged = function () { updateZoomDisplay(); };
    window.__ffOnFilesDropped = function (files, pos) {
      files.forEach(file => {
        const name = file.name.toLowerCase();
        if (name.endsWith('.svg')) {
          Library.importSVGFile(file, true);
        } else if (/\.(png|jpe?g|gif|webp)$/.test(name)) {
          const reader = new FileReader();
          reader.onload = e => {
            Canvas.insertImage(e.target.result, pos ? pos.x : undefined, pos ? pos.y : undefined);
            Export.toast('🖼 已插入图片 ' + file.name);
          };
          reader.readAsDataURL(file);
        } else if (name.endsWith('.json')) {
          Export.loadProject(file);
        } else {
          Export.toast('❌ 不支持的格式：' + file.name + '（支持 SVG / PNG / JPG / JSON）');
        }
      });
    };
  }

  function wirePanelToggle() {
    document.getElementById('btn-collapse-left')?.addEventListener('click', () => {
      document.getElementById('left-panel').classList.toggle('collapsed');
      const btn = document.getElementById('btn-collapse-left');
      if (btn) btn.textContent = document.getElementById('left-panel').classList.contains('collapsed') ? '»' : '«';
    });
  }

  function wireHelp() {
    const modal = document.getElementById('help-modal');
    modal?.addEventListener('mousedown', e => { if (e.target.id === 'help-modal') toggleHelp(false); });
    document.getElementById('btn-help-close')?.addEventListener('click', () => toggleHelp(false));
  }

  function toggleHelp(show) {
    document.getElementById('help-modal')?.classList.toggle('hidden', !show);
  }

  function wireKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
      else if ((ctrl && e.key === 'z' && e.shiftKey) || (ctrl && e.key === 'y')) { e.preventDefault(); History.redo(); }
      else if (ctrl && e.key === 's') { e.preventDefault(); Store.saveSession(); }
      else if (ctrl && e.key === 'e') { e.preventDefault(); Export.openDialog(); }
      else if (ctrl && e.key === 'g' && e.shiftKey) { e.preventDefault(); Canvas.ungroupSelection(); }
      else if (ctrl && e.key === 'g') { e.preventDefault(); Canvas.groupSelection(); }
      else if (ctrl && e.key === 'a') { e.preventDefault(); Canvas.selectAll(); }
      else if (ctrl && e.key === 'd') { e.preventDefault(); Canvas.duplicateElement(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (Canvas.getSelection().length) { e.preventDefault(); Canvas.deleteElement(); } }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); Canvas.nudge(e.shiftKey ? -10 : -1, 0); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); Canvas.nudge(e.shiftKey ? 10 : 1, 0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); Canvas.nudge(0, e.shiftKey ? -10 : -1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); Canvas.nudge(0, e.shiftKey ? 10 : 1); }
      else if (e.key === 'Escape') { Canvas.deselect(); Export.closeDialog(); toggleHelp(false); }
      else if (ctrl && e.shiftKey && e.key === 'C') { e.preventDefault(); Export.copySVG(); }
      else if (ctrl && (e.key === '=' || e.key === '+')) { e.preventDefault(); Canvas.zoomBy(1.2); updateZoomDisplay(); }
      else if (ctrl && e.key === '-') { e.preventDefault(); Canvas.zoomBy(1 / 1.2); updateZoomDisplay(); }
      else if (ctrl && e.key === '0') { e.preventDefault(); Canvas.fitToView(); updateZoomDisplay(); }
      else if (e.key === '?') { toggleHelp(true); }
    });
  }

  return { init, state };
})();
window.App = App;

document.addEventListener('DOMContentLoaded', () => App.init());
