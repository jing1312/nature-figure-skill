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
    if (guidesSvg) guidesSvg.querySelectorAll('.member-rect,.rubber-rect,.resize-handle').forEach(r => r.remove());
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
      if (guidesSvg && selection.length === 1) renderResizeHandles(boxes[0]);
    } catch (e) { /* non-rendered elements */ }
  }

  // ── Resize handles (single selection of rect / image / circle / ellipse) ──
  const RESIZABLE = new Set(['rect', 'image', 'circle', 'ellipse']);
  let resizing = null;   // {el, corner, start, orig, type}
  let resizeCur = null;

  function renderResizeHandles(b) {
    const el = selection[0];
    const guidesSvg = document.getElementById('guides-overlay');
    if (!guidesSvg || !el || !RESIZABLE.has(el.tagName)) return;
    const scale = currentScale();
    const corners = { nw: [b.x, b.y], ne: [b.x + b.w, b.y], sw: [b.x, b.y + b.h], se: [b.x + b.w, b.y + b.h] };
    for (const [key, [cx, cy]] of Object.entries(corners)) {
      const p = toContainerOffset(cx, cy);
      const h = document.createElementNS(SVGNS, 'rect');
      const s = 8;
      h.setAttribute('x', p.x - s / 2); h.setAttribute('y', p.y - s / 2);
      h.setAttribute('width', s); h.setAttribute('height', s);
      h.setAttribute('class', 'resize-handle');
      h.setAttribute('data-corner', key);
      guidesSvg.appendChild(h);
    }
    void scale;
  }

  function startResize(e, el) {
    const corner = e.target.getAttribute('data-corner');
    const type = el.tagName;
    const num = a => parseFloat(el.getAttribute(a)) || 0;
    const orig = { x: num('x'), y: num('y'), w: num('width'), h: num('height'), cx: num('cx'), cy: num('cy'), r: num('r'), rx: num('rx'), ry: num('ry') };
    if (type === 'image') orig.aspect = orig.h / Math.max(orig.w, 0.001);
    if (type === 'circle') { orig.x = orig.cx - orig.r; orig.y = orig.cy - orig.r; orig.w = orig.r * 2; orig.h = orig.r * 2; }
    if (type === 'ellipse') { orig.x = orig.cx - orig.rx; orig.y = orig.cy - orig.ry; orig.w = orig.rx * 2; orig.h = orig.ry * 2; }
    resizing = { el, corner, type, orig, start: getMousePos(e) };
    resizeCur = resizing.start;
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
    e.preventDefault();
    e.stopPropagation();
  }

  function onResizeMove(e) {
    if (!resizing) return;
    resizeCur = getMousePos(e);
    const { el, corner, type, orig, start } = resizing;
    const dx = resizeCur.x - start.x, dy = resizeCur.y - start.y;
    const sxF = corner.includes('w') ? -1 : 1;
    const syF = corner.includes('n') ? -1 : 1;
    if (type === 'rect') {
      const w = Math.max(2, orig.w + sxF * dx), h = Math.max(2, orig.h + syF * dy);
      el.setAttribute('x', (orig.x + (sxF < 0 ? orig.w - w : 0)).toFixed(1));
      el.setAttribute('y', (orig.y + (syF < 0 ? orig.h - h : 0)).toFixed(1));
      el.setAttribute('width', w.toFixed(1));
      el.setAttribute('height', h.toFixed(1));
    } else if (type === 'image') {
      const w = Math.max(4, orig.w + sxF * dx), h = w * orig.aspect;
      el.setAttribute('x', (orig.x + (sxF < 0 ? orig.w - w : 0)).toFixed(1));
      el.setAttribute('y', (orig.y + (syF < 0 ? orig.h - h : 0)).toFixed(1));
      el.setAttribute('width', w.toFixed(1));
      el.setAttribute('height', h.toFixed(1));
    } else if (type === 'circle') {
      const w = Math.max(2, orig.w + sxF * dx);
      el.setAttribute('cx', (orig.x + (sxF < 0 ? orig.w - w : 0) + w / 2).toFixed(1));
      el.setAttribute('cy', (orig.y + (syF < 0 ? orig.h - w : 0) + w / 2).toFixed(1));
      el.setAttribute('r', (w / 2).toFixed(1));
    } else if (type === 'ellipse') {
      const w = Math.max(2, orig.w + sxF * dx), h = Math.max(2, orig.h + syF * dy);
      el.setAttribute('cx', (orig.x + (sxF < 0 ? orig.w - w : 0) + w / 2).toFixed(1));
      el.setAttribute('cy', (orig.y + (syF < 0 ? orig.h - h : 0) + h / 2).toFixed(1));
      el.setAttribute('rx', (w / 2).toFixed(1));
      el.setAttribute('ry', (h / 2).toFixed(1));
    }
    updateSelectionOverlay();
  }

  function onResizeUp() {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
    if (!resizing) return;
    const { el, type, orig } = resizing;
    const keys = type === 'circle' ? ['cx', 'cy', 'r'] : type === 'ellipse' ? ['cx', 'cy', 'rx', 'ry'] : ['x', 'y', 'width', 'height'];
    const to = {};
    keys.forEach(k => { to[k] = el.getAttribute(k); });
    const changed = keys.some(k => String(orig[k]) !== String(to[k]));
    if (changed && window.History) {
      History.push({
        undo: () => keys.forEach(k => el.setAttribute(k, String(orig[k]))),
        redo: () => keys.forEach(k => el.setAttribute(k, to[k])),
        label: 'Resize'
      });
    }
    resizing = null;
    resizeCur = null;
    updateSelectionOverlay();
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
    // explicit height from the natural aspect ratio (missing height breaks
    // rendering, bbox and rotate/crop math)
    loadHTMLImage(dataURL).then(im => {
      if (!img.isConnected) return;
      const h = w * im.naturalHeight / Math.max(im.naturalWidth, 1);
      img.setAttribute('height', h.toFixed(1));
      updateSelectionOverlay();
    }).catch(() => {});
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

  // ═══ Image tools: crop / rotate / flip / adjustments / replace ═══
  // Raster imports become <image> elements — movable, resizable, and with
  // these tools genuinely editable even when no vector source exists.
  let adjSeq = 0;
  let crop = null; // { img, rect:{x,y,w,h}, mode, handle }

  function loadHTMLImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('图片解码失败'));
      im.src = src;
    });
  }

  function encodeCanvas(canvas) {
    try { return canvas.toDataURL('image/png'); }
    catch (e) { throw new Error('外部链接图片无法重新编码'); }
  }

  // ── Rotate / flip by pixel re-encode (keeps the attr model transform-free) ──
  async function rotateImageElement(el, deg) {
    const href = el.getAttribute('href');
    const x = parseFloat(el.getAttribute('x')) || 0, y = parseFloat(el.getAttribute('y')) || 0;
    const w = parseFloat(el.getAttribute('width')) || 1, h = parseFloat(el.getAttribute('height')) || 1;
    const im = await loadHTMLImage(href);
    const swap = Math.abs(deg) % 180 === 90;
    const c = document.createElement('canvas');
    c.width = swap ? im.naturalHeight : im.naturalWidth;
    c.height = swap ? im.naturalWidth : im.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(deg * Math.PI / 180);
    ctx.drawImage(im, -im.naturalWidth / 2, -im.naturalHeight / 2);
    const url = encodeCanvas(c);
    const cx = x + w / 2, cy = y + h / 2;
    const nw = swap ? h : w, nh = swap ? w : h;
    const to = { href: url, x: cx - nw / 2, y: cy - nh / 2, width: nw, height: nh };
    const from = { href, x, y, width: w, height: h };
    ['href', 'x', 'y', 'width', 'height'].forEach(k => el.setAttribute(k, to[k]));
    if (window.History) History.push({
      undo: () => Object.entries(from).forEach(([k, v]) => el.setAttribute(k, v)),
      redo: () => Object.entries(to).forEach(([k, v]) => el.setAttribute(k, v)),
      label: 'Rotate'
    });
    updateSelectionOverlay();
  }

  async function flipImageElement(el, axis) {
    const href = el.getAttribute('href');
    const im = await loadHTMLImage(href);
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.translate(axis === 'h' ? c.width : 0, axis === 'v' ? c.height : 0);
    ctx.scale(axis === 'h' ? -1 : 1, axis === 'v' ? -1 : 1);
    ctx.drawImage(im, 0, 0);
    const url = encodeCanvas(c);
    const old = el.getAttribute('href');
    el.setAttribute('href', url);
    if (window.History) History.push({
      undo: () => el.setAttribute('href', old),
      redo: () => el.setAttribute('href', url),
      label: 'Flip'
    });
  }

  function replaceImageElement(el, dataURL) {
    const old = el.getAttribute('href');
    el.setAttribute('href', dataURL);
    if (window.History) History.push({
      undo: () => el.setAttribute('href', old),
      redo: () => el.setAttribute('href', dataURL),
      label: 'Replace Image'
    });
  }

  // ── Tone adjustments via an SVG filter (editable + exported) ──
  function ensureAdjFilter(img) {
    const svg = img.ownerSVGElement;
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(SVGNS, 'defs'); svg.insertBefore(defs, svg.firstChild); }
    const fid = img.getAttribute('filter');
    let f = fid && svg.querySelector('#' + CSS.escape(fid.replace(/^url\(#/, '').replace(/\)$/, '')));
    if (!f) {
      const id = 'ff-adj-' + (++adjSeq);
      f = document.createElementNS(SVGNS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const comp = document.createElementNS(SVGNS, 'feComponentTransfer');
      ['R', 'G', 'B'].forEach(ch => {
        const fn = document.createElementNS(SVGNS, 'feFunc' + ch);
        fn.setAttribute('type', 'linear');
        fn.setAttribute('slope', '1');
        fn.setAttribute('intercept', '0');
        comp.appendChild(fn);
      });
      const sat = document.createElementNS(SVGNS, 'feColorMatrix');
      sat.setAttribute('type', 'saturate');
      sat.setAttribute('values', '1');
      f.appendChild(comp);
      f.appendChild(sat);
      defs.appendChild(f);
      img.setAttribute('filter', 'url(#' + id + ')');
    }
    return f;
  }

  function setImageAdjustments(img, adj) { // {b,c,s,gray,invert} defaults 1,1,1,false,false
    const f = ensureAdjFilter(img);
    const b = adj.b, c = adj.c, s = adj.gray ? 0 : adj.s;
    const slope = c, intercept = (b - 1) + 0.5 * (1 - c);
    ['R', 'G', 'B'].forEach(ch => {
      const fn = f.querySelector('feFunc' + ch);
      fn.setAttribute('slope', slope.toFixed(4));
      fn.setAttribute('intercept', intercept.toFixed(4));
    });
    f.querySelector('feColorMatrix').setAttribute('values', s.toFixed(4));
    let inv = f.querySelector('feComponentTransfer[invert]');
    if (adj.invert && !inv) {
      inv = document.createElementNS(SVGNS, 'feComponentTransfer');
      inv.setAttribute('invert', '1');
      ['R', 'G', 'B'].forEach(ch => {
        const fn = document.createElementNS(SVGNS, 'feFunc' + ch);
        fn.setAttribute('type', 'table');
        fn.setAttribute('tableValues', '1 0');
        inv.appendChild(fn);
      });
      f.appendChild(inv);
    } else if (!adj.invert && inv) inv.remove();
  }

  function getImageAdjustments(img) {
    const fid = img.getAttribute('filter');
    if (!fid) return { b: 1, c: 1, s: 1, gray: false, invert: false };
    const f = img.ownerSVGElement.querySelector('#' + CSS.escape(fid.replace(/^url\(#/, '').replace(/\)$/, '')));
    if (!f) return { b: 1, c: 1, s: 1, gray: false, invert: false };
    const fn = f.querySelector('feFuncR');
    const slope = parseFloat(fn.getAttribute('slope')) || 1;
    const intercept = parseFloat(fn.getAttribute('intercept')) || 0;
    const c = slope, b = 1 + intercept - 0.5 * (1 - c);
    const sv = f.querySelector('feColorMatrix').getAttribute('values');
    const s = sv === null || sv === '' ? 1 : (parseFloat(sv) || 0);
    return { b, c, s, gray: s <= 0, invert: !!f.querySelector('feComponentTransfer[invert]') };
  }

  function resetImageAdjustments(img) {
    const fid = img.getAttribute('filter');
    if (!fid) return;
    const f = img.ownerSVGElement.querySelector('#' + CSS.escape(fid.replace(/^url\(#/, '').replace(/\)$/, '')));
    if (f) f.remove();
    const old = fid;
    img.removeAttribute('filter');
    if (window.History) History.push({
      undo: () => img.setAttribute('filter', old),
      redo: () => img.removeAttribute('filter'),
      label: 'Reset Adjustments'
    });
  }

  // ── Interactive crop ──
  function startImageCrop(img) {
    if (crop) endCrop();
    const b = getWorldBBox(img);
    if (!b.w || !b.h) return;
    deselect(); // hide selection chrome while cropping
    crop = { img, rect: { x: b.x, y: b.y, w: b.w, h: b.h } };
    renderCropOverlay();
    document.addEventListener('keydown', onCropKey, true);
    document.addEventListener('mousemove', onCropMove);
    document.addEventListener('mouseup', onCropUp);
    if (window.Export) Export.toast('✂ 拖动边角或内部调整裁剪区域 — Enter 确认，Esc 取消');
  }

  function renderCropOverlay() {
    const overlay = document.getElementById('guides-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.crop-shade,.crop-rect,.crop-handle').forEach(n => n.remove());
    const scale = currentScale();
    const r = crop.rect, img = getWorldBBox(crop.img);
    const p = toContainerOffset(r.x, r.y);
    const px = { x: p.x, y: p.y, w: r.w * scale.sx, h: r.h * scale.sy };
    // dim everything outside the crop rect (4 shade strips, image-bounded)
    const strips = [
      [img.x, img.y, r.x - img.x + r.w, r.y - img.y], // top (full width)
    ];
    const dim = (bx, by, bw, bh) => {
      if (bw <= 0 || bh <= 0) return;
      const q = toContainerOffset(bx, by);
      const t = document.createElementNS(SVGNS, 'rect');
      t.setAttribute('x', q.x); t.setAttribute('y', q.y);
      t.setAttribute('width', bw * scale.sx); t.setAttribute('height', bh * scale.sy);
      t.setAttribute('class', 'crop-shade');
      overlay.appendChild(t);
    };
    dim(img.x, img.y, img.w, r.y - img.y); // above
    dim(img.x, r.y + r.h, img.w, img.y + img.h - (r.y + r.h)); // below
    dim(img.x, r.y, r.x - img.x, r.h); // left
    dim(r.x + r.w, r.y, img.x + img.w - (r.x + r.w), r.h); // right
    const rect = document.createElementNS(SVGNS, 'rect');
    rect.setAttribute('x', px.x); rect.setAttribute('y', px.y);
    rect.setAttribute('width', px.w); rect.setAttribute('height', px.h);
    rect.setAttribute('class', 'crop-rect');
    overlay.appendChild(rect);
    [['nw', r.x, r.y], ['ne', r.x + r.w, r.y], ['sw', r.x, r.y + r.h], ['se', r.x + r.w, r.y + r.h],
     ['n', r.x + r.w / 2, r.y], ['s', r.x + r.w / 2, r.y + r.h], ['w', r.x, r.y + r.h / 2], ['e', r.x + r.w, r.y + r.h / 2]]
      .forEach(([key, cx, cy]) => {
        const q = toContainerOffset(cx, cy);
        const hnd = document.createElementNS(SVGNS, 'rect');
        const s = 8;
        hnd.setAttribute('x', q.x - s / 2); hnd.setAttribute('y', q.y - s / 2);
        hnd.setAttribute('width', s); hnd.setAttribute('height', s);
        hnd.setAttribute('class', 'crop-handle');
        hnd.setAttribute('data-crop-handle', key);
        overlay.appendChild(hnd);
      });
    void strips;
  }

  function onCropKey(e) {
    if (!crop) return;
    if (e.key === 'Enter') { e.preventDefault(); commitCrop(); }
    else if (e.key === 'Escape') { e.preventDefault(); endCrop(); }
  }

  function cropHitTest(e) {
    const t = e.target;
    if (t.classList && t.classList.contains('crop-handle')) return { part: 'handle', key: t.getAttribute('data-crop-handle') };
    if (t.classList && t.classList.contains('crop-rect')) return { part: 'move' };
    return null;
  }

  function onCropMove(e) {
    if (!crop || !crop.drag) return;
    const p = getMousePos(e);
    const dx = p.x - crop.drag.sx, dy = p.y - crop.drag.sy;
    const r = { ...crop.drag.start };
    const MIN = 4;
    const k = crop.drag.key;
    if (k === 'move') { r.x += dx; r.y += dy; }
    if (k.includes('w')) { r.x += dx; r.w -= dx; }
    if (k.includes('e')) { r.w += dx; }
    if (k.includes('n')) { r.y += dy; r.h -= dy; }
    if (k.includes('s')) { r.h += dy; }
    // clamp to image bounds and minimum size
    const b = getWorldBBox(crop.img);
    r.x = Math.max(b.x, Math.min(r.x, b.x + b.w - MIN));
    r.y = Math.max(b.y, Math.min(r.y, b.y + b.h - MIN));
    r.w = Math.max(MIN, Math.min(r.w, b.x + b.w - r.x));
    r.h = Math.max(MIN, Math.min(r.h, b.y + b.h - r.y));
    crop.rect = r;
    renderCropOverlay();
  }

  function onCropUp() { if (crop) crop.drag = null; }

  document.addEventListener('mousedown', (e) => {
    if (!crop) return;
    const hit = cropHitTest(e);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    const p = getMousePos(e);
    crop.drag = { sx: p.x, sy: p.y, start: { ...crop.rect }, key: hit.part === 'move' ? 'move' : hit.key };
  }, true);

  async function commitCrop() {
    const { img, rect } = crop;
    endCrop();
    const dispW = parseFloat(img.getAttribute('width')), dispH = parseFloat(img.getAttribute('height'));
    const bx = parseFloat(img.getAttribute('x')) || 0, by = parseFloat(img.getAttribute('y')) || 0;
    try {
      const im = await loadHTMLImage(img.getAttribute('href'));
      const natW = im.naturalWidth, natH = im.naturalHeight;
      const sxp = (rect.x - bx) / dispW * natW, syp = (rect.y - by) / dispH * natH;
      const swp = rect.w / dispW * natW, shp = rect.h / dispH * natH;
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(swp)); c.height = Math.max(1, Math.round(shp));
      c.getContext('2d').drawImage(im, sxp, syp, swp, shp, 0, 0, c.width, c.height);
      const url = encodeCanvas(c);
      const from = { href: img.getAttribute('href'), x: bx, y: by, width: dispW, height: dispH };
      const to = { href: url, x: rect.x, y: rect.y, width: rect.w, height: rect.h };
      ['href', 'x', 'y', 'width', 'height'].forEach(k => img.setAttribute(k, to[k]));
      if (window.History) History.push({
        undo: () => Object.entries(from).forEach(([k, v]) => img.setAttribute(k, v)),
        redo: () => Object.entries(to).forEach(([k, v]) => img.setAttribute(k, v)),
        label: 'Crop'
      });
    } catch (err) {
      if (window.Export) Export.toast('❌ ' + err.message);
    }
    selectElement(img);
    updateSelectionOverlay();
  }

  function endCrop() {
    crop = null;
    const overlay = document.getElementById('guides-overlay');
    if (overlay) overlay.querySelectorAll('.crop-shade,.crop-rect,.crop-handle').forEach(n => n.remove());
    document.removeEventListener('keydown', onCropKey, true);
    document.removeEventListener('mousemove', onCropMove);
    document.removeEventListener('mouseup', onCropUp);
  }

  function isCropping() { return !!crop; }

  // ── Double-click: inline text edit ──
  function onCanvasDblClick(e) {
    const target = findEditableElement(e.target);
    if (!target) return;
    e.preventDefault();
    if (target.tagName === 'text') startTextEdit(target);
    else if (target.tagName === 'image') startImageCrop(target);
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

  // ── Series linkage: elements sharing data-series stay in sync ──
  const DATA_ROLES = new Set(['bar', 'line', 'area', 'marker', 'series']);

  // Push a fill/stroke change to every sibling of the same data-series whose
  // corresponding attribute is currently "active" (so per-role styling —
  // e.g. a dark box stroke — survives). Returns the changed peers for undo.
  function propagateSeriesColor(el, attr, value) {
    const idx = el.getAttribute('data-series');
    if (idx === null || !svgEl) return [];
    const changed = [];
    svgEl.querySelectorAll('[data-edit="true"][data-series="' + idx + '"]').forEach(other => {
      if (other === el) return;
      const cur = other.getAttribute(attr);
      const active = attr === 'fill'
        ? (cur && cur !== 'none' && cur.toLowerCase() !== '#ffffff')
        : (cur && cur !== 'none');
      if (active) { changed.push({ el: other, old: cur }); other.setAttribute(attr, value); }
    });
    return changed;
  }

  function seriesPeerCount(el) {
    const idx = el.getAttribute('data-series');
    if (idx === null || !svgEl) return 0;
    return svgEl.querySelectorAll('[data-edit="true"][data-series="' + idx + '"]').length - 1;
  }

  // ── Delete / duplicate (multi) ──
  function deleteElement() {
    if (!selection.length) return;
    const els = selection.slice();
    // series linkage: removing a data element takes its legend swatch with it
    const linked = [];
    els.forEach(el => {
      const role = el.getAttribute('data-role') || '';
      const idx = el.getAttribute('data-series');
      if (idx === null || role === 'series' || !DATA_ROLES.has(role)) return;
      svgEl.querySelectorAll('[data-edit="true"][data-role="series"][data-series="' + idx + '"]').forEach(sw => {
        if (!els.includes(sw) && !linked.some(r => r.el === sw) && sw.isConnected) linked.push(sw);
      });
    });
    const records = els.concat(linked).map(el => ({ parent: el.parentNode, anchor: el.nextSibling, el }));
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
    document.getElementById('guides-overlay')?.addEventListener('mousedown', (e) => {
      const t = e.target;
      if (t.classList && t.classList.contains('resize-handle') && selection.length === 1) {
        const el = selection[0];
        if (RESIZABLE.has(el.tagName)) startResize(e, el);
      }
    });
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
    startImageCrop, isCropping,
    rotateImageElement, flipImageElement, replaceImageElement,
    setImageAdjustments, getImageAdjustments, resetImageAdjustments,
    propagateSeriesColor, seriesPeerCount,
    nudge, deleteElement, duplicateElement,
    toggleGrid, toggleSnap,
    zoomBy, setZoom, getZoom, fitToView,
    startTextEdit, commitTextEdit,
  };
})();
window.Canvas = Canvas;
