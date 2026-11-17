(() => {
 function ready() {
  const root = document.querySelector('.od-dashboard');
  if (!root || root.querySelector('.od-desk')) return;
  window.capMountAssessmentCreateMenu(root);

  // Lucide SVG paths, with color inherited from the Cognia icon class.
  const icons = {
   calendar: '<path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />',
   check: '<circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" />',
   clock: '<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
   circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
   left: '<path d="m15 18-6-6 6-6" />',
   right: '<path d="m9 18 6-6-6-6" />',
   circleDashed: '<path d="M10.1 2.182a10 10 0 0 1 3.8 0" /><path d="M13.9 21.818a10 10 0 0 1-3.8 0" /><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7" /><path d="M2.182 13.9a10 10 0 0 1 0-3.8" /><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69" /><path d="M21.818 10.1a10 10 0 0 1 0 3.8" /><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69" /><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7" />',
   plus: '<path d="M5 12h14" /><path d="M12 5v14" />',
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

  const data = window.capOverviewCalendar;
  const sampleWeek = Array.from({length:5},(_,day)=>data.events.filter(item=>item.day===day));
  const markingQueue = 'CAP-T14-ScoringQueue.dc.html';
  const eventLink = item => {
   if (item.status==='review') return markingQueue;
   if (item.status==='pencil') return 'CAP-T03-Assessments.dc.html?view=drafts';
   const target = item.status==='check' ? 'CAP-T13-Results.dc.html?' : 'CAP-T09-ConfirmAssignment.dc.html?view=assigned&';
   return target+'calendarEvent='+item.id;
  };
  const statusLabels = {
   check: 'Completed',
   review: 'Needs review',
   pending: 'Scheduled',
   pencil: 'Still in draft'
  };
  const statusIcon = {check:'check',review:'circleAlert',pending:'clock',pencil:'circleDashed'};
  const listTone = {check:'success',review:'warning',pending:'secondary',pencil:'theme-light'};
  const cardLabel = item => item.status==='review' ? statusLabels.review : item.type;
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
     <button type="button" class="tab" aria-pressed="true" data-calendar-view="week">Calendar</button>
     <button type="button" class="tab btn-ghost" aria-pressed="false" data-calendar-view="list">List</button>
    </div>
   </div>
   <div class="od-week-viewport"><div class="od-week-grid" data-overview-days></div></div>`;

  const completed = data.events.find(item=>item.status==='check');
  priorities.classList.add('od-desk');
  priorities.innerHTML = `
   <header class="od-priorities-intro"><h2>Today’s priorities</h2></header>
   <div class="od-desk-cards">
   <section class="card od-desk-sheet" aria-labelledby="od-marking-title">
    <div class="od-desk-head">
     <span class="alert alert-warning od-desk-icon" aria-hidden="true">${icon(statusIcon.review)}</span>
     <h3 id="od-marking-title" class="card-title">Marking queue</h3>
     <span class="badge badge-warning">Needs review</span>
    </div>
    <div class="od-desk-metrics">
     <p class="od-desk-quantity text-muted-foreground"><strong class="text-heading text-foreground font-semibold">2</strong> <span>assessments</span></p>
     <span class="separator separator-vertical" aria-hidden="true"></span>
     <div class="od-desk-progress">
      <p class="text-muted-foreground"><strong class="text-body-base text-foreground font-semibold">68%</strong> reviewed</p>
      <div class="progress" role="progressbar" aria-label="Responses reviewed" aria-valuenow="68" style="--value:68%"><div class="progress-indicator"></div></div>
     </div>
    </div>
    <a class="btn" href="${markingQueue}">Open marking queue</a>
   </section>
   <section aria-label="Drafts" data-overview-draft-stack>
    <div class="od-desk-stack" data-sheets="1"><div class="od-desk-papers" aria-hidden="true"></div>
     <article class="card od-desk-sheet" data-draft-sheet>
      <div class="od-desk-head">
       <span class="icon-accent od-desk-icon od-desk-draft-icon" aria-hidden="true">${icon(statusIcon.pencil)}</span>
       <h3 class="card-title od-desk-draft-title" data-overview-draft-title aria-live="polite"></h3>
       <div class="od-desk-pager" data-draft-pager>
        <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Previous draft" data-draft-step="-1">${icon('left')}</button>
        <span class="text-body-small text-muted-foreground" data-draft-position></span>
        <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Next draft" data-draft-step="1">${icon('right')}</button>
       </div>
      </div>
      <div class="od-desk-footer">
       <div class="od-desk-draft-step" data-overview-draft-progress>
        <p class="card-description" data-overview-draft-meta></p>
        <p class="text-body-small font-semibold" data-overview-draft-phase></p>
       </div>
       <a class="btn btn-ghost btn-sm od-desk-secondary" href="CAP-T03-Assessments.dc.html?view=drafts" data-overview-resume>Continue draft</a>
      </div>
     </article>
    </div>
   </section>
   <article class="card od-desk-head od-desk-results">
    <span class="alert alert-success od-desk-icon" aria-hidden="true">${icon(statusIcon.check)}</span>
    <div><h3 class="card-title">${completed.title}</h3><p class="card-description">${completed.classLabel} · ${completed.scores.length} learners</p></div>
    <a class="btn btn-ghost btn-sm od-desk-secondary" href="${eventLink(completed)}" aria-label="View results for ${completed.title}">View</a>
   </article>
   </div>`;
  window.capUpdateOverviewDraftStack();

  const firstHour = 8;
  const endHour = 16;
  const demoMinute = 10 * 60 + 30;
  const percentOfDay = minute => (minute - firstHour * 60) / ((endHour - firstHour) * 60) * 100;
  const clock = new Intl.DateTimeFormat('en-US', {hour:'numeric', minute:'2-digit'});
  const hourLabel = new Intl.DateTimeFormat('en-US', {hour:'numeric'});
  const clockDate = minute => new Date(2025, 2, 19, 0, minute);
  const timeOf = item => clock.formatRange(clockDate(item.start),clockDate(item.end));
  const esc = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const info = (label,value) => `<div><dt class="text-body-small text-muted-foreground">${esc(label)}</dt><dd class="text-body-base font-semibold">${esc(value)}</dd></div>`;
  const points = items => items.reduce((total,item)=>total+(Number(item.marks)||1),0);
  const archiveKey = 'cogniaAssessmentArchiveV1';
  const readArchive = () => {
   try { return JSON.parse(localStorage.getItem(archiveKey) || '[]') || []; }
   catch { return []; }
  };

  function openPreview(item, trigger) {
   const date = fullDate.format(data.date(item));
   let draft, body, heading, tone, action;
   if(item.status==='check'){
    heading='Results at a glance'; tone='success';
    const total = item.scores.length;
    const max = points(item.questions);
    const average = Math.round(item.scores.reduce((sum,[,scores])=>sum+scores.reduce((a,b)=>a+b,0),0)/total/max*100);
    body = `<dl class="od-event-metrics">${info('Learners submitted',total+' of '+total)}${info('Average score',average+'%')}${info('Points available',max)}</dl>
     <section class="od-event-performance" aria-labelledby="od-event-chart">
      <h3 class="text-body-base font-semibold" id="od-event-chart">Average score by item</h3>
      ${item.questions.map((q,i)=>{
       const score = Math.round(item.scores.reduce((sum,[,scores])=>sum+scores[i],0)/(total*q.marks)*100);
       return `<div class="od-event-score"><span>Item ${i+1}</span><div class="progress" role="progressbar" aria-label="Item ${i+1} average score" aria-valuenow="${score}" style="--value:${score}%"><div class="progress-indicator"></div></div><strong>${score}%</strong></div>`;
      }).join('')}
     </section>`;
    action=`<a class="btn btn-lg" href="${eventLink(item)}">View results</a>`;
   } else if(item.status==='review'){
    heading='Marking queue'; tone='warning';
    body=`<dl class="od-event-metrics">${info('Written responses to score',item.responsesToScore)}${info('Learners assigned',item.learnerCount)}</dl>`;
    action=`<a class="btn btn-lg" href="${eventLink(item)}">Open marking queue</a>`;
   } else if(item.status==='pencil'){
    heading='Draft progress'; tone='secondary';
    const model=data.assessment(item), id='assessment-'+model.active;
    draft=readArchive().find(entry=>entry.id===id&&entry.status==='draft') || {id,title:item.title,status:'draft',step:1,model};
    const questions=draft.model.tests.flatMap(test=>test.questions||[]);
    const step=draft.step===2?2:1;
    body=`<section class="od-event-draft card"><div class="card-content">
     <h3 class="text-body-base font-semibold">${step===2?'Step 2 of 4 · Review':'Step 1 of 4 · Add your items'}</h3>
     <p class="text-body-small text-muted-foreground">${step===2?'Review the items, instructions and settings.':'Add or edit questions before reviewing the test.'}</p>
     <div class="progress" role="progressbar" aria-label="Current builder step" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step}" style="--value:${step*25}%"><div class="progress-indicator"></div></div>
    </div></section><dl class="od-event-metrics">${info('Items added',questions.length)}${info('Total points',points(questions))}</dl>`;
    action='<button type="button" class="btn btn-lg" data-resume-calendar-draft>Continue draft</button>';
   } else {
    heading='Session details'; tone='info';
    body=`<dl class="od-event-metrics">${info('Learners assigned',item.learnerCount)}${info('Items',item.questions.length)}${info('Duration',(item.end-item.start)+' minutes')}</dl>
     <section class="card"><div class="card-content od-event-session">
      <h3 class="text-body-base font-semibold">Delivery</h3>
      <dl class="od-event-metrics">${info('Date',date)}${info('Time',timeOf(item))}</dl>
     </div></section>`;
    action=`<a class="btn btn-lg" href="${eventLink(item)}">Review assessment</a>`;
   }
   const dialog=document.createElement('dialog');
   dialog.className='dialog od-event-preview';
   dialog.setAttribute('aria-labelledby','od-event-title');
   dialog.innerHTML=`<div class="dialog-header">
    <h2 class="dialog-title" id="od-event-title" tabindex="-1" autofocus>${esc(draft?.title||item.title)}</h2>
    <button class="btn btn-ghost btn-icon dialog-close" type="button" aria-label="Close preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <p class="dialog-description">${esc(item.type)} · ${esc(item.classLabel)}${draft?'':' · '+esc(date)}</p>
   </div>
   <div class="dialog-body">
    <div class="od-event-summary"><h3 class="text-body-base font-semibold">${heading}</h3><span class="badge badge-${tone}">${draft?'Draft':statusLabels[item.status]}</span></div>
    ${body}
    <p class="text-body-small text-muted-foreground">Sample assessment</p>
   </div>
   <div class="dialog-footer"><button class="btn btn-ghost btn-lg" type="button" data-dismiss-event>Close</button>${action}</div>`;
   dialog.addEventListener('close',()=>{dialog.remove();trigger.focus({preventScroll:true});},{once:true});
   dialog.querySelector('[data-dismiss-event]').onclick=()=>dialog.close();
   if(draft)dialog.querySelector('[data-resume-calendar-draft]').onclick=()=>{
    const entries=readArchive();
    if(!entries.some(entry=>entry.id===draft.id&&entry.status==='draft')){
     localStorage.setItem(archiveKey,JSON.stringify([...entries,{...draft,sample:true,updatedAt:new Date().toISOString()}]));
    }
    window.capOpenSaved(draft.id);
   };
   root.closest('.theme-assessments').append(dialog);
   dialog.showModal();
  }

  function assessmentCard(item) {
   const time = clock.formatRange(clockDate(item.start), clockDate(item.end));
   return `<a class="card-link" href="${eventLink(item)}" data-overview-event="${item.id}" aria-haspopup="dialog"><div class="od-week-assessment card">
    <span class="od-week-assessment-top"><span class="badge badge-${listTone[item.status]}">${cardLabel(item)}</span><span class="tooltip-wrap od-week-status" data-status="${item.status}">
     <span role="img" aria-label="${statusLabels[item.status]}">${icon(statusIcon[item.status])}</span>
     <span class="tooltip" aria-hidden="true">${statusLabels[item.status]}</span>
    </span></span>
    <span class="card-description">${time}</span><strong class="card-title">${item.title}</strong>
    <span class="od-week-class card-description">${icon('users')} ${item.classLabel}</span>
   </div></a>`;
  }

  function timedEvent(item) {
   const top = percentOfDay(item.start);
   const height = percentOfDay(item.end) - top;
   const time = clock.formatRange(clockDate(item.start), clockDate(item.end));
   return `<a class="od-timed-event" data-status="${item.status}" href="${eventLink(item)}" data-overview-event="${item.id}" aria-haspopup="dialog"
     style="--od-event-start: ${top}%; --od-event-duration: ${height}%"
     aria-label="${item.title}, ${item.type}, ${item.classLabel}, ${time}, ${statusLabels[item.status]}">
    <span class="od-timed-event-band">
     <span>${cardLabel(item)}</span>
     <span class="tooltip-wrap od-week-status${item.status==='review'?' alert-warning':''}" data-status="${item.status}">${icon(statusIcon[item.status])}
     <span class="tooltip" aria-hidden="true">${statusLabels[item.status]}</span>
    </span>
    </span>
    <span class="od-timed-event-copy"><strong class="card-title">${item.title}</strong><span class="card-description">${item.classLabel}</span></span>
   </a>`;
  }

  function weekGrid(isSampleWeek) {
   const dates = sampleWeek.map((_, index) => addDays(first, index));
   const hours = Array.from({length:endHour - firstHour}, (_, index) => firstHour + index);
   const slots = '<span class="od-timetable-slot"></span>'.repeat(hours.length);
   return `<div class="od-timetable">
    <div class="od-timetable-head">
     <div aria-hidden="true"></div>
     ${dates.map(date => `<h3 class="od-timetable-date" ${+date===+today?'aria-current="date"':''}>
      ${dayName.format(date)} ${date.getDate()}
     </h3>`).join('')}
    </div>
    <div class="od-timetable-body" style="--od-marker-position: ${percentOfDay(demoMinute)}%; --od-hour-count: ${hours.length}">
     <div class="od-timetable-hours" aria-hidden="true">
      ${hours.map(hour => `<div class="od-timetable-hour"><span>${hourLabel.format(clockDate(hour * 60))}</span></div>`).join('')}
     </div>
     ${isSampleWeek?'<div class="od-timetable-marker" aria-hidden="true"><span>10:30</span></div>':''}
     ${dates.map((date, index) => `<section class="od-timetable-day" style="grid-column: ${index + 2}" aria-label="${dayName.format(date)}, ${fullDate.format(date)}"
        ${+date===+today?'data-today':''}>
      <div class="od-timetable-slots" aria-hidden="true">${slots}</div>
      ${isSampleWeek?sampleWeek[index].map(timedEvent).join(''):''}
     </section>`).join('')}
    </div>
   </div>`;
  }

  function draw() {
   const last = addDays(first,4);
   calendar.querySelector('[data-week-range]').textContent = shortDate.format(first)+' – '+fullDate.format(last);
   calendar.querySelectorAll('[data-calendar-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.calendarView===view)));
   const days = calendar.querySelector('[data-overview-days]');
   days.dataset.view = view;
   const isSampleWeek = +first===+monday(today);
   if (view==='week') {
    days.innerHTML = weekGrid(isSampleWeek);
    return;
   }
   days.innerHTML = Array.from({length:5},(_,index) => {
    const date = addDays(first,index);
    const items = isSampleWeek ? sampleWeek[index] : [];
    const showCreate = isSampleWeek && index===sampleWeek.length-1;
    if (view==='list' && !items.length && !showCreate) return '';
    const events = showCreate
     ? `<button type="button" class="btn btn-ghost od-week-create" aria-haspopup="dialog" data-week-create>${icon('plus')}<span>Create test</span></button>`
     : items.map(assessmentCard).join('');
    return `<section class="od-week-day card${+date===+today?' card-themed':''}" ${+date===+today?'aria-current="date"':''}>
     <header><h3>${dayName.format(date)} <span>${shortDate.format(date)}</span></h3>
      ${+date===+today?'<span class="badge badge-secondary">Today</span>':''}</header>
     <div class="od-week-events">${events}</div>
    </section>`;
   }).join('') || '<div class="empty-state od-week-empty"><span class="empty-media" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg></span><p class="empty-title">Nothing scheduled</p><p>No assessments are scheduled this week.</p></div>';
  }

  calendar.addEventListener('click', event => {
   const trigger=event.target.closest('[data-overview-event]');
   if(trigger){
    event.preventDefault();
    openPreview(data.events.find(item=>item.id===trigger.dataset.overviewEvent),trigger);
    return;
   }
   const create = event.target.closest('[data-week-create]');
   if (create) {
    window.capOpenAssessmentChoices(create);
    return;
   }
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
 function mount(){
  ready();
  const canvas=document.querySelector('x-dc');
  if(canvas) new MutationObserver(ready).observe(canvas,{childList:true});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount);
 else mount();
})();
