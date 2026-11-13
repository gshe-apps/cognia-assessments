(() => {
 function ready() {
  const root = document.querySelector('.od-dashboard');
  if (!root) return;
  window.capMountAssessmentCreateMenu(root);

  // Lucide SVG paths, with color inherited from the Cognia icon class.
  const icons = {
   calendar: '<path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />',
   chart: '<path d="M5 21v-6" /><path d="M12 21V9" /><path d="M19 21V3" />',
   check: '<circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" />',
   left: '<path d="m15 18-6-6 6-6" />',
   right: '<path d="m9 18 6-6-6-6" />',
   pending: '<path d="M10.1 2.182a10 10 0 0 1 3.8 0" /><path d="M13.9 21.818a10 10 0 0 1-3.8 0" /><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7" /><path d="M2.182 13.9a10 10 0 0 1 0-3.8" /><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69" /><path d="M21.818 10.1a10 10 0 0 1 0 3.8" /><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69" /><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7" />',
   inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />',
   pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />',
   users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" />'
  };
  const icon = name => '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>';
  const weekButton = (step, direction, label) => `<span class="tooltip-wrap">
   <button type="button" class="btn btn-ghost btn-icon" data-week-step="${step}" aria-label="${label}">${icon(direction)}</button>
   <span class="tooltip" role="tooltip" aria-hidden="true">${label}</span>
  </span>`;
  const today = new Date(2025, 2, 19);
  const dayName = new Intl.DateTimeFormat('en-US', {weekday:'short'});
  const shortDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric'});
  const fullDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'});
  const addDays = (date, count) => new Date(date.getFullYear(), date.getMonth(), date.getDate()+count);
  const monday = date => addDays(date, -((date.getDay()+6)%7));
  let first = monday(today);
  let view = 'week';

  const sampleWeek = [
   [{type:'Formative', time:'8:30 – 9:15 AM', title:'Algebra: Expressions', classLabel:'Grade 5A', status:'check'}],
   [{type:'Formative', time:'9:30 – 10:15 AM', title:'Functions: Exit Ticket', classLabel:'Grade 5B', status:'pending'}],
   [{type:'Summative', time:'8:30 – 9:30 AM', title:'Unit 4 Assessment', classLabel:'Grade 7A', status:'pending'},
    {type:'Formative', time:'1:00 – 1:45 PM', title:'Graphing Practice', classLabel:'Grade 7B', status:'pending'}],
   [{type:'Screeners', time:'9:30 – 10:15 AM', title:'Transformations Quiz', classLabel:'Grade 6A', status:'pencil'}],
   [{type:'Formative', time:'8:30 – 9:15 AM', title:'Real-World Functions', classLabel:'Grade 8A', status:'pending'}]
  ];
  const links = {check:'CAP-T13-Results.dc.html', pending:'CAP-T10-Scheduled.dc.html', pencil:'CAP-T05-Questions.dc.html'};
  const statusLabels = {check:'Completed', pending:'Scheduled', pencil:'Draft'};
  const hero = root.querySelector('.od-hero');
  const title = hero.querySelector('h1');
  title.textContent = 'Good afternoon, Joe';
  const heading = document.createElement('div');
  title.before(heading);
  heading.append(title);
  heading.insertAdjacentHTML('beforeend','<p>Your assessment workspace for planning, assigning and tracking student progress.</p>');

  const calendar = root.querySelector('.od-calendar');
  const priorities = root.querySelector('.od-folder-grid');
  const layout = document.createElement('div');
  layout.className = 'od-overview-layout';
  hero.after(layout);
  layout.append(calendar, priorities);

  calendar.innerHTML = `
   <div class="od-week-toolbar">
    <div class="od-date-controls" aria-label="Calendar navigation">
     ${weekButton(-1,'left','Previous week')}
     <button type="button" class="btn btn-ghost od-week-range" data-calendar-today aria-label="Return to the current week">${icon('calendar')}<span data-week-range aria-live="polite"></span></button>
     ${weekButton(1,'right','Next week')}
    </div>
    <div class="tabs-list od-week-view" role="group" aria-label="Calendar view">
     <button type="button" class="tab" aria-pressed="true" data-calendar-view="week">Week</button>
     <button type="button" class="tab btn-ghost" aria-pressed="false" data-calendar-view="list">List</button>
    </div>
   </div>
   <div class="od-week-viewport"><div class="od-week-grid" data-overview-days></div></div>`;

  const draft = priorities.querySelector('[data-priority="draft"]');
  const draftCount = draft.querySelector('[data-draft-count]');
  const draftContent = draft.querySelector('.od-draft-content');
  const draftPanel = document.createElement('details');
  draftPanel.className = 'od-overview-draft';
  draftPanel.dataset.priority = 'draft';
  const stat = (value,label) => '<div><dt>'+label+'</dt><dd>'+value+'</dd></div>';
  const progress = (value, label) => `<div class="od-priority-meter progress-label">
   <div class="progress" role="progressbar" aria-label="${label}" aria-valuenow="${value}" style="--value: ${value}%"><div class="progress-indicator"></div></div>
   <span aria-hidden="true">${value}% ${label}</span>
  </div>`;
  const priorityHeading = (symbol, title, copy) => `<span class="od-priority-heading">
   <span class="icon-accent">${icon(symbol)}</span>
   <span><strong class="card-title">${title}</strong><small class="card-description">${copy}</small></span>
   ${icon('right')}
  </span>`;
  priorities.innerHTML = `
   <header class="od-priorities-intro"><h2>Today’s priorities</h2><p class="card-description">Focus on key assessment actions for ${dayName.format(today)}, ${shortDate.format(today)}.</p></header>
   <a class="card-link" href="CAP-T14-ScoringQueue.dc.html"><div class="od-priority-tile card">
    ${priorityHeading('inbox','Needs review','Assessments with responses to review.')}
    <dl class="od-priority-stats">${stat(2,'assessments')}${stat(49,'responses')}</dl>
    ${progress(68,'reviewed')}
   </div></a>
   <a class="card-link" href="CAP-T13-Results.dc.html"><div class="od-priority-tile card">
    ${priorityHeading('chart','Fractions Check','Grade 5 Mathematics')}
    <dl class="od-priority-stats">${stat(1,'assessment')}${stat(24,'students')}</dl>
    ${progress(100,'ready')}
   </div></a>`;
  draftPanel.innerHTML = `<summary class="od-priority-tile card">
   ${priorityHeading('pencil','Continue drafts','Pick up where you left off.')}
   <span class="od-priority-stats"><span><strong data-overview-draft-total></strong><small>drafts</small></span><span><strong>1</strong><small>due this week</small></span></span>
  </summary>`;
  draftPanel.firstElementChild.querySelector('[data-overview-draft-total]').replaceWith(draftCount);
  draftPanel.append(draftContent);
  priorities.lastElementChild.before(draftPanel);
  for (const pager of draftContent.querySelectorAll('[data-draft-step]')) {
   pager.className='btn btn-ghost btn-icon btn-sm';
   pager.innerHTML=icon(pager.dataset.draftStep==='-1'?'left':'right');
  }
  const resume = draftContent.querySelector('[data-overview-resume]');
  resume.classList.add('card');

  function assessmentCard(item) {
   return `<a class="card-link" href="${links[item.status]}"><div class="od-week-assessment card">
    <span class="od-week-assessment-top"><span class="badge badge-theme-light">${item.type}</span><span aria-label="${statusLabels[item.status]}" role="img">${icon(item.status)}</span></span>
    <span class="card-description">${item.time}</span><strong class="card-title">${item.title}</strong>
    <span class="od-week-class card-description">${icon('users')} ${item.classLabel}</span>
   </div></a>`;
  }

  function draw() {
   const last = addDays(first,4);
   calendar.querySelector('[data-week-range]').textContent = shortDate.format(first)+' – '+fullDate.format(last);
   calendar.querySelectorAll('[data-calendar-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.calendarView===view)));
   const days = calendar.querySelector('[data-overview-days]');
   days.dataset.view = view;
   days.innerHTML = Array.from({length:5},(_,index) => {
    const date = addDays(first,index);
    const items = +first===+monday(today) ? sampleWeek[index] : [];
    if (view==='list' && !items.length) return '';
    return `<section class="od-week-day card${+date===+today?' card-themed':''}" ${+date===+today?'aria-current="date"':''}>
     <header><h3>${dayName.format(date)} <span>${shortDate.format(date)}</span></h3>
      ${+date===+today?'<span class="badge badge-secondary">Today</span>':''}</header>
     <div class="od-week-events">${items.map(assessmentCard).join('')}</div>
    </section>`;
   }).join('') || '<p class="od-week-empty">No assessments scheduled this week.</p>';
  }

  calendar.addEventListener('click', event => {
   const step = event.target.closest('[data-week-step]');
   const toggle = event.target.closest('[data-calendar-view]');
   if (step) first = addDays(first, 7*Number(step.dataset.weekStep));
   else if (toggle) view = toggle.dataset.calendarView;
   else if (event.target.closest('[data-calendar-today]')) first = monday(today);
   else return;
   draw();
  });
  draw();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready);
 else ready();
})();
