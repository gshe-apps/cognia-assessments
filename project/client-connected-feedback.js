document.addEventListener('DOMContentLoaded',()=>{
 const page=location.pathname.split('/').pop(),teacher=page.startsWith('CAP-T'),instance=window.cogniaPreview;
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
 const put=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const model=()=>read('cogniaAssessmentTestsV1',null),forms=window.cogniaAssessmentForms||[];
 const ledger=()=>read('cogniaItemLifecycleV1',{}),archive=()=>read('cogniaAssessmentArchiveV1',[]);
 const isQuestions=/CAP-T05-/.test(page),isReview=page==='CAP-T06-Review.dc.html';
 const questionFilter={bank:'cognia',term:'',type:'All types',grade:'',subject:'',standard:'',dok:''};
 function filterQuestions(){
  const selectedType={'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[questionFilter.type]||questionFilter.type;
  let count=0;
  for(const row of document.querySelectorAll('#libraryList .question-card')){
   const type=row.querySelector('.uc-bank-tags .tiny, .row .tiny')?.textContent||'';
   const stem=row.querySelector('h4')?.textContent.toLowerCase()||'';
   const {grade,subject}=window.capBuilderBankContext?.(row)||{};
   const matches=(window.capBuilderBankMatch?window.capBuilderBankMatch(row):row.dataset.itemBank===questionFilter.bank)&&stem.includes(questionFilter.term)
    &&(selectedType==='All types'||type===selectedType)
    &&(!questionFilter.grade||questionFilter.grade===grade)
    &&(!questionFilter.subject||questionFilter.subject===subject)
    &&(!questionFilter.standard||row.dataset.bankStandard===questionFilter.standard)
    &&(!questionFilter.dok||'DOK '+row.dataset.bankDok===questionFilter.dok);
   row.hidden=!matches;
   if(matches)count++;
  }
  const label=document.querySelector('.uc-bank-count');
  if(label)label.textContent=count+(count===1?' item':' items');
  const empty=document.querySelector('[data-bank-empty]');
  if(empty)empty.hidden=count>0;
 }
 if(isQuestions)window.capFilterBuilderQuestions=filterQuestions;
 document.addEventListener('input',e=>{if(isQuestions&&e.target.id==='search'){questionFilter.term=e.target.value.toLowerCase();filterQuestions();}});
 document.addEventListener('change',e=>{const fields={bankGrade:'grade',bankSubject:'subject',bankStandard:'standard',bankDok:'dok'};if(isQuestions&&fields[e.target.id]){questionFilter[fields[e.target.id]]=e.target.value;filterQuestions();}if(isQuestions&&e.target.id==='typeFilter'){questionFilter.type=e.target.value;filterQuestions();}});
 if(isQuestions)document.addEventListener('click',e=>{
  const option=e.target.closest('[data-builder-bank]');
  if(!option)return;
  questionFilter.bank=option.dataset.builderBank;
  const menu=option.closest('[role="menu"]');
  menu.querySelector('[aria-current]')?.removeAttribute('aria-current');
  option.setAttribute('aria-current','true');
  filterQuestions();
 });
 if(teacher&&!localStorage.getItem('cogniaClientDraftSeedV1')){const entries=archive();for(const f of forms){if(entries.some(e=>e.title===f.title&&e.status==='draft'))continue;const id='sample-'+f.id,questions=(f.items||f.questions).filter(q=>q.tier!=='plus'),test={id,title:f.title,grade:f.grade,subject:f.subject,standard:f.standard,page:f.page,state:{chosen:questions.map(q=>q.id),written:{},edits:{}},questions};entries.push({id:'assessment-'+id,title:f.title,status:'draft',sample:true,updatedAt:new Date().toISOString(),model:{title:f.title,active:id,origin:'builder',tests:[test]}});}put('cogniaAssessmentArchiveV1',entries);localStorage.setItem('cogniaClientDraftSeedV1','1');}
 window.capUpdateOverviewDraftStack?.();
 // Preserve text immediately: exported blur handlers otherwise lose input when another control redraws the canvas.
 document.addEventListener('input',event=>{if(!isQuestions||!instance)return;const el=event.target;if(!el.closest('.drawer'))return;const f={stem:'',opts:['','','',''],correct:null,marks:'1',...instance.state.form};if(el.id==='wq-stem')f.stem=el.value;else if(/^Option [ABCD]$/.test(el.getAttribute('aria-label')||'')){f.opts=[...f.opts];f.opts['ABCD'.indexOf(el.getAttribute('aria-label').slice(-1))]=el.value;}else return;instance.state.form=f;instance.state.fError='';},true);
 const icon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h11l5 5v11H4zM14 4v6h6M8 14h8M8 17h5"/></svg>';
 function required(t,q){return !t.libraryForm&&(!!t.state?.edits?.[q.id]||(!!t.state?.written?.[q.id]&&q.origin!=='cognia'));}
 const fingerprint=q=>JSON.stringify([q.stem,q.options,q.correct,q.type,q.marks]);
 function sync(){const m=model();if(!m)return;const records=ledger();let changed=false;
  for(const t of m.tests)for(const q of t.questions||[]){if(!required(t,q))continue;const key=t.id+'/'+q.id,signature=fingerprint(q),old=records[key];
   if(!old||old.signature!==signature){records[key]={version:(old?.version||0)+1,status:'draft',signature,question:JSON.parse(JSON.stringify(q)),test:t.title,standard:t.standard,history:[...(old?.history||[]),...(old?[{version:old.version,status:old.status,question:old.question,approvedAt:old.approvedAt,at:new Date().toISOString()}]:[])]};changed=true;}
  }if(changed)put('cogniaItemLifecycleV1',records);
 }
 function pending(m=model()){const records=ledger();return (m?.tests||[]).flatMap(t=>(t.questions||[]).filter(q=>required(t,q)&&records[t.id+'/'+q.id]?.status!=='approved').map(q=>({t,q,key:t.id+'/'+q.id})));}
 function modal(title,html){document.querySelector('.client-dialog')?.remove();const d=document.createElement('dialog');d.className='client-dialog dialog';d.setAttribute('aria-label',title);d.innerHTML=`<div class="client-dialog-head dialog-header"><h2 class="dialog-title">${escape(title)}</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" data-client-close aria-label="Close dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>${html}`;document.body.append(d);const focus=document.activeElement;d.querySelector('[data-client-close]').onclick=()=>d.close();d.addEventListener('close',()=>{if(focus?.isConnected)focus.focus();d.remove();});d.showModal();return d;}
 function answer(q){if(q.interactionType==='Order')return q.options.join(' → ');return q.options?.length?q.options[q.correct]:'Teacher-scored response; review the expected answer or rubric before use.';}
 function approvalDialog(key){sync();const m=model(),[testId,...parts]=key.split('/'),id=parts.join('/'),t=m.tests.find(t=>t.id===testId),q=t?.questions.find(q=>q.id===id),record=ledger()[key];if(!q||!record)return;
  const d=modal('Review item',`<p class="client-kicker">${escape(t.title)} · Version ${record.version} · ${record.status==='approved'?'Approved':'Draft — review required'}</p><h3>${escape(q.stem)}</h3><p>Learning standard: ${escape(t.standard||'Not specified')}</p>${q.options?.length?'<ol type="A">'+q.options.map(o=>`<li>${escape(o)}</li>`).join('')+'</ol>':''}<details open><summary>Answer key</summary><p>${escape(answer(q))}</p></details><p>Check accuracy, standard alignment, wording and any supporting content. Approval applies to this version only.</p>${record.history.length?`<details><summary>Version history (${record.history.length})</summary>${record.history.map(h=>`<p>Version ${h.version} · ${escape(h.status)}${h.approvedAt?' · Approved '+escape(new Date(h.approvedAt).toLocaleString()):''}<br>${escape(h.question?.stem)}</p>`).join('')}</details>`:''}${record.status==='approved'?`<p>Approved by Sara Lee · ${escape(new Date(record.approvedAt).toLocaleString())}</p>`:'<label class="client-confirm"><input type="checkbox" data-item-check> I have reviewed this item and its answer key.</label><button class="btn solid btn-lg" data-approve-item disabled>Approve this version</button>'}<p class="client-small">Prototype record saved in this browser. Production audit and retention requirements are pending.</p>`);
  const check=d.querySelector('[data-item-check]'),button=d.querySelector('[data-approve-item]');if(check)check.onchange=()=>button.disabled=!check.checked;if(button)button.onclick=()=>{const records=ledger();records[key]={...records[key],status:'approved',approvedAt:new Date().toISOString(),approvedBy:'Sara Lee'};put('cogniaItemLifecycleV1',records);d.close();apply();};
 }
 const modelId=m=>'assessment-'+m.tests.map(t=>t.id).join('-');
 function saveSnapshot(status){const m=model();if(!m)return;const entries=archive(),id=modelId(m)+(status==='banked'?'-banked':'');let index=entries.findIndex(e=>e.id===id);if(index>=0&&entries[index].status==='assigned'){entries[index].id=id+'-scheduled-'+Date.parse(entries[index].updatedAt);index=-1;}const entry={id,title:m.title,status,...(index>=0&&entries[index].step?{step:entries[index].step}:{}),updatedAt:new Date().toISOString(),model:JSON.parse(JSON.stringify(m)),delivery:read('cogniaDeliverySessions',null)};if(index<0)entries.unshift(entry);else entries[index]=entry;put('cogniaAssessmentArchiveV1',entries);}
 function preserveCurrent(){const m=model();if(!m)return;const saved=archive().find(e=>e.id===modelId(m));if(saved?.status==='assigned')return;saveSnapshot(saved?.status||'draft');}

 function restore(id,details,target,navigate=url=>location.assign(url)){const entry=archive().find(e=>e.id===id);if(!entry)return;preserveCurrent();const restored=JSON.parse(JSON.stringify(entry.model));if(entry.status==='banked'){const suffix='-reuse-'+Date.now();restored.active+=suffix;restored.tests.forEach(t=>t.id+=suffix);restored.origin='builder';}
  /* Details confirmed in the setup dialog on the Assessments table: apply them so the builder opens ready, without asking again. */
  if(details&&window.capAssessmentSetup){const {itemPage,libraryPath,signature}=window.capAssessmentSetup,t=restored.tests.find(t=>t.id===restored.active)||restored.tests[0];Object.assign(t,details,{page:itemPage(details)});if(restored.tests.length===1)restored.title=t.title;put('cogniaAssessmentTestsV1',restored);sessionStorage.setItem('capCreateConfirmed:'+t.id,signature(t));location.href=details.pathway===libraryPath?'CAP-T21-AssessmentLibrary.dc.html':t.page;return;}
  put('cogniaAssessmentTestsV1',restored);navigate(target||(entry.model.tests[0].libraryForm?'CAP-T08-AudienceDelivery.dc.html':entry.model.tests.find(t=>t.id===entry.model.active)?.page||'CAP-T06-Review.dc.html'));}
 /* Opening a saved assessment, 10 Nov: drafts reopen on the step where Save as draft was clicked (1 Create or 2 Review),
    banked ones on step 2 (as a fresh copy) and assigned ones on step 4 Finalize. */
 function openSaved(id,navigate=url=>location.assign(url)){const entry=archive().find(e=>e.id===id);if(!entry)return;
  if(entry.status==='assigned'){preserveCurrent();put('cogniaAssessmentTestsV1',JSON.parse(JSON.stringify(entry.model)));if(entry.delivery)put('cogniaDeliverySessions',entry.delivery);navigate('CAP-T09-ConfirmAssignment.dc.html?view=assigned');return;}
  const stepTwo=entry.status==='banked'||entry.step===2;
  /* Step 1 drafts were already set up, so the item builder opens without the setup dialog. */
  if(!stepTwo&&window.capAssessmentSetup){
   const t=entry.model.tests.find(t=>t.id===entry.model.active)||entry.model.tests[0];
   if(t){
    const settings=t===entry.model.tests[0]?{...t,title:entry.model.title||t.title}:t;
    sessionStorage.setItem('capCreateConfirmed:'+t.id,window.capAssessmentSetup.signature(settings));
   }
  }
  restore(id,null,stepTwo?'CAP-T06-Review.dc.html?stage=details':null,navigate);}
 window.capRestoreWork=restore;window.capOpenSaved=openSaved;window.capStartLibraryForm=id=>startForm(id);

 if(page==='CAP-T03-Assessments.dc.html'){
  const query=new URLSearchParams(location.search);
  const name=query.get('associated'),fromItem=query.get('fromItem');
  if(name&&fromItem){
   const items=window.capItemBankData().filter(item=>item.assoc.some(([title])=>title===name));
   const source=items.find(item=>item.id===fromItem);
   if(source){
    // Register the linked sample once in the same archive used by Tests and its editor.
    const testId='item-bank-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const id='assessment-'+testId,entries=archive();
    if(!entries.some(entry=>entry.id===id)){
     const subject=source.subject==='ELA'?'English':'Mathematics';
     const questions=items.map(item=>({
      id:'bank-'+item.id,stem:item.stem,type:item.type,standard:item.std,marks:1,origin:'cognia',
      options:item.opts||[],correct:item.correct?.[0]??null,sampleAnswer:item.sample||'',
      ...(item.correct?.length>1?{correctAnswers:item.correct}:{}),
     }));
     const test={id:testId,title:name,grade:source.grade,subject,standard:source.std,
      page:subject==='English'?'CAP-T05-Reading.dc.html':'CAP-T05-Questions.dc.html',
      state:{chosen:questions.map(q=>q.id),written:Object.fromEntries(questions.map(q=>[q.id,q])),edits:{}},questions};
     entries.push({id,title:name,status:'draft',step:2,sample:true,updatedAt:new Date().toISOString(),
      model:{title:name,origin:'builder',active:testId,tests:[test]}});
     put('cogniaAssessmentArchiveV1',entries);
    }
    openSaved(id,path=>{
     const destination=new URL(path,location.href);
     destination.searchParams.set('fromItem',fromItem);
     location.replace(destination.href);
    });
    return;
   }
  }
 }
 function startForm(id,draftId){
  const form=forms.find(f=>f.id===id);if(!form)return false;
  const draft=draftId&&archive().find(entry=>entry.id===draftId&&entry.status==='draft'&&entry.model?.tests?.length);
  if(draftId&&!draft)return false;
  const current=model(),sameDraft=Boolean(draft&&current&&modelId(current)===draft.id);
  const delivery=draft?(sameDraft?read('cogniaDeliverySessions',null):draft.delivery):null;
  if(!sameDraft)preserveCurrent();
  const questions=JSON.parse(JSON.stringify(form.questions));
  const test={id:'library-'+Date.now(),title:form.title,grade:form.grade,subject:form.subject,standard:form.standard,
   page:form.page,libraryForm:form.id,state:{chosen:questions.map(q=>q.id),written:{},edits:{}},questions};
  const assessment=draft?JSON.parse(JSON.stringify(sameDraft?current:draft.model)):
   {title:form.title,active:test.id,tests:[],origin:'library'};
  assessment.tests.push(test);
  put('cogniaAssessmentTestsV1',assessment);
  if(delivery)put('cogniaDeliverySessions',delivery);else localStorage.removeItem('cogniaDeliverySessions');
  if(draft){
   const updated={...draft,id:modelId(assessment),title:assessment.title,step:2,updatedAt:new Date().toISOString(),model:assessment,delivery};
   put('cogniaAssessmentArchiveV1',archive().map(entry=>entry.id===draft.id?updated:entry));
  }
  const usage=read('cogniaLibraryUsageV1',{});usage[id]=Date.now();put('cogniaLibraryUsageV1',usage);
  try{
   if(window.capAssessmentSetup)sessionStorage.setItem('capCreateConfirmed:'+test.id,window.capAssessmentSetup.signature(test));
   sessionStorage.setItem('capLibraryReturn',/CAP-T0[5-9]-|CAP-T10-/.test(page)?'CAP-T21-AssessmentLibrary.dc.html':page);
  }catch{}
  location.href='CAP-T06-Review.dc.html?stage=details';
  return true;
 }
 function mountLibraryDraftMenu(formId,dropdown){
  const trigger=dropdown.querySelector('#al-use-test-trigger'),menu=dropdown.querySelector('#al-use-test-menu');
  const branch=menu.querySelector('.al-draft-branch'),add=branch.querySelector('button'),submenu=branch.querySelector('.menu');
  const savedDate=new Intl.DateTimeFormat(undefined,{dateStyle:'medium'});
  const savedClock=new Intl.DateTimeFormat(undefined,{timeStyle:'medium'});
  const savedTime=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'medium'});
  let openedByHover=false;
  function closeDrafts(){
   submenu.hidden=true;
   submenu.replaceChildren();
   add.setAttribute('aria-expanded','false');
  }
  function openDrafts(focus=false){
   if(submenu.hidden){
    const today=savedDate.format(Date.now()),datesByName=new Map();
    const drafts=archive().filter(entry=>entry.status==='draft'&&entry.model?.tests?.length)
     .map(draft=>{
      const name=draft.title||draft.model.title,timestamp=Date.parse(draft.updatedAt);
      const date=Number.isFinite(timestamp)?savedDate.format(timestamp):'';
      const key=JSON.stringify([name,date]);
      datesByName.set(key,(datesByName.get(key)||0)+1);
      return {draft,name,timestamp,date,key};
     }).sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
    submenu.innerHTML=drafts.length?drafts.map(({draft,name,timestamp,date,key})=>{
     const dateLabel=date===today?'Today':date;
     const saved=date
      ?`<time class="al-draft-saved text-muted-foreground" datetime="${escape(draft.updatedAt)}" title="Last saved ${escape(savedTime.format(timestamp))}">${escape(dateLabel)}${datesByName.get(key)>1?' · '+escape(savedClock.format(timestamp)):''}</time>`
      :'<span class="al-draft-saved text-muted-foreground">Save time unavailable</span>';
     return `
     <button type="button" class="menu-item" role="menuitem" tabindex="-1" data-library-draft="${escape(draft.id)}">
      <span class="al-draft-copy"><span class="al-draft-name text-body-small font-semibold">${escape(name)}</span>${saved}</span>
      <span class="badge badge-warning al-draft-count">${draft.model.tests.length} ${draft.model.tests.length===1?'Test':'Tests'}</span>
     </button>`;
    }).join(''):`
      <p class="al-draft-status text-body-small text-muted-foreground" role="presentation">No saved drafts</p>
      <button type="button" class="menu-item" role="menuitem" tabindex="-1" data-start-form="${escape(formId)}">Start from scratch</button>`;
    submenu.hidden=false;
    add.setAttribute('aria-expanded','true');
   }
   if(focus)submenu.querySelector('[role="menuitem"]')?.focus();
  }
  function closeMenu(){
   menu.hidden=true;
   trigger.setAttribute('aria-expanded','false');
   openedByHover=false;
   closeDrafts();
  }
  trigger.addEventListener('pointerenter',event=>{
   if(event.pointerType!=='mouse'||!menu.hidden)return;
   menu.hidden=false;
   trigger.setAttribute('aria-expanded','true');
   openedByHover=true;
  });
  trigger.addEventListener('click',event=>{
   if(!openedByHover||menu.hidden)return;
   event.stopPropagation();
   openedByHover=false;
   menu.querySelector('[role="menuitem"]').focus();
  });
  dropdown.addEventListener('pointerleave',event=>{
   if(event.pointerType==='mouse'&&openedByHover&&!menu.contains(document.activeElement))closeMenu();
  });
  branch.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')openDrafts();});
  branch.addEventListener('pointerleave',event=>{
   if(event.pointerType==='mouse'&&!submenu.contains(document.activeElement))closeDrafts();
  });
  branch.addEventListener('focusout',event=>{
   if(event.relatedTarget&&!branch.contains(event.relatedTarget))closeDrafts();
  });
  add.addEventListener('click',event=>{
   event.stopPropagation();
   openDrafts(true);
  });
  submenu.addEventListener('click',event=>{
   const pick=event.target.closest('[data-library-draft]');
   if(pick&&!startForm(formId,pick.dataset.libraryDraft)){
    event.stopPropagation();
    closeDrafts();openDrafts(true);
   }
  });
  menu.addEventListener('keydown',event=>{
   if(event.target===add&&['ArrowLeft','ArrowRight'].includes(event.key)){
    event.preventDefault();event.stopPropagation();openDrafts(true);return;
   }
   if(!submenu.contains(event.target)){
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key))closeDrafts();
    return;
   }
   if(event.key==='Tab'){closeMenu();trigger.focus();return;}
   if(['Escape','ArrowLeft','ArrowRight'].includes(event.key)){
    event.preventDefault();event.stopPropagation();closeDrafts();add.focus();return;
   }
   const items=[...submenu.querySelectorAll('[role="menuitem"]')];
   const index=items.indexOf(document.activeElement);
   const destinations={ArrowDown:(index+1)%items.length,ArrowUp:(index-1+items.length)%items.length,Home:0,End:items.length-1};
   if(!Object.hasOwn(destinations,event.key))return;
   event.preventDefault();event.stopPropagation();items[destinations[event.key]]?.focus();
  });
  new MutationObserver(()=>{if(menu.hidden){openedByHover=false;closeDrafts();}})
   .observe(menu,{attributes:true,attributeFilter:['hidden']});
 }
 function libraryPreview(id){const f=forms.find(f=>f.id===id);if(!f)return;const d=modal(f.title,`<p>Complete Cognia form · Grade ${f.grade} · ${escape(f.subject)} · ${escape(f.standard)}</p><p>This form is assigned as provided. Editing and customisation are not part of this proposed flow.</p>${f.questions.map((q,i)=>`<section class="client-preview-question"><h3>${i+1}. ${escape(q.stem)}</h3>${q.options?.length?'<ol type="A">'+q.options.map(o=>`<li>${escape(o)}</li>`).join('')+'</ol>':''}<details><summary>Answer key</summary><p>${escape(answer(q))}</p></details></section>`).join('')}<div class="client-dialog-actions dialog-footer"><button class="btn solid btn-lg" data-assign-form="${f.id}">Use complete assessment →</button></div>`);d.querySelector('[data-assign-form]').onclick=()=>startForm(id);}
 const libState={selected:null,term:'',grade:'',subject:'',format:'',sort:'recent',filters:false};
 function renderLibrary(){
  const root=document.getElementById('assessment-library');if(!root)return;
  root.className='al-library';
  const svg=path=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
  const searchIcon=svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
  const closeIcon=svg('<path d="m18 6-12 12M6 6l12 12"/>');
  const chevronDown=svg('<path d="m6 9 6 6 6-6"/>');
  const chevronLeft=svg('<path d="m15 18-6-6 6-6"/>');
  const newTestIcon=svg('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/>');
  const chevron=svg('<path d="m9 18 6-6-6-6"/>');
  const check=svg('<path d="m20 6-11 11-5-5"/>');
  const subjectIcons={
   Mathematics:svg('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>'),
   English:svg('<path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 2"/>'),
  };
  const formatNames={'Text entry':'Short answer','Extended text':'Extended response'};
  const formatOf=item=>formatNames[item.type]||item.displayType||item.type||'Item';
  const formatsOf=form=>{
   const types=[...new Set(form.questions.map(formatOf))];
   return [...new Set([form.format,...types,...(types.length>1?['Mixed formats']:[])].filter(Boolean))];
  };
  const grades=[...new Set(forms.map(form=>String(form.grade)))].sort((a,b)=>Number(a)-Number(b));
  const subjects=[...new Set(forms.map(form=>form.subject))].sort();
  const formats=[...new Set(forms.flatMap(formatsOf))].sort();
  const itemCount=count=>count+(count===1?' item':' items');
  const pointCount=count=>count+(count===1?' point':' points');
  const scope=form=>'Grade '+escape(form.grade)+' '+escape(form.subject);
  const select=(key,label,defaultLabel,choices)=>`
   <div class="field"><label class="label" for="form-${key}">${label}</label>
    <span class="select-wrap"><select class="select" id="form-${key}" data-library-filter="${key}">
     ${defaultLabel?`<option value="">${defaultLabel}</option>`:''}
     ${choices.map(([value,text])=>`<option value="${escape(value)}">${escape(text)}</option>`).join('')}
    </select></span>
   </div>`;
  const pairs=values=>values.map(value=>[value,value]);
  root.innerHTML=`
   <header class="al-page-heading">
    <h1 class="text-heading font-semibold">Classroom test library</h1>
    <p class="text-body-base text-muted-foreground">Choose a ready-to-use test for your assessment.</p>
   </header>
   <div class="al-layout">
    <section class="al-browser" aria-labelledby="al-browse-title">
     <h2 class="text-body-base font-semibold" id="al-browse-title">Ready-to-use tests <span id="form-count" role="status"></span></h2>
     <div class="al-tools">
      <div class="search search-md" role="search">
       ${searchIcon.replace('<svg','<svg class="search-icon"')}
       <input class="input search-input" id="form-search" type="search" placeholder="Search tests" aria-label="Search tests" autocomplete="off">
       <span class="tooltip-wrap search-clear"><button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Clear search">${closeIcon}</button><span class="tooltip" role="tooltip">Clear search</span></span>
      </div>
      <span class="tooltip-wrap">
       <button type="button" class="btn btn-ghost btn-icon" data-al-filter aria-label="Filter tests" aria-expanded="false" aria-controls="al-filters">
        ${svg('<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>')}
       </button><span class="tooltip" role="tooltip">Filter tests</span>
      </span>
     </div>
     <div id="al-filters" class="al-filters" hidden>
      ${select('grade','Grade','All grades',grades.map(grade=>[grade,'Grade '+grade]))}
      ${select('subject','Subject','All subjects',pairs(subjects))}
      ${select('format','Format','All formats',pairs(formats))}
      ${select('sort','Sort by','',[['recent','Recently used'],['title','Title A–Z'],['grade','Grade level']])}
     </div>
     <ul class="al-tests" id="form-results" aria-label="Ready-to-use tests"></ul>
    </section>
    <section class="al-detail" id="al-detail" aria-labelledby="al-d-title"></section>
   </div>`;
  const $=selector=>root.querySelector(selector);
  const search=$('#form-search'),filters=$('#al-filters'),filterButton=$('[data-al-filter]'),panel=$('#al-detail');
  search.value=libState.term;
  const fields=[...filters.querySelectorAll('select')];
  fields.forEach(field=>field.value=libState[field.dataset.libraryFilter]);
  const showFilters=()=>{
   filters.hidden=!libState.filters;
   filterButton.setAttribute('aria-expanded',String(libState.filters));
  };
  function detail(form){
   panel.hidden=!form;
   if(panel.dataset.form===(form?.id||''))return;
   panel.dataset.form=form?.id||'';
   if(!form){panel.replaceChildren();return;}
   const items=form.questions,points=items.reduce((total,item)=>total+Number(item.marks||0),0);
   panel.innerHTML=`
    <header class="al-preview-heading">
     <div><h2 class="text-body-base font-semibold" id="al-d-title">${escape(form.title)}</h2>
      <p class="text-body-small text-muted-foreground">${scope(form)} · ${itemCount(items.length)} · ${pointCount(points)}</p></div>
     <div class="dropdown dropdown-end al-use-test">
      <button type="button" class="btn btn-lg" id="al-use-test-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="al-use-test-menu">Use this test${chevronDown}</button>
      <div class="menu" id="al-use-test-menu" role="menu" aria-labelledby="al-use-test-trigger" hidden>
       <button type="button" class="menu-item" role="menuitem" tabindex="-1" data-start-form="${escape(form.id)}">${newTestIcon}Start from scratch</button>
       <div class="al-draft-branch" role="none">
        <button type="button" class="menu-item" id="al-draft-trigger" role="menuitem" tabindex="-1" aria-haspopup="menu" aria-expanded="false" aria-controls="al-draft-menu">${chevronLeft}Add to assessment</button>
        <div class="menu al-draft-menu" id="al-draft-menu" role="menu" aria-labelledby="al-draft-trigger" hidden></div>
       </div>
      </div>
     </div>
    </header>
    <div class="al-items">
     ${items.map((item,index)=>{
      const standard=item.standard||form.standard;
      const metadata=`${escape(formatOf(item))} · ${pointCount(Number(item.marks||0))}`;
      const options=item.options?.length?`
       <ul class="ib-opts" aria-label="Answer options">
        ${item.options.map((option,i)=>{
         const correct=(Array.isArray(item.correct)?item.correct:[item.correct]).includes(i);
         return `<li class="ib-opt${correct?' is-correct':''}">
          <span class="ib-letter">${String.fromCharCode(65+i)}</span><span class="ib-opt-text" data-stem>${escape(option)}</span>
          ${correct?`<span class="badge badge-success">${check}Correct answer</span>`:''}
         </li>`;
        }).join('')}
       </ul>`:`<p class="text-body-small text-muted-foreground">${escape(item.sampleAnswer||answer(item))}</p>`;
      return `<details class="card accordion-item al-item-card" name="library-items"${index===0?' open':''}>
       <summary class="accordion-trigger"><span class="al-item-heading">
        <span data-stem>${escape(item.stem)}</span>
        <span class="al-item-summary-meta text-body-small text-muted-foreground font-normal">${metadata}</span>
       </span></summary>
       <div class="accordion-content al-item-content">
        ${options}
        <div class="al-item-footer">
         ${standard?`<span class="badge badge-warning">Standard ${escape(standard)}</span>`:''}
         <span class="text-body-small text-muted-foreground">${metadata}</span>
        </div>
       </div>
      </details>`;
     }).join('')}
    </div>`;
   mountLibraryDraftMenu(form.id,panel.querySelector('.al-use-test'));
  }
  function draw(){
   const term=libState.term.trim().toLowerCase(),usage=read('cogniaLibraryUsageV1',{});
   const matches=forms.filter(form=>(!term||(form.title+' '+form.standard).toLowerCase().includes(term))
    &&(!libState.grade||String(form.grade)===libState.grade)&&(!libState.subject||form.subject===libState.subject)
    &&(!libState.format||formatsOf(form).includes(libState.format)));
   if(libState.sort==='title')matches.sort((a,b)=>a.title.localeCompare(b.title));
   else if(libState.sort==='grade')matches.sort((a,b)=>Number(a.grade)-Number(b.grade)||a.title.localeCompare(b.title));
   else matches.sort((a,b)=>(usage[b.id]||0)-(usage[a.id]||0));
   const selected=matches.find(form=>form.id===libState.selected)||matches[0];
   libState.selected=selected?.id||null;
   $('#form-count').textContent='('+matches.length+')';
   $('#form-results').innerHTML=matches.length?matches.map(form=>`
    <li><button class="item al-test" type="button" data-al-select="${escape(form.id)}" aria-controls="al-detail" aria-current="${form===selected}">
     <span class="item-media icon-accent">${subjectIcons[form.subject]||icon}</span>
     <span class="item-content"><span class="text-body-base font-semibold">${escape(form.title)}</span>
      <span class="item-description">${scope(form)} · ${itemCount(form.questions.length)}</span></span>
     <span class="item-actions">${chevron.replace('<svg','<svg class="icon"')}</span>
    </button></li>`).join(''):`
    <li><div class="empty-state" role="status"><span class="empty-media">${searchIcon}</span>
     <p class="empty-title">No tests match</p><p>Try a different search or clear your filters.</p>
     <button type="button" class="btn btn-outline" data-clear-library>Clear filters</button>
    </div></li>`;
   detail(selected);
  }
  search.addEventListener('input',()=>{libState.term=search.value;draw();});
  filterButton.onclick=()=>{libState.filters=!libState.filters;showFilters();};
  fields.forEach(field=>field.addEventListener('change',()=>{libState[field.dataset.libraryFilter]=field.value;draw();}));
  root.onclick=event=>{
   const pick=event.target.closest('[data-al-select]');
   if(pick){
    libState.selected=pick.dataset.alSelect;
    root.querySelectorAll('[data-al-select]').forEach(button=>button.setAttribute('aria-current',String(button===pick)));
    detail(forms.find(form=>form.id===libState.selected));
   }
   if(event.target.closest('[data-clear-library]')){
    Object.assign(libState,{term:'',grade:'',subject:'',format:''});
    search.value='';
    fields.forEach(field=>field.value=libState[field.dataset.libraryFilter]);
    search.focus();
    draw();
   }
  };
  showFilters();
  draw();
 }
 function renderBank(){if(page!=='CAP-T12-QuestionLibrary.dc.html')return;const root=document.querySelector('main>.page');if(!root)return;
  const m=model(),locked=m?.origin==='library',all=forms.flatMap(f=>(f.items||f.questions).map(q=>({...q,id:'bank-'+f.id+'-'+q.id,grade:f.grade,subject:f.subject,standard:f.standard,origin:'cognia',source:'Cognia item'})));
  root.innerHTML=`<div class="head"><div><p class="client-kicker">Classroom Assessment · Builder</p><h1>Item Bank</h1><p>Individual questions for your assessment. Complete forms live in the Assessment Library.</p></div><a class="btn ghost btn-ghost btn-lg" href="${locked?'CAP-T04-Setup.dc.html':m?.tests.find(t=>t.id===m.active)?.page||'CAP-T04-Setup.dc.html'}">${locked?'Build your own assessment':'Open assessment'} →</a></div><form class="client-library-filters"><div class="field"><label for="bank-search">Search items</label><div class="search search-md" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><input class="input search-input" id="bank-search" type="search" placeholder="Search wording or standard" autocomplete="off"><span class="tooltip-wrap search-clear"><button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="Clear search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button><span class="tooltip" role="tooltip">Clear search</span></span></div></div><div class="field"><label for="bank-grade">Grade</label><select id="bank-grade"><option value="">All grades</option><option>5</option><option>6</option><option>8</option></select></div><div class="field"><label for="bank-type">Item type</label><select id="bank-type"><option value="">All types</option><option>Multiple choice</option><option>Text entry</option><option>Extended text</option></select></div></form><p class="client-small">Existing Cognia items first. Plan access is a prototype illustration; final packaging is pending.</p><div id="bank-feedback" role="status"></div><div id="client-bank-list"></div><section id="client-authored-items" class="client-item-review"><h2>Your authored items</h2><p>Drafts and approved versions are separate from complete forms.</p>${Object.entries(ledger()).map(([key,r])=>`<div class="client-saved-row"><div><b>${escape(r.question.stem)}</b><p>Version ${r.version} · ${r.status==='approved'?'Approved':'Draft — review required'}</p></div><button class="btn ghost btn-ghost btn-lg" data-view-authored="${escape(key)}">View item</button></div>`).join('')||'<p>No authored items yet. Write a question in the Builder to start.</p>'}</section>`;
  const draw=()=>{const current=model(),t=current?.tests.find(t=>t.id===current.active),term=root.querySelector('#bank-search').value.trim().toLowerCase(),grade=root.querySelector('#bank-grade').value,type=root.querySelector('#bank-type').value,plus=(instance?.state.plan||localStorage.getItem('cogniaProtoPlan'))!=='Basic';const items=all.filter(q=>(!term||(q.stem+' '+q.standard).toLowerCase().includes(term))&&(!grade||q.grade===grade)&&(!type||q.type===type));root.querySelector('#client-bank-list').innerHTML=`<p role="status">${items.length} matching items</p>`+items.map(q=>{const added=t?.questions?.some(existing=>fingerprint(existing)===fingerprint(q)),disabled=locked||added||(q.tier==='plus'&&!plus);return `<article class="client-saved-row"><span class="client-icon">${icon}</span><div class="grow"><b>${escape(q.stem)}</b><p>Grade ${q.grade} · ${escape(q.subject)} · ${escape(q.standard)} · ${escape(q.type)} · ${q.marks} ${q.marks===1?'point':'points'}${q.tier==='plus'?' · Classroom+ preview':''}</p></div><button class="btn ghost btn-ghost btn-lg" data-bank-preview="${q.id}">Preview</button><button class="btn ghost btn-ghost btn-lg" data-bank-add="${q.id}" ${disabled?'disabled':''}>${added?'Added':locked?'Builder required':q.tier==='plus'&&!plus?'Classroom+ required':'Use in assessment'}</button></article>`;}).join('')||'<p>No matching items. Try another filter.</p>';};
  root.querySelector('form').onsubmit=e=>e.preventDefault();root.addEventListener('input',draw);root.addEventListener('change',draw);root.addEventListener('click',e=>{const preview=e.target.closest('[data-bank-preview]'),add=e.target.closest('[data-bank-add]'),auth=e.target.closest('[data-view-authored]');if(preview){const q=all.find(q=>q.id===preview.dataset.bankPreview);modal('Cognia item',`<h3>${escape(q.stem)}</h3>${q.options?.length?'<ol type="A">'+q.options.map(o=>`<li>${escape(o)}</li>`).join('')+'</ol>':''}<p><b>Answer key:</b> ${escape(answer(q))}</p>`);}if(add&&!add.disabled){const q=all.find(q=>q.id===add.dataset.bankAdd),m=model();if(!m)return;const t=m.tests.find(t=>t.id===m.active);t.state||={chosen:[],written:{},edits:{}};t.state.written||={};t.state.chosen.push(q.id);t.state.written[q.id]=q;t.questions||=[];t.questions.push(q);put('cogniaAssessmentTestsV1',m);root.querySelector('#bank-feedback').textContent='Item added to '+t.title+'.';draw();}if(auth){const r=ledger()[auth.dataset.viewAuthored];modal('Authored item',`<p>Version ${r.version} · ${escape(r.status)} · ${escape(r.test)}</p><h3>${escape(r.question.stem)}</h3><p><b>Answer key:</b> ${escape(answer(r.question))}</p><p>${r.status==='approved'?'Approved by '+escape(r.approvedBy):'Review this item in its source assessment before assigning.'}</p>`);}});draw();
 }
 function renderSaved(){const root=document.querySelector('.manage-assessments');if(!root)return;const entries=archive(),stats=e=>e.model.tests.reduce((n,t)=>n+(t.questions?.length||0),0)+' questions · '+e.model.tests.length+' tests';
  const grid=root.querySelector('.manage-draft-grid'),drafts=entries.filter(e=>e.status==='draft'&&(new URLSearchParams(location.search).get('view')!=='ready'||(!pending(e.model).length&&e.model.tests.some(t=>t.questions?.length))));
  if(grid){const template=grid.querySelector('.manage-folder')?.cloneNode(true)||root._draftTemplate;root._draftTemplate=template;if(template){grid.replaceChildren();for(const e of drafts){const card=template.cloneNode(true);card.querySelector('h3').textContent=e.title;card.querySelector('p').textContent=e.model.tests.map(t=>'Grade '+t.grade+' · '+t.subject).filter((v,i,a)=>a.indexOf(v)===i).join(' / ');card.querySelector('.manage-draft-meta').textContent=stats(e);card.querySelector('.manage-draft-bottom>span').textContent=e.sample?'Example draft · editable':'Saved in this browser';card.querySelector('.manage-options')?.remove();card.querySelectorAll('a').forEach(a=>{a.href='CAP-T06-Review.dc.html';a.dataset.restoreWork=e.id;});grid.append(card);}if(!drafts.length)grid.innerHTML='<p>No saved assessments here yet. Create an assessment or browse the Assessment Library.</p>';}}
  const banked=root.querySelector('.manage-banked'),recent=root.querySelector('.manage-recent');banked?.querySelector('.manage-bank-card')?.remove();recent?.querySelector('.manage-recent-row')?.remove();const collection=banked?.querySelector('.manage-library b');if(collection)collection.textContent='Your banked assessments';
  for(const [container,status] of [[banked,'banked'],[recent,'assigned']]){if(!container)continue;container.querySelectorAll('[data-live-assessment]').forEach(e=>e.remove());for(const e of entries.filter(e=>e.status===status)){const row=document.createElement('article');row.className='client-saved-row';row.dataset.liveAssessment=e.id;row.innerHTML='<div><b>'+escape(e.title)+'</b><p>'+stats(e)+' · '+(status==='assigned'?'Assigned':'Banked for later')+'</p></div>'+(status==='assigned'?'<a class="btn ghost btn-ghost btn-lg" href="CAP-T10-Scheduled.dc.html" data-open-scheduled="'+e.id+'">View assignment →</a>':'<button class="btn ghost btn-ghost btn-lg" data-restore-work="'+e.id+'">Use assessment →</button>');container.querySelector('.manage-section-heading')?.after(row);}}
 }

 function apply(){
  if(!teacher)return;sync();
  document.querySelectorAll('.hubmod').forEach(el=>el.textContent='Classroom Assessment');
  document.querySelectorAll('a[href="CAP-T12-QuestionLibrary.dc.html"]').forEach(el=>{if(el.textContent.trim()==='Question Library')el.textContent='Item banks';});
  const m=page==='CAP-T10-Scheduled.dc.html'?read('cogniaScheduledAssessmentTests',model()):model(),records=ledger();
  document.querySelectorAll('.acctnote').forEach(el=>{if(/prototype/i.test(el.textContent))el.textContent='Plan preview only · pricing and entitlements pending confirmation.';});
  document.querySelectorAll('.appt').forEach(el=>{const label=el.querySelector('span:last-child');if(label?.textContent.trim()==='Formative')label.textContent='Classroom Assessment';});
  // Interim purchase is independent of the illustrative Basic / Plus preview.
  document.querySelectorAll('.appt.d-In').forEach(el=>{if(localStorage.getItem('cogniaInterimPurchasedV1')!=='true')el.remove();});
  document.querySelectorAll('.appt.d-Sc').forEach(el=>{el.title='Screeners · availability and permissions pending';});
  const entries=archive(),ready=entries.filter(e=>e.status==='draft'&&e.model.tests.some(t=>t.questions?.length)&&!pending(e.model).length);
  if(page==='CAP-T01-Overview.dc.html'){
   const hero=document.querySelector('.reference-folder-content');if(hero){hero.querySelector('h2').textContent='Classroom assessments';hero.querySelector('.tag').textContent='Assessment Builder';hero.querySelector('p').textContent='Start with existing Cognia items and add questions where needed. Or choose a complete assessment from the library.';const create=hero.querySelector('.reference-create');create.lastChild.textContent='Build an assessment';if(!hero.querySelector('.client-library-link')){const link=document.createElement('a');link.className='client-library-link';link.href='CAP-T21-AssessmentLibrary.dc.html';link.textContent='Browse ready-to-use assessments →';hero.append(link);}}
   const draft=entries.find(e=>e.status==='draft'),row=document.querySelector('.reference-draft-row');if(draft&&row){row.querySelector('.reference-row-copy b').textContent=draft.title;row.querySelector('.reference-row-copy p').textContent=draft.model.tests.length+' tests · '+draft.model.tests.reduce((n,t)=>n+(t.questions?.length||0),0)+' questions';row.querySelector('.tag').textContent='Saved in this browser';row.querySelectorAll('a').forEach(a=>{a.dataset.restoreWork=draft.id;});}document.querySelectorAll('.reference-sectionhead a').forEach(a=>{if(/drafts/i.test(a.textContent))a.href='CAP-T03-Assessments.dc.html?view=drafts';});
  }
  const tiles=document.querySelectorAll('.reference-kpi');if(tiles.length){const draftCount=entries.filter(e=>e.status==='draft').length;tiles[0].querySelector('b,strong')?.replaceChildren(document.createTextNode(String(draftCount)));if(tiles[1]){tiles[1].href='CAP-T03-Assessments.dc.html?view=ready';tiles[1].querySelector('b,strong')?.replaceChildren(document.createTextNode(String(ready.length)));}}
  document.querySelectorAll('.manage-attention a').forEach(a=>{if(/Ready to assign/.test(a.textContent)){a.href='CAP-T03-Assessments.dc.html?view=ready';const p=a.querySelector('p');if(p)p.textContent=ready.length+' saved assessments have no outstanding item approvals.';}});
  const attention=document.querySelector('.manage-attention');if(attention){attention.querySelector('#client-review-attention')?.remove();const entry=entries.find(e=>e.status==='draft'&&pending(e.model).length);if(entry){const row=document.createElement('div');row.id='client-review-attention';row.className='client-saved-row';row.innerHTML='<div><b>Items need your review</b><p>'+pending(entry.model).length+' items in '+escape(entry.title)+'</p></div><button class="btn ghost btn-ghost btn-lg" data-review-assessment="'+escape(entry.id)+'">Review items →</button>';attention.append(row);}}
  if(page==='CAP-T03-Assessments.dc.html'&&new URLSearchParams(location.search).get('view')==='ready'){
   document.querySelector('.manage-assessments').dataset.view='drafts';document.querySelector('.manage-hero h1').textContent='Ready to assign';document.querySelector('.manage-hero p').textContent='Saved assessments with no outstanding item approvals. Check settings before assigning.';
  }
  if(page==='CAP-T04-Setup.dc.html'){
   const form=document.getElementById('setupForm');if(form&&!form.dataset.scopeReady){form.dataset.scopeReady='true';const t=m?.tests.find(t=>t.id===m.active),grade=document.getElementById('grade'),subject=document.getElementById('subject');grade.innerHTML='<option>5</option><option>6</option><option>8</option>';grade.value=['5','6','8'].includes(t?.grade)?t.grade:'5';const updateScope=()=>{const sample=forms.find(f=>f.grade===grade.value);subject.innerHTML='<option>'+sample.subject+'</option>';const panel=document.getElementById('standardsPanel');panel.innerHTML='<p class="client-small">Sample content for this scope. The full standards catalogue is pending.</p><label class="standard-option"><input type="radio" name="standard" value="'+sample.standard+'" checked> <b>'+sample.standard+'</b><span> '+sample.title+'</span></label>';};grade.addEventListener('change',updateScope);updateScope();}
  }
  if(isQuestions){const hint=document.querySelector('.panelhead p');if(hint)hint.textContent='Start with existing Cognia items. Write or generate questions to fill gaps.';document.querySelectorAll('.selected-q').forEach((el,i)=>{el.querySelector('.client-item-state')?.remove();const t=m?.tests.find(t=>t.id===m.active),q=t?.questions?.[i];if(!q)return;const rec=records[t.id+'/'+q.id],badge=document.createElement('span');badge.className='client-item-state badge badge-'+(rec?.status==='approved'?'success':'secondary');badge.textContent=required(t,q)?`${rec?.status==='approved'?'Approved':'Draft · review required'} · v${rec?.version||1}`:'Cognia item · approved';el.append(badge);});}
  if(isQuestions||isReview)document.querySelector('.assessment-test-list>.test-list-heading>a')?.remove();
  if(isQuestions){const search=document.getElementById('search'),type=document.getElementById('typeFilter');if(search)search.value=questionFilter.term;if(type)type.value=questionFilter.type;for(const [id,key] of Object.entries({bankGrade:'grade',bankSubject:'subject',bankStandard:'standard',bankDok:'dok'})){const field=document.getElementById(id);if(field)field.value=questionFilter[key];}filterQuestions();}
  if(m?.active)document.querySelectorAll('.stepper a[href="CAP-T05-Questions.dc.html"],.actionbar a[href="CAP-T05-Questions.dc.html"]').forEach(a=>a.href=m.tests.find(t=>t.id===m.active)?.page||a.href);
  if(page==='CAP-T20-Interim.dc.html'){const content=document.querySelector('main');if(content)content.innerHTML='<div class="page"><div class="head"><div><h1>Interim Assessments</h1><p>Teachers administer assessments made available by their school or district. Interim creation is an administrator task.</p></div></div><p>No purchased interim catalogue has been configured in this local preview.</p><a class="btn ghost btn-ghost btn-lg" href="CAP-T01-Overview.dc.html">Back to classroom assessments →</a></div>';}
  if(isReview)document.getElementById('client-item-review')?.remove();
  const header=document.querySelector('.head');if((page==='CAP-T01-Overview.dc.html'||page==='CAP-T03-Assessments.dc.html')&&!document.getElementById('client-library-entry')){const block=document.createElement('div');block.id='client-library-entry';block.className='client-library-entry';block.innerHTML=`<div><b>Looking for a complete assessment?</b><p>Browse ready-to-use Cognia forms and assign without rebuilding.</p></div><a class="btn ghost btn-ghost btn-lg" href="CAP-T21-AssessmentLibrary.dc.html">Browse Assessment Library →</a>`;(header||document.querySelector('.manage-hero'))?.after(block);}
  if(page==='CAP-T12-QuestionLibrary.dc.html'&&!document.getElementById('client-authored-items')){const authored=Object.entries(records).filter(([,r])=>r.status==='approved'||r.status==='draft'),section=document.createElement('section');section.id='client-authored-items';section.className='client-item-review';section.innerHTML=`<h2>Your authored items</h2><p>Drafts and approved versions are separate from complete assessment forms.</p>${authored.length?authored.map(([key,r])=>`<div class="client-saved-row"><div><b>${escape(r.question.stem)}</b><p>Version ${r.version} · ${escape(r.status)} · ${escape(r.test)}</p></div><a href="CAP-T06-Review.dc.html" class="btn ghost btn-ghost btn-lg">Review in assessment →</a></div>`).join(''):'<p>No authored items yet. Write a question in the Builder to start.</p>'}`;document.querySelector('main>.page')?.append(section);}
  /* 17 Nov: library assessments keep the normal stepper links (no jump back to the library). */
  document.querySelectorAll('.appquick a,.appquick button').forEach(el=>{if(/create.*interim/i.test(el.textContent))el.remove();});
  document.querySelectorAll('a[href="CAP-T20-Interim.dc.html"]').forEach(el=>{if(/create/i.test(el.textContent))el.textContent='Administer interim';});
  /* 17 Nov: library assessments now go through the same four steps as any test. Back from Assign lands on step 2,
     and Back from step 2 lands on step 1/4 (the item builder, showing the library items), not on the library page. */
  if(m?.origin==='library'&&isReview&&new URLSearchParams(location.search).get('stage')!=='details')location.replace('CAP-T06-Review.dc.html?stage=details');
  if(page==='CAP-T09-ConfirmAssignment.dc.html'){const title=document.querySelector('.reviewgrid>section h2');if(title&&m)title.textContent=m.title;}
  if(page==='CAP-T10-Scheduled.dc.html'&&m){const subtitle=document.querySelector('.success>p'),delivery=read('cogniaDeliverySessions',{});if(subtitle)subtitle.textContent=m.title+' · '+(delivery.classId==='5b'?'Grade 5B':'Grade 5A');}
  if(page==='CAP-T07-DraftSaved.dc.html'&&m){const subtitle=document.querySelector('.success>p');if(subtitle)subtitle.textContent=m.title+' is saved in this browser. Continue when you are ready.';const card=document.querySelector('.successcard'),questions=m.tests.flatMap(t=>t.questions||[]);if(card){card.querySelector('h2').textContent=m.title;card.querySelector('.tag').textContent=pending(m).length?'Draft · item review required':'Draft · items ready';card.querySelector('p').textContent=m.tests.length+' tests · '+m.tests.map(t=>'Grade '+t.grade+' '+t.subject).join(' / ');card.querySelector('.successstats').innerHTML='<div><b>'+questions.length+'</b><small>Questions</small></div><div><b>'+questions.reduce((n,q)=>n+Number(q.marks||1),0)+'</b><small>Total points</small></div><div><b>'+escape(m.settings?.limit||read('cogniaAssessmentWork',{}).limit||'None')+'</b><small>Time limit</small></div>';}const assign=document.querySelector('.successactions a[href="CAP-T08-AudienceDelivery.dc.html"]');if(assign){assign.href='CAP-T06-Review.dc.html';assign.textContent='Review & assign →';}}
  renderSaved();
 }
 if(teacher){const update=instance?.update;if(update)instance.update=()=>{update();apply();if(page==='CAP-T21-AssessmentLibrary.dc.html')renderLibrary();renderBank();};apply();renderLibrary();renderBank();}
 document.addEventListener('click',event=>{
  const reviewAssessment=event.target.closest('[data-review-assessment]');if(reviewAssessment){const entry=archive().find(e=>e.id===reviewAssessment.dataset.reviewAssessment);if(entry){preserveCurrent();put('cogniaAssessmentTestsV1',entry.model);location.href='CAP-T06-Review.dc.html';}return;}
  const preview=event.target.closest('[data-action="assignmentPreview"]');if(preview){const m=model();modal('Assessment content',m.tests.map(t=>`<h3>${escape(t.title)}</h3>${(t.questions||[]).map((q,i)=>`<p>${i+1}. ${escape(q.stem)}</p>`).join('')}`).join(''));}
  const el=event.target.closest('[data-preview-form],[data-start-form],[data-review-item],[data-restore-work],[data-open-scheduled]');if(!el)return;
  if(el.dataset.previewForm)libraryPreview(el.dataset.previewForm);
  if(el.dataset.startForm)startForm(el.dataset.startForm);
  if(el.dataset.reviewItem)approvalDialog(el.dataset.reviewItem);
  if(el.dataset.restoreWork){event.preventDefault();openSaved(el.dataset.restoreWork);}
  if(el.dataset.openScheduled){const entry=archive().find(e=>e.id===el.dataset.openScheduled);if(entry){put('cogniaScheduledAssessmentTests',entry.model);if(entry.delivery)put('cogniaDeliverySessions',entry.delivery);}}
 });
 document.addEventListener('click',event=>{
  if(!teacher)return;const a=event.target.closest('a'),bank=event.target.closest('[data-bank]');
  if(bank){const m=model();if(!m?.tests?.length||m.tests.some(t=>!t.questions?.length)){event.preventDefault();event.stopImmediatePropagation();return;}saveSnapshot('banked');return;}
  if(!a)return;const href=a.getAttribute('href')||'';
  if(href==='CAP-T04-Setup.dc.html'&&/create|build your own|build from scratch/i.test(a.textContent)){preserveCurrent();const id='test-'+Date.now();put('cogniaAssessmentTestsV1',{title:'New classroom assessment',active:id,origin:'builder',tests:[{id,title:'New classroom assessment',grade:'5',subject:'Mathematics',standard:'5.NF.A.1',page:'CAP-T05-Questions.dc.html',state:{chosen:[],written:{},edits:{}},questions:[]}]});}
  if(href==='CAP-T07-DraftSaved.dc.html')saveSnapshot('draft');
  /* 13 Nov: no item approval step; teachers continue without the Review item dialog. */
  if(isReview&&model()?.origin!=='library'&&href==='CAP-T08-AudienceDelivery.dc.html'&&!document.getElementById('reviewed')?.checked){event.preventDefault();event.stopImmediatePropagation();const input=document.getElementById('reviewed');input?.setCustomValidity('Check the assessment settings and student instructions before continuing.');input?.reportValidity();input?.addEventListener('change',()=>input.setCustomValidity(''),{once:true});return;}
  if(isReview&&href==='CAP-T08-AudienceDelivery.dc.html'){const m=model();m.itemVersions=m.tests.flatMap(t=>(t.questions||[]).map(q=>{const r=ledger()[t.id+'/'+q.id];return {testId:t.id,itemId:q.id,version:r?.version||1,status:required(t,q)?r?.status:'Cognia approved',approvedAt:r?.approvedAt||null};}));m.settings={...m.settings,instructions:document.getElementById('instructions')?.value||'',limit:document.getElementById('timeLimit')?.value||'None'};put('cogniaAssessmentTestsV1',m);const delivery=read('cogniaDeliverySessions',null);if(delivery){delivery.time=m.settings.limit;put('cogniaDeliverySessions',delivery);}}

 },true);
 if(page==='CAP-T09-ConfirmAssignment.dc.html')document.addEventListener('click',event=>{
  if(!event.defaultPrevented&&event.target.closest('a[href="CAP-T10-Scheduled.dc.html"]'))saveSnapshot('assigned');
 });
 document.addEventListener('click',event=>{
  if(!teacher)return;
  const preview=event.target.closest('.qpreview'),student=event.target.closest('[data-action="preview"],a[href="STU2-Classroom.dc.html"]');
  if(preview&&isQuestions){event.preventDefault();event.stopImmediatePropagation();const cards=[...document.querySelectorAll('#libraryList .question-card')],index=cards.indexOf(preview.closest('.question-card')),item=instance.bankItems()[index],q=instance.state.edits?.[item.id]||item;modal('Preview & answer key',`<h3>${escape(q.stem)}</h3>${q.options?.length?'<ol type="A">'+q.options.map(o=>`<li>${escape(o)}</li>`).join('')+'</ol>':''}<p><b>Answer key:</b> ${escape(answer(q))}</p>`);}
  if(student&&(isQuestions||isReview||page==='CAP-T07-DraftSaved.dc.html')){event.preventDefault();event.stopImmediatePropagation();const m=model();modal('Student preview',`<p>${escape(m.title)} · Preview only</p>${m.tests.map(t=>`<h3>${escape(t.title)}</h3>${t.questions.map((q,i)=>`<section class="client-preview-question"><h3>${i+1}. ${escape(q.stem)}</h3>${q.options?.length?q.options.map((o,k)=>`<p>${'ABCD'[k]}. ${escape(o)}</p>`).join(''):'<p>Student response area</p>'}</section>`).join('')}`).join('')}`);}
  if(page==='CAP-T07-DraftSaved.dc.html'&&event.target.closest('[data-action="download"]')){event.preventDefault();event.stopImmediatePropagation();const m=model(),url=URL.createObjectURL(new Blob([JSON.stringify(m,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=(m.title.replace(/[^a-z0-9 -]/gi,'')||'assessment')+'-draft.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 },true);
});
