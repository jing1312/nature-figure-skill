/**
 * FigureForge — Canvas Direct Manipulation Engine
 *
 * Core SVG interaction: selection, drag, text edit, context menu, zoom.
 * This is the heart of the "direct manipulation" innovation.
 */
const Canvas = (function () {
  let svgEl = null;
  let selectedEl = null;
  let zoom = 1;
  let showGrid = true;
  let snapEnabled = true;
  const SNAP_DIST = 5;

  let isDragging = false;
  let dragStart = null;
  let dragOrig = null;
  let dragMoved = false;

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
    updateSelectionOverlay();
    attachSVGListeners();
    fitToView();
  }

  function getSVGMarkup() {
    if (!svgEl) return '';
    return new XMLSerializer().serializeToString(svgEl);
  }

  function getSVGElement() { return svgEl; }

  // ── Attach interaction listeners to all editable elements ──
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
    if (window.Properties) Properties.onSelectionChanged(el);
  }

  function getSelected() { return selectedEl; }

  function deselect() { selectElement(null); }

  // ── Selection overlay ──
  function updateSelectionOverlay() {
    const overlay = document.getElementById('selection-overlay');
    if (!selectedEl || !svgEl) {
      if (overlay) overlay.classList.remove('active');
      return;
    }
    try {
      const bbox = selectedEl.getBBox();
      const ctm = selectedEl.getCTM();
      const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
      const svgRect = svgEl.getBoundingClientRect();
      const scaleX = svgRect.width / (parseFloat(svgEl.viewBox.baseVal.width) || 400);
      const scaleY = svgRect.height / (parseFloat(svgEl.viewBox.baseVal.height) || 280);
      const x = svgRect.left - containerRect.left + bbox.x * scaleX;
      const y = svgRect.top - containerRect.top + bbox.y * scaleY;
      overlay.style.left = x + 'px';
      overlay.style.top = y + 'px';
      overlay.style.width = (bbox.width * scaleX) + 'px';
      overlay.style.height = (bbox.height * scaleY) + 'px';
      overlay.classList.add('active');
    } catch (e) { /* getBBox can fail for non-rendered elements */ }
  }

  // ── Mouse down: start drag or select ──
  function onCanvasMouseDown(e) {
    const target = findEditableElement(e.target);
    if (!target) { deselect(); return; }
    selectElement(target);
    isDragging = true;
    dragMoved = false;
    dragStart = getMousePos(e);
    dragOrig = getElementPosition(target);
    document.addEventListener('mousemove', onCanvasMouseMove);
    document.addEventListener('mouseup', onCanvasMouseUp);
    e.preventDefault();
  }

  function onCanvasMouseMove(e) {
    if (!isDragging || !selectedEl) return;
    const pos = getMousePos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
    let newX = dragOrig.x + dx;
    let newY = dragOrig.y + dy;
    if (snapEnabled) {
      newX = Math.round(newX / SNAP_DIST) * SNAP_DIST;
      newY = Math.round(newY / SNAP_DIST) * SNAP_DIST;
    }
    setElementPosition(selectedEl, newX, newY);
    updateSelectionOverlay();
  }

  function onCanvasMouseUp(e) {
    if (isDragging && dragMoved && selectedEl) {
      const newPos = getElementPosition(selectedEl);
      if (window.History) {
        History.push({
          undo: () => setElementPosition(selectedEl, dragOrig.x, dragOrig.y),
          redo: () => setElementPosition(selectedEl, newPos.x, newPos.y),
          label: 'Move'
        });
      }
    }
    isDragging = false;
    dragMoved = false;
    document.removeEventListener('mousemove', onCanvasMouseMove);
    document.removeEventListener('mouseup', onCanvasMouseUp);
  }

  // ── Double-click: edit text ──
  function onCanvasDblClick(e) {
    const target = findEditableElement(e.target);
    if (!target || target.tagName !== 'text') return;
    e.preventDefault();
    startTextEdit(target);
  }

  function startTextEdit(textEl) {
    const oldVal = textEl.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldVal;
    input.className = 'inline-text-edit';
    const rect = textEl.getBoundingClientRect();
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    input.style.position = 'absolute';
    input.style.left = (rect.left - containerRect.left) + 'px';
    input.style.top = (rect.top - containerRect.top) + 'px';
    input.style.width = Math.max(60, rect.width + 20) + 'px';
    input.style.fontSize = '12px';
    document.getElementById('canvas-container').appendChild(input);
    input.focus();
    input.select();

    function commit() {
      const newVal = input.value;
      textEl.textContent = newVal;
      input.remove();
      updateSelectionOverlay();
      if (window.History && newVal !== oldVal) {
        History.push({
          undo: () => { textEl.textContent = oldVal; },
          redo: () => { textEl.textContent = newVal; },
          label: 'Edit Text'
        });
      }
    }
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = oldVal; input.blur(); }
    });
  }

  // ── Context menu (right-click) ──
  function onContextMenu(e) {
    const target = findEditableElement(e.target);
    if (!target) return;
    e.preventDefault();
    selectElement(target);
    const menu = document.getElementById('context-menu');
    const rect = document.getElementById('canvas-area').getBoundingClientRect();
    menu.style.left = (e.clientX - rect.left) + 'px';
    menu.style.top = (e.clientY - rect.top) + 'px';
    menu.classList.remove('hidden');
    menu.innerHTML = '';
    addMenuItem(menu, '📋 复制', duplicateElement);
    addMenuItem(menu, '⬆️ 置顶', bringToFront);
    addMenuItem(menu, '⬇️ 置底', sendToBack);
    menu.appendChild(document.createElement('div')).className = 'context-menu-sep';
    addMenuItem(menu, '🗑️ 删除', deleteElement, true);
    setTimeout(() => {
      document.addEventListener('click', closeContextMenu, { once: true });
    }, 0);
  }

  function addMenuItem(menu, label, action, danger) {
    const item = document.createElement('div');
    item.className = 'context-menu-item' + (danger ? ' danger' : '');
    item.textContent = label;
    item.addEventListener('click', () => { closeContextMenu(); action(); });
    menu.appendChild(item);
  }

  function closeContextMenu() {
    const menu = document.getElementById('context-menu');
    if (menu) menu.classList.add('hidden');
  }

  // ── Element operations ──
  function deleteElement() {
    if (!selectedEl) return;
    const el = selectedEl;
    const parent = el.parentNode;
    if (window.History) {
      History.push({
        undo: () => { parent.appendChild(el); },
        redo: () => { el.remove(); },
        label: 'Delete'
      });
    }
    el.remove();
    deselect();
  }

  function duplicateElement() {
    if (!selectedEl) return;
    const clone = selectedEl.cloneNode(true);
    const pos = getElementPosition(selectedEl);
    setElementPosition(clone, pos.x + 10, pos.y + 10);
    selectedEl.parentNode.appendChild(clone);
    selectElement(clone);
    if (window.History) {
      History.push({
        undo: () => { clone.remove(); },
        redo: () => { selectedEl.parentNode.appendChild(clone); },
        label: 'Duplicate'
      });
    }
  }

  function bringToFront() {
    if (!selectedEl) return;
    const parent = selectedEl.parentNode;
    parent.appendChild(selectedEl);
  }

  function sendToBack() {
    if (!selectedEl) return;
    const parent = selectedEl.parentNode;
    parent.insertBefore(selectedEl, parent.firstChild);
  }

  // ── Zoom ──
  function setZoom(z) {
    zoom = Math.max(0.1, Math.min(5, z));
    applyZoom();
  }
  function getZoom() { return zoom; }
  function zoomBy(factor) { setZoom(zoom * factor); }

  function applyZoom() {
    if (!svgEl) return;
    const vb = svgEl.viewBox.baseVal;
    const w = vb.width || 400;
    const h = vb.height || 280;
    svgEl.setAttribute('width', w * zoom);
    svgEl.setAttribute('height', h * zoom);
    if (window.__ffOnZoomChanged) window.__ffOnZoomChanged();
  }

  function fitToView() {
    if (!svgEl) return;
    const container = document.getElementById('canvas-container');
    const cw = container.clientWidth - 40;
    const ch = container.clientHeight - 40;
    const vb = svgEl.viewBox.baseVal;
    const w = vb.width || 400;
    const h = vb.height || 280;
    zoom = Math.min(cw / w, ch / h);
    applyZoom();
  }

  function toggleGrid() {
    showGrid = !showGrid;
    const container = document.getElementById('svg-canvas');
    if (container) container.classList.toggle('show-grid', showGrid);
  }

  function toggleSnap() { snapEnabled = !snapEnabled; }

  // ── Helpers ──
  function findEditableElement(el) {
    while (el && el !== svgEl) {
      if (el.getAttribute && el.getAttribute('data-edit') === 'true') return el;
      el = el.parentNode;
    }
    return null;
  }

  function getMousePos(e) {
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.viewBox.baseVal;
    const scaleX = (vb.width || 400) / rect.width;
    const scaleY = (vb.height || 280) / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function getElementPosition(el) {
    const tag = el.tagName;
    if (tag === 'text') {
      return { x: parseFloat(el.getAttribute('x') || 0), y: parseFloat(el.getAttribute('y') || 0) };
    }
    if (tag === 'rect') {
      return { x: parseFloat(el.getAttribute('x') || 0), y: parseFloat(el.getAttribute('y') || 0) };
    }
    if (tag === 'circle') {
      return { x: parseFloat(el.getAttribute('cx') || 0), y: parseFloat(el.getAttribute('cy') || 0) };
    }
    if (tag === 'line') {
      return { x: parseFloat(el.getAttribute('x1') || 0), y: parseFloat(el.getAttribute('y1') || 0) };
    }
    if (tag === 'polyline' || tag === 'polygon') {
      const pts = el.getAttribute('points') || '0,0';
      const m = pts.match(/([\d.-]+),([\d.-]+)/);
      if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
    }
    if (tag === 'path') {
      const d = el.getAttribute('d') || '';
      const m = d.match(/M\s*([\d.-]+)[,\s]+([\d.-]+)/);
      if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
    }
    return { x: 0, y: 0 };
  }

  function setElementPosition(el, x, y) {
    const tag = el.tagName;
    if (tag === 'text' || tag === 'rect') {
      el.setAttribute('x', x); el.setAttribute('y', y);
    } else if (tag === 'circle') {
      el.setAttribute('cx', x); el.setAttribute('cy', y);
    } else if (tag === 'line') {
      const x2 = parseFloat(el.getAttribute('x2') || 0);
      const y2 = parseFloat(el.getAttribute('y2') || 0);
      const dx = x - parseFloat(el.getAttribute('x1') || 0);
      const dy = y - parseFloat(el.getAttribute('y1') || 0);
      el.setAttribute('x1', x); el.setAttribute('y1', y);
      el.setAttribute('x2', x2 + dx); el.setAttribute('y2', y2 + dy);
    }
  }

  return {
    loadSVG, getSVGMarkup, getSVGElement,
    selectElement, getSelected, deselect,
    setZoom, getZoom, zoomBy, fitToView,
    toggleGrid, toggleSnap,
    updateSelectionOverlay,
    deleteElement, duplicateElement, bringToFront, sendToBack,
    getElementPosition, setElementPosition,
  };
})();
window.Canvas = Canvas;
