(() => {
 function ready() {
  const root = document.querySelector('.od-dashboard');
  if (!root || !root.querySelector('.od-hero') || root.querySelector('[data-overview-days]')) return;
  window.capMountAssessmentCreateMenu(root);

  // Lucide SVG paths, with color inherited from the Cognia icon class.
  const icons = {
   calendar: '<path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />',
   check: '<circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" />',
   clock: '<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
   circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
   left: '<path d="m15 18-6-6 6-6" />',
   right: '<path d="m9 18 6-6-6-6" />',
   expand: '<path d="M15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7" />',
   close: '<path d="m18 6-12 12M6 6l12 12" />',
   arrow: '<path d="M5 12h14m-7-7 7 7-7 7" />',
   play: '<path d="M5 3l14 9-14 9z" />',
   score: '<rect x="3" y="3" width="18" height="18" rx="2" /><path d="m8 12 3 3 5-6" />',
   chart: '<path d="M3 3v18h18M8 16v-3m5 3V9m5 7V5" />',
  fileCheck: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="m9 15 2 2 4-4" />',
  circleDashed: '<path d="M10.1 2.182a10 10 0 0 1 3.8 0" /><path d="M13.9 21.818a10 10 0 0 1-3.8 0" /><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7" /><path d="M2.182 13.9a10 10 0 0 1 0-3.8" /><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69" /><path d="M21.818 10.1a10 10 0 0 1 0 3.8" /><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69" /><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7" />',
  };
  const icon = (name, tone = '') => '<svg class="icon'+(tone ? ' icon-'+tone : '')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>';
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
  let selectedDate = today;
  let view = 'week';

  const workdays = 5;
  const eventsOn = date => data.events.filter(item=>+data.date(item)===+date).sort((a,b)=>a.start-b.start);
  const scoringQueue = 'CAP-T14-ScoringQueue.dc.html';
  const scoring = window.capFractionsScoring;
  const scoringAssessment = data.events.find(item => item.id === 'fractions-check');
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
  hero.querySelector('[data-assessment-create-menu] .btn')?.insertAdjacentHTML('afterbegin','<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>');

  const calendar = root.querySelector('.od-calendar');
  const priorities = root.querySelector('.od-overview-sidebar');

  calendar.innerHTML = `
   <div class="od-week-toolbar">
    <div class="od-date-controls" aria-label="Calendar navigation">
     ${weekButton(-1,'left','Previous week')}
     <h2 class="text-subheading font-semibold" data-week-range aria-live="polite"></h2>
     ${weekButton(1,'right','Next week')}
    </div>
    <div class="button-group button-group-segmented cap-view-toggle od-week-view" role="group" aria-label="Calendar view">
     <button type="button" class="btn btn-ghost" aria-pressed="true" data-calendar-view="week">${icon('calendar')}Week</button>
     <button type="button" class="btn btn-ghost" aria-pressed="false" data-calendar-view="month">${icon('calendar')}Month</button>
    </div>
   </div>
   <div class="od-week-viewport"><div class="od-week-grid" data-overview-days></div></div>`;

  const esc = text => String(text ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const results = data.results;
  const resultsPage = 'CAP-T13-Results.dc.html';
  const assessmentsPage = 'CAP-T03-Assessments.dc.html';

  const taskTypes = {
   draft: {icon:'fileCheck', status:'In progress', tone:'secondary', kind:'assessment', href:'CAP-T03-Assessments.dc.html?view=drafts'},
   assign: {icon:'play', status:'Ready to assign', tone:'secondary', kind:'due'},
   score: {icon:'score', status:'To score', tone:'warning', kind:'task'},
   review: {icon:'chart', status:'Pending review', tone:'secondary', kind:'due', href:'CAP-T13-Results.dc.html'},
   plan: {icon:'calendar', status:'To do', tone:'secondary', kind:'task', href:'CAP-T03-Assessments.dc.html'},
   release: {icon:'circleAlert', status:'High priority', tone:'destructive', kind:'urgent', href:'CAP-T17-FeedbackRelease.dc.html'}
  };
  // Sample work dates use the same offsets as the assessment calendar.
  const taskSchedule = [
   [-14,'review','Review results','Grade 5A Quiz','Grade 5A'],
   [-13,'plan','Review items','Grade 5B Mathematics','Grade 5B'],
   [-11,'assign','Assign test','Algebra · Grade 8','Grade 8','algebra'],
   [-10,'draft','Draft quiz','Fractions · Grade 5A','Grade 5A'],
   [-7,'review','Review results','Grade 6 Mathematics','Grade 6'],
   [-4,'plan','Review & align','Grade 5 · Item bank','Grade 5'],
   [-3,'plan','Review items','Grade 6 Mathematics','Grade 6'],
   [-1,'review','Review feedback','Grade 5A','Grade 5A'],
   [0,'draft','Draft fractions quiz','Grade 5A · Fractions','Grade 5A','assessment-sample-fractions'],
   [0,'assign','Assign algebra test','Grade 8 · Unit 2','Grade 8','algebra'],
   [0,'score','','','Grade 5A','fractions-check'],
   [0,'review','Review results','','Grade 5A','algebra-expressions'],
   [1,'assign','Assign geometry test','Grade 4B · Geometry','Grade 4B','shapes'],
   [1,'score','','','Grade 4B','properties-of-shapes'],
   [1,'draft','Continue a draft','Grade 5A · Mathematics','Grade 5A'],
   [2,'review','Review results','','Grade 7A','unit-4-assessment'],
   [2,'plan','Plan the next assessment','Grade 7B · Mathematics','Grade 7B'],
   [3,'score','','','Grade 6B','reading-comprehension'],
   [4,'release','Release learner feedback','Grade 5A · Fractions check','Grade 5A'],
   [4,'plan','Plan next steps','Grade 5A · Fractions check','Grade 5A'],
   [8,'plan','Plan assessments','Grade 5 · Mathematics','Grade 5'],
   [10,'assign','Assign a quiz','Fractions · Grade 5','Grade 5','fractions'],
   [11,'plan','Review written responses','Grade 6 · Mathematics','Grade 6'],
   [14,'review','Review results','Grade 5A · Unit test','Grade 5A'],
   [15,'draft','Create a test','Ratios · Grade 6','Grade 6'],
   [17,'review','Review feedback','Grade 5B','Grade 5B'],
  ];
  const tasksOn = date => {
   const offset=taskSchedule.filter(([day])=>+addDays(weekStart,day)===+date);
   return offset.flatMap(([,type,title,details,group,ref])=>{
    const task={...taskTypes[type],title,details,group};
    if(type==='score'){
     const test=window.capScoringQueue.tests().find(test=>test.id===ref);
     if(!test)return [];
     return [{...task,title:`Score ${countLabel(test.left,'response')}`,details:`${test.classLabel} · ${test.title}`,href:test.href}];
    }
    if(type==='review'&&ref){
     const result=results.entries.find(entry=>entry.id===ref);
     if(!result||results.isReviewed(result))return [];
     return [{...task,details:`${result.classLabel} · ${result.title}`,href:results.href(result)}];
    }
    if(type==='assign')return [{...task,form:ref,href:'CAP-T21-AssessmentLibrary.dc.html'}];
    if(type==='draft'&&ref){
     const draft=readArchive().find(entry=>entry.id===ref&&entry.status==='draft');
     if(draft)return [{...task,draft:ref,details:`${group} · ${countLabel(draft.model.tests.reduce((sum,test)=>sum+(test.questions?.length||0),0),'item')}`}];
    }
    return [task];
   });
  };
  const taskLink = task => task.form ? `data-overview-assign="${esc(task.form)}"` : task.draft ? `data-restore-work="${esc(task.draft)}"` : '';
  const countLabel = (count,unit) => `${count} ${unit}${count===1?'':'s'}`;
  const mondayOf = date => addDays(date,-((date.getDay()+6)%7));
  function draftPriorities(){
   const schedule=window.capAssignmentSchedule;
   const now=new Date();
   const todayKey=schedule.today(now);
   const tomorrowKey=schedule.earliestDate(now);
   const hoursLeft=schedule.hoursUntilMidnight(now);
   const ordered=readArchive().filter(entry=>entry?.status==='draft'&&entry.model?.tests?.length).map(entry=>{
    const test=entry.model.tests.find(t=>t.id===entry.model.active)||entry.model.tests[0];
    const calendarDraft=data.events.find(event=>entry.id==='calendar-draft-'+event.id);
    const sessionDate=entry.delivery?.sessions?.filter(s=>!s.noLimit&&s.opens)
     .map(s=>s.opens.slice(0,10)).sort()[0];
    const date=sessionDate||(calendarDraft&&schedule.dateKey(data.date(calendarDraft)));
    return {entry,test,date,sessionDate};
   }).sort((a,b)=>{
    // Upcoming deadlines first, then drafts that need a new date, then unscheduled drafts.
    const rank=date=>date?(date>todayKey?0:1):2;
    return rank(a.date)-rank(b.date)||String(a.date||'').localeCompare(String(b.date||''))||
     String(b.entry.updatedAt||'').localeCompare(String(a.entry.updatedAt||''));
   });
   const rows=ordered.map(({entry,test,date,sessionDate},index)=>{
    const overdue=date&&date<=todayKey;
    const deadline=date&&addDays(new Date(date+'T12:00:00'),-1);
    const deadlineKey=deadline&&schedule.dateKey(deadline);
    let status='In draft';
    const tone=['destructive','warning'][index]||'secondary';
    const suggested=index<3&&(overdue||(!sessionDate&&entry.sample));
    if(suggested){
     status=['Finish in 3 hours','By 9 AM tomorrow','Within 2 days'][index];
    }else if(overdue){
     status='Set a new date';
    }else if(deadlineKey===todayKey){
     status=hoursLeft<=4?`Finish in ${countLabel(hoursLeft,'hour')}`:'Due by midnight';
    }else if(deadlineKey===tomorrowKey){
     status='Due tomorrow';
    }else if(deadline){
     status=`Assign by ${shortDate.format(deadline)}`;
    }
    const details=entry.classLabel||(test.grade?'Grade '+test.grade:test.subject);
    return `<li><a class="item od-summary-draft" data-tone="${tone}" href="${assessmentsPage}?view=drafts" data-restore-work="${esc(entry.id)}">
     <span class="item-media item-media-icon">${icon(statusIcon.pencil,tone)}</span>
     <span class="item-content"><span class="item-title">${esc(entry.title||entry.model.title||'Untitled assessment')}</span>
      ${details?`<span class="item-description">${esc(details)}</span>`:''}</span>
     <span class="badge badge-${tone}"${suggested?' title="Suggested time to finish. Choose a future session date before assigning."':''}>
      ${icon(deadline||suggested?'clock':'circleDashed')}${suggested?'<span class="sr-only">Suggested target: </span>':''}${status}
     </span>
     ${icon('right')}
    </a></li>`;
   }).join('');
   const attention=ordered.filter(({date})=>date&&date<=tomorrowKey).map(({entry})=>'draft:'+entry.id);
   return {rows,attention};
  }
  function weeklyPerformance(){
   const goal=6;
   const completed=results.entries
    .filter(entry=>data.date(entry)>=weekStart&&data.date(entry)<=today)
    .sort((a,b)=>a.day-b.day);
   const count=completed.length;
   return {goal,completed,count,coverage:Math.min(100,Math.round(count/goal*100)),remaining:Math.max(0,goal-count)};
  }
  function classPerformance(){
   const {goal,completed,count,coverage,remaining}=weeklyPerformance();
   const points=['6,51',...completed.map((entry,index)=>`${38+entry.day*54},${51-42*Math.min(index+1,goal)/goal}`)];
   const [lastX,lastY]=points.at(-1).split(',');
   const goalX=320,goalY=9;
   return `<section class="card od-overview-summary od-performance" aria-labelledby="od-performance-heading">
    <header class="od-summary-heading">
     <span class="item-media item-media-icon">${icon('chart')}</span>
     <h2 class="item-content text-subheading font-semibold" id="od-performance-heading">Class Performance</h2>
     <button type="button" class="btn btn-ghost btn-icon btn-sm od-summary-link" data-performance-expand aria-label="Expand class performance" aria-haspopup="dialog">${icon('expand')}</button>
    </header>
    <div class="od-performance-chart">
     <div><strong class="text-heading font-bold">${coverage}%</strong><span class="text-body-small text-muted-foreground">Coverage</span></div>
     <svg viewBox="0 0 328 58" preserveAspectRatio="xMaxYMid meet" role="img" aria-label="Weekly progress: ${count} completed of ${goal}. The dashed line leads to the weekly goal.">
      <title>Completed assessments and weekly goal</title>
      <polygon class="od-performance-actual-fill" points="${points.join(' ')} ${lastX},56 6,56"/>
      <polygon class="od-performance-goal-fill" points="${lastX},${lastY} ${goalX},${goalY} ${goalX},56 ${lastX},56"/>
      <polyline class="od-performance-actual" points="${points.join(' ')}"/>
      <line class="od-performance-goal" x1="${lastX}" y1="${lastY}" x2="${goalX}" y2="${goalY}"/>
      ${points.map(point=>{const [x,y]=point.split(',');return `<circle class="od-performance-actual" cx="${x}" cy="${y}" r="2.5"/>`;}).join('')}
      <circle class="od-performance-goal" cx="${goalX}" cy="${goalY}" r="4"/>
     </svg>
    </div>
    <div class="od-performance-footer">
     <p class="text-body-small">${remaining?`<button type="button" class="btn btn-ghost od-performance-create" data-performance-create>Run ${countLabel(remaining,'more assessment')}</button> to strengthen confidence in performance.`:'You reached your assessment goal for this week.'}</p>
     <strong class="text-body-small">${count} of ${goal}</strong>
    </div>
    <div class="progress" role="progressbar" aria-label="Weekly assessment goal" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(goal,count)}" aria-valuetext="${count} of ${goal} assessments completed">
     <div class="progress-indicator" style="--value:${coverage}%"></div>
    </div>
   </section>`;
  }
  function updateDraftFade(list){
   list.toggleAttribute('data-more-below',list.scrollHeight-list.clientHeight-list.scrollTop>1);
  }
  const draftResize=new ResizeObserver(entries=>entries.forEach(({target})=>updateDraftFade(target)));
  function drawPriorities(){
   const draftScrollTop=priorities.querySelector('.od-summary-drafts')?.scrollTop||0;
   const scoringTests=window.capScoringQueue.tests().sort((a,b)=>b.left-a.left);
   const [next]=scoringTests;
   const readyToReview=results.entries.filter(entry=>!results.isReviewed(entry));
   const drafts=draftPriorities();
   window.capOverviewAttention.publish({
    assessments:drafts.attention,
    results:[
     ...scoringTests.flatMap(test=>test.responseIds.map(id=>'score:'+test.id+':'+id)),
     ...readyToReview.map(entry=>'result:'+entry.id)
    ]
   });
   const scoreCount=next?.left||0;
   const reviewCount=readyToReview.length;
   priorities.innerHTML=`
    <section class="od-results-tiles" aria-label="Results">
     <a class="card od-result-tile${next?' od-result-tile-scoring':''}" href="${esc(next?.href||scoringQueue)}">
      <h2 class="text-body-base font-bold">
       <span class="text-heading font-bold od-result-count${next?' text-destructive-value':''}">${scoreCount}</span>
       <span>${scoreCount===1?'Response needs scoring':'Responses need scoring'}</span>
      </h2>
      ${next?`<span class="badge badge-destructive">${icon('clock')}To score</span>`:''}
     </a>
     <a class="card od-result-tile${reviewCount?' od-result-tile-review':''}" href="${resultsPage}">
      <h2 class="text-body-base font-bold">
       <span class="text-heading font-bold od-result-count${reviewCount?' text-success-value':''}">${reviewCount}</span>
       <span>${reviewCount===1?'Assessment ready to review':'Assessments ready to review'}</span>
      </h2>
     </a>
    </section>
    <section class="card od-overview-summary od-assessment-summary" aria-labelledby="od-drafts-heading">
     <header class="od-summary-heading">
      <span class="item-media item-media-icon">${icon('fileCheck')}</span>
      <h2 class="item-content text-subheading font-semibold" id="od-drafts-heading">Drafts</h2>
      <a class="btn btn-ghost btn-icon btn-sm od-summary-link" href="${assessmentsPage}" aria-label="Go to Assessments">${icon('right')}</a>
     </header>
     ${drafts.rows?`<ul class="item-group item-group-divided od-summary-drafts" role="list" aria-label="Assessment drafts" tabindex="0">${drafts.rows}</ul>`:'<p class="text-body-small text-muted-foreground">No drafts.</p>'}
    </section>
    ${classPerformance()}`;
   const list=priorities.querySelector('.od-summary-drafts');
   draftResize.disconnect();
   if(list){
    list.scrollTop=draftScrollTop;
    list.addEventListener('scroll',()=>updateDraftFade(list),{passive:true});
    draftResize.observe(list);
    updateDraftFade(list);
   }
  }

  const firstHour = 8;
  const endHour = 16;
  const percentOfDay = minute => (minute - firstHour * 60) / ((endHour - firstHour) * 60) * 100;
  const clock = new Intl.DateTimeFormat('en-US', {hour:'numeric', minute:'2-digit'});
  const hourLabel = new Intl.DateTimeFormat('en-US', {hour:'numeric'});
  const clockDate = minute => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, minute);
  const timeOf = item => clock.formatRange(clockDate(item.start),clockDate(item.end));
  const info = (label,value) => `<div><dt class="text-body-small text-muted-foreground">${esc(label)}</dt><dd class="text-body-base font-semibold">${esc(value)}</dd></div>`;
  const points = items => items.reduce((total,item)=>total+(Number(item.marks)||1),0);
  function openClassPerformance(trigger){
   const {goal,completed,count,coverage}=weeklyPerformance();
   const summaries=completed.map(entry=>{
    const earned=entry.scores.reduce((sum,[,marks])=>sum+marks.reduce((total,mark)=>total+mark,0),0);
    const available=points(entry.questions)*entry.scores.length;
    return {entry,earned,available};
   });
   const earned=summaries.reduce((sum,row)=>sum+row.earned,0);
   const available=summaries.reduce((sum,row)=>sum+row.available,0);
   const submissions=completed.reduce((sum,entry)=>sum+entry.scores.length,0);
   const dialog=document.createElement('dialog');
   dialog.className='dialog od-performance-dialog';
   dialog.setAttribute('aria-labelledby','od-performance-dialog-title');
   dialog.innerHTML=`
    <header class="dialog-header">
     <h2 class="dialog-title" id="od-performance-dialog-title">Class Performance</h2>
     <button type="button" class="btn btn-ghost btn-icon dialog-close" aria-label="Close class performance">${icon('close')}</button>
     <p class="dialog-description">Week of ${esc(fullDate.format(weekStart))}</p>
    </header>
    <div class="dialog-body">
     <dl class="od-performance-metrics">
      ${info('Weekly coverage',`${coverage}% (${count} of ${goal})`)}
      ${info('Scored submissions',submissions)}
      ${info('Average score',available?`${Math.round(100*earned/available)}%`:'—')}
     </dl>
     <section aria-labelledby="od-performance-completed">
      <h3 class="text-body-base font-semibold" id="od-performance-completed">Completed assessments</h3>
      ${summaries.length?`<div class="item-group">${summaries.map(({entry,earned,available})=>`
       <a class="item item-outline" href="${esc(results.href(entry))}">
        <span class="item-media item-media-icon">${icon('chart')}</span>
        <span class="item-content"><span class="item-title">${esc(entry.title)}</span>
         <span class="item-description">${esc(entry.classLabel)}, ${countLabel(entry.scores.length,'scored submission')}</span></span>
        ${available?`<span class="badge badge-secondary">${Math.round(100*earned/available)}% average</span>`:''}
        ${icon('right')}
       </a>`).join('')}</div>`:'<p class="text-body-small text-muted-foreground">No assessments have been scored this week.</p>'}
     </section>
    </div>
    <footer class="dialog-footer">
     <a class="btn btn-outline" href="${resultsPage}">View all results</a>
     <button type="button" class="btn" data-performance-new>Create assessment</button>
    </footer>`;
   let creating=false;
   dialog.querySelector('.dialog-close').onclick=()=>dialog.close();
   dialog.querySelector('[data-performance-new]').onclick=()=>{creating=true;dialog.close();};
   dialog.addEventListener('close',()=>{
    dialog.remove();
    if(creating){
     window.capOpenNewAssessment(trigger,{onClose:submitted=>{if(!submitted)openClassPerformance(trigger);}});
    }else{
     trigger.focus({preventScroll:true});
    }
   },{once:true});
   root.closest('.theme-assessments').append(dialog);
   dialog.showModal();
  }
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
   if(draft)window.capOverviewAttention.open('draft:'+draft.id);
   if(item.status==='check')window.capOverviewAttention.open('result:'+item.id);
  }

  function monthGrid() {
   const start = new Date(first.getFullYear(), first.getMonth(), 1);
   const daysPerWeek = 7;
   const offset = (start.getDay() + 6) % 7;
   const startsOnWeekend = offset >= workdays;
   const startOfGrid = addDays(start, (startsOnWeekend ? daysPerWeek : 0) - offset);
   const end = new Date(first.getFullYear(), first.getMonth() + 1, 0);
   const rowCount = Math.ceil((offset + end.getDate()) / daysPerWeek) - Number(startsOnWeekend);
   const taskTile = task => `<a class="od-month-event" data-kind="${task.kind}" href="${esc(task.href)}" ${taskLink(task)} title="${esc(task.title)}">
    ${icon(task.icon)}<span class="od-month-event-details"><strong class="od-month-event-title">${esc(task.title)}</strong><span class="od-month-event-meta">${esc(task.group)}</span></span>
   </a>`;
   const eventTile = (item, showDetails = false) => {
    const time = showDetails ? timeOf(item) : '';
    const label = showDetails ? [item.title, time, item.classLabel, statusLabels[item.status]] : [item.title, statusLabels[item.status]];
    return `<a class="od-month-event" data-status="${item.status}" href="${esc(eventLink(item))}" data-overview-event="${esc(item.id)}" aria-haspopup="dialog"
     aria-label="${esc(label.join(', '))}" title="${esc(item.title)}">
     ${icon(statusIcon[item.status])}${showDetails ? `<div class="od-month-event-details">
      <strong class="text-body-small font-semibold">${esc(item.title)}</strong>
      <span class="card-description">${esc(time)}</span>
      <span class="card-description">${esc(item.classLabel)}</span>
     </div>` : `<span class="od-month-event-details"><strong class="od-month-event-title">${esc(item.title)}</strong><span class="od-month-event-meta">${esc(item.classLabel)}</span></span>`}
    </a>`;
   };
   return `<div class="od-month-grid" aria-label="${monthName.format(start)}">
    ${Array.from({length:workdays},(_,index)=>`<div class="od-month-weekday text-body-small" aria-hidden="true">${dayName.format(addDays(startOfGrid,index))}</div>`).join('')}
    ${Array.from({length:rowCount * workdays},(_,index)=>{
     const date = addDays(startOfGrid,Math.floor(index / workdays) * daysPerWeek + index % workdays);
     const inMonth = date.getMonth() === start.getMonth();
     const items = [...tasksOn(date).map(task=>compact=>taskTile(task)), ...eventsOn(date).map(item=>compact=>eventTile(item,!compact))];
     return `<section class="od-month-day${inMonth?'':' od-month-outside'}" data-day-cell="${+date}" data-selected="${+date===+selectedDate}" aria-label="${longDate.format(date)}">
      <div class="od-month-day-head"><button type="button" class="btn btn-ghost btn-xs od-month-date" data-select-date="${+date}" aria-label="${longDate.format(date)}" aria-pressed="${+date===+selectedDate}" ${+date===+today?'aria-current="date"':''}>${date.getDate()}</button>
       ${+date===+today?'<span class="badge od-today-badge">Today</span>':''}</div>
      ${items[0]?.(true)||''}
      ${items.length>1?`<div class="od-month-more">
       <button type="button" class="btn btn-ghost btn-xs" popovertarget="od-month-more-${index}">+${items.length-1} more</button>
       <div class="popover od-month-popover" id="od-month-more-${index}" popover aria-label="More assessments on ${longDate.format(date)}">
        <p class="label">${dayName.format(date)} ${shortDate.format(date)}</p>
        ${items.slice(1).map(render=>render(false)).join('')}
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
   const minute = window.capAssignmentSchedule.minutesOfDay(now);
   const showMarker = dates.some(date => +date===+today) && minute>=firstHour*60 && minute<endHour*60;
   const markerLabel = `${Math.floor(minute/60)}:${String(minute%60).padStart(2,'0')}`;
   return `<div class="od-timetable">
    <div class="od-timetable-head">
     <div aria-hidden="true"></div>
     ${dates.map(date => `<button type="button" class="btn btn-ghost od-timetable-date" data-select-date="${+date}" aria-pressed="${+date===+selectedDate}" ${+date===+today?'aria-current="date"':''}>
      ${dayName.format(date)} ${date.getDate()}
     </button>`).join('')}
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
   calendar.querySelectorAll('[data-week-step]').forEach(button=>{
    const label = (Number(button.dataset.weekStep)<0?'Previous ':'Next ')+view;
    button.setAttribute('aria-label',label);
    button.nextElementSibling.textContent = label;
   });
   calendar.querySelectorAll('[data-calendar-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.calendarView===view)));
   hero.querySelector('[data-overview-intro]').textContent=`Your assessment activity, tasks, and insights for this ${view}.`;
   const days = calendar.querySelector('[data-overview-days]');
   days.dataset.view = view;
   days.innerHTML = view==='month' ? monthGrid() : weekGrid();
   drawPriorities();
  }

  root.addEventListener('click', event => {
   const performanceExpand=event.target.closest('[data-performance-expand]');
   if(performanceExpand){
    openClassPerformance(performanceExpand);
    return;
   }
   const performanceCreate=event.target.closest('[data-performance-create]');
   if(performanceCreate){
    window.capOpenNewAssessment(performanceCreate);
    return;
   }
   const assignment=event.target.closest('[data-overview-assign]');
   if(assignment&&window.capStartLibraryForm){
    event.preventDefault();
    window.capStartLibraryForm(assignment.dataset.overviewAssign,{directAssignment:true});
    return;
   }
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
   const dateButton = event.target.closest('[data-select-date]');
   const cell = event.target.closest('[data-day-cell]');
   if (step) {
    const direction = Number(step.dataset.weekStep);
    first = view==='month' ? new Date(first.getFullYear(),first.getMonth()+direction,1) : addDays(first,7*direction);
    selectedDate=first;
   } else if (toggle && toggle.dataset.calendarView!==view) {
    view=toggle.dataset.calendarView;
    first=view==='week'?mondayOf(selectedDate):selectedDate;
    if(view==='week'&&((selectedDate.getDay()+6)%7)>=workdays)selectedDate=first;
   } else if (dateButton || (cell&&!event.target.closest('a,button,[popover]'))) {
    selectedDate=new Date(Number(dateButton?.dataset.selectDate||cell.dataset.dayCell));
    first=view==='month'?selectedDate:mondayOf(selectedDate);
   }
   else return;
   draw();
   if(dateButton)root.querySelector(`.${view==='month'?'od-month-date':'od-timetable-date'}[data-select-date="${+selectedDate}"]`)?.focus({preventScroll:true});
  });
  window.addEventListener('pageshow',draw);
  window.addEventListener('storage',event=>{
   if(event.key===archiveKey||window.capScoringQueue.isScoreChange(event)||results.entries.some(entry=>results.reviewKey(entry)===event.key))draw();
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
