/**
 * FigureForge — Undo/Redo History
 * Command pattern with undo/redo stacks.
 */
const History = (function () {
  let undoStack = [];
  let redoStack = [];
  const MAX = 100;

  function push(cmd) {
    undoStack.push(cmd);
    if (undoStack.length > MAX) undoStack.shift();
    redoStack = [];
    updateButtons();
  }

  function undo() {
    if (undoStack.length === 0) return;
    const cmd = undoStack.pop();
    cmd.undo();
    redoStack.push(cmd);
    updateButtons();
    if (window.Canvas) Canvas.updateSelectionOverlay();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const cmd = redoStack.pop();
    cmd.redo();
    undoStack.push(cmd);
    updateButtons();
    if (window.Canvas) Canvas.updateSelectionOverlay();
  }

  function updateButtons() {
    const u = document.getElementById('btn-undo');
    const r = document.getElementById('btn-redo');
    if (u) u.disabled = undoStack.length === 0;
    if (r) r.disabled = redoStack.length === 0;
  }

  function clear() {
    undoStack = [];
    redoStack = [];
    updateButtons();
  }

  return { push, undo, redo, clear, updateButtons };
})();
window.History = History;
