#!/usr/bin/env node
// Copies the cognia-design plugin into this repo. This is the only way the
// plugin copies here should change: never edit them by hand.
//
//   node scripts/sync-design-system.cjs [path-to-plugin]
//
// The plugin path defaults to .cognia-design-plugin (the local install, not committed).
// It updates:
//   design-system/cognia/                      copy of skills/cognia-design, checker included
//   project/ds/cognia/cognia-components.css    assets/components.css
//   project/ds/cognia/cognia-components.js     assets/components.js
//   project/ds/cognia/tokens.css               assets/globals.css without the Tailwind build import
//
// Then run the plugin check. Add --check to only report whether anything is out of date.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const pluginRoot = path.resolve(root, args.find(a => !a.startsWith('--')) || '.cognia-design-plugin');
const skill = path.join(pluginRoot, 'skills', 'cognia-design');

if (!fs.existsSync(path.join(skill, 'SKILL.md'))) {
  console.error(`No cognia-design plugin found at ${pluginRoot}. Pass the plugin folder as the first argument.`);
  process.exit(2);
}

let version = 'unknown';
try { version = JSON.parse(fs.readFileSync(path.join(pluginRoot, '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch {}

const tokens = fs.readFileSync(path.join(skill, 'assets', 'globals.css'), 'utf8')
  .replace(/^@import\s+["']tailwindcss["'];?\r?\n/m, '');

const files = [
  { to: 'project/ds/cognia/cognia-components.css', content: fs.readFileSync(path.join(skill, 'assets', 'components.css')) },
  { to: 'project/ds/cognia/cognia-components.js', content: fs.readFileSync(path.join(skill, 'assets', 'components.js')) },
  { to: 'project/ds/cognia/tokens.css', content: Buffer.from(tokens) },
];

// Reference copy: every file in skills/cognia-design, including the checker, so the
// check runs from this repo with no access to the private plugin repo.
function walk(dir, rel = '') {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.DS_Store') continue;
    const abs = path.join(dir, name);
    const r = path.join(rel, name);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs, r);
    } else {
      files.push({ to: path.join('design-system/cognia', r), content: fs.readFileSync(abs) });
    }
  }
}
walk(skill);

const changed = [];
for (const f of files) {
  const dest = path.join(root, f.to);
  const current = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
  if (current && current.equals(f.content)) continue;
  changed.push(f.to);
  if (!checkOnly) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.content);
  }
}

// Files in the reference copy that the plugin no longer has.
const expected = new Set(files.filter(f => f.to.startsWith('design-system/cognia')).map(f => path.normalize(f.to)));
const stale = [];
(function findStale(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === '.DS_Store') continue;
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) findStale(abs);
    else {
      const rel = path.normalize(path.relative(root, abs));
      if (!expected.has(rel)) stale.push(rel);
    }
  }
})(path.join(root, 'design-system/cognia'));
for (const rel of stale) if (!checkOnly) fs.unlinkSync(path.join(root, rel));

if (!changed.length && !stale.length) {
  console.log(`Plugin copies match cognia-design ${version}.`);
  process.exit(0);
}
const verb = checkOnly ? 'Out of date' : 'Updated';
for (const f of changed) console.log(`${verb}: ${f}`);
for (const f of stale) console.log(`${checkOnly ? 'No longer in plugin' : 'Removed'}: ${f}`);
console.log(checkOnly
  ? `Run node scripts/sync-design-system.cjs to copy cognia-design ${version}.`
  : `Synced cognia-design ${version}. Now run the plugin check.`);
process.exit(checkOnly ? 1 : 0);
