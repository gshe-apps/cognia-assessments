/* Reference-led composition of existing setup fields and item composer. */
(() => {
 const read=()=>{try{return JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'))}catch{return null}};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 const icon=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 function mount(){
  window.capSyncCreationGate?.();
  const host=document.querySelector('main>.page');
  if(host?.classList.contains('uc-page')){
   host.querySelectorAll('.tf-test-disclosure,.extra-test,.assessment-test-list,.uc-help').forEach(el=>{const error=el.querySelector('#test-flow-error');if(error)host.append(error);el.remove()});
  }
  document.querySelectorAll('.uc-page .question-card h4').forEach(title=>{title.title=title.textContent.trim()});
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{
   let tags=row.querySelector('.uc-bank-tags');
   if(!tags){tags=make('<div class="uc-bank-tags"></div>');row.append(tags);}
   const type=row.querySelector('.row > .tiny');
   if(type){
    type.className='tiny text-body-small text-muted-foreground';
    const label=type.textContent.trim();
    type.textContent=({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[label]||label);
    tags.querySelector('.tiny')?.remove();
    tags.append(type);
   }
   const dok=row.dataset.bankDok;
   if(dok&&!row.querySelector(':scope > .bank-row-difficulty')){
    const tone={'1':'success','2':'warning','3':'destructive'}[dok]||'secondary';
    const badge=make('<span class="bank-row-difficulty badge badge-'+tone+'"><span>DOK</span> <span></span></span>');
    badge.lastElementChild.textContent=dok;
    row.prepend(badge);
   }
   if(row.dataset.bankStandard&&!tags.querySelector('.bank-row-standard')){
    const standard=make('<span class="bank-row-standard text-body-small text-muted-foreground"></span>');
    standard.textContent=row.dataset.bankStandard;
    tags.append(standard);
   }
  });
  const page=document.querySelector('main>.page'),methods=page?.querySelector('.qc-methods');if(!methods||page.querySelector('.uc-setup-intro'))return;
  observer.disconnect();page.classList.add('uc-page');document.body.classList.add('unified-create-screen');document.body.classList.remove('cap-monochrome');
  const m=read(),t=m?.tests?.find(t=>t.id===m.active)||m?.tests?.[0];if(!t){observe();return;}
  const scopePage=t.subject==='English'?'CAP-T05-Reading.dc.html':t.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
  if(scopePage!==location.pathname.split('/').pop()){
   t.state||={chosen:[],written:{},edits:{}};t.state.written={...t.state.written,...Object.fromEntries((t.questions||[]).map(q=>[q.id,q]))};t.page=scopePage;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(m));location.replace(scopePage);return;
  }
  const hero=page.querySelector('.tf-hero');hero.querySelector('h1').textContent='Create your test';hero.querySelector('p')?.remove();const intro=make('<div class="uc-setup-intro"><span class="uc-eyebrow">Create assessment</span><h1>Set up your assessment by creating a test</h1></div>');hero.querySelector('h1').replaceWith(intro);
  page.querySelector('.tf-back')?.remove();
  page.querySelector('.tf-steps a').href=t.page;
  hero.append(page.querySelector('.tf-steps'));page.querySelector('.tf-top')?.remove();
  const layers=icon('<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />');
  const progress=hero.querySelector('.tf-steps');
  window.capRenderAssessmentProgress(progress,1,[
   'href="#uc-assessment-details" data-uc-details','href="#uc-question-methods"',
   'href="CAP-T06-Review.dc.html?stage=details" data-uc-review','data-uc-later-step','data-uc-later-step'
  ]);
  methods.id='uc-question-methods';
  const {create,itemPage,libraryPath,signature}=window.capAssessmentSetup;
  const readyKey='capCreateConfirmed:'+t.id;
  const useClientSample=sessionStorage.getItem('capSetupUseClientSample')==='true';
  sessionStorage.removeItem('capSetupUseClientSample');
  const addedTest=m.tests.indexOf(t)>0;
  let settings=useClientSample?{...t,title:'New classroom test',standard:'5.NF.A.2'}:addedTest?{...t,testName:t.title,assessmentSettings:m.settings}:{...t,title:m.title||t.title,testName:t.title,assessmentSettings:m.settings};
  let ready=sessionStorage.getItem(readyKey)===signature(settings);
  let syncBankScope=()=>{};
  const setup=create({
   showAssessmentTitle:!addedTest,
   host:page.closest('.theme-assessments'),
   initial:settings,
   onClose:()=>{
    if(!ready){location.href='CAP-T03-Assessments.dc.html';return}
    hero.querySelector('[data-uc-details]').focus();
   },
   onSubmit(next){
   const {title:nextTitle,testName:nextTestName,assessmentSettings,...scope}=next;if(nextTestName)scope.title=nextTestName;
   const patch=addedTest?{...scope,title:nextTestName||next.title}:scope;
   let model=window.capUpdateAssessmentScope(patch,addedTest?'':nextTitle);
   if(assessmentSettings){model.settings={...(model.settings||{}),...assessmentSettings};model=window.capUpdateAssessmentScope({},'');}
   const updated=model.tests.find(test=>test.id===model.active)||model.tests[0];
   settings=addedTest?{...updated,testName:updated.title,assessmentSettings:model.settings}:{...updated,title:model.title,testName:updated.title,assessmentSettings:model.settings};
   sessionStorage.setItem(readyKey,signature(addedTest?{...next,title:patch.title}:next));
   ready=true;syncGate();
   syncBankScope();
   inst.refreshQuestionBoard?.();
   if(next.pathway===libraryPath){location.href='CAP-T21-AssessmentLibrary.dc.html';return}
   const destination=itemPage(next);
   if(destination!==location.pathname.split('/').pop()){
    settings.state||={chosen:[],written:{},edits:{}};
    settings.state.written={...settings.state.written,...Object.fromEntries((settings.questions||[]).map(q=>[q.id,q]))};
    settings.page=destination;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));location.href=destination;
   }
   }
  });
  const openSetup=()=>setup.open(settings);
  hero.querySelector('[data-uc-details]').onclick=e=>{e.preventDefault();openSetup()};
  const notice=make('<p class="uc-gate-notice" role="status">Complete test details to add items.</p>');methods.before(notice);
  function syncGate(){
   methods.inert=!ready;page.querySelector('.buildergrid').inert=!ready;
   methods.setAttribute('aria-disabled',String(!ready));page.querySelector('.buildergrid').setAttribute('aria-disabled',String(!ready));
   methods.querySelectorAll('button').forEach(button=>button.disabled=!ready);
   notice.hidden=ready;page.classList.toggle('uc-locked',!ready);
   hero.querySelector('h1').textContent=ready?'Add your items':'Create your test';
   hero.querySelectorAll('.tf-steps a').forEach((link,i)=>{
    link.classList.toggle('active',i===(ready?1:0));
    link.classList.toggle('done',ready&&i===0);
    link.setAttribute('aria-current',i===(ready?1:0)?'step':'false');
   });
   return ready;
  }
  window.capSyncCreationGate=syncGate;
  syncGate();
  if(!ready)openSetup();
  methods.className='qc-methods tabs-list';
  methods.querySelectorAll('[data-qc-method]').forEach(button=>{
   button.className='tab';
   const manual=button.dataset.qcMethod==='manual';
   button.replaceChildren(document.createTextNode(manual?'Create manually':'Use item banks'));
  });
  /* Reuse the runtime's existing multiple-choice form and validation. The old
     conditional drawer is detached by the legacy page composition. */
  const inst=window.cogniaPreview;
  /* Create manually: the item form sits in the left panel (no modal). It reuses the runtime's
     multiple-choice validation through openWrite/saveWrite. */
  /* Create manually: the AI-assisted item form (Figma 1568:8754) sits in the left panel and the right
     panel swaps to Item analysis or Learner supports. It saves through the runtime's openWrite/saveWrite. */
  const manualPanel=page.querySelector('.qc-manual');
  window.capItemQuality?.mount(manualPanel,{settings,inst});
  page.querySelector('.ef-decision-note')?.remove();
  const library=page.querySelector('.library');
  const toolbar=make('<div class="uc-bank-toolbar"></div>'),search=library.querySelector('#search'),type=library.querySelector('#typeFilter');
  const searchBox=make('<div class="search search-md uc-search-control" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg></div>');const oldSearch=search.closest('.field');const searchClear=search.parentElement.querySelector('.search-clear');search.placeholder='Search items';search.setAttribute('aria-label','Search items');search.classList.add('input','search-input');searchBox.append(search);if(searchClear)searchBox.append(searchClear);toolbar.append(searchBox);oldSearch?.remove();library.querySelectorAll('.search').forEach(el=>{if(!el.querySelector('input'))el.remove()});
  const dok=library.querySelector('#bankDok')||make('<select id="bankDok" aria-label="Filter by DOK"><option value="">DOK</option><option>DOK 1</option><option>DOK 2</option><option>DOK 3</option></select>');
  toolbar.append(dok);type.setAttribute('aria-label','All types');toolbar.append(type);
  toolbar.querySelectorAll('select').forEach(select=>{
   const control=make('<div class="uc-bank-select-control select-wrap"></div>');
   select.classList.add('select');
   select.before(control);
   control.append(select);
  });
  library.querySelector('.approved-bank-heading')?.after(toolbar);if(!toolbar.isConnected)library.prepend(toolbar);
  const removeIcon=icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
  const itemSummary=make('<div class="uc-item-summary"></div>');
  // Bank selection filters the library without changing the items already in the test.
  const picker=window.capBankPicker;
  if(picker){
   const bankKey='cogniaBuilderBank:'+t.id;
   const banks=picker.builderCollections;
   const banksById=new Map(banks.map(bank=>[bank.id,bank]));
   const cogniaBanks=banks.filter(bank=>bank.group==='cognia');
   const gradeOf=bank=>bank.match[0].split(' ')[1];
   const subjectOf=bank=>bank.match[0].endsWith(' ELA')?'ELA':'Mathematics';
   const scopeKey=()=>settings.grade+':'+settings.subject;
   const defaultBank=()=>cogniaBanks.find(bank=>gradeOf(bank)===String(settings.grade)
    &&subjectOf(bank)===(settings.subject==='English'?'ELA':'Mathematics'))?.id||'';
   const defaultSelection=()=>[defaultBank()].filter(Boolean);
   let setupScope=scopeKey();
   let selected=new Set(defaultSelection());
   try {
    const saved=JSON.parse(sessionStorage.getItem(bankKey));
    if(saved?.scope===setupScope){
     const ids=Array.isArray(saved.ids)?saved.ids:saved.id===''?[]:[saved.id];
     const valid=ids.filter(id=>banksById.has(id));
     if(valid.length||!ids.length)selected=new Set(valid);
    }
   } catch {}

   const rowGroups={cognia:'cognia',mine:'teacher',specialist:'specialist'};
   const itemContext=row=>{
    const standard=row.dataset.bankStandard||'';
    const match=standard.match(/^(?:([A-Z]+)\.)?(\d+)\./);
    return {
     grade:match?.[2]||String(settings.grade),
     subject:match?(match[1]?'English':'Mathematics'):settings.subject
    };
   };
   const matchesBank=(row,bank)=>{
    if(row.dataset.itemBank!==rowGroups[bank.group])return false;
    const {grade,subject}=itemContext(row);
    const itemScope='Grade '+grade+(subject==='English'?' ELA':' Maths');
    return bank.match.includes(itemScope);
   };
   const matchingBank=row=>[...selected].map(id=>banksById.get(id)).find(bank=>matchesBank(row,bank));
   window.capBuilderBankMatch=row=>selected.size?Boolean(matchingBank(row)):row.dataset.itemBank==='cognia';
   window.capBuilderBankContext=row=>({...itemContext(row),bank:matchingBank(row)?.name||picker.banks[0].name});

   const dropdown=picker.createDropdown({
    banks,
    selected,
    canOpen:()=>ready,
    countFor:bank=>[...library.querySelectorAll('#libraryList .question-card')].filter(row=>matchesBank(row,bank)).length,
    onChange:saveSelection,
   });
   function saveSelection(){
    try{sessionStorage.setItem(bankKey,JSON.stringify({scope:setupScope,ids:[...selected]}));}catch {}
    window.capFilterBuilderQuestions?.();
   }
   syncBankScope=()=>{
    if(setupScope===scopeKey())return;
    setupScope=scopeKey();
    selected.clear();
    defaultSelection().forEach(id=>selected.add(id));
    dropdown.refresh();
    saveSelection();
   };
   page.addEventListener('click',event=>{
    if(event.target.closest('[data-qc-method]'))dropdown.close();
   });
   library.prepend(dropdown.field);
   itemSummary.append(dropdown.selection);
  }
  library.querySelector('#libraryList').after(make('<div class="empty-state" data-bank-empty role="status" hidden><span class="empty-media" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><p class="empty-title">No items match</p><p>Try another search, or change the item banks or filters.</p></div>'));
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').textContent='Find and add items';
  bankHeading.classList.add('uc-methods-row');
  page.querySelector('.buildergrid').before(bankHeading);
  bankHeading.querySelector('h2').className='sr-only';
  page.querySelector('.buildergrid>section')?.classList.remove('card');
  const board=page.querySelector('.qc-board');
  if(board){
   board.querySelector('.qc-board-header .uc-board-icon')?.remove();
   board.querySelector('.qc-board-header h2')?.classList.add('text-body-small','text-muted-foreground');
   const clear=board.querySelector('[data-qc-clear]');if(clear){clear.classList.remove('is-destructive','qc-destructive','btn-lg');clear.classList.add('btn-sm')}
   board.querySelector('.qc-preview-list')?.classList.add('card');
  }
  bankHeading.append(methods);
  methods.setAttribute('aria-label','Choose how to add items');
  methods.setAttribute('role','group');
  const extraFilters=make('<details class="uc-extra-filters"><summary class="btn btn-ghost btn-icon btn-sm" aria-label="Filters" title="Filters">'+icon('<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>')+'</summary><div class="filters uc-filter-fields"></div></details>');
  const filterFields=extraFilters.querySelector('.filters');
  filterFields.append(...toolbar.querySelectorAll('.uc-bank-select-control'));
  library.querySelectorAll('.filters').forEach(filters=>{
   filterFields.append(...filters.children);
   filters.remove();
  });
  const gradeFilter=filterFields.querySelector('#bankGrade');
  const subjectFilter=filterFields.querySelector('#bankSubject');
  const standardFilter=filterFields.querySelector('#bankStandard');
  for(const field of [gradeFilter,subjectFilter]){
   if(field)field.selectedIndex=0;
  }
  if(gradeFilter&&!Array.from(gradeFilter.options).some(option=>option.value==='7')){
   gradeFilter.add(new Option('Grade 7','7'),gradeFilter.querySelector('[value="8"]'));
  }
  if(standardFilter){
   const standards=[...new Set(inst.renderVals().bank.map(item=>item.standard).filter(Boolean))].sort();
   standardFilter.replaceChildren(new Option('All standards',''),...standards.map(code=>new Option(code,code)));
  }
  const count=make('<p class="uc-bank-count text-body-small text-muted-foreground" role="status"></p>');
  itemSummary.prepend(count);toolbar.prepend(itemSummary);
  filterFields.prepend(searchBox);
  /* Only real filter controls in the popover: no empty select wraps (stray chevrons) or info badges. */
  filterFields.querySelectorAll('.select-wrap').forEach(wrap=>{if(!wrap.querySelector('select'))wrap.remove()});
  filterFields.querySelectorAll(':scope > .badge').forEach(badge=>badge.remove());
  const bankField=library.querySelector('.uc-bank-field');
  (bankField||toolbar).append(extraFilters);
  if(bankField){
   const filterTrigger=extraFilters.querySelector('summary');
   document.addEventListener('pointerdown',event=>{
    if(extraFilters.open&&!extraFilters.contains(event.target))extraFilters.open=false;
   });
   extraFilters.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!extraFilters.open)return;
    event.preventDefault();
    extraFilters.open=false;
    filterTrigger.focus();
   });
   const filterChips=make('<div class="chip-list uc-item-filter-chips" role="group" aria-label="Item filters" hidden></div>');
   itemSummary.append(filterChips);
   const selects=[...filterFields.querySelectorAll('select')];
   const defaults=new Map(selects.map(select=>[select,select.value]));
   const renderFilters=()=>{
    const active=selects.filter(select=>select.value&&select.value!==defaults.get(select));
    filterChips.hidden=!active.length;
    filterChips.innerHTML=active.map(select=>{
     const label=select.selectedOptions[0].textContent;
     return `<span class="chip">${esc(label)}<button class="chip-remove" type="button" data-remove-filter="${esc(select.id)}" aria-label="Remove filter: ${esc(label)}">${removeIcon}</button></span>`;
    }).join('');
   };
   filterFields.addEventListener('change',renderFilters);
   filterChips.addEventListener('click',event=>{
    const remove=event.target.closest('[data-remove-filter]');
    if(!remove)return;
    const select=selects.find(control=>control.id===remove.dataset.removeFilter);
    select.selectedIndex=0;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    (filterChips.querySelector('.chip-remove')||filterTrigger).focus();
   });
  }
  window.capFilterBuilderQuestions?.();
  /* Back sits in the floating bar next to Continue (as on the other steps) and reopens the setup modal. */
  const back=make('<button class="btn btn-ghost btn-lg uc-items-back" type="button" data-tf-back="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>Back</button>');
  page.querySelector('.tf-bottom .tf-original-actions')?.before(make('<p class="uc-review-status sr-only" role="status" hidden></p>'));
  inst.refreshQuestionBoard?.();
  page.querySelector('.tf-bottom .solid')?.before(back);
  const actionBar=page.querySelector('.tf-bottom');
  if(actionBar){
   const barSize=new ResizeObserver(()=>page.style.setProperty('--uc-action-bar-height',actionBar.offsetHeight+'px'));
   barSize.observe(actionBar);
  }
  back.onclick=()=>hero.querySelector('[data-uc-details]').click();
  page.querySelectorAll('.tf-bottom a').forEach(a=>{if(a.getAttribute('href')==='CAP-T04-Setup.dc.html'){a.href='CAP-T03-Assessments.dc.html';a.textContent='Back to tests'}});
  page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/CAP-T0[67]-/.test(a.getAttribute('href')||'')){if(!syncGate()){e.preventDefault();e.stopImmediatePropagation();openSetup()}}},true);
  observe();
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});let queued=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();observe()});else{mount();observe()}
})();
