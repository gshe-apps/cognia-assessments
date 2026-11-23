#!/usr/bin/env node
// Before and after screenshots for pull requests.
//
// Renders every prototype screen from two copies of project/ (before and after a change),
// keeps the screens that look different, and writes:
//   <out>/report.html   side-by-side report you can open in a browser
//   <out>/comment.md    the pull request comment (used by .github/workflows/pr-screenshots.yml)
//   <out>/publish/      only the images the comment needs
//
// On GitHub this runs automatically on every pull request into main.
//
// To preview locally what your branch changes compared with main:
//   npm i --no-save playwright pixelmatch@5.3.0 pngjs@7 && npx playwright install chromium
//   git fetch origin
//   node scripts/screenshot-review.cjs
//   open .review-screenshots/report.html
// Locally, "before" is origin/main and "after" is your working folder, including unsaved commits.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

let chromium, PNG, pixelmatch;
try {
  ({ chromium } = require('playwright'));
  ({ PNG } = require('pngjs'));
  pixelmatch = require('pixelmatch');
} catch {
  console.error('Missing tools. Run: npm i --no-save playwright pixelmatch@5.3.0 pngjs@7 && npx playwright install chromium');
  process.exit(2);
}

const args = {};
process.argv.slice(2).forEach((arg, i, all) => {
  if (arg.startsWith('--')) args[arg.slice(2)] = all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true';
});

const repoRoot = path.resolve(__dirname, '..');
const out = path.resolve(args.out || path.join(repoRoot, '.review-screenshots'));
const urlPrefix = (args['url-prefix'] || '').replace(/\/$/, '');
// Fewer changed pixels than this is treated as rendering noise, not a change.
const MIN_PIXELS = Number(args['min-pixels'] || 40);
const DESKTOP = { width: 1440, height: 1000 };
const MOBILE = { width: 390, height: 844 };
const isMobile = file => /^(STU2|CAP-S)/.test(file);

const LOGO_ID = '03b113a3dc2e610eb61ccc911bd46d5e';
const PLACEHOLDER = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="170"><rect width="400" height="170" fill="#EDEDEF"/></svg>';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

// A small static server per copy, so each side gets its own origin and its own browser storage.
function serve(dir) {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/_blob/')) {
      const logo = path.join(dir, 'assets/cognia-logo.svg');
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      return res.end(pathname.endsWith(LOGO_ID) && fs.existsSync(logo) ? fs.readFileSync(logo) : PLACEHOLDER);
    }
    const file = path.resolve(dir, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(dir + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      res.writeHead(error ? 404 : 200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(error ? 'Not found' : data);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port })));
}

const screensIn = dir => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter(name => name.endsWith('.dc.html') || name === 'index.html')
  : [];

async function shoot(browser, baseUrl, file, dest) {
  const context = await browser.newContext({ viewport: isMobile(file) ? MOBILE : DESKTOP, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Same "random" numbers on both sides, so sample data doesn't show up as a change.
  await context.addInitScript(() => {
    let seed = 42;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  });
  const page = await context.newPage();
  if (page.clock) await page.clock.setFixedTime(new Date('2026-11-23T10:00:00+11:00')).catch(() => {});
  try {
    await page.goto(baseUrl + '/' + file, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: dest, fullPage: true, animations: 'disabled', caret: 'hide' });
  } finally {
    await context.close();
  }
}

function compare(beforeFile, afterFile, diffFile) {
  const a = PNG.sync.read(fs.readFileSync(beforeFile));
  const b = PNG.sync.read(fs.readFileSync(afterFile));
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const pad = img => {
    if (img.width === width && img.height === height) return img;
    const padded = new PNG({ width, height });
    padded.data.fill(255);
    PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
    return padded;
  };
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(pad(a).data, pad(b).data, diff.data, width, height, { threshold: 0.1, alpha: 0.25 });
  if (pixels >= MIN_PIXELS) fs.writeFileSync(diffFile, PNG.sync.write(diff));
  return { pixels, share: pixels / (width * height), taller: b.height > a.height, shorter: b.height < a.height };
}

async function pool(items, size, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await task(queue.shift());
  }));
}

const label = file => file.replace(/\.dc\.html$/, '').replace(/^index\.html$/, 'Role picker (index)');
const percent = share => share < 0.01 ? 'Less than 1%' : 'About ' + Math.round(share * 100) + '%';

async function main() {
  let beforeDir = args.base && path.resolve(args.base);
  const afterDir = path.resolve(args.head || path.join(repoRoot, 'project'));
  let cleanUp = () => {};
  if (!beforeDir) {
    const ref = args.ref || 'origin/main';
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-before-'));
    execFileSync('git', ['-C', repoRoot, 'worktree', 'add', '--detach', tmp, ref], { stdio: 'ignore' });
    beforeDir = path.join(tmp, 'project');
    cleanUp = () => { try { execFileSync('git', ['-C', repoRoot, 'worktree', 'remove', '--force', tmp], { stdio: 'ignore' }); } catch {} };
    console.log('Before: ' + ref + '. After: your working folder.');
  }

  fs.rmSync(out, { recursive: true, force: true });
  for (const dir of ['before', 'after', 'diff', 'publish']) fs.mkdirSync(path.join(out, dir), { recursive: true });

  const beforeScreens = new Set(screensIn(beforeDir));
  const afterScreens = new Set(screensIn(afterDir));
  const all = [...new Set([...beforeScreens, ...afterScreens])].sort();

  const servers = [await serve(beforeDir), await serve(afterDir)];
  // CHROME_PATH lets the script use an installed Chrome instead of Playwright's download.
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const results = [];
  try {
    await pool(all, 4, async file => {
      const name = file.replace(/\.html$/, '').replace(/\./g, '-');
      const shots = { before: path.join(out, 'before', name + '.png'), after: path.join(out, 'after', name + '.png'), diff: path.join(out, 'diff', name + '.png') };
      const result = { file, name, status: 'same' };
      if (beforeScreens.has(file)) await shoot(browser, servers[0].url, file, shots.before);
      if (afterScreens.has(file)) await shoot(browser, servers[1].url, file, shots.after);
      if (!beforeScreens.has(file)) result.status = 'added';
      else if (!afterScreens.has(file)) result.status = 'removed';
      else {
        Object.assign(result, compare(shots.before, shots.after, shots.diff));
        if (result.pixels >= MIN_PIXELS) result.status = 'changed';
      }
      for (const side of ['before', 'after', 'diff']) {
        if (result.status !== 'same' && fs.existsSync(shots[side])) fs.copyFileSync(shots[side], path.join(out, 'publish', name + '-' + side + '.png'));
      }
      results.push(result);
      console.log(result.status.padEnd(8) + file);
    });
  } finally {
    await browser.close();
    servers.forEach(({ server }) => server.close());
    cleanUp();
  }

  results.sort((a, b) => a.file.localeCompare(b.file));
  const different = results.filter(r => r.status !== 'same');
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(out, 'comment.md'), comment(results, different));
  fs.writeFileSync(path.join(out, 'report.html'), report(results, different));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=' + different.length + '\n');
  console.log('\n' + different.length + ' of ' + results.length + ' screens look different. Report: ' + path.join(out, 'report.html'));
}

function note(r) {
  if (r.status === 'added') return 'New screen';
  if (r.status === 'removed') return 'Screen removed';
  const size = r.taller ? ' The page is taller.' : r.shorter ? ' The page is shorter.' : '';
  return percent(r.share) + ' of the screen changed.' + size;
}

function comment(results, different) {
  const img = (r, side, width) => {
    const url = urlPrefix + '/' + r.name + '-' + side + '.png';
    return '<a href="' + url + '"><img src="' + url + '" width="' + width + '" alt="' + label(r.file) + ', ' + side + '"></a>';
  };
  const lines = [
    '<!-- cap-screenshots -->',
    '## Before and after screenshots',
    '',
    different.length
      ? '**' + different.length + ' of ' + results.length + ' screens look different** once this pull request is merged into `main`.'
      : '**No visual changes** on any of the ' + results.length + ' screens.',
    '',
    '<sub>Before is `main` today. After is `main` with this pull request merged. Screens are captured as they first load, at 1440px wide (student screens at 390px), so dialogs, other tabs and hover states are not shown. Click an image to see it full size.</sub>',
    '',
  ];
  for (const r of different) {
    lines.push('### ' + label(r.file), '<sub>' + note(r) + '</sub>', '');
    if (r.status === 'changed') {
      lines.push('| Before | After |', '| --- | --- |', '| ' + img(r, 'before', 400) + ' | ' + img(r, 'after', 400) + ' |', '');
      lines.push('<details><summary>Show what changed (highlighted in red)</summary>', '', img(r, 'diff', 820), '', '</details>', '');
    } else if (r.status === 'added') {
      lines.push(img(r, 'after', 400), '');
    } else {
      lines.push(img(r, 'before', 400), '');
    }
  }
  return lines.join('\n');
}

function report(results, different) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pic = (r, side) => fs.existsSync(path.join(out, side, r.name + '.png'))
    ? '<figure><figcaption>' + side[0].toUpperCase() + side.slice(1) + '</figcaption><a href="' + side + '/' + r.name + '.png"><img src="' + side + '/' + r.name + '.png" alt=""></a></figure>'
    : '<figure><figcaption>' + side[0].toUpperCase() + side.slice(1) + '</figcaption><p>Not in this version</p></figure>';
  const sections = different.map(r => '<section><h2>' + esc(label(r.file)) + '</h2><p class="note">' + esc(note(r)) + '</p><div class="pair">' + pic(r, 'before') + pic(r, 'after') + '</div>'
    + (r.status === 'changed' ? '<details><summary>Show what changed</summary>' + pic(r, 'diff') + '</details>' : '') + '</section>').join('');
  const same = results.filter(r => r.status === 'same').map(r => '<li>' + esc(label(r.file)) + '</li>').join('');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Before and after screenshots</title><style>'
    + 'body{font:16px/1.5 "Open Sans",Arial,sans-serif;margin:32px auto;max-width:1320px;padding:0 24px;color:#000012}'
    + 'h1{font-size:24px}h2{font-size:16px;margin:0}.note{font-size:14px;color:#555;margin:4px 0 12px}'
    + 'section{border-top:1px solid #ddd;padding:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    + 'figure{margin:0}figcaption{font-size:14px;font-weight:600;margin-bottom:4px}img{width:100%;border:1px solid #ddd}'
    + 'details{margin-top:12px;font-size:14px}details img{max-width:820px}ul{font-size:14px;columns:3}</style></head><body>'
    + '<h1>' + (different.length ? different.length + ' of ' + results.length + ' screens look different' : 'No visual changes') + '</h1>'
    + sections + (same ? '<section><h2>No visual change</h2><ul>' + same + '</ul></section>' : '') + '</body></html>';
}

main().catch(error => { console.error(error); process.exit(1); });
