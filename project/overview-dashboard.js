(()=>{function ready(){const root=document.querySelector('.od-dashboard');if(!root)return;window.capMountAssessmentCreateMenu(root);const modal=document.createElement('dialog');modal.className='od-create-dialog dialog';modal.setAttribute('aria-labelledby','od-create-title');modal.innerHTML='<div class="od-dialog-header"><h2 id="od-create-title">Create an assessment</h2><button type="button" data-close-create aria-label="Close">&times;</button></div><p>Choose how you would like to begin.</p><div class="od-create-options"><a href="CAP-T05-Questions.dc.html" data-create-path="scratch"><strong>Create from scratch</strong><span>Set up a new assessment and add your items.</span><span aria-hidden="true">&rarr;</span></a><a href="CAP-T05-Questions.dc.html" data-create-path="library"><strong>Use assessment library</strong><span>Start with an existing assessment.</span><span aria-hidden="true">&rarr;</span></a></div><button type="button" class="od-dialog-cancel" data-close-create>Cancel</button>';root.append(modal);let trigger;root.addEventListener('click',e=>{const opener=e.target.closest('.od-empty-day .od-button');if(opener){e.preventDefault();trigger=opener;modal.showModal()}if(e.target.closest('[data-close-create]'))modal.close();const choice=e.target.closest('[data-create-path]');if(choice){Object.keys(sessionStorage).filter(key=>key.startsWith('capCreateConfirmed:')||key.startsWith('capCreateCollapsed:')).forEach(key=>sessionStorage.removeItem(key));sessionStorage.setItem('capOverviewCreationPath',choice.dataset.createPath);}});modal.addEventListener('close',()=>trigger?.focus());modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
  const today = new Date(2026, 10, 3);
  let selected = today;
  let visible = today;
  let view = 'week';
  const dateLabel = new Intl.DateTimeFormat('en-GB', {weekday:'long', day:'numeric', month:'long'});
  const monthLabel = new Intl.DateTimeFormat('en-GB', {month:'long', year:'numeric'});
  const compactDate = new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short'});
  const days = root.querySelector('.od-days');
  const calendarPanel = root.querySelector('.od-month-panel');
  const sessions = [
    {time:'09:00', className:'7A', students:24},
    {time:'10:30', className:'7B', students:26},
    {time:'13:00', className:'7C', students:24}
  ].map(({time, className, students}) => ({
    kind:'scheduled', label:'Scheduled', marker:time+' · '+className, title:'Ratios and proportions',
    detail:'Class '+className+' · '+students+' students', href:'CAP-T10-Scheduled.dc.html',
    action:'View '+time+' session for Class '+className, actionLabel:'View session', time, tileDetail:'Class '+className
  }));
  const updates = [
    {kind:'review', label:'Needs review', marker:'Review', tileDetail:'6 to score', title:'Fractions check', detail:'Class 7B · 6 to score', href:'CAP-T14-ScoringQueue.dc.html', action:'Open scoring for Fractions check', actionLabel:'Open scoring'},
    {kind:'completed', label:'Completed', marker:'Completed', tileDetail:'48 scored', title:'Fractions check', detail:'Classes 7A and 7C · 48 scored', href:'CAP-T13-Results.dc.html', action:'View results for Fractions check', actionLabel:'View results'}
  ];
  // Reference layout: weekly planning beside compact, live priority cards.
  const uiIcon=path=>'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const nextIcon=uiIcon('<path d="M5 12h14m-6-6 6 6-6 6"/>');
  const modalClose=modal.querySelector('.od-dialog-header button');modalClose.className='btn btn-ghost btn-icon btn-sm';modalClose.innerHTML=uiIcon('<path d="M18 6 6 18M6 6l12 12"/>');modal.querySelector('.od-dialog-cancel').className='btn btn-ghost btn-lg';
  const hero=root.querySelector('.od-hero'),heroTitle=hero.querySelector('h1'),heroCopy=document.createElement('div');
  heroTitle.textContent='This week in assessments';heroTitle.before(heroCopy);heroCopy.append(heroTitle);
  const calendar=root.querySelector('.od-calendar'),priorities=root.querySelector('.od-folder-grid'),layout=document.createElement('div');
  layout.className='od-overview-layout';hero.after(layout);layout.append(calendar,priorities);calendar.classList.add('card');
  const heading=document.createElement('header');heading.className='od-calendar-heading card card-themed';
  const calendarTitle=calendar.querySelector(':scope > h2');calendarTitle.textContent='Plan ahead and see what’s scheduled';
  const titleBlock=document.createElement('div');titleBlock.className='od-calendar-intro';titleBlock.innerHTML=uiIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')+'<div></div>';titleBlock.querySelector('div').prepend(calendarTitle);
  const controls=calendar.querySelector('.od-date-controls'),previous=controls.querySelector('[data-month-step="-1"]'),next=controls.querySelector('[data-month-step="1"]'),period=controls.querySelector('[data-month-title]');
  controls.insertBefore(period,next);
  for(const [button,path] of [[previous,'m15 18-6-6 6-6'],[next,'m9 18 6-6-6-6']]){button.className='btn btn-ghost btn-icon btn-sm';button.innerHTML=uiIcon('<path d="'+path+'"/>');}
  controls.querySelector('[data-calendar-today]').className='btn btn-outline btn-sm';heading.append(titleBlock,controls);
  const viewToggle=calendar.querySelector('.od-view-toggle'),legend=calendar.querySelector('.od-calendar-key'),footer=document.createElement('div');footer.className='od-calendar-footer';footer.append(legend,viewToggle);
  const agenda=calendar.querySelector('.od-day-panel'),agendaDetails=document.createElement('div');agendaDetails.className='od-selected-details';agendaDetails.hidden=true;agendaDetails.append(agenda);
  const body=calendar.querySelector('.od-month-panel');body.classList.add('od-calendar-body');body.querySelector('.od-month-heading').remove();
  calendar.replaceChildren(heading,body,footer,agendaDetails);
  for(const card of priorities.querySelectorAll('.od-folder')){
   card.classList.add('card','card-themed');card.querySelectorAll('.od-folder-back,.od-papers').forEach(el=>el.remove());
   const title=card.querySelector('.od-folder-tab');title.classList.add('text-body-base','font-semibold');title.querySelector('span').classList.add('badge','badge-secondary');
   for(const pager of card.querySelectorAll('[data-draft-step]')){pager.className='btn btn-ghost btn-icon btn-sm';pager.innerHTML=uiIcon('<path d="'+(pager.dataset.draftStep==='-1'?'m15 18-6-6 6-6':'m9 18 6-6-6-6')+'"/>');}
   const old=card.querySelector('.od-folder-face'),action=old.cloneNode(false),content=document.createElement('div');content.className='od-folder-face card';
   while(old.firstChild)content.append(old.firstChild);old.replaceWith(content);action.className='btn btn-outline btn-sm';action.removeAttribute('aria-labelledby');
   const extra=document.createElement('div');extra.className='od-priority-details';extra.hidden=true;extra.innerHTML='<div class="accordion-content"></div>';
   if(card.classList.contains('od-review')){for(const node of title.childNodes)if(node.nodeType===3)node.textContent='Assessments awaiting scoring ';action.innerHTML='Open scoring'+nextIcon;action.setAttribute('aria-label','Open scoring for Fractions check');content.querySelector('.od-entry p').textContent=updates[0].detail;extra.lastElementChild.append(content.querySelector('.od-score-summary'));}
   else if(card.classList.contains('od-draft')){for(const node of title.childNodes)if(node.nodeType===3)node.textContent='Continue working on drafts ';action.innerHTML='Resume draft'+nextIcon;action.setAttribute('aria-label','Resume draft');extra.lastElementChild.append(card.querySelector('.od-draft-pager'),content.querySelector('.od-draft-progress'));}
   else{for(const node of title.childNodes)if(node.nodeType===3)node.textContent='Recent results / completed ';action.innerHTML='View results'+nextIcon;extra.lastElementChild.append(content.querySelector('.od-completion'));const copy=document.createElement('div');copy.className='od-card-heading';copy.innerHTML='<div class="od-entry"><div><h3>'+updates[1].title+'</h3><p>'+updates[1].detail+'</p></div></div>';content.prepend(copy);}
   content.querySelector('.od-entry > svg')?.remove();content.append(action);card.append(content,extra);card.querySelector('.od-draft-content')?.remove();
  }
  const eventsFor = date => {
    if (date.toDateString() === today.toDateString()) return updates;
    if (date.toDateString() === new Date(2026, 10, 4).toDateString()) return sessions;
    return [];
  };
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate()+days);
  const startWeek = date => addDays(date, -((date.getDay()+6)%7));
  const dateKey = date => [date.getFullYear(), date.getMonth(), date.getDate()].join(':');
  function dateButton(date) {
    const items = eventsFor(date);
    const current = dateKey(date) === dateKey(today);
    const label = dateLabel.format(date)+(current?', today':'')+(items.length?', '+items.map(item=>item.marker).join(', '):'');
    return '<button type="button" data-day="'+dateKey(date)+'" aria-label="'+label+'" aria-pressed="'+(dateKey(date)===dateKey(selected))+'">'+
      '<span class="od-day-heading"><span class="od-day-name">'+new Intl.DateTimeFormat('en-GB',{weekday:'short'}).format(date)+'</span><span class="od-day-number">'+date.getDate()+'</span></span>'+
      (current?'<span class="od-today-label">Today</span>':'')+
      items.map(item=>'<span class="od-calendar-event is-'+item.kind+'"><span class="od-event-label">'+
        (view==='week' ? item.time || item.marker : item.marker)+'</span>'+
        (view==='week' ? '<span class="od-event-detail">'+item.tileDetail+'</span>' : '')+'</span>').join('')+'</button>';
  }
  function draw() {
    const week = view === 'week';
    calendarTitle.textContent='Plan ahead and see what’s scheduled';
    const first = week ? startWeek(visible) : new Date(visible.getFullYear(), visible.getMonth(), 1);
    const count = week ? 7 : new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
    const offset = week ? 0 : (first.getDay()+6)%7;
    const last = addDays(first, 6);
    calendarPanel.dataset.view = view;
    root.querySelector('[data-month-title]').textContent = week
      ? (first.getMonth()===last.getMonth() ? first.getDate()+'–'+last.getDate()+' '+monthLabel.format(last) : compactDate.format(first)+' – '+compactDate.format(last)+' '+last.getFullYear())
      : monthLabel.format(first);
    root.querySelectorAll('[data-calendar-view]').forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.calendarView===view)));
    root.querySelectorAll('[data-month-step]').forEach(button=>button.setAttribute('aria-label',(button.dataset.monthStep==='-1'?'Previous ':'Next ')+view));
    days.innerHTML = '<span></span>'.repeat(offset)+Array.from({length:count},(_,i)=>dateButton(addDays(first,i))).join('')+'<span></span>'.repeat((7-(offset+count)%7)%7);
    const items = eventsFor(selected);
    root.querySelector('[data-selected-date]').textContent = dateLabel.format(selected);
    root.querySelector('[data-session-total]').textContent = items===sessions?'3 scheduled sessions':items===updates?'2 assessment updates':'No scheduled sessions';
    root.querySelector('[data-day-sessions]').innerHTML = items.length
      ? items.map(item=>'<a class="od-agenda-card is-'+item.kind+'" href="'+item.href+'" aria-label="'+item.action+'">'+
          '<div class="od-agenda-top"><span class="od-agenda-status badge badge-'+({completed:'success',review:'warning'}[item.kind]||'info')+'">'+item.label+'</span>'+(item.time?'<span class="od-agenda-time">'+item.time+'</span>':'')+'</div>'+
          '<div class="od-agenda-content"><div><h3>'+item.title+'</h3><p>'+item.detail+'</p></div><span class="od-agenda-arrow" aria-hidden="true">'+item.actionLabel+' &rarr;</span></div></a>').join('')
      : '<div class="od-empty-day"><h3>No assessments scheduled</h3><p>Create an assessment to get started.</p><a class="od-button btn btn-lg" href="CAP-T05-Questions.dc.html">+ Add assessment</a></div>';
  }
  root.addEventListener('click', event => {
    const step = event.target.closest('[data-month-step]');
    const day = event.target.closest('[data-day]');
    const toggle = event.target.closest('[data-calendar-view]');
    if (step) {
      const direction = Number(step.dataset.monthStep);
      visible = view==='week' ? addDays(visible,7*direction) : new Date(visible.getFullYear(),visible.getMonth()+direction,1);
      selected = visible;
    } else if (day) {
      selected = new Date(...day.dataset.day.split(':').map(Number));
    } else if (toggle) {
      view = toggle.dataset.calendarView;
      visible = selected;
    } else if (event.target.closest('[data-calendar-today]')) {
      visible = selected = today;
    } else return;
    draw();

    if (day) days.querySelector('[aria-pressed="true"]')?.focus();
  });
  draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready()})();
