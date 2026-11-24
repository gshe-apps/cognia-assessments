document.addEventListener('DOMContentLoaded',()=>{
 if(!location.pathname.endsWith('CAP-T03-Assessments.dc.html'))return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
 const paths={layers:'<path d="m12.83 2.18 8.6 3.91a1 1 0 0 1 0 1.82l-8.6 3.91a2 2 0 0 1-1.66 0l-8.6-3.91a1 1 0 0 1 0-1.82l8.6-3.91a2 2 0 0 1 1.66 0Z"/><path d="m2 12 9.17 4.18a2 2 0 0 0 1.66 0L22 12M2 17l9.17 4.18a2 2 0 0 0 1.66 0L22 17"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',right:'<path d="m9 18 6-6-6-6"/>',left:'<path d="m15 18-6-6 6-6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>'};
 Object.assign(paths,{
  more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  edit:'<path d="m14.5 5.5 4 4M5 19l4-.8L20 7a2.8 2.8 0 0 0-4-4L5 14l-1 5Z"/>',
  trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6m5 4v7m4-7v7"/>',
  filter:'<path d="M3 4h18l-7 8v6l-4 2v-8Z"/>',
  eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  divide:'<circle cx="12" cy="6" r="1"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1"/>',
  variable:'<path d="M8 21s-4-3-4-9 4-9 4-9m8 18s4-3 4-9-4-9-4-9m-7 6 6 6m0-6-6 6"/>',
  book:'<path d="M12 7v14m0-14C9 4 5 4 2 5v14c3-1 7-1 10 2 3-3 7-3 10-2V5c-3-1-7-1-10 2Z"/>',
  shapes:'<path d="M8.3 6.4a.7.7 0 0 1 1.4 0l3.6 6.2a.7.7 0 0 1-.6 1H5.3a.7.7 0 0 1-.6-1Z"/><circle cx="16.5" cy="15.5" r="3.5"/>',
  ruler:'<path d="m3 16 13-13a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L8 21a2 2 0 0 1-3 0l-2-2a2 2 0 0 1 0-3Zm10-10 2 2m-6 2 2 2m-6 2 2 2"/>',
  chart:'<path d="M3 3v18h18M8 16v-3m4 3V8m4 8v-5m4 5V5"/>',
  percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  calculator:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8m-8 5h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4M8 19h.01M12 19h.01"/>'
 });
 const libraryTopics={
  fractions:['divide',2],
  'fractions-mastery':['divide',2],
  algebra:['variable',1],
  reading:['book',2],
  shapes:['shapes',1],
  measurement:['ruler',2],
  'data-graphics':['chart',2],
  'ratio-proportion':['percent',2],
  'word-problems':['calculator',2]
 };
 const icon=n=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n]||paths.file}</svg>`;
 const questionsOf=test=>test.questions||test.items||[];
 const forms=[...(window.cogniaAssessmentForms||[]),...(window.cogniaAssessmentTemplates||[])];
 const library=forms.map(f=>({id:f.id,title:f.title,grade:f.grade,subject:f.subject,tests:[f]}));
 const fractions=forms.find(form=>form.id==='fractions');
 if(fractions&&questionsOf(fractions).length>1){
  const questions=questionsOf(fractions);
  const halfway=Math.ceil(questions.length/2);
  const extra=fractions.items?.find(item=>item.tier==='basic'&&!questions.some(question=>question.id===item.id));
  const tests=[
   {...fractions,title:'Fractions: Practice',questions:questions.slice(0,halfway)},
   {...fractions,title:'Fractions: Quick check',questions:questions.slice(halfway)}
  ];
  if(extra)tests.push({...fractions,title:'Fractions: Extra practice',questions:[extra]});
  library.unshift({id:'fractions-mastery',title:'Fractions Mastery',grade:fractions.grade,subject:fractions.subject,
   tests});
 }
 const params=new URLSearchParams(location.search);
 const archiveKey='cogniaAssessmentArchiveV1';
 const sampleChangesKey='cogniaAssessmentCatalogueSampleChanges';
 const activeModelKey='cogniaAssessmentTestsV1';
 let active=['cognia','library'].includes(params.get('view'))?'library':'mine',term='',status=params.get('view')==='drafts'?'draft':params.get('view')==='completed'?'completed':params.get('view')==='banked'?'banked':'all',selected=library[0]?.id,ownRows=[];
 let subjectFilter='',gradeFilter='';
 if(library.some(a=>a.id===params.get('assessment')))selected=params.get('assessment');
 const plural=(n,w)=>n+' '+w+(n===1?'':'s');
 const date=v=>{if(!v)return 'Not scheduled';const d=v instanceof Date?v:new Date(v);return Number.isNaN(d.getTime())?'Not scheduled':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d)};
 function calendarModel(event){
  const form=(window.cogniaAssessmentForms||[]).find(f=>f.title===event.title);
  const items=form?.items||form?.questions||[];
  const questions=event.questions||(event.id==='fractions-check'?[...items.slice(0,3),...items.filter(q=>q.type==='Extended text').slice(0,1)]:items);
  return window.capOverviewCalendar.assessment({...event,questions});
 }
 function assessments(){
  const rows=read(archiveKey,[]).filter(e=>e.model?.tests?.length).map(e=>({id:e.id,title:e.title||e.model.title,grade:e.model.tests[0].grade,tests:e.model.tests,status:e.status==='assigned'?'scheduled':e.status,entry:e,classLabel:e.classLabel||e.delivery?.className,date:e.status==='assigned'?e.delivery?.sessions?.[0]?.opens:null,session:e.status==='assigned'?e.delivery?.sessions?.[0]?.name:null,learners:e.status==='assigned'?(e.delivery?.recipients?.length||0):0}));
  const cal=window.capOverviewCalendar;
  const sampleChanges=read(sampleChangesKey,{});
  if(cal)for(const event of cal.events.filter(e=>['check','review','pending'].includes(e.status)).slice(0,6)){
   if(sampleChanges[event.id]===null||rows.some(r=>(r.entry?.catalogueOriginalTitle||r.title)===event.title&&r.status!=='draft'))continue;
   rows.push({id:'calendar-'+event.id,title:sampleChanges[event.id]??event.title,grade:event.grade,tests:calendarModel(event).tests,status:event.status==='check'?'completed':'scheduled',event,classLabel:event.classLabel,date:cal.date(event),session:'Session 1',learners:event.learnerCount||event.scores?.length||6,href:event.status==='check'?cal.results.href(event):'CAP-T09-ConfirmAssignment.dc.html?view=assigned&calendarEvent='+encodeURIComponent(event.id)});
  }return rows;
 }
 const search=(id,label)=>`<div class="search search-md" role="search">${icon('search').replace('class="icon"','class="search-icon"')}<input class="input search-input" id="${id}" type="search" aria-label="${label}" placeholder="${label}" autocomplete="off"></div>`;
 const page=document.querySelector('main>.page');if(!page)return;page.className='page assessments-workspace';
 page.innerHTML=`<header class="assessments-page-heading">
  <div><h1 class="text-heading font-semibold">Assessments</h1><p class="text-body-base text-muted-foreground">Find your recent assessments or build new ones from our library.</p></div>
  <div data-assessment-create-menu></div>
 </header>
 <div class="assessments-toolbar">
  <div class="button-group button-group-segmented cap-view-toggle" role="tablist" aria-label="Assessment source">
   <button type="button" class="btn btn-ghost" id="assessment-tab-mine" role="tab" aria-controls="assessment-panel-mine" data-source="mine">${icon('file')}My assessments</button>
   <button type="button" class="btn btn-ghost" id="assessment-tab-library" role="tab" aria-controls="assessment-panel-library" data-source="library">${icon('layers')}Assessment library</button>
  </div>
  <span class="select-wrap" data-mine-status><select class="select" aria-label="Assessment status" id="assessment-status"><option value="all">All statuses</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="banked">Banked</option></select></span>
 </div>
 <section id="assessment-panel-mine" role="tabpanel" aria-labelledby="assessment-tab-mine">
  <ul class="my-assessments-grid" id="assessment-cards" role="list"></ul>
  <div id="assessment-empty" class="empty-state" role="status" hidden><span class="empty-media">${icon('filter')}</span><p class="empty-title">No assessments match</p><button class="btn btn-outline" type="button" data-clear>Clear filter</button></div>
 </section>
 <section class="assessments-library-layout" id="assessment-panel-library" role="tabpanel" aria-labelledby="assessment-tab-library" hidden>
  <aside class="assessments-library-browser" aria-label="Ready-to-use assessments">
   <div class="assessments-library-search-row">${search('assessment-library-search','Search assessments')}
    <div class="popover-wrap"><button class="btn btn-ghost btn-icon btn-lg assessments-library-filter-trigger" type="button" aria-label="Filter assessments" aria-haspopup="dialog" aria-expanded="false" aria-controls="assessment-library-filters">${icon('filter')}</button>
     <div class="popover popover-end" id="assessment-library-filters" role="dialog" aria-label="Filter assessments" hidden>
      <label class="field"><span class="label">Subject</span><span class="select-wrap"><select class="select" data-library-filter="subject"><option value="">All subjects</option>${[...new Set(library.map(a=>a.subject))].sort().map(s=>`<option>${esc(s)}</option>`).join('')}</select></span></label>
      <label class="field"><span class="label">Grade level</span><span class="select-wrap"><select class="select" data-library-filter="grade"><option value="">All grades</option>${[...new Set(library.map(a=>a.grade))].sort().map(g=>`<option value="${esc(g)}">Grade ${esc(g)}</option>`).join('')}</select></span></label>
      <button class="btn btn-ghost" type="button" data-clear-library>Clear filters</button>
     </div>
    </div>
   </div>
   <div class="item-group" id="assessment-library-list" role="radiogroup" aria-label="Assessments to preview"></div>
  </aside>
  <section class="card" id="assessment-preview-card" aria-label="Assessment preview"><div class="card-content assessments-library-detail" id="assessment-library-detail"></div></section>
 </section>`;
 window.capMountAssessmentCreateMenu(page);const $=s=>page.querySelector(s);
 const libraryList=$('#assessment-library-list');
 function updateLibraryFade(){
  libraryList.toggleAttribute('data-more-below',libraryList.scrollHeight-libraryList.clientHeight-libraryList.scrollTop>1);
 }
 libraryList.addEventListener('scroll',updateLibraryFade,{passive:true});
 new ResizeObserver(updateLibraryFade).observe(libraryList);
 function setTab(value){active=value;term='';$('#assessment-library-search').value='';$('[data-mine-status]').hidden=active!=='mine';page.querySelectorAll('[data-source]').forEach(b=>{const on=b.dataset.source===active;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});$('#assessment-panel-mine').hidden=active!=='mine';$('#assessment-panel-library').hidden=active!=='library';const u=new URL(location.href);if(active==='library')u.searchParams.set('view','library');else if(['cognia','library'].includes(u.searchParams.get('view')))u.searchParams.delete('view');history.replaceState(null,'',u);draw()}
 function openAssessment(row){if(!row)return;if(row.entry&&window.capOpenSaved)return window.capOpenSaved(row.id);if(row.event)localStorage.setItem('cogniaScheduledAssessmentTests',JSON.stringify(calendarModel(row.event)));location.href=row.href||'CAP-T06-Review.dc.html'}
 function assessmentAction(row,trigger,remove){
  const dialog=document.createElement('dialog');
  dialog.className='dialog dialog-sm';
  dialog.setAttribute('aria-labelledby','assessment-action-title');
  if(remove){
   dialog.setAttribute('role','alertdialog');
   dialog.setAttribute('aria-describedby','assessment-delete-description');
  }
  const title=remove?'Delete assessment?':'Edit assessment';
  const body=remove
   ?`<p class="dialog-description" id="assessment-delete-description">“${esc(row.title)}” will be removed from My assessments.</p>`
   :`<div class="field"><label class="label" for="assessment-edit-title">Assessment title</label><input class="input" id="assessment-edit-title" name="title" value="${esc(row.title)}" required></div>`;
  dialog.innerHTML=`<div class="dialog-header"><h2 class="dialog-title" id="assessment-action-title">${title}</h2></div>
   <form><div class="dialog-body">${body}<p class="text-body-small" role="alert" hidden>Couldn’t save this change. Try again.</p></div>
   <div class="dialog-footer"><button class="btn btn-ghost btn-lg dialog-close" type="button" ${remove?'autofocus':''}>Cancel</button>
   <button class="btn btn-lg${remove?' btn-destructive':''}" type="submit">${remove?'Delete assessment':'Save changes'}</button></div></form>`;
  page.append(dialog);
  const name=dialog.querySelector('[name="title"]');
  let saved=false;
  const position=[...$('#assessment-cards').children].indexOf(trigger.closest('.my-assessment-sheet'));
  dialog.addEventListener('close',()=>{
   dialog.remove();
   if(!saved){trigger.focus();return;}
   const actions=$('#assessment-cards').querySelectorAll('[data-assessment-actions]');
   (actions[Math.min(position,actions.length-1)]||$('#assessment-status')).focus();
  },{once:true});
  dialog.querySelector('form').onsubmit=event=>{
   event.preventDefault();
   const newTitle=name?.value.trim();
   if(!remove&&!newTitle){name.value='';name.reportValidity();return;}
   try{
    if(row.event){
     localStorage.setItem(sampleChangesKey,JSON.stringify({...read(sampleChangesKey,{}),[row.event.id]:remove?null:newTitle}));
    }else{
     const archive=read(archiveKey,[]);
     const entries=remove?archive.filter(entry=>entry.id!==row.id):archive.map(entry=>entry.id===row.id
      ?{...entry,title:newTitle,catalogueOriginalTitle:entry.catalogueOriginalTitle||row.title,model:{...entry.model,title:newTitle}}
      :entry);
     const current=read(activeModelKey,null);
     if(remove&&row.status==='draft'&&current?.tests?.length&&
      (row.id==='assessment-'+current.tests.map(test=>test.id).join('-')||
       JSON.stringify(current.tests.map(test=>test.id))===JSON.stringify(row.tests.map(test=>test.id)))){
      localStorage.removeItem(activeModelKey);
     }
     localStorage.setItem(archiveKey,JSON.stringify(entries));
    }
   }catch{dialog.querySelector('[role="alert"]').hidden=false;return;}
   saved=true;
   drawMine();
   dialog.close();
  };
  dialog.showModal();
  name?.focus();
 }
 function modal(title,body,trigger){const d=document.createElement('dialog');d.className='dialog assessment-preview-dialog';d.setAttribute('aria-label',title);d.innerHTML=`<div class="dialog-header"><h2 class="dialog-title">${esc(title)}</h2><button class="btn btn-ghost btn-icon dialog-close" aria-label="Close preview">${icon('close')}</button></div><div class="dialog-body">${body}</div>`;page.append(d);d.querySelector('.dialog-close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>{d.remove();trigger?.focus()});d.showModal();return d}
 function preview(test,trigger){let index=0;const questions=test.questions||test.items||[],d=modal(test.title,'<div data-question></div>',trigger),footer=document.createElement('div');footer.className='dialog-footer';footer.innerHTML=`<button class="btn btn-outline" data-prev>${icon('left')}Previous</button><span class="text-body-small text-muted-foreground" data-position aria-live="polite"></span><button class="btn" data-next>Next${icon('right').replace('class="icon"','')}</button>`;d.append(footer);
  function drawQuestion(){const q=questions[index];d.querySelector('[data-question]').innerHTML=q?`<div class="assessment-question-heading"><h3 class="text-body-base font-semibold">${esc(q.stem)}</h3></div><div class="item-group assessment-preview-options">${(q.options||[]).map((o,i)=>`<div class="item item-outline"><span class="badge badge-secondary">${String.fromCharCode(65+i)}</span><span class="text-body-base">${esc(o)}</span></div>`).join('')||`<div class="item item-muted"><p class="text-body-small">${q.type==='Extended text'?'Learners write an extended response.':'Learners enter their answer.'}</p></div>`}</div>`:'<p>No items in this test yet.</p>';d.querySelector('[data-position]').textContent=questions.length?'Item '+(index+1)+' of '+questions.length:'No items';d.querySelector('[data-prev]').disabled=index===0;d.querySelector('[data-next]').disabled=index>=questions.length-1}
  d.querySelector('[data-prev]').onclick=()=>{index--;drawQuestion()};d.querySelector('[data-next]').onclick=()=>{index++;drawQuestion()};drawQuestion();
 }
 function drawMine(){
  ownRows=assessments();
  const matches=ownRows.filter(row=>status==='all'||row.status===status);
  const rows=matches.slice(0,8);
  if(status==='all'&&!rows.some(row=>row.status==='scheduled')){
   const scheduled=matches.find(row=>row.status==='scheduled');
   if(scheduled)rows.splice(Math.min(2,rows.length),0,scheduled);
   rows.splice(8);
  }
  $('#assessment-empty').hidden=!!rows.length;
  $('#assessment-status').value=status;
  $('#assessment-cards').innerHTML=rows.map(row=>{
   const label={draft:'Draft',scheduled:'Scheduled',completed:'Completed',banked:'Banked'}[row.status]||row.status;
   const tone={completed:'success',scheduled:'info'}[row.status]||'secondary';
   const openLabel=row.status==='completed'?'View results':'Open assessment';
   const testCount=plural(row.tests.length,'test');
   const grade=row.classLabel||(row.grade?'Grade '+row.grade:'');
   const draft=row.status==='draft';
   const savedStep=row.entry?.step||(row.tests.some(test=>questionsOf(test).length)?1:0);
   const progress=Math.min(80,Math.max(0,savedStep*20));
   return `<li class="my-assessment-sheet" data-status="${esc(row.status)}">
    <span class="my-assessment-back-page" aria-hidden="true"></span>
    <article class="card my-assessment-card">
    <div class="card-header my-assessment-card-top">
     <span class="item-media item-media-icon">${icon('layers')}</span>
     <div class="my-assessment-card-name">
      <h2 class="card-title">${esc(row.title)}</h2>
      ${grade?`<p class="card-description">${esc(grade)}</p>`:''}
     </div>
     <div class="dropdown dropdown-end">
      <button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="Actions for ${esc(row.title)}" aria-haspopup="menu" aria-expanded="false" data-assessment-actions>${icon('more')}</button>
      <div class="menu" role="menu" aria-label="Actions for ${esc(row.title)}" hidden>
       <button class="menu-item" type="button" role="menuitem" tabindex="-1" data-edit-assessment="${esc(row.id)}">${icon('edit')}Edit</button>
       ${draft?'':`<button class="menu-item" type="button" role="menuitem" tabindex="-1" data-open="${esc(row.id)}">${openLabel}</button>`}
       <div class="menu-separator" role="separator"></div>
       <button class="menu-item is-destructive" type="button" role="menuitem" tabindex="-1" data-delete-assessment="${esc(row.id)}">${icon('trash')}Delete</button>
      </div>
     </div>
    </div>
    ${draft?`<div class="card-content my-assessment-progress">
     <div class="progress" role="progressbar" aria-label="Draft progress" aria-valuenow="${progress}">
      <div class="progress-indicator" style="--value:${progress}%"></div>
     </div>
     <p class="card-description"><span>Unfinished</span><span>${progress}%</span></p>
    </div>`:row.date||row.learners?`<div class="card-content"><div class="item item-muted my-assessment-card-facts">
     ${row.date?`<p class="card-description">${icon('calendar')}<span>${esc(date(row.date))}${row.session?`, ${esc(row.session)}`:''}</span></p>`:''}
     ${row.learners?`<p class="card-description">${icon('users')}${plural(row.learners,'learner')}</p>`:''}
    </div></div>`:''}
    <div class="card-footer">
     <button class="btn btn-ghost btn-sm" type="button" data-tests="${esc(row.id)}" aria-label="View ${testCount} in ${esc(row.title)}">${icon('file')}${testCount}</button>
     <span class="badge badge-${tone}">${esc(label)}</span>
    </div>
    </article>
   </li>`;
  }).join('');
 }
 function drawLibrary(){
  const matches=library.filter(a=>(!subjectFilter||a.subject===subjectFilter)&&(!gradeFilter||String(a.grade)===gradeFilter)
   &&[a.title,a.subject,'Grade '+a.grade,...a.tests.flatMap(t=>[t.title,t.standard])].join(' ').toLowerCase().includes(term));
  if(!matches.some(a=>a.id===selected))selected=matches[0]?.id;
  libraryList.innerHTML=matches.length?matches.map(a=>{
   const [symbol='layers',dok]=libraryTopics[a.id]||[];
   return `<label class="item assessment-library-card">
   <span class="item-media item-media-icon">${icon(symbol)}</span>
   <span class="item-content">
    <span class="item-title" id="library-name-${esc(a.id)}">${esc(a.title)}</span>
    <span class="item-description" id="library-details-${esc(a.id)}">${esc(a.subject)} · Grade ${esc(a.grade)}${dok?' · DOK '+dok:''}</span>
   </span>
   <span class="badge badge-secondary" id="library-test-count-${esc(a.id)}">${plural(a.tests.length,'test')}</span>
   ${icon('right')}
   <input class="radio" type="radio" name="assessment-library-preview" value="${esc(a.id)}" aria-labelledby="library-name-${esc(a.id)}" aria-describedby="library-details-${esc(a.id)} library-test-count-${esc(a.id)}" ${a.id===selected?'checked':''}>
  </label>`;
  }).join(''):`<div class="empty-state" role="status"><span class="empty-media">${icon('search')}</span><p class="empty-title">No assessments match</p><p>Try another search or filter.</p></div>`;
  drawLibraryPreview();
  updateLibraryFade();
 }
 const pointsOf=test=>questionsOf(test).reduce((sum,q)=>sum+Number(q.marks??q.points??1),0);
 const factRows=facts=>`<dl class="assessments-preview-facts">${facts.map(([label,value])=>`<div>
  <dt class="text-body-small text-muted-foreground">${label}</dt>
  <dd class="text-body-base font-bold">${esc(value)}</dd>
 </div>`).join('')}</dl>`;
 function drawLibraryPreview(){
  const a=library.find(assessment=>assessment.id===selected),detail=$('#assessment-library-detail');
  const previewCard=$('#assessment-preview-card');
  previewCard.hidden=!a;
  if(!a){detail.replaceChildren();return}
  previewCard.setAttribute('aria-label','Assessment preview: '+a.title);
  const standards=[...new Set(a.tests.map(t=>t.standard).filter(Boolean))];
  const items=a.tests.reduce((sum,t)=>sum+questionsOf(t).length,0);
  const points=a.tests.reduce((sum,t)=>sum+pointsOf(t),0);
  const facts=[
   ['Learning area',a.subject],
   ['Grade level','Grade '+a.grade],
   ['Standards',standards.join(', ')||'—'],
   ['Total items',items],
   ['Total points',points],
   ['Estimated time',items?plural(items*2,'minute'):'—']
  ];
  const tests=a.tests.map((t,i)=>`<li class="card assessments-preview-test">
   <div class="card-header assessments-preview-test-tools">
    <span class="assessments-preview-test-icon">${icon('file')}</span>
    <button type="button" class="btn btn-ghost btn-icon" data-preview-test="${i}" aria-label="Preview ${esc(t.title)}" aria-haspopup="dialog" title="Preview test">${icon('eye')}</button>
   </div>
   <div class="card-content">
    <h3 class="card-title">${esc(t.title)}</h3>
    <p class="card-description assessments-preview-test-meta">
     <span>${plural(questionsOf(t).length,'item')}</span>
     <span class="badge badge-warning">${plural(pointsOf(t),'point')}</span>
    </p>
   </div>
  </li>`).join('');
  detail.innerHTML=`<header class="assessments-preview-heading">
    <span class="item-media item-media-icon assessments-preview-icon">${icon(libraryTopics[a.id]?.[0]||'layers')}</span>
    <div class="item-content">
     <h2 class="text-heading font-semibold">${esc(a.title)}</h2>
     <p class="text-body-small text-muted-foreground">${esc(a.subject)}, Grade ${esc(a.grade)}</p>
    </div>
    <button class="btn btn-lg" type="button" data-use-assessment>Use this assessment</button>
   </header>
   ${factRows(facts)}
   <section aria-label="Included tests">
    <ul class="item-group assessments-preview-tests-list" role="list">${tests}</ul>
   </section>`;
 }
 function draw(){active==='mine'?drawMine():drawLibrary()}
 page.querySelectorAll('[data-source]').forEach(b=>{b.onclick=()=>setTab(b.dataset.source);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();setTab(e.key==='Home'?'mine':e.key==='End'?'library':active==='mine'?'library':'mine');page.querySelector('[data-source="'+active+'"]').focus()}});
 $('#assessment-library-search').oninput=e=>{term=e.target.value.trim().toLowerCase();drawLibrary()};$('#assessment-status').onchange=e=>{status=e.target.value;drawMine()};
 libraryList.onchange=e=>{
  if(e.target.name!=='assessment-library-preview')return;
  selected=e.target.value;
  drawLibraryPreview();
 };
 $('#assessment-library-filters').onchange=e=>{
  if(e.target.dataset.libraryFilter==='subject')subjectFilter=e.target.value;
  else if(e.target.dataset.libraryFilter==='grade')gradeFilter=e.target.value;
  else return;
  drawLibrary();
 };
 $('[data-clear-library]').onclick=()=>{
  subjectFilter=gradeFilter='';
  page.querySelectorAll('[data-library-filter]').forEach(select=>{select.value='';});
  drawLibrary();
 };
 $('#assessment-library-detail').addEventListener('click',event=>{
  if(!event.target.closest('[data-use-assessment]'))return;
  const assessment=library.find(a=>a.id===selected);
  if(assessment)window.capStartLibraryForm(assessment.id,{title:assessment.title,tests:assessment.tests});
 });
 $('#assessment-cards').addEventListener('click',event=>{
  const action=event.target.closest('[data-edit-assessment], [data-delete-assessment]');
  if(!action)return;
  const row=ownRows.find(item=>item.id===(action.dataset.editAssessment||action.dataset.deleteAssessment));
  if(!row)return;
  const remove=action.hasAttribute('data-delete-assessment');
  if(!remove&&row.status==='draft'){openAssessment(row);return;}
  assessmentAction(row,action.closest('.dropdown').querySelector('[data-assessment-actions]'),remove);
 });
 page.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-clear')){status='all';drawMine()}if(b.dataset.open)openAssessment(ownRows.find(r=>r.id===b.dataset.open));if(b.dataset.tests){const r=ownRows.find(r=>r.id===b.dataset.tests),d=modal(r.title,`<p class="text-body-small text-muted-foreground">${plural(r.tests.length,'test')} in this assessment</p><div class="item-group">${r.tests.map((t,i)=>`<button class="item item-outline al-test" data-included="${i}"><span class="item-media item-media-icon">${icon('file')}</span><span class="item-content"><span class="text-body-base font-semibold">${esc(t.title)}</span><span class="item-description">${plural((t.questions||[]).length,'item')}</span></span><span class="item-actions">${icon('right')}</span></button>`).join('')}</div>`,b);d.querySelectorAll('[data-included]').forEach(button=>button.onclick=()=>preview(r.tests[Number(button.dataset.included)],button))}if(b.hasAttribute('data-preview-test'))preview(library.find(a=>a.id===selected).tests[Number(b.dataset.previewTest)],b)});
 setTab(active);
});
