/**
 * FigureForge — Canvas Direct Manipulation Engine
 *
 * Core SVG interaction: selection, drag, smart alignment guides (BioRender /
 * Figma style snapping), inline text edit, context menu, zoom.
 *
 * Smart guides: while dragging, the moving element's edges/centers are matched
 * against every other element's edges/centers plus the canvas edges/center.
 * On a hit the element snaps into exact alignment and a magenta guide line is
 * drawn between the two elements. Hold Alt to disable snapping temporarily.
 */
const Canvas = (function () {
  let svgEl = null;
  let selectedEl = null;
  let zoom = 1;
  let vbW = 400;
  let vbH = 280;
  let showGrid = true;
  let snapEnabled = true;

  const SNAP_DIST_PX = 6;      // snap tolerance in screen pixels
  const GRID_SIZE = 5;         // fallback grid step (SVG units)
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 8;

  let isDragging = false;
  let dragStart = null;        // mouse position at drag start (SVG units)
  let dragOrigPos = null;      // element logical position at drag start
  let dragOrigBBox = null;     // element world bbox at drag start
  let dragMoved = false;
  let activeGuides = [];       // guide lines currently displayed

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
    selectedEl = null;
    hideGuides();
    closeContextMenu();
    const vb = parseViewBox();
    vbW = vb.w; vbH = vb.h;
    zoom = 1;
    updateSelectionOverlay();
    attachSVGListeners();
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

  // ── Attach interaction listeners ──
  function attachSVGListeners() {
    if (!svgEl) return;
    svgEl.addEventListener('mousedown', onCanvasMouseDown);
    svgEl.addEventListener('dblclick', onCanvasDblClick);
    svgEl.addEventListener('contextmenu', onContextMenu);
  }

  // ── Selection ──
  function selectElement(el) {
    if (selectedEl) selectedEl.removeAttribute('data-selected');
    selectedEl = el;
    if (el) el.setAttribute('data-selected', 'true');
    updateSelectionOverlay();
    if (window.__ffOnSelectionChanged) window.__ffOnSelectionChanged(el);
    else if (window.Properties) Properties.onSelectionChanged(el);
  }

  function getSelected() { return selectedEl; }

  function deselect() { selectElement(null); }

  // ── Coordinate helpers ──

  // Screen point -> SVG user coordinates
  function getMousePos(e) {
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  // SVG user coordinates -> pixel offsets relative to #canvas-container
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

  // Bounding box in world (viewBox) coordinates, including our own translate().
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

  // Logical position used by drag math and the properties panel.
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
      // paths, groups and anything else: cumulative translate()
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
    if (!selectedEl || !svgEl) {
      if (overlay) overlay.classList.remove('active');
      return;
    }
    try {
      const bbox = getWorldBBox(selectedEl);
      const tl = toContainerOffset(bbox.x, bbox.y);
      const scale = currentScale();
      overlay.style.left = tl.x + 'px';
      overlay.style.top = tl.y + 'px';
      overlay.style.width = (bbox.w * scale.sx) + 'px';
      overlay.style.height = (bbox.h * scale.sy) + 'px';
      overlay.classList.add('active');
    } catch (e) { /* getBBox can fail for non-rendered elements */ }
  }

  // ── Smart alignment guides ──

  // Collect candidate alignment targets from sibling elements + canvas frame.
  function collectSnapTargets(excludeEl) {
    const xs = [], ys = [];
    const addX = (v, src) => xs.push({ v, src });
    const addY = (v, src) => ys.push({ v, src });

    // canvas edges + centers
    [0, vbW / 2, vbW].forEach(v => addX(v, null));
    [0, vbH / 2, vbH].forEach(v => addY(v, null));

    svgEl.querySelectorAll('[data-edit="true"]').forEach(el => {
      if (el === excludeEl || el.contains(excludeEl) || excludeEl.contains(el)) return;
      if (!el.isConnected) return;
      const b = getWorldBBox(el);
      if (!b.w && !b.h) return;
      addX(b.x, b); addX(b.x + b.w / 2, b); addX(b.x + b.w, b);
      addY(b.y, b); addY(b.y + b.h / 2, b); addY(b.y + b.h, b);
    });
    return { xs, ys };
  }

  // Find best snap for one axis. Returns { delta, guidePos, targetBBox } or null.
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

  function renderGuideLines(guides, movingBBox) {
    const overlay = document.getElementById('guides-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    activeGuides = guides;
    for (const g of guides) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
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
    if (overlay) overlay.innerHTML = '';
  }

  // ── Mouse down: start drag or select ──
  function onCanvasMouseDown(e) {
    closeContextMenu();
    if (e.button !== 0) return;
    const target = findEditableElement(e.target);
    if (!target) { deselect(); return; }
    selectElement(target);
    isDragging = true;
    dragMoved = false;
    dragStart = getMousePos(e);
    dragOrigPos = getElementPosition(target);
    dragOrigBBox = getWorldBBox(target);
    document.addEventListener('mousemove', onCanvasMouseMove);
    document.addEventListener('mouseup', onCanvasMouseUp);
    e.preventDefault();
  }

  function onCanvasMouseMove(e) {
    if (!isDragging || !selectedEl) return;
    const pos = getMousePos(e);
    let dx = pos.x - dragStart.x;
    let dy = pos.y - dragStart.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
    if (!dragMoved) return;

    let newX = dragOrigPos.x + dx;
    let newY = dragOrigPos.y + dy;
    let snapped = false;

    if (snapEnabled && !e.altKey) {
      const tol = SNAP_DIST_PX / Math.max(currentScale().sx, 0.0001);
      const m = {
        x: dragOrigBBox.x + dx,
        y: dragOrigBBox.y + dy,
        w: dragOrigBBox.w,
        h: dragOrigBBox.h,
      };
      const targets = collectSnapTargets(selectedEl);

      const snapX = bestSnap([m.x, m.x + m.w / 2, m.x + m.w], targets.xs, tol);
      const snapY = bestSnap([m.y, m.y + m.h / 2, m.y + m.h], targets.ys, tol);

      const guides = [];
      if (snapX) {
        newX += snapX.delta; snapped = true;
        guides.push({
          axis: 'v', pos: snapX.guidePos,
          from: Math.min(m.y, snapX.targetBBox ? snapX.targetBBox.y : 0),
          to: Math.max(m.y + m.h, snapX.targetBBox ? snapX.targetBBox.y + snapX.targetBBox.h : vbH),
        });
      }
      if (snapY) {
        newY += snapY.delta; snapped = true;
        guides.push({
          axis: 'h', pos: snapY.guidePos,
          from: Math.min(m.x, snapY.targetBBox ? snapY.targetBBox.x : 0),
          to: Math.max(m.x + m.w, snapY.targetBBox ? snapY.targetBBox.x + snapY.targetBBox.w : vbW),
        });
      }
      if (snapped) renderGuideLines(guides, m);
      else hideGuides();
    }

    if (!snapped && snapEnabled && !e.altKey) {
      // grid fallback
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
    }

    setElementPosition(selectedEl, newX, newY);
    updateSelectionOverlay();
  }

  function onCanvasMouseUp() {
    if (isDragging && dragMoved && selectedEl) {
      const newPos = getElementPosition(selectedEl);
      if (newPos.x !== dragOrigPos.x || newPos.y !== dragOrigPos.y) {
        const el = selectedEl;
        if (window.History) {
          History.push({
            undo: () => setElementPosition(el, dragOrigPos.x, dragOrigPos.y),
            redo: () => setElementPosition(el, newPos.x, newPos.y),
            label: 'Move'
          });
        }
      }
    }
    isDragging = false;
    dragMoved = false;
    hideGuides();
    document.removeEventListener('mousemove', onCanvasMouseMove);
    document.removeEventListener('mouseup', onCanvasMouseUp);
  }

  // ── Double-click: inline text edit ──
  function onCanvasDblClick(e) {
    const target = findEditableElement(e.target);
    if (!target || target.tagName !== 'text') return;
    e.preventDefault();
    startTextEdit(target);
  }

  let textEditing = null; // { el, oldText }

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
    if (target) selectElement(target);
    openContextMenu(e.clientX, e.clientY, target);
  }

  function openContextMenu(pageX, pageY, el) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    menu.innerHTML = '';
    const items = [];
    if (el && el.tagName === 'text') items.push({ label: '✏️ 编辑文字', fn: () => startTextEdit(el) });
    if (el) {
      items.push({ label: '⧉ 复制元素', fn: duplicateElement });
      items.push({ label: '⬆ 置顶', fn: () => raiseToTop(el) });
      items.push({ label: '⬇ 置底', fn: () => lowerToBottom(el) });
      items.push({ label: '🗑 删除', danger: true, fn: deleteElement });
    } else {
      items.push({ label: '⬅ 取消选择', fn: deselect });
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

  function pushParentHistory(el, label, undoFn, redoFn) {
    if (window.History) History.push({ undo: undoFn, redo: redoFn, label });
  }

  function raiseToTop(el) {
    const parent = el.parentNode;
    if (!parent) return;
    const next = el.nextSibling;
    parent.appendChild(el);
    pushParentHistory(el, 'Raise', () => { parent.insertBefore(el, next); }, () => parent.appendChild(el));
  }

  function lowerToBottom(el) {
    const parent = el.parentNode;
    if (!parent) return;
    const first = parent.firstChild;
    const next = el.nextSibling;
    parent.insertBefore(el, first);
    pushParentHistory(el, 'Lower', () => { parent.insertBefore(el, next); }, () => { parent.insertBefore(el, first); });
  }

  // ── Delete / duplicate ──
  function deleteElement() {
    if (!selectedEl) return;
    const el = selectedEl;
    const parent = el.parentNode;
    if (!parent) return;
    const next = el.nextSibling;
    parent.removeChild(el);
    deselect();
    if (window.History) {
      History.push({
        undo: () => { parent.insertBefore(el, next); },
        redo: () => { parent.removeChild(el); deselect(); },
        label: 'Delete'
      });
    }
  }

  function duplicateElement() {
    if (!selectedEl || !svgEl) return;
    const src = selectedEl;
    const parent = src.parentNode;
    const anchor = src.nextSibling;
    const el = src.cloneNode(true);
    el.removeAttribute('data-selected');
    applyTranslate(el, 10, -10);
    parent.insertBefore(el, anchor);
    selectElement(el);
    if (window.History) {
      History.push({
        undo: () => { if (el.isConnected) { parent.removeChild(el); } if (selectedEl === el) deselect(); },
        redo: () => { parent.insertBefore(el, anchor); },
        label: 'Duplicate'
      });
    }
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

  // ── Init ──
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
    selectElement, getSelected, deselect, updateSelectionOverlay,
    getWorldBBox, getElementPosition, setElementPosition, applyTranslate,
    toggleGrid, toggleSnap,
    zoomBy, setZoom, getZoom, fitToView,
    deleteElement, duplicateElement,
    startTextEdit, commitTextEdit,
  };
})();
window.Canvas = Canvas;
