/* Educator Overview: My calendar and Results tabs.
   Results overview explains the "48% at or above benchmark" shown on the educator Home: the trend, where it comes from
   (class, grade, subject), the assessments behind it and the learners furthest from benchmark.
   Sample data only. Numbers match the educator Home chart (5 Oct to 2 Nov). */
(() => {
 const BENCHMARK = 50;
 const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths = {
  trendDown: '<path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" />',
  trendUp: '<path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" />',
  minus: '<path d="M5 12h14" />',
  x: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  chevron: '<path d="m9 18 6-6-6-6" />',
  info: '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  search: '<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />'
 };
 const icon = (name, cls = '') => `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;

 // Same points as the educator Home chart.
 const trend = [
  {label:'5 Oct', full:'Monday 5 October', value:44, completed:92},
  {label:'12 Oct', full:'Monday 12 October', value:47, completed:88},
  {label:'19 Oct', full:'Monday 19 October', value:51, completed:95},
  {label:'26 Oct', full:'Monday 26 October', value:46, completed:90},
  {label:'Today', full:'Monday 2 November (today)', value:48, completed:97}
 ];

 const classes = [
  {name:'Grade 5A', grade:'5', at:14, total:24, change:4},
  {name:'Grade 5B', grade:'5', at:13, total:24, change:2},
  {name:'Grade 6A', grade:'6', at:9, total:24, change:-6},
  {name:'Grade 6B', grade:'6', at:9, total:22, change:-3},
  {name:'Grade 7A', grade:'7', at:12, total:24, change:1},
  {name:'Grade 7B', grade:'7', at:10, total:22, change:-2}
 ];
 const subjectOf = {Fractions:'Mathematics', Ratios:'Mathematics', Algebra:'Mathematics', Geometry:'Mathematics', Data:'Mathematics',
  'Life science':'Science', 'Physical science':'Science', 'Earth science':'Science'};
 const assessments = [
  {title:'Fractions on a number line', cls:'Grade 6A', skill:'Fractions', date:'2 Nov', pct:29},
  {title:'Ratios and rates', cls:'Grade 6B', skill:'Ratios', date:'29 Oct', pct:36},
  {title:'Equivalent fractions', cls:'Grade 5B', skill:'Fractions', date:'26 Oct', pct:41},
  {title:'Equations quiz', cls:'Grade 7B', skill:'Algebra', date:'22 Oct', pct:41},
  {title:'Ecosystems check', cls:'Grade 6B', skill:'Life science', date:'20 Oct', pct:45},
  {title:'Percent and ratio review', cls:'Grade 7A', skill:'Ratios', date:'30 Oct', pct:50},
  {title:'Data and graphs', cls:'Grade 6A', skill:'Data', date:'15 Oct', pct:54},
  {title:'Forces and motion', cls:'Grade 7A', skill:'Physical science', date:'28 Oct', pct:56},
  {title:'Geometry basics', cls:'Grade 5B', skill:'Geometry', date:'13 Oct', pct:58},
  {title:'Weather and climate', cls:'Grade 5A', skill:'Earth science', date:'8 Oct', pct:62},
  {title:'Simplifying expressions', cls:'Grade 5A', skill:'Algebra', date:'6 Oct', pct:67}
 ].map(a => ({...a, grade:a.cls.match(/\d/)[0], subject:subjectOf[a.skill]}));
 const learners = [
  ['Mason Reed','Grade 6A',31,'4 of 4','Fractions'],
  ['Lily Chen','Grade 6A',34,'3 of 4','Fractions'],
  ['Noah Patel','Grade 6B',35,'3 of 3','Ratios'],
  ['Ava Johnson','Grade 6A',37,'3 of 4','Fractions'],
  ['Ethan Wright','Grade 7B',38,'2 of 2','Algebra'],
  ['Zoe Martinez','Grade 6B',39,'2 of 3','Ratios'],
  ['Liam O’Brien','Grade 5B',40,'2 of 3','Fractions'],
  ['Isla Nguyen','Grade 7B',41,'2 of 2','Algebra'],
  ['Oliver Hughes','Grade 6B',42,'2 of 3','Life science'],
  ['Mia Thompson','Grade 7A',43,'1 of 2','Ratios'],
  ['Jack Wilson','Grade 5A',44,'1 of 3','Algebra'],
  ['Sofia Rossi','Grade 6A',44,'2 of 4','Data']
 ].map(([name, cls, avg, below, skill]) => ({name, cls, grade:cls.match(/\d/)[0], avg, below, skill, subject:subjectOf[skill]}));

 // 25 Nov: results switch between this week and this month. Sample data: this week is 27 Oct to 2 Nov.
 const weekOf = {'Grade 5A':{at:15, change:3}, 'Grade 5B':{at:12, change:-1}, 'Grade 6A':{at:8, change:-2}, 'Grade 6B':{at:10, change:1}, 'Grade 7A':{at:12, change:0}, 'Grade 7B':{at:9, change:-1}};
 const inWeek = date => ['27 Oct','28 Oct','29 Oct','30 Oct','31 Oct','1 Nov','2 Nov'].includes(date);
 const classesFor = () => classes.map(c => state.period === 'week' ? {...c, ...weekOf[c.name]} : c);
 const assessmentsFor = () => assessments.filter(a => state.period === 'month' || inWeek(a.date));
 const learnersFor = () => {
  const taking = new Set(assessmentsFor().map(a => a.cls));
  return learners.filter(l => state.period === 'month' || taking.has(l.cls));
 };

 const average = list => Math.round(list.reduce((t, a) => t + a.pct, 0) / list.length);
 const groupBy = (list, key, labelOf) => [...new Set(list.map(a => a[key]))].map(value => {
  const group = list.filter(a => a[key] === value);
  return {key:value, name:labelOf(value), pct:average(group), sub:`${group.length} assessment${group.length === 1 ? '' : 's'}`};
 }).sort((a, b) => a.pct - b.pct);
 function dimensionsFor() {
  const cls = classesFor();
  const grades = ['5','6','7'].map(grade => {
   const list = cls.filter(c => c.grade === grade);
   const at = list.reduce((t, c) => t + c.at, 0), total = list.reduce((t, c) => t + c.total, 0);
   return {key:grade, name:'Grade ' + grade, pct:Math.round(at / total * 100), sub:`${at} of ${total} learners`};
  });
  return {
   cls: {label:'Class', items:cls.map(c => ({key:c.name, name:c.name, pct:Math.round(c.at / c.total * 100), sub:`${c.at} of ${c.total} learners`, change:c.change}))},
   grade: {label:'Grade', items:grades},
   subject: {label:'Subject', items:groupBy(assessmentsFor(), 'subject', v => v)}
  };
 }
 const totalLearners = classes.reduce((t, c) => t + c.total, 0);
 const totalAt = classes.reduce((t, c) => t + c.at, 0);
 const overall = Math.round(totalAt / totalLearners * 100);

 const valueClass = pct => pct >= BENCHMARK ? 'text-success-value' : 'text-destructive-value';
 const state = {dim:'cls', filter:null, period:'week'};
 let dimensions = dimensionsFor();

 function barChart() {
  const dim = dimensions[state.dim];
  // 25 Nov: the average marker shows the same figure as the "Below benchmark at 48%" badge under the greeting
  // (every learner counted once), so the two never disagree.
  const avg = overall;
  // 25 Nov (2): the benchmark is the origin. Bars go up when a group is above it and down when below,
  // scaled to the largest gap (rounded up to 10) so small differences are still visible.
  const range = Math.max(10, Math.ceil(Math.max(...dim.items.map(i => Math.abs(i.pct - BENCHMARK)), Math.abs(avg - BENCHMARK)) / 10) * 10);
  const versus = pct => pct > BENCHMARK ? `Above benchmark by ${pct - BENCHMARK}%` : pct < BENCHMARK ? `Below benchmark by ${BENCHMARK - pct}%` : 'At benchmark';
  const bar = item => {
   const on = state.filter && state.filter.dim === state.dim && state.filter.key === item.key;
   const side = item.pct > BENCHMARK ? 'is-above' : item.pct < BENCHMARK ? 'is-below' : 'is-at';
   const tip = `<span class="chart-tooltip od-res-tip" aria-hidden="true"><span class="font-semibold">${esc(item.name)}</span><span>${versus(item.pct)}</span><span>${esc(item.sub)}</span></span>`;
   const label = `${esc(item.name)}: ${versus(item.pct)}, ${esc(item.sub)}`;
   return `<div class="od-res-col ${side}" role="listitem">
    <button type="button" class="od-res-vbar ${side}" aria-pressed="${on}" data-card="${esc(item.key)}" aria-label="${label}. ${on ? 'Selected, select again to clear the filter' : 'Filter the results below'}" style="--size:${(Math.abs(item.pct - BENCHMARK) / range).toFixed(3)}"><span class="od-res-vfill"></span>${tip}</button>
    <span class="od-res-name text-body-small">${esc(item.name)}</span>
   </div>`;
  };
  return `<div class="chart od-res-vchart">
   <div class="od-res-cols" role="list" aria-label="${esc(dim.label)} results against the ${BENCHMARK}% benchmark, average ${avg}%">
    <span class="od-res-line od-res-bench-line" aria-hidden="true" data-line><span class="chart-tooltip od-res-line-tip">Benchmark ${BENCHMARK}%</span></span>
    <span class="od-res-line od-res-avg-line ${avg >= BENCHMARK ? 'is-above' : 'is-below'}" aria-hidden="true" style="--avg:${((avg - BENCHMARK) / range).toFixed(3)}"><span class="od-res-avg-label text-body-small">Average ${avg}%</span></span>
    ${dim.items.map(bar).join('')}
   </div>
  </div>`;
 }

 // This week panel (25 Nov): the admin overview's This window card. Read-only rows: icon, label and line below,
 // the large value vertically centred on the right.
 function summary() {
  const cls = dimensions.cls.items;
  const byChange = cls.slice().sort((a, b) => b.change - a.change);
  const best = byChange[0], worst = byChange[byChange.length - 1];
  const below = classesFor().reduce((t, c) => t + c.total - c.at, 0);
  const results = assessmentsFor(), belowResults = results.filter(a => a.pct < BENCHMARK).length;
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n) + '%';
  const pct = (n, of) => Math.round(n / of * 100) + '%';
  const row = (status, label, value, sub) => `<div class="od-res-stat is-${status}">
   <span class="od-res-stat-icon" aria-hidden="true">${icon(status === 'success' ? 'trendUp' : 'trendDown', 'icon-' + status)}</span>
   <span class="od-res-stat-label">${esc(label)}</span>
   <span class="od-res-stat-value">${esc(value)}</span>
   <span class="od-res-stat-sub">${esc(sub)}</span>
  </div>`;
  return `<aside class="od-res-summary" aria-labelledby="od-res-sum-title">
   <h2 class="od-res-summary-title" id="od-res-sum-title">${state.period === 'week' ? 'This week' : 'This month'}</h2>
   ${row('destructive', 'Learners below benchmark', pct(below, totalLearners), `${below} of ${totalLearners} learners`)}
   ${row('destructive', 'Results below benchmark', pct(belowResults, results.length), `${belowResults} of ${results.length} assessments`)}
   ${row(best.change >= 0 ? 'success' : 'destructive', 'Most improved class', signed(best.change), best.name)}
   ${row(worst.change >= 0 ? 'success' : 'destructive', 'Least improved class', signed(worst.change), worst.name)}
  </aside>`;
 }

 const matches = row => !state.filter || String(row[state.filter.dim]) === String(state.filter.key);
 const initials = name => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
 const empty = (title, text) => `<div class="empty-state"><span class="empty-media">${icon('search')}</span><p class="empty-title">${title}</p><p>${text}</p></div>`;

 // 25 Nov: assessment results are folders (class on the tab), learners are profile cards.
 // 25 Nov: assessment results as the admin hub's bubble cards (SA2-Hub "Top five"). The dashed ring is the
 // 50% benchmark; the filled circle's area is the result, green at or above benchmark, red below.
 // 25 Nov: the Overview shows the first 6 results and 5 learners. View all appears beside the heading only when there are more.
 const MAX_RESULTS = 6, MAX_LEARNERS = 5;
 // A button with no destination yet: it hovers like any ghost button but does not navigate.
 const viewAll = (count, max, label) => count > max ? `<button type="button" class="btn btn-ghost btn-sm" aria-label="${label}">View all</button>` : '';

 function assessmentBubbles() {
  const list = assessmentsFor().filter(matches).sort((a, b) => a.pct - b.pct).slice(0, MAX_RESULTS);
  if (!list.length) return empty('Nothing to show', 'No assessment results match this filter.');
  const radius = pct => Math.min(72, Math.max(12, 50 * Math.sqrt(pct / BENCHMARK))).toFixed(1);
  return `<ul class="od-res-bubbles" role="list">${list.map(a => {
   const above = a.pct >= BENCHMARK;
   return `<li><a class="od-res-bubble" href="CAP-T13-Results.dc.html" aria-label="${esc(a.title)}, ${esc(a.cls)}, ${esc(a.date)}: ${a.pct}% at or above benchmark, ${above ? 'at or above' : 'below'} the ${BENCHMARK}% benchmark. View results">
    <svg class="od-res-bubble-svg" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="${radius(a.pct)}" class="od-res-bubble-fill ${above ? 'is-above' : 'is-below'}"></circle><circle cx="80" cy="80" r="50" class="od-res-bubble-ring"></circle><text x="80" y="89" text-anchor="middle" class="od-res-bubble-value">${a.pct}%</text></svg>
    <span class="text-body-small font-semibold">${esc(a.title)}</span>
    <span class="text-body-small">${esc(a.cls)}</span>
   </a></li>`;
  }).join('')}</ul>`;
 }

 // 25 Nov: compact profile cards, photo where there is one, initials otherwise.
 const photos = {'Mason Reed':'learner-jack-alfredo.png', 'Zoe Martinez':'learner-maria-gonzalez.png', 'Ava Johnson':'learner-kathrine-benedict.png'};
 function learnerCards() {
  const list = learnersFor().filter(matches).slice(0, MAX_LEARNERS);
  if (!list.length) return empty('Nothing to show', 'No learners in this group are below benchmark.');
  // 25 Nov (2): the plugin's divided list (Item, item-group-divided): no surface, a light line between learners.
  return `<ul class="item-group item-group-divided od-res-learners" role="list">${list.map(l => `<li class="item od-res-learner">
   <span class="item-media"><span class="avatar avatar-lg" aria-hidden="true">${photos[l.name] ? `<img src="assets/avatars/${photos[l.name]}" alt="">` : esc(initials(l.name))}</span></span>
   <span class="item-content"><span class="item-title">${esc(l.name)}</span><span class="item-description">${esc(l.cls)}</span></span>
   <span class="item-actions od-res-learner-score"><span class="text-body-base font-semibold text-destructive-value">${l.avg}%</span><span class="text-body-small text-muted-foreground">average</span></span>
  </li>`).join('')}</ul>`;
 }

 function render(panel) {
  dimensions = dimensionsFor();
  if (state.filter && !dimensions[state.filter.dim].items.some(i => i.key === state.filter.key)) state.filter = null;
  panel.innerHTML = `
  <div class="button-group button-group-segmented od-res-period" role="group" aria-label="Results period">
   <button type="button" class="btn btn-ghost btn-sm" aria-pressed="${state.period === 'week'}" data-period="week">This week</button>
   <button type="button" class="btn btn-ghost btn-sm" aria-pressed="${state.period === 'month'}" data-period="month">This month</button>
  </div>
  <div class="od-res-snap">
   <section class="card card-ghost od-res-trend" aria-labelledby="od-res-trend-title">
    <div class="od-res-section-head">
     <h2 class="text-body-base font-semibold od-res-title" id="od-res-trend-title">Overview of results by <label class="sr-only" for="od-res-group">Group results by</label><span class="text-body-small font-semibold"><select class="select select-inline" id="od-res-group" data-group>${Object.entries(dimensions).map(([key, d]) => `<option value="${key}"${state.dim === key ? ' selected' : ''}>${d.label}</option>`).join('')}</select></span></h2>
    </div>
    ${barChart()}
   </section>
   ${summary()}
  </div>

  <div class="od-res-columns">
  <section class="od-res-section" id="od-res-assessments" aria-labelledby="od-res-assess-title" tabindex="-1">
   <div class="od-res-list-head od-res-bubble-head"><h2 class="text-body-small font-semibold od-res-title" id="od-res-assess-title">Assessment results</h2><p class="od-res-bubble-key text-body-small"><span>Benchmark</span><svg viewBox="0 0 56 8" aria-hidden="true"><line x1="0" y1="4" x2="56" y2="4"></line></svg><span>${BENCHMARK}%</span></p>${viewAll(assessmentsFor().filter(matches).length, MAX_RESULTS, 'View all assessment results')}</div>
   ${assessmentBubbles()}
  </section>

  <section class="od-res-section" id="od-res-learners" aria-labelledby="od-res-learn-title" tabindex="-1">
   <div class="od-res-list-head"><h2 class="text-body-small font-semibold od-res-title" id="od-res-learn-title">Learners below benchmark</h2>${viewAll(learnersFor().filter(matches).length, MAX_LEARNERS, 'View all learners below benchmark')}</div>
   ${learnerCards()}
  </section>
  </div>`;
 }

 function mount() {
  const panel = document.querySelector('[data-overview-results]');
  const tabs = [...document.querySelectorAll('[data-overview-tab]')];
  if (!panel || !tabs.length || panel.dataset.ready) return;
  panel.dataset.ready = 'true';
  const latest = trend[trend.length - 1];
  const heroTitle = document.querySelector('.od-hero h1');
  if (heroTitle && heroTitle.parentElement.classList.contains('od-hero')) {
   const wrap = document.createElement('div');
   heroTitle.before(wrap);
   wrap.append(heroTitle);
  }
  heroTitle?.insertAdjacentHTML('afterend', `<p class="od-hero-status"><span class="badge ${overall >= BENCHMARK ? 'badge-success' : 'badge-destructive'}">${overall >= BENCHMARK ? 'Above' : 'Below'} benchmark at ${overall}%</span><span class="text-body-small font-semibold text-muted-foreground">${latest.completed}% learner completion</span></p>`);
  render(panel);

  const select = (name, focus) => {
   tabs.forEach(tab => {
    const on = tab.dataset.overviewTab === name;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) tab.focus();
   });
   if (name === 'results') grow();
   const url = new URL(location.href);
   if (name === 'results') url.searchParams.set('view', 'results'); else url.searchParams.delete('view');
   history.replaceState(history.state, '', url);
  };
  tabs.forEach((tab, index) => {
   tab.addEventListener('click', () => select(tab.dataset.overviewTab));
   tab.addEventListener('keydown', event => {
    const step = {ArrowRight:1, ArrowLeft:-1}[event.key];
    let next = step ? (index + step + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next == null) return;
    event.preventDefault();
    select(tabs[next].dataset.overviewTab, true);
   });
  });

  // Focus goes back to the control that was used, but only shows its ring when it was used with the keyboard.
  let keyboard = false;
  document.addEventListener('keydown', () => { keyboard = true; }, true);
  document.addEventListener('pointerdown', () => { keyboard = false; }, true);
  const rerender = focusSelector => {
   render(panel);
   if (focusSelector) panel.querySelector(focusSelector)?.focus({preventScroll:true, focusVisible:keyboard});
  };
  // 25 Nov: the bars grow up from the axis each time Results overview opens and when the grouping changes
  // (Class, Grade, Subject). Not on filter clicks, so picking a bar does not replay it.
  const grow = () => {
   const chart = panel.querySelector('.od-res-vchart');
   if (!chart) return;
   chart.classList.remove('is-growing');
   void chart.offsetWidth;
   chart.classList.add('is-growing');
  };
  select(new URLSearchParams(location.search).get('view') === 'results' ? 'results' : 'calendar');

  panel.addEventListener('change', event => {
   if (!event.target.matches('[data-group]')) return;
   state.dim = event.target.value;
   rerender('[data-group]');
   grow();
  });
  // Benchmark and Average tooltips follow the pointer along their line.
  panel.addEventListener('pointermove', event => {
   const line = event.target.closest('[data-line]');
   if (line) line.style.setProperty('--tip-x', (event.clientX - line.getBoundingClientRect().left) + 'px');
  });
  panel.addEventListener('click', event => {
   const card = event.target.closest('[data-card]');
   const period = event.target.closest('[data-period]');
   if (card) {
    const key = card.dataset.card;
    const on = state.filter && state.filter.dim === state.dim && state.filter.key === key;
    state.filter = on ? null : {dim:state.dim, key};
    rerender(`[data-card="${CSS.escape(key)}"]`);
   }
   else if (period && period.dataset.period !== state.period) {
    state.period = period.dataset.period;
    rerender(`[data-period="${state.period}"]`);
   }
  });

 }

 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
 const canvas = document.querySelector('x-dc');
 if (canvas) new MutationObserver(mount).observe(canvas, {childList:true});
})();
