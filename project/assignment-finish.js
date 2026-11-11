/* Final assignment screens, confined to the local prototype draft. */
document.addEventListener('DOMContentLoaded',()=>{
 const file=location.pathname.split('/').pop(),confirm=file==='CAP-T09-ConfirmAssignment.dc.html',success=file==='CAP-T10-Scheduled.dc.html';if(!confirm&&!success)return;
 const read=(key,f={})=>{try{return JSON.parse(localStorage.getItem(key))||f}catch{return f}},esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const draft=read('cogniaAssessmentTestsV1',{tests:[]}),m=success?read('cogniaScheduledAssessmentTests',draft):draft,d=read('cogniaDeliverySessions',{recipients:[],sessions:[]}),tests=m.tests||[],t=tests.find(t=>t.id===m.active)||tests[0]||{},qs=tests.flatMap(t=>t.questions||[]),marks=qs.reduce((n,q)=>n+Number(q.marks||1),0),sessions=d.sessions||[],students=d.recipients?.length||0,settings=m.settings||{};
 const classLabel=delivery=>(delivery.classIds?.length?delivery.classIds:[delivery.classId]).map(id=>id==='5b'?'Grade 5B':'Grade 5A').join(', ');
 const className=classLabel(d);
 const svg=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>',icons={file:svg('<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/>'),users:svg('<circle cx="9" cy="7" r="3"/><circle cx="18" cy="8" r="2"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 13a5 5 0 0 1 5 5v3"/>'),calendar:svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>'),clock:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),check:svg('<path d="m6 12 4 4 8-9"/>'),circle:svg('<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>'),pen:svg('<path d="m4 20 1-5L17 3l4 4L9 19zM14 6l4 4"/>'),bookmark:svg('<path d="M5 3h14v18l-7-5-7 5z"/>'),mail:svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'),chart:svg('<path d="M5 20v-6h3v6zM11 20V9h3v11zM17 20V4h3v16z"/>')};
 const dates=value=>{if(!value)return 'Not set';const date=new Date(value.slice(0,10)+'T12:00:00');return Number.isNaN(date.getTime())?'Not set':new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(date)};
 const questionRows=()=>qs.map((q,i)=>`<div class="af-question-row"><span>${i+1}</span><p>${esc(q.stem)}</p><span class="af-question-type badge badge-secondary">${esc(q.displayType||({'Text entry':'Short answer','Extended text':'Extended response'}[q.type]||q.type))}</span><span class="badge badge-secondary">${q.marks||1} ${(q.marks||1)===1?'point':'points'}</span></div>`).join('')||'<p class="af-muted">No questions have been added.</p>';
 const studentName=id=>{const names={'5a':['Aiden Brooks','Amara Singh','Ben Clarke','Chloe Martin','Daniel Kim','Emma Lewis'],'5b':['Finn Adams','Grace Chen','Hannah Davis','Isaac Evans']};const [c,i]=String(id).split(':');return names[c]?.[i]||id};
 const audience=()=>`<div class="af-audience-grid"><div>${icons.users}<span><small>Class</small><b>${className}</b></span></div><div>${icons.users}<span><small>Students</small><b>${students} students</b></span></div>${sessions.map((s,i)=>`<div>${icons.calendar}<span><small>${sessions.length===1?'Session':'Session '+(i+1)}</small><b>${s.noLimit?'Any time':dates(s.opens)}</b></span></div><div>${icons.clock}<span><small>${sessions.length===1?'Time':'Time '+(i+1)}</small><b>${s.noLimit?'No time limit':esc(s.opens?.slice(11,16))+'–'+esc(s.due?.slice(11,16))}</b></span></div>${d.allocationVersion===1?`<div><span><small>Assigned to ${esc(s.name)}</small><b>${(s.recipients||[]).length} students</b><span>${(s.recipients||[]).map(id=>esc(studentName(id))).join(', ')}</span></span></div>`:''}`).join('')}</div>`;
 const studentCount=count=>count+' student'+(count===1?'':'s');
 const page=document.querySelector('main>.page');if(!page)return;page.classList.add('af-page');document.body.classList.add('af-body');
 if(confirm){page.classList.add('af-confirm');const hero=page.querySelector('.tf-hero');if(hero){hero.querySelector('h1').textContent='Review and confirm';hero.querySelector('p')?.remove();const progress=page.querySelector('.tf-steps');if(progress){window.capRenderAssessmentProgress(progress,4,[
  'href="CAP-T04-Setup.dc.html"','href="CAP-T05-Questions.dc.html"',
  'href="CAP-T06-Review.dc.html?stage=details"','href="CAP-T08-AudienceDelivery.dc.html"'
 ]);hero.append(progress)}page.querySelector('.tf-top')?.remove();}
 /* 4/4 Finalize, Figma CAP 1514:5780: centred column with the test card stack, the items of the
    test in front, audience and session tiles and the assessment settings list.
    With several tests the other tests fan out behind; choosing one brings it to the front. */
 const grid=page.querySelector('.reviewgrid'),error=page.querySelector('#confirmError');grid.className='af-review';
 const count=(n,word)=>n+' '+word+(n===1?'':'s');
 const pointsOf=test=>(test.questions||[]).reduce((n,q)=>n+Number(q.marks||1),0);
 const typeOf=q=>q.displayType||({'Text entry':'Short answer','Extended text':'Extended response'}[q.type]||q.type||'Item');
 const plain={'One attempt only':'1','2 attempts':'2','3 attempts':'3','Allowed':'Yes','Not allowed':'No','None':'No limit'};
 const show=v=>plain[v]||String(v).replace(/ minutes?$/,' min');
 const attempts=settings.attempts||(d.attempts==='2'?'2 attempts':d.attempts==='3'?'3 attempts':'One attempt only');
 const settingRows=[['Attempts',attempts],['Show results',settings.results||'After submission'],['Item order',settings.questionOrder||'As created'],['Answer option order',settings.optionOrder||'As created'],['Calculator allowed?',settings.calculator||'Not allowed'],['Notes allowed?',settings.notes||'Not allowed'],['Time limit',settings.limit||d.time||'5 minutes']];
 const visibleItems=3;let front=Math.max(0,tests.indexOf(t)),expanded=false;
 const cardRows=test=>[['Grade / Year','Year '+(test.grade||'5')],['Subject',test.subject||'Mathematics'],['Number of items',(test.questions||[]).length],['Total points',pointsOf(test)]].map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+esc(b)+'</dd></div>').join('');
 const itemRow=(q,i)=>'<li class="af-item"><span class="af-item-number">'+(i+1)+'</span><div class="af-item-body"><div class="af-item-meta"><span class="text-body-small">'+esc(typeOf(q))+'</span><span class="badge badge-secondary">'+count(Number(q.marks||1),'point')+'</span></div><p>'+esc(q.stem)+'</p></div></li>';
 const sessionTile=(s,i)=>{const n=((d.allocationVersion===1?s.recipients:d.recipients)||[]).length;const time=s.noLimit?'Any time':(s.opens?.slice(11,16)||'Not set')+' - '+(s.due?.slice(11,16)||'Not set');return '<div class="af-tile af-session"><div><span>'+esc(s.name||'Session '+(i+1))+'</span><span class="badge badge-outline">'+count(n,'student')+'</span></div><div><b>'+esc(s.noLimit?'No set date':dates(s.opens))+'</b><b>'+esc(time)+'</b></div></div>'};
 /* Shuffle: the chosen card lifts out from behind and drops in front, while the old front card
    sinks to the back. Positions come from layout offsets, so rotation does not skew the maths. */
 const shuffle=prev=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const nf=grid.querySelector('.af-test-card-front'),nb=grid.querySelector('[data-af-test="'+prev+'"]');if(!nf||!nb||!nf.animate)return;
  const dx=nb.offsetLeft-nf.offsetLeft,dy=nb.offsetTop-nf.offsetTop,rest=getComputedStyle(nb).transform,frontBg=getComputedStyle(nf).backgroundColor,backBg=getComputedStyle(nb).backgroundColor,frontInk=getComputedStyle(nf).color,backInk=getComputedStyle(nb).color;
  const timing={duration:600,easing:'linear'},ease='cubic-bezier(.3,.7,.3,1)';
  nf.animate([
   {transform:'translate('+dx+'px,'+dy+'px) '+rest,transformOrigin:'bottom left',zIndex:0,backgroundColor:backBg,color:backInk,easing:ease},
   {offset:.45,transform:'translate('+(dx*.55+24)+'px,'+(dy-84)+'px) rotate(5deg)',transformOrigin:'bottom left',zIndex:0,easing:ease},
   {offset:.46,zIndex:2,easing:ease},
   {transform:'rotate(-4deg)',transformOrigin:'bottom center',zIndex:2,backgroundColor:frontBg,color:frontInk}
  ],timing);
  nb.animate([
   {transform:'translate('+(-dx)+'px,'+(-dy)+'px) rotate(-4deg)',transformOrigin:'bottom center',zIndex:2,backgroundColor:frontBg,color:frontInk,easing:ease},
   {offset:.45,transform:'translate('+(-dx*.45-20)+'px,'+(-dy+18)+'px) rotate(-7deg)',transformOrigin:'bottom center',zIndex:2,easing:ease},
   {offset:.46,zIndex:0,easing:ease},
   {transform:rest,transformOrigin:'bottom left',zIndex:0,backgroundColor:backBg,color:backInk}
  ],timing);
 };
 const render=()=>{
  const active=tests[front]||{},items=active.questions||[],others=tests.map((x,i)=>i).filter(i=>i!==front).slice(0,2);
  grid.innerHTML='<p class="af-review-title text-body-base">'+esc(m.title||active.title||'New classroom assessment')+'</p>'
  +'<div class="af-stack'+(others.length?' has-others':'')+'">'
  +others.map((i,n)=>'<button type="button" class="af-test-card af-test-card-behind" style="--af-fan:'+(n+1)+'" data-af-test="'+i+'" aria-label="Show '+esc(tests[i].title||'Test '+(i+1))+'"><h3>'+esc(tests[i].title||'Test '+(i+1))+'</h3><dl>'+cardRows(tests[i])+'</dl></button>').reverse().join('')
  +'<section class="af-test-card af-test-card-front" aria-labelledby="af-front-title"><h3 id="af-front-title">'+esc(active.title||'Test '+(front+1))+'</h3><dl>'+cardRows(active)+'</dl></section></div>'
  +'<section class="af-items card" aria-labelledby="af-items-title"><h3 id="af-items-title" class="text-body-base font-semibold">Items included ('+items.length+')</h3>'
  +(items.length?'<ol class="af-item-list">'+items.map((q,i)=>i<visibleItems||expanded?itemRow(q,i):'').join('')+'</ol>':'<p class="af-muted">No items have been added.</p>')
  +(items.length>visibleItems?'<button type="button" class="btn btn-ghost btn-sm af-more" aria-expanded="'+expanded+'">'+(expanded?'Show fewer items':'View more items')+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg></button>':'')+'</section>'
  +'<section class="af-block" aria-labelledby="af-audience-title"><h3 id="af-audience-title" class="text-body-base font-semibold">Audience and session</h3><div class="af-tiles"><div class="af-tile af-classes"><span>'+(className.includes(',')?'Classes':'Class')+'</span><b>'+esc(className)+'</b></div><div class="af-tile af-students"><span>Students</span><b>'+students+'</b></div></div>'+sessions.map(sessionTile).join('')+'</section>'
  +'<section class="af-block" aria-labelledby="af-settings-title"><h3 id="af-settings-title" class="text-body-base font-semibold">Assessment settings</h3><dl class="af-settings-list">'+settingRows.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+esc(show(b))+'</dd></div>').join('')+'</dl></section><div data-af-error></div>';
  if(error)grid.querySelector('[data-af-error]').append(error);
  grid.querySelectorAll('[data-af-test]').forEach(b=>b.onclick=()=>{const prev=front;front=Number(b.dataset.afTest);expanded=false;render();shuffle(prev);grid.querySelector('[data-af-test="'+prev+'"]')?.focus({preventScroll:true})});
  const more=grid.querySelector('.af-more');if(more)more.onclick=()=>{expanded=!expanded;render();grid.querySelector('.af-more')?.focus()};
 };
 render();
 const bar=page.querySelector('.actionbar'),back=bar.querySelector('a:not(.solid)'),cta=bar.querySelector('a.solid');back.textContent='Back';back.href='CAP-T08-AudienceDelivery.dc.html';cta.textContent='Create assessment';page.querySelectorAll(':scope>.assessment-test-list,:scope>.tf-test-disclosure').forEach(e=>e.hidden=true);
 }

 function renderSuccess(container, modal){
 const delivery=read('cogniaDeliverySessions',d),sessions=delivery.sessions||[],students=delivery.recipients?.length||0,className=classLabel(delivery);
 Object.assign(icons,{layers:svg('<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>'),plus:svg('<path d="M12 5v14M5 12h14"/>'),home:svg('<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z"/>'),arrow:svg('<path d="M5 12h14m-6-6 6 6-6 6"/>')});
 const title=m.title||t.title||'Your assessment',subjects=[...new Set(tests.map(test=>test.subject).filter(Boolean))],grades=[...new Set(tests.map(test=>test.grade).filter(Boolean))];
 const savedDuration=tests.reduce((sum,test)=>{const minutes=Number(String(test.details?.duration||'').split(' ')[0]);return sum+(Number.isFinite(minutes)?minutes:0)},0),estimatedMinutes=savedDuration||qs.length*2;
 const firstSession=[...sessions].filter(s=>!s.noLimit&&s.opens).sort((a,b)=>a.opens.localeCompare(b.opens))[0],today=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),availability=sessions.length&&sessions.every(s=>s.noLimit)?'Available anytime':firstSession?(firstSession.opens.slice(0,10)===today?'Available today':'Available '+dates(firstSession.opens)):'Session not set';
 const metric=(ic,label,value)=>'<div class="as-metric"><span class="as-metric-icon">'+icons[ic]+'</span><span><small>'+label+'</small><strong>'+esc(value)+'</strong></span></div>';
 const heading=modal?'<span class="as-ready-check">'+icons.check+'</span><h2 id="as-ready-title">Your assessment is ready</h2>':'<h1>Your assessment is ready</h1>';
 container.innerHTML='<header class="as-hero">'+heading+'<p id="as-ready-description">'+esc(title)+' has been assigned to '+esc(className)+'.</p></header><section class="as-overview" aria-labelledby="as-assessment-title"><svg class="as-card-wave" viewBox="0 0 900 240" preserveAspectRatio="none" aria-hidden="true"><path d="M400 0C600 210 720 180 900 20V0Z"/><path d="M580 0C760 150 800 240 900 190V0Z"/></svg><div class="as-overview-content"><div class="as-overview-heading"><span>Assessment overview</span><button type="button" data-view-assessment>View assessment</button></div><h2 id="as-assessment-title">'+esc(title)+'</h2><div class="as-metrics">'+metric('layers','Subject',subjects.length>1?'Mixed subjects':subjects[0]||'Not set')+metric('users','Grade level',grades.length>1?'Multiple grades':'Grade '+(grades[0]||'5'))+metric('file','Items',qs.length)+metric('clock','Estimated time',estimatedMinutes?estimatedMinutes+' min':'Not set')+'</div><div class="as-delivery"><div>'+icons.users+'<strong>'+students+' '+(students===1?'student':'students')+'</strong></div><div>'+icons.calendar+'<strong>'+esc(availability)+'</strong></div></div></div></section><nav class="as-next-actions" aria-label="Next steps"><a href="CAP-T13-Results.dc.html">'+icons.chart+'<span>View results</span>'+icons.arrow+'</a><a href="CAP-T04-Setup.dc.html">'+icons.plus+'<span>Create another</span>'+icons.arrow+'</a><a href="CAP-T01-Overview.dc.html">'+icons.home+'<span>Go to home</span>'+icons.arrow+'</a></nav>';

 if(modal){container.querySelector('.as-card-wave').remove();container.querySelector('[data-view-assessment]').remove();container.querySelector('.as-overview-heading span').textContent='Assessment';return;}
 container.querySelector('[data-view-assessment]').onclick=()=>{const dialog=document.createElement('dialog');dialog.className='af-assigned-dialog dialog';dialog.innerHTML=`<button type="button" aria-label="Close assessment details">×</button><h2>${esc(m.title||'Assigned assessment')}</h2><p class="af-muted">Assigned · ${className} · ${students} students · ${sessions.length} sessions</p><h3>Included questions</h3>${questionRows()}<h3>Audience and sessions</h3>${audience()}<a class="af-primary btn btn-lg" href="CAP-T13-Results.dc.html">View progress and results →</a>`;document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.remove();dialog.oncancel=()=>dialog.remove();dialog.showModal()};
 }

 if(success){
  page.classList.add('af-success');
  renderSuccess(page,false);
  return;
 }

 function openSuccess(){
  if(document.querySelector('.as-created-dialog'))return;
  const dialog=document.createElement('dialog');
  /* Figma CAP 1480:11324: compact "Assessment created" alert with two equal actions.
     It fades and lifts in, the check circle pops and the tick draws itself (educator.css). */
  dialog.className='as-created-dialog dialog';
  dialog.setAttribute('aria-labelledby','as-created-title');
  dialog.setAttribute('aria-describedby','as-created-description');
  const delivery=read('cogniaDeliverySessions',d);
  dialog.innerHTML='<span class="as-created-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M20 6 9 17l-5-5"/></svg></span>'
   +'<div class="as-created-copy"><h2 class="text-body-base font-semibold" id="as-created-title">Assessment created</h2>'
   +'<p class="text-body-small" id="as-created-description">'+esc(m.title||t.title||'Your assessment')+' has been created for '+esc(classLabel(delivery))+'</p></div>'
   +'<div class="as-created-actions"><button type="button" class="btn btn-outline btn-lg" data-create-another>Create another</button><a class="btn btn-lg" href="CAP-T03-Assessments.dc.html">Go to assessments</a></div>';
  dialog.addEventListener('cancel',event=>event.preventDefault());
  /* Create another: stay on this page and swap the success alert for the setup modal.
     Cancelling setup brings the success alert back. */
  dialog.querySelector('[data-create-another]').onclick=()=>{
   if(!window.capOpenNewAssessment)return void(location.href='CAP-T03-Assessments.dc.html');
   const swap=()=>{dialog.close();dialog.remove();window.capOpenNewAssessment(page.querySelector('.tf-bottom .solid')||page,{onClose:submitted=>{if(!submitted)openSuccess()}})};
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)return swap();
   dialog.classList.add('is-closing');setTimeout(swap,200);
  };
  page.closest('.cap-root').append(dialog);
  dialog.showModal();
 }

 // Run after the recipient validator and the assignment persistence listeners.
 window.addEventListener('click',event=>{
  const confirmLink=event.target.closest('.af-confirm a[href="CAP-T10-Scheduled.dc.html"]');
  if(!confirmLink||event.defaultPrevented)return;
  event.preventDefault();
  history.replaceState({...history.state,capConfirmedAssessment:t.id},'');
  openSuccess();
 });
 if(t.id&&history.state?.capConfirmedAssessment===t.id)openSuccess();
});
