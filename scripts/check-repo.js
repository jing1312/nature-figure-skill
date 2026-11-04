/**
 * CI check: repository hygiene that the template/palette check cannot catch.
 *
 *   1. every skills/<name>/SKILL.md has valid frontmatter (name matches the folder)
 *   2. every skills/<name>/evals/evals.json matches the eval schema
 *   3. every relative markdown link resolves, and every #anchor matches a real
 *      heading in the target file (GitHub-style slug)
 *
 * No dependencies — plain node.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let fail = 0;
const ok = (m) => console.log('  ok  ' + m);
const bad = (m) => { console.error('  FAIL ' + m); fail++; };

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === '.tmp') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* ── GitHub-style heading slug ──────────────────────────────────────────── */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
const PUNCT = /["'`^~*+=|\\<>?()[\]{}#:;。，、；：？！「」『』（）【】…—–]/g;

function slugify(text) {
  return text
    .replace(EMOJI, '')
    .replace(PUNCT, '')
    .replace(/\s+$/, '')
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^\w\-À-￿]/g, '');
}

function headingsOf(md) {
  const map = new Map();
  const seen = new Map();
  for (const line of md.split(/\r?\n/)) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!m) continue;
    let slug = slugify(m[2].replace(/\s+#+\s*$/, ''));
    const n = seen.get(slug) || 0;
    seen.set(slug, n + 1);
    if (n > 0) slug = slug + '-' + n;
    map.set(slug, m[2].trim());
  }
  return map;
}

function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

/* ── 1. skill frontmatter ───────────────────────────────────────────────── */
const skillsDir = path.join(root, 'skills');
const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const name of skillDirs) {
  const skillPath = path.join(skillsDir, name, 'SKILL.md');
  if (!fs.existsSync(skillPath)) { bad(`skills/${name}: SKILL.md missing`); continue; }
  const raw = fs.readFileSync(skillPath, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) { bad(`skills/${name}: no YAML frontmatter`); continue; }
  const fm = m[1];
  const nm = /^name:\s*(.+)$/m.exec(fm);
  const dm = /^description:\s*(>-|>|\|)?\s*([\s\S]*?)$/m.exec(fm);
  if (!nm) { bad(`skills/${name}: frontmatter missing name`); continue; }
  const declared = nm[1].trim().replace(/^["']|["']$/g, '');
  if (declared !== name) bad(`skills/${name}: frontmatter name "${declared}" != folder name`);
  else ok(`skills/${name}: frontmatter name ok`);
  if (!dm) { bad(`skills/${name}: frontmatter missing description`); continue; }
  const desc = (dm[2] || '').trim();
  if (desc.length < 40) bad(`skills/${name}: description too short (${desc.length} chars)`);
  else ok(`skills/${name}: description ${desc.length} chars`);
}

/* ── 2. evals schema ────────────────────────────────────────────────────── */
for (const name of skillDirs) {
  const evPath = path.join(skillsDir, name, 'evals', 'evals.json');
  if (!fs.existsSync(evPath)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(evPath, 'utf8')); }
  catch (e) { bad(`skills/${name}/evals/evals.json: invalid JSON — ${e.message}`); continue; }
  if (data.skill_name !== name) bad(`skills/${name}: evals.skill_name "${data.skill_name}" != folder name`);
  else ok(`skills/${name}: evals.skill_name ok`);
  if (!Array.isArray(data.evals) || data.evals.length === 0) { bad(`skills/${name}: evals list empty`); continue; }
  const ids = new Set();
  for (const ev of data.evals) {
    if (!ev || typeof ev !== 'object') { bad(`skills/${name}: eval entry is not an object`); continue; }
    if (ev.id === undefined || ev.id === null || ev.id === '') {
      bad(`skills/${name}: eval missing id`);
    } else {
      const key = String(ev.id);
      if (ids.has(key)) bad(`skills/${name}: duplicate eval id "${key}"`);
      ids.add(key);
      if (typeof ev.id === 'string' && !/^[a-z0-9-]+$/.test(ev.id)) {
        bad(`skills/${name}: eval id "${ev.id}" should be kebab-case`);
      }
    }
    for (const field of ['prompt', 'expected_output']) {
      if (typeof ev[field] !== 'string' || !ev[field].trim()) {
        bad(`skills/${name}: eval ${ev.id} missing ${field}`);
      }
    }
    if (ev.assertions !== undefined) {
      if (!Array.isArray(ev.assertions) || ev.assertions.length === 0) {
        bad(`skills/${name}: eval ${ev.id} has empty assertions`);
      } else {
        for (const a of ev.assertions) {
          if (!a || typeof a.name !== 'string' || !a.name.trim() || typeof a.description !== 'string' || !a.description.trim()) {
            bad(`skills/${name}: eval ${ev.id} has a malformed assertion`);
          }
        }
      }
    }
    if (ev.files !== undefined && !Array.isArray(ev.files)) {
      bad(`skills/${name}: eval ${ev.id} files must be an array`);
    }
  }
  ok(`skills/${name}: ${data.evals.length} eval(s) schema ok`);
}

/* ── 3. markdown links + anchors ────────────────────────────────────────── */
const mdFiles = walk(root).filter((f) => f.toLowerCase().endsWith('.md'));
const headingCache = new Map();
const headingsFor = (file) => {
  if (!headingCache.has(file)) headingCache.set(file, headingsOf(fs.readFileSync(file, 'utf8')));
  return headingCache.get(file);
};

let linkCount = 0;
for (const file of mdFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const md = stripCode(fs.readFileSync(file, 'utf8'));
  const re = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img[^>]+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const target = (m[1] || m[2] || '').trim();
    if (!target || /^(https?:|mailto:|data:|#!)/i.test(target)) continue;
    linkCount++;
    const [rawPath, anchor] = target.split('#');
    let resolved = file;
    if (rawPath) {
      resolved = path.resolve(path.dirname(file), decodeURIComponent(rawPath));
      if (!fs.existsSync(resolved)) { bad(`${rel}: broken link -> ${target}`); continue; }
    }
    if (anchor) {
      const heads = headingsFor(resolved);
      if (!heads.has(decodeURIComponent(anchor).toLowerCase())) {
        bad(`${rel}: anchor not found -> #${anchor}`);
      }
    }
  }
}
ok(`${mdFiles.length} markdown file(s), ${linkCount} relative link(s) resolved`);

if (fail) { console.error(`\n${fail} check(s) failed`); process.exit(1); }
console.log('\nall repo checks passed');
