/**
 * FigureForge — Template Library
 *
 * Manages the left-panel gallery: built-in + user templates organized into
 * folders. Supports rename, delete, move, new blank figure, import SVG.
 * Persisted to localStorage; falls back to built-in templates.
 *
 * Data model:
 * { version, sections: { chart: {folders:[{id,name,collapsed,items:[tpl]}], items:[tpl]},
 *                        layout: {...} } }
 * tpl = { id, name, icon, svg }
 */
const Library = (function () {
  const KEY = 'ff-template-library';
  let data = null;

  function uid() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function defaultData() {
    const conv = (obj, type) => Object.entries(obj).map(([k, v]) => ({
      id: type + ':' + k, name: v.name, icon: v.icon || '', svg: v.svg
    }));
    return {
      version: 1,
      sections: {
        chart: { folders: [], items: conv(getChartTemplates(), 'chart') },
        layout: { folders: [], items: conv(getLayoutTemplates(), 'layout') },
      }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        data = JSON.parse(raw);
        if (!data || !data.sections || !data.sections.chart) throw new Error('bad lib');
      } else data = defaultData();
    } catch (e) { data = defaultData(); }
    return data;
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { /* quota — ignore */ }
  }

  function findItem(id) {
    for (const key of ['chart', 'layout']) {
      const sec = data.sections[key];
      const inRoot = sec.items.find(t => t.id === id);
      if (inRoot) return { sec, item: inRoot, folder: null };
      for (const f of sec.folders) {
        const inFolder = f.items.find(t => t.id === id);
        if (inFolder) return { sec, item: inFolder, folder: f };
      }
    }
    return null;
  }

  // ── Mutations ──
  function renameItem(id, name) {
    const ref = findItem(id);
    if (!ref || !name.trim()) return;
    ref.item.name = name.trim();
    persist(); render();
  }

  function deleteItem(id) {
    const ref = findItem(id);
    if (!ref) return;
    const arr = ref.folder ? ref.folder.items : ref.sec.items;
    const idx = arr.findIndex(t => t.id === id);
    if (idx >= 0) arr.splice(idx, 1);
    persist(); render();
  }

  function newFolder(sectionKey, name) {
    data.sections[sectionKey].folders.push({ id: uid(), name: name || '新建分组', collapsed: false, items: [] });
    persist(); render();
  }

  function renameFolder(folderId, name) {
    for (const key of ['chart', 'layout']) {
      const f = data.sections[key].folders.find(x => x.id === folderId);
      if (f) { f.name = name.trim() || f.name; break; }
    }
    persist(); render();
  }

  function deleteFolder(folderId) {
    for (const key of ['chart', 'layout']) {
      const sec = data.sections[key];
      const idx = sec.folders.findIndex(x => x.id === folderId);
      if (idx >= 0) {
        sec.items.push(...sec.folders[idx].items); // keep templates, move to root
        sec.folders.splice(idx, 1);
        break;
      }
    }
    persist(); render();
  }

  function toggleFolder(folderId) {
    for (const key of ['chart', 'layout']) {
      const f = data.sections[key].folders.find(x => x.id === folderId);
      if (f) { f.collapsed = !f.collapsed; break; }
    }
    persist(); render();
  }

  function moveItem(id, folderId /* null = root */) {
    const ref = findItem(id);
    if (!ref) return;
    const srcArr = ref.folder ? ref.folder.items : ref.sec.items;
    const idx = srcArr.findIndex(t => t.id === id);
    if (idx < 0) return;
    const [tpl] = srcArr.splice(idx, 1);
    const sectionKeys = Object.keys(data.sections);
    const secKey = sectionKeys.find(k => data.sections[k] === ref.sec);
    if (!folderId) ref.sec.items.push(tpl);
    else {
      const f = ref.sec.folders.find(x => x.id === folderId);
      if (f) f.items.push(tpl); else ref.sec.items.push(tpl);
    }
    persist(); render();
  }

  function addItem(sectionKey, tpl) {
    tpl.id = tpl.id || uid();
    data.sections[sectionKey].items.push(tpl);
    persist(); render();
    return tpl;
  }

  function newBlankFigure() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"></svg>';
    addItem('chart', { name: '空白图', icon: '➕', svg });
    const tpl = data.sections.chart.items[data.sections.chart.items.length - 1];
    Canvas.loadSVG(svg);
    if (window.History) History.clear();
    if (window.Export) Export.toast('✅ 已创建空白图');
    highlight(tpl.id);
  }

  function importSVGFile(file, asTemplate) {
    const reader = new FileReader();
    reader.onload = function (e) {
      let svg = e.target.result;
      if (!/<svg[\s>]/i.test(svg)) { if (window.Export) Export.toast('❌ 不是有效的 SVG 文件'); return; }
      // normalize: ensure viewBox
      if (!/viewBox=/i.test(svg)) {
        const w = /width="([\d.]+)/i.exec(svg), h = /height="([\d.]+)/i.exec(svg);
        if (w && h) svg = svg.replace(/<svg/i, `<svg viewBox="0 0 ${parseFloat(w[1])} ${parseFloat(h[1])}"`);
      }
      const name = file.name.replace(/\.svg$/i, '');
      if (asTemplate !== false) addItem('chart', { name, icon: '📥', svg });
      Canvas.loadSVG(svg);
      if (window.History) History.clear();
      if (window.Export) Export.toast(asTemplate !== false ? '✅ SVG 已导入模板库并打开' : '✅ SVG 已打开');
    };
    reader.readAsText(file);
  }

  function highlight(id) {
    const el = document.querySelector(`.template-item[data-key="${id}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
      el.classList.add('selected');
    }
  }

  // ── Rendering ──
  // Dedicated fixed-position menu for the left panel (the canvas context
  // menu lives inside #canvas-area and gets clipped near the panel).
  function panelMenu() {
    let menu = document.getElementById('library-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'library-menu';
      menu.className = 'context-menu';
      document.body.appendChild(menu);
      document.addEventListener('mousedown', e => {
        if (!menu.contains(e.target)) menu.classList.add('hidden');
      }, true);
      window.addEventListener('blur', () => menu.classList.add('hidden'));
    }
    menu.innerHTML = '';
    menu.classList.remove('hidden');
    return menu;
  }

  function showPanelMenuAt(menu, clientX, clientY) {
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.classList.remove('hidden');
    const r = menu.getBoundingClientRect();
    const x = Math.min(clientX, window.innerWidth - r.width - 8);
    const y = Math.min(clientY, window.innerHeight - r.height - 8);
    menu.style.left = Math.max(4, x) + 'px';
    menu.style.top = Math.max(4, y) + 'px';
  }

  function itemMenu(e, id) {
    e.preventDefault();
    e.stopPropagation();
    const menu = panelMenu();
    const mk = (label, fn, danger) => {
      const d = document.createElement('div');
      d.className = 'context-menu-item' + (danger ? ' danger' : '');
      d.textContent = label;
      d.addEventListener('click', () => { menu.classList.add('hidden'); fn(); });
      menu.appendChild(d);
    };
    const folders = [];
    for (const key of ['chart', 'layout']) {
      data.sections[key].folders.forEach(f => folders.push(f));
    }
    const ref = findItem(id);
    mk('✏️ 重命名', () => {
      const el = document.querySelector(`.template-item[data-key="${id}"] .template-label`);
      if (el) startInlineRename(id, el);
    });
    folders.forEach(f => {
      if (ref && ref.folder === f) return;
      mk('📂 移动到「' + f.name + '」', () => moveItem(id, f.id));
    });
    if (ref && ref.folder) mk('📂 移出到根目录', () => moveItem(id, null));
    mk('🗑 删除模板', () => deleteItem(id), true);
    showPanelMenuAt(menu, e.clientX, e.clientY);
  }

  function startInlineRename(id, labelEl) {
    const old = labelEl.textContent.replace(/^[^ ]+ /, '');
    const input = document.createElement('input');
    input.className = 'inline-rename';
    input.value = old;
    labelEl.textContent = '';
    labelEl.appendChild(input);
    input.focus(); input.select();
    const done = (commit) => {
      if (commit && input.value.trim() && input.value.trim() !== old) renameItem(id, input.value);
      else render();
    };
    input.addEventListener('keydown', ev => {
      ev.stopPropagation();
      if (ev.key === 'Enter') input.blur();
      else if (ev.key === 'Escape') { input.value = old; input.blur(); }
    });
    input.addEventListener('blur', () => done(true));
    input.addEventListener('click', ev => ev.stopPropagation());
  }

  function folderMenu(e, folderId) {
    e.preventDefault();
    e.stopPropagation();
    const menu = panelMenu();
    const mk = (label, fn, danger) => {
      const d = document.createElement('div');
      d.className = 'context-menu-item' + (danger ? ' danger' : '');
      d.textContent = label;
      d.addEventListener('click', () => { menu.classList.add('hidden'); fn(); });
      menu.appendChild(d);
    };
    mk('✏️ 重命名分组', () => {
      const el = document.querySelector(`.folder-row[data-folder="${folderId}"] .folder-name`);
      if (el) {
        const input = document.createElement('input');
        input.className = 'inline-rename';
        const f = findFolder(folderId);
        input.value = f ? f.name : '';
        el.textContent = ''; el.appendChild(input);
        input.focus(); input.select();
        input.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { render(); } });
        input.addEventListener('blur', () => { if (input.value.trim()) renameFolder(folderId, input.value); else render(); });
        input.addEventListener('click', ev => ev.stopPropagation());
      }
    });
    mk('🗑 删除分组（模板移回根目录）', () => deleteFolder(folderId), true);
    showPanelMenuAt(menu, e.clientX, e.clientY);
  }

  function findFolder(folderId) {
    for (const key of ['chart', 'layout']) {
      const f = data.sections[key].folders.find(x => x.id === folderId);
      if (f) return f;
    }
    return null;
  }

  function thumbSVG(tpl) {
    return `<div class="template-thumb">${tpl.svg}</div>`;
  }

  function render() {
    if (!data) load();
    const cfg = [
      { key: 'chart', containerId: 'chart-gallery' },
      { key: 'layout', containerId: 'layout-gallery' },
    ];
    cfg.forEach(({ key, containerId }) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      const sec = data.sections[key];

      sec.folders.forEach(f => {
        const row = document.createElement('div');
        row.className = 'folder-row';
        row.dataset.folder = f.id;
        row.innerHTML = `
          <span class="folder-toggle">${f.collapsed ? '▸' : '▾'}</span>
          <span class="folder-icon">📁</span>
          <span class="folder-name">${escapeHTML(f.name)}</span>
          <span class="folder-count">${f.items.length}</span>`;
        row.addEventListener('click', () => toggleFolder(f.id));
        row.addEventListener('contextmenu', e => folderMenu(e, f.id));
        container.appendChild(row);
        if (!f.collapsed) {
          f.items.forEach(tpl => container.appendChild(renderItem(tpl)));
        }
      });

      sec.items.forEach(tpl => container.appendChild(renderItem(tpl)));
    });
  }

  function renderItem(tpl) {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.dataset.key = tpl.id;
    item.innerHTML = thumbSVG(tpl) + `<div class="template-label">${tpl.icon ? tpl.icon + ' ' : ''}${escapeHTML(tpl.name)}</div>`;
    const svg = item.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 400 280');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
    item.addEventListener('click', () => {
      document.querySelectorAll('.template-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      Canvas.loadSVG(tpl.svg);
      if (window.History) History.clear();
    });
    item.addEventListener('dblclick', () => {
      const labelEl = item.querySelector('.template-label');
      startInlineRename(tpl.id, labelEl);
    });
    item.addEventListener('contextmenu', e => itemMenu(e, tpl.id));
    return item;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function init() {
    load();
    render();
    document.getElementById('btn-new-folder')?.addEventListener('click', () => newFolder('chart'));
    document.getElementById('btn-import-svg')?.addEventListener('click', () => {
      const inp = document.getElementById('file-import-svg');
      if (inp) { inp.value = ''; inp.click(); }
    });
    document.getElementById('btn-new-figure')?.addEventListener('click', () => newBlankFigure());
    document.getElementById('file-import-svg')?.addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) importSVGFile(f, true);
    });
  }

  return { init, render, load, persist, addItem, importSVGFile, newBlankFigure, moveItem, deleteItem, renameItem, newFolder, deleteFolder };
})();
window.Library = Library;
