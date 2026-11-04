/**
 * Dump every FigureForge template SVG to a directory so external validators
 * (e.g. scripts/check-svg.py) can parse them as real XML.
 *
 * Usage: node scripts/dump-templates.js [outDir]
 * Default outDir: .tmp/template-svg
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const jsDir = path.join(root, 'figureforge', 'js');
const outDir = path.resolve(root, process.argv[2] || path.join('.tmp', 'template-svg'));

const sandbox = { window: {}, console };
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(file) {
  const src = fs.readFileSync(path.join(jsDir, file), 'utf8');
  vm.runInContext(src, sandbox, { filename: file });
}

load('templates.js');
const templates = vm.runInContext('CHART_TEMPLATES', sandbox);
const layouts = vm.runInContext('LAYOUT_TEMPLATES', sandbox);

fs.mkdirSync(outDir, { recursive: true });

let n = 0;
for (const [group, obj] of [['chart', templates], ['layout', layouts]]) {
  for (const [key, t] of Object.entries(obj || {})) {
    if (!t || typeof t.svg !== 'string') continue;
    const file = path.join(outDir, `${group}-${key}.svg`);
    fs.writeFileSync(file, t.svg, 'utf8');
    n++;
  }
}

console.log(`dumped ${n} template svg files to ${outDir}`);
