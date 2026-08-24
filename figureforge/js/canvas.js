/**
 * FigureForge — Canvas Direct Manipulation Engine
 *
 * Selection: click / Shift+click multi-select / rubber-band marquee.
 * Smart alignment guides (BioRender/Figma style) with Alt bypass.
 * Grouping (Ctrl+G), ungrouping (Ctrl+Shift+G), inline text edit,
 * arrow-key nudge, wheel zoom, external file drop.
 */
const Canvas = (function () {
  let svgEl = null;
  let selection = [];          // ordered selected elements (last = active)
  let zoom = 1;
  let vbW = 400;
  let vbH = 280;
  let showGrid = true;
  let snapEnabled = true;

  const SNAP_DIST_PX = 6;
  const GRID_SIZE = 5;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 8;
  const SVGNS = 'http://www.w3.org/2000/svg';

  let isDragging = false;
  let dragStart = null;
  let dragStartState = [];     // [{el, pos, bbox}]
  let dragMoved = false;

  let rubber = null;           // marquee {x0,y0,x1,y1} svg coords
  let activeGuides = [];

  // ── Load SVG markup into canvas ──
  function loadSVG(svgMarkup) {
    const container = document.getElementById('svg-canvas');
    const empty = document.getElementById('canvas-empty');
    container.innerHTML = svgMarkup;
    container.classList.remove('hidden');
    empty.classList.add('hidden');
    svgEl = container.querySelector('svg');
    if (showGrid) container.classList.add('show-grid');
    else container.classList.remove('show-grid');
    selection = [];
    hideGuides();
    closeContextMenu();
    const vb = parseViewBox();
    vbW = vb.w; vbH = vb.h;
    zoom = 1;
    updateSelectionOverlay();
    attachSVGListeners();
    wireDrop();
    fitToView();
  }

  function parseViewBox() {
    if (!svgEl) return { w: 400, h: 280 };
    const parts = (svgEl.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) return { w: parts[2], h: parts[3] };
    return { w: parseFloat(svgEl.getAttribute('width')) || 400, h: parseFloat(svgEl.getAttribute('height')) || 280 };
  }

  function getSVGMarkup() {
    if (!svgEl) return '';
    return new XMLSerializer().serializeToString(svgEl);
  }

  function getSVGElement() { return svgEl; }

  function attachSVGListeners() {
    if (!svgEl) return;
    svgEl.addEventListener('mousedown', onCanvasMouseDown);
    svgEl.addEventListener('dblclick', onCanvasDblClick);
    svgEl.addEventListener('contextmenu', onContextMenu);
    svgEl.addEventListener('wheel', onWheel, { passive: false });
  }

  function onWheel(e) {
    if (!svgEl) return;
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
  }

  // ── Selection ──
  function setSelection(els) {
    selection.forEach(el => el.removeAttribute('data-selected'));
    selection = (els || []).filter(Boolean);
    selection.forEach(el => el.setAttribute('data-selected', 'true'));
    notifySelectionChanged();
  }

  function selectElement(el) { setSelection(el ? [el] : []); }

  function toggleInSelection(el) {
    if (selection.includes(el)) setSelection(selection.filter(x => x !== el));
    else setSelection([...selection, el]);
  }

  function addToSelection(els) {
    const merged = [...selection];
    els.forEach(el => { if (!merged.includes(el)) merged.push(el); });
    setSelection(merged);
  }

  function getSelection() { return selection.slice(); }
  function getSelected() { return selection.length ? selection[selection.length - 1] : null; }
  function deselect() { setSelection([]); }

  function notifySelectionChanged() {
    updateSelectionOverlay();
    const el = getSelected();
    if (window.__ffOnSelectionChanged) window.__ffOnSelectionChanged(el);
    else if (window.Properties) Properties.onSelectionChanged(el);
  }

  // ── Coordinates ──
  function getMousePos(e) {
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  function toContainerOffset(x, y) {
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    const scaleX = svgRect.width / vbW;
    const scaleY = svgRect.height / vbH;
    return {
      x: svgRect.left - containerRect.left + x * scaleX,
      y: svgRect.top - containerRect.top + y * scaleY,
    };
  }

  function currentScale() {
    const svgRect = svgEl.getBoundingClientRect();
    return { sx: svgRect.width / vbW, sy: svgRect.height / vbH };
  }

  function findEditableElement(node) {
    while (node && node !== svgEl) {
      if (node.nodeType === 1 && node.getAttribute && node.getAttribute('data-edit') === 'true') return node;
      node = node.parentNode;
    }
    return null;
  }

  function getWorldBBox(el) {
    let b;
    try { b = el.getBBox(); } catch (e) { b = { x: 0, y: 0, width: 0, height: 0 }; }
    let dx = 0, dy = 0;
    const tr = el.getAttribute('transform');
    if (tr) {
      const m = /translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\)/.exec(tr);
      if (m) { dx = parseFloat(m[1]); dy = m[2] ? parseFloat(m[2]) : 0; }
    }
    return { x: b.x + dx, y: b.y + dy, w: b.width, h: b.height };
  }

  function unionBBox(boxes) {
    if (!boxes.length) return { x: 0, y: 0, w: 0, h: 0 };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    boxes.forEach(b => {
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
    });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  function getElementPosition(el) {
    const tag = el.tagName;
    if (tag === 'circle' || tag === 'ellipse')
      return { x: parseFloat(el.getAttribute('cx')) || 0, y: parseFloat(el.getAttribute('cy')) || 0 };
    if (tag === 'line')
      return { x: parseFloat(el.getAttribute('x1')) || 0, y: parseFloat(el.getAttribute('y1')) || 0 };
    return { x: parseFloat(el.getAttribute('x')) || 0, y: parseFloat(el.getAttribute('y')) || 0 };
  }

  function applyTranslate(el, dx, dy) {
    const t = el.tagName;
    const num = a => parseFloat(el.getAttribute(a)) || 0;
    if (t === 'text' || t === 'tspan' || t === 'rect' || t === 'image' || t === 'foreignObject') {
      el.setAttribute('x', num('x') + dx);
      el.setAttribute('y', num('y') + dy);
    } else if (t === 'circle' || t === 'ellipse') {
      el.setAttribute('cx', num('cx') + dx);
      el.setAttribute('cy', num('cy') + dy);
    } else if (t === 'line') {
      el.setAttribute('x1', num('x1') + dx); el.setAttribute('x2', num('x2') + dx);
      el.setAttribute('y1', num('y1') + dy); el.setAttribute('y2', num('y2') + dy);
    } else if (t === 'polyline' || t === 'polygon') {
      const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      for (let i = 0; i + 1 < pts.length; i += 2) { pts[i] += dx; pts[i + 1] += dy; }
      el.setAttribute('points', pts.join(','));
    } else {
      let ox = 0, oy = 0;
      const tr = el.getAttribute('transform');
      if (tr) {
        const m = /translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\)/.exec(tr);
        if (m) { ox = parseFloat(m[1]); oy = m[2] ? parseFloat(m[2]) : 0; }
      }
      el.setAttribute('transform', `translate(${ox + dx} ${oy + dy})`);
    }
  }

  function setElementPosition(el, newX, newY) {
    const cur = getElementPosition(el);
    applyTranslate(el, newX - cur.x, newY - cur.y);
  }

  // ── Selection overlay ──
  function updateSelectionOverlay() {
    const overlay = document.getElementById('selection-overlay');
    const guidesSvg = document.getElementById('guides-overlay');
    if (guidesSvg) guidesSvg.querySelectorAll('.member-rect,.rubber-rect').forEach(r => r.remove());
    if (!selection.length || !svgEl) {
      if (overlay) overlay.classList.remove('active');
      return;
    }
    try {
      const boxes = selection.map(getWorldBBox);
      const union = unionBBox(boxes);
      const tl = toContainerOffset(union.x, union.y);
      const scale = currentScale();
      if (overlay) {
        overlay.style.left = tl.x + 'px';
        overlay.style.top = tl.y + 'px';
        overlay.style.width = (union.w * scale.sx) + 'px';
        overlay.style.height = (union.h * scale.sy) + 'px';
        overlay.classList.add('active');
      }
      if (guidesSvg && selection.length > 1) {
        boxes.forEach(b => {
          const r = document.createElementNS(SVGNS, 'rect');
          const p = toContainerOffset(b.x, b.y);
          r.setAttribute('x', p.x); r.setAttribute('y', p.y);
          r.setAttribute('width', b.w * scale.sx); r.setAttribute('height', b.h * scale.sy);
          r.setAttribute('class', 'member-rect');
          guidesSvg.appendChild(r);
        });
      }
    } catch (e) { /* non-rendered elements */ }
  }

  // ── Smart alignment guides ──
  function collectSnapTargets(excludeSet) {
    const xs = [], ys = [];
    [0, vbW / 2, vbW].forEach(v => xs.push({ v, src: null }));
    [0, vbH / 2, vbH].forEach(v => ys.push({ v, src: null }));
    svgEl.querySelectorAll('[data-edit="true"]').forEach(el => {
      if (excludeSet.has(el)) return;
      let anc = el.parentNode, skip = false;
      while (anc && anc !== svgEl) { if (excludeSet.has(anc)) { skip = true; break; } anc = anc.parentNode; }
      if (skip || !el.isConnected) return;
      const b = getWorldBBox(el);
      if (!b.w && !b.h) return;
      xs.push({ v: b.x, src: b }, { v: b.x + b.w / 2, src: b }, { v: b.x + b.w, src: b });
      ys.push({ v: b.y, src: b }, { v: b.y + b.h / 2, src: b }, { v: b.y + b.h, src: b });
    });
    return { xs, ys };
  }

  function bestSnap(movingEdges, targets, tol) {
    let best = null;
    for (const t of targets) {
      for (const me of movingEdges) {
        const d = t.v - me;
        const ad = Math.abs(d);
        if (ad <= tol && (!best || ad < best.ad)) {
          best = { ad, delta: d, guidePos: t.v, targetBBox: t.src };
        }
      }
    }
    return best;
  }

  function renderGuideLines(guides) {
    const overlay = document.getElementById('guides-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.smart-guide').forEach(l => l.remove());
    activeGuides = guides;
    for (const g of guides) {
      const line = document.createElementNS(SVGNS, 'line');
      if (g.axis === 'v') {
        const p1 = toContainerOffset(g.pos, g.from);
        const p2 = toContainerOffset(g.pos, g.to);
        line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
      } else {
        const p1 = toContainerOffset(g.from, g.pos);
        const p2 = toContainerOffset(g.to, g.pos);
        line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
      }
      line.setAttribute('class', 'smart-guide');
      overlay.appendChild(line);
    }
  }

  function hideGuides() {
    activeGuides = [];
    const overlay = document.getElementById('guides-overlay');
    if (overlay) overlay.querySelectorAll('.smart-guide').forEach(l => l.remove());
  }

  // ── Mouse down ──
  function onCanvasMouseDown(e) {
    closeContextMenu();
    if (e.button !== 0) return;
    commitTextEdit();
    const target = findEditableElement(e.target);
    if (target) {
      if (e.shiftKey) toggleInSelection(target);
      else if (!selection.includes(target)) selectElement(target);
      startDrag(e);
    } else {
      if (!e.shiftKey) deselect();
      startRubber(e);
    }
    e.preventDefault();
  }

  function startDrag(e) {
    isDragging = true;
    dragMoved = false;
    dragStart = getMousePos(e);
    dragStartState = selection.map(el => ({ el, pos: getElementPosition(el), bbox: getWorldBBox(el) }));
    document.addEventListener('mousemove', onCanvasMouseMove);
    document.addEventListener('mouseup', onCanvasMouseUp);
  }

  function startRubber(e) {
    const p = getMousePos(e);
    rubber = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, additive: e.shiftKey };
    document.addEventListener('mousemove', onRubberMove);
    document.addEventListener('mouseup', onRubberUp);
  }

  function onRubberMove(e) {
    if (!rubber) return;
    const p = getMousePos(e);
    rubber.x1 = p.x; rubber.y1 = p.y;
    const overlay = document.getElementById('guides-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.rubber-rect').forEach(r => r.remove());
    const scale = currentScale();
    const a = toContainerOffset(Math.min(rubber.x0, rubber.x1), Math.min(rubber.y0, rubber.y1));
    const r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('x', a.x); r.setAttribute('y', a.y);
    r.setAttribute('width', Math.abs(rubber.x1 - rubber.x0) * scale.sx);
    r.setAttribute('height', Math.abs(rubber.y1 - rubber.y0) * scale.sy);
    r.setAttribute('class', 'rubber-rect');
    overlay.appendChild(r);
  }

  function onRubberUp() {
    document.removeEventListener('mousemove', onRubberMove);
    document.removeEventListener('mouseup', onRubberUp);
    if (!rubber) return;
    const overlay = document.getElementById('guides-overlay');
    if (overlay) overlay.querySelectorAll('.rubber-rect').forEach(r => r.remove());
    const rx0 = Math.min(rubber.x0, rubber.x1), rx1 = Math.max(rubber.x0, rubber.x1);
    const ry0 = Math.min(rubber.y0, rubber.y1), ry1 = Math.max(rubber.y0, rubber.y1);
    const tiny = Math.abs(rx1 - rx0) < 2 && Math.abs(ry1 - ry0) < 2;
    const hits = [];
    if (!tiny) {
      svgEl.querySelectorAll('[data-edit="true"]').forEach(el => {
        const b = getWorldBBox(el);
        if (b.x < rx1 && b.x + b.w > rx0 && b.y < ry1 && b.y + b.h > ry0) hits.push(el);
      });
    }
    if (rubber.additive) addToSelection(hits); else setSelection(hits);
    rubber = null;
  }

  function onCanvasMouseMove(e) {
    if (!isDragging || !selection.length) return;
    const pos = getMousePos(e);
    let dx = pos.x - dragStart.x;
    let dy = pos.y - dragStart.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
    if (!dragMoved) return;

    const union = unionBBox(dragStartState.map(s => s.bbox));
    let snapped = false;

    if (snapEnabled && !e.altKey) {
      const tol = SNAP_DIST_PX / Math.max(currentScale().sx, 0.0001);
      const m = { x: union.x + dx, y: union.y + dy, w: union.w, h: union.h };
      const exclude = new Set(selection);
      const targets = collectSnapTargets(exclude);
      const snapX = bestSnap([m.x, m.x + m.w / 2, m.x + m.w], targets.xs, tol);
      const snapY = bestSnap([m.y, m.y + m.h / 2, m.y + m.h], targets.ys, tol);
      const guides = [];
      if (snapX) {
        dx += snapX.delta; snapped = true;
        guides.push({ axis: 'v', pos: snapX.guidePos,
          from: Math.min(m.y, snapX.targetBBox ? snapX.targetBBox.y : 0),
          to: Math.max(m.y + m.h, snapX.targetBBox ? snapX.targetBBox.y + snapX.targetBBox.h : vbH) });
      }
      if (snapY) {
        dy += snapY.delta; snapped = true;
        guides.push({ axis: 'h', pos: snapY.guidePos,
          from: Math.min(m.x, snapY.targetBBox ? snapY.targetBBox.x : 0),
          to: Math.max(m.x + m.w, snapY.targetBBox ? snapY.targetBBox.x + snapY.targetBBox.w : vbW) });
      }
      if (snapped) renderGuideLines(guides); else hideGuides();
    }

    if (!snapped && snapEnabled && !e.altKey) {
      dx = Math.round(dx / GRID_SIZE) * GRID_SIZE;
      dy = Math.round(dy / GRID_SIZE) * GRID_SIZE;
    }

    dragStartState.forEach(s => setElementPosition(s.el, s.pos.x + dx, s.pos.y + dy));
    updateSelectionOverlay();
  }

  function onCanvasMouseUp() {
    if (isDragging && dragMoved && dragStartState.length) {
      const moves = dragStartState.map(s => ({ el: s.el, from: s.pos, to: getElementPosition(s.el) }))
        .filter(m => m.from.x !== m.to.x || m.from.y !== m.to.y);
      if (moves.length && window.History) {
        History.push({
          undo: () => moves.forEach(m => setElementPosition(m.el, m.from.x, m.from.y)),
          redo: () => moves.forEach(m => setElementPosition(m.el, m.to.x, m.to.y)),
          label: 'Move'
        });
      }
    }
    isDragging = false;
    dragMoved = false;
    dragStartState = [];
    hideGuides();
    document.removeEventListener('mousemove', onCanvasMouseMove);
    document.removeEventListener('mouseup', onCanvasMouseUp);
  }

  // ── Nudge with arrow keys ──
  function nudge(dx, dy) {
    if (!selection.length) return;
    const moves = selection.map(el => ({ el, from: getElementPosition(el) }));
    moves.forEach(m => setElementPosition(m.el, m.from.x + dx, m.from.y + dy));
    updateSelectionOverlay();
    if (window.History) {
      History.push({
        undo: () => moves.forEach(m => setElementPosition(m.el, m.from.x, m.from.y)),
        redo: () => moves.forEach(m => setElementPosition(m.el, m.from.x + dx, m.from.y + dy)),
        label: 'Nudge'
      });
    }
  }

  // ── Grouping ──
  function groupSelection() {
    if (selection.length < 2 || !svgEl) return;
    const parent = selection[0].parentNode;
    if (!parent || !selection.every(el => el.parentNode === parent)) {
      if (window.Export) Export.toast('只能成组同一层级的元素');
      return;
    }
    const anchor = selection[selection.length - 1].nextSibling;
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('data-edit', 'true');
    g.setAttribute('data-role', 'group');
    const members = selection.slice();
    parent.insertBefore(g, anchor); // insert first: members may be adjacent siblings
    members.forEach(el => { el.removeAttribute('data-edit'); el.removeAttribute('data-selected'); g.appendChild(el); });
    selectElement(g);
    if (window.History) {
      History.push({
        undo: () => { members.forEach(el => { parent.insertBefore(el, g); el.setAttribute('data-edit', 'true'); }); g.remove(); if (selection.includes(g)) setSelection(members); },
        redo: () => { members.forEach(el => g.appendChild(el)); parent.insertBefore(g, anchor); if (selection.length) selectElement(g); },
        label: 'Group'
      });
    }
  }

  function ungroupSelection() {
    const groups = selection.filter(el => el.tagName === 'g' && el.getAttribute('data-role') === 'group');
    if (!groups.length) return;
    const restored = [];
    const records = groups.map(g => {
      const parent = g.parentNode;
      const anchor = g.nextSibling;
      const members = [...g.children];
      members.forEach(el => { el.setAttribute('data-edit', 'true'); parent.insertBefore(el, g); restored.push(el); });
      parent.removeChild(g);
      return { parent, anchor, members, g };
    });
    setSelection(restored);
    if (window.History) {
      History.push({
        undo: () => { records.forEach(r => { r.members.forEach(el => { el.removeAttribute('data-edit'); r.g.appendChild(el); }); r.parent.insertBefore(r.g, r.anchor); }); if (records.length) selectElement(records.map(r => r.g)); },
        redo: () => { records.forEach(r => { r.members.forEach(el => { el.setAttribute('data-edit', 'true'); r.parent.insertBefore(el, r.g); }); r.parent.removeChild(r.g); }); setSelection(restored); },
        label: 'Ungroup'
      });
    }
  }

  // ── Insert text ──
  function insertText(x, y, str) {
    if (!svgEl) return null;
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('x', x === undefined ? vbW / 2 : x);
    t.setAttribute('y', y === undefined ? vbH / 2 : y);
    t.setAttribute('font-family', "'Arial',sans-serif");
    t.setAttribute('font-size', '10');
    t.setAttribute('fill', '#333333');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('data-edit', 'true');
    t.textContent = str || '文本 Text';
    svgEl.appendChild(t);
    selectElement(t);
    if (window.History) {
      History.push({
        undo: () => { if (t.parentNode) t.parentNode.removeChild(t); },
        redo: () => { svgEl.appendChild(t); },
        label: 'Insert Text'
      });
    }
    startTextEdit(t);
    return t;
  }

  // ── External file drop ──
  function wireDrop() {
    const area = document.getElementById('canvas-area');
    if (!area) return;
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drop-hover'); });
    area.addEventListener('dragleave', () => area.classList.remove('drop-hover'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('drop-hover');
      const files = [...(e.dataTransfer.files || [])];
      if (!files.length) return;
      if (window.__ffOnFilesDropped) window.__ffOnFilesDropped(files, getMousePos(e));
    });
  }

  // Embed a raster image (dataURL) as an <image> element at svg coords.
  function insertImage(dataURL, x, y) {
    if (!svgEl) return null;
    const img = document.createElementNS(SVGNS, 'image');
    const w = vbW * 0.5;
    img.setAttribute('x', x === undefined ? vbW * 0.25 : x);
    img.setAttribute('y', y === undefined ? vbH * 0.25 : y);
    img.setAttribute('width', w);
    img.setAttribute('data-edit', 'true');
    img.setAttribute('href', dataURL);
    svgEl.appendChild(img);
    selectElement(img);
    if (window.History) {
      History.push({
        undo: () => { if (img.parentNode) img.parentNode.removeChild(img); },
        redo: () => { svgEl.appendChild(img); },
        label: 'Insert Image'
      });
    }
    return img;
  }

  // ── Double-click: inline text edit ──
  function onCanvasDblClick(e) {
    const target = findEditableElement(e.target);
    if (!target) return;
    e.preventDefault();
    if (target.tagName === 'text') startTextEdit(target);
    else if (target.tagName === 'g' && target.getAttribute('data-role') === 'group') ungroupSelection();
  }

  let textEditing = null;

  function startTextEdit(textEl) {
    commitTextEdit();
    const editor = document.getElementById('text-editor');
    if (!editor) return;
    const bbox = getWorldBBox(textEl);
    const tl = toContainerOffset(bbox.x, bbox.y);
    const scale = currentScale();
    const fontSize = (parseFloat(textEl.getAttribute('font-size')) || 8) * scale.sy;
    editor.style.left = tl.x + 'px';
    editor.style.top = (tl.y - fontSize * 0.25) + 'px';
    editor.style.fontSize = fontSize + 'px';
    editor.style.fontFamily = textEl.getAttribute('font-family') || 'Arial, sans-serif';
    editor.style.fontWeight = textEl.getAttribute('font-weight') || 'normal';
    editor.style.color = textEl.getAttribute('fill') || '#333333';
    editor.style.minWidth = Math.max(bbox.w * scale.sx, 60) + 'px';
    editor.value = textEl.textContent;
    editor.classList.add('active');
    textEl.style.visibility = 'hidden';
    textEditing = { el: textEl, oldText: textEl.textContent };
    setTimeout(() => { editor.focus(); editor.select(); }, 0);
  }

  function commitTextEdit() {
    if (!textEditing) return;
    const editor = document.getElementById('text-editor');
    const { el, oldText } = textEditing;
    const newText = editor.value;
    editor.classList.remove('active');
    el.style.visibility = '';
    textEditing = null;
    if (newText !== oldText) {
      el.textContent = newText;
      if (window.History) {
        History.push({
          undo: () => { el.textContent = oldText; },
          redo: () => { el.textContent = newText; },
          label: 'Edit Text'
        });
      }
    }
    updateSelectionOverlay();
  }

  function cancelTextEdit() {
    if (!textEditing) return;
    const editor = document.getElementById('text-editor');
    editor.classList.remove('active');
    textEditing.el.style.visibility = '';
    textEditing = null;
  }

  function wireTextEditor() {
    const editor = document.getElementById('text-editor');
    if (!editor) return;
    editor.addEventListener('blur', () => commitTextEdit());
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); editor.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancelTextEdit(); }
      e.stopPropagation();
    });
  }

  // ── Context menu ──
  function onContextMenu(e) {
    e.preventDefault();
    const target = findEditableElement(e.target);
    if (target && !selection.includes(target)) {
      if (e.shiftKey) toggleInSelection(target); else selectElement(target);
    }
    openContextMenu(e.clientX, e.clientY);
  }

  function openContextMenu(pageX, pageY) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    menu.innerHTML = '';
    const el = getSelected();
    const many = selection.length > 1;
    const items = [];
    if (many) items.push({ label: '⛓ 成组 (Ctrl+G)', fn: groupSelection });
    if (el && el.tagName === 'g' && el.getAttribute('data-role') === 'group')
      items.push({ label: '⛓✕ 解组 (Ctrl+Shift+G)', fn: ungroupSelection });
    if (selection.length === 1 && el && el.tagName === 'text') items.push({ label: '✏️ 编辑文字', fn: () => startTextEdit(el) });
    if (selection.length) {
      items.push({ label: '⧉ 复制', fn: duplicateElement });
      items.push({ label: '⬆ 置顶', fn: () => raiseToTop(selection.slice()) });
      items.push({ label: '⬇ 置底', fn: () => lowerToBottom(selection.slice()) });
      items.push({ label: '🗑 删除', danger: true, fn: deleteElement });
    } else {
      items.push({ label: '✒️ 插入文本框', fn: () => insertText() });
    }
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'context-menu-item' + (it.danger ? ' danger' : '');
      div.textContent = it.label;
      div.addEventListener('click', () => { closeContextMenu(); it.fn(); });
      menu.appendChild(div);
    });
    menu.classList.remove('hidden');
    const area = document.getElementById('canvas-area').getBoundingClientRect();
    menu.style.left = (pageX - area.left) + 'px';
    menu.style.top = (pageY - area.top) + 'px';
  }

  function closeContextMenu() {
    const menu = document.getElementById('context-menu');
    if (menu) menu.classList.add('hidden');
  }

  function raiseToTop(els) {
    const parents = new Set(els.map(el => el.parentNode));
    if (parents.size !== 1 || !els.length) return;
    const parent = els[0].parentNode;
    const anchors = els.map(el => el.nextSibling);
    els.forEach(el => parent.appendChild(el));
    if (window.History) History.push({
      undo: () => { for (let i = els.length - 1; i >= 0; i--) parent.insertBefore(els[i], anchors[i]); },
      redo: () => els.forEach(el => parent.appendChild(el)),
      label: 'Raise'
    });
  }

  function lowerToBottom(els) {
    const parents = new Set(els.map(el => el.parentNode));
    if (parents.size !== 1 || !els.length) return;
    const parent = els[0].parentNode;
    const firsts = new Map();
    els.forEach(el => { const p = el.parentNode; if (!firsts.has(p)) firsts.set(p, p.firstChild); });
    const anchors = els.map(el => el.nextSibling);
    const first = parent.firstChild;
    [...els].reverse().forEach(el => parent.insertBefore(el, first));
    if (window.History) History.push({
      undo: () => { for (let i = els.length - 1; i >= 0; i--) parent.insertBefore(els[i], anchors[i]); },
      redo: () => { [...els].reverse().forEach(el => parent.insertBefore(el, first)); },
      label: 'Lower'
    });
  }

  // ── Delete / duplicate (multi) ──
  function deleteElement() {
    if (!selection.length) return;
    const els = selection.slice();
    const records = els.map(el => ({ parent: el.parentNode, anchor: el.nextSibling, el }));
    records.forEach(r => r.parent.removeChild(r.el));
    deselect();
    if (window.History) {
      History.push({
        undo: () => records.forEach(r => { if (!r.el.isConnected) r.parent.insertBefore(r.el, r.anchor); }),
        redo: () => records.forEach(r => { if (r.el.isConnected) r.parent.removeChild(r.el); }),
        label: 'Delete'
      });
    }
  }

  function duplicateElement() {
    if (!selection.length || !svgEl) return;
    const clones = selection.map(src => {
      const parent = src.parentNode;
      const anchor = src.nextSibling;
      const el = src.cloneNode(true);
      el.removeAttribute('data-selected');
      applyTranslate(el, 10, -10);
      parent.insertBefore(el, anchor);
      return { parent, anchor, el };
    });
    setSelection(clones.map(c => c.el));
    if (window.History) {
      History.push({
        undo: () => { clones.forEach(c => { if (c.el.isConnected) c.parent.removeChild(c.el); }); },
        redo: () => { clones.forEach(c => { if (!c.el.isConnected) c.parent.insertBefore(c.el, c.anchor); }); },
        label: 'Duplicate'
      });
    }
  }

  function selectAll() {
    if (!svgEl) return;
    setSelection([...svgEl.querySelectorAll('[data-edit="true"]')]);
  }

  // ── Zoom ──
  function setZoom(z) {
    if (!svgEl) return;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    svgEl.style.width = (vbW * zoom) + 'px';
    svgEl.style.height = (vbH * zoom) + 'px';
    updateSelectionOverlay();
    if (window.__ffOnZoomChanged) window.__ffOnZoomChanged();
  }

  function zoomBy(factor) { setZoom(zoom * factor); }
  function getZoom() { return zoom; }

  function fitToView() {
    if (!svgEl) return;
    const area = document.getElementById('canvas-area');
    const cw = area.clientWidth - 64;
    const ch = area.clientHeight - 64;
    if (cw <= 0 || ch <= 0) return;
    setZoom(Math.min(cw / vbW, ch / vbH));
  }

  function toggleGrid() {
    showGrid = !showGrid;
    const container = document.getElementById('svg-canvas');
    if (container) container.classList.toggle('show-grid', showGrid);
  }

  function toggleSnap() {
    snapEnabled = !snapEnabled;
    if (!snapEnabled) hideGuides();
  }

  function initStaticWiring() {
    wireTextEditor();
    document.addEventListener('mousedown', (e) => {
      const menu = document.getElementById('context-menu');
      if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target)) closeContextMenu();
    }, true);
  }

  document.addEventListener('DOMContentLoaded', initStaticWiring);

  return {
    loadSVG, getSVGMarkup, getSVGElement,
    selectElement, setSelection, addToSelection, toggleInSelection,
    getSelection, getSelected, deselect, selectAll, updateSelectionOverlay,
    getWorldBBox, getElementPosition, setElementPosition, applyTranslate,
    groupSelection, ungroupSelection,
    insertText, insertImage,
    nudge, deleteElement, duplicateElement,
    toggleGrid, toggleSnap,
    zoomBy, setZoom, getZoom, fitToView,
    startTextEdit, commitTextEdit,
  };
})();
window.Canvas = Canvas;
