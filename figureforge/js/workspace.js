/**
 * FigureForge — Workspace (VibePaper-style infinite canvas)
 *
 * One infinite pannable/zoomable canvas where every figure, image, note
 * and text lives as a draggable node card, linked by reference edges.
 * A floating one-sentence prompt bar compiles a description into a
 * figure node; the Plaza slides over with the 9 showcase atlases and
 * all publication-grade templates to remix onto the canvas.
 * Everything persists to localStorage and round-trips with the
 * single-figure editor (double-click a node → edit → back).
 */
const Workspace = (function () {
  const LS_KEY = 'ff-workspace';
  const SVGNS = 'http://www.w3.org/2000/svg';

  const state = {
    nodes: [],          // {id,type,x,y,w,title,svg,src,text,color,el}
    edges: [],          // {id,from,to,el}
    camera: { x: 0, y: 0, z: 1 },
    sel: new Set(),     // node ids
    selEdge: null,      // edge id
    tool: 'select',     // select | hand
    editingNodeId: null,
    mode: 'canvas',
    counter: 1,
    saveTimer: null,
    welcomeSeeded: false,
  };

  /* ---------------- helpers ---------------- */
  const $ = (id) => document.getElementById(id);
  const view = () => $('workspace-view');
  const world = () => $('ws-world');
  const nodesEl = () => $('ws-nodes');
  const edgesEl = () => $('ws-edges');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const uid = (p) => p + (state.counter++);
  const screenToWorld = (sx, sy) => {
    const r = view().getBoundingClientRect();
    return { x: (sx - r.left - state.camera.x) / state.camera.z, y: (sy - r.top - state.camera.y) / state.camera.z };
  };
  const nodeById = (id) => state.nodes.find(n => n.id === id);
  const toast = (m) => { if (window.Export) Export.toast(m); };

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(save, 700);
  }

  function save() {
    try {
      const data = {
        camera: state.camera,
        counter: state.counter,
        nodes: state.nodes.map(n => ({
          id: n.id, type: n.type, x: Math.round(n.x), y: Math.round(n.y),
          w: Math.round(n.w), title: n.title, svg: n.svg || null,
          src: n.src || null, text: n.text || null, color: n.color || null,
        })),
        edges: state.edges.map(e => ({ id: e.id, from: e.from, to: e.to })),
      };
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('workspace save failed (storage full?)', e);
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.nodes)) return false;
      state.camera = d.camera || { x: 0, y: 0, z: 1 };
      state.counter = d.counter || d.nodes.length + d.edges.length + 1;
      d.nodes.forEach(n => { n.el = null; state.nodes.push(n); });
      (d.edges || []).forEach(e => { if (nodeById(e.from) && nodeById(e.to)) state.edges.push({ id: e.id, from: e.from, to: e.to }); });
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- camera ---------------- */
  const MIN_Z = 0.08, MAX_Z = 4;

  function applyCamera() {
    const c = state.camera;
    world().style.transform = `translate(${c.x}px, ${c.y}px) scale(${c.z})`;
    // dot grid lives in screen space but follows the camera
    const v = view();
    v.style.backgroundSize = `${24 * c.z}px ${24 * c.z}px, auto`;
    v.style.backgroundPosition = `${c.x}px ${c.y}px, 0 0`;
    $('ws-zoom-level').textContent = Math.round(c.z * 100) + '%';
    scheduleSave();
  }

  function zoomAt(sx, sy, factor) {
    const r = view().getBoundingClientRect();
    const c = state.camera;
    const nz = clamp(c.z * factor, MIN_Z, MAX_Z);
    if (nz === c.z) return;
    const mx = sx - r.left, my = sy - r.top;
    c.x = mx - (mx - c.x) * (nz / c.z);
    c.y = my - (my - c.y) * (nz / c.z);
    c.z = nz;
    applyCamera();
  }

  function zoomCenter(factor) {
    const r = view().getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  }

  function fitToNodes() {
    if (!state.nodes.length) { state.camera = { x: 60, y: 60, z: 1 }; applyCamera(); return; }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    state.nodes.forEach(n => {
      const h = n.el ? n.el.offsetHeight : 260;
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + n.w); y1 = Math.max(y1, n.y + h);
    });
    const r = view().getBoundingClientRect();
    const pad = 80;
    const z = clamp(Math.min(r.width / (x1 - x0 + pad * 2), r.height / (y1 - y0 + pad * 2)), MIN_Z, 1.2);
    state.camera.z = z;
    state.camera.x = (r.width - (x1 - x0) * z) / 2 - x0 * z;
    state.camera.y = (r.height - (y1 - y0) * z) / 2 - y0 * z;
    applyCamera();
  }

  /* ---------------- node rendering ---------------- */
  const TYPE_ICON = {
    figure: '<svg viewBox="0 0 24 24"><line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>',
    text: '<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  };
  const TYPE_NAME = { figure: '图表', image: '图片', note: '便签', text: '文本' };

  function nodeBodyHTML(n) {
    if (n.type === 'figure') return `<div class="ws-fig">${n.svg || ''}</div>`;
    if (n.type === 'image') return `<div class="ws-img"><img src="${n.src}" draggable="false"></div>`;
    if (n.type === 'note') return `<div class="ws-note-body" contenteditable="false" spellcheck="false" data-ws-editable>${escHTML(n.text || '')}</div>`;
    if (n.type === 'text') return `<div class="ws-text-body" contenteditable="false" spellcheck="false" data-ws-editable>${escHTML(n.text || '')}</div>`;
    return '';
  }

  function escHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderNode(n) {
    const el = document.createElement('div');
    el.className = 'ws-node type-' + n.type + (n.hue ? ' hue-' + n.hue : '') + (state.sel.has(n.id) ? ' selected' : '');
    el.dataset.id = n.id;
    el.style.left = n.x + 'px';
    el.style.top = n.y + 'px';
    if (n.type !== 'text') el.style.width = (n.w || (n.type === 'note' ? 240 : 340)) + 'px';
    const headable = n.type === 'figure' || n.type === 'image';
    el.innerHTML =
      (headable ? `<div class="ws-node-head"><span class="ws-node-icon">${TYPE_ICON[n.type]}</span>` +
        `<span class="ws-node-title" title="双击重命名">${escHTML(n.title || TYPE_NAME[n.type])}</span>` +
        `<span class="ws-node-actions">` +
        (n.type === 'figure' ? `<button data-act="edit" title="在编辑器中打开"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>` : '') +
        `<button data-act="dup" title="复制节点"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>` +
        `<button data-act="del" title="删除节点"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></span></div>` : '') +
      `<div class="ws-node-body">${nodeBodyHTML(n)}</div>` +
      (headable ? `<div class="ws-node-resize" title="拖动调整大小"></div>` : '') +
      `<div class="ws-node-port" title="拖到另一节点建立参考连线"></div>`;
    n.el = el;
    nodesEl().appendChild(el);
    wireNode(n);
    return el;
  }

  function rerenderNode(n) {
    if (n.el) n.el.remove();
    renderNode(n);
    renderEdges();
  }

  function wireNode(n) {
    const el = n.el;

    // drag to move (whole card), handled here for precise node targeting
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ws-node-actions') || e.target.closest('.ws-node-port') ||
          e.target.closest('.ws-node-resize') || e.target.closest('[contenteditable="true"]')) return;
      if (e.button !== 0) return;
      e.stopPropagation();
      selectNode(n.id, e.shiftKey);
      bringToFront(n);
      const start = screenToWorld(e.clientX, e.clientY);
      const origins = new Map();
      state.sel.forEach(id => { const m = nodeById(id); if (m) origins.set(id, { x: m.x, y: m.y }); });
      let moved = false;
      const onMove = (ev) => {
        const p = screenToWorld(ev.clientX, ev.clientY);
        const dx = p.x - start.x, dy = p.y - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) moved = true;
        origins.forEach((o, id) => {
          const m = nodeById(id); if (!m) return;
          m.x = o.x + dx; m.y = o.y + dy;
          m.el.style.left = m.x + 'px'; m.el.style.top = m.y + 'px';
        });
        renderEdges();
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (moved) scheduleSave();
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });

    // inline title rename
    const titleEl = el.querySelector('.ws-node-title');
    titleEl?.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      titleEl.contentEditable = 'true';
      titleEl.focus();
      document.getSelection().selectAllChildren(titleEl);
    });
    titleEl?.addEventListener('blur', () => {
      titleEl.contentEditable = 'false';
      n.title = titleEl.textContent.trim() || TYPE_NAME[n.type];
      titleEl.textContent = n.title;
      scheduleSave();
    });
    titleEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
      e.stopPropagation();
    });

    // note / text editing — double-click to start editing, blur to commit.
    // While not editing, the card is draggable like everything else.
    el.querySelectorAll('[data-ws-editable]').forEach(ed => {
      ed.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        ed.setAttribute('contenteditable', 'true');
        ed.focus();
      });
      ed.addEventListener('blur', () => {
        ed.setAttribute('contenteditable', 'false');
        n.text = ed.textContent;
        scheduleSave();
      });
      ed.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') ed.blur();
      });
    });
    // image height arrives async — keep edges glued
    el.querySelector('.ws-img img')?.addEventListener('load', () => renderEdges());

    // header actions
    el.querySelectorAll('.ws-node-actions button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.act;
        if (act === 'del') deleteNodes([n.id]);
        else if (act === 'dup') duplicateNodes([n.id]);
        else if (act === 'edit') openInEditor(n);
      });
    });

    // resize (bottom-right, width-only; body height follows content)
    el.querySelector('.ws-node-resize')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); e.preventDefault();
      const startW = n.w, sx = e.clientX;
      const onMove = (ev) => {
        n.w = clamp(startW + (ev.clientX - sx) / state.camera.z, 140, 1400);
        el.style.width = n.w + 'px';
        renderEdges();
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        scheduleSave();
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });

    // edge port drag
    el.querySelector('.ws-node-port')?.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); e.preventDefault();
      startEdgeDrag(n, e);
    });

    // double-click body → editor for figures
    el.addEventListener('dblclick', (e) => {
      if (e.target.closest('.ws-node-title') || e.target.closest('[contenteditable="true"]') ||
          e.target.closest('.ws-node-actions') || e.target.closest('.ws-node-port')) return;
      if (n.type === 'figure') openInEditor(n);
    });
  }

  function bringToFront(n) {
    nodesEl().appendChild(n.el);
  }

  /* ---------------- selection ---------------- */
  function selectNode(id, additive) {
    if (!additive) state.sel.clear();
    state.selEdge = null;
    if (additive && state.sel.has(id)) state.sel.delete(id);
    else state.sel.add(id);
    refreshSelectionUI();
  }

  function clearSelection() {
    state.sel.clear(); state.selEdge = null;
    refreshSelectionUI();
  }

  function refreshSelectionUI() {
    state.nodes.forEach(n => n.el?.classList.toggle('selected', state.sel.has(n.id)));
    edgesEl().querySelectorAll('path.edge-line').forEach(p => {
      p.classList.toggle('selected', p.dataset.id === state.selEdge);
    });
  }

  /* ---------------- edges ---------------- */
  function nodeAnchor(n, side) {
    const h = n.el ? n.el.offsetHeight : 240;
    return side === 'out' ? { x: n.x + n.w, y: n.y + h / 2 } : { x: n.x, y: n.y + h / 2 };
  }

  function edgePath(a, b) {
    const dx = b.x - a.x;
    const c1 = { x: a.x + Math.max(Math.abs(dx) * 0.45, 36) * Math.sign(dx || 1), y: a.y };
    const c2 = { x: b.x - Math.max(Math.abs(dx) * 0.45, 36) * Math.sign(dx || 1), y: b.y };
    return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
  }

  function renderEdges() {
    const svg = edgesEl();
    svg.innerHTML = '';
    state.edges.forEach(e => {
      const a = nodeById(e.from), b = nodeById(e.to);
      if (!a?.el || !b?.el) return;
      const d = edgePath(nodeAnchor(a, 'out'), nodeAnchor(b, 'in'));
      const hit = document.createElementNS(SVGNS, 'path');
      hit.setAttribute('class', 'edge-hit'); hit.setAttribute('d', d);
      hit.dataset.edge = e.id;
      hit.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        state.selEdge = e.id; state.sel.clear(); refreshSelectionUI();
      });
      hit.addEventListener('dblclick', (ev) => { ev.stopPropagation(); deleteEdge(e.id); });
      const line = document.createElementNS(SVGNS, 'path');
      line.setAttribute('class', 'edge-line'); line.setAttribute('d', d);
      line.dataset.id = e.id;
      svg.appendChild(hit); svg.appendChild(line);
    });
  }

  function addEdge(fromId, toId) {
    if (fromId === toId) return;
    if (state.edges.some(e => e.from === fromId && e.to === toId)) { toast('这条连线已存在'); return; }
    // prevent cycles: simple DFS from toId
    if (reachable(toId, fromId)) { toast('⤴ 不能建立循环引用'); return; }
    state.edges.push({ id: uid('e'), from: fromId, to: toId });
    renderEdges(); refreshSelectionUI(); scheduleSave();
  }

  function reachable(fromId, targetId) {
    const seen = new Set();
    const stack = [fromId];
    while (stack.length) {
      const cur = stack.pop();
      if (cur === targetId) return true;
      if (seen.has(cur)) continue;
      seen.add(cur);
      state.edges.filter(e => e.from === cur).forEach(e => stack.push(e.to));
    }
    return false;
  }

  function deleteEdge(id) {
    state.edges = state.edges.filter(e => e.id !== id);
    if (state.selEdge === id) state.selEdge = null;
    renderEdges(); refreshSelectionUI(); scheduleSave();
  }

  function startEdgeDrag(sourceNode, ev) {
    const ghost = document.createElementNS(SVGNS, 'path');
    ghost.setAttribute('class', 'edge-ghost');
    edgesEl().appendChild(ghost);
    const move = (e2) => {
      const p = screenToWorld(e2.clientX, e2.clientY);
      ghost.setAttribute('d', edgePath(nodeAnchor(sourceNode, 'out'), p));
    };
    const up = (e2) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      ghost.remove();
      const targetEl = document.elementFromPoint(e2.clientX, e2.clientY)?.closest('.ws-node');
      if (targetEl && targetEl.dataset.id !== sourceNode.id) addEdge(sourceNode.id, targetEl.dataset.id);
    };
    move(ev);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  /* ---------------- node CRUD ---------------- */
  function addNode(type, opts = {}) {
    const n = {
      id: uid('n'), type,
      x: opts.x ?? 0, y: opts.y ?? 0,
      w: opts.w ?? (type === 'note' ? 240 : type === 'text' ? 220 : 340),
      title: opts.title || TYPE_NAME[type],
      svg: opts.svg || null, src: opts.src || null,
      text: opts.text || null, color: opts.color || null, hue: opts.hue || null,
    };
    state.nodes.push(n);
    renderNode(n);
    $('ws-empty').classList.add('hidden');
    renderEdges(); scheduleSave();
    return n;
  }

  function deleteNodes(ids) {
    ids.forEach(id => {
      const n = nodeById(id);
      if (n) { n.el?.remove(); }
      state.edges = state.edges.filter(e => e.from !== id && e.to !== id);
    });
    state.nodes = state.nodes.filter(n => !ids.includes(n.id));
    state.sel.clear();
    if (!state.nodes.length) $('ws-empty').classList.remove('hidden');
    renderEdges(); scheduleSave();
  }

  function duplicateNodes(ids) {
    const clones = [];
    ids.forEach(id => {
      const n = nodeById(id);
      if (!n) return;
      clones.push(addNode(n.type, { ...n, x: n.x + 28, y: n.y + 28, title: (n.title || '') + ' 副本' }));
    });
    if (clones.length) {
      state.sel = new Set(clones.map(c => c.id));
      refreshSelectionUI();
      toast('⧉ 已复制 ' + clones.length + ' 个节点');
    }
  }

  function nudge(dx, dy) {
    state.sel.forEach(id => {
      const n = nodeById(id);
      if (n) { n.x += dx; n.y += dy; n.el.style.left = n.x + 'px'; n.el.style.top = n.y + 'px'; }
    });
    renderEdges(); scheduleSave();
  }

  /* ---------------- stage pointer interactions ---------------- */
  let spaceDown = false;

  function wireStage() {
    const v = view();

    v.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.shiftKey) { // horizontal pan (trackpad friendly)
        state.camera.x -= (e.deltaY + e.deltaX);
        applyCamera();
      } else {
        zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
      }
    }, { passive: false });

    v.addEventListener('pointerdown', (e) => {
      if (e.button === 1 || spaceDown || state.tool === 'hand') {
        startPan(e); return;
      }
      if (e.button !== 0) return;
      if (e.target === v || e.target === world() || e.target === nodesEl() || e.target === edgesEl()) {
        startMarquee(e);
      }
    });

    v.addEventListener('dblclick', (e) => {
      if (e.target === v || e.target === world() || e.target === nodesEl()) {
        $('ws-prompt-input').focus();
      }
    });

    // keyboard
    document.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('mode-canvas')) return;
      const tag = e.target.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
      if (e.code === 'Space' && !typing) {
        spaceDown = true; v.classList.add('tool-hand');
        if (!typing) e.preventDefault();
      }
      if (typing) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (state.selEdge) deleteEdge(state.selEdge);
        else if (state.sel.size) deleteNodes([...state.sel]);
      } else if (ctrl && e.key === 'd') {
        e.preventDefault(); duplicateNodes([...state.sel]);
      } else if (ctrl && e.key === 'a') {
        e.preventDefault(); state.sel = new Set(state.nodes.map(n => n.id)); refreshSelectionUI();
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft') nudge(-d, 0);
        else if (e.key === 'ArrowRight') nudge(d, 0);
        else if (e.key === 'ArrowUp') nudge(0, -d);
        else nudge(0, d);
      } else if (e.key === 'Escape') {
        clearSelection(); closePlaza();
        document.getElementById('help-modal')?.classList.add('hidden');
      } else if (e.key === '?') {
        document.getElementById('help-modal')?.classList.toggle('hidden');
      } else if (e.key === '0' && ctrl) {
        e.preventDefault(); fitToNodes();
      } else if ((e.key === '=' || e.key === '+') && ctrl) {
        e.preventDefault(); zoomCenter(1.2);
      } else if (e.key === '-' && ctrl) {
        e.preventDefault(); zoomCenter(1 / 1.2);
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') { spaceDown = false; view().classList.remove('tool-hand'); }
    });

    // paste image onto canvas
    document.addEventListener('paste', (e) => {
      if (!document.body.classList.contains('mode-canvas')) return;
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      const items = [...((e.clipboardData && e.clipboardData.items) || [])];
      const imgItem = items.find(i => i.type && i.type.startsWith('image/'));
      if (!imgItem) return;
      e.preventDefault();
      const file = imgItem.getAsFile();
      const reader = new FileReader();
      reader.onload = ev => {
        const p = viewportCenterWorld();
        addNode('image', { src: ev.target.result, x: p.x, y: p.y, title: '粘贴的图片' });
        toast('🖼 图片已贴入画布');
      };
      reader.readAsDataURL(file);
    });
  }

  function startPan(e) {
    const v = view();
    v.classList.add('panning');
    const sx = e.clientX, sy = e.clientY, ox = state.camera.x, oy = state.camera.y;
    const onMove = (ev) => {
      state.camera.x = ox + (ev.clientX - sx);
      state.camera.y = oy + (ev.clientY - sy);
      applyCamera();
    };
    const onUp = () => {
      v.classList.remove('panning');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function startMarquee(e) {
    const v = view();
    const r = v.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const box = $('ws-marquee');
    box.classList.remove('hidden');
    let moved = false;
    const onMove = (ev) => {
      moved = true;
      const cx = ev.clientX - r.left, cy = ev.clientY - r.top;
      const x = Math.min(mx, cx), y = Math.min(my, cy);
      const w = Math.abs(cx - mx), h = Math.abs(cy - my);
      box.style.left = x + 'px'; box.style.top = y + 'px';
      box.style.width = w + 'px'; box.style.height = h + 'px';
    };
    const onUp = (ev) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      box.classList.add('hidden');
      if (!moved) { clearSelection(); return; }
      const cx = ev.clientX - r.left, cy = ev.clientY - r.top;
      const sx = Math.min(mx, cx), sy = Math.min(my, cy);
      const ex = Math.max(mx, cx), ey = Math.max(my, cy);
      state.sel = new Set();
      state.nodes.forEach(n => {
        const h = n.el ? n.el.offsetHeight : 240;
        const nx = n.x * state.camera.z + state.camera.x;
        const ny = n.y * state.camera.z + state.camera.y;
        const nw = n.w * state.camera.z, nh = h * state.camera.z;
        if (nx < ex && nx + nw > sx && ny < ey && ny + nh > sy) state.sel.add(n.id);
      });
      state.selEdge = null;
      refreshSelectionUI();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function viewportCenterWorld() {
    const r = view().getBoundingClientRect();
    return screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
  }

  /* ---------------- one-sentence generation ---------------- */
  const KEYWORDS = [
    [['生存', 'kaplan', 'km '], 'km'], [['火山', 'volcano'], 'volcano'],
    [['森林', 'meta', 'or ', 'odds'], 'forest'], [['热图', 'heatmap', '聚类'], 'heatmap'],
    [['小提琴', 'violin'], 'violin'], [['箱线', '箱形', 'box'], 'box'],
    [['环形', 'donut', '饼', '占比', '组成', '比例'], 'pie'],
    [['散点', '相关', '回归', 'scatter'], 'scatter'],
    [['分组', '两两', '多组比较'], 'grouped-bar'],
    [['多折线', '多条', 'multi'], 'multi-line'],
    [['柱', 'bar', '均值', '差异'], 'bar'], [['折线', '趋势', 'line'], 'line'],
    [['面积', 'area'], 'area'],
  ];

  function matchTemplate(desc) {
    const d = desc.toLowerCase();
    for (const [words, key] of KEYWORDS) {
      if (words.some(w => d.includes(w))) {
        const t = window.getTemplate && getTemplate(key);
        if (t) return t;
      }
    }
    const charts = getChartTemplates();
    const keys = Object.keys(charts);
    return charts[keys[Math.floor(Math.random() * keys.length)]];
  }

  function setSteps(steps) {
    const el = $('ws-prompt-steps');
    el.innerHTML = '';
    steps.forEach((s, i) => {
      const chip = document.createElement('span');
      chip.className = 'ws-step-chip' + (i < steps.length - 1 ? ' done' : ' running');
      chip.textContent = s;
      el.appendChild(chip);
    });
  }

  function clearSteps() { $('ws-prompt-steps').innerHTML = ''; }

  async function generateFromPrompt() {
    const input = $('ws-prompt-input');
    const desc = input.value.trim();
    if (!desc) { input.focus(); return; }
    const btn = $('ws-prompt-go');
    btn.disabled = true;
    input.value = '';
    const paletteKey = $('ws-prompt-palette').value;

    const p = viewportCenterWorld();
    const jitter = (Math.random() - 0.5) * 60;
    const node = addNode('figure', {
      x: p.x - 170 + jitter, y: p.y - 140 + jitter, w: 340,
      title: desc.length > 26 ? desc.slice(0, 26) + '…' : desc,
      svg: genPlaceholderSVG(),
    });
    state.sel = new Set([node.id]); refreshSelectionUI();
    selectNode(node.id, false);

    try {
      let svg = null;
      if (AIGenerate.isConfigured()) {
        setSteps(['解析意图', '设计布局', 'AI 生成图形']);
        svg = await callAI(desc, paletteKey);
      }
      if (!svg) {
        setSteps(['解析意图', '匹配出版级模板', '渲染图形']);
        await sleep(420);
        svg = matchTemplate(desc).svg;
      }
      node.svg = sanitizeSVG(svg);
      rerenderNode(node);
      fitToNodes();
      toast(AIGenerate.isConfigured() ? '✨ 图表已生成到画布' : '✨ 已用内置出版级模板生成（⚙ 可配置 AI 接口）');
    } catch (err) {
      node.svg = matchTemplate(desc).svg;
      rerenderNode(node);
      toast('❌ AI 生成失败，已回退到模板：' + err.message);
    } finally {
      btn.disabled = false;
      clearSteps();
      scheduleSave();
    }
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function genPlaceholderSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><rect width="400" height="280" fill="#ffffff" rx="10"/><circle cx="200" cy="128" r="22" fill="none" stroke="#2bb8ab" stroke-width="3.5" stroke-dasharray="52 14" style="animation:ws-spin 0.9s linear infinite;transform-origin:200px 128px"/><text x="200" y="178" text-anchor="middle" font-family="Arial" font-size="11" fill="#8a94ab">正在生成…</text></svg>`;
  }

  function sanitizeSVG(svg) {
    let s = String(svg).replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();
    const m = s.match(/<svg[\s\S]*<\/svg>/);
    return m ? m[0] : s;
  }

  async function callAI(desc, paletteKey) {
    const apiBase = localStorage.getItem('ff_api_base');
    const apiKey = localStorage.getItem('ff_api_key');
    const apiModel = localStorage.getItem('ff_api_model') || 'gpt-4o';
    if (!apiBase || !apiKey) return null;
    const palette = (window.getPaletteList ? getPaletteList() : []).find(p => p.key === paletteKey);
    const paletteColors = palette ? palette.name + ': ' + (palette.defaultSequence || []).join(', ') : '';
    const user = `Generate an SVG figure based on this description:\n${desc}\n\n` +
      (paletteColors ? `Use this color palette — ${paletteColors}\n` : '') +
      `\nGenerate a complete, valid SVG with viewBox="0 0 400 280". Realistic data values, proper axes, labels, frameless legend.`;
    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: AIGenerate.SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });
    if (!resp.ok) throw new Error('API ' + resp.status);
    const data = await resp.json();
    return sanitizeSVG(data.choices[0].message.content);
  }

  /* ---------------- plaza ---------------- */
  const ATLASES = [
    ['showcase', '基础图鉴 · 12格'], ['showcase-pro', 'Pro 图鉴 · 6格'], ['showcase-bio', 'Bio 图鉴 · 12格'],
    ['showcase-extra', 'Extra · 8格'], ['showcase-plus', 'Plus · 9格'], ['showcase-ultra', 'Ultra · 9格'],
    ['showcase-max', 'Max · 9格'], ['showcase-nova', 'Nova · 9格'], ['showcase-apex', 'Apex · 9格'],
  ];
  const atlasCache = {};

  function buildPlaza() {
    const body = $('ws-plaza-body');

    // quick actions row
    const sec0 = document.createElement('div');
    sec0.className = 'ws-plaza-sec';
    sec0.textContent = '快速添加';
    body.appendChild(sec0);
    const row = document.createElement('div');
    row.className = 'ws-plaza-row';
    const QA_ICONS = {
      note: '<svg viewBox="0 0 24 24"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>',
      text: '<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
      image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
    };
    [['note', '便签', () => addSticky()], ['text', '文本', () => addTextNote()], ['image', '图片', () => $('ws-file-img').click()]]
      .forEach(([key, label, fn]) => {
        const it = document.createElement('div');
        it.className = 'ws-plaza-item';
        it.innerHTML = `<div class="ws-plaza-thumb">${QA_ICONS[key]}</div><div class="ws-plaza-label">${label}</div>`;
        it.addEventListener('click', fn);
        row.appendChild(it);
      });
    body.appendChild(row);

    // showcase atlases
    const sec1 = document.createElement('div');
    sec1.className = 'ws-plaza-sec';
    sec1.textContent = '图鉴 · 83 面板灵感库';
    body.appendChild(sec1);
    const grid1 = document.createElement('div');
    grid1.className = 'ws-plaza-grid';
    ATLASES.forEach(([key, label]) => {
      const it = document.createElement('div');
      it.className = 'ws-plaza-item';
      it.innerHTML = `<div class="ws-plaza-thumb"><span class="ws-plaza-spinner">◌</span></div><div class="ws-plaza-label">${label}</div>`;
      it.addEventListener('click', () => insertAtlas(key));
      grid1.appendChild(it);
      // lazy thumbnail
      getAtlasSVG(key).then(svg => {
        const thumb = it.querySelector('.ws-plaza-thumb');
        if (thumb && svg) thumb.innerHTML = svg;
      });
    });
    body.appendChild(grid1);

    // built-in templates
    const sec2 = document.createElement('div');
    sec2.className = 'ws-plaza-sec';
    sec2.textContent = '出版级模板';
    body.appendChild(sec2);
    const grid2 = document.createElement('div');
    grid2.className = 'ws-plaza-grid';
    Object.entries(getChartTemplates()).forEach(([key, t]) => {
      const it = document.createElement('div');
      it.className = 'ws-plaza-item';
      it.innerHTML = `<div class="ws-plaza-thumb">${t.svg}</div><div class="ws-plaza-label">${t.icon} ${t.name}</div>`;
      it.addEventListener('click', () => {
        const p = viewportCenterWorld();
        addNode('figure', { svg: t.svg, x: p.x - 170, y: p.y - 140, w: 340, title: t.name });
        toast('📥 已放入画布：' + t.name);
      });
      grid2.appendChild(it);
    });
    body.appendChild(grid2);
  }

  async function getAtlasSVG(key) {
    if (atlasCache[key]) return atlasCache[key];
    try {
      const resp = await fetch(`../assets/${key}.svg`);
      if (!resp.ok) throw new Error(resp.status);
      const svg = await resp.text();
      atlasCache[key] = svg;
      return svg;
    } catch (e) { return null; }
  }

  async function insertAtlas(key) {
    const label = (ATLASES.find(a => a[0] === key) || [])[1] || key;
    const p = viewportCenterWorld();
    const svg = atlasCache[key] || await getAtlasSVG(key);
    if (!svg) { toast('❌ 图鉴加载失败（请通过本地服务器访问）'); return; }
    const n = addNode('figure', { svg, x: p.x - 170, y: p.y - 140, w: 300, title: label });
    // showcase svgs are ~1080 wide and very tall — scale width to keep node reasonable
    n.w = 300;
    n.el.style.width = '300px';
    renderEdges(); scheduleSave();
    toast('📥 已放入画布：' + label);
  }

  const NOTE_HUES = ['honey', 'mint', 'rose', 'lilac'];
  function addSticky() {
    const p = viewportCenterWorld();
    addNode('note', { x: p.x - 120, y: p.y - 90, text: '记点什么…', title: '便签',
      hue: NOTE_HUES[(state.noteHueSeq = (state.noteHueSeq || 0) + 1) % NOTE_HUES.length] });
  }
  function addTextNote() {
    const p = viewportCenterWorld();
    addNode('text', { x: p.x - 60, y: p.y - 20, text: '一段文字', title: '文本' });
  }

  function togglePlaza(open) {
    $('ws-plaza').classList.toggle('open', open);
  }
  function closePlaza() { $('ws-plaza').classList.remove('open'); }

  function wireImageUpload() {
    $('ws-file-img').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const p = viewportCenterWorld();
        addNode('image', { src: ev.target.result, x: p.x - 160, y: p.y - 120, title: file.name });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  /* ---------------- editor round-trip ---------------- */
  function openInEditor(n) {
    state.editingNodeId = n.id;
    setMode('editor');
    try {
      if (window.Canvas && n.svg) Canvas.loadSVG(n.svg);
      if (window.History) History.clear();
      toast('✏️ 编辑完成后点顶部「🪟 画布」返回，改动会写回节点');
    } catch (e) { console.warn(e); }
  }

  function writeBackFromEditor() {
    const n = state.editingNodeId && nodeById(state.editingNodeId);
    if (!n) return;
    try {
      if (window.Canvas && n.svg !== undefined) {
        const svg = Canvas.getSVGMarkup();
        if (svg) { n.svg = svg; rerenderNode(n); }
      }
    } catch (e) { console.warn(e); }
    state.editingNodeId = null;
    scheduleSave();
  }

  /* ---------------- mode switching ---------------- */
  function setMode(mode) {
    if (mode === 'canvas' && state.mode === 'canvas') return;
    if (mode === 'editor' && state.mode === 'editor') return;
    if (mode === 'canvas') {
      // write any in-editor changes back to the node we came from
      if (state.mode === 'editor') writeBackFromEditor();
      state.mode = 'canvas';
      document.body.classList.add('mode-canvas');
      syncModeButtons();
      requestAnimationFrame(() => { applyCamera(); renderEdges(); });
    } else {
      state.mode = 'editor';
      document.body.classList.remove('mode-canvas');
      syncModeButtons();
      // fresh editor view of the editing node (or keep session as-is)
    }
  }

  function syncModeButtons() {
    $('btn-mode-canvas')?.classList.toggle('active', state.mode === 'canvas');
    $('btn-mode-editor')?.classList.toggle('active', state.mode === 'editor');
  }

  /* ---------------- init ---------------- */
  function seedWelcome() {
    addNode('note', {
      x: 80, y: 70, w: 260,
      text: '👋 欢迎来到 FigureForge 画布\n\n· 下方输入一句话，直接生成图表\n· 打开左侧 🧰 素材广场，83 面板随取随用\n· 拖动节点右侧的圆点，建立参考连线\n· 双击图表节点 → 进编辑器精修',
      title: '开始指南', hue: 'mint',
    });
  }

  function init() {
    const had = restore();
    // render all nodes
    state.nodes.forEach(renderNode);
    if (state.nodes.length) $('ws-empty').classList.add('hidden');
    else seedWelcome();

    buildPlaza();
    wireStage();
    wireImageUpload();
    wireChrome();
    syncModeButtons();

    // ?mode=editor / #editor starts in the single-figure editor view
    const startInEditor = location.hash === '#editor' ||
      new URLSearchParams(location.search).get('mode') === 'editor';
    if (startInEditor) {
      state.mode = 'editor';
      syncModeButtons();
    } else {
      document.body.classList.add('mode-canvas');
      state.mode = 'canvas';
    }
    requestAnimationFrame(applyCamera);

    console.log('FigureForge workspace ready ✅ (' + state.nodes.length + ' nodes, ' + state.edges.length + ' edges)');
  }

  function wireChrome() {
    // toolbar tools
    document.querySelectorAll('#ws-toolbar .ws-tool[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tool = btn.dataset.tool;
        document.querySelectorAll('#ws-toolbar .ws-tool[data-tool]').forEach(b => b.classList.toggle('active', b === btn));
        view().classList.toggle('tool-hand', state.tool === 'hand');
      });
    });
    $('ws-tool-note')?.addEventListener('click', addSticky);
    $('ws-tool-text')?.addEventListener('click', addTextNote);
    $('ws-tool-image')?.addEventListener('click', () => $('ws-file-img').click());
    $('ws-tool-plaza')?.addEventListener('click', () => togglePlaza(!$('ws-plaza').classList.contains('open')));
    $('ws-plaza-close')?.addEventListener('click', closePlaza);

    // zoom cluster
    $('ws-zoom-in')?.addEventListener('click', () => zoomCenter(1.2));
    $('ws-zoom-out')?.addEventListener('click', () => zoomCenter(1 / 1.2));
    $('ws-zoom-fit')?.addEventListener('click', fitToNodes);
    $('ws-zoom-level')?.addEventListener('click', () => { state.camera.z = 1; applyCamera(); });

    // prompt bar
    $('ws-prompt-go')?.addEventListener('click', generateFromPrompt);
    $('ws-prompt-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateFromPrompt(); }
      e.stopPropagation();
    });

    // mode switch
    $('btn-mode-canvas')?.addEventListener('click', () => setMode('canvas'));
    $('btn-mode-editor')?.addEventListener('click', () => setMode('editor'));

    // palette select
    const sel = $('ws-prompt-palette');
    if (sel && window.getPaletteList) {
      sel.innerHTML = '';
      getPaletteList().forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.key; opt.textContent = p.name;
        sel.appendChild(opt);
      });
      sel.value = (window.App && App.state && App.state.activePalette) || 'candy';
    }

    // empty hero chips
    document.querySelectorAll('.ws-empty-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const act = chip.dataset.act;
        if (act === 'plaza') togglePlaza(true);
        else if (act === 'note') addSticky();
        $('ws-prompt-input').focus();
      });
    });
  }

  return { init, setMode, addNode, addEdge, fitToNodes, generateFromPrompt, state };
})();
window.Workspace = Workspace;

document.addEventListener('DOMContentLoaded', () => Workspace.init());
