/* Educator Overview: My calendar and Results tabs.
   Results overview explains the "48% at or above benchmark" shown on the educator Home: the trend, where it comes from
   (class, grade, subject, skill), the assessments behind it and the learners furthest from benchmark.
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

 const average = list => Math.round(list.reduce((t, a) => t + a.pct, 0) / list.length);
 const groupBy = (key, labelOf) => [...new Set(assessments.map(a => a[key]))].map(value => {
  const list = assessments.filter(a => a[key] === value);
  return {key:value, name:labelOf(value), pct:average(list), sub:`${list.length} assessment${list.length === 1 ? '' : 's'}`};
 }).sort((a, b) => a.pct - b.pct);
 const grades = ['5','6','7'].map(grade => {
  const list = classes.filter(c => c.grade === grade);
  const at = list.reduce((t, c) => t + c.at, 0), total = list.reduce((t, c) => t + c.total, 0);
  const change = {5:3, 6:-5, 7:-1}[grade];
  return {key:grade, name:'Grade ' + grade, pct:Math.round(at / total * 100), sub:`${at} of ${total} learners`, change};
 });
 const dimensions = {
  cls: {label:'Class', items:classes.map(c => ({key:c.name, name:c.name, pct:Math.round(c.at / c.total * 100), sub:`${c.at} of ${c.total} learners`, change:c.change}))},
  grade: {label:'Grade', items:grades},
  subject: {label:'Subject', items:groupBy('subject', v => v)},
  skill: {label:'Skill', items:groupBy('skill', v => v)}
 };
 const totalLearners = classes.reduce((t, c) => t + c.total, 0);
 const totalAt = classes.reduce((t, c) => t + c.at, 0);
 const overall = Math.round(totalAt / totalLearners * 100);
 const belowCount = assessments.filter(a => a.pct < BENCHMARK).length;

 const tone = pct => pct >= BENCHMARK ? 'success' : pct >= 40 ? 'warning' : 'destructive';
 const valueClass = pct => pct >= BENCHMARK ? 'text-success-value' : 'text-destructive-value';
 const state = {dim:'cls', filter:null};

 function barChart() {
  const dim = dimensions[state.dim];
  const bar = (item, total = false) => {
   const on = !total && state.filter && state.filter.dim === state.dim && state.filter.key === item.key;
   const tip = `<span class="chart-tooltip od-res-tip" aria-hidden="true"><span class="font-semibold">${esc(item.name)}</span><span>${esc(item.sub)}</span><span>${item.pct}% at or above benchmark</span></span>`;
   const label = `${esc(item.name)}: ${item.pct}% at or above benchmark, ${esc(item.sub)}`;
   return `<div class="od-res-col${total ? ' is-total' : ''}" role="listitem">
    ${total
     ? `<span class="od-res-vbar" role="img" tabindex="0" aria-label="${label}" style="--value:${item.pct}%"><span class="od-res-vfill"></span>${tip}</span>`
     : `<button type="button" class="od-res-vbar" aria-pressed="${on}" data-card="${esc(item.key)}" aria-label="${label}. ${on ? 'Selected, select again to clear the filter' : 'Filter the lists below'}" style="--value:${item.pct}%"><span class="od-res-vfill"></span>${tip}</button>`}
    <span class="od-res-name text-body-small${total ? ' font-semibold' : ''}">${esc(item.name)}</span>
   </div>`;
  };
  return `<div class="chart od-res-vchart">
   <div class="od-res-cols" role="list" aria-label="${esc(dim.label)} results">
    <span class="od-res-bench-line" aria-hidden="true"><span class="text-body-small text-muted-foreground">Benchmark ${BENCHMARK}%</span></span>
    ${dim.items.map(item => bar(item)).join('')}
   </div>
  </div>`;
 }

 // This week panel (Figma CAP 2031:20155): tinted rows, status icon, two lines.
 function summary() {
  const byChange = dimensions.cls.items.slice().sort((a, b) => b.change - a.change);
  const best = byChange[0], worst = byChange[byChange.length - 1];
  const row = (action, status, first, second, strong) => `<button type="button" class="od-res-stat is-${status}" data-sum="${action}"${action === 'best' ? ` data-key="${esc(best.key)}"` : action === 'worst' ? ` data-key="${esc(worst.key)}"` : ''}>
   <span class="od-res-stat-icon">${icon(status === 'success' ? 'trendUp' : 'trendDown', 'icon-' + status)}</span>
   <span class="od-res-stat-text"><span class="${strong === 1 ? 'font-semibold' : ''}">${first}</span><span class="${strong === 2 ? 'font-semibold' : ''}">${second}</span></span>
  </button>`;
  return `<aside class="card od-res-summary" aria-labelledby="od-res-sum-title">
   <h2 class="text-body-small font-normal" id="od-res-sum-title">This week</h2>
   <div class="od-res-stats">
    ${row('learners', 'destructive', `${totalLearners - totalAt} of ${totalLearners} learners`, 'below benchmark', 1)}
    ${row('assessments', 'destructive', `${belowCount} of ${assessments.length} assessment results`, 'below benchmark', 1)}
    ${row('best', 'success', 'Most improved class', esc(best.name), 2)}
    ${row('worst', 'destructive', 'Least improved class', esc(worst.name), 2)}
   </div>
  </aside>`;
 }

 const matches = row => !state.filter || String(row[state.filter.dim]) === String(state.filter.key);

 function assessmentRows() {
  const list = assessments.filter(matches).sort((a, b) => a.pct - b.pct);
  if (!list.length) return null;
  return list.map(a => `<tr class="row-link">
   <td><span class="item-content"><a class="item-title od-res-link" href="CAP-T13-Results.dc.html">${esc(a.title)}</a><span class="item-description">${esc(a.date)}</span></span></td>
   <td>${esc(a.cls)}</td><td>${esc(a.subject)}</td><td>${esc(a.skill)}</td>
   <td><span class="font-semibold ${valueClass(a.pct)}">${a.pct}%</span></td>
  </tr>`).join('');
 }

 function learnerRows() {
  const list = learners.filter(matches);
  if (!list.length) return null;
  return list.map(l => `<tr>
   <td class="font-semibold">${esc(l.name)}</td><td>${esc(l.cls)}</td><td>${esc(l.skill)}</td>
   <td class="num">${esc(l.below)}</td>
   <td><span class="font-semibold text-destructive-value">${l.avg}%</span></td>
  </tr>`).join('');
 }

 const empty = (title, text) => `<div class="empty-state"><span class="empty-media">${icon('search')}</span><p class="empty-title">${title}</p><p>${text}</p></div>`;

 function table(caption, head, rows, emptyText) {
  if (!rows) return empty('Nothing to show', emptyText);
  return `<div class="table-wrap"><table class="table"><caption class="sr-only">${caption}</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
 }

 function render(panel) {
  const filterLabel = state.filter ? dimensions[state.filter.dim].items.find(i => i.key === state.filter.key).name : '';
  const aRows = assessmentRows(), lRows = learnerRows();
  const countOf = rows => rows ? (rows.match(/<tr/g) || []).length : 0;
  panel.innerHTML = `
  <div class="od-res-snap">
   <section class="card card-ghost od-res-trend" aria-labelledby="od-res-trend-title">
    <div class="od-res-section-head">
     <div class="od-res-title"><h2 class="text-body-base font-semibold" id="od-res-trend-title">Overview of results by group</h2><span class="badge badge-warning">Design incomplete</span></div>
     <label class="sr-only" for="od-res-group">Group results by</label>
     <select class="select od-res-group" id="od-res-group" data-group>${Object.entries(dimensions).map(([key, d]) => `<option value="${key}"${state.dim === key ? ' selected' : ''}>${d.label}</option>`).join('')}</select>
    </div>
    ${barChart()}
   </section>
   ${summary()}
  </div>

  ${state.filter ? `<div class="chip-list od-res-chips" role="list" aria-label="Applied filter"><span class="chip" role="listitem">${esc(filterLabel)}<button type="button" class="chip-remove" aria-label="Remove filter ${esc(filterLabel)}" data-clear>${icon('x')}</button></span></div>` : ''}

  <section class="od-res-section" id="od-res-assessments" aria-labelledby="od-res-assess-title" tabindex="-1">
   <div class="od-res-section-head"><div><p class="text-body-small text-muted-foreground">Lowest results first</p><h2 class="text-body-base font-semibold" id="od-res-assess-title">Assessments behind this result <span class="badge badge-secondary">${countOf(aRows)}</span></h2></div></div>
   ${table('Assessments behind this result', `<th>Assessment</th><th>Class</th><th>Subject</th><th>Skill</th><th>At or above benchmark</th>`, aRows, 'No assessments match this filter.')}
  </section>

  <section class="od-res-section" id="od-res-learners" aria-labelledby="od-res-learn-title" tabindex="-1">
   <div class="od-res-section-head"><div><p class="text-body-small text-muted-foreground">${totalLearners - totalAt} learners are below benchmark. These are furthest from it.</p><h2 class="text-body-base font-semibold" id="od-res-learn-title">Learners who need support <span class="badge badge-secondary">${countOf(lRows)}</span></h2></div></div>
   ${table('Learners who need support', '<th>Learner</th><th>Class</th><th>Weakest skill</th><th class="num">Below benchmark in</th><th>Average score</th>', lRows, 'No learners in this group are far from benchmark.')}
  </section>`;
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
  select(new URLSearchParams(location.search).get('view') === 'results' ? 'results' : 'calendar');

  const rerender = focusSelector => {
   render(panel);
   if (focusSelector) panel.querySelector(focusSelector)?.focus({preventScroll:true});
  };
  const goTo = id => {
   const target = panel.querySelector(id);
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
   target.focus({preventScroll:true});
  };

  panel.addEventListener('change', event => {
   if (!event.target.matches('[data-group]')) return;
   state.dim = event.target.value;
   rerender('[data-group]');
  });
  panel.addEventListener('click', event => {
   const card = event.target.closest('[data-card]');
   const sum = event.target.closest('[data-sum]');
   if (card) {
    const key = card.dataset.card;
    const on = state.filter && state.filter.dim === state.dim && state.filter.key === key;
    state.filter = on ? null : {dim:state.dim, key};
    rerender(`[data-card="${CSS.escape(key)}"]`);
   }
   else if (event.target.closest('[data-clear]')) { state.filter = null; rerender('[data-group]'); }
   else if (sum) {
    const action = sum.dataset.sum;
    if (action === 'learners') goTo('#od-res-learners');
    else if (action === 'assessments') goTo('#od-res-assessments');
    else {
     state.dim = 'cls';
     state.filter = {dim:'cls', key:sum.dataset.key};
     rerender();
     goTo('#od-res-assessments');
    }
   }
  });

 }

 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
 const canvas = document.querySelector('x-dc');
 if (canvas) new MutationObserver(mount).observe(canvas, {childList:true});
})();
