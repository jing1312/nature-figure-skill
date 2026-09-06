/**
 * CI check: load templates.js + palettes.js in a VM sandbox and verify every
 * template renders a plausible SVG string. Catches the "white page" class of
 * regressions (syntax errors, broken template string concat, missing helper).
 * No dependencies — runs on plain node.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, '..', 'figureforge', 'js');
const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(file) {
  const src = fs.readFileSync(path.join(jsDir, file), 'utf8');
  vm.runInContext(src + `\n;this.__m = { T: typeof CHART_TEMPLATES !== 'undefined' ? CHART_TEMPLATES : undefined, L: typeof LAYOUT_TEMPLATES !== 'undefined' ? LAYOUT_TEMPLATES : undefined };`, sandbox, { filename: file });
  return sandbox.__m;
}

let fail = 0;
function check(cond, msg) {
  if (cond) { console.log('  ok  ' + msg); } else { console.error('  FAIL ' + msg); fail++; }
}

// 1. templates (22 total: 13 chart + 9 layout)
const tm = load('templates.js');
check(tm.T && Object.keys(tm.T).length >= 13, `chart templates >= 13 (got ${Object.keys(tm.T || {}).length})`);
check(tm.L && Object.keys(tm.L).length >= 9, `layout templates >= 9 (got ${Object.keys(tm.L || {}).length})`);
check((Object.keys(tm.T || {}).length + Object.keys(tm.L || {}).length) >= 22, `templates total >= 22`);
for (const [group, obj] of [['chart', tm.T], ['layout', tm.L]]) {
  for (const [key, t] of Object.entries(obj || {})) {
    const s = t && t.svg;
    check(typeof s === 'string' && s.startsWith('<svg') && s.endsWith('</svg>'), `${group}/${key}: svg wrapper`);
    check(typeof s === 'string' && s.includes('viewBox'), `${group}/${key}: has viewBox`);
    check(typeof s === 'string' && (s.match(/</g) || []).length === (s.match(/>/g) || []).length, `${group}/${key}: tag brackets balanced`);
  }
}

// 2. palettes
const pm = load('palettes.js');
const pal = vm.runInContext('getPaletteList()', sandbox);
check(Array.isArray(pal) && pal.length >= 14, `palettes >= 14 (got ${pal ? pal.length : 0})`);
check(vm.runInContext('getPaletteColors("tableau10").length', sandbox) >= 6, 'getPaletteColors works');

// 3. syntax-check every js file (belt and braces; catches files not loaded above)
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith('.js') || f === 'build-showcase.js') continue;
  try {
    new vm.Script(fs.readFileSync(path.join(jsDir, f), 'utf8'), { filename: f });
    console.log('  ok  syntax ' + f);
  } catch (e) {
    console.error('  FAIL syntax ' + f + ': ' + e.message);
    fail++;
  }
}

if (fail) { console.error(`\n${fail} check(s) failed`); process.exit(1); }
console.log('\nall template checks passed');
