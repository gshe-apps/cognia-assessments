(() => {
 function ready() {
  const root = document.querySelector('.od-dashboard');
  if (!root) return;
  window.capMountAssessmentCreateMenu(root);

  const asset = name => '<img src="assets/assessment-overview/'+name+'.svg" alt="">';
  const today = new Date(2025, 2, 19);
  const dayName = new Intl.DateTimeFormat('en-US', {weekday:'short'});
  const shortDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric'});
  const fullDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'});
  const addDays = (date, count) => new Date(date.getFullYear(), date.getMonth(), date.getDate()+count);
  const monday = date => addDays(date, -((date.getDay()+6)%7));
  let first = monday(today);
  let view = 'week';

  const sampleWeek = [
   [{type:'Quiz', time:'8:30 – 9:15 AM', title:'Algebra: Expressions', students:24, status:'check'}],
   [{type:'Formative', time:'9:30 – 10:15 AM', title:'Functions: Exit Ticket', students:26, status:'pending'}],
   [{type:'Summative', time:'8:30 – 9:30 AM', title:'Unit 4 Assessment', students:24, status:'pending'},
    {type:'Formative', time:'1:00 – 1:45 PM', title:'Graphing Practice', students:25, status:'pending'}],
   [{type:'Quiz', time:'9:30 – 10:15 AM', title:'Transformations Quiz', students:26, status:'pencil'}],
   [{type:'Formative', time:'8:30 – 9:15 AM', title:'Real-World Functions', students:24, status:'pending'}]
  ];
  const links = {check:'CAP-T13-Results.dc.html', pending:'CAP-T10-Scheduled.dc.html', pencil:'CAP-T05-Questions.dc.html'};
  const statusLabels = {check:'Completed', pending:'Scheduled', pencil:'Draft'};
  const hero = root.querySelector('.od-hero');
  const title = hero.querySelector('h1');
  title.textContent = 'Assessment overview';
  const heading = document.createElement('div');
  title.before(heading);
  heading.append(title);
  heading.insertAdjacentHTML('beforeend','<p>Your class assessments for this week.</p>');

  const calendar = root.querySelector('.od-calendar');
  const priorities = root.querySelector('.od-folder-grid');
  const layout = document.createElement('div');
  layout.className = 'od-overview-layout';
  hero.after(layout);
  layout.append(calendar, priorities);

  calendar.innerHTML = `
   <div class="od-week-toolbar">
    <div class="od-date-controls" aria-label="Calendar navigation">
     <button type="button" class="btn btn-outline btn-icon" data-week-step="-1" aria-label="Previous week">${asset('left')}</button>
     <button type="button" class="btn btn-outline od-week-range" data-calendar-today aria-label="Return to the current week">${asset('calendar')}<span data-week-range aria-live="polite"></span></button>
     <button type="button" class="btn btn-outline btn-icon" data-week-step="1" aria-label="Next week">${asset('right')}</button>
    </div>
    <div class="tabs-list od-week-view" role="group" aria-label="Calendar view">
     <button type="button" class="tab" aria-pressed="true" data-calendar-view="week">Week</button>
     <button type="button" class="tab" aria-pressed="false" data-calendar-view="list">List</button>
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
  const progress = (value,label) => '<div class="od-priority-meter"><progress value="'+value+'" max="100" aria-label="'+label+'"></progress><span>'+value+'% '+label+'</span></div>';
  const priorityHeading = (icon,title,copy) => '<span class="od-priority-heading"><span class="od-priority-symbol">'+asset(icon)+'</span><span><strong>'+title+'</strong><small>'+copy+'</small></span>'+asset('right1')+'</span>';
  priorities.innerHTML = `
   <header class="od-priorities-intro"><h2>Today’s priorities</h2></header>
   <a class="od-priority-tile od-priority-review card" href="CAP-T14-ScoringQueue.dc.html">
    ${priorityHeading('inbox','Needs review','Assessments with responses to review.')}
    <dl class="od-priority-stats">${stat(2,'assessments')}${stat(49,'responses')}</dl>
    ${progress(68,'reviewed')}
   </a>
   <a class="od-priority-tile card" href="CAP-T13-Results.dc.html">
    ${priorityHeading('chart','Results ready','Assessments with results to explore.')}
    <dl class="od-priority-stats">${stat(1,'assessment')}${stat(24,'students')}</dl>
    ${progress(100,'ready')}
   </a>`;
  draftPanel.innerHTML = `<summary class="od-priority-tile card">
   ${priorityHeading('pencil1','Continue drafts','Pick up where you left off.')}
   <span class="od-priority-stats"><span><strong data-overview-draft-total></strong><small>drafts</small></span><span><strong>1</strong><small>due this week</small></span></span>
  </summary>`;
  draftPanel.firstElementChild.querySelector('[data-overview-draft-total]').replaceWith(draftCount);
  draftPanel.append(draftContent);
  priorities.lastElementChild.before(draftPanel);
  for (const pager of draftContent.querySelectorAll('[data-draft-step]')) {
   pager.className='btn btn-ghost btn-icon btn-sm';
   pager.innerHTML=asset(pager.dataset.draftStep==='-1'?'left':'right');
  }
  const resume = draftContent.querySelector('[data-overview-resume]');
  resume.classList.add('card');

  function assessmentCard(item) {
   return `<a class="od-week-assessment card" href="${links[item.status]}">
    <span class="od-week-assessment-top"><span class="badge badge-theme-light">${item.type}</span><span aria-label="${statusLabels[item.status]}" role="img">${asset(item.status)}</span></span>
    <span>${item.time}</span><strong>${item.title}</strong>
    <span>${item.students} students</span>
   </a>`;
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
    return `<section class="od-week-day card" ${+date===+today?'aria-current="date"':''}>
     <header><h3>${dayName.format(date)} <span>${shortDate.format(date)}</span></h3>
      ${+date===+today?'<span class="badge badge-theme-light">Today</span>':''}
      <p>${items.length} assessment${items.length===1?'':'s'}</p></header>
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
