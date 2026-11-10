/* Reference-led composition of existing setup fields and item composer. */
(() => {
 const read=()=>{try{return JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'))}catch{return null}};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 function mount(){
  window.capSyncCreationGate?.();
  const host=document.querySelector('main>.page');
  if(host?.classList.contains('uc-page')){
   host.querySelectorAll('.tf-test-disclosure,.extra-test,.assessment-test-list,.uc-help').forEach(el=>{const error=el.querySelector('#test-flow-error');if(error)host.append(error);el.remove()});
  }
  document.querySelectorAll('.uc-page .question-card h4').forEach(title=>{title.title=title.textContent.trim()});
  const currentModel=read(),currentTest=currentModel?.tests?.find(t=>t.id===currentModel.active)||currentModel?.tests?.[0],bank=window.cogniaPreview?.bankItems?.()||[];
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{const q=bank.find(q=>q.stem===row.querySelector('h4')?.textContent.trim());if(!q)return;if(!row.querySelector('.bank-row-standard')&&currentTest?.standard){const badge=document.createElement('span');badge.className='bank-row-standard badge badge-secondary';badge.textContent=q.standard||currentTest.standard;row.append(badge)}if(!row.querySelector('.bank-row-difficulty')&&q.difficulty){const badge=document.createElement('span');badge.className='bank-row-difficulty badge badge-'+({easy:'success',medium:'warning',hard:'destructive'}[String(q.difficulty).toLowerCase()]||'secondary');badge.textContent=q.difficulty;row.append(badge)}});
  document.querySelectorAll('.uc-page .bank-row-difficulty').forEach(el=>{el.dataset.level=el.textContent.trim().toLowerCase()});
  
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{let tags=row.querySelector('.uc-bank-tags');if(!tags){tags=document.createElement('div');tags.className='uc-bank-tags';row.append(tags)}const type=row.querySelector('.row > .tiny');if(type){type.className='tiny text-body-small text-muted-foreground';type.textContent=({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[type.textContent.trim()]||type.textContent.trim());tags.append(type)}row.querySelectorAll(':scope > .bank-row-difficulty,:scope > .bank-row-standard').forEach(b=>tags.append(b));});
  const page=document.querySelector('main>.page'),methods=page?.querySelector('.qc-methods');if(!methods||page.querySelector('.uc-setup-intro'))return;
  observer.disconnect();page.classList.add('uc-page');document.body.classList.add('unified-create-screen');document.body.classList.remove('cap-monochrome');
  const m=read(),t=m?.tests?.find(t=>t.id===m.active)||m?.tests?.[0];if(!t){observe();return;}
  const scopePage=t.subject==='English'?'CAP-T05-Reading.dc.html':t.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
  if(scopePage!==location.pathname.split('/').pop()){
   t.state||={chosen:[],written:{},edits:{}};t.state.written={...t.state.written,...Object.fromEntries((t.questions||[]).map(q=>[q.id,q]))};t.page=scopePage;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(m));location.replace(scopePage);return;
  }
  const hero=page.querySelector('.tf-hero');hero.querySelector('h1').textContent='Create your assessment';hero.querySelector('p')?.remove();const intro=make('<div class="uc-setup-intro"><span class="uc-eyebrow">Create assessment</span><h1>Set up your assessment</h1></div>');hero.querySelector('h1').replaceWith(intro);
  page.querySelector('.tf-back')?.remove();
  page.querySelector('.tf-steps a').href=t.page;
  hero.append(page.querySelector('.tf-steps'));page.querySelector('.tf-top')?.remove();
  const icon=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const layers=icon('<path d="m12 3 10 5-10 5L2 8Zm-10 10 10 5 10-5M2 18l10 5 10-5"/>');
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
  let settings=useClientSample?{...t,title:'New classroom assessment',standard:'5.NF.A.2'}:t;
  let ready=sessionStorage.getItem(readyKey)===signature(settings);
  const setup=create({
   host:page.closest('.theme-assessments'),
   initial:settings,
   onClose:()=>{
    if(!ready){location.href='CAP-T03-Assessments.dc.html';return}
    hero.querySelector('[data-uc-details]').focus();
   },
   onSubmit(next){
   const model=window.capUpdateAssessmentScope(next);
   settings=model.tests.find(test=>test.id===model.active)||model.tests[0];
   sessionStorage.setItem(readyKey,signature(next));
   ready=true;syncGate();
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
  const notice=make('<p class="uc-gate-notice" role="status">Complete assessment details to add items.</p>');methods.before(notice);
  function syncGate(){
   methods.inert=!ready;page.querySelector('.buildergrid').inert=!ready;
   methods.setAttribute('aria-disabled',String(!ready));page.querySelector('.buildergrid').setAttribute('aria-disabled',String(!ready));
   methods.querySelectorAll('button').forEach(button=>button.disabled=!ready);
   notice.hidden=ready;page.classList.toggle('uc-locked',!ready);
   hero.querySelector('h1').textContent=ready?'Add your items':'Create your assessment';
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
   button.replaceChildren(document.createTextNode(manual?'Create manually':'Use item bank'));
  });
  /* Reuse the runtime's existing multiple-choice form and validation. The old
     conditional drawer is detached by the legacy page composition. */
  const inst=window.cogniaPreview;
  /* Create manually: the item form sits in the left panel (no modal). It reuses the runtime's
     multiple-choice validation through openWrite/saveWrite. */
  const manualPanel=page.querySelector('.qc-manual');
  if(manualPanel&&!manualPanel.querySelector('.uc-manual-form')){
   const letters=['A','B','C','D'];
   const form=make('<form class="uc-manual-form form" novalidate><div class="field"><label class="label" for="uc-manual-stem">Item</label><textarea class="textarea" id="uc-manual-stem" name="stem" rows="3" placeholder="Write the item"></textarea></div><fieldset class="field uc-manual-options"><legend class="label">Answer options</legend><p class="field-hint">Add at least two options and select the correct answer.</p>'+letters.map((l,i)=>'<div class="uc-manual-option"><input class="radio" type="radio" name="correct" value="'+i+'" id="uc-manual-correct-'+i+'" aria-label="Option '+l+' is correct"><label class="label" for="uc-manual-option-'+i+'">'+l+'</label><input class="input" id="uc-manual-option-'+i+'" name="option'+i+'" aria-label="Option '+l+'"></div>').join('')+'</fieldset><div class="uc-manual-meta"><div class="field"><label class="label" for="uc-manual-difficulty">Difficulty</label><span class="select-wrap"><select class="select" id="uc-manual-difficulty" name="difficulty" required><option value="">Select difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></span></div><div class="field"><label class="label" for="uc-manual-marks">Points</label><span class="select-wrap"><select class="select" id="uc-manual-marks" name="marks"><option value="1">1 point</option><option value="2">2 points</option></select></span></div></div><p class="field-error" role="alert"></p><div class="uc-manual-actions"><button type="reset" class="btn btn-ghost btn-lg">Clear</button><button type="submit" class="btn btn-outline btn-lg">Add to assessment</button></div></form>');
   manualPanel.replaceChildren(form);
   const alert=form.querySelector('[role=alert]');
   form.addEventListener('reset',()=>{alert.textContent=''});
   form.onsubmit=e=>{
    e.preventDefault();alert.textContent='';
    if(!form.elements.stem.value.trim()){alert.textContent='Write the item first.';form.elements.stem.focus();return}
    if(!form.elements.difficulty.value){alert.textContent='Select a difficulty.';form.elements.difficulty.focus();return}
    inst.renderVals().openWrite();
    inst.setState({form:{stem:form.elements.stem.value,opts:[0,1,2,3].map(i=>form.elements['option'+i].value),correct:form.elements.correct.value===''?null:Number(form.elements.correct.value),marks:form.elements.marks.value},fError:''});
    inst.renderVals().saveWrite();
    if(inst.state.writeOpen){alert.textContent=inst.state.fError;inst.renderVals().closeWrite();return}
    const id=inst.state.chosen.at(-1),item=inst.state.written[id];
    if(item)inst.setState({written:{...inst.state.written,[id]:{...item,difficulty:form.elements.difficulty.value,standard:settings.standard}}});
    form.reset();form.elements.stem.focus();
   };
  }
  page.querySelector('.ef-decision-note')?.remove();
  const library=page.querySelector('.library');
  const toolbar=make('<div class="uc-bank-toolbar"></div>'),search=library.querySelector('#search'),type=library.querySelector('#typeFilter');
  const searchBox=make('<div class="search uc-search-control" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></div>');const oldSearch=search.closest('.field');const searchClear=search.parentElement.querySelector('.search-clear');search.placeholder='Search items';search.setAttribute('aria-label','Search items');search.classList.add('search-input');searchBox.append(search);if(searchClear)searchBox.append(searchClear);toolbar.append(searchBox);oldSearch?.remove();library.querySelectorAll('.search').forEach(el=>{if(!el.querySelector('input'))el.remove()});
  let difficulty=library.querySelector('#bankDifficulty');if(!difficulty){difficulty=make('<select id="bankDifficulty" aria-label="Difficulty"><option value="">Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select>')}
  difficulty.setAttribute('aria-label','Difficulty');toolbar.append(difficulty);type.setAttribute('aria-label','All types');toolbar.append(type);
  toolbar.querySelectorAll('select').forEach(select=>{
   const control=make('<div class="uc-bank-select-control select-wrap"></div>');
   select.classList.add('select');
   select.before(control);
   control.append(select);
  });
  library.querySelector('.approved-bank-heading')?.after(toolbar);if(!toolbar.isConnected)library.prepend(toolbar);
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').textContent='Find and add items';
  library.before(bankHeading);
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
  /* Figma: item count on the left, search and filter as icon buttons on the right. Search opens a full-width field below. */
  const count=make('<p class="uc-bank-count text-body-small text-muted-foreground" role="status"></p>');
  const searchToggle=make('<button type="button" class="btn btn-ghost btn-icon btn-sm uc-search-toggle" aria-label="Search items" title="Search items" aria-expanded="false" aria-controls="search">'+icon('<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>')+'</button>');
  const setSearch=open=>{toolbar.toggleAttribute('data-search-open',open);searchToggle.setAttribute('aria-expanded',String(open));if(open)search.focus()};
  searchToggle.onmousedown=e=>e.preventDefault();
  searchToggle.onclick=()=>setSearch(!toolbar.hasAttribute('data-search-open'));
  search.addEventListener('keydown',e=>{if(e.key==='Escape'&&!search.value){setSearch(false);searchToggle.focus()}});
  search.addEventListener('blur',()=>{if(!search.value)setSearch(false)});
  const searchSlot=make('<div class="uc-search-slot"><div class="uc-search-clip"></div></div>');
  searchBox.before(searchSlot);searchSlot.firstElementChild.append(searchBox);
  toolbar.prepend(count);searchSlot.before(searchToggle);
  /* Only real filter controls in the popover: no empty select wraps (stray chevrons) or info badges. */
  filterFields.querySelectorAll('.select-wrap').forEach(wrap=>{if(!wrap.querySelector('select'))wrap.remove()});
  filterFields.querySelectorAll(':scope > .badge').forEach(badge=>badge.remove());
  toolbar.append(extraFilters);
  const back=make('<button class="btn uc-items-back btn-ghost btn-icon btn-sm" type="button" aria-label="Back to assessment details" title="Back to assessment details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>');
  page.querySelector('.tf-bottom .tf-original-actions')?.before(make('<p class="uc-review-status sr-only" role="status" hidden></p>'));
  inst.refreshQuestionBoard?.();
  intro.prepend(back);
  const actionBar=page.querySelector('.tf-bottom');
  if(actionBar){
   const barSize=new ResizeObserver(()=>page.style.setProperty('--uc-action-bar-height',actionBar.offsetHeight+'px'));
   barSize.observe(actionBar);
  }
  back.onclick=()=>hero.querySelector('[data-uc-details]').click();
  page.querySelectorAll('.tf-bottom a').forEach(a=>{if(a.getAttribute('href')==='CAP-T04-Setup.dc.html'){a.href='CAP-T03-Assessments.dc.html';a.textContent='Back to assessments'}});
  page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/CAP-T0[67]-/.test(a.getAttribute('href')||'')){if(!syncGate()){e.preventDefault();e.stopImmediatePropagation();openSetup()}}},true);
  observe();
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});let queued=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();observe()});else{mount();observe()}
})();
