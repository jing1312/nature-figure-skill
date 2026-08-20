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
