#!/usr/bin/env node
/* Cognia design system check.
 *
 * Checks a project's screens and styles against this plugin. Every rule is read from
 * the plugin's own files (design-system/*.md, assets/globals.css, assets/logos), so a
 * change to the plugin applies to every project the next time the check runs.
 *
 * Usage, from the project root:
 *   node <plugin>/skills/cognia-design/checks/check-project.cjs [--update-baseline] [--static-only]
 *
 * The project describes itself in cognia-design.config.json (see checks/README.md).
 * Known legacy issues are recorded in a baseline file: the check fails on any new issue
 * or any increase, and asks you to lower the baseline when issues are fixed.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const PLUGIN = path.resolve(__dirname, '..');
const DOCS = path.join(PLUGIN, 'design-system');
const PROJECT = process.cwd();
const args = new Set(process.argv.slice(2));

// ---------------------------------------------------------------------------
// 1. Rules, read from the plugin
// ---------------------------------------------------------------------------
const doc = name => fs.readFileSync(path.join(DOCS, name), 'utf8');
const section = (text, heading) => {
  const i = text.indexOf(heading);
  if (i < 0) throw new Error(`Plugin docs changed: "${heading}" not found`);
  const rest = text.slice(i + heading.length);
  const next = rest.search(/\n#{1,3} /);
  return next < 0 ? rest : rest.slice(0, next);
};
const need = (list, what) => { if (!list.length) throw new Error(`Plugin docs changed: could not read ${what}`); return list; };

function readRules() {
  const typo = doc('typography.md');
  const scaleRows = [...section(typo, '## Type scale').matchAll(/^\|[^|]+\|\s*`[^`]+`\s*\|\s*(\d+)px\s*\|\s*(\d+)\s*\|/gm)];
  const typeSizes = need([...new Set(scaleRows.map(m => +m[1]))], 'type scale sizes');
  const weights = need([...new Set(scaleRows.map(m => +m[2]))], 'type scale weights');
  // Each weight belongs to particular sizes: 700 only on the two title sizes, 600 on Heading and the Strong rows.
  const pairs = new Set(scaleRows.map(m => m[1] + '/' + m[2]));
  const titleSizes = [...new Set(scaleRows.filter(m => +m[2] >= 700).map(m => +m[1]))];
  const maxSizes = +(typo.match(/maximum of \*\*(\d+) font sizes/) || [])[1] || null;
  const maxWeights = +(typo.match(/maximum of \*\*(\d+) font weights/) || [])[1] || null;

  const spacing = doc('spacing.md');
  const space = need([...section(spacing, '## 8 point scale').matchAll(/^\|\s*`p-[^`]+`[^|]*\|\s*(\d+)px\s*\|/gm)].map(m => +m[1]), 'spacing scale');
  const radius = need([...section(spacing, '## Border radius').matchAll(/^\|\s*`rounded-[a-z]+`\s*\|\s*(\d+)px\s*\|/gm)].map(m => +m[1]), 'border radius values');
  const shadows = need([...section(spacing, '## Shadows').matchAll(/^\|\s*`shadow-([a-z0-9]+)`/gm)].map(m => m[1]), 'shadow classes');
  const responsiveVars = [...section(spacing, '## Responsive layout').matchAll(/^\|\s*`(--[a-z-]+)`/gm)].map(m => m[1]);

  const z = need([...doc('z-index.md').matchAll(/^\|\s*`z-\d+`\s*\|\s*(\d+)\s*\|/gm)].map(m => +m[1]), 'z-index scale');
  const durations = need([...doc('motion.md').matchAll(/duration-(\d+)/g)].map(m => +m[1]), 'motion duration');

  const themes = doc('themes.md');
  const statusText = [...section(typo, '## Text colour').matchAll(/`text-(success|warning|destructive|info)`/g)].map(m => m[1]);

  const globals = fs.readFileSync(path.join(PLUGIN, 'assets', 'globals.css'), 'utf8');
  const tokens = new Set([...globals.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]));

  return {
    typeSizes, weights, pairs, titleSizes, maxSizes, maxWeights,
    space: new Set(space), radius: new Set(radius), shadows: new Set(shadows), responsiveVars,
    z: new Set(z), durations: new Set(durations), statusText, tokens,
    accentVars: /--accent-(?:\d00)/.test(themes),
  };
}

// ---------------------------------------------------------------------------
// 2. Project config and files
// ---------------------------------------------------------------------------
const configPath = path.join(PROJECT, 'cognia-design.config.json');
if (!fs.existsSync(configPath)) {
  console.error('No cognia-design.config.json in ' + PROJECT + '. See ' + path.join(__dirname, 'README.md'));
  process.exit(2);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function glob(pattern) {
  // Supports "dir/*.ext" and "dir/**/*.ext".
  const deep = pattern.includes('**');
  const [base, ...rest] = pattern.split(/\/\*\*\/|\/\*/);
  const ext = pattern.slice(pattern.lastIndexOf('*') + 1);
  const out = [];
  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (deep && e.name !== 'node_modules' && !e.name.startsWith('.')) walk(f); }
      else if (f.endsWith(ext)) out.push(path.relative(PROJECT, f).split(path.sep).join('/'));
    }
  };
  walk(path.join(PROJECT, base));
  return out.sort();
}
const matches = (file, patterns = []) => patterns.some(p => {
  const re = new RegExp('^' + p.split('**').map(s => s.split('*').map(x => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*') + '$');
  return re.test(file);
});
const screens = (config.screens || []).flatMap(glob).filter(f => !matches(f, config.exclude));
const styles = (config.styles || []).flatMap(glob).filter(f => !matches(f, config.exclude));
const read = f => fs.readFileSync(path.join(PROJECT, f), 'utf8');

function profileFor(file, html) {
  for (const p of config.profiles || []) {
    if (p.whenContains && html.includes(p.whenContains)) return p;
    if (p.files && matches(file, p.files)) return p;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Source checks
// ---------------------------------------------------------------------------
const issues = []; // { file, rule, detail }
const add = (file, rule, detail) => issues.push({ file, rule, detail });

const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\s*\(|\b(?:white|black|red|blue|green|gray|grey|silver|orange|yellow|purple|pink|navy|teal)\b/i;
const COLOR_PROPS = /^(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|text-decoration-color|caret-color|accent-color|box-shadow|column-rule-color)$/;
const SURFACE_AS_TEXT = /var\(\s*--(primary|secondary|muted|accent|card|popover|background|sidebar)\s*\)/;
const ACCENT_AS_TEXT = /var\(\s*--accent-\d00\s*\)/;
const SPACING_PROPS = /^(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$/;
const LAYOUT_ANIM = /\b(?:width|height|top|left|right|bottom|margin|padding|inset)\b/;

// Placement rules (components.md: Input field, Button, Card; typography.md: Type scale).
// They look at what a selector styles, not only at which value it uses.
const topLevel = selector => { const out = []; let depth = 0, cur = ''; for (const ch of selector) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
const compounds = selector => topLevel(selector).map(s => s.replace(/:not\([^)]*\)/g, '').trim().split(/\s*[\s>+~]\s*/).pop() || '');
const CONTROL_RE = /(?:^|[^\w-])(?:input|select|textarea|button)(?![\w-])|\.(?:input|search-input|select|select-trigger|textarea|btn)(?![\w-])/;
const FIELD_RE = /(?:^|[^\w-])(?:input|select|textarea)(?![\w-])|\.(?:input|search-input|select|select-trigger|textarea)(?![\w-])/;
const NOT_FIELD_RE = /checkbox|radio|switch|range|\[type=["']?(?:color|file)/;
const CARD_RE = /\.(?:[\w-]*-)?card(?![\w-])/;
const BORDER_WIDTH_PROPS = /^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?$/;
const hasVisibleBorder = v => !/^(?:0|0px|none|hidden|inherit|initial|unset)$/i.test(v) && !/transparent/i.test(v) && !/(?:^|\s)none(?:\s|$)/.test(v) && (lengths(v).some(n => n > 0) || /\b(?:thin|medium|thick)\b/.test(v));
const TITLE_SIZE_RE = R => new RegExp('font(?:-size)?\\s*:[^;]*(?:var\\(--text-title-[a-z]+\\)|\\b(?:' + R.titleSizes.join('|') + ')px\\b)');

const px = (n, unit) => unit === 'rem' ? n * 16 : n;
const lengths = v => [...v.replace(/var\([^)]*\)/g, '').matchAll(/(-?\d*\.?\d+)(px|rem)\b/g)].map(m => Math.abs(px(+m[1], m[2])));

function checkDeclaration(file, selector, prop, value, R, opts = {}) {
  prop = prop.trim().toLowerCase();
  value = value.replace(/!important/g, '').trim();
  if (!value || value.includes('{{')) return;
  const where = `${selector.trim().slice(0, 60)} { ${prop}: ${value.slice(0, 60)} }`;

  if (COLOR_PROPS.test(prop) && COLOR_LITERAL.test(value.replace(/var\([^)]*\)/g, '')) && !/^(?:transparent|currentcolor|inherit|none)$/i.test(value)) {
    add(file, 'colour.hardcoded', where);
  }
  if (prop === 'color') {
    // components.md, Icon: an icon may use the accent (--accent-300, or --accent-400 on a tinted surface) or a status colour. Text never may.
    // An icon is an svg, .icon or *-icon element, or a class the project lists in iconSelectors; every selector in the list must be one.
    const iconPart = part => {
      const bare = part.replace(/:(?:not|has)\((?:[^()]|\([^()]*\))*\)/g, '').trim();
      const inner = bare.match(/:(?:is|where)\(((?:[^()]|\([^()]*\))*)\)\s*$/);
      if (inner) return topLevel(inner[1]).every(iconPart);
      const last = bare.split(/\s*[\s>+~]\s*/).pop() || '';
      return /^svg\b|\.icon(?![\w-])|-icon(?![\w-])/.test(last) || (config.iconSelectors || []).some(s => last.includes(s));
    };
    const isIcon = topLevel(selector).every(iconPart);
    const accentIcon = /--accent-[34]00/.test(value) && isIcon;
    if (ACCENT_AS_TEXT.test(value) && !accentIcon) add(file, 'colour.accent-text', where);
    else if (SURFACE_AS_TEXT.test(value)) add(file, 'colour.surface-token-as-text', where);
    const status = value.match(/var\(\s*--(success|warning|destructive|info)\s*\)/);
    // Status colours are allowed in badges and alerts, on data values and on destructive buttons (typography.md, Text colour).
    // Data values are recognised by name (value, rate, metric, score, delta); the render check then holds them to contrast.
    const dataValue = /(?:^|[-_.\s])(?:value|rate|metric|score|delta)(?=$|[-_.\s:,)])/i.test(selector);
    // components.md, Icon: status icons (any icon, or the documented .icon-* classes), used next to text that states the status.
    const statusIcon = isIcon || /\.icon\.icon-(?:success|warning|destructive|info)\b/.test(selector);
    if (status && !dataValue && !statusIcon && !/badge|alert|tag|status|pill|chip|toast|error|invalid|destructive/i.test(selector)) add(file, 'colour.status-text-outside-badge', where);
  }
  if (prop === 'opacity' && !/disabled/.test(selector) && /\b(?:p|h[1-6]|span|label|a|li|small|b|strong)\b/.test(selector) && parseFloat(value) < 1) {
    add(file, 'colour.opacity-on-text', where);
  }

  if (prop === 'font-family' && !/var\(--font-(?:sans|family)\)|inherit|monospace/.test(value)) add(file, 'type.font-family', where);
  let size = null;
  if (prop === 'font-size') size = value;
  if (prop === 'font') {
    if (!/var\(--font-(?:sans|family)\)|inherit/.test(value)) add(file, 'type.font-family', where);
    size = (value.match(/(?:^|\s)((?:-?\d*\.?\d+)(?:px|rem)|var\(--text-[a-z-]+\))(?=\s*[/\s])/) || [])[1] || null;
    const w = (value.match(/^(\d{3})\b/) || [])[1];
    if (w && !R.weights.includes(+w)) add(file, 'type.weight', where);
  }
  if (size && !/var\(--text-|inherit|em\b|%/.test(size)) {
    const n = lengths(size)[0];
    if (n !== undefined && !opts.chart) add(file, R.typeSizes.includes(n) ? 'type.raw-size' : 'type.off-scale-size', where);
  }
  if (prop === 'font-weight') {
    const w = /^\d+$/.test(value) ? +value : { normal: 400, bold: 700 }[value];
    if (w && !R.weights.includes(w)) add(file, 'type.weight', where);
    // Bold (700) is only for the title sizes. Everything smaller uses 600 (font-semibold) at most.
    if (w >= 700 && !opts.chart && !opts.pluginCopy && !/^\.font-bold$/.test(selector) && !TITLE_SIZE_RE(R).test(opts.block || '')) add(file, 'type.bold-below-title', where);
  }
  if (opts.profile && opts.profile.forbidTokens) {
    for (const t of opts.profile.forbidTokens) if (value.includes(`var(${t})`)) add(file, 'type.not-in-profile', `${where} (${opts.profile.name})`);
  }

  if (SPACING_PROPS.test(prop) && !opts.chart) {
    const off = lengths(value).filter(n => !R.space.has(n));
    if (off.length) add(file, 'spacing.off-scale', where);
  }
  if (/^border(?:-(?:top|bottom)-(?:left|right))?-radius$/.test(prop)) {
    const ok = v => R.radius.has(v) || v === 0;
    const off = lengths(value).filter(n => !ok(n));
    if (off.length) add(file, 'radius.off-scale', where);
  }
  if (prop === 'box-shadow' && !/^(?:none|inherit|initial)$/.test(value)) {
    const vars = [...value.matchAll(/var\(--shadow-([a-z0-9]+)\)/g)].map(m => m[1]);
    const stripped = value.replace(/var\([^)]*\)/g, '').replace(/[\s,]/g, '');
    if (!vars.length || stripped || vars.some(v => !R.shadows.has(v))) {
      // Focus rings built from tokens (0 0 0 3px var(--ring)) are documented as focus states.
      if (!/var\(--ring\)/.test(value)) add(file, 'shadow.not-a-token', where);
    }
  }
  if (!opts.chart && !opts.pluginCopy && selector !== 'style attribute') {
    const parts = compounds(selector);
    // Controls have no shadow. Focus rings built from --ring are the focus state, not a shadow.
    if (prop === 'box-shadow' && !/^(?:none|inherit|initial|unset)$/.test(value) && !/var\(--ring\)/.test(value)
      && parts.some((c, i) => CONTROL_RE.test(c) && !CARD_RE.test(c) && !/:focus/.test(topLevel(selector)[i] || ''))) add(file, 'shadow.on-control', where);
    // Input fields, search fields and select triggers have no border: the fill shows the field.
    if (BORDER_WIDTH_PROPS.test(prop) && hasVisibleBorder(value) && parts.some(c => FIELD_RE.test(c) && !NOT_FIELD_RE.test(c))) add(file, 'border.on-field', where);
    // Cards never have a border, in any state.
    if (BORDER_WIDTH_PROPS.test(prop) && hasVisibleBorder(value) && parts.some(c => CARD_RE.test(c))) add(file, 'border.on-card', where);
  }
  // motion.md, Exception: Ambient loops. A decorative animation that repeats forever sets its own duration and easing.
  const ambientLoop = /^animation/.test(prop) && /\binfinite\b/.test(prop === 'animation' ? value : (opts.block || ''));
  if (/^(?:transition|transition-duration|animation|animation-duration)$/.test(prop) && !ambientLoop) {
    const ms = t => { const m = t.match(/^(\d*\.?\d+)(ms|s)$/); return m ? (m[2] === 's' ? +m[1] * 1000 : +m[1]) : null; };
    for (const part of value.split(',')) {
      const times = part.trim().split(/\s+/).map(ms).filter(t => t !== null);
      const dur = /-duration$/.test(prop) ? times : times.slice(0, 1);
      if (dur.some(t => t !== 0 && !R.durations.has(t))) { add(file, 'motion.duration', where); break; }
    }
    if (/^(?:transition|animation)$/.test(prop) && value.split(',').some(part => part.trim().split(/\s+/).map(ms).filter(t => t !== null && t !== 0).length > 1)) add(file, 'motion.delay', where);
    if (/cubic-bezier|steps\(/.test(value)) add(file, 'motion.easing', where);
    if (prop === 'transition' && value.split(',').some(t => LAYOUT_ANIM.test(t.trim().split(/\s+/)[0]))) add(file, 'motion.layout-property', where);
  }
  if (prop === 'transition-delay' && !/^0m?s$/.test(value)) add(file, 'motion.delay', where);
  if (prop === 'transition-timing-function' && /cubic-bezier|steps\(/.test(value)) add(file, 'motion.easing', where);
  if (prop === 'z-index' && /^-?\d+$/.test(value) && !R.z.has(+value)) add(file, 'z-index.off-scale', where);

  if (opts.logo && /^(?:filter|opacity|color|fill|mix-blend-mode)$/.test(prop) && !/^(?:none|1|inherit)$/.test(value)) add(file, 'logo.restyled', where);
}

function checkCss(file, css, R, opts = {}) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (/^(?:from|to|\d+%)/.test(selector) || selector.startsWith('@font-face')) continue;
    const logo = (config.logoSelectors || []).some(s => selector.includes(s));
    const chart = (config.chartSelectors || []).some(s => selector.includes(s));
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i > 0) checkDeclaration(file, selector, d.slice(0, i), d.slice(i + 1), R, { ...opts, logo, chart, block: m[2] });
    }
  }
}

function sourceChecks(R) {
  // The components copy is the plugin's own file (checked below for being unchanged), so placement rules skip it.
  for (const f of styles) checkCss(f, read(f), R, { pluginCopy: f === config.componentsCopy });
  for (const f of screens) {
    const html = read(f);
    const profile = profileFor(f, html);
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(f, m[1], R, { profile });
    for (const m of html.matchAll(/\sstyle="([^"]*)"/g)) {
      const decls = m[1].split(';').filter(Boolean);
      for (const d of decls) {
        const i = d.indexOf(':');
        if (i < 0) continue;
        const prop = d.slice(0, i).trim().toLowerCase();
        if (/^(?:font|font-size|font-weight|font-family|color|background|background-color)$/.test(prop) && !d.includes('{{')) {
          add(f, 'inline.type-or-colour', `style="${d.trim().slice(0, 60)}"`);
        }
        checkDeclaration(f, 'style attribute', prop, d.slice(i + 1), R, { profile, block: m[1] });
      }
    }
  }
  // Tailwind-style classes in markup, including markup that scripts build: font-bold only with a title size.
  const scripts = (config.scripts || []).flatMap(glob).filter(f => !matches(f, config.exclude));
  for (const f of [...screens, ...scripts]) {
    for (const m of read(f).matchAll(/class(?:Name)?=["'`]([^"'`]*)["'`]/g)) {
      const cls = m[1].split(/\s+/);
      if (cls.includes('font-bold') && !cls.some(c => /^text-title-/.test(c))) add(f, 'type.bold-below-title', `class="${m[1].trim().slice(0, 60)}"`);
    }
  }
  // components.md, Tabs: secondary chips are for settings in a form (role=group); tabs and view switchers use the primary pill.
  for (const f of [...screens, ...scripts]) {
    for (const m of read(f).matchAll(/<[a-z]+\b[^>]*\btabs-list-secondary\b[^>]*>/g)) if (/role=["'\\]*tablist/.test(m[0])) add(f, 'tabs.secondary-as-tabs', m[0].slice(0, 80));
  }
  // Logos: project copies must be the plugin's files, unchanged.
  for (const [projectFile, pluginFile] of Object.entries(config.logos || {})) {
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const p = path.join(PROJECT, projectFile);
    if (!fs.existsSync(p)) { add(projectFile, 'logo.missing', 'expected a copy of assets/logos/' + pluginFile); continue; }
    if (norm(fs.readFileSync(p, 'utf8')) !== norm(fs.readFileSync(path.join(PLUGIN, 'assets', 'logos', pluginFile), 'utf8'))) {
      add(projectFile, 'logo.modified-file', 'differs from the plugin\'s assets/logos/' + pluginFile);
    }
  }
  // Token copy: the project's copy of globals.css values must match the plugin.
  if (config.tokenCopy) {
    const decls = css => new Map([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim().toLowerCase()]));
    const ours = decls(read(config.tokenCopy));
    const theirs = decls(fs.readFileSync(path.join(PLUGIN, 'assets', 'globals.css'), 'utf8'));
    for (const [k, v] of theirs) if (ours.has(k) && ours.get(k) !== v) add(config.tokenCopy, 'tokens.out-of-date', `${k}: ${ours.get(k)} (plugin: ${v})`);
  }
  // Components copy: the project's copy of assets/components.css must be identical to the plugin's.
  // Projects never edit components; a change belongs in the plugin, then every project re-copies it.
  if (config.componentsCopy) {
    const norm = css => css.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n').trim();
    const p = path.join(PROJECT, config.componentsCopy);
    if (!fs.existsSync(p)) add(config.componentsCopy, 'components.missing', 'expected a copy of assets/components.css');
    else if (norm(read(config.componentsCopy)) !== norm(fs.readFileSync(path.join(PLUGIN, 'assets', 'components.css'), 'utf8'))) {
      add(config.componentsCopy, 'components.out-of-date', 'differs from the plugin\'s assets/components.css. Re-copy it; never edit it in the project.');
    }
  }
  // Same for the behaviour script (assets/components.js), when the project uses it.
  if (config.componentsScriptCopy) {
    const norm = js => js.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n').trim();
    const p = path.join(PROJECT, config.componentsScriptCopy);
    if (!fs.existsSync(p)) add(config.componentsScriptCopy, 'components.missing', 'expected a copy of assets/components.js');
    else if (norm(read(config.componentsScriptCopy)) !== norm(fs.readFileSync(path.join(PLUGIN, 'assets', 'components.js'), 'utf8'))) {
      add(config.componentsScriptCopy, 'components.out-of-date', 'differs from the plugin\'s assets/components.js. Re-copy it; never edit it in the project.');
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Rendered checks
// ---------------------------------------------------------------------------
async function renderedChecks(R) {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { console.error('Playwright is needed for the rendered checks: npm i --no-save playwright && npx playwright install chromium (or pass --static-only)'); process.exit(2); }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: config.viewport || { width: 1440, height: 1000 } });
  page.on('pageerror', () => {});
  const shell = config.shell || {};

  for (const f of screens) {
    const html = read(f);
    const profile = profileFor(f, html);
    const allowed = (profile && profile.typeSizes) || R.typeSizes;
    await page.goto('file://' + path.join(PROJECT, f));
    await page.waitForTimeout(config.settleMs || 800);
    const r = await page.evaluate(({ shell, hiddenSelectors, lineExempt }) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 1;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      const rgba = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
      const blend = (top, under) => top[3] >= 1 ? top : [0, 1, 2].map(i => top[i] * top[3] + under[i] * (1 - top[3])).concat(1);
      const bgOf = el => {
        const layers = [];
        for (let e = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.backgroundImage !== 'none') return null; // image or gradient: cannot judge
          const c = rgba(cs.backgroundColor);
          if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
        }
        let out = [255, 255, 255, 1];
        for (const l of layers.reverse()) out = blend(l, out);
        return out;
      };
      // What is painted under the middle of the text, including svg shapes (a gauge circle behind its value).
      // Falls back to the ancestor walk when the text is not hit-testable.
      const bgAt = el => {
        const b = el.getBoundingClientRect();
        const stack = document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        const i = stack.indexOf(el);
        if (i < 0) return bgOf(el);
        const layers = [];
        for (const e of stack.slice(i)) {
          const cs = getComputedStyle(e);
          let c = null;
          if (e instanceof SVGGeometryElement) {
            if (cs.fill === 'none') continue;
            if (/url\(/.test(cs.fill)) return null; // gradient or pattern: cannot judge
            c = rgba(cs.fill); c[3] *= (+cs.fillOpacity || 0) * (+cs.opacity);
          } else if (e instanceof SVGElement) continue;
          else {
            if (cs.backgroundImage !== 'none') return null;
            c = rgba(cs.backgroundColor);
          }
          if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
        }
        let out = [255, 255, 255, 1];
        for (const l of layers.reverse()) out = blend(l, out);
        return out;
      };
      const visible = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 1 && b.height > 1 && cs.visibility !== 'hidden' && +cs.opacity > 0; };

      const sizes = {}, weights = {}, pairs = {}, fonts = new Set(), contrast = [];
      for (const el of document.body.querySelectorAll('*')) {
        if (!(el instanceof Element) || !visible(el)) continue;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        if (hiddenSelectors.some(s => el.closest(s))) continue;
        const cs = getComputedStyle(el);
        let size = parseFloat(cs.fontSize);
        const svg = el.closest('svg');
        if (svg) { const m = (el.getScreenCTM ? el : svg).getScreenCTM(); if (m) size *= Math.hypot(m.a, m.b); }
        const label = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' "' + el.textContent.trim().slice(0, 28) + '"';
        const k = Math.round(size * 2) / 2;
        (sizes[k] = sizes[k] || []).push(label);
        (weights[cs.fontWeight] = weights[cs.fontWeight] || []).push(label);
        if (!svg && !(shell.header && el.closest(shell.header))) (pairs[k + '/' + cs.fontWeight] = pairs[k + '/' + cs.fontWeight] || []).push(label);
        fonts.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
        if (!svg && !el.closest('button:disabled,[aria-disabled="true"],input:disabled')) {
          const bg = bgAt(el);
          if (bg) {
            const fg = blend(rgba(cs.color), bg);
            const large = size >= 18 || (size >= 14 && +cs.fontWeight >= 700);
            const cr = ratio(fg, bg);
            if (cr < (large ? 3 : 4.5)) contrast.push(`${label} ${cr.toFixed(2)}:1`);
          }
        }
      }

      const shellIssues = [];
      if (shell.header) {
        const h = document.querySelector(shell.header);
        if (!h) shellIssues.push(['shell.header-missing', 'no ' + shell.header]);
        else {
          const cs = getComputedStyle(h);
          if (rgba(cs.backgroundColor)[3] > 0 || cs.backgroundImage !== 'none') shellIssues.push(['shell.header-background', cs.backgroundColor]);
          if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') shellIssues.push(['shell.header-border', cs.borderBottomWidth + ' ' + cs.borderBottomColor]);
          if (cs.boxShadow !== 'none') shellIssues.push(['shell.header-shadow', cs.boxShadow]);
          const cur = h.querySelector('[aria-current="page"]');
          const hasNav = [...h.querySelectorAll('nav a, nav button')].some(visible);
          if (!cur && hasNav) shellIssues.push(['shell.nav-selected', 'header nav has no aria-current="page" item']);
          else if (!cur) { /* screen without product nav items (e.g. Home): nothing to underline */ }
          else {
            const cc = getComputedStyle(cur);
            const coral = rgba(getComputedStyle(document.documentElement).getPropertyValue('--brand-coral').trim() || 'transparent');
            const line = rgba(cc.borderBottomColor);
            if (!(parseFloat(cc.borderBottomWidth) >= 2 && coral[3] > 0 && line.slice(0, 3).every((v, i) => Math.abs(v - coral[i]) < 3))) {
              // Some shells draw the underline with a pseudo element.
              const after = getComputedStyle(cur, '::after');
              const al = rgba(after.backgroundColor);
              if (!(after.content !== 'none' && al.slice(0, 3).every((v, i) => Math.abs(v - coral[i]) < 3))) shellIssues.push(['shell.nav-selected', 'selected item has no 2px --brand-coral underline']);
            }
          }
        }
      }
      if (shell.footer) {
        const ft = document.querySelector(shell.footer);
        if (!ft) shellIssues.push(['shell.footer-missing', 'no ' + shell.footer]);
        else {
          const cs = getComputedStyle(ft);
          if (rgba(cs.backgroundColor)[3] > 0) shellIssues.push(['shell.footer-background', cs.backgroundColor]);
          if (!(parseFloat(cs.borderTopWidth) >= 1)) shellIssues.push(['shell.footer-border', 'needs a 1px top border in --border']);
          const t = ft.textContent.replace(/\s+/g, ' ');
          for (const want of shell.footerText || []) if (!t.includes(want)) shellIssues.push(['shell.footer-content', 'missing "' + want + '"']);
        }
      }
      if (shell.page) {
        const p = document.querySelector(shell.page) || document.body;
        const want = rgba(getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || 'transparent');
        const got = bgOf(p);
        if (got && want[3] > 0 && !got.slice(0, 3).every((v, i) => Math.abs(v - want[i]) < 3)) shellIssues.push(['shell.page-background', 'page is not --background']);
      }
      // Cards with a border, grey lines between content, and dot or pipe separators (DESIGN.md, Global rules).
      const layout = [];
      const label2 = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' "' + el.textContent.trim().replace(/\s+/g, ' ').slice(0, 28) + '"';
      const LISTS = 'ul,ol,[role=list],[role=listbox],[role=menu],[role=tablist],table,[role=table],[role=grid],.menu,.command-list,.breadcrumb';
      const CONTROLS = 'input,textarea,select,button,.btn,.input,svg,.progress,.tabs-list,.tab,.checkbox,.radio,.switch,[role=tab]';
      const exempt = [shell.header, shell.footer, ...lineExempt].filter(Boolean).join(',');
      for (const el of document.body.querySelectorAll('*')) {
        if (!visible(el) || (exempt && el.closest(exempt))) continue;
        const cs = getComputedStyle(el);
        const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(sd => parseFloat(cs['border' + sd + 'Width']) > 0 && cs['border' + sd + 'Style'] !== 'none' && rgba(cs['border' + sd + 'Color'])[3] > 0.05);
        if (el.classList.contains('card') || el.dataset.slot === 'card') { const outlined = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && rgba(cs.outlineColor)[3] > 0.05 && !el.matches(':focus-visible'); if (sides.length || outlined) layout.push(['render.card-border', label2(el) + ' ' + sides.concat(outlined ? ['outline'] : []).join('/')]); if (cs.boxShadow !== 'none' && !el.closest('.card-stack') && !/sticky|fixed/.test(cs.position) && !el.matches(':hover,:focus-within')) layout.push(['render.card-shadow', label2(el) + ' ' + cs.boxShadow.slice(0, 40)]); continue; }
        if (el.closest(CONTROLS) || el.closest(LISTS)) continue;
        const sep = el.tagName === 'HR' || el.classList.contains('separator') || el.getAttribute('role') === 'separator';
        if (sep || (sides.length && sides.length < 4)) layout.push(['render.divider-line', label2(el) + (sep ? ' separator' : ' border ' + sides.join('/'))]);
      }
      // Controls: no shadow, and text fields no border. A wrapper that is the field's visible box
      // (a search field with its icon, an input group) counts as the field.
      const FIELDS = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=hidden]),textarea,select,.input,.search-input,.select,.select-trigger';
      const SHADOWLESS = FIELDS + ',button,.btn,[role=combobox]';
      const boxOf = ctl => {
        const out = [ctl]; const h = ctl.getBoundingClientRect().height;
        for (let e = ctl.parentElement, n = 0; e && n < 2; e = e.parentElement, n++) { if (e.getBoundingClientRect().height <= h + 8 && e.querySelectorAll(FIELDS).length === 1) out.push(e); else break; }
        return out;
      };
      const seen = new Set();
      for (const ctl of document.body.querySelectorAll(SHADOWLESS)) {
        if (!visible(ctl) || (exempt && ctl.closest(exempt)) || ctl.closest('svg')) continue;
        const field = ctl.matches(FIELDS);
        for (const el of field ? boxOf(ctl) : [ctl]) {
          if (seen.has(el)) continue; seen.add(el);
          const cs = getComputedStyle(el);
          if (cs.boxShadow !== 'none' && !el.matches(':focus,:focus-within')) layout.push(['render.control-shadow', label2(el) + ' ' + cs.boxShadow.slice(0, 40)]);
          if (field) {
            const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(sd => parseFloat(cs['border' + sd + 'Width']) > 0 && cs['border' + sd + 'Style'] !== 'none' && rgba(cs['border' + sd + 'Color'])[3] > 0.05);
            if (sides.length && !el.matches(':focus')) layout.push(['render.control-border', label2(el) + ' ' + sides.join('/')]);
          }
        }
      }
      // Anything that looks like a card, whatever its class: a box with a border on all four sides,
      // rounded but not a pill, big enough to hold content. Controls, lists, dialogs and toggle tracks are left out.
      for (const el of document.body.querySelectorAll('*')) {
        if (el.classList.contains('card') || el.dataset.slot === 'card' || seen.has(el)) continue;
        if (!visible(el) || (exempt && el.closest(exempt)) || el.closest(CONTROLS) || el.closest('svg,table,[role=table],[role=grid],[role=dialog],dialog,[role=group],[role=radiogroup]')) continue;
        const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
        if (b.width < 120 || b.height < 56) continue;
        const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(sd => parseFloat(cs['border' + sd + 'Width']) > 0 && /solid|double/.test(cs['border' + sd + 'Style']) && rgba(cs['border' + sd + 'Color'])[3] > 0.05);
        const radius = parseFloat(cs.borderTopLeftRadius) || 0;
        if (sides.length === 4 && radius >= 6 && radius < b.height / 2 - 1 && el.textContent.trim()) layout.push(['render.card-border', label2(el) + ' (card-like box)']);
      }
      // Composition (components.md, Table and Input field): a table sits straight on the page, never on a card;
      // controls side by side in one toolbar share a height; column content lines up with its header.
      const cardRgb = rgba(getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#fff');
      const pageRgb = rgba(getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#fff');
      const sameRgb = (a, b) => a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) < 3);
      for (const t of document.body.querySelectorAll('table,[role=table]')) {
        if (!visible(t) || (exempt && t.closest(exempt)) || t.closest('dialog,[role=dialog]')) continue;
        const start = t.closest('.table-wrap,[data-slot=table-container]') || t;
        for (let e = start.parentElement; e && e !== document.body; e = e.parentElement) {
          const c = rgba(getComputedStyle(e).backgroundColor);
          if (c[3] >= 0.9) { if (sameRgb(c, cardRgb) && !sameRgb(c, pageRgb)) layout.push(['render.table-on-card', label2(t) + ' inside ' + label2(e)]); break; }
        }
        // Column alignment: each header's text starts (or, right-aligned, ends) where its cells' content does.
        const head = t.querySelector('thead tr, [role=row]');
        const body = [...t.querySelectorAll('tbody tr, [role=rowgroup]:not(:first-child) [role=row]')].filter(visible).slice(0, 3);
        if (!head || !body.length) continue;
        const hcells = [...head.children];
        const range = document.createRange();
        // The visible ink of a cell: its text and its icons, not the padding of a button around them.
        const contentBox = cell => {
          const rs = [];
          const tw = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
          for (let n; (n = tw.nextNode());) { if (!n.textContent.trim() || !visible(n.parentElement)) continue; range.selectNodeContents(n); rs.push(...[...range.getClientRects()].filter(r => r.width > 2 && r.height > 2)); }
          // A filled or outlined box inside the cell (a badge, an icon tile, an avatar) is what the eye lines up.
          for (const e of cell.querySelectorAll('*')) { if (e.closest('svg') || !visible(e)) continue; const ecs = getComputedStyle(e); const fill = rgba(ecs.backgroundColor); const under = e.parentElement && bgOf(e.parentElement); const shows = fill[3] > 0.05 && !(under && sameRgb(blend(fill, under), under)); if (shows || (parseFloat(ecs.borderLeftWidth) > 0 && ecs.borderLeftStyle !== 'none' && rgba(ecs.borderLeftColor)[3] > 0.05)) rs.push(e.getBoundingClientRect()); }
          for (const g of cell.querySelectorAll('svg,img')) { if (g.parentElement && g.parentElement.closest('svg')) continue; const r = g.getBoundingClientRect(); if (r.width > 2 && visible(g)) rs.push(r); }
          if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.left)), r: Math.max(...rs.map(r => r.right)) };
        };
        hcells.forEach((th, i) => {
          const hb = contentBox(th); if (!hb || !th.textContent.trim()) return;
          const right = getComputedStyle(th).textAlign === 'right' || getComputedStyle(th).textAlign === 'end';
          const off = body.map(tr => tr.children[i] && contentBox(tr.children[i])).filter(Boolean).map(cb => right ? cb.r - hb.r : cb.l - hb.l);
          if (off.length && off.every(d => Math.abs(d) > 4)) layout.push(['render.column-misaligned', `"${th.textContent.trim().slice(0, 24)}" header vs cells ${Math.round(off[0])}px`]);
        });
      }
      const TOOL = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=hidden]),select,.select-trigger,[role=combobox],button.btn,a.btn';
      const within = (a, b) => { const r = a.getBoundingClientRect(), o = b.getBoundingClientRect(); return r.left >= o.left - 2 && r.right <= o.right + 2 && r.top >= o.top - 2 && r.bottom <= o.bottom + 2; };
      const ctls0 = [...document.body.querySelectorAll(TOOL)].filter(c => visible(c) && !(exempt && c.closest(exempt)) && !c.closest('table,[role=table],[role=grid],.tabs-list,[role=tablist],[role=menu],.menu,dialog .dialog-list') && c.getBoundingClientRect().height >= 28);
      // A button drawn inside a field (clear, chevron, AI) belongs to that field, not to the toolbar.
      const ctls = ctls0.filter(c => !ctls0.some(o => o !== c && !o.matches('button,a.btn') && within(c, o)));
      const boxFor = c => { let e = c; for (let p = c.parentElement, n = 0; p && n < 2; p = p.parentElement, n++) { if (p.getBoundingClientRect().height <= c.getBoundingClientRect().height + 2 && p.querySelectorAll(TOOL).length === 1) e = p; else break; } return e; };
      const groups = new Map();
      for (const c of ctls) {
        const box = boxFor(c); const b = box.getBoundingClientRect(); const mid = b.top + b.height / 2;
        for (let p = box.parentElement, n = 0; p && n < 4; p = p.parentElement, n++) {
          const cs = getComputedStyle(p);
          if (!/flex|grid/.test(cs.display) || (/flex/.test(cs.display) && /column/.test(cs.flexDirection))) continue;
          // Side by side only: a button inside a search field (clear, filter) is part of that field.
          const mates = ctls.filter(o => o !== c && p.contains(o)).map(boxFor).filter(o => { const ob = o.getBoundingClientRect(); return !box.contains(o) && !o.contains(box) && (ob.right <= b.left + 1 || ob.left >= b.right - 1) && Math.abs(ob.top + ob.height / 2 - mid) < Math.min(ob.height, b.height) / 2; });
          if (mates.length) { if (!groups.has(p)) groups.set(p, new Set()); groups.get(p).add(box); mates.forEach(m => groups.get(p).add(m)); break; }
        }
      }
      for (const [p, set] of groups) {
        const hs = [...set].map(e => Math.round(e.getBoundingClientRect().height));
        if (Math.max(...hs) - Math.min(...hs) > 2) layout.push(['render.toolbar-heights', label2(p) + ' ' + [...set].map(e => label2(e).split(' ')[0] + ' ' + Math.round(e.getBoundingClientRect().height)).join(', ')]);
      }
      // Icons (components.md, Icon): one Lucide icon in one colour. Never two icons layered into one, never parts in different colours.
      const SHAPES = 'path,circle,rect,line,polyline,polygon,ellipse';
      const iconSvgs = [...document.body.querySelectorAll('svg')].filter(g => { const r = g.getBoundingClientRect(); return r.width > 4 && r.width <= 48 && r.height <= 48 && visible(g) && !g.closest('svg svg') && !g.querySelector('image,linearGradient,radialGradient,text') && !g.closest('.graphic,[data-graphic],.logo,[class*=logo],[class*=avatar],[role=progressbar],[class*=progress],[class*=gauge],[class*=ring],[class*=chart]') && !(exempt && g.closest(exempt)); });
      for (const g of iconSvgs) {
        const cols = new Set();
        for (const sh of g.querySelectorAll(SHAPES)) {
          const sc = getComputedStyle(sh);
          if (sc.display === 'none' || sc.visibility === 'hidden' || +sc.opacity === 0) continue;
          if (sc.stroke !== 'none' && parseFloat(sc.strokeWidth) > 0) { const c = rgba(sc.stroke); if (c[3] > 0) cols.add(c.slice(0, 3).join(',')); }
          if (sc.fill !== 'none' && +sc.fillOpacity > 0) { const c = rgba(sc.fill); if (c[3] > 0) cols.add(c.slice(0, 3).join(',')); }
        }
        if (cols.size > 1) layout.push(['render.icon-colours', label2(g.parentElement || g) + ' ' + cols.size + ' colours']);
      }
      for (const g of iconSvgs) {
        const r = g.getBoundingClientRect();
        const other = iconSvgs.find(o => o !== g && o.parentElement === g.parentElement && (() => { const q = o.getBoundingClientRect(); return q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top; })());
        if (other && iconSvgs.indexOf(other) > iconSvgs.indexOf(g)) layout.push(['render.icon-layered', label2(g.parentElement) + ' two icons drawn on top of each other']);
      }
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode());) {
        const p = n.parentElement;
        if (!/(^|\s)[·•|](\s|$)/.test(n.textContent) || !p || !visible(p) || p.closest('script,style,code,pre,svg') || hiddenSelectors.some(s => p.closest(s))) continue;
        layout.push(['render.inline-separator', label2(p.closest(':not(span)') || p)]);
      }
      return { sizes, weights, pairs, fonts: [...fonts], contrast, shellIssues, layout };
    }, { shell, hiddenSelectors: config.ignoreTextIn || [], lineExempt: config.lineExempt || [] });

    const ks = Object.keys(r.sizes).map(Number);
    const snapped = new Set();
    for (const s of ks) {
      const hit = allowed.find(a => Math.abs(a - s) <= 0.6);
      if (hit === undefined) add(f, 'render.size-off-scale', `${s}px (allowed ${allowed.join('/')}), e.g. ${[...new Set(r.sizes[s])].slice(0, 2).join(', ')}`);
      else snapped.add(hit);
    }
    if (R.maxSizes && snapped.size > R.maxSizes) add(f, 'render.too-many-sizes', `${[...snapped].sort((a, b) => b - a).join('/')} (max ${R.maxSizes})`);
    const ws = Object.keys(r.weights);
    if (R.maxWeights && ws.length > R.maxWeights) add(f, 'render.too-many-weights', `${ws.join('/')} (max ${R.maxWeights})`);
    for (const w of ws) if (!R.weights.includes(+w)) add(f, 'render.weight-off-scale', `${w}, e.g. ${r.weights[w][0]}`);
    // Each weight only at the sizes the type scale gives it (bold only on titles).
    for (const [pair, labels] of Object.entries(r.pairs)) {
      const [s, w] = pair.split('/').map(Number);
      const hit = allowed.find(a => Math.abs(a - s) <= 0.6);
      if (hit !== undefined && R.weights.includes(w) && !R.pairs.has(hit + '/' + w)) add(f, 'render.weight-size', `${w} at ${hit}px, e.g. ${[...new Set(labels)].slice(0, 2).join(', ')}`);
    }
    for (const fam of r.fonts) if (!/open sans/i.test(fam)) add(f, 'render.font', fam);
    for (const c of r.contrast) add(f, 'render.contrast', c);
    // components.md, Navigation shell: full-screen learner flows listed in shellExempt skip the header and footer.
    for (const [rule, d] of r.shellIssues) if (!(matches(f, config.shellExempt || []) && /^shell\.(?:header|footer|nav)/.test(rule))) add(f, rule, d);
    for (const [rule, d] of [...new Map(r.layout.map(x => [x.join(' '), x])).values()]) add(f, rule, d);
  }
  await browser.close();
}

// ---------------------------------------------------------------------------
// 5. Baseline and report
// ---------------------------------------------------------------------------
(async () => {
  const R = readRules();
  sourceChecks(R);
  if (!args.has('--static-only')) await renderedChecks(R);

  const counts = {};
  for (const i of issues) ((counts[i.file] = counts[i.file] || {})[i.rule] = (counts[i.file][i.rule] || 0) + 1);
  const baselinePath = path.join(PROJECT, config.baseline || 'cognia-design.baseline.json');
  const pluginVersion = (() => { try { return JSON.parse(fs.readFileSync(path.join(PLUGIN, '..', '..', '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return 'unknown'; } })();

  if (args.has('--update-baseline')) {
    fs.writeFileSync(baselinePath, JSON.stringify({ plugin: pluginVersion, note: 'Known legacy issues. Counts may only go down. Regenerate with --update-baseline after fixing.', counts }, null, 1) + '\n');
    console.log(`Baseline written: ${issues.length} known issues across ${Object.keys(counts).length} files.`);
    return;
  }

  const base = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')).counts || {} : {};
  const fresh = [], better = [];
  for (const [file, rules] of Object.entries(counts)) for (const [rule, n] of Object.entries(rules)) {
    const was = (base[file] || {})[rule] || 0;
    if (n > was) fresh.push({ file, rule, n, was, examples: issues.filter(i => i.file === file && i.rule === rule).slice(0, 3).map(i => i.detail) });
  }
  for (const [file, rules] of Object.entries(base)) for (const [rule, was] of Object.entries(rules)) {
    const n = (counts[file] || {})[rule] || 0;
    if (n < was) better.push(`${file} ${rule}: ${was} -> ${n}`);
  }

  console.log(`Cognia design check (plugin ${pluginVersion}): ${screens.length} screens, ${styles.length} stylesheets, ${issues.length} issues (${issues.length - fresh.reduce((s, x) => s + x.n - x.was, 0)} known).`);
  if (better.length) console.log(`\nFixed since the baseline (run with --update-baseline to lock these in):\n  ${better.join('\n  ')}`);
  if (fresh.length) {
    console.error(`\nNew design system issues (${fresh.length}):`);
    for (const x of fresh) console.error(`  ${x.file}  ${x.rule}  ${x.was} -> ${x.n}\n      ${x.examples.join('\n      ')}`);
    console.error('\nFix these against the cognia-design plugin docs. Do not raise the baseline to make them pass.');
    process.exit(1);
  }
  console.log('Pass: no new issues.');
})().catch(e => { console.error(e.stack || e.message); process.exit(2); });
