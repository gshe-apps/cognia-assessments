document.addEventListener('DOMContentLoaded',()=>{
 if(!location.pathname.endsWith('CAP-T03-Assessments.dc.html'))return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
 const paths={layers:'<path d="m12.83 2.18 8.6 3.91a1 1 0 0 1 0 1.82l-8.6 3.91a2 2 0 0 1-1.66 0l-8.6-3.91a1 1 0 0 1 0-1.82l8.6-3.91a2 2 0 0 1 1.66 0Z"/><path d="m2 12 9.17 4.18a2 2 0 0 0 1.66 0L22 12M2 17l9.17 4.18a2 2 0 0 0 1.66 0L22 17"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',right:'<path d="m9 18 6-6-6-6"/>',left:'<path d="m15 18-6-6 6-6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>'};
 const icon=n=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n]||paths.file}</svg>`;
 const library=(window.cogniaAssessmentForms||[]).map(f=>({id:f.id,title:f.title,grade:f.grade,subject:f.subject,description:{fractions:'Assess learners’ understanding of adding and subtracting fractions with unlike denominators.',algebra:'Check understanding of expressions, equations and foundational algebra.',reading:'Review reading comprehension, evidence and understanding of a text.',shapes:'Explore shapes, their attributes and geometric reasoning.'}[f.id]||'Review understanding with this ready-to-use assessment.',tests:[f]}));
 const fractions=library.find(assessment=>assessment.id==='fractions');
 if(fractions){
  const source=fractions.tests[0],questions=source.questions||source.items||[];
  if(questions.length>=3){
   const titles=['Fractions: Practice','Fractions: Quick check','Fractions: Application'];
   fractions.tests=titles.map((title,index)=>({...source,title,questions:questions.filter((_,position)=>position%3===index)}));
  }
 }
 const params=new URLSearchParams(location.search);
 let libraryGrade='',librarySubject='',libraryStandard='';
 paths.check='<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>';
 const removedKey='cogniaRemovedCatalogueAssessments';
 paths.expand='<path d="M15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7"/>';
 let active=['cognia','library'].includes(params.get('view'))?'library':'mine',term='',status=params.get('view')==='drafts'?'draft':params.get('view')==='completed'?'completed':params.get('view')==='banked'?'banked':'all',selected=library[0]?.id,ownRows=[];
 const plural=(n,w)=>n+' '+w+(n===1?'':'s');
 const date=v=>{if(!v)return 'Not scheduled';const d=v instanceof Date?v:new Date(v);return Number.isNaN(d.getTime())?'Not scheduled':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d)};
 function calendarModel(event){
  const form=(window.cogniaAssessmentForms||[]).find(f=>f.title===event.title);
  const items=form?.items||form?.questions||[];
  const questions=event.questions||(event.id==='fractions-check'?[...items.slice(0,3),...items.filter(q=>q.type==='Extended text').slice(0,1)]:items);
  return window.capOverviewCalendar.assessment({...event,questions});
 }
 function assessments(){
  const rows=read('cogniaAssessmentArchiveV1',[]).filter(e=>e.model?.tests?.length).map(e=>({id:e.id,title:e.title||e.model.title,grade:e.model.tests[0].grade,tests:e.model.tests,status:e.status==='assigned'?'scheduled':e.status,entry:e,classLabel:e.classLabel||e.delivery?.className,date:e.status==='assigned'?e.delivery?.sessions?.[0]?.opens:null,session:e.status==='assigned'?e.delivery?.sessions?.[0]?.name:null,learners:e.status==='assigned'?(e.delivery?.recipients?.length||0):0}));
  const cal=window.capOverviewCalendar;
  if(cal)for(const event of cal.events.filter(e=>['check','review','pending'].includes(e.status)).slice(0,6)){
   if(rows.some(r=>r.title===event.title&&r.status!=='draft'))continue;
   rows.push({id:'calendar-'+event.id,title:event.title,grade:event.grade,tests:calendarModel(event).tests,status:event.status==='check'?'completed':'scheduled',event,classLabel:event.classLabel,date:cal.date(event),session:'Session 1',learners:event.learnerCount||event.scores?.length||6,href:event.status==='check'?cal.results.href(event):'CAP-T09-ConfirmAssignment.dc.html?view=assigned&calendarEvent='+encodeURIComponent(event.id)});
  }return rows.filter(row=>!read(removedKey,[]).includes(row.id));
 }
 const search=(id,label)=>`<div class="search search-md" role="search">${icon('search').replace('class="icon"','class="search-icon"')}<input class="input search-input" id="${id}" type="search" aria-label="${label}" placeholder="${label}" autocomplete="off"></div>`;
 const page=document.querySelector('main>.page');if(!page)return;page.className='page assessments-workspace';
 page.innerHTML=`<header class="assessments-page-heading"><div><h1 class="text-heading font-semibold">Assessments</h1><p class="text-body-base text-muted-foreground">Find your recent assessments or build new ones from our library.</p></div><div data-assessment-create-menu></div></header><div class="tabs-list" role="tablist" aria-label="Assessment source"><button class="tab" id="assessment-tab-mine" role="tab" aria-controls="assessment-panel-mine" data-source="mine">${icon('layers').replace('class="icon"','')}My assessments</button><button class="tab" id="assessment-tab-library" role="tab" aria-controls="assessment-panel-library" data-source="library">${icon('layers').replace('class="icon"','')}Assessment library</button></div>
 <section class="assessments-panel" id="assessment-panel-mine" role="tabpanel" aria-labelledby="assessment-tab-mine"><div class="assessments-panel-content"><div class="assessments-toolbar"><span class="select-wrap"><select class="select select-md" aria-label="Assessment status" id="assessment-status"><option value="all">All statuses</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="banked">Banked</option></select></span></div><div class="assessment-card-grid" id="assessment-cards"></div><div id="assessment-empty" class="empty-state" role="status" hidden><span class="empty-media">${icon('search')}</span><p class="empty-title">No assessments match</p><p>Choose another status to see your assessments.</p><button class="btn btn-outline" data-clear>Clear filters</button></div></div></section>
 <section class="assessments-panel" id="assessment-panel-library" role="tabpanel" aria-labelledby="assessment-tab-library" hidden><div class="assessments-panel-content"><div class="assessments-library-search">${search('assessment-library-search','Search library')}</div><div class="assessment-card-grid" id="assessment-library-list"></div></div></section>`;
 window.capMountAssessmentCreateMenu(page);const $=s=>page.querySelector(s);
 const sourceToolbar=document.createElement('div');
 sourceToolbar.className='assessments-source-toolbar';
 const sourceTabs=page.querySelector('[role="tablist"]');
 sourceTabs.classList.add('assessment-source-switcher');
 sourceTabs.before(sourceToolbar);
 const mineFilters=page.querySelector('.assessments-toolbar');
 sourceToolbar.append(sourceTabs,mineFilters);
 const libraryFilters=document.createElement('div');
 libraryFilters.className='assessments-library-toolbar';
 const librarySearch=page.querySelector('.assessments-library-search');
 libraryFilters.append(librarySearch);
 const filterControl=document.createElement('div');filterControl.className='popover-wrap popover-end';
 const filterFields=[['grade','Grade level',assessment=>assessment.grade],['subject','Subject',assessment=>assessment.subject],['standard','Standard',assessment=>assessment.tests.map(test=>test.standard).filter(Boolean)]];
 filterControl.innerHTML=`<button class="btn btn-ghost btn-icon" type="button" aria-label="Filter assessment library" aria-haspopup="dialog" aria-expanded="false" aria-controls="assessment-library-filters"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg><span class="sr-only" data-active-filter-count></span></button><div class="popover assessment-library-filters" id="assessment-library-filters" role="dialog" aria-label="Filter assessment library" hidden>
 ${filterFields.map(([key,label,value])=>`<div class="field"><label class="label" for="library-filter-${key}">${label}</label><select class="select" id="library-filter-${key}" data-library-filter="${key}"><option value="">All ${key==='grade'?'grades':key==='subject'?'subjects':'standards'}</option>${[...new Set(library.flatMap(value))].sort().map(option=>`<option value="${esc(option)}">${key==='grade'?'Grade ':''}${esc(option)}</option>`).join('')}</select></div>`).join('')}
 <button class="btn btn-ghost" type="button" data-reset-library-filters>Clear filters</button></div>`;
 libraryFilters.append(filterControl);sourceToolbar.append(libraryFilters);
 filterControl.addEventListener('change',event=>{
  const key=event.target.dataset.libraryFilter;
  if(key==='grade')libraryGrade=event.target.value;
  if(key==='subject')librarySubject=event.target.value;
  if(key==='standard')libraryStandard=event.target.value;
  drawLibrary();
 });
 filterControl.querySelector('[data-reset-library-filters]').onclick=()=>{
  libraryGrade=librarySubject=libraryStandard='';
  filterControl.querySelectorAll('select').forEach(select=>{select.value='';});drawLibrary();
 };
 function setTab(value){active=value;term='';$('#assessment-library-search').value='';page.querySelectorAll('[data-source]').forEach(b=>{const on=b.dataset.source===active;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});$('#assessment-panel-mine').hidden=active!=='mine';$('#assessment-panel-library').hidden=active!=='library';const u=new URL(location.href);if(active==='library')u.searchParams.set('view','library');else if(['cognia','library'].includes(u.searchParams.get('view')))u.searchParams.delete('view');history.replaceState(null,'',u);draw()}
 function openAssessment(row){if(!row)return;if(row.entry&&window.capOpenSaved)return window.capOpenSaved(row.id);if(row.event)localStorage.setItem('cogniaScheduledAssessmentTests',JSON.stringify(calendarModel(row.event)));location.href=row.href||'CAP-T06-Review.dc.html'}
 function modal(title,body,trigger){const d=document.createElement('dialog');d.className='dialog assessment-preview-dialog';d.setAttribute('aria-label',title);d.innerHTML=`<div class="dialog-header"><h2 class="dialog-title">${esc(title)}</h2><button class="btn btn-ghost btn-icon dialog-close" aria-label="Close preview">${icon('close')}</button></div><div class="dialog-body">${body}</div>`;page.append(d);d.querySelector('.dialog-close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>{d.remove();trigger?.focus()});d.showModal();return d}
 function preview(test,trigger){let index=0;const questions=test.questions||test.items||[],d=modal(test.title,'<div data-question></div>',trigger),footer=document.createElement('div');footer.className='dialog-footer';footer.innerHTML=`<button class="btn btn-outline" data-prev>${icon('left')}Previous</button><span class="text-body-small text-muted-foreground" data-position aria-live="polite"></span><button class="btn" data-next>Next${icon('right').replace('class="icon"','')}</button>`;d.append(footer);
  function drawQuestion(){const q=questions[index];d.querySelector('[data-question]').innerHTML=q?`<div class="assessment-question-heading"><h3 class="text-body-base font-semibold">${esc(q.stem)}</h3></div><div class="item-group assessment-preview-options">${(q.options||[]).map((o,i)=>`<div class="item item-outline"><span class="badge badge-secondary">${String.fromCharCode(65+i)}</span><span class="text-body-base">${esc(o)}</span></div>`).join('')||`<div class="item item-muted"><p class="text-body-small">${q.type==='Extended text'?'Learners write an extended response.':'Learners enter their answer.'}</p></div>`}</div>`:'<p>No items in this test yet.</p>';d.querySelector('[data-position]').textContent=questions.length?'Item '+(index+1)+' of '+questions.length:'No items';d.querySelector('[data-prev]').disabled=index===0;d.querySelector('[data-next]').disabled=index>=questions.length-1}
  d.querySelector('[data-prev]').onclick=()=>{index--;drawQuestion()};d.querySelector('[data-next]').onclick=()=>{index++;drawQuestion()};drawQuestion();
 }

 const statusLabel=row=>({draft:'Draft',scheduled:'Scheduled',completed:'Completed',banked:'Banked'}[row.status]||row.status);
 function draftProgress(row){
  const hasItems=row.tests.some(test=>(test.questions||test.items||[]).length);
  const step=Math.max(0,Math.min(4,Number(row.entry?.step) || (hasItems?1:0)));
  return {step,percent:step*20,label:['Test setup','Add items','Review assessment','Assign to learners','Confirm assignment'][step],tone:step<2?'destructive':step<3?'warning':'success'};
 }
 function progressMarkup(row){
  const progress=draftProgress(row);
  return `<div class="card assessment-inner-panel" style="background-color:color-mix(in srgb,var(--accent-100) 25%,var(--card))"><div class="card-content assessment-card-progress"><p class="progress-label"><span>${progress.label}</span><span>${progress.percent}%</span></p><div class="progress" role="progressbar" aria-label="Assessment setup progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}" style="--value:${progress.percent}%"><div class="progress-indicator" style="background-color:var(--${progress.tone})"></div></div></div></div>`;
 }
 function drawMine(){
  ownRows=assessments();
  const rows=ownRows.filter(row=>(status==='all'||row.status===status)&&(row.title+' '+row.tests.map(test=>test.title).join(' ')+' '+row.classLabel).toLowerCase().includes(term));
  $('#assessment-empty').hidden=!!rows.length;$('#assessment-status').value=status;
  $('#assessment-cards').innerHTML=rows.map(row=>{
   const tone={draft:'warning',scheduled:'info',completed:'success'}[row.status]||'secondary';
   return `<a class="card-link card-link-raised card-stack assessment-card-stack" href="#assessment-${encodeURIComponent(row.id)}" data-assessment-card="${esc(row.id)}" aria-haspopup="dialog" aria-label="View ${esc(row.title)}, ${statusLabel(row)}"><span class="card assessment-card-back" aria-hidden="true" style="background-color:var(--${tone==='secondary'?'secondary':tone+'-light'})"><span class="card-content"></span></span><article class="card assessment-summary-card"><div class="card-content assessment-card-body">
    <div class="assessment-card-top"><span class="item-media item-media-icon">${icon('layers')}</span><span class="badge badge-${tone}">${statusLabel(row)}</span><span class="assessment-card-expand">${icon('expand')}</span></div>
    <div class="assessment-card-name"><h2 class="text-body-base font-semibold" title="${esc(row.title)}">${esc(row.title)}</h2><p class="text-body-small text-muted-foreground assessment-card-context"><span>${esc(row.classLabel||'Grade '+row.grade)}</span><span>${esc(row.tests[0]?.subject||'')}</span></p></div>
    ${row.status==='draft'?progressMarkup(row):row.status==='completed'?`<div class="card assessment-inner-panel" style="background-color:color-mix(in srgb,var(--accent-100) 25%,var(--card))"><div class="card-content assessment-card-completed assessment-table-fact"><span class="assessment-completed-icon" style="color:var(--success)">${icon('check')}</span><span class="text-body-small">${plural(row.tests.length,'test')}</span><span class="text-body-small">Completed ${esc(date(row.date))}</span></div></div>`:`<div class="card assessment-inner-panel" style="background-color:color-mix(in srgb,var(--accent-100) 25%,var(--card))"><div class="card-content assessment-card-schedule"><p class="text-body-small assessment-table-fact">${icon('calendar')}<span>${esc(date(row.date))}${row.session?', '+esc(row.session):''}</span></p><p class="text-body-small assessment-table-fact">${icon('users')}${row.learners?plural(row.learners,'learner'):'Not assigned'}</p></div></div>`}
   </div></article></a>`;
  }).join('');
 }
 function confirmDelete(row,details){
  const dialog=document.createElement('dialog');dialog.className='dialog dialog-sm';dialog.setAttribute('role','alertdialog');dialog.setAttribute('aria-labelledby','delete-assessment-title');dialog.setAttribute('aria-describedby','delete-assessment-description');
  dialog.innerHTML=`<div class="dialog-header"><h2 class="dialog-title" id="delete-assessment-title">Delete assessment?</h2></div><p class="dialog-description" id="delete-assessment-description">Delete “${esc(row.title)}” and its saved setup? This cannot be undone.</p><p role="alert" hidden>Couldn’t delete this assessment. Try again.</p><div class="dialog-footer"><button class="btn btn-ghost btn-lg" data-cancel-delete>Cancel</button><button class="btn btn-destructive btn-lg" data-confirm-delete>Delete assessment</button></div>`;
  page.append(dialog);dialog.querySelector('[data-cancel-delete]').onclick=()=>dialog.close();
  dialog.onclose=()=>{dialog.remove();if(details.open)details.querySelector('[data-delete]').focus()};
  dialog.querySelector('[data-confirm-delete]').onclick=()=>{
   try{localStorage.setItem(removedKey,JSON.stringify([...new Set([...read(removedKey,[]),row.id])]));localStorage.setItem('cogniaAssessmentArchiveV1',JSON.stringify(read('cogniaAssessmentArchiveV1',[]).filter(entry=>entry.id!==row.id)));}
   catch{dialog.querySelector('[role="alert"]').hidden=false;return;}
   dialog.close();details.close();drawMine();$('#assessment-status').focus();
  };
  dialog.showModal();dialog.querySelector('[data-cancel-delete]').focus();
 }
 function showAssessment(row,trigger){
  const body=`<span class="badge badge-${row.status==='scheduled'?'info':'secondary'}">${statusLabel(row)}</span><p class="text-body-small text-muted-foreground">${esc(row.classLabel||'Grade '+row.grade)}</p>
   ${row.status==='draft'?progressMarkup(row):`<dl class="assessment-modal-facts"><div><dt>Date</dt><dd>${esc(date(row.date))}</dd></div><div><dt>Session</dt><dd>${esc(row.session||'Not scheduled')}</dd></div><div><dt>Learners</dt><dd>${row.learners||'Not assigned'}</dd></div></dl>`}
   <section class="assessment-modal-tests"><h3 class="text-body-base font-semibold">Included tests</h3><div class="dialog-list">${row.tests.map((test,i)=>`<button class="item" type="button" data-inspect-test="${i}"><span class="item-media item-media-icon">${icon('file')}</span><span class="item-content"><span class="text-body-small font-semibold">${esc(test.title)}</span><span class="item-description">${plural((test.questions||test.items||[]).length,'item')}</span></span>${icon('right')}</button>`).join('')}</div></section>`;
  const dialog=modal(row.title,body,trigger),footer=document.createElement('div');footer.className='dialog-footer';
  footer.innerHTML=`<button class="btn btn-ghost is-destructive btn-lg" data-delete>Delete</button><button class="btn btn-lg" data-resume>${row.status==='draft'?'Continue draft':row.status==='completed'?'View results':'Edit assessment'}</button>`;dialog.append(footer);
  dialog.querySelectorAll('[data-inspect-test]').forEach(button=>button.onclick=()=>preview(row.tests[Number(button.dataset.inspectTest)],button));
  footer.querySelector('[data-delete]').onclick=()=>confirmDelete(row,dialog);
  footer.querySelector('[data-resume]').onclick=()=>{
   if(row.status==='draft'&&draftProgress(row).step===0&&window.capRestoreWork){window.capRestoreWork(row.id,null,'CAP-T04-Setup.dc.html');return;}
   if(row.status==='draft'&&row.entry?.step>=3&&window.capRestoreWork){window.capRestoreWork(row.id,null,row.entry.step===3?'CAP-T08-AudienceDelivery.dc.html':'CAP-T09-ConfirmAssignment.dc.html');return;}
   if(row.status==='scheduled'){
    if(row.entry){if(row.entry.delivery)localStorage.setItem('cogniaDeliverySessions',JSON.stringify(row.entry.delivery));window.capRestoreWork(row.id,null,'CAP-T08-AudienceDelivery.dc.html');return;}
    localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(calendarModel(row.event)));
    location.href='CAP-T09-ConfirmAssignment.dc.html?view=assigned&calendarEvent='+encodeURIComponent(row.event.id);return;
   }
   openAssessment(row);
  };
  animateAssessmentPreview(dialog,trigger);
 }
 function animateAssessmentPreview(dialog,trigger){
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const source=trigger.getBoundingClientRect(),target=dialog.getBoundingClientRect();
   dialog.animate([{transform:`translate(${source.x+source.width/2-target.x-target.width/2}px, ${source.y+source.height/2-target.y-target.height/2}px) scale(.9)`,opacity:0},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:200,easing:'ease-out'});
  }
 }
 function drawLibrary(){
  const count=[libraryGrade,librarySubject,libraryStandard].filter(Boolean).length;
  filterControl.querySelector('[data-active-filter-count]').textContent=count?count+' filters active':'';
  filterControl.querySelector('[aria-haspopup]').setAttribute('aria-label',count?'Filter assessment library, '+count+' active':'Filter assessment library');
  const matches=library.filter(assessment=>(!libraryGrade||assessment.grade===libraryGrade)&&(!librarySubject||assessment.subject===librarySubject)&&(!libraryStandard||assessment.tests.some(test=>test.standard===libraryStandard))&&(assessment.title+' '+assessment.subject+' Grade '+assessment.grade+' '+assessment.tests.map(test=>test.standard).join(' ')).toLowerCase().includes(term));
  $('#assessment-library-list').innerHTML=matches.length?matches.map(assessment=>`<a class="card-link card-link-raised card-stack assessment-card-stack" href="#library-${encodeURIComponent(assessment.id)}" data-library-card="${esc(assessment.id)}" aria-haspopup="dialog" aria-label="Preview ${esc(assessment.title)}"><span class="card assessment-card-back" aria-hidden="true" style="background-color:var(--secondary)"><span class="card-content"></span></span><article class="card assessment-summary-card"><div class="card-content assessment-card-body">
   <div class="assessment-card-top"><span class="item-media item-media-icon">${icon('layers')}</span><span class="badge badge-secondary">Ready to use</span><span class="assessment-card-expand">${icon('expand')}</span></div><div class="assessment-card-name"><h2 class="text-body-base font-semibold" title="${esc(assessment.title)}">${esc(assessment.title)}</h2><p class="text-body-small text-muted-foreground assessment-card-context"><span>Grade ${esc(assessment.grade)}</span><span>${esc(assessment.subject)}</span></p></div>
   <div class="assessment-card-footer"><p class="text-body-small font-semibold assessment-table-fact">${icon('file')}${plural(assessment.tests.length,'test')}</p></div></div></article></a>`).join(''):'<div class="empty-state" role="status"><p class="empty-title">No assessments match</p><p>Try another search.</p></div>';
 }
 function showLibraryAssessment(assessment,trigger){
  const dialog=modal(assessment.title,`<p class="text-body-small text-muted-foreground">${esc(assessment.subject)} Grade ${esc(assessment.grade)}</p><p class="text-body-base">${esc(assessment.description)}</p>
   <section class="assessment-modal-tests"><h3 class="text-body-base font-semibold">Included tests (${assessment.tests.length})</h3><div class="dialog-list">${assessment.tests.map((test,index)=>`<button class="item" type="button" data-library-test="${index}" aria-label="Preview ${esc(test.title)}"><span class="item-media item-media-icon">${icon('file')}</span><span class="item-content"><span class="text-body-small font-semibold">${esc(test.title)}</span><span class="item-description">${plural((test.questions||test.items||[]).length,'item')}</span></span>${icon('right')}</button>`).join('')}</div></section>`,trigger);
  const footer=document.createElement('div');footer.className='dialog-footer';footer.innerHTML='<button class="btn btn-lg" type="button" data-use-library>Use this assessment</button>';dialog.append(footer);
  dialog.querySelectorAll('[data-library-test]').forEach(button=>button.onclick=()=>preview(assessment.tests[Number(button.dataset.libraryTest)],button));
  footer.querySelector('button').onclick=()=>window.capStartLibraryForm(assessment.id,{title:assessment.title,tests:assessment.tests});
  animateAssessmentPreview(dialog,trigger);
 }
 function draw(){mineFilters.hidden=active!=='mine';libraryFilters.hidden=active!=='library';if(active!=='library'){filterControl.querySelector('.popover').hidden=true;filterControl.querySelector('[aria-haspopup]').setAttribute('aria-expanded','false');}active==='mine'?drawMine():drawLibrary()}
 page.querySelectorAll('[data-source]').forEach(b=>{b.onclick=()=>setTab(b.dataset.source);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();setTab(e.key==='Home'?'mine':e.key==='End'?'library':active==='mine'?'library':'mine');page.querySelector('[data-source="'+active+'"]').focus()}});
 $('#assessment-library-search').oninput=e=>{term=e.target.value.trim().toLowerCase();drawLibrary()};$('#assessment-status').onchange=e=>{status=e.target.value;drawMine()};
 page.addEventListener('click',e=>{const libraryCard=e.target.closest('[data-library-card]');if(libraryCard){e.preventDefault();showLibraryAssessment(library.find(assessment=>assessment.id===libraryCard.dataset.libraryCard),libraryCard);return;}const card=e.target.closest('[data-assessment-card]');if(card){e.preventDefault();showAssessment(ownRows.find(row=>row.id===card.dataset.assessmentCard),card);return;}const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-clear')){term='';status='all';drawMine()}if(b.dataset.open)openAssessment(ownRows.find(r=>r.id===b.dataset.open));if(b.dataset.tests){const r=ownRows.find(r=>r.id===b.dataset.tests),d=modal(r.title,`<p class="text-body-small text-muted-foreground">${plural(r.tests.length,'test')} in this assessment</p><div class="item-group">${r.tests.map((t,i)=>`<button class="item item-outline al-test" data-included="${i}"><span class="item-media item-media-icon">${icon('file')}</span><span class="item-content"><span class="text-body-base font-semibold">${esc(t.title)}</span><span class="item-description">${plural((t.questions||[]).length,'item')}</span></span><span class="item-actions">${icon('right')}</span></button>`).join('')}</div>`,b);d.querySelectorAll('[data-included]').forEach(button=>button.onclick=()=>preview(r.tests[Number(button.dataset.included)],button))}if(b.dataset.librarySelect){selected=b.dataset.librarySelect;drawLibrary()}if(b.hasAttribute('data-preview-test'))preview(library.find(a=>a.id===selected).tests[Number(b.dataset.previewTest)],b);if(b.dataset.useAssessment)window.capStartLibraryForm(b.dataset.useAssessment)});
 setTab(active);
});
