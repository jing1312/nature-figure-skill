/**
 * FigureForge — Session Storage
 *
 * Auto-saves the working SVG + settings to localStorage after every
 * operation, restores on startup, and exposes manual save (Ctrl+S / 💾).
 * Also persists UI preferences (workspace background).
 */
const Store = (function () {
  const SESSION_KEY = 'ff-session';
  const PREFS_KEY = 'ff-prefs';
  let saveTimer = null;

  function saveSession(silent) {
    try {
      const svgEl = window.Canvas && Canvas.getSVGElement();
      if (!svgEl) return;
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        svg: Canvas.getSVGMarkup(),
        savedAt: new Date().toISOString(),
        palette: window.App ? App.state.activePalette : 'classic',
      }));
      if (!silent && window.Export) Export.toast('💾 已保存 — 下次打开自动恢复');
    } catch (e) {
      if (!silent && window.Export) Export.toast('❌ 保存失败：存储空间不足');
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSession(true), 800);
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function tryRestore() {
    const s = loadSession();
    if (!s || !s.svg) return false;
    Canvas.loadSVG(s.svg);
    if (window.History) History.clear();
    const when = s.savedAt ? new Date(s.savedAt) : null;
    const whenStr = when ? `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())} ${pad(when.getHours())}:${pad(when.getMinutes())}` : '';
    if (window.Export) Export.toast(`📂 已恢复上次编辑 ${whenStr}`);
    return true;
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function setPref(key, value) {
    const p = getPrefs();
    p[key] = value;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function getPref(key, fallback) {
    const p = getPrefs();
    return key in p ? p[key] : fallback;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // Hook History.push so every recorded operation triggers an autosave.
  function hookHistory() {
    if (!window.History) return;
    const orig = History.push.bind(History);
    History.push = function (cmd) {
      const res = orig(cmd);
      scheduleSave();
      return res;
    };
  }

  function init() {
    hookHistory();
    window.addEventListener('beforeunload', () => saveSession(true));
  }

  return { init, saveSession, scheduleSave, tryRestore, clearSession, getPref, setPref };
})();
window.Store = Store;
