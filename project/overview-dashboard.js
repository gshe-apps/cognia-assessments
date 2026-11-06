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
      '<span class="od-day-number">'+date.getDate()+'</span>'+
      (current?'<span class="od-today-label">Today</span>':'')+
      items.map(item=>'<span class="od-calendar-event is-'+item.kind+'"><span class="od-event-label">'+
        (view==='week' ? item.time || item.marker : item.marker)+'</span>'+
        (view==='week' ? '<span class="od-event-detail">'+item.tileDetail+'</span>' : '')+'</span>').join('')+'</button>';
  }
  function draw() {
    const week = view === 'week';
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
          '<div class="od-agenda-top"><span class="od-agenda-status">'+item.label+'</span>'+(item.time?'<span class="od-agenda-time">'+item.time+'</span>':'')+'</div>'+
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
