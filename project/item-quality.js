/* Create manually: AI-assisted item writing.
   Left: the item form from Figma (node 1568:8754). Right: the items board swaps to Item analysis,
   Learner supports or Learner preview, so only one detail panel is on screen at a time.
   Mounted by combined-create.js through window.capItemQuality.mount(host, {settings, inst}).
   Analysis is a client-side prototype of the AI checks, so every result is explainable. */
(() => {
 'use strict';
 const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const LETTERS = ['A','B','C','D'];

 /* Lucide icons, unchanged markup */
 const P = {
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  chevronLeft:'<path d="m15 18-6-6 6-6"/>',
  arrowLeft:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  circleCheck:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  circleAlert:'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  chevronsUpDown:'<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  volume:'<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  sort:'<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><rect x="15" y="4" width="4" height="6" ry="2"/><path d="M17 20v-6h-2"/><path d="M15 20h4"/>',
  shuffle:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  cornerDownRight:'<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  minus:'<path d="M5 12h14"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
 };
 const icon = (n, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
 const statusIcon = s => s === 'pass' ? icon('circleCheck', 'text-success-value') : s === 'warn' ? icon('circleAlert', 'text-warning-value') : icon('info', 'text-info-value');

 /* Reference data (prototype) */
 const STANDARDS = {
  '4':[['4.NF.B.3','Fraction addition and subtraction','Add and subtract fractions referring to the same whole, with like denominators.'],['4.NF.B.4','Multiply a fraction by a whole number','Apply understanding of multiplication to multiply a fraction by a whole number.']],
  '5':[['5.NF.A.1','Add and subtract unlike fractions','Add and subtract fractions with unlike denominators by replacing them with equivalent fractions.'],['5.NF.A.2','Fraction word problems','Solve word problems involving addition and subtraction of fractions referring to the same whole, including unlike denominators. Use benchmark fractions to check reasonableness.'],['5.NF.B.4','Multiply fractions','Apply understanding of multiplication to multiply a fraction or whole number by a fraction.'],['5.NF.B.6','Fraction multiplication word problems','Solve real world problems involving multiplication of fractions and mixed numbers.']],
  '6':[['6.NS.A.1','Divide fractions','Interpret and compute quotients of fractions, and solve word problems involving division of fractions.']],
  '8':[['8.EE.C.7','Linear equations','Solve linear equations in one variable.']]
 };
 const COMPONENTS = {
  '5.NF.A.2':['Represent a word problem with an equation','Solve fraction word problems with unlike denominators','Use benchmark fractions to check reasonableness'],
  '5.NF.A.1':['Find a common denominator','Rewrite fractions as equivalent fractions','Add and subtract fractions with unlike denominators'],
  'default':['Identify the operation the problem needs','Solve the problem accurately','Check the answer is reasonable']
 };
 const DOK = [['1','DOK 1','Recall'],['2','DOK 2','Skill or concept'],['3','DOK 3','Strategic thinking']];
 const DOK_DIFFICULTY = {'1':'Easy','2':'Medium','3':'Hard'};
 const SENSITIVE = ['christmas','easter','church','mosque','temple','bible','yacht','golf','ski trip','skiing','mansion','wealthy','poor','welfare','gun','hunting','beer','wine','diet','divorce'];
 const VISUAL_CUES = /\b(red|green|blue|colou?r(ed)?|shaded|picture below|image below|graph below|look at the|see the (picture|image|diagram))\b/i;
 const SAMPLE = {
  stem:'Maya combines 2/3 cup of almonds with 1/4 cup of raisins in order to make trail mix for her hike, and she wants to determine the total amount of trail mix that she will have altogether after she combines them. How much trail mix will Maya have?',
  options:['3/7 cup','3/12 cup','11/12 cup','8/12 cup'], correct:2, mis:['Adds numerators and adds denominators','','',''], standard:'5.NF.A.2', dok:'2'
 };

 /* Fractions */
 const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
 const lcm = (a, b) => a / gcd(a, b) * b;
 const fr = (n, d) => ({n, d});
 const val = f => f.n / f.d;
 const same = (a, b) => a && b && a.n * b.d === b.n * a.d;
 const add = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
 const sub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
 const mul = (a, b) => fr(a.n * b.n, a.d * b.d);
 const simplest = f => { const g = gcd(f.n, f.d); return fr(f.n / g, f.d / g); };
 const fmt = f => { f = simplest(f); return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`; };
 const fractions = text => [...String(text).matchAll(/(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)/g)].map(m => m[1] ? fr(+m[1] * +m[3] + +m[2], +m[3]) : fr(+m[4], +m[5])).filter(f => f.d);
 const numberIn = text => { const f = fractions(text)[0]; if (f) return f; const m = String(text).match(/-?\d+(\.\d+)?/); return m ? fr(Math.round(parseFloat(m[0]) * 1000), 1000) : null; };
 const operation = stem => /\b(left|remain(s|ing)?|difference|fewer|how much (more|longer|less)|cuts? off|gave away|gives away|ate|used up|less than)\b/i.test(stem) ? '-' : /\b(combines?|combined|mix(es|ed)?|altogether|in all|total|sum|together|and then|plus|add(s|ed)?)\b/i.test(stem) ? '+' : null;

 /* Reading */
 const wordsIn = t => String(t).match(/[A-Za-z']+|\d+(?:\s\d+)?(?:\/\d+)?/g) || [];
 const syllables = w => { if (/\d/.test(w)) return 1; w = w.toLowerCase().replace(/'/g, ''); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1); };
 const readingGrade = t => { const w = wordsIn(t); if (!w.length) return 0; const s = Math.max(1, (String(t).match(/[.!?]+(\s|$)/g) || []).length); const syl = w.reduce((n, x) => n + syllables(x), 0); return Math.max(0, Math.round((0.39 * (w.length / s) + 11.8 * (syl / w.length) - 15.59) * 10) / 10); };

 /* The prototype "AI": transparent rule-based rewrites */
 function simplify(stem) {
  let s = ' ' + String(stem).trim() + ' ';
  const rules = [[/\bin order to\b/gi,'to'],[/\bdetermine the total amount of ([a-z]+(?: [a-z]+)?) that\b/gi,'find how much $1'],[/\bthe total amount of\b/gi,'how much'],[/\bdetermine\b/gi,'find'],[/\baltogether\b/gi,'in all'],[/\bcombines\b/gi,'mixes'],[/\bcombine\b/gi,'mix'],[/\bcombined\b/gi,'mixed'],[/\bapproximately\b/gi,'about'],[/\bpurchases?\b/gi,'buys'],[/\badditional\b/gi,'more'],[/\bcalculate\b/gi,'find'],[/\bremaining\b/gi,'left'],[/\bconsequently\b/gi,'so'],[/\btherefore\b/gi,'so'],[/,\s*and (she|he|they|we|it) /gi,(m, p) => '. ' + p[0].toUpperCase() + p.slice(1) + ' ']];
  rules.forEach(([re, to]) => { s = s.replace(re, to); });
  return s.replace(/\s+/g, ' ').replace(/\s([.,?!])/g, '$1').trim();
 }
 function wordHelp(text) {
  const g = [['in all','Put together. Usually means add.'],['altogether','Put together. Usually means add.'],['mixes','Puts things together.'],['combines','Puts things together.'],['total','The amount when everything is added.'],['left','What remains after some is taken away.'],['difference','How much bigger one amount is than another.'],['denominator','The bottom number in a fraction.']];
  const seen = new Set();
  return g.filter(([w, d]) => new RegExp('\\b' + w + '\\b', 'i').test(text) && !seen.has(d) && seen.add(d)).map(([w, d]) => `${w}: ${d}`).join('\n');
 }
 function hintSteps(stem) {
  const f = fractions(stem), op = operation(stem);
  if (f.length >= 2 && op) { const L = lcm(f[0].d, f[1].d); return [`Find a common denominator for ${f[0].d} and ${f[1].d}. Try ${L}.`, `Rewrite each fraction with ${L} as the denominator.`, op === '+' ? 'Add the numerators. Keep the denominator.' : 'Subtract the numerators. Keep the denominator.'].join('\n'); }
  return ['Read the question and underline what it asks.', 'Choose the operation you need.', 'Solve, then check the answer makes sense.'].join('\n');
 }
 function extension(stem) {
  const f = fractions(stem);
  return f.length >= 2 ? `Write your own word problem that uses ${fmt(f[0])} and ${fmt(f[1])}, then solve it. Is your answer more or less than 1? How do you know?` : 'Write a similar problem of your own and solve it. Explain how you know your answer is reasonable.';
 }
 function detectMisconception(o, a, b, op) {
  if (!o || !a || !b || !op) return '';
  const L = lcm(a.d, b.d), scaled = f => fr(f.n * L / f.d, L);
  if (op === '+') {
   if (same(o, fr(a.n + b.n, a.d + b.d))) return 'Adds numerators and adds denominators';
   if (same(o, fr(a.n + b.n, L))) return 'Uses a common denominator without rewriting the numerators';
   if (same(o, scaled(a)) || same(o, scaled(b))) return 'Uses only one of the quantities';
   if (same(o, sub(a, b)) || same(o, sub(b, a))) return 'Subtracts instead of adding';
   if (same(o, mul(a, b))) return 'Multiplies instead of adding';
  } else {
   if (same(o, fr(Math.abs(a.n - b.n), Math.abs(a.d - b.d) || 1))) return 'Subtracts numerators and subtracts denominators';
   if (same(o, fr(Math.abs(a.n - b.n), L))) return 'Uses a common denominator without rewriting the numerators';
   if (same(o, add(a, b))) return 'Adds instead of subtracting';
   if (same(o, scaled(a)) || same(o, scaled(b))) return 'Uses only one of the quantities';
  }
  return '';
 }
 const estimateDok = stem => /\b(explain|justify|why|compare|prove|which is better|how do you know)\b/i.test(stem) ? '3' : (wordsIn(stem).length >= 15 && /\b(she|he|they|has|have|makes?|buys?|walks?|cups?|miles?|feet|yards?)\b/i.test(stem)) ? '2' : '1';
 /* One DOK value per item, used by the bank rows, the added-items panel and the preview: the item's own DOK,
    else its prototype difficulty mapped to DOK (Easy 1, Medium 2, Hard 3), else an estimate from the wording. */
 const dokOf = q => String(q?.dok || ({easy:'1', medium:'2', hard:'3'})[String(q?.difficulty || '').toLowerCase()] || estimateDok(q?.stem || ''));

 /* Analysis: 10 counted checks plus an info tip */
 function analyse(S, ctx) {
  const stem = S.stem.trim();
  if (!stem) return null;
  const grade = Number(ctx.grade) || 5, words = wordsIn(stem).length, rg = readingGrade(stem), subject = ctx.subject === 'English' ? 'understanding' : 'math';
  const f = fractions(stem), op = operation(stem), [a, b] = f, expected = f.length >= 2 && op ? (op === '+' ? add(a, b) : sub(a, b)) : null;
  const filled = S.options.map((o, i) => ({o: o.trim(), i, v: numberIn(o)})).filter(x => x.o);
  const wrong = filled.filter(x => x.i !== S.correct);
  const suggestions = S.options.map((o, i) => i === S.correct ? '' : detectMisconception(numberIn(o), a, b, op));
  const checks = [];
  const push = (id, status, title, desc, extra = {}) => checks.push({id, status, title, desc, counted: true, ...extra});

  push('reading', rg <= grade ? 'pass' : 'warn', rg <= grade ? `Reading level fits Grade ${grade}` : `Reading level is above Grade ${grade}`, rg <= grade ? `About Grade ${rg}.` : `About Grade ${rg}. Dense wording can measure reading instead of ${subject}. Shorten sentences or add Language support.`, rg <= grade ? {} : {action:'suggest', actionLabel:'Suggest simpler wording'});
  push('length', words <= 40 ? 'pass' : 'warn', words <= 40 ? 'Question is focused' : 'Question is long', words <= 40 ? `${words} words.` : `${words} words. Aim for 40 or fewer so the task stays in focus.`);
  const flagged = SENSITIVE.find(w => new RegExp('\\b' + w + '\\b', 'i').test(stem));
  push('bias', flagged ? 'warn' : 'pass', flagged ? 'Check the context' : 'Bias and sensitivity', flagged ? `“${flagged}” may not be familiar to every learner. Try a more universal context.` : 'No culturally narrow or sensitive contexts found.');
  const cue = VISUAL_CUES.test(stem);
  push('access', cue ? 'warn' : 'pass', cue ? 'Check accessibility' : 'Accessibility', cue ? 'The wording relies on a visual or colour. Describe it in words too.' : 'No missing visuals or colour-only cues.');
  const unlike = f.length >= 2 && a.d !== b.d, story = words >= 12;
  let aligned = true, why = 'Wording matches the standard.';
  if (S.standard === '5.NF.A.2') { aligned = f.length >= 2 && story && !!op; why = aligned ? (unlike ? 'Word problem with unlike denominators.' : 'Word problem with fractions.') : (f.length < 2 ? 'Add two fractions referring to the same whole.' : !story ? 'Set the fractions in a word problem.' : 'Make it clear whether to add or subtract.'); }
  else if (S.standard === '5.NF.A.1') { aligned = unlike; why = aligned ? 'Fractions with unlike denominators.' : 'Use two fractions with unlike denominators.'; }
  else if (/NF|NS/.test(S.standard)) { aligned = f.length >= 1; why = aligned ? 'Uses fractions.' : 'This standard is about fractions. Add the fractions learners work with.'; }
  push('align', aligned ? 'pass' : 'warn', aligned ? `Aligned to ${S.standard}` : `Check alignment to ${S.standard}`, why);
  const comps = COMPONENTS[S.standard] || COMPONENTS.default;
  push('components', S.components.length ? 'pass' : 'warn', 'Learning components', S.components.length ? 'Results will point to the skills you tagged.' : 'Tag the skill this question measures so results point to the exact gap.', {components: comps, suggested: unlike && story ? 1 : 0});
  const dok = estimateDok(stem), dokWhy = {'1':'The wording asks for recall or a single step.','2':'The wording asks for applying a skill or concept.','3':'The wording asks for reasoning or justification.'}[dok];
  push('dok', dok === S.dok ? 'pass' : 'warn', dok === S.dok ? `DOK ${dok} matches your target` : `Estimated DOK ${dok}, target is DOK ${S.dok}`, dok === S.dok ? dokWhy : `${dokWhy} Adjust the wording or the target.`);
  const match = expected ? filled.find(x => x.v && same(x.v, expected)) : null;
  const sum = expected ? `${fmt(a)} ${op} ${fmt(b)} = ${fmt(expected)}` : '';
  if (S.correct === null || !S.options[S.correct]?.trim()) push('key', 'warn', 'Choose the correct answer', match ? `${sum}, which is option ${LETTERS[match.i]}.` : 'Select which option is correct.', match ? {action:'markCorrect', actionLabel:`Mark ${LETTERS[match.i]} as correct`, target:match.i} : {});
  else if (!expected) push('key', 'pass', 'Answer key set', `Option ${LETTERS[S.correct]} is marked correct. Check it before adding.`);
  else if (match && match.i === S.correct) push('key', 'pass', 'Answer key verified', `${sum}, which is option ${LETTERS[match.i]}.`);
  else if (match) push('key', 'warn', 'Answer key needs a look', `${sum}, which is option ${LETTERS[match.i]}. You marked option ${LETTERS[S.correct]}.`, {action:'markCorrect', actionLabel:`Mark ${LETTERS[match.i]} as correct`, target:match.i});
  else push('key', 'warn', 'Answer key needs a look', `${sum}, but none of the options equals ${fmt(expected)}.`);
  const named = wrong.filter(x => S.mis[x.i].trim()).length, canFill = wrong.some(x => !S.mis[x.i].trim() && suggestions[x.i]);
  push('mis', wrong.length && named === wrong.length ? 'pass' : 'warn', wrong.length && named === wrong.length ? 'Every wrong answer names a misconception' : `${named} of ${wrong.length || 3} wrong answers name a misconception`, wrong.length && named === wrong.length ? 'Results will point to next steps.' : 'Name the misconception behind each wrong answer so results point to next steps.', canFill ? {action:'fillMis', actionLabel:'Use detected misconceptions'} : {});
  const distinct = new Set(filled.map(x => x.o.toLowerCase())).size === filled.length;
  const far = expected ? wrong.find(x => !x.v || val(x.v) <= 0 || val(x.v) > Math.max(2, val(expected) * 3)) : null;
  const believable = wrong.length >= 2 && distinct && !far;
  push('believable', believable ? 'pass' : 'warn', believable ? 'Wrong answers are believable' : 'Check the wrong answers', believable ? 'Each wrong answer is close to the answer or comes from a common mistake.' : wrong.length < 2 ? 'Add at least two wrong answers.' : !distinct ? 'Two options are the same.' : `Option ${LETTERS[far.i]} is easy to rule out. Use a value from a common mistake.`);
  const nums = filled.map(x => x.v);
  const passed = checks.filter(c => c.counted && c.status === 'pass').length;
  return {checks, passed, total: 10, rg, words, dok, suggestions, fractions: f};
 }
 const rating = p => p >= 7 ? ['Strong', 'badge-success', 'success'] : p >= 4 ? ['Getting there', 'badge-warning', 'warning'] : ['Needs work', 'badge-destructive', 'destructive'];

 let pending = null;
 function mount(host, opts) {
  if (opts) pending = opts;
  host = host || document.querySelector('.uc-page .qc-manual');
  if (!host || !pending || host.querySelector('.uc-iq')) return;
  const {settings = {}, inst} = pending;
  document.getElementById('uc-iq-panel')?.remove();
  const page = host.closest('main > .page') || document;
  const side = page.querySelector('.buildergrid > div');
  const ctx = {grade: String(settings.grade || '5'), subject: settings.subject || 'Mathematics'};
  const stds = (STANDARDS[ctx.grade] || []).slice();
  if (settings.standard && !stds.some(s => s[0] === settings.standard)) stds.unshift([settings.standard, settings.standard, '']);
  const blank = () => ({type:'Multiple choice', standard: settings.standard || stds[0]?.[0] || '', dok:'2', points:'1', stem:'', options:['','','',''], correct:null, mis:['','','',''], editing:[false,false,false,false], components:[], supports:{language:{on:false,text:'',words:''}, visual:{on:false}, read:{on:false}, hint:{on:false,text:''}, extension:{on:false,text:''}}, suggest:'', undoStem:'', editId:null});
  /* The runtime can rebuild this section on any state change, so the draft and view live outside the DOM. */
  let S = pending.draft || blank(), A = null, view = 'items', previewMode = 'supports';
  const restoreView = pending.view || 'items';

  /* ---------- Left: the item form ---------- */
  const form = document.createElement('form');
  form.className = 'uc-iq';
  form.noValidate = true;
  form.setAttribute('aria-label', 'Write an item');
  form.innerHTML = `<div class="form">
   <div class="form-grid">
    <div class="field"><label class="label" for="uc-iq-type">Item type</label><span class="select-wrap"><select class="select" id="uc-iq-type" name="type"><option>Multiple choice</option></select></span></div>
    <div class="field"><label class="label" for="uc-iq-standard">Standard</label><span class="select-wrap"><select class="select" id="uc-iq-standard" name="standard">${stds.map(([c, n]) => `<option value="${esc(c)}">${esc(c === n ? c : c + ' ' + n)}</option>`).join('')}</select></span></div>
    <div class="field"><label class="label" for="uc-iq-dok">Depth of Knowledge (DOK)</label><span class="select-wrap"><select class="select" id="uc-iq-dok" name="dok">${DOK.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></span></div>
    <div class="field"><label class="label" for="uc-iq-points">Total points</label><div class="cie-stepper"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-iq-step="-1" aria-label="Fewer points">${icon('minus')}</button><input class="input" id="uc-iq-points" name="points" type="number" min="1" max="10" step="1" inputmode="numeric" value="1"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-iq-step="1" aria-label="More points">${icon('plus')}</button></div></div>
   </div>
   <div class="item item-muted uc-iq-box">
    <div class="field">
     <div class="uc-iq-labelrow"><label class="label" for="uc-iq-stem">Item</label><button type="button" class="btn btn-ghost btn-sm" data-iq="sample">Load sample</button></div>
     <textarea class="textarea" id="uc-iq-stem" name="stem" rows="4" placeholder="Write the question learners will answer"></textarea>
    </div>
    <div class="uc-iq-summary">
     <a href="#uc-iq-panel" class="item uc-iq-link" data-iq-view="analysis">
      <span class="item-content"><span class="item-title">Item analysis</span><span class="item-description" data-iq-summary></span></span>
      <span class="item-actions"><span data-iq-badge></span><span class="item-title" data-iq-score></span>${icon('chevronRight')}</span>
     </a>
     <div class="progress uc-iq-progress" role="progressbar" aria-label="Item analysis checks passed" aria-valuemin="0" aria-valuemax="10" data-iq-progress><div class="progress-indicator"></div></div>
     <a href="#uc-iq-panel" class="item uc-iq-link" data-iq-view="supports">
      <span class="item-content"><span class="item-title">Learner supports</span><span class="item-description" data-iq-supports-summary></span></span>
      <span class="item-actions">${icon('chevronRight')}</span>
     </a>
    </div>
   </div>
   <div class="field" role="group" aria-labelledby="uc-iq-options-label">
    <div class="uc-iq-labelrow"><span class="label" id="uc-iq-options-label">Answer options</span><span class="tooltip-wrap"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-iq="shuffle" aria-label="Shuffle answer options">${icon('shuffle')}</button><span class="tooltip" role="tooltip">Shuffle items</span></span></div>
    <p class="field-hint">Select a letter to mark the correct answer. For each wrong answer, name the misconception it reveals.</p>
    <div class="uc-iq-options">${LETTERS.map((l, i) => `<div class="uc-iq-option" data-i="${i}">
     <div class="cie-option" data-iq-row="${i}"><button type="button" class="cie-letter" data-iq-correct="${i}" aria-pressed="false" aria-label="Mark ${l} as the correct answer" title="Mark as correct">${l}</button><input class="cie-option-input" id="uc-iq-o${i}" data-iq-opt="${i}" aria-label="Option ${l}" placeholder="Option ${l}"><span class="uc-iq-option-status" data-iq-status="${i}"></span></div>
     <div class="uc-iq-mis" data-iq-misarea="${i}" hidden>
      <span class="uc-iq-mis-icon">${icon('cornerDownRight')}</span>
      <div class="uc-iq-mis-body">
      <button type="button" class="btn btn-ghost btn-sm uc-iq-mistext" data-iq-misedit="${i}" hidden></button>
      <div class="field" data-iq-misfield="${i}" hidden><label class="sr-only" for="uc-iq-m${i}">Misconception for option ${l}</label><input class="input" id="uc-iq-m${i}" data-iq-mis="${i}" placeholder="What misconception does this option reveal?"><p class="field-hint" data-iq-detect="${i}" hidden></p></div>
      </div>
     </div>
    </div>`).join('')}</div>
   </div>
   <p class="field-error" role="alert" data-iq-error></p>
   <p class="sr-only" role="status" data-iq-status-msg></p>
   <div class="uc-iq-actions"><button type="reset" class="btn btn-ghost btn-lg">Cancel</button><button type="submit" class="btn btn-outline btn-lg" data-iq-submit>Add to test</button></div>
  </div>`;
  host.replaceChildren(form);
  const $ = s => form.querySelector(s);
  const el = {type:$('#uc-iq-type'), standard:$('#uc-iq-standard'), dok:$('#uc-iq-dok'), points:$('#uc-iq-points'), stem:$('#uc-iq-stem'), error:$('[data-iq-error]'), msg:$('[data-iq-status-msg]')};

  /* ---------- Right: one panel that swaps views ---------- */
  const panel = document.createElement('section');
  panel.className = 'card uc-iq-panel';
  panel.id = 'uc-iq-panel';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'uc-iq-panel-title');
  side?.append(panel);
  const board = () => side?.querySelector('.qc-board');

  const fillForm = () => {
   el.type.value = S.type; el.standard.value = S.standard; el.dok.value = S.dok; el.points.value = S.points; el.stem.value = S.stem;
   S.options.forEach((o, i) => { $(`[data-iq-opt="${i}"]`).value = o; $(`[data-iq-mis="${i}"]`).value = S.mis[i]; });
   $('[data-iq-submit]').textContent = S.editId ? 'Save changes' : 'Add to test';
  };

  function supportsOn() { return Object.entries(S.supports).filter(([, v]) => v.on).map(([k]) => k); }
  const SUPPORT_NAMES = {language:'Language support', visual:'Visual model', read:'Read aloud', hint:'Step-by-step hint', extension:'Extension'};

  function updateLeft() {
   const [label, cls, tone] = A ? rating(A.passed) : ['', '', ''];
   $('[data-iq-summary]').textContent = A ? '' : 'Write an item to see how it measures up.';
   $('[data-iq-score]').textContent = A ? `${A.passed}/${A.total}` : '';
   $('[data-iq-badge]').innerHTML = A ? `<span class="badge ${cls}">${label}</span>` : '';
   const prog = $('[data-iq-progress]');
   prog.style.setProperty('--value', (A ? A.passed * 10 : 0) + '%');
   prog.setAttribute('aria-valuenow', A ? A.passed : 0);
   if (tone) prog.dataset.tone = tone; else delete prog.dataset.tone;
   const on = supportsOn();
   $('[data-iq-supports-summary]').textContent = on.length ? on.map(k => SUPPORT_NAMES[k]).join(', ') : '';
   S.options.forEach((o, i) => {
    const status = $(`[data-iq-status="${i}"]`), area = $(`[data-iq-misarea="${i}"]`), text = $(`.uc-iq-mistext[data-iq-misedit="${i}"]`), field = $(`[data-iq-misfield="${i}"]`), detect = $(`[data-iq-detect="${i}"]`);
    const isCorrect = S.correct === i, has = !!o.trim(), mis = S.mis[i].trim(), sug = A?.suggestions[i] || '';
    const optRow = form.querySelector(`.uc-iq-option[data-i="${i}"]`);
    optRow.toggleAttribute('data-correct', isCorrect);
    form.querySelector(`[data-iq-row="${i}"]`).classList.toggle('is-correct', isCorrect);
    form.querySelector(`[data-iq-correct="${i}"]`).setAttribute('aria-pressed', String(isCorrect));
    if (isCorrect) status.innerHTML = `<span class="cie-correct">${icon('check')}<span class="sr-only">Correct answer</span></span>`;
    else if (has && !mis && !S.editing[i]) status.innerHTML = `<span class="tooltip-wrap"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-iq-misedit="${i}" aria-label="Name the misconception for option ${LETTERS[i]}">${icon('circleAlert', 'text-warning-value')}</button><span class="tooltip" role="tooltip">Name the misconception</span></span>`;
    else status.innerHTML = '';
    area.hidden = isCorrect || !has || (!mis && !S.editing[i]);
    text.hidden = S.editing[i] || !mis;
    text.textContent = mis;
    text.setAttribute('aria-label', `Edit misconception for option ${LETTERS[i]}: ${mis}`);
    field.hidden = !S.editing[i];
    detect.hidden = !sug || sug === mis;
    if (sug && sug !== mis) detect.innerHTML = `Detected: ${esc(sug)} <button type="button" class="btn btn-ghost btn-xs" data-iq-use="${i}">Use this</button>`;
   });
  }

  /* ---------- Panel views ---------- */
  const head = (back, backLabel, title, desc = '', badge = '') => `<div class="card-header uc-iq-panel-head">
   <button type="button" class="btn btn-ghost btn-sm uc-iq-back" data-iq-view="${back}">${icon('arrowLeft')}${esc(backLabel)}</button>
   <div class="uc-iq-title-row"><h2 class="card-title" id="uc-iq-panel-title" tabindex="-1">${esc(title)}</h2>${badge}</div>${desc ? `<p class="card-description">${desc}</p>` : ''}</div>`;

  function checkRow(c) {
   let extra = '';
   if (c.id === 'components') extra = `<div class="uc-iq-checklist radio-group" role="radiogroup" aria-label="Learning component">${c.components.map((n, k) => `<label class="check text-body-small"><input class="radio" type="radio" name="uc-iq-comp" data-iq-comp="${esc(n)}"${S.components.includes(n) ? ' checked' : ''}> ${esc(n)}${k === c.suggested && !S.components.length ? ' <span class="badge badge-info">Suggested</span>' : ''}</label>`).join('')}</div>`;
   if (c.id === 'reading' && S.suggest) extra = `<div class="item item-muted uc-iq-suggest"><div class="item-content"><span class="item-title uc-iq-inline">${icon('sparkles')}Suggested wording</span><span class="item-description">${esc(S.suggest)}</span><div class="uc-iq-btnrow"><button type="button" class="btn btn-sm" data-iq="applySuggest">Use this</button><button type="button" class="btn btn-ghost btn-sm" data-iq="suggestToSupport">Add as language support</button><button type="button" class="btn btn-ghost btn-sm" data-iq="dismissSuggest">Dismiss</button></div></div></div>`;
   if (c.id === 'reading' && S.undoStem) extra += `<div class="uc-iq-btnrow"><button type="button" class="btn btn-ghost btn-sm" data-iq="undoStem">${icon('undo')}Undo rewrite</button></div>`;
   /* The action sits at the right of the row and shows on hover or focus; rows with an action get a hover state. */
   const action = c.action && !(c.id === 'reading' && S.suggest) ? `<div class="item-actions uc-iq-hover-action"><button type="button" class="btn btn-ghost btn-sm" data-iq-action="${c.action}"${c.target != null ? ` data-target="${c.target}"` : ''}>${c.action === 'suggest' ? icon('sparkles') : ''}${esc(c.actionLabel)}</button></div>` : '';
   return `<div class="item uc-iq-check${action ? ' uc-iq-check-action' : ''}" data-check="${c.id}"><span class="uc-iq-status">${statusIcon(c.status)}</span><div class="item-content"><span class="item-title">${esc(c.title)}</span><span class="item-description">${esc(c.desc)}</span>${extra}</div>${action}</div>`;
  }

  function analysisView() {
   if (!A) return head('items', 'Items added', 'Item analysis') + `<div class="card-content"><div class="empty-state"><p>Write an item on the left. The analysis updates as you type.</p></div></div>`;
   const issues = A.checks.filter(c => c.counted && c.status !== 'pass'), passed = A.checks.filter(c => c.counted && c.status === 'pass');
   const [label, cls] = rating(A.passed);
   return head('items', 'Items added', 'Item analysis', '', `<span class="badge ${cls}">${label}</span>`) + `<div class="card-content uc-iq-panel-body">
    ${issues.length ? `<div class="uc-iq-group"><h3 class="label">To improve (${issues.length})</h3><div class="item-group">${issues.map(checkRow).join('')}</div></div>` : ''}
    ${passed.length ? `<details class="accordion-item"${issues.length ? '' : ' open'}><summary class="accordion-trigger">Passed (${passed.length})</summary><div class="item-group">${passed.map(checkRow).join('')}</div></details>` : ''}
   </div>`;
  }

  const bars = () => {
   const f = fractions(S.stem).filter(x => x.d <= 12 && x.n <= x.d).slice(0, 3);
   if (!f.length) return '<p class="field-hint">No fractions in the question yet. Fraction bars build from the numbers you write.</p>';
   return `<div class="uc-iq-bars">${f.map(x => `<div class="uc-iq-barwrap"><span class="item-title">${x.n}/${x.d}</span><div class="uc-iq-bar" role="img" aria-label="${x.n} of ${x.d} equal parts shaded" style="--parts:${x.d}">${Array.from({length: x.d}, (_, k) => `<div class="progress" style="--value:${k < x.n ? 100 : 0}%"><div class="progress-indicator"></div></div>`).join('')}</div></div>`).join('')}</div>`;
  };

  function supportsView() {
   const sup = S.supports;
   const block = (key, desc, body) => `<div class="uc-iq-support"><div class="uc-iq-support-head"><div class="item-content"><span class="item-title" id="uc-iq-sup-${key}">${SUPPORT_NAMES[key]}</span><span class="item-description">${desc}</span></div><button type="button" class="switch" role="switch" aria-checked="${sup[key].on}" aria-labelledby="uc-iq-sup-${key}" data-iq-switch="${key}"></button></div>${sup[key].on ? `<div class="uc-iq-support-body">${body}</div>` : ''}</div>`;
   return head('analysis', 'Item analysis', 'Learner supports', 'Same question, different ways in. Turn on the supports you want to review now. You assign them to learners in the Assign step.') + `<div class="card-content uc-iq-panel-body">
    ${!S.stem.trim() ? '<div class="alert alert-info" role="status"><div class="alert-description">Write the item first. Supports are built from its wording and numbers.</div></div>' : ''}
    ${block('language', 'Plainer wording and word help for multilingual learners and anyone who finds dense text hard. The math stays the same.', `<div class="field"><label class="label" for="uc-iq-sup-text">Simplified question</label><textarea class="textarea" id="uc-iq-sup-text" data-iq-sup="language.text" rows="4">${esc(sup.language.text)}</textarea><p class="field-hint">About Grade ${readingGrade(sup.language.text)}, down from Grade ${readingGrade(S.stem)}.</p></div><div class="field"><label class="label" for="uc-iq-sup-words">Word help (one term per line)</label><textarea class="textarea" id="uc-iq-sup-words" data-iq-sup="language.words" rows="3">${esc(sup.language.words)}</textarea></div><div class="uc-iq-btnrow"><button type="button" class="btn btn-ghost btn-sm" data-iq="regenLanguage">${icon('refresh')}Regenerate from question</button></div>`)}
    <div class="separator"></div>
    ${block('visual', 'Fraction bars built from the numbers in the question, for learners who reason better with a picture.', bars())}
    <div class="separator"></div>
    ${block('read', 'Learners can listen to the question and answer options.', `<div class="uc-iq-btnrow"><button type="button" class="btn btn-outline btn-sm" data-iq="listen">${icon('volume')}Listen to the question</button></div>`)}
    <div class="separator"></div>
    ${block('hint', 'An optional, collapsed set of steps for learners who need help getting started.', `<div class="field"><label class="label" for="uc-iq-sup-hint">Steps (one per line)</label><textarea class="textarea" id="uc-iq-sup-hint" data-iq-sup="hint.text" rows="3">${esc(sup.hint.text)}</textarea></div>`)}
    <div class="separator"></div>
    ${block('extension', 'A challenge prompt for learners who are ready to go further.', `<div class="field"><label class="label" for="uc-iq-sup-ext">Challenge prompt</label><textarea class="textarea" id="uc-iq-sup-ext" data-iq-sup="extension.text" rows="3">${esc(sup.extension.text)}</textarea></div>`)}
    <div class="uc-iq-btnrow uc-iq-panel-foot"><button type="button" class="btn btn-outline btn-sm" data-iq-view="preview">${icon('eye')}Preview for learners</button></div>
   </div>`;
  }

  function previewView() {
   const sup = S.supports, withSup = previewMode === 'supports', on = supportsOn();
   const stem = withSup && sup.language.on && sup.language.text.trim() ? sup.language.text : S.stem;
   const steps = sup.hint.text.split('\n').map(s => s.trim()).filter(Boolean), words = sup.language.words.split('\n').map(s => s.trim()).filter(Boolean);
   const opts = S.options.map((o, i) => ({o, i})).filter(x => x.o.trim());
   return head('supports', 'Learner supports', 'Learner preview', 'What learners see. Supports change how learners access the question, not what it measures.') + `<div class="card-content uc-iq-panel-body">
    <div class="tabs-list" role="group" aria-label="Preview version"><button type="button" class="tab" aria-pressed="${!withSup}" data-iq-preview="standard">Standard</button><button type="button" class="tab" aria-pressed="${withSup}" data-iq-preview="supports">With supports${on.length ? ` (${on.length})` : ''}</button></div>
    ${!S.stem.trim() ? '<div class="empty-state"><p>Write the item to preview it.</p></div>' : `<div class="uc-iq-preview">
     ${withSup && !on.length ? '<div class="alert alert-info" role="status"><div class="alert-description">No supports are on yet. Go back to turn some on.</div></div>' : ''}
     <p class="text-body-base">${esc(stem)}</p>
     ${withSup && sup.read.on ? `<div class="uc-iq-btnrow"><button type="button" class="btn btn-outline btn-sm" data-iq="listenPreview">${icon('volume')}Listen</button></div>` : ''}
     ${withSup && sup.visual.on ? bars() : ''}
     ${withSup && sup.language.on && words.length ? `<div class="alert alert-info"><div class="alert-title">Word help</div><div class="alert-description">${words.map(esc).join('<br>')}</div></div>` : ''}
     <div class="uc-iq-preview-options" role="radiogroup" aria-label="Choose one answer"><span class="label">Choose one answer</span>${opts.map(x => `<label class="check item item-outline"><input class="radio" type="radio" name="uc-iq-preview"> <span class="item-title">${LETTERS[x.i]}</span> ${esc(x.o)}</label>`).join('')}</div>
     ${withSup && sup.hint.on && steps.length ? `<details class="accordion-item"><summary class="accordion-trigger">Need a hint?</summary><ol class="uc-iq-steps text-body-small">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}
     ${withSup && sup.extension.on && sup.extension.text.trim() ? `<details class="accordion-item"><summary class="accordion-trigger">Ready for more?</summary><p class="text-body-small">${esc(sup.extension.text)}</p></details>` : ''}
    </div>`}
   </div>`;
  }

  function renderPanel(animate) {
   if (view === 'items') return;
   const keep = panel.querySelector('details.accordion-item')?.open;
   panel.innerHTML = view === 'analysis' ? analysisView() : view === 'supports' ? supportsView() : previewView();
   if (keep != null) { const d = panel.querySelector('details.accordion-item'); if (d && view === 'analysis') d.open = keep; }
   if (animate) { panel.classList.remove('uc-iq-enter'); void panel.offsetWidth; panel.classList.add('uc-iq-enter'); }
  }

  function setView(next, focus = true) {
   view = next; pending.view = next;
   const b = board();
   form.querySelectorAll('a[data-iq-view]').forEach(a => a.toggleAttribute('aria-current', a.dataset.iqView === view));
   if (view === 'items') {
    panel.hidden = true;
    if (b) { b.hidden = false; b.classList.remove('uc-iq-enter'); void b.offsetWidth; b.classList.add('uc-iq-enter'); }
    return;
   }
   if (b) b.hidden = true;
   panel.hidden = false;
   renderPanel(true);
   if (focus) panel.querySelector('#uc-iq-panel-title')?.focus({preventScroll: true});
   if (focus && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({block: 'start', behavior: 'smooth'});
  }

  let timer = 0;
  function refresh(now) {
   clearTimeout(timer);
   const run = () => { pending.draft = S; A = analyse(S, ctx); updateLeft(); if (view === 'analysis' || view === 'preview') renderPanel(false); if (view === 'supports') renderPanel(false); };
   if (now) run(); else timer = setTimeout(run, 200);
  }

  function ensureSupportContent(key) {
   const s = S.supports;
   if (key === 'language' && !s.language.text.trim()) { s.language.text = simplify(S.stem); s.language.words = wordHelp(s.language.text); }
   if (key === 'hint' && !s.hint.text.trim()) s.hint.text = hintSteps(S.stem);
   if (key === 'extension' && !s.extension.text.trim()) s.extension.text = extension(S.stem);
  }

  function reorder() {
   const rows = S.options.map((o, i) => ({o, m: S.mis[i], c: S.correct === i, v: numberIn(o)}));
   if (rows.some(r => r.o.trim() && !r.v)) { el.msg.textContent = 'Only numeric options can be ordered.'; return; }
   rows.sort((x, y) => !x.o.trim() ? 1 : !y.o.trim() ? -1 : val(x.v) - val(y.v));
   S.options = rows.map(r => r.o); S.mis = rows.map(r => r.m); S.correct = rows.findIndex(r => r.c); if (S.correct < 0) S.correct = null;
   S.editing = [false, false, false, false];
   fillForm(); refresh(true);
   el.msg.textContent = 'Options ordered from least to greatest.';
  }

  /* Shuffle the answer options, keeping each option's correct mark and misconception with it. */
  function shuffle() {
   const rows = S.options.map((o, i) => ({o, m: S.mis[i], c: S.correct === i}));
   if (rows.filter(r => r.o.trim()).length < 2) { el.msg.textContent = 'Add at least two options to shuffle.'; return; }
   const before = rows.map(r => r.o).join('|');
   for (let n = 0; n < 5 && rows.map(r => r.o).join('|') === before; n++) for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
   S.options = rows.map(r => r.o); S.mis = rows.map(r => r.m); S.correct = rows.findIndex(r => r.c); if (S.correct < 0) S.correct = null;
   S.editing = [false, false, false, false];
   fillForm(); refresh(true);
   el.msg.textContent = 'Answer options shuffled.';
  }

  const speak = text => { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch {} };
  const readOut = stem => [stem, ...S.options.map((o, i) => o.trim() ? `${LETTERS[i]}. ${o}` : '').filter(Boolean)].join('. ');

  /* ---------- Events ---------- */
  form.addEventListener('input', e => {
   const t = e.target;
   if (t === el.stem) { S.stem = t.value; S.undoStem = ''; }
   else if (t.dataset.iqOpt) S.options[+t.dataset.iqOpt] = t.value;
   else if (t.dataset.iqMis) { S.mis[+t.dataset.iqMis] = t.value; }
   else return;
   el.error.textContent = '';
   refresh();
  });
  form.addEventListener('change', e => {
   const t = e.target;
   if (t === el.standard) { S.standard = t.value; S.components = []; }
   else if (t === el.dok) S.dok = t.value;
   else if (t === el.points) { const n = Math.min(10, Math.max(1, Math.round(Number(t.value)) || 1)); S.points = String(n); t.value = n; }
   else if (t === el.type) S.type = t.value;
   else return;
   refresh(true);
  });
  form.addEventListener('focusout', e => {
   const t = e.target;
   if (t.dataset?.iqMis) { const i = +t.dataset.iqMis; setTimeout(() => { if (!form.querySelector(`[data-iq-misfield="${i}"]`).contains(document.activeElement) && S.mis[i].trim()) { S.editing[i] = false; updateLeft(); } }, 0); }
  });
  form.addEventListener('click', e => {
   const v = e.target.closest('[data-iq-view]');
   if (v) { e.preventDefault(); setView(view === v.dataset.iqView ? 'items' : v.dataset.iqView); return; }
   const step = e.target.closest('[data-iq-step]');
   if (step) { const n = Math.min(10, Math.max(1, (Number(S.points) || 1) + Number(step.dataset.iqStep))); S.points = String(n); el.points.value = n; return; }
   /* Clicking an option row outside its text field or buttons also marks that option correct. */
   const optRow = !e.target.closest('input, button, a') && e.target.closest('.cie-option[data-iq-row]');
   if (optRow) { const i = +optRow.dataset.iqRow; if (S.options[i].trim()) { S.correct = i; S.editing[i] = false; el.error.textContent = ''; refresh(true); } return; }
   const cor = e.target.closest('[data-iq-correct]');
   if (cor) { S.correct = +cor.dataset.iqCorrect; S.editing[S.correct] = false; el.error.textContent = ''; refresh(true); cor.focus(); return; }
   const misEdit = e.target.closest('[data-iq-misedit]');
   /* The field opens without focus on a mouse click (no focus ring by default); keyboard users are moved into it. */
   if (misEdit) { const i = +misEdit.dataset.iqMisedit; S.editing[i] = true; updateLeft(); if (e.detail === 0) form.querySelector(`[data-iq-mis="${i}"]`).focus(); return; }
   const use = e.target.closest('[data-iq-use]');
   if (use) { const i = +use.dataset.iqUse; S.mis[i] = A.suggestions[i]; form.querySelector(`[data-iq-mis="${i}"]`).value = S.mis[i]; S.editing[i] = false; refresh(true); return; }
   const act = e.target.closest('[data-iq]')?.dataset.iq;
   if (act === 'sample') {
    S = {...blank(), ...JSON.parse(JSON.stringify(SAMPLE))};
    if (!stds.some(s => s[0] === S.standard)) S.standard = stds[0]?.[0] || S.standard;
    fillForm(); refresh(true);
   }
   if (act === 'reorder') reorder();
   if (act === 'shuffle') shuffle();
  });
  form.addEventListener('reset', e => {
   e.preventDefault();
   const wasEditing = !!S.editId;
   S = blank(); fillForm(); el.error.textContent = ''; refresh(true);
   if (wasEditing) { setView('items', false); el.msg.textContent = 'Edit cancelled.'; }
   el.stem.focus();
  });
  form.addEventListener('submit', e => {
   e.preventDefault();
   el.error.textContent = '';
   const fail = (msg, node) => { el.error.textContent = msg; node?.focus(); };
   if (!S.stem.trim()) return fail('Write the item first.', el.stem);
   if (S.options.filter(o => o.trim()).length < 2) return fail('Add at least two answer options.', form.querySelector('[data-iq-opt="0"]'));
   if (S.correct === null || !S.options[S.correct].trim()) return fail('Select the correct answer.', form.querySelector('[data-iq-correct="0"]'));
   if (!inst) return fail('Items can’t be added on this screen.');
   const extras = () => ({difficulty:DOK_DIFFICULTY[S.dok], standard:S.standard, dok:S.dok, misconceptions:S.mis.slice(), learningComponents:S.components.slice(), supports:JSON.parse(JSON.stringify(S.supports)), quality:A ? {passed:A.passed, total:A.total} : null, manual:true});
   if (S.editId) {
    const id = S.editId, kept = S.options.map((o, i) => ({o: o.trim(), i})).filter(x => x.o), prev = inst.state.written?.[id] || inst.state.edits?.[id] || {};
    const updated = {...prev, id, stem:S.stem.trim(), options:kept.map(x => x.o), correct:kept.findIndex(x => x.i === S.correct), marks:Number(S.points) || 1, type:'Multiple choice', displayType:'Multiple choice', ...extras(), misconceptions:kept.map(x => S.mis[x.i])};
    inst.setState({written:{...inst.state.written, [id]:updated}});
    inst.update();
    inst.refreshQuestionBoard?.();
    S = blank(); fillForm(); refresh(true); setView('items', false);
    el.msg.textContent = 'Item updated.';
    return;
   }
   inst.renderVals().openWrite();
   inst.setState({form:{stem:S.stem, opts:S.options, correct:S.correct, marks:S.points}, fError:''});
   inst.renderVals().saveWrite();
   if (inst.state.writeOpen) { const msg = inst.state.fError; inst.renderVals().closeWrite(); return fail(msg); }
   const id = inst.state.chosen.at(-1), item = inst.state.written[id];
   if (item) inst.setState({written:{...inst.state.written, [id]:{...item, ...extras()}}});
   inst.refreshQuestionBoard?.();
   S = blank(); fillForm(); refresh(true); setView('items', false);
   el.msg.textContent = 'Item added to the test.';
   el.stem.focus();
  });

  panel.addEventListener('click', e => {
   const v = e.target.closest('[data-iq-view]');
   if (v) { e.preventDefault(); setView(v.dataset.iqView); return; }
   const sw = e.target.closest('[data-iq-switch]');
   if (sw) { const k = sw.dataset.iqSwitch; S.supports[k].on = !S.supports[k].on; if (S.supports[k].on) ensureSupportContent(k); updateLeft(); renderPanel(false); panel.querySelector(`[data-iq-switch="${k}"]`)?.focus(); return; }
   const pv = e.target.closest('[data-iq-preview]');
   if (pv) { previewMode = pv.dataset.iqPreview; renderPanel(false); panel.querySelector(`[data-iq-preview="${previewMode}"]`)?.focus(); return; }
   const act = e.target.closest('[data-iq-action]');
   if (act) {
    const a = act.dataset.iqAction;
    if (a === 'suggest') { S.suggest = simplify(S.stem); if (S.suggest === S.stem.trim()) { S.suggest = ''; el.msg.textContent = 'No simpler wording found. Try shorter sentences.'; } renderPanel(false); panel.querySelector('[data-iq="applySuggest"]')?.focus(); }
    if (a === 'markCorrect') { S.correct = +act.dataset.target; fillForm(); refresh(true); }
    if (a === 'fillMis') { S.options.forEach((o, i) => { if (i !== S.correct && !S.mis[i].trim() && A.suggestions[i]) S.mis[i] = A.suggestions[i]; }); fillForm(); refresh(true); }
    if (a === 'reorder') reorder();
    return;
   }
   const b = e.target.closest('[data-iq]')?.dataset.iq;
   if (b === 'applySuggest') { S.undoStem = S.stem; S.stem = S.suggest; S.suggest = ''; el.stem.value = S.stem; refresh(true); el.msg.textContent = 'Item rewritten. Undo is in Item analysis.'; panel.querySelector('[data-iq="undoStem"]')?.focus(); }
   if (b === 'undoStem') { S.stem = S.undoStem; S.undoStem = ''; el.stem.value = S.stem; refresh(true); }
   if (b === 'dismissSuggest') { S.suggest = ''; renderPanel(false); }
   if (b === 'suggestToSupport') { S.supports.language = {on:true, text:S.suggest, words:wordHelp(S.suggest)}; S.suggest = ''; updateLeft(); setView('supports'); }
   if (b === 'regenLanguage') { S.supports.language.text = ''; ensureSupportContent('language'); renderPanel(false); }
   if (b === 'listen') speak(readOut(S.stem));
   if (b === 'listenPreview') speak(readOut(S.supports.language.on && S.supports.language.text.trim() ? S.supports.language.text : S.stem));
  });
  panel.addEventListener('input', e => {
   const t = e.target;
   if (t.dataset.iqSup) { const [k, f] = t.dataset.iqSup.split('.'); S.supports[k][f] = t.value; }
  });
  panel.addEventListener('change', e => {
   const t = e.target;
   if (t.dataset.iqComp != null) { const n = t.dataset.iqComp; S.components = [n]; A = analyse(S, ctx); updateLeft(); renderPanel(false); panel.querySelector(`[data-iq-comp="${CSS.escape(n)}"]`)?.focus(); }
  });
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') { const back = panel.querySelector('.uc-iq-back'); if (back) { e.preventDefault(); back.click(); } } });

  /* Switching to the item bank always brings the items board back */
  page.addEventListener('click', e => { if (e.target.closest('[data-qc-method]')) setView('items', false); });

  /* Editing a manually created item from the items board loads it back into this form. */
  pending.load = item => {
   const pad = (a, v) => Array.from({length: 4}, (_, i) => a?.[i] ?? v);
   const base = blank();
   S = {...base, stem:item.stem || '', options:pad(item.options, ''), correct:Number.isInteger(item.correct) && item.correct >= 0 ? item.correct : null, mis:pad(item.misconceptions, ''), points:String(item.marks || 1), dok:item.dok || base.dok, standard:stds.some(s => s[0] === item.standard) ? item.standard : base.standard, components:(item.learningComponents || []).slice(0, 1), supports:item.supports ? JSON.parse(JSON.stringify(item.supports)) : base.supports, editId:item.id};
   el.error.textContent = '';
   fillForm(); refresh(true); setView('items', false);
   form.scrollIntoView({block: 'start', behavior: 'smooth'});
   el.stem.focus({preventScroll: true});
   el.msg.textContent = 'Editing item. Save changes when you are done.';
  };

  fillForm(); refresh(true);
  if (restoreView !== 'items') setView(restoreView, false);
 }

 /* The composer can rebuild the Create manually section after first paint, so mount whenever it appears. */
 new MutationObserver(() => { if (!pending) return; const h = document.querySelector('.uc-page .qc-manual'); if (h && !h.querySelector('.uc-iq')) mount(h); }).observe(document.documentElement, {childList: true, subtree: true});
 /* Item preview (13 Nov): the full question first, then grey cards for Standard, DOK, Points and Question type.
    The Standard card opens the standard's details in the same dialog, with a back chevron, like Set up your
    assessment. Add item is the only action, and only when the item can still be added. */
 function preview(q, {grade = '5', standard = '', canAdd = false, onAdd, onClose} = {}) {
  const code = q.standard || standard, found = (STANDARDS[String(grade)] || []).find(s => s[0] === code) || Object.values(STANDARDS).flat().find(s => s[0] === code);
  const dok = dokOf(q);
  const type = q.displayType || ({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[q.type] || q.type || 'Multiple choice');
  const opts = (q.options || []).map((o, i) => `<div class="cie-option${i === q.correct ? ' is-correct' : ''}"><span class="cie-letter" aria-hidden="true">${LETTERS[i] || i + 1}</span><span class="cie-option-input uc-ip-option">${esc(o)}</span>${i === q.correct ? `<span class="cie-correct">${icon('check')}<span class="sr-only">Correct answer</span></span>` : ''}</div>`).join('');
  const card = (label, value) => `<div class="item item-muted uc-ip-card"><span class="item-content"><span class="item-description">${label}</span><span class="item-title">${esc(value)}</span></span></div>`;
  const comps = COMPONENTS[code] || COMPONENTS.default;
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog uc-item-preview theme-assessments';
  dialog.setAttribute('aria-labelledby', 'uc-ip-title');
  dialog.innerHTML = `<section class="uc-ip-view" data-ip-view="item">
    <div class="dialog-header"><h2 class="dialog-title" id="uc-ip-title" tabindex="-1">Item preview</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" data-ip-close aria-label="Close item preview">${icon('x')}</button></div>
    <div class="dialog-body">
     <p class="text-body-base">${esc(q.stem)}</p>
     ${opts ? `<div class="cie-option-list" role="list" aria-label="Answer options">${opts}</div>` : ''}
     ${q.explanation ? `<div class="field"><span class="label">Explanation</span><p class="text-body-small">${esc(q.explanation)}</p></div>` : ''}
     <div class="uc-ip-cards">
      ${code ? `<button type="button" class="item item-muted uc-ip-card" data-ip-standard aria-label="Standard ${esc(code)}. View standard details"><span class="item-content"><span class="item-description">Standard</span><span class="item-title">${esc(code)}</span></span><span class="item-actions">${icon('chevronRight')}</span></button>` : ''}
      ${card('DOK', 'DOK ' + dok)}
      ${card('Points', q.marks || 1)}
      ${card('Question type', type)}
     </div>
    </div>
    ${canAdd ? '<div class="dialog-footer"><button type="button" class="btn btn-lg" data-ip-add>Add item</button></div>' : ''}
   </section>
   ${code ? `<section class="uc-ip-view" data-ip-view="standard" hidden>
    <div class="dialog-header"><div class="uc-ip-title-row"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-ip-back aria-label="Back to item preview">${icon('chevronLeft')}</button><h2 class="dialog-title" id="uc-ip-standard-title" tabindex="-1">${esc(code)}${found && found[1] !== code ? ` - ${esc(found[1])}` : ''}</h2></div><button type="button" class="btn btn-ghost btn-icon dialog-close" data-ip-close aria-label="Close item preview">${icon('x')}</button></div>
    <div class="dialog-body text-body-small">
     ${found?.[2] ? `<p>${esc(found[2])}</p>` : ''}
     <div><h3 class="text-body-small font-semibold">Learning components</h3><ul class="uc-ip-list">${comps.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    </div>
   </section>` : ''}`;
  document.body.append(dialog);
  const show = name => {
   dialog.querySelectorAll('[data-ip-view]').forEach(v => { v.hidden = v.dataset.ipView !== name; });
   dialog.setAttribute('aria-labelledby', name === 'item' ? 'uc-ip-title' : 'uc-ip-standard-title');
   (name === 'item' ? dialog.querySelector('[data-ip-standard]') : dialog.querySelector('#uc-ip-standard-title'))?.focus();
  };
  const close = async () => {
   if (dialog.hasAttribute('data-closing')) return;
   dialog.setAttribute('data-closing', '');
   const transitions = dialog.getAnimations();
   if (transitions.length) await Promise.allSettled(transitions.map(transition => transition.finished));
   dialog.close();
  };
  dialog.addEventListener('close', () => {
   dialog.remove();
   onClose?.();
  }, {once:true});
  dialog.addEventListener('click', e => {
   if (e.target === dialog || e.target.closest('[data-ip-close]')) {
    e.stopPropagation();
    if (e.target !== dialog) return close();
    const bounds = dialog.getBoundingClientRect();
    if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) close();
    return;
   }
   if (dialog.hasAttribute('data-closing')) return;
   if (e.target.closest('[data-ip-standard]')) return show('standard');
   if (e.target.closest('[data-ip-back]')) return show('item');
   if (e.target.closest('[data-ip-add]')) { onAdd?.(); close(); }
  });
  dialog.addEventListener('cancel', e => {
   e.preventDefault();
   if (dialog.hasAttribute('data-closing')) return;
   if (dialog.querySelector('[data-ip-view="standard"]:not([hidden])')) show('item');
   else close();
  });
  dialog.showModal();
  dialog.tabIndex = -1; dialog.focus({preventScroll: true});
 }
 window.capItemQuality = {mount, analyse, simplify, preview, dokOf, edit: item => pending?.load?.(item)};
})();
