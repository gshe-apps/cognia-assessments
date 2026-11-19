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
  const monthName = new Intl.DateTimeFormat('en-US', {month:'long', year:'numeric'});
  const longDate = new Intl.DateTimeFormat('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric'});
  let first = weekStart;
  let view = 'week';

  const workdays = 5;
  const eventsOn = date => data.events.filter(item=>+data.date(item)===+date).sort((a,b)=>a.start-b.start);
  const scoringQueue = 'CAP-T14-ScoringQueue.dc.html';
  const scoring = window.capFractionsScoring;
  const eventLink = item => {
   if (item.status==='review') return scoringQueue;
   if (item.status==='pencil') return 'CAP-T03-Assessments.dc.html?view=drafts';
   if (item.status==='check') return data.results.href(item);
   return 'CAP-T09-ConfirmAssignment.dc.html?view=assigned&calendarEvent='+item.id;
  };
  const statusLabels = {
   check: 'Completed',
   review: 'Needs review',
   pending: 'Scheduled',
   pencil: 'Still in draft'
  };
  const statusIcon = {check:'check',review:'circleAlert',pending:'clock',pencil:'circleDashed'};
  const listTone = {check:'success',review:'warning',pending:'theme-light',pencil:'secondary'};
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
    <div class="button-group button-group-segmented od-week-view" role="group" aria-label="Calendar view">
     <button type="button" class="btn btn-ghost" aria-pressed="true" data-calendar-view="week">Week</button>
     <button type="button" class="btn btn-ghost" aria-pressed="false" data-calendar-view="month">Month</button>
    </div>
   </div>
   <div class="od-week-viewport"><div class="od-week-grid" data-overview-days></div></div>`;

  const esc = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const results = data.results;
  const scoringAssessment = data.events.find(item => item.id === 'fractions-check');
  priorities.classList.add('od-desk');
  priorities.innerHTML = `
   <header class="od-priorities-intro"><h2>Today’s priorities</h2></header>
   <div class="od-desk-cards">
   <section class="card od-desk-sheet" aria-labelledby="od-marking-title">
    <div class="od-desk-head">
     <span class="alert alert-warning od-desk-icon" aria-hidden="true">${icon(statusIcon.review)}</span>
     <h3 id="od-marking-title" class="card-title"><a class="card-link od-desk-card-target" href="${scoringQueue}">${esc(scoringAssessment.title)}</a></h3>
     <span class="badge badge-warning" data-scoring-overview-status>Needs review</span>
    </div>
    <div class="od-desk-progress">
     <p class="text-body-small text-muted-foreground" data-scoring-overview-message></p>
     <div class="progress" role="progressbar" aria-label="Items reviewed" aria-valuemax="${scoring.totalItems}" data-scoring-overview-progress><div class="progress-indicator"></div></div>
    </div>
   </section>
   <section aria-label="Drafts" data-overview-draft-stack>
     <article class="card od-desk-sheet" data-draft-sheet>
      <div class="od-desk-head">
       <span class="icon-accent od-desk-icon od-desk-draft-icon" aria-hidden="true">${icon(statusIcon.pencil)}</span>
       <h3 class="card-title">Drafts</h3>
       <div class="od-desk-draft-pages" role="group" aria-label="Browse drafts" data-draft-pages hidden>
        <button type="button" class="btn btn-ghost btn-sm btn-icon" aria-label="Previous draft" data-draft-step="-1">${icon('left')}</button>
        <span class="text-body-small" data-draft-position></span>
        <button type="button" class="btn btn-ghost btn-sm btn-icon" aria-label="Next draft" data-draft-step="1">${icon('right')}</button>
       </div>
      </div>
      <div class="od-desk-entry od-desk-draft-entry" data-draft-entry>
       <h4 class="card-title" data-overview-draft-title aria-live="polite"></h4>
       <div class="od-desk-footer">
        <div class="od-desk-draft-progress">
         <p class="text-body-small text-muted-foreground" data-overview-draft-percent></p>
         <div class="progress" data-overview-draft-progress role="progressbar" aria-label="Draft progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-indicator"></div>
         </div>
        </div>
        <a class="btn btn-ghost btn-sm od-desk-secondary" href="CAP-T03-Assessments.dc.html?view=drafts" data-overview-resume>Finish up</a>
       </div>
      </div>
     </article>
   </section>
   <article class="card od-desk-sheet" aria-labelledby="od-results-ready-title" data-results-ready>
    <div class="od-desk-head">
     <span class="alert alert-success od-desk-icon od-desk-results-icon" aria-hidden="true">${icon(statusIcon.check)}</span>
     <h3 class="card-title" id="od-results-ready-title"><a class="card-link od-desk-card-target" href="CAP-T13-Results.dc.html">Your results are in</a></h3>
    </div>
    <div class="od-desk-entry" data-unreviewed-results>
     <p class="text-body-small" aria-live="polite" aria-atomic="true"><strong class="text-foreground font-semibold" data-results-count></strong> <span data-results-copy></span></p>
    </div>
    <div class="od-desk-results-summary" data-reviewed-results hidden>
     <p class="card-description">You’ve reviewed all results.</p>
     <button type="button" class="btn btn-ghost btn-sm od-desk-secondary" data-dismiss-results-ready>Dismiss</button>
    </div>
   </article>
   </div>`;
  window.capUpdateOverviewDraftStack();

  const scoringStatus = priorities.querySelector('[data-scoring-overview-status]');
  const scoringMessage = priorities.querySelector('[data-scoring-overview-message]');
  const scoringProgress = priorities.querySelector('[data-scoring-overview-progress]');
  function drawScoringProgress() {
   const remaining = scoring.pendingCount();
   const total = scoring.totalItems;
   const reviewed = total - remaining;
   scoringStatus.textContent = remaining ? 'Needs review' : 'Scored';
   scoringStatus.classList.toggle('badge-warning', remaining > 0);
   scoringStatus.classList.toggle('badge-success', remaining === 0);
   scoringMessage.innerHTML = remaining
    ? `<strong class="text-foreground font-semibold">${remaining}</strong> of <strong class="text-foreground font-semibold">${total}</strong> items still outstanding.`
    : `All ${total} items reviewed.`;
   scoringProgress.setAttribute('aria-valuenow', reviewed);
   scoringProgress.setAttribute('aria-valuetext', `${reviewed} of ${total} items reviewed`);
   scoringProgress.style.setProperty('--value', `${reviewed / total * 100}%`);
  }
  drawScoringProgress();
  window.addEventListener('pageshow', drawScoringProgress);
  window.addEventListener('storage', event => {
   if (scoring.isScoreChange(event)) drawScoringProgress();
  });

  const readyCard = priorities.querySelector('[data-results-ready]');
  const unreviewedResults = readyCard.querySelector('[data-unreviewed-results]');
  const resultsCount = readyCard.querySelector('[data-results-count]');
  const resultsCopy = readyCard.querySelector('[data-results-copy]');
  const reviewedResults = readyCard.querySelector('[data-reviewed-results]');
  const resultsRevision = JSON.stringify(results.entries.map(event => [event.id,results.revision(event)]));
  let dismissedHere = false;
  function drawResultsReady() {
   const pending = results.entries.filter(event => !results.isReviewed(event)).length;
   const caughtUp = results.entries.length > 0 && pending === 0;
   readyCard.hidden = !results.entries.length || (caughtUp && (dismissedHere || results.read(results.dismissedKey) === resultsRevision));
   reviewedResults.hidden = !caughtUp;
   unreviewedResults.hidden = !pending;
   if (resultsCount.textContent !== String(pending)) {
    resultsCount.textContent = pending;
    resultsCopy.textContent = pending === 1 ? 'assessment is ready to review.' : 'assessments are ready to review.';
   }
  }
  readyCard.querySelector('[data-dismiss-results-ready]').addEventListener('click', () => {
   dismissedHere = true;
   results.write(results.dismissedKey,resultsRevision);
   drawResultsReady();
   priorities.querySelector('[data-overview-resume]').focus();
  });
  window.addEventListener('pageshow', drawResultsReady);
  window.addEventListener('storage', event => {
   if (!event.key || event.key === results.dismissedKey || results.entries.some(entry => results.reviewKey(entry) === event.key)) drawResultsReady();
  });
  drawResultsReady();

  const firstHour = 8;
  const endHour = 16;
  const percentOfDay = minute => (minute - firstHour * 60) / ((endHour - firstHour) * 60) * 100;
  const clock = new Intl.DateTimeFormat('en-US', {hour:'numeric', minute:'2-digit'});
  const hourLabel = new Intl.DateTimeFormat('en-US', {hour:'numeric'});
  const clockDate = minute => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, minute);
  const timeOf = item => clock.formatRange(clockDate(item.start),clockDate(item.end));
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
    body=`<dl class="od-event-metrics">${info('Written responses to score',item === scoringAssessment ? scoring.pendingCount() : item.responsesToScore)}${info('Learners assigned',item.learnerCount)}</dl>`;
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

  function monthGrid() {
   const start = new Date(first.getFullYear(), first.getMonth(), 1);
   const offset = (start.getDay() + 6) % 7;
   const skipWeekend = offset >= workdays;
   const startOfGrid = addDays(start, (skipWeekend ? 7 : 0) - offset);
   const end = new Date(first.getFullYear(), first.getMonth() + 1, 0);
   const rowCount = Math.ceil((offset + end.getDate()) / 7) - Number(skipWeekend);
   const eventTile = (item, showDetails = false) => {
    const time = showDetails ? timeOf(item) : '';
    const label = showDetails ? [item.title, time, item.classLabel, statusLabels[item.status]] : [item.title, statusLabels[item.status]];
    return `<a class="od-month-event" data-status="${item.status}" href="${esc(eventLink(item))}" data-overview-event="${esc(item.id)}" aria-haspopup="dialog"
     aria-label="${esc(label.join(', '))}" title="${esc(item.title)}">
     ${icon(statusIcon[item.status])}${showDetails ? `<div class="od-month-event-details">
      <strong class="text-body-small font-semibold">${esc(item.title)}</strong>
      <span class="card-description">${esc(time)}</span>
      <span class="card-description">${esc(item.classLabel)}</span>
     </div>` : `<span class="od-month-event-title text-body-small">${esc(item.title)}</span>`}
    </a>`;
   };
   return `<div class="od-month-grid" aria-label="${monthName.format(start)}">
    ${Array.from({length:workdays},(_,index)=>`<div class="od-month-weekday text-body-small" aria-hidden="true">${dayName.format(addDays(startOfGrid,index))}</div>`).join('')}
    ${Array.from({length:rowCount * workdays},(_,index)=>{
     const date = addDays(startOfGrid,Math.floor(index / workdays) * 7 + index % workdays);
     const inMonth = date.getMonth() === start.getMonth();
     const items = inMonth ? eventsOn(date) : [];
     return `<section class="od-month-day${inMonth?'':' od-month-outside'}" aria-label="${longDate.format(date)}">
      <span class="od-month-date text-body-small" ${+date===+today?'aria-current="date"':''}>${date.getDate()}</span>
      ${items.slice(0,2).map(item => eventTile(item)).join('')}
      ${items.length>2?`<div class="od-month-more">
       <button type="button" class="btn btn-ghost btn-sm" popovertarget="od-month-more-${index}">+${items.length-2} more</button>
       <div class="popover od-month-popover" id="od-month-more-${index}" popover aria-label="More assessments on ${longDate.format(date)}">
        <p class="label">${dayName.format(date)} ${shortDate.format(date)}</p>
        ${items.slice(2).map(item => eventTile(item, true)).join('')}
       </div>
      </div>`:''}
     </section>`;
    }).join('')}
   </div>`;
  }

  function timedEvent(item) {
   const top = percentOfDay(item.start);
   const height = percentOfDay(item.end) - top;
   const time = timeOf(item);
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

  function weekGrid() {
   const dates = Array.from({length:workdays}, (_, index) => addDays(first, index));
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
      ${eventsOn(date).map(timedEvent).join('')}
     </section>`).join('')}
    </div>
   </div>`;
  }

  function draw() {
   const last = addDays(first,4);
   calendar.querySelector('[data-week-range]').textContent = view==='month' ? monthName.format(first) : shortDate.format(first)+' – '+fullDate.format(last);
   calendar.querySelector('[data-calendar-today]').setAttribute('aria-label','Return to the current '+view);
   calendar.querySelectorAll('[data-week-step]').forEach(button=>{
    const label = (Number(button.dataset.weekStep)<0?'Previous ':'Next ')+view;
    button.setAttribute('aria-label',label);
    button.nextElementSibling.textContent = label;
   });
   calendar.querySelectorAll('[data-calendar-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.calendarView===view)));
   const days = calendar.querySelector('[data-overview-days]');
   days.dataset.view = view;
   days.innerHTML = view==='month' ? monthGrid() : weekGrid();
  }

  calendar.addEventListener('click', event => {
   const trigger=event.target.closest('[data-overview-event]');
   if(trigger){
    event.preventDefault();
    const overflow = trigger.closest('.od-month-popover');
    const focusReturn = overflow?.previousElementSibling || trigger;
    overflow?.hidePopover();
    openPreview(data.events.find(item=>item.id===trigger.dataset.overviewEvent),focusReturn);
    return;
   }
   const step = event.target.closest('[data-week-step]');
   const toggle = event.target.closest('[data-calendar-view]');
   if (step) {
    const direction = Number(step.dataset.weekStep);
    first = view==='month' ? new Date(first.getFullYear(),first.getMonth()+direction,1) : addDays(first,7*direction);
   } else if (toggle && toggle.dataset.calendarView!==view) {
    const nextView = toggle.dataset.calendarView;
    if (nextView==='week' && first.getDay()!==1) {
     first = monthName.format(first)===monthName.format(today) ? weekStart : addDays(first,(8-first.getDay())%7);
    }
    view = nextView;
   } else if (event.target.closest('[data-calendar-today]')) first = view==='month' ? today : weekStart;
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
