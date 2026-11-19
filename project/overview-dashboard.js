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
   list: '<path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />',
   circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
   left: '<path d="m15 18-6-6 6-6" />',
   right: '<path d="m9 18 6-6-6-6" />',
   dots: '<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />',
   close: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
   file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" />',
   circleDashed: '<path d="M10.1 2.182a10 10 0 0 1 3.8 0" /><path d="M13.9 21.818a10 10 0 0 1-3.8 0" /><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7" /><path d="M2.182 13.9a10 10 0 0 1 0-3.8" /><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69" /><path d="M21.818 10.1a10 10 0 0 1 0 3.8" /><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69" /><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7" />',
   plus: '<path d="M5 12h14" /><path d="M12 5v14" />',
   users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" />'
  };
  const icon = name => '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>';
  const weekButton = (step, direction, label) => `<span class="tooltip-wrap">
   <button type="button" class="btn btn-ghost btn-icon" data-week-step="${step}" aria-label="${label}">${icon(direction)}</button>
   <span class="tooltip" role="tooltip" aria-hidden="true">${label}</span>
  </span>`;
  const data = window.capOverviewCalendar;
  const {today, weekStart, addDays} = data;
  const dayName = new Intl.DateTimeFormat('en-US', {weekday:'short'});
  const shortDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric'});
  const fullDate = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'});
  let first = weekStart;
  let view = 'week';

  const sampleWeek = Array.from({length:5},(_,day)=>data.events.filter(item=>item.day===day));
  const scoringQueue = 'CAP-T14-ScoringQueue.dc.html';
  const eventLink = item => {
   if (item.status==='review') return scoringQueue;
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
  const listTone = {check:'success',review:'warning',pending:'theme-light',pencil:'secondary'};
  const cardLabel = item => item.status==='review' ? statusLabels.review : item.type;
  const hero = root.querySelector('.od-hero');
  const title = hero.querySelector('h1');
  title.textContent = 'Good afternoon, Sara';
  const heading = document.createElement('div');
  title.before(heading);
  heading.append(title);

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
    <div class="button-group button-group-segmented od-week-view" role="group" aria-label="Overview layout">
     <button type="button" class="btn btn-ghost btn-icon" aria-label="Calendar view" title="Calendar view" aria-pressed="true" data-calendar-view="week">${icon('calendar')}</button>
     <button type="button" class="btn btn-ghost btn-icon" aria-label="List view" title="List view" aria-pressed="false" data-calendar-view="list">${icon('list')}</button>
    </div>
   </div>
   <div class="od-week-viewport"><div class="od-week-grid" data-overview-days></div></div>`;

  const completed = data.events.filter(item=>item.status==='check');
  const priorityMenu = (id, label, href, action) => `<div class="dropdown dropdown-end">
   <button type="button" id="od-${id}-trigger" class="btn btn-ghost btn-icon btn-xs" aria-label="${label}" aria-haspopup="menu" aria-expanded="false" aria-controls="od-${id}-menu">${icon('dots')}</button>
   <div class="menu" role="menu" id="od-${id}-menu" aria-labelledby="od-${id}-trigger" hidden><a class="menu-item" role="menuitem" tabindex="-1" href="${href}">${action}</a></div>
  </div>`;
  priorities.classList.add('od-desk');
  priorities.innerHTML = `
   <header class="od-priorities-intro"><h2>Today’s priorities</h2></header>
   <div class="od-desk-cards">
   <section class="card od-desk-sheet" aria-labelledby="od-marking-title">
    <div class="od-desk-head">
     <span class="alert alert-warning od-desk-icon" aria-hidden="true">${icon(statusIcon.review)}</span>
     <h3 id="od-marking-title" class="card-title">Scoring queue</h3>
     <span class="badge badge-warning">Needs review</span>
    </div>
    <div class="od-desk-metrics">
     <p class="od-desk-quantity text-muted-foreground"><strong class="text-heading text-foreground font-semibold">2</strong> <span>tests</span></p>
     <div class="od-desk-progress">
      <p class="text-muted-foreground"><strong class="text-body-base text-foreground font-semibold">68%</strong> reviewed</p>
      <div class="progress" role="progressbar" aria-label="Responses reviewed" aria-valuenow="68" style="--value:68%"><div class="progress-indicator"></div></div>
     </div>
    </div>
    <a class="btn btn-outline" href="${scoringQueue}">Open scoring queue</a>
   </section>
   <section aria-label="Drafts" data-overview-draft-stack>
     <article class="card od-desk-sheet" data-draft-sheet>
      <div class="od-desk-head">
       <span class="icon-accent od-desk-icon od-desk-draft-icon" aria-hidden="true">${icon('file')}</span>
       <h3 class="card-title">Drafts</h3>
       <div class="od-desk-actions">
       <div class="od-desk-pager" data-draft-pager>
        <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Previous draft" data-draft-step="-1">${icon('left')}</button>
        <span class="text-body-small" data-draft-position></span>
        <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Next draft" data-draft-step="1">${icon('right')}</button>
       </div>
       ${priorityMenu('drafts','Draft options','CAP-T03-Assessments.dc.html?view=drafts','View all drafts')}
       </div>
      </div>
      <div class="od-desk-entry od-desk-draft-entry" data-draft-entry>
      <div class="od-desk-entry-heading">
       <h4 class="card-title" data-overview-draft-title aria-live="polite"></h4>
       <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Hide draft from overview" data-dismiss-draft>${icon('close')}</button>
      </div>
      <div class="od-desk-footer">
       <div class="od-desk-draft-step" data-overview-draft-progress>
        <div class="progress" data-draft-meter role="progressbar" aria-label="Draft progress" aria-valuemin="0" aria-valuemax="4"><div class="progress-indicator"></div></div>
        <p class="card-description" data-overview-draft-phase></p>
       </div>
       <a class="btn btn-ghost btn-sm od-desk-secondary" href="CAP-T03-Assessments.dc.html?view=drafts" data-overview-resume>Continue draft</a>
      </div>
      </div>
     </article>
   </section>
   <article class="card od-desk-sheet od-desk-completed" aria-labelledby="od-completed-title">
    <div class="od-desk-head">
     <span class="alert alert-success od-desk-icon" aria-hidden="true">${icon(statusIcon.check)}</span>
     <h3 class="card-title" id="od-completed-title">Completed</h3>
     <div class="od-desk-actions">
      <div class="od-desk-pager" ${completed.length<2?'hidden':''}>
       <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Previous completed test" data-completed-step="-1">${icon('left')}</button>
       <span class="text-body-small" data-completed-position aria-live="polite"></span>
       <button type="button" class="btn btn-ghost btn-icon btn-xs" aria-label="Next completed test" data-completed-step="1">${icon('right')}</button>
      </div>
      ${priorityMenu('completed','Completed test options','CAP-T13-Results.dc.html','View all results')}
     </div>
    </div>
    <div class="od-desk-entry od-desk-results">
     <div aria-live="polite"><p class="card-description" data-completed-class></p><h4 class="card-title" data-completed-name></h4><p class="card-description" data-completed-meta></p></div>
     <a class="btn btn-ghost btn-sm od-desk-secondary" data-completed-results>View results</a>
    </div>
   </article>
   </div>`;
  window.capUpdateOverviewDraftStack();
  const completedCard = priorities.querySelector('.od-desk-completed');
  const completedButtons = [...completedCard.querySelectorAll('[data-completed-step]')];
  let completedIndex = 0;
  function showCompleted() {
   const entry = completed[completedIndex];
   completedCard.querySelector('[data-completed-position]').textContent = `${completedIndex+1} of ${completed.length}`;
   completedCard.querySelector('[data-completed-name]').textContent = entry.title;
   completedCard.querySelector('[data-completed-class]').textContent = entry.classLabel;
   completedCard.querySelector('[data-completed-meta]').textContent = `${entry.scores.length} learners`;
   const link = completedCard.querySelector('[data-completed-results]');
   link.href = eventLink(entry);
   link.setAttribute('aria-label',`View results for ${entry.title}`);
   completedButtons[0].disabled = completedIndex === 0;
   completedButtons[1].disabled = completedIndex === completed.length-1;
  }
  completedButtons.forEach(button=>button.addEventListener('click',()=>{
   completedIndex += Number(button.dataset.completedStep);
   showCompleted();
   if (button.disabled) completedButtons.find(control=>!control.disabled)?.focus();
  }));
  showCompleted();

  const firstHour = 8;
  const endHour = 16;
  const percentOfDay = minute => (minute - firstHour * 60) / ((endHour - firstHour) * 60) * 100;
  const clock = new Intl.DateTimeFormat('en-US', {hour:'numeric', minute:'2-digit'});
  const hourLabel = new Intl.DateTimeFormat('en-US', {hour:'numeric'});
  const clockDate = minute => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, minute);
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
    heading='Scoring queue'; tone='warning';
    body=`<dl class="od-event-metrics">${info('Written responses to score',item.responsesToScore)}${info('Learners assigned',item.learnerCount)}</dl>`;
    action=`<a class="btn btn-lg" href="${eventLink(item)}">Open scoring queue</a>`;
   } else if(item.status==='pencil'){
    heading='Draft progress'; tone='secondary';
    const model=data.assessment(item), id='assessment-'+model.active;
    draft=readArchive().find(entry=>entry.id===id&&entry.status==='draft') || {id,title:item.title,status:'draft',step:1,model};
    const questions=draft.model.tests.flatMap(test=>test.questions||[]);
    const step=draft.step===2?2:1;
    body=`<section class="od-event-draft card"><div class="card-content">
     <p class="text-body-small text-muted-foreground">Step ${step} of 4</p>
     <h3 class="text-body-base font-semibold">${step===2?'Review':'Add your items'}</h3>
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
    action=`<a class="btn btn-lg" href="${eventLink(item)}">Review test</a>`;
   }
   const dialog=document.createElement('dialog');
   dialog.className='dialog od-event-preview';
   dialog.setAttribute('aria-labelledby','od-event-title');
   dialog.innerHTML=`<div class="dialog-header">
    <h2 class="dialog-title" id="od-event-title" tabindex="-1" autofocus>${esc(draft?.title||item.title)}</h2>
    <button class="btn btn-ghost btn-icon dialog-close" type="button" aria-label="Close preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
    <p class="dialog-description">${esc(item.type)} test for ${esc(item.classLabel)}${draft?'':', '+esc(date)}</p>
   </div>
   <div class="dialog-body">
    <div class="od-event-summary"><h3 class="text-body-base font-semibold">${heading}</h3><span class="badge badge-${tone}">${draft?'Draft':statusLabels[item.status]}</span></div>
    ${body}
    <p class="text-body-small text-muted-foreground">Sample test</p>
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
   const status = `<span class="tooltip-wrap od-week-status${item.status==='review'?' alert-warning':''}" data-status="${item.status}">${icon(statusIcon[item.status])}
    <span class="tooltip" aria-hidden="true">${statusLabels[item.status]}</span>
   </span>`;
   if (item.end - item.start <= 30) return `<a class="od-timed-event od-timed-event-plain od-timed-event-short" data-status="${item.status}" href="${eventLink(item)}" data-overview-event="${item.id}" aria-haspopup="dialog"
     style="--od-event-start: ${top}%; --od-event-duration: ${height}%"
     aria-label="${item.title}, ${item.type}, ${item.classLabel}, ${time}, ${statusLabels[item.status]}">
    <span class="od-timed-event-copy"><strong class="card-title od-timed-event-line">${item.title}</strong>${status}</span>
    <span class="hover-card" aria-hidden="true">
     <span class="badge badge-${listTone[item.status]} od-event-hover-badge">${statusLabels[item.status]}</span>
     <strong class="card-title od-event-hover-title">${item.title}</strong>
     <span class="od-event-hover-row"><span class="card-description">Time</span><span>${time}</span></span>
     <span class="od-event-hover-row"><span class="card-description">Class</span><span>${item.classLabel}</span></span>
    </span>
   </a>`;
   return `<a class="od-timed-event od-timed-event-plain" data-status="${item.status}" href="${eventLink(item)}" data-overview-event="${item.id}" aria-haspopup="dialog"
     style="--od-event-start: ${top}%; --od-event-duration: ${height}%"
     aria-label="${item.title}, ${item.type}, ${item.classLabel}, ${time}, ${statusLabels[item.status]}">
    <span class="od-timed-event-copy"><strong class="card-title">${item.title}</strong>${status}<span class="card-description">${item.classLabel}</span></span>
   </a>`;
  }

  function weekGrid(isSampleWeek) {
   const dates = sampleWeek.map((_, index) => addDays(first, index));
   const hours = Array.from({length:endHour - firstHour}, (_, index) => firstHour + index);
   const slots = '<span class="od-timetable-slot"></span>'.repeat(hours.length);
   const now = new Date();
   const minute = now.getHours()*60 + now.getMinutes();
   const showMarker = dates.some(date => +date===+today) && minute>=firstHour*60 && minute<endHour*60;
   const markerLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
   return `<div class="od-timetable">
    <div class="od-timetable-head">
     <div aria-hidden="true"></div>
     ${dates.map(date => `<h3 class="od-timetable-date" ${+date===+today?'aria-current="date"':''}>
      ${dayName.format(date)} ${date.getDate()}
     </h3>`).join('')}
    </div>
    <div class="od-timetable-body" style="--od-marker-position: ${percentOfDay(minute)}%; --od-hour-count: ${hours.length}">
     <div class="od-timetable-hours" aria-hidden="true">
      ${hours.map(hour => `<div class="od-timetable-hour"><span>${hourLabel.format(clockDate(hour * 60))}</span></div>`).join('')}
     </div>
     ${showMarker?`<div class="od-timetable-marker" aria-hidden="true"><span>${markerLabel}</span></div>`:''}
     ${dates.map((date, index) => `<section class="od-timetable-day" style="grid-column: ${index + 2}" aria-label="${dayName.format(date)}, ${fullDate.format(date)}"
        ${showMarker && +date===+today?'data-today':''}>
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
   const isSampleWeek = +first===+weekStart;
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
     ? `<button type="button" class="btn btn-ghost od-week-create" aria-haspopup="dialog" data-week-create>${icon('plus')}<span>Create new</span></button>`
     : items.map(assessmentCard).join('');
    return `<section class="od-week-day card${+date===+today?' card-themed':''}" ${+date===+today?'aria-current="date"':''}>
     <header><h3>${dayName.format(date)} <span>${shortDate.format(date)}</span></h3>
      ${+date===+today?'<span class="badge badge-secondary">Today</span>':''}</header>
     <div class="od-week-events">${events}</div>
    </section>`;
   }).join('') || '<div class="empty-state od-week-empty"><span class="empty-media" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg></span><p class="empty-title">Nothing scheduled</p><p>No tests are scheduled this week.</p></div>';
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
   else if (event.target.closest('[data-calendar-today]')) first = weekStart;
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
